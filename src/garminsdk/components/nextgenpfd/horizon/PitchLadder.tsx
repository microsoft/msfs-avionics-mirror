import {
  BitFlags, CssTransformBuilder, CssTransformSubject, FSComponent, HorizonLayer, HorizonLayerProps, HorizonProjection,
  HorizonProjectionChangeType, ObjectSubject, ReadonlyFloat64Array, Subscribable, SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

/**
 * Styling options for the pitch ladder.
 */
export type PitchLadderStyles = {
  /** The increment, in degrees, between major pitch lines. */
  majorLineIncrement: number;

  /** The number of medium pitch lines for each major pitch line. */
  mediumLineFactor: number;

  /** The number of minor pitch lines for each medium pitch line. */
  minorLineFactor: number;

  /** The maximum pitch at which to draw minor pitch lines. */
  minorLineMaxPitch: number;

  /** The maximum pitch at which to draw medium pitch lines. */
  mediumLineMaxPitch: number;

  /** The length of minor pitch lines. */
  minorLineLength: number;

  /** The length of medium pitch lines. */
  mediumLineLength: number;

  /** The length of major pitch lines. */
  majorLineLength: number;

  /** Whether to show number labels for minor pitch lines. */
  minorLineShowNumber: boolean;

  /** Whether to show number labels for medium pitch lines. */
  mediumLineShowNumber: boolean;

  /** Whether to show number labels for major pitch lines. */
  majorLineShowNumber: boolean;

  /** The horizontal margin of each number label from its pitch line, in pixels. */
  numberMargin: number;

  /** The vertical offset of each number label, in pixels. */
  numberOffsetY: number;

  /** The minimum positive pitch value at which to display warning chevrons. */
  chevronThresholdPositive: number;

  /** The maximum negative pitch value at which to display warning chevrons. */
  chevronThresholdNegative: number;
};

/**
 * Options for {@link PitchLadder}.
 */
export type PitchLadderOptions = {
  /** Styling options to apply when synthetic vision is disabled. */
  svtDisabledStyles: PitchLadderStyles;

  /** Styling options to apply when synthetic vision is enabled. */
  svtEnabledStyles: PitchLadderStyles;
};

/**
 * Component props for PitchLadder.
 */
export interface PitchLadderProps extends HorizonLayerProps {
  /** Whether to show the pitch ladder. */
  show: Subscribable<boolean>;

  /** Whether synthetic vision is enabled. */
  isSVTEnabled: Subscribable<boolean>;

  /**
   * The clipping bounds of the pitch ladder, as `[left, top, right, bottom]` in pixels relative to the center of the
   * projection.
   */
  clipBounds: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** Options for the pitch ladder. */
  options: PitchLadderOptions;
}

/**
 * A PFD pitch ladder. Displays major, medium, and minor pitch lines, each with optional pitch angle labels. Also
 * displays unusual attitude chevrons between major pitch lines above threshold positive and negative pitch angles.
 * Does not display a zero-pitch line.
 */
export class PitchLadder extends HorizonLayer<PitchLadderProps> {
  private readonly svgRef = FSComponent.createRef<SVGElement>();

  private readonly rootStyle = ObjectSubject.create({
    'display': '',
    'position': 'absolute',
    'left': '0px',
    'top': '0px',
    'width': '0px',
    'height': '0px',
    'overflow': 'hidden'
  });

  private readonly transform = CssTransformSubject.create(CssTransformBuilder.concat(
    CssTransformBuilder.translate3d('px'),
    CssTransformBuilder.rotate('deg'),
    CssTransformBuilder.translateY('px'),
  ));

  private readonly clipBounds = SubscribableUtils.toSubscribable(this.props.clipBounds, true);

  private pitchResolution = 0; // pixels per degree

  private needUpdateClip = false;
  private needRebuildLadder = false;
  private needReposition = false;

  private showSub?: Subscription;
  private clipBoundsSub?: Subscription;

  /** @inheritdoc */
  protected onVisibilityChanged(isVisible: boolean): void {
    this.rootStyle.set('display', isVisible ? '' : 'none');
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.showSub = this.props.show.sub(this.setVisible.bind(this), true);
    this.clipBoundsSub = this.clipBounds.sub(() => {
      this.needUpdateClip = true;
    });

    this.needUpdateClip = true;
    this.needRebuildLadder = true;
    this.needReposition = true;
  }

  /** @inheritdoc */
  public onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
    if (BitFlags.isAny(changeFlags, HorizonProjectionChangeType.Fov | HorizonProjectionChangeType.ScaleFactor)) {
      this.needRebuildLadder = true;
    } else if (BitFlags.isAny(changeFlags, HorizonProjectionChangeType.OffsetCenterProjected)) {
      this.needUpdateClip = true;
    }

    this.needReposition = true;
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.isVisible()) {
      return;
    }

    if (this.needUpdateClip) {
      this.updateClip();
      this.needUpdateClip = false;
    }

    if (this.needRebuildLadder) {
      this.rebuildLadder();
      this.needRebuildLadder = false;
    }

    if (this.needReposition) {
      this.repositionLadder();
      this.needReposition = false;
    }
  }

  /**
   * Updates this ladder's clipping boundaries.
   */
  private updateClip(): void {
    const center = this.props.projection.getOffsetCenterProjected();
    const bounds = this.clipBounds.get();

    this.rootStyle.set('left', `${center[0] + bounds[0]}px`);
    this.rootStyle.set('top', `${center[1] + bounds[1]}px`);
    this.rootStyle.set('width', `${bounds[2] - bounds[0]}px`);
    this.rootStyle.set('height', `${bounds[3] - bounds[1]}px`);

    // After we update the clip bounds we need to update the positioning of the ladder, because the ladder is
    // positioned relative to the clip bounds.
    this.needReposition = true;
  }

  /**
   * Repositions this ladder based on the current pitch and bank.
   */
  private repositionLadder(): void {
    // Approximate translation due to pitch using a constant pitch resolution (pixels per degree of pitch) derived
    // from the projection's current field of view. This approximation always keeps the pitch ladder reading at the
    // center of the projection (i.e. at the symbolic aircraft reference) accurate. However, the error increases as
    // distance from the center of the projection increases because the true pitch resolution is not constant
    // throughout screen space. To get a truly accurate pitch ladder, we would need to project and position each pitch
    // line individually. Doing this via SVG is too performance-intensive (we would be redrawing the SVG every frame
    // that the pitch ladder is moving) and doing it via canvas looks horrible due to it not being able to draw text
    // with sub-pixel resolution.

    const bounds = this.clipBounds.get();

    const pitchOffset = this.props.projection.getPitch() * this.pitchResolution;

    this.transform.transform.getChild(0).set(-bounds[0], -bounds[1], 0, 0.1, 0.1);
    this.transform.transform.getChild(1).set(-this.props.projection.getRoll());
    this.transform.transform.getChild(2).set(pitchOffset, 0.1);
    this.transform.resolve();
  }

  /**
   * Rebuilds this ladder.
   */
  private rebuildLadder(): void {
    this.pitchResolution = this.props.projection.getScaleFactor() / this.props.projection.getFov();
    const styles = this.props.isSVTEnabled.get() ? this.props.options.svtEnabledStyles : this.props.options.svtDisabledStyles;

    this.svgRef.instance.innerHTML = '';

    const majorLineSeparation = styles.majorLineIncrement * this.pitchResolution;
    const minorFactor = styles.minorLineFactor * styles.mediumLineFactor;
    const minorIncrement = styles.majorLineIncrement / minorFactor;
    const len = Math.floor(90 / minorIncrement);
    for (let i = 1; i <= len; i++) {
      const pitch = i * minorIncrement;
      const y = pitch * this.pitchResolution;

      let lineLength: number | undefined;
      let showNumber = false;

      if (i % minorFactor === 0) {
        // major line
        lineLength = styles.majorLineLength;
        showNumber = styles.majorLineShowNumber;
      } else if (i % styles.minorLineFactor === 0 && pitch <= styles.mediumLineMaxPitch) {
        // medium line
        lineLength = styles.mediumLineLength;
        showNumber = styles.mediumLineShowNumber;
      } else if (pitch <= styles.minorLineMaxPitch) {
        // minor line
        lineLength = styles.minorLineLength;
        showNumber = styles.minorLineShowNumber;
      }

      if (lineLength !== undefined) {
        if (lineLength > 0) {
          FSComponent.render(<line x1={-lineLength / 2} y1={-y} x2={lineLength / 2} y2={-y} class='pitch-ladder-line'>.</line>, this.svgRef.instance);
          FSComponent.render(<line x1={-lineLength / 2} y1={y} x2={lineLength / 2} y2={y} class='pitch-ladder-line'>.</line>, this.svgRef.instance);

          if (i % minorFactor === 0) {
            // major line

            const lastMajorPitch = pitch - styles.majorLineIncrement;
            const widthFactor = 0.5 + (pitch / 90) * 0.5;
            const height = 0.9 * majorLineSeparation;
            const width = lineLength * widthFactor;
            const legWidth = width * 0.3;

            // positive pitch chevron
            if (lastMajorPitch >= styles.chevronThresholdPositive) {
              FSComponent.render(this.renderChevron(-y + majorLineSeparation / 2, height, width, legWidth, 1), this.svgRef.instance);
            }

            // negative pitch chevron
            if (lastMajorPitch >= styles.chevronThresholdNegative) {
              FSComponent.render(this.renderChevron(y - majorLineSeparation / 2, height, width, legWidth, -1), this.svgRef.instance);
            }
          }
        }

        if (showNumber) {
          const pitchText = pitch.toString();
          const leftAnchorX = -lineLength / 2 - styles.numberMargin;
          const rightAnchorX = lineLength / 2 + styles.numberMargin;
          const textY = y + styles.numberOffsetY;

          FSComponent.render(<text x={leftAnchorX} y={-textY} text-anchor='middle' dominant-baseline='central' class='pitch-ladder-text'>{pitchText}</text>, this.svgRef.instance);
          FSComponent.render(<text x={rightAnchorX} y={-textY} text-anchor='middle' dominant-baseline='central' class='pitch-ladder-text'>{pitchText}</text>, this.svgRef.instance);

          FSComponent.render(<text x={leftAnchorX} y={textY} text-anchor='middle' dominant-baseline='central' class='pitch-ladder-text'>{pitchText}</text>, this.svgRef.instance);
          FSComponent.render(<text x={rightAnchorX} y={textY} text-anchor='middle' dominant-baseline='central' class='pitch-ladder-text'>{pitchText}</text>, this.svgRef.instance);
        }
      }
    }
  }

  /**
   * Renders a warning chevron.
   * @param centerY The y coordinate of the center of the chevron, in pixels.
   * @param height The height of the chevron, in pixels.
   * @param width The width of the chevron, in pixels.
   * @param legWidth The width of each leg of the chevron, in pixels.
   * @param direction The direction in which the chevron is pointed: `1` for the positive y direction, `-1` for the
   * negative y direction.
   * @returns A warning chevron, as a VNode.
   */
  private renderChevron(centerY: number, height: number, width: number, legWidth: number, direction: 1 | -1): VNode {
    const top = centerY - height / 2 * direction;
    const bottom = centerY + height / 2 * direction;
    const halfWidth = width / 2;
    const halfLegWidth = legWidth / 2;
    const legJoinHeight = legWidth * height / (width - legWidth);

    return (
      <path
        d={`M ${-halfLegWidth} ${bottom} L ${-width / 2} ${top} L ${-halfWidth + legWidth} ${top} L ${0} ${bottom - legJoinHeight * direction} L ${halfWidth - legWidth} ${top} L ${halfWidth} ${top} L ${halfLegWidth} ${bottom} Z`}
        class='pitch-ladder-chevron'
      >.</path>
    );
  }

  /** @inheritdoc */
  public onDetached(): void {
    super.onDetached();

    this.destroy();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='pitch-ladder-container' style={this.rootStyle}>
        <svg ref={this.svgRef}
          class='pitch-ladder'
          style={{
            'position': 'absolute',
            'left': '0px',
            'top': '0px',
            'transform': this.transform,
            'transform-origin': '0px 0px',
            'stroke-linecap': 'round',
            'overflow': 'visible'
          }}
        >
        </svg>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.showSub?.destroy();
    this.clipBoundsSub?.destroy();

    super.destroy();
  }
}
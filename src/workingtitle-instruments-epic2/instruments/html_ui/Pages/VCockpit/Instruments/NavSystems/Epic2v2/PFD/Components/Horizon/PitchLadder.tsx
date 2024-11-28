import {
  BitFlags, CssTransformBuilder, CssTransformSubject, FSComponent, HorizonLayer, HorizonLayerProps, HorizonProjection, HorizonProjectionChangeType,
  ObjectSubject, ReadonlyFloat64Array, Subscribable, SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

import './PitchLadder.css';

/**
 * Styling options for the pitch ladder.
 */
export type PitchLadderStyles = {
  /** The increment, in degrees, between major pitch lines. */
  majorLineIncrement: number;

  /** The pitch, in degrees, for the singlular descent reference pitch line. */
  descentReferenceLinePitch: number;

  /** The increment, in degrees, between minor pitch lines. */
  minorLineIncrement: number;

  /** The maximum pitch at which to draw minor pitch lines. */
  minorLineMaxPitch: number;

  /** The length of minor pitch lines. */
  minorLineLength: number;

  /** The length of descent reference pitch line. */
  descentReferenceLineLength: number;

  /** The length of major pitch lines. */
  majorLineLength: number;

  /** The space between the two halves of the major pitch lines. */
  majorLineSpacing: number;

  /** The length of the vertical dropper on the major pitch lines. */
  majorLineVerticalLength: number;

  /** Whether to show number labels for major pitch lines. */
  majorLineShowNumber: boolean;

  /** The horizontal margin of each number label from its pitch line, in pixels. */
  numberMargin: number;

  /** The vertical offset of each number label, in pixels. */
  numberOffsetY: number;

  /** The pitch ranges for each downward pointing chevron, [fromPitch, toPitch] in degrees. */
  chevronBoundaries: ReadonlyFloat64Array[],
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
  isSvsEnabled: Subscribable<boolean>;

  /**
   * The clipping bounds of the pitch ladder, as `[left, top, right, bottom]` in pixels relative to the center of the
   * projection.
   */
  clipBounds: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** Options for the pitch ladder. */
  options: PitchLadderOptions;
}

/**
 * A PFD attitude indicator. Displays a roll scale arc with pointer indicating the current roll angle, a pitch ladder
 * indicating the current pitch angle, and a slip/skid indicator.
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
    const styles = this.props.isSvsEnabled.get() ? this.props.options.svtEnabledStyles : this.props.options.svtDisabledStyles;

    this.svgRef.instance.innerHTML = '';

    // horizon pointer chevrons
    for (const chevron of styles.chevronBoundaries) {
      FSComponent.render(this.renderChevron(chevron, styles.majorLineLength, this.pitchResolution), this.svgRef.instance);
    }

    // -3 degree ref line
    if (styles.descentReferenceLineLength) {
      const y = styles.descentReferenceLinePitch * this.pitchResolution;
      FSComponent.render(<line x1={-styles.descentReferenceLineLength / 2} y1={-y} x2={styles.descentReferenceLineLength / 2} y2={-y} class='pitch-ladder-line shadow'>.</line>, this.svgRef.instance);
      FSComponent.render(<line x1={-styles.descentReferenceLineLength / 2} y1={-y} x2={styles.descentReferenceLineLength / 2} y2={-y} class='pitch-ladder-line'>.</line>, this.svgRef.instance);
    }

    // minor reference ticks near the horizon
    if (styles.minorLineLength) {
      for (let pitch = styles.minorLineIncrement; pitch <= styles.minorLineMaxPitch; pitch += styles.minorLineIncrement) {
        const y = pitch * this.pitchResolution;
        const lineLength = styles.minorLineLength;

        FSComponent.render(<line x1={-lineLength / 2} y1={-y} x2={lineLength / 2} y2={-y} class='pitch-ladder-line shadow'>.</line>, this.svgRef.instance);
        FSComponent.render(<line x1={-lineLength / 2} y1={-y} x2={lineLength / 2} y2={-y} class='pitch-ladder-line'>.</line>, this.svgRef.instance);
        if (-pitch !== styles.descentReferenceLinePitch) {
          FSComponent.render(<line x1={-lineLength / 2} y1={y} x2={lineLength / 2} y2={y} class='pitch-ladder-line shadow'>.</line>, this.svgRef.instance);
          FSComponent.render(<line x1={-lineLength / 2} y1={y} x2={lineLength / 2} y2={y} class='pitch-ladder-line'>.</line>, this.svgRef.instance);
        }
      }
    }

    // major reference ticks
    if (styles.majorLineLength) {
      for (let pitch = styles.majorLineIncrement; pitch <= 90; pitch += styles.majorLineIncrement) {
        const y = pitch * this.pitchResolution;

        // positive pitch line
        FSComponent.render(<path d={`M -${styles.majorLineSpacing / 2} -${y} l -${(styles.majorLineLength - styles.majorLineSpacing) / 2} 0 l 0 ${styles.majorLineVerticalLength} m ${styles.majorLineLength} 0 l 0 -${styles.majorLineVerticalLength} l -${(styles.majorLineLength - styles.majorLineSpacing) / 2} 0`} class='pitch-ladder-line pitch-ladder-line-major shadow' />, this.svgRef.instance);
        FSComponent.render(<path d={`M -${styles.majorLineSpacing / 2} -${y} l -${(styles.majorLineLength - styles.majorLineSpacing) / 2} 0 l 0 ${styles.majorLineVerticalLength} m ${styles.majorLineLength} 0 l 0 -${styles.majorLineVerticalLength} l -${(styles.majorLineLength - styles.majorLineSpacing) / 2} 0`} class='pitch-ladder-line pitch-ladder-line-major' />, this.svgRef.instance);

        // negative pitch line
        FSComponent.render(<path d={`M -${styles.majorLineSpacing / 2} ${y} l -${(styles.majorLineLength - styles.majorLineSpacing) / 2} 0 l 0 -${styles.majorLineVerticalLength} m ${styles.majorLineLength} 0 l 0 ${styles.majorLineVerticalLength} l -${(styles.majorLineLength - styles.majorLineSpacing) / 2} 0`} class='pitch-ladder-line pitch-ladder-line-major shadow' />, this.svgRef.instance);
        FSComponent.render(<path d={`M -${styles.majorLineSpacing / 2} ${y} l -${(styles.majorLineLength - styles.majorLineSpacing) / 2} 0 l 0 -${styles.majorLineVerticalLength} m ${styles.majorLineLength} 0 l 0 ${styles.majorLineVerticalLength} l -${(styles.majorLineLength - styles.majorLineSpacing) / 2} 0`} class='pitch-ladder-line pitch-ladder-line-major' />, this.svgRef.instance);

        if (styles.majorLineShowNumber) {
          const pitchText = pitch.toString();
          const leftAnchorX = -styles.majorLineLength / 2 - styles.numberMargin;
          const textY = y + styles.numberOffsetY;

          // positive pitch line
          FSComponent.render(<text x={leftAnchorX} y={-textY} text-anchor='end' dominant-baseline='central' class='pitch-ladder-text'>{pitchText}</text>, this.svgRef.instance);

          // negative pitch line
          FSComponent.render(<text x={leftAnchorX} y={textY} text-anchor='end' dominant-baseline='central' class='pitch-ladder-text'>-{pitchText}</text>, this.svgRef.instance);
        }
      }
    }

    // TODO dot/box at zero, proper length
    FSComponent.render(<line x1={-1} y1={0} x2={1} y2={0} class='pitch-ladder-line'>.</line>, this.svgRef.instance);
  }

  /**
   * Renders a warning chevron.
   * @param pitchBoundaries The pitch boundaries [fromPitch, toPitch] in degrees.
   * @param baseWidth The width of a 5 degree tall chevron.
   * @param pitchResolution The radio of pixels to pitch degrees.
   * @returns A warning chevron, as a VNode, with 0,0 at the to point.
   */
  private renderChevron(pitchBoundaries: ReadonlyFloat64Array, baseWidth: number, pitchResolution: number): VNode {
    // 5 degree chevron is as wide as the major pitch lines
    const [fromPitch, toPitch] = pitchBoundaries;
    const direction = Math.sign(fromPitch - toPitch);
    /** total height in pixels */
    const height = Math.abs(toPitch - fromPitch) * pitchResolution;
    /** total width in pixels */
    const width = baseWidth + 5 * (height / pitchResolution - 5);
    /** width of each side of the chevron in pixels */
    const legWidth = width * .1;

    const topCentreY = legWidth / (0.5 * width / height);

    const yOffset = -toPitch * pitchResolution;

    return (
      <path
        d={`M 0 ${yOffset} l ${-width / 2} ${-direction * height} l ${legWidth} 0 l ${width / 2 - legWidth} ${direction * (height - topCentreY)} l ${width / 2 - legWidth} ${-direction * (height - topCentreY)} l ${legWidth} 0 z`}
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
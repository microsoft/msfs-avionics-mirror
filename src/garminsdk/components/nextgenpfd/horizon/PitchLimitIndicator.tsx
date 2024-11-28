import {
  BitFlags, CssTransformBuilder, CssTransformSubject, FSComponent, HorizonLayer, HorizonLayerProps, HorizonProjection,
  HorizonProjectionChangeType, ObjectSubject, ReadonlyFloat64Array, Subject, Subscribable, SubscribableUtils,
  Subscription, VNode
} from '@microsoft/msfs-sdk';

/**
 * Pitch limit indicator formats.
 */
export enum PitchLimitIndicatorFormat {
  SingleCue = 'SingleCue',
  DualCue = 'DualCue'
}

/**
 * Component props for {@link PitchLimitIndicator}.
 */
export interface PitchLimitIndicatorProps extends HorizonLayerProps {
  /** Whether to show the indicator. */
  show: Subscribable<boolean>;

  /** The indicator format to display. */
  format: PitchLimitIndicatorFormat | Subscribable<PitchLimitIndicatorFormat>;

  /**
   * The pitch angle, in degrees, at which to position the indicator. A non-finite value or `NaN` will cause the
   * indicator to not be displayed.
   */
  pitchLimit: Subscribable<number>;

  /**
   * The clipping bounds of the indicator, as `[left, top, right, bottom]` in pixels relative to the center of the
   * projection.
   */
  clipBounds: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;
}

/**
 * A PFD pitch limit indicator.
 */
export class PitchLimitIndicator extends HorizonLayer<PitchLimitIndicatorProps> {
  private static readonly REPOSITION_FLAGS
    = HorizonProjectionChangeType.Fov
    | HorizonProjectionChangeType.ScaleFactor
    | HorizonProjectionChangeType.PitchScaleFactor
    | HorizonProjectionChangeType.Pitch;

  private readonly clipBounds = SubscribableUtils.toSubscribable(this.props.clipBounds, true);

  private readonly rootStyle = ObjectSubject.create({
    'display': '',
    'position': 'absolute',
    'left': '0px',
    'top': '0px',
    'width': '0px',
    'height': '0px',
    'overflow': 'hidden'
  });

  private readonly clipCenterX = Subject.create('');
  private readonly clipCenterY = Subject.create('');

  private readonly transform = CssTransformSubject.create(CssTransformBuilder.translate3d('px'));

  private readonly format = SubscribableUtils.toSubscribable(this.props.format, true) as Subscribable<PitchLimitIndicatorFormat>;
  private readonly singleCueDisplay = this.format.map(format => format === PitchLimitIndicatorFormat.SingleCue ? '' : 'none');
  private readonly dualCueDisplay = this.format.map(format => format === PitchLimitIndicatorFormat.DualCue ? '' : 'none');

  private needUpdateClipBounds = false;
  private needReposition = false;

  private showSub?: Subscription;
  private clipBoundsSub?: Subscription;
  private formatSub?: Subscription;
  private pitchLimitSub?: Subscription;

  /** @inheritDoc */
  public onAttached(): void {
    super.onAttached();

    this.clipBoundsSub = this.clipBounds.sub(() => { this.needUpdateClipBounds = true; });

    this.showSub = this.props.show.sub(this.setVisible.bind(this), true);
    this.pitchLimitSub = this.props.pitchLimit.sub(() => { this.needReposition = true; }, false);

    this.needUpdateClipBounds = true;
    this.needReposition = true;
  }

  /** @inheritDoc */
  public onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
    this.needUpdateClipBounds ||= BitFlags.isAny(changeFlags, HorizonProjectionChangeType.OffsetCenterProjected);
    this.needReposition ||= BitFlags.isAny(changeFlags, PitchLimitIndicator.REPOSITION_FLAGS);
  }

  /** @inheritDoc */
  public onUpdated(): void {
    if (!this.isVisible()) {
      this.rootStyle.set('display', 'none');
      return;
    }

    if (this.needUpdateClipBounds) {
      this.updateClipBounds();
      this.needUpdateClipBounds = false;
    }

    if (this.needReposition) {
      this.reposition();
      this.needReposition = false;
    }
  }

  /**
   * Updates this layer's clipping bounds.
   */
  private updateClipBounds(): void {
    const center = this.props.projection.getOffsetCenterProjected();
    const bounds = this.clipBounds.get();

    const width = Math.max(bounds[2] - bounds[0], 0);
    const height = Math.max(bounds[3] - bounds[1], 0);

    this.rootStyle.set('left', `${center[0] + bounds[0]}px`);
    this.rootStyle.set('top', `${center[1] + bounds[1]}px`);
    this.rootStyle.set('width', `${width}px`);
    this.rootStyle.set('height', `${height}px`);

    this.clipCenterX.set(`${-bounds[0]}px`);
    this.clipCenterY.set(`${-bounds[1]}px`);
  }

  /**
   * Repositions this indicator.
   */
  private reposition(): void {
    const pitchLimit = this.props.pitchLimit.get();

    if (!isFinite(pitchLimit)) {
      this.rootStyle.set('display', 'none');
      return;
    }

    this.rootStyle.set('display', '');

    const pitchResolution = this.props.projection.getScaleFactor() * this.props.projection.getPitchScaleFactor() / this.props.projection.getFov();
    const pitchLimitOffset = (this.props.projection.getPitch() - pitchLimit) * pitchResolution;

    this.transform.transform.set(0, pitchLimitOffset, 0, undefined, 0.1);
    this.transform.resolve();
  }

  /** @inheritDoc */
  public onDetached(): void {
    super.onDetached();

    this.destroy();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='pitch-limit-container' style={this.rootStyle}>
        <div
          class='pitch-limit'
          style={{
            'position': 'absolute',
            'left': this.clipCenterX,
            'top': this.clipCenterY,
            'transform': this.transform,
            'transform-origin': '0px 0px'
          }}
        >
          {this.renderSingleCueIcon()}
          {this.renderDualCueIcon()}
        </div>
      </div>
    );
  }

  /**
   * Renders the single-cue pitch limit indicator icon.
   * @returns The single-cue pitch limit indicator icon, as a VNode.
   */
  private renderSingleCueIcon(): VNode {
    return (
      <svg
        viewBox='-38 -13 76 26'
        class='pitch-limit-icon pitch-limit-icon-single-cue'
        style={{
          'display': this.singleCueDisplay,
          'position': 'absolute',
          'left': '0px',
          'top': '0px',
          'transform': 'translate(-50%, -50%)',
          'overflow': 'visible'
        }}
      >
        <path
          d='M -38 8.82 L 0 -1 L 38 8.82 M -38 8.82 v -12 M -28.5 6.36 v -12 M -19 3.91 v -12 M -9.5 1.46 v -12 M 0 -1 v -12 M 9.5 1.46 v -12 M 19 3.91 v -12 M 28.5 6.36 v -12 M 38 8.82 v -12'
          class='pitch-limit-icon-stroke'
        />
      </svg>
    );
  }

  /**
   * Renders the dual-cue pitch limit indicator icon.
   * @returns The dual-cue pitch limit indicator icon, as a VNode.
   */
  private renderDualCueIcon(): VNode {
    return (
      <svg
        viewBox='-104 -18 208 36'
        class='pitch-limit-icon pitch-limit-icon-dual-cue'
        style={{
          'display': this.dualCueDisplay,
          'position': 'absolute',
          'left': '0px',
          'top': '0px',
          'transform': 'translate(-50%, -50%)',
          'overflow': 'visible'
        }}
      >
        <path
          d='M -104 -18 l 6 11 h 27 v 10 M -95 -18 l 6 11 M -86 -18 l 6 11 M -77 -18 l 6 11'
          class='pitch-limit-icon-stroke'
        />
        <path
          d='M 104 -18 l -6 11 h -27 v 10 M 95 -18 l -6 11 M 86 -18 l -6 11 M 77 -18 l -6 11'
          class='pitch-limit-icon-stroke'
        />
      </svg>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.singleCueDisplay.destroy();
    this.dualCueDisplay.destroy();

    this.showSub?.destroy();
    this.clipBoundsSub?.destroy();
    this.formatSub?.destroy();
    this.pitchLimitSub?.destroy();

    super.destroy();
  }
}

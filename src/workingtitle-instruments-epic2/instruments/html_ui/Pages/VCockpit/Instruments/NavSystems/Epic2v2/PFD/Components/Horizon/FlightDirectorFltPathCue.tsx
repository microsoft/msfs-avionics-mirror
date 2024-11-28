import {
  CssTransformBuilder, ExpSmoother, FSComponent, HorizonLayer, HorizonLayerProps, ObjectSubject, ReadonlyFloat64Array, Subscribable, SubscribableUtils,
  Subscription, Vec2Math, VNode
} from '@microsoft/msfs-sdk';

import './FlightDirectorFltPathCue.css';

/**
 * Component props for FlightDirectorFltPathCue.
 */
export interface FlightDirectorFltPathCueProps extends HorizonLayerProps {
  /** Whether to show the cue. */
  show: Subscribable<boolean>;

  /** The pitch commanded by the flight director, in degrees. Positive values indicate upward pitch. */
  fdPitch: Subscribable<number>;

  /** The bank commanded by the flight director, in degrees. Positive values indicate rightward bank. */
  fdBank: Subscribable<number>;

  /**
   * The displayed position of the flight path vector, as `[x, y]` in pixels using the horizon projection's projected
   * coordinate system.
   */
  fpvPosition: Subscribable<ReadonlyFloat64Array>;

  /** The amount to vertically offset the cue from the flight path vector, in pixels, per degree of pitch error. */
  pitchErrorFactor: number | Subscribable<number>;

  /** The amount to rotate the cue, in degrees, per degree of bank error. */
  bankErrorFactor: number | Subscribable<number>;

  /**
   * The clipping boundaries of the cue, as `[left, top, right, bottom]` in pixels using the horizon projection's
   * projected coordinate system.
   */
  bounds: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;
}

/**
 * A PFD Flt-Pth flight director guidance cue.
 */
export class FlightDirectorFltPathCue extends HorizonLayer<FlightDirectorFltPathCueProps> {
  private readonly rootStyle = ObjectSubject.create({
    'position': 'absolute',
    'left': '0px',
    'top': '0px',
    'width': '0px',
    'height': '0px',
    'display': '',
    'overflow': 'hidden',
  });

  private readonly cueStyle = ObjectSubject.create({
    'position': 'absolute',
    'left': '0px',
    'top': '0px',
    'display': '',
    'transform': 'translate(-50%, -50%) translate3d(0px, 0px, 0px)',
  });

  private readonly cueTransform = CssTransformBuilder.concat(
    CssTransformBuilder.translate('%'),
    CssTransformBuilder.translate3d('px'),
    CssTransformBuilder.rotate3d('deg'),
  );

  private readonly pitchErrorFactor = SubscribableUtils.toSubscribable(this.props.pitchErrorFactor, true);
  private readonly bankErrorFactor = SubscribableUtils.toSubscribable(this.props.bankErrorFactor, true);

  private readonly pitchErrorSmoother = new ExpSmoother(500 / Math.LN2);
  private readonly bankErrorSmoother = new ExpSmoother(500 / Math.LN2);

  private needUpdateClipBounds = false;

  private showSub?: Subscription;
  private boundsSub?: Subscription;

  /** @inheritdoc */
  protected onVisibilityChanged(isVisible: boolean): void {
    this.rootStyle.set('display', isVisible ? '' : 'none');

    if (!isVisible) {
      this.pitchErrorSmoother.reset();
      this.bankErrorSmoother.reset();
    }
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.cueTransform.getChild(0).set(-50, -50);

    this.showSub = this.props.show.sub(this.setVisible.bind(this), true);
    if (SubscribableUtils.isSubscribable(this.props.bounds)) {
      this.boundsSub = this.props.bounds.sub(() => { this.needUpdateClipBounds = true; });
    }

    this.needUpdateClipBounds = true;
  }

  /** @inheritdoc */
  public onSleep(): void {
    this.pitchErrorSmoother.reset();
    this.bankErrorSmoother.reset();
  }

  /** @inheritdoc */
  public onUpdated(time: number, elapsed: number): void {
    if (!this.isVisible()) {
      return;
    }

    const bounds = SubscribableUtils.isSubscribable(this.props.bounds) ? this.props.bounds.get() : this.props.bounds;

    if (this.needUpdateClipBounds) {
      this.updateClipBounds(bounds);
      this.needUpdateClipBounds = false;
    }

    const pitchError = this.pitchErrorSmoother.next(this.props.fdPitch.get() - this.props.projection.getPitch(), elapsed);
    const bankError = this.bankErrorSmoother.next(this.props.fdBank.get() - this.props.projection.getRoll(), elapsed);

    const fpvPosition = this.props.fpvPosition.get();

    if (!Vec2Math.isFinite(fpvPosition)) {
      this.cueStyle.set('display', 'none');
      return;
    }

    const center = this.props.projection.getOffsetCenterProjected();

    const rot = bankError * this.bankErrorFactor.get();
    const x = fpvPosition[0] - (center[0] + bounds[0]);
    const y = fpvPosition[1] - pitchError * this.pitchErrorFactor.get() - (center[1] + bounds[1]);

    this.cueTransform.getChild(1).set(x, y, 0, 0.1, 0.1);
    this.cueTransform.getChild(2).set(0, 0, 1, rot, 0.1);
    this.cueStyle.set('transform', this.cueTransform.resolve());
    this.cueStyle.set('display', '');
  }

  /**
   * Updates this cue's clipping boundaries.
   * @param bounds The current clipping boundaries.
   */
  private updateClipBounds(bounds: ReadonlyFloat64Array): void {
    const center = this.props.projection.getOffsetCenterProjected();
    this.rootStyle.set('left', `${center[0] + bounds[0]}px`);
    this.rootStyle.set('top', `${center[1] + bounds[1]}px`);
    this.rootStyle.set('width', `${bounds[2] - bounds[0]}px`);
    this.rootStyle.set('height', `${bounds[3] - bounds[1]}px`);
  }

  /** @inheritdoc */
  public onDetached(): void {
    super.onDetached();

    this.destroy();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div style={this.rootStyle}>
        <svg viewBox='-80 -8 160 16' class='flight-director-flt-pth-cue' style={this.cueStyle}>
          <line x1='-76.5' x2='-23.5' class='shadow' />
          <circle r='5.5' class='shadow' />
          <line x1='76.5' x2='23.5' class='shadow' />

          <line x1='-76' x2='-24' />
          <circle r='5' />
          <line x1='76' x2='24' />
        </svg>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.showSub?.destroy();
    this.boundsSub?.destroy();

    super.destroy();
  }
}

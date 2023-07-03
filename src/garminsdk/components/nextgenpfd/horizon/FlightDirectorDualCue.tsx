import {
  CssTransformBuilder, CssTransformSubject, FSComponent, HorizonLayer, HorizonLayerProps,
  MathUtils, ReadonlyFloat64Array, Subject, Subscribable, SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

/**
 * Component props for FlightDirectorDualCue.
 */
export interface FlightDirectorDualCueProps extends HorizonLayerProps {
  /** Whether to show the flight director. */
  show: Subscribable<boolean>;

  /** The flight director commanded pitch, in degrees. Positive values indicated upward pitch. */
  fdPitch: Subscribable<number>;

  /** The flight director commanded bank, in degrees. Positive values indicate rightward bank. */
  fdBank: Subscribable<number>;

  /**
   * The scaling factor to apply to the pitch command bar's translation. A factor of 1 causes the bar to translate
   * approximately in line with the angular resolution of the horizon projection. Larger factors will result in larger
   * translations for the same pitch error. Defaults to `1`.
   */
  pitchErrorFactor?: number | Subscribable<number>;

  /**
   * The scaling factor to apply to the bank command bar's translation. A factor of 1 causes the bar to translate
   * approximately in line with the angular resolution of the horizon projection. Larger factors will result in larger
   * translations for the same bank error. Defaults to `1`.
   */
  bankErrorFactor?: number | Subscribable<number>;

  /**
   * The translation constant to use for the bank command bar, in pixels per degree of bank error. If this value is
   * defined, it will override `bankErrorFactor`.
   */
  bankErrorConstant?: number | Subscribable<number>;

  /**
   * The bounds within which the flight director remains conformal, as `[left, top, right, bottom]` in pixels relative
   * to the center of the projection.
   */
  conformalBounds: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;
}

/**
 * A PFD dual-cue flight director.
 */
export class FlightDirectorDualCue extends HorizonLayer<FlightDirectorDualCueProps> {

  private readonly pitchErrorFactor = SubscribableUtils.toSubscribable(this.props.pitchErrorFactor ?? 1, true);
  private readonly bankErrorFactor = SubscribableUtils.toSubscribable(this.props.bankErrorFactor ?? 1, true);
  private readonly bankErrorConstant = this.props.bankErrorConstant !== undefined ? SubscribableUtils.toSubscribable(this.props.bankErrorConstant, true) : undefined;
  private readonly conformalBounds = SubscribableUtils.toSubscribable(this.props.conformalBounds, true);

  private readonly display = Subject.create('');
  private readonly pitchTransform = CssTransformSubject.create(CssTransformBuilder.concat(
    CssTransformBuilder.translate('%'),
    CssTransformBuilder.translate3d('px')
  ));
  private readonly bankTransform = CssTransformSubject.create(CssTransformBuilder.concat(
    CssTransformBuilder.translate('%'),
    CssTransformBuilder.translate3d('px')
  ));

  private needUpdate = false;

  private readonly pauseable: Subscription[] = [];

  private showSub?: Subscription;

  /** @inheritdoc */
  protected onVisibilityChanged(isVisible: boolean): void {
    if (isVisible) {
      this.display.set('');

      for (const pauseable of this.pauseable) {
        pauseable.resume();
      }

      this.needUpdate = true;
    } else {
      this.display.set('none');

      for (const pauseable of this.pauseable) {
        pauseable.pause();
      }
    }
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.pitchTransform.transform.getChild(0).set(-50, -50);
    this.bankTransform.transform.getChild(0).set(-50, -50);

    const updateHandler = (): void => { this.needUpdate = true; };

    this.pauseable.push(
      this.props.fdPitch.sub(updateHandler),
      this.props.fdBank.sub(updateHandler),
      this.pitchErrorFactor.sub(updateHandler),
      this.bankErrorConstant?.sub(updateHandler) ?? this.bankErrorFactor.sub(updateHandler),
      this.conformalBounds.sub(updateHandler)
    );

    this.showSub = this.props.show.sub(this.setVisible.bind(this), true);

    this.needUpdate = true;
  }

  /** @inheritdoc */
  public onProjectionChanged(): void {
    this.needUpdate = true;
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.needUpdate || !this.isVisible()) {
      return;
    }

    const projection = this.props.projection;

    const center = projection.getOffsetCenterProjected();
    const angularResolution = projection.getScaleFactor() / projection.getFov();

    const conformalBounds = this.conformalBounds.get();

    const pitchError = this.props.fdPitch.get() - projection.getPitch();
    const bankError = this.props.fdBank.get() - projection.getRoll();

    const bankErrorConstant = this.bankErrorConstant !== undefined ? this.bankErrorConstant.get() : this.bankErrorFactor.get() * angularResolution;

    const xOffset = MathUtils.clamp(bankError * bankErrorConstant, conformalBounds[0], conformalBounds[2]);
    const yOffset = MathUtils.clamp(-pitchError * angularResolution * this.pitchErrorFactor.get(), conformalBounds[1], conformalBounds[3]);

    this.pitchTransform.transform.getChild(1).set(center[0], center[1] + yOffset, 0, 0.1, 0.1);
    this.pitchTransform.resolve();

    this.bankTransform.transform.getChild(1).set(center[0] + xOffset, center[1], 0, 0.1, 0.1);
    this.bankTransform.resolve();

    this.needUpdate = false;
  }

  /** @inheritdoc */
  public onDetached(): void {
    super.onDetached();

    this.destroy();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div
        class='flight-director-dual-cue'
        style={{
          'display': this.display,
          'position': 'absolute',
          'left': '0px',
          'top': '0px'
        }}
      >
        <div
          class='flight-director-dual-cue-pitch flight-director-dual-cue-outline'
          style={{
            'position': 'absolute',
            'left': '0px',
            'top': '0px',
            'transform': this.pitchTransform
          }}
        />
        <div
          class='flight-director-dual-cue-bank flight-director-dual-cue-outline'
          style={{
            'position': 'absolute',
            'left': '0px',
            'top': '0px',
            'transform': this.bankTransform
          }}
        />
        <div
          class='flight-director-dual-cue-pitch flight-director-dual-cue-bar'
          style={{
            'position': 'absolute',
            'left': '0px',
            'top': '0px',
            'transform': this.pitchTransform
          }}
        />
        <div
          class='flight-director-dual-cue-bank flight-director-dual-cue-bar'
          style={{
            'position': 'absolute',
            'left': '0px',
            'top': '0px',
            'transform': this.bankTransform
          }}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    for (const pauseable of this.pauseable) {
      pauseable.destroy();
    }

    this.showSub?.destroy();

    super.destroy();
  }
}

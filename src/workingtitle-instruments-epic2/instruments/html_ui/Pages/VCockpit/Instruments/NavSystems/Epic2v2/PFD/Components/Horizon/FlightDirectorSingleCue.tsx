import {
  CssTransformBuilder, CssTransformSubject, FSComponent, HorizonLayer, HorizonLayerProps, MathUtils, ReadonlyFloat64Array, Subject, Subscribable,
  SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

import './FlightDirectorSingleCue.css';

/**
 * Component props for FlightDirectorSingleCue.
 */
export interface FlightDirectorSingleCueProps extends HorizonLayerProps {
  /** Whether to show the flight director. */
  show: Subscribable<boolean>;

  /** The flight director commanded pitch, in degrees. Positive values indicated upward pitch. */
  fdPitch: Subscribable<number>;

  /** The flight director commanded bank, in degrees. Positive values indicate rightward bank. */
  fdBank: Subscribable<number>;

  /**
   * The vertical bounds within which the flight director remains conformal, as `[top, bottom]` in pixels relative
   * to the center of the projection.
   */
  conformalBounds: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** The maximum bank error at which the flight director's bank remains conformal, in degrees. */
  conformalBankLimit: number | Subscribable<number>;
}

/**
 * A PFD single-cue flight director.
 */
export class FlightDirectorSingleCue extends HorizonLayer<FlightDirectorSingleCueProps> {

  private readonly conformalBounds = SubscribableUtils.toSubscribable(this.props.conformalBounds, true);
  private readonly conformalBankLimit = SubscribableUtils.toSubscribable(this.props.conformalBankLimit, true);

  private readonly display = Subject.create('');
  private readonly transform = CssTransformSubject.create(CssTransformBuilder.concat(
    CssTransformBuilder.translate('%'),
    CssTransformBuilder.translate3d('px'),
    CssTransformBuilder.rotate('deg')
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

    this.transform.transform.getChild(0).set(-50, -50);

    const updateHandler = (): void => { this.needUpdate = true; };

    this.pauseable.push(
      this.props.fdPitch.sub(updateHandler),
      this.props.fdBank.sub(updateHandler),
      this.conformalBounds.sub(updateHandler),
      this.conformalBankLimit.sub(updateHandler)
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
    const pitchResolution = projection.getScaleFactor() / projection.getFov();

    const conformalBounds = this.conformalBounds.get();
    const conformalBankLimit = this.conformalBankLimit.get();

    const pitchError = this.props.fdPitch.get() - projection.getPitch();
    const bankError = MathUtils.clamp(this.props.fdBank.get() - projection.getRoll(), -conformalBankLimit, conformalBankLimit);

    const yOffset = MathUtils.clamp(-pitchError * pitchResolution, conformalBounds[0], conformalBounds[1]);

    this.transform.transform.getChild(1).set(center[0], center[1] + yOffset, 0, 0.1, 0.1);
    this.transform.transform.getChild(2).set(bankError, 0.1);
    this.transform.resolve();

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
      <svg
        viewBox='-117 -14 232 38'
        class='flight-director-single-cue'
        style={{
          'display': this.display,
          'position': 'absolute',
          'left': '0px',
          'top': '0px',
          'transform': this.transform,
          'overflow': 'visible'
        }}
      >
        <path
          d='M 0 0 l -114 21 l 0 15 z'
          fill='var(--flight-director-fill)' stroke='var(--flight-director-stroke)' stroke-width='var(--flight-director-thick-stroke-width)'
        />
        <path
          d='M -114 21 l 12 12'
          fill='none' stroke='var(--flight-director-stroke)' stroke-width='var(--flight-director-thin-stroke-width)'
        />
        <path
          d='M 0 0 l 114 21 l 0 15 z'
          fill='var(--flight-director-fill)' stroke='var(--flight-director-stroke)' stroke-width='var(--flight-director-thick-stroke-width)'
        />
        <path
          d='M 114 21 l -12 12'
          fill='none' stroke='var(--flight-director-stroke)' stroke-width='var(--flight-director-thin-stroke-width)'
        />
      </svg>
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

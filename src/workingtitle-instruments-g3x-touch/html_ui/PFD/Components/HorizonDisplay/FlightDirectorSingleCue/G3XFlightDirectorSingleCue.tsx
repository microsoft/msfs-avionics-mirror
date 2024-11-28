import {
  CssTransformBuilder, CssTransformSubject, FSComponent, HorizonLayer, HorizonLayerProps,
  MathUtils, ReadonlyFloat64Array, Subject, Subscribable, SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

import './G3XFlightDirectorSingleCue.css';

/**
 * Component props for {@link G3XFlightDirectorSingleCue}.
 */
export interface G3XFlightDirectorSingleCueProps extends HorizonLayerProps {
  /** Whether to show the flight director. */
  show: Subscribable<boolean>;

  /** The flight director commanded pitch, in degrees. Positive values indicated upward pitch. */
  fdPitch: Subscribable<number>;

  /** The flight director commanded bank, in degrees. Positive values indicate rightward bank. */
  fdBank: Subscribable<number>;

  /** Whether the autopilot is engaged. */
  apEngaged: Subscribable<boolean>;

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
export class G3XFlightDirectorSingleCue extends HorizonLayer<G3XFlightDirectorSingleCueProps> {

  private readonly conformalBounds = SubscribableUtils.toSubscribable(this.props.conformalBounds, true);
  private readonly conformalBankLimit = SubscribableUtils.toSubscribable(this.props.conformalBankLimit, true);

  private readonly display = Subject.create('');
  private readonly apPassiveDisplay = Subject.create('');

  private readonly transform = CssTransformSubject.create(CssTransformBuilder.concat(
    CssTransformBuilder.translate('%'),
    CssTransformBuilder.translate3d('px'),
    CssTransformBuilder.rotate('deg')
  ));

  private needUpdate = false;

  private readonly pauseable: Subscription[] = [];

  private showSub?: Subscription;
  private apEngagedSub?: Subscription;

  /** @inheritDoc */
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

  /** @inheritDoc */
  public onAttached(): void {
    super.onAttached();

    this.transform.transform.getChild(0).set(-50, -50);

    this.apEngagedSub = this.props.apEngaged.sub((isEngaged) => {
      this.apPassiveDisplay.set(isEngaged ? 'none' : '');
    }, true);

    const updateHandler = (): void => {
      this.needUpdate = true;
    };

    this.pauseable.push(
      this.props.fdPitch.sub(updateHandler),
      this.props.fdBank.sub(updateHandler),
      this.conformalBounds.sub(updateHandler),
      this.conformalBankLimit.sub(updateHandler),
    );

    this.showSub = this.props.show.sub(this.setVisible.bind(this), true);

    this.needUpdate = true;
  }

  /** @inheritDoc */
  public onProjectionChanged(): void {
    this.needUpdate = true;
  }

  /** @inheritDoc */
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

  /** @inheritDoc */
  public onDetached(): void {
    super.onDetached();

    this.destroy();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <>
        <svg
          viewBox='-104 -30 208 60'
          class='flight-director-single-cue'
          style={{
            'display': this.display,
            'position': 'absolute',
            'left': '0px',
            'top': '0px',
            'transform': this.transform,
            'overflow': 'visible',
          }}
        >
          <path
            d='M 0 0 l 89 30 l 15 0 l 0 -12 Z M 0 0 l -89 30 l -15 0 l 0 -12 Z'
            fill='var(--flight-director-fill)' stroke='var(--flight-director-stroke)' stroke-width='var(--flight-director-stroke-width)'
            vector-effect='non-scaling-stroke'
          />
          <path
            d='M 89 30 l 15 -12 M -89 30 l -15 -12'
            fill='none'
            stroke='var(--flight-director-stroke)' stroke-width='var(--flight-director-stroke-width)' stroke-linejoin='bevel'
            vector-effect='non-scaling-stroke'
          />
          <path
            style={{
              'display': this.apPassiveDisplay,
            }}
            d='M 31.56 8 l 66.54 11.52 l -9.6 7.67 Z M 96.13 27.5 l 5.37 -4.3 l 0 4.3 Z M -31.56 8 l -66.54 11.52 l 9.6 7.67 Z M -96.13 27.5 l -5.37 -4.3 l 0 4.3 Z'
            fill='var(--flight-director-ap-passive-fill)'
          />
        </svg>
      </>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    for (const pauseable of this.pauseable) {
      pauseable.destroy();
    }

    this.showSub?.destroy();
    this.apEngagedSub?.destroy();

    super.destroy();
  }
}

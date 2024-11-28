import { ConsumerSubject, EventBus, Instrument, MappedSubject, Subject, Subscribable, SubscribableUtils, Subscription } from '@microsoft/msfs-sdk';

import { RASystemEvents } from '../Systems/RASystem';

/** A radio altimeter data provider, providing data from the RA selected for an instrument. */
export interface RadioAltimeterDataProvider {
  /** The current radio altitude, or null when invalid. */
  radioAltitude: Subscribable<number | null>;
}

/** An altitude air data provider implementation. */
export class DefaultRadioAltimeterDataProvider implements RadioAltimeterDataProvider, Instrument {
  private readonly raIndex: Subscribable<number>;

  private readonly raValid = ConsumerSubject.create(null, false);

  // source subjects
  private readonly raRadioAlt = ConsumerSubject.create(null, 0);

  private readonly _radioAltitude = Subject.create<number | null>(null);
  public readonly radioAltitude = this._radioAltitude as Subscribable<number | null>;

  private radioAltitudePipe = this.raRadioAlt.pipe(this._radioAltitude, true);

  private raDataPipes = [
    this.radioAltitudePipe,
  ] as const;

  private outputSubjects = [
    this._radioAltitude,
  ] as const;

  private readonly raIndexSub: Subscription;
  private readonly raValidSub: Subscription;

  /**
   * Ctor.
   * @param bus The instrument event bus.
   * @param raIndex The radio altimeter to use.
   */
  constructor(
    private readonly bus: EventBus,
    raIndex: number | Subscribable<number>,
  ) {
    this.raIndex = SubscribableUtils.toSubscribable(raIndex, true);

    const sub = this.bus.getSubscriber<RASystemEvents>();
    // eslint-disable-next-line no-console
    sub.on('ra_radio_alt_valid_1').handle((v) => console.log('ra_radio_alt_valid_1', v));

    this.raValidSub = MappedSubject.create(this.raIndex, this.raValid).sub(([index, valid]) => {
      if (index > 0 && valid) {
        for (const pipe of this.raDataPipes) {
          pipe.resume(true);
        }
      } else {
        this.pauseAndSetDataInvalid();
      }
    }, true, true);

    this.raIndexSub = this.raIndex.sub((index) => {
      if (index > 0) {
        this.raRadioAlt.setConsumer(sub.on(`ra_radio_alt_${index}`).withPrecision(1));
        this.raValid.setConsumer(sub.on(`ra_radio_alt_valid_${index}`));
      } else {
        this.raValid.setConsumer(null);
        this.raRadioAlt.setConsumer(null);
      }
    }, true, true);
  }

  /** @inheritdoc */
  public init(): void {
    this.resume();
  }

  /** @inheritdoc */
  public onUpdate(): void {
    // noop
  }

  /** Pause the data subjects and set the outputs invalid (null). */
  private pauseAndSetDataInvalid(): void {
    for (const pipe of this.raDataPipes) {
      pipe.pause();
    }
    for (const output of this.outputSubjects) {
      output.set(null);
    }
  }

  /** Pause the data output. */
  public pause(): void {
    this.raIndexSub.pause();
    this.raValidSub.pause();
    this.pauseAndSetDataInvalid();
  }

  /** Resume the data output. */
  public resume(): void {
    this.raIndexSub.resume(true);
    this.raValidSub.resume(true);
  }
}

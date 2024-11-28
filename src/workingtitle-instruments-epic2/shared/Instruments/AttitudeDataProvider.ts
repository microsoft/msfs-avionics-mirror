import { ConsumerSubject, EventBus, Instrument, MappedSubject, Subject, Subscribable, SubscribableUtils, Subscription } from '@microsoft/msfs-sdk';

import { AdahrsSystemChannel, AdahrsSystemEvents } from '../Systems/AdahrsSystem';

/** An attitude data provider, providing data from the ADAHRS selected for an instrument. */
export interface AttitudeDataProvider {
  /** The current roll (bank) of the airplane in degrees, or null when invalid. Positive values indicate leftward roll. */
  roll: Subscribable<number | null>;
  /** The current pitch of the airplane in degrees, or null when invalid. Positive values indicate downward pitch. */
  pitch: Subscribable<number | null>;
  /** Whether the aircraft is in an excessive attitude condition */
  excessiveAttitude: Subscribable<boolean>;
  /** Whether the attitude data subjects are all valid. */
  dataValid: Subscribable<boolean>;
}

/** An attitude data provider implementation. */
export class DefaultAttitudeDataProvider implements AttitudeDataProvider, Instrument {
  private static readonly EXCESSIVE_ATTITUDE_ENTRY_PITCH_DOWN = -20;
  private static readonly EXCESSIVE_ATTITUDE_ENTRY_PITCH_UP = 30;
  private static readonly EXCESSIVE_ATTITUDE_ENTRY_ROLL = 65;
  private static readonly EXCESSIVE_ATTITUDE_EXIT_PITCH_DOWN = -18;
  private static readonly EXCESSIVE_ATTITUDE_EXIT_PITCH_UP = 28;
  private static readonly EXCESSIVE_ATTITUDE_EXIT_ROLL = 63;

  private readonly adahrsIndex: Subscribable<number>;
  private readonly adahrsValid = ConsumerSubject.create(null, false);

  // source subjects
  private readonly adahrsRoll = ConsumerSubject.create(null, 0);
  private readonly adahrsPitch = ConsumerSubject.create(null, 0);

  private readonly _roll = Subject.create<number | null>(null);
  public readonly roll = this._roll as Subscribable<number | null>;

  private readonly _pitch = Subject.create<number | null>(null);
  public readonly pitch = this._pitch as Subscribable<number | null>;

  private readonly _excessiveAttitude = Subject.create<boolean>(false);
  public readonly excessiveAttitude = this._excessiveAttitude as Subscribable<boolean>;

  private readonly _dataValid = MappedSubject.create((inputs) => inputs.every((v) => v !== null), this._roll, this._pitch);
  public readonly dataValid = this._dataValid as Subscribable<boolean>;

  private rollPipe = this.adahrsRoll.pipe(this._roll, true);
  private pitchPipe = this.adahrsPitch.pipe(this._pitch, true);

  private adahrsDataPipes = [
    this.rollPipe,
    this.pitchPipe,
  ] as const;

  private outputSubjects = [
    this._roll,
    this._pitch,
  ] as const;

  private readonly adahrsIndexSub: Subscription;
  private readonly adahrsValidSub: Subscription;

  /**
   * Ctor.
   * @param bus The instrument event bus.
   * @param adahrsIndex The ADAHRS channel to use.
   */
  constructor(
    private readonly bus: EventBus,
    adahrsIndex: AdahrsSystemChannel | Subscribable<AdahrsSystemChannel>,
  ) {
    this.adahrsIndex = SubscribableUtils.toSubscribable(adahrsIndex, true);

    const sub = this.bus.getSubscriber<AdahrsSystemEvents>();

    this.adahrsValidSub = MappedSubject.create(this.adahrsIndex, this.adahrsValid).sub(([index, valid]) => {
      if (index > 0 && valid) {
        for (const pipe of this.adahrsDataPipes) {
          pipe.resume(true);
        }
      } else {
        this.pauseAndSetDataInvalid();
      }
    }, true, true);

    this.adahrsIndexSub = this.adahrsIndex.sub((index) => {
      if (index > 0) {
        this.adahrsRoll.setConsumer(sub.on(`adahrs_actual_roll_deg_${index}`).withPrecision(2));
        this.adahrsPitch.setConsumer(sub.on(`adahrs_actual_pitch_deg_${index}`).withPrecision(2));
        this.adahrsValid.setConsumer(sub.on(`adahrs_attitude_data_valid_${index}`));
      } else {
        this.adahrsValid.setConsumer(null);
        this.adahrsRoll.setConsumer(null);
        this.adahrsPitch.setConsumer(null);
      }
    });
  }

  /** @inheritdoc */
  public init(): void {
    this.resume();
  }

  /** @inheritdoc */
  public onUpdate(): void {
    const isValid = this._dataValid.get();

    if (isValid) {
      const pitch = this._pitch.get();
      const roll = this._roll.get();

      if (roll && pitch) {
        if (
          (roll < -DefaultAttitudeDataProvider.EXCESSIVE_ATTITUDE_ENTRY_ROLL || roll > DefaultAttitudeDataProvider.EXCESSIVE_ATTITUDE_ENTRY_ROLL) ||
          (pitch < DefaultAttitudeDataProvider.EXCESSIVE_ATTITUDE_ENTRY_PITCH_DOWN || pitch > DefaultAttitudeDataProvider.EXCESSIVE_ATTITUDE_ENTRY_PITCH_UP)
        ) {
          this._excessiveAttitude.set(true);
        }

        if (this._excessiveAttitude.get()) {
          if (
            (roll > -DefaultAttitudeDataProvider.EXCESSIVE_ATTITUDE_EXIT_ROLL && roll < DefaultAttitudeDataProvider.EXCESSIVE_ATTITUDE_EXIT_ROLL) &&
            (pitch > DefaultAttitudeDataProvider.EXCESSIVE_ATTITUDE_EXIT_PITCH_DOWN && pitch < DefaultAttitudeDataProvider.EXCESSIVE_ATTITUDE_EXIT_PITCH_UP)
          ) {
            this._excessiveAttitude.set(false);
          }
        }
      }
    }
  }

  /** Pause the data subjects and set the outputs invalid (null). */
  private pauseAndSetDataInvalid(): void {
    for (const pipe of this.adahrsDataPipes) {
      pipe.pause();
    }
    for (const output of this.outputSubjects) {
      output.set(null);
    }
  }

  /** Pause the data output. */
  public pause(): void {
    this.adahrsIndexSub.pause();
    this.adahrsValidSub.pause();
    this.pauseAndSetDataInvalid();
  }

  /** Resume the data output. */
  public resume(): void {
    this.adahrsIndexSub.resume(true);
    this.adahrsValidSub.resume(true);
  }
}

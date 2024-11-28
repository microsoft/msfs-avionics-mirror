import {
  AdcEvents, ConsumerSubject, DebounceTimer, EventBus, Instrument, MappedSubject, Subject, Subscribable, SubscribableUtils, Subscription
} from '@microsoft/msfs-sdk';

import { AdahrsSystemEvents } from '../Systems/AdahrsSystem';
import { AoaSystemEvents } from '../Systems/AoaSystem';
import { AirGroundDataProviderEvents } from './AirGroundDataProvider';
import { SpeedLimitEvents } from './SpeedLimit';

/** A stall warning system data provider, providing data from the stall warning system selected for an instrument. */
export interface StallWarningDataProvider {
  /** Whether the aircraft stall warning is currently active */
  isStallWarningActive: Subscribable<boolean | null>;

  /** The airspeed in knots below which the stick shaker activates. */
  stallWarningCas: Subscribable<number | null>;

  /** The dynamic airspeed in knots. */
  dynamicSpeedCas: Subscribable<number | null>;
}

/** A stall warning system data provider implementation. */
export class DefaultStallWarningDataProvider implements StallWarningDataProvider, Instrument {
  protected static readonly STALL_CAS_HYSTERESIS = 3;
  protected static readonly STALL_AOA_HYSTERESIS = 0.5;
  protected static readonly ON_GROUND_DEBOUNCE_TIME = 500;

  protected readonly aoaSystemAoa = ConsumerSubject.create<number | null>(null, null);
  protected readonly aoaValid = ConsumerSubject.create(null, false);
  protected readonly aoa = Subject.create<number | null>(null);
  protected readonly aoaPipe = this.aoaSystemAoa.pipe(this.aoa, true);

  private readonly adahrsValid = ConsumerSubject.create(null, false);
  protected readonly adahrsCas = ConsumerSubject.create<number | null>(null, null);
  protected readonly cas = Subject.create<number | null>(null);
  protected readonly casPipe = this.adahrsCas.pipe(this.cas, true);

  protected readonly stallAoa = ConsumerSubject.create(null, 0).pause();
  protected readonly stallCas = ConsumerSubject.create<number | null>(null, null).pause();

  protected readonly isOnGround = ConsumerSubject.create(null, true);
  /** Debounced on ground state. */
  protected readonly isOnGroundDebounced = Subject.create(true);
  protected readonly isOnGroundDebounceTimer = new DebounceTimer();

  protected readonly isStalledCas = MappedSubject.create<[number | null, number | null], boolean | null>(
    ([currentCas, stallCas], previousValue) => stallCas === null || currentCas === null
      ? null
      : currentCas <= (previousValue ? 1.1 * stallCas + DefaultStallWarningDataProvider.STALL_CAS_HYSTERESIS : 1.1 * stallCas),
    this.cas,
    this.stallCas
  );

  protected readonly isStalledAoa = MappedSubject.create<[number | null, number | null], boolean | null>(
    ([currentAoa, stallAoa], previousValue) => stallAoa === null || currentAoa === null
      ? null
      : stallAoa <= (previousValue ? currentAoa + DefaultStallWarningDataProvider.STALL_AOA_HYSTERESIS : currentAoa),
    this.aoa,
    this.stallAoa
  );

  protected readonly aoaIndex: Subscribable<number>;
  protected readonly adahrsIndex: Subscribable<number>;

  // output subjects
  protected readonly _isStallWarningActive = MappedSubject.create(
    ([isStalledAoa, isStalledCas, isOnGround]) => isStalledAoa === null && isStalledCas === null ? null : !isOnGround && (isStalledAoa || isStalledCas),
    this.isStalledAoa,
    this.isStalledCas,
    this.isOnGroundDebounced,
  );
  public readonly isStallWarningActive = this._isStallWarningActive as Subscribable<boolean | null>;

  public readonly stallWarningCas = this.stallCas.map((v) => v !== null ? 1.1 * v : null) as Subscribable<number | null>;

  public readonly dynamicSpeedCas = this.stallCas.map((v) => v !== null ? 1.3 * v : null) as Subscribable<number | null>;

  protected readonly aoaIndexSub: Subscription;
  protected readonly adahrsIndexSub: Subscription;
  protected readonly aoaValidSub: Subscription;
  protected readonly adahrsValidSub: Subscription;

  private adahrsDataPipes = [
    this.casPipe,
  ] as const;

  private aoaDataPipes = [
    this.aoaPipe,
  ] as const;

  private adahrsSubjects = [
    this.cas,
  ] as const;

  private aoaSubjects = [
    this.aoa,
  ] as const;

  /**
   * Ctor.
   * @param bus The instrument event bus.
   * @param aoaIndex The selected AOA sensor.
   * @param adahrsIndex The selected ADAHRS.
   */
  constructor(
    protected readonly bus: EventBus,
    aoaIndex: number | Subscribable<number>,
    adahrsIndex: number | Subscribable<number>,
  ) {
    this.aoaIndex = SubscribableUtils.toSubscribable(aoaIndex, true);
    this.adahrsIndex = SubscribableUtils.toSubscribable(adahrsIndex, true);

    const sub = this.bus.getSubscriber<AdcEvents & AirGroundDataProviderEvents & AdahrsSystemEvents & AoaSystemEvents & SpeedLimitEvents>();

    this.aoaValidSub = MappedSubject.create(this.aoaIndex, this.aoaValid).sub(([index, valid]) => {
      if (index > 0 && valid) {
        for (const pipe of this.aoaDataPipes) {
          pipe.resume(true);
        }
      } else {
        this.pauseAndSetAoaDataInvalid();
      }
    }, true, true);

    this.aoaIndexSub = this.aoaIndex.sub((index) => {
      if (index > 0) {
        this.aoaSystemAoa.setConsumer(sub.on(`aoa_aoa_${index}`));
        this.aoaValid.setConsumer(sub.on(`aoa_data_valid_${index}`));
      } else {
        this.aoaSystemAoa.setConsumer(null);
        this.aoaValid.setConsumer(null);
      }
    }, true, true);

    this.adahrsValidSub = MappedSubject.create(this.adahrsIndex, this.adahrsValid).sub(([index, valid]) => {
      if (index > 0 && valid) {
        for (const pipe of this.adahrsDataPipes) {
          pipe.resume(true);
        }
      } else {
        this.pauseAndSetAdahrsDataInvalid();
      }
    }, true, true);

    this.adahrsIndexSub = this.adahrsIndex.sub((index) => {
      if (index > 0) {
        this.adahrsCas.setConsumer(sub.on(`adahrs_ias_${index}`));
        this.adahrsValid.setConsumer(sub.on(`adahrs_speed_data_valid_${index}`));
      } else {
        this.adahrsCas.setConsumer(null);
        this.adahrsValid.setConsumer(null);
      }
    }, true, true);

    this.stallAoa.setConsumer(sub.on('speedlimit_min_speed_aoa'));
    this.stallCas.setConsumer(sub.on('speedlimit_stall_ias'));

    this.isOnGround.sub((v) => {
      this.isOnGroundDebounceTimer.schedule(() => this.isOnGroundDebounced.set(v), DefaultStallWarningDataProvider.ON_GROUND_DEBOUNCE_TIME);
    });
    this.isOnGround.setConsumer(sub.on('air_ground_is_on_ground'));
  }

  /** @inheritdoc */
  public init(): void {
    this.resume();
  }

  /** @inheritdoc */
  public onUpdate(): void {
    // noop
  }

  /** Pause the AOA sensor data subjects and set the outputs invalid (null). */
  protected pauseAndSetAoaDataInvalid(): void {
    for (const pipe of this.aoaDataPipes) {
      pipe.pause();
    }
    for (const sub of this.aoaSubjects) {
      sub.set(null);
    }
  }

  /** Pause the ADAHRS data subjects and set the outputs invalid (null). */
  protected pauseAndSetAdahrsDataInvalid(): void {
    for (const pipe of this.adahrsDataPipes) {
      pipe.pause();
    }
    for (const sub of this.adahrsSubjects) {
      sub.set(null);
    }
  }

  /** Pause the data outputs. */
  public pause(): void {
    this.aoaIndexSub.pause();
    this.adahrsIndexSub.pause();
    this.aoaValidSub.pause();
    this.adahrsValidSub.pause();
    this.stallAoa.pause();
    this.stallCas.pause();
    this.pauseAndSetAdahrsDataInvalid();
    this.pauseAndSetAoaDataInvalid();
    this._isStallWarningActive.pause();
  }

  /** Resume the data outputs. */
  public resume(): void {
    this.aoaIndexSub.resume(true);
    this.adahrsIndexSub.resume(true);
    this.aoaValidSub.resume(true);
    this.adahrsValidSub.resume(true);
    this.stallAoa.resume();
    this.stallCas.resume();
    this._isStallWarningActive.resume();
  }
}

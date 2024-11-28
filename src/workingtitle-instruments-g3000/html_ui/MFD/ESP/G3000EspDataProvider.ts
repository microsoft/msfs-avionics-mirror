import {
  APEvents, Accessible, AdcEvents, ArrayUtils, ClockEvents, ConsumerValue, EventBus, ExpSmoother, MathUtils,
  Subscription, Value
} from '@microsoft/msfs-sdk';

import {
  AdcSystemEvents, AdcSystemSelector, AglSystemEvents, AhrsSystemEvents, AhrsSystemSelector, AoaSystemEvents, EspData,
  EspDataProvider
} from '@microsoft/msfs-garminsdk';

/**
 * Configuration options for {@link G3000EspDataProvider}.
 */
export type G3000EspDataProviderOptions = {
  /** The number of supported AHRS systems from which the data provider can source data. */
  ahrsCount: number;

  /** The number of supported ADC systems from which the data provider can source data. */
  adcCount: number;

  /**
   * Whether arming is inhibited due to external factors. If not defined, then arming is never inhibited due to
   * external factors.
   */
  isArmingInhibited?: Accessible<boolean>;
};

/**
 * A G3000 provider of ESP data.
 */
export class G3000EspDataProvider implements EspDataProvider {

  private readonly simTime = ConsumerValue.create(null, 0);
  private readonly simRate = ConsumerValue.create(null, 1);

  private readonly isArmingInhibited: Accessible<boolean>;

  private readonly isOnGround = ConsumerValue.create(null, false);

  private readonly apMasterStatus = ConsumerValue.create(null, false);

  private readonly ahrsSelector: AhrsSystemSelector;

  private readonly pitch = ConsumerValue.create(null, 0);
  private lastPitch: number | undefined = undefined;
  private readonly pitchRateSmoother = new ExpSmoother(1000);

  private readonly roll = ConsumerValue.create(null, 0);
  private lastRoll: number | undefined = undefined;
  private readonly rollRateSmoother = new ExpSmoother(1000);

  private readonly adcSelector: AdcSystemSelector;

  private readonly ias = ConsumerValue.create(null, 0);
  private readonly mach = ConsumerValue.create(null, 0);
  private readonly tas = ConsumerValue.create(null, 0);

  private readonly aoaDataValid = ConsumerValue.create(null, false);
  private readonly aoa = ConsumerValue.create(null, 0);
  private readonly stallAoa = ConsumerValue.create(null, 0);
  private readonly zeroLiftAoa = ConsumerValue.create(null, 0);

  private readonly gpsAglDataValid = ConsumerValue.create(null, false);
  private readonly gpsAgl = ConsumerValue.create(null, 0);

  private readonly _data: EspData = {
    realTime: 0,
    simTime: 0,
    simRate: 0,
    isArmingInhibited: false,
    isOnGround: false,
    isApOn: false,
    isAttitudeValid: false,
    pitch: NaN,
    pitchRate: NaN,
    roll: NaN,
    rollRate: NaN,
    isAirspeedValid: false,
    ias: NaN,
    mach: NaN,
    isTasValid: false,
    tas: NaN,
    isAoaValid: false,
    aoa: NaN,
    stallAoa: NaN,
    zeroLiftAoa: NaN,
    isAglValid: false,
    agl: NaN
  };
  /** @inheritDoc */
  public readonly data = this._data as Readonly<EspData>;

  private lastUpdateRealTime: number | undefined = undefined;

  private isAlive = true;
  private isInit = false;

  private readonly subscriptions: Subscription[] = [
    this.simTime,
    this.simRate,
    this.isOnGround,
    this.apMasterStatus,
    this.pitch,
    this.roll,
    this.ias,
    this.mach,
    this.tas,
    this.aoaDataValid,
    this.aoa,
    this.stallAoa,
    this.zeroLiftAoa,
    this.gpsAglDataValid,
    this.gpsAgl
  ];

  /**
   * Creates a new instance of G3000EspDataProvider. The data provider is created in a paused state. Initializing the
   * data provider and calling `update()` will resume it.
   * @param bus The event bus.
   * @param options Options with which to configure the data provider.
   */
  public constructor(private readonly bus: EventBus, options: Readonly<G3000EspDataProviderOptions>) {
    const ahrsIndexes = ArrayUtils.range(options.ahrsCount, 1);
    this.ahrsSelector = new AhrsSystemSelector(bus, ahrsIndexes, { systemPriorities: ahrsIndexes });

    const adcIndexes = ArrayUtils.range(options.adcCount, 1);
    this.adcSelector = new AdcSystemSelector(bus, adcIndexes, { systemPriorities: adcIndexes });

    this.isArmingInhibited = options.isArmingInhibited ?? Value.create(false);
  }

  /**
   * Initializes this data provider, allowing it to be updated.
   * @throws Error if this data provider has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('G3000EspDataProvider: cannot initialize a dead data provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<ClockEvents & AdcEvents & APEvents & AglSystemEvents & AoaSystemEvents>();

    this.simTime.setConsumer(sub.on('simTime'));
    this.simRate.setConsumer(sub.on('simRate'));

    this.isOnGround.setConsumer(sub.on('on_ground'));

    this.apMasterStatus.setConsumer(sub.on('ap_master_status'));

    this.ahrsSelector.init();
    this.ahrsSelector.selectedIndex.sub(this.onAhrsIndexChanged.bind(this), true);

    this.adcSelector.init();
    this.adcSelector.selectedIndex.sub(this.onAdcIndexChanged.bind(this), true);

    this.aoaDataValid.setConsumer(sub.on('aoa_data_valid_1'));
    this.aoa.setConsumer(sub.on('aoa_aoa_1'));
    this.stallAoa.setConsumer(sub.on('aoa_stall_aoa_1'));
    this.zeroLiftAoa.setConsumer(sub.on('aoa_zero_lift_aoa_1'));

    this.gpsAglDataValid.setConsumer(sub.on('agl_gps_data_valid_1'));
    this.gpsAgl.setConsumer(sub.on('agl_gps_height_1'));
  }

  /**
   * Responds to when the index of the AHRS system from which this provider sources data changes.
   * @param index The new index of the AHRS system from which this provider sources data.
   */
  private onAhrsIndexChanged(index: number): void {
    if (index < 1) {
      this.pitch.setConsumer(null);
      this.roll.setConsumer(null);
    } else {
      const sub = this.bus.getSubscriber<AhrsSystemEvents>();
      this.pitch.setConsumer(sub.on(`ahrs_pitch_deg_${index}`));
      this.roll.setConsumer(sub.on(`ahrs_roll_deg_${index}`));
    }
  }

  /**
   * Responds to when the index of the ADC system from which this provider sources data changes.
   * @param index The new index of the ADC system from which this provider sources data.
   */
  private onAdcIndexChanged(index: number): void {
    if (index < 1) {
      this.ias.setConsumer(null);
      this.mach.setConsumer(null);
      this.tas.setConsumer(null);
    } else {
      const sub = this.bus.getSubscriber<AdcSystemEvents>();
      this.ias.setConsumer(sub.on(`adc_ias_${index}`));
      this.mach.setConsumer(sub.on(`adc_mach_number_${index}`));
      this.tas.setConsumer(sub.on(`adc_tas_${index}`));
    }
  }

  /**
   * Updates this data provider. Has no effect if this data provider is not initialized.
   * @param realTime The current real (operating system) time, as a Javascript timestamp.
   * @throws Error if this data provider has been destroyed.
   */
  public update(realTime: number): void {
    if (!this.isAlive) {
      throw new Error('G3000EspDataProvider: cannot update a dead data provider');
    }

    if (!this.isInit) {
      return;
    }

    const simRate = this.simRate.get();
    const dt = this.lastUpdateRealTime === undefined
      ? 0
      : MathUtils.clamp(realTime - this.lastUpdateRealTime, 0, 5000) * simRate;

    this._data.realTime = realTime;
    this._data.simTime = this.simTime.get();
    this._data.simRate = simRate;

    this._data.isArmingInhibited = this.isArmingInhibited.get();

    this._data.isOnGround = this.isOnGround.get();
    this._data.isApOn = this.apMasterStatus.get();

    this.updateAttitude(dt);
    this.updateAirspeed();
    this.updateAoa();
    this.updateAgl();

    this.lastUpdateRealTime = realTime;
  }

  /**
   * Updates this provider's attitude data.
   * @param dt The elapsed time since the last update, in milliseconds.
   */
  private updateAttitude(dt: number): void {
    if (this.ahrsSelector.isSelectedAttitudeDataValid.get()) {
      this._data.isAttitudeValid = true;

      const pitch = this.pitch.get();
      const roll = this.roll.get();

      let pitchRate: number;
      let rollRate: number;
      if (dt > 0) {
        pitchRate = this.pitchRateSmoother.next(this.lastPitch === undefined ? 0 : (pitch - this.lastPitch) / dt * 1000, dt);
        rollRate = this.rollRateSmoother.next(this.lastRoll === undefined ? 0 : (roll - this.lastRoll) / dt * 1000, dt);
      } else {
        pitchRate = this.pitchRateSmoother.last() ?? 0;
        rollRate = this.rollRateSmoother.last() ?? 0;
      }

      this._data.pitch = pitch;
      this._data.pitchRate = pitchRate;
      this._data.roll = roll;
      this._data.rollRate = rollRate;

      this.lastPitch = pitch;
      this.lastRoll = roll;
    } else {
      this.lastPitch = undefined;
      this.pitchRateSmoother.reset();
      this.lastRoll = undefined;
      this.rollRateSmoother.reset();

      this._data.isAttitudeValid = false;
      this._data.pitch = NaN;
      this._data.pitchRate = NaN;
      this._data.roll = NaN;
      this._data.rollRate = NaN;
    }
  }

  /**
   * Updates this provider's airspeed data.
   */
  private updateAirspeed(): void {
    if (this.adcSelector.isSelectedAirspeedDataValid.get()) {
      this._data.isAirspeedValid = true;
      this._data.ias = this.ias.get();
      this._data.mach = this.mach.get();

      if (this.adcSelector.isSelectedTemperatureDataValid.get()) {
        this._data.isTasValid = true;
        this._data.tas = this.tas.get();
      } else {
        this._data.isTasValid = false;
        this._data.tas = NaN;
      }
    } else {
      this._data.isAirspeedValid = false;
      this._data.ias = NaN;
      this._data.mach = NaN;
      this._data.tas = NaN;
    }
  }

  /**
   * Updates this provider's angle of attack data.
   */
  private updateAoa(): void {
    this._data.isAoaValid = this.aoaDataValid.get();
    if (this._data.isAoaValid) {
      this._data.aoa = this.aoa.get();
      this._data.stallAoa = this.stallAoa.get();
      this._data.zeroLiftAoa = this.zeroLiftAoa.get();
    } else {
      this._data.aoa = NaN;
      this._data.stallAoa = NaN;
      this._data.zeroLiftAoa = NaN;
    }
  }

  /**
   * Updates this provider's above ground height data.
   */
  private updateAgl(): void {
    this._data.isAglValid = this.gpsAglDataValid.get();
    this._data.agl = this._data.isAglValid ? this.gpsAgl.get() : NaN;
  }

  /**
   * Pauses this data provider. The provider will be resumed the next time `update()` is called.
   * @throws Error if this data provider has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('G3000EspDataProvider: cannot update a dead data provider');
    }

    if (!this.isInit) {
      return;
    }

    this.lastUpdateRealTime = undefined;
  }

  /**
   * Destroys this data provider.
   */
  public destroy(): void {
    this.isAlive = false;

    this.ahrsSelector.destroy();
    this.adcSelector.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }
  }
}

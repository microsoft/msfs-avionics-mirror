import { ConsumerSubject, EventBus, MappedSubject, MutableSubscribable, SpeedUnit, Subject, Subscribable } from '@microsoft/msfs-sdk';
import { FmsSpeedUserSettingManager } from '../Settings/FmsSpeedUserSettings';
import { FmsSpeedEvents } from './FmsSpeedEvents';
import { FmsSpeedTargetSource } from './FmsSpeedTypes';

/**
 * An FMS speed value, consisting of a speed and associated unit.
 */
export type FmsSpeedValue = {
  /** The numeric value of the speed. */
  value: number;

  /** The unit of the speed. */
  unit: SpeedUnit;
}

/**
 * A provider of FMS speed target data for the GTC.
 */
export interface FmsSpeedTargetDataProvider {
  /** The nominal target speed computed by the FMS. The value is negative if there is no nominal target speed. */
  readonly nominalComputedTargetSpeed: Subscribable<FmsSpeedValue>;

  /** The source of the nominal target speed computed by FMS. */
  readonly nominalComputedTargetSpeedSource: Subscribable<FmsSpeedTargetSource>;

  /** Whether a user-defined speed override is active. */
  readonly isUserTargetSpeedActive: Subscribable<boolean>;

  /** The nominal user-defined speed override value. The value is negative if there is no nominal speed override. */
  readonly nominalUserTargetSpeed: Subscribable<FmsSpeedValue>;
}

/**
 * A default implementation of {@link FmsSpeedTargetDataProvider}.
 */
export class DefaultFmsSpeedTargetDataProvider implements FmsSpeedTargetDataProvider {

  private static readonly SPEED_VALUE_EQUALITY = (a: FmsSpeedValue, b: FmsSpeedValue): boolean => a.value === b.value && a.unit === b.unit;
  private static readonly SPEED_VALUE_MUTATOR = (oldVal: FmsSpeedValue, newVal: FmsSpeedValue): void => {
    oldVal.value = newVal.value;
    oldVal.unit = newVal.unit;
  };

  private readonly targetIas = ConsumerSubject.create(null, -1);
  private readonly targetMach = ConsumerSubject.create(null, -1);
  private readonly targetIsMach = ConsumerSubject.create(null, false);
  private readonly targetSource = ConsumerSubject.create(null, FmsSpeedTargetSource.None);

  private readonly maxIas = ConsumerSubject.create(null, -1);
  private readonly maxMach = ConsumerSubject.create(null, -1);
  private readonly maxIsMach = ConsumerSubject.create(null, false);
  private readonly maxSource = ConsumerSubject.create(null, FmsSpeedTargetSource.None);

  private readonly userIas = this.fmsSpeedSettingManager.getSetting('fmsSpeedUserTargetIas');
  private readonly userMach = this.fmsSpeedSettingManager.getSetting('fmsSpeedUserTargetMach');
  private readonly userIsMach = this.fmsSpeedSettingManager.getSetting('fmsSpeedUserTargetIsMach');

  private readonly _hasComputedTargetSpeed = MappedSubject.create(
    ([ias, mach, isMach]) => (isMach ? mach : ias) >= 0,
    this.targetIas,
    this.targetMach,
    this.targetIsMach
  );

  private readonly tempSpeedValue = {
    value: -1,
    unit: SpeedUnit.IAS
  };

  private readonly _nominalComputedTargetSpeed = Subject.create(
    { value: 0, unit: SpeedUnit.IAS },
    DefaultFmsSpeedTargetDataProvider.SPEED_VALUE_EQUALITY,
    DefaultFmsSpeedTargetDataProvider.SPEED_VALUE_MUTATOR
  );
  /** @inheritdoc */
  public readonly nominalComputedTargetSpeed = this._nominalComputedTargetSpeed as Subscribable<FmsSpeedValue>;

  private readonly _nominalComputedTargetSpeedSource = Subject.create(FmsSpeedTargetSource.None);
  /** @inheritdoc */
  public readonly nominalComputedTargetSpeedSource = this._nominalComputedTargetSpeedSource as Subscribable<FmsSpeedTargetSource>;

  private readonly _isUserTargetSpeedActive = MappedSubject.create(
    ([hasTarget, userIas, userMach, userIsMach]) => hasTarget && (userIsMach ? userMach : userIas) >= 0,
    this._hasComputedTargetSpeed,
    this.userIas,
    this.userMach,
    this.userIsMach
  );
  /** @readonly */
  public readonly isUserTargetSpeedActive = this._isUserTargetSpeedActive as Subscribable<boolean>;

  private readonly _nominalUserTargetSpeed = Subject.create(
    { value: 0, unit: SpeedUnit.IAS },
    DefaultFmsSpeedTargetDataProvider.SPEED_VALUE_EQUALITY,
    DefaultFmsSpeedTargetDataProvider.SPEED_VALUE_MUTATOR
  );
  /** @inheritdoc */
  public readonly nominalUserTargetSpeed = this._nominalUserTargetSpeed as Subscribable<FmsSpeedValue>;

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param fmsSpeedSettingManager A manager for FMS speed user settings.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly fmsSpeedSettingManager: FmsSpeedUserSettingManager
  ) {
  }

  /**
   * Initializes this data provider. Once initialized, this data provider will continuously update its data until
   * paused or destroyed.
   * @param paused Whether to initialize this data provider as paused. If `true`, this data provider will provide an
   * initial set of data but will not update the provided data until it is resumed. Defaults to `false`.
   * @throws Error if this data provider is dead.
   */
  public init(paused = false): void {
    if (!this.isAlive) {
      throw new Error('DefaultFmsSpeedTargetDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;
    this.isPaused = paused;

    const sub = this.bus.getSubscriber<FmsSpeedEvents>();

    this.targetIas.setConsumer(sub.on('fms_speed_computed_target_ias'));
    this.targetMach.setConsumer(sub.on('fms_speed_computed_target_mach'));
    this.targetIsMach.setConsumer(sub.on('fms_speed_computed_target_is_mach'));
    this.targetSource.setConsumer(sub.on('fms_speed_computed_target_source'));

    this.maxIas.setConsumer(sub.on('fms_speed_computed_max_ias'));
    this.maxMach.setConsumer(sub.on('fms_speed_computed_max_mach'));
    this.maxIsMach.setConsumer(sub.on('fms_speed_computed_max_is_mach'));
    this.maxSource.setConsumer(sub.on('fms_speed_computed_max_source'));

    const speedValuePipeFunc = (to: MutableSubscribable<FmsSpeedValue>, [ias, mach, isMach]: readonly [number, number, boolean]): void => {
      if (isMach) {
        this.tempSpeedValue.value = mach;
        this.tempSpeedValue.unit = SpeedUnit.MACH;
      } else {
        this.tempSpeedValue.value = ias;
        this.tempSpeedValue.unit = SpeedUnit.IAS;
      }

      to.set(this.tempSpeedValue);
    };

    const targetPipe = MappedSubject.create(
      this.targetIas,
      this.targetMach,
      this.targetIsMach
    ).sub(speedValuePipeFunc.bind(this, this._nominalComputedTargetSpeed), false, true);

    const maxPipe = MappedSubject.create(
      this.maxIas,
      this.maxMach,
      this.maxIsMach
    ).sub(speedValuePipeFunc.bind(this, this._nominalComputedTargetSpeed), false, true);

    const targetSourcePipe = this.targetSource.pipe(this._nominalComputedTargetSpeedSource, true);
    const maxSourcePipe = this.maxSource.pipe(this._nominalComputedTargetSpeedSource, true);

    this._hasComputedTargetSpeed.sub(hasTarget => {
      if (hasTarget) {
        maxPipe.pause();
        maxSourcePipe.pause();
        targetPipe.resume(true);
        targetSourcePipe.resume(true);
      } else {
        targetPipe.pause();
        targetSourcePipe.pause();
        maxPipe.resume(true);
        maxSourcePipe.resume(true);
      }
    }, true);

    const userPipe = MappedSubject.create(
      this.userIas,
      this.userMach,
      this.userIsMach
    ).sub(speedValuePipeFunc.bind(this, this._nominalUserTargetSpeed), false, true);

    this._isUserTargetSpeedActive.sub(isActive => {
      if (isActive) {
        userPipe.resume(true);
      } else {
        userPipe.pause();

        this.tempSpeedValue.value = -1;
        this.tempSpeedValue.unit = SpeedUnit.IAS;
        this._nominalUserTargetSpeed.set(this.tempSpeedValue);
      }
    }, true);

    if (paused) {
      this.pause();
    }
  }

  /**
   * Resumes this data provider. Once resumed, this data provider will continuously update its data until paused or
   * destroyed.
   * @throws Error if this data provider is dead.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('DefaultFmsSpeedTargetDataProvider: cannot resume a dead provider');
    }

    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;

    this.targetIas.resume();
    this.targetMach.resume();
    this.targetIsMach.resume();
    this.targetSource.resume();

    this.maxIas.resume();
    this.maxMach.resume();
    this.maxIsMach.resume();
    this.maxSource.resume();
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultFmsSpeedTargetDataProvider: cannot pause a dead provider');
    }

    if (this.isPaused) {
      return;
    }

    this.targetIas.pause();
    this.targetMach.pause();
    this.targetIsMach.pause();
    this.targetSource.pause();

    this.maxIas.pause();
    this.maxMach.pause();
    this.maxIsMach.pause();
    this.maxSource.pause();
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this.targetIas.destroy();
    this.targetMach.destroy();
    this.targetIsMach.destroy();
    this.targetSource.destroy();

    this.maxIas.destroy();
    this.maxMach.destroy();
    this.maxIsMach.destroy();
    this.maxSource.destroy();
  }
}
import {
  BasicNavAngleUnit,
  DefaultUserSettingManager, EventBus, NavAngleUnit, Subject, Subscribable, Unit, UnitFamily, UnitType, UserSettingDefinition, UserSettingManagerEntry,
  UserSettingManagerSyncData, UserSettingValue
} from '@microsoft/msfs-sdk';

/**
 * Setting modes for nav angle units.
 */
export enum UnitsNavAngleSettingMode {
  Magnetic = 'magnetic',
  True = 'true'
}

/**
 * Setting modes for distance/speed units.
 */
export enum UnitsDistanceSettingMode {
  Metric = 'metric',
  Nautical = 'nautical',
  Statute = 'statute'
}

/**
 * Setting modes for altitude units.
 */
export enum UnitsAltitudeSettingMode {
  Feet = 'feet',
  Meters = 'meters',
  MetersMps = 'metersMps'
}

/**
 * Setting modes for temperature units.
 */
export enum UnitsTemperatureSettingMode {
  Celsius = 'celsius',
  Fahrenheit = 'fahrenheit'
}

/**
 * Setting modes for weight units.
 */
export enum UnitsWeightSettingMode {
  Kilograms = 'kilograms',
  Pounds = 'pounds'
}

/**
 * Setting modes for fuel units.
 */
export enum UnitsFuelSettingMode {
  Gallons = 'gallons',
  ImpGal = 'imp gals',
  Kilograms = 'kilograms',
  Liters = 'liters',
  Pounds = 'pounds'
}

/**
 * Type descriptions for display units user settings.
 */
export type UnitsUserSettingTypes = {
  /** The nav angle units setting. */
  unitsNavAngle: UnitsNavAngleSettingMode;

  /** The distance/speed units setting. */
  unitsDistance: UnitsDistanceSettingMode;

  /** The altitude units setting. */
  unitsAltitude: UnitsAltitudeSettingMode;

  /** The temperature units setting. */
  unitsTemperature: UnitsTemperatureSettingMode;

  /** The weight units setting. */
  unitsWeight: UnitsWeightSettingMode;

  /** The fuel units setting. */
  unitsFuel: UnitsFuelSettingMode;

}

/**
 * A user setting manager for display units. In addition to syncing settings across instruments and managing event
 * bus events related to the settings, this manager also provides subscribables for the unit types controlled by its
 * settings.
 */
export class UnitsUserSettingManager extends DefaultUserSettingManager<UnitsUserSettingTypes> {
  private static readonly TRUE_BEARING = BasicNavAngleUnit.create(false);
  private static readonly MAGNETIC_BEARING = BasicNavAngleUnit.create(true);

  private readonly navAngleUnitsSub = Subject.create(UnitsUserSettingManager.MAGNETIC_BEARING);
  public readonly navAngleUnits = this.navAngleUnitsSub as Subscribable<NavAngleUnit>;

  private readonly distanceUnitsLargeSub = Subject.create(UnitType.NMILE);
  public readonly distanceUnitsLarge = this.distanceUnitsLargeSub as Subscribable<Unit<UnitFamily.Distance>>;

  private readonly distanceUnitsSmallSub = Subject.create(UnitType.FOOT);
  public readonly distanceUnitsSmall = this.distanceUnitsSmallSub as Subscribable<Unit<UnitFamily.Distance>>;

  private readonly speedUnitsSub = Subject.create(UnitType.KNOT);
  public readonly speedUnits = this.speedUnitsSub as Subscribable<Unit<UnitFamily.Speed>>;

  private readonly altitudeUnitsSub = Subject.create(UnitType.FOOT);
  public readonly altitudeUnits = this.altitudeUnitsSub as Subscribable<Unit<UnitFamily.Distance>>;

  private readonly verticalSpeedUnitsSub = Subject.create(UnitType.FPM);
  public readonly verticalSpeedUnits = this.verticalSpeedUnitsSub as Subscribable<Unit<UnitFamily.Speed>>;

  private readonly temperatureUnitsSub = Subject.create(UnitType.CELSIUS);
  public readonly temperatureUnits = this.temperatureUnitsSub as Subscribable<Unit<UnitFamily.Temperature>>;

  private readonly temperatureDeltaUnitsSub = Subject.create(UnitType.DELTA_CELSIUS);
  public readonly temperatureDeltaUnits = this.temperatureDeltaUnitsSub as Subscribable<Unit<UnitFamily.TemperatureDelta>>;

  private readonly weightUnitsSub = Subject.create(UnitType.POUND);
  public readonly weightUnits = this.weightUnitsSub as Subscribable<Unit<UnitFamily.Weight>>;

  private readonly fuelUnitsSub = Subject.create(UnitType.GALLON_FUEL);
  public readonly fuelUnits = this.fuelUnitsSub as Subscribable<Unit<UnitFamily.Weight>>;

  private readonly fuelFlowUnitsSub = Subject.create(UnitType.GPH_FUEL);
  public readonly fuelFlowUnits = this.fuelFlowUnitsSub as Subscribable<Unit<UnitFamily.WeightFlux>>;

  private areSubscribablesInit = false;

  /** @inheritdoc */
  constructor(bus: EventBus, settingDefs: UserSettingDefinition<UnitsUserSettingTypes[keyof UnitsUserSettingTypes]>[]) {
    super(bus, settingDefs);

    this.areSubscribablesInit = true;

    for (const entry of this.settings.values()) {
      this.updateUnitsSubjects(entry.setting.definition.name, entry.setting.value);
    }
  }

  /** @inheritdoc */
  protected onSettingValueChanged<K extends keyof UnitsUserSettingTypes>(
    entry: UserSettingManagerEntry<UnitsUserSettingTypes[K]>,
    value: UnitsUserSettingTypes[K]
  ): void {
    if (this.areSubscribablesInit) {
      this.updateUnitsSubjects(entry.setting.definition.name, value);
    }

    super.onSettingValueChanged(entry, value);
  }

  /** @inheritdoc */
  protected syncSettingFromEvent<K extends keyof UnitsUserSettingTypes>(
    entry: UserSettingManagerEntry<UnitsUserSettingTypes[K]>,
    data: UserSettingManagerSyncData<UnitsUserSettingTypes[K]>
  ): void {
    if (this.areSubscribablesInit) {
      this.updateUnitsSubjects(entry.setting.definition.name, data.value);
    }

    super.syncSettingFromEvent(entry, data);
  }

  /**
   * Updates this manager's units subjects in response to a setting value change.
   * @param settingName The name of the setting that was changed.
   * @param value The new value of the changed setting.
   */
  protected updateUnitsSubjects(settingName: string, value: UserSettingValue): void {
    switch (settingName) {
      case 'unitsNavAngle':
        this.navAngleUnitsSub.set(value === UnitsNavAngleSettingMode.True ? UnitsUserSettingManager.TRUE_BEARING : UnitsUserSettingManager.MAGNETIC_BEARING);
        break;
      case 'unitsDistance':
        switch (value) {
          case UnitsDistanceSettingMode.Metric:
            this.distanceUnitsLargeSub.set(UnitType.KILOMETER);
            this.distanceUnitsSmallSub.set(UnitType.METER);
            this.speedUnitsSub.set(UnitType.KPH);
            break;
          case UnitsDistanceSettingMode.Statute:
            this.distanceUnitsLargeSub.set(UnitType.MILE);
            this.distanceUnitsSmallSub.set(UnitType.FOOT);
            this.speedUnitsSub.set(UnitType.MPH);
            break;
          default:
            this.distanceUnitsLargeSub.set(UnitType.NMILE);
            this.distanceUnitsSmallSub.set(UnitType.FOOT);
            this.speedUnitsSub.set(UnitType.KNOT);
        }
        break;
      case 'unitsAltitude':
        switch (value) {
          case UnitsAltitudeSettingMode.Meters:
            this.altitudeUnitsSub.set(UnitType.METER);
            this.verticalSpeedUnitsSub.set(UnitType.MPM);
            break;
          case UnitsAltitudeSettingMode.MetersMps:
            this.altitudeUnitsSub.set(UnitType.METER);
            this.verticalSpeedUnitsSub.set(UnitType.MPS);
            break;
          default:
            this.altitudeUnitsSub.set(UnitType.FOOT);
            this.verticalSpeedUnitsSub.set(UnitType.FPM);
        }
        break;
      case 'unitsTemperature':
        if (value === UnitsTemperatureSettingMode.Fahrenheit) {
          this.temperatureUnitsSub.set(UnitType.FAHRENHEIT);
          this.temperatureDeltaUnitsSub.set(UnitType.DELTA_FAHRENHEIT);
        } else {
          this.temperatureUnitsSub.set(UnitType.CELSIUS);
          this.temperatureDeltaUnitsSub.set(UnitType.DELTA_CELSIUS);
        }
        break;
      case 'unitsWeight':
        this.weightUnitsSub.set(value === UnitsWeightSettingMode.Kilograms ? UnitType.KILOGRAM : UnitType.POUND);
        break;
      case 'unitsFuel':
        switch (value) {
          case UnitsFuelSettingMode.ImpGal:
            this.fuelUnitsSub.set(UnitType.IMP_GALLON_FUEL);
            this.fuelFlowUnitsSub.set(UnitType.IGPH_FUEL);
            break;
          case UnitsFuelSettingMode.Liters:
            this.fuelUnitsSub.set(UnitType.LITER_FUEL);
            this.fuelFlowUnitsSub.set(UnitType.LPH_FUEL);
            break;
          case UnitsFuelSettingMode.Kilograms:
            this.fuelUnitsSub.set(UnitType.KILOGRAM);
            this.fuelFlowUnitsSub.set(UnitType.KGH);
            break;
          case UnitsFuelSettingMode.Pounds:
            this.fuelUnitsSub.set(UnitType.POUND);
            this.fuelFlowUnitsSub.set(UnitType.PPH);
            break;
          default:
            this.fuelUnitsSub.set(UnitType.GALLON_FUEL);
            this.fuelFlowUnitsSub.set(UnitType.GPH_FUEL);
        }
        break;
    }
  }
}

/**
 * Utility class for retrieving display units user setting managers.
 */
export class UnitsUserSettings {
  private static INSTANCE: UnitsUserSettingManager | undefined;

  /**
   * Retrieves a manager for display units user settings.
   * @param bus The event bus.
   * @returns a manager for display units user settings.
   */
  public static getManager(bus: EventBus): UnitsUserSettingManager {
    return UnitsUserSettings.INSTANCE ??= new UnitsUserSettingManager(bus, [
      {
        name: 'unitsNavAngle',
        defaultValue: UnitsNavAngleSettingMode.Magnetic
      },
      {
        name: 'unitsDistance',
        defaultValue: UnitsDistanceSettingMode.Nautical
      },
      {
        name: 'unitsAltitude',
        defaultValue: UnitsAltitudeSettingMode.Feet
      },
      {
        name: 'unitsTemperature',
        defaultValue: UnitsTemperatureSettingMode.Celsius
      },
      {
        name: 'unitsWeight',
        defaultValue: UnitsWeightSettingMode.Pounds
      },
      {
        name: 'unitsFuel',
        defaultValue: UnitsFuelSettingMode.Gallons
      }
    ]);
  }
}
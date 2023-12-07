import {
  BasicNavAngleUnit, Consumer, DefaultUserSettingManager, EventBus, NavAngleUnit, Subject, Subscribable, Unit,
  UnitFamily, UnitType, UserSetting, UserSettingManager, UserSettingMap, UserSettingRecord, UserSettingValue
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
 * Garmin display units user settings.
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
 * Instrument-local versions of Garmin display units user settings.
 */
export type LocalUnitsUserSettingTypes = {
  [P in keyof UnitsUserSettingTypes as `${P}_local`]: UnitsUserSettingTypes[P];
}

/**
 * A manager for Garmin display units user settings.
 */
export interface UnitsUserSettingManager extends UserSettingManager<UnitsUserSettingTypes> {
  /** The nav angle units to use for the current nav angle units setting. */
  readonly navAngleUnits: Subscribable<NavAngleUnit>;

  /** The large distance units to use (nautical mile, kilometer, etc.) for the current distance units setting. */
  readonly distanceUnitsLarge: Subscribable<Unit<UnitFamily.Distance>>;

  /** The small distance units to use (foot, meter, etc.) for the current distance units setting. */
  readonly distanceUnitsSmall: Subscribable<Unit<UnitFamily.Distance>>;

  /** The speed units to use for the current distance units setting. */
  readonly speedUnits: Subscribable<Unit<UnitFamily.Speed>>;

  /** The altitude units to use for the current altitude units setting. */
  readonly altitudeUnits: Subscribable<Unit<UnitFamily.Distance>>;

  /** The vertical speed units to use for the current altitude units setting. */
  readonly verticalSpeedUnits: Subscribable<Unit<UnitFamily.Speed>>;

  /** The temperature units to use for the current temperature units setting. */
  readonly temperatureUnits: Subscribable<Unit<UnitFamily.Temperature>>;

  /** The temperature delta units to use for the current temperature units setting. */
  readonly temperatureDeltaUnits: Subscribable<Unit<UnitFamily.TemperatureDelta>>;

  /** The weight units to use for the current weight units setting. */
  readonly weightUnits: Subscribable<Unit<UnitFamily.Weight>>;

  /** The fuel units to use for the current fuel units setting. */
  readonly fuelUnits: Subscribable<Unit<UnitFamily.Weight>>;

  /** The fuel flow units to use for the current fuel units setting. */
  readonly fuelFlowUnits: Subscribable<Unit<UnitFamily.WeightFlux>>;
}

/**
 * A default implementation of {@link UnitsUserSettingManager} which sources setting values from another setting
 * manager.
 */
export class DefaultUnitsUserSettingManager implements UnitsUserSettingManager {
  private static readonly TRUE_BEARING = BasicNavAngleUnit.create(false);
  private static readonly MAGNETIC_BEARING = BasicNavAngleUnit.create(true);

  private readonly _navAngleUnits = Subject.create(DefaultUnitsUserSettingManager.MAGNETIC_BEARING);
  public readonly navAngleUnits = this._navAngleUnits as Subscribable<NavAngleUnit>;

  private readonly _distanceUnitsLarge = Subject.create(UnitType.NMILE);
  public readonly distanceUnitsLarge = this._distanceUnitsLarge as Subscribable<Unit<UnitFamily.Distance>>;

  private readonly _distanceUnitsSmall = Subject.create(UnitType.FOOT);
  public readonly distanceUnitsSmall = this._distanceUnitsSmall as Subscribable<Unit<UnitFamily.Distance>>;

  private readonly _speedUnits = Subject.create(UnitType.KNOT);
  public readonly speedUnits = this._speedUnits as Subscribable<Unit<UnitFamily.Speed>>;

  private readonly _altitudeUnits = Subject.create(UnitType.FOOT);
  public readonly altitudeUnits = this._altitudeUnits as Subscribable<Unit<UnitFamily.Distance>>;

  private readonly _verticalSpeedUnits = Subject.create(UnitType.FPM);
  public readonly verticalSpeedUnits = this._verticalSpeedUnits as Subscribable<Unit<UnitFamily.Speed>>;

  private readonly _temperatureUnits = Subject.create(UnitType.CELSIUS);
  public readonly temperatureUnits = this._temperatureUnits as Subscribable<Unit<UnitFamily.Temperature>>;

  private readonly _temperatureDeltaUnits = Subject.create(UnitType.DELTA_CELSIUS);
  public readonly temperatureDeltaUnits = this._temperatureDeltaUnits as Subscribable<Unit<UnitFamily.TemperatureDelta>>;

  private readonly _weightUnits = Subject.create(UnitType.POUND);
  public readonly weightUnits = this._weightUnits as Subscribable<Unit<UnitFamily.Weight>>;

  private readonly _fuelUnits = Subject.create(UnitType.GALLON_FUEL);
  public readonly fuelUnits = this._fuelUnits as Subscribable<Unit<UnitFamily.Weight>>;

  private readonly _fuelFlowUnits = Subject.create(UnitType.GPH_FUEL);
  public readonly fuelFlowUnits = this._fuelFlowUnits as Subscribable<Unit<UnitFamily.WeightFlux>>;

  /** @inheritdoc */
  public constructor(private readonly sourceSettingManager: UserSettingManager<UnitsUserSettingTypes>) {
    sourceSettingManager.getSetting('unitsNavAngle').pipe(this._navAngleUnits, value => {
      return value === UnitsNavAngleSettingMode.True ? DefaultUnitsUserSettingManager.TRUE_BEARING : DefaultUnitsUserSettingManager.MAGNETIC_BEARING;
    });

    sourceSettingManager.getSetting('unitsDistance').sub(value => {
      switch (value) {
        case UnitsDistanceSettingMode.Metric:
          this._distanceUnitsLarge.set(UnitType.KILOMETER);
          this._distanceUnitsSmall.set(UnitType.METER);
          this._speedUnits.set(UnitType.KPH);
          break;
        case UnitsDistanceSettingMode.Statute:
          this._distanceUnitsLarge.set(UnitType.MILE);
          this._distanceUnitsSmall.set(UnitType.FOOT);
          this._speedUnits.set(UnitType.MPH);
          break;
        default:
          this._distanceUnitsLarge.set(UnitType.NMILE);
          this._distanceUnitsSmall.set(UnitType.FOOT);
          this._speedUnits.set(UnitType.KNOT);
      }
    }, true);

    sourceSettingManager.getSetting('unitsAltitude').sub(value => {
      switch (value) {
        case UnitsAltitudeSettingMode.Meters:
          this._altitudeUnits.set(UnitType.METER);
          this._verticalSpeedUnits.set(UnitType.MPM);
          break;
        case UnitsAltitudeSettingMode.MetersMps:
          this._altitudeUnits.set(UnitType.METER);
          this._verticalSpeedUnits.set(UnitType.MPS);
          break;
        default:
          this._altitudeUnits.set(UnitType.FOOT);
          this._verticalSpeedUnits.set(UnitType.FPM);
      }
    }, true);

    sourceSettingManager.getSetting('unitsTemperature').sub(value => {
      if (value === UnitsTemperatureSettingMode.Fahrenheit) {
        this._temperatureUnits.set(UnitType.FAHRENHEIT);
        this._temperatureDeltaUnits.set(UnitType.DELTA_FAHRENHEIT);
      } else {
        this._temperatureUnits.set(UnitType.CELSIUS);
        this._temperatureDeltaUnits.set(UnitType.DELTA_CELSIUS);
      }
    }, true);

    sourceSettingManager.getSetting('unitsWeight').pipe(this._weightUnits, value => {
      return value === UnitsWeightSettingMode.Kilograms ? UnitType.KILOGRAM : UnitType.POUND;
    });

    sourceSettingManager.getSetting('unitsFuel').sub(value => {
      switch (value) {
        case UnitsFuelSettingMode.ImpGal:
          this._fuelUnits.set(UnitType.IMP_GALLON_FUEL);
          this._fuelFlowUnits.set(UnitType.IGPH_FUEL);
          break;
        case UnitsFuelSettingMode.Liters:
          this._fuelUnits.set(UnitType.LITER_FUEL);
          this._fuelFlowUnits.set(UnitType.LPH_FUEL);
          break;
        case UnitsFuelSettingMode.Kilograms:
          this._fuelUnits.set(UnitType.KILOGRAM);
          this._fuelFlowUnits.set(UnitType.KGH);
          break;
        case UnitsFuelSettingMode.Pounds:
          this._fuelUnits.set(UnitType.POUND);
          this._fuelFlowUnits.set(UnitType.PPH);
          break;
        default:
          this._fuelUnits.set(UnitType.GALLON_FUEL);
          this._fuelFlowUnits.set(UnitType.GPH_FUEL);
      }
    }, true);
  }

  /** @inheritdoc */
  public tryGetSetting<K extends string>(name: K): K extends keyof UnitsUserSettingTypes ? UserSetting<NonNullable<UnitsUserSettingTypes[K]>> : undefined {
    return this.sourceSettingManager.tryGetSetting(name) as any;
  }

  /** @inheritdoc */
  public getSetting<K extends keyof UnitsUserSettingTypes>(name: K): UserSetting<NonNullable<UnitsUserSettingTypes[K]>> {
    return this.sourceSettingManager.getSetting(name);
  }

  /** @inheritdoc */
  public whenSettingChanged<K extends keyof UnitsUserSettingTypes>(name: K): Consumer<NonNullable<UnitsUserSettingTypes[K]>> {
    return this.sourceSettingManager.whenSettingChanged(name);
  }

  /** @inheritdoc */
  public getAllSettings(): UserSetting<UserSettingValue>[] {
    return this.sourceSettingManager.getAllSettings();
  }

  /** @inheritdoc */
  public mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, UnitsUserSettingTypes>): UserSettingManager<M & UnitsUserSettingTypes> {
    return this.sourceSettingManager.mapTo(map);
  }
}

/**
 * Utility class for retrieving display units user setting managers.
 */
export class UnitsUserSettings {
  private static INSTANCE: UnitsUserSettingManager | undefined;
  private static LOCAL_INSTANCE: UnitsUserSettingManager | undefined;

  /**
   * Retrieves a manager for display units user settings.
   * @param bus The event bus.
   * @returns A manager for display units user settings.
   */
  public static getManager(bus: EventBus): UnitsUserSettingManager {
    return UnitsUserSettings.INSTANCE ??= new DefaultUnitsUserSettingManager(
      new DefaultUserSettingManager(bus, Object.entries(UnitsUserSettings.getDefaultValues()).map(([name, defaultValue]) => {
        return {
          name,
          defaultValue
        };
      }))
    );
  }

  /**
   * Retrieves a manager for instrument-local display units user settings.
   * @param bus The event bus.
   * @returns A manager for instrument-local display units user settings.
   */
  public static getLocalManager(bus: EventBus): UnitsUserSettingManager {
    if (UnitsUserSettings.LOCAL_INSTANCE) {
      return UnitsUserSettings.LOCAL_INSTANCE;
    }

    const defaultValues = Object.entries(UnitsUserSettings.getDefaultValues()) as [keyof UnitsUserSettingTypes, UnitsUserSettingTypes[keyof UnitsUserSettingTypes]][];

    const defs = defaultValues.map(([name, defaultValue]) => {
      return {
        name: `${name}_local`,
        defaultValue
      };
    });

    const map = {} as UserSettingMap<UnitsUserSettingTypes, LocalUnitsUserSettingTypes>;
    for (const [name] of defaultValues) {
      map[name] = `${name}_local`;
    }

    return UnitsUserSettings.LOCAL_INSTANCE = new DefaultUnitsUserSettingManager(
      new DefaultUserSettingManager(bus, defs, true).mapTo(map)
    );
  }

  /**
   * Gets the default values for a full set of standard display units user settings.
   * @returns The default values for a full set of standard display units user settings.
   */
  private static getDefaultValues(): UnitsUserSettingTypes {
    return {
      unitsNavAngle: UnitsNavAngleSettingMode.Magnetic,
      unitsDistance: UnitsDistanceSettingMode.Nautical,
      unitsAltitude: UnitsAltitudeSettingMode.Feet,
      unitsTemperature: UnitsTemperatureSettingMode.Celsius,
      unitsWeight: UnitsWeightSettingMode.Pounds,
      unitsFuel: UnitsFuelSettingMode.Gallons
    };
  }
}
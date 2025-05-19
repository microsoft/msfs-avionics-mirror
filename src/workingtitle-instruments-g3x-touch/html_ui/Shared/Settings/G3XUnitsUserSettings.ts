import {
  DefaultUserSettingManager, EventBus, Subject, Subscribable, Unit, UnitFamily, UnitType, UserSettingManager,
  UserSettingMap
} from '@microsoft/msfs-sdk';

import {
  DefaultUnitsUserSettingManager, UnitsAltitudeSettingMode, UnitsDistanceSettingMode, UnitsFuelSettingMode,
  UnitsNavAngleSettingMode, UnitsTemperatureSettingMode, UnitsUserSettingManager, UnitsUserSettingTypes,
  UnitsWeightSettingMode
} from '@microsoft/msfs-garminsdk';

import { G3XUnitType } from '../Math/G3XUnitType';

/**
 * Setting modes for barometric pressure units.
 */
export enum G3XUnitsBaroPressureSettingMode {
  InHg = 'inhg',
  Hectopascals = 'hectopascals',
  Millibars = 'millibars'
}

export enum G3XUnitsFuelEconomySettingMode {
  Nautical = 'Nautical',
  Statute = 'Statute',
  MetricKmPerL = 'MetricKmPerL',
  MetricLPer100Km = 'MetricLPer100Km',
  NauticalJetA = 'NauticalJetA',
  StatuteJetA = 'StatuteJetA',
  MetricKmPerLJetA = 'MetricKmPerLJetA',
  MetricLPer100KmJetA = 'MetricLPer100KmJetA',
  Nautical100LL = 'Nautical100LL',
  Statute100LL = 'Statute100LL',
  MetricKmPerL100LL = 'MetricKmPerL100LL',
  MetricLPer100Km100LL = 'MetricLPer100Km100LL',
  NauticalAutogas = 'NauticalAutogas',
  StatuteAutogas = 'StatuteAutogas',
  MetricKmPerLAutogas = 'MetricKmPerLAutogas',
  MetricLPer100KmAutogas = 'MetricLPer100KmAutogas',
  NauticalSim = 'NauticalSim',
  StatuteSim = 'StatuteSim',
  MetricKmPerLSim = 'MetricKmPerLSim',
  MetricLPer100KmSim = 'MetricLPer100KmSim',
}

/**
 * Aliased G3X Touch display units user settings.
 */
export type G3XUnitsUserSettingTypes = UnitsUserSettingTypes & {
  /** The baro pressure units setting. */
  unitsBaroPressure: G3XUnitsBaroPressureSettingMode;
  /** The fuel economy units setting. */
  unitsFuelEconomy: G3XUnitsFuelEconomySettingMode;
}

/**
 * True G3X Touch display units user settings.
 */
export type G3XUnitsTrueUserSettingTypes = {
  [P in keyof G3XUnitsUserSettingTypes as `${P}_g3x`]: G3XUnitsUserSettingTypes[P];
}

/**
 * A manager for G3X Touch display units user settings.
 */
export interface G3XUnitsUserSettingManager extends UnitsUserSettingManager<G3XUnitsUserSettingTypes> {
  /** The barometric pressure units to use for the current barometric pressure units setting. */
  readonly baroPressureUnits: Subscribable<Unit<UnitFamily.Pressure>>;
  /** The fuel economy units to use for the current fuel economy units setting. */
  readonly fuelEconomyUnits: Subscribable<Unit<UnitFamily.DistancePerWeight | UnitFamily.WeightPerDistance>>;
}

/**
 * A default implementation of {@link G3XUnitsUserSettingManager} which sources setting values from another setting
 * manager.
 */
export class DefaultG3XUnitsUserSettingManager extends DefaultUnitsUserSettingManager<G3XUnitsUserSettingTypes> implements G3XUnitsUserSettingManager {
  private readonly _baroPressureUnits = Subject.create(UnitType.IN_HG);
  /** @inheritDoc */
  public readonly baroPressureUnits = this._baroPressureUnits as Subscribable<Unit<UnitFamily.Pressure>>;

  private readonly _fuelEconomyUnits = Subject.create<Unit<UnitFamily.DistancePerWeight | UnitFamily.WeightPerDistance>>(UnitType.NMILE_PER_GALLON_FUEL);
  /** @inheritDoc */
  public readonly fuelEconomyUnits = this._fuelEconomyUnits as Subscribable<Unit<UnitFamily.DistancePerWeight | UnitFamily.WeightPerDistance>>;

  /**
   * Creates a new instance of DefaultG3XUnitsUserSettingManager.
   * @param sourceSettingManager The manager from which to source setting values.
   */
  public constructor(sourceSettingManager: UserSettingManager<G3XUnitsUserSettingTypes>) {
    super(sourceSettingManager, {
      simFuelUnits: {
        fuel: [G3XUnitType.LITER_SIM_FUEL, G3XUnitType.GALLON_SIM_FUEL, G3XUnitType.IMP_GALLON_SIM_FUEL],
        fuelFlow: [G3XUnitType.LPH_SIM_FUEL, G3XUnitType.GPH_SIM_FUEL, G3XUnitType.IGPH_SIM_FUEL],
      }
    });

    sourceSettingManager.getSetting('unitsBaroPressure').sub(value => {
      switch (value) {
        case G3XUnitsBaroPressureSettingMode.Hectopascals:
          this._baroPressureUnits.set(UnitType.HPA);
          break;
        case G3XUnitsBaroPressureSettingMode.Millibars:
          this._baroPressureUnits.set(UnitType.MB);
          break;
        default:
          this._baroPressureUnits.set(UnitType.IN_HG);
      }
    }, true);

    sourceSettingManager.getSetting('unitsFuelEconomy').sub(value => {
      switch (value) {
        case G3XUnitsFuelEconomySettingMode.StatuteSim:
          this._fuelEconomyUnits.set(G3XUnitType.MILE_PER_GALLON_SIM_FUEL);
          break;
        case G3XUnitsFuelEconomySettingMode.MetricKmPerLSim:
          this._fuelEconomyUnits.set(G3XUnitType.KM_PER_LITER_SIM_FUEL);
          break;
        case G3XUnitsFuelEconomySettingMode.MetricLPer100KmSim:
          this._fuelEconomyUnits.set(G3XUnitType.LITER_SIM_FUEL_PER_100KM);
          break;
        case G3XUnitsFuelEconomySettingMode.NauticalJetA:
          this._fuelEconomyUnits.set(UnitType.NMILE_PER_GALLON_JET_A_FUEL);
          break;
        case G3XUnitsFuelEconomySettingMode.StatuteJetA:
          this._fuelEconomyUnits.set(UnitType.MILE_PER_GALLON_JET_A_FUEL);
          break;
        case G3XUnitsFuelEconomySettingMode.MetricKmPerLJetA:
          this._fuelEconomyUnits.set(G3XUnitType.KM_PER_LITER_JET_A_FUEL);
          break;
        case G3XUnitsFuelEconomySettingMode.MetricLPer100KmJetA:
          this._fuelEconomyUnits.set(G3XUnitType.LITER_JET_A_FUEL_PER_100KM);
          break;
        case G3XUnitsFuelEconomySettingMode.Nautical100LL:
          this._fuelEconomyUnits.set(UnitType.NMILE_PER_GALLON_100LL_FUEL);
          break;
        case G3XUnitsFuelEconomySettingMode.Statute100LL:
          this._fuelEconomyUnits.set(UnitType.MILE_PER_GALLON_100LL_FUEL);
          break;
        case G3XUnitsFuelEconomySettingMode.MetricKmPerL100LL:
          this._fuelEconomyUnits.set(G3XUnitType.KM_PER_LITER_100LL_FUEL);
          break;
        case G3XUnitsFuelEconomySettingMode.MetricLPer100Km100LL:
          this._fuelEconomyUnits.set(G3XUnitType.LITER_100LL_FUEL_PER_100KM);
          break;
        case G3XUnitsFuelEconomySettingMode.NauticalAutogas:
          this._fuelEconomyUnits.set(UnitType.NMILE_PER_GALLON_AUTOGAS_FUEL);
          break;
        case G3XUnitsFuelEconomySettingMode.StatuteAutogas:
          this._fuelEconomyUnits.set(UnitType.MILE_PER_GALLON_AUTOGAS_FUEL);
          break;
        case G3XUnitsFuelEconomySettingMode.MetricKmPerLAutogas:
          this._fuelEconomyUnits.set(G3XUnitType.KM_PER_LITER_AUTOGAS_FUEL);
          break;
        case G3XUnitsFuelEconomySettingMode.MetricLPer100KmAutogas:
          this._fuelEconomyUnits.set(G3XUnitType.LITER_AUTOGAS_FUEL_PER_100KM);
          break;
        case G3XUnitsFuelEconomySettingMode.Nautical:
          this._fuelEconomyUnits.set(UnitType.NMILE_PER_GALLON_FUEL);
          break;
        case G3XUnitsFuelEconomySettingMode.Statute:
          this._fuelEconomyUnits.set(UnitType.MILE_PER_GALLON_FUEL);
          break;
        case G3XUnitsFuelEconomySettingMode.MetricKmPerL:
          this._fuelEconomyUnits.set(G3XUnitType.KM_PER_LITER_FUEL);
          break;
        case G3XUnitsFuelEconomySettingMode.MetricLPer100Km:
          this._fuelEconomyUnits.set(G3XUnitType.LITER_PER_100KM);
          break;
        default:
          this._fuelEconomyUnits.set(G3XUnitType.NMILE_PER_GALLON_SIM_FUEL);
      }
    }, true);
  }
}

/**
 * Utility class for retrieving G3X Touch display units user setting managers.
 */
export class G3XUnitsUserSettings {
  private static INSTANCE: G3XUnitsUserSettingManager | undefined;

  /**
   * Retrieves a manager for display units user settings.
   * @param bus The event bus.
   * @returns A manager for display units user settings.
   */
  public static getManager(bus: EventBus): G3XUnitsUserSettingManager {
    if (G3XUnitsUserSettings.INSTANCE) {
      return G3XUnitsUserSettings.INSTANCE;
    }

    const defaultValues = Object.entries(G3XUnitsUserSettings.getDefaultValues()) as [keyof G3XUnitsUserSettingTypes, G3XUnitsUserSettingTypes[keyof G3XUnitsUserSettingTypes]][];

    const defs = defaultValues.map(([name, defaultValue]) => {
      return {
        name: `${name}_g3x`,
        defaultValue
      };
    });

    const map = {} as UserSettingMap<G3XUnitsUserSettingTypes, G3XUnitsTrueUserSettingTypes>;
    for (const [name] of defaultValues) {
      map[name] = `${name}_g3x`;
    }

    return G3XUnitsUserSettings.INSTANCE = new DefaultG3XUnitsUserSettingManager(
      new DefaultUserSettingManager(bus, defs).mapTo(map)
    );
  }

  /**
   * Gets the default values for a full set of standard display units user settings.
   * @returns The default values for a full set of standard display units user settings.
   */
  private static getDefaultValues(): G3XUnitsUserSettingTypes {
    return {
      unitsNavAngle: UnitsNavAngleSettingMode.Magnetic,
      unitsDistance: UnitsDistanceSettingMode.Nautical,
      unitsAltitude: UnitsAltitudeSettingMode.Feet,
      unitsTemperature: UnitsTemperatureSettingMode.Celsius,
      unitsWeight: UnitsWeightSettingMode.Pounds,
      unitsFuel: UnitsFuelSettingMode.GallonsSim,
      unitsBaroPressure: G3XUnitsBaroPressureSettingMode.InHg,
      unitsFuelEconomy: G3XUnitsFuelEconomySettingMode.NauticalSim,
    };
  }
}

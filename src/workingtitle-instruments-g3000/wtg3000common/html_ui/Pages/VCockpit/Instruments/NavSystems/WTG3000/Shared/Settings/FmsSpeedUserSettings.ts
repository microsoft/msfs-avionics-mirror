import {
  Consumer, DefaultUserSettingManager, EventBus, MathUtils, UserSetting, UserSettingDefinition, UserSettingManager, UserSettingMap,
  UserSettingRecord, UserSettingValue
} from '@microsoft/msfs-sdk';
import { FmsConfigurationSpeedDefinition, FmsSpeedClimbSchedule, FmsSpeedCruiseSchedule, FmsSpeedDescentSchedule, FmsSpeedsConfig } from '../AvionicsConfig/VNavConfig';

/**
 * FMS speed user settings.
 */
export type FmsSpeedUserSettingTypes = {
  /** An FMS aircraft configuration speed limit, in knots. */
  [fmsSpeedConfigurationLimit: `fmsSpeedConfigurationLimit_${number}`]: number;

  /** The index of the selected FMS climb schedule. */
  fmsSpeedClimbScheduleIndex: number;

  /** The scheduled FMS climb phase target indicated airspeed, in knots. */
  fmsSpeedClimbIas: number;

  /** The scheduled FMS climb phase target mach number. */
  fmsSpeedClimbMach: number;

  /** The pilot-defined FMS climb phase target indicated airspeed, in knots. */
  fmsSpeedPilotClimbIas: number;

  /** The pilot-defined FMS climb phase target mach number. */
  fmsSpeedPilotClimbMach: number;

  /** The index of the selected FMS cruise schedule. */
  fmsSpeedCruiseScheduleIndex: number;

  /** The scheduled FMS cruise phase target indicated airspeed, in knots. */
  fmsSpeedCruiseIas: number;

  /** The scheduled FMS cruise phase target mach number. */
  fmsSpeedCruiseMach: number;

  /** The pilot-defined FMS cruise phase target indicated airspeed, in knots. */
  fmsSpeedPilotCruiseIas: number;

  /** The pilot-defined FMS cruise phase target mach number. */
  fmsSpeedPilotCruiseMach: number;

  /** The index of the selected FMS descent schedule. */
  fmsSpeedDescentScheduleIndex: number;

  /** The scheduled FMS descent phase target indicated airspeed, in knots. */
  fmsSpeedDescentIas: number;

  /** The scheduled FMS descent phase target mach number. */
  fmsSpeedDescentMach: number;

  /** The scheduled FMS descent phase target flight path angle, in degrees. */
  fmsSpeedDescentFpa: number;

  /** The pilot-defined FMS descent phase target indicated airspeed, in knots. */
  fmsSpeedPilotDescentIas: number;

  /** The pilot-defined FMS descent phase target mach number. */
  fmsSpeedPilotDescentMach: number;

  /** The pilot-defined FMS descent phase target flight path angle, in degrees. */
  fmsSpeedPilotDescentFpa: number;

  /** The FMS climb phase altitude speed limit ceiling, in feet indicated altitude. */
  fmsSpeedClimbAltitudeCeiling: number;

  /** The FMS climb phase altitude speed limit, in knots. */
  fmsSpeedClimbAltitudeLimit: number;

  /** The FMS descent phase altitude speed limit ceiling, in feet indicated altitude. */
  fmsSpeedDescentAltitudeCeiling: number;

  /** The FMS descent phase altitude speed limit, in knots. */
  fmsSpeedDescentAltitudeLimit: number;

  /** The FMS departure terminal area speed limit ceiling, in feet AGL. */
  fmsSpeedDepartureCeiling: number;

  /** The FMS departure terminal area speed limit radius, in nautical miles. */
  fmsSpeedDepartureRadius: number;

  /** The FMS departure terminal area speed limit, in knots. */
  fmsSpeedDepartureLimit: number;

  /** The FMS arrival terminal area speed limit ceiling, in feet AGL. */
  fmsSpeedArrivalCeiling: number;

  /** The FMS arrival terminal area speed limit radius, in nautical miles. */
  fmsSpeedArrivalRadius: number;

  /** The FMS arrival terminal area speed limit, in knots. */
  fmsSpeedArrivalLimit: number;

  /** The user-defined FMS target indicated airspeed override, in knots. */
  fmsSpeedUserTargetIas: number;

  /** The user-defined FMS target mach number override. */
  fmsSpeedUserTargetMach: number;

  /** Whether the user-defined FMS target override is a mach number. */
  fmsSpeedUserTargetIsMach: boolean;
};

/**
 * A manager for FMS speed user settings.
 */
export class FmsSpeedUserSettingManager implements UserSettingManager<FmsSpeedUserSettingTypes> {
  /** Definitions for aircraft configuration speed limits, in order from highest to lowest speed. */
  public readonly configurationSpeedDefinitions: readonly Readonly<FmsConfigurationSpeedDefinition>[];

  public readonly climbSchedules: readonly Readonly<FmsSpeedClimbSchedule>[];
  public readonly cruiseSchedules: readonly Readonly<FmsSpeedCruiseSchedule>[];
  public readonly descentSchedules: readonly Readonly<FmsSpeedDescentSchedule>[];

  private readonly manager: DefaultUserSettingManager<FmsSpeedUserSettingTypes>;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param fmsSpeedsConfig Definitions for each aircraft configuration speed limit for which to create
   * a setting.
   */
  constructor(bus: EventBus, fmsSpeedsConfig: FmsSpeedsConfig) {
    const minIas = fmsSpeedsConfig.generalLimits.minimumIas;
    const maxIas = fmsSpeedsConfig.generalLimits.maximumIas;
    const minMach = fmsSpeedsConfig.generalLimits.minimumMach;
    const maxMach = fmsSpeedsConfig.generalLimits.maximumMach;

    this.configurationSpeedDefinitions = Array.from(fmsSpeedsConfig.configurationSpeeds);

    // Get default climb/cruise/descent schedule values.

    let defaultClimbScheduleIndex = 0;
    let defaultClimbIas = 0.25 * minIas + 0.75 * maxIas;
    let defaultClimbMach = 0.25 * minMach + 0.75 * maxMach;

    let defaultCruiseScheduleIndex = 0;
    let defaultCruiseIas = 0.5 * minIas + 0.5 * maxIas;
    let defaultCruiseMach = 0.1 * minMach + 0.9 * maxMach;

    let defaultDescentScheduleIndex = 0;
    let defaultDescentIas = 0.25 * minIas + 0.75 * maxIas;
    let defaultDescentMach = 0.25 * minMach + 0.75 * maxMach;
    let defaultDescentFpa = -3;

    this.climbSchedules = [
      { type: 'climb', name: '', ias: defaultClimbIas, mach: defaultClimbMach, isDefault: false },
      ...fmsSpeedsConfig.climbSchedules,
      { type: 'climb', name: 'Pilot-Defined Climb', ias: 0, mach: 0, isDefault: false }
    ];
    this.cruiseSchedules = [
      { type: 'cruise', name: '', ias: defaultCruiseIas, mach: defaultCruiseMach, isDefault: false },
      ...fmsSpeedsConfig.cruiseSchedules,
      { type: 'cruise', name: 'Pilot-Defined Cruise', ias: 0, mach: 0, isDefault: false }
    ];
    this.descentSchedules = [
      { type: 'descent', name: '', ias: defaultDescentIas, mach: defaultDescentMach, fpa: -3, isDefault: false },
      ...fmsSpeedsConfig.descentSchedules,
      { type: 'descent', name: 'Pilot-Defined Descent', ias: 0, mach: 0, fpa: 0, isDefault: false }
    ];

    defaultClimbScheduleIndex = this.climbSchedules.findIndex(schedule => schedule.isDefault);
    if (defaultClimbScheduleIndex >= 0) {
      const defaultClimbSchedule = this.climbSchedules[defaultClimbScheduleIndex];
      defaultClimbIas = defaultClimbSchedule.ias;
      defaultClimbMach = defaultClimbSchedule.mach;
    }

    defaultCruiseScheduleIndex = this.cruiseSchedules.findIndex(schedule => schedule.isDefault);
    if (defaultCruiseScheduleIndex >= 0) {
      const defaultCruiseSchedule = this.cruiseSchedules[defaultCruiseScheduleIndex];
      defaultCruiseIas = defaultCruiseSchedule.ias;
      defaultCruiseMach = defaultCruiseSchedule.mach;
    }

    defaultDescentScheduleIndex = this.descentSchedules.findIndex(schedule => schedule.isDefault);
    if (defaultDescentScheduleIndex >= 0) {
      const defaultDescentSchedule = this.descentSchedules[defaultDescentScheduleIndex];
      defaultDescentIas = defaultDescentSchedule.ias;
      defaultDescentMach = defaultDescentSchedule.mach;
      defaultDescentFpa = defaultDescentSchedule.fpa;
    }

    // Init setting definitions.

    const settingDefs: UserSettingDefinition<any>[] = [
      // ---- Configuration limits ----

      ...this.configurationSpeedDefinitions.map((def, index) => {
        return {
          name: `fmsSpeedConfigurationLimit_${index}`,
          defaultValue: def.defaultValue
        };
      }),

      // ---- Climb schedule ----

      {
        name: 'fmsSpeedClimbScheduleIndex',
        defaultValue: defaultClimbScheduleIndex
      },
      {
        name: 'fmsSpeedClimbIas',
        defaultValue: defaultClimbIas
      },
      {
        name: 'fmsSpeedClimbMach',
        defaultValue: defaultClimbMach
      },
      {
        name: 'fmsSpeedPilotClimbIas',
        defaultValue: defaultClimbIas
      },
      {
        name: 'fmsSpeedPilotClimbMach',
        defaultValue: defaultClimbMach
      },

      // ---- Cruise schedule ---

      {
        name: 'fmsSpeedCruiseScheduleIndex',
        defaultValue: defaultClimbScheduleIndex
      },
      {
        name: 'fmsSpeedCruiseIas',
        defaultValue: defaultCruiseIas
      },
      {
        name: 'fmsSpeedCruiseMach',
        defaultValue: defaultCruiseMach
      },
      {
        name: 'fmsSpeedPilotCruiseIas',
        defaultValue: defaultCruiseIas
      },
      {
        name: 'fmsSpeedPilotCruiseMach',
        defaultValue: defaultCruiseMach
      },

      // ---- Descent schedule ---

      {
        name: 'fmsSpeedDescentScheduleIndex',
        defaultValue: defaultClimbScheduleIndex
      },
      {
        name: 'fmsSpeedDescentIas',
        defaultValue: defaultDescentIas
      },
      {
        name: 'fmsSpeedDescentMach',
        defaultValue: defaultDescentMach
      },
      {
        name: 'fmsSpeedDescentFpa',
        defaultValue: defaultDescentFpa
      },
      {
        name: 'fmsSpeedPilotDescentIas',
        defaultValue: defaultDescentIas
      },
      {
        name: 'fmsSpeedPilotDescentMach',
        defaultValue: defaultDescentMach
      },
      {
        name: 'fmsSpeedPilotDescentFpa',
        defaultValue: defaultDescentFpa
      },

      // ---- Altitude speed limits ---

      {
        name: 'fmsSpeedClimbAltitudeCeiling',
        defaultValue: 10000
      },
      {
        name: 'fmsSpeedClimbAltitudeLimit',
        defaultValue: MathUtils.clamp(250, minIas, maxIas)
      },
      {
        name: 'fmsSpeedDescentAltitudeCeiling',
        defaultValue: 10000
      },
      {
        name: 'fmsSpeedDescentAltitudeLimit',
        defaultValue: MathUtils.clamp(250, minIas, maxIas)
      },

      // ---- Terminal area speed limits ---

      {
        name: 'fmsSpeedDepartureCeiling',
        defaultValue: 2500
      },
      {
        name: 'fmsSpeedDepartureRadius',
        defaultValue: 4
      },
      {
        name: 'fmsSpeedDepartureLimit',
        defaultValue: MathUtils.clamp(200, minIas, maxIas)
      },
      {
        name: 'fmsSpeedArrivalCeiling',
        defaultValue: 3000
      },
      {
        name: 'fmsSpeedArrivalRadius',
        defaultValue: 10
      },
      {
        name: 'fmsSpeedArrivalLimit',
        defaultValue: MathUtils.clamp(200, minIas, maxIas)
      },

      // ---- User speed override ---

      {
        name: 'fmsSpeedUserTargetIas',
        defaultValue: -1
      },
      {
        name: 'fmsSpeedUserTargetMach',
        defaultValue: -1
      },
      {
        name: 'fmsSpeedUserTargetIsMach',
        defaultValue: false
      }
    ];

    this.manager = new DefaultUserSettingManager(bus, settingDefs);
  }

  /** @inheritdoc */
  public tryGetSetting<K extends string>(name: K): K extends keyof FmsSpeedUserSettingTypes ? UserSetting<FmsSpeedUserSettingTypes[K]> : undefined {
    return this.manager.tryGetSetting(name) as any;
  }

  /** @inheritdoc */
  public getSetting<K extends keyof FmsSpeedUserSettingTypes & string>(name: K): UserSetting<NonNullable<FmsSpeedUserSettingTypes[K]>> {
    return this.manager.getSetting(name);
  }

  /** @inheritdoc */
  public whenSettingChanged<K extends keyof FmsSpeedUserSettingTypes & string>(name: K): Consumer<NonNullable<FmsSpeedUserSettingTypes[K]>> {
    return this.manager.whenSettingChanged(name);
  }

  /** @inheritdoc */
  public getAllSettings(): UserSetting<UserSettingValue>[] {
    return this.manager.getAllSettings();
  }

  /** @inheritdoc */
  public mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, FmsSpeedUserSettingTypes>): UserSettingManager<M & FmsSpeedUserSettingTypes> {
    return this.manager.mapTo(map);
  }
}
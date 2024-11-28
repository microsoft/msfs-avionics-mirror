import { DurationDisplayDelim, DurationDisplayFormat, NumberFormatter, UnitType, UserSettingManager } from '@microsoft/msfs-sdk';

import {
  DateTimeFormatSettingMode, DateTimeUserSettingTypes, NavDataFieldBearingRenderer, NavDataFieldDurationRenderer, NavDataFieldNumberUnitRenderer,
  NavDataFieldTextRenderer, NavDataFieldTextRendererOptions, NavDataFieldTimeRenderer, NavDataFieldType, TimeDisplayFormat,
  UnitsUserSettingManager
} from '@microsoft/msfs-garminsdk';

import { G3XBearingDisplay } from '../Common/G3XBearingDisplay';
import { G3XNumberUnitDisplay } from '../Common/G3XNumberUnitDisplay';
import { G3XTimeDisplay } from '../Common/G3XTimeDisplay';

/**
 * A utility class for working with formatting options for G3X Touch navigation data fields.
 */
export class G3XNavDataFieldFormatting {
  public static readonly ALTITUDE_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '____' });
  public static readonly ANGLE_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });
  public static readonly BEARING_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' });
  public static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3, forceDecimalZeroes: true, nanString: '__._' });
  public static readonly FUEL_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });
  public static readonly FUEL_ECON_FORMATTER = NumberFormatter.create({ precision: 0.1, nanString: '__._' });
  public static readonly ISA_FORMATTER = NumberFormatter.create({ precision: 1, forceSign: true, nanString: '___' });
  public static readonly CLIMB_GRADIENT_FORMATTER = NumberFormatter.create({ precision: 0.1, nanString: '_._' });
  public static readonly SPEED_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });
  public static readonly VERTICAL_SPEED_FORMATTER = NumberFormatter.create({ precision: 1, hideSign: true, nanString: '____' });
  public static readonly TEMPERATURE_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });
  public static readonly MACH_FORMATTER = NumberFormatter.create({ precision: 0.01, forceDecimalZeroes: true, nanString: '_.__' });
  public static readonly G_FORCE_FORMATTER = NumberFormatter.create({ precision: 0.01, forceDecimalZeroes: true, nanString: '_.__' });
  public static readonly DURATION_OPTIONS = {
    pad: 0,
    format: DurationDisplayFormat.hh_mm_or_mm_ss,
    delim: DurationDisplayDelim.ColonOrCross,
    nanString: '__:__'
  } as const;
  public static readonly FORMAT_SETTING_MAP = {
    [DateTimeFormatSettingMode.Local12]: TimeDisplayFormat.Local12,
    [DateTimeFormatSettingMode.Local24]: TimeDisplayFormat.Local24,
    [DateTimeFormatSettingMode.UTC]: TimeDisplayFormat.UTC
  } as const;
}

/**
 * Renders G3X Touch Above Ground Level navigation data fields.
 */
export class G3XNavDataFieldAglRenderer extends NavDataFieldNumberUnitRenderer<NavDataFieldType.AboveGroundLevel> {
  /**
   * Creates a new instance of NextGenNavDataFieldAglRenderer.
   * @param unitSettingManager A manager for display units user settings.
   */
  public constructor(unitSettingManager: UnitsUserSettingManager) {
    super({
      title: 'AGL',
      displayUnit: unitSettingManager.altitudeUnits,
      formatter: G3XNavDataFieldFormatting.ALTITUDE_FORMATTER,
      unitFormatter: G3XNumberUnitDisplay.DEFAULT_G3X_UNIT_FORMATTER,
      class: 'nav-data-field-gps'
    });
  }
}

/**
 * Renders G3X Touch Bearing to Waypoint navigation data fields.
 */
export class G3XNavDataFieldBrgRenderer extends NavDataFieldBearingRenderer<NavDataFieldType.BearingToWaypoint> {
  /**
   * Creates a new instance of G3XNavDataFieldBrgRenderer.
   * @param unitSettingManager A manager for display units user settings.
   */
  public constructor(unitSettingManager: UnitsUserSettingManager) {
    super({
      title: 'BRG',
      displayUnit: unitSettingManager.navAngleUnits,
      formatter: G3XNavDataFieldFormatting.BEARING_FORMATTER,
      unitFormatter: G3XBearingDisplay.DEFAULT_G3X_UNIT_FORMATTER,
      class: 'nav-data-field-gps'
    });
  }
}

/**
 * Renders G3X Touch Cabin Altitude data fields.
 */
export class G3XNavDataFieldCabinAltitudeRenderer extends NavDataFieldNumberUnitRenderer<NavDataFieldType.CabinAltitude> {
  /**
   * Creates a new instance of G3XNavDataFieldCabinAltitudeRenderer.
   * @param unitSettingManager A manager for display units user settings.
   */
  public constructor(unitSettingManager: UnitsUserSettingManager) {
    super({
      title: 'Cabin',
      displayUnit: unitSettingManager.altitudeUnits,
      formatter: G3XNavDataFieldFormatting.ALTITUDE_FORMATTER,
      unitFormatter: G3XNumberUnitDisplay.DEFAULT_G3X_UNIT_FORMATTER,
      class: 'nav-data-field-magenta'
    });
  }
}

/**
 * Renders G3X Touch Climb Gradient data fields.
 */
export class G3XNavDataFieldClgRenderer extends NavDataFieldTextRenderer<NavDataFieldType.ClimbGradient> {
  private static readonly OPTIONS: NavDataFieldTextRendererOptions<number> = {
    title: 'CLG',
    formatter: value => `${G3XNavDataFieldFormatting.CLIMB_GRADIENT_FORMATTER(value)}%`,
    class: 'nav-data-field-gps'
  };

  /**
   * Creates a new instance of G3XNavDataFieldClimbGradientRenderer.
   */
  public constructor() {
    super(G3XNavDataFieldClgRenderer.OPTIONS);
  }
}

/**
 * Renders G3X Touch Climb Gradient Per Nautical Mile data fields.
 */
export class G3XNavDataFieldClmRenderer extends NavDataFieldNumberUnitRenderer<NavDataFieldType.ClimbGradientPerDistance> {
  /**
   * Creates a new instance of NextGenNavDataFieldClmRenderer.
   * @param unitSettingManager A manager for display units user settings.
   */
  // TODO: Figure out if/how the displayed unit can change.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public constructor(unitSettingManager: UnitsUserSettingManager) {
    super({
      title: 'CLM',
      displayUnit: UnitType.FOOT_PER_NMILE,
      formatter: G3XNavDataFieldFormatting.ALTITUDE_FORMATTER,
      class: 'nav-data-field-gps nav-data-field-unit-vertical nav-data-field-clm'
    });
  }
}

/**
 * Renders G3X Touch Density Altitude data fields.
 */
export class G3XNavDataFieldDensityAltitudeRenderer extends NavDataFieldNumberUnitRenderer<NavDataFieldType.DensityAltitude> {
  /**
   * Creates a new instance of NextGenNavDataFieldDensityAltitudeRenderer.
   * @param unitSettingManager A manager for display units user settings.
   */
  public constructor(unitSettingManager: UnitsUserSettingManager) {
    super({
      title: 'DA',
      displayUnit: unitSettingManager.altitudeUnits,
      formatter: G3XNavDataFieldFormatting.ALTITUDE_FORMATTER,
      unitFormatter: G3XNumberUnitDisplay.DEFAULT_G3X_UNIT_FORMATTER,
      class: 'nav-data-field-magenta'
    });
  }
}

/**
 * Renders G3X Touch Distance to Waypoint navigation data fields.
 */
export class G3XNavDataFieldDistRenderer extends NavDataFieldNumberUnitRenderer<NavDataFieldType.DistanceToWaypoint> {
  /**
   * Creates a new instance of G3XNavDataFieldDistRenderer.
   * @param unitSettingManager A manager for display units user settings.
   */
  public constructor(unitSettingManager: UnitsUserSettingManager) {
    super({
      title: 'DIST',
      displayUnit: unitSettingManager.distanceUnitsLarge,
      formatter: G3XNavDataFieldFormatting.DISTANCE_FORMATTER,
      unitFormatter: G3XNumberUnitDisplay.DEFAULT_G3X_UNIT_FORMATTER,
      class: 'nav-data-field-gps'
    });
  }
}

/**
 * Renders G3X Touch Distance to Destination navigation data fields.
 */
export class G3XNavDataFieldDistdRenderer extends NavDataFieldNumberUnitRenderer<NavDataFieldType.DistanceToDestination> {
  /**
   * Creates a new instance of G3XNavDataFieldDistdRenderer.
   * @param unitSettingManager A manager for display units user settings.
   */
  public constructor(unitSettingManager: UnitsUserSettingManager) {
    super({
      title: 'DISTD',
      displayUnit: unitSettingManager.distanceUnitsLarge,
      formatter: G3XNavDataFieldFormatting.DISTANCE_FORMATTER,
      unitFormatter: G3XNumberUnitDisplay.DEFAULT_G3X_UNIT_FORMATTER,
      class: 'nav-data-field-gps'
    });
  }
}

/**
 * Renders G3X Touch Desired Track navigation data fields.
 */
export class G3XNavDataFieldDtkRenderer extends NavDataFieldBearingRenderer<NavDataFieldType.DesiredTrack> {
  /**
   * Creates a new instance of G3XNavDataFieldDtkRenderer.
   * @param unitSettingManager A manager for display units user settings.
   */
  public constructor(unitSettingManager: UnitsUserSettingManager) {
    super({
      title: 'DTK',
      displayUnit: unitSettingManager.navAngleUnits,
      formatter: G3XNavDataFieldFormatting.BEARING_FORMATTER,
      unitFormatter: G3XBearingDisplay.DEFAULT_G3X_UNIT_FORMATTER,
      class: 'nav-data-field-gps'
    });
  }
}

/**
 * Renders G3X Touch Fuel Economy navigation data fields.
 */
export class G3XNavDataFieldEcoRenderer extends NavDataFieldNumberUnitRenderer<NavDataFieldType.FuelEconomy> {
  /**
   * Creates a new instance of G3XNavDataFieldEcoRenderer.
   * @param unitSettingManager A manager for display units user settings.
   */
  // TODO: Figure out if/how the displayed unit can change.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public constructor(unitSettingManager: UnitsUserSettingManager) {
    super({
      title: 'ECO',
      displayUnit: UnitType.NMILE_PER_GALLON_FUEL,
      formatter: G3XNavDataFieldFormatting.FUEL_ECON_FORMATTER,
      class: 'nav-data-field-gps nav-data-field-unit-vertical nav-data-field-eco'
    });
  }
}

/**
 * Renders G3X Touch Fuel Endurance navigation data fields.
 */
export class G3XNavDataFieldEdrRenderer extends NavDataFieldDurationRenderer<NavDataFieldType.Endurance> {
  /**
   * Creates a new instance of G3XNavDataFieldEdrRenderer.
   */
  public constructor() {
    super({
      title: 'EDR',
      options: G3XNavDataFieldFormatting.DURATION_OPTIONS,
      class: 'nav-data-field-magenta'
    });
  }
}

/**
 * Renders G3X Touch Estimated Time of Arrival navigation data fields.
 */
export class G3XNavDataFieldEtaRenderer extends NavDataFieldTimeRenderer<NavDataFieldType.TimeOfWaypointArrival> {
  /**
   * Creates a new instance of G3XNavDataFieldEtaRenderer.
   * @param dateTimeSettingManager A manager for date/time user settings.
   */
  public constructor(dateTimeSettingManager: UserSettingManager<DateTimeUserSettingTypes>) {
    super({
      title: 'ETA',
      format: dateTimeSettingManager.getSetting('dateTimeFormat').map(setting => G3XNavDataFieldFormatting.FORMAT_SETTING_MAP[setting] ?? TimeDisplayFormat.UTC),
      localOffset: dateTimeSettingManager.getSetting('dateTimeLocalOffset'),
      suffixFormatter: G3XTimeDisplay.DEFAULT_VERTICAL_SUFFIX_FORMATTER.bind(undefined, false),
      class: 'nav-data-field-gps'
    });
  }
}

/**
 * Renders G3X Touch Estimated Time of Arrival at Destination navigation data fields.
 */
export class G3XNavDataFieldEtadRenderer extends NavDataFieldTimeRenderer<NavDataFieldType.TimeOfDestinationArrival> {
  /**
   * Creates a new instance of G3XNavDataFieldEtadRenderer.
   * @param dateTimeSettingManager A manager for date/time user settings.
   */
  public constructor(dateTimeSettingManager: UserSettingManager<DateTimeUserSettingTypes>) {
    super({
      title: 'ETAD',
      format: dateTimeSettingManager.getSetting('dateTimeFormat').map(setting => G3XNavDataFieldFormatting.FORMAT_SETTING_MAP[setting] ?? TimeDisplayFormat.UTC),
      localOffset: dateTimeSettingManager.getSetting('dateTimeLocalOffset'),
      suffixFormatter: G3XTimeDisplay.DEFAULT_VERTICAL_SUFFIX_FORMATTER.bind(undefined, false),
      class: 'nav-data-field-gps'
    });
  }
}

/**
 * Renders G3X Touch Time to Waypoint navigation data fields.
 */
export class G3XNavDataFieldEteRenderer extends NavDataFieldDurationRenderer<NavDataFieldType.TimeToWaypoint> {
  /**
   * Creates a new instance of G3XNavDataFieldEteRenderer.
   */
  public constructor() {
    super({
      title: 'ETE',
      options: G3XNavDataFieldFormatting.DURATION_OPTIONS,
      class: 'nav-data-field-gps'
    });
  }
}

/**
 * Renders G3X Touch Time to Destination navigation data fields.
 */
export class G3XNavDataFieldEtedRenderer extends NavDataFieldDurationRenderer<NavDataFieldType.TimeToDestination> {
  /**
   * Creates a new instance of G3XNavDataFieldEtedRenderer.
   */
  public constructor() {
    super({
      title: 'ETED',
      options: G3XNavDataFieldFormatting.DURATION_OPTIONS,
      class: 'nav-data-field-gps'
    });
  }
}

/**
 * Renders G3X Touch Flight level data fields.
 */
export class G3XNavDataFieldFlightLevelRenderer extends NavDataFieldNumberUnitRenderer<NavDataFieldType.FlightLevel> {
  /**
   * Creates a new instance of NextGenNavDataFieldFlightLevelRenderer.
   * @param unitSettingManager A manager for display units user settings.
   */
  public constructor(unitSettingManager: UnitsUserSettingManager) {
    super({
      title: 'FL',
      displayUnit: unitSettingManager.altitudeUnits,
      formatter: G3XNavDataFieldFormatting.ALTITUDE_FORMATTER,
      unitFormatter: G3XNumberUnitDisplay.DEFAULT_G3X_UNIT_FORMATTER,
      class: 'nav-data-field-magenta'
    });
  }
}

/**
 * Renders G3X Touch Fuel Flow data fields.
 */
export class G3XNavDataFieldFuelFlowRenderer extends NavDataFieldNumberUnitRenderer<NavDataFieldType.FuelFlow> {
  /**
   * Creates a new instance of NextGenNavDataFieldFuelFlowRenderer.
   * @param unitSettingManager A manager for display units user settings.
   */
  public constructor(unitSettingManager: UnitsUserSettingManager) {
    super({
      title: 'FF',
      displayUnit: unitSettingManager.fuelFlowUnits,
      formatter: G3XNavDataFieldFormatting.FUEL_FORMATTER,
      unitFormatter: G3XNumberUnitDisplay.DEFAULT_G3X_UNIT_FORMATTER,
      class: 'nav-data-field-magenta'
    });
  }
}

/**
 * Renders G3X Touch Fuel Over Destination data fields.
 */
export class G3XNavDataFieldFodRenderer extends NavDataFieldNumberUnitRenderer<NavDataFieldType.FuelOverDestination> {
  /**
   * Creates a new instance of G3XNavDataFieldFodRenderer.
   * @param unitSettingManager A manager for display units user settings.
   */
  public constructor(unitSettingManager: UnitsUserSettingManager) {
    super({
      title: 'FOD',
      displayUnit: unitSettingManager.fuelUnits,
      formatter: G3XNavDataFieldFormatting.FUEL_FORMATTER,
      unitFormatter: G3XNumberUnitDisplay.DEFAULT_G3X_UNIT_FORMATTER,
      class: 'nav-data-field-gps'
    });
  }
}

/**
 * Renders G3X Touch G-Meter fields.
 */
export class G3XNavDataFieldGMeterRenderer extends NavDataFieldTextRenderer<NavDataFieldType.GMeter> {
  private static readonly OPTIONS: NavDataFieldTextRendererOptions<number> = {
    title: 'G',
    formatter: G3XNavDataFieldFormatting.G_FORCE_FORMATTER,
    class: 'nav-data-field-magenta'
  };

  /**
   * Creates a new instance of G3XNavDataFieldGMeterRenderer.
   */
  public constructor() {
    super(G3XNavDataFieldGMeterRenderer.OPTIONS);
  }
}

/**
 * Renders G3X Touch GPS Altitude data fields.
 */
export class G3XNavDataFieldGpsAltitudeRenderer extends NavDataFieldNumberUnitRenderer<NavDataFieldType.GpsAltitude> {
  /**
   * Creates a new instance of NextGenNavDataFieldGPSAltitudeRenderer.
   * @param unitSettingManager A manager for display units user settings.
   */
  public constructor(unitSettingManager: UnitsUserSettingManager) {
    super({
      title: 'GPS ALT',
      displayUnit: unitSettingManager.altitudeUnits,
      formatter: G3XNavDataFieldFormatting.ALTITUDE_FORMATTER,
      unitFormatter: G3XNumberUnitDisplay.DEFAULT_G3X_UNIT_FORMATTER,
      class: 'nav-data-field-gps'
    });
  }
}

/**
 * Renders G3X Touch Ground Speed navigation data fields.
 */
export class G3XNavDataFieldGsRenderer extends NavDataFieldNumberUnitRenderer<NavDataFieldType.GroundSpeed> {
  /**
   * Creates a new instance of G3XNavDataFieldGsRenderer.
   * @param unitSettingManager A manager for display units user settings.
   */
  public constructor(unitSettingManager: UnitsUserSettingManager) {
    super({
      title: 'GS',
      displayUnit: unitSettingManager.speedUnits,
      formatter: G3XNavDataFieldFormatting.SPEED_FORMATTER,
      unitFormatter: G3XNumberUnitDisplay.DEFAULT_G3X_UNIT_FORMATTER,
      class: 'nav-data-field-gps'
    });
  }
}

/**
 * Renders G3X Touch ISA navigation data fields.
 */
export class G3XNavDataFieldIsaRenderer extends NavDataFieldNumberUnitRenderer<NavDataFieldType.ISA> {
  /**
   * Creates a new instance of G3XNavDataFieldIsaRenderer.
   * @param unitSettingManager A manager for display units user settings.
   */
  public constructor(unitSettingManager: UnitsUserSettingManager) {
    super({
      title: 'ISA',
      displayUnit: unitSettingManager.temperatureDeltaUnits,
      formatter: G3XNavDataFieldFormatting.ISA_FORMATTER,
      unitFormatter: G3XNumberUnitDisplay.DEFAULT_G3X_UNIT_FORMATTER,
      class: 'nav-data-field-magenta'
    });
  }
}

/**
 * Renders G3X Touch Local Time navigation data fields.
 */
export class G3XNavDataFieldLclRenderer extends NavDataFieldTimeRenderer<NavDataFieldType.LocalTime> {
  /**
   * Creates a new instance of NextGenNavDataFieldGPSAltitudeRenderer.
   * @param dateTimeSettingManager A manager for date/time user settings.
   */
  public constructor(dateTimeSettingManager: UserSettingManager<DateTimeUserSettingTypes>) {
    super({
      title: 'LCL',
      format: dateTimeSettingManager.getSetting('dateTimeFormat').map(setting => {
        return setting === DateTimeFormatSettingMode.Local12 ? TimeDisplayFormat.Local12 : TimeDisplayFormat.Local24;
      }),
      localOffset: dateTimeSettingManager.getSetting('dateTimeLocalOffset'),
      suffixFormatter: G3XTimeDisplay.DEFAULT_VERTICAL_SUFFIX_FORMATTER.bind(undefined, true),
      class: 'nav-data-field-magenta'
    });
  }
}

/**
 * Renders G3X Touch Mach Number data fields.
 */
export class G3XNavDataFieldMachRenderer extends NavDataFieldTextRenderer<NavDataFieldType.MachNumber> {
  private static readonly OPTIONS: NavDataFieldTextRendererOptions<number> = {
    title: 'MACH',
    formatter: G3XNavDataFieldFormatting.MACH_FORMATTER,
    class: 'nav-data-field-magenta'
  };

  /**
   * Creates a new instance of G3XNavDataFieldMachNumberRenderer.
   */
  public constructor() {
    super(G3XNavDataFieldMachRenderer.OPTIONS);
  }
}

/**
 * Renders G3X Touch Outside temperature data fields.
 */
export class G3XNavDataFieldOatRenderer extends NavDataFieldNumberUnitRenderer<NavDataFieldType.OutsideTemperature> {
  /**
   * Creates a new instance of G3XNavDataFieldOatRenderer.
   * @param unitSettingManager A manager for display units user settings.
   */
  public constructor(unitSettingManager: UnitsUserSettingManager) {
    super({
      title: 'OAT',
      displayUnit: unitSettingManager.temperatureUnits,
      formatter: G3XNavDataFieldFormatting.TEMPERATURE_FORMATTER,
      unitFormatter: G3XNumberUnitDisplay.DEFAULT_G3X_UNIT_FORMATTER,
      class: 'nav-data-field-magenta'
    });
  }
}

/**
 * Renders G3X Touch Ram Air Temperature data fields.
 */
export class G3XNavDataFieldRatRenderer extends NavDataFieldNumberUnitRenderer<NavDataFieldType.RamAirTemperature> {
  /**
   * Creates a new instance of G3XNavDataFieldRatRenderer.
   * @param unitSettingManager A manager for display units user settings.
   */
  public constructor(unitSettingManager: UnitsUserSettingManager) {
    super({
      title: 'RAT',
      displayUnit: unitSettingManager.temperatureUnits,
      formatter: G3XNavDataFieldFormatting.TEMPERATURE_FORMATTER,
      unitFormatter: G3XNumberUnitDisplay.DEFAULT_G3X_UNIT_FORMATTER,
      class: 'nav-data-field-magenta'
    });
  }
}

/**
 * Renders G3X Touch Fuel Remaining data fields.
 */
export class G3XNavDataFieldRemRenderer extends NavDataFieldNumberUnitRenderer<NavDataFieldType.FuelOnBoard> {
  /**
   * Creates a new instance of G3XNavDataFieldRemRenderer.
   * @param unitSettingManager A manager for display units user settings.
   */
  public constructor(unitSettingManager: UnitsUserSettingManager) {
    super({
      title: 'REM',
      displayUnit: unitSettingManager.fuelUnits,
      formatter: G3XNavDataFieldFormatting.FUEL_FORMATTER,
      unitFormatter: G3XNumberUnitDisplay.DEFAULT_G3X_UNIT_FORMATTER,
      class: 'nav-data-field-magenta'
    });
  }
}

/**
 * Renders G3X Touch True Airspeed navigation data fields.
 */
export class G3XNavDataFieldTasRenderer extends NavDataFieldNumberUnitRenderer<NavDataFieldType.TrueAirspeed> {
  /**
   * Creates a new instance of G3XNavDataFieldTasRenderer.
   * @param unitSettingManager A manager for display units user settings.
   */
  public constructor(unitSettingManager: UnitsUserSettingManager) {
    super({
      title: 'TAS',
      displayUnit: unitSettingManager.speedUnits,
      formatter: G3XNavDataFieldFormatting.SPEED_FORMATTER,
      unitFormatter: G3XNumberUnitDisplay.DEFAULT_G3X_UNIT_FORMATTER,
      class: 'nav-data-field-magenta'
    });
  }
}

/**
 * Renders G3X Touch Ground Track navigation data fields.
 */
export class G3XNavDataFieldTrkRenderer extends NavDataFieldBearingRenderer<NavDataFieldType.GroundTrack> {
  /**
   * Creates a new instance of G3XNavDataFieldTrkRenderer.
   * @param unitSettingManager A manager for display units user settings.
   */
  public constructor(unitSettingManager: UnitsUserSettingManager) {
    super({
      title: 'TRK',
      displayUnit: unitSettingManager.navAngleUnits,
      formatter: G3XNavDataFieldFormatting.BEARING_FORMATTER,
      unitFormatter: G3XBearingDisplay.DEFAULT_G3X_UNIT_FORMATTER,
      class: 'nav-data-field-gps'
    });
  }
}

/**
 * Renders G3X Touch UTC Time navigation data fields.
 */
export class G3XNavDataFieldUtcRenderer extends NavDataFieldTimeRenderer<NavDataFieldType.UtcTime> {
  /**
   * Creates a new instance of NextGenNavDataFieldUtcRenderer.
   */
  public constructor() {
    super({
      title: 'UTC',
      format: TimeDisplayFormat.UTC,
      localOffset: 0,
      suffixFormatter: G3XTimeDisplay.DEFAULT_VERTICAL_SUFFIX_FORMATTER.bind(undefined, true),
      class: 'nav-data-field-magenta'
    });
  }
}

/**
 * Renders G3X Touch Vertical Speed Required navigation data fields.
 */
export class G3XNavDataFieldVsrRenderer extends NavDataFieldNumberUnitRenderer<NavDataFieldType.VerticalSpeedRequired> {
  /**
   * Creates a new instance of G3XNavDataFieldVsrRenderer.
   * @param unitSettingManager A manager for display units user settings.
   */
  public constructor(unitSettingManager: UnitsUserSettingManager) {
    super({
      title: 'VSR',
      displayUnit: unitSettingManager.verticalSpeedUnits,
      formatter: G3XNavDataFieldFormatting.VERTICAL_SPEED_FORMATTER,
      unitFormatter: G3XNumberUnitDisplay.DEFAULT_G3X_VS_ARROW_UNIT_FORMATTER,
      hideUnitWhenNaN: true,
      class: 'nav-data-field-gps'
    });
  }
}

/**
 * Renders G3X Touch Waypoint data fields.
 */
export class G3XNavDataFieldWptRenderer extends NavDataFieldTextRenderer<NavDataFieldType.Waypoint> {
  private static readonly OPTIONS: NavDataFieldTextRendererOptions<string> = {
    title: 'WPT',
    class: 'nav-data-field-magenta'
  };

  /**
   * Creates a new instance of G3XNavDataFieldWptRenderer.
   */
  public constructor() {
    super(G3XNavDataFieldWptRenderer.OPTIONS);
  }
}

/**
 * Renders G3X Touch Cross Track navigation data fields.
 */
export class G3XNavDataFieldXtkRenderer extends NavDataFieldNumberUnitRenderer<NavDataFieldType.CrossTrack> {
  /**
   * Creates a new instance of G3XNavDataFieldXtkRenderer.
   * @param unitSettingManager A manager for display units user settings.
   */
  public constructor(unitSettingManager: UnitsUserSettingManager) {
    super({
      title: 'XTK',
      displayUnit: unitSettingManager.distanceUnitsLarge,
      formatter: G3XNavDataFieldFormatting.DISTANCE_FORMATTER,
      unitFormatter: G3XNumberUnitDisplay.DEFAULT_G3X_UNIT_FORMATTER,
      class: 'nav-data-field-gps'
    });
  }
}
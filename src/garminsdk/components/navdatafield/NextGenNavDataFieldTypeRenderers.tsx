import {
  DurationDisplayDelim, DurationDisplayFormat, NavAngleUnit, NavAngleUnitFamily,
  NumberFormatter, NumberUnitInterface, Subject, UnitFamily, UnitType, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { DateTimeFormatSettingMode, DateTimeUserSettingTypes } from '../../settings/DateTimeUserSettings';
import { UnitsUserSettingManager } from '../../settings/UnitsUserSettings';
import { TimeDisplayFormat } from '../common/TimeDisplay';
import { NavDataFieldModel } from './NavDataFieldModel';
import { NavDataFieldTypeRenderer } from './NavDataFieldRenderer';
import { NavDataFieldType, NavDataFieldTypeModelMap } from './NavDataFieldType';
import {
  NavDataFieldBearingRenderer, NavDataFieldDurationRenderer, NavDataFieldNumberUnitRenderer, NavDataFieldTextRenderer,
  NavDataFieldTimeRenderer
} from './NavDataFieldTypeRenderers';

/**
 * An abstract next-generation (NXi, G3000, etc) implementation of {@link NavDataFieldTypeRenderer} which supports
 * display unit settings.
 */
export abstract class NextGenDisplayUnitNavDataFieldTypeRenderer<T extends NavDataFieldType> implements NavDataFieldTypeRenderer<T> {
  protected static readonly ALTITUDE_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '____' });
  protected static readonly ANGLE_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });
  protected static readonly BEARING_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' });
  protected static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3, forceDecimalZeroes: true, nanString: '__._' });
  protected static readonly FUEL_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });
  protected static readonly ISA_FORMATTER = NumberFormatter.create({ precision: 1, forceSign: true, nanString: '___' });
  protected static readonly SPEED_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });
  protected static readonly TEMPERATURE_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });
  protected static readonly DURATION_OPTIONS = {
    pad: 0,
    format: DurationDisplayFormat.hh_mm_or_mm_ss,
    delim: DurationDisplayDelim.ColonOrCross,
    nanString: '__:__'
  };

  /**
   * Constructor.
   * @param unitsSettingManager A user setting manager for measurement units.
   */
  constructor(protected readonly unitsSettingManager: UnitsUserSettingManager) {
  }

  /** @inheritdoc */
  public abstract render(model: NavDataFieldTypeModelMap[T]): VNode;
}

/**
 * An abstract next-generation (NXi, G3000, etc) implementation of {@link NavDataFieldTypeRenderer} which supports
 * date/time settings.
 */
export abstract class NextGenDateTimeNavDataFieldTypeRenderer<T extends NavDataFieldType> implements NavDataFieldTypeRenderer<T> {
  protected static readonly FORMAT_SETTING_MAP = {
    [DateTimeFormatSettingMode.Local12]: TimeDisplayFormat.Local12,
    [DateTimeFormatSettingMode.Local24]: TimeDisplayFormat.Local24,
    [DateTimeFormatSettingMode.UTC]: TimeDisplayFormat.UTC
  };

  protected readonly timeFormat = this.dateTimeSettingManager.getSetting('dateTimeFormat');
  protected readonly localOffset = this.dateTimeSettingManager.getSetting('dateTimeLocalOffset');

  protected readonly timeFormatMapped = this.timeFormat.map(format => NextGenDateTimeNavDataFieldTypeRenderer.FORMAT_SETTING_MAP[format]);

  /**
   * Constructor.
   * @param dateTimeSettingManager A date/time user setting manager.
   */
  constructor(protected readonly dateTimeSettingManager: UserSettingManager<DateTimeUserSettingTypes>) {
  }

  /** @inheritdoc */
  public abstract render(model: NavDataFieldTypeModelMap[T]): VNode;
}

/**
 * Renders next-generation (NXi, G3000, etc) Bearing to Waypoint navigation data fields.
 */
export class NextGenNavDataFieldBrgRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.BearingToWaypoint> {
  private readonly renderer = new NavDataFieldBearingRenderer<NavDataFieldType.BearingToWaypoint>({
    title: 'BRG',
    displayUnit: this.unitsSettingManager.navAngleUnits,
    formatter: NextGenDisplayUnitNavDataFieldTypeRenderer.BEARING_FORMATTER,
    class: 'nav-data-field-gps'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>>): VNode {
    return this.renderer.render(model);
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Destination navigation data fields.
 */
export class NextGenNavDataFieldDestRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.Destination> {
  private readonly renderer = new NavDataFieldTextRenderer<NavDataFieldType.Destination>({
    title: 'DEST',
    class: 'nav-data-field-white'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<string>): VNode {
    return this.renderer.render(model);
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Distance to Waypoint navigation data fields.
 */
export class NextGenNavDataFieldDisRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.DistanceToWaypoint> {
  private readonly renderer = new NavDataFieldNumberUnitRenderer<NavDataFieldType.DistanceToWaypoint>({
    title: 'DIS',
    displayUnit: this.unitsSettingManager.distanceUnitsLarge,
    formatter: NextGenDisplayUnitNavDataFieldTypeRenderer.DISTANCE_FORMATTER,
    class: 'nav-data-field-gps'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Distance>>): VNode {
    return this.renderer.render(model);
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Distance to Destination navigation data fields.
 */
export class NextGenNavDataFieldDtgRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.DistanceToDestination> {
  private readonly renderer = new NavDataFieldNumberUnitRenderer<NavDataFieldType.DistanceToDestination>({
    title: 'DTG',
    displayUnit: this.unitsSettingManager.distanceUnitsLarge,
    formatter: NextGenDisplayUnitNavDataFieldTypeRenderer.DISTANCE_FORMATTER,
    class: 'nav-data-field-gps'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Distance>>): VNode {
    return this.renderer.render(model);
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Desired Track navigation data fields.
 */
export class NextGenNavDataFieldDtkRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.DesiredTrack> {
  private readonly renderer = new NavDataFieldBearingRenderer<NavDataFieldType.DesiredTrack>({
    title: 'DTK',
    displayUnit: this.unitsSettingManager.navAngleUnits,
    formatter: NextGenDisplayUnitNavDataFieldTypeRenderer.BEARING_FORMATTER,
    class: 'nav-data-field-gps'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>>): VNode {
    return this.renderer.render(model);
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Endurance navigation data fields.
 */
export class NextGenNavDataFieldEndRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.Endurance> {
  private readonly renderer = new NavDataFieldDurationRenderer<NavDataFieldType.Endurance>({
    title: 'END',
    options: NextGenDisplayUnitNavDataFieldTypeRenderer.DURATION_OPTIONS,
    class: 'nav-data-field-magenta'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Duration>>): VNode {
    return this.renderer.render(model);
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Time to Destination navigation data fields.
 */
export class NextGenNavDataFieldEnrRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.TimeToDestination> {
  private readonly renderer = new NavDataFieldDurationRenderer<NavDataFieldType.TimeToDestination>({
    title: 'ENR',
    options: NextGenDisplayUnitNavDataFieldTypeRenderer.DURATION_OPTIONS,
    class: 'nav-data-field-gps'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Duration>>): VNode {
    return this.renderer.render(model);
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Estimated Time of Arrival navigation data fields.
 */
export class NextGenNavDataFieldEtaRenderer extends NextGenDateTimeNavDataFieldTypeRenderer<NavDataFieldType.TimeOfWaypointArrival> {
  private readonly renderer = new NavDataFieldTimeRenderer<NavDataFieldType.TimeOfWaypointArrival>({
    title: 'ETA',
    format: this.timeFormatMapped,
    localOffset: this.localOffset,
    class: 'nav-data-field-gps'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<number>): VNode {
    return this.renderer.render(model);
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Time to Waypoint navigation data fields.
 */
export class NextGenNavDataFieldEteRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.TimeToWaypoint> {
  private readonly renderer = new NavDataFieldDurationRenderer<NavDataFieldType.TimeToWaypoint>({
    title: 'ETE',
    options: NextGenDisplayUnitNavDataFieldTypeRenderer.DURATION_OPTIONS,
    class: 'nav-data-field-gps'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Duration>>): VNode {
    return this.renderer.render(model);
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Fuel on Board navigation data fields.
 */
export class NextGenNavDataFieldFobRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.FuelOnBoard> {
  private readonly renderer = new NavDataFieldNumberUnitRenderer<NavDataFieldType.FuelOnBoard>({
    title: 'FOB',
    displayUnit: this.unitsSettingManager.fuelUnits,
    formatter: NextGenDisplayUnitNavDataFieldTypeRenderer.FUEL_FORMATTER,
    class: 'nav-data-field-magenta'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Weight>>): VNode {
    return this.renderer.render(model);
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Fuel Over Destination navigation data fields.
 */
export class NextGenNavDataFieldFodRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.FuelOverDestination> {
  private readonly renderer = new NavDataFieldNumberUnitRenderer<NavDataFieldType.FuelOverDestination>({
    title: 'FOD',
    displayUnit: this.unitsSettingManager.fuelUnits,
    formatter: NextGenDisplayUnitNavDataFieldTypeRenderer.FUEL_FORMATTER,
    class: 'nav-data-field-gps'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Weight>>): VNode {
    return this.renderer.render(model);
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Ground Speed navigation data fields.
 */
export class NextGenNavDataFieldGsRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.GroundSpeed> {
  private readonly renderer = new NavDataFieldNumberUnitRenderer<NavDataFieldType.GroundSpeed>({
    title: 'GS',
    displayUnit: this.unitsSettingManager.speedUnits,
    formatter: NextGenDisplayUnitNavDataFieldTypeRenderer.SPEED_FORMATTER,
    class: 'nav-data-field-gps'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Speed>>): VNode {
    return this.renderer.render(model);
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) ISA navigation data fields.
 */
export class NextGenNavDataFieldIsaRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.ISA> {
  private readonly renderer = new NavDataFieldNumberUnitRenderer<NavDataFieldType.ISA>({
    title: 'ISA',
    displayUnit: this.unitsSettingManager.temperatureDeltaUnits,
    formatter: NextGenDisplayUnitNavDataFieldTypeRenderer.ISA_FORMATTER,
    class: 'nav-data-field-white'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.TemperatureDelta>>): VNode {
    return this.renderer.render(model);
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Estimated Time of Arrival at Destination navigation data fields.
 */
export class NavDataFieldLdgRenderer extends NextGenDateTimeNavDataFieldTypeRenderer<NavDataFieldType.TimeOfDestinationArrival> {
  private readonly renderer = new NavDataFieldTimeRenderer<NavDataFieldType.TimeOfDestinationArrival>({
    title: 'LDG',
    format: this.timeFormatMapped,
    localOffset: this.localOffset,
    class: 'nav-data-field-gps'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<number>): VNode {
    return this.renderer.render(model);
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) True Airspeed navigation data fields.
 */
export class NextGenNavDataFieldTasRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.TrueAirspeed> {
  private readonly renderer = new NavDataFieldNumberUnitRenderer<NavDataFieldType.TrueAirspeed>({
    title: 'TAS',
    displayUnit: this.unitsSettingManager.speedUnits,
    formatter: NextGenDisplayUnitNavDataFieldTypeRenderer.SPEED_FORMATTER,
    class: 'nav-data-field-magenta'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Speed>>): VNode {
    return this.renderer.render(model);
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Track Angle Error navigation data fields.
 */
export class NextGenNavDataFieldTkeRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.TrackAngleError> {
  private readonly renderer = new NavDataFieldNumberUnitRenderer<NavDataFieldType.TrackAngleError>({
    title: 'TKE',
    displayUnit: Subject.create(UnitType.DEGREE),
    formatter: NextGenDisplayUnitNavDataFieldTypeRenderer.ANGLE_FORMATTER,
    class: 'nav-data-field-gps'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Angle>>): VNode {
    return this.renderer.render(model);
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Ground Track navigation data fields.
 */
export class NextGenNavDataFieldTrkRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.GroundTrack> {
  private readonly renderer = new NavDataFieldBearingRenderer<NavDataFieldType.GroundTrack>({
    title: 'TRK',
    displayUnit: this.unitsSettingManager.navAngleUnits,
    formatter: NextGenDisplayUnitNavDataFieldTypeRenderer.BEARING_FORMATTER,
    class: 'nav-data-field-gps'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>>): VNode {
    return this.renderer.render(model);
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Vertical Speed Required navigation data fields.
 */
export class NextGenNavDataFieldVsrRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.VerticalSpeedRequired> {
  private readonly renderer = new NavDataFieldNumberUnitRenderer<NavDataFieldType.VerticalSpeedRequired>({
    title: 'VSR',
    displayUnit: this.unitsSettingManager.verticalSpeedUnits,
    formatter: NextGenDisplayUnitNavDataFieldTypeRenderer.SPEED_FORMATTER,
    class: 'nav-data-field-gps'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Speed>>): VNode {
    return this.renderer.render(model);
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Cross Track navigation data fields.
 */
export class NextGenNavDataFieldXtkRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.CrossTrack> {
  private readonly renderer = new NavDataFieldNumberUnitRenderer<NavDataFieldType.CrossTrack>({
    title: 'XTK',
    displayUnit: this.unitsSettingManager.distanceUnitsLarge,
    formatter: NextGenDisplayUnitNavDataFieldTypeRenderer.DISTANCE_FORMATTER,
    class: 'nav-data-field-gps'
  });

  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Distance>>): VNode {
    return this.renderer.render(model);
  }
}
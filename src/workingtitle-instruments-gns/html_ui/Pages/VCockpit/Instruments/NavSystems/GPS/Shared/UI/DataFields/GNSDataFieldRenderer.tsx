import {
  ConsumerSubject, DurationDisplay, DurationDisplayDelim, DurationDisplayFormat, FSComponent, NavAngleUnitFamily, NumberFormatter, NumberUnitInterface,
  UnitFamily, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import {
  DateTimeFormatSettingMode, DateTimeUserSettingTypes, GenericNavDataFieldRenderer, NavDataBarFieldModel, NavDataBarFieldModelFactory,
  NavDataBarFieldTypeModelMap, NavDataFieldRenderer, NavDataFieldType, NavDataFieldTypeModelMap, NavDataFieldTypeRenderer, TimeDisplayFormat,
  UnitsUserSettingManager
} from '@microsoft/msfs-garminsdk';

import { GNSNumberUnitDisplay } from '../Controls/GNSNumberUnitDisplay';
import { GNSTimeDisplay } from '../Controls/GNSTimeDisplay';
import { FieldTypeMenuPresetEntry } from './FieldTypeMenu';
import { SelectableText } from '../Controls/SelectableText';

/**
 * An interface that describes the parts necessary to build a GNS data field.
 */
export interface DataFieldContext {
  /** The factory that generates the model of the data to display. */
  modelFactory: NavDataBarFieldModelFactory;

  /** The factory that renders the specific data type field. */
  renderer: GNSDataFieldRenderer;

  /** The field type menu entries shown when editing the field */
  fieldTypeMenuEntries: FieldTypeMenuPresetEntry[],
}

/**
 * A GNS implementation of NavDataFieldRenderer.
 */
export class GNSDataFieldRenderer implements NavDataFieldRenderer {
  private readonly renderer: GenericNavDataFieldRenderer;

  /**
   * Constructor.
   * @param unitsSettingManager A display units user setting manager.
   * @param dateTimeSettingManager A date/time user setting manager.
   */
  constructor(
    unitsSettingManager: UnitsUserSettingManager,
    dateTimeSettingManager: UserSettingManager<DateTimeUserSettingTypes>
  ) {
    this.renderer = new GenericNavDataFieldRenderer();

    this.renderer.register(NavDataFieldType.BearingToWaypoint, new GNSFieldBearingRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.Waypoint, new GNSFieldTextRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.Destination, new GNSFieldTextRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.DistanceToWaypoint, new GNSFieldDistanceLargeRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.DistanceToDestination, new GNSFieldDistanceLargeRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.DesiredTrack, new GNSFieldBearingRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.Endurance, new GNSFieldDurationRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.TimeOfWaypointArrival, new GNSFieldTimeRenderer(dateTimeSettingManager));
    this.renderer.register(NavDataFieldType.TimeToWaypoint, new GNSFieldDurationRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.FuelOnBoard, new GNSFieldFuelRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.FuelOverDestination, new GNSFieldFuelRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.GroundSpeed, new GNSFieldSpeedRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.TimeOfDestinationArrival, new GNSFieldTimeRenderer(dateTimeSettingManager));
    this.renderer.register(NavDataFieldType.TrueAirspeed, new GNSFieldSpeedRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.GroundTrack, new GNSFieldBearingRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.VerticalSpeedRequired, new GNSFieldVerticalSpeedRenderer(unitsSettingManager));
    this.renderer.register(NavDataFieldType.CrossTrack, new GNSFieldDistanceLargeRenderer(unitsSettingManager));
  }

  /**
   * Renders a navigation data bar field of a given type.
   * @param type A data bar field type.
   * @param model The data model for the field.
   * @returns A navigation data bar field of the given type, as a VNode.
   * @throws Error if an unsupported field type is specified.
   */
  public render<T extends NavDataFieldType>(type: T, model: NavDataBarFieldTypeModelMap[T]): VNode {
    return this.renderer.render(type, model);
  }
}

/**
 * An abstract next-generation (NXi, G3000, etc) implementation of {@link NavDataFieldTypeRenderer} which supports
 * display unit settings.
 */
export abstract class GNSDataFieldTypeRenderer<T extends NavDataFieldType> implements NavDataFieldTypeRenderer<T> {
  public static readonly BEARING_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' });
  public static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3, forceDecimalZeroes: true, nanString: '__._' });
  public static readonly SPEED_FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3, nanString: '_._' });
  public static readonly FUEL_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });
  public static readonly ANGLE_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });
  public static readonly TEMPERATURE_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });
  public static readonly DURATION_OPTIONS = {
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
 * A GNS data field renderer that renders speed fields.
 */
export class GNSFieldTextRenderer extends GNSDataFieldTypeRenderer<
  NavDataFieldType.Waypoint | NavDataFieldType.Destination> {
  /** @inheritdoc */
  public render(model: NavDataBarFieldModel<string>): VNode {
    return (
      <SelectableText data={model.value} />
    );
  }
}

/**
 * A GNS data field renderer that renders speed fields.
 */
export class GNSFieldSpeedRenderer extends GNSDataFieldTypeRenderer<
  NavDataFieldType.GroundSpeed | NavDataFieldType.TrueAirspeed> {
  /** @inheritdoc */
  public render(model: NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Speed>>): VNode {
    return (
      <GNSNumberUnitDisplay
        formatter={GNSDataFieldTypeRenderer.SPEED_FORMATTER}
        value={model.value}
        displayUnit={this.unitsSettingManager.speedUnits}
      />
    );
  }
}

/**
 * A GNS data field renderer that renders distance fields.
 */
export class GNSFieldDistanceLargeRenderer extends GNSDataFieldTypeRenderer<
  NavDataFieldType.DistanceToDestination | NavDataFieldType.DistanceToWaypoint | NavDataFieldType.CrossTrack> {
  /** @inheritdoc */
  public render(model: NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Distance>>): VNode {
    return (
      <GNSNumberUnitDisplay
        formatter={GNSDataFieldTypeRenderer.DISTANCE_FORMATTER}
        value={model.value}
        displayUnit={this.unitsSettingManager.distanceUnitsLarge}
      />
    );
  }
}

/**
 * A GNS data field renderer that renders vertical speed fields.
 */
export class GNSFieldVerticalSpeedRenderer extends GNSDataFieldTypeRenderer<NavDataFieldType.VerticalSpeedRequired> {
  /** @inheritdoc */
  public render(model: NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Speed>>): VNode {
    return (
      <GNSNumberUnitDisplay
        formatter={GNSDataFieldTypeRenderer.SPEED_FORMATTER}
        value={model.value}
        displayUnit={this.unitsSettingManager.verticalSpeedUnits}
      />
    );
  }
}

/**
 * A GNS data field renderer that bearing fields.
 */
export class GNSFieldBearingRenderer extends GNSDataFieldTypeRenderer<
  NavDataFieldType.BearingToWaypoint | NavDataFieldType.DesiredTrack | NavDataFieldType.GroundTrack> {
  /** @inheritdoc */
  public render(model: NavDataBarFieldModel<NumberUnitInterface<NavAngleUnitFamily>>): VNode {
    return (
      <GNSNumberUnitDisplay
        formatter={GNSDataFieldTypeRenderer.BEARING_FORMATTER}
        value={model.value}
        displayUnit={this.unitsSettingManager.navAngleUnits}
      />
    );
  }
}

/**
 * A GNS data field renderer that renders fuel fields.
 */
export class GNSFieldFuelRenderer extends GNSDataFieldTypeRenderer<
  NavDataFieldType.FuelOnBoard | NavDataFieldType.FuelOverDestination> {
  /** @inheritdoc */
  public render(model: NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Weight>>): VNode {
    return (
      <GNSNumberUnitDisplay
        formatter={GNSDataFieldTypeRenderer.FUEL_FORMATTER}
        value={model.value}
        displayUnit={this.unitsSettingManager.weightUnits}
      />
    );
  }
}

/**
 * A GNS data field renderer that renders duration fields.
 */
export class GNSFieldDurationRenderer extends GNSDataFieldTypeRenderer<
  NavDataFieldType.Endurance | NavDataFieldType.TimeToDestination | NavDataFieldType.TimeToWaypoint> {
  /** @inheritdoc */
  public render(model: NavDataBarFieldModel<NumberUnitInterface<UnitFamily.Duration>>): VNode {
    return (
      <DurationDisplay
        options={GNSDataFieldTypeRenderer.DURATION_OPTIONS}
        value={model.value}
      />
    );
  }
}

/**
 * A GNS data field renderer that renders time fields.
 */
export class GNSFieldTimeRenderer implements NavDataFieldTypeRenderer<
  NavDataFieldType.TimeOfDestinationArrival | NavDataFieldType.TimeOfWaypointArrival> {
  public static readonly FORMAT_SETTING_MAP = {
    [DateTimeFormatSettingMode.Local12]: TimeDisplayFormat.Local12,
    [DateTimeFormatSettingMode.Local24]: TimeDisplayFormat.Local24,
    [DateTimeFormatSettingMode.UTC]: TimeDisplayFormat.UTC
  };

  protected readonly timeFormat = ConsumerSubject.create(this.dateTimeSettingManager.whenSettingChanged('dateTimeFormat'), this.dateTimeSettingManager.getSetting('dateTimeFormat').value);
  protected readonly localOffset = ConsumerSubject.create(this.dateTimeSettingManager.whenSettingChanged('dateTimeLocalOffset'), this.dateTimeSettingManager.getSetting('dateTimeLocalOffset').value);

  /**
   * Constructor.
   * @param dateTimeSettingManager A date/time user setting manager.
   */
  constructor(protected readonly dateTimeSettingManager: UserSettingManager<DateTimeUserSettingTypes>) {
  }

  /** @inheritdoc */
  public render(model: NavDataBarFieldModel<number>): VNode {
    return (
      <GNSTimeDisplay
        time={model.value}
        localOffset={this.localOffset}
        format={this.timeFormat.map(format => GNSFieldTimeRenderer.FORMAT_SETTING_MAP[format])}
        class='time-without-seconds-or-suffix'
      />
    );
  }
}
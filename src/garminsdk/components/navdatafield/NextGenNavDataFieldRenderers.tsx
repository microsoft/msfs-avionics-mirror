import {
  ConsumerSubject, DurationDisplayDelim, DurationDisplayFormat, FSComponent, NavAngleUnitFamily, NumberFormatter, NumberUnitInterface, Subject, UnitFamily, UnitType,
  UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { DateTimeFormatSettingMode, DateTimeUserSettingTypes } from '../../settings/DateTimeUserSettings';
import { UnitsUserSettingManager } from '../../settings/UnitsUserSettings';
import { TimeDisplayFormat } from '../common/TimeDisplay';
import { NavDataBearingField, NavDataDurationField, NavDataGenericField, NavDataNumberUnitField, NavDataTimeField } from './NavDataField';
import { NavDataFieldModel } from './NavDataFieldModel';
import { NavDataFieldTypeRenderer } from './NavDataFieldRenderer';
import { NavDataFieldType, NavDataFieldTypeModelMap } from './NavDataFieldType';

/**
 * An abstract next-generation (NXi, G3000, etc) implementation of {@link NavDataFieldTypeRenderer} which supports
 * display unit settings.
 */
export abstract class NextGenDisplayUnitNavDataFieldTypeRenderer<T extends NavDataFieldType> implements NavDataFieldTypeRenderer<T> {
  protected static readonly BEARING_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' });
  protected static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3, forceDecimalZeroes: true, nanString: '__._' });
  protected static readonly SPEED_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });
  protected static readonly FUEL_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });
  protected static readonly ANGLE_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });
  protected static readonly TEMPERATURE_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });
  protected static readonly ISA_FORMATTER = NumberFormatter.create({ precision: 1, forceSign: true, nanString: '___' });
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

  protected readonly timeFormat = ConsumerSubject.create(this.dateTimeSettingManager.whenSettingChanged('dateTimeFormat'), this.dateTimeSettingManager.getSetting('dateTimeFormat').value);
  protected readonly localOffset = ConsumerSubject.create(this.dateTimeSettingManager.whenSettingChanged('dateTimeLocalOffset'), this.dateTimeSettingManager.getSetting('dateTimeLocalOffset').value);

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
  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<NavAngleUnitFamily>>): VNode {
    return (
      <NavDataBearingField
        title='BRG'
        model={model as NavDataFieldTypeModelMap[NavDataFieldType.BearingToWaypoint]}
        displayUnit={this.unitsSettingManager.navAngleUnits}
        formatter={NextGenDisplayUnitNavDataFieldTypeRenderer.BEARING_FORMATTER}
        class='nav-data-field-gps'
      />
    );
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Distance to Waypoint navigation data fields.
 */
export class NextGenNavDataFieldDestRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.Destination> {
  /** @inheritdoc */
  public render(model: NavDataFieldModel<string>): VNode {
    // This seems silly but we need to create our own subscribable in order to be able unsubscribe from it when the
    // component is destroyed.
    const textSub = model.value.map(val => val);

    return (
      <NavDataGenericField
        title='DEST'
        model={model}
        onDestroy={(): void => {
          textSub.destroy();
        }}
        class='nav-data-field-white'
      >
        <div>{textSub}</div>
      </NavDataGenericField>
    );
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Distance to Waypoint navigation data fields.
 */
export class NextGenNavDataFieldDisRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.DistanceToWaypoint> {
  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Distance>>): VNode {
    return (
      <NavDataNumberUnitField
        title='DIS'
        model={model}
        displayUnit={this.unitsSettingManager.distanceUnitsLarge}
        formatter={NextGenDisplayUnitNavDataFieldTypeRenderer.DISTANCE_FORMATTER}
        class='nav-data-field-gps'
      />
    );
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Distance to Destination navigation data fields.
 */
export class NextGenNavDataFieldDtgRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.DistanceToDestination> {
  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Distance>>): VNode {
    return (
      <NavDataNumberUnitField
        title='DTG'
        model={model}
        displayUnit={this.unitsSettingManager.distanceUnitsLarge}
        formatter={NextGenDisplayUnitNavDataFieldTypeRenderer.DISTANCE_FORMATTER}
        class='nav-data-field-gps'
      />
    );
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Desired Track navigation data fields.
 */
export class NextGenNavDataFieldDtkRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.DesiredTrack> {
  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<NavAngleUnitFamily>>): VNode {
    return (
      <NavDataBearingField
        title='DTK'
        model={model}
        displayUnit={this.unitsSettingManager.navAngleUnits}
        formatter={NextGenDisplayUnitNavDataFieldTypeRenderer.BEARING_FORMATTER}
        class='nav-data-field-gps'
      />
    );
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Endurance navigation data fields.
 */
export class NextGenNavDataFieldEndRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.Endurance> {
  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Duration>>): VNode {
    return (
      <NavDataDurationField
        title='END'
        model={model}
        options={NextGenDisplayUnitNavDataFieldTypeRenderer.DURATION_OPTIONS}
        class='nav-data-field-magenta'
      />
    );
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Time to Destination navigation data fields.
 */
export class NextGenNavDataFieldEnrRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.TimeToDestination> {
  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Duration>>): VNode {
    return (
      <NavDataDurationField
        title='ENR'
        model={model}
        options={NextGenDisplayUnitNavDataFieldTypeRenderer.DURATION_OPTIONS}
        class='nav-data-field-gps'
      />
    );
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Estimated Time of Arrival navigation data fields.
 */
export class NextGenNavDataFieldEtaRenderer extends NextGenDateTimeNavDataFieldTypeRenderer<NavDataFieldType.TimeOfWaypointArrival> {
  /** @inheritdoc */
  public render(model: NavDataFieldModel<number>): VNode {
    return (
      <NavDataTimeField
        title='ETA'
        model={model}
        format={this.timeFormat.map(format => NextGenDateTimeNavDataFieldTypeRenderer.FORMAT_SETTING_MAP[format])}
        localOffset={this.localOffset}
        class='nav-data-field-gps'
      />
    );
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Time to Waypoint navigation data fields.
 */
export class NextGenNavDataFieldEteRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.TimeToWaypoint> {
  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Duration>>): VNode {
    return (
      <NavDataDurationField
        title='ETE'
        model={model}
        options={NextGenDisplayUnitNavDataFieldTypeRenderer.DURATION_OPTIONS}
        class='nav-data-field-gps'
      />
    );
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Fuel on Board navigation data fields.
 */
export class NextGenNavDataFieldFobRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.FuelOnBoard> {
  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Weight>>): VNode {
    return (
      <NavDataNumberUnitField
        title='FOB'
        model={model}
        displayUnit={this.unitsSettingManager.fuelUnits}
        formatter={NextGenDisplayUnitNavDataFieldTypeRenderer.FUEL_FORMATTER}
        class='nav-data-field-magenta'
      />
    );
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Fuel Over Destination navigation data fields.
 */
export class NextGenNavDataFieldFodRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.FuelOverDestination> {
  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Weight>>): VNode {
    return (
      <NavDataNumberUnitField
        title='FOD'
        model={model}
        displayUnit={this.unitsSettingManager.fuelUnits}
        formatter={NextGenDisplayUnitNavDataFieldTypeRenderer.FUEL_FORMATTER}
        class='nav-data-field-gps'
      />
    );
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Ground Speed navigation data fields.
 */
export class NextGenNavDataFieldGsRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.GroundSpeed> {
  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Speed>>): VNode {
    return (
      <NavDataNumberUnitField
        title='GS'
        model={model}
        displayUnit={this.unitsSettingManager.speedUnits}
        formatter={NextGenDisplayUnitNavDataFieldTypeRenderer.SPEED_FORMATTER}
        class='nav-data-field-gps'
      />
    );
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) ISA navigation data fields.
 */
export class NextGenNavDataFieldIsaRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.ISA> {
  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.TemperatureDelta>>): VNode {
    return (
      <NavDataNumberUnitField
        title='ISA'
        model={model}
        displayUnit={this.unitsSettingManager.temperatureDeltaUnits}
        formatter={NextGenDisplayUnitNavDataFieldTypeRenderer.ISA_FORMATTER}
        class='nav-data-field-white'
      />
    );
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Estimated Time of Arrival at Destination navigation data fields.
 */
export class NavDataFieldLdgRenderer extends NextGenDateTimeNavDataFieldTypeRenderer<NavDataFieldType.TimeOfDestinationArrival> {
  /** @inheritdoc */
  public render(model: NavDataFieldModel<number>): VNode {
    return (
      <NavDataTimeField
        title='LDG'
        model={model}
        format={this.timeFormat.map(format => NextGenDateTimeNavDataFieldTypeRenderer.FORMAT_SETTING_MAP[format])}
        localOffset={this.localOffset}
        class='nav-data-field-gps'
      />
    );
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) True Airspeed navigation data fields.
 */
export class NextGenNavDataFieldTasRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.TrueAirspeed> {
  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Speed>>): VNode {
    return (
      <NavDataNumberUnitField
        title='TAS'
        model={model}
        displayUnit={this.unitsSettingManager.speedUnits}
        formatter={NextGenDisplayUnitNavDataFieldTypeRenderer.SPEED_FORMATTER}
        class='nav-data-field-magenta'
      />
    );
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Track Angle Error navigation data fields.
 */
export class NextGenNavDataFieldTkeRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.TrackAngleError> {
  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Angle>>): VNode {
    return (
      <NavDataNumberUnitField
        title='TKE'
        model={model}
        displayUnit={Subject.create(UnitType.DEGREE)}
        formatter={NextGenDisplayUnitNavDataFieldTypeRenderer.ANGLE_FORMATTER}
        class='nav-data-field-gps'
      />
    );
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Ground Track navigation data fields.
 */
export class NextGenNavDataFieldTrkRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.GroundTrack> {
  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<NavAngleUnitFamily>>): VNode {
    return (
      <NavDataBearingField
        title='TRK'
        model={model}
        displayUnit={this.unitsSettingManager.navAngleUnits}
        formatter={NextGenDisplayUnitNavDataFieldTypeRenderer.BEARING_FORMATTER}
        class='nav-data-field-gps'
      />
    );
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Vertical Speed Required navigation data fields.
 */
export class NextGenNavDataFieldVsrRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.VerticalSpeedRequired> {
  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Speed>>): VNode {
    return (
      <NavDataNumberUnitField
        title='VSR'
        model={model as NavDataFieldTypeModelMap[NavDataFieldType.VerticalSpeedRequired]}
        displayUnit={this.unitsSettingManager.verticalSpeedUnits}
        formatter={NextGenDisplayUnitNavDataFieldTypeRenderer.SPEED_FORMATTER}
        class='nav-data-field-gps'
      />
    );
  }
}

/**
 * Renders next-generation (NXi, G3000, etc) Cross Track navigation data fields.
 */
export class NextGenNavDataFieldXtkRenderer extends NextGenDisplayUnitNavDataFieldTypeRenderer<NavDataFieldType.CrossTrack> {
  /** @inheritdoc */
  public render(model: NavDataFieldModel<NumberUnitInterface<UnitFamily.Distance>>): VNode {
    return (
      <NavDataNumberUnitField
        title='XTK'
        model={model}
        displayUnit={this.unitsSettingManager.distanceUnitsLarge}
        formatter={NextGenDisplayUnitNavDataFieldTypeRenderer.DISTANCE_FORMATTER}
        class='nav-data-field-gps'
      />
    );
  }
}
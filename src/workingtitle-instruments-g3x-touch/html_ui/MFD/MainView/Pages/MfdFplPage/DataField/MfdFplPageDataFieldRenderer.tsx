import { ComponentProps, DisplayComponent, DurationDisplay, DurationDisplayFormat, DurationDisplayOptions, FSComponent, NavAngleUnit, NavAngleUnitFamily, NumberFormatter, NumberUnitInterface, Subscribable, Unit, UnitFamily, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { DateTimeFormatSettingMode, DateTimeUserSettingTypes, TimeDisplayFormat } from '@microsoft/msfs-garminsdk';

import { G3XBearingDisplay } from '../../../../../Shared/Components/Common/G3XBearingDisplay';
import { G3XNumberUnitDisplay } from '../../../../../Shared/Components/Common/G3XNumberUnitDisplay';
import { G3XTimeDisplay } from '../../../../../Shared/Components/Common/G3XTimeDisplay';
import { FlightPlanDataField, FlightPlanDataFieldType } from '../../../../../Shared/FlightPlan/FlightPlanDataField';
import { G3XUnitsUserSettingManager } from '../../../../../Shared/Settings/G3XUnitsUserSettings';

/**
 * A renderer of flight plan data fields for the MFD FPL page.
 */
export class MfdFplPageDataFieldRenderer {

  private readonly dateTimeFormat = this.dateTimeSettingManager.getSetting('dateTimeFormat').map(settingMode => {
    switch (settingMode) {
      case DateTimeFormatSettingMode.Local24:
        return TimeDisplayFormat.Local24;
      case DateTimeFormatSettingMode.Local12:
        return TimeDisplayFormat.Local12;
      default:
        return TimeDisplayFormat.UTC;
    }
  });

  private isAlive = true;

  /**
   * Creates a new instance of MfdFplPageDataFieldRenderer.
   * @param isCumulative Whether this renderer should render flight plan cumulative data fields instead of flight plan
   * leg data fields.
   * @param unitsSettingManager A manager for display unit user settings.
   * @param dateTimeSettingManager A manager for date/time user settings.
   */
  public constructor(
    private readonly isCumulative: boolean,
    private readonly unitsSettingManager: G3XUnitsUserSettingManager,
    private readonly dateTimeSettingManager: UserSettingManager<DateTimeUserSettingTypes>
  ) {
  }

  /**
   * Renders a flight plan data field.
   * @param dataField The data field to render.
   * @returns The rendered data field, as a VNode, or `null` if the data field could not be rendered.
   * @throws Error if this renderer has been destroyed.
   */
  public render(dataField: FlightPlanDataField): VNode | null {
    if (!this.isAlive) {
      throw new Error('MfdFplPageDataFieldRenderer: cannot render after the renderer has been destroyed');
    }

    switch (dataField.type) {
      case FlightPlanDataFieldType.CumulativeDistance:
        return this.renderDistance(dataField as FlightPlanDataField<FlightPlanDataFieldType.CumulativeDistance>);
      case FlightPlanDataFieldType.CumulativeEte:
        return this.renderEte(dataField as FlightPlanDataField<FlightPlanDataFieldType.CumulativeEte>);
      case FlightPlanDataFieldType.CumulativeFuel:
        return this.renderFuel(dataField as FlightPlanDataField<FlightPlanDataFieldType.CumulativeFuel>);
      case FlightPlanDataFieldType.Eta:
        return this.renderEta(dataField as FlightPlanDataField<FlightPlanDataFieldType.Eta>);
      case FlightPlanDataFieldType.FuelRemaining:
        return this.renderFuel(dataField as FlightPlanDataField<FlightPlanDataFieldType.FuelRemaining>);
      case FlightPlanDataFieldType.Dtk:
        return this.isCumulative ? null : this.renderDtk(dataField as FlightPlanDataField<FlightPlanDataFieldType.Dtk>);
      case FlightPlanDataFieldType.LegDistance:
        return this.renderDistance(dataField as FlightPlanDataField<FlightPlanDataFieldType.LegDistance>);
      case FlightPlanDataFieldType.LegEte:
        return this.renderEte(dataField as FlightPlanDataField<FlightPlanDataFieldType.LegEte>);
      case FlightPlanDataFieldType.LegFuel:
        return this.renderFuel(dataField as FlightPlanDataField<FlightPlanDataFieldType.LegFuel>);
      case FlightPlanDataFieldType.Sunrise:
        return null;
      case FlightPlanDataFieldType.Sunset:
      default:
        return null;
    }
  }

  /**
   * Renders a distance data field.
   * @param dataField The data field to render.
   * @returns A rendered distance data field, as a VNode.
   */
  private renderDistance(dataField: FlightPlanDataField<FlightPlanDataFieldType.CumulativeDistance | FlightPlanDataFieldType.LegDistance>): VNode {
    return (
      <DistanceDataField
        value={dataField.value}
        displayUnit={this.unitsSettingManager.distanceUnitsLarge}
      />
    );
  }

  /**
   * Renders an ETE data field.
   * @param dataField The data field to render.
   * @returns A rendered ETE data field, as a VNode.
   */
  private renderEte(dataField: FlightPlanDataField<FlightPlanDataFieldType.CumulativeEte | FlightPlanDataFieldType.LegEte>): VNode {
    return (
      <DurationDataField
        value={dataField.value}
      />
    );
  }

  /**
   * Renders a fuel data field.
   * @param dataField The data field to render.
   * @returns A rendered fuel data field, as a VNode.
   */
  private renderFuel(dataField: FlightPlanDataField<FlightPlanDataFieldType.CumulativeFuel | FlightPlanDataFieldType.LegFuel | FlightPlanDataFieldType.FuelRemaining>): VNode {
    return (
      <WeightDataField
        value={dataField.value}
        displayUnit={this.unitsSettingManager.fuelUnits}
      />
    );
  }

  /**
   * Renders an ETA data field.
   * @param dataField The data field to render.
   * @returns A rendered ETA data field, as a VNode.
   */
  private renderEta(dataField: FlightPlanDataField<FlightPlanDataFieldType.Eta>): VNode {
    return (
      <TimeDataField
        value={dataField.value}
        format={this.dateTimeFormat}
        localOffset={this.dateTimeSettingManager.getSetting('dateTimeLocalOffset')}
      />
    );
  }

  /**
   * Renders a DTK data field.
   * @param dataField The data field to render.
   * @returns A rendered DTK data field, as a VNode.
   */
  private renderDtk(dataField: FlightPlanDataField<FlightPlanDataFieldType.Dtk>): VNode {
    return (
      <BearingDataField
        value={dataField.value}
        displayUnit={this.unitsSettingManager.navAngleUnits}
      />
    );
  }

  /**
   * Destroys this renderer. After the renderer is destroyed, it can no longer render data fields.
   */
  public destroy(): void {
    this.isAlive = false;

    this.dateTimeFormat.destroy();
  }
}

/**
 * Component props for {@link DistanceDataField}.
 */
interface DistanceDataFieldProps extends ComponentProps {
  /** The value of the data field. */
  value: Subscribable<NumberUnitInterface<UnitFamily.Distance>>;

  /** The unit in which to display the data field value. */
  displayUnit: Subscribable<Unit<UnitFamily.Distance>>;
}

/**
 * A flight plan data field that displays a distance.
 */
class DistanceDataField extends DisplayComponent<DistanceDataFieldProps> {
  private static readonly FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3, nanString: '__._' });

  private readonly displayRef = FSComponent.createRef<G3XNumberUnitDisplay<any>>();

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='mfd-fpl-page-data-field'>
        <G3XNumberUnitDisplay
          value={this.props.value}
          displayUnit={this.props.displayUnit}
          formatter={DistanceDataField.FORMATTER}
        />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.displayRef.getOrDefault()?.destroy();

    super.destroy();
  }
}

/**
 * Component props for {@link DistanceDataField}.
 */
interface BearingDataFieldProps extends ComponentProps {
  /** The value of the data field. */
  value: Subscribable<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>>;

  /** The unit in which to display the data field value. */
  displayUnit: Subscribable<NavAngleUnit>;
}

/**
 * A flight plan data field that displays a bearing.
 */
class BearingDataField extends DisplayComponent<BearingDataFieldProps> {
  private static readonly FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' });

  private readonly displayRef = FSComponent.createRef<G3XNumberUnitDisplay<any>>();

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='mfd-fpl-page-data-field'>
        <G3XBearingDisplay
          value={this.props.value}
          displayUnit={this.props.displayUnit}
          formatter={BearingDataField.FORMATTER}
        />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.displayRef.getOrDefault()?.destroy();

    super.destroy();
  }
}

/**
 * Component props for {@link DistanceDataField}.
 */
interface DurationDataFieldProps extends ComponentProps {
  /** The value of the data field. */
  value: Subscribable<NumberUnitInterface<UnitFamily.Duration>>;
}

/**
 * A flight plan data field that displays a duration.
 */
class DurationDataField extends DisplayComponent<DurationDataFieldProps> {
  private static readonly OPTIONS: Partial<DurationDisplayOptions> = {
    format: DurationDisplayFormat.hh_mm_or_mm_ss,
    pad: 2,
    nanString: '__:__'
  };

  private readonly displayRef = FSComponent.createRef<G3XNumberUnitDisplay<any>>();

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='mfd-fpl-page-data-field'>
        <DurationDisplay
          value={this.props.value}
          options={DurationDataField.OPTIONS}
        />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.displayRef.getOrDefault()?.destroy();

    super.destroy();
  }
}

/**
 * Component props for {@link WeightDataField}.
 */
interface WeightDataFieldProps extends ComponentProps {
  /** The value of the data field. */
  value: Subscribable<NumberUnitInterface<UnitFamily.Weight>>;

  /** The unit in which to display the data field value. */
  displayUnit: Subscribable<Unit<UnitFamily.Weight>>;
}

/**
 * A flight plan data field that displays a weight.
 */
class WeightDataField extends DisplayComponent<WeightDataFieldProps> {
  private static readonly FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3, nanString: '__._' });

  private readonly displayRef = FSComponent.createRef<G3XNumberUnitDisplay<any>>();

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='mfd-fpl-page-data-field'>
        <G3XNumberUnitDisplay
          value={this.props.value}
          displayUnit={this.props.displayUnit}
          formatter={WeightDataField.FORMATTER}
        />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.displayRef.getOrDefault()?.destroy();

    super.destroy();
  }
}

/**
 * Component props for {@link DistanceDataField}.
 */
interface TimeDataFieldProps extends ComponentProps {
  /** The value of the data field. */
  value: Subscribable<number>;

  /** The display format. */
  format: TimeDisplayFormat | Subscribable<TimeDisplayFormat>;

  /** The local time offset, in milliseconds. */
  localOffset: number | Subscribable<number>;
}

/**
 * A flight plan data field that displays a time.
 */
class TimeDataField extends DisplayComponent<TimeDataFieldProps> {
  private readonly displayRef = FSComponent.createRef<G3XNumberUnitDisplay<any>>();

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='mfd-fpl-page-data-field'>
        <G3XTimeDisplay
          time={this.props.value}
          format={this.props.format}
          localOffset={this.props.localOffset}
          useVerticalSuffix
        />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.displayRef.getOrDefault()?.destroy();

    super.destroy();
  }
}

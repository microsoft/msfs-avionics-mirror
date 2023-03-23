/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  DisplayComponent, FSComponent, VNode, ComponentProps, NumberFormatter, SetSubject,
  MappedSubject, Subscription, DurationDisplay, DurationDisplayDelim, DurationDisplayFormat,
} from '@microsoft/msfs-sdk';
import {
  BearingDisplay, DateTimeFormatSettingMode, DateTimeUserSettings, NumberUnitDisplay,
  TimeDisplay, TimeDisplayFormat, UnitsUserSettings
} from '@microsoft/msfs-garminsdk';
import { FlightPlanLegListData, FlightPlanStore } from '@microsoft/msfs-wtg3000-common';
import { GtcService } from '../../GtcService/GtcService';
import { FlightPlanDataFieldType } from '../../Settings/GtcUserSettings';
import './FlightPlanDataFieldsBox.css';

/**
 * The properties for the {@link FlightPlanDataFieldsBox} component.
 */
interface FlightPlanDataFieldsBoxProps extends ComponentProps {
  /** The leg list data. */
  legListData: FlightPlanLegListData;
  /** The flight plan store. */
  store: FlightPlanStore;
  /** The GtcService. */
  gtcService: GtcService;
}

const DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3, forceDecimalZeroes: true, nanString: '____' });
const BEARING_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' });
const FUEL_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });
const DATE_TIME_FORMAT_SETTING_MAP = {
  [DateTimeFormatSettingMode.Local12]: TimeDisplayFormat.Local12,
  [DateTimeFormatSettingMode.Local24]: TimeDisplayFormat.Local24,
  [DateTimeFormatSettingMode.UTC]: TimeDisplayFormat.UTC
};

/**
 * The FlightPlanDataFieldsBox component.
 */
export class FlightPlanDataFieldsBox extends DisplayComponent<FlightPlanDataFieldsBoxProps> {
  private readonly dataField1 = FSComponent.createRef<DataFieldDisplay>();
  private readonly dataField2 = FSComponent.createRef<DataFieldDisplay>();

  private readonly classList = SetSubject.create(['flight-plan-data-fields-box']);

  private readonly legData = this.props.legListData.legData;

  private readonly isVisible = MappedSubject.create(([isFirst, isDto]) => {
    // First leg in plan is hidden, unless it's a DTO leg
    return isDto || !isFirst;
  }, this.legData.isFirstLegInPlan, this.legData.isDtoLeg);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.isVisible.sub(isVisible => {
      this.classList.toggle('hidden', !isVisible);
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.classList}>
        <DataFieldDisplay
          ref={this.dataField1}
          index={1}
          gtcService={this.props.gtcService}
          legListData={this.props.legListData}
          store={this.props.store}
        />
        <DataFieldDisplay
          ref={this.dataField2}
          index={2}
          gtcService={this.props.gtcService}
          legListData={this.props.legListData}
          store={this.props.store}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.dataField1.instance.destroy();
    this.dataField2.instance.destroy();

    this.isVisible.destroy();
  }
}

/** The props for {@link DataFieldDisplay}. */
interface DataFieldDisplayProps extends ComponentProps {
  /** Which data field is this. */
  index: 1 | 2;
  /** The leg list data. */
  legListData: FlightPlanLegListData;
  /** The flight plan store. */
  store: FlightPlanStore;
  /** The GtcService. */
  gtcService: GtcService;
}

const hiddenFieldsForHoldLegs = [
  FlightPlanDataFieldType.DIS_Distance,
  FlightPlanDataFieldType.CUM_CumulativeDistance,
  FlightPlanDataFieldType.ESA_EnrouteSafeAltitude,
  FlightPlanDataFieldType.ETA_EstTimeOfArrival,
  FlightPlanDataFieldType.ETE_EstTimeEnroute,
  FlightPlanDataFieldType.FUEL_FuelToDestination,
];

/** DataFieldDisplay. */
class DataFieldDisplay extends DisplayComponent<DataFieldDisplayProps> {
  private readonly mainRef = FSComponent.createRef<HTMLDivElement>();
  private readonly componentRef = FSComponent.createRef<DisplayComponent<any>>();

  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.props.gtcService.bus);
  private readonly dateTimeSettingManager = DateTimeUserSettings.getManager(this.props.gtcService.bus);

  private readonly timeFormat = this.dateTimeSettingManager.getSetting('dateTimeFormat').map(setting => {
    return DATE_TIME_FORMAT_SETTING_MAP[setting] ?? TimeDisplayFormat.UTC;
  });

  private readonly subs = [] as Subscription[];

  /** @inheritdoc */
  public onAfterRender(): void {
    const { gtcService, index } = this.props;

    const dataFieldSetting = gtcService.gtcSettings.getSetting(`flightPlanDataField${index}`);

    this.subs.push(dataFieldSetting.sub(dataFieldType => {
      this.mainRef.instance.innerHTML = '';
      this.componentRef.getOrDefault()?.destroy();

      if (this.props.legListData.legData.isHoldLeg && hiddenFieldsForHoldLegs.includes(dataFieldType)) {
        return;
      }

      FSComponent.render(this.renderDataField(dataFieldType), this.mainRef.instance);
    }, true));
  }

  /**
   * Renders the data field for a given type.
   * @param dataFieldType The type.
   * @returns the data field.
   */
  private renderDataField(dataFieldType: FlightPlanDataFieldType): VNode {
    switch (dataFieldType) {
      case FlightPlanDataFieldType.CUM_CumulativeDistance:
        return <NumberUnitDisplay
          ref={this.componentRef}
          value={this.props.legListData.legData.distanceCumulative}
          formatter={DISTANCE_FORMATTER}
          displayUnit={this.unitsSettingManager.distanceUnitsLarge}
        />;
      case FlightPlanDataFieldType.DIS_Distance:
        return <NumberUnitDisplay
          ref={this.componentRef}
          value={this.props.legListData.displayDistance}
          formatter={DISTANCE_FORMATTER}
          displayUnit={this.unitsSettingManager.distanceUnitsLarge}
        />;
      case FlightPlanDataFieldType.DTK_DesiredTrack:
        return <BearingDisplay
          ref={this.componentRef}
          value={this.props.legListData.displayDtk}
          formatter={BEARING_FORMATTER}
          displayUnit={this.unitsSettingManager.navAngleUnits}
        />;
      // TODO
      // case FlightPlanDataFieldType.ESA_EnrouteSafeAltitude:
      //   return <NumberUnitDisplay
      //     ref={this.componentRef}
      //     value={this.props.legListData.displayDistance}
      //     formatter={DISTANCE_FORMATTER}
      //     displayUnit={this.unitsSettingManager.distanceUnitsLarge}
      //   />;
      case FlightPlanDataFieldType.ETA_EstTimeOfArrival:
        return <TimeDisplay
          ref={this.componentRef}
          time={this.props.legListData.legData.estimatedTimeOfArrival}
          format={this.timeFormat}
          localOffset={this.dateTimeSettingManager.getSetting('dateTimeLocalOffset')}
        />;
      case FlightPlanDataFieldType.ETE_EstTimeEnroute:
        return <DurationDisplay
          ref={this.componentRef}
          value={this.props.legListData.displayEte}
          options={{
            format: DurationDisplayFormat.hh_mm_or_mm_ss,
            delim: DurationDisplayDelim.ColonOrCross,
            pad: 2,
            nanString: '__:__',
          }}
        />;
      case FlightPlanDataFieldType.FUEL_FuelToDestination:
        return <NumberUnitDisplay
          ref={this.componentRef}
          value={this.props.legListData.legData.fuelRemaining}
          formatter={FUEL_FORMATTER}
          displayUnit={this.unitsSettingManager.fuelUnits}
        />;
      default:
        return <div>INOP</div>;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.mainRef} class={`line-${this.props.index}`} />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.timeFormat.destroy();

    this.componentRef.getOrDefault()?.destroy();

    this.subs.forEach(x => x.destroy());
  }
}

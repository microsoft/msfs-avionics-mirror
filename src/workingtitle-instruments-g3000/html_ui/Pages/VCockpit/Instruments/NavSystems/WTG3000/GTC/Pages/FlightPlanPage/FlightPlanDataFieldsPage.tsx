import { FSComponent, VNode, UserSetting } from '@microsoft/msfs-sdk';
import { GtcListSelectTouchButton } from '../../Components';
import { GtcListDialogParams } from '../../Dialog';
import { GtcView, GtcViewKeys } from '../../GtcService';
import { FlightPlanDataFieldType } from '../../Settings';
import './FlightPlanDataFieldsPage.css';

const listParams: GtcListDialogParams<FlightPlanDataFieldType>
  | ((state: UserSetting<FlightPlanDataFieldType>) => GtcListDialogParams<FlightPlanDataFieldType>)
  = (state): GtcListDialogParams<FlightPlanDataFieldType> => {
    return {
      inputData: [{
        value: FlightPlanDataFieldType.CUM_CumulativeDistance,
        labelRenderer: () => 'CUM - Cumulative Distance',
      }, {
        value: FlightPlanDataFieldType.DIS_Distance,
        labelRenderer: () => 'DIS - Distance',
      }, {
        value: FlightPlanDataFieldType.DTK_DesiredTrack,
        labelRenderer: () => 'DTK - Desired Track',
        // TODO
        // }, {
        //   value: FlightPlanDataFieldType.ESA_EnrouteSafeAltitude,
        //   labelRenderer: () => 'ESA - Enroute Safe Altitude',
      }, {
        value: FlightPlanDataFieldType.ETA_EstTimeOfArrival,
        labelRenderer: () => 'ETA - Est Time of Arrival',
      }, {
        value: FlightPlanDataFieldType.ETE_EstTimeEnroute,
        labelRenderer: () => 'ETE - Est Time Enroute',
      }, {
        value: FlightPlanDataFieldType.FUEL_FuelToDestination,
        labelRenderer: () => 'FUEL - Fuel to Destination',
      }],
      selectedValue: state,
      title: 'Select Field Type',
      class: 'flight-plan-data-fields-page-list',
    };
  };

/** The FlightPlanDataFieldsPage component. */
export class FlightPlanDataFieldsPage extends GtcView {
  private readonly field1Ref = FSComponent.createRef<GtcListSelectTouchButton<any>>();
  private readonly field2Ref = FSComponent.createRef<GtcListSelectTouchButton<any>>();

  /** @inheritdoc */
  public onAfterRender(): void {
    this._title.set('Flight Plan Data Fields');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="flight-plan-data-fields-page gtc-panel">
        <div class="gtc-panel-title">Field 1 / Field 2</div>
        <div class="column">
          <GtcListSelectTouchButton
            gtcService={this.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.gtcService.gtcSettings.getSetting('flightPlanDataField1')}
            label="Data Field 1"
            renderValue={state => state}
            listParams={listParams}
          />
          <GtcListSelectTouchButton
            gtcService={this.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.gtcService.gtcSettings.getSetting('flightPlanDataField2')}
            label="Data Field 2"
            renderValue={state => state}
            listParams={listParams}
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.field1Ref.getOrDefault()?.destroy();
    this.field2Ref.getOrDefault()?.destroy();

    super.destroy();
  }
}
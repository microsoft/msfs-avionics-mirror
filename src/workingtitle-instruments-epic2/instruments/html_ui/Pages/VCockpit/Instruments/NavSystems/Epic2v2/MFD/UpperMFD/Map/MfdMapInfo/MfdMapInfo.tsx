import {
  ComponentProps, DisplayComponent, EventBus, FlightPlanner, FlightPlanPredictionsProvider, FSComponent, Subscribable, TcasAlertLevel, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

// import { BoeingNdDataProvider, TcasAdvisoryStatus, VerticalDeviationDataProvider } from '@microsoft/msfs-boeingsdk';
// import {
//   ActiveWaypointDataBlock, AircraftTrack, MapNavigationPerformance, SpeedWindRangeInfoBlock, TimeToAlign, VorDisplay, WxTerrTfcDataBlock
// } from '../../../../Shared/Map/Info';
import { MapDataProvider, MfdAliasedUserSettingTypes } from '@microsoft/msfs-epic2-shared';

import { MfdMapTopButtons } from './MfdMapTopButtons';

import './MfdMapInfo.css';

/** The properties for the {@link NdInfomation} component. */
interface MfdMapInfoProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The flight plan predictions provider for the active route. */
  activeRoutePredictor: FlightPlanPredictionsProvider;
  /** The nd info data provider. */
  ndDataProvider: MapDataProvider;
  // /** The vertical deviation data provider. */
  // verticalDeviationDataProvider: VerticalDeviationDataProvider;
  /** The flight planner. */
  flightPlanner: FlightPlanner;
  /** The offScaleTcasAlertLevel. */
  offScaleTcasAlertLevel: Subscribable<TcasAlertLevel>;
  /** The settings manager to use. */
  settings: UserSettingManager<MfdAliasedUserSettingTypes>;
}

/** The MfdMapInfo component. */
export class MfdMapInfo extends DisplayComponent<MfdMapInfoProps> {
  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="nd-information-container">
        <MfdMapTopButtons settings={this.props.settings} />
        {/* <SpeedWindRangeInfoBlock
          bus={this.props.bus}
          ndDataProvider={this.props.ndDataProvider}
        />
        <TimeToAlign
          bus={this.props.bus}
          ndDataProvider={this.props.ndDataProvider}
        />
        <ActiveWaypointDataBlock
          bus={this.props.bus}
          activeRoutePredictor={this.props.activeRoutePredictor}
          distancePad={5}
          flightPlanner={this.props.flightPlanner}
        />
        <AircraftTrack
          bus={this.props.bus}
          ndDataProvider={this.props.ndDataProvider}
        />
        <TcasAdvisoryStatus
          bus={this.props.bus}
          tcasOffScaleStatus={this.props.offScaleTcasAlertLevel}
          ndDataProvider={this.props.ndDataProvider}
        />
        <div class="nd-information-lower-section">
          <WxTerrTfcDataBlock
            bus={this.props.bus}
            ndDataProvider={this.props.ndDataProvider}
            showMapSymbolsBlock
          />
          <VorDisplay
            bus={this.props.bus}
            ndDataProvider={this.props.ndDataProvider}
            fmcPositionUpdateStatus={Subject.create('GPS')}
          />
          <MapNavigationPerformance
            bus={this.props.bus}
            ndDataProvider={this.props.ndDataProvider}
            verticalDeviationDataProvider={this.props.verticalDeviationDataProvider}
            lineThickness={4}
            fontSize={28}
            marginBottom={170}
          />
        </div> */}
      </div>
    );
  }
}

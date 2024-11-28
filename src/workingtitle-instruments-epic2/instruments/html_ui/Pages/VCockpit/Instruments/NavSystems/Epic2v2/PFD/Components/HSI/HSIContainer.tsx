import {
  ComponentProps, DisplayComponent, EventBus, FacilityLoader, FlightPlanner, FSComponent, Subject, TcasAdvisoryDataProvider, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import {
  AutopilotDataProvider, CurrentHeadingDisplay, Epic2PfdControlPfdEvents, Epic2TcasII, HeadingDataProvider, HeadingFailureFlag, MapDataProvider,
  NavigationSourceDataProvider, PfdAliasedUserSettingTypes
} from '@microsoft/msfs-epic2-shared';

import { DegradedNavAlert } from './DegradedNavAlert';
import { FmsMessageIcon } from './FmsMessageIcon';
import { HsiDisplay } from './HsiDisplay';
import { HsiFull } from './HsiFull';
import { HsiMap } from './HsiMap';
import { SynVisAnnunciator } from './SynVisAnnunciator';
import { TrafficAnnunciator } from './TrafficAnnunciator';

import './HSIContainer.css';

enum HsiModes {
  partial,
  full,
}

/** The PFD HSI section props. */
interface HSIContainerProps extends ComponentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;
  /** The heading data provider to use. */
  readonly headingDataProvider: HeadingDataProvider;
  // /** The mfd nav indicators for the vor pointers. */
  // readonly navIndicators: EpicNavIndicators;
  /** An instance of TCAS. */
  tcas: Epic2TcasII;
  // /** The flight plan predictions provider for the active route. */
  // activeRoutePredictor: FlightPlanPredictionsProvider;
  // /** The perf plan repo. */
  // readonly perfPlanRepository: PerformancePlanRepository;
  // /** The fix info manager. */
  // fixInfo: BoeingFixInfoManager;
  /** The settings manager to use. */
  readonly settings: UserSettingManager<PfdAliasedUserSettingTypes>;
  /** The map data provider. */
  readonly mapDataProvider: MapDataProvider;
  /** The autopilot data provider to use. */
  readonly autopilotDataProvider: AutopilotDataProvider;
  /** The navigation source data provider to use. */
  readonly navigationSourceDataProvider: NavigationSourceDataProvider;
  /** A TCAS advisory data provider */
  readonly tcasAdvisoryDataProvider: TcasAdvisoryDataProvider
  /** The instrument index. */
  readonly instrumentIndex: number;
  /** An instance of the flight planner. */
  readonly flightPlanner: FlightPlanner;
  /** An instance of the facility loader. */
  readonly facLoader: FacilityLoader;
}

/** The PFD HSI section container. */
export class HSIContainer extends DisplayComponent<HSIContainerProps> {

  /** WeatherMode state. */
  readonly weatherMode = this.props.settings.getSetting('terrWxState');

  /** The HSI mode: Partial (Arc) or Full (Rose) */
  private readonly hsiMode = Subject.create(HsiModes.partial);

  /** The full HSI compass radius [pixels] */
  private readonly hsiFullCompassRadius = 130;

  /** @inheritdoc */
  public onAfterRender(): void {
    // Switch between partial and full HSI modes when HSI button is pushed
    this.props.bus.getSubscriber<Epic2PfdControlPfdEvents>().on('pfd_control_hsi_push').handle(() => {
      this.hsiMode.set(this.hsiMode.get() === HsiModes.partial ? HsiModes.full : HsiModes.partial);
    });
  }

  /** @inheritdoc */
  public render(): VNode | null {

    return <>
      <HeadingFailureFlag headingDataProvider={this.props.headingDataProvider} />
      <CurrentHeadingDisplay headingDataProvider={this.props.headingDataProvider} />
      <HsiDisplay
        bus={this.props.bus}
        settings={this.props.settings}
        index={this.props.instrumentIndex}
        tcasAdvisoryDataProvider={this.props.tcasAdvisoryDataProvider}
      />
      <div class={{
        'pfd-hsi-map': true,
        'hide': this.weatherMode.map(x => x === 'WX'),
        'hidden': this.hsiMode.map((mode) => mode === HsiModes.partial ? false : true),
      }}>
        <HsiMap
          bus={this.props.bus}
          settings={this.props.settings}
          mapDataProvider={this.props.mapDataProvider}
          facLoader={this.props.facLoader}
          flightPlanner={this.props.flightPlanner}
          // perfPlanRepository={this.props.perfPlanRepository}
          // activeRoutePredictor={this.props.pred}
          tcas={this.props.tcas}
          // navIndicators={this.props.navIndicators}
          headingDataProvider={this.props.headingDataProvider}
          autopilotDataProvider={this.props.autopilotDataProvider}
          navigationSourceDataProvider={this.props.navigationSourceDataProvider}
          instrumentIndex={this.props.instrumentIndex}
        />
      </div>
      <div class={{
        'pfd-hsi-wx': true,
        'hide': this.props.settings.getSetting('terrWxState').map(x => x !== 'WX'),
        'hidden': this.hsiMode.map((mode) => mode === HsiModes.partial ? false : true),
      }}>

        <HsiMap
          bus={this.props.bus}
          settings={this.props.settings}
          mapDataProvider={this.props.mapDataProvider}
          facLoader={this.props.facLoader}
          flightPlanner={this.props.flightPlanner}
          // perfPlanRepository={this.props.perfPlanRepository}
          // activeRoutePredictor={this.props.pred}
          tcas={this.props.tcas}
          // navIndicators={this.props.navIndicators}
          headingDataProvider={this.props.headingDataProvider}
          autopilotDataProvider={this.props.autopilotDataProvider}
          navigationSourceDataProvider={this.props.navigationSourceDataProvider}
          instrumentIndex={this.props.instrumentIndex}
        />
      </div>
      <div
        class={{
          'pfd-hsi-full': true,
          'hidden': this.hsiMode.map((mode) => mode === HsiModes.full ? false : true),
        }}
        style={{
          'top': '473px',
          'left': 309 - this.hsiFullCompassRadius + 'px',
        }}
      >
        <HsiFull
          compassRadius={this.hsiFullCompassRadius}
          mapDataProvider={this.props.mapDataProvider}
          headingDataProvider={this.props.headingDataProvider}
          autopilotDataProvider={this.props.autopilotDataProvider}
          navigationSourceDataProvider={this.props.navigationSourceDataProvider}
        />
      </div>
      <TrafficAnnunciator bus={this.props.bus} settings={this.props.settings} tcas={this.props.tcas} tcasAdvisoryDataProvider={this.props.tcasAdvisoryDataProvider} />
      <SynVisAnnunciator bus={this.props.bus} settings={this.props.settings} />
      <FmsMessageIcon bus={this.props.bus} />
      <DegradedNavAlert bus={this.props.bus} />
    </>;
  }
}

/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CompiledMapSystem, ComponentProps, DisplayComponent, EventBus, FacilityLoader, FlightPlanner, FSComponent, MapAutopilotPropsModule, MapSystemBuilder,
  MapSystemKeys, PerformancePlanRepository, Subject, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import {
  AltitudeDataProvider, AutopilotDataProvider, Epic2FixInfoManager, Epic2Fms, Epic2MapModules, Epic2PerformancePlan, Epic2TcasII, EpicMapBuilder, EpicMapKeys,
  FlightPlanStore, HeadingDataProvider, InertialDataProvider, MapAutopilotPropsController, MapDataProvider, MapRangeController, MapTrafficController,
  MfdAliasedUserSettingTypes, ModalService, SectionOutline
} from '@microsoft/msfs-epic2-shared';

import { ActivatePlanButtonBar } from '../Common/ActivatePlanButtonBar';
import { HoldButton } from '../Common/HoldButton';
import { VectorsButton } from '../Common/VectorsButton';
import { UpperMfdPaneSizes } from '../UpperMfdPaneSizes';
import { FmsMessageWindow } from './FmsMessageWindow/FmsMessageWindow';
import { HdgTrkUpModeMapLayer } from './Layers/HdgTrkUpModeMapLayer';
import { NorthUpModeMapLayer } from './Layers/NorthUpModeMapLayer';
import { MfdMapSideButtons } from './MfdMapInfo/MfdMapSideButtons';
import { MfdMapTopButtons } from './MfdMapInfo/MfdMapTopButtons';
import { PlanFormatController, PlanFormatControllerContext } from './PlanFormatController';
import { UpperMfdFormatController } from './UpperMfdFormatController';

/** The properties for the {@link MfdMap} component. */
interface MfdMapProps extends ComponentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;
  /** An instance of the flight planner. */
  readonly flightPlanner: FlightPlanner;
  /** An instance of the facility loader. */
  readonly facLoader: FacilityLoader;
  /** An instance of TCAS. */
  readonly tcas: Epic2TcasII;
  // /** The flight plan predictions provider for the active route. */
  // activeRoutePredictor: FlightPlanPredictionsProvider;
  /** The perf plan repo. */
  readonly perfPlanRepository: PerformancePlanRepository<Epic2PerformancePlan>;
  // /** The fix info manager. */
  // fixInfo: BoeingFixInfoManager;
  /** The settings manager to use. */
  readonly settings: UserSettingManager<MfdAliasedUserSettingTypes>;
  /** The map data provider. */
  readonly mapDataProvider: MapDataProvider;
  /** The heading data provider to use. */
  readonly headingDataProvider: HeadingDataProvider;
  /** The heading data provider to use. */
  readonly autopilotDataProvider: AutopilotDataProvider;
  /** The altitude data provider to use. */
  readonly altitudeDataProvider: AltitudeDataProvider;
  /** The inertial data provider to use. */
  readonly inertialDataProvider: InertialDataProvider;
  /** The FMS. */
  readonly fms: Epic2Fms;
  /** The fix info manager. */
  readonly fixInfo?: Epic2FixInfoManager;
  /** The modal service */
  readonly modalService: ModalService;
  /** The active flight plan store */
  readonly store: FlightPlanStore
}

/** The MfdMap component. */
export class MfdMap extends DisplayComponent<MfdMapProps> {
  private readonly navMapContainerRef = FSComponent.createRef<HTMLDivElement>();

  private readonly terrWxContrast = Subject.create(1);

  private mapSystem: CompiledMapSystem<Epic2MapModules, any, any, any>;

  /** @inheritdoc */
  constructor(props: MfdMapProps) {
    super(props);
    this.mapSystem = this.buildMapSystem().build('map-system');

    this.props.mapDataProvider.initMapProjection(this.mapSystem.context.projection);
    // this.verticalDeviationDataProvider.init();
  }

  /**
   * Builds the map system for the navigation map.
   * @returns The configured map system builder.
   */
  private buildMapSystem(): MapSystemBuilder<Epic2MapModules, any, any, any> {

    const epicMapBuilder = new EpicMapBuilder(
      this.props.bus,
      this.props.mapDataProvider,
      'MFD',
      this.props.facLoader,
      this.props.flightPlanner,
      // this.props.activeRoutePredictor,
      // this.props.perfPlanRepository,
      this.props.tcas,
    );

    return (
      MapSystemBuilder.create(this.props.bus)
        .withBing(
          'map-mfd-bing-id',
          { opacity: this.terrWxContrast },
          undefined,
          'bing-map',
        )

        .with(epicMapBuilder.withEpic2MapStyles)

        .with(epicMapBuilder.withTerrainColors)
        .withModule(
          EpicMapKeys.NdDataProvider,
          () => this.props.mapDataProvider,
        )
        .withModule(
          MapSystemKeys.AutopilotProps,
          () => new MapAutopilotPropsModule(),
        )
        .withController(
          MapSystemKeys.AutopilotProps,
          (context) => new MapAutopilotPropsController(context),
        )

        // .withLayer(EpicMapKeys.CompassArcLowerLayer, context =>
        //   <MapCompassLowerLayer type="arc" model={context.model} mapProjection={context.projection}
        //     ndDataProvider={this.ndDataProvider} compassRadius={this.compassArcRadius.get()} compassSvgSize={this.compassArcSvgSize} />
        // )
        // .withLayer(EpicMapKeys.CompassCenterLowerLayer, context =>
        //   <MapCompassLowerLayer type="ctr" model={context.model} mapProjection={context.projection}
        //     ndDataProvider={this.ndDataProvider} compassRadius={this.compassCenterRadius.get()} compassSvgSize={this.compassCenterSvgSize} />
        // )
        // .withLayer(EpicMapKeys.PlanLowerLayer, context =>
        //   <MapPlanLowerLayer model={context.model} mapProjection={context.projection}
        //     ndDataProvider={this.ndDataProvider} compassRadius={this.planCompassRadius} />
        // )

        .with(epicMapBuilder.withNearestWaypoints, this.props.bus, this.props.mapDataProvider)

        .with(epicMapBuilder.withFlightPlans, this.props.flightPlanner, this.props.perfPlanRepository, this.props.mapDataProvider)
        .with(epicMapBuilder.withTraffic)
        .withController(EpicMapKeys.TrafficController, (context) => new MapTrafficController(context, this.props.settings.getSetting('trafficEnabled'), this.props.settings.getSetting('tcasTrendVectorEnabled')))
        .with(epicMapBuilder.withTopOfDescent)

        // .with(epicMapBuilder.withMapSelectWpt)

        // .with(epicMapBuilder.positionTrendVector, { minRangeVisible: 10, strokeWidth: MapSystemCommon.strokeWidth, outlineWidth: MapSystemCommon.outlineWidth })

        // .with(epicMapBuilder.withAltitudeArc, 285, 70)

        .withLayer(EpicMapKeys.NorthUpOverlay, (context) => (
          <NorthUpModeMapLayer
            model={context.model}
            mapProjection={context.projection}
            settings={this.props.settings}
            bus={this.props.bus}
            mapDataProvider={this.props.mapDataProvider}
          />
        ))

        .withLayer(EpicMapKeys.HeadingTrackUpOverlay, (context) => (
          <HdgTrkUpModeMapLayer
            model={context.model}
            mapProjection={context.projection}
            settings={this.props.settings}
            bus={this.props.bus}
            mapDataProvider={this.props.mapDataProvider}
            headingDataProvider={this.props.headingDataProvider}
            autopilotDataProvider={this.props.autopilotDataProvider}
            altitudeDataProvider={this.props.altitudeDataProvider}
            inertialDataProvider={this.props.inertialDataProvider}
          />
        ))

        .with(epicMapBuilder.withAirplaneIcon)
        .withFollowAirplane()
        .withRotation()
        .withController(
          EpicMapKeys.MapFormatController,
          (context) =>
            new UpperMfdFormatController(context, this.props.settings),
        )
        .withController<PlanFormatController, any, any, any, PlanFormatControllerContext>(
          EpicMapKeys.PlanFormatController,
          context => new PlanFormatController(context, this.props.flightPlanner, this.props.settings)
        )
        .withController(
          EpicMapKeys.RangeController,
          (context) =>
            new MapRangeController(
              context,
              this.props.settings.getSetting('mapRange')
            ),
        )
        .with(epicMapBuilder.withWaypointDisplayController, this.props.settings, this.props.fixInfo)
        // .withController<PlanFormatController, any, any, any, PlanFormatControllerContext>(
        //   EpicMapKeys.PlanFormatController, context => new PlanFormatController(context, this.props.mfdIndex, this.props.flightPlanner, this.ndDataProvider)
        // )

        .withProjectedSize(
          new Float64Array([
            UpperMfdPaneSizes.twoThirds.width,
            UpperMfdPaneSizes.twoThirds.height,
          ]),
        )
        .withClockUpdate(30)
    );
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    // TODO do stuff
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.navMapContainerRef} class="map-container">
        <SectionOutline bus={this.props.bus}>
          {this.mapSystem.map}
          <MfdMapSideButtons modalService={this.props.modalService} bus={this.props.bus} settings={this.props.settings} />
          <MfdMapTopButtons settings={this.props.settings} />
          <FmsMessageWindow bus={this.props.bus} />
          <ActivatePlanButtonBar fms={this.props.fms} />
          <HoldButton fms={this.props.fms} bus={this.props.bus} store={this.props.store} />
          <VectorsButton fms={this.props.fms} bus={this.props.bus} store={this.props.store} />
        </SectionOutline>
      </div>
    );
  }
}

/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CompiledMapSystem, ComponentProps, DisplayComponent, EventBus, FacilityLoader, FlightPlanner, FSComponent, MapAutopilotPropsModule, MapSystemBuilder,
  MapSystemKeys, Subject, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import {
  AutopilotDataProvider, Epic2MapModules, Epic2TcasII, EpicMapBuilder, EpicMapKeys, HeadingDataProvider, HsiFormatController, MapAutopilotPropsController, MapDataProvider,
  MapRangeController, MapSystemCommon, MapTrafficController, NavigationSourceDataProvider, PfdAliasedUserSettingTypes
} from '@microsoft/msfs-epic2-shared';

import { HsiMapLayer } from './HsiMapLayer';

/** The properties for the {@link HsiMap} component. */
interface HsiMapProps extends ComponentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;
  /** An instance of the flight planner. */
  readonly flightPlanner: FlightPlanner;
  /** An instance of the facility loader. */
  readonly facLoader: FacilityLoader;
  // /** The mfd nav indicators for the vor pointers. */
  // readonly navIndicators: EpicNavIndicators;
  /** An instance of TCAS. */
  readonly tcas: Epic2TcasII;
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
  /** The heading data provider to use. */
  readonly headingDataProvider: HeadingDataProvider;
  /** The autopilot data provider to use. */
  readonly autopilotDataProvider: AutopilotDataProvider;
  /** The navigation source data provider to use. */
  readonly navigationSourceDataProvider: NavigationSourceDataProvider;
  /** The instrument index. */
  readonly instrumentIndex: number;
}

/** The HsiMap component. */
export class HsiMap extends DisplayComponent<HsiMapProps> {
  private readonly navMapContainerRef = FSComponent.createRef<HTMLDivElement>();

  private readonly terrWxContrast = Subject.create(1);

  private mapSystem: CompiledMapSystem<Epic2MapModules, any, any, any>;

  /** @inheritdoc */
  constructor(props: HsiMapProps) {
    super(props);
    this.mapSystem = this.buildMapSystem().build('map-system');

    // this.ndDataProvider.initMapProjection(this.mapSystem.context.projection);
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
      'PFD',
      this.props.facLoader,
      this.props.flightPlanner,
      // this.props.activeRoutePredictor,
      // this.props.perfPlanRepository,
      this.props.tcas,
    );

    return (
      MapSystemBuilder.create(this.props.bus)
        .withBing(
          'map-pfd-bing-id-' + this.props.instrumentIndex,
          { opacity: this.terrWxContrast },
          undefined,
          'bing-map',
        )

        // .with(epicMapBuilder.withBoeingMapStyles)

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

        // .with(epicMapBuilder.withPlanAirportsRunways)

        // .with(epicMapBuilder.withNearestWaypoints)

        // .with(epicMapBuilder.withFlightPlans)

        // .with(epicMapBuilder.withTopOfDescent, this.props.fixInfo)

        // .with(epicMapBuilder.withMapSelectWpt)

        // .with(epicMapBuilder.positionTrendVector, { minRangeVisible: 10, strokeWidth: MapSystemCommon.strokeWidth, outlineWidth: MapSystemCommon.outlineWidth })

        // .with(epicMapBuilder.withAltitudeArc, 285, 70)

        // .withLayer(EpicMapKeys.NorthUpOverlay, (context) => (
        //   <NorthUpModeMapLayer
        //     model={context.model}
        //     mapProjection={context.projection}
        //     settings={this.props.settings}
        //     bus={this.props.bus}
        //   />
        // ))

        .withLayer(EpicMapKeys.HsiOverlay, (context) => (
          <HsiMapLayer
            model={context.model}
            mapProjection={context.projection}
            settings={this.props.settings}
            bus={this.props.bus}
            mapDataProvider={this.props.mapDataProvider}
            headingDataProvider={this.props.headingDataProvider}
            autopilotDataProvider={this.props.autopilotDataProvider}
            navigationSourceDataProvider={this.props.navigationSourceDataProvider}
          />
        ))

        // .withLayer(EpicMapKeys.CompassArcUpperLayer, context =>
        //   <MapCompassUpperLayer type="arc" model={context.model} mapProjection={context.projection}
        //     ndDataProvider={this.ndDataProvider} compassRadius={this.compassArcRadius.get()} compassSvgSize={this.compassArcSvgSize} />
        // )
        // .withLayer(EpicMapKeys.CompassCenterUpperLayer, context =>
        //   <MapCompassUpperLayer type="ctr" model={context.model} mapProjection={context.projection}
        //     ndDataProvider={this.ndDataProvider} compassRadius={this.compassCenterRadius.get()} compassSvgSize={this.compassCenterSvgSize} />
        // )
        // .withLayer(EpicMapKeys.PlanUpperLayer, context =>
        //   <MapPlanUpperLayer model={context.model} mapProjection={context.projection}
        //     ndDataProvider={this.ndDataProvider} compassRadius={this.planCompassRadius} />
        // )

        .with(epicMapBuilder.withAirplaneIcon)
        .withFollowAirplane()
        .withRotation()
        .withController(
          EpicMapKeys.MapFormatController,
          (context) =>
            new HsiFormatController(context, this.props.settings),
        )
        .withController(
          EpicMapKeys.RangeController,
          (context) =>
            new MapRangeController(
              context,
              this.props.settings.getSetting('hsiRange'),
            ),
        )
        // .with(epicMapBuilder.withWaypointDisplayController, this.props.fixInfo)
        // .withController<PlanFormatController, any, any, any, PlanFormatControllerContext>(
        //   EpicMapKeys.PlanFormatController, context => new PlanFormatController(context, this.props.mfdIndex, this.props.flightPlanner, this.ndDataProvider)
        // )
        .with(epicMapBuilder.withTraffic)
        .withController(EpicMapKeys.TrafficController, (context) => new MapTrafficController(context, this.props.settings.getSetting('trafficEnabled')))

        .withProjectedSize(
          new Float64Array([
            MapSystemCommon.hsiMapWidth,
            MapSystemCommon.hsiMapHeight,
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
        {this.mapSystem.map}
      </div>
    );
  }
}

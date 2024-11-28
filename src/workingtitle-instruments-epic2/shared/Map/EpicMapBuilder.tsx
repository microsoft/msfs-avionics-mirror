/* eslint-disable max-len */
import {
  EventBus, FacilityLoader, FlightPlanner, FSComponent, ImageCache, MapOwnAirplaneIconModule, MapOwnAirplaneLayer, MapOwnAirplaneLayerModules,
  MapOwnAirplanePropsModule, MapSystemBuilder, MapSystemKeys, MapTerrainColorsModule, PerformancePlanRepository, Subject, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { Epic2FlightPlans } from '../Fms';
import { Epic2FixInfoManager } from '../Fms/Epic2FixInfoManager';
import { Epic2PerformancePlan } from '../Performance';
import { MfdAliasedUserSettingTypes } from '../Settings';
import { Epic2TcasII } from '../Traffic';
import { VNavDataController } from './Controllers/BoeingVNavDataController';
import { MapTerrainColorsController } from './Controllers/MapTerrainColorsController';
import { MapWaypointDisplayController, WaypointDisplayControllerContext, WaypointDisplayControllerModules } from './Controllers/MapWaypointDisplayController';
import { EpicMapKeys } from './EpicMapKeys';
import { MapDataProvider } from './MapDataProvider';
import { MapSystemCommon } from './MapSystemCommon';
import { MapSystemConfig } from './MapSystemConfig';
import { MapTodLayer } from './MapTodLayer';
import { MapStylesModule } from './Modules';
import { Epic2MapTrafficModule } from './Modules/Epic2MapTrafficModule';
import { MapTerrainWeatherStateModule } from './Modules/MapTerrainWeatherStateModule';
import { VNavDataModule } from './Modules/VNavDataModule';

import './Map.css';

ImageCache.addToCache('DOT', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/dot.png');
ImageCache.addToCache('AIRPORT_DOT', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/airport_dot.png');
ImageCache.addToCache('AIRPORT', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/airport.png');
ImageCache.addToCache('INTERSECTION', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/intersection.png');
ImageCache.addToCache('NDB', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/ndb.png');
ImageCache.addToCache('VOR', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/vor.png');
ImageCache.addToCache('DME', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/dme.png');
ImageCache.addToCache('VORDME', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/vordme.png');
ImageCache.addToCache('VORTAC', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/vortac.png');
ImageCache.addToCache('TACAN', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/tacan.png');
ImageCache.addToCache('FLIGHTPLAN', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/flightplan.png');
ImageCache.addToCache('FLIGHTPLAN_M', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/flightplan_m.png');
ImageCache.addToCache('FLIGHTPLAN_G', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/flightplan_g.png');
ImageCache.addToCache('FLIGHTPLAN_C', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/flightplan_c.png');
ImageCache.addToCache('FLIGHTPLAN_CIRCLE_WHITE', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/flightplan_circle_white.png');
ImageCache.addToCache('FLIGHTPLAN_CIRCLE_MAGENTA', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/flightplan_circle_magenta.png');
ImageCache.addToCache('FLIGHTPLAN_CIRCLE_GREEN', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/flightplan_circle_green.png');
ImageCache.addToCache('FLIGHTPLAN_CIRCLE_CYAN', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/flightplan_circle_green.png');
ImageCache.addToCache('TOD', 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/tod.png');

/** Collection of function to help build boeing map systems. */
export class EpicMapBuilder {
  private readonly mapSystemConfig = new MapSystemConfig(MapSystemCommon.mapStyles);

  /**
   * Creates a new EpicMapBuilder.
   * @param bus the event bus.
   * @param mapDataProvider The nd data provider.
   * @param pfdOrMfd pfd or mfd.
   * @param facLoader the fac loader.
   * @param flightPlanner the flight planner.
   * @param tcas The Tcas instance.
  //  * @param activeRoutePredictor The active route predictor.
  //  * @param perfPlanRepository The perfPlanRepository.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly mapDataProvider: MapDataProvider,
    private readonly pfdOrMfd: 'PFD' | 'MFD',
    private readonly facLoader: FacilityLoader,
    private readonly flightPlanner: FlightPlanner,
    private readonly tcas: Epic2TcasII,
    // private readonly activeRoutePredictor: FlightPlanPredictionsProvider,
    //private readonly perfPlanRepository: PerformancePlanRepository,
  ) { }

  /**
   * Add the altitude arc.
   * @param builder The map system builder.
   * @returns The map system builder, after it has been configured.
   */
  public readonly withEpic2MapStyles = (builder: MapSystemBuilder): MapSystemBuilder => {
    return builder
      .withModule(EpicMapKeys.MapStyles, () => new MapStylesModule(MapSystemCommon.mapStyles));
  };

  /**
   * Adds the terrain colors module.
   * @param builder The map system builder.
   * @returns The map system builder, after it has been configured.
   */
  public readonly withTerrainColors = (
    builder: MapSystemBuilder,
  ): MapSystemBuilder => {
    return builder
      .withModule(MapSystemKeys.TerrainColors, () => new MapTerrainColorsModule())
      .withModule(EpicMapKeys.TerrainWeatherState, () => new MapTerrainWeatherStateModule())
      .withController(MapSystemKeys.TerrainColors, context => new MapTerrainColorsController(context));
  };

  /**
   * The map builder for the airplane icon.
   * @param builder The map system builder.
  //  * @param ownshipTriPath File path to the triangle ownship icon.
   * @returns The map system builder, after it has been configured.
   */
  public readonly withAirplaneIcon = (
    builder: MapSystemBuilder,
    // ownshipTriPath: string,
  ): MapSystemBuilder => {
    builder = builder
      .withOwnAirplanePropBindings([
        'position',
        'hdgTrue',
        'trackTrue',
        'altitude',
        'verticalSpeed',
        'groundSpeed',
        'isOnGround',
        'turnRate',
      ], 30)
      .withModule(MapSystemKeys.OwnAirplaneProps, () => new MapOwnAirplanePropsModule())
      .withModule(MapSystemKeys.OwnAirplaneIcon, () => new MapOwnAirplaneIconModule())
      .withLayer<MapOwnAirplaneLayer, MapOwnAirplaneLayerModules>(EpicMapKeys.OwnShipTriLayer, (context): VNode => {
        const imageFilePath = Subject.create<string>('');
        const iconSize = Subject.create<number>(0);
        const iconAnchor = Subject.create(new Float64Array([0, 0]));

        imageFilePath.set('coui://html_ui/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/pc12-airplane-map.png');
        iconSize.set(50);
        iconAnchor.set(new Float64Array([0.5, 0.5]));

        return (
          <MapOwnAirplaneLayer
            model={context.model}
            mapProjection={context.projection}
            imageFilePath={imageFilePath}
            iconSize={iconSize}
            iconAnchor={iconAnchor}
            class={'airplane-symbol-tri'}
          />
        );
      });

    return builder;
  };

  /**
   * Add the nearest waypoints layer.
   * @param builder The map system builder.
   * @param bus The event bus.
   * @param mapDataProvider The map data provider.
   * @returns The map system builder, after it has been configured.
   */
  public readonly withNearestWaypoints = (builder: MapSystemBuilder, bus: EventBus, mapDataProvider: MapDataProvider): MapSystemBuilder => {
    return builder
      .withNearestWaypoints(this.mapSystemConfig.configureMapWaypoints(bus, mapDataProvider), false, undefined, 'nearest-waypoints');
  };

  /**
   * Add the waypoint display controller.
   * @param builder The map system builder.
   * @param mfdSettings The mfd settings.
   * @param fixInfo The fix info manager.
   * @returns The map system builder, after it has been configured.
   */
  public readonly withWaypointDisplayController = (builder: MapSystemBuilder, mfdSettings: UserSettingManager<MfdAliasedUserSettingTypes>, fixInfo?: Epic2FixInfoManager): MapSystemBuilder => {
    return builder
      .withController<MapWaypointDisplayController, WaypointDisplayControllerModules, any, any, WaypointDisplayControllerContext>(
        MapSystemKeys.WaypointDisplayController, context => new MapWaypointDisplayController(context, this.mapDataProvider.mapWaypointsDisplay, this.pfdOrMfd, mfdSettings, fixInfo));
  };

  /**
   * Add the plan airports and runways
   * @param builder The map system builder.
   * @param flightPlanner the flight planner.
   * @param perfPlanRepository The perfPlanRepository.
   * @param mapDataProvider The nd data provider.
   * @returns The map system builder, after it has been configured.
   */
  public readonly withFlightPlans = (
    builder: MapSystemBuilder,
    flightPlanner: FlightPlanner,
    perfPlanRepository: PerformancePlanRepository<Epic2PerformancePlan>,
    mapDataProvider: MapDataProvider,
  ): MapSystemBuilder => {
    const vnavDataModule = new VNavDataModule();

    return builder
      .withInit('init-flight-plans', context => {
        if (flightPlanner.hasFlightPlan(Epic2FlightPlans.Active)) {
          // Init the flight plans in case the plans already exist
          context.model.getModule(MapSystemKeys.FlightPlan)
            .getPlanSubjects(Epic2FlightPlans.Active)
            .flightPlan.set(flightPlanner.getFlightPlan(Epic2FlightPlans.Active));
          context.model.getModule(MapSystemKeys.FlightPlan)
            .getPlanSubjects(Epic2FlightPlans.Pending)
            .flightPlan.set(flightPlanner.getFlightPlan(Epic2FlightPlans.Pending));
        }
      })
      .withFlightPlan(this.mapSystemConfig.configureModFlightPlan(this.bus),
        flightPlanner, Epic2FlightPlans.Pending, false, undefined, 'flight-plan-layer mod-flight-plan-map-layer')
      .withFlightPlan(this.mapSystemConfig.configureFlightPlan(this.bus, mapDataProvider, vnavDataModule, /*this.activeRoutePredictor, */perfPlanRepository),
        flightPlanner, Epic2FlightPlans.Active, false, undefined, 'flight-plan-layer active-flight-plan-map-layer')
      .withModule(EpicMapKeys.VNavData, () => vnavDataModule)
      .withController(EpicMapKeys.VNavData, context => new VNavDataController(context));
  };

  /**
   * Add the TOD & TOC to the map.
   * @param builder The map system builder.
   * @returns The map system builder, after it has been configured.
   */
  public readonly withTopOfDescent = (builder: MapSystemBuilder): MapSystemBuilder => builder
    .withLayer('tod', context => <MapTodLayer
      bus={context.bus}
      model={context.model}
      mapProjection={context.projection}
      waypointRenderer={context[MapSystemKeys.WaypointRenderer]}
      planner={this.flightPlanner}
    />
    );

  /**
   * Add the map select waypoint layer.
   * @param builder The map system builder.
   * @returns The map system builder, after it has been configured.
   */
  public readonly withTraffic = (
    builder: MapSystemBuilder,
  ): MapSystemBuilder => {
    return builder
      .withTraffic(
        this.tcas,
        this.mapSystemConfig.createTrafficIntruderIcon(),
        this.mapSystemConfig.initTrafficLayerCanvasStyles,
        undefined,
        undefined,
        'traffic',
      )
      .withModule(MapSystemKeys.Traffic, () => new Epic2MapTrafficModule(this.tcas));

  };
}

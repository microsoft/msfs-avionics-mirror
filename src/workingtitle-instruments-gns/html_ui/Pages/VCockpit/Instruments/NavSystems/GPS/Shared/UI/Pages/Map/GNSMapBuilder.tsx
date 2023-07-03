

import {
  BitFlags, DefaultLodBoundaryCache, EventBus, FlightPlanDisplayBuilder, FlightPlanner, FSComponent, IntersectionType, MapAirspaceModule, MapDataIntegrityModule,
  MapFlightPlanModule, MapOwnAirplaneIconOrientation, MapSystemBuilder, MapSystemFlightPlanLayer, MapSystemIconFactory, MapSystemKeys, MapSystemLabelFactory,
  MapSystemPlanRenderer, MapSystemWaypointRoles, MapSystemWaypointsRenderer, MapWaypointDisplayModule, NumberUnit, TcasAdvisoryDataProvider, UnitType, Vec2Math
} from '@microsoft/msfs-sdk';

import { GarminAirspaceShowTypeMap, GarminMapBuilder, MapUnitsModule, TrafficSystem } from '@microsoft/msfs-garminsdk';

import { GNSSettingsProvider } from '../../../Settings/GNSSettingsProvider';
import { GNSType } from '../../../UITypes';
import { AirportRunwayDisplayModule } from './AirportRunwayDisplayModule';
import { AirportRunwayLayer } from './AirportRunwayLayer';
import { CompassNorthLayer } from './CompassNorthLayer';
import { GNSMapIndexedRangeModule } from './GNSMapIndexedRangeModule';
import { GNSMapContextProps, GNSMapControllers, GNSMapKeys, GNSMapLayers, GNSMapModules, GNSTrafficIcons } from './GNSMapSystem';
import { MapAirspaceRendering } from './MapAirspaceRendering';
import { MapRangeCompassLayer } from './MapRangeCompassLayer';
import { MapSystemConfig, OwnshipIconPath } from './MapSystemConfig';
import { NoGpsPositionLayer } from './NoGpsPositionLayer';
import { ObsLayer } from './ObsLayer';
import { RangeLegendLayer } from './RangeLegendLayer';
import { TrafficBannerLayer } from './TrafficBannerLayer';
import { WaypointBearingModule } from './WaypointBearingModule';
import { MapDeclutterModule } from './MapDeclutterModule';

/**
 * A class that builds GNS map system maps.
 */
export class GNSMapBuilder {
  private static readonly WT530_PREVIEW_MAP_HEIGHT = 188;
  private static readonly WT430_PREVIEW_MAP_HEIGHT = 144;
  private static readonly WT530_RANGE_SIMVAR = 'L:AS530_Default_MapZoomRange';
  private static readonly WT430_RANGE_SIMVAR = 'L:AS430_MapZoomRange';

  /**
   * Creates an arc nav map.
   * @param bus The event bus to use with this map.
   * @param flightPlanner The flight planner to use for flight plan display.
   * @param settingsProvider The GNS system settings provider.
   * @param gnsType The GNS type (430 or 530) that this map will display on.
   * @param instrumentIndex The index of this instrument.
   * @param trafficSystem The GNS traffic system to use to provide traffic data.
   * @param tcasDataProvider The GNS TA data provider to use to provide TA sets.
   * @returns The modified builder.
   */
  public static withArcMap(bus: EventBus, flightPlanner: FlightPlanner, settingsProvider: GNSSettingsProvider, gnsType: GNSType,
    instrumentIndex: number, trafficSystem: TrafficSystem, tcasDataProvider: TcasAdvisoryDataProvider):
    MapSystemBuilder<GNSMapModules, GNSMapLayers, GNSMapControllers, GNSMapContextProps> {
    const builder = MapSystemBuilder.create(bus)
      .withBing(`${gnsType}_${instrumentIndex}-navmap`)
      .withProjectedSize(Vec2Math.create(255, 138))
      .withTargetOffset(Vec2Math.create(0, 60))
      .with(b => GNSMapBuilder.airportRunways(b, gnsType))
      .withModule(GNSMapKeys.Range, () => new GNSMapIndexedRangeModule())
      .withModule(GNSMapKeys.Units, () => new MapUnitsModule())
      .withModule(GNSMapKeys.WaypointBearing, () => new WaypointBearingModule())
      .withModule(MapSystemKeys.DataIntegrity, () => new MapDataIntegrityModule())
      .withModule(GNSMapKeys.Declutter, () => new MapDeclutterModule())
      .withAirspaces(DefaultLodBoundaryCache.getCache(), GarminAirspaceShowTypeMap.MAP, MapAirspaceRendering.selectRenderer, MapAirspaceRendering.renderOrder)
      .withNearestWaypoints(MapSystemConfig.configureWaypoints(bus, settingsProvider, gnsType), true)
      .withInit<{
        /** Nearest waypoint display module. */
        [MapSystemKeys.NearestWaypoints]: MapWaypointDisplayModule
      }>('intersectionFilter', context => {
        context.model.getModule(MapSystemKeys.NearestWaypoints).intersectionsFilter.set({
          typeMask: BitFlags.union(
            BitFlags.createFlag(IntersectionType.None),
            BitFlags.createFlag(IntersectionType.Named),
            BitFlags.createFlag(IntersectionType.Unnamed),
            BitFlags.createFlag(IntersectionType.Offroute),
            BitFlags.createFlag(IntersectionType.IAF),
            BitFlags.createFlag(IntersectionType.FAF),
            BitFlags.createFlag(IntersectionType.RNAV)
          ),
          showTerminalWaypoints: true
        });
      })
      .withOwnAirplaneIcon(gnsType === 'wt430' ? 22 : 16, OwnshipIconPath, Vec2Math.create(0.5, 0.5))
      .withOwnAirplaneIconOrientation(MapOwnAirplaneIconOrientation.TrackUp)
      .withFlightPlan(MapSystemConfig.configureFlightPlan(settingsProvider, gnsType, bus), flightPlanner, 0, true)
      .withFlightPlan(MapSystemConfig.configureFlightPlan(settingsProvider, gnsType, bus), flightPlanner, 1, true)
      .withLayer(GNSMapKeys.Obs, c => <ObsLayer bus={bus} model={c.model} mapProjection={c.projection} />)
      .with(GarminMapBuilder.traffic, trafficSystem, GNSTrafficIcons.IconOptions(gnsType), false)
      .withLayer(GNSMapKeys.TrafficBanner, c => <TrafficBannerLayer model={c.model} tcasDataProvider={tcasDataProvider} mapProjection={c.projection} />)
      .withLayer(GNSMapKeys.RangeLegend, c => <RangeLegendLayer model={c.model} mapProjection={c.projection} />)
      .withLayer(MapSystemKeys.DataIntegrity, c => <NoGpsPositionLayer model={c.model} mapProjection={c.projection} />)
      .withLayer(GNSMapKeys.CompassArc, c => <MapRangeCompassLayer bus={bus} bearingTickMajorLength={7} arcStrokeColor='cyan' arcStrokeWidth={1}
        bearingTickMinorLength={7} bearingLabelFont='GreatNiftySymbol-Regular' bearingLabelFontSize={10} bearingLabelOutlineColor='black' bearingLabelOutlineWidth={2} bearingLabelFontColor='cyan'
        model={c.model} mapProjection={c.projection} />)
      .withOwnAirplanePropBindings(['position', 'hdgTrue', 'trackTrue', 'isOnGround', 'groundSpeed'], 6)
      .withFollowAirplane()
      .withRotation()
      .withLayerOrder(MapSystemKeys.OwnAirplaneIcon, 100)
      .withClockUpdate(6);

    const rangeModule = new GNSMapIndexedRangeModule(gnsType === 'wt530' ? this.WT530_RANGE_SIMVAR : this.WT430_RANGE_SIMVAR);
    rangeModule.nominalRanges.set([5, 10, 15, 20, 35, 50, 100, 150, 200].map(n => new NumberUnit(n, UnitType.NMILE)));
    rangeModule.setNominalRangeIndex(0);

    return builder.withModule(GNSMapKeys.Range, () => rangeModule);
  }

  /**
   * Creates an standard nav map.
   * @param bus The event bus to use with this map.
   * @param flightPlanner The flight planner to use for flight plan display.
   * @param settingsProvider The GNS system settings provider.
   * @param gnsType The GNS type (430 or 530) that this map will display on.
   * @param instrumentIndex The index of this instrument.
   * @param supportDataIntegrity Whether or not to display the NO GPS POSITION display when data integrity has failed.
   * @param trafficSystem The optional GNS traffic system to use to provide traffic data.
   * @param tcasDataProvider The optional GNS TA data provider to use to provide TA sets.
   * @returns The modified builder.
   */
  public static withStandardMap(bus: EventBus, flightPlanner: FlightPlanner, settingsProvider: GNSSettingsProvider, gnsType: GNSType,
    instrumentIndex: number, supportDataIntegrity: boolean, trafficSystem?: TrafficSystem, tcasDataProvider?: TcasAdvisoryDataProvider):
    MapSystemBuilder<GNSMapModules, GNSMapLayers, GNSMapControllers, GNSMapContextProps> {
    const builder = MapSystemBuilder.create(bus)
      .withBing(`${gnsType}_${instrumentIndex}-navmap`)
      .withTargetOffset(Vec2Math.create(0, 0))
      .with(b => GNSMapBuilder.airportRunways(b, gnsType))
      .withAirspaces(DefaultLodBoundaryCache.getCache(), GarminAirspaceShowTypeMap.MAP, MapAirspaceRendering.selectRenderer, MapAirspaceRendering.renderOrder)
      .withNearestWaypoints(MapSystemConfig.configureWaypoints(bus, settingsProvider, gnsType), true)
      .withInit<{
        /** Nearest waypoint display module. */
        [MapSystemKeys.NearestWaypoints]: MapWaypointDisplayModule
      }>('intersectionFilter', context => {
        context.model.getModule(MapSystemKeys.NearestWaypoints).intersectionsFilter.set({
          typeMask: BitFlags.union(
            BitFlags.createFlag(IntersectionType.None),
            BitFlags.createFlag(IntersectionType.Named),
            BitFlags.createFlag(IntersectionType.Unnamed),
            BitFlags.createFlag(IntersectionType.Offroute),
            BitFlags.createFlag(IntersectionType.IAF),
            BitFlags.createFlag(IntersectionType.FAF),
            BitFlags.createFlag(IntersectionType.RNAV)
          ),
          showTerminalWaypoints: true
        });
      })
      .withFlightPlan(MapSystemConfig.configureFlightPlan(settingsProvider, gnsType, bus), flightPlanner, 0, true)
      .withFlightPlan(MapSystemConfig.configureFlightPlan(settingsProvider, gnsType, bus), flightPlanner, 1, true)
      .withLayer(GNSMapKeys.Obs, c => <ObsLayer bus={bus} model={c.model} mapProjection={c.projection} />)
      .withModule(MapSystemKeys.DataIntegrity, () => new MapDataIntegrityModule())
      .withModule(GNSMapKeys.Declutter, () => new MapDeclutterModule());

    if (trafficSystem !== undefined && tcasDataProvider !== undefined) {
      builder.with(GarminMapBuilder.traffic, trafficSystem, GNSTrafficIcons.IconOptions(gnsType), false)
        .withLayer(GNSMapKeys.TrafficBanner, c => <TrafficBannerLayer model={c.model} tcasDataProvider={tcasDataProvider} mapProjection={c.projection} />);
    }

    if (supportDataIntegrity) {
      builder.withLayer(MapSystemKeys.DataIntegrity, c => <NoGpsPositionLayer model={c.model} mapProjection={c.projection} />);
    }

    builder.withOwnAirplaneIcon(gnsType === 'wt430' ? 22 : 16, OwnshipIconPath, Vec2Math.create(0.5, 0.5))
      .withOwnAirplaneIconOrientation(MapOwnAirplaneIconOrientation.TrackUp)
      .withLayer(GNSMapKeys.RangeLegend, c => <RangeLegendLayer model={c.model} mapProjection={c.projection} />)
      .withLayer(GNSMapKeys.CompassNorth, c => <CompassNorthLayer model={c.model} mapProjection={c.projection} />)
      .withOwnAirplanePropBindings(['position', 'hdgTrue', 'trackTrue', 'isOnGround'], 6)
      .withModule(GNSMapKeys.Range, () => new GNSMapIndexedRangeModule())
      .withFollowAirplane()
      .withRotation()
      .withClockUpdate(6);

    const rangeModule = new GNSMapIndexedRangeModule(gnsType === 'wt530' ? this.WT530_RANGE_SIMVAR : this.WT430_RANGE_SIMVAR);
    rangeModule.nominalRanges.set(
      [500, 1000, 1500, 2000, 3500].map(n => new NumberUnit(n, UnitType.FOOT))
        .concat([1, 2, 3.5, 5, 10, 15, 20, 35, 50, 100, 150, 200].map(n => new NumberUnit(n, UnitType.NMILE))));
    rangeModule.setNominalRangeIndex(8);

    return builder.withModule(GNSMapKeys.Range, () => rangeModule);
  }

  /**
   * Creates an airport page nav map.
   * @param bus The event bus to use with this map.
   * @param settingsProvider The GNS system settings provider.
   * @param gnsType The GNS type (430 or 530) that this map will display on.
   * @param instrumentIndex The index of this instrument.
   * @returns The modified builder.
   */
  public static withAirportMap(bus: EventBus, settingsProvider: GNSSettingsProvider, gnsType: GNSType, instrumentIndex: number):
    MapSystemBuilder<GNSMapModules, GNSMapLayers, GNSMapControllers, GNSMapContextProps> {
    const builder = MapSystemBuilder.create(bus)
      .withBing(`${gnsType}_${instrumentIndex}-navmap`)
      .withProjectedSize(Vec2Math.create(165, gnsType === 'wt530' ? this.WT530_PREVIEW_MAP_HEIGHT : this.WT430_PREVIEW_MAP_HEIGHT))
      .with(b => GNSMapBuilder.airportRunways(b, gnsType))
      .withAirspaces(DefaultLodBoundaryCache.getCache(), GarminAirspaceShowTypeMap.MAP, MapAirspaceRendering.selectRenderer, MapAirspaceRendering.renderOrder)
      .withNearestWaypoints(MapSystemConfig.configureWaypoints(bus, settingsProvider, gnsType), true)
      .withInit<{
        /** Nearest waypoint display module. */
        [MapSystemKeys.NearestWaypoints]: MapWaypointDisplayModule
      }>('intersectionFilter', context => {
        context.model.getModule(MapSystemKeys.NearestWaypoints).intersectionsFilter.set({
          typeMask: BitFlags.union(
            BitFlags.createFlag(IntersectionType.None),
            BitFlags.createFlag(IntersectionType.Named),
            BitFlags.createFlag(IntersectionType.Unnamed),
            BitFlags.createFlag(IntersectionType.Offroute),
            BitFlags.createFlag(IntersectionType.IAF),
            BitFlags.createFlag(IntersectionType.FAF),
            BitFlags.createFlag(IntersectionType.RNAV)
          ),
          showTerminalWaypoints: true
        });
      })
      .withOwnAirplaneIcon(gnsType === 'wt430' ? 22 : 16, OwnshipIconPath, Vec2Math.create(0.5, 0.5))
      .withOwnAirplaneIconOrientation(MapOwnAirplaneIconOrientation.TrackUp)
      .withLayer(GNSMapKeys.RangeLegend, c => <RangeLegendLayer model={c.model} mapProjection={c.projection} />)
      .withOwnAirplanePropBindings(['position', 'hdgTrue', 'trackTrue', 'isOnGround'], 6)
      .withModule(GNSMapKeys.Range, () => new GNSMapIndexedRangeModule())
      .withModule(MapSystemKeys.DataIntegrity, () => new MapDataIntegrityModule())
      .withFollowAirplane()
      .withRotation()
      .withClockUpdate(6);

    const rangeModule = new GNSMapIndexedRangeModule(gnsType === 'wt530' ? this.WT530_RANGE_SIMVAR : this.WT430_RANGE_SIMVAR);
    rangeModule.nominalRanges.set(
      [500, 1000, 1500, 2000, 3500].map(n => new NumberUnit(n, UnitType.FOOT))
        .concat([1, 2, 3.5, 5, 10, 15, 20, 35, 50, 100, 150, 200].map(n => new NumberUnit(n, UnitType.NMILE))));
    rangeModule.setNominalRangeIndex(8);

    return builder.withModule(GNSMapKeys.Range, () => rangeModule);
  }

  /**
   * Creates an procedure preview nav map.
   * @param bus The event bus to use with this map.
   * @param settingsProvider The GNS system settings provider.
   * @param gnsType The GNS type (430 or 530) that this map will display on.
   * @param instrumentIndex The index of this instrument.
   * @returns The modified builder.
   */
  public static withProcedurePreviewMap(bus: EventBus, settingsProvider: GNSSettingsProvider, gnsType: GNSType, instrumentIndex: number):
    MapSystemBuilder<GNSMapModules, GNSMapLayers, GNSMapControllers, GNSMapContextProps> {
    const builder = MapSystemBuilder.create(bus)
      .withBing(`${gnsType}_${instrumentIndex}-navmap`)
      .withProjectedSize(Vec2Math.create(165, gnsType === 'wt530' ? this.WT530_PREVIEW_MAP_HEIGHT : this.WT430_PREVIEW_MAP_HEIGHT))
      .with(b => GNSMapBuilder.airportRunways(b, gnsType))
      .with(GNSMapBuilder.previewPlan, MapSystemConfig.configureProcedurePreviewPlan(settingsProvider, gnsType), MapSystemConfig.configureTransitionPreviewPlan())
      .withLayer(GNSMapKeys.RangeLegend, c => <RangeLegendLayer model={c.model} mapProjection={c.projection} />)
      .withModule(GNSMapKeys.Range, () => new GNSMapIndexedRangeModule())
      .withModule(MapSystemKeys.DataIntegrity, () => new MapDataIntegrityModule())
      .withRotation()
      .withClockUpdate(6);

    const rangeModule = new GNSMapIndexedRangeModule(gnsType === 'wt530' ? this.WT530_RANGE_SIMVAR : this.WT430_RANGE_SIMVAR);
    rangeModule.nominalRanges.set(
      [500, 1000, 1500, 2000, 3500].map(n => new NumberUnit(n, UnitType.FOOT))
        .concat([1, 2, 3.5, 5, 10, 15, 20, 35, 50, 100, 150, 200].map(n => new NumberUnit(n, UnitType.NMILE))));
    rangeModule.setNominalRangeIndex(8);

    return builder.withModule(GNSMapKeys.Range, () => rangeModule);
  }

  /**
   * Adds a procedure preview plan to the map system.
   * @param builder The map system builder to add the plan to.
   * @param configureProc The procedure flight plan display configuration.
   * @param configureTransitions The transition flight plan display configuration.
   * @returns The modified builder.
   */
  private static previewPlan(builder: MapSystemBuilder<GNSMapModules, GNSMapLayers, GNSMapControllers, GNSMapContextProps>,
    configureProc: (b: FlightPlanDisplayBuilder) => void,
    configureTransitions: (b: FlightPlanDisplayBuilder) => void): MapSystemBuilder {
    builder.withModule(MapSystemKeys.FlightPlan, () => new MapFlightPlanModule())
      .withModule(MapSystemKeys.NearestWaypoints, () => new MapWaypointDisplayModule())
      .withModule(MapSystemKeys.Airspace, () => new MapAirspaceModule(GarminAirspaceShowTypeMap.MAP))
      .withTargetControlModerator()
      .withContext(MapSystemKeys.IconFactory, () => new MapSystemIconFactory())
      .withContext(MapSystemKeys.LabelFactory, () => new MapSystemLabelFactory())
      .withWaypoints()
      .withContext(MapSystemKeys.FlightPathRenderer, () => new MapSystemPlanRenderer(1))
      .withLayer(`${MapSystemKeys.FlightPlan}_0`, c =>
        <MapSystemFlightPlanLayer
          bus={c.bus}
          waypointRenderer={c.waypointRenderer}
          iconFactory={c.iconFactory}
          labelFactory={c.labelFactory}
          flightPathRenderer={c.flightPathRenderer}
          planIndex={0}
          model={c.model}
          mapProjection={c.projection} />)
      .withLayer(`${MapSystemKeys.FlightPlan}_1`, c =>
        <MapSystemFlightPlanLayer
          bus={c.bus}
          waypointRenderer={c.waypointRenderer}
          iconFactory={c.iconFactory}
          labelFactory={c.labelFactory}
          flightPathRenderer={c.flightPathRenderer}
          planIndex={1}
          model={c.model}
          mapProjection={c.projection} />)
      .withTextLayer(false)
      .withInit(MapSystemKeys.FlightPlan, c => {
        const procBuilder = new FlightPlanDisplayBuilder(
          c.iconFactory,
          c.labelFactory,
          c.waypointRenderer,
          c.flightPathRenderer,
          0
        );

        const transitionBuilder = new FlightPlanDisplayBuilder(
          c.iconFactory,
          c.labelFactory,
          c.waypointRenderer,
          c.flightPathRenderer,
          1
        );

        c[MapSystemKeys.WaypointRenderer].insertRenderRole(MapSystemWaypointRoles.FlightPlan, MapSystemWaypointRoles.Normal, undefined, `${MapSystemWaypointRoles.FlightPlan}_0`);
        c[MapSystemKeys.WaypointRenderer].insertRenderRole(MapSystemWaypointRoles.FlightPlan, MapSystemWaypointRoles.Normal, undefined, `${MapSystemWaypointRoles.FlightPlan}_1`);

        configureProc(procBuilder);
        configureTransitions(transitionBuilder);
      });

    return builder;
  }

  /**
   * Adds airport runway vector display to the map.
   *
   * Adds the following...
   *
   * Modules:
   * * `[GNSMapKeys.Runways]: AirportRunwayDisplayModule`
   *
   * Layers:
   * * `[MapSystemKeys.TextLayer]: MapCullableTextLayer`
   * * `[GNSMapKeys.Runways]: AirportRunwayLayer`
   *
   * Context Properties:
   * * `[MapSystemKeys.TextManager]: MapCullableTextLabelManager`
   * * `[MapSystemKeys.WaypointRenderer]: MapSystemWaypointsRenderer`
   *
   * @param builder The builder to use.
   * @param gnsType The type of GNS unit to display the runways on.
   * @returns The modified builder.
   */
  public static airportRunways(builder: MapSystemBuilder, gnsType: GNSType): MapSystemBuilder {
    return builder
      .withTextLayer(true)
      .withWaypoints()
      .withModule(GNSMapKeys.Runways, () => new AirportRunwayDisplayModule())
      /* eslint-disable jsdoc/require-jsdoc */
      .withLayer<any, any, { [MapSystemKeys.WaypointRenderer]: MapSystemWaypointsRenderer }>(GNSMapKeys.Runways,
        ctx => <AirportRunwayLayer waypointRenderer={ctx[MapSystemKeys.WaypointRenderer]} model={ctx.model} mapProjection={ctx.projection} gnsType={gnsType} />);
  }
}
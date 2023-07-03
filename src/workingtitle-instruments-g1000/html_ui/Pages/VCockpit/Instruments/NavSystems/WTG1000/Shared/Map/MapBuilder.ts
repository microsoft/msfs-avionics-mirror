import { MapSystemBuilder, MapSystemKeys, ReadonlyFloat64Array, Vec2Math } from '@microsoft/msfs-sdk';

import {
  NextGenHsiMapBuilder, NextGenHsiMapOptions, NextGenNavMapBuilder, NextGenNavMapOptions, NextGenNearestMapBuilder, NextGenNearestMapOptions,
  NextGenProcMapBuilder, NextGenProcMapOptions, NextGenTrafficMapOptions, NextGenWaypointMapBuilder, NextGenWaypointMapOptions, TrafficMapBuilder
} from '@microsoft/msfs-garminsdk';

import { MapDataIntegrityController, MapDataIntegrityControllerModules } from './Controllers/MapDataIntegrityController';

import './Layers/MapCrosshairLayer.css';
import './Layers/MapPointerInfoLayer.css';
import './Layers/MapPointerLayer.css';
import './Indicators/MapBannerIndicator.css';
import './Indicators/MapDetailIndicator.css';
import './Indicators/MapOrientationIndicator.css';
import './Indicators/MapRelativeTerrainStatusIndicator.css';
import './Indicators/MapTerrainScaleIndicator.css';
import './Indicators/MapTrafficFailedIndicator.css';
import './Indicators/MapTrafficOffScaleIndicator.css';
import './Indicators/MapTrafficRelativeTerrainStatusIndicatorContainer.css';
import './Indicators/MapTrafficStatusIndicator.css';
import './Indicators/TrafficMapAdsbModeIndicator.css';
import './Indicators/TrafficMapAdsbOffBannerIndicator.css';
import './Indicators/TrafficMapAltitudeModeIndicator.css';
import './Indicators/TrafficMapFailedBannerIndicator.css';
import './Indicators/TrafficMapOperatingModeIndicator.css';
import './Indicators/TrafficMapStandbyBannerIndicator.css';
import './Map.css';
import './MapRangeDisplay.css';
import '../../Shared/UI/Common/LatLonDisplay.css';

/**
 * Options for the map's own airplane icon.
 */
export type MapOwnAirplaneIconOptions = {
  /** The size of the icon. */
  airplaneIconSize: number;

  /** The URI of the icon's image asset. */
  airplaneIconSrc: string;

  /** The anchor point of the icon. */
  airplaneIconAnchor: ReadonlyFloat64Array;

  /** The URI of the no-heading icon's image asset. */
  noHeadingAirplaneIconSrc?: string;

  /** The anchor point of the no-heading icon. */
  noHeadingAirplaneIconAnchor?: ReadonlyFloat64Array;
}

/**
 *
 */
export class MapBuilder {
  /**
   * Configures a map builder to generate a G1000 NXi navigation map.
   *
   * The controller `[GarminMapKeys.Range]: MapRangeController` is added to the map context and can be used to control
   * the range of the map.
   *
   * If flight plan focus is supported, the module `[GarminMapKeys.FlightPlanFocus]: MapFlightPlanFocusModule` is added
   * to the map model and can be used to control the focus.
   *
   * If the map pointer is supported, the controller `[GarminMapKeys.Pointer]: MapPointerController` is added to the
   * map context and can be used to control the pointer.
   *
   * The map builder will **not** be configured to apply a custom projected size, dead zone, or to automatically update
   * the map.
   * @param mapBuilder The map builder to configure.
   * @param options Options for configuring the map.
   * @returns The builder, after it has been configured.
   */
  public static navMap<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    options: NextGenNavMapOptions
  ): MapBuilder {
    mapBuilder.with(NextGenNavMapBuilder.build, options);

    if (options.supportDataIntegrity ?? true) {
      mapBuilder.withController<MapDataIntegrityController, MapDataIntegrityControllerModules>(
        MapSystemKeys.DataIntegrity,
        context => new MapDataIntegrityController(context)
      );
    }

    return mapBuilder;
  }

  /**
   * Configures a map builder to generate a G1000 NXi HSI map.
   *
   * The controller `[GarminMapKeys.Range]: MapRangeController` is added to the map context and can be used to control
   * the range of the map.
   *
   * The map builder will **not** be configured to apply a custom projected size, dead zone, or to automatically update
   * the map.
   * @param mapBuilder The map builder to configure.
   * @param options Options for configuring the map.
   * @returns The builder, after it has been configured.
   */
  public static hsiMap<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    options: NextGenHsiMapOptions
  ): MapBuilder {
    mapBuilder.with(NextGenHsiMapBuilder.build, options);

    if (options.supportDataIntegrity ?? true) {
      mapBuilder.withController<MapDataIntegrityController, MapDataIntegrityControllerModules>(
        MapSystemKeys.DataIntegrity,
        context => new MapDataIntegrityController(context)
      );
    }

    return mapBuilder;
  }

  /**
   * Configures a map builder to generate a G1000 NXi waypoint map. The map is locked to
   * a North Up orientation, targets a highlighted waypoint, and follows the player airplane when there is no
   * highlighted waypoint.
   *
   * The module `[GarminMapKeys.WaypointHighlight]: MapWaypointHighlightModule` is added to the map model and can be
   * used to control the highlighted waypoint.
   *
   * The controller `[GarminMapKeys.Range]: MapRangeController` is added to the map context and can be used to control
   * the range of the waypoint map.
   *
   * If the map pointer is supported, the controller `[GarminMapKeys.Pointer]: MapPointerController` is added to the
   * map context and can be used to control the pointer.
   *
   * The map builder will **not** be configured to apply a custom projected size, dead zone, or to automatically update
   * the map.
   * @param mapBuilder The map builder to configure.
   * @param options Options for configuring the map.
   * @returns The builder, after it has been configured.
   */
  public static waypointMap<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    options: NextGenWaypointMapOptions
  ): MapBuilder {
    mapBuilder.with(NextGenWaypointMapBuilder.build, options);

    if (options.supportDataIntegrity ?? true) {
      mapBuilder.withController<MapDataIntegrityController, MapDataIntegrityControllerModules>(
        MapSystemKeys.DataIntegrity,
        context => new MapDataIntegrityController(context)
      );
    }

    return mapBuilder;
  }

  /**
   * Configures a map builder to generate a G1000 NXi nearest waypoint map.
   *
   * The module `[GarminMapKeys.WaypointHighlight]: MapWaypointHighlightModule` is added to the map model and can be
   * used to control the highlighted waypoint.
   *
   * The controller `[GarminMapKeys.Range]: MapRangeController` is added to the map context and can be used to control
   * the range of the map.
   *
   * If the map pointer is supported, the controller `[GarminMapKeys.Pointer]: MapPointerController` is added to the
   * map context and can be used to control the pointer.
   *
   * The map builder will **not** be configured to apply a custom projected size, dead zone, or to automatically update
   * the map.
   * @param mapBuilder The map builder to configure.
   * @param options Options for configuring the map.
   * @returns The builder, after it has been configured.
   */
  public static nearestMap<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    options: NextGenNearestMapOptions
  ): MapBuilder {
    mapBuilder.with(NextGenNearestMapBuilder.build, options);

    if (options.supportDataIntegrity ?? true) {
      mapBuilder.withController<MapDataIntegrityController, MapDataIntegrityControllerModules>(
        MapSystemKeys.DataIntegrity,
        context => new MapDataIntegrityController(context)
      );
    }

    return mapBuilder;
  }

  /**
   * Configures a map builder to generate a G1000 NXi procedure map. The map displays a
   * flight plan procedure (departure, arrival, approach) and its transitions, and is always focused on the displayed
   * procedure. The map is also locked to a North Up orientation.
   *
   * The module `[GarminMapKeys.ProcedurePreview]: MapProcedurePreviewModule` is added to the map model and can be
   * used to control the displayed procedure.
   *
   * The module `[GarminMapKeys.FlightPlanFocus]: MapFlightPlanFocusModule` is added to the map model and can be used
   * to control the procedure focus.
   *
   * The controller `[GarminMapKeys.Range]: MapRangeController` is added to the map context and can be used to control
   * the range of the map.
   *
   * If the map pointer is supported, the controller `[GarminMapKeys.Pointer]: MapPointerController` is added to the
   * map context and can be used to control the pointer.
   *
   * The map builder will **not** be configured to apply a custom projected size, dead zone, or to automatically update
   * the map.
   * @param mapBuilder The map builder to configure.
   * @param options Options for configuring the map.
   * @returns The builder, after it has been configured.
   */
  public static procMap<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    options: NextGenProcMapOptions
  ): MapBuilder {
    mapBuilder.with(NextGenProcMapBuilder.build, options);

    if (options.supportDataIntegrity ?? true) {
      mapBuilder.withController<MapDataIntegrityController, MapDataIntegrityControllerModules>(
        MapSystemKeys.DataIntegrity,
        context => new MapDataIntegrityController(context)
      );
    }

    return mapBuilder;
  }

  /**
   * Configures a map builder to generate a next-generation (NXi, G3000, etc) Garmin traffic map. The map consists of
   * an optional active flight plan layer, an optional traffic range ring layer, a traffic intruder layer, an airplane
   * icon layer, and an optional mini-compass layer. The map is centered on the player airplane and is locked in
   * Heading Up orientation.
   *
   * The controller `[GarminMapKeys.TrafficRange]: TrafficMapRangeController` is added to the map context and can be
   * used to control the range of the traffic map.
   *
   * The map builder will **not** be configured to apply a custom projected size, dead zone, or to automatically update
   * the map.
   * @param mapBuilder The map builder to configure.
   * @param options Options for configuring the map.
   * @returns The builder, after it has been configured.
   */
  public static trafficMap<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    options: NextGenTrafficMapOptions
  ): MapBuilder {
    mapBuilder.with(TrafficMapBuilder.buildNextGen, options);

    if (options.supportDataIntegrity ?? true) {
      mapBuilder.withController<MapDataIntegrityController, MapDataIntegrityControllerModules>(
        MapSystemKeys.DataIntegrity,
        context => new MapDataIntegrityController(context)
      );
    }

    return mapBuilder;
  }

  /**
   * Gets a set of standard options for the map's own airplane icon.
   * @param includeNoHeadingIcon Whether to include the no-heading icon. Defaults to `true`.
   * @returns A set of standard options for the map's own airplane icon.
   */
  public static ownAirplaneIconOptions(includeNoHeadingIcon = true): MapOwnAirplaneIconOptions {
    const options: MapOwnAirplaneIconOptions = {
      airplaneIconSize: 30,
      airplaneIconSrc: 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/own_airplane_icon.svg',
      airplaneIconAnchor: Vec2Math.create(0.5, 0)
    };

    if (includeNoHeadingIcon) {
      options.noHeadingAirplaneIconSrc = 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/own_airplane_icon_nohdg.svg';
      options.noHeadingAirplaneIconAnchor = Vec2Math.create(0.5, 0.5);
    }

    return options;
  }

  /**
   * Gets the URI for the mini-compass icon's image asset.
   * @returns The URI for the mini-compass icon's image asset.
   */
  public static miniCompassIconSrc(): string {
    return 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG1000/Assets/map_mini_compass.png';
  }
}
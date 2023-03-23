import {
  MapAirspaceLayer, MapAirspaceModule, MapAirspaceRenderManager, MapBingLayer, MapClockUpdateController, MapCullableTextLabelManager, MapCullableTextLayer,
  MapDataIntegrityModule, MapFlightPlanModule, MapFollowAirplaneController, MapFollowAirplaneModule, MapOwnAirplaneIconModule,
  MapOwnAirplaneLayer, MapOwnAirplanePropsController, MapOwnAirplanePropsModule, MapRotationController, MapRotationModule, MapSystemFlightPlanLayer,
  MapSystemIconFactory, MapSystemKeys, MapSystemLabelFactory, MapSystemPlanRenderer, MapSystemWaypointsLayer, MapSystemWaypointsRenderer,
  MapTerrainColorsModule, MapTrafficModule, MapWaypointDisplayModule, MapWxrModule, ResourceModerator
} from '@microsoft/msfs-sdk';

import { GarminMapKeys, MapGarminTrafficModule, MapUnitsModule, TrafficIconOptions } from '@microsoft/msfs-garminsdk';

import { GNSType } from '../../../UITypes';
import { AirportRunwayDisplayModule } from './AirportRunwayDisplayModule';
import { AirportRunwayLayer } from './AirportRunwayLayer';
import { MapRangeCompassLayer } from './MapRangeCompassLayer';
import { NoGpsPositionLayer } from './NoGpsPositionLayer';
import { ObsLayer } from './ObsLayer';
import { RangeLegendLayer } from './RangeLegendLayer';
import { TrafficBannerLayer } from './TrafficBannerLayer';
import { WaypointBearingModule } from './WaypointBearingModule';
import { GNSMapIndexedRangeModule } from './GNSMapIndexedRangeModule';
import { MapDeclutterModule } from './MapDeclutterModule';

/**
 * Map system component keys specific to the GNS map system.
 */
export enum GNSMapKeys {
  Range = 'range',
  Controller = 'controller',
  RangeLegend = 'rangeLegend',
  Runways = 'runways',
  CompassNorth = 'compassNorth',
  Units = 'units',
  CompassArc = 'compassArc',
  WaypointBearing = 'waypointBearing',
  TrafficBanner = 'trafficBanner',
  Obs = 'obs',
  Declutter = 'declutter'
}

/**
 * Airspace show types for GNS maps.
 */
export enum AirspaceVisibility {
  ClassB = 'ClassB',
  ClassC = 'ClassC',
  ClassD = 'ClassD',
  Restricted = 'Restricted',
  MOA = 'MOA',
  Other = 'Other'
}

/**
 * A map of GNS map airspace show types to their associated boundary filters.
 */
export type GNSAirspaceVisibility = Record<AirspaceVisibility, number>;

/**
 * Required modules for the controller.
 */
export interface GNSMapModules {
  /** The map terrain colors module. */
  [MapSystemKeys.TerrainColors]: MapTerrainColorsModule;

  /** The map weather display control module. */
  [MapSystemKeys.Weather]: MapWxrModule;

  /** The map indexed range module. */
  [GNSMapKeys.Range]: GNSMapIndexedRangeModule;

  /** A module for controlling nearest waypoints display. */
  [MapSystemKeys.NearestWaypoints]: MapWaypointDisplayModule;

  /** A module for getting position, speed, and other properties of the current aircraft. */
  [MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule;

  /** A module for controlling the own airplane icon. */
  [MapSystemKeys.OwnAirplaneIcon]?: MapOwnAirplaneIconModule;

  /** A module for controlling how the map follows the airplane. */
  [MapSystemKeys.FollowAirplane]: MapFollowAirplaneModule;

  /** A module for controlling the rotation of the map. */
  [MapSystemKeys.Rotation]: MapRotationModule;

  /** A module for controlling the display of airspaces. */
  [MapSystemKeys.Airspace]: MapAirspaceModule<GNSAirspaceVisibility>;

  /** A module for controlling the display of the airport runways. */
  [GNSMapKeys.Runways]: AirportRunwayDisplayModule;

  /** A module that controls what degree units the map should use. */
  [GNSMapKeys.Units]: MapUnitsModule;

  /** A module that exposes the GPS current waypoint desired track. */
  [GNSMapKeys.WaypointBearing]?: WaypointBearingModule;

  /** A module that provides access to flight plans. */
  [MapSystemKeys.FlightPlan]: MapFlightPlanModule;

  /** A module that provides data integrity status. */
  [MapSystemKeys.DataIntegrity]: MapDataIntegrityModule;

  /** A module that provides access to the traffic options. */
  [MapSystemKeys.Traffic]?: MapTrafficModule;

  /** An expanded Garmin specifid module for traffic display options. */
  [GarminMapKeys.Traffic]?: MapGarminTrafficModule;

  /** A module that handles the declutter level. */
  [GarminMapKeys.Declutter]?: MapDeclutterModule;
}

/**
 * Required layers for the controller.
 */
export interface GNSMapLayers {
  /** The map terrain bing map layer. */
  [MapSystemKeys.Bing]: MapBingLayer;

  /** The map layer that displays nearest waypoints. */
  [MapSystemKeys.NearestWaypoints]: MapSystemWaypointsLayer;

  /** The map layer that displays text labels. */
  [MapSystemKeys.TextLayer]: MapCullableTextLayer;

  /** The map layer that displays the flight plan. */
  ['flightPlan0']: MapSystemFlightPlanLayer;

  /** The map layer that displays direct-to random flight plan. */
  ['flightPlan1']: MapSystemFlightPlanLayer;

  /** A layer that display the own airplane icon. */
  [MapSystemKeys.OwnAirplaneIcon]?: MapOwnAirplaneLayer;

  /** A layer that displays the map range legend. */
  [GNSMapKeys.RangeLegend]: RangeLegendLayer;

  /** A layer that displays airspaces. */
  [MapSystemKeys.Airspace]: MapAirspaceLayer;

  /** A layer that displays vectorized runways. */
  [GNSMapKeys.Runways]: AirportRunwayLayer;

  /** A layer that displays the compass arc. */
  [GNSMapKeys.CompassArc]: MapRangeCompassLayer;

  /** A layer that displays a NO GPS POSITION banner. */
  [MapSystemKeys.DataIntegrity]: NoGpsPositionLayer;

  /** A layer that displays a traffic advisory banner. */
  [GNSMapKeys.TrafficBanner]?: TrafficBannerLayer;

  /** A layer that displays the OBS flight path. */
  [GNSMapKeys.Obs]: ObsLayer;
}

/**
 * Properties on the GNS map system context.
 */
export interface GNSMapContextProps {
  /** A text label manager for rendering map labels. */
  [MapSystemKeys.TextManager]: MapCullableTextLabelManager;

  /** A factory that creates map icons. */
  [MapSystemKeys.IconFactory]: MapSystemIconFactory;

  /** A factory that creates map labels. */
  [MapSystemKeys.LabelFactory]: MapSystemLabelFactory;

  /** A resource that controls who is in charge of managing the map center target. */
  [MapSystemKeys.TargetControl]: ResourceModerator<void>;

  /** A resource that controls who is in charge of managing map rotation. */
  [MapSystemKeys.RotationControl]: ResourceModerator<void>;

  /** A manager for rendering airspaces to the map. */
  [MapSystemKeys.AirspaceManager]: MapAirspaceRenderManager;

  /** A waypoint renderer for the system waypoints. */
  [MapSystemKeys.WaypointRenderer]: MapSystemWaypointsRenderer;

  /** A flight plan renderer for displaying flight plans. */
  [MapSystemKeys.FlightPathRenderer]: MapSystemPlanRenderer;
}

/**
 * Controllers registered with the GNS map system.
 */
export interface GNSMapControllers {

  /** A controller that controls the own airplane icon. */
  [MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsController;

  /** A controller that manages the airplane following behavior. */
  [MapSystemKeys.FollowAirplane]: MapFollowAirplaneController;

  /** A controller that updates the map based on a clock frequency. */
  [MapSystemKeys.ClockUpdate]: MapClockUpdateController;

  /** A controller that manages the map rotation behavior. */
  [MapSystemKeys.Rotation]: MapRotationController;
}

/**
 * A class that handles configuration of GNS traffic icons.
 */
export class GNSTrafficIcons {
  public static IconOptions = (gnsType: GNSType): TrafficIconOptions => ({
    iconSize: gnsType === 'wt430' ? 22 : 18,
    font: 'GreatNiftySymbol-Regular',
    fontSize: gnsType === 'wt430' ? 16 : 12,
    drawOffScale: false,
    supportAdsbVector: true,
    forceDrawNoArrow: true,
    vectorLength: 30,
    drawTARAVectorAsNormalVector: true
  });
}

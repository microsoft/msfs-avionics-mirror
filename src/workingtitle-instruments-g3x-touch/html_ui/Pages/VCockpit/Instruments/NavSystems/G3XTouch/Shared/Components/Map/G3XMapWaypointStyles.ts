import {
  FacilityType, FacilityWaypointUtils, FlightPathWaypoint, ICAO, MapLocationTextLabelOptions, ReadonlyFloat64Array,
  RunwaySurfaceCategory, Subscribable, Subscription, Vec2Math, VecNMath, Waypoint
} from '@microsoft/msfs-sdk';

import {
  AirportSize, AirportWaypoint, MapRunwayLabelWaypoint, MapRunwayOutlineIconStyles, MapRunwayOutlineWaypoint,
  MapWaypointHighlightIconOptions, MapWaypointIconHighlightStyles, MapWaypointIconStyles, MapWaypointLabelStyles,
  ProcedureTurnLegWaypoint
} from '@microsoft/msfs-garminsdk';

import { GduFormat } from '../../CommonTypes';
import { MapLabelTextSizeMode } from './Modules/MapLabelTextModule';

/**
 * A definition for a function that retrieves map waypoint label styles.
 */
export type G3XMapWaypointLabelStyleFuncDef = {
  /** A function which retrieves map waypoint label styles. */
  styles: (waypoint: Waypoint) => MapWaypointLabelStyles;

  /** The subscriptions maintained by the style retrieval function. */
  subscriptions: Subscription[];
};

/**
 * A utility class for generating G3X Touch map waypoint styles.
 */
export class G3XMapWaypointStyles {
  private static readonly LABEL_FONT_SIZES: Record<GduFormat, Record<MapLabelTextSizeMode, number>> = {
    ['460']: {
      [MapLabelTextSizeMode.None]: 0,
      [MapLabelTextSizeMode.Small]: 12,
      [MapLabelTextSizeMode.Medium]: 15,
      [MapLabelTextSizeMode.Large]: 18
    },

    // TODO: GDU470 font sizes
    ['470']: {
      [MapLabelTextSizeMode.None]: 0,
      [MapLabelTextSizeMode.Small]: 0,
      [MapLabelTextSizeMode.Medium]: 0,
      [MapLabelTextSizeMode.Large]: 0
    }
  } as const;

  private static readonly LABEL_FONT_SIZE_MAP_FUNC = (gduFormat: GduFormat, size: MapLabelTextSizeMode): number => {
    return G3XMapWaypointStyles.LABEL_FONT_SIZES[gduFormat][size];
  };

  /**
   * Creates a function which retrieves G3X Touch map icon styles for normal waypoints.
   * @param gduFormat The format of the map's parent GDU.
   * @param basePriority The base icon render priority. Icon priorities are guaranteed to fall in the range
   * `[basePriority, basePriority + 1)`.
   * @returns A function which retrieves G3X Touch map icon styles for normal waypoints.
   */
  public static normalIconStyles(gduFormat: GduFormat, basePriority: number): (waypoint: Waypoint) => MapWaypointIconStyles {
    const airportPriority = {
      [AirportSize.Large]: basePriority + 0.8,
      [AirportSize.Medium]: basePriority + 0.79,
      [AirportSize.Small]: basePriority + 0.78
    };
    const vorPriority = basePriority + 0.7;
    const ndbPriority = basePriority + 0.6;
    const intPriority = basePriority + 0.5;
    const userPriority = basePriority + 0.9;

    const airportSize = Vec2Math.create(26, 26);
    const standardSize = Vec2Math.create(32, 32);

    const airportStyle = {
      [AirportSize.Large]: { priority: airportPriority[AirportSize.Large], size: airportSize },
      [AirportSize.Medium]: { priority: airportPriority[AirportSize.Medium], size: airportSize },
      [AirportSize.Small]: { priority: airportPriority[AirportSize.Small], size: airportSize }
    };

    const vorStyle = { priority: vorPriority, size: standardSize };
    const ndbStyle = { priority: ndbPriority, size: standardSize };
    const intStyle = { priority: intPriority, size: standardSize };
    const userStyle = { priority: userPriority, size: standardSize };

    const defaultStyle = { priority: basePriority, size: standardSize };

    return (waypoint: Waypoint): MapWaypointIconStyles => {
      if (waypoint instanceof AirportWaypoint) {
        return airportStyle[waypoint.size];
      } else if (FacilityWaypointUtils.isFacilityWaypoint(waypoint)) {
        switch (ICAO.getFacilityType(waypoint.facility.get().icao)) {
          case FacilityType.VOR:
            return vorStyle;
          case FacilityType.NDB:
            return ndbStyle;
          case FacilityType.Intersection:
            return intStyle;
          case FacilityType.USR:
            return userStyle;
        }
      }

      return defaultStyle;
    };
  }

  /**
   * Creates a function which retrieves G3X Touch map label styles for normal waypoints.
   * @param gduFormat The format of the map's parent GDU.
   * @param basePriority The base label render priority. Label priorities are guaranteed to fall in the range
   * `[basePriority, basePriority + 1)`.
   * @param airportLargeTextSize The text size mode with which to render large airport labels.
   * @param airportMediumTextSize The text size mode with which to render medium airport labels.
   * @param airportSmallTextSize The text size mode with which to render small airport labels.
   * @param vorTextSize The text size mode with which to render VOR labels.
   * @param ndbTextSize The text size mode with which to render NDB labels.
   * @param intTextSize The text size mode with which to render intersection labels.
   * @param userTextSize The text size mode with which to render user waypoint labels.
   * @returns A function which retrieves G3X Touch map label styles for normal waypoints.
   */
  public static normalLabelStyles(
    gduFormat: GduFormat,
    basePriority: number,
    airportLargeTextSize: Subscribable<MapLabelTextSizeMode>,
    airportMediumTextSize: Subscribable<MapLabelTextSizeMode>,
    airportSmallTextSize: Subscribable<MapLabelTextSizeMode>,
    vorTextSize: Subscribable<MapLabelTextSizeMode>,
    ndbTextSize: Subscribable<MapLabelTextSizeMode>,
    intTextSize: Subscribable<MapLabelTextSizeMode>,
    userTextSize: Subscribable<MapLabelTextSizeMode>
  ): G3XMapWaypointLabelStyleFuncDef {
    const fontSizeMapFunc = G3XMapWaypointStyles.LABEL_FONT_SIZE_MAP_FUNC.bind(undefined, gduFormat);

    const airportLargeFontSize = airportLargeTextSize.map(fontSizeMapFunc);
    const airportMediumFontSize = airportMediumTextSize.map(fontSizeMapFunc);
    const airportSmallFontSize = airportSmallTextSize.map(fontSizeMapFunc);
    const vorFontSize = vorTextSize.map(fontSizeMapFunc);
    const ndbFontSize = ndbTextSize.map(fontSizeMapFunc);
    const intFontSize = intTextSize.map(fontSizeMapFunc);
    const userFontSize = userTextSize.map(fontSizeMapFunc);

    const airportPriority = {
      [AirportSize.Large]: basePriority + 0.8,
      [AirportSize.Medium]: basePriority + 0.79,
      [AirportSize.Small]: basePriority + 0.78
    };
    const vorPriority = basePriority + 0.7;
    const ndbPriority = basePriority + 0.6;
    const intPriority = basePriority + 0.5;
    const userPriority = basePriority + 0.9;

    const runwayOutlinePriority = basePriority + 0.75;

    const airportOptions = {
      [AirportSize.Large]: G3XMapWaypointStyles.createNormalLabelOptions(Vec2Math.create(0, -12), airportLargeFontSize),
      [AirportSize.Medium]: G3XMapWaypointStyles.createNormalLabelOptions(Vec2Math.create(0, -12), airportMediumFontSize),
      [AirportSize.Small]: G3XMapWaypointStyles.createNormalLabelOptions(Vec2Math.create(0, -12), airportSmallFontSize)
    };

    const vorOptions = G3XMapWaypointStyles.createNormalLabelOptions(Vec2Math.create(0, -8), vorFontSize);
    const ndbOptions = G3XMapWaypointStyles.createNormalLabelOptions(Vec2Math.create(0, -8), ndbFontSize);
    const intOptions = G3XMapWaypointStyles.createNormalLabelOptions(Vec2Math.create(0, -5), intFontSize);
    const userOptions = G3XMapWaypointStyles.createNormalLabelOptions(Vec2Math.create(0, -8), userFontSize);

    const runwayLabelOptions = G3XMapWaypointStyles.createRunwayLabelOptions(Vec2Math.create(0, -5), 12);

    const airportStyle = {
      [AirportSize.Large]: { priority: airportPriority[AirportSize.Large], alwaysShow: false, options: airportOptions[AirportSize.Large] },
      [AirportSize.Medium]: { priority: airportPriority[AirportSize.Medium], alwaysShow: false, options: airportOptions[AirportSize.Medium] },
      [AirportSize.Small]: { priority: airportPriority[AirportSize.Small], alwaysShow: false, options: airportOptions[AirportSize.Small] }
    };

    const vorStyle = { priority: vorPriority, alwaysShow: false, options: vorOptions };
    const ndbStyle = { priority: ndbPriority, alwaysShow: false, options: ndbOptions };
    const intStyle = { priority: intPriority, alwaysShow: false, options: intOptions };
    const userStyle = { priority: userPriority, alwaysShow: false, options: userOptions };

    const runwayLabelStyle = { priority: runwayOutlinePriority, alwaysShow: false, options: runwayLabelOptions };

    const defaultStyle = {
      priority: basePriority,
      alwaysShow: false,
      options: G3XMapWaypointStyles.createNormalLabelOptions(Vec2Math.create(0, 0), 0)
    };

    const styles = (waypoint: Waypoint): MapWaypointLabelStyles => {
      if (waypoint instanceof AirportWaypoint) {
        return airportStyle[waypoint.size];
      } else if (waypoint instanceof MapRunwayLabelWaypoint) {
        return runwayLabelStyle;
      } else if (FacilityWaypointUtils.isFacilityWaypoint(waypoint)) {
        switch (ICAO.getFacilityType(waypoint.facility.get().icao)) {
          case FacilityType.VOR:
            return vorStyle;
          case FacilityType.NDB:
            return ndbStyle;
          case FacilityType.Intersection:
            return intStyle;
          case FacilityType.USR:
            return userStyle;
        }
      }

      return defaultStyle;
    };

    return {
      styles,
      subscriptions: [
        airportLargeFontSize,
        airportMediumFontSize,
        airportSmallFontSize,
        vorFontSize,
        ndbFontSize,
        intFontSize,
        userFontSize
      ]
    };
  }

  /**
   * Creates initialization options for G3X Touch map style waypoint labels rendered in a normal role.
   * @param offset The label offset, in pixels.
   * @param fontSize The font size of the label, in pixels.
   * @returns Initialization options for G3X Touch map style waypoint labels rendered in a normal role.
   */
  private static createNormalLabelOptions(offset: ReadonlyFloat64Array, fontSize: number | Subscribable<number>): MapLocationTextLabelOptions {
    return {
      anchor: Vec2Math.create(0.5, 1),
      offset,
      font: 'DejaVuSans-SemiBold',
      fontSize,
      fontOutlineWidth: 6
    };
  }

  /**
   * Creates initialization options for G3X Touch map style runway labels.
   * @param offset The label offset, in pixels.
   * @param fontSize The font size of the label, in pixels.
   * @returns Initialization options for G3X Touch map style runway labels rendered in a normal
   * role.
   */
  private static createRunwayLabelOptions(offset: ReadonlyFloat64Array, fontSize: number): MapLocationTextLabelOptions {
    return {
      anchor: Vec2Math.create(0.5, 1),
      offset,
      font: 'DejaVuSans-SemiBold',
      fontSize,
      fontColor: 'black',
      fontOutlineWidth: 0,
      showBg: true,
      bgPadding: VecNMath.create(4, 0, 0, 0, 0),
      bgColor: '#f4f4f4',
      bgOutlineWidth: 1,
      bgOutlineColor: 'black'
    };
  }

  /**
   * Creates a function which retrieves G3X Touch map icon styles for runway outline waypoints.
   * @param basePriority The base icon render priority. Icon priorities are guaranteed to fall in the range
   * `[basePriority, basePriority + 1)`.
   * @returns A function which retrieves G3X Touch map icon styles for normal waypoints.
   */
  public static runwayOutlineIconStyles(basePriority: number): (waypoint: MapRunwayOutlineWaypoint) => MapRunwayOutlineIconStyles {
    const priority = basePriority;

    const hardStyle: MapRunwayOutlineIconStyles = {
      priority,
      options: {
        drawCenterLine: false,
        drawDesignation: false,
        drawThreshold: false,
        drawDisplacedThreshold: false
      }
    };
    const softStyle: MapRunwayOutlineIconStyles = {
      priority,
      options: {
        fillStyle: '#006400',
        drawCenterLine: false,
        drawDesignation: false,
        drawThreshold: false,
        drawDisplacedThreshold: false
      }
    };
    const waterStyle: MapRunwayOutlineIconStyles = {
      priority,
      options: {
        fillStyle: 'transparent',
        drawCenterLine: false,
        drawDesignation: false,
        drawThreshold: false,
        drawDisplacedThreshold: false
      }
    };

    return (waypoint: MapRunwayOutlineWaypoint): MapRunwayOutlineIconStyles => {
      switch (waypoint.surfaceCategory) {
        case RunwaySurfaceCategory.Hard:
          return hardStyle;
        case RunwaySurfaceCategory.Soft:
          return softStyle;
        case RunwaySurfaceCategory.Water:
          return waterStyle;
        default:
          return hardStyle;
      }
    };
  }

  /**
   * Creates a function which retrieves G3X Touch map icon styles for flight plan waypoints.
   * @param active Whether to retrieve styles for active flight plan waypoints.
   * @param gduFormat The format of the map's parent GDU.
   * @param basePriority The base icon render priority. Icon priorities are guaranteed to fall in the range
   * `[basePriority, basePriority + 1)`.
   * @returns A function which retrieves G3X Touch map icon styles for flight plan waypoints.
   */
  public static flightPlanIconStyles(active: boolean, gduFormat: GduFormat, basePriority: number): (waypoint: Waypoint) => MapWaypointIconStyles {
    // TODO: Support GDU470 (portrait)
    const airportPriority = {
      [AirportSize.Large]: basePriority + 0.8,
      [AirportSize.Medium]: basePriority + 0.79,
      [AirportSize.Small]: basePriority + 0.78
    };
    const vorPriority = basePriority + 0.7;
    const ndbPriority = basePriority + 0.6;
    const intPriority = basePriority + 0.5;
    const rwyPriority = basePriority + 0.4;
    const userPriority = basePriority + 0.9;
    const fpPriority = basePriority + 0.1;

    const airportSize = Vec2Math.create(26, 26);
    const standardSize = Vec2Math.create(32, 32);
    const fpIconSize = Vec2Math.create(8, 8);

    const airportStyle = {
      [AirportSize.Large]: { priority: airportPriority[AirportSize.Large], size: airportSize },
      [AirportSize.Medium]: { priority: airportPriority[AirportSize.Medium], size: airportSize },
      [AirportSize.Small]: { priority: airportPriority[AirportSize.Small], size: airportSize }
    };

    const vorStyle = { priority: vorPriority, size: standardSize };
    const ndbStyle = { priority: ndbPriority, size: standardSize };
    const intStyle = { priority: intPriority, size: standardSize };
    const rwyStyle = { priority: rwyPriority, size: standardSize };
    const userStyle = { priority: userPriority, size: standardSize };
    const fpStyle = { priority: fpPriority, size: fpIconSize };

    const defaultStyle = { priority: basePriority, size: standardSize };

    return (waypoint: Waypoint): MapWaypointIconStyles => {
      if (waypoint instanceof AirportWaypoint) {
        return airportStyle[waypoint.size];
      } else if (FacilityWaypointUtils.isFacilityWaypoint(waypoint)) {
        switch (ICAO.getFacilityType(waypoint.facility.get().icao)) {
          case FacilityType.VOR:
            return vorStyle;
          case FacilityType.NDB:
            return ndbStyle;
          case FacilityType.Intersection:
            return intStyle;
          case FacilityType.RWY:
            return rwyStyle;
          case FacilityType.USR:
            return userStyle;
        }
      } else if (waypoint instanceof FlightPathWaypoint) {
        return fpStyle;
      }

      return defaultStyle;
    };
  }

  /**
   * Creates a function which retrieves G3X Touch map label styles for flight plan waypoints.
   * @param active Whether to retrieve styles for active flight plan waypoints.
   * @param gduFormat The format of the map's parent GDU.
   * @param basePriority The base label render priority. Label priorities are guaranteed to fall in the range
   * `[basePriority, basePriority + 1)`.
   * @returns A function which retrieves G3X Touch map label styles for flight plan waypoints.
   */
  public static flightPlanLabelStyles(active: boolean, gduFormat: GduFormat, basePriority: number): (waypoint: Waypoint) => MapWaypointLabelStyles {
    // TODO: Support GDU470 (portrait)
    const fontSize = gduFormat === '460' ? 15 : 0;
    const bgPadding = VecNMath.create(4, 2, 2, 1, 2);

    const createLabelOptions = active
      ? G3XMapWaypointStyles.createFplActiveLabelOptions
      : G3XMapWaypointStyles.createFplInactiveLabelOptions;

    const airportPriority = {
      [AirportSize.Large]: basePriority + 0.8,
      [AirportSize.Medium]: basePriority + 0.79,
      [AirportSize.Small]: basePriority + 0.78
    };
    const vorPriority = basePriority + 0.7;
    const ndbPriority = basePriority + 0.6;
    const intPriority = basePriority + 0.5;
    const rwyPriority = basePriority + 0.4;
    const userPriority = basePriority + 0.9;
    const fpPriority = basePriority + 0.1;

    const airportOptions = {
      [AirportSize.Large]: createLabelOptions(Vec2Math.create(0, -15), fontSize, bgPadding),
      [AirportSize.Medium]: createLabelOptions(Vec2Math.create(0, -15), fontSize, bgPadding),
      [AirportSize.Small]: createLabelOptions(Vec2Math.create(0, -15), fontSize, bgPadding)
    };

    const vorOptions = createLabelOptions(Vec2Math.create(0, -11), fontSize, bgPadding);
    const ndbOptions = createLabelOptions(Vec2Math.create(0, -11), fontSize, bgPadding);
    const userOptions = createLabelOptions(Vec2Math.create(0, -12), fontSize, bgPadding);
    const smallOptions = createLabelOptions(Vec2Math.create(0, -8), fontSize, bgPadding);

    const airportStyle = {
      [AirportSize.Large]: { priority: airportPriority[AirportSize.Large], alwaysShow: true, options: airportOptions[AirportSize.Large] },
      [AirportSize.Medium]: { priority: airportPriority[AirportSize.Medium], alwaysShow: true, options: airportOptions[AirportSize.Medium] },
      [AirportSize.Small]: { priority: airportPriority[AirportSize.Small], alwaysShow: true, options: airportOptions[AirportSize.Small] }
    };

    const vorStyle = { priority: vorPriority, alwaysShow: true, options: vorOptions };
    const ndbStyle = { priority: ndbPriority, alwaysShow: true, options: ndbOptions };
    const intStyle = { priority: intPriority, alwaysShow: true, options: smallOptions };
    const rwyStyle = { priority: rwyPriority, alwaysShow: true, options: smallOptions };
    const userStyle = { priority: userPriority, alwaysShow: true, options: userOptions };
    const fpStyle = { priority: fpPriority, alwaysShow: true, options: smallOptions };

    const defaultStyle = { priority: basePriority, alwaysShow: true, options: smallOptions };

    return (waypoint: Waypoint): MapWaypointLabelStyles => {
      if (waypoint instanceof AirportWaypoint) {
        return airportStyle[waypoint.size];
      } else if (FacilityWaypointUtils.isFacilityWaypoint(waypoint)) {
        switch (ICAO.getFacilityType(waypoint.facility.get().icao)) {
          case FacilityType.VOR:
            return vorStyle;
          case FacilityType.NDB:
            return ndbStyle;
          case FacilityType.Intersection:
            return intStyle;
          case FacilityType.RWY:
            return rwyStyle;
          case FacilityType.USR:
            return userStyle;
        }
      } else if (waypoint instanceof FlightPathWaypoint || waypoint instanceof ProcedureTurnLegWaypoint) {
        return fpStyle;
      }

      return defaultStyle;
    };
  }

  /**
   * Creates initialization options for G3X Touch map style waypoint labels rendered in an inactive flight plan role.
   * @param offset The label offset, in pixels.
   * @param fontSize The font size of the label, in pixels.
   * @param bgPadding The padding of the label's background, in pixels. Expressed as `[top, right, bottom, left]`.
   * @returns Initialization options for G3X Touch map style waypoint labels rendered in an inactive flight plan role.
   */
  private static createFplInactiveLabelOptions(offset: ReadonlyFloat64Array, fontSize: number, bgPadding: ReadonlyFloat64Array): MapLocationTextLabelOptions {
    return {
      anchor: Vec2Math.create(0.5, 1),
      offset,
      font: 'DejaVuSans-SemiBold',
      fontSize,
      fontColor: 'black',
      fontOutlineWidth: 0,
      showBg: true,
      bgPadding,
      bgColor: '#f4f4f4',
      bgOutlineWidth: 1,
      bgOutlineColor: '#333333'
    };
  }

  /**
   * Creates initialization options for G3X Touch map style waypoint labels rendered in an active flight plan role.
   * @param offset The label offset, in pixels.
   * @param fontSize The font size of the label, in pixels.
   * @param bgPadding The padding of the label's background, in pixels. Expressed as `[top, right, bottom, left]`.
   * @returns Initialization options for G3X Touch map style waypoint labels rendered in an active flight plan role.
   */
  private static createFplActiveLabelOptions(offset: ReadonlyFloat64Array, fontSize: number, bgPadding: ReadonlyFloat64Array): MapLocationTextLabelOptions {
    return {
      anchor: Vec2Math.create(0.5, 1),
      offset,
      font: 'DejaVuSans-SemiBold',
      fontSize,
      fontColor: 'magenta',
      fontOutlineWidth: 0,
      showBg: true,
      bgPadding,
      bgOutlineWidth: 1,
      bgOutlineColor: '#f4f4f4'
    };
  }

  /**
   * Creates a function which retrieves G3X Touch map icon styles for highlighted waypoints.
   * @param gduFormat The format of the map's parent GDU.
   * @param basePriority The base icon render priority. Icon priorities are guaranteed to fall in the range
   * `[basePriority, basePriority + 1)`.
   * @returns A function which retrieves G3X Touch map icon styles for highlighted waypoints.
   */
  public static highlightIconStyles(gduFormat: GduFormat, basePriority: number): (waypoint: Waypoint) => MapWaypointIconHighlightStyles {
    const highlightOptions: MapWaypointHighlightIconOptions = {
      strokeWidth: 0,
      outlineWidth: 0,
      bgColor: 'transparent'
    };

    const airportPriority = {
      [AirportSize.Large]: basePriority + 0.8,
      [AirportSize.Medium]: basePriority + 0.79,
      [AirportSize.Small]: basePriority + 0.78
    };
    const vorPriority = basePriority + 0.7;
    const ndbPriority = basePriority + 0.6;
    const intPriority = basePriority + 0.5;
    const userPriority = basePriority + 0.9;

    // TODO: Support GDU470 (portrait)
    const airportSize = Vec2Math.create(26, 26);
    const standardSize = Vec2Math.create(32, 32);

    const airportStyle = {
      [AirportSize.Large]: {
        priority: airportPriority[AirportSize.Large],
        size: airportSize,
        highlightOptions
      },
      [AirportSize.Medium]: {
        priority: airportPriority[AirportSize.Medium],
        size: airportSize,
        highlightOptions
      },
      [AirportSize.Small]: {
        priority: airportPriority[AirportSize.Small],
        size: airportSize,
        highlightOptions
      },
    };

    const vorStyle = {
      priority: vorPriority,
      size: standardSize,
      highlightOptions
    };
    const ndbStyle = {
      priority: ndbPriority,
      size: standardSize,
      highlightOptions
    };
    const intStyle = {
      priority: intPriority,
      size: standardSize,
      highlightOptions
    };
    const userStyle = {
      priority: userPriority,
      size: standardSize,
      highlightOptions
    };

    const defaultStyle = {
      priority: basePriority,
      size: standardSize,
      highlightOptions
    };

    return (waypoint: Waypoint): MapWaypointIconHighlightStyles => {
      if (waypoint instanceof AirportWaypoint) {
        return airportStyle[waypoint.size];
      } else if (FacilityWaypointUtils.isFacilityWaypoint(waypoint)) {
        switch (ICAO.getFacilityType(waypoint.facility.get().icao)) {
          case FacilityType.VOR:
            return vorStyle;
          case FacilityType.NDB:
            return ndbStyle;
          case FacilityType.Intersection:
            return intStyle;
          case FacilityType.USR:
            return userStyle;
        }
      }

      return defaultStyle;
    };
  }

  /**
   * Creates a function which retrieves G3X Touch map label styles for highlighted waypoints.
   * @param gduFormat The format of the map's parent GDU.
   * @param basePriority The base label render priority. Label priorities are guaranteed to fall in the range
   * `[basePriority, basePriority + 1)`.
   * @returns A function which retrieves G3X Touch map label styles for highlighted waypoints.
   */
  public static highlightLabelStyles(
    gduFormat: GduFormat,
    basePriority: number
  ): (waypoint: Waypoint) => MapWaypointLabelStyles {
    // TODO: Support GDU470 (portrait)
    const fontSize = gduFormat === '460' ? 18 : 0;
    const bgPadding = VecNMath.create(4, 3, 4, 1, 4);

    const airportPriority = {
      [AirportSize.Large]: basePriority + 0.8,
      [AirportSize.Medium]: basePriority + 0.79,
      [AirportSize.Small]: basePriority + 0.78
    };
    const vorPriority = basePriority + 0.7;
    const ndbPriority = basePriority + 0.6;
    const intPriority = basePriority + 0.5;
    const userPriority = basePriority + 0.9;

    const airportOptions = {
      [AirportSize.Large]: G3XMapWaypointStyles.createHighlightLabelOptions(Vec2Math.create(0, -15), fontSize, bgPadding),
      [AirportSize.Medium]: G3XMapWaypointStyles.createHighlightLabelOptions(Vec2Math.create(0, -15), fontSize, bgPadding),
      [AirportSize.Small]: G3XMapWaypointStyles.createHighlightLabelOptions(Vec2Math.create(0, -15), fontSize, bgPadding)
    };

    const vorOptions = G3XMapWaypointStyles.createHighlightLabelOptions(Vec2Math.create(0, -11), fontSize, bgPadding);
    const ndbOptions = G3XMapWaypointStyles.createHighlightLabelOptions(Vec2Math.create(0, -11), fontSize, bgPadding);
    const intOptions = G3XMapWaypointStyles.createHighlightLabelOptions(Vec2Math.create(0, -8), fontSize, bgPadding);
    const userOptions = G3XMapWaypointStyles.createHighlightLabelOptions(Vec2Math.create(0, -12), fontSize, bgPadding);

    const airportStyle = {
      [AirportSize.Large]: { priority: airportPriority[AirportSize.Large], alwaysShow: true, options: airportOptions[AirportSize.Large] },
      [AirportSize.Medium]: { priority: airportPriority[AirportSize.Medium], alwaysShow: true, options: airportOptions[AirportSize.Medium] },
      [AirportSize.Small]: { priority: airportPriority[AirportSize.Small], alwaysShow: true, options: airportOptions[AirportSize.Small] }
    };

    const vorStyle = { priority: vorPriority, alwaysShow: true, options: vorOptions };
    const ndbStyle = { priority: ndbPriority, alwaysShow: true, options: ndbOptions };
    const intStyle = { priority: intPriority, alwaysShow: true, options: intOptions };
    const userStyle = { priority: userPriority, alwaysShow: true, options: userOptions };

    const defaultStyle = { priority: basePriority, alwaysShow: false, options: intOptions };

    return (waypoint: Waypoint): MapWaypointLabelStyles => {
      if (waypoint instanceof AirportWaypoint) {
        return airportStyle[waypoint.size];
      } else if (FacilityWaypointUtils.isFacilityWaypoint(waypoint)) {
        switch (ICAO.getFacilityType(waypoint.facility.get().icao)) {
          case FacilityType.VOR:
            return vorStyle;
          case FacilityType.NDB:
            return ndbStyle;
          case FacilityType.Intersection:
            return intStyle;
          case FacilityType.USR:
            return userStyle;
        }
      }

      return defaultStyle;
    };
  }

  /**
   * Creates initialization options for G3X Touch map style waypoint labels rendered in a highlight
   * role.
   * @param offset The label offset, in pixels.
   * @param fontSize The font size of the label, in pixels.
   * @param bgPadding The padding of the label's background, as `[top, right, bottom, left]` in pixels.
   * @returns Initialization options for G3X Touch map style waypoint labels rendered in a highlight
   * role.
   */
  private static createHighlightLabelOptions(offset: ReadonlyFloat64Array, fontSize: number, bgPadding: ReadonlyFloat64Array): MapLocationTextLabelOptions {
    return {
      anchor: Vec2Math.create(0.5, 1),
      offset,
      font: 'DejaVuSans-SemiBold',
      fontSize,
      fontColor: 'black',
      fontOutlineWidth: 0,
      showBg: true,
      bgPadding,
      bgColor: '#f4f4f4',
      bgOutlineWidth: 1,
      bgOutlineColor: '#404040'
    };
  }

  /**
   * Creates a function which retrieves G3X Touch map icon styles for VNAV waypoints.
   * @param gduFormat The format of the map's parent GDU.
   * @param basePriority The base icon render priority. Icon priorities are guaranteed to fall in the range
   * `[basePriority, basePriority + 1)`.
   * @returns A function which retrieves G3X Touch map icon styles for VNAV waypoints.
   */
  public static vnavIconStyles(gduFormat: GduFormat, basePriority: number): (waypoint: Waypoint) => MapWaypointIconStyles {
    // TODO: Support GDU470 (portrait)
    const vnavStyle = { priority: basePriority, size: Vec2Math.create(32, 32) };

    return (): MapWaypointIconStyles => {
      return vnavStyle;
    };
  }

  /**
   * Creates a function which retrieves G3X Touch map label styles for VNAV waypoints.
   * @param gduFormat The format of the map's parent GDU.
   * @param basePriority The base label render priority. Label priorities are guaranteed to fall in the range
   * `[basePriority, basePriority + 1)`.
   * @returns A function which retrieves G3X Touch map label styles for VNAV waypoints.
   */
  public static vnavLabelStyles(gduFormat: GduFormat, basePriority: number): (waypoint: Waypoint) => MapWaypointLabelStyles {
    // TODO: Support GDU470 (portrait)
    const vnavStyle = {
      priority: basePriority,
      alwaysShow: true,
      options: G3XMapWaypointStyles.createNormalLabelOptions(Vec2Math.create(0, -8), 15)
    };

    return (): MapWaypointLabelStyles => {
      return vnavStyle;
    };
  }
}
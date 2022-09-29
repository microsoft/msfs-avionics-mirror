import {
  FacilityType, FacilityWaypoint, FlightPathWaypoint, ICAO, MapLocationTextLabelOptions, ReadonlyFloat64Array, Vec2Math, VecNMath, Waypoint
} from 'msfssdk';

import { AirportSize, AirportWaypoint } from '../../navigation/AirportWaypoint';
import { ProcedureTurnLegWaypoint } from './flightplan/MapFlightPlanWaypointRecord';
import { MapWaypointIconHighlightStyles, MapWaypointIconStyles, MapWaypointLabelStyles } from './MapWaypointDisplayBuilder';

/**
 * A utility class for generating Garmin map waypoint styles.
 */
export class MapWaypointStyles {
  /**
   * Creates a function which retrieves next-generation (NXi, G3000, etc) icon styles for normal waypoints.
   * @param basePriority The base icon render priority. Icon priorities are guaranteed to fall in the range
   * `[baseIconPriority, baseIconPriority + 1)`.
   * @param scale The scaling factor for the icons. The larger the value, the larger the rendered icons. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) icon styles for normal waypoints.
   */
  public static nextGenNormalIconStyles(basePriority: number, scale = 1): (waypoint: Waypoint) => MapWaypointIconStyles {
    const airportPriority = {
      [AirportSize.Large]: basePriority + 0.8,
      [AirportSize.Medium]: basePriority + 0.79,
      [AirportSize.Small]: basePriority + 0.78
    };
    const vorPriority = basePriority + 0.7;
    const ndbPriority = basePriority + 0.6;
    const intPriority = basePriority + 0.5;
    const userPriority = basePriority + 0.9;

    const airportSize = Vec2Math.create(26 * scale, 26 * scale);
    const standardSize = Vec2Math.create(32 * scale, 32 * scale);

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
      } else if (waypoint instanceof FacilityWaypoint) {
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
   * Creates a function which retrieves next-generation (NXi, G3000, etc) label styles for normal waypoints.
   * @param basePriority The base icon render priority. Icon priorities are guaranteed to fall in the range
   * `[baseIconPriority, baseIconPriority + 1)`.
   * @param scale The scaling factor for the icons. The larger the value, the larger the rendered icons. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) label styles for normal waypoints.
   */
  public static nextGenNormalLabelStyles(basePriority: number, scale = 1): (waypoint: Waypoint) => MapWaypointLabelStyles {
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
      [AirportSize.Large]: MapWaypointStyles.createNextGenNormalLabelOptions(Vec2Math.create(0, -12 * scale), 20 * scale),
      [AirportSize.Medium]: MapWaypointStyles.createNextGenNormalLabelOptions(Vec2Math.create(0, -12 * scale), 16 * scale),
      [AirportSize.Small]: MapWaypointStyles.createNextGenNormalLabelOptions(Vec2Math.create(0, -12 * scale), 16 * scale)
    };

    const standardOptions = MapWaypointStyles.createNextGenNormalLabelOptions(Vec2Math.create(0, -8 * scale), 16 * scale);
    const intOptions = MapWaypointStyles.createNextGenNormalLabelOptions(Vec2Math.create(0, -5 * scale), 16 * scale);

    const airportStyle = {
      [AirportSize.Large]: { priority: airportPriority[AirportSize.Large], alwaysShow: false, options: airportOptions[AirportSize.Large] },
      [AirportSize.Medium]: { priority: airportPriority[AirportSize.Medium], alwaysShow: false, options: airportOptions[AirportSize.Medium] },
      [AirportSize.Small]: { priority: airportPriority[AirportSize.Small], alwaysShow: false, options: airportOptions[AirportSize.Small] }
    };

    const vorStyle = { priority: vorPriority, alwaysShow: false, options: standardOptions };
    const ndbStyle = { priority: ndbPriority, alwaysShow: false, options: standardOptions };
    const intStyle = { priority: intPriority, alwaysShow: false, options: intOptions };
    const userStyle = { priority: userPriority, alwaysShow: false, options: standardOptions };

    const defaultStyle = { priority: basePriority, alwaysShow: false, options: standardOptions };

    return (waypoint: Waypoint): MapWaypointLabelStyles => {
      if (waypoint instanceof AirportWaypoint) {
        return airportStyle[waypoint.size];
      } else if (waypoint instanceof FacilityWaypoint) {
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
   * Creates initialization options for next-generation (NXi, G3000, etc) style waypoint labels rendered in a normal
   * role.
   * @param offset The label offset, in pixels.
   * @param fontSize The font size of the label, in pixels.
   * @returns Initialization options for next-generation (NXi, G3000, etc) style waypoint labels rendered in a normal
   * role.
   */
  private static createNextGenNormalLabelOptions(offset: ReadonlyFloat64Array, fontSize: number): MapLocationTextLabelOptions {
    return {
      anchor: Vec2Math.create(0.5, 1),
      offset,
      font: 'Roboto',
      fontSize,
      fontOutlineWidth: 6
    };
  }

  /**
   * Creates a function which retrieves next-generation (NXi, G3000, etc) icon styles for flight plan waypoints.
   * @param active Whether to retrieve styles for active flight plan waypoints.
   * @param basePriority The base icon render priority. Icon priorities are guaranteed to fall in the range
   * `[baseIconPriority, baseIconPriority + 1)`.
   * @param scale The scaling factor for the icons. The larger the value, the larger the rendered icons. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) icon styles for flight plan waypoints.
   */
  public static nextGenFlightPlanIconStyles(active: boolean, basePriority: number, scale = 1): (waypoint: Waypoint) => MapWaypointIconStyles {
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

    const airportSize = Vec2Math.create(26 * scale, 26 * scale);
    const standardSize = Vec2Math.create(32 * scale, 32 * scale);
    const fpIconSize = Vec2Math.create(8 * scale, 8 * scale);

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
      } else if (waypoint instanceof FacilityWaypoint) {
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
   * Creates a function which retrieves next-generation (NXi, G3000, etc) label styles for flight plan waypoints.
   * @param active Whether to retrieve styles for active flight plan waypoints.
   * @param basePriority The base icon render priority. Icon priorities are guaranteed to fall in the range
   * `[baseIconPriority, baseIconPriority + 1)`.
   * @param scale The scaling factor for the icons. The larger the value, the larger the rendered icons. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) label styles for flight plan waypoints.
   */
  public static nextGenFlightPlanLabelStyles(active: boolean, basePriority: number, scale = 1): (waypoint: Waypoint) => MapWaypointLabelStyles {
    const createLabelOptions = active
      ? MapWaypointStyles.createNextGenFplActiveLabelOptions
      : MapWaypointStyles.createNextGenFplInactiveLabelOptions;

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
      [AirportSize.Large]: createLabelOptions(Vec2Math.create(0, -15 * scale), 20 * scale),
      [AirportSize.Medium]: createLabelOptions(Vec2Math.create(0, -15 * scale), 16 * scale),
      [AirportSize.Small]: createLabelOptions(Vec2Math.create(0, -15 * scale), 16 * scale)
    };

    const vorOptions = createLabelOptions(Vec2Math.create(0, -11 * scale), 16 * scale);
    const ndbOptions = createLabelOptions(Vec2Math.create(0, -11 * scale), 16 * scale);
    const userOptions = createLabelOptions(Vec2Math.create(0, -12 * scale), 16 * scale);
    const smallOptions = createLabelOptions(Vec2Math.create(0, -8 * scale), 16 * scale);

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
      } else if (waypoint instanceof FacilityWaypoint) {
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
   * Creates initialization options for next-generation (NXi, G3000, etc) style waypoint labels rendered in an inactive
   * flight plan role.
   * @param offset The label offset, in pixels.
   * @param fontSize The font size of the label, in pixels.
   * @returns Initialization options for next-generation (NXi, G3000, etc) style waypoint labels rendered in an
   * inactive flight plan role.
   */
  private static createNextGenFplInactiveLabelOptions(offset: ReadonlyFloat64Array, fontSize: number): MapLocationTextLabelOptions {
    return {
      anchor: Vec2Math.create(0, 1),
      offset,
      font: 'Roboto-Bold',
      fontSize,
      fontColor: 'black',
      fontOutlineWidth: 0,
      showBg: true,
      bgPadding: VecNMath.create(4, 1, 1, 1, 1),
      bgColor: 'white',
      bgOutlineWidth: 1,
      bgOutlineColor: 'black'
    };
  }

  /**
   * Creates initialization options for next-generation (NXi, G3000, etc) style waypoint labels rendered in an active
   * flight plan role.
   * @param offset The label offset, in pixels.
   * @param fontSize The font size of the label, in pixels.
   * @returns Initialization options for next-generation (NXi, G3000, etc) style waypoint labels rendered in an active
   * flight plan role.
   */
  private static createNextGenFplActiveLabelOptions(offset: ReadonlyFloat64Array, fontSize: number): MapLocationTextLabelOptions {
    return {
      anchor: Vec2Math.create(0, 1),
      offset,
      font: 'Roboto-Bold',
      fontSize,
      fontColor: 'magenta',
      fontOutlineWidth: 0,
      showBg: true,
      bgPadding: VecNMath.create(4, 1, 1, 1, 1),
      bgOutlineWidth: 1
    };
  }

  /**
   * Creates a function which retrieves next-generation (NXi, G3000, etc) icon styles for highlighted waypoints.
   * @param basePriority The base icon render priority. Icon priorities are guaranteed to fall in the range
   * `[baseIconPriority, baseIconPriority + 1)`.
   * @param scale The scaling factor for the icons. The larger the value, the larger the rendered icons. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) icon styles for highlighted waypoints.
   */
  public static nextGenHighlightIconStyles(basePriority: number, scale = 1): (waypoint: Waypoint) => MapWaypointIconHighlightStyles {
    const baseHighlightOptions = {
      strokeWidth: 2,
      strokeColor: 'white',
      outlineWidth: 0,
      outlineColor: 'black',
      bgColor: '#3c3c3c'
    };

    const airportHighlightRingRadiusBuffer = -5 * scale;
    const standardHighlightRingRadiusBuffer = -8 * scale;

    const airportPriority = {
      [AirportSize.Large]: basePriority + 0.8,
      [AirportSize.Medium]: basePriority + 0.79,
      [AirportSize.Small]: basePriority + 0.78
    };
    const vorPriority = basePriority + 0.7;
    const ndbPriority = basePriority + 0.6;
    const intPriority = basePriority + 0.5;
    const userPriority = basePriority + 0.9;

    const airportSize = Vec2Math.create(26 * scale, 26 * scale);
    const standardSize = Vec2Math.create(32 * scale, 32 * scale);

    const airportStyle = {
      [AirportSize.Large]: {
        priority: airportPriority[AirportSize.Large],
        size: airportSize,
        highlightOptions: Object.assign({ ringRadiusBuffer: airportHighlightRingRadiusBuffer }, baseHighlightOptions)
      },
      [AirportSize.Medium]: {
        priority: airportPriority[AirportSize.Medium],
        size: airportSize,
        highlightOptions: Object.assign({ ringRadiusBuffer: airportHighlightRingRadiusBuffer }, baseHighlightOptions)
      },
      [AirportSize.Small]: {
        priority: airportPriority[AirportSize.Small],
        size: airportSize,
        highlightOptions: Object.assign({ ringRadiusBuffer: airportHighlightRingRadiusBuffer }, baseHighlightOptions)
      },
    };

    const vorStyle = {
      priority: vorPriority,
      size: standardSize,
      highlightOptions: Object.assign({ ringRadiusBuffer: standardHighlightRingRadiusBuffer }, baseHighlightOptions)
    };
    const ndbStyle = {
      priority: ndbPriority,
      size: standardSize,
      highlightOptions: Object.assign({ ringRadiusBuffer: standardHighlightRingRadiusBuffer }, baseHighlightOptions)
    };
    const intStyle = {
      priority: intPriority,
      size: standardSize,
      highlightOptions: Object.assign({ ringRadiusBuffer: standardHighlightRingRadiusBuffer }, baseHighlightOptions)
    };
    const userStyle = {
      priority: userPriority,
      size: standardSize,
      highlightOptions: Object.assign({ ringRadiusBuffer: standardHighlightRingRadiusBuffer }, baseHighlightOptions)
    };

    const defaultStyle = {
      priority: basePriority,
      size: standardSize,
      highlightOptions: Object.assign({ ringRadiusBuffer: standardHighlightRingRadiusBuffer }, baseHighlightOptions)
    };

    return (waypoint: Waypoint): MapWaypointIconHighlightStyles => {
      if (waypoint instanceof AirportWaypoint) {
        return airportStyle[waypoint.size];
      } else if (waypoint instanceof FacilityWaypoint) {
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
   * Creates a function which retrieves next-generation (NXi, G3000, etc) label styles for highlighted waypoints.
   * @param basePriority The base icon render priority. Icon priorities are guaranteed to fall in the range
   * `[baseIconPriority, baseIconPriority + 1)`.
   * @param scale The scaling factor for the icons. The larger the value, the larger the rendered icons. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) label styles for highlighted waypoints.
   */
  public static nextGenHighlightLabelStyles(basePriority: number, scale = 1): (waypoint: Waypoint) => MapWaypointLabelStyles {
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
      [AirportSize.Large]: MapWaypointStyles.createNextGenHighlightLabelOptions(Vec2Math.create(0, -15 * scale), 20 * scale),
      [AirportSize.Medium]: MapWaypointStyles.createNextGenHighlightLabelOptions(Vec2Math.create(0, -15 * scale), 16 * scale),
      [AirportSize.Small]: MapWaypointStyles.createNextGenHighlightLabelOptions(Vec2Math.create(0, -15 * scale), 16 * scale)
    };

    const vorOptions = MapWaypointStyles.createNextGenHighlightLabelOptions(Vec2Math.create(0, -11 * scale), 16 * scale);
    const ndbOptions = MapWaypointStyles.createNextGenHighlightLabelOptions(Vec2Math.create(0, -11 * scale), 16 * scale);
    const intOptions = MapWaypointStyles.createNextGenHighlightLabelOptions(Vec2Math.create(0, -8 * scale), 16 * scale);
    const userOptions = MapWaypointStyles.createNextGenHighlightLabelOptions(Vec2Math.create(0, -12 * scale), 16 * scale);

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
      } else if (waypoint instanceof FacilityWaypoint) {
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
   * Creates initialization options for next-generation (NXi, G3000, etc) style waypoint labels rendered in a highlight
   * role.
   * @param offset The label offset, in pixels.
   * @param fontSize The font size of the label, in pixels.
   * @returns Initialization options for next-generation (NXi, G3000, etc) style waypoint labels rendered in a highlight
   * role.
   */
  private static createNextGenHighlightLabelOptions(offset: ReadonlyFloat64Array, fontSize: number): MapLocationTextLabelOptions {
    return {
      anchor: Vec2Math.create(0.5, 1),
      offset,
      font: 'Roboto-Bold',
      fontSize,
      fontColor: 'black',
      fontOutlineWidth: 0,
      showBg: true,
      bgPadding: VecNMath.create(4, 1, 1, 1, 1),
      bgColor: 'white',
      bgOutlineWidth: 1,
      bgOutlineColor: 'black'
    };
  }

  /**
   * Creates a function which retrieves next-generation (NXi, G3000, etc) icon styles for VNAV waypoints.
   * @param basePriority The base icon render priority. Icon priorities are guaranteed to fall in the range
   * `[baseIconPriority, baseIconPriority + 1)`.
   * @param scale The scaling factor for the icons. The larger the value, the larger the rendered icons. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) icon styles for VNAV waypoints.
   */
  public static nextGenVNavIconStyles(basePriority: number, scale = 1): (waypoint: Waypoint) => MapWaypointIconStyles {
    const vnavStyle = { priority: basePriority, size: Vec2Math.create(32 * scale, 32 * scale) };

    return (): MapWaypointIconStyles => {
      return vnavStyle;
    };
  }

  /**
   * Creates a function which retrieves next-generation (NXi, G3000, etc) label styles for VNAV waypoints.
   * @param basePriority The base icon render priority. Icon priorities are guaranteed to fall in the range
   * `[baseIconPriority, baseIconPriority + 1)`.
   * @param scale The scaling factor for the icons. The larger the value, the larger the rendered icons. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) label styles for VNAV waypoints.
   */
  public static nextGenVNavLabelStyles(basePriority: number, scale = 1): (waypoint: Waypoint) => MapWaypointLabelStyles {
    const vnavStyle = {
      priority: basePriority,
      alwaysShow: true,
      options: MapWaypointStyles.createNextGenNormalLabelOptions(Vec2Math.create(0, -8 * scale), 16 * scale)
    };

    return (): MapWaypointLabelStyles => {
      return vnavStyle;
    };
  }

  /**
   * Creates a function which retrieves next-generation (NXi, G3000, etc) icon styles for procedure preview waypoints.
   * @param basePriority The base icon render priority. Icon priorities are guaranteed to fall in the range
   * `[baseIconPriority, baseIconPriority + 1)`.
   * @param scale The scaling factor for the icons. The larger the value, the larger the rendered icons. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) icon styles for procedure preview waypoints.
   */
  public static nextGenProcPreviewIconStyles(basePriority: number, scale = 1): (waypoint: Waypoint) => MapWaypointIconStyles {
    return MapWaypointStyles.nextGenFlightPlanIconStyles(false, basePriority, scale);
  }

  /**
   * Creates a function which retrieves next-generation (NXi, G3000, etc) label styles for procedure preview waypoints.
   * @param basePriority The base icon render priority. Icon priorities are guaranteed to fall in the range
   * `[baseIconPriority, baseIconPriority + 1)`.
   * @param scale The scaling factor for the icons. The larger the value, the larger the rendered icons. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) label styles for procedure preview waypoints.
   */
  public static nextGenProcPreviewLabelStyles(basePriority: number, scale = 1): (waypoint: Waypoint) => MapWaypointLabelStyles {
    return MapWaypointStyles.nextGenFlightPlanLabelStyles(false, basePriority, scale);
  }

  /**
   * Creates a function which retrieves next-generation (NXi, G3000, etc) icon styles for procedure transition preview
   * waypoints.
   * @param basePriority The base icon render priority. Icon priorities are guaranteed to fall in the range
   * `[baseIconPriority, baseIconPriority + 1)`.
   * @param scale The scaling factor for the icons. The larger the value, the larger the rendered icons. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) icon styles for procedure transition
   * preview waypoints.
   */
  public static nextGenProcTransitionPreviewIconStyles(basePriority: number, scale = 1): (waypoint: Waypoint) => MapWaypointIconStyles {
    return MapWaypointStyles.nextGenNormalIconStyles(basePriority, scale);
  }

  /**
   * Creates a function which retrieves next-generation (NXi, G3000, etc) label styles for procedure transition preview
   * waypoints.
   * @param basePriority The base icon render priority. Icon priorities are guaranteed to fall in the range
   * `[baseIconPriority, baseIconPriority + 1)`.
   * @param scale The scaling factor for the icons. The larger the value, the larger the rendered icons. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) label styles for procedure preview transition
   * waypoints.
   */
  public static nextGenProcTransitionPreviewLabelStyles(basePriority: number, scale = 1): (waypoint: Waypoint) => MapWaypointLabelStyles {
    return MapWaypointStyles.nextGenNormalLabelStyles(basePriority, scale);
  }
}
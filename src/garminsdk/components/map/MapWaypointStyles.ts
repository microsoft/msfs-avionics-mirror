import {
  FacilityType, FacilityWaypointUtils, FlightPathWaypoint, ICAO, MapLocationTextLabelOptions, ReadonlyFloat64Array,
  RunwaySurfaceCategory, Vec2Math, VecNMath, Waypoint
} from '@microsoft/msfs-sdk';

import { AirportSize, AirportWaypoint } from '../../navigation/AirportWaypoint';
import { ProcedureTurnLegWaypoint } from './flightplan/MapFlightPlanWaypointRecord';
import { MapRunwayLabelWaypoint } from './MapRunwayLabelWaypoint';
import { MapRunwayOutlineWaypoint } from './MapRunwayOutlineWaypoint';
import { MapRunwayOutlineIconStyles, MapWaypointIconHighlightStyles, MapWaypointIconStyles, MapWaypointLabelStyles } from './MapWaypointDisplayBuilder';

/**
 * A utility class for generating next-generation (NXi, G3000, etc) Garmin map waypoint styles.
 */
export class NextGenMapWaypointStyles {
  /**
   * Creates a function which retrieves next-generation (NXi, G3000, etc) icon styles for normal waypoints.
   * @param basePriority The base icon render priority. Icon priorities are guaranteed to fall in the range
   * `[basePriority, basePriority + 1)`.
   * @param scale The scaling factor for the icons. The larger the value, the larger the rendered icons. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) icon styles for normal waypoints.
   */
  public static normalIconStyles(basePriority: number, scale = 1): (waypoint: Waypoint) => MapWaypointIconStyles {
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
   * Creates a function which retrieves next-generation (NXi, G3000, etc) label styles for normal waypoints.
   * @param basePriority The base label render priority. Label priorities are guaranteed to fall in the range
   * `[basePriority, basePriority + 1)`.
   * @param fontType The type of font to use for the labels.
   * @param scale The scaling factor for the labels. The larger the value, the larger the rendered labels. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) label styles for normal waypoints.
   */
  public static normalLabelStyles(
    basePriority: number,
    fontType: 'Roboto' | 'DejaVu',
    scale = 1
  ): (waypoint: Waypoint) => MapWaypointLabelStyles {
    let font: string, largeFontSize: number, regularFontSize: number;

    if (fontType === 'Roboto') {
      font = 'Roboto';
      largeFontSize = 20 * scale;
      regularFontSize = 16 * scale;
    } else {
      font = 'DejaVuSans-SemiBold';
      largeFontSize = 17 * scale;
      regularFontSize = 14 * scale;
    }

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
      [AirportSize.Large]: NextGenMapWaypointStyles.createNormalLabelOptions(Vec2Math.create(0, -12 * scale), font, largeFontSize),
      [AirportSize.Medium]: NextGenMapWaypointStyles.createNormalLabelOptions(Vec2Math.create(0, -12 * scale), font, regularFontSize),
      [AirportSize.Small]: NextGenMapWaypointStyles.createNormalLabelOptions(Vec2Math.create(0, -12 * scale), font, regularFontSize)
    };

    const standardOptions = NextGenMapWaypointStyles.createNormalLabelOptions(Vec2Math.create(0, -8 * scale), font, regularFontSize);
    const intOptions = NextGenMapWaypointStyles.createNormalLabelOptions(Vec2Math.create(0, -5 * scale), font, regularFontSize);

    const runwayOutlineOptions = NextGenMapWaypointStyles.createRunwayLabelOptions(Vec2Math.create(0, -5 * scale), font, largeFontSize, 7 * scale);

    const airportStyle = {
      [AirportSize.Large]: { priority: airportPriority[AirportSize.Large], alwaysShow: false, options: airportOptions[AirportSize.Large] },
      [AirportSize.Medium]: { priority: airportPriority[AirportSize.Medium], alwaysShow: false, options: airportOptions[AirportSize.Medium] },
      [AirportSize.Small]: { priority: airportPriority[AirportSize.Small], alwaysShow: false, options: airportOptions[AirportSize.Small] }
    };

    const vorStyle = { priority: vorPriority, alwaysShow: false, options: standardOptions };
    const ndbStyle = { priority: ndbPriority, alwaysShow: false, options: standardOptions };
    const intStyle = { priority: intPriority, alwaysShow: false, options: intOptions };
    const userStyle = { priority: userPriority, alwaysShow: false, options: standardOptions };

    const runwayOutlineStyle = { priority: runwayOutlinePriority, alwaysShow: false, options: runwayOutlineOptions };

    const defaultStyle = { priority: basePriority, alwaysShow: false, options: standardOptions };

    return (waypoint: Waypoint): MapWaypointLabelStyles => {
      if (waypoint instanceof AirportWaypoint) {
        return airportStyle[waypoint.size];
      } else if (waypoint instanceof MapRunwayLabelWaypoint) {
        return runwayOutlineStyle;
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
   * Creates initialization options for next-generation (NXi, G3000, etc) style waypoint labels rendered in a normal
   * role.
   * @param offset The label offset, in pixels.
   * @param font The name of the label font.
   * @param fontSize The font size of the label, in pixels.
   * @returns Initialization options for next-generation (NXi, G3000, etc) style waypoint labels rendered in a normal
   * role.
   */
  private static createNormalLabelOptions(offset: ReadonlyFloat64Array, font: string, fontSize: number): MapLocationTextLabelOptions {
    return {
      anchor: Vec2Math.create(0.5, 1),
      offset,
      font,
      fontSize,
      fontOutlineWidth: 6
    };
  }

  /**
   * Creates initialization options for next-generation (NXi, G3000, etc) style runway labels.
   * @param offset The label offset, in pixels.
   * @param font The name of the label font.
   * @param fontSize The font size of the label, in pixels.
   * @param borderRadius The border radius of the label, in pixels.
   * @returns Initialization options for next-generation (NXi, G3000, etc) style runway labels rendered in a normal
   * role.
   */
  private static createRunwayLabelOptions(offset: ReadonlyFloat64Array, font: string, fontSize: number, borderRadius: number): MapLocationTextLabelOptions {
    return {
      anchor: Vec2Math.create(0.5, 1),
      offset,
      font,
      fontSize,
      fontColor: '#123086',
      fontOutlineWidth: 0,
      showBg: true,
      bgPadding: VecNMath.create(4, 1, 3, 1, 3),
      bgColor: 'white',
      bgOutlineWidth: 1,
      bgOutlineColor: '#123086',
      bgBorderRadius: borderRadius
    };
  }

  /**
   * Creates a function which retrieves next-generation (NXi, G3000, etc) icon styles for runway outline waypoints.
   * @param basePriority The base icon render priority. Icon priorities are guaranteed to fall in the range
   * `[basePriority, basePriority + 1)`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) icon styles for normal waypoints.
   */
  public static runwayOutlineIconStyles(basePriority: number): (waypoint: MapRunwayOutlineWaypoint) => MapRunwayOutlineIconStyles {
    const priority = basePriority;

    const hardStyle = { priority, options: { fillStyle: '#afafaf' } };
    const softStyle = { priority, options: { fillStyle: '#006400' } };
    const waterStyle = { priority, options: { fillStyle: 'transparent' } };

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
   * Creates a function which retrieves next-generation (NXi, G3000, etc) icon styles for flight plan waypoints.
   * @param active Whether to retrieve styles for active flight plan waypoints.
   * @param basePriority The base icon render priority. Icon priorities are guaranteed to fall in the range
   * `[basePriority, basePriority + 1)`.
   * @param scale The scaling factor for the icons. The larger the value, the larger the rendered icons. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) icon styles for flight plan waypoints.
   */
  public static flightPlanIconStyles(active: boolean, basePriority: number, scale = 1): (waypoint: Waypoint) => MapWaypointIconStyles {
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
   * Creates a function which retrieves next-generation (NXi, G3000, etc) label styles for flight plan waypoints.
   * @param active Whether to retrieve styles for active flight plan waypoints.
   * @param basePriority The base label render priority. Label priorities are guaranteed to fall in the range
   * `[basePriority, basePriority + 1)`.
   * @param fontType The type of font to use for the labels.
   * @param scale The scaling factor for the labels. The larger the value, the larger the rendered labels. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) label styles for flight plan waypoints.
   */
  public static flightPlanLabelStyles(
    active: boolean,
    basePriority: number,
    fontType: 'Roboto' | 'DejaVu',
    scale = 1
  ): (waypoint: Waypoint) => MapWaypointLabelStyles {
    let font: string, largeFontSize: number, regularFontSize: number;

    if (fontType === 'Roboto') {
      font = 'Roboto-Bold';
      largeFontSize = 20 * scale;
      regularFontSize = 16 * scale;
    } else {
      font = 'DejaVuSans-SemiBold';
      largeFontSize = 17 * scale;
      regularFontSize = 17 * scale;
    }

    const createLabelOptions = active
      ? NextGenMapWaypointStyles.createFplActiveLabelOptions
      : NextGenMapWaypointStyles.createFplInactiveLabelOptions;

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
      [AirportSize.Large]: createLabelOptions(Vec2Math.create(0, -15 * scale), font, largeFontSize),
      [AirportSize.Medium]: createLabelOptions(Vec2Math.create(0, -15 * scale), font, regularFontSize),
      [AirportSize.Small]: createLabelOptions(Vec2Math.create(0, -15 * scale), font, regularFontSize)
    };

    const vorOptions = createLabelOptions(Vec2Math.create(0, -11 * scale), font, regularFontSize);
    const ndbOptions = createLabelOptions(Vec2Math.create(0, -11 * scale), font, regularFontSize);
    const userOptions = createLabelOptions(Vec2Math.create(0, -12 * scale), font, regularFontSize);
    const smallOptions = createLabelOptions(Vec2Math.create(0, -8 * scale), font, regularFontSize);

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
   * Creates initialization options for next-generation (NXi, G3000, etc) style waypoint labels rendered in an inactive
   * flight plan role.
   * @param offset The label offset, in pixels.
   * @param font The name of the label font.
   * @param fontSize The font size of the label, in pixels.
   * @returns Initialization options for next-generation (NXi, G3000, etc) style waypoint labels rendered in an
   * inactive flight plan role.
   */
  private static createFplInactiveLabelOptions(offset: ReadonlyFloat64Array, font: string, fontSize: number): MapLocationTextLabelOptions {
    return {
      anchor: Vec2Math.create(0, 1),
      offset,
      font,
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
   * @param font The name of the label font.
   * @param fontSize The font size of the label, in pixels.
   * @returns Initialization options for next-generation (NXi, G3000, etc) style waypoint labels rendered in an active
   * flight plan role.
   */
  private static createFplActiveLabelOptions(offset: ReadonlyFloat64Array, font: string, fontSize: number): MapLocationTextLabelOptions {
    return {
      anchor: Vec2Math.create(0, 1),
      offset,
      font,
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
   * `[basePriority, basePriority + 1)`.
   * @param scale The scaling factor for the icons. The larger the value, the larger the rendered icons. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) icon styles for highlighted waypoints.
   */
  public static highlightIconStyles(basePriority: number, scale = 1): (waypoint: Waypoint) => MapWaypointIconHighlightStyles {
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
   * Creates a function which retrieves next-generation (NXi, G3000, etc) label styles for highlighted waypoints.
   * @param basePriority The base label render priority. Label priorities are guaranteed to fall in the range
   * `[basePriority, basePriority + 1)`.
   * @param fontType The type of font to use for the labels.
   * @param scale The scaling factor for the labels. The larger the value, the larger the rendered label. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) label styles for highlighted waypoints.
   */
  public static highlightLabelStyles(
    basePriority: number,
    fontType: 'Roboto' | 'DejaVu',
    scale = 1
  ): (waypoint: Waypoint) => MapWaypointLabelStyles {
    let font: string, largeFontSize: number, regularFontSize: number;

    if (fontType === 'Roboto') {
      font = 'Roboto-Bold';
      largeFontSize = 20 * scale;
      regularFontSize = 16 * scale;
    } else {
      font = 'DejaVuSans-SemiBold';
      largeFontSize = 17 * scale;
      regularFontSize = 17 * scale;
    }

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
      [AirportSize.Large]: NextGenMapWaypointStyles.createHighlightLabelOptions(Vec2Math.create(0, -15 * scale), font, largeFontSize),
      [AirportSize.Medium]: NextGenMapWaypointStyles.createHighlightLabelOptions(Vec2Math.create(0, -15 * scale), font, regularFontSize),
      [AirportSize.Small]: NextGenMapWaypointStyles.createHighlightLabelOptions(Vec2Math.create(0, -15 * scale), font, regularFontSize)
    };

    const vorOptions = NextGenMapWaypointStyles.createHighlightLabelOptions(Vec2Math.create(0, -11 * scale), font, regularFontSize);
    const ndbOptions = NextGenMapWaypointStyles.createHighlightLabelOptions(Vec2Math.create(0, -11 * scale), font, regularFontSize);
    const intOptions = NextGenMapWaypointStyles.createHighlightLabelOptions(Vec2Math.create(0, -8 * scale), font, regularFontSize);
    const userOptions = NextGenMapWaypointStyles.createHighlightLabelOptions(Vec2Math.create(0, -12 * scale), font, regularFontSize);

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
   * Creates initialization options for next-generation (NXi, G3000, etc) style waypoint labels rendered in a highlight
   * role.
   * @param offset The label offset, in pixels.
   * @param font The name of the label font.
   * @param fontSize The font size of the label, in pixels.
   * @returns Initialization options for next-generation (NXi, G3000, etc) style waypoint labels rendered in a highlight
   * role.
   */
  private static createHighlightLabelOptions(offset: ReadonlyFloat64Array, font: string, fontSize: number): MapLocationTextLabelOptions {
    return {
      anchor: Vec2Math.create(0.5, 1),
      offset,
      font,
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
   * `[basePriority, basePriority + 1)`.
   * @param scale The scaling factor for the icons. The larger the value, the larger the rendered icons. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) icon styles for VNAV waypoints.
   */
  public static vnavIconStyles(basePriority: number, scale = 1): (waypoint: Waypoint) => MapWaypointIconStyles {
    const vnavStyle = { priority: basePriority, size: Vec2Math.create(32 * scale, 32 * scale) };

    return (): MapWaypointIconStyles => {
      return vnavStyle;
    };
  }

  /**
   * Creates a function which retrieves next-generation (NXi, G3000, etc) label styles for VNAV waypoints.
   * @param basePriority The base label render priority. Label priorities are guaranteed to fall in the range
   * `[basePriority, basePriority + 1)`.
   * @param fontType The type of font to use for the labels.
   * @param scale The scaling factor for the labels. The larger the value, the larger the rendered labels. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) label styles for VNAV waypoints.
   */
  public static vnavLabelStyles(basePriority: number, fontType: 'Roboto' | 'DejaVu', scale = 1): (waypoint: Waypoint) => MapWaypointLabelStyles {
    let font: string, fontSize: number;

    if (fontType === 'Roboto') {
      font = 'Roboto';
      fontSize = 16 * scale;
    } else {
      font = 'DejaVuSans-SemiBold';
      fontSize = 14 * scale;
    }

    const vnavStyle = {
      priority: basePriority,
      alwaysShow: true,
      options: NextGenMapWaypointStyles.createNormalLabelOptions(Vec2Math.create(0, -8 * scale), font, fontSize)
    };

    return (): MapWaypointLabelStyles => {
      return vnavStyle;
    };
  }

  /**
   * Creates a function which retrieves next-generation (NXi, G3000, etc) icon styles for procedure preview waypoints.
   * @param basePriority The base icon render priority. Icon priorities are guaranteed to fall in the range
   * `[basePriority, basePriority + 1)`.
   * @param scale The scaling factor for the icons. The larger the value, the larger the rendered icons. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) icon styles for procedure preview waypoints.
   */
  public static procPreviewIconStyles(basePriority: number, scale = 1): (waypoint: Waypoint) => MapWaypointIconStyles {
    return NextGenMapWaypointStyles.flightPlanIconStyles(false, basePriority, scale);
  }

  /**
   * Creates a function which retrieves next-generation (NXi, G3000, etc) label styles for procedure preview waypoints.
   * @param basePriority The base label render priority. Label priorities are guaranteed to fall in the range
   * `[basePriority, basePriority + 1)`.
   * @param fontType The type of font to use for the labels.
   * @param scale The scaling factor for the labels. The larger the value, the larger the rendered labels. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) label styles for procedure preview waypoints.
   */
  public static procPreviewLabelStyles(basePriority: number, fontType: 'Roboto' | 'DejaVu', scale = 1): (waypoint: Waypoint) => MapWaypointLabelStyles {
    return NextGenMapWaypointStyles.flightPlanLabelStyles(false, basePriority, fontType, scale);
  }

  /**
   * Creates a function which retrieves next-generation (NXi, G3000, etc) icon styles for procedure transition preview
   * waypoints.
   * @param basePriority The base icon render priority. Icon priorities are guaranteed to fall in the range
   * `[basePriority, basePriority + 1)`.
   * @param scale The scaling factor for the icons. The larger the value, the larger the rendered icons. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) icon styles for procedure transition
   * preview waypoints.
   */
  public static procTransitionPreviewIconStyles(basePriority: number, scale = 1): (waypoint: Waypoint) => MapWaypointIconStyles {
    return NextGenMapWaypointStyles.normalIconStyles(basePriority, scale);
  }

  /**
   * Creates a function which retrieves next-generation (NXi, G3000, etc) label styles for procedure transition preview
   * waypoints.
   * @param basePriority The base label render priority. Label priorities are guaranteed to fall in the range
   * `[basePriority, basePriority + 1)`.
   * @param fontType The type of font to use for the labels.
   * @param scale The scaling factor for the labels. The larger the value, the larger the rendered labels. Defaults to
   * `1`.
   * @returns A function which retrieves next-generation (NXi, G3000, etc) label styles for procedure preview transition
   * waypoints.
   */
  public static procTransitionPreviewLabelStyles(basePriority: number, fontType: 'Roboto' | 'DejaVu', scale = 1): (waypoint: Waypoint) => MapWaypointLabelStyles {
    return NextGenMapWaypointStyles.normalLabelStyles(basePriority, fontType, scale);
  }
}
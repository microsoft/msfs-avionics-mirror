import { EventBus } from '../../data/EventBus';
import { SimVarValueType } from '../../data/SimVars';
import { SimVarPublisher, SimVarPublisherEntry } from '../../instruments/BasePublishers';
import { ArrayUtils } from '../../utils/datastructures/ArrayUtils';

/**
 * Sim var names for LNAV-related data.
 */
export enum LNavDataVars {
  /** The current nominal desired track, in degrees true. */
  DTKTrue = 'L:WT_LNavData_DTK_True',

  /** The current nominal desired track, in degrees magnetic. */
  DTKMagnetic = 'L:WT_LNavData_DTK_Mag',

  /**
   * The current nominal crosstrack error. Negative values indicate deviation to the left, as viewed when facing in the
   * direction of the track. Positive values indicate deviation to the right.
   */
  XTK = 'L:WT_LNavData_XTK',

  /** The current CDI scale. */
  CDIScale = 'L:WT_LNavData_CDI_Scale',

  /** The nominal bearing to the next waypoint currently tracked by LNAV, in degrees true. */
  WaypointBearingTrue = 'L:WT_LNavData_Waypoint_Bearing_True',

  /** The nominal bearing to the next waypoint currently tracked by LNAV, in degrees magnetic. */
  WaypointBearingMagnetic = 'L:WT_LNavData_Waypoint_Bearing_Mag',

  /** The nominal distance remaining to the next waypoint currently tracked by LNAV. */
  WaypointDistance = 'L:WT_LNavData_Waypoint_Distance',

  /** The nominal distance remaining to the destination. */
  DestinationDistance = 'L:WT_LNavData_Destination_Distance',
}

/**
 * LNAV-related events derived from SimVars keyed by base topic names.
 */
export interface BaseLNavDataSimVarEvents {
  /** The current nominal desired track, in degrees true. */
  lnavdata_dtk_true: number;

  /** The current nominal desired track, in degrees magnetic. */
  lnavdata_dtk_mag: number;

  /**
   * The current nominal crosstrack error, in nautical miles. Negative values indicate deviation to the left, as viewed
   * when facing in the direction of the track. Positive values indicate deviation to the right.
   */
  lnavdata_xtk: number;

  /** The current CDI scale, in nautical miles. */
  lnavdata_cdi_scale: number;

  /** The nominal bearing to the next waypoint currently tracked by LNAV, in degrees true. */
  lnavdata_waypoint_bearing_true: number;

  /** The nominal bearing to the next waypoint tracked by LNAV, in degrees magnetic. */
  lnavdata_waypoint_bearing_mag: number;

  /** The nominal distance remaining to the next waypoint currently tracked by LNAV, in nautical miles. */
  lnavdata_waypoint_distance: number;

  /** The nominal distance remaining to the destination, in nautical miles. */
  lnavdata_destination_distance: number;
}

/**
 * LNAV-related events derived from SimVars keyed by indexed topic names.
 */
export type IndexedLNavDataSimVarEvents<Index extends number = number> = {
  [P in keyof BaseLNavDataSimVarEvents as `${P}_${Index}`]: BaseLNavDataSimVarEvents[P];
};

/**
 * Events related to LNAV data keyed by base topic names.
 */
export interface BaseLNavDataEvents extends BaseLNavDataSimVarEvents {
  /** The nominal ident of the next waypoint tracked by LNAV. */
  lnavdata_waypoint_ident: string;
}

/**
 * Events related to LNAV keyed by indexed topic names.
 */
export type IndexedLNavDataEvents<Index extends number = number> = {
  [P in keyof BaseLNavDataEvents as `${P}_${Index}`]: BaseLNavDataEvents[P];
};

/**
 * Events related to LNAV that are derived from SimVars.
 */
export interface LNavDataSimVarEvents extends BaseLNavDataSimVarEvents, IndexedLNavDataSimVarEvents {
}

/**
 * Events related to LNAV.
 */
export interface LNavDataEvents extends BaseLNavDataEvents, IndexedLNavDataEvents {
}

/**
 * A publisher for LNAV-related data derived from SimVars.
 */
export class LNavDataSimVarPublisher extends SimVarPublisher<LNavDataSimVarEvents> {
  /**
   * Creates a new instance of LNavDataSimVarPublisher.
   * @param bus The event bus to which to publish.
   */
  public constructor(bus: EventBus) {
    const defs = ArrayUtils.flatMap(
      [
        ['lnavdata_dtk_true', { name: LNavDataVars.DTKTrue, type: SimVarValueType.Degree }],
        ['lnavdata_dtk_mag', { name: LNavDataVars.DTKMagnetic, type: SimVarValueType.Degree }],
        ['lnavdata_xtk', { name: LNavDataVars.XTK, type: SimVarValueType.NM }],
        ['lnavdata_cdi_scale', { name: LNavDataVars.CDIScale, type: SimVarValueType.NM }],
        ['lnavdata_waypoint_bearing_true', { name: LNavDataVars.WaypointBearingTrue, type: SimVarValueType.Degree }],
        ['lnavdata_waypoint_bearing_mag', { name: LNavDataVars.WaypointBearingMagnetic, type: SimVarValueType.Degree }],
        ['lnavdata_waypoint_distance', { name: LNavDataVars.WaypointDistance, type: SimVarValueType.NM }],
        ['lnavdata_destination_distance', { name: LNavDataVars.DestinationDistance, type: SimVarValueType.NM }],
      ] as ([keyof BaseLNavDataSimVarEvents, SimVarPublisherEntry<any>])[],
      pair => {
        const [topic, entry] = pair;

        const indexedEntry: SimVarPublisherEntry<any> = {
          name: `${entry.name}:#index#`,
          type: entry.type,
          indexed: true,
          defaultIndex: null
        };

        return [
          pair,
          [topic, indexedEntry]
        ] as const;
      }
    );

    super(defs, bus);
  }
}

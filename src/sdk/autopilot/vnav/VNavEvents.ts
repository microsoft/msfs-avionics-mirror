import { EventBus } from '../../data/EventBus';
import { SimVarValueType } from '../../data/SimVars';
import { SimVarPublisher, SimVarPublisherEntry } from '../../instruments/BasePublishers';
import { ArrayUtils } from '../../utils/datastructures/ArrayUtils';
import {
  ApproachGuidanceMode, VNavAltCaptureType, VNavAvailability, AltitudeConstraintDetails,
  VNavPathMode, VNavState
} from '../VerticalNavigation';

/**
 * SimVar names for VNAV data.
 */
export enum VNavVars {
  /** The vertical deviation in feet. */
  VerticalDeviation = 'L:WTAP_VNav_Vertical_Deviation',

  /** The VNAV target altitude in feet. */
  TargetAltitude = 'L:WTAP_VNav_Target_Altitude',

  /** The VNAV path mode. */
  PathMode = 'L:WTAP_VNav_Path_Mode',

  /** The VNAV State. */
  VNAVState = 'L:WTAP_VNav_State',

  /** Whether a VNAV Path Exists for the current leg. */
  PathAvailable = 'L:WTAP_VNav_Path_Available',

  /** The VNAV current altitude capture type. */
  CaptureType = 'L:WTAP_VNav_Alt_Capture_Type',

  /** The distance to the next TOD in meters, or -1 if one does not exist. */
  TODDistance = 'L:WTAP_VNav_Distance_To_TOD',

  /** The distance to the next BOD in meters, or -1 if one does not exist. */
  BODDistance = 'L:WTAP_VNav_Distance_To_BOD',

  /** The index of the leg for the next TOD. */
  TODLegIndex = 'L:WTAP_VNav_TOD_Leg_Index',

  /** The distance from the end of the TOD leg that the TOD is, in meters. */
  TODDistanceInLeg = 'L:WTAP_VNav_TOD_Distance_In_Leg',

  /** The index of the leg for the next BOD. */
  BODLegIndex = 'L:WTAP_VNav_BOD_Leg_Index',

  /** The distance to the next TOC in meters, or -1 if one does not exist. */
  TOCDistance = 'L:WTAP_VNav_Distance_To_TOC',

  /** The distance to the next BOC in meters, or -1 if one does not exist. */
  BOCDistance = 'L:WTAP_VNav_Distance_To_BOC',

  /** The index of the leg for the next TOC. */
  TOCLegIndex = 'L:WTAP_VNav_TOC_Leg_Index',

  /** The distance from the end of the TOC leg that the TOC is, in meters. */
  TOCDistanceInLeg = 'L:WTAP_VNav_TOC_Distance_In_Leg',

  /** The index of the leg for the next BOC. */
  BOCLegIndex = 'L:WTAP_VNav_BOC_Leg_Index',

  /** The index of the leg for the next constraint. */
  CurrentConstraintLegIndex = 'L:WTAP_VNav_Constraint_Leg_Index',

  /** The current constraint altitude, in feet. */
  CurrentConstraintAltitude = 'L:WTAP_VNav_Constraint_Altitude',

  /** The next constraint altitude, in feet. */
  NextConstraintAltitude = 'L:WTAP_VNav_Next_Constraint_Altitude',

  /** The current required flight path angle, in degrees. */
  FPA = 'L:WTAP_VNav_FPA',

  /** The required VS to the current constraint, in FPM. */
  RequiredVS = 'L:WTAP_VNAV_Required_VS',

  /** The VNAV approach guidance mode. */
  GPApproachMode = 'L:WTAP_GP_Approach_Mode',

  /** The current LPV vertical deviation in feet. */
  GPVerticalDeviation = 'L:WTAP_GP_Vertical_Deviation',

  /** The current remaining LPV distance in meters. */
  GPDistance = 'L:WTAP_GP_Distance',

  /** The current LPV FPA, in degrees. */
  GPFpa = 'L:WTAP_GP_FPA',

  /** The required VS to the current constraint, in FPM. */
  GPRequiredVS = 'L:WTAP_GP_Required_VS',

  /** The approach glidepath service level. */
  GPServiceLevel = 'L:WTAP_GP_Service_Level'
}

/**
 * Events derived from VNAV SimVars keyed by base topic names.
 */
export interface BaseVNavSimVarEvents {
  /**
   * The vertical deviation, in feet, of the calculated VNAV path from the airplane's indicated altitude. Positive
   * values indicate the path lies above the airplane.
   */
  vnav_vertical_deviation: number;

  /** The target altitude, in feet, of the currently active VNAV constraint. */
  vnav_target_altitude: number;

  /** The VNAV path mode. */
  vnav_path_mode: VNavPathMode;

  /** Whether a VNAV Path Exists for the current leg. */
  vnav_path_available: boolean;

  /** The VNAV state. */
  vnav_state: VNavState;

  /** The VNAV current alt capture type. */
  vnav_altitude_capture_type: VNavAltCaptureType;

  /** The distance along the flight path from the airplane's present position to the current VNAV TOD, in meters. */
  vnav_tod_distance: number;

  /** The distance from the current VNAV TOD to the end of its containing leg, in meters. */
  vnav_tod_leg_distance: number;

  /** The distance along the flight path from the airplane's present position to the next VNAV BOD, in meters. */
  vnav_bod_distance: number;

  /**
   * The global index of the flight plan leg that contains the TOD associated with the next VNAV BOD, or -1 if there is
   * no such TOD. The TOD is defined as the point along the flight path at which the aircraft will intercept the VNAV
   * profile continuing to the next BOD if it continues to fly level at its current altitude.
   */
  vnav_tod_global_leg_index: number;

  /**
   * The global index of the flight plan leg that contains the next VNAV BOD, or -1 if there is no BOD. The next BOD
   * is defined as the next point in the flight path including or after the active leg where the VNAV profile
   * transitions from a descent to a level-off, discontinuity, or the end of the flight path. The BOD is always located
   * at the end of its containing leg.
   */
  vnav_bod_global_leg_index: number;

  /** The distance along the flight path from the airplane's present position to the current VNAV TOC, in meters. */
  vnav_toc_distance: number;

  /** The distance along the flight path from the current VNAV TOC to the end of its containing leg, in meters. */
  vnav_toc_leg_distance: number;

  /** The distance along the flight path from the airplane's present position to the next VNAV BOC, in meters. */
  vnav_boc_distance: number;

  /**
   * The global index of the flight plan leg that contains the current VNAV TOC, or -1 if there is no such TOC.
   */
  vnav_toc_global_leg_index: number;

  /**
   * The global index of the flight plan leg that contains the next VNAV BOC, or -1 if there is no such BOC. The BOC
   * is always located at the beginning of its containing leg.
   */
  vnav_boc_global_leg_index: number;

  /** The global index of the leg that contains the current VNAV constraint. */
  vnav_constraint_global_leg_index: number;

  /** The VNAV current constraint altitude in feet. */
  vnav_constraint_altitude: number;

  /** The VNAV next constraint altitude in feet. */
  vnav_next_constraint_altitude: number;

  /**
   * The flight path angle, in degrees, for the currently active VNAV path segment. Positive angles represent
   * descending paths.
   */
  vnav_fpa: number;

  /**
   * The vertical speed, in feet per minute, required for the airplane to meet the next VNAV altitude constraint if it
   * starts climbing/descending from its current altitude immediately.
   */
  vnav_required_vs: number;

  /** The VNAV approach guidance mode. */
  gp_approach_mode: ApproachGuidanceMode;

  /** The current glidepath vertical deviation, in feet. */
  gp_vertical_deviation: number;

  /** The current distance to the glidepath endpoint, in feet. */
  gp_distance: number;

  /** The current glidepath FPA. */
  gp_fpa: number;

  /** The vertical speed, in feet per minute, required for the airplane to reach the glidepath target. */
  gp_required_vs: number;

  /** The approach glidepath service level. */
  gp_service_level: number;
}

/**
 * Topic names for events derived from VNAV SimVars that can be indexed.
 */
export type IndexedVNavSimVarTopics = Exclude<keyof BaseVNavSimVarEvents, 'gp_approach_mode'>;

/**
 * Events derived from VNAV SimVars keyed by indexed topic names.
 */
export type IndexedVNavSimVarEvents<Index extends number = number> = {
  [P in IndexedVNavSimVarTopics as `${P}_${Index}`]: BaseVNavSimVarEvents[P];
};

/**
 * VNAV events keyed by base topic names.
 */
export interface BaseVNavEvents extends BaseVNavSimVarEvents {
  /** VNAV path calculations were updated for the specified vertical flight plan. */
  vnav_path_calculated: number;

  /** The current availability of VNAV from the director. */
  vnav_availability: VNavAvailability;

  /** The current VNAV target altitude restriction feet and type. */
  vnav_altitude_constraint_details: Readonly<AltitudeConstraintDetails>;
}

/**
 * Topic names for VNAV events that can be indexed.
 */
export type IndexedVNavTopics = IndexedVNavSimVarTopics | Exclude<keyof BaseVNavEvents, keyof BaseVNavSimVarEvents>;

/**
 * VNAV events keyed by indexed topic names.
 */
export type IndexedVNavEvents<Index extends number = number> = {
  [P in IndexedVNavTopics as `${P}_${Index}`]: BaseVNavEvents[P];
};

/**
 * VNAV events that are derived from SimVars.
 */
export interface VNavSimVarEvents extends BaseVNavSimVarEvents, IndexedVNavSimVarEvents {
}

/**
 * VNAV events.
 */
export interface VNavEvents extends BaseVNavEvents, IndexedVNavEvents {
}

/**
 * A publisher for VNAV events derived from SimVars.
 */
export class VNavSimVarPublisher extends SimVarPublisher<VNavEvents> {
  /**
   * Creates a new instance of VNavSimVarPublisher.
   * @param bus The event bus to which to publish.
   */
  public constructor(bus: EventBus) {
    const defs: (readonly [keyof VNavEvents, SimVarPublisherEntry<any>])[] = [
      ['gp_approach_mode', { name: VNavVars.GPApproachMode, type: SimVarValueType.Number }],

      ...ArrayUtils.flatMap(
        [
          ['vnav_vertical_deviation', { name: VNavVars.VerticalDeviation, type: SimVarValueType.Feet }],
          ['vnav_target_altitude', { name: VNavVars.TargetAltitude, type: SimVarValueType.Feet }],
          ['vnav_path_mode', { name: VNavVars.PathMode, type: SimVarValueType.Number }],
          ['vnav_path_available', { name: VNavVars.PathAvailable, type: SimVarValueType.Bool }],
          ['vnav_state', { name: VNavVars.VNAVState, type: SimVarValueType.Number }],
          ['vnav_altitude_capture_type', { name: VNavVars.CaptureType, type: SimVarValueType.Number }],
          ['vnav_tod_distance', { name: VNavVars.TODDistance, type: SimVarValueType.Meters }],
          ['vnav_tod_leg_distance', { name: VNavVars.TODDistanceInLeg, type: SimVarValueType.Meters }],
          ['vnav_bod_distance', { name: VNavVars.BODDistance, type: SimVarValueType.Meters }],
          ['vnav_tod_global_leg_index', { name: VNavVars.TODLegIndex, type: SimVarValueType.Number }],
          ['vnav_bod_global_leg_index', { name: VNavVars.BODLegIndex, type: SimVarValueType.Number }],
          ['vnav_toc_distance', { name: VNavVars.TOCDistance, type: SimVarValueType.Meters }],
          ['vnav_toc_leg_distance', { name: VNavVars.TOCDistanceInLeg, type: SimVarValueType.Meters }],
          ['vnav_boc_distance', { name: VNavVars.BOCDistance, type: SimVarValueType.Meters }],
          ['vnav_toc_global_leg_index', { name: VNavVars.TOCLegIndex, type: SimVarValueType.Number }],
          ['vnav_boc_global_leg_index', { name: VNavVars.BOCLegIndex, type: SimVarValueType.Number }],
          ['vnav_constraint_global_leg_index', { name: VNavVars.CurrentConstraintLegIndex, type: SimVarValueType.Number }],
          ['vnav_constraint_altitude', { name: VNavVars.CurrentConstraintAltitude, type: SimVarValueType.Feet }],
          ['vnav_next_constraint_altitude', { name: VNavVars.NextConstraintAltitude, type: SimVarValueType.Feet }],
          ['vnav_fpa', { name: VNavVars.FPA, type: SimVarValueType.Degree }],
          ['vnav_required_vs', { name: VNavVars.RequiredVS, type: SimVarValueType.FPM }],

          ['gp_vertical_deviation', { name: VNavVars.GPVerticalDeviation, type: SimVarValueType.Feet }],
          ['gp_distance', { name: VNavVars.GPDistance, type: SimVarValueType.Feet }],
          ['gp_fpa', { name: VNavVars.GPFpa, type: SimVarValueType.Degree }],
          ['gp_required_vs', { name: VNavVars.GPRequiredVS, type: SimVarValueType.FPM }],
          ['gp_service_level', { name: VNavVars.GPServiceLevel, type: SimVarValueType.Number }],
        ] as ([keyof BaseVNavSimVarEvents, SimVarPublisherEntry<any>])[],
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
      )
    ];

    super(defs, bus);
  }
}
import {
  EventBus, LNavDataEvents as BaseLNavDataEvents, LNavDataSimVarEvents as BaseLNavDataSimVarEvents,
  LNavDataVars as BaseLNavDataVars, SimVarDefinition, SimVarPublisher, SimVarValueType
} from '@microsoft/msfs-sdk';

/**
 * Information on a vector associated with a nominal LNAV desired track.
 */
export type LNavDataDtkVector = {
  /** The global index of the flight plan leg to which the vector belongs, or `-1` if there is no vector. */
  globalLegIndex: number,

  /** The index of the vector in its parent leg's `flightPath` array, or `-1` if there is no vector. */
  vectorIndex: number;
}

/**
 * Valid CDI scale labels for the LVar scale enum.
 */
export enum CDIScaleLabel {
  Departure,
  Terminal,
  TerminalDeparture,
  TerminalArrival,
  Enroute,
  Oceanic,
  LNav,
  LNavPlusV,
  Visual,
  LNavVNav,
  LP,
  LPPlusV,
  LPV,
  RNP,
  Approach,
  MissedApproach
}

/**
 * Sim var names for Garmin LNAV-related data.
 */
export enum GarminLNavDataVars {
  /** The nominal desired track at the beginning of the flight plan leg following the currently tracked leg, in degrees true. */
  NextDTKTrue = 'L:WTGarmin_LNavData_Next_DTK_True',

  /** The nominal desired track at the beginning of the flight plan leg following the currently tracked leg, in degrees magnetic. */
  NextDTKMagnetic = 'L:WTGarmin_LNavData_Next_DTK_Mag',

  /** The current CDI scale label. */
  // eslint-disable-next-line @typescript-eslint/no-shadow
  CDIScaleLabel = 'L:WTGarmin_LNavData_CDI_Scale_Label',

  /** The nominal distance remaining to the egress transition of the currently tracked flight plan leg. */
  EgressDistance = 'L:WTGarmin_LNavData_Egress_Distance'
}

/**
 * Events derived from Garmin LNAV-related data sim vars.
 */
export interface LNavDataSimVarEvents extends BaseLNavDataSimVarEvents {
  /** The nominal desired track at the beginning of the flight plan leg following the currently tracked leg, in degrees true. */
  lnavdata_next_dtk_true: number;

  /** The nominal desired track at the beginning of the flight plan leg following the currently tracked leg, in degrees magnetic. */
  lnavdata_next_dtk_mag: number;

  /** Information on the nominal current desired track vector. */
  lnavdata_dtk_vector: LNavDataDtkVector;

  /** Information on the nominal next desired track vector. */
  lnavdata_next_dtk_vector: LNavDataDtkVector;

  /** The current CDI scale label. */
  lnavdata_cdi_scale_label: CDIScaleLabel;

  /** The nominal along-track distance remaining to the egress transition of the currently tracked flight plan leg, in nautical miles. */
  lnavdata_egress_distance: number;
}

/**
 * Events related to Garmin LNAV data.
 */
export interface LNavDataEvents extends LNavDataSimVarEvents, BaseLNavDataEvents {
}

/**
 * A publisher for Garmin LNAV-related data sim var events.
 */
export class LNavDataSimVarPublisher extends SimVarPublisher<LNavDataSimVarEvents> {
  private static simvars = new Map<keyof LNavDataSimVarEvents, SimVarDefinition>([
    ['lnavdata_dtk_true', { name: BaseLNavDataVars.DTKTrue, type: SimVarValueType.Degree }],
    ['lnavdata_dtk_mag', { name: BaseLNavDataVars.DTKMagnetic, type: SimVarValueType.Degree }],
    ['lnavdata_xtk', { name: BaseLNavDataVars.XTK, type: SimVarValueType.NM }],
    ['lnavdata_next_dtk_true', { name: GarminLNavDataVars.NextDTKTrue, type: SimVarValueType.Degree }],
    ['lnavdata_next_dtk_mag', { name: GarminLNavDataVars.NextDTKMagnetic, type: SimVarValueType.Degree }],
    ['lnavdata_cdi_scale', { name: BaseLNavDataVars.CDIScale, type: SimVarValueType.NM }],
    ['lnavdata_cdi_scale_label', { name: GarminLNavDataVars.CDIScaleLabel, type: SimVarValueType.Number }],
    ['lnavdata_waypoint_bearing_true', { name: BaseLNavDataVars.WaypointBearingTrue, type: SimVarValueType.Degree }],
    ['lnavdata_waypoint_bearing_mag', { name: BaseLNavDataVars.WaypointBearingMagnetic, type: SimVarValueType.Degree }],
    ['lnavdata_waypoint_distance', { name: BaseLNavDataVars.WaypointDistance, type: SimVarValueType.NM }],
    ['lnavdata_destination_distance', { name: BaseLNavDataVars.DestinationDistance, type: SimVarValueType.NM }],
    ['lnavdata_egress_distance', { name: GarminLNavDataVars.EgressDistance, type: SimVarValueType.NM }]
  ]);

  /**
   * Constructor.
   * @param bus The event bus to which to publish.
   */
  public constructor(bus: EventBus) {
    super(LNavDataSimVarPublisher.simvars, bus);
  }
}
import { EventBus, LNavDataSimVarEvents, LNavDataVars, SimVarDefinition, SimVarPublisher, SimVarValueType } from '@microsoft/msfs-sdk';

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
  Approach,
  MissedApproach
}

/**
 * Sim var names for WT21 LNAV-related data.
 */
export enum WT21LNavDataVars {
  /** The global leg index of the flight plan leg that is nominally being tracked by LNAV. */
  NominalLegIndex = 'L:WTWT21_LNavData_Nominal_Leg_Index',

  /** The current CDI scale label. */
  // eslint-disable-next-line @typescript-eslint/no-shadow
  CDIScaleLabel = 'L:WTWT21_LNavData_CDI_Scale_Label',

  /** The nominal distance remaining to the end of the currently tracked flight plan leg. */
  TrackedLegEndDistance = 'L:WTWT21_LNavData_Tracked_Leg_End_Distance',

  /** The straight-line distance between the present position and the destination, in nautical miles. */
  DestinationDistanceDirect = 'L:WTWT21_LNavData_Destination_Distance_Direct',

  /** The flight plan distance to the final approach fix, in nautical miles. */
  FafDistance = 'L:WTWT21_LNavData_Faf_Distance'
}

/**
 * Events derived from WT21 LNAV-related data sim vars.
 */
export interface WT21LNavDataSimVarEvents extends LNavDataSimVarEvents {
  /** The global leg index of the flight plan leg that is nominally being tracked by LNAV. */
  lnavdata_nominal_leg_index: number;

  /** The current CDI scale label. */
  lnavdata_cdi_scale_label: CDIScaleLabel;

  /** The nominal distance remaining to the end of the currently tracked flight plan leg, in nautical miles. */
  lnavdata_tracked_leg_end_distance: number;

  /** The straight-line distance between the present position and the destination, in nautical miles. */
  lnavdata_destination_distance_direct: number;

  /** The flight plan distance to the final approach fix, in nautical miles. */
  lnavdata_distance_to_faf: number;
}

/**
 * Events related to WT21 LNAV data.
 */
export type WT21LNavDataEvents = WT21LNavDataSimVarEvents;

/**
 * A publisher for WT21 LNAV-related data sim var events.
 */
export class WT21LNavDataSimVarPublisher extends SimVarPublisher<WT21LNavDataSimVarEvents> {
  private static simvars = new Map<keyof WT21LNavDataSimVarEvents, SimVarDefinition>([
    ['lnavdata_dtk_true', { name: LNavDataVars.DTKTrue, type: SimVarValueType.Degree }],
    ['lnavdata_dtk_mag', { name: LNavDataVars.DTKMagnetic, type: SimVarValueType.Degree }],
    ['lnavdata_xtk', { name: LNavDataVars.XTK, type: SimVarValueType.NM }],
    ['lnavdata_cdi_scale', { name: LNavDataVars.CDIScale, type: SimVarValueType.NM }],
    ['lnavdata_cdi_scale_label', { name: WT21LNavDataVars.CDIScaleLabel, type: SimVarValueType.Number }],
    ['lnavdata_waypoint_bearing_true', { name: LNavDataVars.WaypointBearingTrue, type: SimVarValueType.Degree }],
    ['lnavdata_waypoint_bearing_mag', { name: LNavDataVars.WaypointBearingMagnetic, type: SimVarValueType.Degree }],
    ['lnavdata_waypoint_distance', { name: LNavDataVars.WaypointDistance, type: SimVarValueType.NM }],
    ['lnavdata_destination_distance', { name: LNavDataVars.DestinationDistance, type: SimVarValueType.NM }],
    ['lnavdata_nominal_leg_index', { name: WT21LNavDataVars.NominalLegIndex, type: SimVarValueType.Number }],
    ['lnavdata_tracked_leg_end_distance', { name: WT21LNavDataVars.TrackedLegEndDistance, type: SimVarValueType.NM }],
    ['lnavdata_destination_distance_direct', { name: WT21LNavDataVars.DestinationDistanceDirect, type: SimVarValueType.NM }],
    ['lnavdata_distance_to_faf', { name: WT21LNavDataVars.FafDistance, type: SimVarValueType.NM }]
  ]);

  /**
   * Constructor.
   * @param bus The event bus to which to publish.
   */
  public constructor(bus: EventBus) {
    super(WT21LNavDataSimVarPublisher.simvars, bus);
  }
}
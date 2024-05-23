import {
  ArrayUtils, LNavDataVars as BaseLNavDataVars, EventBus, BaseLNavDataEvents as SdkBaseLNavDataEvents,
  BaseLNavDataSimVarEvents as SdkBaseLNavDataSimVarEvents, SimVarPublisher, SimVarPublisherEntry, SimVarValueType, VorToFrom
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
  MissedApproach,
  VfrEnroute,
  VfrTerminal,
  VfrApproach
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
  EgressDistance = 'L:WTGarmin_LNavData_Egress_Distance',

  /** The nominal distance remaining to the egress transition of the currently tracked flight plan leg. */
  ToFrom = 'L:WTGarmin_LNavData_ToFrom'
}

/**
 * Garmin LNAV-related events derived from SimVars keyed by base topic names.
 */
export interface BaseLNavDataSimVarEvents extends SdkBaseLNavDataSimVarEvents {
  /** The nominal desired track at the beginning of the flight plan leg following the currently tracked leg, in degrees true. */
  lnavdata_next_dtk_true: number;

  /** The nominal desired track at the beginning of the flight plan leg following the currently tracked leg, in degrees magnetic. */
  lnavdata_next_dtk_mag: number;

  /** The current CDI scale label. */
  lnavdata_cdi_scale_label: CDIScaleLabel;

  /** The nominal along-track distance remaining to the egress transition of the currently tracked flight plan leg, in nautical miles. */
  lnavdata_egress_distance: number;

  /** The nominal TO/FROM flag. */
  lnavdata_tofrom: VorToFrom;
}

/**
 * Garmin LNAV-related events derived from SimVars keyed by indexed topic names.
 */
export type IndexedLNavDataSimVarEvents<Index extends number = number> = {
  [P in keyof BaseLNavDataSimVarEvents as `${P}_${Index}`]: BaseLNavDataSimVarEvents[P];
};

/**
 * Events related to Garmin LNAV data keyed by base topic names.
 */
export interface BaseLNavDataEvents extends BaseLNavDataSimVarEvents, SdkBaseLNavDataEvents {
  /** The ICAO of the active flight plan destination, or the empty string if there is no destination. */
  lnavdata_destination_icao: string;

  /** The ident of the active flight plan destination, or the empty string if there is no destination. */
  lnavdata_destination_ident: string;

  /** The ICAO of the active flight plan destination runway, or the empty string if there is no destination runway. */
  lnavdata_destination_runway_icao: string;

  /** Information on the nominal current desired track vector. */
  lnavdata_dtk_vector: LNavDataDtkVector;

  /** Information on the nominal next desired track vector. */
  lnavdata_next_dtk_vector: LNavDataDtkVector;

  /** Whether OBS mode can be activated on the current active flight plan leg. */
  obs_available: boolean;
}

/**
 * Events related to Garmin LNAV keyed by indexed topic names.
 */
export type IndexedLNavDataEvents<Index extends number = number> = {
  [P in keyof BaseLNavDataEvents as `${P}_${Index}`]: BaseLNavDataEvents[P];
};

/**
 * Events related to Garmin LNAV that are derived from SimVars.
 */
export interface LNavDataSimVarEvents extends BaseLNavDataSimVarEvents, IndexedLNavDataSimVarEvents {
}

/**
 * Events related to Garmin LNAV.
 */
export interface LNavDataEvents extends BaseLNavDataEvents, IndexedLNavDataEvents {
}

/**
 * A publisher for Garmin LNAV-related data sim var events.
 */
export class LNavDataSimVarPublisher extends SimVarPublisher<LNavDataSimVarEvents> {
  /**
   * Constructor.
   * @param bus The event bus to which to publish.
   */
  public constructor(bus: EventBus) {
    const defs = ArrayUtils.flatMap(
      [
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
        ['lnavdata_egress_distance', { name: GarminLNavDataVars.EgressDistance, type: SimVarValueType.NM }],
        ['lnavdata_tofrom', { name: GarminLNavDataVars.ToFrom, type: SimVarValueType.Number }],
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
/// <reference types="@microsoft/msfs-types/js/simvar" />
/// <reference types="@microsoft/msfs-types/js/avionics" />
import { EventBus } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';
import { SimVarPublisher, SimVarPublisherEntry } from './BasePublishers';
import { AdfRadioIndex, ComRadioIndex, ComSpacing, NavRadioIndex } from './RadioCommon';

/**
 * VOR signal to/from flags.
 */
export enum VorToFrom {
  OFF = 0,
  TO = 1,
  FROM = 2
}

/** Marker beacon signal state. */
export enum MarkerBeaconState {
  Inactive,
  Outer,
  Middle,
  Inner
}

/**
 * Nav radio event roots.
 */
type NavRadioEventsRoot = {
  /** Nav radio active frequency, in megahertz. */
  nav_active_frequency: number;

  /** Nav radio standby frequency, in megahertz. */
  nav_standby_frequency: number;

  /** Nav radio ident string. */
  nav_ident: string;

  /** Nav radio signal strength, in arbitrary units. A value of `0` indicates no signal. */
  nav_signal: number;

  /** Whether nav radio audio monitoring is enabled. */
  nav_sound: boolean;

  /** Nav radio volume, as a percentage (0-100). */
  nav_volume: number;

  /** Nav radio selected course, in degrees. */
  nav_obs: number;

  /** Whether a nav radio's tuned station has a DME component. */
  nav_has_dme: boolean;

  /** Whether a nav radio's tuned station has a VOR component. */
  nav_has_nav: boolean;

  /**
   * Nav radio course needle deflection, scaled to +/-127. Positive values indicate needle deflection to the right, or
   * equivalently, that the airplane is deviated to the left of course.
   */
  nav_cdi: number;

  /** Nav radio DME distance, in nautical miles. */
  nav_dme: number;

  /** Nav radio radial, in degrees (the radial from the tuned station on which the airplane lies). */
  nav_radial: number;

  /**
   * The difference, in degrees, between the course from the airplane to a nav radio's tuned station and the radio's
   * reference course. The radio's reference course is the selected course if the tuned station is a VOR or the
   * localizer course if the tuned station is a localizer. Positive values indicate the airplane is to the left of the
   * reference course.
   */
  nav_radial_error: number;

  /** Nav radio to/from flag. */
  nav_to_from: VorToFrom;

  /** Whether a nav radio's tuned station is a localizer. */
  nav_localizer: boolean;

  /** The set course, in radians, of a nav radio's tuned localizer. */
  nav_localizer_crs: number;

  /** The airport ident of a nav radio's tuned localizer. */
  nav_loc_airport_ident: string;

  /** The runway number of a nav radio's tuned localizer. */
  nav_loc_runway_number: number;

  /** The runway designator of a nav radio's tuned localizer. */
  nav_loc_runway_designator: number;

  /** Whether a nav radio's tuned station has a glideslope. */
  nav_glideslope: boolean;

  /** The angle of a nav radio's tuned glideslope, in degrees. Positive values indicate a descending path. */
  nav_raw_gs: number;

  /** Nav radio glideslope angle error, in degrees. Positive values indicate position above the glideslope. */
  nav_gs_error: number;

  /** The location of a nav radio's tuned VOR station. */
  nav_lla: LatLongAlt;

  /** The location of a nav radio's tuned DME station. */
  nav_dme_lla: LatLongAlt;

  /** The location of a nav radio's tuned glideslope antenna. */
  nav_gs_lla: LatLongAlt;

  /** The nominal magnetic variation defined for a nav radio's tuned station. */
  nav_magvar: number;
};

/**
 * Events for an indexed nav radio.
 */
type NavRadioEventsIndexed<Index extends NavRadioIndex> = {
  [Event in keyof NavRadioEventsRoot as `${Event}_${Index}`]: NavRadioEventsRoot[Event];
};

/**
 * Events related to nav radios.
 */
export interface NavRadioTuneEvents extends
  NavRadioEventsIndexed<1>,
  NavRadioEventsIndexed<2>,
  NavRadioEventsIndexed<3>,
  NavRadioEventsIndexed<4> {
}

/**
 * Com radio event roots.
 */
type ComRadioEventsRoot = {
  /** Com radio active frequency, in megahertz. */
  com_active_frequency: number;

  /** Com radio standby frequency, in megahertz. */
  com_standby_frequency: number;

  /** Com radio active frequency facility name. */
  com_active_facility_name: string;

  /** Com radio active frequency facility type. */
  com_active_facility_type: string;

  /** Com radio active frequency facility ident. */
  com_active_facility_ident: string;

  /** Whether a com radio is set to receive. */
  com_receive: boolean;

  /** Com radio status. */
  com_status: number;

  /** Whether a com radio is set to transmit. */
  com_transmit: boolean;

  /** Com radio spacing mode. */
  com_spacing_mode: ComSpacing;

  /** Com radio volume, as a percentage (0-100). */
  com_volume: number;
};

/**
 * Events for an indexed com radio.
 */
type ComRadioEventsIndexed<Index extends ComRadioIndex> = {
  [Event in keyof ComRadioEventsRoot as `${Event}_${Index}`]: ComRadioEventsRoot[Event];
};

/**
 * Events related to com radios.
 */
export interface ComRadioTuneEvents extends
  ComRadioEventsIndexed<1>,
  ComRadioEventsIndexed<2>,
  ComRadioEventsIndexed<3> {
}

/**
 * ADF radio tuning event roots.
 */
type AdfRadioEventsRoot = {
  /** ADF radio active frequency, in kilohertz. */
  adf_active_frequency: number;

  /** ADF radio standby frequency, in kilohertz. */
  adf_standby_frequency: number;

  /** Whether ADF radio audio monitoring is enabled. */
  adf_sound: boolean;

  /** ADF radio volume, as a percentage (0-100). */
  adf_volume: number;

  /** ADF radio ident, as a string. */
  adf_ident: string;

  /** ADF radio signal, as a number. */
  adf_signal: number;

  /** ADF radio relative bearing, in degrees (the bearing to the tuned station, relative to airplane heading). */
  adf_bearing: number;

  /** The location of an ADF radio's tuned station. */
  adf_lla: LatLongAlt;
};

/**
 * Tuning events for an indexed ADF radio.
 */
type AdfRadioEventsIndexed<Index extends AdfRadioIndex> = {
  [Event in keyof AdfRadioEventsRoot as `${Event}_${Index}`]: AdfRadioEventsRoot[Event];
};

/**
 * Events related to ADF radios.
 */
export interface AdfRadioTuneEvents extends
  AdfRadioEventsIndexed<1>,
  AdfRadioEventsIndexed<2> {
}

/**
 * Events related to marker beacons.
 */
export interface MarkerBeaconTuneEvents {
  /** Whether the marker beacon receiver is in high sensitivity mode. */
  marker_beacon_hisense_on: boolean;

  /** Whether marker beacon audio monitoring is enabled. */
  marker_beacon_sound: boolean;

  /** The current marker beacon received signal state. */
  marker_beacon_state: MarkerBeaconState;

  /**
   * The current marker beacon received signal state.
   *
   * @deprecated Please use {@link marker_beacon_state} instead.
   */
  mkr_bcn_state_simvar: MarkerBeaconState;
}

/**
 * Events related to GPS.
 */
interface GpsEvents {
  /** The desired magnetic track to the next GPS waypoint. */
  gps_dtk: number;

  /** The cross-track error, in nautical miles, to the next GPS waypoint. */
  gps_xtk: number;

  /** The ident of the next GPS waypoint. */
  gps_wp: string;

  /** The magnetic bearing, in degrees, to the next GPS waypoint. */
  gps_wp_bearing: number;

  /** The distance, in nautical miles, to the next GPS waypoint. */
  gps_wp_distance: number;

  /** Whether GPS OBS mode is active. */
  gps_obs_active_simvar: boolean;

  /** The selected GPS OBS course, in degrees. */
  gps_obs_value_simvar: number;
}

/**
 * All event roots related to nav, com, and ADF radios, marker beacon, and GPS.
 */
type NavComIndexedEventRoots = NavRadioEventsRoot & ComRadioEventsRoot & AdfRadioEventsRoot & MarkerBeaconTuneEvents & GpsEvents;

/**
 * Events related to nav, com, and ADF radios.
 */
export interface NavComEvents extends ComRadioTuneEvents, NavRadioTuneEvents, AdfRadioTuneEvents, MarkerBeaconTuneEvents, GpsEvents {
}

/**
 * Events related to nav, com, and ADF radios.
 */
export type NavComSimVars = NavComEvents; // for backwards compatibility

/**
 * A publisher of NAV, COM, ADF radio and marker beacon tuning-related sim var events.
 */
export class NavComSimVarPublisher extends SimVarPublisher<NavComEvents, NavComIndexedEventRoots> {

  /**
   * Creates a new instance of NavComSimVarPublisher.
   * @param bus The event bus to which to publish.
   * @param pacer An optional pacer to use to control the pace of publishing
   */
  public constructor(bus: EventBus, pacer: PublishPacer<NavComEvents> | undefined = undefined) {
    const simvars = new Map<keyof (NavComEvents & NavComIndexedEventRoots), SimVarPublisherEntry<any>>([
      ...NavComSimVarPublisher.createNavRadioDefinitions(),
      ...NavComSimVarPublisher.createComRadioDefinitions(),
      ...NavComSimVarPublisher.createAdfRadioDefinitions(),
      ...NavComSimVarPublisher.createMarkerBeaconDefinitions(),
      ...NavComSimVarPublisher.createGpsDefinitions()
    ]);

    super(simvars, bus, pacer);
  }

  /**
   * Creates an array of nav radio sim var event definitions.
   * @returns An array of nav radio sim var event definitions.
   */
  private static createNavRadioDefinitions(): [keyof NavRadioEventsRoot, SimVarPublisherEntry<any>][] {
    return [
      ['nav_active_frequency', { name: 'NAV ACTIVE FREQUENCY:#index#', type: SimVarValueType.MHz, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_standby_frequency', { name: 'NAV STANDBY FREQUENCY:#index#', type: SimVarValueType.MHz, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_signal', { name: 'NAV SIGNAL:#index#', type: SimVarValueType.Number, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_sound', { name: 'NAV SOUND:#index#', type: SimVarValueType.Bool, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_ident', { name: 'NAV IDENT:#index#', type: SimVarValueType.String, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_volume', { name: 'NAV VOLUME:#index#', type: SimVarValueType.Percent, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_obs', { name: 'NAV OBS:#index#', type: SimVarValueType.Degree, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_has_dme', { name: 'NAV HAS DME:#index#', type: SimVarValueType.Bool, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_has_nav', { name: 'NAV HAS NAV:#index#', type: SimVarValueType.Bool, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_cdi', { name: 'NAV CDI:#index#', type: SimVarValueType.Number, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_dme', { name: 'NAV DME:#index#', type: SimVarValueType.NM, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_radial', { name: 'NAV RADIAL:#index#', type: SimVarValueType.Degree, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_radial_error', { name: 'NAV RADIAL ERROR:#index#', type: SimVarValueType.Degree, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_to_from', { name: 'NAV TOFROM:#index#', type: SimVarValueType.Enum, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_localizer', { name: 'NAV HAS LOCALIZER:#index#', type: SimVarValueType.Bool, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_localizer_crs', { name: 'NAV LOCALIZER:#index#', type: SimVarValueType.Number, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_loc_airport_ident', { name: 'NAV LOC AIRPORT IDENT:#index#', type: SimVarValueType.String, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_loc_runway_designator', { name: 'NAV LOC RUNWAY DESIGNATOR:#index#', type: SimVarValueType.Number, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_loc_runway_number', { name: 'NAV LOC RUNWAY NUMBER:#index#', type: SimVarValueType.Number, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_glideslope', { name: 'NAV HAS GLIDE SLOPE:#index#', type: SimVarValueType.Bool, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_gs_error', { name: 'NAV GLIDE SLOPE ERROR:#index#', type: SimVarValueType.Degree, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_raw_gs', { name: 'NAV RAW GLIDE SLOPE:#index#', type: SimVarValueType.Degree, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_lla', { name: 'NAV VOR LATLONALT:#index#', type: SimVarValueType.LLA, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_dme_lla', { name: 'NAV DME LATLONALT:#index#', type: SimVarValueType.LLA, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_gs_lla', { name: 'NAV GS LATLONALT:#index#', type: SimVarValueType.LLA, indexed: [1, 2, 3, 4], defaultIndex: null }],
      ['nav_magvar', { name: 'NAV MAGVAR:#index#', type: SimVarValueType.Degree, indexed: [1, 2, 3, 4], defaultIndex: null }]
    ];
  }

  /**
   * Creates an array of com radio sim var event definitions.
   * @returns An array of com radio sim var event definitions.
   */
  private static createComRadioDefinitions(): [keyof ComRadioEventsRoot, SimVarPublisherEntry<any>][] {
    return [
      ['com_active_frequency', { name: 'COM ACTIVE FREQUENCY:#index#', type: SimVarValueType.MHz, indexed: [1, 2, 3], defaultIndex: null }],
      ['com_standby_frequency', { name: 'COM STANDBY FREQUENCY:#index#', type: SimVarValueType.MHz, indexed: [1, 2, 3], defaultIndex: null }],
      ['com_active_facility_name', { name: 'COM ACTIVE FREQ NAME:#index#', type: SimVarValueType.String, indexed: [1, 2, 3], defaultIndex: null }],
      ['com_active_facility_type', { name: 'COM ACTIVE FREQ TYPE:#index#', type: SimVarValueType.String, indexed: [1, 2, 3], defaultIndex: null }],
      ['com_active_facility_ident', { name: 'COM ACTIVE FREQ IDENT:#index#', type: SimVarValueType.String, indexed: [1, 2, 3], defaultIndex: null }],
      // Note: 'COM RECEIVE' is whether the radio is receiving OR transmitting,
      // whereas 'COM RECEIVE EX1' is exclusively its receiving state.
      ['com_receive', { name: 'COM RECEIVE EX1:#index#', type: SimVarValueType.Bool, indexed: [1, 2, 3], defaultIndex: null }],
      ['com_status', { name: 'COM STATUS:#index#', type: SimVarValueType.Number, indexed: [1, 2, 3], defaultIndex: null }],
      ['com_transmit', { name: 'COM TRANSMIT:#index#', type: SimVarValueType.Bool, indexed: [1, 2, 3], defaultIndex: null }],
      ['com_spacing_mode', { name: 'COM SPACING MODE:#index#', type: SimVarValueType.Enum, indexed: [1, 2, 3], defaultIndex: null }],
      ['com_volume', { name: 'COM VOLUME:#index#', type: SimVarValueType.Percent, indexed: [1, 2, 3], defaultIndex: null }],
    ];
  }

  /**
   * Creates an array of ADF radio sim var event definitions.
   * @returns An array of ADF radio sim var event definitions.
   */
  private static createAdfRadioDefinitions(): [keyof AdfRadioEventsRoot, SimVarPublisherEntry<any>][] {
    return [
      ['adf_active_frequency', { name: 'ADF ACTIVE FREQUENCY:#index#', type: SimVarValueType.KHz, indexed: [1, 2], defaultIndex: null }],
      ['adf_standby_frequency', { name: 'ADF STANDBY FREQUENCY:#index#', type: SimVarValueType.KHz, indexed: [1, 2], defaultIndex: null }],
      ['adf_sound', { name: 'ADF SOUND:#index#', type: SimVarValueType.Bool, indexed: [1, 2], defaultIndex: null }],
      ['adf_volume', { name: 'ADF VOLUME:#index#', type: SimVarValueType.Percent, indexed: [1, 2], defaultIndex: null }],
      ['adf_ident', { name: 'ADF IDENT:#index#', type: SimVarValueType.String, indexed: [1, 2], defaultIndex: null }],
      ['adf_signal', { name: 'ADF SIGNAL:#index#', type: SimVarValueType.Number, indexed: [1, 2], defaultIndex: null }],
      ['adf_bearing', { name: 'ADF RADIAL:#index#', type: SimVarValueType.Degree, indexed: [1, 2], defaultIndex: null }],
      ['adf_lla', { name: 'ADF LATLONALT:#index#', type: SimVarValueType.LLA, indexed: [1, 2], defaultIndex: null }]
    ];
  }

  /**
   * Creates an array of GPS sim var event definitions.
   * @returns An array of GPS sim var event definitions.
   */
  private static createMarkerBeaconDefinitions(): [keyof MarkerBeaconTuneEvents, SimVarPublisherEntry<any>][] {
    return [
      ['marker_beacon_hisense_on', { name: 'MARKER BEACON SENSITIVITY HIGH', type: SimVarValueType.Bool }],
      ['marker_beacon_sound', { name: 'MARKER SOUND', type: SimVarValueType.Bool }],
      ['marker_beacon_state', { name: 'MARKER BEACON STATE', type: SimVarValueType.Number }],
      ['mkr_bcn_state_simvar', { name: 'MARKER BEACON STATE', type: SimVarValueType.Number }]
    ];
  }

  /**
   * Creates an array of GPS sim var event definitions.
   * @returns An array of GPS sim var event definitions.
   */
  private static createGpsDefinitions(): [keyof GpsEvents, SimVarPublisherEntry<any>][] {
    return [
      ['gps_dtk', { name: 'GPS WP DESIRED TRACK', type: SimVarValueType.Degree }],
      ['gps_xtk', { name: 'GPS WP CROSS TRK', type: SimVarValueType.NM }],
      ['gps_wp', { name: 'GPS WP NEXT ID', type: SimVarValueType.NM }],
      ['gps_wp_bearing', { name: 'GPS WP BEARING', type: SimVarValueType.Degree }],
      ['gps_wp_distance', { name: 'GPS WP DISTANCE', type: SimVarValueType.NM }],
      ['gps_obs_active_simvar', { name: 'GPS OBS ACTIVE', type: SimVarValueType.Bool }],
      ['gps_obs_value_simvar', { name: 'GPS OBS VALUE', type: SimVarValueType.Degree }]
    ];
  }
}
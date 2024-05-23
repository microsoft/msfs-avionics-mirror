/// <reference types="@microsoft/msfs-types/js/simplane" />

import { GeoCircle } from '../geo/GeoCircle';
import { GeoPoint } from '../geo/GeoPoint';
import { MagVar } from '../geo/MagVar';
import { UnitType } from '../math/NumberUnit';
import { Vec3Math } from '../math/VecMath';

/**
 * The available facility frequency types.
 */
export enum FacilityFrequencyType {
  None,
  ATIS,
  Multicom,
  Unicom,
  CTAF,
  Ground,
  Tower,
  Clearance,
  Approach,
  Departure,
  Center,
  FSS,
  AWOS,
  ASOS,
  /** Clearance Pre-Taxi*/
  CPT,
  /** Remote Clearance Delivery */
  GCO
}

/**
 * A radio frequency on facility data.
 */
export interface FacilityFrequency {
  /** The name of the frequency. */
  readonly name: string;

  /** The icao of the frequency. */
  readonly icao: string;

  /** The frequency, in MHz. */
  readonly freqMHz: number;

  /** The frequency, in BCD16. */
  readonly freqBCD16: number;

  /** The type of the frequency. */
  readonly type: FacilityFrequencyType;
}

/**
 * An ILS frequency on airport runway data.
 */
export interface FacilityILSFrequency {
  /** The ICAO of the ILS frequency. */
  readonly icao: string;

  /** The name of the frequency. */
  readonly name: string;

  /** The frequency, in MHz. */
  readonly freqMHz: number;

  /** The frequency, in BCD16. */
  readonly freqBCD16: number;

  /** The type of the frequency. */
  readonly type: FacilityFrequencyType;

  /** Whether or not this ILS has a glideslope. */
  readonly hasGlideslope: boolean;

  /** The glideslope angle for this localizer. */
  readonly glideslopeAngle: number;

  /** The course, in degrees magnetic, for this localizer. */
  readonly localizerCourse: number;

  /** The magvar at this localizer's position. */
  readonly magvar: number;
}

/**
 * A runway on airport facility data.
 */
export interface AirportRunway {

  /** The latitude of the runway center. */
  readonly latitude: number;

  /** The longitude of the runway center. */
  readonly longitude: number;

  /** The runway elevation in meters. */
  readonly elevation: number;

  /** The true heading of the runway, in degrees. */
  readonly direction: number;

  /** The runway designation. */
  readonly designation: string;

  /** The length of the runway in meters. */
  readonly length: number;

  /** The width of the runway in meters. */
  readonly width: number;

  /** The runway surface type. */
  readonly surface: RunwaySurfaceType;

  /** The runway lighting type. */
  readonly lighting: RunwayLightingType;

  /** The primary runway designator character. */
  readonly designatorCharPrimary: RunwayDesignator;

  /** The secondary runway designator character. */
  readonly designatorCharSecondary: RunwayDesignator;

  /** The primary ILS frequency for the runway. */
  readonly primaryILSFrequency: FacilityILSFrequency;

  /** The secondary ILS frequency for the runway. */
  readonly secondaryILSFrequency: FacilityILSFrequency;

  /** The primary elevation for the runway in meters. */
  readonly primaryElevation: number;

  /** The primary displaced threshold distance from the start of the runway in meters. */
  readonly primaryThresholdLength: number;

  /** The primary elevation for the runway in meters. */
  readonly secondaryElevation: number;

  /** The primary displaced threshold distance from the start of the runway in meters. */
  readonly secondaryThresholdLength: number;
}

/**
 * A segment of an airway.
 */
export interface AirwaySegment {
  /** The name of the airway */
  readonly name: string;

  /** The type of the airway. */
  readonly type: number;

  /** The previous FS ICAO on the airway. */
  readonly prevIcao: string;

  /** The next FS ICAO on the airway. */
  readonly nextIcao: string;
}

/**
 * A navdata airway.
 */
export interface Airway {
  /** The name of the airway.*/
  readonly name: string;

  /** The type of the airway. */
  readonly type: number;

  /** The FS ICAOs that make up the airway. */
  readonly icaos: readonly string[];
}

/**
 * A leg in a flight plan or procedure.
 */
export interface FlightPlanLeg {
  /** The ARINC-424 leg type. */
  type: LegType

  /** The ICAO of the fix, if specified. */
  fixIcao: string;

  /** Whether or not the fix is a flyover fix. */
  flyOver: boolean;

  /** Whether or not the distance is minutes of time. */
  distanceMinutes: boolean;

  /** Whether or not the course is true or magnetic. */
  trueDegrees: boolean;

  /** The direction of the turn for the leg, if any. */
  turnDirection: LegTurnDirection;

  /** A reference ICAO for legs that have relative information. */
  originIcao: string;

  /** A center fix ICAO for legs that require it. */
  arcCenterFixIcao: string;

  /** The theta of the leg. */
  theta: number;

  /** The rho of the leg. */
  rho: number;

  /** The course of the leg. */
  course: number;

  /** The distance for the leg, in meters. */
  distance: number;

  /** Any speed restriction for the leg, in knots IAS. */
  speedRestriction: number;

  /** The type of altitude restriction for the leg. */
  altDesc: AltitudeRestrictionType;

  /** The first altitude field for restrictions, in meters. */
  altitude1: number;

  /** The second altitude field for restrictions, in meters. */
  altitude2: number;

  /** An exact latitude for this leg termination. */
  lat?: number;

  /** An exact longitude for this leg termination. */
  lon?: number

  /** Flags indicating the approach fix type. See {@link FixTypeFlags}. Use BitFlags to check. */
  fixTypeFlags: number;

  /** Vertical glide path angle for the leg in degrees + 360 (e.g -3° descent = 357), or 0 if invalid */
  verticalAngle: number;
}

/** Additional Approach Types (additive to those defined in simplane). */
export enum AdditionalApproachType {
  APPROACH_TYPE_VISUAL = 99
}

/** Approach Types inclusive of default ApproachType and AdditionalApproachType. */
export type ExtendedApproachType = ApproachType | AdditionalApproachType;

/**
 * Flags indicating the approach fix type.
 */
export enum FixTypeFlags {
  None = 0,
  IAF = 1 << 0,
  IF = 1 << 1,
  MAP = 1 << 2,
  FAF = 1 << 3,
  MAHP = 1 << 4
}

/**
 * Flags indicating the rnav approach type.
 */
export enum RnavTypeFlags {
  None = 0,
  LNAV = 1 << 0,
  LNAVVNAV = 1 << 1,
  LP = 1 << 2,
  LPV = 1 << 3
}

/**
 * An arrival transition for a particular selected runway.
 */
export interface RunwayTransition {
  /** The number of the runway. */
  readonly runwayNumber: number;

  /** The letter designation for the runway, if any (L, C, R) */
  readonly runwayDesignation: number;

  /** The legs that make up this procedure. */
  readonly legs: readonly Readonly<FlightPlanLeg>[];
}

/**
 * An enroute transition for an arrival.
 */
export interface EnrouteTransition {
  /** The name for this transition. */
  readonly name: string;

  /** The legs that make up this procedure. */
  readonly legs: readonly Readonly<FlightPlanLeg>[];
}

/**
 * An arrival-to-approach transition.
 */
export interface ApproachTransition {
  /** The name for this transition. */
  readonly name: string;

  /** The legs that make up this procedure. */
  readonly legs: readonly Readonly<FlightPlanLeg>[];
}

/**
 * An approach procedure.
 */
export interface ApproachProcedure {
  /** The name of the approach procedure. */
  readonly name: string;

  /** The approach runway designation. */
  readonly runway: string;

  /** The ICAOs associated with this procedure. */
  readonly icaos: readonly string[];

  /** Transitions from the arrival that are available on this procedure. */
  readonly transitions: readonly ApproachTransition[];

  /** The common legs of the procedure for all transitions. */
  readonly finalLegs: readonly Readonly<FlightPlanLeg>[];

  /** The legs of the procedure for the missed approach segment. */
  readonly missedLegs: readonly Readonly<FlightPlanLeg>[];

  /** The approach type. */
  readonly approachType: ExtendedApproachType;

  /** The approach name suffix. */
  readonly approachSuffix: string;

  /** The approach runway designator. */
  readonly runwayDesignator: RunwayDesignator;

  /** The approach runway number. */
  readonly runwayNumber: number;

  /** The approach RNAV Type Flag. */
  readonly rnavTypeFlags: RnavTypeFlags;
}

/** Common interface for procedures. */
export interface Procedure {
  /** The name of the departure. */
  readonly name: string;

  /** The legs of the procedure that are common to all selected transitions and runways. */
  readonly commonLegs: readonly Readonly<FlightPlanLeg>[];

  /** The transition from the departure to the enroute segment. */
  readonly enRouteTransitions: readonly EnrouteTransition[];

  /** The transition from the selected runway to the common procedure legs. */
  readonly runwayTransitions: readonly RunwayTransition[];
}

/**
 * A departure procedure (SID).
 */
export type DepartureProcedure = Procedure

/**
 * An arrival procedure (STAR).
 */
export type ArrivalProcedure = Procedure;

/**
 * A navdata facility from the simulator.
 */
export interface Facility {
  /** The FS ICAO for this facility. */
  readonly icao: string;

  /** The name of the facility. */
  readonly name: string;

  /** The latitude of the facility. */
  readonly lat: number;

  /** The longitude of the facility. */
  readonly lon: number;

  /** The region code in which this facility appears. */
  readonly region: string;

  /** The city region boundary within which this facility appears.*/
  readonly city: string;

  /** The magnetic variation at a given facilty location. */
  readonly magvar: number;
}

/**
 * An airport facility from the simulator.
 */
export interface AirportFacility extends Facility {

  /** The privacy type of this airport. */
  readonly airportPrivateType: AirportPrivateType;

  /** The primary fuel available at this airport. */
  readonly fuel1: string;

  /** The secondary fuel available at this airport. */
  readonly fuel2: string;

  /** The name of the preferred airport approach. */
  readonly bestApproach: string;

  /** Whether or not the airport has radar coverage. */
  readonly radarCoverage: GpsBoolean;

  /** The type of airspace for the airport. */
  readonly airspaceType: number;

  /** The class of the airport. */
  readonly airportClass: number;

  /** Whether or not the airport is towered. */
  readonly towered: boolean;

  /** The frequencies available on the airport. */
  readonly frequencies: readonly FacilityFrequency[];

  /** The runways available on the airport. */
  readonly runways: AirportRunway[];

  /** The departure procedures on the airport. */
  readonly departures: readonly DepartureProcedure[];

  /** The approach procedures on the airport. */
  readonly approaches: readonly ApproachProcedure[];

  /** The arrival procedures on the airport. */
  readonly arrivals: readonly ArrivalProcedure[];
}

/**
 * The class of airport facility.
 */
export enum AirportClass {
  /** No other airport class could be identified. */
  None = 0,

  /** The airport has at least one hard surface runway. */
  HardSurface = 1,

  /** The airport has no hard surface runways. */
  SoftSurface = 2,

  /** The airport has only water surface runways. */
  AllWater = 3,

  /** The airport has no runways, but does contain helipads. */
  HeliportOnly = 4,

  /** The airport is a non-public use airport. */
  Private = 5
}

/**
 * The class of an airport facility, expressed as a mask for nearest airport search session filtering.
 */
export enum AirportClassMask {
  /** No other airport class could be identified. */
  None = AirportClass.None,

  /** The airport has at least one hard surface runway. */
  HardSurface = 1 << AirportClass.HardSurface,

  /** The airport has no hard surface runways. */
  SoftSurface = 1 << AirportClass.SoftSurface,

  /** The airport has only water surface runways. */
  AllWater = 1 << AirportClass.AllWater,

  /** The airport has no runways, but does contain helipads. */
  HeliportOnly = 1 << AirportClass.HeliportOnly,

  /** The airport is a non-public use airport. */
  Private = 1 << AirportClass.Private
}

/**
 * An intersection facility.
 */
export interface IntersectionFacility extends Facility {
  /** The airway segments that are adjacent to this */
  readonly routes: readonly AirwaySegment[];

  /** The FS ICAO of the nearest VOR to this intersection. */
  readonly nearestVorICAO: string;

  /** The type of the nearest VOR. */
  readonly nearestVorType: VorType;

  /** The frequency of the nearest VOR, in BCD16. */
  readonly nearestVorFrequencyBCD16: number;

  /** The frequency of the nearest VOR, in MHz. */
  readonly nearestVorFrequencyMHz: number;

  /** The radial in degrees true from the nearest VOR that the intersection lies on. */
  readonly nearestVorTrueRadial: number;

  /** The radial in degrees magnetic from the nearest VOR that the intersection lies on. */
  readonly nearestVorMagneticRadial: number;

  /** This distance to the nearest VOR. */
  readonly nearestVorDistance: number;
}

/**
 * An enumeration of possible intersection types.
 */
export enum IntersectionType {
  None,
  Named,
  Unnamed,
  Vor,
  NDB,
  Offroute,
  IAF,
  FAF,
  RNAV,
  VFR
}

/**
 * A VOR facility.
 */
export interface VorFacility extends Facility {
  /** The frequency of the VOR, in MHz. */
  readonly freqMHz: number;

  /** The frequency of the VOR, in BCD16. */
  readonly freqBCD16: number;

  /** The magnetic variation of the specific VOR. */
  readonly magneticVariation: number;

  /** The type of the VOR. */
  readonly type: VorType;

  /** The class of the VOR. */
  readonly vorClass: VorClass;
}

/**
 * A NDB facility.
 */
export interface NdbFacility extends Facility {
  /** The frequency of the facility, in kilohertz. (Despite the name of the property, the value is not given in megahertz.) */
  readonly freqMHz: number;

  /** The type of NDB. */
  readonly type: NdbType;
}

/**
 * A User Waypoint facility.
 */
export interface UserFacility extends Facility {
  /** If the user waypoint is temporary. */
  isTemporary: boolean;
  /** The type of user facility this is. */
  userFacilityType: UserFacilityType;
  /** The ICAO of the first reference facility. */
  reference1Icao?: string;
  /** The magnetic radial, in degrees, from the first reference facility. */
  reference1Radial?: number;
  /** The magnetic variation, in degrees, at the first reference facility. */
  reference1MagVar?: number;
  /** The disance from the first reference facility, in nautical miles. */
  reference1Distance?: number;
  /** The ICAO of the second reference facility. */
  reference2Icao?: string;
  /** The magnetic radial, in degrees, from the second reference facility. */
  reference2Radial?: number;
  /** The magnetic variation, in degrees, at the second reference facility. */
  reference2MagVar?: number;
}

export enum UserFacilityType {
  RADIAL_RADIAL,
  RADIAL_DISTANCE,
  LAT_LONG
}

/**
 * A runway waypoint facility.
 */
export interface RunwayFacility extends Facility {
  /** The runway associated with this facility. */
  readonly runway: OneWayRunway;
}

/**
 * A visual approach waypoint facility.
 */
export interface VisualFacility extends Facility {
  /** The name of the approach to which this facility belongs. */
  readonly approach: string;
}

/**
 * ARINC 424 Leg Types
 */
export enum LegType {
  /** An unknown leg type. */
  Unknown = 0,

  /** An arc-to-fix leg. This indicates a DME arc leg to a specified fix.*/
  AF = 1,

  /** A course-to-altitude leg. */
  CA = 2,

  /**
   * A course-to-DME-distance leg. This leg is flown on a wind corrected course
   * to a specific DME distance from another fix.
   */
  CD = 3,

  /** A course-to-fix leg.*/
  CF = 4,

  /** A course-to-intercept leg. */
  CI = 5,

  /** A course-to-radial intercept leg. */
  CR = 6,

  /** A direct-to-fix leg, from an unspecified starting position. */
  DF = 7,

  /**
   * A fix-to-altitude leg. A FA leg is flown on a track from a fix to a
   * specified altitude.
   */
  FA = 8,

  /**
   * A fix-to-distance leg. This leg is flown on a track from a fix to a
   * specific distance from the fix.
   */
  FC = 9,

  /**
   * A fix to DME distance leg. This leg is flown on a track from a fix to
   * a specific DME distance from another fix.
   */
  FD = 10,

  /** A course-to-manual-termination leg. */
  FM = 11,

  /** A hold-to-altitude leg. The hold is flown until a specified altitude is reached. */
  HA = 12,

  /**
   * A hold-to-fix leg. This indicates one time around the hold circuit and
   * then an exit.
   */
  HF = 13,

  /** A hold-to-manual-termination leg. */
  HM = 14,

  /** Initial procedure fix. */
  IF = 15,

  /** A procedure turn leg. */
  PI = 16,

  /** A radius-to-fix leg, with endpoint fixes, a center fix, and a radius. */
  RF = 17,

  /** A track-to-fix leg, from the previous fix to the terminator. */
  TF = 18,

  /** A heading-to-altitude leg. */
  VA = 19,

  /** A heading-to-DME-distance leg. */
  VD = 20,

  /** A heading-to-intercept leg. */
  VI = 21,

  /** A heading-to-manual-termination leg. */
  VM = 22,

  /** A heading-to-radial intercept leg. */
  VR = 23,

  /** A leg representing a lateral and vertical discontinuity in the flight plan. */
  Discontinuity = 99,

  /** A leg representing a lateral and vertical discontinuity in the flight plan that does not prevent sequencing. */
  ThruDiscontinuity = 100,
}

/**
 * Types of altitude restrictions on procedure legs.
 */
export enum AltitudeRestrictionType {
  Unused,
  At,
  AtOrAbove,
  AtOrBelow,
  Between
}

export enum LegTurnDirection {
  None,
  Left,
  Right,
  Either
}

export enum AirwayType {
  None,
  Victor,
  Jet,
  Both
}

export enum NdbType {
  CompassPoint,
  MH,
  H,
  HH
}

export enum VorType {
  Unknown,
  VOR,
  VORDME,
  DME,
  TACAN,
  VORTAC,
  ILS,
  VOT
}

export enum RunwaySurfaceType {
  Concrete,
  Grass,
  WaterFSX,
  GrassBumpy,
  Asphalt,
  ShortGrass,
  LongGrass,
  HardTurf,
  Snow,
  Ice,
  Urban,
  Forest,
  Dirt,
  Coral,
  Gravel,
  OilTreated,
  SteelMats,
  Bituminous,
  Brick,
  Macadam,
  Planks,
  Sand,
  Shale,
  Tarmac,
  WrightFlyerTrack,
  //SURFACE_TYPE_LAST_FSX
  Ocean = 26,
  Water,
  Pond,
  Lake,
  River,
  WasteWater,
  Paint
  // UNUSED
  // SURFACE_TYPE_ERASE_GRASS
}

export enum RunwayLightingType {
  Unknown,
  None,
  PartTime,
  FullTime,
  Frequency
}

/**
 * Describes a selected one way runway.
 */
export interface OneWayRunway {
  /** The index of this runway's parent AirportRunway object in the airport facility. */
  readonly parentRunwayIndex: number;

  /** The runway number of this runway (as the numerical value of the one way designation). */
  readonly direction: number;

  /** The runwayDesignator of this runway. */
  readonly runwayDesignator: RunwayDesignator;

  /** The designation of this runway. */
  readonly designation: string;

  /** The latitude of the threshold of this runway. */
  readonly latitude: number;

  /** The longitude of the threshold of this runway. */
  readonly longitude: number;

  /** The elevation of this runway, at the displaced threshold, in meters. */
  readonly elevation: number;

  /** The elevation of this runway, at the opposite displaced threshold, in meters. */
  readonly elevationEnd: number;

  /** The gradient of this runway, in percent. Positive values indicate an upward slope from the start to the end. */
  readonly gradient: number;

  /** The true course of this runway in degrees. */
  readonly course: number;

  /** The ILS frequency for this runway. */
  readonly ilsFrequency?: FacilityILSFrequency;

  /** The total length of this runway, including displaced thresholds, in meters. */
  readonly length: number;

  /** The width of this runway in meters. */
  readonly width: number;

  /** The distance, in meters, between the start of this runway and the displaced threshold on that end. */
  readonly startThresholdLength: number;

  /** The distance, in meters, between the end of this runway and the displaced threshold on that end. */
  readonly endThresholdLength: number;

  /** The surface type of this runway. */
  readonly surface: RunwaySurfaceType;

  /** The lighting available for this runway. */
  readonly lighting: RunwayLightingType;
}

export enum AirportPrivateType {
  Uknown,
  Public,
  Military,
  Private
}

export enum GpsBoolean {
  Unknown,
  No,
  Yes
}

export enum VorClass {
  Unknown,
  Terminal,
  LowAlt,
  HighAlt,
  ILS,
  VOT
}

export enum FacilityType {
  Airport = 'LOAD_AIRPORT',
  Intersection = 'LOAD_INTERSECTION',
  VOR = 'LOAD_VOR',
  NDB = 'LOAD_NDB',
  USR = 'USR',
  RWY = 'RWY',
  VIS = 'VIS'
}

/**
 * A type map of FacilityType enum to facility type.
 */
export type FacilityTypeMap = {
  /** Airport facility. */
  [FacilityType.Airport]: AirportFacility,

  /** VOR facility. */
  [FacilityType.VOR]: VorFacility,

  /** NDB facility. */
  [FacilityType.NDB]: NdbFacility,

  /** Intersection facility. */
  [FacilityType.Intersection]: IntersectionFacility,

  /** User waypoint facility. */
  [FacilityType.USR]: UserFacility

  /** Runway waypoint facility. */
  [FacilityType.RWY]: RunwayFacility

  /** Visual approach waypoint facility. */
  [FacilityType.VIS]: VisualFacility
}

export enum FacilitySearchType {
  All,
  Airport,
  Intersection,
  Vor,
  Ndb,
  Boundary,
  User,
  Visual,
  AllExceptVisual
}

/**
 * Results from the completion of a nearest facilities search.
 */
export interface NearestSearchResults<TAdded, TRemoved> {
  /** The ID of the search session these results belong to. */
  readonly sessionId: number,

  /** The ID of the search that was performed. */
  readonly searchId: number,

  /** The list of items added since the previous search. */
  readonly added: readonly TAdded[]

  /** The list of items removed since the previous search. */
  readonly removed: readonly TRemoved[]
}

/**
 * A facility that describes an airspace boundary.
 */
export interface BoundaryFacility {
  /** The unique ID of the boundary. */
  readonly id: number;

  /** The name of the boundary. */
  readonly name: string,

  /** The airspace type of the boundary. */
  readonly type: BoundaryType,

  /** The minimum altitude for the boundary. */
  readonly minAlt: number,

  /** The maximum altitude for the boundary. */
  readonly maxAlt: number,

  /** The minimum altitude type. */
  readonly minAltType: BoundaryAltitudeType,

  /** The maximum altitude type. */
  readonly maxAltType: BoundaryAltitudeType,

  /** The top left corner of the bounding box for the boundary. */
  readonly topLeft: LatLong,

  /** The bottom right corner of the bounding box for the boundary. */
  readonly bottomRight: LatLong,

  /** The vectors that describe the boundary borders. */
  readonly vectors: BoundaryVector[]

  /** LODs of the vectors that describe the boundary borders. */
  readonly lods?: BoundaryVector[][];
}

/**
 * A type of airspace boundary.
 */
export enum BoundaryType {
  None,
  Center,
  ClassA,
  ClassB,
  ClassC,
  ClassD,
  ClassE,
  ClassF,
  ClassG,
  Tower,
  Clearance,
  Ground,
  Departure,
  Approach,
  MOA,
  Restricted,
  Prohibited,
  Warning,
  Alert,
  Danger,
  NationalPark,
  ModeC,
  Radar,
  Training
}

/**
 * A type of airspace boundary altitude maxima.
 */
export enum BoundaryAltitudeType {
  Unknown,
  MSL,
  AGL,
  Unlimited
}

/**
 * A vector in a boundary border geometry.
 */
export interface BoundaryVector {
  /** The type of the vector. */
  readonly type: BoundaryVectorType,

  /**
   * The origin ID of the vector. If the type is Origin, then this is the ID of the
   * vector. If the type is not Origin, then this is the ID of the origin vector
   * that relates to the current vector.
   */
  readonly originId: number,

  /** The latitude of the vector. */
  readonly lat: number,

  /** The longitude of the vector. */
  readonly lon: number,

  /** The radius of the vector, if any. */
  readonly radius: number
}

/**
 * A type of boundary geometry vector.
 */
export enum BoundaryVectorType {
  None,
  Start,
  Line,
  Origin,
  ArcCW,
  ArcCCW,
  Circle
}

/**
 * A METAR.
 */
export interface Metar {
  /** The ident of this METAR's airport. */
  readonly icao: string;

  /** The day of observation, in UTC time. */
  readonly day: number;

  /** The hour of observation, in UTC time. */
  readonly hour: number;

  /** The minute of observation, in UTC time. */
  readonly min: number;

  /** The max wind direction, in degrees relative to true north. */
  readonly maxWindDir?: number;

  /** The min wind direction, in degrees relative to true north. */
  readonly minWindDir?: number;

  /** The wind direction, in degrees relative to true north. */
  readonly windDir?: number;

  /** The wind speed, expressed in units defined by `windSpeedUnits`. */
  readonly windSpeed: number;

  /** The wind gust, expressed in units defined by `windSpeedUnits`. */
  readonly gust?: number;

  /** The units in which this METAR's wind speeds are reported. */
  readonly windSpeedUnits: MetarWindSpeedUnits;

  /** Whether winds are variable. */
  readonly vrb: boolean;

  /** Whether ceiling and visibility are OK. */
  readonly cavok: boolean;

  /** The visibility, expressed in units defined by `visUnits`. */
  readonly vis: number;

  /** The units in which this METAR's visibility is reported. */
  readonly visUnits: MetarVisibilityUnits;

  /** Whether the observed visibility is less than the reported visibility. */
  readonly visLt: boolean;

  /** Cloud layers. */
  readonly layers: readonly MetarCloudLayer[];

  /** The vertical visibility, in hundreds of feet. */
  readonly vertVis?: number;

  /** The temperature, in degrees Celsius. */
  readonly temp: number;

  /** The dew point, in degrees Celsius. */
  readonly dew: number;

  /** The altimeter setting, in inHg. */
  readonly altimeterA?: number;

  /** The altimeter setting, in hPa. */
  readonly altimeterQ?: number;

  /** The estimated sea-level pressure, in hPa. */
  readonly slp?: number;

  /** Significant weather phenomena. */
  readonly phenomena: readonly MetarPhenomenon[];

  /** Whether this METAR contains remarks. */
  readonly rmk: boolean;

  /** A formatted string representation of this METAR. */
  readonly metarString: string;
}

/**
 * Wind speed units used by METAR.
 */
export enum MetarWindSpeedUnits {
  Knot,
  MeterPerSecond,
  KilometerPerHour
}

/** Visibility distance units used by METAR. */
export enum MetarVisibilityUnits {
  Meter,
  StatuteMile
}

/**
 * A METAR cloud layer description.
 */
export interface MetarCloudLayer {
  /** The altitude of this layer, in hundreds of feet. */
  readonly alt: number;

  /** The coverage of this layer. */
  readonly cover: MetarCloudLayerCoverage;

  /** The significant cloud type found in this layer. */
  readonly type: MetarCloudLayerType;
}

/**
 * METAR cloud layer coverage/sky condition.
 */
export enum MetarCloudLayerCoverage {
  SkyClear,
  Clear,
  NoSignificant,
  Few,
  Scattered,
  Broken,
  Overcast
}

/**
 * METAR significant cloud types.
 */
export enum MetarCloudLayerType {
  Unspecified = -1,
  ToweringCumulus,
  Cumulonimbus,
  AltocumulusCastellanus
}

/**
 * A METAR weather phenomenon.
 */
export interface MetarPhenomenon {
  /** The type of this phenomenon. */
  readonly phenom: MetarPhenomenonType;

  /**
   * The intensity of this phenomenon.
   */
  readonly intensity: MetarPhenomenonIntensity;

  /** Whether this phenomenon has the blowing modifier. */
  readonly blowing: boolean;

  /** Whether this phenomenon has the freezing modifier. */
  readonly freezing: boolean;

  /** Whether this phenomenon has the drifting modifier. */
  readonly drifting: boolean;

  /** Whether this phenomenon has the vicinity modifier. */
  readonly vicinity: boolean;

  /** Whether this phenomenon has the partial modifier. */
  readonly partial: boolean;

  /** Whether this phenomenon has the shallow modifier. */
  readonly shallow: boolean;

  /** Whether this phenomenon has the patches modifier. */
  readonly patches: boolean;

  /** Whether this phenomenon has the temporary modifier. */
  readonly tempo: boolean;

  /** Whether this phenomenon has the thunderstorm modifier. */
  readonly ts: boolean;
}

/** METAR phenomenon types. */
export enum MetarPhenomenonType {
  None,
  Mist,
  Duststorm,
  Dust,
  Drizzle,
  FunnelCloud,
  Fog,
  Smoke,
  Hail,
  SmallHail,
  Haze,
  IceCrystals,
  IcePellets,
  DustSandWhorls,
  Spray,
  Rain,
  Sand,
  SnowGrains,
  Shower,
  Snow,
  Squalls,
  Sandstorm,
  UnknownPrecip,
  VolcanicAsh
}

/** METAR phenomenon intensities. */
export enum MetarPhenomenonIntensity {
  Light = -1,
  Normal,
  Heavy
}

/**
 * Methods for working with FS ICAO strings.
 */
export class ICAO {

  /**
   * An empty ICAO.
   */
  public static readonly emptyIcao = '            ';

  /**
   * Gets the facility type from an ICAO.
   * @param icao The icao to get the facility type for.
   * @returns The ICAO facility type.
   * @throws An error if the facility type cannot be determined.
   */
  public static getFacilityType(icao: string): FacilityType {
    switch (icao[0]) {
      case 'A':
        return FacilityType.Airport;
      case 'W':
        return FacilityType.Intersection;
      case 'V':
        return FacilityType.VOR;
      case 'N':
        return FacilityType.NDB;
      case 'U':
        return FacilityType.USR;
      case 'R':
        return FacilityType.RWY;
      case 'S':
        return FacilityType.VIS;
      default:
        throw new Error(`ICAO ${icao} has unknown type: ${icao[0]}`);
    }
  }

  /**
   * Returns the ident of the icao's associated airport. (ex. for terminal waypoints)
   * @param icao The icao to get the airport ident for.
   * @returns The airport ident.
   */
  public static getAssociatedAirportIdent(icao: string): string {
    return icao.substr(3, 4).trim();
  }

  /**
   * Checks whether an ICAO string defines a facility (optionally of a specific type).
   * @param icao An ICAO string.
   * @param type The specific facility type to check against. If not defined, this method will return `true` as long as
   * the ICAO string defines any valid facility type.
   * @returns Whether the given ICAO string defines a facility of the specified type.
   */
  public static isFacility(icao: string, type?: FacilityType): boolean {
    switch (icao[0]) {
      case 'A':
        return type === undefined || type === FacilityType.Airport;
      case 'W':
        return type === undefined || type === FacilityType.Intersection;
      case 'V':
        return type === undefined || type === FacilityType.VOR;
      case 'N':
        return type === undefined || type === FacilityType.NDB;
      case 'U':
        return type === undefined || type === FacilityType.USR;
      case 'R':
        return type === undefined || type === FacilityType.RWY;
      case 'S':
        return type === undefined || type === FacilityType.VIS;
      default:
        return false;
    }
  }

  /**
   * Gets the ident for a given ICAO string.
   * @param icao The FS ICAO to get the ident for.
   * @returns The ICAO ident.
   */
  public static getIdent(icao: string): string {
    return icao.substr(7).trim();
  }

  /**
   * Gets the region code for a given ICAO string.
   * @param icao The FS ICAO to get the ident for.
   * @returns The two letter region code.
   */
  public static getRegionCode(icao: string): string {
    return icao.substr(1, 2).trim();
  }
}

/**
 * Utility functions for working with facilities.
 */
export class FacilityUtils {
  private static readonly geoPointCache = [new GeoPoint(0, 0)];
  private static readonly geoCircleCache = [new GeoCircle(Vec3Math.create(), 0), new GeoCircle(Vec3Math.create(), 0)];
  private static readonly intersectionCache = [new GeoPoint(0, 0), new GeoPoint(0, 0)];

  /**
   * Checks whether a facility is of a given type.
   * @param facility The facility to check.
   * @param type The facility type to check against.
   * @returns Whether the facility is of the specified type.
   */
  public static isFacilityType<T extends FacilityType>(facility: Facility, type: T): facility is FacilityTypeMap[T] {
    // Need to check for the intersection version of VOR/NDB facilities - these facilities have identical ICAOs
    // to their VOR/NDB counterparts, so we need to manually check the __Type property on the facility object.
    if ((facility as any)['__Type'] === 'JS_FacilityIntersection') {
      return type === FacilityType.Intersection;
    }

    return ICAO.isFacility(facility.icao, type);
  }

  /**
   * Gets the magnetic variation at a facility, in degrees. If the facility is a VOR, the magnetic variation defined
   * by the VOR is returned. For all other facilities, the modeled magnetic variation at the location of the facility
   * is returned.
   * @param facility A facility.
   * @returns The magnetic variation at the specified facility, in degrees.
   */
  public static getMagVar(facility: Facility): number {
    if (FacilityUtils.isFacilityType(facility, FacilityType.VOR)) {
      return -facility.magneticVariation; // VOR facility magvar is positive west instead of the standard positive east
    } else {
      return MagVar.get(facility.lat, facility.lon);
    }
  }

  /**
   * Gets latitude/longitude coordinates corresponding to a radial and distance from a reference facility.
   * @param reference The reference facility.
   * @param radial The magnetic radial, in degrees.
   * @param distance The distance, in nautical miles.
   * @param out The GeoPoint object to which to write the result.
   * @returns The latitude/longitude coordinates corresponding to the specified radial and distance from the reference
   * facility.
   */
  public static getLatLonFromRadialDistance(reference: Facility, radial: number, distance: number, out: GeoPoint): GeoPoint {
    return FacilityUtils.geoPointCache[0].set(reference).offset(
      MagVar.magneticToTrue(radial, FacilityUtils.getMagVar(reference)),
      UnitType.NMILE.convertTo(distance, UnitType.GA_RADIAN),
      out
    );
  }

  /**
   * Gets latitude/longitude coordinates corresponding to the intersection of two facility radials.
   * @param reference1 The first reference facility.
   * @param radial1 The first magnetic radial, in degrees.
   * @param reference2 The second reference facility.
   * @param radial2 The second magnetic radial, in degrees.
   * @param out The GeoPoint object to which to write the result.
   * @returns The latitude/longitude coordinates corresponding to the intersection of the two specified radials. If
   * the specified radials do not intersect at a unique point, `NaN` is written to both `lat` and `lon`.
   */
  public static getLatLonFromRadialRadial(reference1: Facility, radial1: number, reference2: Facility, radial2: number, out: GeoPoint): GeoPoint {
    const magVar1 = FacilityUtils.getMagVar(reference1);
    const magVar2 = FacilityUtils.getMagVar(reference2);

    const radialCircle1 = FacilityUtils.geoCircleCache[0].setAsGreatCircle(reference1, MagVar.magneticToTrue(radial1, magVar1));
    const radialCircle2 = FacilityUtils.geoCircleCache[1].setAsGreatCircle(reference2, MagVar.magneticToTrue(radial2, magVar2));

    const radial1IncludesRef2 = radialCircle1.includes(reference2);
    const radial2IncludesRef1 = radialCircle2.includes(reference1);

    if (radial1IncludesRef2 && radial2IncludesRef1) {
      // Radials are parallel or antiparallel, and therefore do not have a unique intersection point.
      return out.set(NaN, NaN);
    } else if (radial1IncludesRef2) {
      // Reference 2 lies along the great circle of radial 1. The intersection point therefore is either reference 2
      // or its antipode. One of the two lies on the radial, and the other lies on the anti-radial.

      return radialCircle1.angleAlong(reference1, reference2, Math.PI) < Math.PI ? out.set(reference2) : out.set(reference2).antipode();
    } else if (radial2IncludesRef1) {
      // Reference 1 lies along the great circle of radial 2. The intersection point therefore is either reference 1
      // or its antipode. One of the two lies on the radial, and the other lies on the anti-radial.

      return radialCircle2.angleAlong(reference2, reference1, Math.PI) < Math.PI ? out.set(reference1) : out.set(reference1).antipode();
    }

    // Radials, unlike great circles, do not circumscribe the globe. Therefore, we choose the order of the intersection
    // operation carefully to ensure that the first solution (if it exists) is the "correct" intersection.
    const numIntersections = radialCircle1.encircles(reference2)
      ? radialCircle2.intersectionGeoPoint(radialCircle1, FacilityUtils.intersectionCache)
      : radialCircle1.intersectionGeoPoint(radialCircle2, FacilityUtils.intersectionCache);

    if (numIntersections === 0) {
      return out.set(NaN, NaN);
    }

    return out.set(FacilityUtils.intersectionCache[0]);
  }
}

/**
 * Utility functions for working with intersection facilities.
 */
export class IntersectionFacilityUtils {
  private static readonly TERMINAL_REGEX = /^...[a-zA-Z\d]/;

  /**
   * Checks whether an intersection ICAO belongs to a terminal intersection.
   * @returns Whether the specified intersection ICAO belongs to a terminal intersection.
   * @throws Error if the specified ICAO is not an intersection ICAO.
   */
  public static isTerminal(icao: string): boolean;
  /**
   * Checks whether an intersection facility is a terminal intersection.
   * @returns Whether the specified intersection facility is a terminal intersection.
   * @throws Error if the specified facility is not an intersection.
   */
  public static isTerminal(facility: IntersectionFacility): boolean;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static isTerminal(arg: string | IntersectionFacility): boolean {
    const icao = typeof arg === 'string' ? arg : arg.icao;

    if (!ICAO.isFacility(icao, FacilityType.Intersection)) {
      throw new Error(`Facility with ICAO ${icao} is not an intersection`);
    }

    return IntersectionFacilityUtils.TERMINAL_REGEX.test(icao);
  }

  /**
   * Gets the non-terminal version of an intersection ICAO. If the ICAO is already a non-terminal intersection ICAO,
   * then an identical string will be returned.
   * @param icao An intersection ICAO.
   * @returns The non-terminal version of the specified intersection ICAO.
   * @throws Error if the specified ICAO is not an intersection ICAO.
   */
  public static getNonTerminalICAO(icao: string): string {
    if (!ICAO.isFacility(icao, FacilityType.Intersection)) {
      throw new Error(`Facility with ICAO ${icao} is not an intersection`);
    }

    return IntersectionFacilityUtils.TERMINAL_REGEX.test(icao) ? `${icao.substring(0, 3)}    ${icao.substring(7)}` : icao;
  }

  private static readonly filterDuplicatesSet = new Set<string>();

  /**
   * Gets an ICAO string from itself.
   * @param icao An ICAO string.
   * @returns The specified ICAO string.
   */
  private static getIcaoIdentity(icao: string): string {
    return icao;
  }

  /**
   * Gets an ICAO string from a facility.
   * @param facility A facility.
   * @returns The specified facility's ICAO string.
   */
  private static getIcaoFacility(facility: Facility): string {
    return facility.icao;
  }

  /**
   * Filters an array of ICAOs such that the filtered array does not contain any duplicate terminal/non-terminal
   * intersection pairs. All non-intersection ICAOs are guaranteed to be retained in the filtered array.
   * @param icaos The array to filter.
   * @param retainTerminal Whether to retain the terminal version of a duplicate pair in the filtered array. If `true`,
   * each non-terminal intersection in the array will be filtered out if and only if the array contains at least one of
   * its terminal intersection counterparts. If `false`, each terminal intersection in the array will be filtered out
   * if and only if the array contains its non-terminal intersection counterpart. Defaults to `false`.
   * @returns A copy of the original array with no duplicate terminal/non-terminal intersection pairs.
   */
  public static filterDuplicates(icaos: readonly string[], retainTerminal?: boolean): string[];
  /**
   * Filters an array of facilities such that the filtered array does not contain any duplicate terminal/non-terminal
   * intersection pairs. All non-intersection facilities are guaranteed to be retained in the filtered array.
   * @param icaos The array to filter.
   * @param retainTerminal Whether to retain the terminal version of a duplicate pair in the filtered array. If `true`,
   * each non-terminal intersection in the array will be filtered out if and only if the array contains at least one of
   * its terminal intersection counterparts. If `false`, each terminal intersection in the array will be filtered out
   * if and only if the array contains its non-terminal intersection counterpart. Defaults to `false`.
   * @returns A copy of the original array with no duplicate terminal/non-terminal intersection pairs.
   */
  public static filterDuplicates(facilities: readonly Facility[], retainTerminal?: boolean): Facility[];
  /**
   * Filters an array of arbitrary elements such that the filtered array does not contain any elements that are mapped
   * to duplicate terminal/non-terminal intersection pairs. All elements that are not mapped to intersections are
   * guaranteed to be retained in the filtered array.
   * @param icaos The array to filter.
   * @param getIcao A function which maps array elements to ICAOs.
   * @param retainTerminal Whether to retain the terminal version of a duplicate pair in the filtered array. If `true`,
   * each non-terminal intersection in the array will be filtered out if and only if the array contains at least one of
   * its terminal intersection counterparts. If `false`, each terminal intersection in the array will be filtered out
   * if and only if the array contains its non-terminal intersection counterpart. Defaults to `false`.
   * @returns A copy of the original array with no elements that are mapped to duplicate terminal/non-terminal
   * intersection pairs.
   */
  public static filterDuplicates<T>(array: readonly T[], getIcao: (element: T) => string, retainTerminal?: boolean): T[];
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static filterDuplicates(array: readonly any[], arg2?: boolean | ((element: any) => string), arg3?: boolean): any[] {
    if (array.length === 0) {
      return [];
    }

    let getIcao: (element: any) => string;
    let retainTerminal: boolean;

    if (typeof arg2 === 'function') {
      getIcao = arg2;
      retainTerminal = arg3 ?? false;
    } else {
      retainTerminal = arg2 ?? false;
      if (typeof array[0] === 'string') {
        getIcao = IntersectionFacilityUtils.getIcaoIdentity;
      } else {
        getIcao = IntersectionFacilityUtils.getIcaoFacility;
      }
    }

    // Build the set of ICAOs to filter.
    IntersectionFacilityUtils.filterDuplicatesSet.clear();
    for (let i = 0; i < array.length; i++) {
      const icao = getIcao(array[i]);
      if (ICAO.isFacility(icao, FacilityType.Intersection) && IntersectionFacilityUtils.isTerminal(icao) === retainTerminal) {
        IntersectionFacilityUtils.filterDuplicatesSet.add(IntersectionFacilityUtils.getNonTerminalICAO(icao));
      }
    }

    // If there are no ICAOs to filter, then just return a copy of the original array.
    if (IntersectionFacilityUtils.filterDuplicatesSet.size === 0) {
      return array.slice();
    }

    const filtered = array.filter(icao => {
      return IntersectionFacilityUtils.filterDuplicatesHelper(icao, getIcao, retainTerminal, IntersectionFacilityUtils.filterDuplicatesSet);
    });

    IntersectionFacilityUtils.filterDuplicatesSet.clear();

    return filtered;
  }

  /**
   * Checks whether an element should be filtered out from an array such that the filtered array does not contain any
   * elements that are mapped to duplicate terminal/non-terminal intersection pairs.
   * @param element The element to check.
   * @param getIcao A function which maps elements to ICAOs.
   * @param retainTerminal Whether to retain the terminal version of a duplicate pair in the filtered array.
   * @param nonTerminalIcaosToFilter A set of non-terminal ICAOs to filter out of the array.
   * @returns Whether the specified element should be filtered out from an array such that the filtered array does not
   * contain any elements that are mapped to duplicate terminal/non-terminal intersection pairs.
   */
  private static filterDuplicatesHelper<T>(element: T, getIcao: (element: T) => string, retainTerminal: boolean, nonTerminalIcaosToFilter: ReadonlySet<string>): boolean {
    const icao = getIcao(element);

    if (!ICAO.isFacility(icao, FacilityType.Intersection)) {
      return true;
    }

    const isTerminal = IntersectionFacilityUtils.isTerminal(icao);

    if (isTerminal === retainTerminal) {
      return true;
    }

    if (isTerminal) {
      return !nonTerminalIcaosToFilter.has(IntersectionFacilityUtils.getNonTerminalICAO(icao));
    } else {
      return !nonTerminalIcaosToFilter.has(icao);
    }
  }
}

/**
 * Utility functions for working with user facilities.
 */
export class UserFacilityUtils {
  private static readonly geoPointCache = [new GeoPoint(0, 0)];

  /**
   * Creates a user facility from latitude/longitude coordinates.
   * @param icao The ICAO string of the new facility.
   * @param lat The latitude of the new facility.
   * @param lon The longitude of the new facility.
   * @param isTemporary Whether the new facility is temporary.
   * @param name The name of the new facility.
   * @returns A new user facility.
   */
  public static createFromLatLon(icao: string, lat: number, lon: number, isTemporary = false, name?: string): UserFacility {
    const fac: UserFacility = {
      icao,
      name: name ?? '',
      lat,
      lon,
      userFacilityType: UserFacilityType.LAT_LONG,
      isTemporary,
      region: '',
      city: '',
      magvar: MagVar.get(lat, lon)
    };
    return fac;
  }

  /**
   * Creates a user facility from a radial and distance relative to a reference facility.
   * @param icao The ICAO string of the new facility.
   * @param reference The reference facility.
   * @param radial The magnetic radial, in degrees, of the reference facility on which the new facility lies.
   * @param distance The distance, in nautical miles, from the reference facility.
   * @param isTemporary Whether the new facility is temporary.
   * @param name The name of the new facility.
   * @returns A new user facility.
   */
  public static createFromRadialDistance(icao: string, reference: Facility, radial: number, distance: number, isTemporary = false, name?: string): UserFacility {
    const location = FacilityUtils.getLatLonFromRadialDistance(reference, radial, distance, UserFacilityUtils.geoPointCache[0]);

    return {
      icao,
      name: name ?? '',
      lat: location.lat,
      lon: location.lon,
      userFacilityType: UserFacilityType.RADIAL_DISTANCE,
      isTemporary,
      region: '',
      city: '',
      magvar: MagVar.get(location),
      reference1Icao: reference.icao,
      reference1Radial: radial,
      reference1MagVar: FacilityUtils.getMagVar(reference),
      reference1Distance: distance
    };
  }

  /**
   * Creates a user facility from a radial and distance relative to a reference facility.
   * @param icao The ICAO string of the new facility.
   * @param reference1 The first reference facility.
   * @param radial1 The magnetic radial, in degrees, of the first reference facility on which the new facility lies.
   * @param reference2 The second reference facility.
   * @param radial2 The magnetic radial, in degrees, of the second reference facility on which the new facility lies.
   * @param isTemporary Whether the new facility is temporary.
   * @param name The name of the new facility.
   * @returns A new user facility, or `undefined` if the specified radials do not intersect at a unique point.
   */
  public static createFromRadialRadial(
    icao: string,
    reference1: Facility,
    radial1: number,
    reference2: Facility,
    radial2: number,
    isTemporary = false,
    name?: string
  ): UserFacility | undefined {
    const location = FacilityUtils.getLatLonFromRadialRadial(reference1, radial1, reference2, radial2, UserFacilityUtils.geoPointCache[0]);

    if (isNaN(location.lat) || isNaN(location.lon)) {
      return undefined;
    }

    return {
      icao,
      name: name ?? '',
      lat: location.lat,
      lon: location.lon,
      userFacilityType: UserFacilityType.RADIAL_RADIAL,
      isTemporary,
      region: '',
      city: '',
      magvar: MagVar.get(location),
      reference1Icao: reference1.icao,
      reference1Radial: radial1,
      reference1MagVar: FacilityUtils.getMagVar(reference1),
      reference2Icao: reference2.icao,
      reference2Radial: radial2,
      reference2MagVar: FacilityUtils.getMagVar(reference2)
    };
  }
}

/**
 * Utilities to deal with TACAN facilities.
 */
export class TacanUtils {

  /**
   * Converts a VOR frequency to a TACAN channel.
   * @param frequency The frequency of the VOR.
   * @returns The TACAN channel.
   */
  public static frequencyToChannel(frequency: number): string {
    const uFrequency = frequency * 10;
    let res = 0;

    if (uFrequency <= 1122) {
      //108.0 to 112.25
      res = (uFrequency - 1063) % 256; //Protect against overflow
    } else if (uFrequency <= 1179) {
      res = (uFrequency - 1053) % 256;
    } else if (uFrequency < 1333) {
      return '';
    } else if (uFrequency <= 1342) {
      res = (uFrequency - 1273) % 256;
    } else {
      res = (uFrequency - 1343) % 256;
    }

    const letter = (Math.round(frequency * 100) % 10) === 0 ? 'X' : 'Y';
    return res.toFixed(0) + letter;
  }
}

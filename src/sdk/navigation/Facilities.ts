import { IcaoValue } from './Icao';

/**
 * Types of facilities.
 */
export enum FacilityType {
  Airport = 'APT',
  Intersection = 'INT',
  VOR = 'VOR',
  NDB = 'NDB',
  USR = 'USR',
  RWY = 'RWY',
  VIS = 'VIS'
}

/**
 * A mapping from {@link FacilityType} to facility object types.
 */
export type FacilityTypeMap = {
  /** Airport facility. */
  [FacilityType.Airport]: AirportFacility;

  /** VOR facility. */
  [FacilityType.VOR]: VorFacility;

  /** NDB facility. */
  [FacilityType.NDB]: NdbFacility;

  /** Intersection facility. */
  [FacilityType.Intersection]: IntersectionFacility;

  /** User waypoint facility. */
  [FacilityType.USR]: UserFacility;

  /** Runway waypoint facility. */
  [FacilityType.RWY]: RunwayFacility;

  /** Visual approach waypoint facility. */
  [FacilityType.VIS]: VisualFacility;
};

/**
 * A mapping from {@link FacilityType} to ICAO type strings.
 */
export type FacilityTypeIcaoMap = {
  /** Airport facility. */
  [FacilityType.Airport]: 'A';

  /** VOR facility. */
  [FacilityType.VOR]: 'V';

  /** NDB facility. */
  [FacilityType.NDB]: 'N';

  /** Intersection facility. */
  [FacilityType.Intersection]: 'W';

  /** User waypoint facility. */
  [FacilityType.USR]: 'U';

  /** Runway waypoint facility. */
  [FacilityType.RWY]: 'R';

  /** Visual approach waypoint facility. */
  [FacilityType.VIS]: 'S';
};

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

  /**
   * The icao of the frequency.
   * @deprecated Use {@link FacilityFrequency.icaoStruct}.
   */
  readonly icao: string;

  /** The icao of the frequency. */
  readonly icaoStruct: IcaoValue;

  /** The frequency, in MHz. */
  readonly freqMHz: number;

  /** The frequency, in BCD16. */
  readonly freqBCD16: number;

  /** The type of the frequency. */
  readonly type: FacilityFrequencyType;
}

export enum LandingSystemCategory {
  None = 0,
  Cat1,
  Cat2,
  Cat3,
  Localizer,
  Igs,
  LdaNoGs,
  LdaWithGs,
  SdfNoGs,
  SdfWithGs,
}

/**
 * An ILS frequency on airport runway data.
 */
export interface FacilityILSFrequency {
  /**
   * The ICAO of the ILS frequency.
   * @deprecated Use {@link FacilityILSFrequency.icaoStruct}.
   */
  readonly icao: string;

  /** The ICAO of the ILS frequency. */
  readonly icaoStruct: IcaoValue;

  /** The name of the frequency. */
  readonly name: string;

  /** The frequency, in MHz. */
  readonly freqMHz: number;

  /** The frequency, in BCD16. */
  readonly freqBCD16: number;

  /** The type of the frequency. */
  readonly type: FacilityFrequencyType;

  /** Whether or not this ILS has a backcourse. */
  readonly hasBackcourse: boolean;

  /** Whether or not this ILS has a glideslope. */
  readonly hasGlideslope: boolean;

  /** The glideslope transmitter altitude, in metres. */
  readonly glideslopeAlt: number;

  /** The glideslope angle for this localizer. */
  readonly glideslopeAngle: number;

  /** The glideslope transmitter latitude, in degrees. */
  readonly glideslopeLat: number;

  /** The glideslope transmitter longitude, in degrees. */
  readonly glideslopeLon: number;

  /** The course, in degrees magnetic, for this localizer. */
  readonly localizerCourse: number;

  /** The localizer beam width in degrees. */
  readonly localizerWidth: number;

  /** The magvar at this localizer's position. */
  readonly magvar: number;

  /** The landing system category for this ILS. */
  readonly lsCategory: LandingSystemCategory;
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

  /**
   * The primary blastpad distance beyond the overrun and end of the runway, in metres.
   * This is **not** included in the {@link AirportRunway.length}.
   */
  readonly primaryBlastpadLength: number;

  /** The primary threshold elevation for the runway in meters. */
  readonly primaryElevation: number;

  /**
   * The primary overrun distance beyond the end of the runway, in metres.
   * This is **not** included in the {@link AirportRunway.length}.
   */
  readonly primaryOverrunLength: number;

  /**
   * The primary displaced threshold distance from the start of the runway in meters.
   * This **is** included in the {@link AirportRunway.length}.
   */
  readonly primaryThresholdLength: number;

  /**
   * The secondary blastpad distance beyond the overrun and end of the runway, in metres.
   * This is **not** included in the {@link AirportRunway.length}.
   */
  readonly secondaryBlastpadLength: number;

  /** The secondary threshold elevation for the runway in meters. */
  readonly secondaryElevation: number;

  /**
   * The secondary overrun distance beyond the end of the runway, in metres.
   * This is **not** included in the {@link AirportRunway.length}.
   */
  readonly secondaryOverrunLength: number;

  /**
   * The secondary displaced threshold distance from the start of the runway in meters.
   * This **is** included in the {@link AirportRunway.length}.
   */
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

  /** The ICAO value of the previous waypoint in the airway. */
  readonly prevIcaoStruct: IcaoValue;

  /**
   * The ICAO string (V1) of the previous waypoint in the airway.
   * @deprecated Please use `prevIcaoStruct` instead.
   */
  readonly prevIcao: string;

  /** The minimum altitude on the previous segment of the airway, in metres, or 0 if none. */
  readonly prevMinAlt: number;

  /** The ICAO value of the next waypoint in the airway.  */
  readonly nextIcaoStruct: IcaoValue;

  /**
   * The ICAO string (V1) of the next waypoint in the airway.
   * @deprecated Please use `nextIcaoStruct` instead.
   */
  readonly nextIcao: string;

  /** The minimum altitude on the next segment of the airway, in metres, or 0 if none. */
  readonly nextMinAlt: number;
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

  /**
   * The ICAO of the fix, if specified.
   * @deprecated Use {@link FlightPlanLeg.fixIcaoStruct}.
   */
  fixIcao: string;

  /** The ICAO of the fix, if specified. */
  fixIcaoStruct: IcaoValue;

  /** Whether or not the fix is a flyover fix. */
  flyOver: boolean;

  /** Whether or not the distance is minutes of time. */
  distanceMinutes: boolean;

  /** Whether or not the course is true or magnetic. */
  trueDegrees: boolean;

  /** The direction of the turn for the leg, if any. */
  turnDirection: LegTurnDirection;

  /**
   * A reference ICAO for legs that have relative information.
   * @deprecated Use {@link FlightPlanLeg.originIcaoStruct}.
   */
  originIcao: string;

  /** A reference ICAO for legs that have relative information. */
  originIcaoStruct: IcaoValue;

  /**
   * A center fix ICAO for legs that require it.
   * @deprecated Use {@link FlightPlanLeg.arcCenterFixIcaoStruct}.
   */
  arcCenterFixIcao: string;

  /** A center fix ICAO for legs that require it. */
  arcCenterFixIcaoStruct: IcaoValue;

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

  /** The type of {@link speedRestriction} for this leg. */
  speedRestrictionDesc: SpeedRestrictionType;

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

  /** Flags indicating the approach fix type. See {@link FixTypeFlags}. Use the BitFlags class to check. */
  fixTypeFlags: number;

  /** Vertical glide path angle for the leg in degrees + 360 (e.g -3° descent = 357), or 0 if invalid */
  verticalAngle: number;

  /** The required navigation performance for the leg in metres, or 0 if none specified. */
  rnp: number;
}

/** Additional Approach Types (additive to those defined in simplane). */
export enum AdditionalApproachType {
  APPROACH_TYPE_VISUAL = 99
}

/** Approach Types inclusive of default ApproachType and AdditionalApproachType. */
export type ExtendedApproachType = ApproachType | AdditionalApproachType;

/**
 * Names for approach types.
 */
export enum ApproachTypeName {
  Undefined = '',
  Gps = 'GPS',
  Vor = 'VOR',
  Ndb = 'NDB',
  Ils = 'ILS',
  Loc = 'LOC',
  Sdf = 'SDF',
  Lda = 'LDA',
  VorDme = 'VORDME',
  NdbDme = 'NDBDME',
  Rnav = 'RNAV',
  LocBackcourse = 'BLOC',
  GeneratedVisual = 'GENVIS',
}

/**
 * Information used to uniquely identify an approach procedure in an airport.
 */
export interface ApproachIdentifier {
  /** Coherent C++ object binding type. */
  __Type: 'JS_ApproachIdentifier';

  /** The type name of the approach. */
  type: string;

  /** The approach's associated runway. */
  runway: RunwayIdentifier;

  /** The suffix of the approach. */
  suffix: string;
}

/**
 * Flags indicating the approach fix type.
 * They can be combined to indicate multiple types on a single fix using BitFlags class.
 */
export enum FixTypeFlags {
  None = 0,
  /* Initial Approach Fix. */
  IAF = 1 << 0,
  /* Intermediate Fix. */
  IF = 1 << 1,
  /* Missed Approach Point. */
  MAP = 1 << 2,
  /* Final Approach Fix. */
  FAF = 1 << 3,
  /* Missed Approach Holding Point. This doesn't come from the sim. We populate it in `insertApproach` in the Fms. */
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
  LPV = 1 << 3,
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

  /** Whether the approach procedure requires RNP-AR authorization. */
  readonly rnpAr: boolean;

  /** Whether the missed approach procedure requires RNP-AR authorization. */
  readonly missedApproachRnpAr: boolean;
}

/** Common interface for procedures. */
export interface Procedure {
  /** The name of the departure. */
  readonly name: string;

  /** Whether the procedure requires RNP-AR authorization. */
  readonly rnpAr: boolean;

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
export type DepartureProcedure = Procedure;

/**
 * An arrival procedure (STAR).
 */
export type ArrivalProcedure = Procedure;

/**
 * A holding pattern definition.
 */
export interface FacilityHoldingPattern {
  /** The holding fix ICAO. */
  readonly icaoStruct: IcaoValue;

  /** Course for the inbound leg of the holding pattern, in degrees. Can be magnetic or true. */
  readonly inboundCourse: number;

  /** The holding leg length, in metres, or 0 if the hold is time-based. */
  readonly legLength: number;

  /** The holding leg length, in minutes, or 0 if the hold is distance-based. */
  readonly legTime: number;

  /** Maximum altitude in the hold, in metres, or 0 if none. */
  readonly maxAltitude: number;

  /** Minimum altitude in the hold, in metres, or 0 if none. */
  readonly minAltitude: number;

  /** Friendly name of the holding pattern. */
  readonly name: string;

  /** The required arc radius in the hold, in metres, or 0 if none. */
  readonly radius: number;

  /** The required navigation performance in the hold, in metres, or 0 if none. */
  readonly rnp: number;

  /** Maximum speed in the hold, in knots, or 0 if none. */
  readonly speed: number;

  /** Whether the hold is right-turn (true), or left-turn (false). */
  readonly turnRight: boolean;
}

/**
 * A navdata facility from the simulator.
 */
export interface Facility {
  /**
   * The FS ICAO for this facility.
   * @deprecated Use {@link Facility.icaoStruct}.
   */
  readonly icao: string;

  /** The FS ICAO for this facility. */
  readonly icaoStruct: IcaoValue;

  /** The name of the facility. Can be a localized string (prefix with `TT:`) that needs passed to Utils.Translate. */
  readonly name: string;

  /** The latitude of the facility. */
  readonly lat: number;

  /** The longitude of the facility. */
  readonly lon: number;

  /** The region code in which this facility appears. */
  readonly region: string;

  /**
   * The city region boundary within which this facility appears, and optionally also the state, separated by `, `.
   * Both city and state can be localized strings (prefixed with `TT:`), and will need split before passing to Utils.Translate individually.
   */
  readonly city: string;
}

/**
 * An airport facility from the simulator.
 */
export interface AirportFacility extends Facility {

  /** Bitflags describing the types of data loaded into this facility object. */
  readonly loadedDataFlags: number;

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

  /** Terminal area holding patterns at the airport. */
  readonly holdingPatterns: FacilityHoldingPattern[];

  /** The airport magnetic variation in, degrees [-180, 180), negative being west. */
  readonly magvar: number;

  /** The transition altitude in metres, or 0 if not specified. */
  readonly transitionAlt: number;

  /** The transition level in metres, or 0 if not specified. */
  readonly transitionLevel: number;

  /** The 3-letter IATA code for the airport, or empty string if not defined. */
  readonly iata: string;

  /** The airport altitude in metres. */
  readonly altitude: number;
}

/**
 * Bitflags describing types of data that can be loaded into an {@link AirportFacility} object.
 */
export enum AirportFacilityDataFlags {
  Minimal = 0,
  Approaches = 1 << 0,
  Departures = 1 << 1,
  Arrivals = 1 << 2,
  Frequencies = 1 << 3,
  Gates = 1 << 4,
  HoldingPatterns = 1 << 5,
  Runways = 1 << 6,
  All = (1 << 7) - 1,
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

  /**
   * The FS ICAO of the nearest VOR to this intersection.
   * @deprecated Use {@link IntersectionFacility.nearestVorICAOStruct}.
   */
  readonly nearestVorICAO: string;

  /** The FS ICAO of the nearest VOR to this intersection. */
  readonly nearestVorICAOStruct: IcaoValue;

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
 * DME information with a VorFacility.
 */
export interface FacilityDme {
  /** The altitude of the DME transmitter. */
  readonly alt: number;

  /** Whether the DME station is colocated with the glideslope. */
  readonly atGlideslope: boolean;

  /** Whether the DME station is colocated with the nav transmitter (VOR or LOC). */
  readonly atNav: boolean;

  /** The latitude of the DME transmitter. */
  readonly lat: number;

  /** The longitude of the DME transmitter. */
  readonly lon: number;
}

export enum TacanMode {
  None = 0,
  X = 88, // ASCII 'X'
  Y = 89, // ASCII 'Y'
}

/**
 * DME information with a VorFacility.
 */
export interface FacilityTacan {
  /** The altitude of the DME transmitter. */
  readonly alt: number;

  /** TACAN channel number. */
  readonly channel: number;

  /** The latitude of the DME transmitter. */
  readonly lat: number;

  /** The longitude of the DME transmitter. */
  readonly lon: number;

  /** The TACAN mode. */
  readonly mode: TacanMode;
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

  /** The VOR station magnetic variation in, degrees [-180, 180), negative being west. */
  readonly magvar: number;

  /** The range on this VOR station in metres. */
  readonly navRange: number;

  /** The type of the VOR. */
  readonly type: VorType;

  /** The class of the VOR. */
  readonly vorClass: VorClass;

  /** DME station information, or null if no DME. */
  readonly dme: FacilityDme | null;

  /** ILS localizer/glideslope station information, or null if not an ILS. */
  readonly ils: FacilityILSFrequency | null;

  /** TACAN station information, or null if not a TACAN. */
  readonly tacan: FacilityTacan | null;

  /** Whether the facility is referenced to true north (implies {@link magvar} is zero also). */
  readonly trueReferenced: boolean;
}

/**
 * A NDB facility.
 */
export interface NdbFacility extends Facility {
  /** The frequency of the facility, in kilohertz. (Despite the name of the property, the value is not given in megahertz.) */
  readonly freqMHz: number;

  /** The NDB magnetic variation in, degrees [-180, 180), negative being west. */
  readonly magvar: number;

  /** The NDB useful range in metres. */
  readonly range: number;

  /** The type of NDB. */
  readonly type: NdbType;

  /** Whether a beat frequency oscillator is required to receive an audible ident signal. */
  readonly bfoRequired: boolean;
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
  reference1IcaoStruct?: IcaoValue;

  /**
   * The ICAO of the first reference facility.
   * @deprecated Please use `reference1IcaoStruct` instead.
   */
  reference1Icao?: string;

  /** The magnetic radial, in degrees, from the first reference facility. */
  reference1Radial?: number;

  /** The magnetic variation, in degrees, at the first reference facility. */
  reference1MagVar?: number;

  /** The disance from the first reference facility, in nautical miles. */
  reference1Distance?: number;

  /** The ICAO of the second reference facility. */
  reference2IcaoStruct?: IcaoValue;

  /**
   * The ICAO of the second reference facility.
   * @deprecated Please use `reference2IcaoStruct` instead.
   */
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

/**
 * Types of speed restrictions on procedure legs.
 * Note: {@link SpeedRestrictionType.Between} is not used in the nav database.
 */
export enum SpeedRestrictionType {
  Unused,
  At,
  AtOrAbove,
  AtOrBelow,
  Between,
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

/**
 * Information used to uniquely identify a runway in an airport.
 */
export interface RunwayIdentifier {
  /** Coherent C++ object binding type. */
  __Type: 'JS_RunwayIdentifier';

  /** The number of the runway. */
  number: string;

  /** The designator of the runway. */
  designator: string;
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

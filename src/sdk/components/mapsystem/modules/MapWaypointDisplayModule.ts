import { NumberUnitSubject, UnitType } from '../../../math';
import {
  AirportFacility, Facility, FacilityWaypoint, IntersectionFacility, NdbFacility, NearestAirportSearchSession, NearestIntersectionSearchSession,
  NearestVorSearchSession, VorFacility, Waypoint
} from '../../../navigation';
import { SubEvent } from '../../../sub';
import { Subject } from '../../../sub/Subject';

/**
 * A handler to determine waypoint visibility.
 */
type WaypointVisibilityHandler<T extends Facility> = (w: FacilityWaypoint<T>) => boolean;

/**
 * Filters for the nearest intersections.
 */
interface IntersectionFilters {
  /** A bitmask of allowable intersection types. */
  typeMask: number,

  /** Whether or not to show terminal waypoints. */
  showTerminalWaypoints: boolean
}

/**
 * Filters for the nearest VORs.
 */
interface VorFilters {
  /** A bitmask of allowable VOR types. */
  typeMask: number,

  /** A bitmask of allowable VOR classes. */
  classMask: number
}

/**
 * Filters for the nearest airports.
 */
interface AirportFilters {
  /** A bitmask of allowable airport classes. */
  classMask: number,

  /** Whether or not to show closed airports. */
  showClosed: boolean
}

/**
 * Extended filters for the nearest airports.
 */
interface ExtendedAirportFilters {
  /** A bitmask of allowable runway surface types. */
  runwaySurfaceTypeMask: number,

  /** A bitmask of allowable approach types. */
  approachTypeMask: number,

  /** A bitmask of whether or not to show towered or untowered airports. A bitmask of untowered (1) or towered (2) bits. */
  toweredMask: number,

  /** The minimum runway length to allow, in meters. */
  minimumRunwayLength: number
}

/**
 * A map data module that controls waypoint display options.
 */
export class MapWaypointDisplayModule {

  /** A handler that dictates airport waypoint visibility. */
  public readonly showAirports = Subject.create<WaypointVisibilityHandler<AirportFacility>>(() => true);

  /** A handler that dictates intersection waypoint visibility. */
  public readonly showIntersections = Subject.create<WaypointVisibilityHandler<IntersectionFacility>>(() => false);

  /** A handler that dictates NDB waypoint visibility. */
  public readonly showNdbs = Subject.create<WaypointVisibilityHandler<NdbFacility>>(() => true);

  /** A handler that dictates VOR waypoint visibility. */
  public readonly showVors = Subject.create<WaypointVisibilityHandler<VorFacility>>(() => true);

  /** The maximum range at which airport waypoints should be searched for. */
  public readonly airportsRange = NumberUnitSubject.createFromNumberUnit(UnitType.NMILE.createNumber(50));

  /** The maximum range at which intersection waypoints should be searched for. */
  public readonly intersectionsRange = NumberUnitSubject.createFromNumberUnit(UnitType.NMILE.createNumber(50));

  /** The maximum range at which NDB waypoints should be searched for. */
  public readonly ndbsRange = NumberUnitSubject.createFromNumberUnit(UnitType.NMILE.createNumber(500));

  /** The maximum range at which VOR waypoints should be searched for. */
  public readonly vorsRange = NumberUnitSubject.createFromNumberUnit(UnitType.NMILE.createNumber(500));

  /** The maximum number of airports that should be displayed. */
  public readonly numAirports = Subject.create(40);

  /** The maximum number of intersections that should be displayed. */
  public readonly numIntersections = Subject.create(40);

  /** The maximum number of NDBs that should be displayed. */
  public readonly numNdbs = Subject.create(40);

  /** The maximum number of VORs that should be displayed. */
  public readonly numVors = Subject.create(40);

  /** The filter to apply to the intersection search. */
  public readonly intersectionsFilter = Subject.create<IntersectionFilters>({
    typeMask: NearestIntersectionSearchSession.Defaults.TypeMask,
    showTerminalWaypoints: true
  });

  /** The filter to apply to the VOR search. */
  public readonly vorsFilter = Subject.create<VorFilters>({
    typeMask: NearestVorSearchSession.Defaults.TypeMask,
    classMask: NearestVorSearchSession.Defaults.ClassMask
  });

  /** The filter to apply to the airport search. */
  public readonly airportsFilter = Subject.create<AirportFilters>({
    classMask: NearestAirportSearchSession.Defaults.ClassMask,
    showClosed: NearestAirportSearchSession.Defaults.ShowClosed
  });

  /** The extended airport filter to apply to the airport search. */
  public readonly extendedAirportsFilter = Subject.create<ExtendedAirportFilters>({
    runwaySurfaceTypeMask: NearestAirportSearchSession.Defaults.SurfaceTypeMask,
    approachTypeMask: NearestAirportSearchSession.Defaults.ApproachTypeMask,
    minimumRunwayLength: NearestAirportSearchSession.Defaults.MinimumRunwayLength,
    toweredMask: NearestAirportSearchSession.Defaults.ToweredMask
  });

  /** A function that will be called with a waypoint when it is registered,
   * and should return the role to use for that waypoint. */
  public readonly waypointRoleSelector = Subject.create<((waypoint: Waypoint) => string) | undefined>(undefined);

  /** Forces a refresh of all the waypoints. Useful if a waypoint needs a different role to be selected. */
  public readonly refreshWaypoints = new SubEvent<void, void>();
}
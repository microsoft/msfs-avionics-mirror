import { BasicNavAngleSubject, BasicNavAngleUnit, GeoPointInterface, Subject, Subscribable, Waypoint } from '@microsoft/msfs-sdk';
import { WaypointInfoStore } from '@microsoft/msfs-garminsdk';
import { HoldInfo } from '../HoldPage/HoldStore';

/**
 * Data on a direct to existing target leg.
 */
export type DirectToExistingData = {
  /** The index of the segment in which the target leg resides. */
  segmentIndex: number;

  /** The index of the target leg in its segment. */
  segmentLegIndex: number;

  /** The ICAO of the target leg fix. */
  icao: string;
}

/**
 * A store for the GTC direct-to page. The store holds information required to define and create a direct-to.
 */
export class DirectToStore {
  /** The value of this store's automatically calculated course from the airplane's present position to the direct-to target fix. */
  public readonly autoCourseValue = BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(NaN));

  /** This store's user-defined direct-to course, in degrees magnetic, or `undefined` if there is no user-defined course. */
  public readonly userCourseMagnetic = Subject.create<number | undefined>(undefined);

  /** Information on the hold to insert after the direct-to, or `undefined` if there is no such hold. */
  public readonly holdInfo = Subject.create<HoldInfo | undefined>(undefined);

  /** Information on this store's selected on-route direct-to target, or `null` if there is no such target. */
  public readonly directToExistingData = Subject.create<DirectToExistingData | null>(null);

  /**
   * A subject which provides this store's selected waypoint.
   * @returns The waypoint subject from the waypoint info store.
   */
  public get waypoint(): Subject<Waypoint | null> {
    return this.waypointInfoStore.waypoint;
  }

  /**
   * Constructor.
   * @param planePos A subscribable which provides the current airplane position for this store.
   * @param waypointInfoStore A waypoint info store.
   */
  constructor(
    public readonly planePos: Subscribable<GeoPointInterface>,
    public readonly waypointInfoStore: WaypointInfoStore,
  ) { }
}
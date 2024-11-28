import { GeoPointInterface, MappedSubject, MappedSubscribable, Subscribable, SubscribableUtils, Waypoint } from '@microsoft/msfs-sdk';

import { WaypointInfoStore } from '@microsoft/msfs-garminsdk';

import { NearestWaypointEntry } from './NearestWaypointEntry';


/**
 * A basic implementation of {@link NearestWaypointEntry}.
 */
export class BasicNearestWaypointEntry<W extends Waypoint> implements NearestWaypointEntry<W> {
  /** @inheritDoc */
  public readonly store: WaypointInfoStore;

  private readonly _relativeBearing: MappedSubscribable<number>;
  /** @inheritDoc */
  public readonly relativeBearing: Subscribable<number>;

  /**
   * Constructor.
   * @param waypoint This data item's waypoint.
   * @param ppos The current airplane position.
   * @param planeHeading The current true heading of the airplane, in degrees.
   */
  public constructor(public readonly waypoint: W, ppos: Subscribable<GeoPointInterface>, planeHeading: Subscribable<number>) {
    this.store = new WaypointInfoStore(waypoint, ppos);
    this._relativeBearing = MappedSubject.create(
      ([bearing, heading]) => bearing.number - heading,
      SubscribableUtils.NUMERIC_NAN_EQUALITY,
      this.store.bearing,
      planeHeading
    );
    this.relativeBearing = this._relativeBearing;
  }

  /** @inheritDoc */
  public destroy(): void {
    this.store.destroy();
    this._relativeBearing.destroy();
  }
}
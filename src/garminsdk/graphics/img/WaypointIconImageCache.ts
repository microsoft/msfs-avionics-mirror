import { Waypoint } from 'msfssdk';

/**
 * A cache of images for waypoint icons.
 */
export interface WaypointIconImageCache {
  /**
   * Retrieves an image for a waypoint.
   * @param waypoint The waypoint for which to retrieve the image.
   * @returns The image for the specified waypoint, or `undefined` if one could not be found.
   */
  getForWaypoint(waypoint: Waypoint): HTMLImageElement | undefined;
}
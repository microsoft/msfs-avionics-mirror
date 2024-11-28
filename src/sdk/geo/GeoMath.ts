/**
 * A utility class for working with geographic math using a spherical datum.
 */
export class GeoMath {
  /**
   * The standard angular tolerance, defined as the maximum allowed angular distance (also equal to the great-circle
   * distance) between two equal points, in radians.
   */
  public static readonly ANGULAR_TOLERANCE = 1e-7; // ~61cm
}

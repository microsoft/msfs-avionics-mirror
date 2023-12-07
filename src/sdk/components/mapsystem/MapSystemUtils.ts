import { ReadonlyFloat64Array, Vec2Math } from '../../math';

/**
 * Utility methods related to MapSystem.
 */
export class MapSystemUtils {
  /**
   * Converts a nominal relative projected x coordinate to a true relative projected x coordinate. Nominal relative
   * coordinates are expressed relative to the map's projected width and height, *excluding* dead zones. True relative
   * coordinates are expressed relative to the map's projected width and height, *including* dead zones.
   * @param nominalRelX A nominal relative projected x coordinate.
   * @param width The width of the map's projected window, in pixels.
   * @param deadZone The map's dead zone, as `[left, top, right, bottom]` in pixels.
   * @returns The true relative projected x coordinate that is equivalent to the specified nominal coordinate.
   */
  public static nominalToTrueRelativeX(nominalRelX: number, width: number, deadZone: ReadonlyFloat64Array): number {
    return (nominalRelX * (width - deadZone[0] - deadZone[2]) + deadZone[0]) / width;
  }

  /**
   * Converts a nominal relative projected y coordinate to a true relative projected y coordinate. Nominal relative
   * coordinates are expressed relative to the map's projected width and height, *excluding* dead zones. True relative
   * coordinates are expressed relative to the map's projected width and height, *including* dead zones.
   * @param nominalRelY A nominal relative projected y coordinate.
   * @param height The height of the map's projected window, in pixels.
   * @param deadZone The map's dead zone, as `[left, top, right, bottom]` in pixels.
   * @returns The true relative projected y coordinate that is equivalent to the specified nominal coordinate.
   */
  public static nominalToTrueRelativeY(nominalRelY: number, height: number, deadZone: ReadonlyFloat64Array): number {
    return (nominalRelY * (height - deadZone[1] - deadZone[3]) + deadZone[1]) / height;
  }

  /**
   * Converts nominal relative projected coordinates to true relative projected coordinates. Nominal relative
   * coordinates are expressed relative to the map's projected width and height, *excluding* dead zones. True relative
   * coordinates are expressed relative to the map's projected width and height, *including* dead zones.
   * @param nominal Nominal relative projected coordinates.
   * @param size The size of the map's projected window, as `[width, height]` in pixels.
   * @param deadZone The map's dead zone, as `[left, top, right, bottom]` in pixels.
   * @param out The vector to which to write the result.
   * @returns The true relative projected coordinates that are equivalent to the specified nominal coordinates.
   */
  public static nominalToTrueRelativeXY(
    nominal: ReadonlyFloat64Array,
    size: ReadonlyFloat64Array,
    deadZone: ReadonlyFloat64Array,
    out: Float64Array
  ): Float64Array {
    return Vec2Math.set(
      MapSystemUtils.nominalToTrueRelativeX(nominal[0], size[0], deadZone),
      MapSystemUtils.nominalToTrueRelativeY(nominal[1], size[1], deadZone),
      out
    );
  }

  /**
   * Converts a true relative projected x coordinate to a nominal relative projected x coordinate. Nominal relative
   * coordinates are expressed relative to the map's projected width and height, *excluding* dead zones. True relative
   * coordinates are expressed relative to the map's projected width and height, *including* dead zones.
   * @param trueRelX A true relative projected x coordinate.
   * @param width The width of the map's projected window, in pixels.
   * @param deadZone The map's dead zone, as `[left, top, right, bottom]` in pixels.
   * @returns The nominal relative projected x coordinate that is equivalent to the specified true coordinate.
   */
  public static trueToNominalRelativeX(trueRelX: number, width: number, deadZone: ReadonlyFloat64Array): number {
    return (trueRelX * width - deadZone[0]) / (width - deadZone[0] - deadZone[2]);
  }

  /**
   * Converts a true relative projected y coordinate to a nominal relative projected y coordinate. Nominal relative
   * coordinates are expressed relative to the map's projected width and height, *excluding* dead zones. True relative
   * coordinates are expressed relative to the map's projected width and height, *including* dead zones.
   * @param trueRelY A true relative projected y coordinate.
   * @param height The height of the map's projected window, in pixels.
   * @param deadZone The map's dead zone, as `[left, top, right, bottom]` in pixels.
   * @returns The nominal relative projected y coordinate that is equivalent to the specified true coordinate.
   */
  public static trueToNominalRelativeY(trueRelY: number, height: number, deadZone: ReadonlyFloat64Array): number {
    return (trueRelY * height - deadZone[1]) / (height - deadZone[1] - deadZone[3]);
  }

  /**
   * Converts true relative projected coordinates to nominal relative projected coordinates. Nominal relative
   * coordinates are expressed relative to the map's projected width and height, *excluding* dead zones. True relative
   * coordinates are expressed relative to the map's projected width and height, *including* dead zones.
   * @param nominal True relative projected coordinates.
   * @param size The size of the map's projected window, as `[width, height]` in pixels.
   * @param deadZone The map's dead zone, as `[left, top, right, bottom]` in pixels.
   * @param out The vector to which to write the result.
   * @returns The nominal relative projected coordinates that are equivalent to the specified true coordinates.
   */
  public static trueToNominalRelativeXY(
    nominal: ReadonlyFloat64Array,
    size: ReadonlyFloat64Array,
    deadZone: ReadonlyFloat64Array,
    out: Float64Array
  ): Float64Array {
    return Vec2Math.set(
      MapSystemUtils.trueToNominalRelativeX(nominal[0], size[0], deadZone),
      MapSystemUtils.trueToNominalRelativeY(nominal[1], size[1], deadZone),
      out
    );
  }
}
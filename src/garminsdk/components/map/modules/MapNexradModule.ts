import { BingComponent, Subject } from '@microsoft/msfs-sdk';

/**
 * A module for map weather radar mode data.
 */
export class MapNexradModule {
  /** Whether to show the NEXRAD overlay. */
  public readonly showNexrad = Subject.create<boolean>(false);

  /**
   * The color array for the NEXRAD overlay. Each entry `E_i` of the array is a tuple `[color, rate]` that defines a
   * color stop, where `color` is an RGBA color expressed as `R + G * 256 + B * 256^2 + A * 256^3` and `rate` is a
   * precipitation rate in millimeters per hour.
   *
   * In general, the color defined by `E_i` is applied to precipitation rates ranging from the rate defined by `E_i-1`
   * to the rate defined by `E_i`. There are two special cases. The color defined by `E_0` is applied to the
   * precipitation rates from zero to the rate defined by `E_0`. The color defined by `E_n-1`, where `n` is the length
   * of the array, is applied to the precipitation rates from the rate defined by `E_n-2` to positive infinity.
   */
  public readonly colors = Subject.create<readonly (readonly [number, number])[]>(Array.from(BingComponent.DEFAULT_WEATHER_COLORS));
}
import { BingComponent } from '@microsoft/msfs-sdk';

/**
 * Provides utility functions for working with Garmin weather radars.
 */
export class WeatherRadarUtils {
  private static readonly DBZ_TO_RATE_TABLE = [
    [20, 0.25],
    [25, 1.27],
    [30, 2.54],
    [35, 5.59],
    [40, 11.43],
    [45, 23.37],
    [50, 48.26],
    [55, 101.6],
    [60, 203.2],
    [65, 406.4]
  ];

  private static readonly STANDARD_COLORS: readonly (readonly [number, number])[] = [
    [BingComponent.hexaToRGBAColor('#00000000'), 23],
    [BingComponent.hexaToRGBAColor('#00ff00ff'), 33],
    [BingComponent.hexaToRGBAColor('#ffff00ff'), 41],
    [BingComponent.hexaToRGBAColor('#ff0000ff'), 41]
  ];

  private static readonly EXTENDED_COLORS: readonly (readonly [number, number])[] = [
    [BingComponent.hexaToRGBAColor('#00000000'), 23],
    [BingComponent.hexaToRGBAColor('#00ff00ff'), 25],
    [BingComponent.hexaToRGBAColor('#0cde00ff'), 27],
    [BingComponent.hexaToRGBAColor('#18bd00ff'), 29],
    [BingComponent.hexaToRGBAColor('#249b00ff'), 31],
    [BingComponent.hexaToRGBAColor('#307a00ff'), 33],
    [BingComponent.hexaToRGBAColor('#ffff00ff'), 35],
    [BingComponent.hexaToRGBAColor('#f6db00ff'), 37],
    [BingComponent.hexaToRGBAColor('#eeb600ff'), 39],
    [BingComponent.hexaToRGBAColor('#e59200ff'), 41],
    [BingComponent.hexaToRGBAColor('#ff0000ff'), 43],
    [BingComponent.hexaToRGBAColor('#dc0000ff'), 45],
    [BingComponent.hexaToRGBAColor('#b90000ff'), 47],
    [BingComponent.hexaToRGBAColor('#960000ff'), 49],
    [BingComponent.hexaToRGBAColor('#dd50ffff'), 51],
    [BingComponent.hexaToRGBAColor('#b228c3ff'), 54],
    [BingComponent.hexaToRGBAColor('#870087ff'), 54]
  ];

  // eslint-disable-next-line jsdoc/require-throws
  /**
   * Converts a radar return signal strength in dBZ to an approximate precipitation rate in millimeters per hour.
   * @param dbz A radar return signal strength in dBZ.
   * @returns The precipitation rate, in millimeters per hour, that is approximately correlated with the specified
   * radar return signal strength.
   */
  public static dbzToPrecipRate(dbz: number): number {
    const table = WeatherRadarUtils.DBZ_TO_RATE_TABLE;
    const first = table[0];
    const last = table[table.length - 1];

    if (dbz < first[0]) {
      return Math.pow(10, (dbz - first[0]) / 10) * first[1];
    } else if (dbz > last[0]) {
      return Math.pow(2, (dbz - last[0]) / 5) * last[1];
    }

    for (let i = 1; i < table.length; i++) {
      const breakpoint = table[i];

      if (dbz < breakpoint[0]) {
        const prevBreakpoint = table[i - 1];
        return Math.pow(breakpoint[1] / prevBreakpoint[1], (dbz - prevBreakpoint[0]) / (breakpoint[0] - prevBreakpoint[0])) * prevBreakpoint[1];
      } else if (dbz === breakpoint[0]) {
        return breakpoint[1];
      }
    }

    // Should never happen.
    throw new Error('WeatherRadarUtils.dbzToPrecipRate(): reached an un-reachable state');
  }

  /**
   * Gets the calibrated (zero-gain) standard Garmin three-color weather radar color array.
   * @returns The calibrated (zero-gain) standard Garmin three-color weather radar color array.
   */
  public static standardColors(): readonly (readonly [number, number])[] {
    return WeatherRadarUtils.STANDARD_COLORS;
  }

  /**
   * Gets the calibrated (zero-gain) extended Garmin 16-color weather radar color array.
   * @returns The calibrated (zero-gain) extended Garmin 16-color weather radar color array.
   */
  public static extendedColors(): readonly (readonly [number, number])[] {
    return WeatherRadarUtils.EXTENDED_COLORS;
  }
}
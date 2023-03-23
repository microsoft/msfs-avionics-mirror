import { ComSpacing } from '../../instruments/RadioCommon';

/**
 * A utility class for creating radio frequency formatters.
 */
export class RadioFrequencyFormatter {
  /**
   * Creates a function which formats NAV radio frequencies in hertz. The formatted string created by the function
   * displays the frequency in megahertz to two decimal places.
   * @param nanString The string to output for an input of `NaN`. Defaults to `'NaN'`.
   * @returns A function which formats NAV radio frequencies in hertz.
   */
  public static createNav(nanString = 'NaN'): (freqHz: number) => string {
    return (freqHz: number): string => {
      return isNaN(freqHz) ? nanString : (freqHz / 1e6).toFixed(2);
    };
  }

  /**
   * Creates a function which formats COM radio frequencies in hertz. The formatted string created by the function
   * displays the frequency in megahertz to either two decimal places (with the third decimal place truncated) for
   * 25 kHz spacing, or three decimal places for 8.33 kHz spacing.
   * @param spacing The COM channel spacing mode to use.
   * @param nanString The string to output for an input of `NaN`. Defaults to `'NaN'`.
   * @returns A function which formats COM radio frequencies in hertz.
   */
  public static createCom(spacing: ComSpacing, nanString = 'NaN'): (freqHz: number) => string {
    if (spacing === ComSpacing.Spacing833Khz) {
      return (freqHz: number): string => {
        return isNaN(freqHz) ? nanString : (freqHz / 1e6).toFixed(3);
      };
    } else {
      return (freqHz: number): string => {
        return isNaN(freqHz) ? nanString : (freqHz / 1e6).toFixed(3).slice(0, -1);
      };
    }
  }

  /**
   * Creates a function which formats ADF radio frequencies in hertz. The formatted string created by the function
   * displays the frequency in kilohertz to one decimal place.
   * @param nanString The string to output for an input of `NaN`. Defaults to `'NaN'`.
   * @returns A function which formats ADF radio frequencies in hertz.
   */
  public static createAdf(nanString = 'NaN'): (freqHz: number) => string {
    return (freqHz: number): string => {
      return isNaN(freqHz) ? nanString : (freqHz / 1e3).toFixed(1);
    };
  }
}
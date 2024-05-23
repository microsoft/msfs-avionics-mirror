/** A collection of helper functions dealing with radios and frequencies. */
export class RadioUtils {
  /**
   * Checks whether a frequency is a NAV frequency.
   * @param freq The frequency to check, in megahertz.
   * @returns Whether the specified frequency is a NAV frequency.
   */
  public static isNavFrequency(freq: number): boolean {
    const freqKhz = Math.round(freq * 1000);

    if (freqKhz < 108e3 || freqKhz > 117950) {
      return false;
    }

    return freqKhz % 50 === 0;
  }

  /**
   * Checks if frequency is a localizer frequency based on the number.
   * @param freq The frequency to check, in megahertz.
   * @returns True if frequency is between 108.1 and 111.95 MHz (inclusive) and the tenths place is odd.
   */
  public static isLocalizerFrequency(freq: number): boolean {
    // Round the frequency to the nearest 10 khz to avoid floating point precision issues.
    const roundedFreq = Math.round(freq * 100);
    return roundedFreq >= 10810 && roundedFreq <= 11195 && (roundedFreq % 20 >= 10);
  }

  private static readonly COM_833_ENDINGS = [5, 10, 15, 30, 35, 40];

  /**
   * Checks whether a frequency is a 8.33 kHz-spacing COM frequency.
   * @param freq The frequency to check, in megahertz.
   * @returns Whether the specified frequency is a 8.33 kHz-spacing COM frequency.
   */
  public static isCom833Frequency(freq: number): boolean {
    const freqKhz = Math.round(freq * 1000);

    if (freqKhz < 118e3 || freqKhz > 136990) {
      return false;
    }

    return RadioUtils.COM_833_ENDINGS.includes(freqKhz % 50);
  }

  /**
   * Checks whether a frequency is a 25 kHz-spacing COM frequency.
   * @param freq The frequency to check, in megahertz.
   * @returns Whether the specified frequency is a 25 kHz-spacing COM frequency.
   */
  public static isCom25Frequency(freq: number): boolean {
    const freqKhz = Math.round(freq * 1000);

    if (freqKhz < 118e3 || freqKhz > 136975) {
      return false;
    }

    return freqKhz % 25 === 0;
  }

  /**
   * Checks whether a frequency is an ADF frequency.
   * @param freq The frequency to check, in kilohertz.
   * @returns Whether the specified frequency is an ADF frequency.
   */
  public static isAdfFrequency(freq: number): boolean {
    const freqHz = Math.round(freq * 1000);

    if (freqHz < 190e3 || freqHz > 1799500) {
      return false;
    }

    return freqHz % 500 === 0;
  }
}
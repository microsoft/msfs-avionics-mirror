/** Collection of string utility functions. */
export class StringUtils {
  public static readonly DIRECT_TO = 'Ð';
  public static readonly DEGREE = '°';
  public static readonly EN_DASH = '–';

  private static readonly ZERO_REGEX = /0/g;

  private static readonly TRIM_START_REGEX = /^\s+/;
  private static readonly TRIM_END_REGEX = /\s+$/;

  /**
   * Replaces all `'0'` characters in a string with the slashed zero character.
   * @param text The string to convert.
   * @returns A string identical to the input string except with all `'0'` characters converted to the slashed zero
   * character.
   */
  public static useZeroSlash(text: string): string {
    return text?.replace(StringUtils.ZERO_REGEX, '0̸');
  }

  /**
   * Removes leading whitespace and line terminator characters from a string.
   * @param str The string to trim.
   * @returns A new string representing `str` with all leading whitespace and line terminator characters removed.
   */
  public static trimStart(str: string): string {
    return str.replace(StringUtils.TRIM_START_REGEX, '');
  }

  /**
   * Removes trailing whitespace and line terminator characters from a string.
   * @param str The string to trim.
   * @returns A new string representing `str` with all trailing whitespace and line terminator characters removed.
   */
  public static trimEnd(str: string): string {
    return str.replace(StringUtils.TRIM_END_REGEX, '');
  }
}
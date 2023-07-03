/** Collection of string utility functions. */
export class StringUtils {
  public static readonly DIRECT_TO = 'Ð';
  public static readonly DEGREE = '°';
  public static readonly EN_DASH = '–';
  public static readonly ZERO_WIDTH_DECIMAL = '·';

  public static readonly RIGHT_POINTING_ISOSCELES_RIGHT_TRIANGLE = '🞂';
  public static readonly LEFT_POINTING_ISOSCELES_RIGHT_TRIANGLE = '🞀';
  public static readonly RIGHT_POINTING_TRIANGLE_CENTRED = '⯈';
  public static readonly LEFT_POINTING_TRIANGLE_CENTRED = '⯇';
  public static readonly UP_POINTING_TRIANGLE_CENTRED = '⯅';
  public static readonly DOWN_POINTING_TRIANGLE_CENTRED = '⯆';

  private static readonly ZERO_REGEX = /0/g;
  private static readonly DECIMAL_REGEX = /\./g;

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
   * Replaces all `'.'` characters in a string with the zero width decimal character.
   * @param text The string to convert.
   * @returns A string identical to the input string except with all `'.'` characters converted to the zero width decimal
   * character.
   */
  public static useZeroWidthDecimal(text: string): string {
    return text?.replace(StringUtils.DECIMAL_REGEX, StringUtils.ZERO_WIDTH_DECIMAL);
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
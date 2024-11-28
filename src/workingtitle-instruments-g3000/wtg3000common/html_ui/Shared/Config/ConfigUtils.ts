/**
 * A utility class for working with configuration objects.
 */
export class ConfigUtils {
  /**
   * Parses a boolean value from an optional string input.
   * @param input The input to parse.
   * @returns The boolean value parsed from the specified input, or `null` if the input was nullish, or `undefined` if
   * the input string could not be parsed into a boolean value.
   */
  public static parseBoolean(input: string | null | undefined): boolean | null | undefined;
  /**
   * Parses a boolean value from an optional string input.
   * @param input The input to parse.
   * @param defaultValue The default boolean value to return if the input is nullish.
   * @returns The boolean value parsed from the specified input, or `undefined` if the input string could not be parsed
   * into a boolean value.
   */
  public static parseBoolean(input: string | null | undefined, defaultValue: boolean): boolean | undefined;
  /**
   * Parses a boolean value from an optional string input.
   * @param input The input to parse.
   * @param defaultValue The default boolean value to return if the input is nullish. If not defined, then a default
   * value will not be used.
   * @returns The boolean value parsed from the specified input, or `null` if the input was nullish and no default
   * value was specified, or `undefined` if the input string could not be parsed into a boolean value.
   */
  public static parseBoolean(input: string | null | undefined, defaultValue?: boolean): boolean | null | undefined;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static parseBoolean(input: string | null | undefined, defaultValue?: boolean): boolean | null | undefined {
    switch (input?.toLowerCase()) {
      case 'true':
        return true;
      case 'false':
        return false;
      case null:
      case undefined:
        return defaultValue ?? null;
      default:
        return undefined;
    }
  }

  /**
   * Parses a number value from an optional string input.
   * @param input The input to parse.
   * @returns The number value parsed from the specified input, or `null` if the input was nullish, or `undefined` if
   * the input string could not be parsed into a number value.
   */
  public static parseNumber(input: string | null | undefined): number | null | undefined;
  /**
   * Parses a number value from an optional string input.
   * @param input The input to parse.
   * @param defaultValue The default number value to return if the input is nullish.
   * @returns The number value parsed from the specified input, or `undefined` if the input string could not be parsed
   * into a number value.
   */
  public static parseNumber(input: string | null | undefined, defaultValue: number): number | undefined;
  /**
   * Parses a number value from an optional string input.
   * @param input The input to parse.
   * @param defaultValue The default number value to return if the input is nullish. If not defined, then a default
   * value will not be used.
   * @returns The number value parsed from the specified input, or `null` if the input was nullish and no default value
   * was specified, or `undefined` if the input string could not be parsed into a number value.
   */
  public static parseNumber(input: string | null | undefined, defaultValue?: number): number | null | undefined;
  /**
   * Parses a validated number value from an optional string input.
   * @param input The input to parse.
   * @param validator A function that checks whether the number value parsed from the input is valid.
   * @returns The number value parsed from the specified input, or `null` if the input was nullish, or `undefined` if
   * the input string could not be parsed into a valid number value.
   */
  public static parseNumber<T extends number = number>(
    input: string | null | undefined,
    validator: (value: number) => boolean
  ): T | null | undefined;
  /**
   * Parses a validated number value from an optional string input.
   * @param input The input to parse.
   * @param validator A function that checks whether the number value parsed from the input is valid.
   * @param defaultValue The default number value to return if the input is nullish.
   * @returns The number value parsed from the specified input, or `undefined` if the input string could not be parsed
   * into a valid number value.
   */
  public static parseNumber<T extends number = number>(
    input: string | null | undefined,
    validator: (value: number) => boolean,
    defaultValue: T
  ): T | undefined;
  /**
   * Parses a validated number value from an optional string input.
   * @param input The input to parse.
   * @param validator A function that checks whether the number value parsed from the input is valid.
   * @param defaultValue The default number value to return if the input is nullish. If not defined, then a default
   * value will not be used.
   * @returns The number value parsed from the specified input, or `null` if the input was nullish and no default value
   * was specified, or `undefined` if the input string could not be parsed into a valid number value.
   */
  public static parseNumber<T extends number = number>(
    input: string | null | undefined,
    validator: (value: number) => boolean,
    defaultValue?: T
  ): T | null | undefined;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static parseNumber(
    input: string | null | undefined,
    arg2?: number | ((value: number) => boolean),
    arg3?: number
  ): number | null | undefined {
    let validator: ((value: number) => boolean) | undefined;
    let defaultValue: number | undefined;

    if (typeof arg2 === 'function') {
      validator = arg2;
      defaultValue = arg3;
    } else {
      defaultValue = arg2;
    }

    const inputWithDefault = input ?? defaultValue;

    if (inputWithDefault === undefined) {
      return null;
    } else {
      const parsed = Number(inputWithDefault);
      if (isNaN(parsed) || validator?.(parsed) === false) {
        return undefined;
      } else {
        return parsed;
      }
    }
  }
}

/**
 * Validates an input string into a value of a type
 */
export interface Validator<T> {

  parse(input: string): Promise<T | null> | (T | null)

}

/**
 * {@link Validator} for parsing raw string values
 */
export const RawValidator: Validator<string | null> = {
  /** @inheritDoc */
  parse(input: string | null): string {
    return input ?? '';
  }
};

/**
 * Formats a value of a type
 */
export interface Formatter<T> {
  /**
   * The string to show when a value is `null`
   */
  nullValueString: string,

  /**
   * Formats a value of a type into a string
   *
   * @param value the value to format
   */
  format(value: T): string,
}

/**
 * {@link Formatter} for displaying raw string values
 */
export const RawFormatter: Formatter<string | number | null> = {
  nullValueString: '',

  /** @inheritDoc */
  format(value: string | null): string {
    return value ?? '';
  }
};
import { FmcRenderTemplate } from './FmcRenderer';

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
  },
};

/**
 * Represents the possible output of a formatting function
 */
export type FmcFormatterOutput = string | FmcRenderTemplate;

/**
 * Formats a non-nullable value of a type `T` into a value of a type `U`, with the ability to specify a null value
 */
export interface Formatter<T, U = string> {
  /**
   * The string to show when a value is `null`
   */
  nullValueString?: U,

  /**
   * Formats a value of a type into a string
   *
   * @param value the value to format
   */
  format: (value: NonNullable<T>) => U,
}

/**
 * A formatter for use in the FMC Framework
 */
export type FmcFormatter<T> = Formatter<T, FmcFormatterOutput>

/**
 * Formats a value of a type
 */
export type FmcComponentFormatter<T> = FmcFormatter<T> | ((type: T) => FmcFormatterOutput)

/**
 * {@link Formatter} for displaying raw string values
 */
export const RawFormatter: Formatter<string | number | null> = {
  nullValueString: '',

  /** @inheritDoc */
  format(value): string {
    if (typeof value === 'number') {
      return value.toString();
    }

    return value ?? '';
  },
};

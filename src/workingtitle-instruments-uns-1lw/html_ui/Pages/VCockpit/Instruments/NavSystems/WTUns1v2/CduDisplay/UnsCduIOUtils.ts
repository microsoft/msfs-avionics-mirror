import { DateTimeFormatter, FmcFormatter, SimpleUnit, UnitFamily, UnitType, Validator } from '@microsoft/msfs-sdk';

import { WritableUnsFieldState } from './Components/UnsTextInputField';

/** Nullable wrapper type. */
type Nullable<T> = T | null

/** A function type which parses a string into a number or null. */
export type ParserFunction<T = number> = Validator<T>['parse'];

/** An input formatter function. */
type InputFormatterFunction = (fieldState: WritableUnsFieldState<number | null>) => string;

/** A readonly formatter function. */
type ReadonlyFormatterFunction<T = number | null> = (value: T) => string;

/** A formatter function, input or readonly. */
type FormatterFunction = InputFormatterFunction | ReadonlyFormatterFunction;

/** The type of field. */
type FieldType = 'input' | 'readonly';

/** Contains UNS FMC parse functions and parse function factories. */
export abstract class UnsCduParsers {
  /**
   * A digit-only parser function factory.
   * @param maxDigits The maximum number of digits to accept.
   * @param minDigits The minimum number of digits to accept, defaults to 1.
   * @throws If `minDigits` is greater than `maxDigits`, or either value is less than 1.
   * @returns A digit-only parser.
   * */
  public static NumberIntegerPositive(maxDigits: number, minDigits = 1): ParserFunction {
    if (minDigits > maxDigits || maxDigits < 1 || minDigits < 1) {
      throw new Error('Misconfigured NumberIntegerPositive parser');
    }

    const regExp = new RegExp(`^\\d{${minDigits},${maxDigits}}$`);

    return (input: string): Nullable<number> =>
      regExp.test(input) ? parseInt(input) : null;
  }

  /**
   * A positive integer range parser function factory.
   * @param maxDigits The maximum number of digits to accept.
   * @param minDigits The minimum number of digits to accept.
   * @param maxValue The maximum value to accept.
   * @param minValue The minimum value to accept, defaults to 0.
   * @returns A digit-only parser.
   * */
  public static NumberIntegerPositiveBounded(
    maxDigits: number,
    minDigits: number,
    maxValue: number,
    minValue = 0
  ): ParserFunction {
    const digitOnlyParser = UnsCduParsers.NumberIntegerPositive(maxDigits, minDigits);
    return (input: string): Nullable<number> => {
      const parsedNumber: Nullable<number> = digitOnlyParser(input) as Nullable<number>;
      if (parsedNumber === null) {
        return null;
      }
      return minValue <= parsedNumber && parsedNumber <= maxValue ? parsedNumber : null;
    };
  }

  /**
   * A digit-only parser function factory.
   * @param maxDigits The maximum number of digits to accept.
   * @param minDigits The minimum number of digits to accept, defaults to 1.
   * @param maxPrecision The maximum number of digits after the decimal point to accept, defaults to 1.
   * @throws If `minDigits` is greater than `maxDigits`, or either value is less than 1.
   * @returns A digit-only parser.
   * */
  public static NumberDecimalPositive(maxDigits: number, minDigits = 1, maxPrecision = 1): ParserFunction {
    if (minDigits > maxDigits || maxDigits < 1 || minDigits < 1 || maxPrecision < 1) {
      throw new Error('Misconfigured NumberDecimalPositive parser');
    }

    const regExp = new RegExp(`^\\d{${minDigits},${maxDigits}}(.\\d{1,${maxPrecision}})?$`);

    return (input: string): Nullable<number> =>
      regExp.test(input) ? parseFloat(input) : null;
  }
}

/** Contains UNS FMC formatter functions and formatter function factories. */
export abstract class UnsCduFormatters {
  /**
   * A generic formatter for number or null values of input fields.
   * @param fieldState The state of the field.
   * @param fieldState."0" The current value of the field.
   * @param fieldState."1" Whether the field is currently highlighted.
   * @param fieldState."2" The value of the text which has been typed into the field.
   * @param fieldLength The length of the field in characters.
   * @param padString The character with which to pad the field.
   * @param nullValueString The string to show when the field is not highlighted and the value is null.
   * @returns A formatted field string.
   * */
  private static BaseNumberOrNullInputFormatter(
    [value, isHighlighted, typedText]: WritableUnsFieldState<number | null>,
    fieldLength: number,
    padString: string,
    nullValueString: string,
  ): string {
    return isHighlighted ?
      (typedText || (value !== null ? value.toFixed().padStart(fieldLength, padString) : '')).padStart(fieldLength, padString) + '[r-white]' :
      (value !== null ? value.toFixed().padStart(fieldLength, padString) : nullValueString) + '[white d-text]';
  }

  /**
   * A generic formatter for number or null values of readonly fields.
   * @param value The current value of the field.
   * @param fieldLength The length of the field in characters.
   * @param padString The character with which to pad the field.
   * @param nullValueString The string to show when the field is not highlighted and the value is null.
   * @param flashes Whether the string should flash when the value is less than zero.
   * @returns A formatted field string.
   * */
  private static BaseNumberOrNullReadonlyFormatter(
    value: number | null,
    fieldLength: number,
    padString: string,
    nullValueString: string,
    flashes = false,
  ): string {
    const valueStr: string = value !== null ? value.toFixed().padStart(fieldLength, padString) : nullValueString;
    const style: string = flashes && value !== null && value < 0 ? 'flash' : '';
    return `${valueStr}[${style} white d-text]`;
  }

  /**
   * Calculate headwind and crosswind components from the current ground track, wind speed and wind direction.
   * @param track Current magnetic ground track.
   * @param windSpeed Current wind speed in kt.
   * @param windDirection Current wind direction in degrees magnetic.
   * @returns Array of [headwind component in kt (+ is headwind, - is tailwind),
   * crosswind component in kt (+ is Left crosswind, - is Right crosswind)].
   */
  private static calcRelativeWindComponents(track: number, windSpeed: number, windDirection: number): [headwind: number, crosswind: number] {

    const trackRad = UnitType.DEGREE.convertTo(track, UnitType.RADIAN);
    const windDirectionRad = UnitType.DEGREE.convertTo(windDirection, UnitType.RADIAN);

    return [
      Math.round(windSpeed * (Math.cos(trackRad - windDirectionRad))),
      Math.round(windSpeed * (Math.sin(trackRad - windDirectionRad))),
    ];
  }

  private static readonly ETA_FORMATTER = DateTimeFormatter.create('{HH}:{mm}');
  private static readonly ETE_FORMATTER = DateTimeFormatter.create('{H}+{mm}');

  /**
   * A readonly formatter function for headwind/tailwind values.
   * @param spacing How much spacing to insert between the label and value (the value being padded to the three places).
   * @param numberStyle The style string to apply to the numeric value.
   * @returns A string with a headwind/tailwind label and the numeric value.
   * */
  public static Headwind(spacing: number, numberStyle: string): ReadonlyFormatterFunction<
    readonly [number | null, number | null, number | null]
  > {
    return ([track, windDirection, windVelocity]: readonly [number | null, number | null, number | null]): string => {
      if (
        track === null || windDirection === null || windVelocity === null ||
        !Number.isFinite(windVelocity) || !Number.isFinite(windDirection)
      ) {
        return '';
      }

      const [headwind] = UnsCduFormatters.calcRelativeWindComponents(track, windVelocity, windDirection);

      const componentString = headwind >= 0 ? 'HEADWIND' : 'TAILWIND';
      const velocityString = Math.abs(headwind).toFixed(0).padStart(3, ' ');

      return `${componentString}[cyan s-text]${' '.repeat(spacing)}${velocityString}[${numberStyle}]`;
    };
  }

  /**
   * An input field formatter function for number or null values.
   * @param length The length of the field in characters.
   * @param fieldType Input field.
   * @returns A function which returns a field string formatted as either a number or sequence of hyphens if null.
   */
  public static NumberHyphen(length: number, fieldType: 'input'): InputFormatterFunction
  /**
   * A readonly formatter function for number or null values.
   * @param length The length of the field in characters.
   * @param fieldType Readonly field.
   * @returns A function which returns a field string formatted as either a number or sequence of hyphens if null.
   */
  public static NumberHyphen(length: number, fieldType: 'readonly'): ReadonlyFormatterFunction
  /**
   * A formatter for number or null values.
   * @param length The length of the field in characters.
   * @param fieldType The type of field.
   * @returns A function which returns a field string formatted as either a number or sequence of hyphens if null.
   */
  public static NumberHyphen(length: number, fieldType: FieldType): FormatterFunction {
    return fieldType === 'input' ? (fieldState: WritableUnsFieldState<number | null>): string => {
      return UnsCduFormatters.BaseNumberOrNullInputFormatter(
        fieldState,
        length,
        ' ',
        '-'.repeat(length)
      );
    } : (value: number | null): string => {
      return UnsCduFormatters.BaseNumberOrNullReadonlyFormatter(
        value,
        length,
        ' ',
        '-'.repeat(length),
      );
    };
  }

  /**
   * A readonly formatter function for number or null values which flashes when the value is less than zero.
   * @param length The length of the field in characters.
   * @returns A function which returns a field string formatted as either a number or sequence of hyphens if null.
   */
  public static NumberHyphenReadonlyFlash(length: number): ReadonlyFormatterFunction {
    return (value: number | null): string => {
      return UnsCduFormatters.BaseNumberOrNullReadonlyFormatter(
        value,
        length,
        ' ',
        '-'.repeat(length),
        true,
      );
    };
  }

  /**
   * Joins two strings with spaces to achieve a desired length
   * @param stringA First string to join
   * @param stringB Second string to join
   * @param length The desired length of the resulting string
   * @returns A single string of the specified length, comprised of stringA + spaces + stringB
   */
  public static StringSpaceJoinSeperated(stringA: string, stringB: string, length: number): string {
    const getTrueLength = (str: string): number => {
      const withoutBrackets = str.replace(/\[[^\]]*\]/g, ''); // Ignore content within brackets when determining length
      return withoutBrackets.length;
    };

    const totalSpaces = Math.max(1, length - getTrueLength(stringA) - getTrueLength(stringB));
    return `${stringA}${' '.repeat(totalSpaces)}${stringB}`;
  }

  /**
   * A time formatter.
   * @param format Whether to format the time as an ETA (`--:--`) or an ETE (`--+--`).
   * @param unit The unit of time of the input value.
   * @returns A formatted ETA, or '--:--' if `null`.
   */
  public static Time(format: 'eta' | 'ete', unit: SimpleUnit<UnitFamily.Duration>): ReadonlyFormatterFunction {
    const nullStr = format === 'eta' ? '--:--' : '--+--';
    const formatter = format === 'eta' ? this.ETA_FORMATTER : this.ETE_FORMATTER;

    return (time: number | null): string =>
      `${time === null ? nullStr : formatter(UnitType.MILLISECOND.convertFrom(time, unit)).padStart(5, ' ')}[d-text]`;
  }
}

/**
 * UNS bearing output/entry format
 */
export class UnsBearingFormat implements FmcFormatter<WritableUnsFieldState<number | null>>, Validator<number> {
  private readonly prefix: string;

  /**
   * Constructor
   *
   * @param options the options for the format
   * @param options.prefix the prefix to add before the value
   */
  constructor(options: { /** A prefix */ prefix?: string } = { prefix: '' }) {
    this.prefix = options.prefix ?? '';
  }

  /** @inheritDoc */
  format([value, isHighlighted, typedText]: WritableUnsFieldState<number | null>): string {
    let ret: string;
    const valueString = `${value?.toFixed(0).padStart(3, '0') ?? '---'}°`;

    if (isHighlighted) {
      ret = `${(typedText.length > 0 ? typedText : valueString).padEnd(4, ' ')}[r-white d-text]`;
    } else {
      ret = valueString;
    }

    return `${this.prefix}${ret}`;
  }

  /** @inheritDoc */
  parse(input: string): number | null {
    const intInput = parseInt(input);

    if (!Number.isFinite(intInput)) {
      return null;
    }

    if (intInput < 0 || intInput > 360) {
      return null;
    }

    return intInput;
  }
}

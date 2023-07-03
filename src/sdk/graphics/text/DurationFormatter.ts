/* eslint-disable jsdoc/check-indentation */

import { MathUtils, NumberUnitInterface, Unit, UnitFamily, UnitType } from '../../math';

/**
 * Options for creating a duration formatter.
 */
export type DurationFormatterOptions = {
  /** The string to output when the input duration is `NaN`. */
  nanString: string;

  /** Whether to cache and reuse the previously generated string when possible. */
  cache: boolean;
};

/**
 * A utility class for creating duration formatters.
 *
 * Each duration formatter is a function which generates output strings from input duration values. The formatting
 * behavior of a formatter is defined by its format template.
 *
 * Format templates are strings which contain zero or more fragments enclosed by curly braces (`{}`); For a given
 * format template, an output string is generated from an input duration by replacing each fragment in the template
 * with a string generated from the input. The parts of the template string that are not contained in any fragment are
 * passed to the output unchanged. Each fragment defines how its replacement string is generated. There are two types
 * of fragments:
 * * Sign fragment. In EBNF notation, these take the form `['+', ['[', x, ']']], ('-' , ['[', y, ']'])`, where
 * `x` and `y` are arbitrary strings. Each sign fragment is replaced with a string representing the sign of the input.
 * The negative sign string is defined by `y`. If `y` is not defined, the negative sign string defaults to `'-'`
 * (dash). The positive sign string is defined by `x`. If the positive sign token does not appear in the fragment
 * definition, the positive sign string defaults to `''` (the empty string), otherwise it defaults to `'+'`.
 * * Numeric fragment. In EBNF notation, these take the form
 * `{x}, ['?'], ['.', [{x}], ['(', {x}, ')']]`, where `x = 'H' | 'M' | 'S' | 'h' | 'm' | 's'`. Each numeric fragment is
 * replaced with the numeric value of the duration in hours, minutes, or seconds, depending on which character is used
 * for `x`. With uppercase letters, the entire portion of the input value is used. With lowercase letters, only the
 * portion of the input value that does not divide evenly into the next smallest unit is used (for hours, which is the
 * largest unit, there is no difference between using `'H'` and `'h'`).
 *   * The number of `x` characters to the left of the decimal point (including all characters if no decimal point is
 * present) in the definition controls the number of leading zeroes with which the output will be padded.
 *   * If the optional `'?'` character is present, the output will drop all digits to the left of the decimal point if
 * all such digits are equal to 0.
 *   * The total number of `x` characters to the right of the decimal point in the definition controls the decimal
 * precision of the output. Trailing zeroes to the right of the decimal point will be added to the output to a number
 * of decimal places equal to the number of non-parenthetical `x` characters to the right of the decimal point in the
 * definition. If there are no `x` characters to the right of the decimal point in the definition, then the output will
 * have infinite decimal precision with no extraneous trailing zeroes.
 *   * Rounding behavior is always round down.
 *
 * @example <caption>Formatting to hours-minutes-seconds</caption>
 * const formatter = DurationFormatter.create('{h}:{mm}:{ss}', UnitType.SECOND);
 * formatter(3616);       // 1:00:16
 * formatter(36016.9);    // 10:00:16
 *
 * @example <caption>Formatting to hours-minutes-seconds with decimal precision</caption>
 * const formatter = DurationFormatter.create('{h}:{mm}:{ss.s(s)}', UnitType.SECOND);
 * formatter(3600);       // 1:00:00.0
 * formatter(3600.55);    // 1:00:00.55
 *
 * @example <caption>Formatting to minutes-seconds</caption>
 * const formatter = DurationFormatter.create('{MM}:{ss}', UnitType.SECOND);
 * formatter(600);        // 10:00
 * formatter(4200);       // 70:00
 *
 * @example <caption>Formatting with signs</caption>
 * const formatter = DurationFormatter.create('{-}{h}:{mm}', UnitType.SECOND);
 * formatter(3600);                   // 1:00
 * formatter(-3600);                  // -1:00
 *
 * const formatterWithPositiveSign = DurationFormatter.create('{+-}{h}:{mm}', UnitType.SECOND);
 * formatterWithPositiveSign(3600);   // +1:00
 * 
 * const formatterWithRealMinusSign = DurationFormatter.create('{-[–]}{h}:{mm}', UnitType.SECOND);
 * formatterWithRealMinusSign(3600);  // –1:00
 */
export class DurationFormatter {
  private static readonly FORMAT_REGEXP = /({[^{}]*})/;
  private static readonly SIGN_FRAGMENT_REGEX = /^(?:(\+)(?:\[(.*)\])?)?-(?:\[(.*)\])?$/;
  private static readonly NUM_FRAGMENT_REGEXP = /^(([HMShms])\2*)(\?)?(?:(\.(\2*)(?:\((\2+)\))?)?)$/;

  private static readonly NUM_FRAGMENT_UNIT_INFO = {
    ['h']: { unit: UnitType.HOUR, mod: Infinity },
    ['m']: { unit: UnitType.MINUTE, mod: 60 },
    ['s']: { unit: UnitType.SECOND, mod: 60 },
    ['H']: { unit: UnitType.HOUR, mod: Infinity },
    ['M']: { unit: UnitType.MINUTE, mod: Infinity },
    ['S']: { unit: UnitType.SECOND, mod: Infinity }
  };

  /** The default options for duration formatters. */
  public static readonly DEFAULT_OPTIONS: Readonly<DurationFormatterOptions> = {
    nanString: 'NaN',
    cache: false
  };

  /**
   * Creates a function which formats durations, expressed as numeric values, to strings. The formatting behavior of
   * the function is defined by a specified format template. For more information on format templates and their syntax,
   * please refer to the {@link DurationFormatter} class documentation. All formatter options except `nanString`, if
   * specified, will use their default values.
   * @param format A template defining how the function formats durations.
   * @param unit The unit type in which the input duration values are expressed.
   * @param precision The precision of the formatter, in the unit type defined by the `unit` argument. Input values
   * will be rounded to the nearest multiple of this quantity. Precision values less than or equal to zero will be
   * taken to mean infinite precision (i.e. no rounding will take place).
   * @param nanString The string to output when the input duration is `NaN`. Defaults to `'NaN'`.
   * @returns A function which formats durations, expressed as numeric values, to strings.
   */
  public static create(
    format: string,
    unit: Unit<UnitFamily.Duration>,
    precision: number,
    nanString?: string
  ): (duration: number) => string;
  /**
   * Creates a function which formats durations, expressed as numeric values, to strings. The formatting behavior of
   * the function is defined by a specified format template. For more information on format templates and their syntax,
   * please refer to the {@link DurationFormatter} class documentation.
   * @param format A template defining how the function formats durations.
   * @param unit The unit type in which the input duration values are expressed.
   * @param precision The precision of the formatter, in the unit type defined by the `unit` argument. Input values
   * will be rounded to the nearest multiple of this quantity. Precision values less than or equal to zero will be
   * taken to mean infinite precision (i.e. no rounding will take place).
   * @param options Options to configure the formatter. Options not explicitly defined will be set to the following
   * default values:
   * * `nanString = 'NaN'`
   * * `cache = false`
   * @returns A function which formats durations, expressed as numeric values, to strings.
   */
  public static create(
    format: string,
    unit: Unit<UnitFamily.Duration>,
    precision: number,
    options?: Readonly<Partial<DurationFormatterOptions>>
  ): (duration: number) => string;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static create(
    format: string,
    unit: Unit<UnitFamily.Duration>,
    precision: number,
    arg4?: string | Readonly<Partial<DurationFormatterOptions>>
  ): (duration: number) => string {
    const builder = DurationFormatter.createBuilder(format, precision, unit);
    const options = DurationFormatter.resolveOptions(typeof arg4 === 'string' ? { nanString: arg4 } : arg4);

    const built = Array.from(builder, () => '');

    if (options.cache) {
      let cachedInput: number | undefined = undefined;
      let cachedOutput: string | undefined = undefined;

      return (duration: number): string => {
        if (isNaN(duration)) {
          return options.nanString;
        }

        const roundedInput = MathUtils.round(duration, precision);

        if (cachedInput !== undefined && cachedOutput !== undefined && roundedInput === cachedInput) {
          return cachedOutput;
        }

        cachedInput = roundedInput;

        for (let i = 0; i < builder.length; i++) {
          built[i] = builder[i](duration, unit);
        }

        return cachedOutput = built.join('');
      };
    } else {
      return (duration: number): string => {
        if (isNaN(duration)) {
          return options.nanString;
        }

        for (let i = 0; i < builder.length; i++) {
          built[i] = builder[i](duration, unit);
        }

        return built.join('');
      };
    }
  }

  /**
   * Creates a function which formats durations, expressed as {@link NumberUnitInterface} objects, to strings. The
   * formatting behavior of the function is defined by a specified format template. For more information on format
   * templates and their syntax, please refer to the {@link DurationFormatter} class documentation. All formatter
   * options except `nanString`, if specified, will use their default values.
   * @param format A template defining how the function formats durations.
   * @param precision The precision of the formatter. Input values will be rounded to the nearest multiple of this
   * quantity. Precision values less than or equal to zero will be taken to mean infinite precision (i.e. no rounding
   * will take place).
   * @param nanString The string to output when the input duration is `NaN`. Defaults to `'NaN'`.
   * @returns A function which formats durations, expressed as {@link NumberUnitInterface} objects, to strings.
   */
  public static createForNumberUnit(
    format: string,
    precision: NumberUnitInterface<UnitFamily.Duration>,
    nanString?: string
  ): (duration: NumberUnitInterface<UnitFamily.Duration>) => string;
  /**
   * Creates a function which formats durations, expressed as {@link NumberUnitInterface} objects, to strings. The
   * formatting behavior of the function is defined by a specified format template. For more information on format
   * templates and their syntax, please refer to the {@link DurationFormatter} class documentation.
   * @param format A template defining how the function formats durations.
   * @param precision The precision of the formatter. Input values will be rounded to the nearest multiple of this
   * quantity. Precision values less than or equal to zero will be taken to mean infinite precision (i.e. no rounding
   * will take place).
   * @param options Options to configure the formatter. Options not explicitly defined will be set to the following
   * default values:
   * * `nanString = 'NaN'`
   * * `cache = false`
   * @returns A function which formats durations, expressed as {@link NumberUnitInterface} objects, to strings.
   */
  public static createForNumberUnit(
    format: string,
    precision: NumberUnitInterface<UnitFamily.Duration>,
    options?: Readonly<Partial<DurationFormatterOptions>>
  ): (duration: NumberUnitInterface<UnitFamily.Duration>) => string;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static createForNumberUnit(
    format: string,
    precision: NumberUnitInterface<UnitFamily.Duration>,
    arg3?: string | Readonly<Partial<DurationFormatterOptions>>
  ): (duration: NumberUnitInterface<UnitFamily.Duration>) => string {
    const builder = DurationFormatter.createBuilder(format, precision.number, precision.unit);
    const options = DurationFormatter.resolveOptions(typeof arg3 === 'string' ? { nanString: arg3 } : arg3);

    const built = Array.from(builder, () => '');

    if (options.cache) {
      let cachedInput: number | undefined = undefined;
      let cachedOutput: string | undefined = undefined;

      return (duration: NumberUnitInterface<UnitFamily.Duration>): string => {
        if (duration.isNaN()) {
          return options.nanString;
        }

        const roundedInput = MathUtils.round(duration.asUnit(precision.unit), precision.number);

        if (cachedInput !== undefined && cachedOutput !== undefined && roundedInput === cachedInput) {
          return cachedOutput;
        }

        cachedInput = roundedInput;

        for (let i = 0; i < builder.length; i++) {
          built[i] = builder[i](duration.number, duration.unit);
        }

        return cachedOutput = built.join('');
      };
    } else {
      return (duration: NumberUnitInterface<UnitFamily.Duration>): string => {
        if (duration.isNaN()) {
          return options.nanString;
        }

        for (let i = 0; i < builder.length; i++) {
          built[i] = builder[i](duration.number, duration.unit);
        }

        return built.join('');
      };
    }
  }

  /**
   * Resolves a full set of options from a partial options object. Any option not explicitly defined by the partial
   * options object will revert to its default value.
   * @param options A partial options object.
   * @returns A new options object containing the full set of options resolved from the specified partial options
   * object.
   */
  private static resolveOptions(options?: Readonly<Partial<DurationFormatterOptions>>): DurationFormatterOptions {
    const resolved = Object.assign({}, options) as any;

    for (const key in DurationFormatter.DEFAULT_OPTIONS) {
      resolved[key] ??= DurationFormatter.DEFAULT_OPTIONS[key as keyof DurationFormatterOptions];
    }

    return resolved;
  }

  /**
   * Creates an output string builder from a format template.
   * @param format A format template.
   * @param precision The desired precision.
   * @param precisionUnit The unit type of the desired precision.
   * @returns An output string builder which conforms to the specified format template.
   */
  private static createBuilder(format: string, precision: number, precisionUnit: Unit<UnitFamily.Duration>): ((duration: number, unit: Unit<UnitFamily.Duration>) => string)[] {
    const split = format.split(DurationFormatter.FORMAT_REGEXP);

    return split.map((string): (duration: number, unit: Unit<UnitFamily.Duration>) => string => {
      if (string.match(DurationFormatter.FORMAT_REGEXP)) {
        return DurationFormatter.parseFragment(string.substring(1, string.length - 1), precision, precisionUnit);
      } else {
        return (): string => string;
      }
    });
  }

  /**
   * Parses a format template fragment and returns a function which generates a string from an input duration according
   * to the rules defined by the fragment. If the fragment is malformed, this method returns a function which always
   * generates an empty string.
   * @param fragment A format template fragment definition.
   * @param precision The desired precision.
   * @param precisionUnit The unit type of the desired precision.
   * @returns A function which generates a string from an input duration in milliseconds according to the rules defined
   * by the template fragment.
   */
  private static parseFragment(fragment: string, precision: number, precisionUnit: Unit<UnitFamily.Duration>): (duration: number, unit: Unit<UnitFamily.Duration>) => string {
    const signMatch = fragment.match(DurationFormatter.SIGN_FRAGMENT_REGEX);
    if (signMatch) {
      const [
        ,
        posCharMatch,         // Matches the positive sign char ('+')
        posStringMatch,       // Matches the string assigned to represent the positive sign
        negStringMatch        // Matches the string assigned to represent the negative sign
      ] = signMatch;

      const posSign = posCharMatch === '+' ? posStringMatch ?? '+' : '';
      const negSign = negStringMatch ?? '-';

      return (angle: number): string => {
        return angle < 0 ? negSign : posSign;
      };
    }

    const numericMatch = fragment.match(DurationFormatter.NUM_FRAGMENT_REGEXP);

    if (!numericMatch) {
      console.warn(`DurationFormatter: discarding fragment due to invalid syntax: {${fragment}}`);
      return (): string => '';
    }

    const [
      ,
      leftMatch,              // Matches unit chars to the left of the decimal point
      unitMatch,              // Matches the unit char ('H', 'M', 'S', etc)
      leftOptionalMatch,      // Matches the question mark just to the left of the decimal point
      rightMatch,             // Matches the decimal point and all chars to the right
      rightForcedMatch,       // Matches unit chars to the right of the decimal point not surrounded by parens
      rightOptionalMatch      // Matches unit chars to the right of the decimal point surrounded by parens
    ] = numericMatch;

    const unitInfo = DurationFormatter.NUM_FRAGMENT_UNIT_INFO[unitMatch as 'H' | 'M' | 'S' | 'h' | 'm' | 's'];
    const pad = leftMatch.length;
    const dropZero = !!leftOptionalMatch;
    const step = precisionUnit.convertTo(precision, unitInfo.unit);

    const convertFunc = step <= 0
      ? (
        (duration: number, unit: Unit<UnitFamily.Duration>): number => {
          return unitInfo.unit.convertFrom(Math.abs(duration), unit) % unitInfo.mod;
        }
      ) : (
        (duration: number, unit: Unit<UnitFamily.Duration>, epsilon: number): number => {
          return (MathUtils.round(unitInfo.unit.convertFrom(Math.abs(duration), unit), step) + epsilon) % unitInfo.mod;
        }
      );

    const formatLeftFunc = dropZero
      ? (
        (input: number): string => {
          const rounded = Math.floor(input);
          return rounded === 0 ? '' : rounded.toString().padStart(pad, '0');
        }
      )
      : (
        (input: number): string => Math.floor(input).toString().padStart(pad, '0')
      );

    if (rightMatch) {
      if (rightMatch.length === 1) {
        // Unlimited decimal precision
        return (duration: number, unit: Unit<UnitFamily.Duration>): string => {
          const converted = unitInfo.unit.convertFrom(Math.abs(duration), unit) % unitInfo.mod;
          const decimal = converted % 1;
          return `${formatLeftFunc(converted)}${decimal.toString().substring(1)}`;
        };
      }

      const forcedDecimalPlaces = rightForcedMatch?.length ?? 0;
      const unforcedDecimalPlaces = rightOptionalMatch?.length ?? 0;
      const totalDecimalPlaces = forcedDecimalPlaces + unforcedDecimalPlaces;

      const factor = Math.pow(10, totalDecimalPlaces);
      const epsilon = Math.min(step / 2, 1 / (2 * factor));

      return (duration: number, unit: Unit<UnitFamily.Duration>): string => {
        const converted = convertFunc(duration, unit, epsilon);
        const decimal = converted % 1;
        const decimalRounded = Math.floor(decimal * factor) / factor;

        return `${formatLeftFunc(converted)}.${decimalRounded.toString().substring(2).padEnd(forcedDecimalPlaces, '0')}`;
      };
    } else {
      const epsilon = Math.min(step / 2, 0.5);

      return (duration: number, unit: Unit<UnitFamily.Duration>): string => {
        return formatLeftFunc(convertFunc(duration, unit, epsilon));
      };
    }
  }
}
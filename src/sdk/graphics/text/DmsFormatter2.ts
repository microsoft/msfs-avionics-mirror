/* eslint-disable jsdoc/check-indentation */

import { MathUtils, NumberUnitInterface, Unit, UnitFamily, UnitType } from '../../math';

/**
 * Options for creating a degree-minute-second formatter.
 */
export type DmsFormatter2Options = {
  /** The string to output when the input duration is `NaN`. */
  nanString: string;

  /** Whether to cache and reuse the previously generated string when possible. */
  cache: boolean;
};

/**
 * A utility class for creating degree-minute-second formatters for angle values.
 *
 * Each DMS formatter is a function which generates output strings from input angle values. The formatting behavior
 * of a formatter is defined by its format template.
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
 * * Numeric fragment. In EBNF notation, these take the form `{x}, ['?'], ['.', [{x}], ['(', {x}, ')']]`,
 * where `x = 'D' | 'M' | 'S' | 'd' | 'm' | 's'`. Each numeric fragment is replaced with the numeric value of the
 * duration in degrees, minutes, or seconds, depending on which character is used for `x`. With uppercase letters, the
 * entire portion of the input value is used. With lowercase letters, only the portion of the input value that does not
 * divide evenly into the next smallest unit is used (for hours, which is the largest unit, there is no difference
 * between using `'H'` and `'h'`).
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
 * @example <caption>Formatting to degrees-minutes-seconds</caption>
 * const formatter = DmsFormatter2.create('{d}°{mm}\'{ss}"', UnitType.DEGREE);
 * formatter(10);         // 10°00'00"
 * formatter(10.51);      // 10°30'36"
 *
 * @example <caption>Formatting to degrees-minutes-seconds with decimal precision</caption>
 * const formatter = DmsFormatter2.create('{d}°{mm}\'{ss.s(s)}"', UnitType.DEGREE);
 * formatter(10);         // 10°00'00.0"
 * formatter(10.09169);   // 10°05'30.08"
 *
 * @example <caption>Formatting to degrees-minutes</caption>
 * const formatter = DmsFormatter2.create('{d}°{mm.mm}\'', UnitType.DEGREE);
 * formatter(10.09169);   // 10°05.50'
 *
 * @example <caption>Formatting with signs</caption>
 * const formatter = DmsFormatter2.create('{-}{d}°{mm}\'', UnitType.DEGREE);
 * formatter(10);                   // 10°00'
 * formatter(-10);                  // -10°00'
 *
 * const formatterWithPositiveSign = DmsFormatter2.create('{+-}{d}°{mm}\'', UnitType.DEGREE);
 * formatterWithPositiveSign(10);   // +10°00'
 * 
 * const formatterWithRealMinusSign = DmsFormatter2.create('{-[–]}{d}°{mm}\'', UnitType.DEGREE);
 * formatterWithRealMinusSign(10);  // –10°00'
 */
export class DmsFormatter2 {
  private static readonly FORMAT_REGEXP = /({[^{}]*})/;
  private static readonly SIGN_FRAGMENT_REGEX = /^(?:(\+)(?:\[(.*)\])?)?-(?:\[(.*)\])?$/;
  private static readonly NUM_FRAGMENT_REGEXP = /^(([DMSdms])\2*)(\?)?(?:(\.(\2*)(?:\((\2+)\))?)?)$/;

  private static readonly NUM_FRAGMENT_UNIT_INFO = {
    ['d']: { unit: UnitType.DEGREE, mod: Infinity },
    ['m']: { unit: UnitType.ARC_MIN, mod: 60 },
    ['s']: { unit: UnitType.ARC_SEC, mod: 60 },
    ['D']: { unit: UnitType.DEGREE, mod: Infinity },
    ['M']: { unit: UnitType.ARC_MIN, mod: Infinity },
    ['S']: { unit: UnitType.ARC_SEC, mod: Infinity }
  };

  /** The default options for degree-minute-second formatters. */
  public static readonly DEFAULT_OPTIONS: Readonly<DmsFormatter2Options> = {
    nanString: 'NaN',
    cache: false
  };

  /**
   * Creates a function which formats angles, expressed as numeric values, to strings. The formatting behavior of
   * the function is defined by a specified format template. For more information on format templates and their syntax,
   * please refer to the {@link DmsFormatter2} class documentation. All formatter options except `nanString`, if
   * specified, will use their default values.
   * @param format A template defining how the function formats angles.
   * @param unit The unit type in which the input angle values are expressed.
   * @param precision The precision of the formatter, in the unit type defined by the `unit` argument. Input values
   * will be rounded to the nearest multiple of this quantity. Precision values less than or equal to zero will be
   * taken to mean infinite precision (i.e. no rounding will take place).
   * @param nanString The string to output when the input angle is `NaN`. Defaults to `'NaN'`.
   * @returns A function which formats angles, expressed as numeric values, to strings.
   */
  public static create(
    format: string,
    unit: Unit<UnitFamily.Angle>,
    precision: number,
    nanString?: string
  ): (angle: number) => string;
  /**
   * Creates a function which formats angles, expressed as numeric values, to strings. The formatting behavior of
   * the function is defined by a specified format template. For more information on format templates and their syntax,
   * please refer to the {@link DmsFormatter2} class documentation.
   * @param format A template defining how the function formats angles.
   * @param unit The unit type in which the input angle values are expressed.
   * @param precision The precision of the formatter, in the unit type defined by the `unit` argument. Input values
   * will be rounded to the nearest multiple of this quantity. Precision values less than or equal to zero will be
   * taken to mean infinite precision (i.e. no rounding will take place).
   * @param options Options to configure the formatter. Options not explicitly defined will be set to the following
   * default values:
   * * `nanString = 'NaN'`
   * * `cache = false`
   * @returns A function which formats angles, expressed as numeric values, to strings.
   */
  public static create(
    format: string,
    unit: Unit<UnitFamily.Angle>,
    precision: number,
    options?: Readonly<Partial<DmsFormatter2Options>>
  ): (angle: number) => string;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static create(
    format: string,
    unit: Unit<UnitFamily.Angle>,
    precision: number,
    arg4?: string | Readonly<Partial<DmsFormatter2Options>>
  ): (angle: number) => string {
    const builder = DmsFormatter2.createBuilder(format, precision, unit);
    const options = DmsFormatter2.resolveOptions(typeof arg4 === 'string' ? { nanString: arg4 } : arg4);

    const built = Array.from(builder, () => '');

    if (options.cache) {
      let cachedInput: number | undefined = undefined;
      let cachedOutput: string | undefined = undefined;

      return (angle: number): string => {
        if (isNaN(angle)) {
          return options.nanString;
        }

        const roundedInput = MathUtils.round(angle, precision);

        if (cachedInput !== undefined && cachedOutput !== undefined && roundedInput === cachedInput) {
          return cachedOutput;
        }

        cachedInput = roundedInput;

        for (let i = 0; i < builder.length; i++) {
          built[i] = builder[i](angle, unit);
        }

        return cachedOutput = built.join('');
      };
    } else {
      return (angle: number): string => {
        if (isNaN(angle)) {
          return options.nanString;
        }

        for (let i = 0; i < builder.length; i++) {
          built[i] = builder[i](angle, unit);
        }

        return built.join('');
      };
    }
  }

  /**
   * Creates a function which formats angles, expressed as {@link NumberUnitInterface} objects, to strings. The
   * formatting behavior of the function is defined by a specified format template. For more information on format
   * templates and their syntax, please refer to the {@link DmsFormatter2} class documentation. All formatter options
   * except `nanString`, if specified, will use their default values.
   * @param format A template defining how the function formats angles.
   * @param precision The precision of the formatter. Input values will be rounded to the nearest multiple of this
   * quantity. Precision values less than or equal to zero will be taken to mean infinite precision (i.e. no rounding
   * will take place).
   * @param nanString The string to output when the input angle is `NaN`. Defaults to `'NaN'`.
   * @returns A function which formats angles, expressed as {@link NumberUnitInterface} objects, to strings.
   */
  public static createForNumberUnit(
    format: string,
    precision: NumberUnitInterface<UnitFamily.Angle>,
    nanString?: string
  ): (angle: NumberUnitInterface<UnitFamily.Angle>) => string;
  /**
   * Creates a function which formats angles, expressed as {@link NumberUnitInterface} objects, to strings. The
   * formatting behavior of the function is defined by a specified format template. For more information on format
   * templates and their syntax, please refer to the {@link DmsFormatter2} class documentation.
   * @param format A template defining how the function formats angles.
   * @param precision The precision of the formatter. Input values will be rounded to the nearest multiple of this
   * quantity. Precision values less than or equal to zero will be taken to mean infinite precision (i.e. no rounding
   * will take place).
   * @param options Options to configure the formatter. Options not explicitly defined will be set to the following
   * default values:
   * * `nanString = 'NaN'`
   * * `cache = false`
   * @returns A function which formats angles, expressed as {@link NumberUnitInterface} objects, to strings.
   */
  public static createForNumberUnit(
    format: string,
    precision: NumberUnitInterface<UnitFamily.Angle>,
    options?: Readonly<Partial<DmsFormatter2Options>>
  ): (angle: NumberUnitInterface<UnitFamily.Angle>) => string;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static createForNumberUnit(
    format: string,
    precision: NumberUnitInterface<UnitFamily.Angle>,
    arg3?: string | Readonly<Partial<DmsFormatter2Options>>
  ): (angle: NumberUnitInterface<UnitFamily.Angle>) => string {
    const builder = DmsFormatter2.createBuilder(format, precision.number, precision.unit);
    const options = DmsFormatter2.resolveOptions(typeof arg3 === 'string' ? { nanString: arg3 } : arg3);

    const built = Array.from(builder, () => '');

    if (options.cache) {
      let cachedInput: number | undefined = undefined;
      let cachedOutput: string | undefined = undefined;

      return (angle: NumberUnitInterface<UnitFamily.Angle>): string => {
        if (angle.isNaN()) {
          return options.nanString;
        }

        const roundedInput = MathUtils.round(angle.asUnit(precision.unit), precision.number);

        if (cachedInput !== undefined && cachedOutput !== undefined && roundedInput === cachedInput) {
          return cachedOutput;
        }

        cachedInput = roundedInput;

        for (let i = 0; i < builder.length; i++) {
          built[i] = builder[i](angle.number, angle.unit);
        }

        return cachedOutput = built.join('');
      };
    } else {
      return (angle: NumberUnitInterface<UnitFamily.Angle>): string => {
        if (angle.isNaN()) {
          return options.nanString;
        }

        for (let i = 0; i < builder.length; i++) {
          built[i] = builder[i](angle.number, angle.unit);
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
  private static resolveOptions(options?: Readonly<Partial<DmsFormatter2Options>>): DmsFormatter2Options {
    const resolved = Object.assign({}, options) as any;

    for (const key in DmsFormatter2.DEFAULT_OPTIONS) {
      resolved[key] ??= DmsFormatter2.DEFAULT_OPTIONS[key as keyof DmsFormatter2Options];
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
  private static createBuilder(format: string, precision: number, precisionUnit: Unit<UnitFamily.Angle>): ((angle: number, unit: Unit<UnitFamily.Angle>) => string)[] {
    const split = format.split(DmsFormatter2.FORMAT_REGEXP);

    return split.map((string): (angle: number, unit: Unit<UnitFamily.Angle>) => string => {
      if (string.match(DmsFormatter2.FORMAT_REGEXP)) {
        return DmsFormatter2.parseFragment(string.substring(1, string.length - 1), precision, precisionUnit);
      } else {
        return (): string => string;
      }
    });
  }

  /**
   * Parses a format template fragment and returns a function which generates a string from an input angle according
   * to the rules defined by the fragment. If the fragment is malformed, this method returns a function which always
   * generates an empty string.
   * @param fragment A format template fragment definition.
   * @param precision The desired precision.
   * @param precisionUnit The unit type of the desired precision.
   * @returns A function which generates a string from an input angle in milliseconds according to the rules defined
   * by the template fragment.
   */
  private static parseFragment(fragment: string, precision: number, precisionUnit: Unit<UnitFamily.Angle>): (angle: number, unit: Unit<UnitFamily.Angle>) => string {
    const signMatch = fragment.match(DmsFormatter2.SIGN_FRAGMENT_REGEX);
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

    const numericMatch = fragment.match(DmsFormatter2.NUM_FRAGMENT_REGEXP);

    if (!numericMatch) {
      console.warn(`DmsFormatter2: discarding fragment due to invalid syntax: {${fragment}}`);
      return (): string => '';
    }

    const [
      ,
      leftMatch,              // Matches unit chars to the left of the decimal point
      unitMatch,              // Matches the unit char ('D', 'M', 'S', etc)
      leftOptionalMatch,      // Matches the question mark just to the left of the decimal point
      rightMatch,             // Matches the decimal point and all chars to the right
      rightForcedMatch,       // Matches unit chars to the right of the decimal point not surrounded by parens
      rightOptionalMatch      // Matches unit chars to the right of the decimal point surrounded by parens
    ] = numericMatch;

    const unitInfo = DmsFormatter2.NUM_FRAGMENT_UNIT_INFO[unitMatch as 'D' | 'M' | 'S' | 'd' | 'm' | 's'];
    const pad = leftMatch.length;
    const dropZero = !!leftOptionalMatch;
    const step = precisionUnit.convertTo(precision, unitInfo.unit);

    const convertFunc = step <= 0
      ? (
        (angle: number, unit: Unit<UnitFamily.Angle>): number => {
          return unitInfo.unit.convertFrom(Math.abs(angle), unit) % unitInfo.mod;
        }
      ) : (
        (angle: number, unit: Unit<UnitFamily.Angle>, epsilon: number): number => {
          return (MathUtils.round(unitInfo.unit.convertFrom(Math.abs(angle), unit), step) + epsilon) % unitInfo.mod;
        }
      );

    const formatLeftFunc = dropZero
      ? (
        (input: number): string => {
          const rounded = Math.floor(input);
          return rounded === 0 ? '' : rounded.toString().padStart(pad, '0');
        }
      ) : (
        (input: number): string => Math.floor(input).toString().padStart(pad, '0')
      );

    if (rightMatch) {
      if (rightMatch.length === 1) {
        // Unlimited decimal precision
        return (angle: number, unit: Unit<UnitFamily.Angle>): string => {
          const converted = unitInfo.unit.convertFrom(Math.abs(angle), unit) % unitInfo.mod;
          const decimal = converted % 1;
          return `${formatLeftFunc(converted)}${decimal.toString().substring(1)}`;
        };
      }

      const forcedDecimalPlaces = rightForcedMatch?.length ?? 0;
      const unforcedDecimalPlaces = rightOptionalMatch?.length ?? 0;
      const totalDecimalPlaces = forcedDecimalPlaces + unforcedDecimalPlaces;

      const factor = Math.pow(10, totalDecimalPlaces);
      const epsilon = Math.min(step / 2, 1 / (2 * factor));

      return (angle: number, unit: Unit<UnitFamily.Angle>): string => {
        const converted = convertFunc(angle, unit, epsilon);
        const decimal = converted % 1;
        const decimalRounded = Math.floor(decimal * factor) / factor;

        return `${formatLeftFunc(converted)}.${decimalRounded.toString().substring(2).padEnd(forcedDecimalPlaces, '0')}`;
      };
    } else {
      const epsilon = Math.min(step / 2, 0.5);

      return (angle: number, unit: Unit<UnitFamily.Angle>): string => {
        return formatLeftFunc(convertFunc(angle, unit, epsilon));
      };
    }
  }
}
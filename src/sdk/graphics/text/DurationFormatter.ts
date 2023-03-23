/* eslint-disable jsdoc/check-indentation */

import { MathUtils, NumberUnitInterface, Unit, UnitFamily, UnitType } from '../../math';

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
 * `{x}, ['?'], ['.', [{x}], ['(', {x}, ')']]`
 * where `x = 'H' | 'M' | 'S' | 'h' | 'm' | 's'`. Each numeric fragment is replaced with the numeric value of the
 * duration in hours, minutes, or seconds, depending on which character is used for `x`. With uppercase letters, the
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
 * @example <caption>Formatting to hours-minutes-seconds</caption>
 * const formatter = DurationFormatter.create('{h}:{mm}:{ss}', UnitType.SECOND);
 * console.log(formatter(3616));  // 1:00:16
 * console.log(formatter(36016.9)); // 10:00:16
 *
 * @example <caption>Formatting to hours-minutes-seconds with decimal precision</caption>
 * const formatter = DurationFormatter.create('{h}:{mm}:{ss.s(s)}', UnitType.SECOND);
 * console.log(formatter(3600)); // 1:00:00.0
 * console.log(formatter(3600.55)); // 1:00:00.55
 *
 * @example <caption>Formatting to minutes-seconds</caption>
 * const formatter = DurationFormatter.create('{MM}:{ss}', UnitType.SECOND);
 * console.log(formatter(600));  // 10:00
 * console.log(formatter(4200)); // 70:00
 *
 * @example <caption>Formatting with signs</caption>
 * const formatter = DurationFormatter.create('{-}{h}:{mm}', UnitType.SECOND);
 * console.log(formatter(3600));  // 1:00
 * console.log(formatter(-3600)); // -1:00
 *
 * const formatterWithPositiveSign = DurationFormatter.create('{+-}{h}:{mm}', UnitType.SECOND);
 * console.log(formatterWithPositiveSign(3600));  // +1:00
 * 
 * const formatterWithRealMinusSign = DurationFormatter.create('{-[–]}{h}:{mm}', UnitType.SECOND);
 * console.log(formatterWithRealMinusSign(3600));  // –1:00
 */
export class DurationFormatter {
  private static readonly FORMAT_REGEXP = /({[^{}]*})/;
  private static readonly SIGN_FRAGMENT_REGEX = /^(?:(\+)(?:\[(.*)\])?)?-(?:\[(.*)\])?$/;
  private static readonly NUM_FRAGMENT_REGEXP = /^(([HMShms])+)(\?)?(?:(\.(\2*)(?:\((\2+)\))?)?)$/;

  private static readonly NUM_FRAGMENT_UNIT_INFO = {
    ['h']: { unit: UnitType.HOUR, mod: Infinity },
    ['m']: { unit: UnitType.MINUTE, mod: 60 },
    ['s']: { unit: UnitType.SECOND, mod: 60 },
    ['H']: { unit: UnitType.HOUR, mod: Infinity },
    ['M']: { unit: UnitType.MINUTE, mod: Infinity },
    ['S']: { unit: UnitType.SECOND, mod: Infinity }
  };

  private static readonly NUM_FRAGMENT_ROUND_FUNCS = {
    ['+']: Math.ceil,
    ['-']: Math.floor,
    ['~']: Math.round
  };

  /**
   * Creates a function which formats durations, expressed as numeric values, to strings. The formatting behavior of
   * the function is defined by a specified format template. For more information on format templates and their syntax,
   * please refer to the {@link DurationFormatter} class documentation.
   * @param format A template defining how the function formats durations.
   * @param unit The unit type in which the input duration values are expressed.
   * @param precision The precision of the formatter, in the unit type defined by the `unit` argument. Input values
   * will be rounded to the nearest multiple of this quantity. Precision values less than or equal to zero will be
   * taken to mean infinite precision (i.e. no rounding will take place).
   * @param nanString The string to output when the input duration is `NaN`. Defaults to `'NaN'`.
   * @returns A function which formats durations, expressed as numeric values, to strings.
   */
  public static create(format: string, unit: Unit<UnitFamily.Duration>, precision: number, nanString = 'NaN'): (duration: number) => string {
    const builder = DurationFormatter.createBuilder(format, precision, unit);

    return (duration: number): string => {
      if (isNaN(duration)) {
        return nanString;
      }

      return builder.reduce((string, part) => string + part(duration, unit), '');
    };
  }

  /**
   * Creates a function which formats durations, expressed as {@link NumberUnitInterface} objects, to strings. The
   * formatting behavior of the function is defined by a specified format template. For more information on format
   * templates and their syntax, please refer to the {@link DurationFormatter} class documentation.
   * @param format A template defining how the function formats durations.
   * @param precision The precision of the formatter. Input values will be rounded to the nearest multiple of this
   * quantity. Precision values less than or equal to zero will be taken to mean infinite precision (i.e. no rounding
   * will take place).
   * @param nanString The string to output when the input duration is `NaN`. Defaults to `'NaN'`.
   * @returns A function which formats durations, expressed as {@link NumberUnitInterface} objects, to strings.
   */
  public static createForNumberUnit(format: string, precision: NumberUnitInterface<UnitFamily.Duration>, nanString = 'NaN'): (duration: NumberUnitInterface<UnitFamily.Duration>) => string {
    const builder = DurationFormatter.createBuilder(format, precision.number, precision.unit);

    return (duration: NumberUnitInterface<UnitFamily.Duration>): string => {
      if (duration.isNaN()) {
        return nanString;
      }

      return builder.reduce((string, part) => string + part(duration.number, duration.unit), '');
    };
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
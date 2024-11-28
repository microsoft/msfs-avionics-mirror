import { Rounding } from '../../math/MathUtils';

/**
 * Options for creating a number formatter.
 */
export type NumberFormatterOptions = {
  /** The precision to which to round the number. A value of 0 denotes no rounding. Defaults to `0`. */
  precision?: number;

  /** Rounding behavior. Defaults to `Rounding.Nearest`. */
  round?: Rounding;

  /**
   * The hysteresis to apply to the formatter. If defined as a `[number, number]` tuple, then the first number in the
   * tuple is taken as the lower hysteresis and second number as the upper hysteresis. If defined as a single number,
   * then that is taken as both the lower and upper hysteresis. Negative values are clamped to zero.
   * 
   * When a previously formatted string exists, any new input number (`x`) is compared to the precision-rounded value
   * of the previously formatted string (`x0`). Define `x1` as the least number that can be rounded to `x0` and `x2` as
   * the greatest number that can be rounded to `x0`. Then the formatter returns a newly formatted string for `x` if
   * and only if `x < x1 - h1` or `x > x2 + h2`, where `h1` and `h2` are the lower and upper hysteresis values,
   * respectively. Otherwise, the formatter returns the previously formatted string.
   */
  hysteresis?: number | readonly [number, number];

  /**
   * The maximum number of digits to enforce. Digits to the _right_ of the decimal point will be omitted (with proper
   * rounding behavior) as necessary until the total number of digits in the output is less than or equal to the value
   * of this option or until there are no more digits to omit. Digits to the _left_ of the decimal point are always
   * preserved, even if it means the number of digits in the output will exceed the value of this option. Defaults to
   * `Infinity`.
   */
  maxDigits?: number;

  /**
   * Whether to force trailing zeroes to the right of the decimal point. The number of trailing zeroes is determined
   * by the `precision` option. Specifically, trailing zeroes are added to the least significant decimal place required
   * to represent the value of `precision` (and therefore, any possible output rounded to `precision`) with no
   * rounding. Defaults to `true`.
   */
  forceDecimalZeroes?: boolean;

  /** The number of digits to which to pad with zeroes to the left of the decimal point. Defaults to `1`. */
  pad?: number;

  /** Whether to show commas. Defaults to `false`. */
  showCommas?: boolean;

  /** Whether to use a minus sign (`−`) in place of a dash (`-`) in front of negative numbers. Defaults to `false`. */
  useMinusSign?: boolean;

  /** Whether to force the display of a positive sign. Ignored if `hideSign` is `true`. Defaults to `false`. */
  forceSign?: boolean;

  /** Whether to hide the display of the positive/negative sign. Overrides `forceSign`. Defaults to `false`. */
  hideSign?: boolean;

  /** The string to output for an input of `NaN`. Defaults to `'NaN'`. */
  nanString?: string;

  /** The string to output for an input of `Infinity`. Defaults to `'Infinity'`. */
  posInfinityString?: string;

  /** The string to output for an input of `-Infinity`. Defaults to `'-Infinity'`. */
  negInfinityString?: string;

  /**
   * Whether to cache and reuse the previously generated string when possible. If a non-zero hysteresis value is
   * specified, then this option is ignored because hysteresis always requires cached values to be used. Defaults to
   * `false`.
   */
  cache?: boolean;
};

/**
 * Options used for formatting numbers, for internal use.
 */
type NumberFormatterOptionsInternal = Omit<Required<NumberFormatterOptions>, 'hysteresis'> & {
  /** The function to use to round the number before formatting. */
  roundFunc: (value: number) => number;

  /**
   * The offset from the previously rounded value to the lower boundary of the range in which a new number should not
   * be formatted to a new output string.
   */
  hysteresisOffsetLower: number;

  /**
   * The offset from the previously rounded value to the upper boundary of the range in which a new number should not
   * be formatted to a new output string.
   */
  hysteresisOffsetUpper: number;

  /** The number used to generate the cached formatted string. */
  cachedNumber?: number;

  /** The cached formatted string. */
  cachedString?: string;
};

/**
 * A utility class for creating number formatters.
 *
 * Each number formatter is a function which generates output strings from input numeric values. The formatting
 * behavior of a formatter is defined by its options. Please refer to the {@link NumberFormatterOptions} type
 * documentation for more information on each individual option.
 */
export class NumberFormatter {
  public static readonly DEFAULT_OPTIONS: Readonly<Required<NumberFormatterOptions>> = {
    precision: 0,
    round: Rounding.Nearest,
    hysteresis: 0,
    maxDigits: Infinity,
    forceDecimalZeroes: true,
    pad: 1,
    showCommas: false,
    useMinusSign: false,
    forceSign: false,
    hideSign: false,
    nanString: 'NaN',
    posInfinityString: 'Infinity',
    negInfinityString: '-Infinity',
    cache: false
  };

  private static readonly TRAILING_ZERO_REGEX = /0+$/;
  private static readonly LEADING_ZERO_REGEX = /^0\./;
  private static readonly COMMAS_REGEX = /\B(?=(\d{3})+(?!\d))/g;

  /**
   * Formats a number to a string.
   * @param number The number to format.
   * @param opts Options describing how to format the number.
   * @returns The formatted string representation of the specified number.
   */
  private static formatNumber(
    number: number,
    opts: NumberFormatterOptionsInternal
  ): string {
    if (isNaN(number)) {
      opts.cachedNumber = undefined;
      opts.cachedString = undefined;
      return opts.nanString;
    } else if (!isFinite(number)) {
      opts.cachedNumber = undefined;
      opts.cachedString = undefined;
      return number > 0 ? opts.posInfinityString : opts.negInfinityString;
    }

    const {
      precision,
      roundFunc,
      hysteresisOffsetLower,
      hysteresisOffsetUpper,
      maxDigits,
      forceDecimalZeroes,
      pad,
      showCommas,
      useMinusSign,
      forceSign,
      hideSign,
      cache
    } = opts;

    if (
      opts.cachedNumber !== undefined
      && opts.cachedString !== undefined
      && (
        hysteresisOffsetLower !== 0 || hysteresisOffsetUpper !== 0
      )
    ) {
      if (opts.round > 0) {
        if (number > opts.cachedNumber + hysteresisOffsetLower && number <= opts.cachedNumber + hysteresisOffsetUpper) {
          return opts.cachedString;
        }
      } else {
        if (number >= opts.cachedNumber + hysteresisOffsetLower && number < opts.cachedNumber + hysteresisOffsetUpper) {
          return opts.cachedString;
        }
      }
    }

    let rounded = number;
    if (precision !== 0) {
      rounded = roundFunc(number / precision) * precision;
    }

    const absRounded = Math.abs(rounded);

    if (cache) {
      if (opts.cachedString !== undefined && opts.cachedNumber === rounded) {
        return opts.cachedString;
      }

      opts.cachedNumber = rounded;
    }

    let formatted: string;

    if (precision !== 0) {
      const precisionString = `${precision}`;
      const decimalIndex = precisionString.indexOf('.');
      if (decimalIndex >= 0) {
        formatted = absRounded.toFixed(precisionString.length - decimalIndex - 1);
      } else {
        formatted = `${absRounded}`;
      }
    } else {
      formatted = `${absRounded}`;
    }

    let decimalIndex = formatted.indexOf('.');
    if (!forceDecimalZeroes && decimalIndex >= 0) {
      formatted = formatted.replace(NumberFormatter.TRAILING_ZERO_REGEX, '');
      if (formatted.indexOf('.') == formatted.length - 1) {
        formatted = formatted.substring(0, formatted.length - 1);
      }
    }

    let needRecalcPadAndMaxDigits = false;
    let calcPadIterCount = 0;
    do {
      decimalIndex = formatted.indexOf('.');

      // Add (or subtract) leading zeroes as necessary.
      if (pad === 0) {
        if (decimalIndex > 0) {
          formatted = formatted.replace(NumberFormatter.LEADING_ZERO_REGEX, '.');
        }
      } else if (pad > 1) {
        if (decimalIndex < 0) {
          decimalIndex = formatted.length;
        }

        if (decimalIndex < pad) {
          formatted = formatted.padStart(pad + formatted.length - decimalIndex, '0');
        }
      }

      // Check if the formatted number exceeds the maximum digit count. If so, reduce the number of digits to the
      // right of the decimal place as necessary.
      decimalIndex = formatted.indexOf('.');
      if (decimalIndex >= 0 && formatted.length - 1 > maxDigits) {
        const desiredRightDigits = Math.max(maxDigits - decimalIndex, 0);
        const shiftPrecision = Math.pow(0.1, desiredRightDigits);
        rounded = roundFunc(rounded / shiftPrecision) * shiftPrecision;
        formatted = Math.abs(rounded).toFixed(desiredRightDigits);

        // Reformatting may change the number of digits to the left of the decimal point required to represent the
        // number. Additionally, reformatting will mess up any left zero-padding we set up earlier. For both reasons,
        // we need to recalculate the padding and number of decimal places again.
        needRecalcPadAndMaxDigits = pad !== 0 || desiredRightDigits > 0;
      } else {
        needRecalcPadAndMaxDigits = false;
      }

      calcPadIterCount++;
    } while (needRecalcPadAndMaxDigits && calcPadIterCount < 2);

    if (showCommas) {
      const parts = formatted.split('.');
      parts[0] = parts[0].replace(NumberFormatter.COMMAS_REGEX, ',');
      formatted = parts.join('.');
    }

    const sign = rounded < 0 ? -1 : 1;
    const signText = sign === -1
      ? useMinusSign ? '−' : '-'
      : '+';

    if (!hideSign && (forceSign || signText !== '+')) {
      formatted = signText + formatted;
    }

    if (cache) {
      opts.cachedString = formatted;
    }

    return formatted;
  }

  /**
   * Resolves an internal options object from a partial options object. Any option not explicitly defined by the
   * partial options object will revert to its default value.
   * @param options A partial options object.
   * @returns A new internal options object containing the full set of options resolved from the specified partial
   * options object.
   */
  private static resolveOptions(options?: Readonly<NumberFormatterOptions>): NumberFormatterOptionsInternal {
    const resolved = {} as Required<NumberFormatterOptions>;

    for (const key in NumberFormatter.DEFAULT_OPTIONS) {
      (resolved as any)[key] = (options as any)?.[key] ?? NumberFormatter.DEFAULT_OPTIONS[key as keyof NumberFormatterOptions];
    }

    let hysteresisLower: number;
    let hysteresisUpper: number;
    if (typeof resolved.hysteresis === 'number') {
      hysteresisLower = hysteresisUpper = Math.max(0, resolved.hysteresis);
    } else {
      hysteresisLower = Math.max(0, resolved.hysteresis[0]);
      hysteresisUpper = Math.max(0, resolved.hysteresis[1]);
    }

    delete (resolved as any).hysteresis;

    const resolvedInt = resolved as unknown as NumberFormatterOptionsInternal;

    if (resolvedInt.round > 0) {
      resolvedInt.roundFunc = Math.ceil;
      resolvedInt.hysteresisOffsetLower = -(resolvedInt.precision + hysteresisLower);
      resolvedInt.hysteresisOffsetUpper = hysteresisUpper;
    } else if (resolvedInt.round < 0) {
      resolvedInt.roundFunc = Math.floor;
      resolvedInt.hysteresisOffsetLower = -hysteresisLower;
      resolvedInt.hysteresisOffsetUpper = resolvedInt.precision + hysteresisUpper;
    } else {
      resolvedInt.roundFunc = Math.round;
      resolvedInt.hysteresisOffsetLower = -(resolvedInt.precision * 0.5 + hysteresisLower);
      resolvedInt.hysteresisOffsetUpper = resolvedInt.precision * 0.5 + hysteresisUpper;
    }

    resolvedInt.cache ||= resolvedInt.hysteresisOffsetLower !== 0 || resolvedInt.hysteresisOffsetUpper !== 0;

    return resolvedInt;
  }

  /**
   * Creates a function which formats numeric values to strings. The formatting behavior of the function can be
   * customized using a number of options. Please refer to the {@link NumberFormatterOptions} type documentation for
   * more information on each individual option.
   * @param options Options with which to customize the formatter.
   * @returns A function which formats numeric values to strings.
   */
  public static create(options?: NumberFormatterOptions): (number: number) => string {
    const optsToUse = NumberFormatter.resolveOptions(options);

    return (number: number): string => {
      return NumberFormatter.formatNumber(number, optsToUse);
    };
  }
}
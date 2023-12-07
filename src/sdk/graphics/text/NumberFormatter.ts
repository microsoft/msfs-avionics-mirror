/**
 * Options for creating a number formatter.
 */
export type NumberFormatterOptions = {
  /** The precision to which to round the number. A value of 0 denotes no rounding. Defaults to `0`. */
  precision?: number;

  /** Rounding behavior. Always round down = `-1`. Always round up = `+1`. Normal rounding = `0`. Defaults to `0`. */
  round?: -1 | 0 | 1;

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

  /** The string to output for an input of NaN. Defaults to `'NaN'`. */
  nanString?: string;

  /** Whether to cache and reuse the previously generated string when possible. Defaults to `false`. */
  cache?: boolean;
};

/**
 * Options used for formatting numbers, for internal use.
 */
type NumberFormatterOptionsInternal = Required<NumberFormatterOptions> & {
  /** The function to use to round the number before formatting. */
  roundFunc: (value: number) => number;

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
    round: 0,
    maxDigits: Infinity,
    forceDecimalZeroes: true,
    pad: 1,
    showCommas: false,
    useMinusSign: false,
    forceSign: false,
    hideSign: false,
    nanString: 'NaN',
    cache: false
  };

  private static readonly roundFuncs = {
    [-1]: Math.floor,
    [0]: Math.round,
    [1]: Math.ceil
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
      return opts.nanString;
    }

    const {
      precision,
      roundFunc,
      maxDigits,
      forceDecimalZeroes,
      pad,
      showCommas,
      useMinusSign,
      forceSign,
      hideSign,
      cache
    } = opts;

    const sign = number < 0 ? -1 : 1;
    const abs = Math.abs(number);
    let rounded = abs;

    if (precision !== 0) {
      rounded = roundFunc(abs / precision) * precision;
    }

    if (cache) {
      if (opts.cachedString !== undefined && opts.cachedNumber === rounded) {
        return opts.cachedString;
      }

      opts.cachedNumber = rounded;
    }

    const signText = sign === -1
      ? useMinusSign ? '−' : '-'
      : '+';
    let formatted: string;

    if (precision != 0) {
      const precisionString = `${precision}`;
      const decimalIndex = precisionString.indexOf('.');
      if (decimalIndex >= 0) {
        formatted = rounded.toFixed(precisionString.length - decimalIndex - 1);
      } else {
        formatted = `${rounded}`;
      }
    } else {
      formatted = `${abs}`;
    }

    let decimalIndex = formatted.indexOf('.');
    if (!forceDecimalZeroes && decimalIndex >= 0) {
      formatted = formatted.replace(NumberFormatter.TRAILING_ZERO_REGEX, '');
      if (formatted.indexOf('.') == formatted.length - 1) {
        formatted = formatted.substring(0, formatted.length - 1);
      }
    }

    decimalIndex = formatted.indexOf('.');
    if (decimalIndex >= 0 && formatted.length - 1 > maxDigits) {
      const shift = Math.max(maxDigits - decimalIndex, 0);
      const shiftPrecision = Math.pow(0.1, shift);
      formatted = (roundFunc(abs / shiftPrecision) * shiftPrecision).toFixed(shift);
    }
    formatted;

    if (pad === 0) {
      formatted = formatted.replace(NumberFormatter.LEADING_ZERO_REGEX, '.');
    } else if (pad > 1) {
      decimalIndex = formatted.indexOf('.');
      if (decimalIndex < 0) {
        decimalIndex = formatted.length;
      }
      formatted = formatted.padStart(pad + formatted.length - decimalIndex, '0');
    }

    if (showCommas) {
      const parts = formatted.split('.');
      parts[0] = parts[0].replace(NumberFormatter.COMMAS_REGEX, ',');
      formatted = parts.join('.');
    }

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
    const resolved = Object.assign({}, options) as NumberFormatterOptionsInternal;

    for (const key in NumberFormatter.DEFAULT_OPTIONS) {
      (resolved as any)[key] ??= NumberFormatter.DEFAULT_OPTIONS[key as keyof NumberFormatterOptions];
    }

    resolved.roundFunc = NumberFormatter.roundFuncs[resolved.round];

    return resolved;
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
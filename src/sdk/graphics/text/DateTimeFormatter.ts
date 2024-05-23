/* eslint-disable max-len */

/**
 * Options for creating a time formatter.
 */
export type DateTimeFormatterOptions = {
  /** Names for months, starting with January. */
  monthNames: [string, string, string, string, string, string, string, string, string, string, string, string];

  /** Abbreviated names for months, starting with January. */
  monthNamesShort: [string, string, string, string, string, string, string, string, string, string, string, string];

  /** Names for days of the week, starting with Sunday. */
  dayNames: [string, string, string, string, string, string, string];

  /** Abbreviated names for days of the week, starting with Sunday. */
  dayNamesShort: [string, string, string, string, string, string, string];

  /** The string to output for an input of `NaN`. */
  nanString: string;

  /** Whether to cache and reuse the previously generated string when possible. */
  cache: boolean;
};

/**
 * A utility class for creating time formatters.
 *
 * Each time formatter is a function which generates output strings from input time values, expressed as UNIX
 * timestamps in milliseconds. The formatting behavior of a formatter is defined by its format template and options.
 *
 * Please refer to the {@link DateTimeFormatterOptions} type documentation for more information on individual
 * formatting options.
 *
 * Format templates are strings which contain zero or more fragments enclosed by curly braces (`{}`); For a given
 * format template, an output string is generated from an input duration by replacing each fragment in the template
 * with a string generated from the input. The parts of the template string that are not contained in any fragment are
 * passed to the output unchanged. Each fragment defines how its replacement string is generated. There are two types
 * of fragments:
 * * Integer fragment. In EBNF notation, these take the form `{x}` where `x = 'M' | 'd' | 'w'`. Each numeric fragment
 * is replaced with an integer representation of the month (`M`), day of month (`d`), or day of week (`w`) part of the
 * input time. The number of `x` characters in the definition controls the number of leading zeroes with which the
 * output will be padded.
 * * Numeric fragment. In EBNF notation, these take the form `{x}, ['?'], ['.', [{x}], ['(', {x}, ')']]` where
 * `x = 'H' | 'h' | 'm' | 's'`. Each numeric fragment is replaced with a numeric representation of the hour-24 (`H`),
 * hour-12 (`h`), minute (`m`), or second (`s`) part of the input time. The number of `x` characters in the definition
 * controls the number of leading zeroes with which the output will be padded. If the optional `'?'` character is
 * present, the output will drop all digits to the left of the decimal point if all such digits are equal to 0. The
 * total number of `x` characters to the right of the decimal point in the definition controls the decimal precision of
 * the output. Trailing zeroes to the right of the decimal point will be added to the output to a number of decimal
 * places equal to the number of non-parenthetical `x` characters to the right of the decimal point in the definition.
 * If there are no `x` characters to the right of the decimal point in the definition, then the output will have
 * infinite decimal precision with no extraneous trailing zeroes. Rounding behavior is always round down.
 * * Year fragment. In EBNF notation, these take the form `'YY' | 'YYYY'`. Each year fragment is replaced with either
 * the two-digit (`YY`) or unlimited-digit (`YYYY`) year of the input time.
 * * Month fragment. In EBNF notation, these take the form `('mon', ['.']) | ('MON', ['.']) | 'month' | 'MONTH'`. Each
 * month fragment is replaced with the name of the month of the input time. The case of the definition determines the
 * case of the output. `mon` will use abbreviated names. The presence of the optional `'.'` character will add a period
 * to the end of the abbreviated names.
 * * Day-of-week fragment. In EBNF notation, these take the form `('dy', ['.']) | ('DY', ['.']) | 'day' | 'DAY'`. Each
 * day-of-week fragment is replaced with the name of the day-of-week of the input time. The case of the definition
 * determines the case of the output. `dy` will use abbreviated names. The presence of the optional `'.'` character
 * will add a period to the end of the abbreviated names.
 * * AM/PM fragment. In EBNF notation, these take the form `'am' | 'a.m.' | 'AM' | 'A.M.'`. Each AM/PM fragment is
 * replaced with an AM/PM string depending on the time of day of the input. The case of the definition determines the
 * case of the output. Use of periods in the definition will add periods to the output.
 *
 * @example <caption>Formatting to a date</caption>
 * const formatter = DateTimeFormatter.create('{dd}-{MM}-{YY}');
 * formatter(0);              // 01-01-70
 * formatter(1597723200000);  // 18-08-20
 *
 * @example <caption>Formatting to a time (24-hr)</caption>
 * const formatter = DateTimeFormatter.create('{HH}:{mm}:{ss}');
 * formatter(0);              // 00:00:00
 * formatter(5145000);        // 01:25:45
 * formatter(57600000);       // 16:00:00
 *
 * @example <caption>Formatting to a time (12-hr)</caption>
 * const formatter = DateTimeFormatter.create('{hh}:{mm}:{ss} {am}');
 * formatter(0);              // 12:00:00 am
 * formatter(5145000);        // 01:25:45 am
 * formatter(57600000);       // 04:00:00 pm
 *
 * @example <caption>Formatting to a time with decimals</caption>
 * const formatter = DateTimeFormatter.create('{H}:{mm.m(m)}');
 * formatter(0);              // 0:00.0
 * formatter(5145000);        // 1:25.75
 *
 * @example <caption>Formatting to ISO 8601</caption>
 * const formatter = DateTimeFormatter.create('{YYYY}-{MM}-{dd}T{HH}:{mm}:{ss}');
 * formatter(0);              // 1970-01-01T00:00:00
 * formatter(1597723200000);  // 2020-08-18T04:00:00
 */
export class DateTimeFormatter {
  private static readonly FORMAT_REGEXP = /({[^{}]*})/;
  private static readonly FRAGMENT_REGEXP = /^(?:(([Mdw])\2*)|((([Hhms])\5*)(\?)?(?:(\.(\5*)(?:\((\5+)\))?)?))|(YY|YYYY)|(mon\.?|month|MON\.?|MONTH)|(dy\.?|day|DY\.?|DAY)|(am|AM|a\.m\.|A\.M\.))$/;

  private static readonly INT_GETTERS: Record<string, (date: Date) => number> = {
    ['w']: (date: Date) => date.getUTCDay() + 1,
    ['d']: (date: Date) => date.getUTCDate(),
    ['M']: (date: Date) => date.getUTCMonth() + 1
  };

  private static readonly NUM_GETTERS: Record<string, (date: Date) => number> = {
    ['s']: (date: Date) => date.getUTCSeconds(),
    ['m']: (date: Date) => date.getUTCMinutes(),
    ['h']: (date: Date) => 12 - (24 - date.getUTCHours()) % 12,
    ['H']: (date: Date) => date.getUTCHours()
  };
  private static readonly NUM_FRACTION_GETTERS: Record<string, (date: Date) => number> = {
    ['s']: (date: Date) => (date.getTime() % 1000) / 1000,
    ['m']: (date: Date) => (date.getTime() % 60000) / 60000,
    ['h']: (date: Date) => (date.getTime() % 3600000) / 3600000,
    ['H']: (date: Date) => (date.getTime() % 3600000) / 3600000
  };

  public static readonly DEFAULT_OPTIONS: Readonly<DateTimeFormatterOptions> = {
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

    nanString: 'NaN',

    cache: false
  };

  /**
   * Creates a function which formats times, expressed as UNIX timestamps in milliseconds, to strings. The formatting
   * behavior of the function is defined by a specified format template and options. For more information on format
   * templates and their syntax, please refer to the {@link DateTimeFormatter} class documentation. For more
   * information on individual formatting options, please refer to the {@link DateTimeFormatterOptions} type
   * documentation.
   * @param format A template defining how the function formats durations.
   * @param options Options to customize the formatter. Options not explicitly defined will be set to the following
   * default values:
   * * `monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']`
   * * `monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']`
   * * `dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']`
   * * `dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']`
   * * `nanString = 'NaN'`
   * @returns A function which formats times, expressed as UNIX timestamps in milliseconds, to strings.
   */
  public static create(format: string, options?: Readonly<Partial<DateTimeFormatterOptions>>): (time: number) => string {
    const optsToUse = this.resolveOptions(options);
    const builder = DateTimeFormatter.createBuilder(format, optsToUse);
    const date = new Date();

    const built = Array.from(builder, () => '');

    if (optsToUse.cache) {
      let cachedInput: number | undefined = undefined;
      let cachedOutput: string | undefined = undefined;

      return (time: number): string => {
        if (isNaN(time)) {
          return optsToUse.nanString;
        }

        const roundedInput = Math.floor(time);

        if (cachedInput !== undefined && cachedOutput !== undefined && roundedInput === cachedInput) {
          return cachedOutput;
        }

        cachedInput = roundedInput;

        date.setTime(roundedInput);

        for (let i = 0; i < builder.length; i++) {
          built[i] = builder[i](date);
        }

        return cachedOutput = built.join('');
      };
    } else {
      return (time: number): string => {
        if (isNaN(time)) {
          return optsToUse.nanString;
        }

        date.setTime(Math.floor(time));

        for (let i = 0; i < builder.length; i++) {
          built[i] = builder[i](date);
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
  private static resolveOptions(options?: Readonly<Partial<DateTimeFormatterOptions>>): DateTimeFormatterOptions {
    const resolved = Object.assign({}, options) as any;

    for (const key in DateTimeFormatter.DEFAULT_OPTIONS) {
      resolved[key] ??= DateTimeFormatter.DEFAULT_OPTIONS[key as keyof DateTimeFormatterOptions];
    }

    return resolved;
  }

  /**
   * Creates an output string builder from a format template and options.
   * @param format A format template.
   * @param options Formatting options.
   * @returns An output string builder which conforms to the specified format template and options.
   */
  private static createBuilder(format: string, options: DateTimeFormatterOptions): ((time: Date) => string)[] {
    const split = format.split(DateTimeFormatter.FORMAT_REGEXP);

    return split.map((string): (time: Date) => string => {
      if (string.match(DateTimeFormatter.FORMAT_REGEXP)) {
        return DateTimeFormatter.parseFragment(string.substring(1, string.length - 1), options);
      } else {
        return (): string => string;
      }
    });
  }

  /**
   * Parses a format template fragment and returns a function which generates a string from an input time according
   * to the rules defined by the fragment. If the fragment is malformed, this method returns a function which always
   * generates an empty string.
   * @param fragment A format template fragment definition.
   * @param options Formatting options.
   * @returns A function which generates a string from an input time, expressed as a UNIX timestamp in milliseconds,
   * according to the rules defined by the template fragment.
   */
  private static parseFragment(fragment: string, options: DateTimeFormatterOptions): (duration: Date) => string {
    const match = fragment.match(DateTimeFormatter.FRAGMENT_REGEXP);

    if (match) {
      if (match[1]) {
        return DateTimeFormatter.parseIntFragment(match);
      } else if (match[3]) {
        return DateTimeFormatter.parseNumFragment(match);
      } else if (match[10]) {
        return DateTimeFormatter.parseYearFragment(match);
      } else if (match[11]) {
        return DateTimeFormatter.parseMonthFragment(match, options);
      } else if (match[12]) {
        return DateTimeFormatter.parseDayFragment(match, options);
      } else if (match[13]) {
        return DateTimeFormatter.parseAMPMFragment(match);
      }
    }

    console.warn(`DateTimeFormatter: discarding fragment due to invalid syntax: {${fragment}}`);
    return (): string => '';
  }

  /**
   * Parses an integer template fragment and returns a function which generates a string from an input time according
   * to the rules defined by the fragment.
   * @param match An integer template fragment, as a regular expression match.
   * @returns A function which generates a string from an input time, expressed as a UNIX timestamp in milliseconds,
   * according to the rules defined by the integer template fragment.
   */
  private static parseIntFragment(match: RegExpMatchArray): (date: Date) => string {
    const [
      /* 0 */,
      fragmentMatch,          // Matches the full fragment
      unitMatch               // Matches the unit char ('M', 'd', 'w')
    ] = match;

    const intGetter = DateTimeFormatter.INT_GETTERS[unitMatch as keyof typeof DateTimeFormatter.INT_GETTERS];
    const pad = fragmentMatch.length;

    return (date: Date): string => {
      return intGetter(date).toString().padStart(pad, '0');
    };
  }

  /**
   * Parses a numeric template fragment and returns a function which generates a string from an input time according
   * to the rules defined by the fragment.
   * @param match A numeric template fragment, as a regular expression match.
   * @returns A function which generates a string from an input time, expressed as a UNIX timestamp in milliseconds,
   * according to the rules defined by the numeric template fragment.
   */
  private static parseNumFragment(match: RegExpMatchArray): (date: Date) => string {
    const [
      /* 0 */, /* 1 */, /* 2 */, /* 3 */,
      leftMatch,              // Matches unit chars to the left of the decimal point
      unitMatch,              // Matches the unit char ('h', 'm', 's', etc)
      leftOptionalMatch,      // Matches the question mark just to the left of the decimal point
      rightMatch,             // Matches the decimal point and all chars to the right
      rightForcedMatch,       // Matches unit chars to the right of the decimal point not surrounded by parens
      rightOptionalMatch      // Matches unit chars to the right of the decimal point surrounded by parens
    ] = match;

    const numGetter = DateTimeFormatter.NUM_GETTERS[unitMatch as keyof typeof DateTimeFormatter.NUM_GETTERS];
    const numFractionGetter = DateTimeFormatter.NUM_FRACTION_GETTERS[unitMatch as keyof typeof DateTimeFormatter.NUM_FRACTION_GETTERS];
    const pad = leftMatch.length;
    const dropZero = !!leftOptionalMatch;

    const formatLeftFunc = dropZero
      ? (
        (date: Date): string => {
          const num = numGetter(date);
          return num === 0 ? '' : num.toString().padStart(pad, '0');
        }
      ) : (
        (date: Date): string => numGetter(date).toString().padStart(pad, '0')
      );

    if (rightMatch) {
      if (rightMatch.length === 1) {
        // Unlimited decimal precision
        return (date: Date): string => {
          return `${formatLeftFunc(date)}${numFractionGetter(date).toString().substring(1)}`;
        };
      }

      const forcedDecimalPlaces = rightForcedMatch?.length ?? 0;
      const unforcedDecimalPlaces = rightOptionalMatch?.length ?? 0;
      const totalDecimalPlaces = forcedDecimalPlaces + unforcedDecimalPlaces;

      const factor = Math.pow(10, totalDecimalPlaces);

      return (date: Date): string => {
        const decimal = numFractionGetter(date);
        const decimalRounded = Math.floor(decimal * factor) / factor;

        return `${formatLeftFunc(date)}.${decimalRounded.toString().substring(2).padEnd(forcedDecimalPlaces, '0')}`;
      };
    } else {
      return formatLeftFunc;
    }
  }

  /**
   * Parses a year template fragment and returns a function which generates a string from an input time according
   * to the rules defined by the fragment.
   * @param match A year template fragment, as a regular expression match.
   * @returns A function which generates a string from an input time, expressed as a UNIX timestamp in milliseconds,
   * according to the rules defined by the year template fragment.
   */
  private static parseYearFragment(match: RegExpMatchArray): (date: Date) => string {
    if (match[10].length === 2) {
      // YY
      return (date: Date): string => (date.getUTCFullYear() % 100).toString().padStart(2, '0');
    } else {
      // YYYY
      return (date: Date): string => date.getUTCFullYear().toString();
    }
  }

  /**
   * Parses a month template fragment and returns a function which generates a string from an input time according
   * to the rules defined by the fragment.
   * @param match A month template fragment, as a regular expression match.
   * @param options Formatting options.
   * @returns A function which generates a string from an input time, expressed as a UNIX timestamp in milliseconds,
   * according to the rules defined by the month template fragment.
   */
  private static parseMonthFragment(match: RegExpMatchArray, options: DateTimeFormatterOptions): (date: Date) => string {
    const fragmentMatch = match[11];

    const isUpperCase = fragmentMatch[0] === 'M';

    if (fragmentMatch.length === 3) {
      // mon
      const text = isUpperCase ? options.monthNamesShort.map(str => str.toUpperCase()) : options.monthNamesShort;

      return (date: Date): string => text[date.getUTCMonth()];
    } else if (fragmentMatch.length === 4) {
      // mon.
      const text = isUpperCase ? options.monthNamesShort.map(str => str.toUpperCase()) : options.monthNamesShort;

      return (date: Date): string => {
        const month = date.getUTCMonth();
        return `${text[month]}${options.monthNamesShort[month] === options.monthNames[month] ? '' : '.'}`;
      };
    } else {
      // month
      const text = isUpperCase ? options.monthNames.map(str => str.toUpperCase()) : options.monthNames;

      return (date: Date): string => text[date.getUTCMonth()];
    }
  }

  /**
   * Parses a day-of-week template fragment and returns a function which generates a string from an input time
   * according to the rules defined by the fragment.
   * @param match A day-of-week template fragment, as a regular expression match.
   * @param options Formatting options.
   * @returns A function which generates a string from an input time, expressed as a UNIX timestamp in milliseconds,
   * according to the rules defined by the day-of-week template fragment.
   */
  private static parseDayFragment(match: RegExpMatchArray, options: DateTimeFormatterOptions): (date: Date) => string {
    const fragmentMatch = match[12];

    const isUpperCase = fragmentMatch[0] === 'D';

    if (fragmentMatch === 'dy') {
      const text = isUpperCase ? options.dayNamesShort.map(str => str.toUpperCase()) : options.dayNamesShort;

      return (date: Date): string => text[date.getUTCDay()];
    } else if (fragmentMatch === 'dy.') {
      const text = isUpperCase ? options.dayNamesShort.map(str => str.toUpperCase()) : options.dayNamesShort;

      return (date: Date): string => {
        const day = date.getUTCDay();
        return `${text[day]}${options.dayNamesShort[day] === options.dayNames[day] ? '' : '.'}`;
      };
    } else {
      // day
      const text = isUpperCase ? options.dayNames.map(str => str.toUpperCase()) : options.dayNames;

      return (date: Date): string => text[date.getUTCDay()];
    }
  }

  /**
   * Parses an am/pm template fragment and returns a function which generates a string from an input time according
   * to the rules defined by the fragment.
   * @param match An am/pm template fragment, as a regular expression match.
   * @returns A function which generates a string from an input time, expressed as a UNIX timestamp in milliseconds,
   * according to the rules defined by the am/pm template fragment.
   */
  private static parseAMPMFragment(match: RegExpMatchArray): (date: Date) => string {
    const fragmentMatch = match[13];

    const isUpperCase = fragmentMatch[0] === 'A';
    const usePeriod = fragmentMatch.length > 2;

    let text = usePeriod ? ['a.m.', 'p.m.'] : ['am', 'pm'];
    if (isUpperCase) {
      text = text.map(str => str.toUpperCase());
    }

    return (date: Date): string => text[Math.floor(date.getUTCHours() / 12)];
  }
}

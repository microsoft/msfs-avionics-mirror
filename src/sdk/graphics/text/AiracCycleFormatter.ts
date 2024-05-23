import { AiracCycle } from '../../navigation/AiracUtils';
import { DateTimeFormatter } from './DateTimeFormatter';

/** Fragment helper. */
type AiracFormatFragment = string | ((cycle: AiracCycle) => string);

/** An AIRAC cycle formatter function. */
export type AiracCycleFormatterFunction = (cycle: AiracCycle) => string;

/** A utility class for creating AIRAC cycle formatters. */
export class AiracCycleFormatter {
  private static readonly FORMAT_REGEXP = /({(?:(?:(?:eff|exp|expMinus)\((?:[^()]*)\))|[^{}]*)})/;

  private static readonly FRAGMENT_DATE_REGEXP = /(eff|exp|expMinus)\(([^()]*)\)/;

  private static dateFormatterCache = new Map<string, (time: number) => string>();

  /** Disable the ctor. */
  private constructor() {}

  /**
   * Creates a new AIRAC cycle formatter.
   * @param format The format to use, with the following possible items to be replaced:
   * - `{CC}`: is replaced with the 2-digit cycle number e.g. 01,
   * - `{YYCC}`: is replaced with the 4-digit cycle number, including the effective year and the cycle number e.g. 2401,
   * - `{eff(dateTimeFormat)}`: is replaced by the effective date,
   * formatted by {@link DateTimeFormatter} with the given `dateTimeFormat`,
   * - `{exp(dateTimeFormat)}`: is replaced by the expiration date,
   * formatted by {@link DateTimeFormatter} with the given `dateTimeFormat`,
   * - `{expMinus(dateTimeFormat)}`: is replaced by the expiration date minus one second (i.e. 1 second before midnight the previous day),
   * formatted by {@link DateTimeFormatter} with the given `dateTimeFormat`.
   *
   * Note: Some avionics use `exp` (overlapping dates) while others use `expMinus` (non-overlapping dates) for the expiration dates.\
   * Make sure to check what yours should do.
   * @example The format `{YYCC} {eff({dd}-{MON})}/{exp({dd}-{MON})}` gives "2309 07-SEP/05-OCT" for AIRAC cycle 2309.
   * @example The format `{YYCC} {eff({dd}-{MON})}/{expMinus({dd}-{MON})}` gives "2309 07-SEP/04-OCT" for AIRAC cycle 2309.
   * @throws If the format is invalid, an exception will be thrown.
   * @returns The formatter function.
   */
  public static create(format: string): AiracCycleFormatterFunction {
    const split = format.split(AiracCycleFormatter.FORMAT_REGEXP);

    const formatFragments: (AiracFormatFragment)[] = split.map((string): AiracFormatFragment => {
      if (string.match(AiracCycleFormatter.FORMAT_REGEXP)) {
        return AiracCycleFormatter.parseFragment(string.substring(1, string.length - 1));
      } else {
        return string;
      }
    });

    return (cycle) => formatFragments.map((f) => typeof f === 'function' ? f(cycle) : f).join('');
  }

  /**
   * Parses a fragment into a function that resolves it to a string.
   * @param string The format fragment.
   * @returns The resolver function.
   * @throws When the fragment is invalid.
   */
  private static parseFragment(string: string): AiracFormatFragment {
    const match = string.match(this.FRAGMENT_DATE_REGEXP);

    if (match !== null) {
      // this is a date fragment
      const dateType = match[1];
      const dateFormat = match[2];
      const dateFormatter = AiracCycleFormatter.dateFormatterCache.get(dateFormat)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ?? AiracCycleFormatter.dateFormatterCache.set(dateFormat, DateTimeFormatter.create(dateFormat)).get(dateFormat)!;

      switch (dateType) {
        case 'eff':
          return (cycle) => dateFormatter(cycle.effectiveTimestamp);
        case 'exp':
          return (cycle) => dateFormatter(cycle.expirationTimestamp);
        case 'expMinus':
          return (cycle) => dateFormatter(cycle.expirationTimestamp - 1000);
        default:
      }
    } else {
      // this is a cycle number fragment
      switch (string) {
        case 'CC':
          return (cycle) => cycle.cycleString;
        case 'YYCC':
          return (cycle) => cycle.ident;
        default:
      }
    }

    throw new Error(`AiracCycleFormatter: Invalid format fragment '{${string}}'!`);
  }
}

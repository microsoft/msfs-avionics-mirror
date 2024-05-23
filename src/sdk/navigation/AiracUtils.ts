/** Metadata about a navigation database AIRAC cycle. */
export interface AiracCycle {
  /**
   * The AIRAC cycle number in the form YYCC,
   * where YY is the last two digits of the effective year,
   * and CC is the cycle number in that year.
   */
  ident: string;
  /** The cycle number in the effective year. */
  cycle: number;
  /** The cycle number in the effective year as a 2 digit string. */
  cycleString: string;
  /**
   * The timestamp on which the cycle becomes effective, in milliseconds since the UNIX epoch.
   *
   * This is midnight UTC at the beginning of the first effective day,
   * and is the same as the expiration of the previous cycle.
   */
  effectiveTimestamp: number;
  /**
   * The timestamp on which the cycle becomes expires, in milliseconds since the UNIX epoch.
   *
   * This is midnight UTC at the beginning of the first effective day of the next cycle,
   * and is the same as the effective timestamp of the next cycle.
   *
   * Note: Some avionics display the day before as the expiration date, so be sure to check what
   * yours should do.
   */
  expirationTimestamp: number;
}

/** Utilities for AIRAC cycles. */
export class AiracUtils {
  private static dateCache = new Date();

  /** Duration of an AIRAC cycle (28 days) in milliseconds. */
  public static readonly CYCLE_DURATION = 86400_000 * 28;

  private static readonly MSFS_DATE_RANGE_REGEX = /([A-Z]{3})(\d\d?)([A-Z]{3})(\d\d?)\/(\d\d)/;
  // Reference cycle to allow us to calculate the current cycle for an arbitrary date (2401, effective 25 JAN 2024).
  private static readonly DATUM_CYCLE_TIMESTAMP = Date.UTC(2024, 0, 25);

  /**
   * Parses the MSFS facility database effective dates into an AIRAC cycle.
   * @param facilitiesDateRange The MSFS facilities date range from the game var `FLIGHT NAVDATA DATE RANGE`.
   * @param out An optional object to write the result to. If not specified a new object will be used.
   * @returns The AIRAC cycle information for the MSFS facility database, or undefined if an error occurs.
   */
  public static parseFacilitiesCycle(facilitiesDateRange: string, out?: Partial<AiracCycle>): AiracCycle | undefined {
    const match = facilitiesDateRange.match(AiracUtils.MSFS_DATE_RANGE_REGEX);
    if (match === null) {
      console.warn('AiracUtils: Failed to parse facilitiesDateRange', facilitiesDateRange);
      return undefined;
    }

    const [, effMonth, effDay, expMonth, expDay, expYear] = match;

    const effDate = new Date(`${effMonth}-${effDay}-${expYear} UTC`);
    const expDate = new Date(`${expMonth}-${expDay}-${expYear} UTC`);

    // We need to work around a bug where the sim gives the year of the expiration date rather than the effective date.
    if (effDate.getTime() > expDate.getTime()) {
      effDate.setUTCFullYear(effDate.getUTCFullYear() - 1);
    }

    const effectiveTimestamp = effDate.getTime();

    const result: Partial<AiracCycle> = out !== undefined ? out : {};
    return AiracUtils.fillCycleFromEffectiveTimestamp(effectiveTimestamp, result);
  }

  /**
   * Gets a cycle offset from another cycle in increments of 28-days (the length of an AIRAC cycle).
   * @param baseCycle The base cycle to offset from.
   * @param offset The offset in number of cycles (i.e. 28-day increments).
   * @param out An optional object to write the result to. If not specified a new object will be used.
   * @returns The AIRAC cycle information.
   */
  public static getOffsetCycle(baseCycle: AiracCycle, offset: number, out?: Partial<AiracCycle>): AiracCycle {
    const effectiveTimestamp = baseCycle.effectiveTimestamp + offset * AiracUtils.CYCLE_DURATION;

    const result: Partial<AiracCycle> = out !== undefined ? out : {};
    return AiracUtils.fillCycleFromEffectiveTimestamp(effectiveTimestamp, result);
  }

  /**
   * Gets the AIRAC cycle number in the effective year, given the effective date.
   * @param effectiveTimestamp The effective timestamp, in milliseconds since the UNIX epoch, to determine the cycle number for.
   * @returns The cycle number.
   */
  public static getCycleNumber(effectiveTimestamp: number): number {
    AiracUtils.dateCache.setTime(effectiveTimestamp);

    const january1 = Date.UTC(AiracUtils.dateCache.getUTCFullYear(), 0, 1);
    const january1Delta = effectiveTimestamp - january1;
    return Math.trunc(january1Delta / AiracUtils.CYCLE_DURATION) + 1;
  }

  /**
   * Gets the current cycle for a given date.
   * @param date The date to determine the current cycle for.
   * @param out An optional object to write the result to. If not specified a new object will be used.
   * @returns The AIRAC cycle information.
   */
  public static getCurrentCycle(date: Date, out?: Partial<AiracCycle>): AiracCycle {
    const datumDelta = date.getTime() - AiracUtils.DATUM_CYCLE_TIMESTAMP;
    const offset = Math.floor(datumDelta / AiracUtils.CYCLE_DURATION);
    const effectiveTimestamp = AiracUtils.DATUM_CYCLE_TIMESTAMP + offset * AiracUtils.CYCLE_DURATION;

    const result: Partial<AiracCycle> = out !== undefined ? out : {};
    return AiracUtils.fillCycleFromEffectiveTimestamp(effectiveTimestamp, result);
  }

  /**
   * Fills an {@link AiracCycle} object given an effective timestamp.
   * @param effectiveTimestamp The time this cycle becomes effective in milliseonds since the UNIX epoch.
   * @param out The output object.
   * @returns The object passed as `out` with all the data filled.
   */
  private static fillCycleFromEffectiveTimestamp(effectiveTimestamp: number, out: Partial<AiracCycle>): AiracCycle {
    AiracUtils.dateCache.setTime(effectiveTimestamp);

    out.effectiveTimestamp = effectiveTimestamp;
    out.expirationTimestamp = effectiveTimestamp + AiracUtils.CYCLE_DURATION;
    out.cycle = AiracUtils.getCycleNumber(effectiveTimestamp);
    out.cycleString = out.cycle.toString().padStart(2, '0');
    out.ident = `${(AiracUtils.dateCache.getUTCFullYear() % 100).toString().padStart(2, '0')}${out.cycleString}`;

    return out as AiracCycle;
  }
}

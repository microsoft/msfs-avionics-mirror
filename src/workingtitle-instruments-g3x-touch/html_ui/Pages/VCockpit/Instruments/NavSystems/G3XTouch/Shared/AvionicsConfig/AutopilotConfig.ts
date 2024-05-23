import { Config } from '../Config/Config';

/**
 * Options for the autopilot ROL director.
 */
export type AutopilotRollOptions = {
  /** The minimum supported bank angle, in degrees. */
  minBankAngle: number;

  /** The maximum supported bank angle, in degrees. */
  maxBankAngle: number;
};

/**
 * Options for the autopilot HDG director.
 */
export type AutopilotHdgOptions = {
  /** The maximum supported bank angle, in degrees. */
  maxBankAngle: number;
};

/**
 * Options for the autopilot VOR director.
 */
export type AutopilotVorOptions = {
  /** The maximum supported bank angle, in degrees. */
  maxBankAngle: number;
};

/**
 * Options for the autopilot LOC director.
 */
export type AutopilotLocOptions = {
  /** The maximum supported bank angle, in degrees. */
  maxBankAngle: number;
};

/**
 * Options for the autopilot LNAV director.
 */
export type AutopilotLNavOptions = {
  /** The maximum supported bank angle, in degrees. */
  maxBankAngle: number;
};

/**
 * Options for the autopilot Low Bank Mode.
 */
export type AutopilotLowBankOptions = {
  /** The maximum supported bank angle, in degrees. */
  maxBankAngle: number;
};

/**
 * A configuration object which defines options related to the autopilot.
 */
export class AutopilotConfig implements Config {
  private static readonly DEFAULT_ROLL_MIN_BANK_ANGLE = 6;
  private static readonly DEFAULT_MAX_BANK_ANGLE = 25;
  private static readonly DEFAULT_LOW_BANK_ANGLE = 15;

  /** Options for the autopilot ROL director. */
  public readonly rollOptions: AutopilotRollOptions;

  /** Options for the autopilot HDG director. */
  public readonly hdgOptions: AutopilotHdgOptions;

  /** Options for the autopilot VOR director. */
  public readonly vorOptions: AutopilotVorOptions;

  /** Options for the autopilot LOC director. */
  public readonly locOptions: AutopilotLocOptions;

  /** Options for the autopilot GPS/FMS director. */
  public readonly lnavOptions: AutopilotLNavOptions;

  /** Options for the autopilot Low Bank Mode. */
  public readonly lowBankOptions: AutopilotLowBankOptions;

  /**
   * Creates a new AutopilotConfig from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   */
  constructor(baseInstrument: BaseInstrument, element: Element) {
    if (element.tagName !== 'Autopilot') {
      throw new Error(`Invalid AutopilotConfig definition: expected tag name 'Autopilot' but was '${element.tagName}'`);
    }

    this.rollOptions = this.parseRollOptions(element.querySelector(':scope>ROL'));
    this.hdgOptions = this.parseHdgOptions(element.querySelector(':scope>HDG'));
    this.vorOptions = this.parseVorOptions(element.querySelector(':scope>VOR'));
    this.locOptions = this.parseLocOptions(element.querySelector(':scope>LOC'));
    this.lnavOptions = this.parseLNavOptions(element.querySelector(':scope>FMS'));
    this.lowBankOptions = this.parseLowBankOptions(element.querySelector(':scope>LowBank'));
  }

  /**
   * Parses ROL director options from a configuration document element.
   * @param element A configuration document element.
   * @returns The ROL director options defined by the configuration document element.
   */
  private parseRollOptions(element: Element | null): AutopilotRollOptions {
    if (element !== null) {
      let minBankAngle = Number(element.getAttribute('min-bank') ?? undefined);
      if (isNaN(minBankAngle) || minBankAngle < 0) {
        console.warn('Invalid AutopilotConfig definition: missing or unrecognized min-bank value (expected a non-negative number)');
        minBankAngle = AutopilotConfig.DEFAULT_ROLL_MIN_BANK_ANGLE;
      }

      let maxBankAngle = Number(element.getAttribute('max-bank') ?? undefined);
      if (isNaN(maxBankAngle) || maxBankAngle < 0) {
        console.warn('Invalid AutopilotConfig definition: missing or unrecognized max-bank value (expected a non-negative number)');
        maxBankAngle = AutopilotConfig.DEFAULT_MAX_BANK_ANGLE;
      }

      return { minBankAngle, maxBankAngle };
    }

    return { minBankAngle: AutopilotConfig.DEFAULT_ROLL_MIN_BANK_ANGLE, maxBankAngle: AutopilotConfig.DEFAULT_MAX_BANK_ANGLE };
  }

  /**
   * Parses HDG director options from a configuration document element.
   * @param element A configuration document element.
   * @returns The HDG director options defined by the configuration document element.
   */
  private parseHdgOptions(element: Element | null): AutopilotHdgOptions {
    if (element !== null) {
      let maxBankAngle = Number(element.getAttribute('max-bank') ?? undefined);
      if (isNaN(maxBankAngle) || maxBankAngle < 0) {
        console.warn('Invalid AutopilotConfig definition: missing or unrecognized max-bank value (expected a non-negative number)');
        maxBankAngle = AutopilotConfig.DEFAULT_MAX_BANK_ANGLE;
      }

      return { maxBankAngle };
    }

    return { maxBankAngle: AutopilotConfig.DEFAULT_MAX_BANK_ANGLE };
  }

  /**
   * Parses VOR director options from a configuration document element.
   * @param element A configuration document element.
   * @returns The VOR director options defined by the configuration document element.
   */
  private parseVorOptions(element: Element | null): AutopilotVorOptions {
    if (element !== null) {
      let maxBankAngle = Number(element.getAttribute('max-bank') ?? undefined);
      if (isNaN(maxBankAngle) || maxBankAngle < 0) {
        console.warn('Invalid AutopilotConfig definition: missing or unrecognized max-bank value (expected a non-negative number)');
        maxBankAngle = AutopilotConfig.DEFAULT_MAX_BANK_ANGLE;
      }

      return { maxBankAngle };
    }

    return { maxBankAngle: AutopilotConfig.DEFAULT_MAX_BANK_ANGLE };
  }

  /**
   * Parses LOC director options from a configuration document element.
   * @param element A configuration document element.
   * @returns The LOC director options defined by the configuration document element.
   */
  private parseLocOptions(element: Element | null): AutopilotLocOptions {
    if (element !== null) {
      let maxBankAngle = Number(element.getAttribute('max-bank') ?? undefined);
      if (isNaN(maxBankAngle) || maxBankAngle < 0) {
        console.warn('Invalid AutopilotConfig definition: missing or unrecognized max-bank value (expected a non-negative number)');
        maxBankAngle = AutopilotConfig.DEFAULT_MAX_BANK_ANGLE;
      }

      return { maxBankAngle };
    }

    return { maxBankAngle: AutopilotConfig.DEFAULT_MAX_BANK_ANGLE };
  }

  /**
   * Parses HDG director options from a configuration document element.
   * @param element A configuration document element.
   * @returns The HDG director options defined by the configuration document element.
   */
  private parseLNavOptions(element: Element | null): AutopilotLNavOptions {
    if (element !== null) {
      let maxBankAngle = Number(element.getAttribute('max-bank') ?? undefined);
      if (isNaN(maxBankAngle) || maxBankAngle < 0) {
        console.warn('Invalid AutopilotConfig definition: missing or unrecognized max-bank value (expected a non-negative number)');
        maxBankAngle = AutopilotConfig.DEFAULT_MAX_BANK_ANGLE;
      }

      return { maxBankAngle };
    }

    return { maxBankAngle: AutopilotConfig.DEFAULT_MAX_BANK_ANGLE };
  }

  /**
   * Parses Low Bank Mode options from a configuration document element.
   * @param element A configuration document element.
   * @returns The Low Bank Mode options defined by the configuration document element.
   */
  private parseLowBankOptions(element: Element | null): AutopilotLowBankOptions {
    if (element !== null) {
      let maxBankAngle = Number(element.getAttribute('max-bank') ?? undefined);
      if (isNaN(maxBankAngle) || maxBankAngle < 0) {
        console.warn('Invalid AutopilotConfig definition: missing or unrecognized max-bank value (expected a non-negative number)');
        maxBankAngle = AutopilotConfig.DEFAULT_MAX_BANK_ANGLE;
      }

      return { maxBankAngle };
    }

    return { maxBankAngle: AutopilotConfig.DEFAULT_LOW_BANK_ANGLE };
  }
}
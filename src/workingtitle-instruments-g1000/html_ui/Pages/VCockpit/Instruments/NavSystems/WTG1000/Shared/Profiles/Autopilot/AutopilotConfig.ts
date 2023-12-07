import { Config } from '../../Config/Config';

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

  /**
   * Whether `AP_ALT_VAR_SET` events should be treated as `AP_ALT_VAR_INC`/`AP_ALT_VAR_DEC` events for compatibility
   * with ModelBehaviors that transform the latter into the former.
   */
  public readonly supportAltSelCompatibility: boolean;

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

  /** Whether HDG sync mode is supported. */
  public readonly isHdgSyncModeSupported: boolean;

  /**
   * Creates a new AutopilotConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element | undefined) {
    if (element === undefined) {
      this.supportAltSelCompatibility = true;

      this.rollOptions = { minBankAngle: AutopilotConfig.DEFAULT_ROLL_MIN_BANK_ANGLE, maxBankAngle: AutopilotConfig.DEFAULT_MAX_BANK_ANGLE };
      this.hdgOptions = { maxBankAngle: AutopilotConfig.DEFAULT_MAX_BANK_ANGLE };
      this.vorOptions = { maxBankAngle: AutopilotConfig.DEFAULT_MAX_BANK_ANGLE };
      this.locOptions = { maxBankAngle: AutopilotConfig.DEFAULT_MAX_BANK_ANGLE };
      this.lnavOptions = { maxBankAngle: AutopilotConfig.DEFAULT_MAX_BANK_ANGLE };
      this.lowBankOptions = { maxBankAngle: AutopilotConfig.DEFAULT_LOW_BANK_ANGLE };

      this.isHdgSyncModeSupported = false;
    } else {
      if (element.tagName !== 'Autopilot') {
        throw new Error(`Invalid AutopilotConfig definition: expected tag name 'Autopilot' but was '${element.tagName}'`);
      }

      const supportAltSelCompatibility = element.getAttribute('alt-sel-compat')?.toLowerCase();
      switch (supportAltSelCompatibility) {
        case 'true':
        case undefined:
          this.supportAltSelCompatibility = true;
          break;
        case 'false':
          this.supportAltSelCompatibility = false;
          break;
        default:
          console.warn(`Invalid AutopilotConfig definition: unrecognized alt-sel-compat option "${supportAltSelCompatibility}" (expected "true" or "false"). Defaulting to "false".`);
          this.supportAltSelCompatibility = false;
      }

      this.rollOptions = this.parseRollOptions(element.querySelector(':scope>ROL'));
      this.hdgOptions = this.parseHdgOptions(element.querySelector(':scope>HDG'));
      this.vorOptions = this.parseVorOptions(element.querySelector(':scope>VOR'));
      this.locOptions = this.parseLocOptions(element.querySelector(':scope>LOC'));
      this.lnavOptions = this.parseLNavOptions(element.querySelector(':scope>FMS'));
      this.lowBankOptions = this.parseLowBankOptions(element.querySelector(':scope>LowBank'));

      const isHdgSyncModeSupported = element.getAttribute('hdg-sync-mode')?.toLowerCase();
      switch (isHdgSyncModeSupported) {
        case 'true':
          this.isHdgSyncModeSupported = true;
          break;
        case 'false':
        case undefined:
          this.isHdgSyncModeSupported = false;
          break;
        default:
          console.warn(`Invalid AutopilotConfig definition: unrecognized hdg-sync-mode option "${isHdgSyncModeSupported}" (expected "true" or "false"). Defaulting to "false".`);
          this.isHdgSyncModeSupported = false;
      }
    }
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
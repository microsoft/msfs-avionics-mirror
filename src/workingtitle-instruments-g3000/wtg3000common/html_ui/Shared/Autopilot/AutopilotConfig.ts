import { Config } from '../Config/Config';
import { ConfigUtils } from '../Config/ConfigUtils';

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
 * Options for the autopilot TO director.
 */
export type AutopilotToOptions = {
  /** The target pitch angle, in degrees, commanded by the director. Positive values indicate upward pitch. */
  targetPitchAngle: number;
};

/**
 * Options for the autopilot GA director.
 */
export type AutopilotGaOptions = {
  /** The target pitch angle, in degrees, commanded by the director. Positive values indicate upward pitch. */
  targetPitchAngle: number;
};

/**
 * Options for the autopilot Low Bank Mode.
 */
export type AutopilotLowBankOptions = {
  /** The maximum supported bank angle, in degrees. */
  maxBankAngle: number;
};

/**
 * Options for the autopilot's selected altitude setting.
 */
export type AutopilotSelectedAltitudeOptions = {
  /** The minimum supported selected altitude, in feet. */
  minAltitude: number;

  /** The maximum supported selected altitude, in feet. */
  maxAltitude: number;

  /** The input rate above which input acceleration is active, in inputs per second. */
  accelInputRateThreshold: number;

  /** The maximum accelerated input rate, in inputs per second. */
  accelInputMaxRate: number;

  /**
   * The rate at which the accelerated input rate approaches the maximum rate as the input rate increases above the
   * input acceleration threshold.
   */
  accelInputRateRamp: number;
};

/**
 * A configuration object which defines options related to the autopilot.
 */
export class AutopilotConfig implements Config {
  private static readonly DEFAULT_ROLL_MIN_BANK_ANGLE = 6;
  private static readonly DEFAULT_MAX_BANK_ANGLE = 25;
  private static readonly DEFAULT_LOW_BANK_ANGLE = 15;

  private static readonly DEFAULT_TO_PITCH_ANGLE = 10;
  private static readonly DEFAULT_GA_PITCH_ANGLE = 7.5;

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

  /** Options for the autopilot TO director. */
  public readonly toOptions: AutopilotToOptions;

  /** Options for the autopilot GA director. */
  public readonly gaOptions: AutopilotGaOptions;

  /** Options for the autopilot Low Bank Mode. */
  public readonly lowBankOptions: AutopilotLowBankOptions;

  /** Options for the autopilot's selected altitude setting. */
  public readonly selectedAltitudeOptions: AutopilotSelectedAltitudeOptions;

  /** Whether HDG sync mode is supported. */
  public readonly isHdgSyncModeSupported: boolean;

  /** Whether the autopilot should be deactivated when GA mode is armed in response to a TO/GA button press. */
  public readonly deactivateAutopilotOnGa: boolean;

  /**
   * Creates a new AutopilotConfig from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   */
  constructor(baseInstrument: BaseInstrument, element: Element | undefined) {
    if (element === undefined) {
      this.rollOptions = { minBankAngle: AutopilotConfig.DEFAULT_ROLL_MIN_BANK_ANGLE, maxBankAngle: AutopilotConfig.DEFAULT_MAX_BANK_ANGLE };
      this.hdgOptions = { maxBankAngle: AutopilotConfig.DEFAULT_MAX_BANK_ANGLE };
      this.vorOptions = { maxBankAngle: AutopilotConfig.DEFAULT_MAX_BANK_ANGLE };
      this.locOptions = { maxBankAngle: AutopilotConfig.DEFAULT_MAX_BANK_ANGLE };
      this.lnavOptions = { maxBankAngle: AutopilotConfig.DEFAULT_MAX_BANK_ANGLE };
      this.toOptions = { targetPitchAngle: AutopilotConfig.DEFAULT_TO_PITCH_ANGLE };
      this.gaOptions = { targetPitchAngle: AutopilotConfig.DEFAULT_GA_PITCH_ANGLE };
      this.lowBankOptions = { maxBankAngle: AutopilotConfig.DEFAULT_LOW_BANK_ANGLE };
      this.selectedAltitudeOptions = this.parseSelectedAltitudeOptions(null);

      this.isHdgSyncModeSupported = false;
      this.deactivateAutopilotOnGa = true;
    } else {
      if (element.tagName !== 'Autopilot') {
        throw new Error(`Invalid AutopilotConfig definition: expected tag name 'Autopilot' but was '${element.tagName}'`);
      }

      this.rollOptions = this.parseRollOptions(element.querySelector(':scope>ROL'));
      this.hdgOptions = this.parseHdgOptions(element.querySelector(':scope>HDG'));
      this.vorOptions = this.parseVorOptions(element.querySelector(':scope>VOR'));
      this.locOptions = this.parseLocOptions(element.querySelector(':scope>LOC'));
      this.lnavOptions = this.parseLNavOptions(element.querySelector(':scope>FMS'));
      this.toOptions = this.parseToOptions(element.querySelector(':scope>TO'));
      this.gaOptions = this.parseGaOptions(element.querySelector(':scope>GA'));
      this.lowBankOptions = this.parseLowBankOptions(element.querySelector(':scope>LowBank'));
      this.selectedAltitudeOptions = this.parseSelectedAltitudeOptions(element.querySelector(':scope>AltSel'));

      const isHdgSyncModeSupported = ConfigUtils.parseBoolean(element.getAttribute('hdg-sync-mode'), false);
      if (isHdgSyncModeSupported === undefined) {
        console.warn('Invalid AutopilotConfig definition: unrecognized "hdg-sync-mode" option (expected "true" or "false"). Defaulting to false.');
        this.isHdgSyncModeSupported = false;
      } else {
        this.isHdgSyncModeSupported = isHdgSyncModeSupported;
      }

      const deactivateAutopilotOnGa = ConfigUtils.parseBoolean(element.getAttribute('deactivate-ap-on-ga'), true);
      if (deactivateAutopilotOnGa === undefined) {
        console.warn('Invalid AutopilotConfig definition: unrecognized "deactivate-ap-on-ga" option (expected "true" or "false"). Defaulting to true.');
        this.deactivateAutopilotOnGa = true;
      } else {
        this.deactivateAutopilotOnGa = deactivateAutopilotOnGa;
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
   * Parses GPS/FMS director options from a configuration document element.
   * @param element A configuration document element.
   * @returns The GPS/FMS director options defined by the configuration document element.
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
   * Parses TO director options from a configuration document element.
   * @param element A configuration document element.
   * @returns The TO director options defined by the configuration document element.
   */
  private parseToOptions(element: Element | null): AutopilotToOptions {
    if (element !== null) {
      let targetPitchAngle = Number(element.getAttribute('pitch') ?? AutopilotConfig.DEFAULT_TO_PITCH_ANGLE);
      if (!isFinite(targetPitchAngle) || targetPitchAngle < 0) {
        console.warn(`Invalid AutopilotConfig definition: unrecognized TO director "pitch" option (expected a finite non-negative number). Defaulting to ${AutopilotConfig.DEFAULT_TO_PITCH_ANGLE}.`);
        targetPitchAngle = AutopilotConfig.DEFAULT_TO_PITCH_ANGLE;
      }

      return { targetPitchAngle };
    }

    return { targetPitchAngle: AutopilotConfig.DEFAULT_TO_PITCH_ANGLE };
  }

  /**
   * Parses GA director options from a configuration document element.
   * @param element A configuration document element.
   * @returns The GA director options defined by the configuration document element.
   */
  private parseGaOptions(element: Element | null): AutopilotGaOptions {
    if (element !== null) {
      let targetPitchAngle = Number(element.getAttribute('pitch') ?? AutopilotConfig.DEFAULT_GA_PITCH_ANGLE);
      if (!isFinite(targetPitchAngle) || targetPitchAngle < 0) {
        console.warn(`Invalid AutopilotConfig definition: unrecognized GA director "pitch" option (expected a finite non-negative number). Defaulting to ${AutopilotConfig.DEFAULT_GA_PITCH_ANGLE}.`);
        targetPitchAngle = AutopilotConfig.DEFAULT_GA_PITCH_ANGLE;
      }

      return { targetPitchAngle };
    }

    return { targetPitchAngle: AutopilotConfig.DEFAULT_GA_PITCH_ANGLE };
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

  /**
   * Parses selected altitude options from a configuration document element.
   * @param element A configuration document element.
   * @returns The selected altitude options defined by the configuration document element.
   */
  private parseSelectedAltitudeOptions(element: Element | null): AutopilotSelectedAltitudeOptions {
    const options: AutopilotSelectedAltitudeOptions = {
      minAltitude: -1000,
      maxAltitude: 50000,
      accelInputRateThreshold: 5,
      accelInputMaxRate: 50,
      accelInputRateRamp: 1
    };

    if (element !== null) {
      const minAltitude = Math.round(Number(element.getAttribute('min-alt') ?? options.minAltitude));
      if (!isFinite(minAltitude) || minAltitude > 0) {
        console.warn(`Invalid AutopilotConfig definition: missing or unrecognized selected altitude "min-alt" option (expected a non-positive number). Defaulting to ${options.minAltitude}`);
      } else {
        options.minAltitude = minAltitude;
      }

      const maxAltitude = Math.round(Number(element.getAttribute('max-alt') ?? options.maxAltitude));
      if (!isFinite(maxAltitude) || maxAltitude <= 0) {
        console.warn(`Invalid AutopilotConfig definition: missing or unrecognized selected altitude "max-alt" option (expected a positive number). Defaulting to ${options.maxAltitude}`);
      } else {
        options.maxAltitude = maxAltitude;
      }

      const accelInputRateThreshold = Math.round(Number(element.getAttribute('accel-rate-threshold') ?? options.accelInputRateThreshold));
      if (!isFinite(accelInputRateThreshold)) {
        console.warn(`Invalid AutopilotConfig definition: missing or unrecognized selected altitude "accel-rate-threshold" option (expected a number). Defaulting to ${options.accelInputRateThreshold}`);
      } else {
        options.accelInputRateThreshold = accelInputRateThreshold;
      }

      const accelInputMaxRate = Math.round(Number(element.getAttribute('accel-max-rate') ?? options.accelInputMaxRate));
      if (!isFinite(accelInputMaxRate) || accelInputMaxRate <= options.accelInputRateThreshold) {
        options.accelInputMaxRate = Math.max(options.accelInputMaxRate, options.accelInputRateThreshold + 1);
        console.warn(`Invalid AutopilotConfig definition: missing or unrecognized selected altitude "accel-max-rate" option (expected a number greater than "accel-rate-threshold"). Defaulting to ${options.accelInputMaxRate}`);
      } else {
        options.accelInputMaxRate = accelInputMaxRate;
      }

      const accelInputRateRamp = Math.round(Number(element.getAttribute('accel-rate-ramp') ?? options.accelInputRateRamp));
      if (!isFinite(accelInputRateRamp) || accelInputRateRamp <= 0) {
        console.warn(`Invalid AutopilotConfig definition: missing or unrecognized selected altitude "accel-rate-ramp" option (expected a positive number). Defaulting to ${options.accelInputRateRamp}`);
      } else {
        options.accelInputRateRamp = accelInputRateRamp;
      }
    }

    return options;
  }
}
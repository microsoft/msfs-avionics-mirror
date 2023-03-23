import { FmsVisualApproachOptions } from '@microsoft/msfs-garminsdk';
import { Config } from '../Config/Config';

/**
 * Options for flight path calculations.
 */
export type FmsFlightPathOptions = {
  /** The maximum bank angle, in degrees, to use to calculate turns while outside of low-bank mode. */
  maxBankAngle: number;

  /** The maximum bank angle, in degrees, to use to calculate turns while in low-bank mode. */
  lowBankAngle: number;
};

/**
 * A configuration object which defines FMS options.
 */
export class FmsConfig implements Config {
  private static readonly DEFAULT_MAX_BANK_ANGLE = 25;
  private static readonly DEFAULT_LOW_BANK_ANGLE = 12;

  /** Options for flight path calculations. */
  public readonly flightPathOptions: FmsFlightPathOptions;

  /** A config which defines options for approaches. */
  public readonly approach: FmsApproachConfig;

  /**
   * Creates a new FmsConfig from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element | undefined) {
    if (element === undefined) {
      this.flightPathOptions = { maxBankAngle: FmsConfig.DEFAULT_MAX_BANK_ANGLE, lowBankAngle: FmsConfig.DEFAULT_LOW_BANK_ANGLE };
      this.approach = new FmsApproachConfig(undefined);
    } else {
      if (element.tagName !== 'Fms') {
        throw new Error(`Invalid FmsConfig definition: expected tag name 'Fms' but was '${element.tagName}'`);
      }

      this.flightPathOptions = this.parseFlightPathOptions(element.querySelector(':scope>FlightPath'));
      this.approach = this.parseApproachConfig(element.querySelector(':scope>Approach'));
    }
  }

  /**
   * Parses flight path calculation options from a configuration document element.
   * @param element A configuration document element.
   * @returns The flight path calculation options defined by the configuration document element.
   */
  private parseFlightPathOptions(element: Element | null): FmsFlightPathOptions {
    if (element !== null) {
      let maxBankAngle = Number(element.getAttribute('max-bank') ?? undefined);
      if (isNaN(maxBankAngle) || maxBankAngle < 0 || maxBankAngle > 40) {
        console.warn('Invalid FmsConfig definition: missing or unrecognized max-bank value (expected a non-negative number less than or equal to 40). Defaulting to 25.');
        maxBankAngle = FmsConfig.DEFAULT_MAX_BANK_ANGLE;
      }

      let lowBankAngle = Number(element.getAttribute('low-bank') ?? undefined);
      if (isNaN(lowBankAngle) || lowBankAngle < 0 || maxBankAngle > 40) {
        console.warn('Invalid FmsConfig definition: missing or unrecognized low-bank value (expected a non-negative number less than or equal to 40). Defaulting to 12.');
        lowBankAngle = FmsConfig.DEFAULT_LOW_BANK_ANGLE;
      }

      return { maxBankAngle, lowBankAngle };
    }

    return { maxBankAngle: FmsConfig.DEFAULT_MAX_BANK_ANGLE, lowBankAngle: FmsConfig.DEFAULT_LOW_BANK_ANGLE };
  }

  /**
   * Parses an approach configuration object from a configuration document element.
   * @param element A configuration document element.
   * @returns The approach configuration defined by the configuration document element.
   */
  private parseApproachConfig(element: Element | null): FmsApproachConfig {
    if (element !== null) {
      try {
        return new FmsApproachConfig(element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new FmsApproachConfig(undefined);
  }
}

/**
 * A configuration object which defines FMS approach options.
 */
export class FmsApproachConfig implements Config {
  /** Whether RNP (AR) approaches are supported. */
  public readonly supportRnpAr: boolean;

  /** Options for visual approach procedures. */
  public readonly visualApproachOptions: Readonly<FmsVisualApproachOptions>;

  /**
   * Creates a new FmsApproachConfig from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element | undefined) {
    if (element === undefined) {
      this.supportRnpAr = false;
      this.visualApproachOptions = { finalFixDistance: 2.5, strghtFixDistance: 5 };
    } else {
      if (element.tagName !== 'Approach') {
        throw new Error(`Invalid FmsApproachConfig definition: expected tag name 'Approach' but was '${element.tagName}'`);
      }

      const rnpAr = element.getAttribute('rnp-ar');
      switch (rnpAr?.toLowerCase()) {
        case 'true':
          this.supportRnpAr = true;
          break;
        case 'false':
          this.supportRnpAr = false;
          break;
        default:
          console.warn('Invalid FmsApproachConfig definition: unrecognized rnp-ar option (expected \'true\' or \'false\'). Defaulting to false.');
          this.supportRnpAr = false;
      }

      this.visualApproachOptions = this.parseVisualApproachOptions(element.querySelector(':scope>Visual'));
    }
  }

  /**
   * Parses a visual approach options from a configuration document element.
   * @param element A configuration document element.
   * @returns The visual approach options defined by the configuration document element.
   */
  private parseVisualApproachOptions(element: Element | null): FmsVisualApproachOptions {
    const opts = { finalFixDistance: 2.5, strghtFixDistance: 2.5 };

    if (element !== null) {
      const finalDistanceText = element.getAttribute('final-dist');
      if (finalDistanceText !== null) {
        const finalDistance = Number(finalDistanceText);
        if (isFinite(finalDistance) && finalDistance > 0) {
          opts.finalFixDistance = finalDistance;
        } else {
          console.warn('Invalid FmsApproachConfig definition: unrecognized visual approach final-dist option (expected a positive number). Defaulting to 2.5.');
        }
      }

      const strghtDistanceText = element.getAttribute('strght-dist');
      if (strghtDistanceText !== null) {
        const strghtDistance = Number(strghtDistanceText);
        if (isFinite(strghtDistance) && strghtDistance > 0) {
          opts.strghtFixDistance = strghtDistance;
        } else {
          console.warn('Invalid FmsApproachConfig definition: unrecognized visual approach strght-dist option (expected a positive number greater than the final fix distance). Defaulting to 2.5.');
        }
      }
    }

    return opts;
  }
}
import { G3XExternalNavigatorIndex } from '../CommonTypes';
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

  /** The index of the LNAV instance to use for the internal navigation source. */
  public readonly lnavIndex: number;

  /** Whether the internal navigation source uses the sim's native OBS state. */
  public readonly useSimObsState: boolean;

  /** The index of the VNAV instance to use for the internal navigation source. */
  public readonly vnavIndex: number;

  /** Whether to sync the internal primary flight plan to the sim. */
  public readonly syncToSim: boolean;

  /** Options for flight path calculations. */
  public readonly flightPathOptions: FmsFlightPathOptions;

  /** A config that defines options for flight planning. */
  public readonly flightPlanning: FmsFlightPlanningConfig;

  /**
   * Configs that define options for external flight plan data sources. The index of each config corresponds to the
   * index of the source's parent external navigator.
   */
  public readonly externalFplSources: readonly (FmsExternalFplSourceConfig | undefined)[];

  /** The number of supported external flight plan data sources. */
  public readonly externalFplSourceCount: 0 | 1 | 2;

  /**
   * Creates a new FmsConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element | undefined) {
    if (element === undefined) {
      this.lnavIndex = 0;
      this.useSimObsState = true;
      this.vnavIndex = 0;
      this.syncToSim = true;
      this.flightPathOptions = { maxBankAngle: FmsConfig.DEFAULT_MAX_BANK_ANGLE, lowBankAngle: FmsConfig.DEFAULT_LOW_BANK_ANGLE };
      this.flightPlanning = new FmsFlightPlanningConfig(undefined);
      this.externalFplSources = [];
      this.externalFplSourceCount = 0;
    } else {
      if (element.tagName !== 'Fms') {
        throw new Error(`Invalid FmsConfig definition: expected tag name 'Fms' but was '${element.tagName}'`);
      }

      const lnavIndexText = element.getAttribute('lnav-index');
      if (lnavIndexText !== null) {
        const lnavIndex = Number(lnavIndexText);
        if (isNaN(lnavIndex) || !Number.isInteger(lnavIndex) || lnavIndex < 0) {
          console.warn('Invalid FmsConfig definition: unrecognized option "lnav-index" (must be a non-negative integer). Defaulting to 0.');
          this.lnavIndex = 0;
        } else {
          this.lnavIndex = lnavIndex;
        }
      } else {
        this.lnavIndex = 0;
      }

      const useSimObsState = element.getAttribute('use-sim-obs')?.toLowerCase();
      switch (useSimObsState) {
        case 'true':
        case undefined:
          this.useSimObsState = true;
          break;
        case 'false':
          this.useSimObsState = false;
          break;
        default:
          console.warn('Invalid FmsConfig definition: unrecognized option "use-sim-obs" (must be "true" or "false"). Defaulting to true.');
          this.useSimObsState = true;
      }

      const vnavIndexText = element.getAttribute('vnav-index');
      if (vnavIndexText !== null) {
        const vnavIndex = Number(vnavIndexText);
        if (isNaN(vnavIndex) || !Number.isInteger(vnavIndex) || vnavIndex < 0) {
          console.warn('Invalid FmsConfig definition: unrecognized option "vnav-index" (must be a non-negative integer). Defaulting to 0.');
          this.vnavIndex = 0;
        } else {
          this.vnavIndex = vnavIndex;
        }
      } else {
        this.vnavIndex = 0;
      }

      const syncToSim = element.getAttribute('sync-to-sim')?.toLowerCase();
      switch (syncToSim) {
        case 'true':
        case undefined:
          this.syncToSim = true;
          break;
        case 'false':
          this.syncToSim = false;
          break;
        default:
          console.warn('Invalid FmsConfig definition: unrecognized option "sync-to-sim" (must be "true" or "false"). Defaulting to true.');
          this.syncToSim = true;
      }

      this.flightPathOptions = this.parseFlightPathOptions(element.querySelector(':scope>FlightPath'));
      this.flightPlanning = this.parseFlightPlanningConfig(element.querySelector(':scope>FlightPlanning'));
      this.externalFplSources = this.parseExternalFplSourceConfigs(element.querySelector(':scope>ExternalSources'));

      this.externalFplSourceCount = this.externalFplSources.reduce((count, config) => count + (config ? 1 : 0), 0 as number) as 0 | 1 | 2;
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
   * Parses a flight planning configuration object from a configuration document element.
   * @param element A configuration document element.
   * @returns The flight planning configuration object defined by the configuration document element.
   */
  private parseFlightPlanningConfig(element: Element | null): FmsFlightPlanningConfig {
    if (element !== null) {
      try {
        return new FmsFlightPlanningConfig(element);
      } catch (e) {
        console.warn(e);
        console.warn('Discarding invalid FmsFlightPlanningConfig definition');
      }
    }

    return new FmsFlightPlanningConfig(undefined);
  }

  /**
   * Parses external flight plan data source configuration objects from a configuration document element.
   * @param element A configuration document element.
   * @returns The external flight plan data source configuration objects defined by the configuration document element.
   */
  private parseExternalFplSourceConfigs(element: Element | null): (FmsExternalFplSourceConfig | undefined)[] {
    const configs: FmsExternalFplSourceConfig[] = [];

    if (!element) {
      return configs;
    }

    for (const configElement of element.querySelectorAll(':scope>Source')) {
      try {
        const config = new FmsExternalFplSourceConfig(configElement, this.lnavIndex, this.vnavIndex);
        configs[config.index] ??= config;
      } catch (e) {
        console.warn(e);
        console.warn('Discarding invalid FmsExternalFplSourceConfig definition');
      }
    }

    return configs;
  }
}

/**
 * A configuration object which defines FMS flight planning options.
 */
export class FmsFlightPlanningConfig implements Config {
  /** Whether flight planning calculations support the use of sensed fuel flow data. */
  public readonly supportSensedFuelFlow: boolean;

  /** The type of fuel-on-board data used in flight planning calculations. */
  public readonly fuelOnBoardType: 'sensed' | 'totalizer' | 'none';

  /**
   * Creates a new FmsFlightPlanningConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element | undefined) {
    if (element === undefined) {
      this.supportSensedFuelFlow = false;
      this.fuelOnBoardType = 'none';
    } else {
      if (element.tagName !== 'FlightPlanning') {
        throw new Error(`Invalid FmsFlightPlanningConfig definition: expected tag name 'FlightPlanning' but was '${element.tagName}'`);
      }

      const supportSensedFuelFlow = element.getAttribute('sensed-fuel-flow')?.toLowerCase();
      switch (supportSensedFuelFlow) {
        case 'true':
          this.supportSensedFuelFlow = true;
          break;
        case 'false':
        case undefined:
          this.supportSensedFuelFlow = false;
          break;
        default:
          console.warn('Invalid FmsFlightPlanningConfig definition: unrecognized "sensed-fuel-flow" option value (expected "true" or "false"). Defaulting to "false".');
          this.supportSensedFuelFlow = false;
      }

      const supportFuelOnBoard = element.getAttribute('fuel-on-board')?.toLowerCase();
      switch (supportFuelOnBoard) {
        case 'sensed':
        case 'totalizer':
          this.fuelOnBoardType = supportFuelOnBoard;
          break;
        case 'none':
        case 'false':
        case undefined:
          this.fuelOnBoardType = 'none';
          break;
        default:
          console.warn('Invalid FmsFlightPlanningConfig definition: unrecognized "fuel-on-board" option value (expected "sensed", "totalizer", "none", or "false"). Defaulting to "none".');
          this.fuelOnBoardType = 'none';
      }
    }
  }
}

/**
 * A configuration object which defines FMS external flight plan data source options.
 */
export class FmsExternalFplSourceConfig implements Config {
  /** The index of the external flight plan data source's parent external navigator. */
  public readonly index: G3XExternalNavigatorIndex;

  /** The flight planner ID of the external flight plan data source. */
  public readonly flightPlannerId: string;

  /** The flight path calculator ID of the external flight plan data source. */
  public readonly flightPathCalculatorId: string;

  /** The index of the LNAV instance to use for the external flight plan data source. */
  public readonly lnavIndex: number;

  /** Whether the external flight plan data source uses the sim's native OBS state. */
  public readonly useSimObsState: boolean;

  /**
   * The index of the VNAV instance to use for the external flight plan data source, or `-1` if the external flight
   * plan data source does not support VNAV.
   */
  public readonly vnavIndex: number;

  /** The index of the autopilot guidance SimVars published by the external flight plan data source. */
  public readonly apGuidanceIndex: number;

  /** The ID of the external flight plan data source's CDI. */
  public readonly cdiId: string;

  /**
   * Creates a new FmsExternalFplSourceConfig from a configuration document element.
   * @param element A configuration document element.
   * @param internalLNavIndex The index of the LNAV instance used by the internal navigation source.
   * @param internalVNavIndex The index of the VNAV instance used by the internal navigation source.
   */
  public constructor(element: Element, internalLNavIndex: number, internalVNavIndex: number) {
    if (element.tagName !== 'Source') {
      throw new Error(`Invalid FmsExternalFplSourceConfig definition: expected tag name 'Source' but was '${element.tagName}'`);
    }

    const index = Number(element.getAttribute('index') ?? undefined);
    if (index !== 1 && index !== 2) {
      throw new Error('Invalid FmsExternalFplSourceConfig definition: missing or unrecognized option "index" (must be 1 or 2)');
    }
    this.index = index;

    const flightPlannerId = element.getAttribute('fpl-id');
    if (flightPlannerId === null) {
      throw new Error('Invalid FmsExternalFplSourceConfig definition: missing option "fpl-id"');
    } else if (flightPlannerId === 'g3x') {
      throw new Error('Invalid FmsExternalFplSourceConfig definition: option "fpl-id" is equal to the internal flight planner ID ("g3x")');
    }
    this.flightPlannerId = flightPlannerId;

    const flightPathCalculatorId = element.getAttribute('flight-path-calc-id');
    if (flightPathCalculatorId === 'g3x') {
      throw new Error('Invalid FmsExternalFplSourceConfig definition: option "flight-path-calc-id" is equal to the internal flight path calculator ID ("g3x")');
    }
    this.flightPathCalculatorId = flightPathCalculatorId ?? this.flightPlannerId;

    const lnavIndex = Number(element.getAttribute('lnav-index') ?? undefined);
    if (isNaN(lnavIndex) || !Number.isInteger(lnavIndex) || lnavIndex < 0) {
      throw new Error('Invalid FmsExternalFplSourceConfig definition: missing or unrecognized option "lnav-index" (must be a non-negative integer)');
    } else if (lnavIndex === internalLNavIndex) {
      throw new Error(`Invalid FmsExternalFplSourceConfig definition: option "lnav-index" is equal to the internal LNAV index (${internalLNavIndex})`);
    }
    this.lnavIndex = lnavIndex;

    const useSimObsState = element.getAttribute('use-sim-obs')?.toLowerCase();
    switch (useSimObsState) {
      case 'true':
        this.useSimObsState = true;
        break;
      case 'false':
        this.useSimObsState = false;
        break;
      default:
        throw new Error('Invalid FmsExternalFplSourceConfig definition: missing or unrecognized option "use-sim-obs" (must be "true" or "false"). Defaulting to true.');
    }

    const vnavIndex = Number(element.getAttribute('vnav-index') ?? undefined);
    if (isNaN(vnavIndex) || !Number.isInteger(vnavIndex)) {
      throw new Error('Invalid FmsExternalFplSourceConfig definition: missing or unrecognized option option "vnav-index" (must be an integer)');
    } else if (vnavIndex === internalVNavIndex) {
      throw new Error(`Invalid FmsExternalFplSourceConfig definition: option "vnav-index" is equal to the internal VNAV index (${internalVNavIndex})`);
    }
    this.vnavIndex = vnavIndex;

    const apGuidanceIndex = Number(element.getAttribute('ap-guidance-index') ?? undefined);
    if (isNaN(apGuidanceIndex) || !Number.isInteger(apGuidanceIndex) || apGuidanceIndex < 0) {
      throw new Error('Invalid FmsExternalFplSourceConfig definition: missing or unrecognized option option "ap-guidance-index" (must be a non-negative integer)');
    }
    this.apGuidanceIndex = apGuidanceIndex;

    const cdiId = element.getAttribute('cdi-id');
    if (cdiId === null) {
      throw new Error('Invalid FmsExternalFplSourceConfig definition: missing option "cdi-id"');
    } else if (cdiId === 'g3x') {
      throw new Error('Invalid FmsExternalFplSourceConfig definition: option "cdi-id" is equal to the G3X CDI ID ("g3x")');
    }
    this.cdiId = cdiId;
  }
}

import { NumberUnitReadOnly, Unit, UnitFamily, UnitType } from '@microsoft/msfs-sdk';
import { Config } from '../Config/Config';
import { ToldConfig } from './TOLD/ToldConfig';

/**
 * Aircraft weight limits and capacities.
 */
export type PerformanceWeightLimits = {
  /** Default basic empty weight. */
  basicEmpty: NumberUnitReadOnly<UnitFamily.Weight>;

  /** Maximum ramp weight. */
  maxRamp: NumberUnitReadOnly<UnitFamily.Weight>;

  /** Maximum takeoff weight. */
  maxTakeoff: NumberUnitReadOnly<UnitFamily.Weight>;

  /** Maximum landing weight. */
  maxLanding: NumberUnitReadOnly<UnitFamily.Weight>;

  /** Maximum zero-fuel weight. */
  maxZeroFuel: NumberUnitReadOnly<UnitFamily.Weight>;

  /** Maximum passenger count. */
  maxPassengerCount: number;
}

/**
 * A configuration object which defines options related to performance calculations.
 */
export class PerformanceConfig implements Config {
  /** Aircraft weight limits and capacities. */
  public readonly weightLimits: Readonly<PerformanceWeightLimits>;

  /** The name of the airframe supported by performance calculations. */
  public readonly airframe: string;

  /** A config which defines options for TOLD (takeoff/landing) performance calculations. */
  public readonly toldConfig?: ToldConfig;

  /** Whether TOLD (takeoff/landing) performance calculations are supported. */
  public readonly isToldSupported: boolean;

  /**
   * Creates a new PerformanceConfig from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element | undefined) {
    if (element === undefined) {
      this.weightLimits = this.parseWeightLimits(null);
      this.airframe = '';
    } else {
      if (element.tagName !== 'Performance') {
        throw new Error(`Invalid PerformanceConfig definition: expected tag name 'Performance' but was '${element.tagName}'`);
      }

      this.weightLimits = this.parseWeightLimits(element.querySelector(':scope>Weights'));
      this.airframe = element.querySelector(':scope>Airframe')?.textContent ?? '';
      this.toldConfig = this.parseToldConfig(element.querySelector(':scope>TOLD'));
    }

    this.isToldSupported = this.toldConfig !== undefined;
  }

  /**
   * Parses weight limits from a configuration document element.
   * @param element A configuration document element.
   * @returns The weight limits defined by the configuration document element.
   */
  private parseWeightLimits(element: Element | null): PerformanceWeightLimits {
    let basicEmpty = this.parseWeightLimit(element?.querySelector('BasicEmpty') ?? null);
    if (basicEmpty === undefined) {
      console.warn('Invalid PerformanceConfig definition: could not find basic empty weight, defaulting to zero');
      basicEmpty = UnitType.POUND.createNumber(0).readonly;
    }

    let maxRamp = this.parseWeightLimit(element?.querySelector('MaxRamp') ?? null);
    if (maxRamp === undefined) {
      console.warn('Invalid PerformanceConfig definition: could not find maximum ramp weight, defaulting to zero');
      maxRamp = UnitType.POUND.createNumber(0).readonly;
    }

    let maxTakeoff = this.parseWeightLimit(element?.querySelector('MaxTakeoff') ?? null);
    if (maxTakeoff === undefined) {
      console.warn('Invalid PerformanceConfig definition: could not find maximum takeoff weight, defaulting to zero');
      maxTakeoff = UnitType.POUND.createNumber(0).readonly;
    }

    let maxLanding = this.parseWeightLimit(element?.querySelector('MaxLanding') ?? null);
    if (maxLanding === undefined) {
      console.warn('Invalid PerformanceConfig definition: could not find maximum landing weight, defaulting to zero');
      maxLanding = UnitType.POUND.createNumber(0).readonly;
    }

    let maxZeroFuel = this.parseWeightLimit(element?.querySelector('MaxZeroFuel') ?? null);
    if (maxZeroFuel === undefined) {
      console.warn('Invalid PerformanceConfig definition: could not find maximum zero fuel weight, defaulting to zero');
      maxZeroFuel = UnitType.POUND.createNumber(0).readonly;
    }

    let maxPassengerCount = Number(element?.querySelector('MaxPax')?.textContent ?? undefined);
    if (!Number.isInteger(maxPassengerCount) || maxPassengerCount < 0) {
      console.warn('Invalid PerformanceConfig definition: unrecognized maximum passenger count (must be a non-negative integer), defaulting to zero');
      maxPassengerCount = 0;
    }

    return { basicEmpty, maxRamp, maxTakeoff, maxLanding, maxZeroFuel, maxPassengerCount };
  }

  /**
   * Parses a single weight limit from a configuration document element.
   * @param element A configuration document element.
   * @returns The weight limit defined by the configuration document element, or `undefined` if the element is `null`.
   */
  private parseWeightLimit(element: Element | null): NumberUnitReadOnly<UnitFamily.Weight> | undefined {
    if (element === null) {
      return undefined;
    }

    let unit: Unit<UnitFamily.Weight>;
    const unitString = element.getAttribute('unit');
    switch (unitString?.toLowerCase()) {
      case 'kg':
      case 'kgs':
      case 'kilogram':
      case 'kilograms':
        unit = UnitType.KILOGRAM;
        break;
      case 'lb':
      case 'lbs':
      case 'pound':
      case 'pounds':
      case undefined:
        unit = UnitType.POUND;
        break;
      default:
        console.warn(`Invalid PerformanceConfig definition: unrecognized weight unit type for ${element.tagName}, defaulting to pounds`);
        unit = UnitType.POUND;
    }

    let value = Number(element.textContent ?? undefined);
    if (!isFinite(value) || value < 0) {
      console.warn(`Invalid PerformanceConfig definition: unrecognized weight value for ${element.tagName} (must be a non-negative number), defaulting to zero`);
      value = 0;
    }

    return unit.createNumber(value).readonly;
  }

  /**
   * Parses a TOLD configuration object from a configuration document element.
   * @param element A configuration document element.
   * @returns The TOLD configuration defined by the configuration document element, or `undefined` if the element is `null`.
   */
  private parseToldConfig(element: Element | null): ToldConfig | undefined {
    if (element !== null) {
      try {
        return new ToldConfig(element);
      } catch (e) {
        console.warn(e);
      }
    }

    return undefined;
  }
}
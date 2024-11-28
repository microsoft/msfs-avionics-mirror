import { MathUtils, ReadonlyFloat64Array, Unit, UnitFamily, UnitType, Vec2Math } from '@microsoft/msfs-sdk';

import { Config } from '../../Config/Config';
import { ConfigUtils } from '../../Config/ConfigUtils';
import { PerformanceWeightLimits } from '../PerformanceWeightLimits';
import { G3000WeightBalanceUtils } from './G3000WeightBalanceUtils';
import {
  WeightBalanceEnvelopeDef, WeightBalanceEnvelopeGraphScaleDef, WeightBalanceEnvelopeOptions,
  WeightBalanceFuelStationDef, WeightBalanceLoadStationDef, WeightBalanceLoadStationType
} from './WeightBalanceTypes';

/**
 * A configuration object which defines options related to weight and balance calculations.
 */
export class WeightBalanceConfig implements Config {

  /** The unit type in which weights are parsed. */
  private readonly weightUnit: Unit<UnitFamily.Weight>;

  /** The unit type in which moment arms are parsed. */
  private readonly armUnit: Unit<UnitFamily.Distance>;

  /** The label text to use to describe moment arms. */
  public readonly armLabel: string;

  /** The short label text to use to describe moment arms. */
  public readonly armLabelShort: string;

  /** The moment arm values, in inches, corresponding to LEMAC and TEMAC, as `[lemac, temac]`. */
  public readonly macArm?: ReadonlyFloat64Array;

  /** The aircraft's weight, in pounds, when all load stations are disabled and with no fuel. */
  public readonly aircraftEmptyWeight: number;

  /** The aircraft's center-of-gravity moment arm, in inches, when all load stations are disabled and with no fuel. */
  public readonly aircraftEmptyArm: number;

  /** An array of definitions for load stations. */
  public readonly loadStationDefs: readonly Readonly<WeightBalanceLoadStationDef>[];

  /** Whether at least one load station can be edited. */
  public readonly areLoadStationsEditable: boolean;

  /** The definition for the aircraft's fuel station. */
  public readonly fuelStationDef: Readonly<WeightBalanceFuelStationDef>;

  /** Options for weight and balance envelopes. */
  public readonly envelopeOptions: Readonly<WeightBalanceEnvelopeOptions>;

  /**
   * Creates a new WeightBalanceConfig from a configuration document element.
   * @param element A configuration document element.
   * @param weightLimits Global aircraft weight limits and capacities.
   */
  public constructor(element: Element, weightLimits: PerformanceWeightLimits) {
    if (element.tagName !== 'WeightBalance') {
      throw new Error(`Invalid WeightBalanceConfig definition: expected tag name 'WeightBalance' but was '${element.tagName}'`);
    }

    const weightUnitAttr = element.getAttribute('weight-unit')?.toLowerCase();
    switch (weightUnitAttr) {
      case 'lb':
      case 'lbs':
      case 'pound':
      case 'pounds':
        this.weightUnit = UnitType.POUND;
        break;
      case 'kg':
      case 'kgs':
      case 'kilogram':
      case 'kilograms':
        this.weightUnit = UnitType.KILOGRAM;
        break;
      default:
        throw new Error('Invalid WeightBalanceConfig definition: missing or unrecognized "weight-unit" option (must be "lb"/"lbs"/"pound"/"pounds" or "kg"/"kgs"/"kilogram"/"kilograms")');
    }

    const armUnitAttr = element.getAttribute('arm-unit')?.toLowerCase();
    switch (armUnitAttr) {
      case 'in':
      case 'inch':
      case 'inches':
        this.armUnit = UnitType.INCH;
        break;
      case 'cm':
      case 'centimeter':
      case 'centimeters':
        this.armUnit = UnitType.CENTIMETER;
        break;
      default:
        throw new Error('Invalid WeightBalanceConfig definition: missing or unrecognized "arm-unit" option (must be "in"/"inch"/"inches" or "cm"/"centimeter"/"centimeters")');
    }

    this.armLabel = element.getAttribute('arm-label') ?? 'CG';
    this.armLabelShort = element.getAttribute('arm-label-short') ?? this.armLabel;

    const lemacAttr = element.getAttribute('lemac');
    const temacAttr = element.getAttribute('temac');

    if (lemacAttr && temacAttr) {
      const lemac = Number(lemacAttr ?? NaN);
      const temac = Number(temacAttr ?? NaN);

      let isValid = true;

      if (!isFinite(lemac)) {
        isValid = false;
        console.warn('Invalid WeightBalanceConfig definition: unrecognized "lemac" option (must be a finite number). Discarding MAC options.');
      }
      if (!isFinite(temac)) {
        isValid = false;
        console.warn('Invalid WeightBalanceConfig definition: unrecognized "temac" option (must be a finite number). Discarding MAC options.');
      }
      if (lemac === temac) {
        isValid = false;
        console.warn('Invalid WeightBalanceConfig definition: "lemac" and "temac" options are equal. Discarding MAC options.');
      }

      if (isValid) {
        this.macArm = Vec2Math.create(this.armUnit.convertTo(lemac, UnitType.INCH), this.armUnit.convertTo(temac, UnitType.INCH));
      }
    }

    const aircraftEmptyWeight = this.parseWeight(element.getAttribute('empty-weight'));
    if (aircraftEmptyWeight !== null && aircraftEmptyWeight !== undefined && aircraftEmptyWeight >= 0) {
      this.aircraftEmptyWeight = this.weightUnit.convertTo(aircraftEmptyWeight, UnitType.POUND);
    } else {
      throw new Error('Invalid WeightBalanceConfig definition: missing or unrecognized "empty-weight" option (must be a non-negative number)');
    }

    const aircraftEmptyArm = Number(element.getAttribute('empty-arm') ?? NaN);
    if (isFinite(aircraftEmptyArm)) {
      this.aircraftEmptyArm = this.armUnit.convertTo(aircraftEmptyArm, UnitType.INCH);
    } else {
      throw new Error('Invalid WeightBalanceConfig definition: missing or unrecognized "empty-arm" option (must be a finite number)');
    }

    this.loadStationDefs = this.parseLoadStationDefs(element.querySelector(':scope>LoadStations'));
    this.areLoadStationsEditable = this.loadStationDefs.find(def => {
      return def.isEmptyWeightEditable || def.isArmEditable || def.isEnabledEditable;
    }) !== undefined;

    this.fuelStationDef = this.parseFuelStationDef(element.querySelector(':scope>FuelStation'));

    this.envelopeOptions = this.parseEnvelopeOptions(element.querySelector(':scope>Envelopes'), weightLimits);
  }

  /**
   * Parses a weight value from an optional string input.
   * @param input The input to parse.
   * @returns The weight value parsed from the specified input, in pounds, or `null` if the input was nullish, or
   * `undefined` if the input string could not be parsed into a valid finite weight value.
   */
  private parseWeight(input: string | null | undefined): number | null | undefined;
  /**
   * Parses a weight value from an optional string input.
   * @param input The input to parse.
   * @param defaultValue The default weight value, in pounds, to return if the input is nullish.
   * @returns The weight value parsed from the specified input, in pounds, or `undefined` if the input string could not
   * be parsed into a valid finite weight value.
   */
  private parseWeight(input: string | null | undefined, defaultValue: number): number | undefined;
  // eslint-disable-next-line jsdoc/require-jsdoc
  private parseWeight(input: string | null | undefined, defaultValue?: number): number | null | undefined {
    if (input) {
      const parsedValue = Number(input);
      return isFinite(parsedValue) ? this.weightUnit.convertTo(parsedValue, UnitType.POUND) : undefined;
    } else if (defaultValue !== undefined) {
      return isFinite(defaultValue) ? defaultValue : undefined;
    } else {
      return null;
    }
  }

  /**
   * Parses an array of load station definitions from a configuration document element.
   * @param element A configuration document element.
   * @returns An array containing the load station definitions defined by the configuration document element.
   */
  private parseLoadStationDefs(element: Element | null): Readonly<WeightBalanceLoadStationDef>[] {
    const defs: Readonly<WeightBalanceLoadStationDef>[] = [];

    if (element) {
      let minArm = -Infinity;
      let maxArm = Infinity;

      const minArmAttr = element.getAttribute('min-arm');
      if (minArmAttr) {
        minArm = Number(minArmAttr);
        if (isNaN(minArm)) {
          console.warn('Invalid WeightBalanceConfig definition: unrecognized global load stations "min-arm" option (must be a number). Defaulting to -Infinity.');
          minArm = -Infinity;
        }
      }
      const maxArmAttr = element.getAttribute('max-arm');
      if (maxArmAttr) {
        maxArm = Number(maxArmAttr);
        if (isNaN(maxArm)) {
          console.warn('Invalid WeightBalanceConfig definition: unrecognized global load stations "max-arm" option (must be a number). Defaulting to +Infinity.');
          maxArm = Infinity;
        }
      }

      if (minArm > maxArm) {
        console.warn('Invalid WeightBalanceConfig definition: global load stations "min-arm" option is greater than the "max-arm" option. Defaulting to moment arm range to (-Infinity, +Infinity).');
        minArm = -Infinity;
        maxArm = Infinity;
      }

      const globalArmRange = Vec2Math.create(
        this.armUnit.convertTo(minArm, UnitType.INCH),
        this.armUnit.convertTo(maxArm, UnitType.INCH)
      );

      const uuids = new Set();
      const loadStationElements = element.querySelectorAll(':scope>Station');

      for (const stationElement of loadStationElements) {
        const def = this.parseLoadStationDef(stationElement, globalArmRange);
        if (def) {
          if (uuids.has(def.id)) {
            console.warn(`Invalid WeightBalanceConfig definition: duplicate load station ID ${def.id}. Discarding duplicate load station.`);
          } else {
            uuids.add(def.id);
            defs.push(def);
          }
        }
      }
    }

    return defs;
  }

  /**
   * Parses a load station definition from a configuration document element.
   * @param element A configuration document element.
   * @param globalArmRange The global range of valid load station moment arm values to enforce, as `[minimum, maximum]`
   * in inches.
   * @returns The load station definition defined by the configuration document element, or `undefined` if a definition
   * could not be parsed.
   */
  private parseLoadStationDef(element: Element, globalArmRange: ReadonlyFloat64Array): WeightBalanceLoadStationDef | undefined {
    const id = element.getAttribute('id');
    if (id === null) {
      console.warn('Invalid WeightBalanceConfig definition: missing load station "id" option. Discarding load station.');
      return undefined;
    }

    let type: WeightBalanceLoadStationType;
    const typeAttr = element.getAttribute('type')?.toLowerCase();
    switch (typeAttr) {
      case 'operating':
        type = WeightBalanceLoadStationType.Operating;
        break;
      case 'passenger':
        type = WeightBalanceLoadStationType.Passenger;
        break;
      case 'cargo':
        type = WeightBalanceLoadStationType.Cargo;
        break;
      default:
        console.warn(`Invalid WeightBalanceConfig definition: missing or unrecognized "type" option for load station ${id} (must be "operating", "passenger", or "cargo"). Discarding load station.`);
        return undefined;
    }

    const name = element.getAttribute('name');
    if (name === null) {
      console.warn(`Invalid WeightBalanceConfig definition: missing load station "name" option for load station ${id}. Discarding load station.`);
      return undefined;
    }

    const maxEmptyWeight = this.parseWeight(element.getAttribute('max-empty-weight'), 99999);
    if (maxEmptyWeight === undefined || maxEmptyWeight < 0) {
      console.warn(`Invalid WeightBalanceConfig definition: unrecognized "max-empty-weight" option for load station ${id} (must be a non-negative number). Discarding load station.`);
      return undefined;
    }

    const maxLoadWeight = this.parseWeight(element.getAttribute('max-load-weight'), 99999);
    if (maxLoadWeight === undefined || maxLoadWeight < 0) {
      console.warn(`Invalid WeightBalanceConfig definition: unrecognized "max-load-weight" option for load station ${id} (must be a non-negative number). Discarding load station.`);
      return undefined;
    }

    let minArm = -Infinity;
    let maxArm = Infinity;

    const minArmAttr = element.getAttribute('min-arm');
    if (minArmAttr) {
      minArm = Number(minArmAttr);
      if (isNaN(minArm)) {
        console.warn(`Invalid WeightBalanceConfig definition: unrecognized "min-arm" option for load station ${id} (must be a number). Defaulting to -Infinity.`);
        minArm = -Infinity;
      }
    }
    const maxArmAttr = element.getAttribute('max-arm');
    if (maxArmAttr) {
      maxArm = Number(maxArmAttr);
      if (isNaN(maxArm)) {
        console.warn(`Invalid WeightBalanceConfig definition: unrecognized "max-arm" option for load station ${id} (must be a number). Defaulting to -Infinity.`);
        maxArm = Infinity;
      }
    }

    if (minArm > maxArm) {
      console.warn(`Invalid WeightBalanceConfig definition: "min-arm" option is greater than "max-arm" option for load station ${id}. Defaulting to moment arm range to (-Infinity, +Infinity).`);
      minArm = -Infinity;
      maxArm = Infinity;
    }

    const armRange = Vec2Math.create(
      Math.max(globalArmRange[0], this.armUnit.convertTo(minArm, UnitType.INCH)),
      Math.min(globalArmRange[1], this.armUnit.convertTo(maxArm, UnitType.INCH))
    );

    let defaultEmptyWeight = this.parseWeight(element.getAttribute('empty-weight'), 0);
    if (defaultEmptyWeight === undefined || defaultEmptyWeight < 0) {
      console.warn(`Invalid WeightBalanceConfig definition: unrecognized "empty-weight" option for load station ${id} (must be a non-negative number). Discarding load station.`);
      return undefined;
    } else if (defaultEmptyWeight > maxEmptyWeight) {
      console.warn(`Invalid WeightBalanceConfig definition: "empty-weight" option for load station ${id} is greater than the maximum empty weight. Defaulting option to the maximum empty weight.`);
      defaultEmptyWeight = maxEmptyWeight;
    }

    let defaultArm = this.armUnit.convertTo(Number(element.getAttribute('arm') ?? NaN), UnitType.INCH);
    if (!isFinite(defaultArm)) {
      console.warn(`Invalid WeightBalanceConfig definition: missing or unrecognized "arm" option for load station ${id} (must be a finite number). Discarding load station.`);
      return undefined;
    } else if (defaultArm < armRange[0] || defaultArm > armRange[1]) {
      console.warn(`Invalid WeightBalanceConfig definition: "arm" option for load station ${id} is outside of the valid range. Clamping option to the valid range.`);
      defaultArm = MathUtils.clamp(defaultArm, armRange[0], armRange[1]);
    }

    const defaultEnabled = ConfigUtils.parseBoolean(element.getAttribute('enabled'), true);
    if (defaultEnabled === undefined) {
      console.warn(`Invalid WeightBalanceConfig definition: unrecognized "enabled" option for load station ${id} (must be "true" or "false"). Discarding load station.`);
      return undefined;
    }

    const isEmptyWeightEditable = ConfigUtils.parseBoolean(element.getAttribute('empty-weight-editable'), false);
    if (isEmptyWeightEditable === undefined) {
      console.warn(`Invalid WeightBalanceConfig definition: unrecognized "empty-weight-editable" option for load station ${id} (must be "true" or "false"). Discarding load station.`);
      return undefined;
    }

    const isArmEditable = ConfigUtils.parseBoolean(element.getAttribute('arm-editable'), false);
    if (isArmEditable === undefined) {
      console.warn(`Invalid WeightBalanceConfig definition: unrecognized "arm-editable" option for load station ${id} (must be "true" or "false"). Discarding load station.`);
      return undefined;
    }

    const isEnabledEditable = ConfigUtils.parseBoolean(element.getAttribute('enabled-editable'), false);
    if (isEnabledEditable === undefined) {
      console.warn(`Invalid WeightBalanceConfig definition: unrecognized "enabled-editable" option for load station ${id} (must be "true" or "false"). Discarding load station.`);
      return undefined;
    }

    return {
      id,
      type,
      name,
      maxEmptyWeight,
      maxLoadWeight,
      armRange,
      defaultEmptyWeight,
      defaultArm,
      defaultEnabled,
      isEmptyWeightEditable,
      isArmEditable,
      isEnabledEditable
    };
  }

  /**
   * Parses a fuel station definition from a configuration document element.
   * @param element A configuration document element.
   * @returns The fuel station definition defined by the configuration document element.
   * @throws Error if `element` is `null`.
   */
  private parseFuelStationDef(element: Element | null): WeightBalanceFuelStationDef {
    if (!element) {
      throw new Error('Invalid WeightBalanceConfig definition: missing fuel station configuration');
    }

    const armElement = element.querySelector(':scope>Arm');
    if (!armElement) {
      throw new Error('Invalid WeightBalanceConfig definition: missing fuel station arm value');
    }

    const arm = this.armUnit.convertTo(Number(armElement.textContent ?? NaN), UnitType.INCH);
    if (isFinite(arm)) {
      return { arm };
    } else {
      throw new Error('Invalid WeightBalanceConfig definition: missing or unrecognized fuel station arm value (must be a finite number)');
    }
  }

  /**
   * Parses a set of envelope options from a configuration document element.
   * @param element A configuration document element.
   * @param weightLimits Global aircraft weight limits and capacities.
   * @returns A set of envelope options defined by the configuration document element.
   * @throws Error if options could not be parsed.
   */
  private parseEnvelopeOptions(element: Element | null, weightLimits: PerformanceWeightLimits): WeightBalanceEnvelopeOptions {
    if (element === null) {
      throw new Error('Invalid WeightBalanceConfig definition: missing envelope configuration');
    }

    const defs: Readonly<WeightBalanceEnvelopeDef>[] = [];

    for (const envelopeElement of element.querySelectorAll(':scope>Envelope')) {
      const def = this.parseEnvelopeDef(envelopeElement, weightLimits);
      if (def) {
        defs.push(def);
      }
    }

    if (defs.length === 0) {
      throw new Error('Invalid WeightBalanceConfig definition: not enough envelopes configured (must be at least one)');
    }

    let defaultIndex = Number(element.getAttribute('default-index'));
    if (!Number.isInteger(defaultIndex) || defaultIndex < 0) {
      console.warn('Invalid WeightBalanceConfig definition: unrecognized "default-index" envelope option (must be a non-negative integer). Defaulting index to 0.');
      defaultIndex = 0;
    } else if (defaultIndex >= defs.length) {
      console.warn('Invalid WeightBalanceConfig definition: default envelope index does not point to a valid envelope. Defaulting index to 0.');
      defaultIndex = 0;
    }

    return {
      defaultIndex,
      defs
    };
  }

  /**
   * Parses an envelope definition from a configuration document element.
   * @param element A configuration document element.
   * @param weightLimits Global aircraft weight limits and capacities.
   * @returns The envelope definition defined by the configuration document element, or `undefined` if a definition
   * could not be parsed.
   */
  private parseEnvelopeDef(element: Element, weightLimits: PerformanceWeightLimits): WeightBalanceEnvelopeDef | undefined {
    const name = element.getAttribute('name');
    if (name === null) {
      console.warn('Invalid WeightBalanceConfig definition: missing envelope "name" option. Discarding envelope.');
      return undefined;
    }

    const minWeight = this.parseWeight(element.getAttribute('min-weight'));
    if (minWeight === undefined || minWeight === null || minWeight < 0) {
      console.warn(`Invalid WeightBalanceConfig definition: unrecognized "min-weight" option for envelope ${name} (must be a finite non-negative number). Discarding envelope.`);
      return undefined;
    }

    const maxWeight = this.parseWeight(element.getAttribute('max-weight'));
    if (maxWeight === undefined || maxWeight === null || maxWeight <= minWeight) {
      console.warn(`Invalid WeightBalanceConfig definition: unrecognized "max-weight" option for envelope ${name} (must be a finite number greater than the minimum weight). Discarding envelope.`);
      return undefined;
    }

    const maxZeroFuelWeight = this.parseWeight(element.getAttribute('max-zero-fuel-weight'), weightLimits.maxZeroFuel.asUnit(UnitType.POUND));
    if (maxZeroFuelWeight === undefined || maxZeroFuelWeight < 0) {
      console.warn(`Invalid WeightBalanceConfig definition: unrecognized "max-zero-fuel-weight" option for envelope ${name} (must be a finite number non-negative number). Discarding envelope.`);
      return undefined;
    }

    const maxRampWeight = this.parseWeight(element.getAttribute('max-ramp-weight'), weightLimits.maxRamp.asUnit(UnitType.POUND));
    if (maxRampWeight === undefined || maxRampWeight < 0) {
      console.warn(`Invalid WeightBalanceConfig definition: unrecognized "max-ramp-weight" option for envelope ${name} (must be a finite number non-negative number). Discarding envelope.`);
      return undefined;
    }

    const maxTakeoffWeight = this.parseWeight(element.getAttribute('max-takeoff-weight'), weightLimits.maxTakeoff.asUnit(UnitType.POUND));
    if (maxTakeoffWeight === undefined || maxTakeoffWeight < 0) {
      console.warn(`Invalid WeightBalanceConfig definition: unrecognized "max-takeoff-weight" option for envelope ${name} (must be a finite number non-negative number). Discarding envelope.`);
      return undefined;
    }

    const maxLandingWeight = this.parseWeight(element.getAttribute('max-landing-weight'), weightLimits.maxLanding.asUnit(UnitType.POUND));
    if (maxLandingWeight === undefined || maxLandingWeight < 0) {
      console.warn(`Invalid WeightBalanceConfig definition: unrecognized "max-landing-weight" option for envelope ${name} (must be a finite number non-negative number). Discarding envelope.`);
      return undefined;
    }

    const useMac = ConfigUtils.parseBoolean(element.getAttribute('use-mac'), false);
    if (useMac === undefined) {
      console.warn(`Invalid WeightBalanceConfig definition: unrecognized "use-mac" option for envelope ${name} (must be "true" or "false"). Discarding envelope.`);
      return undefined;
    }
    if (useMac && !this.macArm) {
      console.warn(`Invalid WeightBalanceConfig definition: "use-mac" option for envelope ${name} is "true" but MAC is not defined. Discarding envelope.`);
      return undefined;
    }

    let minArmBreakpoints: [number, number][];
    const minArmElement = element.querySelector(':scope>MinimumArm');
    if (!minArmElement) {
      console.warn(`Invalid WeightBalanceConfig definition: missing minimum arm configuration for envelope ${name}. Discarding envelope.`);
      return undefined;
    }
    try {
      minArmBreakpoints = this.parseEnvelopeArmBreakpoints(minWeight, maxWeight, minArmElement, useMac ? this.macArm : undefined);
    } catch (e) {
      console.warn(e);
      console.warn(`Invalid WeightBalanceConfig definition: an error was encountered when parsing minimum arm configuration for envelope ${name}. Discarding envelope.`);
      return undefined;
    }

    let maxArmBreakpoints: [number, number][];
    const maxArmElement = element.querySelector(':scope>MaximumArm');
    if (!maxArmElement) {
      console.warn(`Invalid WeightBalanceConfig definition: missing maximum arm configuration for envelope ${name}. Discarding envelope.`);
      return undefined;
    }
    try {
      maxArmBreakpoints = this.parseEnvelopeArmBreakpoints(minWeight, maxWeight, maxArmElement, useMac ? this.macArm : undefined);
    } catch (e) {
      console.warn(e);
      console.warn(`Invalid WeightBalanceConfig definition: an error was encountered when parsing maximum arm configuration for envelope ${name}. Discarding envelope.`);
      return undefined;
    }

    const getMinArm = G3000WeightBalanceUtils.getEnvelopeMinArm.bind(undefined, minArmBreakpoints);
    const getMaxArm = G3000WeightBalanceUtils.getEnvelopeMaxArm.bind(undefined, maxArmBreakpoints);

    // Validate arm breakpoints to ensure that the lines defined by the minimum and maximum breakpoints never cross.
    for (let i = 0; i < minArmBreakpoints.length; i++) {
      const [arm, weight] = minArmBreakpoints[i];

      if (getMaxArm(weight) < arm) {
        console.warn(`Invalid WeightBalanceConfig definition: minimum arm breakpoint at [${useMac ? `${MathUtils.lerp(arm, this.macArm![0], this.macArm![1], 0, 100)}% MAC` : `${this.armUnit.convertFrom(arm, UnitType.INCH)} ${this.armUnit.name}`}, ${weight} lb] for envelope ${name} is less than the maximum arm at the same weight. Discarding envelope.`);
        return undefined;
      }
    }

    const graphScaleDef = this.parseEnvelopeGraphScaleDef(element.querySelector(':scope>GraphScale'), useMac ? this.macArm : undefined);
    const largeGraphScaleDef = this.parseEnvelopeGraphScaleDef(element.querySelector(':scope>LargeGraphScale'), useMac ? this.macArm : undefined) ?? graphScaleDef;
    const smallGraphScaleDef = this.parseEnvelopeGraphScaleDef(element.querySelector(':scope>SmallGraphScale'), useMac ? this.macArm : undefined) ?? graphScaleDef;

    if (!largeGraphScaleDef || !smallGraphScaleDef) {
      console.warn(`Invalid WeightBalanceConfig definition: missing graph scale configuration for envelope ${name}. Discarding envelope.`);
      return undefined;
    }

    return {
      name,
      minWeight,
      maxWeight,
      maxZeroFuelWeight,
      maxRampWeight,
      maxTakeoffWeight,
      maxLandingWeight,
      useMac,
      minArmBreakpoints,
      maxArmBreakpoints,
      getMinArm,
      getMaxArm,
      largeGraphScaleDef,
      smallGraphScaleDef
    };
  }

  /**
   * Parses an array of envelope moment arm breakpoints from a configuration document element.
   * @param minWeight The minimum envelope weight, in pounds.
   * @param maxWeight The maximum envelope weight, in pounds.
   * @param element A configuration document element.
   * @param macArm The MAC moment arm limits, as `[lemac, temac]` in inches. If defined, then the moment arm
   * breakpoints will be parsed under the assumption that the moment arm values are expressed in units of percent MAC.
   * @returns An array containing the envelope moment arm breakpoints defined by the configuration document element.
   * Each breakpoint is expressed as `[arm (inches), weight (pounds)]`.
   * @throws Error if a valid breakpoint array could not be parsed.
   */
  private parseEnvelopeArmBreakpoints(minWeight: number, maxWeight: number, element: Element, macArm?: ReadonlyFloat64Array): [number, number][] {
    const parsedBreakpoints = element.textContent ? JSON.parse(element.textContent) : [];
    const breakpoints: [number, number][] = [];

    if (!Array.isArray(parsedBreakpoints)) {
      throw new Error('Invalid WeightBalanceConfig definition: envelope arm breakpoints is not an array');
    }

    const convertArm = macArm
      ? (parsedArm: number): number => MathUtils.lerp(parsedArm, 0, 100, macArm[0], macArm[1])
      : (parsedArm: number): number => this.armUnit.convertTo(parsedArm, UnitType.INCH);

    let lastWeight = -Infinity;
    let lastArm = 0;
    for (let i = 0; i < parsedBreakpoints.length; i++) {
      const parsedBreakpoint = parsedBreakpoints[i];
      if (
        !Array.isArray(parsedBreakpoint)
        || parsedBreakpoint.length !== 2
        || typeof parsedBreakpoint[0] !== 'number'
        || typeof parsedBreakpoint[1] !== 'number'
      ) {
        throw new Error('Invalid WeightBalanceConfig definition: envelope arm breakpoint is not a numeric 2-tuple');
      }

      const arm = convertArm(parsedBreakpoint[0]);
      const weight = this.weightUnit.convertTo(parsedBreakpoint[1], UnitType.POUND);

      if (!isFinite(weight) || weight < 0) {
        throw new Error('Invalid WeightBalanceConfig definition: unrecognized envelope arm breakpoint weight (must be a finite non-negative number)');
      }
      if (weight < lastWeight) {
        throw new Error('Invalid WeightBalanceConfig definition: envelope arm breakpoint weight is less than a previous breakpoint weight');
      }

      if (!isFinite(arm)) {
        throw new Error('Invalid WeightBalanceConfig definition: unrecognized envelope arm breakpoint arm (must be a finite number)');
      }

      // Check to see if we need to add a breakpoint at the minimum weight.
      if (weight > minWeight && lastWeight < minWeight) {
        if (lastWeight === -Infinity) {
          breakpoints[0] = [arm, minWeight];
        } else {
          breakpoints[0] = [MathUtils.lerp(minWeight, lastWeight, weight, lastArm, arm), minWeight];
        }
      }

      if (weight >= minWeight && weight <= maxWeight) {
        const breakpoint = [arm, weight] as [number, number];

        // If the current breakpoint weight is the minimum weight, then always insert the breakpoint at the beginning
        // of the array to ensure that there is only one breakpoint at the minimum weight. Otherwise, push the
        // breakpoint to the end of the array.
        if (weight === minWeight) {
          breakpoints[0] = breakpoint;
        } else {
          breakpoints.push(breakpoint);
        }
      }

      // Check to see if we need to add a breakpoint at the maximum weight.
      if (weight > maxWeight && lastWeight < maxWeight) {
        if (lastWeight === -Infinity) {
          breakpoints.push([arm, maxWeight]);
        } else {
          breakpoints.push([MathUtils.lerp(maxWeight, lastWeight, weight, lastArm, arm), maxWeight]);
        }
      }

      // If the current breakpoint weight is greater than or equal to the maximum envelope weight, then skip the rest
      // of the breakpoints because they do not contain useful data.
      if (weight >= maxWeight) {
        break;
      }

      lastWeight = weight;
      lastArm = arm;
    }

    if (breakpoints.length === 0) {
      throw new Error('Invalid WeightBalanceConfig definition: no envelope arm breakpoints defined');
    }

    // Check to see if we need to add a breakpoint at the maximum weight.
    const lastBreakpoint = breakpoints[breakpoints.length - 1];
    if (lastBreakpoint[1] < maxWeight) {
      breakpoints.push([lastBreakpoint[0], maxWeight]);
    }

    return breakpoints;
  }

  /**
   * Parses an envelope graph scale definition from a configuration document element.
   * @param element A configuration document element.
   * @param macArm The MAC moment arm limits, as `[lemac, temac]` in inches. If defined, then the moment arm
   * breakpoints will be parsed under the assumption that the moment arm values are expressed in units of percent MAC.
   * @returns An envelope graph scale definition defined by the configuration document element, or `undefined` if a
   * definition could not be parsed.
   */
  private parseEnvelopeGraphScaleDef(element: Element | null, macArm?: ReadonlyFloat64Array): WeightBalanceEnvelopeGraphScaleDef | undefined {
    if (element === null) {
      return undefined;
    }

    const minWeight = this.parseWeight(element.getAttribute('min-weight'));
    if (minWeight === null || minWeight === undefined) {
      console.warn('Invalid WeightBalanceConfig definition: unrecognized envelope graph scale "min-weight" option (must be a finite number). Discarding graph scale.');
      return undefined;
    }

    const maxWeight = this.parseWeight(element.getAttribute('max-weight'));
    if (maxWeight === null || maxWeight === undefined || maxWeight <= minWeight) {
      console.warn('Invalid WeightBalanceConfig definition: unrecognized envelope graph scale "max-weight" option (must be a finite number greater than the minimum weight). Discarding graph scale.');
      return undefined;
    }

    const convertArm = macArm
      ? (parsedArm: number): number => MathUtils.lerp(parsedArm, 0, 100, macArm[0], macArm[1])
      : (parsedArm: number): number => this.armUnit.convertTo(parsedArm, UnitType.INCH);

    const minArm = convertArm(Number(element.getAttribute('min-arm') ?? NaN));
    if (!isFinite(minArm)) {
      console.warn('Invalid WeightBalanceConfig definition: unrecognized envelope graph scale "min-arm" option (must be a finite number). Discarding graph scale.');
      return undefined;
    }

    const maxArm = convertArm(Number(element.getAttribute('max-arm') ?? NaN));
    if (!isFinite(maxArm) || maxArm <= minArm) {
      console.warn('Invalid WeightBalanceConfig definition: unrecognized envelope graph scale "max-arm" option (must be a finite number greater than the minimum arm). Discarding graph scale.');
      return undefined;
    }

    return {
      minWeight,
      maxWeight,
      minArm,
      maxArm
    };
  }
}

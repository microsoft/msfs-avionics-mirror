import { ReadonlyFloat64Array } from '@microsoft/msfs-sdk';

/**
 * Types of weight and balance load stations.
 */
export enum WeightBalanceLoadStationType {
  Operating = 'Operating',
  Passenger = 'Passenger',
  Cargo = 'Cargo'
}

/**
 * A definition for a weight and balance load station.
 */
export type WeightBalanceLoadStationDef = {
  /** The station's ID. */
  id: string;

  /** The station's type. */
  type: WeightBalanceLoadStationType;

  /** The station's name. */
  name: string;

  /** The station's maximum allowable empty weight, in pounds. */
  maxEmptyWeight: number;

  /** The station's maximum allowable load weight, in pounds. */
  maxLoadWeight: number;

  /** The range of valid moment arm values for the station, as `[minimum, maximum]` in inches. */
  armRange: ReadonlyFloat64Array;

  /** The station's default empty weight, in pounds. */
  defaultEmptyWeight: number;

  /** The station's default moment arm, in inches. */
  defaultArm: number;

  /** Whether the station is enabled by default. */
  defaultEnabled: boolean;

  /** Whether the station's empty weight is user editable. */
  isEmptyWeightEditable: boolean;

  /** Whether the station's moment arm is user editable. */
  isArmEditable: boolean;

  /** Whether the station's enabled state is user editable. */
  isEnabledEditable: boolean;
};

/**
 * A definition for a weight and balance fuel station.
 */
export type WeightBalanceFuelStationDef = {
  /**
   * The station's moment arm, in inches.
   */
  arm: number;
};

/**
 * Options for weight and balance envelopes.
 */
export type WeightBalanceEnvelopeOptions = {
  /** The index of the default envelope. */
  defaultIndex: number;

  /** An array of definitions for envelopes. */
  defs: readonly Readonly<WeightBalanceEnvelopeDef>[];
};

/**
 * A definition for weight and balance graph scales.
 */
export type WeightBalanceEnvelopeGraphScaleDef = {
  /** The minimum weight, in pounds, displayed on the graph scale. */
  minWeight: number;

  /** The maximum weight, in pounds, displayed on the graph scale. */
  maxWeight: number;

  /** The minimum moment arm, in inches, displayed on the graph scale. */
  minArm: number;

  /** The maximum moment arm, in inches, displayed on the graph scale. */
  maxArm: number;
};

/**
 * A definition for a weight and balance envelope.
 */
export type WeightBalanceEnvelopeDef = {
  /** The envelope's name. */
  name: string;

  /** The envelope's minimum weight, in pounds. */
  minWeight: number;

  /** The envelope's maximum weight, in pounds. */
  maxWeight: number;

  /** The envelope's maximum zero-fuel weight, in pounds. */
  maxZeroFuelWeight: number;

  /** The envelope's maximum ramp weight, in pounds. */
  maxRampWeight: number;

  /** The envelope's maximum takeoff weight, in pounds. */
  maxTakeoffWeight: number;

  /** The envelope's maximum landing weight, in pounds. */
  maxLandingWeight: number;

  /** Whether the envelope's minimum and maximum moment arm values should be displayed as percent MAC. */
  useMac: boolean;

  /**
   * The breakpoints for the envelope's minimum moment arm values, as `[arm (inches), weight (pounds)]`. The
   * breakpoints are ordered such that weight is monotonically increasing. The first breakpoint is guaranteed to be
   * at the envelope's minimum weight, and the last breakpoint is guaranteed to be at the envelope's maximum weight.
   */
  minArmBreakpoints: readonly (readonly [number, number])[];

  /**
   * The breakpoints for the envelope's maximum moment arm values, as `[arm (inches), weight (pounds)]`. The
   * breakpoints are ordered such that weight is monotonically increasing. The first breakpoint is guaranteed to be
   * at the envelope's minimum weight, and the last breakpoint is guaranteed to be at the envelope's maximum weight.
   */
  maxArmBreakpoints: readonly (readonly [number, number])[];

  /** A function that gets the envelope's minimum moment arm in inches for a given weight in pounds. */
  getMinArm: (weight: number) => number;

  /** A function that gets the envelope's maximum moment arm in inches for a given weight in pounds. */
  getMaxArm: (weight: number) => number;

  /** The definition for the scales to use when the envelope is displayed on a large graph. */
  largeGraphScaleDef: Readonly<WeightBalanceEnvelopeGraphScaleDef>;

  /** The definition for the scales to use when the envelope is displayed on a small graph.  */
  smallGraphScaleDef: Readonly<WeightBalanceEnvelopeGraphScaleDef>;
};

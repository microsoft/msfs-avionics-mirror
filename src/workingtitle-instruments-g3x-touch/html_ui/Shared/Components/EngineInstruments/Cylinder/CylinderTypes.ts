import { NodeReference } from '@microsoft/msfs-sdk';

/** Container for the state of a single column. */
export type CylinderColumn = {
  /** Reference to the cylinder egt column. */
  egtColumnRef: NodeReference<HTMLDivElement>;
  /** Reference to the cylinder egt peak column. */
  egtColumnPeakRef: NodeReference<HTMLDivElement>;
  /** Reference to the cylinder CHT indicator. */
  chtIndicatorRef: NodeReference<HTMLDivElement>;
  /** Reference to the cylinder CHT peak label. */
  chtPeakLabelRef: NodeReference<HTMLDivElement>;
  /** Reference to the cylinder number label. */
  numLabelRef: NodeReference<HTMLSpanElement>;
  /** Reference to cylinder CHT value label. */
  chtValueRef: NodeReference<HTMLDivElement>;
  /** Reference to cylinder EGT value label. */
  egtValueRef: NodeReference<HTMLDivElement>;
  /** cylinder data storage. */
  cylinder: CylinderTypes;
}

/**
 * Cylinder data class, stores the last CHT and EGT readings and provides methods to
 * simulate GAMI spread on its values.
 */
export class CylinderTypes {
  private _lastChtReading = 0;
  private _lastEgtReading = 0;

  /** Lean peak temperature. */
  public leaningPeak = 0;
  /** Lean peak temperature candidate. */
  public leaningPriorTemp = 0;
  /** Delta between current cylinder temperature and lean peak. */
  public peakDelta = 0;

  /**
   * Constructor.
   * @param chtRandomizeFactor - The CHT GAMI randomize factor.
   * @param egtRandomizeFactor - The EGT GAMI randomize factor.
   * @param _egtDelayFactor -  - The EGT GAMI delay factor.
   */
  constructor(private chtRandomizeFactor: number, private egtRandomizeFactor: number, private _egtDelayFactor: number) {
  }

  /**
   * Gets CHT value, apply GAMI spread factor and store the result as last CHT reading.
   * @param value The target temperature.
   * @returns An adjusted temperature.
   */
  public setChtValue(value: number): number {
    this._lastChtReading = Math.round(value * this.chtRandomizeFactor);
    return this._lastChtReading;
  }

  /**
   * Gets EGT value, apply GAMI spread factor and store the result as last EGT reading.
   * @param value - The target temperature.
   * @returns An adjusted temperature.
   */
  public setEgtValue(value: number): number {
    this._lastEgtReading = Math.round(value * this.egtRandomizeFactor);
    return this._lastEgtReading;
  }

  /**
   * Get the EGT delay factor, is used to simulate different EGT dynamics.
   * @returns The delay factor in ms.
   */
  public get egtDelayFactor(): number {
    return this._egtDelayFactor;
  }

  /**
   * Get the last adjusted CHT reading.
   * @returns Guess.
   */
  public get lastChtReading(): number {
    return this._lastChtReading;
  }

  /**
   * Get the last adjusted EGT reading.
   * @returns Guess.
   */
  public get lastEgtReading(): number {
    return this._lastEgtReading;
  }
}
import { XMLGaugeColorLine } from '@microsoft/msfs-sdk';


export enum G3XGaugeColorLineColor {
  Red = 'var(--g3x-color-red)',
  Yellow = 'var(--g3x-color-yellow)',
  Green = 'var(--g3x-color-green)',
  White = 'var(--wt-g3x-touch-white)',
  Cyan = 'var(--g3x-color-cyan)',
}

/**
 * Color Zone for a gauge.
 */
export interface G3XGaugeColorLine extends XMLGaugeColorLine {

  /** The enum of the color to use. */
  color: G3XGaugeColorLineColor,
}
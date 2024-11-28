import { XMLGaugeColorZone } from '@microsoft/msfs-sdk';


export enum G3XGaugeColorZoneColor {
  Red = 'var(--g3x-color-red)',
  Yellow = 'var(--g3x-color-yellow)',
  Green = 'var(--g3x-color-green)',
  White = 'var(--g3x-color-white)',
  Cyan = 'var(--g3x-color-cyan)',
  Black = 'var(--g3x-color-black)'
}

/**
 * Color Zone for a gauge.
 */
export interface G3XGaugeColorZone extends XMLGaugeColorZone {
  /** The enum of the color to use. */
  color: G3XGaugeColorZoneColor,
}
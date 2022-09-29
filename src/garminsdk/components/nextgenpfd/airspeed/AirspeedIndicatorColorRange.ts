import { AirspeedDefinitionFactory } from './AirspeedDefinitionFactory';

/**
 * Width options for airspeed indicator color ranges.
 */
export enum AirspeedIndicatorColorRangeWidth {
  Full = 'Full',
  Half = 'Half'
}

/**
 * Color options for airspeed indicator color ranges.
 */
export enum AirspeedIndicatorColorRangeColor {
  Red = 'Red',
  Yellow = 'Yellow',
  White = 'White',
  Green = 'Green',
  BarberPole = 'BarberPole'
}

/**
 * An airspeed indicator color range.
 */
export type AirspeedIndicatorColorRange = {
  /** The width of this color range. */
  readonly width: AirspeedIndicatorColorRangeWidth;

  /** The color of this color range. */
  readonly color: AirspeedIndicatorColorRangeColor;

  /** A factory which generates the minimum speed of this color range, in knots. */
  readonly minimum: AirspeedDefinitionFactory;

  /** A factory which generates the maximum speed of this color range, in knots. */
  readonly maximum: AirspeedDefinitionFactory;
};
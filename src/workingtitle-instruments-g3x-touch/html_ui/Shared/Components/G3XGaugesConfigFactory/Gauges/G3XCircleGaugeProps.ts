import { G3XGaugeProps } from '../Definitions';
import { G3XGaugeStyle } from '../Definitions/G3XGaugeStyle';

/** Gauges for a circular gauge */
export interface G3XCircleGaugeProps extends G3XGaugeProps {
  /** A style */
  style: Partial<G3XCircularGaugeStyle>,
  /** if gauge displays twin engine */
  isTwinEngine: boolean;
}

/** A circular gauge style definition */
export interface G3XCircularGaugeStyle extends G3XGaugeStyle {
  /** The arc position to begin on. */
  beginAngle: number,
  /** The arc position to end on. */
  endAngle: number,
  /** The value gradation for the numeric text fields */
  textIncrement: number,
  /** The value precision for the numeric text fields. */
  valuePrecision: number,
  /** Display relative value. */
  displayRelativeValue: boolean,
}
import { G3XPeakingGaugeProps } from './G3XPeakingGaugeProps';
import { G3XGaugeStyle } from '../Definitions/G3XGaugeStyle';

/** Props for a single pointer linear gauges */
export interface G3XLinearGaugeProps extends G3XPeakingGaugeProps {
  /** A style */
  style: Partial<G3XGaugeStyle>,
}
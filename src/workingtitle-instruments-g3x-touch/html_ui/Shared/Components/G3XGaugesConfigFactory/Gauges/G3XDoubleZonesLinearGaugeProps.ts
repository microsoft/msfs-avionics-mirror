import { G3XLinearGaugeProps } from './G3XLinearGaugeProps';
import { G3XGaugeStyle } from '../Definitions/G3XGaugeStyle';

/** Gauges for a horizontal gauge */
export interface G3XDoubleZonesLinearGaugeProps extends G3XLinearGaugeProps {
  /** A style */
  style: Partial<G3XDoubleLinearVerticalGaugeStyle>,
}

/** A circular gauge style definition */
export interface G3XDoubleLinearVerticalGaugeStyle extends G3XGaugeStyle {
  /** Use Wide Colour Zones */
  useDoubleZones: boolean;
  /** The width of the text row */
  valuesTextRowWidth: string;
}
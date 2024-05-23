import { G3XGaugeProps } from './G3XGaugeProps';
import { G3XGaugeType } from './G3XGaugeType';
import { G3XGaugeColumnProps } from './G3XGaugeColumnProps';
import { G3XGaugeRowProps } from './G3XGaugeRowProps';
import { G3XTextElementProps } from '../../EngineInstruments/Text/G3XTextGauge';
import { G3XFuelCalculatorProps } from './G3XFuelCalculatorProps';

/**
 * set of types that allowed for Gauge Spec configuration
 */
export type G3XGaugeSpecConfig = G3XGaugeProps | G3XGaugeColumnProps | G3XGaugeRowProps | G3XTextElementProps | G3XFuelCalculatorProps;

/**
 * The specification for a single gauge configuration.
 */
export type G3XGaugeSpec = {
  /** The type of gauge this is. */
  gaugeType: G3XGaugeType,
  /** Configuration for the gauge. */
  configuration: G3XGaugeSpecConfig,
}
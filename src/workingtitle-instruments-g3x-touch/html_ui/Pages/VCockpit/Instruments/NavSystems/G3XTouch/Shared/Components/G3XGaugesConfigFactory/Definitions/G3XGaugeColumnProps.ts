import { ComponentProps, CompositeLogicXMLHost, EventBus } from '@microsoft/msfs-sdk';

import { G3XGaugeSpec } from './G3XGaugeSpec';
import { G3XGaugeStyle } from './G3XGaugeStyle';

/**
 * Styling options for a gauge column.
 */
export interface G3XGaugeColumnStyle extends G3XGaugeStyle {
  /** The width of the column. */
  width?: string;

  /** The justify-content style of the column. */
  justifyContent?: string;
}

/**
 * Component props for a gauge column.
 */
export interface G3XGaugeColumnProps extends ComponentProps {
  /** CSS class(es) to add to the column's root element. */
  class?: string;
  /** The event bus, to give to any gauges that need it. */
  bus: EventBus;
  /** The logic handler. */
  logicHost?: CompositeLogicXMLHost;
  /** The label for this column. */
  label?: string;
  /** Whether to show an outline around the column. */
  outline?: boolean;
  /** An array of gauges to show. */
  gaugeConfig: Array<G3XGaugeSpec>;
  /** The style to use for the column. */
  style: Partial<G3XGaugeColumnStyle>;
}

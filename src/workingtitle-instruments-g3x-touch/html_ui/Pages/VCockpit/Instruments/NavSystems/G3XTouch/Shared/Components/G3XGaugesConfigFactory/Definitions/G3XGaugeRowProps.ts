import { ComponentProps, EventBus } from '@microsoft/msfs-sdk';

import { G3XGaugeColumnProps } from './G3XGaugeColumnProps';
import { G3XGaugeStyle } from './G3XGaugeStyle';

/** Properties of a row. */
export interface G3XGaugeRowProps extends ComponentProps {
  /** CSS class(es) to add to the row's root element. */
  class?: string;
  /** An event bus for our contained gauges that need it. */
  bus: EventBus;
  /** The label for the column. */
  label?: string;
  /** Whether to show an outline around the column. */
  outline?: boolean;
  /** The columns in the group. */
  columns: Array<G3XGaugeColumnProps>;
  /** The style to use for the row. */
  style: Partial<G3XGaugeStyle>;
}

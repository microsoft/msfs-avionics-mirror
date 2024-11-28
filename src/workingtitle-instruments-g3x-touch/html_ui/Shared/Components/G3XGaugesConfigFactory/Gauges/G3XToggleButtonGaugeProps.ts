import { EventBus } from '@microsoft/msfs-sdk';

import { G3XGaugeProps } from '../Definitions/G3XGaugeProps';

/** Properties of gauge button. */
export interface G3XToggleButtonGaugeProps extends G3XGaugeProps {
  /** The event bus. */
  bus: EventBus;

  /** The event bus topic to which to bind the button's state. */
  event: string;

  /** Whether to sync to other instruments the data that the button publishes to the event bus. */
  sync: boolean;

  /** Whether to cache the data that the button publishes to the event bus. */
  cached: boolean;

  /** The button's label. */
  label?: string;
}
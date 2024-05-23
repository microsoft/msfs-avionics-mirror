import { EventBus } from '@microsoft/msfs-sdk';

import { G3XGaugeProps } from '../Definitions';

/** Gauges for a gauge which can  display peaks */
export interface G3XPeakingGaugeProps extends G3XGaugeProps {
  /** An event bus for leaning events. */
  bus: EventBus,
  /** Should we show peak */
  allowPeakMode?: boolean,
  /** The event to trigger when peak mode is toggled. */
  peakModeTriggerBusEvent?: string,
  /** Display peak visuals in header. */
  reflectPeakModeInHeader?: boolean,
}
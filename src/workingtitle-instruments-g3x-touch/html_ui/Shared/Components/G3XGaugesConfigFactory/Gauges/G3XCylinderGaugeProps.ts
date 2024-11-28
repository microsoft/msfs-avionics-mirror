import { EventBus } from '@microsoft/msfs-sdk';

import { G3XGaugeProps } from '../Definitions/G3XGaugeProps';
import { G3XGaugeStyle } from '../Definitions/G3XGaugeStyle';

/** Gauges for a cylinder gauge */
export interface G3XCylinderGaugeProps extends G3XGaugeProps {
  /** An event bus for leaning events. */
  bus: EventBus;
  /** The number of cylinders per engine. */
  numCylinders: number;
  /** The event to trigger when peak mode is toggled. */
  peakModeTriggerBusEvent?: string;
  /** What's the order of the hottest cylinders? */
  tempOrder?: Array<number>;
  /** The gauge styling. */
  style: Partial<G3XCylinderGaugeStyle>;
  /** EGT value for second engine. */
  value3: CompositeLogicXMLElement;
  /** CHT value for second engine. */
  value4: CompositeLogicXMLElement;
  /** Ticks lines for EGT. */
  egtTicks: CompositeLogicXMLElement[];
  /** if gauge displays twin engine */
  isTwinEngine: boolean;
}

/** A cylinder gauge style definition. */
export interface G3XCylinderGaugeStyle extends G3XGaugeStyle {
  /** Should we show peak temperatures when leaning? */
  peakTemps?: boolean;
  /** Show color lines on top of cylinders. EIS Stripe displaying lines on top while
   * Engine Display displaying lines below cylinders */
  displayColorLinesOnTop?: boolean;
}
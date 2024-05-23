import { ComponentProps, XMLGaugeColorLine } from '@microsoft/msfs-sdk';
import { G3XGaugeColorZone } from './G3XGaugeColorZone';
import { G3XGaugeStyle } from './G3XGaugeStyle';
import { G3XGaugeColorLine } from './G3XGaugeColorLine';

/** Props for G3XGauge with color zones */
export interface G3XGaugeProps extends ComponentProps {
  /** A list of color zones. */
  colorZones: G3XGaugeColorZone[];
  /** A list of color zones for double gauge. */
  colorZones2?: G3XGaugeColorZone[];
  /** A list of colir lines. */
  colorLines2: Array<XMLGaugeColorLine>;
  /** The minimum2 value. */
  minimum2: CompositeLogicXMLElement;
  /** The maximum2 value. */
  maximum2: CompositeLogicXMLElement;
  /** Style for the gauge*/
  style: Partial<G3XGaugeStyle>;
  /** An optional smoothing factor for value changes. */
  smoothFactor?: number;
  /** The minimum value. */
  minimum: CompositeLogicXMLElement;
  /** The maximum value. */
  maximum: CompositeLogicXMLElement;
  /** A list of colir lines. */
  colorLines: Array<G3XGaugeColorLine>;
  /** The first possible value. */
  value1: CompositeLogicXMLElement;
  /** The second possible value for dual elements. */
  value2: CompositeLogicXMLElement;
  /** The title of the gauge. */
  title: string;
  /** The units measured by the gauge. */
  unit: string;
  /** The length of individual graduations. */
  graduationLength: number;
  /** Do the graduations have text? */
  graduationHasText: boolean;
  /** Text at the beginning of the gauge. */
  beginText: string;
  /** Text at the end of the gauge. */
  endText: string;
  /** The label of the first cursor. */
  cursorText1: string;
  /** The labe of the second cursor, for  */
  cursorText2: string;
  /** The identifier to assign to the `data-checklist` attribute of the gauge's root element. */
  dataChecklistId: string;
  /** Any triggers for blinking the element red. */
  redBlink: CompositeLogicXMLElement;
}
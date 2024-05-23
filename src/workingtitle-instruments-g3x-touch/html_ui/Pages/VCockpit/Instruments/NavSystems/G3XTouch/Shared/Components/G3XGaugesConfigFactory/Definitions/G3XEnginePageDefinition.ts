import { G3XFunction } from './G3XFunction';
import { G3XGaugeSpec } from './G3XGaugeSpec';

/**
 * A definition for rendering a G3X Touch MFD engine page.
 */
export type G3XEnginePageDefinition = {
  /** Any configured functions. */
  functions: Map<string, G3XFunction>;

  /** The content of the engine page. */
  content: G3XEnginePageTabDefinition[] | G3XEnginePageGaugesDefinition;
};

/**
 * A definition describing a set of gauges to render within the MFD engine page.
 */
export type G3XEnginePageGaugesDefinition = {
  /** The gauges config for the page. */
  gaugeConfig?: G3XGaugeSpec[];

  /** The gauges config for the page in fullscreen mode. */
  fullscreenGaugeConfig?: G3XGaugeSpec[];

  /** The gauges config for the page in splitscreen mode. */
  splitscreenGaugeConfig?: G3XGaugeSpec[];
};

/**
 * Types of MFD engine page tabs.
 */
export enum G3XEnginePageTabType {
  Simple = 'Simple',
  FuelCalculator = 'Fuel Calculator'
}

/**
 * A base definition for an MFD engine page tab.
 */
type G3XEnginePageBaseTabDefinition = {
  /** The label for the tab. */
  label: string;
};

/**
 * A definition for a simple MFD engine page tab.
 */
export type G3XEnginePageSimpleTabDefinition = G3XEnginePageBaseTabDefinition & {
  /** The type of the tab. */
  type: G3XEnginePageTabType.Simple;

  /** A definition describing the gauges to render in the tab. */
  gaugesDef: G3XEnginePageGaugesDefinition;
};

/**
 * A definition for a fuel calculator MFD engine page tab.
 */
export type G3XEnginePageFuelCalcTabDefinition = G3XEnginePageBaseTabDefinition & {
  /** The type of the tab. */
  type: G3XEnginePageTabType.FuelCalculator;

  /** A definition describing the gauges to render in the tab. */
  gaugesDef: G3XEnginePageGaugesDefinition;

  /** The first preset fuel amount supported by the fuel calculator, in gallons. */
  presetFuel1?: number;

  /** The second preset fuel amount supported by the fuel calculator, in gallons. */
  presetFuel2?: number;
};

/**
 * A definition for an MFD engine page tab.
 */
export type G3XEnginePageTabDefinition = G3XEnginePageSimpleTabDefinition | G3XEnginePageFuelCalcTabDefinition;

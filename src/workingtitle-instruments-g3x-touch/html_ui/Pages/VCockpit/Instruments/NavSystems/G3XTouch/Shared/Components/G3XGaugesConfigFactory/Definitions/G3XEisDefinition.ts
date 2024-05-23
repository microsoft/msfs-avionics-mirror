import { G3XFunction } from './G3XFunction';
import { G3XGaugeSpec } from './G3XGaugeSpec';
import { EisSizes } from '../../../CommonTypes';

/**
 * A definition for rendering a G3X Touch EIS.
 */
export type G3XEisDefinition = {
  /** The size of the EIS. */
  size: EisSizes;

  /** Any configured functions. */
  functions: Map<string, G3XFunction>;

  /** The gauges configuration in default mode (when the MFD engine page is not visible). */
  defaultGauges: G3XGaugeSpec[];

  /**
   * The gauges configuration in combined mode (when the MFD engine page is visible), or `undefined` if combined mode
   * is not supported.
   */
  combinedGauges?: G3XGaugeSpec[];
}
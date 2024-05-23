import { G3XFplSource } from './G3XFplSourceTypes';

/**
 * Events related to G3X flight plan data sources.
 */
export interface G3XFplSourceEvents {
  /** The current flight plan source. */
  g3x_fpl_source_current: G3XFplSource;

  /** Whether an external flight plan source is available. */
  [g3x_fpl_source_external_available: `g3x_fpl_source_external_available_${number}`]: boolean;
}

import { ControllableDisplayPaneIndex } from '../Components/DisplayPanes/DisplayPaneTypes';
import { G3000ChartsAirportSelectionData, G3000ChartsPageSelectionData } from './G3000ChartsTypes';

/**
 * Base events related to G3000 electronic charts.
 * @experimental
 */
export interface BaseG3000ChartsEvents {
  /** The current charts airport selection. */
  charts_airport_selection: G3000ChartsAirportSelectionData | null;

  /** The current charts page selection. */
  charts_page_selection: G3000ChartsPageSelectionData | null;

  /** The ID of the current active charts page section. */
  charts_page_section: string;

  /** The current procedure preview charts page selection. */
  charts_proc_preview_page_selection: G3000ChartsPageSelectionData | null;

  /** The ID of the current active procedure preview charts page section. */
  charts_proc_preview_page_section: string;
}

/**
 * Indexed events related to G3000 electronic charts for a display pane.
 */
type IndexedEvents<Index extends ControllableDisplayPaneIndex> = {
  [P in keyof BaseG3000ChartsEvents as `${P}_${Index}`]: BaseG3000ChartsEvents[P];
};

/**
 * Events related to G3000 electronic charts.
 * @experimental
 */
export type G3000ChartsEvents = IndexedEvents<ControllableDisplayPaneIndex>;

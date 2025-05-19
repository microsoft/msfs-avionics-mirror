import { IcaoValue } from '@microsoft/msfs-sdk';

import { ControllableDisplayPaneIndex } from '../Components/DisplayPanes/DisplayPaneTypes';
import { G3000ChartsPageSelectionData } from './G3000ChartsTypes';

/**
 * Base events used to control G3000 electronic charts.
 * @experimental
 */
export interface BaseG3000ChartsControlEvents {
  /** Selects an airport. The event data is the ICAO of the airport to select. */
  charts_select_airport: IcaoValue;

  /** Selects a charts page. The event data is the data describing the page to select. */
  charts_select_page: G3000ChartsPageSelectionData;

  /** Syncs the chart airport and page selection to the current phase of flight. */
  charts_sync_pof: void;

  /** Sets the active page section. The event data is the ID of the section to set. */
  charts_set_page_section: string;

  /** Clears the charts airport and page selections. */
  charts_clear_selection: void;

  /** Selects a procedure preview charts page. The event data is the data describing the page to select. */
  charts_proc_preview_select_page: G3000ChartsPageSelectionData;

  /** Sets the active procedure preview page section. The event data is the ID of the section to set. */
  charts_proc_preview_set_page_section: string;

  /** Clears the procedure preview charts selection. */
  charts_proc_preview_clear_selection: void;
}

/**
 * Indexed events used to control G3000 electronic charts for a display pane.
 */
type IndexedEvents<Index extends ControllableDisplayPaneIndex> = {
  [P in keyof BaseG3000ChartsControlEvents as `${P}_${Index}`]: BaseG3000ChartsControlEvents[P];
};

/**
 * Events used to control G3000 electronic charts.
 * @experimental
 */
export type G3000ChartsControlEvents = IndexedEvents<ControllableDisplayPaneIndex>;

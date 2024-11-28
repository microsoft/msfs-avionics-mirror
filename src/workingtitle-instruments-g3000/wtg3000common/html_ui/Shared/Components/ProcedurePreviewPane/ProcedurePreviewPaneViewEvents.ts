import { IcaoValue } from '@microsoft/msfs-sdk';

import { ProcedureType } from '@microsoft/msfs-garminsdk';

import { DisplayPaneViewEventTypes } from '../DisplayPanes/DisplayPaneViewEvents';

/**
 * A description of a procedure to display in a procedure preview pane.
 */
export type ProcedurePreviewPaneProcData = {
  /** The type of the procedure. */
  readonly type: ProcedureType;

  /** The ICAO of the airport to which the procedure belongs. */
  readonly airportIcao: IcaoValue;

  /** The index of the procedure. */
  readonly procedureIndex: number;

  /** The index of the transition. */
  readonly transitionIndex: number;

  /** The index of the runway transition, or `-1` if there is no runway transition. */
  readonly runwayTransitionIndex: number;

  /** The designation of the runway associated with the procedure, or the empty string if there is no associated runway. */
  readonly runwayDesignation: string;
};

/**
 * Events which can be sent to procedure preview display pane views.
 */
export interface ProcedurePreviewPaneViewEventTypes extends DisplayPaneViewEventTypes {
  /** Sets the previewed procedure. */
  display_pane_procedure_preview_set: ProcedurePreviewPaneProcData;
}

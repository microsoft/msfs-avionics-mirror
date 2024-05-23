import { FlightPlan, Subject } from '@microsoft/msfs-sdk';

import { ProcedureType } from '../../../flightplan/FmsTypes';

/**
 * A module describing a flight plan procedure to be previewed.
 */
export class MapProcedurePreviewModule {
  /** The procedure type previewed by the layer. */
  public readonly procedureType = Subject.create<ProcedureType>(ProcedureType.DEPARTURE);

  /** The flight plan containing the procedure to be previewed. */
  public readonly procedurePlan = Subject.create<FlightPlan | null>(null);

  /** The flight plan containing the transitions to be previewed. */
  public readonly transitionPlan = Subject.create<FlightPlan | null>(null);
}
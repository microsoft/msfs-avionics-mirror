import { AirportFacility, ArrivalProcedure } from '@microsoft/msfs-sdk';
import { FmsUtils } from '@microsoft/msfs-garminsdk';

import { SelectDepArrStore } from './SelectDepArrStore';

/**
 * A data store for arrival selection components.
 */
export class SelectArrivalStore extends SelectDepArrStore<ArrivalProcedure> {
  /** @inheritdoc */
  protected getProcedures(airport: AirportFacility | undefined): readonly ArrivalProcedure[] {
    return airport?.arrivals ?? [];
  }

  /** @inheritdoc */
  public getTransitionName(procedure: ArrivalProcedure, transitionIndex: number, rwyTransitionIndex: number): string {
    return FmsUtils.getArrivalEnrouteTransitionName(procedure, transitionIndex, rwyTransitionIndex);
  }
}
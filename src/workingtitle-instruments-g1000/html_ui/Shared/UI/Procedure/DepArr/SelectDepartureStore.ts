import { AirportFacility, DepartureProcedure } from '@microsoft/msfs-sdk';
import { FmsUtils } from '@microsoft/msfs-garminsdk';

import { SelectDepArrStore } from './SelectDepArrStore';

/**
 * A data store for departure selection components.
 */
export class SelectDepartureStore extends SelectDepArrStore<DepartureProcedure> {
  /** @inheritdoc */
  protected getProcedures(airport: AirportFacility | undefined): readonly DepartureProcedure[] {
    return airport?.departures ?? [];
  }

  /** @inheritdoc */
  public getTransitionName(procedure: DepartureProcedure, transitionIndex: number, rwyTransitionIndex: number): string {
    return FmsUtils.getDepartureEnrouteTransitionName(procedure, transitionIndex, rwyTransitionIndex);
  }
}
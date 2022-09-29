import { Subject } from 'msfssdk';

import { FlightPlanFocus } from '../../../flightplan/FlightPlanFocus';
import { MapFlightPlanDataProvider } from '../flightplan';

/**
 *
 */
export class MapFlightPlanFocusModule {
  /**
   * Whether focus is active.
   */
  public readonly isActive = Subject.create(false);

  /**
   * Whether the flight plan has focus.
   */
  public readonly planHasFocus = Subject.create(false);

  /**
   * The flight plan focus.
   */
  public readonly focus = Subject.create<FlightPlanFocus>(null);

  /**
   * A flight plan data provider for the plan which has focus, or `null`. A data provider is required to update
   * a flight plan leg focus after its component legs have been calculated for the first time.
   */
  public readonly dataProvider = Subject.create<MapFlightPlanDataProvider | null>(null);
}
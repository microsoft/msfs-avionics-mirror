import { LegDefinition, NumberUnitInterface, ReadonlySubEvent, Subscribable, UnitFamily } from '@microsoft/msfs-sdk';

import { GarminVNavTrackAlertType } from '../../../autopilot/vnav/GarminVNavDataEvents';
import { WaypointAlertStateEvent } from '../../../navigation/WaypointAlertComputer';

/**
 * From, to, and next flight plan legs tracked by LNAV.
 */
export type NavStatusTrackedLegs = {
  /** The current nominal leg from which LNAV is tracking. */
  fromLeg: LegDefinition | null;

  /** The current nominal leg which LNAV is tracking. */
  toLeg: LegDefinition | null;

  /** The next nominal leg which LNAV is tracking. */
  nextLeg: LegDefinition | null;
};

/**
 * A data provider for a navigation status box.
 */
export interface NavStatusBoxDataProvider {
  /** The current from, to, and next flight plan legs LNAV is tracking. */
  readonly trackedLegs: Subscribable<Readonly<NavStatusTrackedLegs>>;

  /** The current active OBS course, in degrees, or `null` if OBS is inactive. */
  readonly obsCourse: Subscribable<number | null>;

  /** The current waypoint alert state. */
  readonly waypointAlertState: Subscribable<Readonly<WaypointAlertStateEvent>>;

  /** The time remaining for the current waypoint alert, or `NaN` if an alert is not active. */
  readonly waypointAlertTime: Subscribable<NumberUnitInterface<UnitFamily.Duration>>;

  /** An event that is fired when a vertical track alert is issued. The event data is the alert type. */
  readonly verticalTrackAlert: ReadonlySubEvent<void, GarminVNavTrackAlertType>;
}

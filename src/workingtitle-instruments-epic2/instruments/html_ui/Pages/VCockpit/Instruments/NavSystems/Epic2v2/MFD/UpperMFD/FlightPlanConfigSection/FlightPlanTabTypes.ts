import { Subscribable } from '@microsoft/msfs-sdk';

import { InputFieldColor } from '@microsoft/msfs-epic2-shared';

/** Top level tabs of the flight plan config section. */
export type FlightPlanConfigTopTabs = 'init' | 'ground' | 'takeoff' | 'descent';

/** Tabs inside the Init tab. */
export type InitTabTabs = 'timedate' | 'databases' | 'swident';

/** Tabs inside the Ground tab. */
export type GroundTabTabs = 'fpln' | 'altSpd' | 'fuelWeight';

/** Tabs inside the Descent tab. */
export type DescentTabTabs = 'starLanding' | 'tcomp' | 'fltSum';

/** Tabs inside the DepartureArrivalOverlay */
export type DepartureArrivalTabs = 'departure' | 'arrival';

/** An internal vspeed definition for use with vspeed input tab pages */
export interface VSpeedInputTabDefinition {
  /** The vspeed label */
  label: string
  /** The colour of the input field */
  inputColourSubject: Subscribable<InputFieldColor>
  /** The inputted data */
  inputSubject: Subscribable<number | null>
}

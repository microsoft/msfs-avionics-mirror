import { Subject } from '@microsoft/msfs-sdk';

import { FixModes, InputModes, LegModes } from '../Sr22tTripPlanningPage/Sr22tTripPlanningModes';

/** The store for the Trip Planning page data */
export class TripPlanningStore {

  // Mode subjects
  // to be set by soft keys (Auto/Manual and FPL/WPTs)
  // to be read by all panels of the Trip Planning page
  public inputMode = Subject.create(InputModes.Auto);
  public fixMode = Subject.create(FixModes.FPL);

  // Leg subjects
  // to be set by "LEG" input field of the Data Input panel on the Trip Planning page
  // to be read by the lower panels of the Trip Planning page
  public legMode = Subject.create(LegModes.LEG);
  public selectedLeg = Subject.create(1);  // index of selected leg

  // Waypoint subjects
  // to be set by waypoint input fields of the Data Input panel on the Trip Planning page
  // to be read by the lower panels of the Trip Planning page
  public fromWpt = Subject.create('');
  public toWpt = Subject.create('');

  // Data input subjects
  // to be set by the Input Data panel fields on the Trip Planning page
  // to be read by the data fields in the lower half of the Trip Planning page
  public inputData = {
    // initialize as -1 (inactive)
    departureTime: Subject.create(-1),      // UTC Hours, 14.5 = 14:30 UTC
    groundSpeed: Subject.create(-1),        // Kots, Nautical Miles per hour
    fuelFlow: Subject.create(-1),           // Gallons per hour
    fuelOnBoard: Subject.create(-1),        // Gallons
    calibratedAirspeed: Subject.create(-1), // Same as IAS, Kots, Nautical Miles per hour
    indicatedAltitude: Subject.create(-1),  // Feet
    barometricPressure: Subject.create(29.92), // inHg
    totalAirTemp: Subject.create(-1),       // degrees celcius
  };
}

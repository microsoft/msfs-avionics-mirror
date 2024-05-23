/**
 * PFD knob actions.
 */
export enum PfdKnobAction {
  /** Inner knob adjusts the heading bug; outer knob adjusts selected altitude. */
  HeadingAltitude = 'Heading/Altitude',

  /** Inner knob adjusts the flight director bug; outer knob adjusts altimeter barometric pressure setting. */
  FdBugBaro = 'FdBug/Baro',

  /** Inner knob adjusts selected course; outer knob adjusts altimeter barometric pressure setting. */
  CourseBaro = 'Course/Baro',
}

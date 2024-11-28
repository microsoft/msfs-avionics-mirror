/**
 * Events related to G3X Touch transponders.
 */
export interface G3XTransponderEvents {
  /** Whether a G3X Touch-connected transponder has determined the airplane is on the ground. */
  [g3x_xpdr_on_ground: `g3x_xpdr_on_ground_${number}`]: boolean;
}

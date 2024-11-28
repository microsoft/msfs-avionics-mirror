export enum UnsFlightAreas {
  /** Within 30 NM of the origin airport or on a SID. Default RNP 1.0 NM. */
  Departure,
  /** Not in oceanic, terminal, or approach area. Default RNP 2.0 NM. */
  EnRoute,
  /**
   * More than 200 NM from the nearest navaid, more than 30 NM from origin or destination airport,
   * and not flying a terminal area procedure. Default RNP 2.0 NM (or 4.0 NM without APM option).
   */
  Oceanic,
  /** Within 30 NM of the destination airport or on a STAR, but not on approach. Default RNP 1.0 NM. */
  Arrival,
  /** On a path between the IAF and the MAP. Default RNP 0.3 NM. */
  Approach,
  /** On a path between the MAP and the missed approach holding point (MAHWP). Default RNP 1.0 NM. */
  MissedApproach,
}

/** Default RNPs for each flight area. CDI deviation is 2 dots = RNP. */
export const UnsDefaultRnp: Record<UnsFlightAreas, number> = {
  [UnsFlightAreas.Departure]: 1.0,
  [UnsFlightAreas.EnRoute]: 2.0,
  [UnsFlightAreas.Oceanic]: 2.0, // TODO? 4.0 without APM option
  [UnsFlightAreas.Arrival]: 1.0,
  [UnsFlightAreas.Approach]: 0.3,
  [UnsFlightAreas.MissedApproach]: 1.0,
};

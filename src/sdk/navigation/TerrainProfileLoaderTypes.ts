/** A terrain profile object returned by the simulator */
export interface TerrainProfile {
  /** Coherent C++ object binding type. */
  __Type: 'JS_ProfileCut';

  /** An array of cumulative distances from each of the LatLong points provided */
  cumulativeDistances: number[];

  /** An array of terrain elevations in metres AMSL */
  elevations: number[];
}

/** A terrain profile for a flight plan leg */
export interface FlightPlanLegTerrainProfilePath {
  /** The array of points that make up this flight plan leg */
  points: LatLong[];
  /** The number of elevation points to get in this leg */
  numElevationPoints: number;
}

/** A terrain profile for a flight plan leg */
export interface FlightPlanLegTerrainProfile extends FlightPlanLegTerrainProfilePath {
  /** The terrain profile for this leg, or undefined if the leg has no valid terrain profile */
  profile: TerrainProfile | undefined;
  /** The horizontal distance of this leg, in metres */
  legDistance: number;
}

/** A terrain profile for a flight plan */
export interface FlightPlanTerrainProfile {
  /**
   * The terrain profile for the legs, ordered by leg index.
   * To get the global leg index for a leg terrain profile you must add the start leg
   */
  legs: FlightPlanLegTerrainProfile[];
  /** The index of the first leg in this profile */
  startLegGlobalIndex: number;
  /** The index of the last leg in this profile */
  endLegGlobalIndex: number;
}

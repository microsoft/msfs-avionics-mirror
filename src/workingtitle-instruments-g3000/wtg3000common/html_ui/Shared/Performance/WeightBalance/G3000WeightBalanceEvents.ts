/**
 * Events related to G3000 weight and balance calculations.
 */
export interface G3000WeightBalanceEvents {
  /** The calculated basic empty CG moment arm, in inches. */
  weightbalance_basic_empty_arm: number;

  /** The calculated zero fuel CG moment, in pound-inches. */
  weightbalance_zero_fuel_moment: number;

  /** The calculated takeoff CG moment arm, in inches, or `null` if the quantity could not be calculated. */
  weightbalance_takeoff_arm: number | null;

  /** The current aircraft center of gravity arm, in inches, or `null` if the quantity could not be calculated. */
  weightbalance_aircraft_arm: number | null;

  /**
   * The estimated aircraft center of gravity arm, in inches, at time of landing, or `null` if the quantity could not
   * be calculated.
   */
  weightbalance_landing_arm: number | null;
}

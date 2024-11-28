/**
 * Events related to weight and fuel calculations.
 */
export interface WeightFuelEvents {
  /** TThe calculated basic operating weight, in pounds. */
  weightfuel_basic_operating_weight: number;

  /** The calculated total passenger weight, in pounds. */
  weightfuel_total_passenger_weight: number;

  /** The calculated zero fuel weight, in pounds. */
  weightfuel_zero_fuel_weight: number;

  /** The calculated ramp weight, in pounds, or `null` if the value is uninitialized. */
  weightfuel_ramp_weight: number | null;

  /** The calculated takeoff weight, in pounds, or `null` if the value is uninitialized. */
  weightfuel_takeoff_weight: number | null;

  /** The weight of the current fuel on board, in pounds, or `null` if the value is uninitialized. */
  weightfuel_fob_weight: number | null;

  /** The current total aircraft weight, in pounds, or `null` if the value is uninitialized. */
  weightfuel_aircraft_weight: number | null;

  /** The estimated amount of remaining fuel, in pounds, at time of landing, or `null` if the value is uninitialized. */
  weightfuel_landing_fuel: number | null;

  /**
   * The estimated landing weight, in pounds, or `null` if the value is uninitialized.
   */
  weightfuel_landing_weight: number | null;

  /**
   * The estimated amount of fuel, in pounds, required to complete the user-defined hold, in pounds, or `null` if the
   * value is uninitialized.
   */
  weightfuel_holding_fuel: number | null;

  /**
   * The estimated amount of remaining fuel, in pounds, at time of landing less reserve and holding fuel, or `null` if
   * the quantity could not be calculated.
   */
  weightfuel_excess_fuel: number | null;
}

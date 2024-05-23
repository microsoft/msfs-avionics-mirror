/**
 * Events with which to control `FuelTotalizer`.
 */
export interface FuelTotalizerControlEvents {
  /** Commands the fuel computer to set a new amount for fuel remaining. */
  fuel_totalizer_set_remaining: number;

  /** Commands the fuel computer to set a new amount for fuel burned. */
  fuel_totalizer_set_burned: number;
}

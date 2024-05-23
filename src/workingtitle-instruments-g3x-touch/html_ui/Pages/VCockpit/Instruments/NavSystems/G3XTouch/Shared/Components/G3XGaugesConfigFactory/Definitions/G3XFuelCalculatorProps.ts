import { UiService } from '../../../UiSystem';

/**
 * Fuel Calculator Props.
 *
 * Partial Fuel 1 & 2 – The Partial Fuel values may be used if the fuel tanks have ‘tabs’ or some other method
 * of putting in a known quantity of fuel (other than completely full tanks). If the Partial Fuel function is not
 * applicable or not desired, these settings can be left blank or set to zero.
 * */
export interface G3XFuelCalculatorProps {
  /** The ui service.*/
  uiService: UiService,
  /** The partial 2 fuel tank capacity, in gallons.*/
  partialFuel1?: number,
  /** The partial 1 fuel tank capacity, in gallons.*/
  partialFuel2?: number,
}
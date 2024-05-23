import { FlightPlanDataFieldType } from './FlightPlanDataField';
import { FlightPlanDataFieldCalculator } from './FlightPlanDataFieldCalculator';

/**
 * A repository from which flight plan data field calculators can be retrieved by data field type.
 */
export interface FlightPlanDataFieldCalculatorRepo {
  /**
   * Retrieves a flight plan data field calculator.
   * @param type The data field type for which to retrieve a calculator.
   * @returns A flight plan data field calculator for the specified data field type.
   */
  get(type: FlightPlanDataFieldType): FlightPlanDataFieldCalculator;
}
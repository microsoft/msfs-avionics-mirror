import { FlightPlanDataField } from './FlightPlanDataField';
import { FlightPlanDataItem } from './FlightPlanDataItem';

/**
 * A calculator of flight plan data field values.
 */
export interface FlightPlanDataFieldCalculator {
  /**
   * Calculates values for flight plan data fields and writes the values to the fields.
   * @param dataFieldIndex The index of the data field for which to calculate values.
   * @param dataItems The data items describing the flight plan for which to calculate data field values.
   * @param cumulativeDataField The data field representing the cumulative total value over the entire flight plan.
   */
  calculate(dataFieldIndex: number, dataItems: readonly FlightPlanDataItem[], cumulativeDataField: FlightPlanDataField | null): void;
}
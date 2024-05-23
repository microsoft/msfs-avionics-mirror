import { FlightPlanDataField, FlightPlanDataFieldType } from './FlightPlanDataField';

/**
 * A factory that creates flight plan data fields.
 */
export interface FlightPlanDataFieldFactory {
  /**
   * Creates a new flight plan data field of a given type.
   * @param type The type of data field to create.
   * @returns A new flight plan data field of the specified type, or `null` if one could not be created.
   */
  create<T extends FlightPlanDataFieldType>(type: T): FlightPlanDataField<T> | null;
}
import { Subscribable, SubscribableArray } from '@microsoft/msfs-sdk';

import { FlightPlanDataItem } from './FlightPlanDataItem';
import { FlightPlanDataField, FlightPlanDataFieldType } from './FlightPlanDataField';

/**
 * A subscribable array of flight plan data items describing how to display details of a flight plan in a list format.
 */
export interface FlightPlanDataArray extends SubscribableArray<FlightPlanDataItem> {
  /** The index of the data item associated with the FROM flight plan leg, or `-1` if there is no such leg. */
  readonly fromLegIndex: Subscribable<number>;

  /** The index of the data item associated with the TO flight plan leg, or `-1` if there is no such leg. */
  readonly toLegIndex: Subscribable<number>;

  /** The data fields representing cumulative total values over this array's entire flight plan. */
  readonly cumulativeDataFields: readonly Subscribable<FlightPlanDataField<FlightPlanDataFieldType> | null>[];
}
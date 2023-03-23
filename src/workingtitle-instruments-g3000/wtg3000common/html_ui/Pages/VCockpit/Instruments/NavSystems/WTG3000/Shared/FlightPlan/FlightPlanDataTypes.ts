import { Subscribable } from '@microsoft/msfs-sdk';
import { DynamicListData } from '../Components';
import { FlightPlanLegData, FlightPlanLegListData } from './FlightPlanLegListData';
import { FlightPlanSegmentData, FlightPlanSegmentListData } from './FlightPlanSegmentListData';

/** Base interface for flight plan data. */
export interface FlightPlanBaseData {
  /** The type of flight plan list item. */
  readonly type: string;
}

/** Type for a data item in the flight plan. */
export type FlightPlanDataObject = FlightPlanSegmentData | FlightPlanLegData;

/** Base interface for flight plan list data. */
export interface FlightPlanBaseListData extends DynamicListData {
  /** The type of flight plan list item. */
  readonly type: string;
  /** @inheritdoc */
  readonly isVisible: Subscribable<boolean>;
}

/** Type for an item in the flight plan list. */
export type FlightPlanListData = FlightPlanSegmentListData | FlightPlanLegListData | AddEnrouteWaypointButtonListData;

/** Type for a selectable item in the flight plan list. */
export type SelectableFlightPlanListData = FlightPlanSegmentListData | FlightPlanLegListData;

/** Represents the Add Enroute Waypoint button list item. */
export interface AddEnrouteWaypointButtonListData extends FlightPlanBaseListData {
  /** The type of flight plan list item. */
  readonly type: 'addEnrouteWaypointButton',
}
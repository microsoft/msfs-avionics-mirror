import { Subject, Subscribable } from '@microsoft/msfs-sdk';

import { DynamicListData } from '../Components/List/DynamicListData';
import { FlightPlanLegData, FlightPlanLegListData } from './FlightPlanLegListData';
import { FlightPlanSegmentData, FlightPlanSegmentListData } from './FlightPlanSegmentListData';

export enum VectorToFinalStates {
  Unavailable,
  AwaitingActivation,
  Activated
}

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
export type FlightPlanListData = FlightPlanSegmentListData | FlightPlanLegListData | AmendRouteButtonListData | DirectToRandomEntryListData
| DirectListData | HoldListData | TopOfClimbListData | TopOfDescentListData | MissedApproachDividerData | AlternateFlightPlanDividerData | NextLegUndefinedListData;


/** Type for a selectable item in the flight plan list. */
export type SelectableFlightPlanListData = FlightPlanSegmentListData | FlightPlanLegListData | DirectListData;

/** Represents the Add Enroute Waypoint button list item. */
export interface AmendRouteButtonListData extends FlightPlanBaseListData {
  /** The type of flight plan list item. */
  readonly type: 'amendRouteButton',
}

/** Represents a divider used for the missed approach  */
export interface MissedApproachDividerData extends FlightPlanBaseListData {
  /** @inheritdoc */
  readonly type: 'missedApproachDivider'
}

/** Represents a divider used for the alternate flightplan  */
export interface AlternateFlightPlanDividerData extends FlightPlanBaseListData {
  /** @inheritdoc */
  readonly type: 'alternatePlanDivider'
}

/** Represents the Next Leg Undefined label list item. */
export interface NextLegUndefinedListData extends FlightPlanBaseListData {
  /** The type of flight plan list item. */
  readonly type: 'nextLegUndefined',
}

/** Represents the Direct label list item. */
export interface DirectListData extends FlightPlanBaseListData {
  /** The type of flight plan list item. */
  readonly type: 'directTo',
}

/** Represents the Hold label list item. */
export interface HoldListData extends FlightPlanBaseListData {
  /** The type of flight plan list item. */
  readonly type: 'hold',
  /** The state of the hold */
  readonly exiting: Subject<boolean>
}

/** Represents the Direct To Random entry list item. */
export interface DirectToRandomEntryListData extends FlightPlanBaseListData {
  /** The type of flight plan list item. */
  readonly type: 'directToRandomEntry',
}

/** Represents the TOC entry list item. */
export interface TopOfClimbListData extends FlightPlanBaseListData {
  /** The type of flight plan list item. */
  readonly type: 'toc',
}

/** Represents the TOD entry list item. */
export interface TopOfDescentListData extends FlightPlanBaseListData {
  /** The type of flight plan list item. */
  readonly type: 'tod',
}


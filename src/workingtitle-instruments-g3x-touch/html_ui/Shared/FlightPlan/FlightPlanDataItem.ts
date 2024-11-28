import { FlightPlan, FlightPlanLeg, LegDefinition, Subscribable } from '@microsoft/msfs-sdk';

import { FlightPlanDataField, FlightPlanDataFieldType } from './FlightPlanDataField';
import { G3XFmsFplLoadedApproachData } from './G3XFmsFplUserDataTypes';

/**
 * Types of flight plan data items.
 */
export enum FlightPlanDataItemType {
  Leg = 'Leg',
  ApproachLegPreview = 'ApproachLegPreview',
  AddWaypoint = 'AddWaypoint'
}

/**
 * Properties shared by all data items describing how to display details of a flight plan in a list format.
 */
interface FlightPlanBaseDataItem {
  /** Whether this item should be visible when displayed in a list format. */
  readonly isVisible: Subscribable<boolean>;
}

/**
 * Statuses of a flight plan leg relative to the active leg.
 */
export enum FlightPlanLegDataItemActiveStatus {
  /** The leg has no valid status. */
  None = 'None',

  /** The leg has been sequenced and is not the current FROM leg. */
  Past = 'Past',

  /** The leg is the current FROM leg.  */
  From = 'From',

  /** The leg is the current TO leg. */
  To = 'To',

  /** The leg has not yet been sequenced and is not the current TO leg. */
  Future = 'Future'
}

/**
 * A data item describing a flight plan leg.
 */
export interface FlightPlanLegDataItem extends FlightPlanBaseDataItem {
  /** The type of this data item. */
  readonly type: FlightPlanDataItemType.Leg;

  /** This item's parent flight plan. */
  readonly flightPlan: FlightPlan;

  /** This item's associated flight plan leg. */
  readonly leg: LegDefinition;

  /**
   * The ICAO of the waypoint fix associated with this item's flight plan leg, or the empty string if no such waypoint
   * fix exists.
   */
  readonly fixIcao: string;

  /**
   * Data describing the approach to which this item's flight plan leg belongs, or `undefined` if the leg does not
   * belong to an approach.
   */
  readonly approachData: Readonly<G3XFmsFplLoadedApproachData> | undefined;

  /** The status of this item's flight plan leg relative to the active leg. */
  readonly activeStatus: Subscribable<FlightPlanLegDataItemActiveStatus>;

  /** This item's data fields. */
  readonly dataFields: readonly Subscribable<FlightPlanDataField<FlightPlanDataFieldType> | null>[];
}

/**
 * A data item describing a previewed approach flight plan leg.
 */
export interface FlightPlanApproachLegPreviewDataItem extends FlightPlanBaseDataItem {
  /** The type of this data item. */
  readonly type: FlightPlanDataItemType.ApproachLegPreview;

  /** This item's parent flight plan. */
  readonly flightPlan: FlightPlan;

  /** The index of this item's associated flight plan leg in its approach procedure. */
  readonly index: number;

  /** This item's associated flight plan leg. */
  readonly leg: FlightPlanLeg;

  /**
   * The ICAO of the waypoint fix associated with this item's flight plan leg, or the empty string if no such waypoint
   * fix exists.
   */
  readonly fixIcao: string;

  /** Data describing the approach to which this item's flight plan leg belongs. */
  readonly approachData: Readonly<G3XFmsFplLoadedApproachData>;
}

/**
 * A data item describing an 'Add Waypoint' item in a list.
 */
export interface FlightPlanAddWaypointDataItem extends FlightPlanBaseDataItem {
  /** The type of this data item. */
  readonly type: FlightPlanDataItemType.AddWaypoint;
}

/**
 * A data item describing how to display details of a flight plan in a list format.
 */
export type FlightPlanDataItem
  = FlightPlanLegDataItem
  | FlightPlanApproachLegPreviewDataItem
  | FlightPlanAddWaypointDataItem;

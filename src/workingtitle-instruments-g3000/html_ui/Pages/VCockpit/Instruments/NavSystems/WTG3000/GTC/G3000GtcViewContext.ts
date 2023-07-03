import { FacilityWaypoint, IntersectionFacility, MutableSubscribable, NdbFacility, SubscribableArray, UserFacility, VorFacility } from '@microsoft/msfs-sdk';

import { MinimumsDataProvider, ObsSuspDataProvider, VNavDataProvider } from '@microsoft/msfs-garminsdk';

import { FlightPlanListManager, FmsSpeedTargetDataProvider } from '@microsoft/msfs-wtg3000-common';

import { GtcPositionHeadingDataProvider } from './Navigation/GtcPositionHeadingDataProvider';
import { GtcUserWaypointEditController } from './Navigation/GtcUserWaypointEditController';

/**
 * References to items used to create the base G3000's GTC views.
 */
export type G3000GtcViewContext = {
  /** A provider of airplane position and heading data that updates at the instrument refresh rate. */
  posHeadingDataProvider: GtcPositionHeadingDataProvider;

  /** A provider of airplane position and heading data that updates at one hertz. */
  posHeadingDataProvider1Hz: GtcPositionHeadingDataProvider;

  /** A provider of minimums data. */
  minimumsDataProvider: MinimumsDataProvider;

  /** A provider of VNAV data. */
  vnavDataProvider: VNavDataProvider;

  /** A provider of LNAV OBS/suspend data. */
  obsSuspDataProvider: ObsSuspDataProvider;

  /** A provider of FMS speed target data. */
  fmsSpeedTargetDataProvider: FmsSpeedTargetDataProvider | undefined;

  /** A manager which maintains a flat list representation of flight plan segments and legs. */
  flightPlanListManager: FlightPlanListManager | undefined;

  /** The selected intersection for the Intersection Information page. */
  wptInfoSelectedIntersection: MutableSubscribable<FacilityWaypoint<IntersectionFacility> | null>;

  /** The selected VOR for the VOR Information page. */
  wptInfoSelectedVor: MutableSubscribable<FacilityWaypoint<VorFacility> | null>;

  /** The selected NDB for the NDB Information page. */
  wptInfoSelectedNdb: MutableSubscribable<FacilityWaypoint<NdbFacility> | null>;

  /** The selected waypoint for the User Waypoint Information page. */
  wptInfoSelectedUserWpt: MutableSubscribable<FacilityWaypoint<UserFacility> | null>;

  /** A controller for editing user waypoints. */
  userWptEditController: GtcUserWaypointEditController;

  /** An array containing all existing user waypoints. */
  existingUserWptArray: SubscribableArray<FacilityWaypoint<UserFacility>>;
};
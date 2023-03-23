import { FlightPlan, SubEventInterface, NumberUnitInterface, Subscribable, UnitFamily, VNavPathMode, VNavState, LNavTrackingState } from '@microsoft/msfs-sdk';

/**
 * A provider of flight plan data for MapFlightPlanLayer.
 */
export interface MapFlightPlanDataProvider {
  /** A subscribable which provides the flight plan to be displayed. */
  readonly plan: Subscribable<FlightPlan | null>;

  /** An event which notifies when the displayed plan has been modified. */
  readonly planModified: SubEventInterface<MapFlightPlanDataProvider, void>;

  /** An event which notifies when the displayed plan has been calculated.  */
  readonly planCalculated: SubEventInterface<MapFlightPlanDataProvider, void>;

  /**
   * A subscribable which provides the index of the active lateral leg of the displayed flight plan, or -1 if no such
   * leg exists.
   */
  readonly activeLateralLegIndex: Subscribable<number>;

  /**
   * A subscribable which provides LNAV data.
   */
  readonly lnavData: Subscribable<LNavTrackingState | undefined>;

  /** A subscribable which provides the current VNAV state. */
  readonly vnavState: Subscribable<VNavState>;

  /** A subscribable which provides the currently active VNAV path mode. */
  readonly vnavPathMode: Subscribable<VNavPathMode>;

  /**
   * A subscribable which provides the index of the leg within which the VNAV top-of-descent point lies, or -1 if no
   * such leg exists.
   */
  readonly vnavTodLegIndex: Subscribable<number>;

  /**
   * A subscribable which provides the index of the leg within which the VNAV bottom-of-descent point lies, or -1 if
   * no such leg exists.
   */
  readonly vnavBodLegIndex: Subscribable<number>;

  /**
   * A subscribable which provides the distance along the flight path from the VNAV top-of-descent point to the end
   * of the TOD leg.
   */
  readonly vnavTodLegDistance: Subscribable<NumberUnitInterface<UnitFamily.Distance>>;

  /**
   * A subscribable which provides the distance along the flight path from the plane's current position to the next
   * top-of-descent.
   */
  readonly vnavDistanceToTod: Subscribable<NumberUnitInterface<UnitFamily.Distance>>;

  /**
   * A subscribable which provides the index of the leg within which the VNAV top-of-climb point lies, or -1 if no
   * such leg exists.
   */
  readonly vnavTocLegIndex: Subscribable<number>;

  /**
   * A subscribable which provides the index of the leg within which the VNAV bottom-of-climb point lies, or -1 if
   * no such leg exists.
   */
  readonly vnavBocLegIndex: Subscribable<number>;

  /**
   * A subscribable which provides the distance along the flight path from the VNAV top-of-climb point to the end
   * of the TOC leg.
   */
  readonly vnavTocLegDistance: Subscribable<NumberUnitInterface<UnitFamily.Distance>>;

  /**
   * A subscribable which provides the distance along the flight path from the plane's current position to the next
   * top-of-climb.
   */
  readonly vnavDistanceToToc: Subscribable<NumberUnitInterface<UnitFamily.Distance>>;

  /** A subscribable which provides the current OBS course, or undefined if OBS is not active. */
  readonly obsCourse: Subscribable<number | undefined>;
}
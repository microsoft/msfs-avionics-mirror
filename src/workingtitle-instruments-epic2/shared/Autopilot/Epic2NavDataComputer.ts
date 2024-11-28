import {
  BitFlags, ClockEvents, ConsumerSubject, ConsumerValue, ControlEvents, EventBus, FlightPathUtils, FlightPathVectorFlags, FlightPlanner, FlightPlannerEvents,
  FlightPlanUtils, GeoCircle, GeoPoint, GeoPointInterface, GNSSEvents, LegDefinition, LegDefinitionFlags, LegType, LNavEvents, LNavTransitionMode,
  LNavUtils, MagVar, NavEvents, Publisher, UnitType
} from '@microsoft/msfs-sdk';

import { Epic2FmsEvents, Epic2FmsUtils } from '../Fms';
import { ApproachDetails, Epic2FlightPlans } from '../Fms/Epic2FmsTypes';
import { Epic2ControlEvents } from '../Misc/Epic2ControlEvents';
import { Epic2LNavDataEvents } from '../Navigation/Epic2LNavDataEvents';
import { Epic2FlightArea } from './Epic2FlightAreaComputer';

/** Default RNPs for each flight area. CDI deviation is 2 dots = RNP. */
export const Epic2DefaultRnp: Record<Epic2FlightArea, number> = {
  [Epic2FlightArea.Departure]: 1.0,
  [Epic2FlightArea.EnRoute]: 2.0,
  [Epic2FlightArea.Oceanic]: 4.0,
  [Epic2FlightArea.Arrival]: 1.0,
  [Epic2FlightArea.Approach]: 0.3,
  [Epic2FlightArea.MissedApproach]: 1.0,
};

/**
 * An entry describing an LNAV data event bus topic.
 */
class LNavDataTopicEntry<T extends keyof Epic2LNavDataEvents> {
  /** The topic name to which this entry publishes. */
  public topic: T;

  /** The value of this entry's topic data. */
  public value: Epic2LNavDataEvents[T];

  /**
   * Creates a new instance of LNavDataTopicEntry.
   * @param publisher The publisher to use to publish this entry's topic.
   * @param topic The topic name.
   * @param initialValue The topic's initial value.
   */
  public constructor(private readonly publisher: Publisher<Epic2LNavDataEvents>, topic: T, initialValue: Epic2LNavDataEvents[T]) {
    this.topic = topic;
    this.value = initialValue;
  }

  /**
   * Publishes a value to this entry's topic. The value will be published if and only if it is not equal to this
   * entry's existing value or if a republish is requested.
   * @param value The value to publish to the topic. If not defined, then the current value will be republished.
   */
  public publish(value?: Epic2LNavDataEvents[T]): void {
    if (value !== this.value) {
      if (value !== undefined) {
        (this.value as Epic2LNavDataEvents[T]) = value;
      }

      this.publisher.pub(this.topic, this.value as any, true, true);
    }
  }
}

/**
 * Computes Epic2 LNAV-related data.
 */
export class Epic2NavDataComputer {
  private readonly geoPointCache = [new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0)];
  private readonly geoCircleCache = [new GeoCircle(new Float64Array(3), 0)];

  private readonly planePos = new GeoPoint(0, 0);

  private approachDetails?: ApproachDetails;
  private missedApproachManuallyActivated = false;
  private endOfPlanReached = false;

  private readonly lnavIsTracking: ConsumerSubject<boolean>;
  private readonly lnavLegIndex: ConsumerSubject<number>;
  private readonly lnavVectorIndex: ConsumerSubject<number>;
  private readonly lnavTransitionMode: ConsumerSubject<LNavTransitionMode>;
  private readonly lnavIsSuspended: ConsumerSubject<boolean>;
  private readonly lnavRemainingDistance: ConsumerValue<number>;

  private readonly eventBusTopicEntries: {
    [P in keyof Omit<Epic2LNavDataEvents, 'lnavdata_flight_area'>]: LNavDataTopicEntry<P>;
  };

  private groundSpeed = 0;

  private flightArea = ConsumerValue.create(null, Epic2FlightArea.EnRoute);

  /**
   * Creates a new instance of the NavdataComputer.
   * @param bus The event bus to use with this instance.
   * @param flightPlanner The flight planner to use with this instance.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly flightPlanner: FlightPlanner,
  ) {
    const sub = this.bus.getSubscriber<GNSSEvents & LNavEvents & Epic2LNavDataEvents & FlightPlannerEvents
      & ClockEvents & ControlEvents & NavEvents & Epic2ControlEvents>();

    this.lnavIsTracking = ConsumerSubject.create(sub.on('lnav_is_tracking'), false);
    this.lnavLegIndex = ConsumerSubject.create(sub.on('lnav_tracked_leg_index'), 0);
    this.lnavVectorIndex = ConsumerSubject.create(sub.on('lnav_tracked_vector_index'), 0);
    this.lnavTransitionMode = ConsumerSubject.create(sub.on('lnav_transition_mode'), LNavTransitionMode.None);
    this.lnavIsSuspended = ConsumerSubject.create(sub.on('lnav_is_suspended'), false);
    this.lnavRemainingDistance = ConsumerValue.create(sub.on('lnav_leg_distance_remaining'), 0);

    // TODO use fms pos
    sub.on('gps-position').handle(lla => { this.planePos.set(lla.lat, lla.long); });
    // In the Epic2, the active flight plan is never modified directly
    // So instead we listen for when the mod flight plan is copied into the active flight plan
    // TODO
    // sub.on('approach_details_set').handle(d => {
    //   this.approachDetails = d;
    //   this.updateScalingMessages();
    // });
    sub.on('realTime').atFrequency(1).handle(() => {
      this.updateCDIScaling();
    });
    sub.on('ground_speed').withPrecision(0).handle(s => {
      this.groundSpeed = s;
    });

    sub.on('activate_missed_approach').handle(v => {
      this.missedApproachManuallyActivated = v;
    });

    this.flightArea.setConsumer(sub.on('lnavdata_flight_area'));

    this.lnavLegIndex.sub(trackedLegIndex => {
      if (this.missedApproachManuallyActivated) {
        this.handleActiveLegIndexChanged(trackedLegIndex);
      }
    });

    const publisher = this.bus.getPublisher<Epic2LNavDataEvents>();

    this.eventBusTopicEntries = {
      'lnavdata_dtk_true': new LNavDataTopicEntry(publisher, 'lnavdata_dtk_true', 0),
      'lnavdata_dtk_mag': new LNavDataTopicEntry(publisher, 'lnavdata_dtk_mag', 0),
      'lnavdata_xtk': new LNavDataTopicEntry(publisher, 'lnavdata_xtk', 0),
      'lnavdata_cdi_scale': new LNavDataTopicEntry(publisher, 'lnavdata_cdi_scale', 2),
      'lnavdata_waypoint_bearing_true': new LNavDataTopicEntry(publisher, 'lnavdata_waypoint_bearing_true', 0),
      'lnavdata_waypoint_bearing_mag': new LNavDataTopicEntry(publisher, 'lnavdata_waypoint_bearing_mag', 0),
      'lnavdata_waypoint_distance': new LNavDataTopicEntry(publisher, 'lnavdata_waypoint_distance', 0),
      'lnavdata_waypoint_ident': new LNavDataTopicEntry(publisher, 'lnavdata_waypoint_ident', ''),
      'lnavdata_destination_distance': new LNavDataTopicEntry(publisher, 'lnavdata_destination_distance', 0),
      'lnavdata_nominal_leg_index': new LNavDataTopicEntry(publisher, 'lnavdata_nominal_leg_index', 0),
      'lnavdata_destination_distance_direct': new LNavDataTopicEntry(publisher, 'lnavdata_destination_distance_direct', Number.MAX_SAFE_INTEGER),
      'lnavdata_distance_to_faf': new LNavDataTopicEntry(publisher, 'lnavdata_distance_to_faf', Number.MAX_SAFE_INTEGER),
      'lnavdata_is_holding': new LNavDataTopicEntry(publisher, 'lnavdata_is_holding', false),
    };

    this.republishEventBusTopics();
  }

  /**
   * Immediately republishes all event bus topics with their current values.
   */
  private republishEventBusTopics(): void {
    for (const topic in this.eventBusTopicEntries) {
      this.eventBusTopicEntries[topic as keyof Omit<Epic2LNavDataEvents, 'lnavdata_flight_area'>].publish();
    }
  }

  /**
   * Update loop for Epic2NavDataComputer
   */
  public update(): void {
    this.computeTrackingVars(MagVar.get(this.planePos));

    if (this.endOfPlanReached === false) {
      this.checkIfAtEndOfPlan();
    }
  }

  /**
   * Checks if the aircraft has reached the end of the flight plan
   */
  private checkIfAtEndOfPlan(): void {
    if (!this.flightPlanner.hasFlightPlan(Epic2FlightPlans.Active)) {
      return;
    }

    const plan = this.flightPlanner.getFlightPlan(Epic2FlightPlans.Active);
    if (this.lnavLegIndex.get() === plan.length - 1) {
      if (this.lnavRemainingDistance.get() < 0) {
        this.endOfPlanReached = true;
        this.bus.getPublisher<Epic2FmsEvents>().pub('epic2_fms_end_of_plan_reached', true);
      }
    }
  }

  /**
   * Computes the nav tracking data, such as XTK, DTK, and distance to turn.
   * @param magVar The computed current location magvar.
   */
  private computeTrackingVars(magVar: number): void {
    let xtk = 0;
    let dtkTrue = 0;
    let dtkMag = 0;
    let distance = 0;
    let waypointBearingTrue = 0;
    let waypointBearingMag = 0;
    let totalDistance = 0;
    let nominalLegIndex = -1;
    let isHolding = false;

    const plan = this.flightPlanner.hasFlightPlan(Epic2FlightPlans.Active) && this.flightPlanner.getFlightPlan(Epic2FlightPlans.Active);

    const trackedLegIndex = this.lnavLegIndex.get();
    const nextLegIndex = trackedLegIndex + 1;

    const currentLeg = plan && trackedLegIndex >= 0 && trackedLegIndex < plan.length
      ? plan.tryGetLeg(trackedLegIndex)
      : undefined;
    const nextLeg = plan && nextLegIndex >= 0 && nextLegIndex < plan.length
      ? plan.tryGetLeg(nextLegIndex)
      : undefined;

    if (currentLeg !== null && currentLeg !== undefined && trackedLegIndex > 0) {
      nominalLegIndex = trackedLegIndex;
    }

    const isTracking = this.lnavIsTracking.get();

    if (isTracking) {
      const transitionMode = this.lnavTransitionMode.get();

      let nominalLeg;
      let circle;
      if (transitionMode === LNavTransitionMode.Egress) {
        nominalLeg = nextLeg !== undefined && nextLeg !== null ? nextLeg : currentLeg;
        nominalLegIndex = nextLeg !== undefined && nextLeg !== null ? nextLegIndex : nominalLegIndex;
        if (nextLeg?.calculated?.flightPath.length) {
          circle = this.getNominalPathCircle(nextLeg, 0, LNavTransitionMode.Ingress, this.geoCircleCache[0]);
        }
      } else {
        nominalLeg = currentLeg;
        nominalLegIndex = trackedLegIndex;
        if (currentLeg?.calculated?.flightPath.length) {
          circle = this.getNominalPathCircle(currentLeg, this.lnavVectorIndex.get(), transitionMode, this.geoCircleCache[0]);
        }
      }

      if (nominalLeg?.calculated) {
        distance = this.getDistanceToTurn(nominalLeg, this.planePos);
        totalDistance = this.getTotalDistance(
          nominalLegIndex,
          distance + UnitType.METER.convertTo(nominalLeg.calculated.egress.reduce((cum, vector) => cum + vector.distance, 0), UnitType.NMILE)
        );

        if (nominalLeg.calculated.endLat !== undefined && nominalLeg.calculated.endLon) {
          waypointBearingTrue = this.planePos.bearingTo(nominalLeg.calculated.endLat, nominalLeg.calculated.endLon);
          waypointBearingMag = MagVar.trueToMagnetic(waypointBearingTrue, magVar);
        }
      }

      if (circle !== undefined) {
        xtk = UnitType.GA_RADIAN.convertTo(circle.distance(this.planePos), UnitType.NMILE);
        dtkTrue = circle.bearingAt(this.planePos, Math.PI);
        dtkMag = MagVar.trueToMagnetic(dtkTrue, magVar);
      }

      if (currentLeg?.calculated && FlightPlanUtils.isHoldLeg(currentLeg.leg.type)) {
        const vectors = LNavUtils.getVectorsForTransitionMode(currentLeg.calculated, transitionMode, this.lnavIsSuspended.get());
        const vector = vectors[this.lnavVectorIndex.get()];

        if (Epic2FmsUtils.pathVectorHasHoldFlags(vector.flags) || transitionMode === LNavTransitionMode.None) {
          isHolding = true;
        }
      }
    }

    this.eventBusTopicEntries['lnavdata_nominal_leg_index'].publish(nominalLegIndex);
    this.eventBusTopicEntries['lnavdata_dtk_true'].publish(dtkTrue);
    this.eventBusTopicEntries['lnavdata_dtk_mag'].publish(dtkMag);
    this.eventBusTopicEntries['lnavdata_xtk'].publish(xtk);
    this.eventBusTopicEntries['lnavdata_waypoint_bearing_true'].publish(waypointBearingTrue);
    this.eventBusTopicEntries['lnavdata_waypoint_bearing_mag'].publish(waypointBearingMag);
    this.eventBusTopicEntries['lnavdata_waypoint_distance'].publish(distance);
    this.eventBusTopicEntries['lnavdata_destination_distance'].publish(totalDistance);
    this.eventBusTopicEntries['lnavdata_is_holding'].publish(isHolding);
  }

  /**
   * Computes the CDI scaling for the given LNAV data.
   */
  private updateCDIScaling(): void {
    // TODO if on VOR or LOC CDI?
    // TODO manual RNP

    const cdiScale = Epic2DefaultRnp[this.flightArea.get()];

    this.eventBusTopicEntries['lnavdata_cdi_scale'].publish(cdiScale);
  }

  /**
   * Gets the geo circle describing the nominal path tracked by LNAV.
   * @param leg The flight plan leg currently tracked by LNAV.
   * @param vectorIndex The index of the vector currently tracked by LNAV.
   * @param transitionMode The current LNAV transition mode.
   * @param out The geo circle to which to write the result.
   * @returns The geo circle describing the initial path of a flight plan leg, or undefined if one could not be
   * determined.
   */
  private getNominalPathCircle(leg: LegDefinition, vectorIndex: number, transitionMode: LNavTransitionMode, out: GeoCircle): GeoCircle | undefined {
    if (!leg.calculated) {
      return undefined;
    }

    const legCalc = leg.calculated;

    switch (leg.leg.type) {
      case LegType.DF: {
        const vector = legCalc.flightPath[legCalc.flightPath.length - 1];

        if (!vector) {
          return undefined;
        }

        if (FlightPathUtils.isVectorGreatCircle(vector)) {
          return FlightPathUtils.setGeoCircleFromVector(vector, out);
        } else {
          const turn = FlightPathUtils.setGeoCircleFromVector(vector, out);
          const turnEnd = this.geoPointCache[0].set(vector.endLat, vector.endLon);
          const bearingAtEnd = turn.bearingAt(turnEnd);
          return isNaN(bearingAtEnd) ? undefined : out.setAsGreatCircle(turnEnd, bearingAtEnd);
        }
      }
      case LegType.HM:
      case LegType.HF:
      case LegType.HA: {
        const vectors = transitionMode === LNavTransitionMode.None
          ? LNavUtils.getVectorsForTransitionMode(legCalc, transitionMode, this.lnavIsSuspended.get())
          : legCalc.flightPath;
        const searchStartIndex = transitionMode === LNavTransitionMode.None || transitionMode === LNavTransitionMode.Unsuspend
          ? vectorIndex
          : transitionMode === LNavTransitionMode.Ingress
            ? 0
            : 3;

        let vector;
        for (let i = searchStartIndex; i < vectors.length; i++) {
          const holdVector = vectors[i];
          if (BitFlags.isAny(holdVector.flags, FlightPathVectorFlags.HoldOutboundLeg | FlightPathVectorFlags.HoldInboundLeg)) {
            vector = holdVector;
            break;
          }
        }

        return vector ? FlightPathUtils.setGeoCircleFromVector(vector, out) : undefined;
      }
      default: {
        let nominalVectorIndex: number;

        switch (transitionMode) {
          case LNavTransitionMode.Ingress:
            nominalVectorIndex = 0;
            break;
          case LNavTransitionMode.Egress:
            nominalVectorIndex = legCalc.flightPath.length - 1;
            break;
          default:
            nominalVectorIndex = vectorIndex;
        }

        const vector = legCalc.flightPath[nominalVectorIndex];

        return vector ? FlightPathUtils.setGeoCircleFromVector(vector, out) : undefined;
      }
    }
  }

  /**
   * Gets the active distance from the plane position to the leg end.
   * @param leg The leg to get the distance for.
   * @param pos The current plane position.
   * @returns The distance, in nautical miles.
   */
  private getActiveDistance(leg: LegDefinition, pos: GeoPointInterface): number {
    const finalVector = leg.calculated?.flightPath[leg.calculated.flightPath.length - 1];
    if (finalVector !== undefined) {
      return UnitType.GA_RADIAN.convertTo(pos.distance(finalVector.endLat, finalVector.endLon), UnitType.NMILE);
    }

    return 0;
  }

  /**
   * Gets the total distance from the plane position to the destination leg.
   * @param activeLegIndex The global leg index of the active flight plan leg.
   * @param activeLegDistance The distance from the present position to the end of the active leg, in nautical miles.
   * @returns The distance, in nautical miles.
   */
  private getTotalDistance(activeLegIndex: number, activeLegDistance: number): number {
    const plan = this.flightPlanner.getActiveFlightPlan();
    const activeLegCumulativeDistance = plan.tryGetLeg(activeLegIndex)?.calculated?.cumulativeDistanceWithTransitions ?? 0;

    let lastLegIndex = plan.length - 1;
    for (const leg of plan.legs(true)) {
      if (!BitFlags.isAll(leg.flags, LegDefinitionFlags.MissedApproach)) {
        break;
      }
      lastLegIndex--;
    }

    const destinationLegCumulativeDistance = plan.tryGetLeg(lastLegIndex)?.calculated?.cumulativeDistanceWithTransitions ?? 0;

    return UnitType.METER.convertTo(destinationLegCumulativeDistance - activeLegCumulativeDistance, UnitType.NMILE) + activeLegDistance;
  }

  /**
   * Gets the active distance from the plane position to the next leg turn.
   * @param leg The leg to get the distance for.
   * @param pos The current plane position.
   * @returns The distance, in nautical miles.
   */
  private getDistanceToTurn(leg: LegDefinition, pos: GeoPointInterface): number {
    if (leg.calculated !== undefined) {
      const firstEgressVector = leg.calculated.egress[0];
      if (firstEgressVector) {
        return UnitType.GA_RADIAN.convertTo(pos.distance(firstEgressVector.startLat, firstEgressVector.startLon), UnitType.NMILE);
      } else {
        return this.getActiveDistance(leg, pos);
      }
    }

    return 0;
  }

  /**
   * Handles resetting whether the missed approach is active on a tracked leg change.
   * @param trackedLegIndex The currently tracked leg index.
   */
  private handleActiveLegIndexChanged(trackedLegIndex: number): void {

    const plan = this.flightPlanner.hasFlightPlan(Epic2FlightPlans.Active) && this.flightPlanner.getFlightPlan(Epic2FlightPlans.Active);

    const currentLeg = plan && trackedLegIndex >= 0 && trackedLegIndex < plan.length
      ? plan.tryGetLeg(trackedLegIndex)
      : undefined;

    if (!currentLeg || !BitFlags.isAny(currentLeg.flags, LegDefinitionFlags.MissedApproach)) {
      this.bus.getPublisher<ControlEvents>().pub('activate_missed_approach', false, true);
    }

    // We can assume that if the active leg just changed then the end of the plan isnt reached
    this.endOfPlanReached = false;
  }
}

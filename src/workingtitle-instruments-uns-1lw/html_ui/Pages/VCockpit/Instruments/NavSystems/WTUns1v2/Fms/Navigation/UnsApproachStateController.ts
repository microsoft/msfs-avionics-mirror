import {
  AirportFacility, ConsumerSubject, ControlEvents, EventBus, FlightPlanSegmentType, GeoPoint, GNSSEvents, Instrument, LNavControlEvents, Subject, UnitType
} from '@microsoft/msfs-sdk';

import { UnsFmsConfigInterface } from '../../Config/FmsConfigBuilder';
import { UnsFms } from '../UnsFms';
import { UnsApproachState, UnsFlightPlans } from '../UnsFmsTypes';
import { UnsFmsUtils } from '../UnsFmsUtils';

/**
 * A list of events for the UNS approach state controller
 */
export interface UnsApproachEvents {
  /** The current approach state */
  current_state: UnsApproachState;

  /** The current approach state */
  next_state: UnsApproachState;

  /** Event which when fired will activate the next approach state */
  activate_next_state: boolean
}

/**
 * A controller for the UNS approach state
 */
export class UnsApproachStateController implements Instrument {
  private readonly missed_approach_topic = `activate_missed_approach_${this.fmsConfig.lnav.index}` as const;

  private readonly position = ConsumerSubject.create(this.bus.getSubscriber<GNSSEvents>().on('gps-position'), null);
  private readonly apprState = Subject.create<UnsApproachState>(UnsApproachState.None);
  private readonly nextApprState = Subject.create<UnsApproachState>(UnsApproachState.None);

  private destinationFacility?: AirportFacility;

  /** @inheritdoc */
  constructor(private readonly bus: EventBus, private readonly fms: UnsFms, private readonly fmsConfig: UnsFmsConfigInterface) {
    this.fms.destinationFacilityChanged.on((sender, facility) => this.destinationFacility = facility);
  }

  /** @inheritdoc */
  init(): void {
    this.apprState.sub((state) => this.bus.getPublisher<UnsApproachEvents>().pub('current_state', state));
    this.nextApprState.sub((state) => this.bus.getPublisher<UnsApproachEvents>().pub('next_state', state));

    this.bus.getSubscriber<UnsApproachEvents>().on('activate_next_state').handle(() => this.activateNextState());
  }

  /** @inheritdoc */
  onUpdate(): void {
    this.updateApproachState();
  }

  /**
   * Activates the next approach state
   */
  private activateNextState(): void {
    const nextState = this.nextApprState.get();

    if (nextState == UnsApproachState.Missed) {
      this.bus.getPublisher<LNavControlEvents>().pub(this.missed_approach_topic, true);
      this.bus.getPublisher<ControlEvents>().pub('activate_missed_approach', true);
    } else if (this.apprState.get() === UnsApproachState.Missed && nextState === UnsApproachState.Armed) {
      const approachSegments = this.fms.getPrimaryFlightPlan().segmentsOfType(FlightPlanSegmentType.Approach);

    for (const approachSegment of approachSegments) {
      this.fms.createDirectTo({
        segmentIndex: approachSegment.segmentIndex,
        segmentLegIndex: 0,
        isNewDto: true,
        course: undefined,
        facility: undefined,
      });
    }
    }

    if (nextState !== this.apprState.get()) {
      this.apprState.set(nextState);
      this.fms.setFlightPlanApproachState(UnsFlightPlans.Active, nextState);
    }
  }

  /**
   * Updates the approach state
   */
  private async updateApproachState(): Promise<void> {
    const position = this.position.get();
    const nextApprState = await this.getNextApproachState();
    const flightPlanApprState = this.fms.getFlightPlanApproachState(UnsFlightPlans.Active);
    const flightPlan = this.fms.getPrimaryFlightPlan();

    if (position && this.destinationFacility && UnsFmsUtils.isApproachLoaded(flightPlan)) {
      const positionGeoPoint = new GeoPoint(position.lat, position.long);
      const distanceFromAirport = UnitType.GA_RADIAN.convertTo(positionGeoPoint.distance(this.destinationFacility.lat, this.destinationFacility.lon), UnitType.NMILE);

      if (this.apprState.get() !== UnsApproachState.Missed && nextApprState === UnsApproachState.Armed && distanceFromAirport <= 30) {
        this.apprState.set(UnsApproachState.Armed);
        this.fms.setFlightPlanApproachState(UnsFlightPlans.Active, UnsApproachState.Armed);
      } else if (nextApprState === UnsApproachState.Active && flightPlan.activeLateralLeg >= UnsFmsUtils.getFinalApproachFixIndex(flightPlan)) {
        this.apprState.set(UnsApproachState.Active);
        this.fms.setFlightPlanApproachState(UnsFlightPlans.Active, UnsApproachState.Active);
      }
    }

    if (flightPlanApprState !== this.apprState.get()) {
      this.apprState.set(flightPlanApprState);
    }

    this.nextApprState.set(nextApprState);
  }

  /**
   * Determines the next approach state that is valid at the current time
   * @returns The next approach state to switch to
   */
  private async getNextApproachState(): Promise<UnsApproachState> {
    const position = this.position.get();
    const flightPlan = this.fms.getPrimaryFlightPlan();

    if (!position || !UnsFmsUtils.isApproachLoaded(this.fms.getPrimaryFlightPlan()) || !this.destinationFacility) {
      return UnsApproachState.None;
    } else {
      const positionGeoPoint = new GeoPoint(position.lat, position.long);
      const distanceFromAirport = UnitType.GA_RADIAN.convertTo(positionGeoPoint.distance(this.destinationFacility.lat, this.destinationFacility.lon), UnitType.NMILE);

      switch (this.apprState.get()) {
        // TODO: Implement approach tune if RTU is present
        case UnsApproachState.None:
          return distanceFromAirport < 50 ? UnsApproachState.Armed : UnsApproachState.None;
        case UnsApproachState.AwaitingTune:
        case UnsApproachState.Armed:
          // TODO: If required localizer/vor is not tuned then alert in some way
          return UnsApproachState.Active;
        case UnsApproachState.Active:
          return UnsApproachState.Missed;
        case UnsApproachState.Missed:
          return flightPlan.activeLateralLeg > UnsFmsUtils.getLastNonMissedApproachLeg(flightPlan) ? UnsApproachState.Armed : UnsApproachState.Missed;
      }
    }
  }
}

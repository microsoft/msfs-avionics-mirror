import {
  ClockEvents, ConsumerSubject, EventBus, FlightPlan, FlightPlannerEvents, LNavEvents, ObjectSubject, UnitType, VNavEvents, Wait
} from '@microsoft/msfs-sdk';

import { DesAdvisoryDetails, WT21FmsUtils, WT21VNavDataEvents, WT21VnavUtils } from '@microsoft/msfs-wt21-shared';

import { WT21Fms } from '../FlightPlan/WT21Fms';

/**
 * WT21 Descent Advisory Manager
 */
export class DescentAdvisoryManager {

  private needCheckForDesAdvisory = false;
  private advisoryDescentLegIndex = -1;
  private destinationAirfieldElevationFeet = 0;
  private cruiseAltitude = 0;

  private readonly desAdvisoryDetails: DesAdvisoryDetails = {
    desAdvisoryLegIndex: -1,
    desAdvisoryLegDistance: -1,
    distanceFromDesAdvisory: -1,
  };

  private readonly desAdvisoryDetailsSub = ObjectSubject.create<DesAdvisoryDetails>(Object.assign({}, this.desAdvisoryDetails));

  private readonly todLegIndex: ConsumerSubject<number>;
  private readonly vnavPathAvailable: ConsumerSubject<boolean>;
  private readonly lnavLegIndex: ConsumerSubject<number>;
  private readonly lnavLegDistanceAlong: ConsumerSubject<number>;
  private readonly lnavLegDistanceRemaining: ConsumerSubject<number>;

  /**
   * Constructor
   * @param bus Instance of the Event Bus.
   * @param fms Instance of FMS.
   */
  constructor(private bus: EventBus, private fms: WT21Fms) {

    const lnav = this.bus.getSubscriber<LNavEvents>();
    this.lnavLegIndex = ConsumerSubject.create(lnav.on('lnav_tracked_leg_index').whenChanged(), 0);
    this.lnavLegDistanceAlong = ConsumerSubject.create(lnav.on('lnav_leg_distance_along').whenChanged(), 0);
    this.lnavLegDistanceRemaining = ConsumerSubject.create(lnav.on('lnav_leg_distance_remaining').whenChanged(), 0);

    this.todLegIndex = ConsumerSubject.create(this.bus.getSubscriber<VNavEvents>().on('vnav_tod_global_leg_index').whenChanged(), 0);
    this.vnavPathAvailable = ConsumerSubject.create(this.bus.getSubscriber<VNavEvents>().on('vnav_path_available').whenChanged(), false);

    // Proxy for executing a plan change
    this.bus.getSubscriber<FlightPlannerEvents>().on('fplCopied').handle(e => {
      if (e.targetPlanIndex === WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX) {
        Wait.awaitDelay(1000).then(() => {
          this.needCheckForDesAdvisory = true;
        });
      }
    });

    this.fms.performancePlanProxy.cruiseAltitude.sub(v => this.cruiseAltitude = v ?? 0);

    // Publish DES advisory details
    this.desAdvisoryDetailsSub.sub(this.publishDesAdvisoryEvents.bind(this), true);

    this.bus.getSubscriber<ClockEvents>().on('realTime').atFrequency(1 / 3, true).handle(this.update.bind(this));
  }

  /**
   * Update every 3 seconds.
   */
  private update(): void {
    if (this.fms.hasPrimaryFlightPlan()) {
      const lateralPlan = this.fms.getPrimaryFlightPlan();
      this.manageDescentAdvisory(lateralPlan, this.vnavPathAvailable.get());
    } else if (this.desAdvisoryDetails.desAdvisoryLegIndex !== -1) {
      this.resetDesAdvisoryDetails();
    }
  }

  /**
   * Manages the Descent Advisory State and Calculations.
   * @param lateralPlan The Lateral Flight Plan.
   * @param pathAvailable Whether a VNAV Path is currently available.
   */
  private manageDescentAdvisory(lateralPlan: FlightPlan, pathAvailable: boolean): void {

    this.needCheckForDesAdvisory && this.checkForAdvisoryDescentTarget(lateralPlan);

    // const nearCruiseAlt =
    // this.cruiseAltitude > 0 && Math.abs(this.currentAltitude - this.cruiseAltitude) <= 100;
    // TODO this could use the TEMP cruise alt, might wanna use the normal active perf plan itself

    // const shouldCalculateDesAdvisory = !pathAvailable && nearCruiseAlt && lateralPlan.destinationAirport !== undefined;
    // TODO not sure about the last one, altho seems logical

    if (this.advisoryDescentLegIndex > -1 && this.todLegIndex.get() < 0 && !pathAvailable && this.cruiseAltitude > 0) {
      const distance = WT21VnavUtils.calculateDescentAdvisoryDistance(this.cruiseAltitude, this.destinationAirfieldElevationFeet, 3);

      // Update sub
      WT21VnavUtils.updateDesAdvisoryDetails(
        this.desAdvisoryDetailsSub,
        lateralPlan,
        this.lnavLegIndex.get(),
        UnitType.NMILE.convertTo(this.lnavLegDistanceAlong.get(), UnitType.METER),
        UnitType.NMILE.convertTo(this.lnavLegDistanceRemaining.get(), UnitType.METER),
        distance,
      );

      // Reset if it's behind us
      if (this.desAdvisoryDetailsSub.get().distanceFromDesAdvisory <= 0) {
        this.resetDesAdvisoryDetails();
      }
    } else {
      this.resetDesAdvisoryDetails();
    }
  }

  /**
   * Checks the flight plan for a valid advisory descent target in the flight plan.
   * @param lateralPlan The Lateral Flight Plan.
   */
  private checkForAdvisoryDescentTarget(lateralPlan: FlightPlan): void {
    this.needCheckForDesAdvisory = false;

    if (lateralPlan.destinationAirport !== undefined && lateralPlan.length > 0) {
      const destinationFacility = this.fms.facilityInfo.destinationFacility;
      if (destinationFacility !== undefined && destinationFacility.icao === lateralPlan.destinationAirport) {
        for (let i = lateralPlan.length - 1; i > 0; i--) {
          const leg = lateralPlan.getLeg(i);
          if (leg.leg.fixIcao === destinationFacility.icao) {
            this.advisoryDescentLegIndex = i;
            this.destinationAirfieldElevationFeet = Math.round(UnitType.METER.convertTo(destinationFacility.runways[0].elevation, UnitType.FOOT));
            return;
          }
        }
      }
    }
    this.advisoryDescentLegIndex = -1;
    this.destinationAirfieldElevationFeet = 0;
  }

  /**
   * Resets the DES advisory values
   */
  private resetDesAdvisoryDetails(): void {
    this.desAdvisoryDetailsSub.set('desAdvisoryLegIndex', -1);
    this.desAdvisoryDetailsSub.set('desAdvisoryLegDistance', -1);
    this.desAdvisoryDetailsSub.set('distanceFromDesAdvisory', -1);
  }

  /**
   * Publishes DES advisory details on the bus
   */
  private publishDesAdvisoryEvents(): void {
    this.bus.getPublisher<WT21VNavDataEvents>().pub('wt21vnav_des_advisory_global_leg_index', this.desAdvisoryDetailsSub.get().desAdvisoryLegIndex, true);
    this.bus.getPublisher<WT21VNavDataEvents>().pub('wt21vnav_des_advisory_leg_distance', this.desAdvisoryDetailsSub.get().desAdvisoryLegDistance, true);
    this.bus.getPublisher<WT21VNavDataEvents>().pub('wt21vnav_des_advisory_distance', this.desAdvisoryDetailsSub.get().distanceFromDesAdvisory, true);
  }
}

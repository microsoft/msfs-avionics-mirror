import { EventBus } from '../../data/EventBus';
import { FlightPlan } from '../../flightplan/FlightPlan';
import { FlightPlanner } from '../../flightplan/FlightPlanner';
import { GeoPoint } from '../../geo/GeoPoint';
import { NavMath } from '../../geo/NavMath';
import { GNSSEvents } from '../../instruments/GNSS';
import { UnitType } from '../../math/NumberUnit';
import { FacilityType } from '../../navigation/Facilities';
import { ICAO } from '../../navigation/IcaoUtils';
import { VNavUtils } from '../vnav/VNavUtils';

/**
 * Handles the calculation of a Glide Path.
 */
export class GlidePathCalculator {

  private mapLegIndex = 0;
  private fafLegIndex = 0;

  private readonly planePos = new GeoPoint(0, 0);

  public glidepathFpa = 0;

  /**
   * Creates a new instance of GlidePathCalculator.
   * @param bus The event bus.
   * @param flightPlanner The flight planner to use with this instance.
   * @param primaryPlanIndex The primary plan index to use for calculating GlidePath.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly flightPlanner: FlightPlanner,
    private readonly primaryPlanIndex: number
  ) {
    this.flightPlanner.onEvent('fplCopied').handle(e => {
      if (e.targetPlanIndex === this.primaryPlanIndex) {
        this.onPlanChanged();
      }
    });
    this.flightPlanner.onEvent('fplCreated').handle(e => {
      if (e.planIndex === this.primaryPlanIndex) {
        this.onPlanChanged();
      }
    });
    this.flightPlanner.onEvent('fplLegChange').handle(e => {
      if (e.planIndex === this.primaryPlanIndex) {
        this.onPlanChanged();
      }
    });
    this.flightPlanner.onEvent('fplLoaded').handle(e => {
      if (e.planIndex === this.primaryPlanIndex) {
        this.onPlanChanged();
      }
    });
    this.flightPlanner.onEvent('fplSegmentChange').handle(e => {
      if (e.planIndex === this.primaryPlanIndex) {
        this.onPlanChanged();
      }
    });
    this.flightPlanner.onEvent('fplIndexChanged').handle(() => this.onPlanChanged());
    this.flightPlanner.onEvent('fplCalculated').handle(e => {
      if (e.planIndex === this.primaryPlanIndex) {
        this.onPlanCalculated();
      }
    });

    const gnss = this.bus.getSubscriber<GNSSEvents>();
    gnss.on('gps-position').handle(lla => {
      this.planePos.set(lla.lat, lla.long);
    });
  }

  /**
   * Responds to when the primary flight plan changes.
   */
  private onPlanChanged(): void {
    if (this.flightPlanner.hasFlightPlan(this.primaryPlanIndex)) {
      const plan = this.flightPlanner.getFlightPlan(this.primaryPlanIndex);
      this.mapLegIndex = VNavUtils.getMissedApproachLegIndex(plan);
      const faf = VNavUtils.getFafIndex(plan);
      this.fafLegIndex = faf !== undefined ? faf : Math.max(0, plan.length - 1);
    }
  }

  /**
   * Responds to when the primary flight plan's lateral flight path vectors are calculated.
   */
  private onPlanCalculated(): void {
    if (this.flightPlanner.hasFlightPlan(this.primaryPlanIndex)) {
      const plan = this.flightPlanner.getFlightPlan(this.primaryPlanIndex);
      this.calcGlidepathFpa(plan);
    }
  }

  /**
   * Gets the current Glidepath distance in meters.
   * @param index The global index of the active leg.
   * @param distanceAlongLeg The aircraft's current distance along the active leg, in meters.
   * @returns The current Glidepath distance in meters.
   */
  public getGlidepathDistance(index: number, distanceAlongLeg: number): number {
    let globalLegIndex = 0;
    let distance = 0;
    const plan = this.flightPlanner.getFlightPlan(this.primaryPlanIndex);
    const destLeg = plan.getLeg(this.mapLegIndex);

    if (index <= this.mapLegIndex) {
      for (let segmentIndex = 0; segmentIndex < plan.segmentCount; segmentIndex++) {
        const segment = plan.getSegment(segmentIndex);
        for (let legIndex = 0; legIndex < segment.legs.length; legIndex++) {
          const leg = segment.legs[legIndex];

          if (leg.calculated !== undefined && globalLegIndex <= this.mapLegIndex) {
            if (index === globalLegIndex) {
              distance += leg.calculated?.distanceWithTransitions - distanceAlongLeg;
            } else if (globalLegIndex > index) {
              distance += leg.calculated?.distanceWithTransitions;
            }
          }

          globalLegIndex++;
        }
      }

      if (
        ICAO.isFacility(destLeg.leg.fixIcao)
        && ICAO.getFacilityType(destLeg.leg.fixIcao) !== FacilityType.RWY
        && plan.procedureDetails.destinationRunway !== undefined
        && destLeg.calculated && destLeg.calculated.endLat !== undefined && destLeg.calculated.endLon !== undefined
      ) {
        const runway = plan.procedureDetails.destinationRunway;
        const runwayGeoPoint = new GeoPoint(runway.latitude, runway.longitude);

        if (index === this.mapLegIndex && (distanceAlongLeg >= (destLeg.calculated.distanceWithTransitions - 1))) {
          const destEnd = new GeoPoint(destLeg.calculated.endLat, destLeg.calculated.endLon);
          distance = UnitType.NMILE.convertTo(NavMath.alongTrack(runwayGeoPoint, destEnd, this.planePos), UnitType.METER);
        } else {
          distance += UnitType.GA_RADIAN.convertTo(runwayGeoPoint.distance(destLeg.calculated.endLat, destLeg.calculated.endLon), UnitType.METER);
        }
      }
    }

    return distance;
  }

  /**
   * Gets the Glidepath desired altitude in meters.
   * @param distance The current Glidepath distance in meters.
   * @returns The current Glidepath desired altitude in meters.
   */
  public getDesiredGlidepathAltitude(distance: number): number {
    return this.getRunwayAltitude() + VNavUtils.altitudeForDistance(this.glidepathFpa, distance);
  }

  /**
   * Gets the Glidepath runway altitude in meters.
   * @returns The Glidepath runway altitude in meters.
   */
  public getRunwayAltitude(): number {
    const plan = this.flightPlanner.getFlightPlan(this.primaryPlanIndex);
    const destLeg = plan.getLeg(this.mapLegIndex);
    let destAltitude = destLeg.leg.altitude1;

    if (
      ICAO.isFacility(destLeg.leg.fixIcao)
      && ICAO.getFacilityType(destLeg.leg.fixIcao) !== FacilityType.RWY
      && plan.procedureDetails.destinationRunway !== undefined
    ) {
      destAltitude = plan.procedureDetails.destinationRunway.elevation;
    }

    return destAltitude;
  }

  /**
   * Calculates the Glidepath flight path angle using the destination elevation
   * and FAF altitude restriction.
   * @param plan The plan to calculate from.
   */
  private calcGlidepathFpa(plan: FlightPlan): void {
    if (plan.length < 2 || this.fafLegIndex > plan.length || this.mapLegIndex > plan.length) {
      return;
    }

    const fafLeg = plan.tryGetLeg(this.fafLegIndex);
    const destLeg = plan.tryGetLeg(this.mapLegIndex);

    if (!fafLeg || !destLeg) {
      return;
    }

    let fafToDestDistance = 0;
    for (let i = this.fafLegIndex + 1; i <= this.mapLegIndex; i++) {
      const leg = plan.getLeg(i);
      if (leg.calculated !== undefined) {
        fafToDestDistance += leg.calculated.distance;
      }
    }

    let destAltitude = destLeg.leg.altitude1;

    if (
      ICAO.isFacility(destLeg.leg.fixIcao)
      && ICAO.getFacilityType(destLeg.leg.fixIcao) !== FacilityType.RWY
      && plan.procedureDetails.destinationRunway !== undefined
      && destLeg.calculated && destLeg.calculated.endLat !== undefined && destLeg.calculated.endLon !== undefined
    ) {
      const runway = plan.procedureDetails.destinationRunway;
      const runwayGeoPoint = new GeoPoint(runway.latitude, runway.longitude);
      destAltitude = runway.elevation;
      fafToDestDistance += UnitType.GA_RADIAN.convertTo(runwayGeoPoint.distance(destLeg.calculated.endLat, destLeg.calculated.endLon), UnitType.METER);
    }

    this.glidepathFpa = VNavUtils.getFpa(fafToDestDistance, fafLeg.leg.altitude1 - destAltitude);
  }

}

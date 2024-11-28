import {
  AdcEvents, AeroMath, AirportFacility, APVerticalModes, ClockEvents, ConsumerSubject, ControlSurfacesEvents, EventBus, FacilityType, FlightPlanLegEvent,
  FlightPlannerEvents, FlightPlanSegmentType, GeoPoint, GNSSEvents, ICAO, LegDefinition, LegEventType, OriginDestChangeType, SmoothingPathCalculator, Subject,
  UnitType, VNavEvents
} from '@microsoft/msfs-sdk';

import { Epic2FmaData, Epic2FmaEvents } from '../Autopilot';
import { SpeedScheduleConfig } from '../AvionicsConfig';
import { Epic2FlightPlans, Epic2Fms, Epic2FmsUtils } from '../Fms';
import { Epic2ClimbSpeedSchedule, Epic2CruiseSpeedSchedule, Epic2DescentSpeedSchedule } from './Epic2SpeedSchedules';
import { Epic2VSpeedController } from './Epic2VSpeedController';

enum SpeedPredictionClass {
  None,
  Departure,
  Cruise,
  Descent,
}

/** Record used for storing a speed prediction record */
interface SpeedPredictionRecord {
  /** The associated leg definition */
  leg: LegDefinition

  /** The class of the prediction */
  predictionType: SpeedPredictionClass

  /** Whether this is a constraint */
  isConstraint: Subject<boolean>

  /** The predicted speed of the waypoint */
  predictedSpeed: Subject<number | null>

  /** The constrained speed of the waypoint */
  constrainedSpeed: Subject<number | null>
}

/** Interface representing the return item from the get next speed constraint call */
export interface SpeedConstraintReturnRecord {
  /** The speed of the speed constraint */
  speed: number,
  /** The global leg index from which it applies */
  globalLegIndex: number
}

/** Class responsible for the aircraft speed predictions */
export class Epic2SpeedPredictions {
  private readonly gpsPosition = ConsumerSubject.create<LatLongAlt>(this.bus.getSubscriber<GNSSEvents>().on('gps-position').atFrequency(5), new LatLongAlt(NaN));
  private readonly altitude = ConsumerSubject.create<number>(this.bus.getSubscriber<AdcEvents>().on('indicated_alt').whenChangedBy(10), 0);
  private readonly flapPosition = ConsumerSubject.create<number>(this.bus.getSubscriber<ControlSurfacesEvents>().on('flaps_left_angle'), 0);
  private readonly gaModeActive = ConsumerSubject.create<Epic2FmaData | undefined>(this.bus.getSubscriber<Epic2FmaEvents>().on('epic2_fma_data'), undefined).map((data) => data?.verticalActive === APVerticalModes.GA);

  private readonly todIndex = ConsumerSubject.create<number | undefined>(this.bus.getSubscriber<VNavEvents>().on('vnav_tod_global_leg_index'), undefined);
  private readonly tocIndex = ConsumerSubject.create<number | undefined>(this.bus.getSubscriber<VNavEvents>().on('vnav_toc_global_leg_index'), undefined);

  public readonly climbSchedule = new Epic2ClimbSpeedSchedule(this.bus, this.config, this.vSpeedController, this.flapPosition, this.gaModeActive);
  public readonly cruiseSchedule = new Epic2CruiseSpeedSchedule(this.config, this.fms.getActivePerformancePlan());
  public readonly descentSchedule = new Epic2DescentSpeedSchedule(this.bus, this.config, this.flapPosition);

  private readonly planEvents = this.bus.getSubscriber<FlightPlannerEvents & VNavEvents>();
  public readonly records: SpeedPredictionRecord[] = [];

  /** @inheritdoc */
  constructor(
    private readonly fms: Epic2Fms,
    private readonly bus: EventBus,
    private readonly config: SpeedScheduleConfig,
    private readonly vSpeedController: Epic2VSpeedController,
    private readonly verticalPathCalculator: SmoothingPathCalculator,
  ) {
    this.bus.getSubscriber<FlightPlannerEvents>().on('fplOriginDestChanged').handle(async (event) => {
      if (event.planIndex === Epic2FlightPlans.Active) {
        switch (event.type) {
          case OriginDestChangeType.OriginAdded:
            this.climbSchedule.originFac.set(
              event.airport ? await this.fms.facLoader.getFacility(ICAO.getFacilityType(event.airport), event.airport) as AirportFacility : undefined
            );
            break;
          case OriginDestChangeType.OriginRemoved:
            this.climbSchedule.originFac.set(undefined);
            break;
          case OriginDestChangeType.DestinationAdded:
            this.descentSchedule.destFac.set(
              event.airport ? await this.fms.facLoader.getFacility(ICAO.getFacilityType(event.airport), event.airport) as AirportFacility : undefined
            );
            break;
          case OriginDestChangeType.DestinationRemoved:
            this.descentSchedule.destFac.set(undefined);
            break;
        }
      }
    });

    this.planEvents.on('fplLegChange').handle((event) => this.handleLegChange(event));
    this.planEvents.on('fplCopied').handle(e => {
      if (e.targetPlanIndex === Epic2FlightPlans.Active) {
        this.handlePlanLoaded();
      }
    });
    this.planEvents.on('fplLoaded').handle(e => {
      if (e.planIndex === Epic2FlightPlans.Active) {
        this.handlePlanLoaded();
      }
    });

    this.bus.getSubscriber<ClockEvents>().on('simTime').atFrequency(1).handle(() => this.calculatePredictedSpeeds());

    this.tocIndex.sub(() => this.handleTODTOCChange());
    this.todIndex.sub(() => this.handleTODTOCChange());
  }

  /**
   * Handles flight plan leg changes
   * @param event the flight plan leg change event
   */
  private handleLegChange(event: FlightPlanLegEvent): void {
    if (event.planIndex !== Epic2FlightPlans.Active) { return; }

    if (event.type === LegEventType.Added) {
      this.handleLegAdded(event);
    } else if (event.type === LegEventType.Removed) {
      this.handleLegRemoved(event);
    } else if (event.type === LegEventType.Changed) {
      this.records.forEach((record) => {
        this.determineLegData(record.leg);
      });

      this.determineConstrainedSpeeds();
    }
  }

  /**
   * Handles leg added event
   * @param event the flight plan leg added event
   */
  private handleLegAdded(event: FlightPlanLegEvent): void {
    const { leg } = event;

    this.determineLegData(leg);

    this.determineConstrainedSpeeds();
  }

  /** Handles changes to the leg data after a change in the TOD or TOC */
  private handleTODTOCChange(): void {
    this.records.forEach((record) => {
      this.determineLegData(record.leg);
    });

    this.determineConstrainedSpeeds();
  }

  /**
   * Determines and initialises (where required) the leg data
   * @param leg the leg definition
   */
  private determineLegData(leg: LegDefinition): void {
    const tocIndex = this.tocIndex.get() ?? -1;
    const todIndex = this.todIndex.get() ?? -1;
    const plan = this.fms.getFlightPlan(Epic2FlightPlans.Active);
    const segment = plan.getSegmentFromLeg(leg);
    const legIndex = plan.getLegIndexFromLeg(leg);
    const isClimb = legIndex > Epic2FmsUtils.getLastNonMissedApproachLeg(plan) || (tocIndex >= 0 && legIndex <= tocIndex);
    const isDescent = (todIndex >= 0 ? legIndex >= todIndex : segment?.segmentType === FlightPlanSegmentType.Arrival) || segment?.segmentType === FlightPlanSegmentType.Approach;

    let predictionType = SpeedPredictionClass.None;
    if (isClimb) {
      predictionType = SpeedPredictionClass.Departure;
    } else if (isDescent) {
      predictionType = SpeedPredictionClass.Descent;
    } else {
      predictionType = SpeedPredictionClass.Cruise;
    }

    if (!this.records[legIndex]) {
      this.records[legIndex] = {
        leg,
        predictionType,
        isConstraint: Subject.create<boolean>(leg.verticalData.speed > 0),
        predictedSpeed: Subject.create<number | null>(null),
        constrainedSpeed: Subject.create<number | null>(leg.verticalData.speed)
      };
    } else {
      this.records[legIndex].leg = leg;
      this.records[legIndex].predictionType = predictionType;
      this.records[legIndex].isConstraint.set(leg.verticalData.speed > 0);
      this.records[legIndex].constrainedSpeed.set(leg.verticalData.speed);
    }
  }

  /**
   * Calculates the predicted speeds for every leg
   */
  private calculatePredictedSpeeds(): void {
    const gpsPosition = this.gpsPosition.get();
    const altitude = this.altitude.get();
    const altitudeMetres = UnitType.METER.convertFrom(altitude, UnitType.FOOT);

    this.records.forEach((record, index) => {
      const position = new GeoPoint(record.leg.calculated?.endLat ?? gpsPosition.lat, record.leg.calculated?.endLon ?? gpsPosition.long);
      const constrainedSpeed = record.constrainedSpeed.get() ?? 0 > 0 ? record.constrainedSpeed.get() : null;
      const constrainedIas = constrainedSpeed && constrainedSpeed > 1 ? constrainedSpeed : AeroMath.machToCasIsa(constrainedSpeed ?? Infinity, altitudeMetres);
      const constrainedMach = constrainedSpeed && constrainedSpeed < 1 ? constrainedSpeed : Infinity; // We can pretty safely assume that a constraint speed < 1 is a mach constraint

      switch (record.predictionType) {
        case SpeedPredictionClass.None:
          break;
        case SpeedPredictionClass.Departure: {
          this.climbSchedule.update(altitude, position);
          const climbIas = this.climbSchedule.scheduledIas;
          const predictedIas = this.climbSchedule.isDeparture ? climbIas : Math.min(constrainedIas, climbIas);
          const predictedMach = this.climbSchedule.isMachInUse ? Math.min(constrainedMach, this.climbSchedule.scheduledMach) : null;
          this.records[index].predictedSpeed.set(predictedMach ?? predictedIas);
          break;
        }
        case SpeedPredictionClass.Cruise: {
          this.cruiseSchedule.update(altitude);
          const cruiseIas = this.cruiseSchedule.scheduledIas;
          const predictedIas = Math.min(constrainedIas, cruiseIas);
          const predictedMach = this.cruiseSchedule.isMachInUse ? Math.min(constrainedMach, this.cruiseSchedule.scheduledMach) : null;
          this.records[index].predictedSpeed.set(predictedMach ?? predictedIas);
          break;
        }
        case SpeedPredictionClass.Descent: {
          this.descentSchedule.update(altitude, position);
          const descentIas = this.descentSchedule.scheduledIas;
          const descentMach = this.descentSchedule.scheduledMach;
          const predictedIas = this.descentSchedule.isApproach ? descentIas : Math.min(constrainedIas, descentIas);
          const predictedMach = this.descentSchedule.isMachInUse ? Math.min(constrainedMach, descentMach) : null;
          this.records[index].predictedSpeed.set(predictedMach ?? predictedIas);
          break;
        }
      }
    });
  }

  /**
   * Loops through all legs and will apply any constrained speeds to them as required
   */
  private determineConstrainedSpeeds(): void {
    this.records.forEach((record, index) => {
      if (record.leg.verticalData.speed > 0) {
        this.determineConstrainedSpeedFromLeg(index);
      }
    });
  }

  /**
   * Determines the constraint speeds
   * @param legIndex the index of the leg to base the speed constraints on
   */
  private determineConstrainedSpeedFromLeg(legIndex: number): void {
    const originalLeg = this.records[legIndex];

    let direction = 1;
    switch (originalLeg.predictionType) {
      case SpeedPredictionClass.Departure:
        direction = -1;
        break;
      case SpeedPredictionClass.Cruise:
      case SpeedPredictionClass.Descent:
      case SpeedPredictionClass.None:
        direction = 1;
        break;
    }

    for (let index = legIndex + direction; direction == 1 ? index < this.records.length : index >= 0; index += direction) {
      const record = this.records[index];
      if (record.predictionType !== originalLeg.predictionType || record.isConstraint.get()) {
        break;
      }

      this.records[index].constrainedSpeed.set(originalLeg.constrainedSpeed.get());
    }
  }

  /**
   * Gets the speed constraint from a given leg index
   * @param legIndex The leg index to begin the search from
   * @returns The next speed constraint or none if none exist
   */
  public getSpeedConstraint(legIndex: number): SpeedConstraintReturnRecord | undefined {
    const constrainedSpeed = this.records[legIndex].constrainedSpeed.get();
    if (constrainedSpeed !== null && constrainedSpeed > 0) {
      return {
        speed: constrainedSpeed,
        globalLegIndex: legIndex
      };
    }
  }

  /**
   * Gets the next speed constraint from a given leg index
   * @param legIndex The leg index to begin the search from
   * @returns The next speed constraint or none if none exist
   */
  public getNextSpeedConstraint(legIndex: number): SpeedConstraintReturnRecord | undefined {
    for (let i = legIndex + 1; i < this.records.length - 1; i++) {
      const constrainedSpeed = this.records[i].constrainedSpeed.get();
      if (constrainedSpeed !== null && constrainedSpeed > 0) {
        return {
          speed: constrainedSpeed,
          globalLegIndex: i
        };
      }
    }
  }

  /**
   * Handles the plan being loaded
   */
  private async handlePlanLoaded(): Promise<void> {
    // const { leg, segmentIndex, legIndex } = event;
    const plan = this.fms.getFlightPlan(Epic2FlightPlans.Active);
    this.climbSchedule.originFac.set(plan.originAirport ? await this.fms.facLoader.getFacility(FacilityType.Airport, plan.originAirport) as AirportFacility : undefined);
    this.descentSchedule.destFac.set(plan.destinationAirport ? await this.fms.facLoader.getFacility(FacilityType.Airport, plan.destinationAirport) as AirportFacility : undefined);

    for (let segmentIndex = 0; segmentIndex < plan.segmentCount; segmentIndex++) {
      const segment = plan.getSegment(segmentIndex);
      for (let legIndex = 0; legIndex < segment.legs.length; legIndex++) {
        this.handleLegChange({
          planIndex: Epic2FlightPlans.Active,
          segmentIndex, legIndex, leg: segment.legs[legIndex], type: LegEventType.Added,
        });
      }
    }
  }

  /**
   * Handles leg removed event
   * @param event the flight plan leg removed event
   */
  private handleLegRemoved(event: FlightPlanLegEvent): void {
    this.records.splice(event.legIndex, 1);
  }

  // /** Determines the go around schedule speed
  //  * @returns the scheduled speed for go around
  //  */
  // private getGoAroundSchedule(): number {
  //   const flapPosition = this.flapPosition.get();

  //   if (flapPosition === 0) {
  //     return Epic2SpeedPredictions.GA_SPEED_FLAP_0;
  //   } else if (flapPosition <= 15) {
  //     return Epic2SpeedPredictions.APPR_SPEED_FLAP_15;
  //   } else if (flapPosition <= 30) {
  //     return Epic2SpeedPredictions.APPR_SPEED_FLAP_30;
  //   } else if (flapPosition <= 40) {
  //     return Epic2SpeedPredictions.APPR_SPEED_FLAP_40;
  //   }

  //   return Epic2SpeedPredictions.GA_SPEED_FLAP_0;
  // }
}

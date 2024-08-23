import { AdcEvents, EventBus, FlightPlanPredictor, MappedSubject, Subject, UnitType } from '@microsoft/msfs-sdk';

import { ApproachPerformanceResults, WT21MfdTextPageEvents } from '@microsoft/msfs-wt21-shared';

import { BasePerformanceDataManager, WT21Fms } from '@microsoft/msfs-wt21-fmc';

import { CJ4PerformancePlan } from '../../CJ4PerformancePlan';

/**
 * Manages approach performance variables
 */
export class ApproachPerformanceManager {

  /**
   * Initializes the {@link ApproachPerformanceManager}
   * @param eventBus the event bus
   * @param fms the fms
   * @param basePerformanceManager the base data performance manager
   * @param performancePlan the performance plan
   * @param predictor the flight plan predictor
   */
  constructor(
    private readonly eventBus: EventBus,
    private readonly fms: WT21Fms,
    private readonly basePerformanceManager: BasePerformanceDataManager,
    private readonly performancePlan: CJ4PerformancePlan,
    private readonly predictor: FlightPlanPredictor,
  ) {
    MappedSubject.create(([lw, gw, vRef, vApp, landingFieldLength]) => {
      this.eventBus.getPublisher<WT21MfdTextPageEvents>().pub('wt21mfd_appr_perf_outputs', {
        lw,
        gw,
        calculations: vRef !== null && vApp !== null && landingFieldLength !== null ? {
          vRef, vApp, landingFieldLength,
        } : null,
      }, true);
    }, this.landingWeight, this.basePerformanceManager.gw, this.vRef, this.vApp, this.landingDistance);

    const adc = eventBus.getSubscriber<AdcEvents>();

    // FIXME hacky! need to change some things to avoid this, as right now this will run before the perf plan proxy
    // has nay active perf plan associated with it
    setTimeout(() => {
      adc.on('altimeter_baro_setting_inhg_1').withPrecision(2).handle((value) => {
        this.performancePlan.approachAutoQnh.set(value);
      });
    }, 5_000);
  }

  /**
   * Pressure altitude
   */
  pressureAltitude = MappedSubject.create(([autoQnh, manualQnh, runway]) => {
    const qnh = manualQnh ?? autoQnh;

    if (!runway || qnh === null) {
      return null;
    }

    return Math.trunc((((29.92 - qnh) * 1000) + UnitType.FOOT.convertFrom(runway.elevation, UnitType.METER)));
  }, this.performancePlan.approachAutoQnh, this.performancePlan.approachManualQnh, this.performancePlan.approachRunway);

  /**
   * Landing weight
   */

  private readonly predictedLandingWeight = Subject.create<number | null>(null);

  // TODO we'll need to figure out something for the case where a manual gw is entered (predict fuel used?)
  landingWeight = MappedSubject.create(([manualLw, predictedLandingWeight, gw]) => {
    if (manualLw !== null) {
      return manualLw;
    }

    if (predictedLandingWeight !== null) {
      return predictedLandingWeight;
    }

    return gw;
  }, this.performancePlan.manualLw, this.predictedLandingWeight, this.basePerformanceManager.gw);

  // Output

  private calculationResults = MappedSubject.create(
    ([runway, runwayCondition, runwaySlope, wind, oat, pressureAltitude, landingFactor]) => {
      const landingWeight = this.landingWeight.get();

      if (oat === null || pressureAltitude === null || landingWeight === null) {
        return null;
      }

      // V Speeds based on weight at 0C
      const vRef = ((landingWeight - 10500) * .00393) + 92;
      const vApp = ((landingWeight - 10500) * .00408) + 98;

      // Sea level base value for a given weight
      let landingFieldLength = ((landingWeight - 10500) * .126) + 2180;

      if (landingWeight <= 13500) {
        // Gets factor value for rate of change based on weight
        const ldgFieldAltFactor = ((13500 - landingWeight) * .000005) + .0825;

        // Gets landing distance for a given altitude and added to the sea level value
        landingFieldLength = landingFieldLength + (pressureAltitude * ldgFieldAltFactor);
      }
      if (landingWeight >= 14000 && landingWeight <= 14500) {
        const ldgFieldAltFactor = ((14500 - landingWeight) * .0000632) + .1175;
        landingFieldLength = landingFieldLength + (pressureAltitude * ldgFieldAltFactor);
      }
      if (landingWeight >= 15000 && landingWeight <= 15660) {
        const ldgFieldAltFactor = ((15660 - landingWeight) * .000205) + .1991;
        landingFieldLength = landingFieldLength + (pressureAltitude * ldgFieldAltFactor);
      }

      // Takes the basic length and adds or subtracts distance based on weight and temperature difference from 15C.
      // Does not account for Pressure altitude yet
      if (oat > 0) {
        // This calculates how many feet to add per degree greater or lower than 0c based on weight.
        // 0c is used because that is where the base weights come from
        landingFieldLength = landingFieldLength + (((landingWeight - 10500) * .000903) + 5.33) * oat;
      }
      if (oat < 0) {
        landingFieldLength = landingFieldLength + (((landingWeight - 10500) * .000903) + 5.33) * oat;
      }

      if (runway !== null && wind !== null) {
        const magVar = Facilities.getMagVar(runway.latitude, runway.longitude);

        const headwind = Math.trunc(wind.speed * (Math.cos(((runway.direction - magVar) * Math.PI / 180) - (wind.direction * Math.PI / 180))));

        if (headwind > 0) {
          const headwindFactor = (pressureAltitude * .00683) + 15;
          landingFieldLength = landingFieldLength - (headwind * headwindFactor);
        } else {
          const tailWindFactor = (pressureAltitude * .01608) + 55;
          landingFieldLength = landingFieldLength - (headwind * tailWindFactor);
        }
      }

      // If the runway is wet
      if (runwayCondition === 1) {
        // Determines a factor to multiply with dependent on pressure altitude. Sea level being 1.21x landing distance
        landingFieldLength = landingFieldLength * ((pressureAltitude * .0001025) + 1.21875);
      }

      if (runwaySlope !== null && runwaySlope < 0) {
        const factor = 0.365;
        const slopeFactor = 1 * (1 + (-1 * factor * runwaySlope));

        landingFieldLength *= slopeFactor;
      }

      switch (landingFactor) {
        case 0:
          landingFieldLength = landingFieldLength * 1;
          break;
        case 1:
          landingFieldLength = landingFieldLength * 1.25;
          break;
        case 2:
          landingFieldLength = landingFieldLength * 1.67;
          break;
        case 3:
          landingFieldLength = landingFieldLength * 1.92;
          break;
      }

      return { landingFieldLength, vApp, vRef } as ApproachPerformanceResults;
    },
    this.performancePlan.approachRunway,
    this.performancePlan.approachRunwayCondition,
    this.performancePlan.approachRunwaySlope,
    this.performancePlan.approachWind,
    this.performancePlan.approachOat,
    this.pressureAltitude,
    this.performancePlan.approachLandingFactor,
  );

  /**
   * Updates the predicted landing weight
   */
  public updatePredictedLandingWeight(): void {
    const zfw = this.fms.basePerformanceManager.zfw.get();

    if (zfw !== null) {
      const destinationFacility = this.fms.facilityInfo.destinationFacility;

      if (destinationFacility) {
        this.predictor.update();
        const destinationPredictions = this.predictor.getDestinationPrediction(destinationFacility);

        if (destinationPredictions) {
          const destFob = destinationPredictions.fob;

          if (destFob !== null) {
            const lw = zfw + destFob;

            this.predictedLandingWeight.set(lw);
            return;
          }
        }
      }
    }

    this.predictedLandingWeight.set(null);
  }

  /**
   * Get a value indicating if all speeds are calculated and valid.
   * @returns true if all speeds are valid, false otherwise
   */
  public isAllSpeedsValid(): boolean {
    return this.vRef.get() !== null && this.vApp.get() !== null;
  }

  /**
   * VRef
   */
  vRef = MappedSubject.create(([results]) => results?.vRef ?? null, this.calculationResults);

  /**
   * VApp
   */
  vApp = MappedSubject.create(([results]) => results?.vApp ?? null, this.calculationResults);

  /**
   * Landing Distance
   */
  landingDistance = MappedSubject.create(([results]) => results?.landingFieldLength ?? null, this.calculationResults);

}

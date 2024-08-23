import { AdcEvents, EventBus, MappedSubject, Subject, Subscribable, UnitType } from '@microsoft/msfs-sdk';

import { WT21MfdTextPageEvents } from '@microsoft/msfs-wt21-shared';

import { BasePerformanceDataManager } from '@microsoft/msfs-wt21-fmc';

import { TakeoffPerformanceCalculator } from './TakeoffPerformanceCalculator';
import { CJ4PerformancePlan } from '../../CJ4PerformancePlan';

/**
 * Manages pilot-entered and performance data
 */
export class TakeoffPerformanceManager {

  /**
   * Ctor
   * @param eventBus the event bus
   * @param basePerformanceManager the base data performance manager
   * @param performancePlan the performance plan
   * @param isPrimary whether the instrument is primary
   */
  constructor(
    private readonly eventBus: EventBus,
    private readonly basePerformanceManager: BasePerformanceDataManager,
    private readonly performancePlan: CJ4PerformancePlan,
    private readonly isPrimary: boolean,
  ) {
    /**
     * Handles re-calculating the takeoff performance data.
     */
    MappedSubject.create(
      () => {
        if (this.canCalculateTakeoffPerformance.get()) {
          // FIXME find out how to avoid null assertions
          const results = TakeoffPerformanceCalculator.calculate(
            this.tow.get() ?? 0,
            (this.performancePlan.takeoffFlaps.get() ?? 0) as 0 | 1,
            this.performancePlan.takeoffOat.get() ?? 15,
            this.pressureAltitude.get() ?? 0,
            this.performancePlan.takeoffRunway.get()?.direction ?? null,
            this.performancePlan.takeoffRunwaySlope.get() ?? 0,
            this.performancePlan.takeoffRunwayCondition.get() ?? 0,
            this.performancePlan.takeoffWind.get()?.direction ?? null,
            this.performancePlan.takeoffWind.get()?.speed ?? null,
            (this.performancePlan.takeoffAntiIceOn.get()) as 0 | 1,
          );
          this.v1SpeedSubject.set(results.v1);
          this.vrSpeedSubject.set(results.vr);
          this.v2SpeedSubject.set(results.v2);
          this.takeoffLengthSubject.set(results.takeoffLength);
        } else {
          this.v1SpeedSubject.set(null);
          this.vrSpeedSubject.set(null);
          this.v2SpeedSubject.set(null);
          this.takeoffLengthSubject.set(null);
        }
      },
      this.performancePlan.takeoffFlaps,
      this.performancePlan.takeoffOat,
      this.pressureAltitude,
      this.performancePlan.takeoffRunway,
      this.performancePlan.takeoffRunwaySlope,
      this.performancePlan.takeoffRunwayCondition,
      this.performancePlan.takeoffWind,
      this.performancePlan.takeoffAntiIceOn,
      this.canCalculateTakeoffPerformance,
    );

    // Send data to MFD as needed
    MappedSubject.create(([tow, gw, v1, vr, v2, takeoffLength]) => {
      this.eventBus.getPublisher<WT21MfdTextPageEvents>().pub('wt21mfd_to_perf_outputs', {
        tow,
        gw,
        calculations: v1 !== null && vr !== null && v2 !== null && takeoffLength !== null ? {
          v1, vr, v2, takeoffLength,
        } : null,
      }, true);
    }, this.tow, this.basePerformanceManager.gw, this.v1Speed, this.vrSpeed, this.v2Speed, this.takeoffLength);

    if (isPrimary) {
      const adc = this.eventBus.getSubscriber<AdcEvents>();

      // FIXME hacky! need to change some things to avoid this, as right now this will run before the perf plan proxy
      // has nay active perf plan associated with it
      setTimeout(() => {
        adc.on('altimeter_baro_setting_inhg_1').handle((value) => {
          this.performancePlan.takeoffAutoQnh.set(value);
        });
      }, 5_000);
    }
  }

  /**
   * Auto TOW calculated from GW - 100
   *
   * @private
   */
  private autoTow = MappedSubject.create(([gw]) => gw ? gw - 100 : null, this.basePerformanceManager.gw);

  /**
   * TOW
   */
  tow = MappedSubject.create(([autoValue, manualValue]) => {
    if (manualValue) {
      return manualValue;
    }

    return autoValue;
  }, this.autoTow, this.performancePlan.manualTow);

  /**
   * Pressure altitude
   */
  pressureAltitude = MappedSubject.create(([autoQnh, manualQnh, runway]) => {
    const qnh = manualQnh ?? autoQnh;

    if (!runway || qnh === null) {
      return null;
    }

    return Math.trunc((((29.92 - qnh) * 1000) + UnitType.FOOT.convertFrom(runway.elevation, UnitType.METER)));
  }, this.performancePlan.takeoffAutoQnh, this.performancePlan.takeoffManualQnh, this.performancePlan.takeoffRunway);

  /**
   * Indicates whether the data is currently sufficient to calculate takeoff performance
   */
  private canCalculateTakeoffPerformance = MappedSubject.create(
    ([...a]) => {
      return a.every((it) => it !== null);
    },
    this.tow,
    this.performancePlan.takeoffAutoQnh,
    this.performancePlan.takeoffOat,
    this.pressureAltitude,
    this.performancePlan.takeoffFlaps,
    this.performancePlan.takeoffRunwayCondition,
    this.performancePlan.takeoffAntiIceOn,
  );

  /**
   * Get a value indicating if all speeds are calculated and valid.
   * @returns true if all speeds are valid, false otherwise
   */
  public isAllSpeedsValid(): boolean {
    return this.v1SpeedSubject.get() !== null && this.vrSpeedSubject.get() !== null && this.v2SpeedSubject.get() !== null;
  }

  // Outputs

  private v1SpeedSubject = Subject.create<number | null>(null);

  public v1Speed: Subscribable<number | null> = this.v1SpeedSubject;

  private vrSpeedSubject = Subject.create<number | null>(null);

  public vrSpeed: Subscribable<number | null> = this.vrSpeedSubject;

  private v2SpeedSubject = Subject.create<number | null>(null);

  public v2Speed: Subscribable<number | null> = this.v2SpeedSubject;

  private takeoffLengthSubject = Subject.create<number | null>(null);

  public takeoffLength: Subscribable<number | null> = this.takeoffLengthSubject;
}

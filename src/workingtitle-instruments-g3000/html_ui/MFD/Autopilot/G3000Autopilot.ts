import {
  AltitudeSelectManagerAccelFilter, AltitudeSelectManagerAccelType, APStateManager, EventBus, FlightPlanner,
  MetricAltitudeSettingsManager, UnitType
} from '@microsoft/msfs-sdk';

import { GarminAPConfigInterface, GarminAutopilot, MinimumsDataProvider } from '@microsoft/msfs-garminsdk';

import { AutopilotConfig, G3000FlightPlannerId } from '@microsoft/msfs-wtg3000-common';

/**
 * A G3000 autopilot.
 */
export class G3000Autopilot extends GarminAutopilot {

  /**
   * Creates a new instance of G3000Autopilot.
   * @param bus The event bus.
   * @param flightPlanner The autopilot's associated flight planner.
   * @param apConfig The autopilot's configuration.
   * @param stateManager The autopilot's state manager.
   * @param g3000Config A G3000 config which defines options for the autopilot.
   * @param metricAltSettingsManager A manager of metric altitude mode user settings.
   * @param minimumsDataProvider A provider of minimums data.
   */
  public constructor(
    bus: EventBus,
    flightPlanner: FlightPlanner<G3000FlightPlannerId>,
    apConfig: GarminAPConfigInterface,
    stateManager: APStateManager,
    g3000Config: AutopilotConfig,
    metricAltSettingsManager: MetricAltitudeSettingsManager,
    minimumsDataProvider: MinimumsDataProvider
  ) {
    super(bus, flightPlanner, apConfig, stateManager, {
      altSelectOptions: {
        minValue: UnitType.FOOT.createNumber(g3000Config.selectedAltitudeOptions.minAltitude),
        maxValue: UnitType.FOOT.createNumber(g3000Config.selectedAltitudeOptions.maxAltitude),
        accelType: AltitudeSelectManagerAccelType.DynamicSmall,
        accelInputRateThreshold: 0,
        accelInputRateWindow: 500,
        accelInputRateTransformer: G3000Autopilot.createAltSelectInputRateTransformer(
          g3000Config.selectedAltitudeOptions.accelInputRateThreshold,
          g3000Config.selectedAltitudeOptions.accelInputMaxRate,
          g3000Config.selectedAltitudeOptions.accelInputRateRamp
        ),
        accelResetOnDirectionChange: true,
        accelFilter: AltitudeSelectManagerAccelFilter.ZeroIncDec
      },
      metricAltSettingsManager,
      minimumsDataProvider,
      supportMachSelect: true
    });
  }

  /**
   * Creates an input acceleration input rate transformer function for an altitude select manager. The function
   * transforms input rates above a threshold using a logistic curve. Input rates below the threshold are returned
   * unchanged. The logistic curve is parameterized such that the full transformation curve is still smooth (continuous
   * and differentiable) at the threshold.
   * @param accelThreshold The input rate above which a logistic curve is used to transform the rate, in inputs per
   * second.
   * @param maxRate The maximum input rate to be returned by the transformer function, in inputs per second. Must be
   * greater than `accelThreshold`.
   * @param accelRamp The rate at which the transformed input rate approaches `maxRate` as the input rate increases
   * above `accelThreshold`. Must be positive.
   * @returns An input acceleration input rate transformer function for an altitude select manager that respects the
   * specified parameters.
   */
  private static createAltSelectInputRateTransformer(accelThreshold: number, maxRate: number, accelRamp: number): (inputRate: number) => number {
    const T = Math.max(accelThreshold, 0);
    const U = maxRate;
    const k = accelRamp;

    // If parameters are invalid, then return a linear function.
    if (U <= T || k <= 0) {
      return G3000Autopilot.altSelectInputRateTransformer.bind(undefined, T, T, 0, 0, Infinity);
    }

    const b = 2 + k * (T - U);

    const disc = b * b - 4 * (k * (T - U) + 1);

    const x0 = Math.log((-b + Math.sqrt(disc)) / 2) / k + T;
    const L = (T - U) / Math.exp(k * (x0 - T)) + T;

    return G3000Autopilot.altSelectInputRateTransformer.bind(undefined, U, L, k, x0, T);
  }

  /**
   * Transforms a selected altitude input rate. Input rates above a certain threshold are transformed using a logistic
   * function. Input rates below the threshold are returned unchanged.
   * @param U The upper limit of the logistic curve.
   * @param L The lower limit of the logistic curve.
   * @param k The growth rate of the logistic curve.
   * @param x0 The x offset of the logistic curve.
   * @param threshold The input rate above which a logistic curve is used to transform the rate, and below which the
   * rate is returned unchanged.
   * @param inputRate The input rate to transform.
   * @returns The transformed input rate.
   */
  private static altSelectInputRateTransformer(U: number, L: number, k: number, x0: number, threshold: number, inputRate: number): number {
    if (inputRate <= threshold) {
      return inputRate;
    } else {
      return (U - L) / (1 + Math.exp(k * (x0 - inputRate))) + L;
    }
  }
}
import { FlightPlanPredictorConfiguration } from '@microsoft/msfs-sdk';

/**
 * WT21 Configuration for flight plan predictor
 */
export const WT21FlightPlanPredictorConfiguration: FlightPlanPredictorConfiguration = {
  predictMissedApproachLegs: false,

  minimumPredictionsGroundSpeed: 150,

  considerTurnAsLegTermination: false,
};

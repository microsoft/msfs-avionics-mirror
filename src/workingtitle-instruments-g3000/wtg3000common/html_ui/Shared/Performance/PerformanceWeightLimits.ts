import { NumberUnitReadOnly, UnitFamily } from '@microsoft/msfs-sdk';

/**
 * Aircraft weight limits and capacities.
 */
export type PerformanceWeightLimits = {
  /** Default basic empty weight. */
  basicEmpty: NumberUnitReadOnly<UnitFamily.Weight>;

  /** Maximum ramp weight. */
  maxRamp: NumberUnitReadOnly<UnitFamily.Weight>;

  /** Maximum takeoff weight. */
  maxTakeoff: NumberUnitReadOnly<UnitFamily.Weight>;

  /** Maximum landing weight. */
  maxLanding: NumberUnitReadOnly<UnitFamily.Weight>;

  /** Maximum zero-fuel weight. */
  maxZeroFuel: NumberUnitReadOnly<UnitFamily.Weight>;

  /** Maximum passenger count. */
  maxPassengerCount: number;
};

import { EventBus, Subscribable } from '@microsoft/msfs-sdk';


/**
 * Types of airspeed alerts.
 */
export enum AirspeedAlert {
  None = 0,
  Overspeed = 1 << 0,
  TrendOverspeed = 1 << 1,
  Underspeed = 1 << 2,
  TrendUnderspeed = 1 << 3
}

/**
 * A data provider for an airspeed indicator.
 */
export interface AirspeedIndicatorDataProvider {
  /** The event bus. */
  readonly bus: EventBus;

  /** The current indicated airspeed, in knots. */
  readonly iasKnots: Subscribable<number>;

  /** The current true airspeed, in knots. */
  readonly tasKnots: Subscribable<number>;

  /** The current mach number. */
  readonly mach: Subscribable<number>;

  /** The current conversion factor from mach number to knots indicated airspeed. */
  readonly machToKias: Subscribable<number>;

  /** The current conversion factor from true airspeed to indicated airspeed. */
  readonly tasToIas: Subscribable<number>;

  /** The current pressure altitude, in feet. */
  readonly pressureAlt: Subscribable<number>;

  /** The current airspeed trend, in knots. */
  readonly iasTrend: Subscribable<number>;

  /** The current reference indicated airspeed, or `null` if no such value exists. */
  readonly referenceIas: Subscribable<number | null>;

  /** The current reference mach number, or `null` if no such value exists. */
  readonly referenceMach: Subscribable<number | null>;

  /** Whether the current reference airspeed was set manually. */
  readonly referenceIsManual: Subscribable<boolean>;

  /** Whether an airspeed hold mode is active on the flight director. */
  readonly isAirspeedHoldActive: Subscribable<boolean>;

  /** The current active airspeed alerts, as bitflags. */
  readonly airspeedAlerts: Subscribable<number>;

  /** The current threshold for an overspeed condition. */
  readonly overspeedThreshold: Subscribable<number>;

  /** The current threshold for an underspeed condition. */
  readonly underspeedThreshold: Subscribable<number>;

  /** Whether autopilot overspeed protection is active. */
  readonly isOverspeedProtectionActive: Subscribable<boolean>;

  /** Whether autopilot underspeed protection is active. */
  readonly isUnderspeedProtectionActive: Subscribable<boolean>;

  /**
   * The correlation coefficient between a given normalized angle of attack and the estimated indicated airspeed in
   * knots required to maintain level flight at that angle of attack for the current aircraft configuration and
   * environment, or `null` if such a value cannot be calculated.
   */
  readonly normAoaIasCoef: Subscribable<number | null>;

  /** Whether airspeed data is in a failure state. */
  readonly isDataFailed: Subscribable<boolean>;

  /**
   * Estimates the indicated airspeed, in knots, required to maintain level flight at a given normalized angle of
   * attack value for the current aircraft configuration and environment. Normalized angle of attack is defined such
   * that `0` equals zero-lift AoA, and `1` equals stall AoA.
   * @param normAoa A normalized angle of attack value.
   * @returns The estimated indicated airspeed, in knots, required to maintain level flight at the specified angle of
   * attack, or `NaN` if an estimate cannot be made.
   */
  estimateIasFromNormAoa(normAoa: number): number;
}

/**
 * A definition for a reference V-speed.
 */
export type VSpeedDefinition = {
  /** The name of the V-speed. */
  readonly name: string;

  /** The default value of the V-speed, in knots. */
  readonly defaultValue: number;
}

/**
 * Types of reference V-speed groups.
 */
export enum VSpeedGroupType {
  General = 'General',
  Takeoff = 'Takeoff',
  Landing = 'Landing',
  Configuration = 'Configuration'
}

/**
 * Base type for V-speed groups.
 */
type BaseVSpeedGroup = {
  /** Definitions for each reference V-speed contained in this group. */
  readonly vSpeedDefinitions: readonly VSpeedDefinition[];
};

/**
 * A general reference V-speed group.
 */
export type GeneralVSpeedGroup = BaseVSpeedGroup & {
  /** The type of this group. */
  readonly type: VSpeedGroupType.General;
};

/**
 * A takeoff reference V-speed group.
 */
export type TakeoffVSpeedGroup = BaseVSpeedGroup & {
  /** The type of this group. */
  readonly type: VSpeedGroupType.Takeoff;

  /**
   * The indicated airspeed, in knots, above which takeoff V-speed bugs will be automatically removed from the
   * airspeed indicator. If not defined, then indicated airspeed will not affect whether takeoff V-speed bugs are
   * automatically removed.
   */
  readonly maxIas?: number;
};

/**
 * A landing reference V-speed group.
 */
export type LandingVSpeedGroup = BaseVSpeedGroup & {
  /** The type of this group. */
  readonly type: VSpeedGroupType.Landing;
};

/**
 * A configuration reference V-speed group.
 */
export type ConfigurationVSpeedGroup = BaseVSpeedGroup & {
  /** The type of this group. */
  readonly type: VSpeedGroupType.Configuration;

  /**
   * The pressure altitude, in feet, above which configuration V-speed bugs will be automatically removed from the
   * airspeed indicator. If not defined, then pressure altitude will not affect whether configuration V-speed bugs are
   * automatically removed.
   */
  readonly maxAltitude?: number;
};

/**
 * A reference V-speed group.
 */
export type VSpeedGroup = GeneralVSpeedGroup | TakeoffVSpeedGroup | LandingVSpeedGroup | ConfigurationVSpeedGroup;

/**
 * Keys for reference V-speed values derived from aircraft configuration files.
 */
export enum VSpeedValueKey {
  StallLanding = 'VS0',
  StallCruise = 'VS1',
  FlapsExtended = 'VFe',
  NeverExceed = 'VNe',
  NormalOperation = 'VNo',
  Minimum = 'VMin',
  Maximum = 'VMax',
  Rotation = 'Vr',
  BestClimbAngle = 'Vx',
  BestClimbRate = 'Vy',
  Approach = 'Vapp',
  BestGlide = 'BestGlide',
  BestClimbRateSingleEngine = 'Vyse',
  MinimumControl = 'Vmc'
}
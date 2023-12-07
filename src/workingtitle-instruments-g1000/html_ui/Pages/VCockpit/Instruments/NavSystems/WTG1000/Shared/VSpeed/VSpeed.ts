/**
 * A definition for a reference V-speed.
 */
export type VSpeedDefinition = {
  /** The name of the V-speed. */
  readonly name: string;

  /** The default value of the V-speed, in knots. */
  readonly defaultValue: number;

  /** The label text to display for the V-speed in the TimerRef menu. */
  readonly label: string;
}

/**
 * Base type for V-speed groups.
 */
export type VSpeedGroup = {
  /** This group's name. */
  readonly name: string;

  /** Definitions for each reference V-speed contained in this group. */
  readonly vSpeedDefinitions: readonly VSpeedDefinition[];
};

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
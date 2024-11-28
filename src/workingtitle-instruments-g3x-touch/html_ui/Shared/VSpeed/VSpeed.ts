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
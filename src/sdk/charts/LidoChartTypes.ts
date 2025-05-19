/**
 * The different LIDO chart types
 */
export enum LidoChartType {
  Unknown = 'UNKNOWN',

  /** Standard Instrument Departure. */
  Sid = 'SID',

  /** SID Procedure Text. */
  SidPt = 'SIDPT',

  /** SID Initial Climb */
  SidInitialClimb = 'SID Initial Climb',

  /** Obstacle Departure */
  ObstDep = 'ObstDep',

  /** Airport Facility Chart. */
  Afc = 'AFC',

  /** Instrument Approach Chart. */
  Iac = 'IAC',

  /** Visual Approach Chart. */
  Vac = 'VAC',

  /** Standard Arrival Route / Arrival Chart. */
  Star = 'STAR',

  /** Minimum Radar Vectoring Chart. */
  Mrc = 'MRC',

  /** Airport Operational Information. */
  Aoi = 'AOI',

  /** Low Visibility Chart. */
  Lvc = 'LVC',

  /** Airport Ground Chart. */
  Agc = 'AGC',

  /** Airport Parking Chart. */
  Apc = 'APC',
}

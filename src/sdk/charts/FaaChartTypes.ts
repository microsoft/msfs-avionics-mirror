/**
 * The different FAA chart types
 */
export enum FaaChartType {
  Unknown = 'UNKNOWN',

  /** Instrument Approach Procedure */
  Iap = 'IAP',

  /** Minimums (takeoff or alternate) */
  Min = 'MIN',

  /** Departure Procedure */
  Dp = 'DP',

  /** Standard Terminal Arrival */
  Star = 'STAR',

  /** Airport Diagram */
  Apd = 'APD',

  /** Hotspots */
  Hot = 'HOT',

  /** Obstacle Departure */
  Odp = 'ODP',

  /** Land and Hold Short Operations */
  Lah = 'LAH',

  /** Departure Attention All Users */
  Dau = 'DAU',
}

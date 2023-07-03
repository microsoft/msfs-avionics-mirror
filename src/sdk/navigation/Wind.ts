/** Interface for wind entry data */
export interface WindEntry {
  /** Wind direction */
  direction: number,

  /** Indicating if direction is in true degrees */
  trueDegrees: boolean,

  /** Wind speed */
  speed: number,
}
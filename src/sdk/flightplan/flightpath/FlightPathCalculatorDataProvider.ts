import { LatLonInterface } from '../../geo/GeoInterfaces';

/**
 * A provider of data for a lateral flight path calculator.
 */
export interface FlightPathCalculatorDataProvider {
  /**
   * Gets the airplane's current position.
   * @returns The airplane's current position. If position data are unavailable, then both latitude and longitude will
   * be `NaN`.
   */
  getPlanePosition(): Readonly<LatLonInterface>;

  /**
   * Gets the airplane's current true airspeed, in knots.
   * @returns The airplane's current true airspeed, in knots, or `NaN` if airspeed data are unavailable.
   */
  getPlaneTrueAirspeed(): number;

  /**
   * Gets the airplane's current ground speed, in knots.
   * @returns The airplane's current ground speed, in knots, or `NaN` if ground speed data are unavailable.
   */
  getPlaneGroundSpeed(): number;

  /**
   * Gets the wind direction at the airplane's current position, in degrees relative to true north. The wind direction
   * is the direction **from** which the wind is blowing.
   * @returns The wind direction at the airplane's current position, in degrees relative to true north, or `NaN` if
   * wind data are unavailable.
   */
  getPlaneWindDirection(): number;

  /**
   * Gets the wind speed at the airplane's current position, in knots.
   * @returns The wind speed at the airplane's current position, in knots, or `NaN` if wind data are unavailable.
   */
  getPlaneWindSpeed(): number;

  /**
   * Gets the airplane's current altitude, in feet above sea level.
   * @returns The airplane's current altitude, in feet above sea level, or `NaN` if altitude data are unavailable.
   */
  getPlaneAltitude(): number;

  /**
   * Gets the airplane's current vertical speed, in feet per minute.
   * @returns The airplane's current vertical speed, in feet per minute, or `NaN` if vertical speed data are
   * unavailable.
   */
  getPlaneVerticalSpeed(): number;

  /**
   * Gets the airplane's current true heading, in degrees.
   * @returns The airplane's current true heading, in degrees, or `NaN` if heading data are unavailable.
   */
  getPlaneTrueHeading(): number;
}

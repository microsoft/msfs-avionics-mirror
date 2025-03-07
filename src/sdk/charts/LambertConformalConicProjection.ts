import { Subject } from '../sub/Subject';
import { Subscribable } from '../sub/Subscribable';
import { ChartLambertConformalConicProjection } from './ChartTypes';

/**
 * A Lambert Conformal Conic projection for use with chart viewing
 */
export class ChartViewLambertConformalConicProjection {
  private static readonly EARTH_RADIUS_METRES = 6_378_137;

  private readonly _valid = Subject.create(false);

  public readonly valid: Subscribable<boolean> = this._valid;

  private n: number | null = null;

  private F: number | null = null;

  private p0: number | null = null;

  private lambda0: number | null = null;

  /**
   * Sets the parameters of this LCC projection, after which points can be projected
   * @param standardParallel1 The first standard parallel.
   * @param standardParallel2 The second standard parallel.
   * @param originLat The origin (central) latitude.
   * @param originLon The origin (central) longitude.
   */
  public setParameters(
    standardParallel1: number,
    standardParallel2: number,
    originLat: number,
    originLon: number
  ): void {
    const phi1 = standardParallel1 * (Math.PI / 180);
    const phi2 = standardParallel2 * (Math.PI / 180);
    const phi0 = originLat * (Math.PI / 180);

    this.n =
      Math.log(Math.cos(phi1) / Math.cos(phi2)) /
      Math.log(Math.tan(Math.PI / 4 + phi2 / 2) / Math.tan(Math.PI / 4 + phi1 / 2));
    this.F = (Math.cos(phi1) * Math.tan(Math.PI / 4 + phi1 / 2) ** this.n) / this.n;
    this.p0 =
      (ChartViewLambertConformalConicProjection.EARTH_RADIUS_METRES * this.F) / Math.tan(Math.PI / 4 + phi0 / 2) ** this.n;
    this.lambda0 = originLon;

    this._valid.set(true);
  }

  /**
   * Sets the parameters of this LCC projection from a chart area projection, after which points can be projected
   * @param projection the chart area projection to take the LCC parameters from
   */
  public setParametersFromChartAreaProjection(projection: ChartLambertConformalConicProjection): void {
    this.setParameters(
      projection.standardParallel1,
      projection.standardParallel2,
      projection.standardParallel1,
      projection.centralMeridian
    );
  }

  /**
   * Resets this LCC projection's parameters
   */
  public reset(): void {
    this.n = null;
    this.F = null;
    this.p0 = null;
    this.lambda0 = null;

    this._valid.set(false);
  }

  /**
   * Projects a lat/lon point using the current parameters to an array of x and y coordinates, in metres.
   * @param lat the latitude of the point to project
   * @param lon the longitude of the point to project
   * @param out the array to output the projected x and y coordinates
   * @throws if the projection parameters are not set
   */
  public project(lat: number, lon: number, out: Float64Array): void {
    if (this.n === null || this.F === null || this.p0 === null || this.lambda0 === null) {
      throw new Error('[ChartViewLambertConformalConicProjection](project) Cannot project before setting parameters');
    }

    const phi = lat * (Math.PI / 180);

    const p =
      (ChartViewLambertConformalConicProjection.EARTH_RADIUS_METRES * this.F) / Math.tan(Math.PI / 4 + phi / 2) ** this.n;
    const theta = this.n * (lon - this.lambda0) * (Math.PI / 180);

    const x = p * Math.sin(theta);
    const y = this.p0 - p * Math.cos(theta);

    out.set([x, y]);
  }
}

import { ChartArea, ChartPage, ChartUrl, GeoPoint, LatLonInterface, ReadonlyFloat64Array } from '@microsoft/msfs-sdk';

/**
 * Bitflags describing changes in a {@link GarminChartDisplayProjection}.
 */
export enum GarminChartDisplayProjectionChangeFlags {
  DisplaySelection = 1 << 0,
  IsValid = 1 << 1,
  IsGeoReferenced = 1 << 2,
  DisplaySize = 1 << 3,
  ChartBounds = 1 << 4,
  ChartScale = 1 << 5,
  ChartRotation = 1 << 6,
  ChartPan = 1 << 7,
  GeoReferenceBounds = 1 << 8,
  GeoReferenceProjection = 1 << 9,
}

/**
 * Information describing a chart that has been selected to be displayed in a Garmin terminal (airport) chart display.
 */
export type GarminChartDisplayProjectionDisplaySelection = {
  /** The chart page selected to be displayed. */
  page: ChartPage | null;

  /** The area of the chart page selected to be displayed. */
  area: ChartArea | null;

  /** The URL for the chart page selected to be displayed. */
  url: ChartUrl | null;
};

/**
 * A projection used to display a chart in a Garmin terminal (airport) chart display.
 */
export interface GarminChartDisplayProjection {
  /**
   * Gets information describing the chart that is selected to be displayed.
   * @returns Information describing the chart that is selected to be displayed.
   */
  getDisplaySelection(): Readonly<GarminChartDisplayProjectionDisplaySelection>;

  /**
   * Checks whether this projection is valid. This projection is considered valid if and only if a chart page is
   * displayed, and both the displayed chart area and the target display window have non-zero areas.
   * @returns Whether this projection is valid.
   */
  isValid(): boolean;

  /**
   * Checks whether this projection has geo-referencing data available for the currently displayed chart.
   * @returns Whether this projection has geo-referencing data available for the currently displayed chart.
   */
  isGeoReferenced(): boolean;

  /**
   * Gets the size of this projection's target display window, as `[width, height]` in pixels.
   * @returns The size of this projection's target display window, as `[width, height]` in pixels.
   */
  getDisplaySize(): ReadonlyFloat64Array;

  /**
   * Gets the boundaries of the chart area that is displayed, as `[x_min, y_min, x_max, y_max]` in the chart's internal
   * coordinate system. `(0, 0)` is the top-left corner of the chart, with the positive x axis pointing to the left and
   * the positive y axis pointing downward. If there is no displayed chart, then this method returns `[0, 0, 0, 0]`.
   * @returns The boundaries of the chart area that is displayed, as `[x_min, y_min, x_max, y_max]` in the chart's
   * internal coordinate system.
   */
  getChartBounds(): ReadonlyFloat64Array;

  /**
   * Gets the scaling factor applied to the chart. The scaling factor converts the displayed chart's internal
   * coordinate system units to pixels. If this projection is not valid, then this method returns 1.
   * @returns The scaling factor applied to the chart.
   */
  getChartScale(): number;

  /**
   * Gets the rotation angle applied to the chart, in radians. Positive angles represent clockwise rotation. The
   * rotation axis is always about the center of the display window. If this projection is not valid, then this method
   * returns 0.
   * @returns The rotation angle applied to the chart, in radians.
   */
  getChartRotation(): number;

  /**
   * Gets the panning offset (translation) applied to the chart, as `[x, y]` in units of the chart's internal
   * coordinate system. An offset of `[0, 0]` indicates the displayed chart area is centered in the display window. If
   * this projection is not valid, then this method returns `[0, 0]`.
   * @returns The panning offset (translation) applied to the chart, as `[x, y]` in units of the chart's internal
   * coordinate system.
   */
  getChartPan(): ReadonlyFloat64Array;

  /**
   * Converts a point defined in the displayed chart's internal coordinate system to the pixel coordinates in the
   * display window to which the original point is projected. If this projection is not valid, then this method returns
   * `[NaN, NaN]`.
   * @param point The point to convert, as `[x, y]` in the displayed chart's internal coordinate system.
   * @param out The array to which to write the result.
   * @returns The pixel coordinates in the display window, as `[x, y]`, to which the specified point in the displayed
   * chart's internal coordinate system is projected.
   */
  convertChartToDisplay(point: ReadonlyFloat64Array, out: Float64Array): Float64Array;

  /**
   * Converts a point in the display window to a set of coordinates in the displayed chart's internal coordinate system
   * from which the original point is projected. If this projection is not valid, then this method returns
   * `[NaN, NaN]`.
   * @param point The point to convert, as `[x, y]` in pixels.
   * @param out The array to which to write the result.
   * @returns The coordinates, as `[x, y]` in the displayed chart's internal coordinate system, that is projected to
   * the specified point in the display window.
   */
  convertDisplayToChart(point: ReadonlyFloat64Array, out: Float64Array): Float64Array;

  /**
   * Gets the boundaries of the displayed chart area that is geo-referenced, as `[x_min, y_min, x_max, y_max]` in the
   * chart's internal coordinate system. `(0, 0)` is the top-left corner of the chart, with the positive x axis
   * pointing to the left and the positive y axis pointing downward. If there is no displayed chart or if the displayed
   * chart area has no geo-referencing data, then this method returns `[0, 0, 0, 0]`.
   * @returns The boundaries of the displayed chart area that is geo-referenced, as `[x_min, y_min, x_max, y_max]` in
   * the chart's internal coordinate system.
   */
  getGeoReferenceChartBounds(): Float64Array;

  /**
   * Gets the nominal scale factor of the Lambert conformal conic projection that projects a set of geographic
   * coordinates in the geo-referenced area of the displayed chart to a set of coordinates in the chart's internal
   * coordinate system. A nominal scale factor of 1 projects a geographic distance along the projection's standard
   * parallels of 1 great-arc radian to a length of one unit in the chart's internal coordinate system. If
   * geo-referencing data are not available, then this method returns 1.
   * @returns The nominal scale factor of the Lambert conformal conic projection that projects a set of geographic
   * coordinates in the geo-referenced area of the displayed chart to a set of coordinates in the chart's internal
   * coordinate system.
   */
  getGeoReferenceScaleFactor(): number;

  /**
   * Gets the post-projection rotation angle, in radians, of the Lambert conformal conic projection that projects a set
   * of geographic coordinates in the geo-referenced area of the displayed chart to a set of coordinates in the chart's
   * internal coordinate system. The rotation angle is equivalent to the angular offset of the direction of true north
   * along the projection's central meridian from the "up" direction (negative y axis) in the chart's internal
   * coordinate system. If geo-referencing data are not available, then this method returns 0.
   * @returns The post-projection rotation angle, in radians, of the Lambert conformal conic projection that projects a
   * set of geographic coordinates in the geo-referenced area of the displayed chart to a set of coordinates in the
   * chart's internal coordinate system.
   */
  getGeoReferenceRotation(): number;

  /**
   * Converts a set of geographic coordinates in the geo-referenced area of the displayed chart to the corresponding
   * coordinates in the chart's internal coordinate system, as `[x, y]`. If there are no geo-referencing data available
   * or the geographic coordinates fall outside the geo-referenced area, then this method returns `[NaN, NaN]`.
   * @param point The geographic coordinates to convert, as either `[lon, lat]` in degrees or a `LatLonInterface`.
   * @param out The array to which to write the results.
   * @returns The set of coordinates in the chart's internal coordinate system, as `[x, y]`, corresponding to the
   * specified geographical coordinates.
   */
  convertGeoToChart(point: ReadonlyFloat64Array | Readonly<LatLonInterface>, out: Float64Array): Float64Array;

  /**
   * Converts a set of coordinates in the displayed chart's internal coordinate system within the geo-referenced area
   * to the corresponding geographic coordinates. If there are no geo-referencing data available or the coordinates
   * fall outside the geo-referenced area, then this method returns `NaN` for both latitude and longitude.
   * @param point The point to convert, as `[x, y]` in the displayed chart's internal coordinate system.
   * @param out The object to which to write the results. If an array is supplied, then the coordinates are returned as
   * `[lon, lat]` in degrees.
   * @returns The geographic coordinates corresponding to the specified coordinates in the displayed chart's internal
   * coordinate system.
   */
  convertChartToGeo<T extends Float64Array | GeoPoint>(point: ReadonlyFloat64Array, out: T): T;

  /**
   * Converts a set of geographic coordinates in the geo-referenced area of the displayed chart to the corresponding
   * coordinates in the display window, as `[x, y]` in pixels. If this projection is invalid, or there are no
   * geo-referencing data available, or the geographic coordinates fall outside the geo-referenced area, then this
   * method returns `[NaN, NaN]`.
   * @param point The geographic coordinates to convert, as either `[lon, lat]` in degrees or a `LatLonInterface`.
   * @param out The array to which to write the results.
   * @returns The set of coordinates in the display window, as `[x, y]` in pixels, corresponding to the specified
   * geographical coordinates.
   */
  convertGeoToDisplay(point: ReadonlyFloat64Array | Readonly<LatLonInterface>, out: Float64Array): Float64Array;

  /**
   * Converts a set of coordinates in the display window within the geo-referenced area to the corresponding geographic
   * coordinates. If this projection is invalid, or there are no geo-referencing data available, or the coordinates
   * fall outside the geo-referenced area, then this method returns `NaN` for both latitude and longitude.
   * @param point The point to convert, as `[x, y]` in pixels.
   * @param out The object to which to write the results. If an array is supplied, then the coordinates are returned as
   * `[lon, lat]` in degrees.
   * @returns The geographic coordinates corresponding to the specified coordinates in the display window.
   */
  convertDisplayToGeo<T extends Float64Array | GeoPoint>(point: ReadonlyFloat64Array, out: T): T;
}

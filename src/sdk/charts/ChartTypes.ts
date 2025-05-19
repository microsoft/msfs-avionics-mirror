import { ApproachIdentifier, RunwayIdentifier } from '../navigation/Facilities';
import { IcaoValue } from '../navigation/Icao';

/**
 * A chart index for an airport
 */
export interface ChartIndex<T extends string> {
  /** The ICAO (FSID) of the airport this chart index is for */
  airportIcao: IcaoValue;

  /** A list of chart categories with an array of charts of that category */
  charts: ChartIndexCategory<T>[];
}

/**
 * A category in a chart index
 */
export interface ChartIndexCategory<T extends string> {
  /** The name of the category */
  readonly name: T;

  /** The charts present in the category */
  readonly charts: ChartMetadata<T>[];
}

export enum ChartProcedureType {
  Sid,
  Star,
  Approach,
}

/**
 * A base chart procedure identifier
 */
export interface BaseChartProcedureIdentifier {
  /** The C++ binding type */
  readonly __Type: 'JS_ChartProcedureIdentifier';

  /** The type of procedure being identified */
  readonly type: ChartProcedureType;

  /** The 8-letter procedure identifier. Empty for approaches. */
  readonly ident: unknown;

  /** The runway transition identifier, if applicable */
  readonly runwayTransition?: string;

  /** The enroute transition (or approach transition) identifier, if applicable */
  readonly enrouteTransition?: string;

  /** The approach identifier, if applicable */
  readonly approachIdentifier: unknown;
}

/**
 * A SID/STAR chart procedure identifier
 */
export interface ChartSidStarProcedureIdentifier extends BaseChartProcedureIdentifier {
  /** The type of procedure being identified */
  readonly type: ChartProcedureType.Sid | ChartProcedureType.Star;

  /** The 8-letter procedure identifier. Empty for approaches. */
  readonly ident: string;

  /** @inheritDoc */
  readonly approachIdentifier: undefined;
}

/**
 * An approach chart procedure identifier
 */
export interface ChartApproachProcedureIdentifier extends BaseChartProcedureIdentifier {
  /** The type of procedure being identified */
  readonly type: ChartProcedureType.Approach;

  /** The 8-letter procedure identifier. Empty for approaches. */
  readonly ident: '';

  /** @inheritDoc */
  readonly approachIdentifier: ApproachIdentifier;
}

/**
 * An chart procedure identifier
 */
export type ChartProcedureIdentifier = ChartSidStarProcedureIdentifier | ChartApproachProcedureIdentifier;

/**
 * Metadata regarding an airport chart
 */
export interface ChartMetadata<T extends string = string> {
  /** The GUID of this chart */
  readonly guid: string;

  /** The type of the chart */
  readonly type: T;

  /** The ICAO (FSID) of the airport this chart is for */
  readonly airportIcao: IcaoValue;

  /** The name of this chart */
  readonly name: string;

  /** Whether any of the chart's pages are georeferenced */
  readonly geoReferenced: boolean;

  /** A list of the FSIDs of procedures to which this chart is related */
  readonly procedures: ChartProcedureIdentifier[];

  /** The identifiers of the runways associated with this chart */
  readonly runways: RunwayIdentifier[];

  /** The date from which this chart is valid, as a Javascript timestamp, or `null` if the date is not available. */
  readonly validFrom: number | null;

  /** The date to which this chart is valid, as a Javascript timestamp, or `null` if the date is not available. */
  readonly validUntil: number | null;
}

/** A list of chart pages for a chart */
export interface ChartPages {
  /** The chart pages */
  pages: ChartPage[];
}

/**
 * A page of a chart
 */
export interface ChartPage {
  /** The width, in arbitrary units, of the page. */
  readonly width: number;

  /** The height, in arbitrary units, of the page. */
  readonly height: number;

  /** Whether the chart page is georeferenced */
  readonly geoReferenced: boolean;

  /** The georeferenced areas of this chart page */
  readonly areas: ChartArea[];

  /** The urls associated with different image/document files for this chart page */
  readonly urls: ChartUrl[];
}

/**
 * A URL to a chart page
 */
export interface ChartUrl {
  /** The name of the URL. This should contain information useful to determine the type of file this refers to. */
  readonly name: string;

  /** The URL itself */
  readonly url: string;
}
/**
 * Base type for a chart area
 */
export interface BaseChartArea {
  /** The layer name of this area */
  readonly layer: string;

  /** The rectangle representing this area, projected on the chart. Coordinates in pixels. */
  readonly chartRectangle: ChartRectangle;

  /** The projection used for this area */
  readonly projection: unknown;
}

/**
 * A georeferenced chart area
 */
export interface GeoReferencedChartArea extends BaseChartArea {
  /** Whether this area is georeferenced */
  readonly geoReferenced: true;

  /** The rectangle representing this area, projected on the world. Coordinates in degrees. */
  readonly worldRectangle: ChartRectangle;

  /** The LCC projection used for this area */
  readonly projection: ChartLambertConformalConicProjection;
}

/**
 * An LCC projection for a chart area
 */
export interface ChartLambertConformalConicProjection {
  /** The type from the simulator */
  __Type: 'JS_ChartGeoReferenceLambertConformalConicProjection';

  /** The first standard parallel, in degrees. */
  standardParallel1: number;

  /** The second standard parallel, in degrees. */
  standardParallel2: number;

  /** The central meridian, in degrees. */
  centralMeridian: number;
}

/**
 * A non-georeferenced chart area
 */
export interface NonGeoReferencedChartArea extends BaseChartArea {
  /** Whether this area is georeferenced */
  readonly geoReferenced: false;
}

/**
 * A chart area
 */
export type ChartArea = GeoReferencedChartArea | NonGeoReferencedChartArea;

/**
 * A rectangle on a chart
 */
export interface ChartRectangle {
  /**
   * The upper left corner of this rectangle, in arbitrary units for image coordinates or degrees for
   * latitude/longitude coordinates.
   */
  readonly upperLeft: [xOrLon: number, yOrLat: number];

  /**
   * The upper left corner of this rectangle, in arbitrary units for image coordinates or degrees for
   * latitude/longitude coordinates.
   */
  readonly lowerRight: [xOrLon: number, yOrLat: number];

  /**
   * The angle, in degrees, by which this rectangle's internal coordinate system is rotated relative to the containing
   * chart. Positive values indicate counterclockwise rotation.
   */
  readonly orientation: number;
}

/**
 * Chart providers built into the simulator
 */
export enum BuiltInChartProvider {
  Lido = 'LIDO',
  Faa = 'FAA',
}

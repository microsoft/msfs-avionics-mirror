import {
  ApproachIdentifier, ChartIndex, ChartMetadata, ChartUrl, GeoReferencedChartArea, RunwayIdentifier
} from '@microsoft/msfs-sdk';

import { G3XChartsPageData } from './G3XChartsTypes';

/**
 * A source of electronic chart data for the G3X Touch.
 * @experimental
 */
export interface G3XChartsSource {
  /** The ID that uniquely identifies this source. Cannot be the empty string. */
  readonly uid: string;

  /** The name of this source. */
  readonly name: string;

  /** The chart provider from which this source's chart data can be retrieved. */
  readonly provider: string;

  /** Whether this source supports night mode charts. */
  readonly supportsNightMode: boolean;

  /**
   * Gets an array of airport diagram charts for an airport.
   * @param chartIndex The airport's chart index.
   * @returns An array of airport diagram charts for the specified airport.
   */
  getAirportDiagramCharts(chartIndex: ChartIndex<string>): ChartMetadata[];

  /**
   * Gets an array of airport information charts for an airport, *excluding* any airport diagram charts.
   * @param chartIndex The airport's chart index.
   * @returns An array of airport information charts for the specified airport, *excluding* any airport diagram charts.
   */
  getInfoCharts(chartIndex: ChartIndex<string>): ChartMetadata[];

  /**
   * Gets an array of departure procedure charts for an airport.
   * @param chartIndex The airport's chart index.
   * @returns An array of departure procedure charts for the specified airport.
   */
  getDepartureCharts(chartIndex: ChartIndex<string>): ChartMetadata[];

  /**
   * Gets an array of arrival procedure charts for an airport.
   * @param chartIndex The airport's chart index.
   * @returns An array of arrival procedure charts for the specified airport.
   */
  getArrivalCharts(chartIndex: ChartIndex<string>): ChartMetadata[];

  /**
   * Gets an array of approach procedure charts for an airport.
   * @param chartIndex The airport's chart index.
   * @returns An array of approach procedure charts for the specified airport.
   */
  getApproachCharts(chartIndex: ChartIndex<string>): ChartMetadata[];

  /**
   * Gets the primary airport diagram chart page from among an array of pages.
   * @param pages The chart pages from which to choose.
   * @returns The primary airport diagram chart page from the specified array, or `undefined` if no such page could be
   * found.
   */
  getAirportDiagramPage(pages: readonly G3XChartsPageData[]): G3XChartsPageData | undefined;

  /**
   * Gets the primary chart page associated with a departure procedure from among an array of pages.
   * @param pages The chart pages from which to choose.
   * @param departureName The name of the departure procedure.
   * @param enrouteTransitionName The name of the procedure's enroute transition, or the empty string if the enroute
   * transition is not specified.
   * @param runway The identifier of the runway associated with the procedure's runway transition, or the empty
   * identifier if the runway transition is not specified.
   * @returns The primary chart page associated with the specified departure procedure from the specified array, or
   * `undefined` if no such page could be found.
   */
  getDeparturePage(
    pages: readonly G3XChartsPageData[],
    departureName: string,
    enrouteTransitionName: string,
    runway: Readonly<RunwayIdentifier>
  ): G3XChartsPageData | undefined;

  /**
   * Gets the primary chart page associated with an arrival procedure from among an array of pages.
   * @param pages The chart pages from which to choose.
   * @param arrivalName The name of the arrival procedure.
   * @param enrouteTransitionName The name of the procedure's enroute transition, or the empty string if the enroute
   * transition is not specified.
   * @param runway The identifier of the runway associated with the procedure's runway transition, or the empty
   * identifier if the runway transition is not specified.
   * @returns The primary chart page associated with the specified arrival procedure from the specified array, or
   * `undefined` if no such page could be found.
   */
  getArrivalPage(
    pages: readonly G3XChartsPageData[],
    arrivalName: string,
    enrouteTransitionName: string,
    runway: Readonly<RunwayIdentifier>
  ): G3XChartsPageData | undefined;

  /**
   * Gets the primary chart page associated with an approach procedure from among an array of pages.
   * @param pages The chart pages from which to choose.
   * @param approachIdentifier The identifier for the approach procedure.
   * @param transitionName The name of the procedure's transition, or the empty string for the VECTORS transition.
   * @returns The primary chart page associated with the specified approach procedure from the specified array, or
   * `undefined` if no such page could be found.
   */
  getApproachPage(
    pages: readonly G3XChartsPageData[],
    approachIdentifier: Readonly<ApproachIdentifier>,
    transitionName: string
  ): G3XChartsPageData | undefined;

  /**
   * Gets the display name of a chart page.
   * @param pageData The chart page for which to get the display name.
   * @returns The display name of the specified chart page.
   */
  getChartName(pageData: G3XChartsPageData): string;

  /**
   * Gets the URL for the day mode version of a chart page.
   * @param pageData The chart page for which to get the URL.
   * @returns The URL for the day mode version of a chart page, or `undefined` if no such URL exists.
   */
  getDayModeUrl(pageData: G3XChartsPageData): ChartUrl | undefined;

  /**
   * Gets the URL for the night mode version of a chart page.
   * @param pageData The chart page for which to get the URL.
   * @returns The URL for the night mode version of a chart page, or `undefined` if no such URL exists.
   */
  getNightModeUrl(pageData: G3XChartsPageData): ChartUrl | undefined;

  /**
   * Gets the geo-referenced area for a chart page.
   * @param pageData The chart page.
   * @returns The geo-referenced area for the specified page, or `undefined` if geo-referencing is not available.
   */
  getGeoReferencedArea(pageData: G3XChartsPageData): GeoReferencedChartArea | undefined;
}

/**
 * A factory that creates an electronic charts source.
 * @experimental
 */
export interface G3XChartsSourceFactory {
  /** The ID of the source created by this factory. */
  readonly uid: string;

  /**
   * Creates a new electronic charts source.
   * @returns A new electronic charts source.
   */
  createSource(): G3XChartsSource;
}

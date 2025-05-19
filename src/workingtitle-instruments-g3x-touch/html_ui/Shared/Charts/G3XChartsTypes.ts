import { ChartMetadata, ChartPage, IcaoValue } from '@microsoft/msfs-sdk';

/**
 * Data describing an electronic chart page.
 * @experimental
 */
export interface G3XChartsPageData {
  /** The metadata associated with the page's parent chart. */
  readonly metadata: ChartMetadata;

  /** The chart page. */
  readonly page: ChartPage;

  /** The index of the page in its parent chart. */
  readonly pageIndex: number;

  /** The total number of pages contained in the page's parent chart. */
  readonly pageCount: number;
}

/**
 * Data describing the electronic charts available for a selected airport.
 * @experimental
 */
export interface G3XChartsAirportSelectionData {
  /** The ICAO of the selected airport. */
  readonly icao: IcaoValue;

  /**
   * The ID of the charts source that provided the charts for the selected airport, or `null` if no charts source
   * was used.
   */
  readonly source: string | null;

  /** All airport diagram chart pages for the airport. */
  readonly airportDiagramPages: readonly G3XChartsPageData[];

  /** All airport information chart pages for the selected airport, *excluding* any airport diagram charts. */
  readonly infoPages: readonly G3XChartsPageData[];

  /** All departure procedure chart pages for the selected airport. */
  readonly departurePages: readonly G3XChartsPageData[];

  /** All arrival procedure chart pages for the selected airport. */
  readonly arrivalPages: readonly G3XChartsPageData[];

  /** All approach procedure chart pages for the selected airport. */
  readonly approachPages: readonly G3XChartsPageData[];
}

/**
 * Data describing a selected electronic charts page.
 * @experimental
 */
export interface G3XChartsPageSelectionData {
  /** The ID of the charts source that provided the page. */
  readonly source: string;

  /** Data describing the selected page. */
  readonly pageData: G3XChartsPageData;
}

/**
 * Color modes with which to display electronic charts.
 */
export enum G3XChartsDisplayColorMode {
  Day = 'Day',
  Night = 'Night',
}

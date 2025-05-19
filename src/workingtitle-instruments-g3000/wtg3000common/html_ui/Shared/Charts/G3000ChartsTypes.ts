import { ChartMetadata, ChartPage, IcaoValue } from '@microsoft/msfs-sdk';

/**
 * Data describing an electronic chart page.
 * @experimental
 */
export interface G3000ChartsPageData {
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
export interface G3000ChartsAirportSelectionData {
  /** The ICAO of the selected airport. */
  readonly icao: IcaoValue;

  /**
   * The ID of the charts source that provided the charts for the selected airport, or `null` if no charts source
   * was used.
   */
  readonly source: string | null;

  /** All airport information chart pages for the selected airport. */
  readonly infoPages: readonly G3000ChartsPageData[];

  /** All departure procedure chart pages for the selected airport. */
  readonly departurePages: readonly G3000ChartsPageData[];

  /** All arrival procedure chart pages for the selected airport. */
  readonly arrivalPages: readonly G3000ChartsPageData[];

  /** All approach procedure chart pages for the selected airport. */
  readonly approachPages: readonly G3000ChartsPageData[];
}

/**
 * Data describing a selected electronic charts page.
 * @experimental
 */
export interface G3000ChartsPageSelectionData {
  /** The ID of the charts source that provided the page. */
  readonly source: string;

  /** Data describing the selected page. */
  readonly pageData: G3000ChartsPageData;
}

/**
 * Light modes with which to display electronic charts.
 */
export enum G3000ChartsDisplayLightMode {
  Day = 'Day',
  Night = 'Night',
}

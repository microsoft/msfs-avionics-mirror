import { ChartMetadata, ChartPage } from '@microsoft/msfs-sdk';

/**
 * Data describing a Garmin electronic chart page.
 */
export interface GarminChartsPageData {
  /** The metadata associated with the page's parent chart. */
  readonly metadata: ChartMetadata;

  /** The chart page. */
  readonly page: ChartPage;

  /** The index of the page in its parent chart. */
  readonly pageIndex: number;

  /** The total number of pages contained in the page's parent chart. */
  readonly pageCount: number;
}

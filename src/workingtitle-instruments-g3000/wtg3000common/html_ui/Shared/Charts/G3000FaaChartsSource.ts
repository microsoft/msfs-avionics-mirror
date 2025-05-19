import {
  ApproachIdentifier, ArrayUtils, BuiltInChartProvider, ChartArea, ChartIndex, ChartMetadata, ChartUrl, FaaChartType,
  GeoReferencedChartArea, Subject, Subscribable
} from '@microsoft/msfs-sdk';

import { GarminFaaChartsUtils } from '@microsoft/msfs-garminsdk';

import { G3000BuiltInChartsSourceIds } from './G3000BuiltInChartsSourceIds';
import { G3000ChartsSource, G3000ChartsSourcePageSectionDefinition, G3000ChartsSourceStatus } from './G3000ChartsSource';
import { G3000ChartsPageData } from './G3000ChartsTypes';

/**
 * A source of FAA electronic chart data for the G3000.
 */
export class G3000FaaChartsSource implements G3000ChartsSource {
  private static readonly INFO_CHART_TYPE_PRIORITY: Partial<Record<string, number>> = {
    [FaaChartType.Apd]: 0,
    [FaaChartType.Hot]: 1,
    [FaaChartType.Dau]: 2,
    [FaaChartType.Odp]: 3,
    [FaaChartType.Lah]: 4,
    [FaaChartType.Min]: 5,
  };

  /** @inheritDoc */
  public readonly uid = G3000BuiltInChartsSourceIds.Faa;

  /** @inheritDoc */
  public readonly name = 'FAA';

  /** @inheritDoc */
  public readonly provider = BuiltInChartProvider.Faa;

  /** @inheritDoc */
  public readonly status = Subject.create(G3000ChartsSourceStatus.Ready) as Subscribable<G3000ChartsSourceStatus>;

  /** @inheritDoc */
  public readonly supportsNightMode = false;

  /** @inheritDoc */
  public readonly pageSectionDefinitions: readonly G3000ChartsSourcePageSectionDefinition[] = [];

  /** @inheritDoc */
  public getInfoCharts(chartIndex: ChartIndex<string>): ChartMetadata[] {
    return ArrayUtils.flatMap(
      chartIndex.charts.filter(category => {
        switch (category.name) {
          case FaaChartType.Apd:
          case FaaChartType.Hot:
          case FaaChartType.Dau:
          case FaaChartType.Odp:
          case FaaChartType.Lah:
          case FaaChartType.Min:
            return true;
          default:
            return false;
        }
      }),
      category => category.charts
    ).sort(G3000FaaChartsSource.sortInfoCharts);
  }

  /** @inheritDoc */
  public getDepartureCharts(chartIndex: ChartIndex<string>): ChartMetadata[] {
    return ArrayUtils.flatMap(
      chartIndex.charts.filter(category => category.name === FaaChartType.Dp),
      category => category.charts
    ).sort(G3000FaaChartsSource.sortProcedureCharts);
  }

  /** @inheritDoc */
  public getArrivalCharts(chartIndex: ChartIndex<string>): ChartMetadata[] {
    return ArrayUtils.flatMap(
      chartIndex.charts.filter(category => category.name === FaaChartType.Star),
      category => category.charts
    ).sort(G3000FaaChartsSource.sortProcedureCharts);
  }

  /** @inheritDoc */
  public getApproachCharts(chartIndex: ChartIndex<string>): ChartMetadata[] {
    return ArrayUtils.flatMap(
      chartIndex.charts.filter(category => category.name === FaaChartType.Iap),
      category => category.charts
    ).sort(G3000FaaChartsSource.sortProcedureCharts);
  }

  /** @inheritDoc */
  public getAirportDiagramPage(pages: readonly G3000ChartsPageData[]): G3000ChartsPageData | undefined {
    return GarminFaaChartsUtils.getAirportDiagramPage(pages);
  }

  /** @inheritDoc */
  public getDeparturePage(
    pages: readonly G3000ChartsPageData[],
    departureName: string
  ): G3000ChartsPageData | undefined {
    return GarminFaaChartsUtils.getDeparturePage(pages, departureName);
  }

  /** @inheritDoc */
  public getArrivalPage(
    pages: readonly G3000ChartsPageData[],
    arrivalName: string
  ): G3000ChartsPageData | undefined {
    return GarminFaaChartsUtils.getArrivalPage(pages, arrivalName);
  }

  /** @inheritDoc */
  public getApproachPage(
    pages: readonly G3000ChartsPageData[],
    approachIdentifier: Readonly<ApproachIdentifier>
  ): G3000ChartsPageData | undefined {
    return GarminFaaChartsUtils.getApproachPage(pages, approachIdentifier);
  }

  /** @inheritDoc */
  public getChartName(pageData: G3000ChartsPageData): string {
    const root = this.getChartNameRoot(pageData.metadata);

    if (pageData.pageCount <= 1) {
      return root;
    } else {
      return `${root} (pg ${pageData.pageIndex + 1}/${pageData.pageCount})`;
    }
  }

  /**
   * Gets the root of the display name of a chart.
   * @param metadata The metadata for the chart for which to get the display name.
   * @returns The root of the display name of the specified chart.
   */
  private getChartNameRoot(metadata: ChartMetadata): string {
    return metadata.name;
  }

  /** @inheritDoc */
  public getDayModeUrl(pageData: G3000ChartsPageData): ChartUrl | undefined {
    return pageData.page.urls.find(url => url.name === 'light_png');
  }

  /** @inheritDoc */
  public getNightModeUrl(): ChartUrl | undefined {
    return undefined;
  }

  /** @inheritDoc */
  public getGeoReferencedArea(pageData: G3000ChartsPageData, area: ChartArea | null): GeoReferencedChartArea | undefined {
    if (!area || area.layer === 'Low') {
      return pageData.page.areas.find(query => query.geoReferenced && query.layer === 'Low') as GeoReferencedChartArea | undefined;
    } else {
      return undefined;
    }
  }

  /**
   * Sorts airport information charts.
   * @param a The first chart.
   * @param b The second chart.
   * @returns A negative number if the first chart is to be sorted before the second chart, a positive number if the
   * first chart is to be sorted after the second chart, or zero if the two charts have the same sorting order.
   */
  private static sortInfoCharts(a: ChartMetadata<string>, b: ChartMetadata<string>): number {
    if (a.type === b.type) {
      if (a.type === FaaChartType.Apd) {
        const isAAirportDiagram = a.name === 'AIRPORT DIAGRAM';
        const isBAirportDiagram = b.name === 'AIRPORT DIAGRAM';
        if (isAAirportDiagram && !isBAirportDiagram) {
          return -1;
        } else if (!isAAirportDiagram && isBAirportDiagram) {
          return 1;
        }
      }

      return a.name.length - b.name.length;
    } else {
      return (G3000FaaChartsSource.INFO_CHART_TYPE_PRIORITY[a.type] ?? Number.MAX_SAFE_INTEGER)
        - (G3000FaaChartsSource.INFO_CHART_TYPE_PRIORITY[b.type] ?? Number.MAX_SAFE_INTEGER);
    }
  }

  /**
   * Sorts procedure charts.
   * @param a The first chart.
   * @param b The second chart.
   * @returns A negative number if the first chart is to be sorted before the second chart, a positive number if the
   * first chart is to be sorted after the second chart, or zero if the two charts have the same sorting order.
   */
  private static sortProcedureCharts(a: ChartMetadata<string>, b: ChartMetadata<string>): number {
    return a.name.localeCompare(b.name);
  }
}

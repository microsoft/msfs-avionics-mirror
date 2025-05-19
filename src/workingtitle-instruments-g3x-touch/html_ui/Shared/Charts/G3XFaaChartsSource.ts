import {
  ApproachIdentifier, ArrayUtils, BuiltInChartProvider, ChartIndex, ChartMetadata, ChartUrl, FaaChartType,
  GeoReferencedChartArea
} from '@microsoft/msfs-sdk';

import { GarminFaaChartsUtils } from '@microsoft/msfs-garminsdk';

import { G3XBuiltInChartsSourceIds } from './G3XBuiltInChartsSourceIds';
import { G3XChartsSource } from './G3XChartsSource';
import { G3XChartsPageData } from './G3XChartsTypes';

/**
 * A source of FAA electronic chart data for the G3X Touch.
 */
export class G3XFaaChartsSource implements G3XChartsSource {
  private static readonly INFO_CHART_TYPE_PRIORITY: Partial<Record<string, number>> = {
    [FaaChartType.Apd]: 0,
    [FaaChartType.Hot]: 1,
    [FaaChartType.Dau]: 2,
    [FaaChartType.Odp]: 3,
    [FaaChartType.Lah]: 4,
    [FaaChartType.Min]: 5,
  };

  /** @inheritDoc */
  public readonly uid = G3XBuiltInChartsSourceIds.Faa;

  /** @inheritDoc */
  public readonly name = 'FAA';

  /** @inheritDoc */
  public readonly provider = BuiltInChartProvider.Faa;

  /** @inheritDoc */
  public readonly supportsNightMode = false;

  /** @inheritDoc */
  public getAirportDiagramCharts(chartIndex: ChartIndex<string>): ChartMetadata[] {
    return ArrayUtils.flatMap(
      chartIndex.charts.filter(category => category.name === FaaChartType.Apd),
      category => category.charts
    ).sort(G3XFaaChartsSource.sortInfoCharts);
  }

  /** @inheritDoc */
  public getInfoCharts(chartIndex: ChartIndex<string>): ChartMetadata[] {
    return ArrayUtils.flatMap(
      chartIndex.charts.filter(category => {
        switch (category.name) {
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
    ).sort(G3XFaaChartsSource.sortInfoCharts);
  }

  /** @inheritDoc */
  public getDepartureCharts(chartIndex: ChartIndex<string>): ChartMetadata[] {
    return ArrayUtils.flatMap(
      chartIndex.charts.filter(category => category.name === FaaChartType.Dp),
      category => category.charts
    ).sort(G3XFaaChartsSource.sortProcedureCharts);
  }

  /** @inheritDoc */
  public getArrivalCharts(chartIndex: ChartIndex<string>): ChartMetadata[] {
    return ArrayUtils.flatMap(
      chartIndex.charts.filter(category => category.name === FaaChartType.Star),
      category => category.charts
    ).sort(G3XFaaChartsSource.sortProcedureCharts);
  }

  /** @inheritDoc */
  public getApproachCharts(chartIndex: ChartIndex<string>): ChartMetadata[] {
    return ArrayUtils.flatMap(
      chartIndex.charts.filter(category => category.name === FaaChartType.Iap),
      category => category.charts
    ).sort(G3XFaaChartsSource.sortProcedureCharts);
  }

  /** @inheritDoc */
  public getAirportDiagramPage(pages: readonly G3XChartsPageData[]): G3XChartsPageData | undefined {
    return GarminFaaChartsUtils.getAirportDiagramPage(pages);
  }

  /** @inheritDoc */
  public getDeparturePage(
    pages: readonly G3XChartsPageData[],
    departureName: string
  ): G3XChartsPageData | undefined {
    return GarminFaaChartsUtils.getDeparturePage(pages, departureName);
  }

  /** @inheritDoc */
  public getArrivalPage(
    pages: readonly G3XChartsPageData[],
    arrivalName: string
  ): G3XChartsPageData | undefined {
    return GarminFaaChartsUtils.getArrivalPage(pages, arrivalName);
  }

  /** @inheritDoc */
  public getApproachPage(
    pages: readonly G3XChartsPageData[],
    approachIdentifier: Readonly<ApproachIdentifier>
  ): G3XChartsPageData | undefined {
    return GarminFaaChartsUtils.getApproachPage(pages, approachIdentifier);
  }

  /** @inheritDoc */
  public getChartName(pageData: G3XChartsPageData): string {
    const prefix = this.getChartNamePrefix(pageData.metadata);
    const root = this.getChartNameRoot(pageData.metadata);

    if (pageData.pageCount <= 1) {
      return `${prefix} - ${root}`;
    } else {
      return `${prefix} - ${root} (pg ${pageData.pageIndex + 1}/${pageData.pageCount})`;
    }
  }

  /**
   * Gets the prefix of the display name of a chart.
   * @param metadata The metadata for the chart for which to get the display name.
   * @returns The prefix of the display name of the specified chart.
   */
  private getChartNamePrefix(metadata: ChartMetadata): string {
    switch (metadata.type) {
      case FaaChartType.Dp:
        return 'SID';
      case FaaChartType.Star:
        return 'STAR';
      case FaaChartType.Iap:
        return 'APR';
      default:
        return 'INFO';
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
  public getDayModeUrl(pageData: G3XChartsPageData): ChartUrl | undefined {
    return pageData.page.urls.find(url => url.name === 'light_png');
  }

  /** @inheritDoc */
  public getNightModeUrl(): ChartUrl | undefined {
    return undefined;
  }

  /** @inheritDoc */
  public getGeoReferencedArea(pageData: G3XChartsPageData): GeoReferencedChartArea | undefined {
    return pageData.page.areas.find(query => query.geoReferenced && query.layer === 'Low') as GeoReferencedChartArea | undefined;
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
      return (G3XFaaChartsSource.INFO_CHART_TYPE_PRIORITY[a.type] ?? Number.MAX_SAFE_INTEGER)
        - (G3XFaaChartsSource.INFO_CHART_TYPE_PRIORITY[b.type] ?? Number.MAX_SAFE_INTEGER);
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

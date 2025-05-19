import {
  ApproachIdentifier, ArrayUtils, BuiltInChartProvider, ChartIndex, ChartMetadata, ChartUrl, GeoReferencedChartArea,
  LidoChartType, RunwayIdentifier
} from '@microsoft/msfs-sdk';

import { GarminLidoChartsUtils } from '@microsoft/msfs-garminsdk';

import { G3XBuiltInChartsSourceIds } from './G3XBuiltInChartsSourceIds';
import { G3XChartsSource } from './G3XChartsSource';
import { G3XChartsPageData } from './G3XChartsTypes';

/**
 * A source of LIDO electronic chart data for the G3X Touch.
 */
export class G3XLidoChartsSource implements G3XChartsSource {
  private static readonly INFO_CHART_TYPE_PRIORITY: Partial<Record<string, number>> = {
    [LidoChartType.Agc]: 0,
    [LidoChartType.Apc]: 1,
    [LidoChartType.Afc]: 2,
    [LidoChartType.Aoi]: 3,
    [LidoChartType.Lvc]: 4,
  };

  /** @inheritDoc */
  public readonly uid = G3XBuiltInChartsSourceIds.Lido;

  /** @inheritDoc */
  public readonly name = 'LIDO';

  /** @inheritDoc */
  public readonly provider = BuiltInChartProvider.Lido;

  /** @inheritDoc */
  public readonly supportsNightMode = true;

  /** @inheritDoc */
  public getAirportDiagramCharts(chartIndex: ChartIndex<string>): ChartMetadata[] {
    return ArrayUtils.flatMap(
      chartIndex.charts.filter(category => category.name === LidoChartType.Agc),
      category => category.charts
    ).sort(G3XLidoChartsSource.sortInfoCharts);
  }

  /** @inheritDoc */
  public getInfoCharts(chartIndex: ChartIndex<string>): ChartMetadata[] {
    return ArrayUtils.flatMap(
      chartIndex.charts.filter(category => {
        switch (category.name) {
          case LidoChartType.Agc:
          case LidoChartType.Apc:
          case LidoChartType.Afc:
          case LidoChartType.Aoi:
          case LidoChartType.Lvc:
            return true;
          default:
            return false;
        }
      }),
      category => category.charts
    ).sort(G3XLidoChartsSource.sortInfoCharts);
  }

  /** @inheritDoc */
  public getDepartureCharts(chartIndex: ChartIndex<string>): ChartMetadata[] {
    return ArrayUtils.flatMap(
      chartIndex.charts.filter(category => category.name === LidoChartType.Sid),
      category => category.charts
    ).sort(G3XLidoChartsSource.sortProcedureCharts);
  }

  /** @inheritDoc */
  public getArrivalCharts(chartIndex: ChartIndex<string>): ChartMetadata[] {
    return ArrayUtils.flatMap(
      chartIndex.charts.filter(category => category.name === LidoChartType.Star),
      category => category.charts
    ).sort(G3XLidoChartsSource.sortProcedureCharts);
  }

  /** @inheritDoc */
  public getApproachCharts(chartIndex: ChartIndex<string>): ChartMetadata[] {
    return ArrayUtils.flatMap(
      chartIndex.charts.filter(category => category.name === LidoChartType.Iac),
      category => category.charts
    ).sort(G3XLidoChartsSource.sortProcedureCharts);
  }

  /** @inheritDoc */
  public getAirportDiagramPage(pages: readonly G3XChartsPageData[]): G3XChartsPageData | undefined {
    return GarminLidoChartsUtils.getAirportDiagramPage(pages);
  }

  /** @inheritDoc */
  public getDeparturePage(
    pages: readonly G3XChartsPageData[],
    departureName: string,
    enrouteTransitionName: string,
    runway: Readonly<RunwayIdentifier>
  ): G3XChartsPageData | undefined {
    return GarminLidoChartsUtils.getDeparturePage(pages, departureName, enrouteTransitionName, runway);
  }

  /** @inheritDoc */
  public getArrivalPage(
    pages: readonly G3XChartsPageData[],
    arrivalName: string,
    enrouteTransitionName: string,
    runway: Readonly<RunwayIdentifier>
  ): G3XChartsPageData | undefined {
    return GarminLidoChartsUtils.getArrivalPage(pages, arrivalName, enrouteTransitionName, runway);
  }

  /** @inheritDoc */
  public getApproachPage(
    pages: readonly G3XChartsPageData[],
    approachIdentifier: Readonly<ApproachIdentifier>
  ): G3XChartsPageData | undefined {
    return GarminLidoChartsUtils.getApproachPage(pages, approachIdentifier);
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
      case LidoChartType.Sid:
        return 'SID';
      case LidoChartType.Star:
        return 'STAR';
      case LidoChartType.Iac:
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
    switch (metadata.type) {
      case LidoChartType.Agc:
        if (metadata.name === 'AGC') {
          return 'Airport Diagram';
        } else {
          return `Airport Diagram, ${metadata.name}`;
        }
      case LidoChartType.Afc:
        if (metadata.name === 'AFC') {
          return 'Airport Facilities';
        } else {
          return `Airport Facilities, ${metadata.name}`;
        }
      case LidoChartType.Apc:
        if (metadata.name === 'APC') {
          return 'Airport Parking';
        } else {
          return `Airport Parking, ${metadata.name}`;
        }
      case LidoChartType.Aoi:
        if (metadata.name === 'AOI') {
          return 'Airport Operational Info';
        } else {
          return `Airport Operational Info, ${metadata.name}`;
        }
      case LidoChartType.Lvc:
        if (metadata.name === 'LVC') {
          return 'Low Visibility Chart';
        } else {
          return `Low Visibility Chart, ${metadata.name}`;
        }
      default:
        return metadata.name;
    }
  }

  /** @inheritDoc */
  public getDayModeUrl(pageData: G3XChartsPageData): ChartUrl | undefined {
    return pageData.page.urls.find(url => url.name === 'light_png');
  }

  /** @inheritDoc */
  public getNightModeUrl(pageData: G3XChartsPageData): ChartUrl | undefined {
    return pageData.page.urls.find(url => url.name === 'dark_png');
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
      if (a.type === LidoChartType.Agc) {
        const isAAgc = a.name === 'AGC';
        const isBAgc = b.name === 'AGC';
        if (isAAgc && !isBAgc) {
          return -1;
        } else if (!isAAgc && isBAgc) {
          return 1;
        }
      }

      return a.name.length - b.name.length;
    } else {
      return (G3XLidoChartsSource.INFO_CHART_TYPE_PRIORITY[a.type] ?? Number.MAX_SAFE_INTEGER)
        - (G3XLidoChartsSource.INFO_CHART_TYPE_PRIORITY[b.type] ?? Number.MAX_SAFE_INTEGER);
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

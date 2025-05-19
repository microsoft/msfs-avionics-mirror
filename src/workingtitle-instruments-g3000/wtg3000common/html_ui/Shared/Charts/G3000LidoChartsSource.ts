import {
  ApproachIdentifier, ArrayUtils, BuiltInChartProvider, ChartArea, ChartIndex, ChartMetadata, ChartUrl,
  GeoReferencedChartArea, LidoChartType, RunwayIdentifier, Subject, Subscribable
} from '@microsoft/msfs-sdk';

import { GarminLidoChartsUtils } from '@microsoft/msfs-garminsdk';

import { G3000BuiltInChartsSourceIds } from './G3000BuiltInChartsSourceIds';
import { G3000ChartsSource, G3000ChartsSourcePageSectionDefinition, G3000ChartsSourceStatus } from './G3000ChartsSource';
import { G3000ChartsPageData } from './G3000ChartsTypes';

/**
 * A source of LIDO electronic chart data for the G3000.
 */
export class G3000LidoChartsSource implements G3000ChartsSource {
  private static readonly INFO_CHART_TYPE_PRIORITY: Partial<Record<string, number>> = {
    [LidoChartType.Agc]: 0,
    [LidoChartType.Apc]: 1,
    [LidoChartType.Afc]: 2,
    [LidoChartType.Aoi]: 3,
    [LidoChartType.Lvc]: 4,
  };

  /** @inheritDoc */
  public readonly uid = G3000BuiltInChartsSourceIds.Lido;

  /** @inheritDoc */
  public readonly name = 'LIDO';

  /** @inheritDoc */
  public readonly provider = BuiltInChartProvider.Lido;

  /** @inheritDoc */
  public readonly status = Subject.create(G3000ChartsSourceStatus.Ready) as Subscribable<G3000ChartsSourceStatus>;

  /** @inheritDoc */
  public readonly supportsNightMode = true;

  /** @inheritDoc */
  public readonly pageSectionDefinitions: readonly G3000ChartsSourcePageSectionDefinition[] = [
    {
      uid: 'LIDO.Plan',
      name: 'Plan',

      /** @inheritDoc */
      getArea(pageData) {
        return pageData.page.areas.find(area => area.layer === 'Low');
      },
    },
  ];

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
    ).sort(G3000LidoChartsSource.sortInfoCharts);
  }

  /** @inheritDoc */
  public getDepartureCharts(chartIndex: ChartIndex<string>): ChartMetadata[] {
    return ArrayUtils.flatMap(
      chartIndex.charts.filter(category => category.name === LidoChartType.Sid),
      category => category.charts
    ).sort(G3000LidoChartsSource.sortProcedureCharts);
  }

  /** @inheritDoc */
  public getArrivalCharts(chartIndex: ChartIndex<string>): ChartMetadata[] {
    return ArrayUtils.flatMap(
      chartIndex.charts.filter(category => category.name === LidoChartType.Star),
      category => category.charts
    ).sort(G3000LidoChartsSource.sortProcedureCharts);
  }

  /** @inheritDoc */
  public getApproachCharts(chartIndex: ChartIndex<string>): ChartMetadata[] {
    return ArrayUtils.flatMap(
      chartIndex.charts.filter(category => category.name === LidoChartType.Iac),
      category => category.charts
    ).sort(G3000LidoChartsSource.sortProcedureCharts);
  }

  /** @inheritDoc */
  public getAirportDiagramPage(pages: readonly G3000ChartsPageData[]): G3000ChartsPageData | undefined {
    return GarminLidoChartsUtils.getAirportDiagramPage(pages);
  }

  /** @inheritDoc */
  public getDeparturePage(
    pages: readonly G3000ChartsPageData[],
    departureName: string,
    enrouteTransitionName: string,
    runway: Readonly<RunwayIdentifier>
  ): G3000ChartsPageData | undefined {
    return GarminLidoChartsUtils.getDeparturePage(pages, departureName, enrouteTransitionName, runway);
  }

  /** @inheritDoc */
  public getArrivalPage(
    pages: readonly G3000ChartsPageData[],
    arrivalName: string,
    enrouteTransitionName: string,
    runway: Readonly<RunwayIdentifier>
  ): G3000ChartsPageData | undefined {
    return GarminLidoChartsUtils.getArrivalPage(pages, arrivalName, enrouteTransitionName, runway);
  }

  /** @inheritDoc */
  public getApproachPage(
    pages: readonly G3000ChartsPageData[],
    approachIdentifier: Readonly<ApproachIdentifier>
  ): G3000ChartsPageData | undefined {
    return GarminLidoChartsUtils.getApproachPage(pages, approachIdentifier);
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
  public getDayModeUrl(pageData: G3000ChartsPageData): ChartUrl | undefined {
    return pageData.page.urls.find(url => url.name === 'light_png');
  }

  /** @inheritDoc */
  public getNightModeUrl(pageData: G3000ChartsPageData): ChartUrl | undefined {
    return pageData.page.urls.find(url => url.name === 'dark_png');
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
      return (G3000LidoChartsSource.INFO_CHART_TYPE_PRIORITY[a.type] ?? Number.MAX_SAFE_INTEGER)
        - (G3000LidoChartsSource.INFO_CHART_TYPE_PRIORITY[b.type] ?? Number.MAX_SAFE_INTEGER);
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

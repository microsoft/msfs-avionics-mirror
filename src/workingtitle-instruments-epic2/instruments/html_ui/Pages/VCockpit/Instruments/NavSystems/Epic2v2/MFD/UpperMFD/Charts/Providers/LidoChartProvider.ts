import { ArrayUtils, BuiltInChartProvider, ChartIndex, ChartMetadata, ChartsClient, FacilityType, ICAO, IcaoValue, LidoChartType } from '@microsoft/msfs-sdk';

import { Epic2ChartsProvider } from './Epic2ChartsProvider';

/** A provider for default Epic 2 LIDO charts */
export class LidoChartProvider implements Epic2ChartsProvider {
  private static AirportChartCategories = [
    LidoChartType.Afc, LidoChartType.Agc, LidoChartType.Aoi, LidoChartType.Apc, LidoChartType.Lvc, LidoChartType.Mrc, LidoChartType.Unknown
  ];
  private static SidChartCategories = [
    LidoChartType.ObstDep, LidoChartType.Sid, LidoChartType.SidInitialClimb,
  ];
  private static StarChartCategories = [
    LidoChartType.Star,
  ];
  private static ApproachChartCategories = [
    LidoChartType.Iac, LidoChartType.Vac
  ];

  /**
   * Maps a chart type to a chart name to be displayed
   * @param chart The chart metadata
   * @returns The chart name to display
   */
  private static mapChartNameForDisplay(chart: ChartMetadata): string {
    switch (chart.type as LidoChartType) {
      case LidoChartType.Aoi:
        return chart.name.replace('AOI', 'Airport Operational Information');
      case LidoChartType.Afc:
        return chart.name.replace('AFC', 'Airport Facility Chart');
      case LidoChartType.Agc:
        return chart.name.replace('AGC', 'Airport Ground Chart');
      case LidoChartType.Apc:
        return chart.name.replace('APC', 'Airport Parking Chart');
      case LidoChartType.Lvc:
        return chart.name.replace('LVC', 'Low Visibility Chart');
      case LidoChartType.Mrc:
        return chart.name.replace('MRC', 'Minimum Radar Vectoring Chart');
      default:
        return chart.name;
    }
  }

  /**
   * Gets all the charts available for an airport
   * @param airport The airport ICAO value
   * @returns Charts
   */
  public static async getChartIndexForAirport(airport: IcaoValue): Promise<ChartIndex<string> | void> {
    if (ICAO.getFacilityTypeFromValue(airport) !== FacilityType.Airport) {
      return;
    }

    const chartIndex = await ChartsClient.getIndexForAirport(airport, BuiltInChartProvider.Lido);

    return chartIndex;
  }

  /**
   * Gets all charts of given types
   * @param airport The airport ICAO Value
   * @param searchTypes An array of LIDO chart types to search for
   * @returns An array of charts found for a given type
   */
  private async getChartsOfTypes(airport: IcaoValue, searchTypes: LidoChartType[]): Promise<ChartMetadata[]> {
    const chartIndex = await LidoChartProvider.getChartIndexForAirport(airport);

    if (chartIndex) {
      const validCategories = chartIndex.charts.filter((category) => searchTypes.includes(category.name as LidoChartType));
      const availableCharts = ArrayUtils.flatMap(validCategories, (category) => category.charts);

      return availableCharts.map((v) => {
        return {
          ...v,
          name: LidoChartProvider.mapChartNameForDisplay(v),
        };
      });
    } else {
      return [];
    }
  }

  /** @inheritdoc */
  public async getAirportCharts(airport: IcaoValue): Promise<ChartMetadata[]> {
    return this.getChartsOfTypes(airport, LidoChartProvider.AirportChartCategories);
  }

  /** @inheritdoc */
  public async getDefaultAirportChart(airport: IcaoValue): Promise<ChartMetadata | null> {
    const charts = await this.getAirportCharts(airport);

    // We prioritise AGC charts, with the lowest name length (to avoid selecting an A380 chart by default for example)
    // If no AGC charts, we will select an APC chart
    // Otherwise we select no charts
    if (charts) {
      const agcCharts = charts.filter((chart) => chart.type === LidoChartType.Agc);
      if (agcCharts.length > 0) {
        return agcCharts.sort((a, b) => a.name.length - b.name.length)[0];
      } else {
        const apcCharts = charts.filter((chart) => chart.type === LidoChartType.Apc);
        if (apcCharts.length > 0) {
          return apcCharts.sort((a, b) => a.name.length - b.name.length)[0];
        }
      }
    }

    return null;
  }

  /** @inheritdoc */
  public async getSidCharts(airport: IcaoValue): Promise<ChartMetadata[]> {
    return this.getChartsOfTypes(airport, LidoChartProvider.SidChartCategories);
  }

  /** @inheritdoc */
  public async getStarCharts(airport: IcaoValue): Promise<ChartMetadata[]> {
    return this.getChartsOfTypes(airport, LidoChartProvider.StarChartCategories);
  }

  /** @inheritdoc */
  public async getApproachCharts(airport: IcaoValue): Promise<ChartMetadata[]> {
    return this.getChartsOfTypes(airport, LidoChartProvider.ApproachChartCategories);
  }
}

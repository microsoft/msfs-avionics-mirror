import { ArrayUtils, BuiltInChartProvider, ChartIndex, ChartMetadata, ChartsClient, FaaChartType, FacilityType, ICAO, IcaoValue } from '@microsoft/msfs-sdk';

import { Epic2ChartsProvider } from './Epic2ChartsProvider';

/** A provider for default Epic 2 FAA charts */
export class FaaChartProvider implements Epic2ChartsProvider {
  private static AirportChartCategories = [
    FaaChartType.Apd, FaaChartType.Hot
  ];
  private static SidChartCategories = [
    FaaChartType.Min, FaaChartType.Dp, FaaChartType.Odp, FaaChartType.Dau
  ];
  private static StarChartCategories = [
    FaaChartType.Star
  ];
  private static ApproachChartCategories = [
    FaaChartType.Iap, FaaChartType.Lah
  ];

  /**
   * Gets all the charts available for an airport
   * @param airport The airport ICAO value
   * @returns Charts
   */
  public static async getChartIndexForAirport(airport: IcaoValue): Promise<ChartIndex<string> | void> {
    if (ICAO.getFacilityTypeFromValue(airport) !== FacilityType.Airport) {
      return;
    }

    const chartIndex = await ChartsClient.getIndexForAirport(airport, BuiltInChartProvider.Faa);

    return chartIndex;
  }

  /**
   * Gets all charts of given types
   * @param airport The airport ICAO Value
   * @param searchTypes An array of FAA chart types to search for
   * @returns An array of charts found for a given type
   */
  private async getChartsOfTypes(airport: IcaoValue, searchTypes: FaaChartType[]): Promise<ChartMetadata[]> {
    const chartIndex = await FaaChartProvider.getChartIndexForAirport(airport);

    if (chartIndex) {
      const validCategories = chartIndex.charts.filter((category) => searchTypes.includes(category.name as FaaChartType));
      const availableCharts = ArrayUtils.flatMap(validCategories, (category) => category.charts);

      return availableCharts;
    } else {
      return [];
    }
  }

  /** @inheritdoc */
  public async getAirportCharts(airport: IcaoValue): Promise<ChartMetadata[]> {
    return this.getChartsOfTypes(airport, FaaChartProvider.AirportChartCategories);
  }

  /** @inheritdoc */
  public async getDefaultAirportChart(airport: IcaoValue): Promise<ChartMetadata | null> {
    const charts = await this.getAirportCharts(airport);

    // We select the APD chart with the lowest name length (to avoid selecting an A380 chart by default for example)
    // Otherwise we select no charts
    if (charts) {
      const agcCharts = charts.filter((chart) => chart.type === FaaChartType.Apd);
      if (agcCharts.length > 0) {
        return agcCharts.sort((a, b) => a.name.length - b.name.length)[0];
      }
    }

    return null;
  }

  /** @inheritdoc */
  public async getSidCharts(airport: IcaoValue): Promise<ChartMetadata[]> {
    return this.getChartsOfTypes(airport, FaaChartProvider.SidChartCategories);
  }

  /** @inheritdoc */
  public async getStarCharts(airport: IcaoValue): Promise<ChartMetadata[]> {
    return this.getChartsOfTypes(airport, FaaChartProvider.StarChartCategories);
  }

  /** @inheritdoc */
  public async getApproachCharts(airport: IcaoValue): Promise<ChartMetadata[]> {
    return this.getChartsOfTypes(airport, FaaChartProvider.ApproachChartCategories);
  }
}

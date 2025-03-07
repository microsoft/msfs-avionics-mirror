import { ChartMetadata, IcaoValue } from '@microsoft/msfs-sdk';

/** An interface describing a charts provider for the Epic 2 */
export interface Epic2ChartsProvider {
  /**
   * Gets all the charts that should be available for display on the Aprt page.
   * This is NOT all charts for an airport.
   * @param airport The airport ICAO value
   */
  getAirportCharts(airport: IcaoValue): Promise<ChartMetadata[]>;

  /**
   * Gets the default airport chart for automatic selection
   * @param airport The airport ICAO Value
   */
  getDefaultAirportChart(airport: IcaoValue): Promise<ChartMetadata | null>;

  /**
   * Gets all the charts that should be available for display on the SID page.
   * @param airport The airport ICAO value
   */
  getSidCharts(airport: IcaoValue): Promise<ChartMetadata[]>;

  /**
   * Gets all the charts that should be available for display on the STAR page.
   * @param airport The airport ICAO value
   */
  getStarCharts(airport: IcaoValue): Promise<ChartMetadata[]>;

  /**
   * Gets all the charts that should be available for display on the Appr page.
   * @param airport The airport ICAO value
   */
  getApproachCharts(airport: IcaoValue): Promise<ChartMetadata[]>;
}

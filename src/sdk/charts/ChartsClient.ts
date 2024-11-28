import { ChartView } from './ChartView';
import { ChartIndex, ChartPages } from './ChartTypes';
import { Subject, SubscribableMapFunctions } from '../sub';
import { IcaoValue } from '../navigation/Icao';
import { Wait } from '../utils/time/Wait';

/**
 * Utilities for interacting with charts
 */
export class ChartsClient {
  private static listener: ViewListener.ViewListener | null = null;

  private static ready = Subject.create(false);

  private static indexRequestMap = new Map<number, (data: ChartIndex<string>) => void>();

  private static pagesRequestMap = new Map<number, (data: ChartPages) => void>();

  private static nextRequestID = 0;

  /**
   * Gets an index of charts for a given airport and provider
   *
   * T = String type representing possible chart types
   * U = Number type representing possible chart types
   * @param airportIcao the FSID (ICAO) of the airport for which to obtain a chart index
   * @param provider the provider for which to query charts. Built-in provider IDs are available on {@link BuiltInChartProvider}
   * @returns a chart index
   */
  public static async getIndexForAirport<T extends string>(
    airportIcao: IcaoValue,
    provider: string
  ): Promise<ChartIndex<T>> {
    await ChartsClient.ensureViewListenerReady();

    return new Promise<ChartIndex<T>>((resolve) => {
      const requestID = ++ChartsClient.nextRequestID;

      const timeoutIndex = setTimeout(() => {
        ChartsClient.indexRequestMap.delete(requestID);
        resolve({ airportIcao, charts: [] });
      }, 5_000);

      ChartsClient.indexRequestMap.set(requestID, (data: ChartIndex<string>) => {
        clearTimeout(timeoutIndex);
        (resolve as (data: ChartIndex<string>) => void)(data);
      });

      ChartsClient.listener?.call('GET_CHARTS_INDEX', ChartsClient.nextRequestID, airportIcao, provider);
    });
  }

  /**
   * Gets the pages for a chart given its GUID
   * @param chartGuid the GUID of the chart for which to obtain pages
   * @returns the pages for a chart
   */
  public static async getChartPages(chartGuid: string): Promise<ChartPages> {
    await ChartsClient.ensureViewListenerReady();

    return new Promise<ChartPages>((resolve) => {
      ChartsClient.pagesRequestMap.set(++ChartsClient.nextRequestID, resolve);

      ChartsClient.listener?.call('GET_CHART_PAGES', ChartsClient.nextRequestID, chartGuid);
    });
  }

  /**
   * Initializes a chart view with the charts view listener
   *
   * @param view the view to initialize
   */
  public static async initializeChartView(view: ChartView): Promise<void> {
    await ChartsClient.ensureViewListenerReady();

    view.init(ChartsClient.listener!);
  }

  /**
   * Setups up the view listener for charts
   */
  private static async setupViewListener(): Promise<void> {
    ChartsClient.listener = RegisterViewListener('JS_LISTENER_CHARTS', () => ChartsClient.ready.set(true));

    await Wait.awaitSubscribable(ChartsClient.ready, SubscribableMapFunctions.identity(), false, 10_000);

    ChartsClient.listener.on('SendChartIndex', ChartsClient.onChartIndexReceived.bind(ChartsClient));
    ChartsClient.listener.on('SendChartPages', ChartsClient.onChartPagesReceived.bind(ChartsClient));
  }

  /**
   * Ensures that the charts view listener is ready
   */
  private static async ensureViewListenerReady(): Promise<void> {
    if (!ChartsClient.listener) {
      await ChartsClient.setupViewListener();
      return;
    }

    await Wait.awaitSubscribable(ChartsClient.ready, SubscribableMapFunctions.identity(), true, 10_000);
  }

  /**
   * Callback that handles when a chart index is received from the simulator
   * @param requestID the request ID
   * @param index the index object
   */
  private static onChartIndexReceived(requestID: number, index: ChartIndex<string>): void {
    const request = ChartsClient.indexRequestMap.get(requestID);

    if (request) {
      ChartsClient.indexRequestMap.delete(requestID);
      request(index);
    } else {
      console.error(`[Charts](onChartIndexReceived) Unknown request: ${requestID}`);
    }
  }

  /**
   * Callback that handles when a chart pages object is received from the simulator
   * @param requestID the request ID
   * @param pages the pages object
   */
  private static onChartPagesReceived(requestID: number, pages: ChartPages): void {
    const request = ChartsClient.pagesRequestMap.get(requestID);

    if (request) {
      ChartsClient.pagesRequestMap.delete(requestID);
      request(pages);
    } else {
      console.error(`[Charts](onChartPagesReceived) Unknown request: ${requestID}`);
    }
  }
}

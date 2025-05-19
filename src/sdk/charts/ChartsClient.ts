import { IcaoValue } from '../navigation/Icao';
import { Subject } from '../sub/Subject';
import { SubscribableMapFunctions } from '../sub/SubscribableMapFunctions';
import { AtomicSequenceUtils } from '../utils/atomic/AtomicSequence';
import { DebounceTimer } from '../utils/time/DebounceTimer';
import { Wait } from '../utils/time/Wait';
import { ChartIndex, ChartPages } from './ChartTypes';
import { ChartView } from './ChartView';

/**
 * Utilities for interacting with charts
 */
export class ChartsClient {
  private static listener: ViewListener.ViewListener | null = null;

  private static ready = Subject.create(false);

  private static readonly indexRequestMap = new Map<
    number,
    {
      /** A function to call to resolve the request. */
      resolve: (data: ChartIndex<string>) => void;

      /** A function to call to reject the request. */
      reject: (reason?: any) => void;

      /** A timer that executes an action when the request times out. */
      timeout: DebounceTimer;
    }
  >();

  private static readonly pagesRequestMap = new Map<
    number,
    {
      /** A function to call to resolve the request. */
      resolve: (data: ChartPages) => void;

      /** A function to call to reject the request. */
      reject: (reason?: any) => void;
    }

  >();

  /**
   * Gets an index of charts for an airport from a chart provider.
   * @param airportIcao The ICAO of the airport for which to obtain a chart index.
   * @param provider The provider from which to retrieve the chart index.
   * @returns A Promise which is fulfilled with the requested chart index when it has been retrieved.
   */
  public static async getIndexForAirport<T extends string>(
    airportIcao: IcaoValue,
    provider: string
  ): Promise<ChartIndex<T>> {
    await ChartsClient.ensureViewListenerReady();

    const requestId = (await AtomicSequenceUtils.getInstance()).getNext();

    const existing = ChartsClient.indexRequestMap.get(requestId);
    if (existing) {
      existing.timeout.clear();
      existing.reject(`ChartsClient.getIndexForAirport(): request with ID ${requestId} was overridden before it was resolved`);
    }

    return new Promise<ChartIndex<T>>((resolve, reject) => {
      const timeout = new DebounceTimer();
      timeout.schedule(() => {
        ChartsClient.indexRequestMap.delete(requestId);
        resolve({ airportIcao, charts: [] });
      }, 5000);

      ChartsClient.indexRequestMap.set(
        requestId,
        {
          resolve: resolve as (data: ChartIndex<string>) => void,
          reject,
          timeout,
        }
      );

      ChartsClient.listener!.call('GET_CHARTS_INDEX', requestId, airportIcao, provider);
    });
  }

  /**
   * Gets chart page information for a chart with a given GUID.
   * @param chartGuid The GUID of the chart for which to obtain page information.
   * @returns A Promise which is fulfilled with the requested chart page information when it has been retrieved.
   */
  public static async getChartPages(chartGuid: string): Promise<ChartPages> {
    await ChartsClient.ensureViewListenerReady();

    const requestId = (await AtomicSequenceUtils.getInstance()).getNext();

    const existing = ChartsClient.pagesRequestMap.get(requestId);
    if (existing) {
      existing.reject(`ChartsClient.getChartPages(): request with ID ${requestId} was overridden before it was resolved`);
    }

    return new Promise<ChartPages>((resolve, reject) => {
      ChartsClient.pagesRequestMap.set(
        requestId,
        {
          resolve,
          reject,
        }
      );

      ChartsClient.listener!.call('GET_CHART_PAGES', requestId, chartGuid);
    });
  }

  /**
   * Initializes a chart view with the charts view listener
   *
   * @param view the view to initialize
   */
  public static async initializeChartView(view: ChartView): Promise<void> {
    await ChartsClient.ensureViewListenerReady();

    await view.init(ChartsClient.listener!);
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
      request.timeout.clear();
      request.resolve(index);
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
      request.resolve(pages);
    }
  }
}

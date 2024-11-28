import { GameStateProvider } from '../data/GameStateProvider';
import { ReadonlySubEvent, SubEvent } from '../sub/SubEvent';
import { Subject } from '../sub/Subject';
import { Subscribable } from '../sub/Subscribable';
import { ArrayUtils } from '../utils/datastructures/ArrayUtils';
import { FlightPlanRoute, ReadonlyFlightPlanRoute } from './FlightPlanRoute';
import { FlightPlanRouteUtils } from './FlightPlanRouteUtils';

/**
 * A response to an avionics flight plan route request.
 */
export type FlightPlanRouteAvionicsRequestResponse = {
  /** The ID of the request to which this response is directed. */
  requestId: number;

  /** The avionics flight plan route. */
  route: ReadonlyFlightPlanRoute;
};

/**
 * A manager for working with flight plan routes. The manager can be used to send or retrieve routes. It also
 * automatically publishes the event bus topics defined in {@link FlightPlanRouteEvents} in response to events related
 * to flight plan routes.
 */
export class FlightPlanRouteManager {
  private static instancePromise?: Promise<FlightPlanRouteManager>;

  private readonly pendingAvionicsRouteRequestsSource: number[] = [];

  private readonly _efbRoute = Subject.create<ReadonlyFlightPlanRoute>(FlightPlanRouteUtils.emptyRoute());
  /** The current EFB flight plan route. */
  public readonly efbRoute = this._efbRoute as Subscribable<ReadonlyFlightPlanRoute>;

  private readonly _syncedAvionicsRoute = Subject.create<ReadonlyFlightPlanRoute | null>(null);
  /** The most recent synced avionics flight plan route. */
  public readonly syncedAvionicsRoute = this._syncedAvionicsRoute as Subscribable<ReadonlyFlightPlanRoute | null>;

  private readonly _avionicsRouteRequested = new SubEvent<this, number>();
  /** An event that fires when an avionics route is requested. The event data is the ID of the request. */
  public readonly avionicsRouteRequested = this._avionicsRouteRequested as ReadonlySubEvent<this, number>;

  private readonly _avionicsRouteRequestResponse = new SubEvent<this, Readonly<FlightPlanRouteAvionicsRequestResponse>>();
  /** An event that fires when a response to an avionics route request is received. The event data is the response. */
  public readonly avionicsRouteRequestResponse = this._avionicsRouteRequestResponse as ReadonlySubEvent<this, Readonly<FlightPlanRouteAvionicsRequestResponse>>;

  private readonly _pendingAvionicsRouteRequests = Subject.create<readonly number[]>([]);
  /**
   * An array of the IDs of all avionics route requests that have not received a response yet, in order of decreasing
   * age.
   */
  public readonly pendingAvionicsRouteRequests = this._pendingAvionicsRouteRequests as Subscribable<readonly number[]>;

  private readonly initPromise: Promise<void>;

  private isEfbRouteInit = false;

  /**
   * Creates a new instance of FlightPlanRouteManager.
   * @param listener A flight plan route view listener.
   */
  private constructor(private readonly listener: ViewListener.ViewListener) {
    listener.on('EfbRouteUpdated', this.onEfbRouteUpdated.bind(this));
    listener.on('AvionicsRouteSync', this.onAvionicsRouteSync.bind(this));
    listener.on('AvionicsRouteRequested', this.onAvionicsRouteRequested.bind(this));
    listener.on('AvionicsRouteRequestResponse', this.onAvionicsRouteRequestResponse.bind(this));

    this.initPromise = this.init();
  }

  /**
   * Gets an instance of {@link FlightPlanRouteManager}.
   * @returns A Promise which is fulfilled with an instance of {@link FlightPlanRouteManager} when the manager is
   * ready.
   */
  public static getManager(): Promise<FlightPlanRouteManager> {
    return FlightPlanRouteManager.instancePromise ??= FlightPlanRouteManager.create();
  }

  /**
   * Sends a flight plan route to the EFB.
   * @param route The route to send.
   * @returns A Promise which is fulfilled when the route has been scheduled to be delivered to the EFB. This does
   * not guarantee that the EFB will have received the route when the Promise is fulfilled.
   */
  public sendRouteToEfb(route: ReadonlyFlightPlanRoute): Promise<void> {
    return this.listener.call('SEND_ROUTE_TO_EFB', route);
  }

  /**
   * Gets the saved EFB route.
   * @returns A Promise which is fulfilled with the saved EFB route once it has been retrieved.
   */
  public getEfbRoute(): Promise<FlightPlanRoute> {
    return this.listener.call('GET_EFB_ROUTE');
  }

  /**
   * Saves a route as the EFB route.
   * @param route The route to save.
   * @returns A Promise which is fulfilled when the route has been saved as the EFB route.
   */
  public saveEfbRoute(route: ReadonlyFlightPlanRoute): Promise<void> {
    return this.listener.call('SAVE_EFB_ROUTE', route);
  }

  /**
   * Sends a flight plan route to avionics for sync.
   * @param route The route to send.
   * @returns A Promise which is fulfilled when the route has been scheduled to be delivered to listeners. This does
   * not guarantee that any listeners will have received the route when the Promise is fulfilled.
   */
  public sendRouteToAvionics(route: ReadonlyFlightPlanRoute): Promise<void> {
    return this.listener.call('SEND_ROUTE_TO_AVIONICS', route);
  }

  /**
   * Sends an avionics route request to all request listeners.
   * @returns A Promise which is fulfilled with the ID of the request when the request has been scheduled to be
   * delivered to request listeners. This does not guarantee that any listeners will have received the request when the
   * Promise is fulfilled.
   */
  public requestAvionicsRoute(): Promise<number> {
    return this.listener.call('REQUEST_AVIONICS_ROUTE');
  }

  /**
   * Reply to an avionics route request with a flight plan route.
   * @param requestId The ID of the request to which to reply.
   * @param route The route to send as the reply.
   * @returns A Promise which is fulfilled when the route has been scheduled to be delivered to reply listeners. This
   * does not guarantee that any listeners will have received the reply when the Promise is fulfilled.
   */
  public replyToAvionicsRouteRequest(requestId: number, route: ReadonlyFlightPlanRoute): Promise<void> {
    return this.listener.call('REPLY_TO_AVIONICS_ROUTE_REQUEST', route, requestId);
  }

  /**
   * Files a route with the sim's ATC service.
   * @param route The route to file.
   * @returns A Promise which is fulfilled when the route has been scheduled to be delivered to the ATC service. This
   * does not guarantee that the route will have been filed when the Promise is fulfilled.
   */
  public fileRouteWithAtc(route: ReadonlyFlightPlanRoute): Promise<void> {
    return this.listener.call('FILE_ROUTE_WITH_ATC', route);
  }

  /**
   * Gets the filed ATC route.
   * @returns A Promise which is fulfilled with the filed ATC route once it has been retrieved.
   */
  public getAtcRoute(): Promise<FlightPlanRoute> {
    return this.listener.call('GET_ATC_ROUTE');
  }

  /**
   * Initializes this manager.
   */
  private async init(): Promise<void> {
    await this.initEfbRouteTopic();
  }

  /**
   * Initializes the EFB route topic published to the event bus with the current EFB route.
   */
  private async initEfbRouteTopic(): Promise<void> {
    const efbRoute = await this.getEfbRoute();

    if (!this.isEfbRouteInit) {
      this.isEfbRouteInit = true;
      this._efbRoute.set(efbRoute);
    }
  }

  /**
   * Responds to when the EFB flight plan route is updated.
   * @param route The updated EFB route.
   */
  private onEfbRouteUpdated(route: FlightPlanRoute): void {
    this.isEfbRouteInit = true;
    this._efbRoute.set(route);
  }

  /**
   * Responds to when a flight plan route is synced to avionics.
   * @param route The route to sync to avionics.
   */
  private onAvionicsRouteSync(route: FlightPlanRoute): void {
    this._syncedAvionicsRoute.set(route);
  }

  /**
   * Responds to when an avionics flight plan route request is received.
   * @param requestId The ID of the request.
   */
  private onAvionicsRouteRequested(requestId: number): void {
    let needPublishPendingRequests = false;

    if (!this.pendingAvionicsRouteRequestsSource.includes(requestId)) {
      this.pendingAvionicsRouteRequestsSource.push(requestId);
      needPublishPendingRequests = true;
    }

    this._avionicsRouteRequested.notify(this, requestId);

    if (needPublishPendingRequests) {
      if (!ArrayUtils.equals(this.pendingAvionicsRouteRequestsSource, this._pendingAvionicsRouteRequests.get())) {
        this._pendingAvionicsRouteRequests.set(Array.from(this.pendingAvionicsRouteRequestsSource));
      }
    }
  }

  /**
   * Responds to when a response to an avionics flight plan route request is received.
   * @param route The flight plan route.
   * @param requestId The ID of the request to which the response is directed.
   */
  private onAvionicsRouteRequestResponse(route: FlightPlanRoute, requestId: number): void {
    const needPublishPendingRequests = this.pendingAvionicsRouteRequestsSource.splice(this.pendingAvionicsRouteRequestsSource.indexOf(requestId), 1).length > 0;

    this._avionicsRouteRequestResponse.notify(this, { requestId, route });

    if (needPublishPendingRequests) {
      if (!ArrayUtils.equals(this.pendingAvionicsRouteRequestsSource, this._pendingAvionicsRouteRequests.get())) {
        this._pendingAvionicsRouteRequests.set(Array.from(this.pendingAvionicsRouteRequestsSource));
      }
    }
  }

  /**
   * Creates an instance of FlightPlanRouteManager.
   * @returns A Promise which is fulfilled with a new instance of FlightPlanRouteManager after it has been created.
   */
  private static create(): Promise<FlightPlanRouteManager> {
    return new Promise((resolve, reject) => {
      const gameState = GameStateProvider.get();
      const sub = gameState.sub(state => {
        if ((window as any)['IsDestroying']) {
          sub.destroy();
          reject('FlightPlanRouteManager: cannot create a manager after the Coherent JS view has been destroyed');
          return;
        }

        if (state === GameState.briefing || state === GameState.ingame) {
          sub.destroy();

          const listener = RegisterViewListener('JS_LISTENER_PLANNEDROUTE', async () => {
            if ((window as any)['IsDestroying']) {
              reject('FlightPlanRouteManager: cannot create a manager after the Coherent JS view has been destroyed');
              return;
            }

            const manager = new FlightPlanRouteManager(listener);
            await manager.initPromise;

            resolve(manager);
          });
        }
      }, false, true);

      sub.resume(true);
    });
  }
}

import {
  FlightPlanRouteManager, FlightPlanRouteUtils, ReadonlyFlightPlanRoute, Subscription
} from '@microsoft/msfs-sdk';

import { UnsFlightPlanRouteLoader } from './UnsFlightPlanRouteLoader';
import { UnsFms } from '../UnsFms';
import { UnsFlightPlans } from '../UnsFmsTypes';
import { UnsFlightPlanRouteUtils } from './UnsFlightPlanRouteUtils';


/**
 * A manager for syncing UNS-1 flight plan routes to and from the sim. The manager supports automatically replying to
 * avionics route requests and can be used to manually or automatically load synced flight plan routes.
 */
export class UnsFlightPlanRouteSyncManager {
  private routeManager?: FlightPlanRouteManager;
  private routeLoader?: UnsFlightPlanRouteLoader;

  private isAlive = true;
  private _isAutoReplying = false;
  private _isAutoSyncing = false;

  private readonly initPromise: Promise<void>;
  private readonly initPromiseResolve!: () => void;
  private readonly initPromiseReject!: (reason?: any) => void;

  private readonly pendingRequestIds: number[] = [];

  private activeReplyPromise?: Promise<void>;
  private replyOpId = 0;

  private avionicsRouteRequestSub?: Subscription;
  private avionicsRouteSyncSub?: Subscription;

  /**
   * Creates a new instance of UnsFlightPlanRouteSyncManager. The manager is created in an uninitialized state and
   * must be initialized before it can perform any functions.
   * @param fms The FMS containing the primary flight plan used by the manager.
   */
  public constructor(private readonly fms: UnsFms) {
    this.initPromise = this.createInitPromise();
  }

  /**
   * Creates a Promise that will be used to await this manager's initialization.
   * @returns A Promise that will be used to await this manager's initialization.
   */
  private createInitPromise(): Promise<void> {
    return new Promise((resolve, reject) => {
      (this.initPromiseResolve as () => void) = resolve;
      (this.initPromiseReject as (reason?: any) => void) = reject;
    });
  }

  /**
   * Checks whether this manager is initialized.
   * @returns Whether this manager is initialized.
   */
  public isInit(): boolean {
    return !!this.routeManager;
  }

  /**
   * Waits until this manager is initialized.
   * @returns A Promise which is fulfilled when this manager is initialized, or rejected if this manager is destroyed
   * before it is initialized.
   */
  public awaitInit(): Promise<void> {
    return this.initPromise;
  }

  /**
   * Initializes this manager. Once initialized, this manager will automatically reply to avionics route requests and
   * can be used to manually or automatically load synced avionics routes.
   * @param manager A flight plan route manager.
   * @param loader A flight plan route loader.
   * @throws Error if this manager has been destroyed.
   */
  public init(manager: FlightPlanRouteManager, loader: UnsFlightPlanRouteLoader): void {
    if (!this.isAlive) {
      throw new Error('UnsFlightPlanRouteSyncManager: cannot initialize a dead manager');
    }

    if (this.routeManager) {
      return;
    }

    this.routeManager = manager;
    this.routeLoader = loader;

    this.avionicsRouteRequestSub = manager.avionicsRouteRequested.on(this.onAvionicsRouteRequested.bind(this), true);
    this.avionicsRouteSyncSub = manager.syncedAvionicsRoute.sub(this.onSyncedAvionicsRouteChanged.bind(this), false, true);

    this.initPromiseResolve();
  }

  /**
   * Checks whether this manager is currently set to automatically reply to avionics route requests.
   * @returns Whether this manager is currently set to automatically reply to avionics route requests.
   */
  public isAutoReplying(): boolean {
    return this._isAutoReplying;
  }

  /**
   * Checks whether this manager is currently set to automatically load synced avionics flight plan routes.
   * @returns Whether this manager is currently set to automatically load synced avionics flight plan routes.
   */
  public isAutoSyncing(): boolean {
    return this._isAutoSyncing;
  }

  /**
   * Starts automatically replying to avionics route requests. This will not initiate replies to any existing pending
   * requests; only requests received after this method is called will receive an automatic reply. This method has no
   * effect if this manager is not initialized.
   * @throws Error if this manager has been destroyed.
   */
  public startAutoReply(): void {
    if (!this.isAlive) {
      throw new Error('UnsFlightPlanRouteSyncManager: cannot manipulate a dead manager');
    }

    if (!this.routeManager || this._isAutoReplying) {
      return;
    }

    this._isAutoReplying = true;

    this.avionicsRouteRequestSub!.resume();
  }

  /**
   * Stops automatically replying to avionics route requests. This method does not cancel any reply operation that is
   * already in progress. This method has no effect if this manager is not initialized.
   * @throws Error if this manager has been destroyed.
   */
  public stopAutoReply(): void {
    if (!this.isAlive) {
      throw new Error('UnsFlightPlanRouteSyncManager: cannot manipulate a dead manager');
    }

    if (!this.routeManager || !this._isAutoReplying) {
      return;
    }

    this._isAutoReplying = false;

    this.avionicsRouteRequestSub!.pause();
  }

  /**
   * Starts automatically loading any synced avionics flight plan routes. After automatic sync has started, this
   * manager will wait until the next time a new avionics route is synced before loading the synced route. This method
   * has no effect if this manager is not initialized.
   * @throws Error if this manager has been destroyed.
   */
  public startAutoSync(): void {
    if (!this.isAlive) {
      throw new Error('UnsFlightPlanRouteSyncManager: cannot manipulate a dead manager');
    }

    if (!this.routeManager || this._isAutoSyncing) {
      return;
    }

    this._isAutoSyncing = true;

    this.avionicsRouteSyncSub!.resume();
  }

  /**
   * Stops automatically loading any synced avionics flight plan routes. This method does not cancel any route-loading
   * operation that is already in progress. This method has no effect if this manager is not initialized.
   * @throws Error if this manager has been destroyed.
   */
  public stopAutoSync(): void {
    if (!this.isAlive) {
      throw new Error('UnsFlightPlanRouteSyncManager: cannot manipulate a dead manager');
    }

    if (!this.routeManager || !this._isAutoSyncing) {
      return;
    }

    this._isAutoSyncing = false;

    this.avionicsRouteSyncSub!.pause();
  }

  /**
   * Replies to all pending avionics route requests. The reply operations are handled asynchronously and so are not
   * guaranteed to have completed by the time this method returns. This method has no effect if this manager is not
   * initialized.
   * @throws Error if this manager has been destroyed.
   */
  public replyToAllPendingRequests(): void {
    if (!this.isAlive) {
      throw new Error('UnsFlightPlanRouteSyncManager: cannot manipulate a dead manager');
    }

    if (!this.routeManager) {
      return;
    }

    this.queueReplyToRequests(this.routeManager, ...this.routeManager.pendingAvionicsRouteRequests.get());
  }

  /**
   * Replies to a specific avionics route request. The reply operation is handled asynchronously and so is not
   * guaranteed to have completed by the time this method returns. This method has no effect if this manager is not
   * initialized.
   * @param requestId The ID of the request to which to reply.
   * @throws Error if this manager has been destroyed.
   */
  public replyToRequest(requestId: number): void {
    if (!this.isAlive) {
      throw new Error('UnsFlightPlanRouteSyncManager: cannot manipulate a dead manager');
    }

    if (!this.routeManager) {
      return;
    }

    this.queueReplyToRequests(this.routeManager, requestId);
  }

  /**
   * Stops any in-progress operation to reply to avionics route requests. This method has no effect if this manager is
   * not initialized.
   * @returns A Promise which is fulfilled after the in-progress operation to reply to avionics route requests at the
   * time this method is called has been stopped. If there are no in-progress operations, then the Promise is fulfilled
   * immediately.
   * @throws Error if this manager has been destroyed.
   */
  public async cancelReply(): Promise<void> {
    if (!this.isAlive) {
      throw new Error('UnsFlightPlanRouteSyncManager: cannot manipulate a dead manager');
    }

    if (!this.routeManager) {
      return;
    }

    ++this.replyOpId;

    if (this.activeReplyPromise) {
      return this.activeReplyPromise;
    } else {
      return;
    }
  }

  /**
   * Loads the most recent synced avionics flight plan route, if one exists. This will preempt any existing in-progress
   * route-loading operation. This method has no effect if this manager is not initialized.
   * @returns A Promise which is fulfilled when the loading operation ends. The fulfillment value reports whether the
   * operation completed successfully without being cancelled.
   * @throws Error if this manager has been destroyed.
   */
  public loadFromSyncedRoute(): Promise<boolean> {
    if (!this.isAlive) {
      throw new Error('UnsFlightPlanRouteSyncManager: cannot manipulate a dead manager');
    }

    if (!this.routeManager) {
      return Promise.resolve(false);
    }

    const syncedRoute = this.routeManager?.syncedAvionicsRoute.get();

    if (!syncedRoute) {
      return Promise.resolve(false);
    }

    return this.routeLoader!.loadRoute(syncedRoute);
  }

  /**
   * Loads a flight plan route. This will preempt any existing in-progress route-loading operation. This method has no
   * effect if this manager is not initialized.
   * @param route The flight plan route to load.
   * @returns A Promise which is fulfilled when the loading operation ends. The fulfillment value reports whether the
   * operation completed successfully without being cancelled.
   * @throws Error if this manager has been destroyed.
   */
  public loadRoute(route: ReadonlyFlightPlanRoute): Promise<boolean> {
    if (!this.isAlive) {
      throw new Error('UnsFlightPlanRouteSyncManager: cannot manipulate a dead manager');
    }

    if (!this.routeLoader) {
      return Promise.resolve(false);
    }

    return this.routeLoader.loadRoute(route);
  }

  /**
   * Stops any in-progress operation to load a synced route. This method has no effect if this manager is not
   * initialized.
   * @returns A Promise which is fulfilled after the in-progress operation to load a synced route into the primary
   * flight plan at the time this method is called has been stopped. If there are no in-progress operations, then the
   * Promise is fulfilled immediately.
   * @throws Error if this manager has been destroyed.
   */
  public async cancelLoad(): Promise<void> {
    if (!this.isAlive) {
      throw new Error('UnsFlightPlanRouteSyncManager: cannot manipulate a dead manager');
    }

    if (!this.routeLoader) {
      return;
    }

    return this.routeLoader.cancelLoad();
  }

  /**
   * Responds to when an avionics route request is received.
   * @param manager The flight plan route manager through which the route request was received.
   * @param requestId The ID of the request.
   */
  private onAvionicsRouteRequested(manager: FlightPlanRouteManager, requestId: number): void {
    this.queueReplyToRequests(manager, requestId);
  }

  /**
   * Responds to when the most recent synced avionics route changes.
   * @param route The most recent synced avionics route.
   */
  private onSyncedAvionicsRouteChanged(route: ReadonlyFlightPlanRoute | null): void {
    if (route === null) {
      return;
    }

    this.routeLoader!.loadRoute(route);
  }

  /**
   * Queues a reply to one or more avionics route requests and starts the process of dequeuing the reply queue if it is not
   * already being dequeued.
   * @param manager The flight plan route manager through which to reply.
   * @param requestIds The IDs of the requests to which to reply.
   */
  private queueReplyToRequests(manager: FlightPlanRouteManager, ...requestIds: number[]): void {
    if (requestIds.length === 0) {
      return;
    }

    const needScheduleReply = this.pendingRequestIds.length === 0;

    this.pendingRequestIds.push(...requestIds);

    if (needScheduleReply) {
      this.scheduleReplyToAvionicsRouteRequests(manager);
    }
  }

  /**
   * Schedules an avionics route reply operation.
   * @param manager The flight plan route manager through which to reply.
   */
  private async scheduleReplyToAvionicsRouteRequests(manager: FlightPlanRouteManager): Promise<void> {
    const opId = ++this.replyOpId;

    if (this.activeReplyPromise) {
      await this.activeReplyPromise;
    }

    if (opId !== this.replyOpId) {
      return;
    }

    const promise = this.replyToAvionicsRouteRequests(opId, manager);
    this.activeReplyPromise = promise;

    await this.activeReplyPromise;

    if (this.activeReplyPromise === promise) {
      this.activeReplyPromise = undefined;
    }
  }

  /**
   * Replies to all currently pending avionics route requests.
   * @param opId The reply operation ID.
   * @param manager The flight plan route manager through which to reply.
   */
  private async replyToAvionicsRouteRequests(opId: number, manager: FlightPlanRouteManager): Promise<void> {
    let route: ReadonlyFlightPlanRoute | undefined;

    // Wait until we are not loading any synced routes.
    do {
      while (this.routeLoader!.isLoadInProgress()) {
        await this.routeLoader!.awaitLoad();

        if (opId !== this.replyOpId) {
          return;
        }
      }

      route = undefined;

      try {
        if (this.fms.hasFlightPlan(UnsFlightPlans.Active)) {
          route = await UnsFlightPlanRouteUtils.createRouteFromFlightPlan(
            this.fms.facLoader,
            this.fms.getPrimaryFlightPlan()
          );
        }
      } catch (e) {
        console.error(e);
        if (e instanceof Error) {
          console.error(e.stack);
        }
      }

      // If another route load started while we were getting the origin/destination airports, then do the entire thing
      // over again.
    } while (this.routeLoader!.isLoadInProgress());

    route ??= FlightPlanRouteUtils.emptyRoute();

    for (const id of this.pendingRequestIds) {
      manager.replyToAvionicsRouteRequest(id, route);
    }

    this.pendingRequestIds.length = 0;
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.initPromiseReject('GarminFlightPlanRouteSyncManager: manager was destroyed before initialization');

    this.avionicsRouteRequestSub?.destroy();
    this.avionicsRouteSyncSub?.destroy();
  }
}

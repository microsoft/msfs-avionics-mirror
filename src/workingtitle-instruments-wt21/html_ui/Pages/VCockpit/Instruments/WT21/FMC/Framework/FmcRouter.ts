import { EventBus, SubEvent, Subject } from '@microsoft/msfs-sdk';

import { FmcPageEvent } from '../FmcEvent';
import { FmcPageConstructor } from './FmcPage';

/**
 * A map of routes to pages for the FmcRouter
 */
export type FmcRouteMap = { [k: string]: FmcPageConstructor }

/**
 * A map of `FmcEvent`s to routes for the FmcRouter
 */
export type FmcEventRouteMap = { [k in FmcPageEvent]?: string };

/**
 * Manages FMC page routing
 */
export class FmcRouter {

  private readonly routes: FmcRouteMap = {};

  private readonly routeFmcEvents: FmcEventRouteMap = {};

  private previousPageRoute = '/';

  /**
   * Provides the active subpage index. They are 1-indexed to reflect the real life paging.
   *
   * @returns index
   */
  public currentSubpageIndex = Subject.create(1);

  /**
   * Provides the amount of subpages available
   *
   * @returns index
   */
  public currentSubpageCount = Subject.create(1);

  /**
   * Current router params. Can be set when switching active routes
   */
  public params: Record<string, unknown> = {};

  /**
   * An event that is invoked when a page button is pressed for the already active page.
   */
  public readonly activePageButtonPressed = new SubEvent<void, void>();

  /**
   * Constructs a new FmcRouter
   *
   * @param activeRouteSubject    a `Subject<string>` for the active route - read from by the router
   * @param activePageSubject     a `Subject<FmcPageConstructor>` for the active page - written to by the router
   * @param eventBus              am `EventBus` for this FMC
   */
  public constructor(
    public readonly activeRouteSubject: Subject<string>,
    public readonly activePageSubject: Subject<FmcPageConstructor>,
    private readonly eventBus: EventBus,
  ) { }

  /**
   * Hooks up routing subscription
   */
  public hookup(): void {
    this.activeRouteSubject.sub(this.handleNewActiveRoute.bind(this), true);

    this.eventBus.on('fmcPageKeyEvent', (data: FmcPageEvent) => {
      this.handleFmcEvent(data);
    });
  }

  /**
   * Adds a new route to the router map
   *
   * @param route the route path
   * @param page the page constructor to render when the route is active
   * @param event map an `FmcEvent` to a route, which will be automatically set by the router upon reception (optional)
   *
   * @returns this `FmcRouter` instance for chaining
   */
  public add(route: string, page: FmcPageConstructor, event?: FmcPageEvent): FmcRouter {
    this.routes[route] = page;

    if (event) {
      this.routeFmcEvents[event] = route;
    }

    return this;
  }

  /**
   * Navigates to a certain route, with a set of new params
   *
   * @param route  the new route
   * @param params the new params
   *
   * @throws if the route is unknown
   */
  public navigateTo(route: string, params?: Record<string, unknown>): void {
    if (!(route in this.routes)) {
      throw new Error('[FMC/Router] No such route: ' + route);
    }

    this.params = params ?? {};

    this.activeRouteSubject.set(route);
  }

  /**
   * Moves to the previous subpage if there is one available
   *
   * @returns whether or not the subpage was changed
   */
  public prevSubpage(): boolean {
    const currentIndex = this.currentSubpageIndex.get();

    if (currentIndex === 1) {
      this.currentSubpageIndex.set(this.currentSubpageCount.get());
    } else {
      this.currentSubpageIndex.set(currentIndex - 1);
    }

    return true;
  }


  /**
   * Moves to the next subpage if there is one available
   *
   * @returns whether or not the subpage was changed
   */
  public nextSubpage(): boolean {
    const currentIndex = this.currentSubpageIndex.get();

    if (currentIndex >= this.currentSubpageCount.get()) {
      this.currentSubpageIndex.set(1);
    } else {
      this.currentSubpageIndex.set(currentIndex + 1);
    }

    return true;
  }

  /**
   * Handles a new active route
   *
   * @param newRoute the new route path
   *
   * @private
   */
  public handleNewActiveRoute(newRoute: string): void {
    this.currentSubpageIndex.set(1);

    // This could be O(1) but more complex routing might be done later
    for (const [route, pageConstructor] of Object.entries(this.routes)) {
      if (route === newRoute) {
        this.activePageSubject.set(pageConstructor);
      }
    }
  }

  /**
   * Handles an FMC event, dispatching it to the current page
   *
   * @param event rhe `FmcEvent` to handle
   *
   * @private
   */
  private handleFmcEvent(event: FmcPageEvent): void {
    let eventRoute = this.routeFmcEvents[event];

    if (eventRoute) {
      // If on MESSAGES page when hitting the MSG button, go back to previous page
      if (event === FmcPageEvent.PAGE_MSG && this.activeRouteSubject.get() === '/msg') {
        eventRoute = this.previousPageRoute;
      }
      // When pressing the page button for the current page, go back to first subpage
      if (eventRoute === this.activeRouteSubject.get()) {
        this.currentSubpageIndex.set(1);
        this.activePageButtonPressed.notify();
        return;
      }
      this.previousPageRoute = this.activeRouteSubject.get();

      this.navigateTo(eventRoute);

      return;
    }
  }

}

import { AbstractFmcPage, PageConstructor } from './AbstractFmcPage';
import { Subject } from '../sub';

/**
 * A router for an FMC screen.
 *
 * This registers routes and handles setting the appropriate page and params.
 */
export class FmcRouter<T extends AbstractFmcPage<any>> {
  private readonly routes: { [k: string]: PageConstructor<T, any> } = {};

  private readonly routesDefaultProps = new Map<PageConstructor<T, any>, any>();

  public currentRoute = Subject.create('/');

  public currentSubpageIndex = Subject.create(1);

  public currentSubpageCount = Subject.create(1);

  /**
   * Adds a route to the router
   *
   * @param route the route string
   * @param page the target page constructor
   * @param defaultProps the default props to pass in to the page
   */
  public addRoute<P extends object | null>(route: string, page: PageConstructor<T, P>, defaultProps: P): void {
    this.routes[route] = page;
    this.routesDefaultProps.set(page, defaultProps);
  }

  /**
   * Gets the associated page (or undefined) for a route
   *
   * @param routeString the route string
   *
   * @returns the associated page
   */
  public getPageForRoute(routeString: string): PageConstructor<T, any> | undefined {
    return this.routes[routeString.split('#', 2)[0].trim()];
  }

  /**
   * Gets the associated route (or undefined) for a page
   *
   * @param pageCtor the page constructor
   *
   * @returns the associated route
   */
  public getRouteForPage(pageCtor: PageConstructor<T, any>): string | undefined {
    for (const [route, ctor] of Object.entries(this.routes)) {
      if (ctor === pageCtor) {
        return route;
      }
    }

    return undefined;
  }

  /**
   * Gets the associated subpage index (after the hash) or 1 by default
   *
   * @param routeString the route string
   *
   * @returns the associated subpage index
   */
  public getSubpageForRoute(routeString: string): number {
    return parseInt(routeString.split('#', 2)[1] ?? '1');
  }

  /**
   * Returns the default props for a given page class
   *
   * @param page the page class
   *
   * @throws if the page was not registered
   *
   * @returns the default props
   */
  public getDefaultPropsForPage<P extends PageConstructor<T>>(page: P): P extends PageConstructor<AbstractFmcPage<infer V>, infer V> ? V : never {
    if (!this.routesDefaultProps.has(page)) {
      throw new Error('No default props registered for page');
    }

    return this.routesDefaultProps.get(page);
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
   * Moves to the specified subpage if there is one available
   *
   * @param index Desired subpage index (1-based)
   *
   * @returns whether or not the subpage was changed
   */
  public setSubpage(index: number): boolean {
    const currentIndex = this.currentSubpageIndex.get();

    if (index < 1  || index > this.currentSubpageCount.get() || currentIndex === index) {
      return false;
    }

    this.currentSubpageIndex.set(index);

    return true;
  }
}

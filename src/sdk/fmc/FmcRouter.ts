import { AbstractFmcPage, PageConstructor } from './AbstractFmcPage';
import { Subject } from '../sub';

/**
 * A router for an FMC screen.
 *
 * This registers routes and handles setting the appropriate page and params.
 */
export class FmcRouter<T extends AbstractFmcPage> {
  private readonly routes: { [k: string]: PageConstructor<T> } = {};

  public currentRoute = Subject.create('/');

  public currentSubpageIndex = Subject.create(1);

  public currentSubpageCount = Subject.create(1);

  /**
   * Adds a route to the router
   *
   * @param route the route string
   * @param page the target page constructor
   */
  public addRoute(route: string, page: PageConstructor<T>): void {
    this.routes[route] = page;
  }

  /**
   * Gets the associated page (or undefined) for a route
   *
   * @param routeString the route string
   *
   * @returns the associated page
   */
  public getPageForRoute(routeString: string): PageConstructor<T> | undefined {
    return this.routes[routeString.split('#', 2)[0].trim()];
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
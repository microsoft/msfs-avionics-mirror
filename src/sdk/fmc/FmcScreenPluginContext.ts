import { AbstractFmcPage, PageConstructor } from './AbstractFmcPage';
import { FmcPagingEvents, LineSelectKeyEvent } from './FmcInteractionEvents';
import { FmcRenderTemplate } from './FmcRenderer';

/**
 * Allows extending an existing FMC page with custom behaviour, including replacing, in part or completely, rendered templates.
 *
 * It is recommended to use {@link AbstractFmcPageExtension} when creating page extensions.
 */
export interface FmcPageExtension<P extends AbstractFmcPage<any>> {
  /** The page instance this extension is attached to */
  readonly page: P;

  /** Callback fired after the page initializes */
  onPageInit?(): void;

  /** Callback fired after the page resumes */
  onPageResume?(): void;

  /** Callback fired after the page pauses */
  onPagePause?(): void;

  /** Callback fired after the page is destroyed */
  onPageDestroyed?(): void;

  /**
   * Callback fired after the page renders, but before the FMC renderer renders the content
   *
   * @param renderedTemplates the templates that were returned by the page's render (can be edited)
   **/
  onPageRendered?(renderedTemplates: FmcRenderTemplate[]): void;

  /**
   * Callback fired before the page processes a select key event
   *
   * @param selectKeyEvent the select key event
   *
   * @returns `true` if the page should not continue processing the event (it will be considered to have handled it)
   * */
  onPageHandleSelectKey?(selectKeyEvent: LineSelectKeyEvent): boolean;

  /**
   * Callback fired before the page processes a scrolling event
   *
   * @param scrollingEvent the scrolling event
   *
   * @returns `true` if the page should not continue processing the event (it will be considered to have handled it)
   * */
  onPageHandleScrolling?(scrollingEvent: keyof FmcPagingEvents<this> & string): boolean;
}

/**
 * Abstract FmcPageExtension
 */
export class AbstractFmcPageExtension<P extends AbstractFmcPage> implements FmcPageExtension<P> {
  /**
   * Constructor
   *
   * @param page the page
   */
  constructor(public readonly page: P) {
  }
}

/**
 * Interface for plugins to attach to an FMC screen
 */
export interface FmcScreenPluginContext<P extends AbstractFmcPage, E> {
  addPluginPageRoute<T extends null>(
    route: string,
    page: PageConstructor<P & AbstractFmcPage<T>>,
    routeEvent?: (keyof E & string) | undefined,
  ): void;
  /**
   * Adds a page route to the FMC screen. Routes added by the avionics will have priority.
   *
   * @param route the route
   * @param page the page constructor
   * @param routeEvent the FMC event, optionally, to bind the route to
   * @param defaultProps default props to pass in to the page
   */
  addPluginPageRoute<U extends PageConstructor<P>>(
    route: string,
    page: U,
    routeEvent: (keyof E & string) | undefined,
    defaultProps: U extends PageConstructor<AbstractFmcPage<infer V>, infer V> ? V : never,
  ): void;

  /**
   * Adds a page route to the FMC screen. Has priority over routes added by the avionics.
   *
   * @param route the route
   * @param page the page constructor
   * @param routeEvent the FMC event, optionally, to bind the route to
   */
  replacePageRoute(route: string, page: PageConstructor<P>, routeEvent?: keyof E & string): void;

  /**
   * Attaches a {@link FmcPageExtension} to a specific page class
   *
   * @param pageClass the page constructor (class) to attach the extension to
   * @param extension the extension class (will be instantiated whenever the page is created)
   */
  attachPageExtension(pageClass: PageConstructor<P>, extension: new (...args: any[]) => FmcPageExtension<P>): void;
}

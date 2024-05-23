import { FmcRouter } from './FmcRouter';
import { FmcOutputTemplate, FmcRenderer, FmcRenderTemplate } from './FmcRenderer';
import { FmcPageFactory } from './FmcPageFactory';
import { AbstractFmcPage, FmcPageLifecyclePolicy, PageConstructor, PageConstructorUtils } from './AbstractFmcPage';
import { Subject } from '../sub';
import { Consumer, EventBus } from '../data';
import { FmcScratchpad } from './FmcScratchpad';
import { FmcPagingEvents, LineSelectKeyEvent } from './FmcInteractionEvents';
import { AbstractFmcPageExtension, FmcPageExtension, FmcScreenPluginContext } from './FmcScreenPluginContext';

/**
 * Options for an FMC screen
 */
export interface FmcScreenOptions {
  /** Screen dimensions */
  screenDimensions: {
    /** Screen character cell width */
    cellWidth: number,

    /** Screen character row height */
    cellHeight: number,
  }

  /**
   * The value that is thrown when an LSK event is not handled by anything.
   *
   * Default: the string 'KEY NOT ACTIVE'.
   */
  lskNotHandledThrowValue?: any,

  /**
   * The value that is thrown when a text input fields receives a DELETE when `deleteAllowed` is false.
   *
   * Default: the string 'INVALID DELETE'.
   */
  textInputFieldDisallowedDeleteThrowValue?: any,

  /**
   * The value that is thrown when a text input fields fails to parse a scratchpad entry.
   *
   * Default: the string 'INVALID ENTRY'.
   */
  textInputFieldParseFailThrowValue?: any,

  /**
   * Whether to enable the scratchpad. Defaults to `true`.
   */
  enableScratchpad?: boolean,

  /**
   * A prefix for fmc events.
   * Currently used for multiple FMCs on one instrument scenarios.
   */
  eventPrefix?: string,
}

/**
 * An FMC screen.
 *
 * This is the main object used to encapsulate an FMC screen and its rendering.
 *
 * Type parameter `T` should be a subclass of the {@link AbstractFmcPage} that is universally used by pages in this implementation.
 * This is done so that different avionics can have different types for different kinds of events and any data that pages might need to be
 * instantiated with.
 */
export class FmcScreen<P extends AbstractFmcPage = AbstractFmcPage, E = Record<string, unknown>> implements FmcScreenPluginContext<P, E> {
  private readonly router = new FmcRouter<P>();

  private readonly pageInstanceCache = new Map<PageConstructor<P>, P & AbstractFmcPage<any>>();

  public readonly options: Required<FmcScreenOptions> = {
    screenDimensions: {
      cellWidth: 24,
      cellHeight: 12,
    },
    lskNotHandledThrowValue: 'KEY NOT ACTIVE',
    textInputFieldDisallowedDeleteThrowValue: 'INVALID DELETE',
    textInputFieldParseFailThrowValue: 'INVALID ENTRY',
    enableScratchpad: true,
    eventPrefix: '',
  };

  protected currentlyDisplayedPage: P | null = null;

  private pendingPageAdditions: Record<string, [PageConstructor<P>, (keyof E & string) | undefined, any]> = {};

  private pendingPageReplacements: Record<string, [PageConstructor<P>, (keyof E & string) | undefined, any]> = {};

  private attachedPageExtensions = [] as [PageConstructor<P>, new (page: P) => FmcPageExtension<P>][];

  /**
   * Ctor
   * @param bus the event bus
   * @param pageFactory the page factory to be used for creating FMC pages for this screen
   * @param options the screen options
   * @param renderer the renderer to use for this screen
   * @param scratchpad the scratchpad to use for this screen
   */
  constructor(
    protected readonly bus: EventBus,
    private readonly pageFactory: FmcPageFactory<P>,
    options: FmcScreenOptions,
    private readonly renderer: FmcRenderer,
    public readonly scratchpad: FmcScratchpad,
  ) {
    Object.assign(this.options, options);

    if (this.options.enableScratchpad) {
      this.scratchpad.renderedText.sub((text) => {
        this.renderer.editOutputTemplate([[text]], this.scratchpadRenderRow, []);
      });
    }
  }

  /**
   * Processes page replacement calls made by plugins. Must be called after plugins are initialized, and before stock routes are added.
   */
  public processPluginPageAdditions(): void {
    for (const [route, [pageCtor, routeEvent, initialTypedParameters]] of Object.entries(this.pendingPageAdditions)) {
      this.addPageRoute(route, pageCtor, routeEvent, initialTypedParameters);
    }
  }

  /**
   * Processes page replacement calls made by plugins. Must be called after plugins are initialized, and after stock routes are added.
   */
  public processPluginPageReplacements(): void {
    for (const [route, [pageCtor, routeEvent, initialTypedParameters]] of Object.entries(this.pendingPageReplacements)) {
      this.addPageRoute(route, pageCtor, routeEvent, initialTypedParameters);
    }
  }

  /**
   * Gets the current route
   *
   * @returns a string subject
   */
  get currentRoute(): Subject<string> {
    return this.router.currentRoute;
  }

  /**
   * Gets the current subpage index for the current displayed page, 1-indexed
   *
   * @returns a number
   */
  get currentSubpageIndex(): Subject<number> {
    return this.router.currentSubpageIndex;
  }

  /**
   * Gets the current number of subpages for the current displayed page
   *
   * @returns a number
   */
  get currentSubpageCount(): Subject<number> {
    return this.router.currentSubpageCount;
  }

  /**
   * Navigates to a given route and displays the associated page, if available
   *
   * @param route the route
   * @param params the parameters to pass to the page
   */
  public navigateTo(
    route: string,
    params?: Record<string, unknown>,
  ): void;
  /**
   * Navigates to a given route and displays the associated page, if available
   *
   * @param pageClass the page's class
   * @param props props to pass in to the page
   */
  public navigateTo<U extends PageConstructor<P>>(
    pageClass: U,
    props: U extends PageConstructor<AbstractFmcPage<infer V>, infer V> ? V : never,
  ): void;
  /**
   * Navigates to a given route and displays the associated page, if available
   *
   * @param arg0 the route
   * @param arg1 the parameters to pass to the page
   *
   * @throws if a page class is passed in as the first argument and no associated route is found
   */
  public navigateTo<U extends PageConstructor<P>>(
    arg0: string | U,
    arg1?: Record<string, unknown> | U extends PageConstructor<AbstractFmcPage<infer V>, infer V> ? V : never,
  ): void {
    const pageCtor = typeof arg0 === 'string' ? this.router.getPageForRoute(arg0) : arg0;
    const pageRoute = typeof arg0 === 'string' ? arg0 : this.router.getRouteForPage(arg0);

    if (pageCtor === undefined || pageRoute === undefined) {
      throw new Error(`Could not find a page route for ${arg0}`);
    }

    this.router.currentRoute.set(pageRoute);

    let instance: P & AbstractFmcPage<U>;
    if (pageCtor.lifecyclePolicy === FmcPageLifecyclePolicy.Singleton) {
      const existingInstance = this.pageInstanceCache.get(pageCtor);

      instance = existingInstance ?? this.instantiatePage(pageCtor);

      this.pageInstanceCache.set(pageCtor, instance);
    } else {
      instance = this.instantiatePage(pageCtor);
    }

    if (this.currentlyDisplayedPage) {
      this.currentlyDisplayedPage.pause();
    }

    this.currentlyDisplayedPage = instance;

    instance.params.clear();
    if (arg1 && !PageConstructorUtils.isPageConstructor(arg1)) {
      const params = arg1 as Record<string, unknown>;

      for (const key of Object.keys(params)) {
        instance.params.set(key, params[key]);
      }
    }

    if (!instance.isInitialized) {
      instance.init();
    }

    this.router.currentSubpageCount.set(instance.render().length);
    this.router.setSubpage(this.router.getSubpageForRoute(pageRoute));
    instance.isInitialized = true;
    instance.resume((arg1 as U | undefined));
  }

  /**
   * Clears the scratchpad, if applicable
   */
  public clearScratchpad(): void {
    this.scratchpad.clear();
  }

  /**
   * Declares a route for a page class
   *
   * @param route the route to set
   * @param page the page to associate with it
   * @param routeEvent the event to associate with it
   */
  public addPageRoute<T extends null>(
    route: string,
    page: PageConstructor<P & AbstractFmcPage<T>>,
    routeEvent?: (keyof E & string) | undefined,
  ): void
  /**
   * Declares a route for a page class
   *
   * @param route the route to set
   * @param page the page to associate with it
   * @param routeEvent the event to associate with it
   * @param defaultProps default props to pass in to the page
   */
  public addPageRoute<U extends PageConstructor<P>>(
    route: string,
    page: U,
    routeEvent: (keyof E & string) | undefined,
    defaultProps: U extends PageConstructor<AbstractFmcPage<infer V>, infer V> ? V : never,
  ): void;
  /**
   * Declares a route for a page class
   *
   * @param route the route to set
   * @param page the page to associate with it
   * @param routeEvent the event to associate with it
   * @param defaultProps default typed parameters to pass in to the page
   */
  public addPageRoute<U extends PageConstructor<P>>(
    route: string,
    page: U,
    routeEvent?: keyof E & string | undefined,
    defaultProps?: U extends PageConstructor<AbstractFmcPage<infer V>, infer V> ? V : never | undefined,
  ): void {
    this.router.addRoute(route, page, defaultProps ?? null);

    if (routeEvent) {
      this.onPrefixedEvent(routeEvent).handle(() => {
        if (this.currentRoute.get() === route) {
          this.currentlyDisplayedPage?.onPageButtonPressed();
        } else {
          this.navigateTo(page, this.router.getDefaultPropsForPage(page));
        }
      });
    }
  }


  /** @inheritDoc */
  public addPluginPageRoute<T extends object>(
    route: string,
    page: PageConstructor<P & AbstractFmcPage<T>, T>,
    routeEvent?: keyof E & string,
    defaultTypedParameters?: T,
  ): void {
    this.pendingPageAdditions[route] = [page, routeEvent, defaultTypedParameters];
  }

  /** @inheritDoc */
  public replacePageRoute<T extends object>(
    route: string,
    page: PageConstructor<P & AbstractFmcPage<T>, T>,
    routeEvent?: keyof E & string,
    defaultTypedParameters?: T,
  ): void {
    this.pendingPageReplacements[route] = [page, routeEvent, defaultTypedParameters];
  }

  /** @inheritDoc */
  public attachPageExtension(pageClass: PageConstructor<P>, extensionCtor: new(...args: any[]) => AbstractFmcPageExtension<P>): void {
    this.attachedPageExtensions.push([pageClass, extensionCtor]);
  }

  /**
   * Adds a list of LSK events bound to certain positions on the rendering grid
   *
   * @param array the LSK events and their positions
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public addLskEvents(array: ([event: keyof E & string, row: number, col: number][])): void {
    for (const lsk of array) {
      this.bus.getSubscriber<E>().on(`${this.options.eventPrefix}${lsk[0]}` as keyof E & string).handle(() => {
        this.handleLineSelectKey(lsk[1], lsk[2]);
      });
    }
  }

  /**
   * Adds paging events bound the page slewing
   *
   * @param events the events to bind
   */
  public addPagingEvents(events: FmcPagingEvents<E>): void {
    const subs = this.bus.getSubscriber<E>();

    events.pageLeft && subs.on(`${this.options.eventPrefix}${events.pageLeft}` as keyof E & string).handle(() => this.handlePagingKey('pageLeft'));
    events.pageRight && subs.on(`${this.options.eventPrefix}${events.pageRight}` as keyof E & string).handle(() => this.handlePagingKey('pageRight'));
    events.pageUp && subs.on(`${this.options.eventPrefix}${events.pageUp}` as keyof E & string).handle(() => this.handlePagingKey('pageUp'));
    events.pageDown && subs.on(`${this.options.eventPrefix}${events.pageDown}` as keyof E & string).handle(() => this.handlePagingKey('pageDown'));
  }

  /**
   * Returns a consumer for an event prefixed for this particular screen.
   * @param event The event to subscribe to.
   * @returns A consumer for an event prefixed for this particular screen.
   * */
  public onPrefixedEvent<k extends keyof E & string>(event: k): Consumer<E[k]> {
    return this.bus.getSubscriber<E>().on(`${this.options.eventPrefix}${event}` as k);
  }

  /**
   * Edits part of the screen output
   *
   * @param rowIndex the row index to insert at
   * @param output the output to insert
   *
   * @throws if `rowIndex` is too high
   */
  public editOutputTemplate(rowIndex: number, output: FmcOutputTemplate): void {
    this.renderer.editOutputTemplate(output, rowIndex, []);
  }

  /**
   * Instantiates a page for this screen
   *
   * @param page the page constructor
   *
   * @returns the created page
   */
  private instantiatePage<U extends object>(page: PageConstructor<P & AbstractFmcPage<U>, U>): P & AbstractFmcPage<U> {
    const initialProps = this.router.getDefaultPropsForPage(page);

    const pageInstance = this.pageFactory.createPage(page, this.bus, this, initialProps, this.acceptPageOutput.bind(this));

    for (const [pageTarget, extension] of this.attachedPageExtensions) {
      if (pageInstance instanceof pageTarget) {
        pageInstance.acceptPageExtension(new extension(pageInstance));
      }
    }

    return pageInstance;
  }

  /**
   * Method called when a page is rendered to the screen. This can be overridden to intercept the page data and act upon it.
   *
   * @param output the output template, displayed on the screen
   * @param template the render template, rendered by the page
   * @param atRowIndex the row index at which the render occurred
   */
  protected acceptPageOutput(output: FmcOutputTemplate, template: FmcRenderTemplate, atRowIndex: number): void {
    const rows = [...output];

    const totalRows = this.options.screenDimensions.cellHeight - (this.options.enableScratchpad ? 2 : 0);
    for (let i = atRowIndex + rows.length; i < totalRows; i++) {
      rows.push(['']);
    }

    this.renderer.editOutputTemplate(rows, atRowIndex, template);

    if (this.options.enableScratchpad) {
      this.renderer.editOutputTemplate([[this.scratchpad.renderedText.get()]], this.scratchpadRenderRow, template);
    }
  }

  /**
   * Returns the row the scratchpad should render at
   *
   * @returns a number
   */
  private get scratchpadRenderRow(): number {
    return this.scratchpad.options.renderRow === -1
      ? this.options.screenDimensions.cellHeight - 1
      : this.scratchpad.options.renderRow;
  }

  /**
   * Handles a line select key recieved by the FMC, before passing it on to pages
   *
   * @param row the row of the LSK
   * @param col the side of the lSK (0 or 1)
   */
  private handleLineSelectKey(row: number, col: number): void {
    if (this.currentlyDisplayedPage) {
      const event: LineSelectKeyEvent = {
        row, col, scratchpadContents: this.scratchpad.contents.get(), isDelete: this.scratchpad.isInDelete.get(),
      };

      this.currentlyDisplayedPage.handleLineSelectKey(event).then((returnValue) => {
        if (typeof returnValue === 'string') {
          this.scratchpad.contents.set(returnValue);
        } else if (!returnValue) {
          this.onLineSelectKeyUnhandled(event);
        }
      }).catch((error) => this.onLineSelectKeyError(error));
    }
  }

  /**
   * Called when an LSK event is not handled by any code.
   *
   * @param selectKeyEvent the LSK event
   *
   * @throws the value of `options.lskNotHandledThrowValue` by default
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onLineSelectKeyUnhandled(selectKeyEvent: LineSelectKeyEvent): void {
    throw this.options.lskNotHandledThrowValue;
  }

  /**
   * Called when an LSK error is thrown. Sets `this.scratchpad.errorContents` (if error is a string; otherwise throws) by default.
   *
   * @param error the LSK error
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onLineSelectKeyError(error: any): void {
    if (typeof error === 'string') {
      this.scratchpad.errorContents.set(error);
    } else {
      console.error(`Unhandled error in LSK handler: ${error}`);
    }
  }

  /**
   * Handles a paging key recieved by the FMC
   *
   * @param event the paging key event
   */
  private async handlePagingKey(event: keyof FmcPagingEvents<E> & string): Promise<void> {
    const handledByPage = await this.currentlyDisplayedPage?.handleScrolling(event);

    if (handledByPage) {
      return;
    }

    if (event === 'pageLeft') {
      this.router.prevSubpage();
    }

    if (event === 'pageRight') {
      this.router.nextSubpage();
    }
  }
}

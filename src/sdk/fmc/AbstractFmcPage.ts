import { Subscription } from '../sub';
import { FmcComponent } from './components';
import { FmcOutputTemplate, FmcRenderTemplate, FmcRenderTemplateColumn, FmcRenderTemplateRow, PositionedFmcColumn, RenderedPositionedFmcColumn } from './FmcRenderer';
import { FmcScreen } from './FmcScreen';
import { ConsumerSubject, EventBus } from '../data';
import { ClockEvents } from '../instruments';
import { FmcPagingEvents, LineSelectKeyEvent } from './FmcInteractionEvents';
import { FmcPageExtension } from './FmcScreenPluginContext';

/**
 * A render callback given to an FMC page
 */
export type FmcRenderCallback = (output: FmcOutputTemplate, render: FmcRenderTemplate, atRowIndex: number) => void

/**
 * Represents possible lifetimes for FmcPages
 */
export enum FmcPageLifecyclePolicy {
  /**
   * Page is only created and initialized once, the first time it is navigated to, the reloaded and resumed.
   */
  Singleton,

  /**
   * Page is re-created and re-initialized every time it is navigated to.
   */
  Transient,
}

/**
 * Base abstract class for FMC pages
 */
export abstract class AbstractFmcPage<P extends object | null = any> {
  /**
   * Configures the {@link FmcPageLifecyclePolicy} for this page
   */
  public static lifecyclePolicy = FmcPageLifecyclePolicy.Singleton;

  /**
   * Callback to fire when the page needs to render
   * @private
   */
  abstract readonly renderCallback: FmcRenderCallback;

  public readonly memorizedComponents: [FmcComponent | null, FmcComponent | null, FmcComponent | null][] = [];

  private readonly bindings: (Subscription | ConsumerSubject<any>)[] = [];

  private readonly pageExtensions: FmcPageExtension<this>[] = [];

  public readonly params = new Map();

  private _props: P | undefined;

  /**
   * Obtains the current value of the page's props
   *
   * @throws if the props have not yet been initialised
   *
   * @returns the props value
   */
  public get props(): P {
    if (!this._props) {
      throw new Error('Props not yet initialized; make sure to access props only after a page has been first instantiated');
    }

    return this._props;
  }

  protected clockConsumer;
  private isDirty = false;

  private readonly clockSub: Subscription;

  /**
   * Ctor
   * @param bus the event bus
   * @param screen the FMC screen instance
   * @param props the initial props for this page
   */
  protected constructor(public readonly bus: EventBus, public readonly screen: FmcScreen<any, any>, props: P) {
    this.screen = screen;
    this.clockConsumer = this.bus.getSubscriber<ClockEvents>().on('realTime').atFrequency(10, false);
    this._props = props;

    this.clockSub = this.clockConsumer.handle(this.clockHandler, true);
  }

  /**
   * Handles when update/refresh of the FMCPage based on clock input
   * @param d is the Clock Value from the Event Bus
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected clockHandler = (d: number): void => {
    if (this.isDirty) {
      this.isDirty = false;
      this.initialRender();
    }
  };


  public isInitialized = false;

  /**
   * Initializes the page.
   *
   * Use this for setting up subscriptions and such.
   */
  public init(): void {
    this.addBinding(this.screen.currentSubpageIndex.sub(() => this.invalidate()));

    for (const extension of this.pageExtensions) {
      extension.onPageInit?.();
    }

    this.onInit();
  }

  /**
   * Init lifecycle hook
   */
  protected onInit(): void {
    // Do nothing
  }

  /**
   * Pauses the page and calls appropriate event handlers
   */
  public pause(): void {
    for (const binding of this.bindings) {
      if (!binding.isAlive) {
        continue;
      }

      binding.pause();
    }

    this.isDirty = false;
    this.clockSub.pause();

    this.onPause();

    for (const extension of this.pageExtensions) {
      extension.onPagePause?.();
    }
  }

  /**
   * Pause lifecycle hook
   */
  protected onPause(): void {
    // Do nothing
  }

  /**
   * Resumes the page and calls appropriate event handlers
   *
   * @param props the props to pass in to the page, if applicable
   */
  public resume(props?: P): void {
    if (props !== undefined) {
      this._props = props;
    }

    for (const binding of this.bindings) {
      if (!binding.isAlive) {
        continue;
      }

      binding.resume(true);
    }

    this.onResume();

    for (const extension of this.pageExtensions) {
      extension.onPageResume?.();
    }

    this.isDirty = true;
    this.clockSub.resume(true);
  }

  /**
   * Resume lifecycle hook
   */
  protected onResume(): void {
    // Do nothing
  }

  /** Is called when the page button for the current page is pressed while already on that page. */
  public onPageButtonPressed(): void {
    // Do nothing
  }

  /**
   * Destroys the page and calls appropriate event handlers
   */
  public destroy(): void {
    this.isDirty = false;
    this.clockSub.destroy();

    for (const binding of this.bindings) {
      if (!binding.isAlive) {
        continue;
      }

      binding.destroy();
    }

    this.onDestroy();

    for (const extension of this.pageExtensions) {
      extension.onPageDestroyed?.();
    }
  }

  /**
   * Destroy lifecycle hook
   */
  protected onDestroy(): void {
    // Do nothing
  }

  /**
   * Invalidates the render and sets the component into the dirty state
   */
  public invalidate(): void {
    this.isDirty = true;
  }

  /**
   * Initial render function
   * @throws If a `PositionedFmcColumn` attempts to return an `FmcRenderTemplate` from its render function (only `string`s are allowed).
   */
  public initialRender(): void {
    if (!this.isInitialized) {
      return;
    }

    const templates = this.render();

    for (const extension of this.pageExtensions) {
      extension.onPageRendered?.(templates);
    }

    this.screen.currentSubpageCount.set(templates.length);

    const template = templates[this.screen.currentSubpageIndex.get() - 1];

    const render: FmcOutputTemplate = [];
    this.memorizedComponents.length = 0;

    for (let i = 0; i < template.length; i++) {
      if (!render[i]) {
        render[i] = [];
      }
      const row = template[i];
      const renderRow = render[i];

      for (let j = 0; j < row.length; j++) {
        const col = row[j];

        if (col instanceof FmcComponent) {
          if (!this.memorizedComponents[i]) {
            this.memorizedComponents[i] = [null, null, null];
          }
          this.memorizedComponents[i][j] = col;

          const componentRender = col.render();

          if (Array.isArray(componentRender)) {
            for (let k = 0; k < componentRender.length; k++) {
              const componentRenderRow = componentRender[k];

              for (let l = 0; l < componentRenderRow.length; l++) {
                if (!render[i + k]) {
                  render[i + k] = [];
                }

                if (!this.memorizedComponents[i + k]) {
                  this.memorizedComponents[i + k] = [null, null, null];
                }

                (componentRenderRow[l] !== '') && (render[i + k][j + l] = componentRenderRow[l] as string);
                (componentRenderRow[l] !== '') && (this.memorizedComponents[i + k][j] = col);
              }
            }
          } else if (componentRender !== '' || renderRow[j] === undefined) {
            renderRow[j] = componentRender as string;
          }
        } else if (typeof col === 'string' && col !== '' && renderRow[j] === undefined) {
          renderRow[j] = col;
        } else if (AbstractFmcPage.isPositionedFmcColumn(col)) {
          const content: string | FmcComponent = col[0];
          const text: FmcRenderTemplateRow[] | string = typeof content === 'string' ? content : content.render();

          if (typeof text !== 'string') {
            throw new Error('FmcPage: PositionedFmcColumns must return a string value.');
          }

          renderRow[j] = {
            text,
            columnIndex: col[1],
            alignment: col[2] ?? 'left',
          };
        }
      }
    }

    this.currentOutput = render as FmcOutputTemplate;

    this.renderCallback(this.currentOutput, template, 0);
  }

  /**
   * Accepts a page extension
   *
   * @param extension the page extension
   */
  public acceptPageExtension(extension: FmcPageExtension<this>): void {
    this.pageExtensions.push(extension);
  }

  /**
   * Tests whether an `FmcRenderTemplateColumn` is a `PositionedFmcColumn`.
   * @param column The `FmcRenderTemplateColumn` to test.
   * @returns Whether the column is a `PositionedFmcColumn`.
   */
  public static isPositionedFmcColumn(column: FmcRenderTemplateColumn): column is PositionedFmcColumn {
    if (!Array.isArray(column)) {
      return false;
    }

    const firstElementPasses: boolean = typeof column[0] === 'string' || column[0] instanceof FmcComponent;
    const secondElementPasses = typeof column[1] === 'number';
    const thirdElementPasses = typeof column[2] === 'string' || column[2] === undefined;

    if (typeof column[2] === 'string' && column[2] !== 'left' && column[2] !== 'right') {
      return false;
    }

    return firstElementPasses && secondElementPasses && thirdElementPasses;
  }

  /**
   * Tests whether the input is a `RenderedPositionedFmcColumn`.
   * @param column The input to test.
   * @returns Whether the column is a `RenderedPositionedFmcColumn`.
   */
  public static isRenderedPositionedFmcColumn(column: any): column is RenderedPositionedFmcColumn {
    return column !== undefined && typeof column !== 'string' && column.text !== undefined && column.columnIndex !== undefined;
  }

  public abstract render(): FmcRenderTemplate[];

  private currentOutput: FmcOutputTemplate = [];

  /**
   * Registers a subscription or a ConsumerSubject on the page. This enables the page to manage the lifecycle of all
   * subscriptions that are used within it, for example by pausing them whenever the page is out of view, or destroying
   * them when the page is destroyed.
   *
   * @param binding a subscription
   */
  public addBinding(binding: Subscription | ConsumerSubject<any>): void {
    this.bindings.push(binding);
  }

  /**
   * Handles a line select key received by the FMC, before passing it on to components
   *
   * @param event the LSK event
   * @returns a Promise that resolves to a boolean or string
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async handleLineSelectKey(event: LineSelectKeyEvent): Promise<boolean | string> {
    for (const extension of this.pageExtensions) {
      const processedByExtension = extension.onPageHandleSelectKey?.(event);

      if (processedByExtension) {
        return true;
      }
    }

    const componentAtSk = this.memorizedComponents[event.row]?.[event.col];

    if (componentAtSk) {
      const selectKeyHandled = await componentAtSk.handleSelectKey(event);

      if (selectKeyHandled !== false) {
        return selectKeyHandled;
      }
    }

    return await this.onHandleSelectKey(event);
  }

  /**
   * Handles a line select key received by the FMC, before passing it on to components
   *
   * @param event the LSK event
   * @returns a Promise that resolves to a boolean or string
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async onHandleSelectKey(event: LineSelectKeyEvent): Promise<boolean | string> {
    // Do nothing
    return false;
  }

  /**
   * Handles a scrolling event received by the FMC, before passing it on to components
   *
   * @param event the scrolling event
   * @returns a Promise that resolves to a boolean or string
   */
  public async handleScrolling(event: keyof FmcPagingEvents<this> & string): Promise<boolean | string> {
    for (const extension of this.pageExtensions) {
      const processedByExtension = extension.onPageHandleScrolling?.(event);

      if (processedByExtension) {
        return true;
      }
    }

    return this.onHandleScrolling(event);
  }

  /**
   * Handles a scrolling event received by the FMC, before passing it on to components
   *
   * @param event the scrolling event
   * @returns a Promise that resolves to a boolean or string
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async onHandleScrolling(event: keyof FmcPagingEvents<this> & string): Promise<boolean | string> {
    // Do nothing
    return false;
  }
}

/**
 * Constructor type for FMC pages
 */
export interface PageConstructor<T extends AbstractFmcPage<P>, P extends object | null = null> {
  new(...args: any[]): T;

  /** Lifecycle policy of this page class */
  lifecyclePolicy: FmcPageLifecyclePolicy;
}

/**
 * Utilities for the {@link PageConstructor} type
 */
export class PageConstructorUtils {
  /** Ctor */
  private constructor() {
  }

  /**
   * Returns whether a value is a `PageConstructor`
   *
   * @param input the value to test
   *
   * @returns whether the value conforms to the type
   */
  public static isPageConstructor(input: any): input is PageConstructor<any, any> {
    return !!input && typeof input === 'object' && 'lifecyclePolicy' in input;
  }
}

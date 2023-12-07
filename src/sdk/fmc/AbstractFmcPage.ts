import { Subscription } from '../sub';
import { FmcComponent } from './components';
import { FmcOutputTemplate, FmcRenderTemplate } from './FmcRenderer';
import { FmcScreen } from './FmcScreen';
import { ConsumerSubject, EventBus } from '../data';
import { ClockEvents } from '../instruments';
import { FmcPagingEvents, LineSelectKeyEvent } from './FmcInteractionEvents';

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
export abstract class AbstractFmcPage {
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

  public readonly params = new Map();

  protected clockConsumer;
  private isDirty = false;

  /**
   * Ctor
   * @param bus the event bus
   * @param screen the FMC screen instance
   */
  constructor(public readonly bus: EventBus, public readonly screen: FmcScreen<any, any>) {
    this.screen = screen;
    this.clockConsumer = this.bus.getSubscriber<ClockEvents>().on('realTime').atFrequency(10, false);
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
    this.onInit();

    this.addBinding(this.screen.currentSubpageIndex.sub(() => this.invalidate()));
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
      binding.pause();
    }
    this.isDirty = false;
    this.clockConsumer.off(this.clockHandler);

    this.onPause();
  }

  /**
   * Pause lifecycle hook
   */
  protected onPause(): void {
    // Do nothing
  }

  /**
   * Resumes the page and calls appropriate event handlers
   */
  public resume(): void {
    for (const binding of this.bindings) {
      binding.resume(true);
    }

    this.onResume();
    this.isDirty = true;
    this.clockConsumer.handle(this.clockHandler);
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
    this.clockConsumer.off(this.clockHandler);

    for (const binding of this.bindings) {
      binding.destroy();
    }

    this.onDestroy();
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
  invalidate(): void {
    this.isDirty = true;
  }

  /**
   * Initial render function
   */
  public initialRender(): void {
    if (!this.isInitialized) {
      return;
    }

    const templates = this.render();

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

                (componentRenderRow[l] !== '') && (render[i + k][l] = componentRenderRow[l] as string);
              }
            }
          } else if (componentRender !== '' || renderRow[j] === undefined) {
            renderRow[j] = componentRender as string;
          }
        } else if (col !== '' && renderRow[j] === undefined) {
          renderRow[j] = col;
        }
      }
    }

    this.currentOutput = render as FmcOutputTemplate;

    this.renderCallback(this.currentOutput, template, 0);
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
   * Handles a line select key recieved by the FMC, before passing it on to components
   *
   * @param event the LSK event
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async handleLineSelectKey(event: LineSelectKeyEvent): Promise<boolean | string> {
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
   * Handles a line select key recieved by the FMC, before passing it on to components
   *
   * @param event the LSK event
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async onHandleSelectKey(event: LineSelectKeyEvent): Promise<boolean | string> {
    // Do nothing
    return false;
  }

  /**
   * Handles a scrolling event recieved by the FMC, before passing it on to components
   *
   * @param event the scrolling event
   */
  public async handleScrolling(event: keyof FmcPagingEvents<this> & string): Promise<boolean | string> {
    return this.onHandleScrolling(event);
  }

  /**
   * Handles a scrolling event recieved by the FMC, before passing it on to components
   *
   * @param event the scrolling event
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
export interface PageConstructor<T> {
  new(...args: any[]): T;

  /** Lifecycle policy of this page class */
  lifecyclePolicy: FmcPageLifecyclePolicy;
}

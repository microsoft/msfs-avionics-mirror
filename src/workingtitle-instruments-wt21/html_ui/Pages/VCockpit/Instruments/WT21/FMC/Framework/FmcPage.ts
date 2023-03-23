import { ClockEvents, EventBus, MappedSubject, Subscription } from '@microsoft/msfs-sdk';

import { WT21Fms } from '../../Shared/FlightPlan/WT21Fms';
import { FmcPrevNextEvent, FmcSelectKeysEvent } from '../FmcEvent';
import { WT21_FMC_Instrument } from '../WT21_FMC_Instrument';
import { DisplayField } from './Components/DisplayField';
import { FmcComponent } from './Components/FmcComponent';
import { ScrollKeyHandler, SelectKeyHandler } from './EventHandlers';
import { Binding } from './FmcDataBinding';
import { Formatter } from './FmcFormats';
import { FmcPageManager } from './FmcPageManager';
import { FMC_LINE_COUNT, FmcOutputTemplate, FmcRenderTemplate } from './FmcRenderer';
import { FmcRouter } from './FmcRouter';

/**
 * A render callback type for `FmcPage`
 */
export type FmcPageRenderCallback = (output: FmcOutputTemplate, atRowIndex: number) => void;

/**
 * A type for an `FmcPage` constructor
 */
export type FmcPageConstructor = (new (renderCallback: FmcPageRenderCallback, pageManager: FmcPageManager,
  router: FmcRouter, eventBus: EventBus, instrument: WT21_FMC_Instrument) => FmcPage) & {

    /**
     * Configures the {@link FmcPageLifecyclePolicy} for this page
     */
    lifecyclePolicy: FmcPageLifecyclePolicy;

  }

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
 * base class of an FMC page
 */
export abstract class FmcPage implements SelectKeyHandler, ScrollKeyHandler {

  /**
   * Configures the {@link FmcPageLifecyclePolicy} for this page
   */
  public static lifecyclePolicy = FmcPageLifecyclePolicy.Singleton;

  protected readonly memorizedComponents: [FmcComponent | null, FmcComponent | null, FmcComponent | null][] = [];

  private readonly bindings: Subscription[] = [];

  protected clockConsumer;
  private isDirty = false;

  protected PagingSub = MappedSubject.create( // FIXME find a way to avoid this with `readonly`
    (inputs): [number, number] => [...inputs],
    this.router.currentSubpageIndex,
    this.router.currentSubpageCount,
  );

  protected readonly PagingFormat: Formatter<readonly [number, number]> = {
    nullValueString: '',

    /** @inheritDoc */
    format(value: [number, number]): string {
      return `${value[0]}/${value[1]}[blue] `;
    }
  };

  public readonly PagingIndicator = new DisplayField<[number, number]>(this, {
    formatter: this.PagingFormat
  });

  protected readonly fms: WT21Fms;

  /**
   * Construct an `FmcPage`
   *
   * @param renderCallback    a callback to fire whenever the page wants to render
   * @param pageManager       a `FmcPageManager`
   * @param router            an `FmcRouter`
   * @param eventBus          an `EventBus`
   * @param baseInstrument the base instrument
   */
  constructor(
    protected readonly renderCallback: FmcPageRenderCallback,
    protected readonly pageManager: FmcPageManager,
    protected readonly router: FmcRouter,
    protected readonly eventBus: EventBus,
    protected readonly baseInstrument: WT21_FMC_Instrument
  ) {
    this.fms = baseInstrument.fms;
    this.clockConsumer = this.eventBus.getSubscriber<ClockEvents>().on('realTime').atFrequency(10, false);
    this.PagingIndicator.bind(this.PagingSub);
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

    this.addBinding(new Binding(this.router.currentSubpageIndex, () => this.invalidate()));
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
   * Invalidates the page and queues the page for a rerender
   */
  public invalidate(): void {
    this.isDirty = true;
  }

  /**
   * Initial render function
   */
  public initialRender(): void {
    if (!this.isInitialized) {
      return;
    }

    // TODO initialize all controls

    const templates = this.render();

    this.router.currentSubpageCount.set(templates.length);

    const template = templates[this.router.currentSubpageIndex.get() - 1];

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

                render[i + k][l] = componentRenderRow[l] as string;
              }
            }
          } else {
            renderRow[row.indexOf(col)] = componentRender as string;
          }
        } else {
          renderRow[j] = col;
        }
      }
    }

    this.currentOutput = render as FmcOutputTemplate;

    this.renderCallback(this.currentOutput, 0);
  }

  public abstract render(): FmcRenderTemplate[]

  private currentOutput: FmcOutputTemplate = [];

  /**
   * Edits part of the current output
   *
   * @param template the template to insert
   * @param rowIndex the row index to insert at
   *
   * @throws if `rowIndex` is too high
   */
  public drawOnOutput(template: FmcOutputTemplate, rowIndex: number): void {
    const rowsAvailable = (FMC_LINE_COUNT - 1) - rowIndex;

    if (rowsAvailable <= 0 || rowsAvailable < template.length) {
      throw new Error(`[FmcPage](drawOnOutput) Tried to write ${template.length - rowsAvailable} too many rows.`);
    }

    for (let i = rowIndex, c = 0; i < rowIndex + rowsAvailable; i++, c++) {
      this.currentOutput[i] = template[c];
    }

    this.render();
  }

  /**
   * Registers a binding on the page
   *
   * @param binding a {@link Binding}
   */
  public addBinding(binding: Subscription | Binding<any>): void {
    this.bindings.push(binding);
  }

  /**
   * Dispatches a select key event to either the page instance or a component
   *
   * @param event                 an `FmcSelectKeysEvent`
   * @param scratchpadContents    the scratchpad contents when the LSK/RSK was pressed
   * @param isDelete              whether the scratchpad was in DELETE mode
   *
   * @returns a `Promise<boolean>` that must be resolved when the entry is valid, or rejected with an error message to display otherwise
   */
  public async dispatchSelectKeyEvent(event: FmcSelectKeysEvent, scratchpadContents: string, isDelete: boolean): Promise<boolean | string> {
    const row = parseInt(event[4]) * 2;
    const col = event.startsWith('L') ? 0 : 1;
    const componentAtSk = this.memorizedComponents[row]?.[col];

    if (componentAtSk) {
      const selectKeyHandled = await componentAtSk.handleSelectKey(event, scratchpadContents, isDelete);
      if (selectKeyHandled !== false) {
        return selectKeyHandled;
      }
    }

    const handledByPage = await this.handleSelectKey(event, scratchpadContents, isDelete);

    if (!handledByPage) {
      return Promise.reject('KEY NOT ACTIVE');
    }

    return handledByPage;
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public handleSelectKey(event: FmcSelectKeysEvent, scratchpadContents: string, isDelete: boolean): Promise<boolean | string> {
    return Promise.resolve(false);
  }

  /**
   * Dispatches a scroll key event to either the page instance or a component
   *
   * @param event an `FmcSelectKeysEvent`
   *
   * @returns boolean
   */
  public dispatchScrollKeyEvent(event: FmcPrevNextEvent): boolean {
    let component: FmcComponent | null = null;
    for (const row of this.memorizedComponents) {
      if (!row) {
        continue;
      }

      for (const col of row) {
        if (col) {
          component = col;
        }
      }
    }

    let componentDidHandleEvent = false;
    if (component) {
      componentDidHandleEvent = component.handleScrollKey(event);
    }

    if (!componentDidHandleEvent) {
      return this.handleScrollKey(event);
    } else {
      return true;
    }
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public handleScrollKey(event: FmcPrevNextEvent): boolean {
    let subpageChanged;
    if (event === FmcPrevNextEvent.BTN_PREV) {
      subpageChanged = this.router.prevSubpage();
    } else {
      subpageChanged = this.router.nextSubpage();
    }

    return subpageChanged;
  }

  /**
   * Opens the specified route
   *
   * @param routeString The Route Subject String
   * @param params the new params
   */
  public setActiveRoute(routeString: string, params?: Record<string, unknown>): void {
    this.router.navigateTo(routeString, params);
  }

  /**
   * Sets an error message on the scratchpad.
   * @param error The Error Message
   */
  public showScratchpadError(error: string): void {
    this.pageManager.showScratchpadError(error);
  }

  /**
   * Clears the scratchpad
   */
  public clearScratchpad(): void {
    this.pageManager.clearScratchpad();
  }

}

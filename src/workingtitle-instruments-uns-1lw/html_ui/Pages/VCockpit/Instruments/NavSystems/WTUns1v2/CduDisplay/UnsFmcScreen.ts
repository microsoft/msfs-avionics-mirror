import {
  AbstractFmcPage, DisplayComponent, EventBus, Facility, FacilitySearchType, FmcComponent, FmcOutputTemplate, FmcRenderTemplate, FmcRenderTemplateRow,
  FmcScratchpad, FmcScreen, FSComponent, GeoPointInterface, ICAO, LegDefinition, NodeReference, PageConstructor, PositionedFmcColumn, SearchTypeMap,
  SimpleFmcRenderer, SimVarValueType, VNode
} from '@microsoft/msfs-sdk';

import { UnsFmsConfigInterface } from '../Config/FmsConfigBuilder';
import { UnsNearestContextEvents } from '../Fms/Navigation/UnsNearestContext';
import { UnsFms } from '../Fms/UnsFms';
import { UnsFocusableField } from './Components/UnsFocusableField';
import { UnsTextInputField } from './Components/UnsTextInputField';
import { NormalListSearchType, UnsListPageInput, UnsNormalListPage } from './Pages/UnsNormalListPage';
import { UnsSelfTestPage } from './Pages/UnsSelfTestPage';
import { UnsWaypointIdentPage } from './Pages/UnsWaypointIdentPage';
import { UnsFmcEvents } from './UnsFmcEvents';
import { FmcDialogPageResult, UnsFmcDialogPage, UnsFmcPage } from './UnsFmcPage';
import { UnsFmcPageFactory } from './UnsFmcPageFactory';

const UNS_CDU_CELL_WIDTH = 24;
const UNS_CDU_CELL_HEIGHT = 11;

/**
 * UNS CDU screen
 */
export class UnsFmcScreen extends FmcScreen<UnsFmcPage, UnsFmcEvents> {
  public currentCursorPosition: UnsFocusableField<any> | null = null;
  private currentBrightness = 1;

  private previousRouteInfo = {
    initialRoute: '',
    pageCount: 0,
    initialPage: 0,
  };

  private previouslyRenderedCduPageOverlay: VNode | null = null;

  private isRenderPending = false;

  /**
   * Ctor
   * @param bus the event bus
   * @param fms the fms
   * @param cduPageOverlayContainerRef a ref to the cdu page overlay container element
   * @param fmsConfig the fms config
   * @param fmsConfigErrors A map with config name keys and boolean values indicating whether a parsing error was encountered.
   * @param renderTarget the element to render the screen to
   */
  constructor(
    protected readonly bus: EventBus,
    private readonly fms: UnsFms,
    public readonly cduPageOverlayContainerRef: NodeReference<HTMLElement>,
    private readonly fmsConfig: UnsFmsConfigInterface,
    fmsConfigErrors: ReadonlyMap<string, boolean>,
    renderTarget: HTMLDivElement,
  ) {
    super(
      bus,
      new UnsFmcPageFactory(
        fms,
        fmsConfig,
        fmsConfigErrors,
      ),
      { screenDimensions: { cellWidth: UNS_CDU_CELL_WIDTH, cellHeight: UNS_CDU_CELL_HEIGHT }, enableScratchpad: false },
      new SimpleFmcRenderer(
        bus,
        renderTarget,
        { screenCellWidth: UNS_CDU_CELL_WIDTH, screenCellHeight: UNS_CDU_CELL_HEIGHT, screenPXWidth: (630 * 1), screenPXHeight: 400 },
      ),
      new FmcScratchpad(bus, { cellWidth: UNS_CDU_CELL_WIDTH }, () => {}),
    );

    this.setupEvents();
  }

  /**
   * Set sup event listeners for this screen
   */
  private setupEvents(): void {
    this.onPrefixedEvent('scratchpad_type').handle((s) => this.handleTyping(s));
    this.onPrefixedEvent('scratchpad_back').handle(() => this.handleBack());
    this.onPrefixedEvent('scratchpad_enter').handle(() => this.handleEnter());
    this.onPrefixedEvent('scratchpad_plus_minus').handle(() => this.handlePlusMinus());
    this.onPrefixedEvent('menu').handle(() => this.handleMenu());
  }

  /**
   * Handles text being typed on the keyboard
   *
   * @param typed the text that was typed
   */
  private async handleTyping(typed: string): Promise<void> {
    if (this.currentCursorPosition && this.currentCursorPosition instanceof UnsTextInputField) {
      const text = this.currentCursorPosition.typedText.get();

      const handledByField: string | boolean = await this.currentCursorPosition.handleTyping(typed, text);

      if (handledByField === true) {
        return;
      } else if (typeof handledByField === 'string') {
        typed = handledByField;
      }

      const maxInputCharacterCountProp = this.currentCursorPosition.options.maxInputCharacterCount;

      let maxCharacterCount;
      switch (typeof maxInputCharacterCountProp) {
        case 'function': maxCharacterCount = maxInputCharacterCountProp(); break;
        case 'object': maxCharacterCount = maxInputCharacterCountProp.get(); break;
        case 'number': maxCharacterCount = maxInputCharacterCountProp; break;
      }

      if ((text.length + typed.length) <= maxCharacterCount) {
        this.currentCursorPosition.typedText.set(text + typed);
      }
    }
  }

  /**
   * Handles a BACK key being received by the screen
   */
  private async handleBack(): Promise<void> {
    // TODO we need to verify what happens IRL here

    if (this.currentCursorPosition) {
      const handledByField = await this.currentCursorPosition.handleBack();

      if (handledByField) {
        return;
      } else if (this.currentCursorPosition instanceof UnsTextInputField) {
        const text = this.currentCursorPosition.typedText.get();

        if (text.length !== 0) {
          this.currentCursorPosition.typedText.set(text.substring(0, text.length - 1));
        }
      }
    }
  }

  /**
   * Handles an ENTER key received by the screen before passing it on to pages
   */
  private async handleEnter(): Promise<void> {
    if (this.currentCursorPosition) {
      let skipEnterHandler = false;

      if (this.currentCursorPosition instanceof UnsTextInputField) {
        const typedText = this.currentCursorPosition.typedText.get();
        if (typedText.length !== 0 || this.currentCursorPosition.options.acceptEmptyInput) {
          const cursorPositionBeforeInput = this.currentCursorPosition;

          const textInputResult = await this.currentCursorPosition.takeTextInput(typedText);

          if (cursorPositionBeforeInput !== this.currentCursorPosition && (this.currentCursorPosition === null || !this.currentCursorPosition.options.takeCursorControl)) {
            // Since pages can navigate to pages while parsing input (for example, showing duplicate facilities), we make sure that the
            // current cursor position is consistent to what it was before we navigated away from the page
            this.currentCursorPosition = cursorPositionBeforeInput;
          }

          // If `takeTextInput` caused something to be modified, we don't want to run `handleEnter` on the field
          if (textInputResult === true) {
            skipEnterHandler = true;
          }
        }
      }

      const pageCursorPath = this.currentlyDisplayedPage?.cursorPath;

      if (!pageCursorPath || this.currentCursorPosition.options.takeCursorControl === true) {
        await this.currentCursorPosition.handleEnter();
        return;
      }

      const nextFieldToSelect = pageCursorPath.rules.get(this.currentCursorPosition);

      let cursorIsInFinalPosition = false;
      if (!nextFieldToSelect) {
        const finalCursorPosition: UnsFocusableField<any> | undefined = Array.from(pageCursorPath.rules)[pageCursorPath.rules.size - 1]?.[1];

        cursorIsInFinalPosition = (finalCursorPosition && this.currentCursorPosition === finalCursorPosition)
          || (pageCursorPath.rules.size === 0 && this.currentCursorPosition === pageCursorPath.initialPosition);
      }

      if (nextFieldToSelect === this.currentCursorPosition && !skipEnterHandler) {
        const handledByField = await this.currentCursorPosition.handleEnter();

        if (handledByField) {
          return;
        }
      } else if (nextFieldToSelect) {
        this.tryFocusField(nextFieldToSelect);
        return;
      } else if (cursorIsInFinalPosition) {
        this.interruptCursorPath();
      }
    }

    this.currentlyDisplayedPage?.handleEnterPressed();
  }

  /**
   * Handles a +/- key recieved by the screen before passing it on to pages
   */
  private async handlePlusMinus(): Promise<void> {
    if (this.currentCursorPosition) {
      const handledByField = await this.currentCursorPosition.handlePlusMinus();

      if (handledByField) {
        return;
      }
    }

    this.currentlyDisplayedPage?.handlePlusMinusPressed();
  }

  /**
   * Handles a MENU key received by the screen before passing it on to pages
   */
  private async handleMenu(): Promise<void> {
    this.currentlyDisplayedPage?.handleMenuPressed();
  }

  /**
   * Handles a LIST key received by the screen before passing it on to pages
   */
  public async handleList(): Promise<void> {
    if (this.currentCursorPosition) {
      const handledByField = await this.currentCursorPosition.handleList();

      if (handledByField) {
        return;
      }
    }

    this.currentlyDisplayedPage?.handleListPressed();
  }

  /**
   * Handles a PWR DIM key received by the screen
   */
  public async handlePowerDim(): Promise<void> {
    if (this.currentlyDisplayedPage) {
      this.currentlyDisplayedPage.powerDimOverlayDisplayed = !this.currentlyDisplayedPage.powerDimOverlayDisplayed;
      this.currentlyDisplayedPage.invalidate();
    }
  }

  /**
   * Requests a {@link UnsTextInputField} to be focused
   *
   * @param field the field to focus
   */
  public async tryFocusField(field: UnsFocusableField<any> | null): Promise<void> {
    if (this.currentCursorPosition && this.currentCursorPosition !== field) {
      const preventFocusLoss = await this.currentCursorPosition.handleLoseFocus();
      if (preventFocusLoss) {
        return;
      }

      this.currentCursorPosition.isHighlighted.set(false);
      if (this.currentCursorPosition instanceof UnsTextInputField) {
        this.currentCursorPosition.typedText.set('');
      }
    }

    this.currentCursorPosition = field;
    field && field.isHighlighted.set(true);
    if (field instanceof UnsTextInputField) {
      field && field.typedText.set('');
    }
  }

  /**
   * Increments the display brightness
   */
  public incrementBrightness(): void {
    this.setBrightness(this.currentBrightness + 0.08);
  }

  /**
   * Increments the display brightness
   */
  public decrementBrightness(): void {
    this.setBrightness(this.currentBrightness - 0.08);
  }

  /**
   * Sets the display brightness
   * @param brightness Value of brightness to set
   */
  public setBrightness(brightness: number): void {
    this.currentBrightness = Math.min(1, Math.max(0.05, brightness));
    SimVar.SetSimVarValue(`L:WTUns1_${this.fmsConfig.index}_ScreenLuminosity`, SimVarValueType.Number, this.currentBrightness);
  }

  /**
   * Toggles a field being focused or not
   *
   * @param field the field to focus
   *
   * @returns the new highlight state of the field
   */
  public toggleFieldFocused(field: UnsFocusableField<any>): boolean {
    if (field.isHighlighted.get()) {
      this.tryFocusField(null);
      return false;
    } else {
      this.tryFocusField(field);
      return true;
    }
  }

  /**
   * Interrupts the cursor path, while un-highlighting the currently selected component
   */
  public async interruptCursorPath(): Promise<void> {
    if (this.currentCursorPosition) {
      const preventFocusLoss = await this.currentCursorPosition.handleLoseFocus();
      if (preventFocusLoss) {
        return;
      }

      this.currentCursorPosition.isHighlighted.set(false);
      if (this.currentCursorPosition instanceof UnsTextInputField) {
        this.currentCursorPosition.typedText.set('');
      }
    }

    this.currentCursorPosition = null;
  }

  /** @inheritDoc */
  protected acceptPageOutput(output: FmcOutputTemplate, template: FmcRenderTemplate, atRowIndex: number): void {
    if (this.isRenderPending) {
      return;
    }

    const page = this.currentlyDisplayedPage;

    if (!page) {
      return;
    }

    const doShowOverlay = page.showOverlay.get() || this.currentlyDisplayedPage?.powerDimOverlayDisplayed;

    if (doShowOverlay) {
      const overlayRender = this.currentlyDisplayedPage?.powerDimOverlayDisplayed ? page.renderPowerOverlay() : page.renderOverlay();

      for (let i = 0; i < overlayRender.length; i++) {
        const row = overlayRender[i];

        for (let j = 0; j < row.length; j++) {
          const col = row[j];

          if (col === '') {
            continue;
          }

          const colRender: FmcRenderTemplateRow[] | PositionedFmcColumn | string = col instanceof FmcComponent ? col.render() : col;

          if (col instanceof FmcComponent) {
            (page.memorizedComponents[i] ??= [null, null, null])[j] = col;
          }

          if (typeof colRender !== 'string') {
            throw new Error('Components rendered in overlays can only render strings');
          }

          output[i][j] = colRender;
        }
      }
    }

    super.acceptPageOutput(output, template, atRowIndex);
  }

  /**
   * Opens a UnsFmcDialogPage to retrieve a result. Types `Input` and `Output`
   * must match the generic arguments for the passed `DialogPage` type.
   * @param page The dialog page to be invoked (needed in order to infer the input/output types).
   * @param route The route of the page to be navigated to.
   * @param input The input value that will be passed to the page's {@link FmcDialogPage.request} method.
   * @param params An optional set of params to pass to the navigation command. Necessary when the page also
   * functions as a non-dialog and must receive its input through other means than {@link FmcDialogPage.request}.
   * @param dontInterruptCursor Whether or not to interrupt the cursor when navigating to the new dialog page
   * @returns A promise with a dialog page result which may either be cancelled or contain a payload.
   * @throws If attempting to open a dialog on a non-dialog page.
   */
  private async requestDialog<DialogPage extends UnsFmcDialogPage<Input, Output>, Input, Output>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    page: new (...args: any[]) => DialogPage, route: string, input: Input, params?: Record<string, unknown>, dontInterruptCursor?: boolean,
  ): Promise<FmcDialogPageResult<Output>> {
    this.navigateTo(route, params, dontInterruptCursor);

    if (this.currentlyDisplayedPage instanceof UnsFmcDialogPage) {
      return await this.currentlyDisplayedPage.request(input);
    } else {
      throw new Error('Attempting to request a dialog from a non-dialog page.');
    }
  }

  /**
   * Invokes the Normal (waypoint) LIST page.
   * @param searchType The type of normal list page to show.
   * @param referenceLeg The selected leg, or null.
   * @returns A selection from a list, or null if the dialog was cancelled or otherwise exited.
   */
  public async invokeNormalListPage(searchType: NormalListSearchType, referenceLeg?: LegDefinition): Promise<Facility | null> {
    try {
      const facilityIcao = referenceLeg?.leg.fixIcao;
      const facility = facilityIcao ? await this.fms.facLoader.getFacility(ICAO.getFacilityType(facilityIcao), facilityIcao) : undefined;
      this.bus.getPublisher<UnsNearestContextEvents>().pub('uns_search_reference_position', facility);
      const result = await this.requestDialog<UnsNormalListPage, UnsListPageInput, Facility | null>(
        UnsNormalListPage,
        '/normal-list',
        { searchType, referenceLeg },
        undefined,
        true,
      );

      if (!result.wasCancelled) {
        this.navigateBackShallow();

        return result.payload;
      } else {
        return null;
      }

    } catch (err) {
      return null;
    }
  }

  /**
   * Invokes one or a series of Waypoint Identification pages for selecting a waypoint.
   * @param ident The ident to search.
   * @param referencePos The reference position to use to sort multiple matching facilities.
   * Facilities are sorted in order of increasing distance from the reference position.
   * @param filter The FacilitySearchType to include.
   * @param pickClosest Whether to automatically return the closest facility in case multiple search results are found.
   * Otherwise, the Waypoint Identification page is used.
   * @returns The facility or `null`.
   */
  public async searchFacilityByIdent<
    T extends (Exclude<FacilitySearchType, FacilitySearchType.Boundary>) = FacilitySearchType.All,
    U = SearchTypeMap[T],
  >(
    ident: string,
    referencePos: GeoPointInterface,
    filter?: T,
    pickClosest?: false,
  ): Promise<U | null> {
    const facilityIcaos: string[] = (await this.fms.facLoader.searchByIdent(filter ?? FacilitySearchType.All, ident))
      // Since searchByIdent returns fuzzy matches, we remove stuff that isn't exactly the ident we want
      .filter((it) => ICAO.getIdent(it) === ident);

    if (!facilityIcaos.length) {
      return null;
    }

    const facilities: Facility[] = [];
    await Promise.all(facilityIcaos.map(async (it) => {
      const facility = await this.fms.facLoader.getFacility(ICAO.getFacilityType(it), it);
      facility && facilities.push(facility);
    }));

    if (facilities.length > 0) {
      facilities.sort((a, b) => referencePos.distance(a) - referencePos.distance(b));

      if (pickClosest) {
        return facilities[0] as unknown as U;
      }

      try {
        const result: FmcDialogPageResult<Facility> = await this.requestDialog(
          UnsWaypointIdentPage,
          '/waypoint-ident',
          ident,
          { facilities },
        );

        if (!result.wasCancelled) {
          this.navigateBackShallow();

          return result.payload as unknown as U;
        } else {
          return null;
        }

      } catch (err) {
        return null;
      }
    } else {
      // TODO Navigate to DEFINE WPT page

      return null;
    }
  }

  /** @inheritDoc */
  public navigateTo(
      route: string,
      params?: Record<string, unknown>,
      dontInterruptCursor?: boolean,
  ): void;
  /** @inheritDoc */
  public navigateTo<U extends PageConstructor<UnsFmcPage>>(
      pageClass: U,
      props: U extends PageConstructor<AbstractFmcPage<infer V>, infer V> ? V : never,
      dontInterruptCursor?: boolean,
  ): void;
  /** @inheritDoc */
  public navigateTo<U extends PageConstructor<UnsFmcPage>>(
      arg0: string | U,
      arg1?: Record<string, unknown> | U extends PageConstructor<AbstractFmcPage<infer V>, infer V> ? V : never,
      dontInterruptCursor?: boolean
  ): void {
    if (this.currentlyDisplayedPage instanceof UnsSelfTestPage
        && (!!arg1 && typeof arg1 === 'object' && 'bypassSelfTestLock' in arg1 && !arg1?.['bypassSelfTestLock'])
    ) {
      return;
    }

    this.previousRouteInfo = {
      initialRoute: this.currentRoute.get(),
      pageCount: this.currentSubpageCount.get(),
      initialPage: this.currentSubpageIndex.get(),
    };

    !dontInterruptCursor && this.interruptCursorPath();

    super.navigateTo(arg0 as any, arg1 as any);
  }

  /** Returns to the previous page. Can only go back ONE step. */
  public navigateBackShallow(): void {
    const { initialRoute, pageCount, initialPage } = this.previousRouteInfo;

    if (pageCount > 1) {
      this.navigateTo(`${initialRoute.split('#')[0]}#${initialPage}`);
    } else {
      this.navigateTo(initialRoute);
    }
  }

  /**
   * Renders a page's JSX overlay, and destroys whatever overlay was previously rendered (if applicable)
   *
   * @param node the VNode produced by the page as an overlay
   */
  public renderPageJsxOverlay(node: VNode): void {
    if (this.previouslyRenderedCduPageOverlay) {
      if (this.previouslyRenderedCduPageOverlay.instance instanceof DisplayComponent) {
        this.previouslyRenderedCduPageOverlay.instance.destroy();
      }
      this.cduPageOverlayContainerRef.instance.innerHTML = '';
    }

    this.previouslyRenderedCduPageOverlay = node;

    FSComponent.render(node, this.cduPageOverlayContainerRef.instance);
  }
}

import {
  AbstractFmcPage, DisplayField, EventBus, FmcRenderCallback, FmcRenderTemplate, FSComponent, MappedSubject, MutableSubscribable, Subject, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { UnsFmsConfigInterface } from '../Config/FmsConfigBuilder';
import { UnsFms } from '../Fms/UnsFms';
import { UnsPowerEvents } from '../WTUns1FsInstrument';
import { UnsFocusableField } from './Components/UnsFocusableField';
import { UnsChars } from './UnsCduDisplay';
import { UnsFmcScreen } from './UnsFmcScreen';

/**
 * UNS CDU page
 */
export class UnsFmcPage extends AbstractFmcPage {
  private readonly powerPublisher = this.bus.getPublisher<UnsPowerEvents>();
  public cursorPath: UnsCduCursorPath | null = null;

  public showOverlay = Subject.create(false);

  /**
   * Ctor
   *
   * @param bus the event bus
   * @param screen the FMC screen instance
   * @param fms the fms to use
   * @param fmsConfig the fms config
   * @param fmsConfigErrors A map with config name keys and boolean values indicating whether a parsing error was encountered.
   * @param renderCallback the render callback
   */
  constructor(
    public readonly bus: EventBus,
    public readonly screen: UnsFmcScreen,
    public readonly fms: UnsFms,
    public readonly fmsConfig: UnsFmsConfigInterface,
    public readonly fmsConfigErrors: ReadonlyMap<string, boolean>,
    public readonly renderCallback: FmcRenderCallback,
  ) {
    super(bus, screen, null);
  }

  protected pageTitle = 'NO TITLE';

  protected doShowSubpage = true;

  protected displayedSubPagePadding = 0;

  protected displayedSubPageIndex = Subject.create<number>(1);
  protected displayedSubPageIndexPipe: Subscription | undefined;

  protected displayedSubPageCount = Subject.create<number>(1);
  protected displayedSubPageCountPipe: Subscription | undefined;

  protected menuRoute: MutableSubscribable<string | null> = Subject.create(null);

  public powerDimOverlayDisplayed = false;

  protected readonly TitleField = new DisplayField<readonly [boolean, number, number, string | null, boolean]>(this, {
    formatter: ([pposAccepted, subPageIndex, subPageCount, menuRoute, hasMessage]) => {
      const posMessage = pposAccepted ? '    ' : ' POS';
      const pageIndicatorString = this.doShowSubpage
        ? `${subPageIndex.toString().padStart(Math.max(2, this.displayedSubPagePadding), ' ')}/${subPageCount.toString().padStart(this.displayedSubPagePadding, ' ')}`
        : '';
      const pageString = `${this.pageTitle}${pageIndicatorString}`.padEnd(13, ' ');
      const menuString = menuRoute !== null ? UnsChars.BoxedM : ' ';
      const messageString = hasMessage ? 'MSG' : '   ';

      return `${posMessage}[amber d-text] ${pageString}[cyan d-text] ${menuString}[white d-text]${messageString}[amber slow-flash d-text]`;
    },
  }).bind(MappedSubject.create(this.fms.pposAccepted, this.displayedSubPageIndex, this.displayedSubPageCount, this.menuRoute, this.fms.messages.messageAlert));

  /** @inheritDoc */
  public override init(): void {
    this.addBinding(this.displayedSubPageIndexPipe = this.screen.currentSubpageIndex.pipe(this.displayedSubPageIndex));
    this.addBinding(this.displayedSubPageCountPipe = this.screen.currentSubpageCount.pipe(this.displayedSubPageCount));
    this.addBinding(this.showOverlay.sub(() => this.invalidate()));

    // We run the base class' init() after, because we want page class onInit() to be able to destroy the pipes above if needed
    super.init();
  }

  /** @inheritDoc */
  public override pause(): void {
    super.pause();

    this.powerDimOverlayDisplayed = false;
  }

  /** @inheritDoc */
  public override resume(): void {
    super.resume();

    this.screen.renderPageJsxOverlay(this.renderJsxOverlay());

    let initialPosition;
    if (typeof this.cursorPath?.initialPosition === 'function') {
      initialPosition = this.cursorPath.initialPosition();
    } else if (this.cursorPath !== null) {
      initialPosition = this.cursorPath.initialPosition;
    }

    if (initialPosition) {
      this.screen.tryFocusField(initialPosition);
    }
  }

  /**
   * Handles an ENTER key received by the screen, before passing it on to components
   * @returns whether the key was handled or not
   */
  public async handleEnterPressed(): Promise<boolean> {
    return await this.onHandleEnterPressed();
  }

  /**
   * Handles an ENTER key received by the page, before passing it on to components
   *
   * @returns whether the key was handled or not
   */
  protected async onHandleEnterPressed(): Promise<boolean> {
    return false;
  }

  /**
   * Handles a MENU key received by the page, before passing it on to components
   *
   * @returns whether the key was handled or not
   */
  public async handleMenuPressed(): Promise<boolean> {
    const menuRoute = this.menuRoute.get();

    if (!menuRoute) {
      return false;
    }

    this.screen.navigateTo(menuRoute);
    return true;
  }

  /**
   * Handles a +/- key recieved by the screen, before passing it on to components
   * @returns whether the key was handled or not
   */
  public async handlePlusMinusPressed(): Promise<boolean> {
    return await this.onHandlePlusMinusPressed();
  }

  /**
   * Handles a +/- key recieved by the page
   *
   * @returns whether the key was handled or not
   */
  protected async onHandlePlusMinusPressed(): Promise<boolean> {
    return false;
  }

  /**
   * Handles a LIST key received by the page, before passing it on to components
   *
   * @returns whether the key was handled or not
   */
  public async handleListPressed(): Promise<boolean> {
    return this.onHandleListPressed();
  }

  /**
   * Handles a LIST key received by the page, before passing it on to components
   *
   * @returns whether the key was handled or not
   */
  protected async onHandleListPressed(): Promise<boolean> {
    return false;
  }

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    return [];
  }

  /**
   * Renders the overlay for this page. Rendered when {@link showOverlay} is `true`.
   *
   * Any column in the rendering which isn't equal to an empty string replaces (or adds) the corresponding
   * column in the main page rendering.
   *
   * Note that for the moment, it isn't possible to render a nested {@link FmcRenderTemplate} from a component returned in this template.
   *
   * @returns a render template
   */
  renderOverlay(): FmcRenderTemplate {
    return [];
  }

  /**
   * Renders the JSX overlay for the page
   *
   * @returns a VNode
   */
  renderJsxOverlay(): VNode {
    return FSComponent.buildComponent(FSComponent.Fragment, null) as VNode;
  }

  private PowerOffField = new DisplayField(this, {
    formatter: (): string => ' [line-tb]     [white]OFF→',
    onSelected: async () => {
      this.powerPublisher.pub('set_uns_power', false);
      this.powerDimOverlayDisplayed = false;
      this.invalidate();
      return true;
    },
  });

  private CancelPowerOverlayField = new DisplayField(this, {
    formatter: (): string => ' [line-tb]  CANCEL→',
    onSelected: async () => {
      this.powerDimOverlayDisplayed = false;
      this.invalidate();
      return true;
    },
  });

  private BrightnessField = new DisplayField(this, {
    formatter: (): string => ' [line-tb]  BRIGHT→',
    onSelected: async () => {
      this.screen.incrementBrightness();
      return true;
    },
  });

  private DimField = new DisplayField(this, {
    formatter: (): string => ' [line-tb]     DIM→',
    onSelected: async () => {
      this.screen.decrementBrightness();
      return true;
    },
  });

  /**
   * Renders the overlay displayed when the power dim key is selected.
   *
   * Any column in the rendering which isn't equal to an empty string replaces (or adds) the corresponding
   * column in the main page rendering.
   *
   * Note that for the moment, it isn't possible to render a nested {@link FmcRenderTemplate} from a component returned in this template.
   *
   * @returns a render template
   */
  renderPowerOverlay(): FmcRenderTemplate {
    return [
      [''],
      ['', ' [line-tb-rl]         [line-rl]'],
      ['', this.BrightnessField],
      ['', ' [line-tb]         '],
      ['', this.DimField],
      ['', ' [line-tb]         '],
      ['', this.CancelPowerOverlayField],
      ['', ' [line-tb]         '],
      ['', ' [line-tb] DISPLAY→[disabled]'],
      ['', ' [line-tb]         '],
      ['', this.PowerOffField],
    ];
  }
}

/**
 * UNS-1 CDU cursor path.
 *
 * @property initialPosition - Specifies which component the cursor should start on when the page is opened
 * @property rules - a list of cursor rules that apply - in the form of a map of from->to tuples
 *
 * When `ENTER` is pressed on a page, and the cursor must move, the component the cursor is currently on is looked up in the rules map,
 * and the component associated with it is chosen as the next position of the cursor.
 *
 * If the rule for a given component specifies the same field as the destination, the {@link UnsTextInputField.handleEnter} method is called
 * on the component.
 */
export interface UnsCduCursorPath {

  /**
   * The initial position of the cursor
   */
  initialPosition: (UnsFocusableField<any> | null) | (() => UnsFocusableField<any> | null),

  /**
   * The rules for which the cursor to follow on ENTER
   */
  rules: Map<UnsFocusableField<any>, UnsFocusableField<any>>
}

/** The object returned, possibly with payload of type `O`, when the dialog resolves. */
export interface FmcDialogPageResultOkay<O> {
  /** Whether the request was cancelled */
  wasCancelled: false,
  /** The payload */
  payload: O,
}

/** The object returned when the dialog rejects or cancels. */
export interface FmcDialogPageResultCancelled {
  /** Whether the request was cancelled */
  wasCancelled: true,
}

/** Result type for {@link FmcDialogPage.request}, with payload type `O`. */
export type FmcDialogPageResult<O> = FmcDialogPageResultOkay<O> | FmcDialogPageResultCancelled

/** Interface for FMC pages which act as dialogs. Accepts types for input and output. */
export interface FmcDialogPage<I, O> {
  /**
   * Requests data from this page, returned in the form of a promise.
   *
   * @param input The input data to provide.
   *
   * @returns A promise of a dialog page result with payload of type `O`.
   */
  request(input: I): Promise<FmcDialogPageResult<O>>;
}

/** Interface for FMC pages which act as dialogs. Accepts types for input and output. */
export abstract class UnsFmcDialogPage<I, O> extends UnsFmcPage implements FmcDialogPage<I, O>{
  protected readonly isActingAsDialog = Subject.create(false);

  protected promise: Promise<FmcDialogPageResult<O>> | undefined;

  protected resolve: ((value: FmcDialogPageResult<O>) => void) | undefined;

  protected reject: ((value: FmcDialogPageResultCancelled) => void) | undefined;

  /**
   * Requests data from this page, returned in the form of a promise.
   * To access the input value, override this method, **ensuring that you call super within it**.
   * @param input The input.
   * @returns An okay or cancelled page result.
   * */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public request(input: I): Promise<FmcDialogPageResult<O>> {
    const promise: Promise<FmcDialogPageResult<O>> = new Promise((resolve, reject): void => {
      this.resolve = resolve;
      this.reject = reject;
    });

    this.promise = promise;

    this.isActingAsDialog.set(true);

    return promise;
  }

  /** @inheritDoc */
  override onPause(): void {
    super.onPause();

    if (this.resolve) {
      // Resolve the promise with a cancelled value if the page is navigated away from without resolution.
      this.resolve({ wasCancelled: true });
    }

    this.promise = undefined;
    this.resolve = undefined;
    this.reject = undefined;

    this.isActingAsDialog.set(false);
  }
}

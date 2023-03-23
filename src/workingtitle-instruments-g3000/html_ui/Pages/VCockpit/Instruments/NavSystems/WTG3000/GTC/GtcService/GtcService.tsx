/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ArrayUtils, ComponentProps, ConsumerSubject, DebounceTimer, DisplayComponent, EventBus, FSComponent, HEvent, NodeReference, ObjectSubject, SetSubject,
  Subject, Subscribable, Subscription, UserSetting, VNode
} from '@microsoft/msfs-sdk';

import {
  ComRadio, ControllableDisplayPaneIndex, DisplayPaneControlEvents, DisplayPaneControlGtcIndex, DisplayPaneEvents, DisplayPaneIndex,
  DisplayPanesAliasedUserSettingManager, DisplayPanesController, DisplayPanesUserSettings, GtcControlSetup, GtcOrientation,
  PfdIndex
} from '@microsoft/msfs-wtg3000-common';

import { GtcUserSettings } from '../Settings/GtcUserSettings';
import { GtcInteractionEvent, GtcInteractionEventUtils, GtcInteractionHandler } from './GtcInteractionEvent';
import { GtcKnobHandler } from './GtcKnobHandler';
import { GtcKnobStates } from './GtcKnobStates';
import { GtcView } from './GtcView';
import { GtcViewKeys } from './GtcViewKeys';

/**
 * Policies governing the lifecycle of GTC views.
 */
export enum GtcViewLifecyclePolicy {
  /** The view is created immediately on initialization and is never destroyed. */
  Static = 'Static',

  /** The view is created when it is opened for the first time and is never destroyed. */
  Persistent = 'Persistent',

  /**
   * The view is created when it is opened and destroyed when it is closed and no longer appears in the history of its
   * view stack.
   */
  Transient = 'Transient'
}

/** A type of opened GTC view. */
export type GtcViewType = 'page' | 'popup' | 'base';

/** A type of GTC popup. */
export type GtcPopupType = 'normal' | 'slideout-right' | 'slideout-right-full' | 'slideout-bottom' | 'slideout-top';

/** A type of occlusion applied to GTC views. */
export type GtcViewOcclusionType = 'darken' | 'hide' | 'none';

/** G3000 Control Modes */
export type GtcControlMode = 'PFD' | 'MFD' | 'NAV_COM';

/**
 * A container for a GTC view stack.
 */
export interface GtcViewStackContainer {
  /**
   * Sets the visibility of this container.
   * @param visible Whether this container is visible.
   */
  setVisible(visible: boolean): void;

  /**
   * Renders a view into this container.
   * @param view A GTC view, as a VNode.
   */
  renderView(view: VNode): void;
}

/** Contains references to all the view stack container elements. */
export interface ViewStackRefs {
  /** PFD view stack element. */
  PFD?: GtcViewStackContainer,
  /** MFD view stack for display pane 1. */
  MFD1?: GtcViewStackContainer,
  /** MFD view stack for display pane 2. */
  MFD2?: GtcViewStackContainer,
  /** MFD view stack for display pane 3. */
  MFD3?: GtcViewStackContainer,
  /** MFD view stack for display pane 4. */
  MFD4?: GtcViewStackContainer,
  /** NAV_COM view stack element. */
  NAV_COM?: GtcViewStackContainer,
  /** Vertical GTC NAV_COM view stack element. */
  VERT_NAV_COM?: GtcViewStackContainer
}

/** A key to identify a view stack, such as PFD or MFD3. */
type ViewStackKey = keyof ViewStackRefs;

/**
 * Gets a view stack key from a control mode and optional display pane index.
 * @param controlMode The control mode.
 * @param displayPane The optional display pane index.
 * @returns The view stack key.
 */
function getViewStackKey(controlMode: GtcControlMode, displayPane?: ControllableDisplayPaneIndex): ViewStackKey {
  if (controlMode === 'MFD') {
    return (controlMode + displayPane) as ViewStackKey;
  } else {
    return controlMode;
  }
}

/**
 * An entry describing a registered GTC view.
 */
interface ViewEntry<T extends GtcView = GtcView> {
  /** The lifecycle policy of the view. */
  readonly lifecyclePolicy: GtcViewLifecyclePolicy;

  /** The key of the view. */
  readonly key: string;

  /** A function which renders the view. */
  readonly factory: () => VNode;

  /** A reference to the view, or `undefined` if the view is not rendered. */
  ref: T | undefined;

  /** A reference to the view wrapper, or `undefined` if the view is not rendered. */
  wrapperRef: NodeReference<GtcViewWrapper<any>> | undefined;

  /** State of the view's visibility */
  readonly isVisible: Subject<boolean>;

  /** The view-stack layer the view is in, if any */
  readonly layer: Subject<number>;

  /** The view type this entry's view is currently opened as: page, popup, or base. */
  readonly type: Subject<GtcViewType | undefined>;

  /** The popup type this entry's view is currently opened as, or `undefined` if the view is not a popup. */
  readonly popupType: Subject<GtcPopupType | undefined>;

  /**
   * The occlusion type applied to views beneath this entry's view when it is opened as a popup, or `undefined` if the
   * view is not a popup.
   */
  readonly popupBackgroundOcclusion: Subject<GtcViewOcclusionType | undefined>;

  /** The occlusion applied to this entry's view. */
  readonly occlusion: Subject<GtcViewOcclusionType>;
}

/**
 * An entry describing a registered GTC view that is currently rendered to a view stack.
 */
type RenderedViewEntry<T extends GtcView = GtcView> = Omit<ViewEntry<T>, 'ref' | 'wrapperRef'> & {
  /** A reference to the view. */
  ref: T;

  /** A reference to the view wrapper. */
  wrapperRef: NodeReference<GtcViewWrapper<any>>;
};

/** Publicly consumable ViewEntry interface to disallow the visibility to be mutated from outside of GtcService */
export type GtcViewEntry<T extends GtcView = GtcView> = Pick<RenderedViewEntry<T>, 'key' | 'ref'>;

/** A service to manage GTC views */
export class GtcService {
  private static readonly PFD_BASE_VIEW_KEY = '$PfdBase$';
  private static readonly MFD_BASE_VIEW_KEY = '$MfdBase$';
  private static readonly NAV_COM_BASE_VIEW_KEY = '$NavComBase$';
  private static readonly VERT_NAV_COM_BASE_VIEW_KEY = '$VertNavComBase$';

  /** True when horizontal, false when vertical. */
  public readonly isHorizontal = this.orientation === 'horizontal';

  /** Whether this GTC has an MFD mode and can control display panes. */
  public readonly hasMfdMode = this.controlSetup === 'all' || this.controlSetup === 'mfd';
  /** Whether this GTC has a PFD mode. */
  public readonly hasPfdMode = this.controlSetup === 'all' || this.controlSetup === 'pfd' || this.controlSetup === 'pfd-navcom';
  /** Whether this GTC has a NAV_COM. */
  public readonly hasNavComMode = this.controlSetup === 'all' || this.controlSetup === 'pfd-navcom';

  private readonly hEventMap = GtcInteractionEventUtils.hEventMap(this.orientation, this.instrumentIndex);

  private readonly _activeControlMode = Subject.create<GtcControlMode>('PFD');
  /** The currently active control mode. */
  public readonly activeControlMode = this._activeControlMode as Subscribable<GtcControlMode>;

  private readonly registeredViews: Map<ViewStackKey, Map<string, ViewEntry>> = new Map();

  private readonly _viewStacks: Record<ViewStackKey, RenderedViewEntry[][]>
    = { PFD: [], MFD1: [], MFD2: [], MFD3: [], MFD4: [], NAV_COM: [], VERT_NAV_COM: [] };

  private readonly controlModeBaseViews: Record<GtcControlMode, string> = {
    PFD: GtcService.PFD_BASE_VIEW_KEY,
    MFD: GtcService.MFD_BASE_VIEW_KEY,
    NAV_COM: GtcService.NAV_COM_BASE_VIEW_KEY,
  };
  private readonly controlModeBaseViewKeys: string[] = Object.values(this.controlModeBaseViews);

  private readonly controlModeHomePages: Record<GtcControlMode, string> = {
    PFD: GtcViewKeys.PfdHome,
    MFD: GtcViewKeys.MfdHome,
    NAV_COM: GtcViewKeys.NavComHome,
  };
  private readonly controlModeHomePageKeys: string[] = Object.values(this.controlModeHomePages);

  private hasInitialized = false;

  private readonly _isAwake = Subject.create(false);
  /** Whether this service is awake. */
  public readonly isAwake: Subscribable<boolean> = this._isAwake;

  private readonly dummyViewEntry: GtcViewEntry = {
    key: '$$dummy$$',
    ref: new EmptyGtcView({ gtcService: this, controlMode: 'PFD' }),
  };

  private readonly _activeView: Subject<GtcViewEntry> = Subject.create<GtcViewEntry>(this.dummyViewEntry);
  /** The view that is currently at the top of the active view stack. */
  public readonly activeView: Subscribable<GtcViewEntry> = this._activeView;

  private readonly _currentPage: Subject<GtcViewEntry | null> = Subject.create<GtcViewEntry | null>(null);
  /** The page that is currently open in the active view stack. */
  public readonly currentPage: Subscribable<GtcViewEntry | null> = this._currentPage;

  /** The string name for which side this GTC is on. */
  public readonly gtcThisSide = this.displayPaneControlIndex === 1 ? 'left' : 'right';
  /** The string name for which side the other GTC is on. */
  public readonly gtcOtherSide = this.displayPaneControlIndex === 1 ? 'right' : 'left';

  /** The GTC specific user settings for this GTC. */
  public readonly gtcSettings = GtcUserSettings.getAliasedManager(this.bus, this.instrumentIndex as 1 | 2 | 3 | 4);

  /** The selected pane for this GTC. */
  public readonly thisGtcSelectedPane = ConsumerSubject.create(
    this.bus.getSubscriber<DisplayPaneEvents>().on(`${this.gtcThisSide}_gtc_selected_display_pane`), -1);
  /** The selected pane for the other GTC. */
  public readonly otherGtcSelectedPane = ConsumerSubject.create(
    this.bus.getSubscriber<DisplayPaneEvents>().on(`${this.gtcOtherSide}_gtc_selected_display_pane`), -1);

  /** The display panes settings master manager. */
  public readonly displayPanesSettings = DisplayPanesUserSettings.getMasterManager(this.bus);
  /** The visibility setting for each display pane. */
  public readonly displayPaneVisibleSettings: Record<ControllableDisplayPaneIndex, UserSetting<boolean>> = {
    [DisplayPaneIndex.LeftPfd]: this.displayPanesSettings.getSetting(`displayPaneVisible_${DisplayPaneIndex.LeftPfd}`),
    [DisplayPaneIndex.LeftMfd]: this.displayPanesSettings.getSetting(`displayPaneVisible_${DisplayPaneIndex.LeftMfd}`),
    [DisplayPaneIndex.RightMfd]: this.displayPanesSettings.getSetting(`displayPaneVisible_${DisplayPaneIndex.RightMfd}`),
    [DisplayPaneIndex.RightPfd]: this.displayPanesSettings.getSetting(`displayPaneVisible_${DisplayPaneIndex.RightPfd}`),
  };

  /** The display pane that we want to have selected.
   * For instance, if we go to PFD mode, then come back, this stores what pane we had selected last time. */
  private readonly desiredDisplayPane = Subject.create<ControllableDisplayPaneIndex>(this.getDefaultControlledDisplayPane());

  private readonly _selectedDisplayPane = Subject.create<ControllableDisplayPaneIndex | -1>(-1);
  /** The index of the currently selected display pane. */
  public readonly selectedDisplayPane = this._selectedDisplayPane as Subscribable<ControllableDisplayPaneIndex | -1>;

  /** The settings manager for the currently selected display pane. */
  public readonly selectedPaneSettings = new DisplayPanesAliasedUserSettingManager(this.bus);

  /** The index of the PFD instrument display pane on the side of this GTC. */
  public readonly pfdInstrumentPaneIndex = this.pfdControlIndex === 1 ? DisplayPaneIndex.LeftPfdInstrument : DisplayPaneIndex.RightPfdInstrument;

  /** The index of the PFD display pane on the side of this GTC. */
  public readonly pfdPaneIndex = this.pfdControlIndex === 1 ? DisplayPaneIndex.LeftPfd : DisplayPaneIndex.RightPfd;
  /** The display pane settings for this side's PFD display pane. */
  public readonly pfdPaneSettings = new DisplayPanesAliasedUserSettingManager(this.bus)
    .useDisplayPaneSettings(this.pfdPaneIndex);

  private readonly displayPaneControlEventPublisher = this.bus.getPublisher<DisplayPaneControlEvents>();

  // Needs to initialize BEFORE GtcKnobStates instantiates
  public readonly radioBeingTuned: Subject<ComRadio> = Subject.create<ComRadio>('COM1');
  public readonly navComEventHandler = Subject.create<GtcInteractionHandler | null>(null);

  public readonly gtcKnobStates = new GtcKnobStates(this);
  private readonly gtcKnobHandler = new GtcKnobHandler(this);

  /** Should be populated before anyone uses it. */
  private viewStackRefs!: ViewStackRefs;

  /**
   * Creates an instance of GtcService.
   * @param bus The event bus.
   * @param instrumentIndex The index of the GTC instrument to which this service belongs.
   * @param orientation The orientation (horizontal or vertical) of the GTC to which this service belongs.
   * @param controlSetup Which control modes supported by this GTC.
   * @param pfdControlIndex The index of the PFD controlled by the GTC to which this service belongs.
   * @param displayPaneControlIndex The display pane controlling index of the GTC to which this service belongs.
   * @param isAdvancedVnav Whether advanced VNAV is enabled.
   */
  constructor(
    public readonly bus: EventBus,
    public readonly instrumentIndex: number,
    public readonly orientation: GtcOrientation,
    public readonly controlSetup: GtcControlSetup,
    public readonly pfdControlIndex: PfdIndex,
    public readonly displayPaneControlIndex: DisplayPaneControlGtcIndex,
    public readonly isAdvancedVnav: boolean,
  ) {
    const sub = this.bus.getSubscriber<HEvent>();
    sub.on('hEvent').handle(this.handleHEvent);

    this.activeControlMode.sub(this.updateViewStackVisibility);

    if (this.hasMfdMode) {
      const paneEvents = this.bus.getSubscriber<DisplayPaneEvents>();

      // We set it here because we need to be able to override selectedDisplayPane manually
      paneEvents.on(`${this.gtcThisSide}_gtc_selected_display_pane`).handle(paneIndex => {
        this._selectedDisplayPane.set(paneIndex);

        if (paneIndex !== -1) {
          this.selectedPaneSettings.useDisplayPaneSettings(paneIndex);
        }
      });

      this.desiredDisplayPane.sub(this.updateViewStackVisibility);
      this._selectedDisplayPane.sub(this.updateDesiredDisplayPane, true);

      this.displayPaneVisibleSettings[2].sub(this.handleMfdPaneVisibilityChanged);
      this.displayPaneVisibleSettings[3].sub(this.handleMfdPaneVisibilityChanged);
    }
  }

  /**
   * Gets this service's default control mode.
   * @returns This service's default control mode.
   */
  private getDefaultControlMode(): GtcControlMode {
    switch (this.controlSetup) {
      case 'mfd':
        return 'MFD';
      default:
        return 'PFD';
    }
  }

  /**
   * Gets this service's default controlled display pane.
   * @returns This service's default controlled display pane.
   */
  private getDefaultControlledDisplayPane(): ControllableDisplayPaneIndex {
    if (this.displayPaneControlIndex === DisplayPaneControlGtcIndex.LeftGtc) {
      return DisplayPaneIndex.LeftMfd;
    } else {
      return DisplayPaneIndex.RightMfd;
    }
  }

  /** Handles selecting an MFD pane when it becomes split, if necessary. */
  private readonly handleMfdPaneVisibilityChanged = (): void => {
    if (!this.isAwake.get()) {
      return;
    }

    if (this.activeControlMode.get() === 'MFD' && this._selectedDisplayPane.get() === -1) {
      const isLeftMfdPaneVisible = this.displayPaneVisibleSettings[DisplayPaneIndex.LeftMfd].get();
      const isRightMfdPaneVisible = this.displayPaneVisibleSettings[DisplayPaneIndex.RightMfd].get();
      if (isLeftMfdPaneVisible) {
        this._selectedDisplayPane.set(DisplayPaneIndex.LeftMfd);
        this.displayPaneControlEventPublisher.pub(`gtc_${this.displayPaneControlIndex}_display_pane_select`, DisplayPaneIndex.LeftMfd, true);
      } else if (isRightMfdPaneVisible) {
        this._selectedDisplayPane.set(DisplayPaneIndex.RightMfd);
        this.displayPaneControlEventPublisher.pub(`gtc_${this.displayPaneControlIndex}_display_pane_select`, DisplayPaneIndex.RightMfd, true);
      }
    }
  };

  /** Hides inactive view stacks, and reveals the active one. */
  private readonly updateViewStackVisibility = (): void => {
    const mode = this.activeControlMode.get();
    const pane = this.desiredDisplayPane.get();

    this.setViewStackVisibility('PFD', mode === 'PFD');
    forEachPaneIndex(i => { this.setViewStackVisibility(getViewStackKey('MFD', i), mode === 'MFD' && pane === i); });
    this.setViewStackVisibility('NAV_COM', mode === 'NAV_COM');
  };

  /**
   * Sets the visibility of a view stack.
   * @param key The key of the view stack.
   * @param isVisible Whether the view stack is visible.
   */
  private setViewStackVisibility(key: keyof ViewStackRefs, isVisible: boolean): void {
    const viewStack = this._viewStacks[key];
    const container = this.viewStackRefs[key];

    // Need to remove any animation classes on all views in the incoming stack, to prevent them from being played
    const activeViewStack = viewStack[viewStack.length - 1] as RenderedViewEntry[] | undefined;
    if (activeViewStack !== undefined) {
      for (let i = 0; i < activeViewStack.length; i++) {
        activeViewStack[i].wrapperRef.instance.setAnimationClass(null);
      }
    }

    container?.setVisible(isVisible);
  }

  /** Updates what the desired display pane should be. */
  private readonly updateDesiredDisplayPane = (): void => {
    const selectedDisplayPane = this._selectedDisplayPane.get();

    if (selectedDisplayPane === -1) { return; }

    if (this.desiredDisplayPane.get() !== selectedDisplayPane) {
      // We have to do this right here, because after we change the desired pane,
      // the current top view will be different
      if (this.activeControlMode.get() === 'MFD' && this.isVertNavComViewStackEmpty) {
        this.activeViewEntry.ref.onPause();
      }

      this.desiredDisplayPane.set(selectedDisplayPane);

      if (this.activeControlMode.get() === 'MFD') {
        if (this.isVertNavComViewStackEmpty) {
          this.handleActiveViewChange();
        }
        this.handleOpenPageChange();
      }
    }
  };

  // eslint-disable-next-line jsdoc/require-returns
  /** The view stack history for the currently selected control mode and display pane. */
  private get currentControlModeViewStackHistory(): RenderedViewEntry[][] {
    return this._viewStacks[getViewStackKey(this._activeControlMode.get(), this.desiredDisplayPane.get())];
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private set currentControlModeViewStackHistory(historyStack: RenderedViewEntry[][]) {
    this._viewStacks[getViewStackKey(this._activeControlMode.get(), this.desiredDisplayPane.get())] = historyStack;
  }

  // eslint-disable-next-line jsdoc/require-returns
  /** The open view stack for the currently selected control mode and display pane. */
  private get currentControlModeViewStack(): RenderedViewEntry[] {
    const viewStack = ArrayUtils.peekLast(this.currentControlModeViewStackHistory);
    if (!viewStack) { throw new Error('GtcService: attempting to access an empty view stack history'); }
    return viewStack;
  }

  // eslint-disable-next-line jsdoc/require-returns
  /** The open vertical GTC NAV/COM view stack. */
  private get openVertNavComViewStack(): RenderedViewEntry[] {
    const openViewStack = ArrayUtils.peekLast(this._viewStacks['VERT_NAV_COM']);
    if (!openViewStack) { throw new Error('GtcService: attempting to access an empty view stack history'); }
    return openViewStack;
  }

  // eslint-disable-next-line jsdoc/require-returns
  /** Whether the vertical GTC NAV/COM view stack has no open popups. */
  public get isVertNavComViewStackEmpty(): boolean {
    return this.isHorizontal || this.openVertNavComViewStack.length <= 1;
  }

  // eslint-disable-next-line jsdoc/require-returns
  /** Gets the history of the view stack containing the current active view. */
  private get activeViewStackHistory(): RenderedViewEntry[][] {
    return this.isVertNavComViewStackEmpty ? this.currentControlModeViewStackHistory : this._viewStacks['VERT_NAV_COM'];
  }

  // eslint-disable-next-line jsdoc/require-returns
  /** Gets the view stack containing the current active view. */
  private get activeViewStack(): RenderedViewEntry[] {
    return this.isVertNavComViewStackEmpty ? this.currentControlModeViewStack : this.openVertNavComViewStack;
  }

  // eslint-disable-next-line jsdoc/require-returns
  /** Gets the current active view entry. */
  private get activeViewEntry(): RenderedViewEntry {
    const activeView = ArrayUtils.peekLast(this.activeViewStack);
    if (!activeView) { throw new Error('GtcService: attempting to access the top view of an empty view stack'); }
    return activeView;
  }

  // eslint-disable-next-line jsdoc/require-returns
  /** Gets the current open page entry. */
  private get currentPageEntry(): RenderedViewEntry | null {
    return this.currentControlModeViewStack[1] ?? null;
  }

  /**
   * Returns whether the active view is a GTC Home Page or not
   * @returns A subscribable that returns whether the active view is a GTC Home Page or not
   */
  public get activeViewIsNotAHomePage(): Subscribable<boolean> {
    return this.activeView.map(({ key }) => !this.controlModeHomePageKeys.includes(key));
  }

  /**
   * Handles H events.
   * @param hEvent The event.
   */
  private readonly handleHEvent = (hEvent: string): void => {
    const interactionEvent = this.hEventMap(hEvent);
    interactionEvent && this.onInteractionEvent(interactionEvent);
  };

  /**
   * Called by GtcContainer to pass in the refs to all the view stacks.
   * Should only be called once.
   * @param viewStackRefs The view stack refs.
   */
  public onGtcContainerRendered(viewStackRefs: ViewStackRefs): void {
    this.viewStackRefs = viewStackRefs;
    Object.keys(viewStackRefs).forEach(key => this.registeredViews.set(key as ViewStackKey, new Map()));
  }

  /**
   * Registers and renders a view (page or popup) with this service. Once a view is registered, it may be opened by
   * referencing its key.
   *
   * Each view is registered with a specific view stack. There is one view stack for each of the PFD and NAV/COM
   * control modes, and four view stacks for the MFD control mode (one for each controllable display pane). Views
   * registered with different stacks may share the same key. Registering a view under the same key as an existing
   * view in the same stack will replace the existing view.
   * @param lifecyclePolicy The lifecycle policy to apply to the view. If the view is registered under a home page key,
   * then this value is ignored and the {@link GtcViewLifecyclePolicy.Static} policy will automatically be applied.
   * @param key The key to register the view under.
   * @param controlMode The control mode with which to register the view.
   * @param vNodeFactory A function that returns a GtcView VNode for the key.
   * @param displayPaneIndex The index of the display pane with which to register the view. Ignored if `controlMode` is
   * not `'MFD'`. If not defined, the view will be registered once for each display pane.
   * @throws Errors if the parent element does not exist.
   */
  public registerView(
    lifecyclePolicy: GtcViewLifecyclePolicy,
    key: string,
    controlMode: GtcControlMode,
    vNodeFactory: (gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex?: ControllableDisplayPaneIndex) => VNode,
    displayPaneIndex?: ControllableDisplayPaneIndex
  ): void {
    switch (controlMode) {
      case 'PFD':
        if (this.hasPfdMode) {
          // Force static lifecycle policy for home pages.
          if (key === this.controlModeHomePages['PFD']) {
            lifecyclePolicy = GtcViewLifecyclePolicy.Static;
          }

          this._registerView(lifecyclePolicy, key, 'PFD', () => vNodeFactory(this, 'PFD'));
        }
        break;
      case 'MFD':
        if (this.hasMfdMode) {
          // Force static lifecycle policy for home pages.
          if (key === this.controlModeHomePages['MFD']) {
            lifecyclePolicy = GtcViewLifecyclePolicy.Static;
          }

          if (displayPaneIndex === undefined) {
            // MFD views exist 4 times, once per display pane.
            forEachPaneIndex(i => {
              this._registerView(lifecyclePolicy, key, getViewStackKey('MFD', i), () => vNodeFactory(this, 'MFD', i));
            });
          } else {
            this._registerView(lifecyclePolicy, key, getViewStackKey('MFD', displayPaneIndex), () => vNodeFactory(this, 'MFD', displayPaneIndex));
          }
        }
        break;
      case 'NAV_COM':
        if (!this.isHorizontal) {
          this._registerView(lifecyclePolicy, key, 'VERT_NAV_COM', () => vNodeFactory(this, 'NAV_COM'));
        } else if (this.hasNavComMode) {
          // Force static lifecycle policy for home pages.
          if (key === this.controlModeHomePages['NAV_COM']) {
            lifecyclePolicy = GtcViewLifecyclePolicy.Static;
          }

          this._registerView(lifecyclePolicy, key, 'NAV_COM', () => vNodeFactory(this, 'NAV_COM'));
        }
        break;
    }
  }

  /**
   * Registers and renders a view (page or popup) to be opened by the service.
   * @param lifecyclePolicy The lifecycle policy to apply to the view.
   * @param key The view's key.
   * @param viewStackKey The key of the view stack to insert the view into.
   * @param factory The VNode for the view.
   * @throws Errors if the parent element does not exist
   */
  private _registerView(
    lifecyclePolicy: GtcViewLifecyclePolicy,
    key: string,
    viewStackKey: ViewStackKey,
    factory: () => VNode,
  ): void {
    // Clean up any existing entry registered under the same key
    const oldEntry = this.registeredViews.get(viewStackKey)!.get(key);
    if (oldEntry !== undefined) {
      this.cleanupView(oldEntry);
    }

    const isVisible: Subject<boolean> = Subject.create<boolean>(false);
    const layer: Subject<number> = Subject.create(-1);
    const type = Subject.create<GtcViewType | undefined>(undefined);
    const popupType = Subject.create<GtcPopupType | undefined>(undefined);
    const popupBackgroundOcclusion = Subject.create<GtcViewOcclusionType | undefined>(undefined);
    const occlusion = Subject.create<GtcViewOcclusionType>('none');

    const viewEntry: ViewEntry = {
      lifecyclePolicy,
      key,
      factory,
      ref: undefined,
      wrapperRef: undefined,
      isVisible,
      layer,
      type,
      popupType,
      popupBackgroundOcclusion,
      occlusion
    };
    this.registeredViews.get(viewStackKey)!.set(key, viewEntry);

    if (lifecyclePolicy === GtcViewLifecyclePolicy.Static) {
      this.renderView(viewStackKey, viewEntry);
    }
  }

  /**
   * Renders a registered view.
   * @param viewStackKey The key of the view stack to which to render the view.
   * @param viewEntry The view entry describing the view to render.
   */
  private renderView(viewStackKey: ViewStackKey, viewEntry: ViewEntry): void {
    const vNode = viewEntry.factory();

    const wrapperRef = FSComponent.createRef<StandardGtcViewWrapper>();

    this.viewStackRefs[viewStackKey]!.renderView(
      <StandardGtcViewWrapper
        ref={wrapperRef}
        isVisible={viewEntry.isVisible}
        layer={viewEntry.layer}
        type={viewEntry.type}
        popupType={viewEntry.popupType}
        popupBackgroundOcclusion={viewEntry.popupBackgroundOcclusion}
        occlusion={viewEntry.occlusion}
      >
        {vNode}
      </StandardGtcViewWrapper>
    );

    viewEntry.wrapperRef = wrapperRef;
    viewEntry.ref = vNode.instance as GtcView;
  }

  /**
   * Cleans up and destroys a view, removing the view from the DOM and freeing up associated resources. The view entry
   * for the view is preserved and can be used to re-render the view in the future.
   * @param viewEntry The entry for the view to clean up.
   */
  private cleanupView(viewEntry: ViewEntry): void {
    viewEntry.wrapperRef?.getOrDefault()?.destroy();
    viewEntry.wrapperRef = undefined;
    viewEntry.ref = undefined;
  }

  /**
   * Initializes this service.
   */
  public initialize(): void {
    // Allow this method to only be called once
    if (this.hasInitialized) { return; }

    // Populate each control mode's view stack with its respective home page
    if (this.hasPfdMode) {
      const baseViewKey = this.controlModeBaseViews['PFD'];
      const baseViewEntry = this.createEmptyViewEntry(baseViewKey, 'PFD');

      this.registeredViews.get('PFD')!.set(baseViewKey, baseViewEntry);
      this.initializeViewStack('PFD', baseViewKey, this.controlModeHomePages['PFD']);
    }
    if (this.hasMfdMode) {
      forEachPaneIndex(i => {
        const baseViewKey = this.controlModeBaseViews['MFD'];
        const baseViewEntry = this.createEmptyViewEntry(baseViewKey, 'MFD');
        const viewStackKey = getViewStackKey('MFD', i);

        this.registeredViews.get(viewStackKey)!.set(baseViewKey, baseViewEntry);
        this.initializeViewStack(viewStackKey, baseViewKey, this.controlModeHomePages['MFD']);
      });
    }
    if (this.hasNavComMode) {
      const baseViewKey = this.controlModeBaseViews['NAV_COM'];
      const baseViewEntry = this.createEmptyViewEntry(baseViewKey, 'NAV_COM');

      this.registeredViews.get('NAV_COM')!.set(baseViewKey, baseViewEntry);
      this.initializeViewStack('NAV_COM', baseViewKey, this.controlModeHomePages['NAV_COM']);
    }
    if (!this.isHorizontal) {
      const baseViewEntry = this.createEmptyViewEntry(GtcService.VERT_NAV_COM_BASE_VIEW_KEY, 'NAV_COM');

      this.registeredViews.get('VERT_NAV_COM')!.set(GtcService.VERT_NAV_COM_BASE_VIEW_KEY, baseViewEntry);
      this.initializeViewStack('VERT_NAV_COM', GtcService.VERT_NAV_COM_BASE_VIEW_KEY);
    }

    const defaultControlMode = this.getDefaultControlMode();

    this._activeControlMode.set(defaultControlMode);

    if (this._isAwake.get()) {
      this.selectDisplayPaneForControlMode(defaultControlMode);
    }

    this.handleActiveViewChange();
    this.handleOpenPageChange();

    this.refreshOcclusion();

    this.updateViewStackVisibility();

    this.hasInitialized = true;
  }

  /**
   * Populate the view stack with its respective home page.
   * @param viewStackKey The key of the view stack to initialize.
   * @param baseViewKey The key of the base view.
   * @param homePageKey The key of the home page.
   */
  private initializeViewStack(viewStackKey: ViewStackKey, baseViewKey: string, homePageKey?: string): void {
    // Note: base views and home page views always have the static lifecycle policy and so are guaranteed to be rendered.

    const baseViewEntry = this.getViewEntry(baseViewKey, viewStackKey) as RenderedViewEntry;
    baseViewEntry.ref.onOpen(false);
    baseViewEntry.isVisible.set(true);
    baseViewEntry.layer.set(0);
    baseViewEntry.type.set('base');

    this._viewStacks[viewStackKey].push([baseViewEntry]);

    if (homePageKey !== undefined) {
      const homePageEntry = this.getViewEntry(homePageKey, viewStackKey) as RenderedViewEntry;
      homePageEntry.ref.onOpen(false);
      homePageEntry.isVisible.set(true);
      homePageEntry.layer.set(1);
      homePageEntry.type.set('page');

      this._viewStacks[viewStackKey].push([baseViewEntry, homePageEntry]);
    }
  }

  /**
   * Resets this service, which does the following:
   * * Closes all open popups.
   * * Changes the open page to the home page of this service's default control mode.
   * * Clears all history.
   * * Sets the controlled display pane to this service's default, if applicable.
   *
   * Has no effect if this service is not initialized.
   */
  public reset(): void {
    if (!this.hasInitialized) {
      return;
    }

    // Switch to default control mode and go to its home page. This will also close any open views on "global" view
    // stacks (e.g. VERT_NAVCOM view stack)

    const defaultControlMode = this.getDefaultControlMode();
    this.changeControlModeTo(defaultControlMode);
    this.goToHomePage();

    // Close all open views on non-active control mode view stacks and go to the home page for that view stack.

    if (this.hasPfdMode && defaultControlMode !== 'PFD') {
      this.resetNonActiveViewStack('PFD', getViewStackKey('PFD'));
    }
    if (this.hasMfdMode) {
      // Remember that while the selected pane is the one we are actually controlling, the desired pane is the one
      // we want to control and is what determines which view stack is active.
      const currentDesiredPaneIndex = this.desiredDisplayPane.get();

      forEachPaneIndex(index => {
        if (defaultControlMode !== 'MFD' || currentDesiredPaneIndex !== index) {
          this.resetNonActiveViewStack('MFD', getViewStackKey('MFD', index));
        }
      });
    }
    if (this.hasNavComMode && defaultControlMode !== 'NAV_COM') {
      this.resetNonActiveViewStack('NAV_COM', getViewStackKey('NAV_COM'));
    }

    // Attempt to select the default display pane to control.

    const defaultControlledPane = this.getDefaultControlledDisplayPane();

    if (this._isAwake.get() && defaultControlMode === 'MFD') {
      if (this.desiredDisplayPane.get() !== defaultControlledPane) {
        this.selectDisplayPaneForControlMode(defaultControlMode);
      }
    } else {
      this.desiredDisplayPane.set(defaultControlledPane);
    }
  }

  /**
   * Resets a non-active control mode view stack, which does the following:
   * * Closes all open popups.
   * * Changes the open page to the home page of the view stack.
   * * Clears all history.
   * @param controlMode The control mode of the view stack to reset.
   * @param viewStackKey The key of the view stack to reset.
   */
  private resetNonActiveViewStack(controlMode: GtcControlMode, viewStackKey: keyof ViewStackRefs): void {
    const viewStackHistory = this._viewStacks[viewStackKey];

    // If the view stack we are trying to reset is the active view stack, ABORT.
    if (this.currentControlModeViewStackHistory === viewStackHistory) {
      return;
    }

    // Close all open views except the base view.

    if (viewStackHistory.length > 1) {
      this.closeViewStack(viewStackHistory[viewStackHistory.length - 1], true, 'clear');
    }

    const historyStacks = viewStackHistory.slice(1);
    viewStackHistory.length = 1;
    for (let i = historyStacks.length - 1; i >= 0; i--) {
      this.cleanupTransientViews(historyStacks[i], viewStackHistory);
    }

    // Open the home page. Do not resume it because it is not in the active view stack.

    // Home page views always have the static lifecycle policy and so are guaranteed to be rendered.
    const homePageEntry = this.getViewEntry(this.controlModeHomePages[controlMode], viewStackKey) as RenderedViewEntry;
    homePageEntry.type.set('page');
    homePageEntry.popupType.set(undefined);
    homePageEntry.popupBackgroundOcclusion.set(undefined);

    viewStackHistory.push([...viewStackHistory[0], homePageEntry]);

    this.openView(homePageEntry, viewStackHistory[1], false);
  }

  /**
   * Wakes this service. Once awake, this service will attempt to select an appropriate display pane to control and
   * will respond to interaction events.
   */
  public wake(): void {
    if (this._isAwake.get()) {
      return;
    }

    this.selectDisplayPaneForControlMode(this._activeControlMode.get());

    this._isAwake.set(true);
  }

  /**
   * Puts this service to sleep. Once asleep, this service will deselect any controlled display pane and will not
   * respond to interaction events.
   */
  public sleep(): void {
    if (!this._isAwake.get()) {
      return;
    }

    this._selectedDisplayPane.set(-1);
    if (this.hasMfdMode) {
      this.displayPaneControlEventPublisher.pub(`gtc_${this.displayPaneControlIndex}_display_pane_select`, -1, true, false);
    }

    this._isAwake.set(false);
  }

  /**
   * Gets the available panes.
   * @returns The available panes.
   */
  public getAvailablePanes(): readonly ControllableDisplayPaneIndex[] {
    return DisplayPanesController.getAvailablePanes(
      this.thisGtcSelectedPane.get(), this.otherGtcSelectedPane.get(), this.displayPaneVisibleSettings);
  }

  /**
   * Changes the active control mode
   * @param controlMode The control mode to change to
   */
  public changeControlModeTo(controlMode: GtcControlMode): void {
    // On a control mode self-transition...
    if (this._activeControlMode.get() === controlMode) {
      this.goBackToHomePage();
      return;
    }

    if (this.isVertNavComViewStackEmpty) {
      this.activeViewEntry.ref.onPause();
    }

    // Assign the activeControlMode to the new value
    this._activeControlMode.set(controlMode);

    if (this._isAwake.get()) {
      this.selectDisplayPaneForControlMode(controlMode);
    }

    if (this.isVertNavComViewStackEmpty) {
      this.handleActiveViewChange();
    }
    this.handleOpenPageChange();
  }

  /**
   * Selects a display pane for the control mode.
   * @param controlMode The control mode.
   */
  private selectDisplayPaneForControlMode(controlMode: GtcControlMode): void {
    if (!this.hasMfdMode) { return; }

    let desiredPane: ControllableDisplayPaneIndex | -1;

    if (controlMode === 'MFD') {
      // When going to MFD mode, we want to try to select the pane we previously had selected.
      desiredPane = this.desiredDisplayPane.get();
    } else {
      // When leaving MFD mode, we need to deselect any panes.
      desiredPane = -1;
    }

    const availablePanes = this.getAvailablePanes();
    const pane = DisplayPanesController.getBestAvailablePane(this.displayPaneControlIndex, desiredPane, availablePanes);
    // We override the selected pane locally, so that we don't get jank
    // caused by the delay of waiting for the pane changed event to sync across the bus.
    // When the event does arrive, most of the time we will already have the correct one set.
    this._selectedDisplayPane.set(pane);
    this.displayPaneControlEventPublisher.pub(`gtc_${this.displayPaneControlIndex}_display_pane_select`, pane, true, false);
  }

  /**
   * Closes all open popups and the open page, then opens the home page for the currently selected control mode.
   * This also resets the history for the open view stack.
   */
  public goToHomePage(): void {
    this.activeViewEntry.ref.onPause();

    if (!this.isVertNavComViewStackEmpty) {
      this.closeViewStack(this.openVertNavComViewStack, false, 'clear');

      const historyStacks = this._viewStacks['VERT_NAV_COM'].slice(1);
      this._viewStacks['VERT_NAV_COM'].length = 1;
      for (let i = historyStacks.length - 1; i >= 0; i--) {
        this.cleanupTransientViews(historyStacks[i], this._viewStacks['VERT_NAV_COM']);
      }
    }

    const currentControlModeViewStackHistory = this.currentControlModeViewStackHistory;

    this.closeViewStack(this.currentControlModeViewStack, true, 'clear');

    const historyStacks = currentControlModeViewStackHistory.slice(1);
    currentControlModeViewStackHistory.length = 1;
    for (let i = historyStacks.length - 1; i >= 0; i--) {
      this.cleanupTransientViews(historyStacks[i], currentControlModeViewStackHistory);
    }

    this.changePageTo(this.controlModeHomePages[this._activeControlMode.get()]);
  }

  /**
   * Opens a view as a page and changes the current page to the opened view. This will close the current page and any
   * open popups.
   * @param key The key of the view to open.
   * @returns The entry of the opened view.
   * @throws Error if there is no view registered under the specified key.
   */
  public changePageTo<T extends GtcView = GtcView>(key: string): GtcViewEntry<T> {
    const oldPageEntry = this.currentPageEntry;

    const viewEntry = this.advanceControlModeViewStack<T>(key, 'page');

    viewEntry.type.set('page');
    viewEntry.popupType.set(undefined);
    viewEntry.popupBackgroundOcclusion.set(undefined);

    if (oldPageEntry === null) {
      viewEntry.wrapperRef.instance.setAnimationClass('gtc-page-open-animation');
    } else if (oldPageEntry !== viewEntry) {
      viewEntry.wrapperRef.instance.setAnimationClass(
        this.controlModeHomePageKeys.includes(viewEntry.key) ? 'gtc-page-open-reverse-animation' : 'gtc-page-open-forward-animation'
      );
    }

    this.refreshOcclusion();

    return viewEntry;
  }

  /**
   * Opens a view as a popup. The opened view will be brought to the top of the current view stack as the active view.
   * @param key The key of the view to open.
   * @param popupType The type of popup to open the view as. Defaults to `'normal'`.
   * @param backgroundOcclusion The occlusion type applied to views beneath the popup. If `'none'` is chosen, then the
   * popup will not prevent mouse events from reaching views beneath it (unless the mouse event was triggered on an
   * element in the popup). Defaults to `'darken'`.
   * @returns The entry of the opened view.
   * @throws Error if there is no view registered under the specified key.
   */
  public openPopup<T extends GtcView = GtcView>(key: string, popupType: GtcPopupType = 'normal', backgroundOcclusion: GtcViewOcclusionType = 'darken'): GtcViewEntry<T> {
    const viewEntry = this.advanceControlModeViewStack<T>(key, 'popup');

    viewEntry.type.set('popup');
    viewEntry.popupType.set(popupType);
    viewEntry.popupBackgroundOcclusion.set(backgroundOcclusion);

    viewEntry.wrapperRef.instance.setAnimationClass(`gtc-popup-${popupType}-open-animation`);

    this.refreshOcclusion();

    return viewEntry;
  }

  /**
   * Advances the history state of the view stack for the currently selected control mode and display pane by changing
   * the page or opening a popup.
   * @param key The key of the view to open.
   * @param type The type of view to open.
   * @throws Error if attempting to open a popup that is already open in the view stack.
   * @returns The active view entry after the operation is complete.
   */
  private advanceControlModeViewStack<T extends GtcView = GtcView>(key: string, type: GtcViewType): RenderedViewEntry<T> {
    const viewStackKey = this.getOpenControlModeViewStackKey();
    const viewEntry = this.getViewEntry<T>(key, viewStackKey);

    if (ArrayUtils.includes(this.currentControlModeViewStack, viewEntry)) {
      // Handle the case in which the requested view is already in the active view stack
      throw new Error(`GtcService: attempting to open a popup instance which is already open in the view stack: ${key}`);
    } else {
      // If the requested view is not already in the active view stack, then we may need to render it.

      if (viewEntry.ref === undefined) {
        this.renderView(viewStackKey, viewEntry);
      }
    }

    // At this point the view is guaranteed to be rendered.
    const renderedViewEntry = viewEntry as RenderedViewEntry<T>;

    if (this.isVertNavComViewStackEmpty) {
      // Call the Pause lifecycle method on the outgoing view
      this.activeViewEntry.ref.onPause();
    }

    switch (type) {
      case 'page': {
        // Close all open views in the current stack when changing pages
        this.closeViewStack(this.currentControlModeViewStack, true, 'advance');

        // Create a new view stack history state with the base view and opened page as the only members
        this.currentControlModeViewStackHistory.push([this.currentControlModeViewStack[0], renderedViewEntry]);

        break;
      }
      case 'popup':
        // Create a new view stack, retaining the previous stack, and appending to it the passed popup
        this.currentControlModeViewStackHistory.push([...this.currentControlModeViewStack, renderedViewEntry]);

        break;
    }

    this.openView(renderedViewEntry, this.currentControlModeViewStack);

    if (this.isVertNavComViewStackEmpty) {
      this.handleActiveViewChange();
    }
    this.handleOpenPageChange();

    return renderedViewEntry;
  }

  /**
   * Returns the active view stack key based on control mode and selected pane.
   * @returns The active view stack key.
   */
  private getOpenControlModeViewStackKey(): ViewStackKey {
    return getViewStackKey(this.activeControlMode.get(), this.desiredDisplayPane.get());
  }

  /**
   * Opens a view as a vertical GTC NAV/COM popup. The opened view will be brought to the top of the vertical GTC
   * NAV/COM view stack as the active view.
   * @param key The key of the view to open.
   * @param popupType The type of popup to open the view as. Defaults to `'normal'`.
   * @param backgroundOcclusion The occlusion type applied to views beneath the popup. If `'none'` is chosen, then the
   * popup will not prevent mouse events from reaching views beneath it (unless the mouse event was triggered on an
   * element in the popup). Defaults to `'darken'`.
   * @returns The entry of the opened view.
   * @throws Error if this service's GTC is horizontal or there is no view registered under the specified key.
   */
  public openVerticalNavComPopup<T extends GtcView = GtcView>(key: string, popupType: GtcPopupType = 'normal', backgroundOcclusion: GtcViewOcclusionType = 'darken'): GtcViewEntry<T> {
    if (this.isHorizontal) {
      throw new Error('GtcService: attempted to open a vertical GTC NAV/COM popup in a horizontal GTC');
    }

    const viewEntry = this.advanceVertNavComViewStack<T>(key);

    viewEntry.type.set('popup');
    viewEntry.popupType.set(popupType);
    viewEntry.popupBackgroundOcclusion.set(backgroundOcclusion);

    viewEntry.wrapperRef.instance.setAnimationClass(`gtc-popup-${popupType}-open-animation`);

    this.refreshOcclusion();

    return viewEntry;
  }

  /**
   * Advances the history state of the vertical GTC NAV/COM view stack by opening a popup.
   * @param key The key of the popup to open.
   * @throws Error if attempting to open a popup that is already open in the view stack.
   * @returns The active view entry after the operation is complete.
   */
  private advanceVertNavComViewStack<T extends GtcView = GtcView>(key: string): RenderedViewEntry<T> {
    const viewEntry = this.getViewEntry<T>(key, 'VERT_NAV_COM');

    if (ArrayUtils.includes(this.openVertNavComViewStack, viewEntry)) {
      // Handle the case in which the requested view is already in the view stack
      throw new Error(`GtcService: attempting to open a popup instance which is already open in the view stack: ${key}`);
    } else {
      // If the requested view is not already in the active view stack, then we may need to render it.

      if (viewEntry.ref === undefined) {
        this.renderView('VERT_NAV_COM', viewEntry);
      }
    }

    // At this point the view is guaranteed to be rendered.
    const renderedViewEntry = viewEntry as RenderedViewEntry<T>;

    // Call the Pause lifecycle method on the outgoing view
    this.activeViewEntry.ref.onPause();

    // Create a new view stack, retaining the previous stack, and appending to it the passed popup
    this._viewStacks['VERT_NAV_COM'].push([...this.openVertNavComViewStack, renderedViewEntry]);

    this.openView(renderedViewEntry, this.openVertNavComViewStack);

    this.handleActiveViewChange();

    return renderedViewEntry;
  }

  /**
   * Returns to the most recent previous history state of the active view stack.
   * @returns The active view entry after the operation is complete.
   * @throws Error if the most recent previous history state of the active view stack is undefined.
   */
  public goBack(): GtcViewEntry {
    // Revert to previous state by popping the current state off of the view stack.
    const activeViewStackHistory = this.activeViewStackHistory;

    const incomingViewStack: RenderedViewEntry[] | undefined = activeViewStackHistory[activeViewStackHistory.length - 2];
    if (!incomingViewStack) { throw new Error('GtcService: attempted to go back when there is no previous state to go back to'); }

    const wasVertNavComViewStackEmpty = this.isVertNavComViewStackEmpty;

    const activeViewEntry = this.activeViewEntry;

    // Call the Pause lifecycle method on the outgoing view
    activeViewEntry.ref.onPause();
    this.closeView(activeViewEntry, 'back', false);

    // This comparison *must* be made before the stack is popped (below)
    const wasActiveViewAPage: boolean = activeViewEntry.type.get() === 'page';

    const oldStack = activeViewStackHistory.pop() as RenderedViewEntry[];
    this.cleanupTransientViews(oldStack, activeViewStackHistory);

    const wasVertNavComViewStackEmptied = this.isVertNavComViewStackEmpty !== wasVertNavComViewStackEmpty;

    // If the previous active view was a page, we need to go through the new active view stack and open every view
    // since none of them were open in the previous active view stack...
    // UNLESS we just closed the only vertical NAV/COM popup, in which case the new active view stack is the open
    // control mode view stack and all views in it were already considered open.
    if (!wasVertNavComViewStackEmptied && wasActiveViewAPage) {
      incomingViewStack.forEach(viewEntry => this.openView(viewEntry, incomingViewStack, true));
    }

    this.handleActiveViewChange();
    this.handleOpenPageChange();

    if (!wasVertNavComViewStackEmptied && wasActiveViewAPage) {
      this.currentPageEntry?.wrapperRef.instance.setAnimationClass('gtc-page-open-reverse-animation');
    }

    this.refreshOcclusion();

    return this.activeViewEntry;
  }

  /**
   * Attempts to return to a previous history state of the active view stack.
   * @param selector A function which selects the history state to which to return. The function is called once for
   * each history state in order of increasing age and takes two arguments: the number of steps from the present state
   * to the selected state and a function which allows one to peek into the selected state's view stack. The function
   * should return `true` if the operation should return to the selected state and `false` otherwise. If the function
   * returns `false` for every selected state, then the operation is aborted.
   * @returns The active view entry after the operation is complete.
   */
  public goBackTo(selector: (steps: number, stackPeeker: (depth: number) => GtcViewEntry | undefined) => boolean): GtcViewEntry {
    let vertNavComStack: RenderedViewEntry[] | undefined;
    let controlModeStack: RenderedViewEntry[];

    const stackPeeker = (depth: number): GtcViewEntry | undefined => {
      if (vertNavComStack !== undefined) {
        if (depth < vertNavComStack.length - 1) {
          return vertNavComStack[vertNavComStack.length - 1 - depth];
        } else {
          depth -= vertNavComStack.length - 1;
        }
      }

      return controlModeStack[controlModeStack.length - 1 - depth];
    };

    let currentStep = 0;
    let selectedStep: number | undefined;

    if (!this.isVertNavComViewStackEmpty) {
      controlModeStack = this.currentControlModeViewStack;

      const history = this._viewStacks['VERT_NAV_COM'];
      for (let i = history.length - 1; i > 0; i--) {
        vertNavComStack = history[i];

        if (selector(currentStep, stackPeeker)) {
          selectedStep = currentStep;
          break;
        }

        currentStep++;
      }
    }

    if (selectedStep === undefined) {
      vertNavComStack = undefined;

      const history = this.currentControlModeViewStackHistory;
      for (let i = history.length - 1; i >= 0; i--) {
        controlModeStack = history[i];

        if (selector(currentStep, stackPeeker)) {
          selectedStep = currentStep;
          break;
        }

        currentStep++;
      }
    }

    selectedStep ??= 0;

    while (selectedStep-- > 0) {
      this.goBack();
    }

    return this.activeViewEntry;
  }

  /**
   * Goes back to the home page of the currently selected control mode.
   * @returns The active view entry after the operation is complete.
   */
  public goBackToHomePage(): GtcViewEntry {
    if (!this.activeViewIsNotAHomePage.get()) {
      return this.activeViewEntry;
    }

    const currentControlModeViewStackHistory = this.currentControlModeViewStackHistory;

    // If the current view stack history has only one entry, then the home page is not in the view stack history,
    // because the first history entry is guaranteed to only contain the base view. Therefore, we need to push a new
    // history entry with the home page, which we can do by changing the page to the home page.
    if (currentControlModeViewStackHistory.length < 2) {
      return this.changePageTo(this.controlModeHomePages[this._activeControlMode.get()]);
    }

    const openPage = this.currentPageEntry;
    const isHomePageOpen = openPage !== null && this.controlModeHomePageKeys.includes(openPage.key);

    this.activeViewEntry.ref.onPause();

    if (!this.isVertNavComViewStackEmpty) {
      this.closeViewStack(this.openVertNavComViewStack, false, 'back');

      const historyStacks = this._viewStacks['VERT_NAV_COM'].slice(1);
      this._viewStacks['VERT_NAV_COM'].length = 1;
      for (let i = historyStacks.length - 1; i >= 0; i--) {
        this.cleanupTransientViews(historyStacks[i], this._viewStacks['VERT_NAV_COM']);
      }
    }

    this.closeViewStack(this.currentControlModeViewStack, !isHomePageOpen, 'back');

    const historyStacks = currentControlModeViewStackHistory.slice(2);
    currentControlModeViewStackHistory.length = 2;
    for (let i = historyStacks.length - 1; i >= 0; i--) {
      this.cleanupTransientViews(historyStacks[i], currentControlModeViewStackHistory);
    }

    !isHomePageOpen && this.openView(this.activeViewEntry, this.currentControlModeViewStack, true);

    this.handleActiveViewChange();
    this.handleOpenPageChange();

    this.activeViewEntry.wrapperRef.instance.setAnimationClass('gtc-page-open-reverse-animation');

    this.refreshOcclusion();

    return this.activeViewEntry;
  }

  /**
   * Clears the vertical GTC NAV/COM view stack, closing all open popups in the stack and resetting its history.
   * @returns The active view entry after the operation is complete.
   * @throws Error if this service's GTC is horizontal.
   */
  public clearVerticalNavComViewStack(): GtcViewEntry {
    if (this.isHorizontal) {
      throw new Error('GtcService: attempted to clear the vertical GTC NAV/COM view stack in a horizontal GTC');
    }

    const viewStackHistory = this._viewStacks['VERT_NAV_COM'];

    const incomingViewStack: ViewEntry[] | undefined = viewStackHistory[0];
    if (!incomingViewStack) { throw new Error('GtcService: attempted to go back when there is no previous state to go back to'); }

    if (this.isVertNavComViewStackEmpty) {
      return this.activeViewEntry;
    }

    this.closeViewStack(this.activeViewStack, false, 'clear');

    const historyStacks = viewStackHistory.slice(1);
    viewStackHistory.length = 1;
    for (let i = historyStacks.length - 1; i >= 0; i--) {
      this.cleanupTransientViews(historyStacks[i], viewStackHistory);
    }

    this.handleActiveViewChange();
    this.handleOpenPageChange();

    this.refreshOcclusion();

    return this.activeViewEntry;
  }

  /**
   * Called when an interaction event needs to be sent to the active view.
   * @param event The event.
   */
  public onInteractionEvent(event: GtcInteractionEvent): void {
    if (!this._isAwake.get()) {
      return;
    }

    const wasHandled: boolean = this.activeViewEntry.ref.onGtcInteractionEvent(event);
    !wasHandled && this.gtcKnobHandler.handleDefaultInteractionBehavior(event);
  }

  /**
   * Retrieves a view entry for opening
   * @param key A GtcView key
   * @param viewStackKey The key to the view stack that the view is in.
   * @throws Errors if the passed key was never registered
   * @returns The view entry to open
   */
  private getViewEntry<T extends GtcView = GtcView>(key: string, viewStackKey: ViewStackKey): ViewEntry<T> {
    // This part is essentially the same as top part of the NXi's ViewService.open()
    const viewEntry = this.registeredViews.get(viewStackKey)!.get(key);
    if (!viewEntry) { throw new Error(`${key} wasn't registered as a view`); }
    return viewEntry as ViewEntry<T>;
  }

  /**
   * Handles logic associated with changing the active view.
   */
  private handleActiveViewChange(): void {
    // Call the Resume lifecycle method on the incoming view
    this.activeViewEntry.ref.onResume();
    this._activeView.set(this.activeViewEntry);
  }

  /**
   * Handles logic associated with changing the open page.
   */
  private handleOpenPageChange(): void {
    this._currentPage.set(this.currentPageEntry);
  }

  /**
   * Refreshes the occlusion state of all views in the current view stack.
   */
  private refreshOcclusion(): void {
    const stack = this.activeViewStack;

    let occlusion: GtcViewOcclusionType = 'none';

    for (let i = stack.length - 1; i >= 0; i--) {
      const entry = stack[i];

      entry.occlusion.set(occlusion);

      if (entry.popupBackgroundOcclusion.get() === 'hide') {
        occlusion = 'hide';
      } else if (entry.popupBackgroundOcclusion.get() === 'darken' && occlusion !== 'hide') {
        occlusion = 'darken';
      }
    }
  }

  /**
   * Handle logic associated with opening a view
   * @param view The view to open.
   * @param viewStack The view stack containing the view to open.
   * @param wasPreviouslyOpened True if this view was already open in a previous stack. Defaults to false.
   * @throws Errors if view cannot be found in the view stack
   */
  private openView(view: RenderedViewEntry, viewStack: ViewEntry[], wasPreviouslyOpened = false): void {
    view.ref.onOpen(wasPreviouslyOpened);
    view.isVisible.set(true);
    const index: number = viewStack.indexOf(view);
    if (index < 0) { throw new Error(`GtcService: view not found in view stack: ${view.key}`); }
    view.layer.set(index);
    view.wrapperRef.instance.setAnimationClass(null); // This clears any closing animation classes from the view wrapper.
  }

  /**
   * Closes a view.
   * @param view The view to close.
   * @param closeType The type of close operation.
   * @param skipPopupCloseAnimation Whether to skip the close animation for popups.
   */
  private closeView(view: RenderedViewEntry, closeType: 'advance' | 'back' | 'clear', skipPopupCloseAnimation: boolean): void {
    view.ref.onClose();

    // Note that we don't reset layer (z-index) here in order to allow the view's closing animation to play properly.
    // Setting isVisible to false is OK because there's a built-in delay before that takes effect.
    view.isVisible.set(false);
    view.occlusion.set('none');
    view.popupBackgroundOcclusion.set(undefined);

    const viewType = view.type.get();

    if (viewType === 'page') {
      let animation: string;

      switch (closeType) {
        case 'advance':
          animation = 'gtc-page-close-forward-animation';
          break;
        case 'back':
          animation = 'gtc-page-close-reverse-animation';
          break;
        default:
          animation = 'gtc-page-close-animation';
          break;
      }

      view.wrapperRef.instance.setAnimationClass(animation);
    } else if (viewType === 'popup') {
      view.wrapperRef.instance.setAnimationClass(
        skipPopupCloseAnimation ? 'gtc-popup-skip-close-animation' : `gtc-popup-${view.popupType.get()}-close-animation`
      );
    }
  }

  /**
   * Close all views in the current view stack, optionally leaving the current page open.
   * @param viewStack The view stack to close.
   * @param closePage Whether to close the open page in the view stack.
   * @param closeType The type of close operation.
   */
  private closeViewStack(viewStack: RenderedViewEntry[], closePage: boolean, closeType: 'advance' | 'back' | 'clear'): void {
    for (let i = viewStack.length - 1; i >= 0; i--) {
      const entry = viewStack[i];
      const type = entry.type.get();

      if (type === 'base' || (type === 'page' && !closePage)) {
        continue;
      }

      this.closeView(entry, closeType, true);
    }
  }

  /**
   * Iterates through a view stack and cleans up all views with the transient lifecycle policy that are not contained
   * within a given view stack history.
   * @param viewStack The view stack containing the views to clean up.
   * @param viewStackHistory A view stack history containing views which should not be cleaned up.
   */
  private cleanupTransientViews(viewStack: RenderedViewEntry[], viewStackHistory: RenderedViewEntry[][]): void {
    for (let i = viewStack.length - 1; i >= 0; i--) {
      const viewEntry = viewStack[i];
      if (viewEntry.lifecyclePolicy === GtcViewLifecyclePolicy.Transient && viewEntry.wrapperRef) {
        let canCleanup = true;
        for (let j = viewStackHistory.length - 1; j >= 0; j--) {
          if (viewStackHistory[j].includes(viewEntry)) {
            canCleanup = false;
            break;
          }
        }

        if (canCleanup) {
          this.cleanupView(viewEntry);
        }
      }
    }
  }

  /**
   * Creates a new empty view entry.
   * @param key The key of the view entry.
   * @param controlMode The control mode of the new entry.
   * @param displayPaneIndex The display pane index of the new entry.
   * @returns A new empty view entry.
   */
  private createEmptyViewEntry(key: string, controlMode: GtcControlMode, displayPaneIndex?: ControllableDisplayPaneIndex): ViewEntry {
    const wrapperRef = FSComponent.createRef<StandardGtcViewWrapper>();
    const isVisible: Subject<boolean> = Subject.create<boolean>(false);
    const layer: Subject<number> = Subject.create(-1);
    const type = Subject.create<GtcViewType | undefined>(undefined);
    const popupType = Subject.create<GtcPopupType | undefined>(undefined);
    const popupBackgroundOcclusion = Subject.create<GtcViewOcclusionType | undefined>(undefined);
    const occlusion = Subject.create<GtcViewOcclusionType>('none');

    const viewNode = <EmptyGtcView gtcService={this} controlMode={controlMode} displayPaneIndex={displayPaneIndex} />;

    (
      <EmptyGtcViewWrapper ref={wrapperRef}>
        {viewNode}
      </EmptyGtcViewWrapper>
    );

    const ref: GtcView = viewNode.instance as GtcView;
    return {
      lifecyclePolicy: GtcViewLifecyclePolicy.Static,
      key,
      factory: () => viewNode,
      ref,
      wrapperRef,
      isVisible,
      layer,
      type,
      popupType,
      popupBackgroundOcclusion,
      occlusion
    };
  }
}

/**
 * A wrapper for a GTC view.
 */
interface GtcViewWrapper<P extends ComponentProps = ComponentProps> extends DisplayComponent<P> {
  /**
   * Sets the wrapper's animation CSS class. The new class will replace the existing animation class.
   * @param animationClass The animation CSS class to set, or `null` to remove any existing animation class.
   */
  setAnimationClass(animationClass: string | null): void;
}

/** Props for the StandardGtcViewWrapper component. */
interface StandardGtcViewWrapperProps extends ComponentProps {
  /** State of the component's visibility */
  isVisible: Subscribable<boolean>;

  /** The component's position in the view stack. */
  layer: Subscribable<number>;

  /** The type the view is currently opened as, either page or popup or base. */
  type: Subscribable<GtcViewType | undefined>;

  /** The popup type of the view, or `undefined` if the view is not currently opened as a popup. */
  popupType: Subscribable<GtcPopupType | undefined>;

  /**
   * The occlusion type applied to views beneath this entry's view when it is opened as a popup, or `undefined` if the
   * view is not currently opened as a popup.
   */
  popupBackgroundOcclusion: Subscribable<GtcViewOcclusionType | undefined>;

  /** The type of occlusion applied to the view. */
  occlusion: Subscribable<GtcViewOcclusionType>;
}

/**
 * A GTC view wrapper used to control the visibility, animations, and occlusion of its child view.
 */
class StandardGtcViewWrapper extends DisplayComponent<StandardGtcViewWrapperProps> implements GtcViewWrapper<StandardGtcViewWrapperProps> {
  private static readonly RESERVED_CSS_CLASSES = [
    'gtc-view',
    'gtc-page-wrapper',
    'gtc-popup-wrapper',
    'gtc-popup-normal-wrapper',
    'gtc-popup-slideout-right-wrapper',
    'gtc-popup-slideout-right-full-wrapper',
    'gtc-popup-slideout-bottom-wrapper',
    'gtc-popup-no-background-occlusion',
    'occlude-darken',
    'occlude-hidden',
    'hidden'
  ];

  private static readonly HIDE_DELAY = 1000; // milliseconds

  private thisNode?: VNode;

  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  private readonly style = ObjectSubject.create({
    'z-index': ''
  });

  private readonly classList = SetSubject.create(['gtc-view', 'hidden']);

  private readonly hideDebounce = new DebounceTimer();

  private readonly subs = [] as Subscription[];

  private currentAnimationClass: string | null = null;

  private isAlive = true;

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    const hide = (): void => {
      if (this.isAlive) {
        this.classList.add('hidden');
      } else {
        this.doDestroy();
      }
    };

    this.subs.push(this.props.isVisible.sub(isVisible => {
      if (isVisible) {
        this.hideDebounce.clear();
        this.classList.delete('hidden');
      } else {
        // hack to ensure that any views with closing animations get to play them before the view disappears
        this.hideDebounce.schedule(hide, StandardGtcViewWrapper.HIDE_DELAY);
      }
    }, true));

    this.subs.push(this.props.layer.sub(layer => {
      this.style.set('z-index', layer < 0 ? '' : layer.toString());
    }, true));

    this.subs.push(this.props.type.sub(type => {
      this.classList.toggle('gtc-page-wrapper', type === 'page');
      this.classList.toggle('gtc-popup-wrapper', type === 'popup');
    }, true));

    this.subs.push(this.props.popupType.sub(popupType => {
      this.classList.toggle('gtc-popup-normal-wrapper', popupType === 'normal');
      this.classList.toggle('gtc-popup-slideout-right-wrapper', popupType === 'slideout-right');
      this.classList.toggle('gtc-popup-slideout-right-full-wrapper', popupType === 'slideout-right-full');
      this.classList.toggle('gtc-popup-slideout-bottom-wrapper', popupType === 'slideout-bottom');
    }, true));

    this.subs.push(this.props.popupBackgroundOcclusion.sub(occlusion => {
      this.classList.toggle('gtc-popup-no-background-occlusion', occlusion === 'none');
    }, true));

    this.subs.push(this.props.occlusion.sub(occlusion => {
      this.classList.toggle('occlude-darken', occlusion === 'darken');
      this.classList.toggle('occlude-hidden', occlusion === 'hide');
    }, true));
  }

  /** @inheritdoc */
  public setAnimationClass(animationClass: string | null): void {
    if (animationClass === this.currentAnimationClass) {
      return;
    }

    if (StandardGtcViewWrapper.RESERVED_CSS_CLASSES.includes(animationClass as any)) {
      return;
    }

    if (this.currentAnimationClass !== null) {
      this.classList.delete(this.currentAnimationClass);
    }

    this.currentAnimationClass = animationClass;

    if (this.currentAnimationClass !== null) {
      this.classList.add(this.currentAnimationClass);
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div ref={this.rootRef} class={this.classList} style={this.style}>
        {this.props.children}
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    this.subs.forEach(x => x.destroy());

    if (!this.hideDebounce.isPending()) {
      this.doDestroy();
    }
  }

  /**
   * Executes cleanup code when this wrapper is destroyed.
   */
  private doDestroy(): void {
    const root = this.rootRef.getOrDefault();
    if (root !== null) {
      root.parentNode?.removeChild(root);
    }

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.hideDebounce.clear();

    super.destroy();
  }
}

/**
 * An empty GTC view wrapper that is not rendered to the DOM.
 */
class EmptyGtcViewWrapper extends DisplayComponent<ComponentProps> implements GtcViewWrapper {
  /** @inheritdoc */
  public setAnimationClass(): void {
    // noop
  }

  /** @inheritDoc */
  public render(): null {
    return null;
  }
}

/**
 * An empty GTC view that is not rendered to the DOM.
 */
class EmptyGtcView extends GtcView {
  /** @inheritdoc */
  public render(): null {
    return null;
  }
}

/**
 * Do something for each pane index.
 * @param func The thing to do.
 */
function forEachPaneIndex(func: (paneIndex: 1 | 2 | 3 | 4) => void): void {
  for (let i = 1 as 1 | 2 | 3 | 4; i <= 4; i++) {
    func(i);
  }
}
import {
  ArrayUtils, ComponentProps, ConsumerSubject, DebounceTimer, DisplayComponent, EventBus, FSComponent, NodeReference,
  ObjectSubject, SetSubject, Subject, Subscribable, Subscription, UserSetting, VNode
} from '@microsoft/msfs-sdk';

import { ObsSuspDataProvider } from '@microsoft/msfs-garminsdk';

import {
  AvionicsConfig, ComRadio, ControllableDisplayPaneIndex, DefaultInitializationDataProvider, DisplayPaneControlEvents,
  DisplayPaneControlGtcIndex, DisplayPaneEvents, DisplayPaneIndex, DisplayPaneUtils,
  DisplayPanesAliasedUserSettingManager, DisplayPanesUserSettings, GtcViewKeys, InitializationDataProvider,
  InitializationTaskData, InitializationTaskDef
} from '@microsoft/msfs-wtg3000-common';

import { GtcConfig } from '../Config/GtcConfig';
import { GtcUserSettings } from '../Settings/GtcUserSettings';
import { GtcInteractionEvent, GtcInteractionEventUtils, GtcInteractionHandler } from './GtcInteractionEvent';
import { GtcKnobHandler } from './GtcKnobHandler';
import { GtcKnobStatePluginOverrides, GtcKnobStates, GtcKnobStatesManager } from './GtcKnobStates';
import { GtcView } from './GtcView';

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

/**
 * Keys used to reference GTC view stacks.
 */
export enum GtcViewStackKey {
  Pfd = 'PFD',
  Mfd1 = 'MFD1',
  Mfd2 = 'MFD2',
  Mfd3 = 'MFD3',
  Mfd4 = 'MFD4',
  NavCom = 'NAV_COM',
  PfdOverlay = 'PFD_OVERLAY',
  MfdOverlay = 'MFD_OVERLAY',
  NavComOverlay = 'NAV_COM_OVERLAY'
}

/**
 * A record of references to GTC view stack containers keyed by view stack key.
 */
export type GtcViewStackRefs = Partial<Record<GtcViewStackKey, GtcViewStackContainer>>;

// For backwards compatibility.
/**
 * A record of references to GTC view stack containers keyed by view stack key.
 */
export type ViewStackRefs = GtcViewStackRefs;

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

  /** Whether this entry's view is in-use. */
  isInUse: boolean;

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

/**
 * An item describing a GTC view within a view stack history state.
 */
type ViewStackItem<T extends GtcView = GtcView> = {
  /** Whether the GTC view is in an overlay view stack. */
  isInOverlayStack: boolean;

  /** The entry for the GTC view. */
  viewEntry: RenderedViewEntry<T>;

  /** The view type as which the GTC view was opened. */
  type: GtcViewType;

  /** The popup type as which the GTC view was opened, or `undefined` if the view was not opened as a popup. */
  popupType: GtcPopupType | undefined;

  /** The occlusion type applied to views beneath this entry's view, or `undefined` if no occlusion was applied. */
  backgroundOcclusion: GtcViewOcclusionType | undefined;
};

/**
 * An entry describing a rendered GTC view registered to a view stack.
 */
export type GtcViewEntry<T extends GtcView = GtcView> = Pick<RenderedViewEntry<T>, 'key' | 'ref'>;

/**
 * An item describing a GTC view within a view stack.
 */
export type GtcViewStackItem<T extends GtcView = GtcView> = {
  /** Whether the GTC view is in an overlay view stack. */
  readonly isInOverlayStack: boolean;

  /** The entry for the GTC view. */
  readonly viewEntry: GtcViewEntry<T>;

  /** The view type as which the GTC view was opened. */
  readonly type: GtcViewType;
};

/** A service to manage GTC views */
export class GtcService {
  private static readonly BASE_VIEW_KEY = '$BaseView$';

  /** The orientation (horizontal or vertical) of this service's parent GTC. */
  public readonly orientation = this.instrumentConfig.orientation;

  /** Whether this service's parent GTC is horizontal. */
  public readonly isHorizontal = this.orientation === 'horizontal';

  /** The control mode setup supported by this service's parent GTC. */
  public readonly controlSetup = this.instrumentConfig.controlSetup;

  /** The index of the PFD controlled by this service's parent GTC. */
  public readonly pfdControlIndex = this.instrumentConfig.pfdControlIndex;

  /** The display pane controlling index of this service's parent GTC. */
  public readonly displayPaneControlIndex = this.instrumentConfig.paneControlIndex;

  /** Whether this GTC has an MFD mode and can control display panes. */
  public readonly hasMfdMode = this.controlSetup === 'all' || this.controlSetup === 'mfd';
  /** Whether this GTC has a PFD mode. */
  public readonly hasPfdMode = this.controlSetup === 'all' || this.controlSetup === 'pfd' || this.controlSetup === 'pfd-navcom';
  /** Whether this GTC has a NAV_COM. */
  public readonly hasNavComMode = this.controlSetup === 'all' || this.controlSetup === 'pfd-navcom';

  /** Whether advanced VNAV is enabled. */
  public readonly isAdvancedVnav = this.config.vnav.advanced;

  private readonly hEventMap = GtcInteractionEventUtils.hEventMap(this.orientation, this.instrumentIndex);

  private readonly _activeControlMode = Subject.create<GtcControlMode>('PFD');
  /** The currently active control mode. */
  public readonly activeControlMode = this._activeControlMode as Subscribable<GtcControlMode>;

  private readonly registeredViews: Map<GtcViewStackKey, Map<string, ViewEntry>> = new Map();

  private readonly _viewStacks: Record<GtcViewStackKey, ViewStackItem[][]> = {} as any;

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

  // This is a dummy entry that is only meant to be served via the this.activeView subscribable before this service's
  // view stacks are initialized.
  private readonly dummyViewEntry: RenderedViewEntry = this.createEmptyViewEntry('$$dummy$$', 'PFD');

  private readonly _activeView = Subject.create<RenderedViewEntry>(this.dummyViewEntry);
  /** The view that is currently at the top of the active view stack. */
  public readonly activeView: Subscribable<GtcViewEntry> = this._activeView;

  private readonly _currentPage = Subject.create<RenderedViewEntry | null>(null);
  /** The page that is currently open in the active view stack. */
  public readonly currentPage: Subscribable<GtcViewEntry | null> = this._currentPage;

  /** Whether the currently active view is a control mode home page. */
  public readonly activeViewIsNotAHomePage = this._activeView.map(({ key }) => !this.controlModeHomePageKeys.includes(key)) as Subscribable<boolean>;

  /** The string name for which side this GTC is on. */
  public readonly gtcThisSide = this.displayPaneControlIndex === 1 ? 'left' : 'right';
  /** The string name for which side the other GTC is on. */
  public readonly gtcOtherSide = this.displayPaneControlIndex === 1 ? 'right' : 'left';

  /** The GTC specific user settings for this GTC. */
  public readonly gtcSettings = GtcUserSettings.getAliasedManager(this.bus, this.instrumentIndex as 1 | 2 | 3 | 4);

  /** An array containing the indexes of all enabled controllable display panes in ascending order. */
  public readonly enabledControllablePanes: readonly ControllableDisplayPaneIndex[] = DisplayPaneUtils.getEnabledControllablePanes(this.config.gduDefs.pfdCount);

  /** The selected pane for this GTC. */
  public readonly thisGtcSelectedPane = ConsumerSubject.create(
    this.bus.getSubscriber<DisplayPaneEvents>().on(`${this.gtcThisSide}_gtc_selected_display_pane`), -1);
  /** The selected pane for the other GTC. */
  public readonly otherGtcSelectedPane = ConsumerSubject.create(
    this.bus.getSubscriber<DisplayPaneEvents>().on(`${this.gtcOtherSide}_gtc_selected_display_pane`), -1);

  /** The display panes settings master manager. */
  public readonly displayPaneSettingManager = DisplayPanesUserSettings.getMasterManager(this.bus);
  /** The visibility setting for each display pane. */
  public readonly displayPaneVisibleSettings: Record<ControllableDisplayPaneIndex, UserSetting<boolean>> = {
    [DisplayPaneIndex.LeftPfd]: this.displayPaneSettingManager.getSetting(`displayPaneVisible_${DisplayPaneIndex.LeftPfd}`),
    [DisplayPaneIndex.LeftMfd]: this.displayPaneSettingManager.getSetting(`displayPaneVisible_${DisplayPaneIndex.LeftMfd}`),
    [DisplayPaneIndex.RightMfd]: this.displayPaneSettingManager.getSetting(`displayPaneVisible_${DisplayPaneIndex.RightMfd}`),
    [DisplayPaneIndex.RightPfd]: this.displayPaneSettingManager.getSetting(`displayPaneVisible_${DisplayPaneIndex.RightPfd}`),
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

  private readonly _initializationDataProvider = new DefaultInitializationDataProvider(this.bus);
  /** A provider of initialization data. */
  public readonly initializationDataProvider = this._initializationDataProvider as InitializationDataProvider;

  private isInitializationPageArmed = false;
  private readonly loadedInitializationTasks: Record<ControllableDisplayPaneIndex, InitializationTaskDef | null> = {
    [DisplayPaneIndex.LeftPfd]: null,
    [DisplayPaneIndex.LeftMfd]: null,
    [DisplayPaneIndex.RightMfd]: null,
    [DisplayPaneIndex.RightPfd]: null
  };

  private readonly _currentInitializationTask = Subject.create<InitializationTaskDef | null>(null);
  /** The current initialization task loaded for the active view stack. */
  public readonly currentInitializationTask = this._currentInitializationTask as Subscribable<InitializationTaskDef | null>;

  private readonly _nextInitializationTask = Subject.create<InitializationTaskDef | null>(null);
  /** The initialization task that follows the current initialization task loaded for the active view stack. */
  public readonly nextInitializationTask = this._nextInitializationTask as Subscribable<InitializationTaskDef | null>;

  /** The control states of the hardware knobs attached to this service's parent GTC. */
  public readonly gtcKnobStates: GtcKnobStates;

  private readonly gtcKnobHandler: GtcKnobHandler;
  private pluginInteractionHandler?: GtcInteractionHandler;

  /** Should be populated before anyone uses it. */
  private viewStackRefs!: ViewStackRefs;

  /**
   * Creates an instance of GtcService.
   * @param bus The event bus.
   * @param instrumentIndex The index of the GTC instrument to which this service belongs.
   * @param config The general avionics configuration object.
   * @param instrumentConfig The GTC instrument configuration object.
   * @param obsSuspDataProvider A provider of LNAV OBS/suspend data.
   * @throws Error if {@linkcode defaultControlMode} is incompatible with {@linkcode controlSetup}.
   */
  public constructor(
    public readonly bus: EventBus,
    public readonly instrumentIndex: number,
    private readonly config: AvionicsConfig,
    private readonly instrumentConfig: GtcConfig,
    obsSuspDataProvider: ObsSuspDataProvider
  ) {
    switch (instrumentConfig.defaultControlMode) {
      case 'PFD':
        if (!this.hasPfdMode) {
          throw new Error(`GtcService: default control mode 'PFD' is incompatible with '${this.controlSetup}' control setup`);
        }
        break;
      case 'MFD':
        if (!this.hasMfdMode) {
          throw new Error(`GtcService: default control mode 'MFD' is incompatible with '${this.controlSetup}' control setup`);
        }
        break;
      case 'NAV_COM':
        if (!this.hasNavComMode) {
          throw new Error(`GtcService: default control mode 'NAV_COM' is incompatible with '${this.controlSetup}' control setup`);
        }
        break;
    }

    // Create view stack arrays.
    for (const key of Object.values(GtcViewStackKey)) {
      this._viewStacks[key] = [];
    }

    // These need to be instantiated after everything else is set up because they require a fully initialized GtcService.
    this.gtcKnobStates = new GtcKnobStatesManager(this, obsSuspDataProvider);
    this.gtcKnobHandler = new GtcKnobHandler(this);

    this._initializationDataProvider.init();

    const updateViewStackVisibility = this.updateViewStackVisibility.bind(this);

    this.activeControlMode.sub(updateViewStackVisibility);

    if (this.hasMfdMode) {
      const paneEvents = this.bus.getSubscriber<DisplayPaneEvents>();

      // We set it here because we need to be able to override selectedDisplayPane manually
      paneEvents.on(`${this.gtcThisSide}_gtc_selected_display_pane`).handle(paneIndex => {
        this._selectedDisplayPane.set(paneIndex);

        if (paneIndex !== -1) {
          this.selectedPaneSettings.useDisplayPaneSettings(paneIndex);
        }
      });

      this.desiredDisplayPane.sub(updateViewStackVisibility);
      this._selectedDisplayPane.sub(this.updateDesiredDisplayPaneFromSelected.bind(this), true);

      this.displayPaneVisibleSettings[2].sub(this.handleMfdPaneVisibilityChanged);
      this.displayPaneVisibleSettings[3].sub(this.handleMfdPaneVisibilityChanged);

      const refreshInitializationState = this.refreshInitializationState.bind(this);
      this._initializationDataProvider.isEnabled.sub(refreshInitializationState);
      this._initializationDataProvider.tasks.sub(refreshInitializationState);
      refreshInitializationState();

      this._initializationDataProvider.isEnabled.sub(this.onIsInitializationEnabledChanged.bind(this));
      this._initializationDataProvider.isAccepted.sub(this.onIsInitializationAcceptedChanged.bind(this));
    }
  }

  /**
   * Gets this service's current default control mode.
   * @returns This service's current default control mode.
   */
  private getCurrentDefaultControlMode(): GtcControlMode {
    // NOTE: this method exists because if we ever decide to implement reversionary modes or handling of disabled GDUs,
    // the default control mode will change depending on which GDUs are available to be controlled.
    return this.instrumentConfig.defaultControlMode;
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

  /**
   * Hides inactive view stacks, and reveals the active one.
   */
  private updateViewStackVisibility(): void {
    const mode = this.activeControlMode.get();
    const pane = this.desiredDisplayPane.get();

    this.setViewStackVisibility(GtcViewStackKey.Pfd, mode === 'PFD');
    this.setViewStackVisibility(GtcViewStackKey.PfdOverlay, mode === 'PFD');

    forEachPaneIndex(i => { this.setViewStackVisibility(GtcService.getViewStackKey('MFD', false, i), mode === 'MFD' && pane === i); });
    this.setViewStackVisibility(GtcViewStackKey.MfdOverlay, mode === 'MFD');

    this.setViewStackVisibility(GtcViewStackKey.NavCom, mode === 'NAV_COM');
    this.setViewStackVisibility(GtcViewStackKey.NavComOverlay, mode === 'NAV_COM');
  }

  /**
   * Sets the visibility of a view stack.
   * @param key The key of the view stack.
   * @param isVisible Whether the view stack is visible.
   */
  private setViewStackVisibility(key: keyof ViewStackRefs, isVisible: boolean): void {
    const viewStack = this._viewStacks[key];
    const container = this.viewStackRefs[key];

    // Need to remove any animation classes on all views in the incoming stack, to prevent them from being played
    const activeViewStack = viewStack[viewStack.length - 1] as ViewStackItem[] | undefined;
    if (activeViewStack !== undefined) {
      for (let i = 0; i < activeViewStack.length; i++) {
        activeViewStack[i].viewEntry.wrapperRef.instance.setAnimationClass(null);
      }
    }

    container?.setVisible(isVisible);
  }

  /**
   * Updates this service's desired controlled display pane from the currently selected display pane. If there is no
   * currently selected display pane, then the value of the desired controlled display pane remains unchanged.
   * Otherwise, the desired controlled display pane is changed to the selected display pane.
   */
  private updateDesiredDisplayPaneFromSelected(): void {
    const selectedDisplayPane = this._selectedDisplayPane.get();

    if (selectedDisplayPane === -1) { return; }

    const oldDisplayPaneIndex = this.desiredDisplayPane.get();
    if (oldDisplayPaneIndex !== selectedDisplayPane) {
      // If the currently active control mode is MFD, then changing the desired pane will change the current main view
      // stack. If that happens, then the current open page is guaranteed to change. The active view will also change
      // if the overlay stack is empty (if the overlay stack is not empty, then the active view won't change because
      // changing the desired pane doesn't change the current overlay view stack).

      const isMfdControlMode = this.activeControlMode.get() === 'MFD';
      const needChangeActiveView = isMfdControlMode && this.isCurrentOverlayViewStackEmpty();

      if (needChangeActiveView) {
        this.getActiveViewItem().viewEntry.ref.onPause();
      }

      this.desiredDisplayPane.set(selectedDisplayPane);

      if (isMfdControlMode) {
        if (needChangeActiveView) {
          this.handleActiveViewChange();
        }
        this.handleOpenPageChange();

        this.updateInitializationTasksForActiveViewStack();

        // When changing display panes in MFD control mode, if the initialization page was in use in the old view
        // stack, open the initialization page in the new view stack if it is not already in use.
        if (this.isInitializationPageInUse(oldDisplayPaneIndex)) {
          this.openInitializationPage();
        }
      }
    }
  }

  // eslint-disable-next-line jsdoc/require-returns
  /**
   * Whether the current vertical GTC NAV/COM view stack (i.e. the overlay view stack for the currently selected
   * control mode) has no open popups.
   */
  public get isVertNavComViewStackEmpty(): boolean {
    return this.isHorizontal || this.isCurrentOverlayViewStackEmpty();
  }

  /**
   * Gets the history stack for this service's current main view stack. The current main view stack is the main view
   * stack for the currently selected control mode and display pane (if applicable).
   * @returns The history stack for this service's current main view stack.
   */
  private getCurrentMainViewStackHistory(): ViewStackItem[][] {
    return this._viewStacks[GtcService.getViewStackKey(this._activeControlMode.get(), false, this.desiredDisplayPane.get())];
  }

  /**
   * Gets the history stack for this service's current overlay view stack. The current overlay view stack is the
   * overlay view stack for the currently selected control mode.
   * @returns The history stack for this service's current main overlay stack.
   */
  private getCurrentOverlayViewStackHistory(): ViewStackItem[][] {
    return this._viewStacks[GtcService.getViewStackKey(this._activeControlMode.get(), true)];
  }

  /**
   * Checks if this service's current overlay view stack is empty. The current overlay view stack is the overlay view
   * stack for the currently selected control mode.
   * @returns Whether this service's current overlay view stack is empty.
   */
  private isCurrentOverlayViewStackEmpty(): boolean {
    return this.getCurrentOverlayViewStackHistory().length <= 1;
  }

  /**
   * Gets the history stack for this service's current view stack. The current view stack is the current overlay view
   * stack if it is not empty and the current main view stack otherwise.
   * @returns The history stack for this service's current view stack.
   */
  private getCurrentViewStackHistory(): ViewStackItem[][] {
    return this.isCurrentOverlayViewStackEmpty() ? this.getCurrentMainViewStackHistory() : this.getCurrentOverlayViewStackHistory();
  }

  /**
   * Gets the open stack for this service's current main view stack. The current main view stack is the main view
   * stack for the currently selected control mode and display pane (if applicable). The open stack contains all open
   * views in the view stack (i.e. it is the most recent history state of the view stack).
   * @returns The open stack for this service's current main view stack.
   */
  private getCurrentOpenMainStack(): ViewStackItem[] {
    return ArrayUtils.last(this.getCurrentMainViewStackHistory());
  }

  /**
   * Gets the open stack for this service's current overlay view stack. The current overlay view stack is the overlay
   * view stack for the currently selected control mode. The open stack contains all open views in the view stack (i.e.
   * it is the most recent history state of the view stack).
   * @returns The open stack for this service's current overlay view stack.
   */
  private getCurrentOpenOverlayStack(): ViewStackItem[] {
    return ArrayUtils.last(this.getCurrentOverlayViewStackHistory());
  }

  /**
   * Gets the open stack for this service's current view stack. The current view stack is the current overlay view
   * stack if it is not empty and the current main view stack otherwise. The open stack contains all open views in the
   * view stack (i.e. it is the most recent history state of the view stack).
   * @returns The open stack for this service's current view stack.
   */
  private getCurrentOpenStack(): ViewStackItem[] {
    return this.isCurrentOverlayViewStackEmpty() ? this.getCurrentOpenMainStack() : this.getCurrentOpenOverlayStack();
  }

  /**
   * Gets the view stack item for the current active view.
   * @returns The view stack item for the current active view.
   */
  private getActiveViewItem(): ViewStackItem {
    return ArrayUtils.last(this.getCurrentOpenStack());
  }

  /**
   * Gets the view stack item for the open page in the currently selected view stack.
   * @returns The view stack item for the open page in the currently selected view stack, or `null` if the currently
   * selected view stack has no open page.
   */
  private getCurrentOpenPageViewStackItem(): ViewStackItem | null {
    return this.getCurrentOpenMainStack()[1] ?? null;
  }

  /**
   * Called by GtcContainer to pass in the refs to all the view stacks.
   * Should only be called once.
   * @param viewStackRefs The view stack refs.
   */
  public onGtcContainerRendered(viewStackRefs: ViewStackRefs): void {
    this.viewStackRefs = viewStackRefs;
    Object.keys(viewStackRefs).forEach(key => this.registeredViews.set(key as GtcViewStackKey, new Map()));
  }

  /**
   * Attaches plugin-defined knob control state overrides.
   * @param overrides An array of plugin-defined knob control state overrides. The array should be ordered such that
   * the overrides appear in the order in which their parent plugins were loaded.
   */
  public attachPluginKnobStateOverrides(overrides: readonly Readonly<GtcKnobStatePluginOverrides>[]): void {
    (this.gtcKnobStates as GtcKnobStatesManager).attachPluginOverrides(overrides);
  }

  /**
   * Attaches an interaction event handler which executes event handling logic defined by plugins.
   * @param handler The interaction event handler to attach.
   */
  public attachPluginInteractionhandler(handler: GtcInteractionHandler): void {
    this.pluginInteractionHandler = handler;
  }

  /**
   * Registers and renders a view (page or popup) with this service for a main view stack. Once a view is registered,
   * it may be opened by referencing its key.
   *
   * Each view is registered with a specific view stack. There is one main view stack for each of the PFD and NAV/COM
   * control modes, and four main view stacks for the MFD control mode (one for each controllable display pane). Views
   * registered with different stacks may share the same key. Registering a view under the same key as an existing
   * view in the same stack will replace the existing view.
   *
   * If this service's parent GTC has the horizontal orientation, then registering views for the NAV/COM view stack
   * using this method will cause the views to be registered for the PFD and MFD overlay view stacks instead.
   * @param lifecyclePolicy The lifecycle policy to apply to the view. If the view is registered under a home page key,
   * then this value is ignored and the {@link GtcViewLifecyclePolicy.Static} policy will automatically be applied.
   * @param key The key to register the view under.
   * @param controlMode The control mode for which to register the view.
   * @param factory A function that renders the view.
   * @param displayPaneIndex The index of the display pane for which to register the view. Ignored if `controlMode` is
   * not `'MFD'`. If not defined, then the view will be registered once for each display pane.
   */
  public registerView(
    lifecyclePolicy: GtcViewLifecyclePolicy,
    key: string,
    controlMode: GtcControlMode,
    factory: (gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex: ControllableDisplayPaneIndex | undefined, isInOverlayStack: boolean) => VNode,
    displayPaneIndex?: ControllableDisplayPaneIndex
  ): void {
    switch (controlMode) {
      case 'PFD':
        if (this.hasPfdMode) {
          // Force static lifecycle policy for home pages.
          if (key === this.controlModeHomePages['PFD']) {
            lifecyclePolicy = GtcViewLifecyclePolicy.Static;
          }

          this._registerView(lifecyclePolicy, key, GtcViewStackKey.Pfd, () => factory(this, 'PFD', undefined, false));
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
              this._registerView(lifecyclePolicy, key, GtcService.getViewStackKey('MFD', false, i), () => factory(this, 'MFD', i, false));
            });
          } else {
            this._registerView(lifecyclePolicy, key, GtcService.getViewStackKey('MFD', false, displayPaneIndex), () => factory(this, 'MFD', displayPaneIndex, false));
          }
        }
        break;
      case 'NAV_COM':
        if (!this.isHorizontal) {
          this.registerOverlayView(lifecyclePolicy, key, factory, 'PFD');
          this.registerOverlayView(lifecyclePolicy, key, factory, 'MFD');
        } else if (this.hasNavComMode) {
          // Force static lifecycle policy for home pages.
          if (key === this.controlModeHomePages['NAV_COM']) {
            lifecyclePolicy = GtcViewLifecyclePolicy.Static;
          }

          this._registerView(lifecyclePolicy, key, GtcViewStackKey.NavCom, () => factory(this, 'NAV_COM', undefined, false));
        }
        break;
    }
  }

  /**
   * Registers and renders a view (page or popup) with this service for an overlay view stack. Once a view is
   * registered, it may be opened by referencing its key.
   *
   * Each view is registered with a specific view stack. There is one overlay view stack for each of the three control
   * modes (PFD, MFD, and NAV/COM). Registering a view under the same key as an existing view in the same stack will
   * replace the existing view.
   * @param lifecyclePolicy The lifecycle policy to apply to the view. If the view is registered under a home page key,
   * then this value is ignored and the {@link GtcViewLifecyclePolicy.Static} policy will automatically be applied.
   * @param key The key to register the view under.
   * @param factory A function that renders the view.
   * @param controlMode The control mode for which to register the view. If not defined, then the view will be
   * registered once for each control mode supported by this service.
   */
  public registerOverlayView(
    lifecyclePolicy: GtcViewLifecyclePolicy,
    key: string,
    factory: (gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex: ControllableDisplayPaneIndex | undefined, isInOverlayStack: boolean) => VNode,
    controlMode?: GtcControlMode
  ): void {
    if ((controlMode === undefined || controlMode === 'PFD') && this.hasPfdMode) {
      this._registerView(lifecyclePolicy, key, GtcViewStackKey.PfdOverlay, () => factory(this, 'PFD', undefined, true));
    }

    if ((controlMode === undefined || controlMode === 'MFD') && this.hasMfdMode) {
      this._registerView(lifecyclePolicy, key, GtcViewStackKey.MfdOverlay, () => factory(this, 'MFD', undefined, true));
    }

    if ((controlMode === undefined || controlMode === 'NAV_COM') && this.hasNavComMode) {
      this._registerView(lifecyclePolicy, key, GtcViewStackKey.NavComOverlay, () => factory(this, 'NAV_COM', undefined, true));
    }
  }

  /**
   * Registers a view (page or popup) with this service.
   * @param lifecyclePolicy The lifecycle policy to apply to the view.
   * @param key The view's key.
   * @param viewStackKey The key of the view stack to insert the view into.
   * @param factory A function which renders the view.
   */
  private _registerView(
    lifecyclePolicy: GtcViewLifecyclePolicy,
    key: string,
    viewStackKey: GtcViewStackKey,
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
      isInUse: false,
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
  private renderView(viewStackKey: GtcViewStackKey, viewEntry: ViewEntry): void {
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
      this.registeredViews.get(GtcViewStackKey.Pfd)!.set(
        GtcService.BASE_VIEW_KEY,
        this.createEmptyViewEntry(GtcService.BASE_VIEW_KEY, 'PFD')
      );
      this.initializeViewStack(GtcViewStackKey.Pfd, this.controlModeHomePages['PFD']);

      this.registeredViews.get(GtcViewStackKey.PfdOverlay)!.set(
        GtcService.BASE_VIEW_KEY,
        this.createEmptyViewEntry(GtcService.BASE_VIEW_KEY, 'PFD')
      );
      this.initializeViewStack(GtcViewStackKey.PfdOverlay);
    }
    if (this.hasMfdMode) {
      forEachPaneIndex(i => {
        const viewStackKey = GtcService.getViewStackKey('MFD', false, i);

        this.registeredViews.get(viewStackKey)!.set(
          GtcService.BASE_VIEW_KEY,
          this.createEmptyViewEntry(GtcService.BASE_VIEW_KEY, 'MFD')
        );
        this.initializeViewStack(viewStackKey, this.controlModeHomePages['MFD']);
      });

      this.registeredViews.get(GtcViewStackKey.MfdOverlay)!.set(
        GtcService.BASE_VIEW_KEY,
        this.createEmptyViewEntry(GtcService.BASE_VIEW_KEY, 'MFD')
      );
      this.initializeViewStack(GtcViewStackKey.MfdOverlay);
    }
    if (this.hasNavComMode) {
      this.registeredViews.get(GtcViewStackKey.NavCom)!.set(
        GtcService.BASE_VIEW_KEY,
        this.createEmptyViewEntry(GtcService.BASE_VIEW_KEY, 'NAV_COM')
      );
      this.initializeViewStack(GtcViewStackKey.NavCom, this.controlModeHomePages['NAV_COM']);

      this.registeredViews.get(GtcViewStackKey.NavComOverlay)!.set(
        GtcService.BASE_VIEW_KEY,
        this.createEmptyViewEntry(GtcService.BASE_VIEW_KEY, 'NAV_COM')
      );
      this.initializeViewStack(GtcViewStackKey.NavComOverlay);
    }

    const defaultControlMode = this.getCurrentDefaultControlMode();

    this._activeControlMode.set(defaultControlMode);

    if (this._isAwake.get()) {
      this.selectDisplayPaneForControlMode(defaultControlMode);
    }

    this.handleActiveViewChange();
    this.handleOpenPageChange();

    this.refreshOcclusion();

    this.updateViewStackVisibility();

    this.hasInitialized = true;
    this.isInitializationPageArmed = true;
    this.tryAutoOpenInitializationPage();
  }

  /**
   * Initializes a view stack.
   * @param viewStackKey The key of the view stack to initialize.
   * @param homePageKey The key of the view stack's home page, or `undefined` if the stack does not have a home page.
   */
  private initializeViewStack(viewStackKey: GtcViewStackKey, homePageKey?: string): void {
    const isOverlay = GtcService.isViewStackKeyOverlay(viewStackKey);

    // Note: base views and home page views always have the static lifecycle policy and so are guaranteed to be rendered.

    const baseViewEntry = this.getViewEntry(GtcService.BASE_VIEW_KEY, viewStackKey) as RenderedViewEntry;
    baseViewEntry.isInUse = true;
    baseViewEntry.ref.onInUse();
    baseViewEntry.ref.onOpen(false);
    baseViewEntry.isVisible.set(true);
    baseViewEntry.layer.set(0);
    baseViewEntry.type.set('base');

    const baseViewStackItem: ViewStackItem = {
      isInOverlayStack: isOverlay,
      viewEntry: baseViewEntry,
      type: 'base',
      popupType: undefined,
      backgroundOcclusion: undefined
    };

    this._viewStacks[viewStackKey].push([baseViewStackItem]);

    if (homePageKey !== undefined) {
      const homePageEntry = this.getViewEntry(homePageKey, viewStackKey) as RenderedViewEntry;
      homePageEntry.isInUse = true;
      homePageEntry.ref.onInUse();
      homePageEntry.ref.onOpen(false);
      homePageEntry.isVisible.set(true);
      homePageEntry.layer.set(1);
      homePageEntry.type.set('page');

      const homePageViewStackItem: ViewStackItem = {
        isInOverlayStack: isOverlay,
        viewEntry: homePageEntry,
        type: 'page',
        popupType: undefined,
        backgroundOcclusion: undefined
      };

      this._viewStacks[viewStackKey].push(
        [baseViewStackItem, homePageViewStackItem]
      );
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

    // Switch to default control mode and go to its home page. This will also close any open views in the overlay
    // stack of the default control mode.

    const defaultControlMode = this.getCurrentDefaultControlMode();
    this.changeControlModeTo(defaultControlMode);
    this.goToHomePage();

    // Close all open views on non-active control mode view stacks and go to the home page for that view stack.

    if (this.hasPfdMode && defaultControlMode !== 'PFD') {
      this.resetViewStack('PFD');
    }
    if (this.hasMfdMode) {
      this.resetViewStack('MFD');
    }
    if (this.hasNavComMode && defaultControlMode !== 'NAV_COM') {
      this.resetViewStack('NAV_COM');
    }

    this._currentInitializationTask.set(null);
    this._nextInitializationTask.set(null);

    // Attempt to select the default display pane to control.

    const defaultControlledPane = this.getDefaultControlledDisplayPane();

    if (this._isAwake.get() && defaultControlMode === 'MFD') {
      if (this.desiredDisplayPane.get() !== defaultControlledPane) {
        this.selectDisplayPaneForControlMode(defaultControlMode);
      }
    } else {
      this.desiredDisplayPane.set(defaultControlledPane);
    }

    this.isInitializationPageArmed = true;
    this.tryAutoOpenInitializationPage();
  }

  /**
   * Resets the main and overlay view stacks for a control mode. If the control mode is not the currently selected
   * control mode, then all open views in the overlay view stack will be closed and the history state of the main
   * view stack will be rewound to the state when only the home page is open. For the `MFD` control mode, the main
   * view stack for each display pane is reset if and only if the currently selected control mode is not `MFD` or if
   * the current desired controlled display pane is not equal to the view stack's display pane.
   * @param controlMode The control mode of the view stacks to reset.
   */
  private resetViewStack(controlMode: GtcControlMode): void {
    if (controlMode !== this._activeControlMode.get()) {
      // Close all views in the overlay stack except the base view.

      const overlayStackHistory = this._viewStacks[GtcService.getViewStackKey(controlMode, true)];

      if (overlayStackHistory.length > 1) {
        this.closeViewStack(overlayStackHistory[overlayStackHistory.length - 1], false, 'clear');
      }

      for (let i = overlayStackHistory.length - 1; i >= 1; i--) {
        this.reconcileViewUseState(overlayStackHistory, i);
      }
      overlayStackHistory.length = 1;
    }

    if (controlMode === 'MFD') {
      forEachPaneIndex(index => {
        this.resetMainViewStack('MFD', GtcService.getViewStackKey('MFD', false, index));
        this.loadedInitializationTasks[index] = null;
      });
    } else {
      this.resetMainViewStack(controlMode, GtcService.getViewStackKey(controlMode, false));
    }
  }

  /**
   * Resets a main view stack for a control mode. If the control mode is not the currently selected control mode,
   * then the history state of the view stack will be rewound to the state when only the home page is open. For the
   * `MFD` control mode, the view stack is reset if and only if the currently selected control mode is not `MFD` or if
   * the current desired controlled display pane is not equal to the view stack's display pane.
   * @param controlMode The control mode of the view stack to reset.
   * @param viewStackKey The key of the view stack to reset.
   */
  private resetMainViewStack(controlMode: GtcControlMode, viewStackKey: GtcViewStackKey): void {
    const mainStackHistory = this._viewStacks[viewStackKey];

    // If the view stack we are trying to reset is the active view stack, ABORT.
    if (this.getCurrentMainViewStackHistory() === mainStackHistory) {
      return;
    }

    // Close all open views except the base view.

    if (mainStackHistory.length > 1) {
      this.closeViewStack(mainStackHistory[mainStackHistory.length - 1], true, 'clear');
    }

    for (let i = mainStackHistory.length - 1; i >= 1; i--) {
      this.reconcileViewUseState(mainStackHistory, i);
    }
    mainStackHistory.length = 1;

    // Open the home page. Do not resume it because it is not in the active view stack.

    // Home page views always have the static lifecycle policy and so are guaranteed to be rendered.
    const homePageEntry = this.getViewEntry(this.controlModeHomePages[controlMode], viewStackKey) as RenderedViewEntry;
    homePageEntry.type.set('page');
    homePageEntry.popupType.set(undefined);
    homePageEntry.popupBackgroundOcclusion.set(undefined);

    const homePageViewStackItem: ViewStackItem = {
      isInOverlayStack: false,
      viewEntry: homePageEntry,
      type: 'page',
      popupType: undefined,
      backgroundOcclusion: undefined
    };

    mainStackHistory.push([...mainStackHistory[0], homePageViewStackItem]);

    this.openView(homePageViewStackItem, mainStackHistory[1], false);
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
   * Visits each history state of the current view stack.
   * @param visitor A function which will visit each history state. The function is called once for each history state
   * in order of increasing age (beginning with the present state) and takes two arguments: the number of steps from
   * the present state to the selected state and a function which allows one to peek into the selected state's view
   * stack. The function should return `true` if visitation should continue and `false` if visitation should stop.
   */
  public visitHistory(visitor: (steps: number, stackPeeker: (depth: number) => GtcViewStackItem | undefined) => boolean): void {
    let overlayStack: ViewStackItem[] | undefined;
    let mainStack: ViewStackItem[];

    const stackPeeker = (depth: number): GtcViewStackItem | undefined => {
      if (depth < 0) {
        depth += mainStack.length + ((overlayStack?.length ?? 1) - 1);

        if (depth < 0) {
          return undefined;
        }
      }

      if (overlayStack !== undefined) {
        if (depth < overlayStack.length - 1) {
          return overlayStack[overlayStack.length - 1 - depth];
        } else {
          depth -= overlayStack.length - 1;
        }
      }

      return mainStack[mainStack.length - 1 - depth];
    };

    let currentStep = 0;

    if (!this.isCurrentOverlayViewStackEmpty()) {
      mainStack = this.getCurrentOpenMainStack();

      const history = this.getCurrentOverlayViewStackHistory();
      for (let i = history.length - 1; i > 0; i--) {
        overlayStack = history[i];

        if (!visitor(currentStep, stackPeeker)) {
          return;
        }

        currentStep++;
      }
    }

    overlayStack = undefined;

    const history = this.getCurrentMainViewStackHistory();
    for (let i = history.length - 1; i >= 0; i--) {
      mainStack = history[i];

      if (!visitor(currentStep, stackPeeker)) {
        return;
      }

      currentStep++;
    }
  }

  /**
   * Changes the active control mode.
   * @param controlMode The control mode to change to.
   */
  public changeControlModeTo(controlMode: GtcControlMode): void {
    // Abort if the control mode is not supported.
    if (
      controlMode === 'PFD' && !this.hasPfdMode
      || controlMode === 'MFD' && !this.hasMfdMode
      || controlMode === 'NAV_COM' && !this.hasNavComMode
    ) {
      return;
    }

    // On a control mode self-transition...
    if (this._activeControlMode.get() === controlMode) {
      this.goBackToHomePage();
      return;
    }

    this.getActiveViewItem().viewEntry.ref.onPause();

    // Assign the activeControlMode to the new value
    this._activeControlMode.set(controlMode);

    if (this._isAwake.get()) {
      this.selectDisplayPaneForControlMode(controlMode);
    }

    this.handleActiveViewChange();
    this.handleOpenPageChange();

    this.updateInitializationTasksForActiveViewStack();
    this.tryAutoOpenInitializationPage();
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

    const availablePanes = DisplayPaneUtils.getAvailableControllablePanes(
      this.enabledControllablePanes,
      this.otherGtcSelectedPane.get(),
      this.displayPaneSettingManager
    );
    const pane = DisplayPaneUtils.getControllablePaneToSelect(this.displayPaneControlIndex, desiredPane, availablePanes);
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
    this.getActiveViewItem().viewEntry.ref.onPause();

    if (!this.isCurrentOverlayViewStackEmpty()) {
      const overlayStackHistory = this.getCurrentOverlayViewStackHistory();

      this.closeViewStack(overlayStackHistory[overlayStackHistory.length - 1], false, 'clear');

      for (let i = overlayStackHistory.length - 1; i >= 1; i--) {
        this.reconcileViewUseState(overlayStackHistory, 1);
      }
      overlayStackHistory.length = 1;
    }

    const mainStackHistory = this.getCurrentMainViewStackHistory();

    this.closeViewStack(mainStackHistory[mainStackHistory.length - 1], true, 'clear');

    for (let i = mainStackHistory.length - 1; i >= 1; i--) {
      this.reconcileViewUseState(mainStackHistory, i);
    }
    mainStackHistory.length = 1;

    if (this._activeControlMode.get() === 'MFD') {
      this.loadedInitializationTasks[this.desiredDisplayPane.get()] = null;
      this._currentInitializationTask.set(null);
      this._nextInitializationTask.set(null);
    }

    this.changePageTo(this.controlModeHomePages[this._activeControlMode.get()]);
  }

  /**
   * Opens a view as a page in the main view stack of the currently selected control mode and display pane (if
   * applicable) and changes the current page to the opened view. This will close the current open page and any open
   * popups in the main view stack.
   * @param key The key of the view to open.
   * @returns The entry of the opened view.
   * @throws Error if there is no view registered under the specified key.
   */
  public changePageTo<T extends GtcView = GtcView>(key: string): GtcViewEntry<T> {
    const oldPageViewStackItem = this.getCurrentOpenPageViewStackItem();

    const viewStackItem = this.advanceMainViewStack<T>(key, 'page');
    const viewEntry = viewStackItem.viewEntry;

    viewEntry.type.set('page');
    viewEntry.popupType.set(undefined);
    viewEntry.popupBackgroundOcclusion.set(undefined);

    if (oldPageViewStackItem === null) {
      viewEntry.wrapperRef.instance.setAnimationClass('gtc-page-open-animation');
    } else if (oldPageViewStackItem.viewEntry !== viewEntry) {
      viewEntry.wrapperRef.instance.setAnimationClass(
        this.controlModeHomePageKeys.includes(viewEntry.key) ? 'gtc-page-open-reverse-animation' : 'gtc-page-open-forward-animation'
      );
    }

    this.refreshOcclusion();

    return viewEntry;
  }

  /**
   * Opens a view as a popup in the main view stack of the currently selected control mode and display pane (if
   * applicable). The opened view will be brought to the top of the main view stack.
   * @param key The key of the view to open.
   * @param popupType The type of popup to open the view as. Defaults to `'normal'`.
   * @param backgroundOcclusion The occlusion type applied to views beneath the popup. If `'none'` is chosen, then the
   * popup will not prevent mouse events from reaching views beneath it (unless the mouse event was triggered on an
   * element in the popup). Defaults to `'darken'`.
   * @returns The entry of the opened view.
   * @throws Error if there is no view registered under the specified key.
   */
  public openPopup<T extends GtcView = GtcView>(key: string, popupType: GtcPopupType = 'normal', backgroundOcclusion: GtcViewOcclusionType = 'darken'): GtcViewEntry<T> {
    const viewStackItem = this.advanceMainViewStack<T>(key, 'popup', popupType, backgroundOcclusion);
    const viewEntry = viewStackItem.viewEntry;

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
   * @param popupType The type of popup to open the view as. Ignored if `type` is not `popup`. Defaults to `'normal'`.
   * @param backgroundOcclusion The occlusion type applied to views beneath the popup. Ignored if `type` is not
   * `popup`. Defaults to `'darken'`.
   * @throws Error if attempting to open a popup that is already open in the view stack.
   * @returns The active view entry after the operation is complete.
   */
  private advanceMainViewStack<T extends GtcView = GtcView>(
    key: string,
    type: GtcViewType,
    popupType: GtcPopupType = 'normal',
    backgroundOcclusion: GtcViewOcclusionType = 'darken'
  ): ViewStackItem<T> {
    const viewStackKey = this.getCurrentMainViewStackKey();
    const viewEntry = this.getViewEntry<T>(key, viewStackKey);

    const viewStackHistory = this._viewStacks[viewStackKey];
    const oldOpenViewStack = viewStackHistory[viewStackHistory.length - 1];
    const isOverlayStackEmpty = this.isCurrentOverlayViewStackEmpty();

    if (GtcService.indexOfViewEntryInStack(oldOpenViewStack, viewEntry) >= 0) {
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

    const viewStackItem: ViewStackItem<T> = {
      isInOverlayStack: false,
      viewEntry: renderedViewEntry,
      type,
      popupType: undefined,
      backgroundOcclusion: undefined
    };

    if (isOverlayStackEmpty) {
      // Call the Pause lifecycle method on the outgoing view
      this.getActiveViewItem().viewEntry.ref.onPause();
    }

    switch (type) {
      case 'page': {
        this.initPageViewStackItem(viewStackItem);

        // Close all open views in the current stack when changing pages
        this.closeViewStack(oldOpenViewStack, true, 'advance');

        // Create a new view stack history state with the base view and opened page as the only members
        viewStackHistory.push([oldOpenViewStack[0], viewStackItem]);

        break;
      }
      case 'popup':
        this.initPopupViewStackItem(viewStackItem, popupType, backgroundOcclusion);

        // Create a new view stack, retaining the previous stack, and appending to it the passed popup
        viewStackHistory.push([...oldOpenViewStack, viewStackItem]);

        break;
    }

    if (!viewStackItem.viewEntry.isInUse) {
      viewStackItem.viewEntry.isInUse = true;
      viewStackItem.viewEntry.ref.onInUse();
    }

    this.openView(viewStackItem, this.getCurrentOpenMainStack());

    if (isOverlayStackEmpty) {
      this.handleActiveViewChange();
    }
    this.handleOpenPageChange();

    return viewStackItem;
  }

  /**
   * Returns the active view stack key based on control mode and selected pane.
   * @returns The active view stack key.
   */
  private getCurrentMainViewStackKey(): GtcViewStackKey {
    return GtcService.getViewStackKey(this.activeControlMode.get(), false, this.desiredDisplayPane.get());
  }

  /**
   * Opens a view as a popup in the overlay view stack of the currently selected control mode. The opened view will be
   * brought to the top of the overlay view stack as the active view.
   * @param key The key of the view to open.
   * @param popupType The type of popup to open the view as. Defaults to `'normal'`.
   * @param backgroundOcclusion The occlusion type applied to views beneath the popup. If `'none'` is chosen, then the
   * popup will not prevent mouse events from reaching views beneath it (unless the mouse event was triggered on an
   * element in the popup). Defaults to `'darken'`.
   * @returns The entry of the opened view.
   * @throws Error if there is no view registered under the specified key.
   */
  public openOverlayPopup<T extends GtcView = GtcView>(key: string, popupType: GtcPopupType = 'normal', backgroundOcclusion: GtcViewOcclusionType = 'darken'): GtcViewEntry<T> {
    const viewStackItem = this.advanceOverlayViewStack<T>(key, popupType, backgroundOcclusion);
    const viewEntry = viewStackItem.viewEntry;

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
   * @param popupType The type of popup to open the view as. Defaults to `'normal'`.
   * @param backgroundOcclusion The occlusion type applied to views beneath the popup. Defaults to `'darken'`.
   * @throws Error if attempting to open a popup that is already open in the view stack.
   * @returns The active view entry after the operation is complete.
   */
  private advanceOverlayViewStack<T extends GtcView = GtcView>(
    key: string,
    popupType: GtcPopupType = 'normal',
    backgroundOcclusion: GtcViewOcclusionType = 'darken'
  ): ViewStackItem<T> {
    const viewStackKey = this.getCurrentOverlayViewStackKey();
    const viewEntry = this.getViewEntry<T>(key, viewStackKey);

    const viewStackHistory = this._viewStacks[viewStackKey];
    const oldOpenViewStack = viewStackHistory[viewStackHistory.length - 1];

    if (GtcService.indexOfViewEntryInStack(oldOpenViewStack, viewEntry) >= 0) {
      // Handle the case in which the requested view is already in the view stack
      throw new Error(`GtcService: attempting to open a popup instance which is already open in the view stack: ${key}`);
    } else {
      // If the requested view is not already in the active view stack, then we may need to render it.
      if (viewEntry.ref === undefined) {
        this.renderView(viewStackKey, viewEntry);
      }
    }

    // At this point the view is guaranteed to be rendered.
    const renderedViewEntry = viewEntry as RenderedViewEntry<T>;

    const viewStackItem: ViewStackItem<T> = {
      isInOverlayStack: true,
      viewEntry: renderedViewEntry,
      type: 'popup',
      popupType: undefined,
      backgroundOcclusion: undefined
    };

    this.initPopupViewStackItem(viewStackItem, popupType, backgroundOcclusion);

    // Call the Pause lifecycle method on the outgoing view
    this.getActiveViewItem().viewEntry.ref.onPause();

    // Create a new view stack, retaining the previous stack, and appending to it the passed popup
    viewStackHistory.push([...oldOpenViewStack, viewStackItem]);

    if (!viewStackItem.viewEntry.isInUse) {
      viewStackItem.viewEntry.isInUse = true;
      viewStackItem.viewEntry.ref.onInUse();
    }

    this.openView(viewStackItem, this.getCurrentOpenOverlayStack());

    this.handleActiveViewChange();

    return viewStackItem;
  }

  /**
   * Returns the active view stack key based on control mode and selected pane.
   * @returns The active view stack key.
   */
  private getCurrentOverlayViewStackKey(): GtcViewStackKey {
    return GtcService.getViewStackKey(this.activeControlMode.get(), true);
  }

  /**
   * Initializes a view stack item describing an open page.
   * @param item The view stack item to initialize.
   */
  private initPageViewStackItem(item: ViewStackItem): void {
    item.type = 'page';
    item.popupType = undefined;
    item.backgroundOcclusion = undefined;
  }

  /**
   * Initializes a view stack item describing an open popup.
   * @param item The view stack item to initialize.
   * @param popupType The type of the popup.
   * @param backgroundOcclusion The occlusion type applied to views beneath the popup.
   */
  private initPopupViewStackItem(item: ViewStackItem, popupType: GtcPopupType, backgroundOcclusion: GtcViewOcclusionType): void {
    item.type = 'popup';
    item.popupType = popupType;
    item.backgroundOcclusion = backgroundOcclusion;
  }

  /**
   * Returns to the most recent previous history state of the active view stack.
   * @returns The active view entry after the operation is complete.
   * @throws Error if the most recent previous history state of the active view stack is undefined.
   */
  public goBack(): GtcViewEntry {
    // Revert to previous state by popping the current state off of the view stack.
    const currentViewStackHistory = this.getCurrentViewStackHistory();

    const incomingViewStack: ViewStackItem[] | undefined = currentViewStackHistory[currentViewStackHistory.length - 2];
    if (!incomingViewStack) { throw new Error('GtcService: attempted to go back when there is no previous state to go back to'); }

    const wasOverlayViewStackEmpty = this.isCurrentOverlayViewStackEmpty();

    const activeViewStackItem = this.getActiveViewItem();

    // Pause the outgoing active view.
    activeViewStackItem.viewEntry.ref.onPause();
    this.closeView(activeViewStackItem.viewEntry, 'back', false);

    const wasActiveViewAPage = activeViewStackItem.type === 'page';

    this.reconcileViewUseState(currentViewStackHistory, currentViewStackHistory.length - 1);
    currentViewStackHistory.pop();

    const wasOverlayViewStackEmptied = this.isCurrentOverlayViewStackEmpty() !== wasOverlayViewStackEmpty;

    // If the previous active view was a page, we need to go through the new active view stack and open every view
    // since none of them were open in the previous active view stack...
    // UNLESS we just closed the only vertical NAV/COM popup, in which case the new active view stack is the open
    // control mode view stack and all views in it were already considered open.
    if (!wasOverlayViewStackEmptied && wasActiveViewAPage) {
      incomingViewStack.forEach(viewEntry => this.openView(viewEntry, incomingViewStack, true));
    }

    this.handleActiveViewChange();
    this.handleOpenPageChange();

    if (!wasOverlayViewStackEmptied && wasActiveViewAPage) {
      this._currentPage.get()?.wrapperRef.instance.setAnimationClass('gtc-page-open-reverse-animation');
    }

    this.refreshOcclusion();

    if (wasOverlayViewStackEmpty && this._activeControlMode.get() === 'MFD') {
      this.reconcileLoadedInitializationTask(this.desiredDisplayPane.get());
      this.updateInitializationTasksForActiveViewStack();
    }

    return this._activeView.get();
  }

  /**
   * Attempts to return to a previous history state of the active view stack.
   * @param selector A function which selects the history state to which to return. The function is called once for
   * each history state in order of increasing age and takes two arguments: the number of steps from the present state
   * to the selected state and a function which allows one to peek into the selected state's view stack by view entry.
   * The function should return `true` if the operation should return to the selected state and `false` otherwise. If
   * the function returns `false` for every selected state, then the operation is aborted.
   * @returns The active view entry after the operation is complete.
   */
  public goBackTo(selector: (steps: number, stackPeeker: (depth: number) => GtcViewEntry | undefined) => boolean): GtcViewEntry {
    let innerStackPeeker: ((depth: number) => GtcViewStackItem | undefined) | undefined;
    const entryStackPeeker = (depth: number): GtcViewEntry | undefined => innerStackPeeker?.(depth)?.viewEntry;

    const selectorToUse = (steps: number, stackPeeker: (depth: number) => GtcViewStackItem | undefined): boolean => {
      innerStackPeeker = stackPeeker;
      return selector(steps, entryStackPeeker);
    };

    return this.goBackToItem(selectorToUse);
  }

  /**
   * Attempts to return to a previous history state of the active view stack.
   * @param selector A function which selects the history state to which to return. The function is called once for
   * each history state in order of increasing age and takes two arguments: the number of steps from the present state
   * to the selected state and a function which allows one to peek into the selected state's view stack by view stack
   * item. The function should return `true` if the operation should return to the selected state and `false`
   * otherwise. If the function returns `false` for every selected state, then the operation is aborted.
   * @returns The active view entry after the operation is complete.
   */
  public goBackToItem(selector: (steps: number, stackPeeker: (depth: number) => GtcViewStackItem | undefined) => boolean): GtcViewEntry {
    let selectedStep: number | undefined;

    this.visitHistory((steps, stackPeeker) => {
      if (selector(steps, stackPeeker)) {
        selectedStep = steps;
        return false;
      } else {
        return true;
      }
    });

    selectedStep ??= 0;

    while (selectedStep-- > 0) {
      this.goBack();
    }

    return this._activeView.get();
  }

  /**
   * Goes back to the home page of the currently selected control mode.
   * @returns The active view entry after the operation is complete.
   */
  public goBackToHomePage(): GtcViewEntry {
    // If the home page is already the active view, then do nothing.
    if (!this.activeViewIsNotAHomePage.get()) {
      return this._activeView.get();
    }

    const currentMainViewStackHistory = this.getCurrentMainViewStackHistory();

    // If the current view stack history has only one entry, then the home page is not in the view stack history,
    // because the first history entry is guaranteed to only contain the base view. Therefore, we need to push a new
    // history entry with the home page, which we can do by changing the page to the home page after closing all
    // views in the overlay stack.
    if (currentMainViewStackHistory.length < 2) {
      this.clearOverlayViewStack();
      return this.changePageTo(this.controlModeHomePages[this._activeControlMode.get()]);
    }

    // Close all views in the current overlay stack.
    if (!this.isCurrentOverlayViewStackEmpty()) {
      // Pause the outgoing active view.
      this.getActiveViewItem().viewEntry.ref.onPause();

      const overlayStackHistory = this.getCurrentOverlayViewStackHistory();
      this.closeViewStack(overlayStackHistory[overlayStackHistory.length - 1], false, 'back');

      for (let i = overlayStackHistory.length - 1; i >= 1; i--) {
        this.reconcileViewUseState(overlayStackHistory, i);
      }
      overlayStackHistory.length = 1;
    }

    const openPageViewStackItem = this.getCurrentOpenPageViewStackItem();
    const wasHomePageOpen = openPageViewStackItem !== null && this.controlModeHomePageKeys.includes(openPageViewStackItem.viewEntry.key);

    if (currentMainViewStackHistory.length > 2) {
      // Pause the outgoing active view.
      this.getActiveViewItem().viewEntry.ref.onPause();

      this.closeViewStack(currentMainViewStackHistory[currentMainViewStackHistory.length - 1], !wasHomePageOpen, 'back');

      // Rewind the history stack until only two history states are left. The second oldest history state is guaranteed
      // to be the state in which only the home page is open.
      for (let i = currentMainViewStackHistory.length - 1; i >= 2; i--) {
        this.reconcileViewUseState(currentMainViewStackHistory, i);
      }
      currentMainViewStackHistory.length = 2;

      // If the home page wasn't open before the operation, then we need to open it now.
      !wasHomePageOpen && this.openView(this.getActiveViewItem(), this.getCurrentOpenMainStack(), true);
    }

    this.handleActiveViewChange();
    this.handleOpenPageChange();

    const activeViewEntry = this._activeView.get();

    activeViewEntry.wrapperRef.instance.setAnimationClass('gtc-page-open-reverse-animation');

    this.refreshOcclusion();

    if (this._activeControlMode.get() === 'MFD') {
      this.loadedInitializationTasks[this.desiredDisplayPane.get()] = null;
      this._currentInitializationTask.set(null);
      this._nextInitializationTask.set(null);
    }

    return activeViewEntry;
  }

  /**
   * Attempts to close a popup in the current overlay view stack by rewinding the history state of the view stack
   * until the target popup is no longer open.
   * @param filter A filter function which will be called once for each open popup found in the overlay view stack and
   * returns whether the popup is the target popup to close.
   * @param closeOtherPopups Whether all other open popups in the overlay view stack should be closed if the target
   * popup is not open within the view stack.
   * @returns Whether the specified popup was closed.
   */
  public closeOverlayPopup<F extends GtcView = GtcView>(
    filter: (entry: GtcViewEntry<F>) => boolean,
    closeOtherPopups: boolean
  ): boolean {
    if (this.isCurrentOverlayViewStackEmpty()) {
      return false;
    }

    let didFindPopup = false;
    let didClosePopup = false;

    this.goBackToItem((steps, stackPeeker) => {
      const topItem = stackPeeker(0);
      if (!topItem) {
        return false;
      }

      if (didFindPopup) {
        return didClosePopup = true;
      }

      if (topItem.isInOverlayStack) {
        didFindPopup = filter(topItem.viewEntry as GtcViewEntry<F>);
        return false;
      } else {
        return closeOtherPopups;
      }
    });

    return didClosePopup;
  }

  /**
   * Clears the overlay view stack of the currently selected control mode, closing all open popups in the stack and
   * resetting its history.
   * @returns The active view entry after the operation is complete.
   */
  public clearOverlayViewStack(): GtcViewEntry {
    const viewStackHistory = this.getCurrentOverlayViewStackHistory();

    // If the overlay view stack is empty, then do nothing.
    if (viewStackHistory.length <= 1) {
      return this._activeView.get();
    }

    this.closeViewStack(viewStackHistory[viewStackHistory.length - 1], false, 'clear');

    for (let i = viewStackHistory.length - 1; i >= 1; i--) {
      this.reconcileViewUseState(viewStackHistory, i);
    }
    viewStackHistory.length = 1;

    this.handleActiveViewChange();
    this.handleOpenPageChange();

    this.refreshOcclusion();

    return this._activeView.get();
  }

  /**
   * Loads an initialization task for the currently selected control mode and display pane. This method does nothing
   * if the MFD control mode is not currently selected. When the task is loaded, the history of the view stack for the
   * currently selected display pane will be rewound until the initialization page is the active view. If there is no
   * previous history state in which the initialization page is the active view, then the initialization page will be
   * opened instead. After the initialization page is made the active view, the task's associated page will be opened.
   * @param uid The unique ID of the initialization task to load.
   * @returns Whether the task was successfully loaded.
   */
  public loadInitializationTask(uid: string): boolean {
    // All initialization is done in the MFD control mode.
    if (this._activeControlMode.get() !== 'MFD') {
      return false;
    }

    if (!this._initializationDataProvider.isEnabled.get()) {
      return false;
    }

    const taskDataArray = this._initializationDataProvider.tasks.getArray();
    const index = GtcService.indexOfInitializationTask(taskDataArray, uid);

    if (index < 0) {
      return false;
    }

    const initPageEntry = this.goBackToInitializationPage();
    if (!initPageEntry) {
      // If there is no history state in which the initialization page was the active view, then create such a state
      // by changing the page to the initialization page.
      this.changePageTo(GtcViewKeys.Initialization);
    }

    // At this point the initialization page is guaranteed to be the active view.

    const taskData = taskDataArray[index];
    const viewKey = taskData.taskDef.gtcPageKey;

    // If the current open page is not the task's designated page, then change the page to the designated page.
    const openPage = this._currentPage.get();
    if (openPage?.key !== viewKey) {
      this.changePageTo(viewKey);
    }

    const nextTaskData = taskDataArray[index + 1] as InitializationTaskData | undefined;

    this.loadedInitializationTasks[this.desiredDisplayPane.get()] = taskData.taskDef;
    this._currentInitializationTask.set(taskData.taskDef);
    this._nextInitializationTask.set(nextTaskData ? nextTaskData.taskDef : null);

    return true;
  }

  /**
   * Goes back to the initialization page. This will close all open popups in the overlay layer and rewind history
   * until the initialization page is the active view. If there is no history state (including the current history
   * state) in which the initialization page is the active view, or if the currently active control mode is not equal
   * to `'MFD'`, then this method does nothing and returns `null`.
   * the currently active control mode is not `'MFD'`, then this method does
   * @returns The active view entry after the operation is complete, or `null` if the operation could not be completed.
   */
  public goBackToInitializationPage(): GtcViewEntry | null {
    // All initialization is done in the MFD control mode.
    if (this._activeControlMode.get() !== 'MFD') {
      return null;
    }

    // If the initialization page is already the active view, then there is nothing to do.
    if (this._activeView.get().key === GtcViewKeys.Initialization) {
      return this._activeView.get();
    }

    if (this.goBackToInitializationPageInViewStack(this.desiredDisplayPane.get(), true, false)) {
      return this._activeView.get();
    } else {
      return null;
    }
  }

  /**
   * Rewinds the history state of an MFD control mode main view stack until the initialization page is the top-most
   * view in the open view stack, and optionally closes the initialization page by rewinding the history state one
   * additional step. If there is no history state (including the current history state) in which the initialization
   * page is the top-most view, then this method does nothing and returns `false`.
   * @param displayPaneIndex The index of the display pane associated with the view stack whose history state is to be
   * rewound.
   * @param closeOverlayStack Whether to close all popups in the MFD control mode overlay view stack as part of the
   * operation.
   * @param closeInitializationPage Whether to close the initialization page after it is made the top-most view in the
   * open view stack by rewinding the history state one additional step.
   * @returns Whether the history state of the specified MFD control mode main view stack was successfully rewound to
   * place the initialization page at the top of the open view stack.
   */
  private goBackToInitializationPageInViewStack(
    displayPaneIndex: ControllableDisplayPaneIndex,
    closeOverlayStack: boolean,
    closeInitializationPage: boolean
  ): boolean {
    const isCurrentViewStack = this._activeControlMode.get() === 'MFD' && this.desiredDisplayPane.get() === displayPaneIndex;

    const mainViewStackKey = GtcService.getViewStackKey('MFD', false, displayPaneIndex);
    const overlayStackKey = GtcService.getViewStackKey('MFD', true);
    const mainStackHistory = this._viewStacks[mainViewStackKey];
    const overlayStackHistory = this._viewStacks[overlayStackKey];

    // Find the earliest history state in which the initialization page was the top-most view.
    let targetHistoryIndex = -1;
    for (let historyIndex = 1; historyIndex < mainStackHistory.length; historyIndex++) {
      const stack = mainStackHistory[historyIndex];
      if (stack.length === 2 && stack[1].viewEntry.key === GtcViewKeys.Initialization) {
        targetHistoryIndex = closeInitializationPage ? historyIndex - 1 : historyIndex;
        break;
      }
    }

    if (targetHistoryIndex < 0) {
      return false;
    } else if (targetHistoryIndex !== mainStackHistory.length - 1 || (closeOverlayStack && overlayStackHistory.length > 1)) {
      // If we found a history state in which the initialization page was the top-most view, then rewind history until
      // the initialization page is the top-most view. Note that we only need to do this if the current overlay stack
      // is not empty and we need to close all popups in the overlay stack or if the history state we found is not the
      // most recent history state of the main stack.

      const originalViewStack = mainStackHistory[mainStackHistory.length - 1];
      const targetViewStack = mainStackHistory[targetHistoryIndex];

      const needClosePage = closeInitializationPage || originalViewStack[1].viewEntry.key !== GtcViewKeys.Initialization;

      let didPauseActiveView = false;
      if (isCurrentViewStack && (closeOverlayStack || overlayStackHistory.length <= 1)) {
        this.getActiveViewItem().viewEntry.ref.onPause();
        didPauseActiveView = true;
      }

      let didCloseOverlayStack = false;
      if (closeOverlayStack && overlayStackHistory.length > 1) {
        this.closeViewStack(overlayStackHistory[overlayStackHistory.length - 1], false, 'back');
        for (let i = overlayStackHistory.length - 1; i >= 1; i--) {
          this.reconcileViewUseState(overlayStackHistory, 1);
        }
        overlayStackHistory.length = 1;
        didCloseOverlayStack = true;
      }

      this.closeViewStack(originalViewStack, needClosePage, 'back');
      for (let i = mainStackHistory.length - 1; i > targetHistoryIndex; i--) {
        this.reconcileViewUseState(mainStackHistory, i);
      }
      mainStackHistory.length = targetHistoryIndex + 1;

      // If we closed the original open page, then we need to open every view in the new open stack.
      if (needClosePage) {
        targetViewStack.forEach(viewEntry => this.openView(viewEntry, targetViewStack, true));
      }

      if (isCurrentViewStack) {
        didPauseActiveView && this.handleActiveViewChange();
        this.handleOpenPageChange();
      }

      // Set the correct open animation on the new open page.
      targetViewStack[1].viewEntry.wrapperRef.instance.setAnimationClass('gtc-page-open-reverse-animation');

      let occlusion: GtcViewOcclusionType = 'none';
      const openOverlayViewStack = overlayStackHistory[overlayStackHistory.length - 1];
      if (openOverlayViewStack.length > 1) {
        occlusion = this.refreshViewStackOcclusion(openOverlayViewStack, occlusion);
      }
      if (didCloseOverlayStack) {
        forEachPaneIndex(paneIndex => {
          const mainStack = ArrayUtils.last(this._viewStacks[GtcService.getViewStackKey('MFD', false, paneIndex)]);
          this.refreshViewStackOcclusion(mainStack, occlusion);
        });
      } else {
        this.refreshViewStackOcclusion(targetViewStack, occlusion);
      }

      // If we have successfully gone back to the initialization page or closed it, then we have to clear the loaded
      // initialization task since there can't be any loaded task while the initialization page is the top-most view
      // or not in use.
      this.loadedInitializationTasks[displayPaneIndex] = null;

      if (isCurrentViewStack) {
        this._currentInitializationTask.set(null);
        this._nextInitializationTask.set(null);
      }
    }

    return true;
  }

  /**
   * Called when an interaction event needs to be sent to the active view.
   * @param event The event.
   */
  public onInteractionEvent(event: GtcInteractionEvent): void {
    if (!this._isAwake.get()) {
      return;
    }

    this.getActiveViewItem().viewEntry.ref.onGtcInteractionEvent(event)                            // Active view gets to respond first ...
      || (this.pluginInteractionHandler && this.pluginInteractionHandler.onGtcInteractionEvent(event))  // ... then plugins ...
      || this.gtcKnobHandler.handleDefaultInteractionBehavior(event);                                   // ... and finally the default handler.
  }

  /**
   * Retrieves a view entry for opening
   * @param key A GtcView key
   * @param viewStackKey The key to the view stack that the view is in.
   * @throws Errors if the passed key was never registered
   * @returns The view entry to open
   */
  private getViewEntry<T extends GtcView = GtcView>(key: string, viewStackKey: GtcViewStackKey): ViewEntry<T> {
    // This part is essentially the same as top part of the NXi's ViewService.open()
    const viewEntry = this.registeredViews.get(viewStackKey)!.get(key);
    if (!viewEntry) { throw new Error(`${key} wasn't registered as a view`); }
    return viewEntry as ViewEntry<T>;
  }

  /**
   * Handles logic associated with changing the active view.
   */
  private handleActiveViewChange(): void {
    const viewEntry = this.getActiveViewItem().viewEntry;
    viewEntry.ref.onResume();
    this._activeView.set(viewEntry);
  }

  /**
   * Handles logic associated with changing the open page.
   */
  private handleOpenPageChange(): void {
    const item = this.getCurrentOpenPageViewStackItem();
    this._currentPage.set(item ? item.viewEntry : null);
  }

  /**
   * Refreshes the occlusion state of all open views in the overlay and main view stacks for the currently selected
   * control mode.
   */
  private refreshOcclusion(): void {
    const overlayStack = this.getCurrentOpenOverlayStack();

    let occlusion: GtcViewOcclusionType = 'none';

    if (overlayStack.length > 1) {
      occlusion = this.refreshViewStackOcclusion(overlayStack, occlusion);
    }

    if (this._activeControlMode.get() === 'MFD') {
      forEachPaneIndex(paneIndex => {
        const mainStack = ArrayUtils.last(this._viewStacks[GtcService.getViewStackKey('MFD', false, paneIndex)]);
        this.refreshViewStackOcclusion(mainStack, occlusion);
      });
    } else {
      const mainStack = this.getCurrentOpenMainStack();

      this.refreshViewStackOcclusion(mainStack, occlusion);
    }
  }

  /**
   * Refreshes the occlusion state of all views in a view stack.
   * @param viewStack The view stack containing the views to refresh.
   * @param initialOcclusion The occlusion state to apply to the top-most view in the view stack.
   * @returns The occlusion state that should be applied to a view directly beneath the bottom-most view in the
   * specified view stack given the specified initial occlusion state.
   */
  private refreshViewStackOcclusion(viewStack: ViewStackItem[], initialOcclusion: GtcViewOcclusionType): GtcViewOcclusionType {
    let occlusion = initialOcclusion;

    for (let i = viewStack.length - 1; i >= 0; i--) {
      const entry = viewStack[i].viewEntry;

      entry.occlusion.set(occlusion);

      if (entry.popupBackgroundOcclusion.get() === 'hide') {
        occlusion = 'hide';
      } else if (entry.popupBackgroundOcclusion.get() === 'darken' && occlusion !== 'hide') {
        occlusion = 'darken';
      }
    }

    return occlusion;
  }

  /**
   * Handle logic associated with opening a view
   * @param viewStackItem The view to open.
   * @param viewStack The view stack containing the view to open.
   * @param wasPreviouslyOpened True if this view was already open in a previous stack. Defaults to false.
   * @throws Errors if view cannot be found in the view stack
   */
  private openView(viewStackItem: ViewStackItem, viewStack: ViewStackItem[], wasPreviouslyOpened = false): void {
    const viewEntry = viewStackItem.viewEntry;

    const index = GtcService.indexOfViewEntryInStack(viewStack, viewEntry);
    if (index < 0) {
      throw new Error(`GtcService: opened view with key ${viewEntry.key} not found in open view stack`);
    }

    viewEntry.ref.onOpen(wasPreviouslyOpened);
    viewEntry.isVisible.set(true);

    viewEntry.type.set(viewStackItem.type);
    viewEntry.popupType.set(viewStackItem.popupType);
    viewEntry.popupBackgroundOcclusion.set(viewStackItem.backgroundOcclusion);

    viewEntry.layer.set(index);
    viewEntry.wrapperRef.instance.setAnimationClass(null); // This clears any closing animation classes from the view wrapper.
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

    // TODO: If a popup view is closed (not via a back operation), opened again with a different occlusion type, then
    // the original popup is opened again via a back operation, it will be opened with the incorrect occlusion type
    // that it was opened with the second time. The only way to resolve this is to save the popup occlusion type within
    // the history stack.

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
  private closeViewStack(viewStack: ViewStackItem[], closePage: boolean, closeType: 'advance' | 'back' | 'clear'): void {
    for (let i = viewStack.length - 1; i >= 0; i--) {
      const entry = viewStack[i].viewEntry;
      const type = entry.type.get();

      if (type === 'base' || (type === 'page' && !closePage)) {
        continue;
      }

      this.closeView(entry, closeType, true);
    }
  }

  /**
   * Iterates through a view stack and finds all views that do not appear in a previous view stack history state and
   * marks them as out-of-use. All out-of-use views with the transient lifecycle policy are also cleaned up.
   * @param viewStackHistory A view stack history containing the view stack through which to iterate.
   * @param index The index of the view stack through which to iterate in the view stack history.
   */
  private reconcileViewUseState(viewStackHistory: readonly (readonly ViewStackItem[])[], index: number): void {
    const viewStack = viewStackHistory[index];

    if (!viewStack) {
      return;
    }

    for (let i = viewStack.length - 1; i >= 0; i--) {
      const viewEntry = viewStack[i].viewEntry;
      if (viewEntry.wrapperRef) {
        let isOutOfUse = true;
        for (let j = index - 1; j >= 0; j--) {
          if (GtcService.indexOfViewEntryInStack(viewStackHistory[j], viewEntry) >= 0) {
            isOutOfUse = false;
            break;
          }
        }

        if (isOutOfUse) {
          if (viewEntry.isInUse) {
            viewEntry.isInUse = false;
            viewEntry.ref.onOutOfUse();
          }

          if (viewEntry.lifecyclePolicy === GtcViewLifecyclePolicy.Transient) {
            this.cleanupView(viewEntry);
          }
        }
      }
    }
  }

  /**
   * Checks if the initialization page is in use in an MFD control mode view stack.
   * @param displayPaneIndex The index of the display pane associated with the view stack to check.
   * @returns Whether the initialization page is in use in the MFD control mode view stack associated with the
   * specified display pane.
   */
  private isInitializationPageInUse(displayPaneIndex: ControllableDisplayPaneIndex): boolean {
    return this.getViewEntry(GtcViewKeys.Initialization, GtcService.getViewStackKey('MFD', false, displayPaneIndex)).isInUse;
  }

  /**
   * Refreshes this service's initialization task state.
   */
  private refreshInitializationState(): void {
    if (this._initializationDataProvider.isEnabled.get()) {
      const taskDataArray = this._initializationDataProvider.tasks.getArray();
      forEachPaneIndex(index => {
        const loadedTask = this.loadedInitializationTasks[index];
        if (loadedTask !== null) {
          const taskIndex = GtcService.indexOfInitializationTask(taskDataArray, loadedTask.uid);
          if (taskIndex < 0) {
            this.loadedInitializationTasks[index] = null;
          } else {
            this.reconcileLoadedInitializationTask(index);
          }
        }
      });

      this.updateInitializationTasksForActiveViewStack();
    } else {
      forEachPaneIndex(index => {
        this.loadedInitializationTasks[index] = null;
      });

      this._currentInitializationTask.set(null);
      this._nextInitializationTask.set(null);
    }
  }

  /**
   * Reconciles the loaded initialization task state for a MFD control mode view stack. If the currently loaded task
   * for the view stack should not be loaded, then the task is unloaded.
   * @param displayPaneIndex The index of the display pane associated with the view stack for which to reconcile
   * loaded initialization task state.
   */
  private reconcileLoadedInitializationTask(displayPaneIndex: ControllableDisplayPaneIndex): void {
    const loadedTask = this.loadedInitializationTasks[displayPaneIndex];

    if (!loadedTask) {
      return;
    }

    if (this.hasMfdMode) {
      const viewStackKey = GtcService.getViewStackKey('MFD', false, displayPaneIndex);
      const mainStackHistory = this._viewStacks[viewStackKey];
      const initPageEntry = this.getViewEntry(GtcViewKeys.Initialization, viewStackKey);
      const taskPageEntry = this.getViewEntry(loadedTask.gtcPageKey, viewStackKey);

      // Check if the view stack has two consecutive history states in which the initialization page is the active view
      // in the first state and the loaded task's associated page is the active view in the next state. If this condition
      // is not met, then the loaded task must be unloaded.
      let canBeLoaded = false;
      for (let historyIndex = 1; historyIndex < mainStackHistory.length - 1; historyIndex++) {
        const stack = mainStackHistory[historyIndex];
        const initPageStackIndex = GtcService.indexOfViewEntryInStack(stack, initPageEntry);
        if (stack.length === 2 && initPageStackIndex === 1) {
          const nextStack = mainStackHistory[historyIndex + 1];
          if (nextStack && nextStack.length === 2 && GtcService.indexOfViewEntryInStack(nextStack, taskPageEntry) === 1) {
            canBeLoaded = true;
            break;
          }
        }
      }

      if (!canBeLoaded) {
        this.loadedInitializationTasks[displayPaneIndex] = null;
      }
    } else {
      this.loadedInitializationTasks[displayPaneIndex] = null;
    }
  }

  /**
   * Updates the loaded current and next initialization tasks for the active view stack.
   */
  private updateInitializationTasksForActiveViewStack(): void {
    let currentTask: InitializationTaskDef | null = null;
    let nextTask: InitializationTaskDef | null = null;

    if (this._activeControlMode.get() === 'MFD') {
      const loadedTask = this.loadedInitializationTasks[this.desiredDisplayPane.get()];
      if (loadedTask !== null) {
        const taskDataArray = this._initializationDataProvider.tasks.getArray();
        const taskIndex = GtcService.indexOfInitializationTask(taskDataArray, loadedTask.uid);
        if (taskIndex >= 0) {
          currentTask = taskDataArray[taskIndex].taskDef;
          nextTask = taskDataArray[taskIndex + 1]?.taskDef ?? null;
        }
      }
    }

    this._currentInitializationTask.set(currentTask);
    this._nextInitializationTask.set(nextTask);
  }

  /**
   * Responds to when whether the initialization process is enabled changes.
   * @param isEnabled Whether the initialization process is enabled.
   */
  private onIsInitializationEnabledChanged(isEnabled: boolean): void {
    if (!this.hasMfdMode) {
      return;
    }

    if (isEnabled && !this._initializationDataProvider.isAccepted.get()) {
      this.tryAutoOpenInitializationPage();
    }
  }

  /**
   * Responds to when whether the user has accepted initialization changes.
   * @param isAccepted Whether the user has accepted initialization.
   */
  private onIsInitializationAcceptedChanged(isAccepted: boolean): void {
    if (!this.hasMfdMode) {
      return;
    }

    if (this._initializationDataProvider.isEnabled.get()) {
      if (isAccepted) {
        forEachPaneIndex(this.closeInitializationPage.bind(this));
      } else {
        this.tryAutoOpenInitializationPage();
      }
    }
  }

  /**
   * Closes the initialization page in an MFD control mode main view stack. The history state of the view stack is
   * rewound until the initialization page is the top-most view in the open view stack, then the initialization page
   * is closed by rewinding the history state one additional step.
   * @param displayPaneIndex The index of the display pane associated with the view stack for which to close the
   * initialization page.
   */
  private closeInitializationPage(displayPaneIndex: ControllableDisplayPaneIndex): void {
    this.goBackToInitializationPageInViewStack(displayPaneIndex, false, true);
  }

  /**
   * Attempts to automatically open the initialization page in the view stack of the currently selected control mode
   * and display pane. This method does nothing if automatic opening of the initialization page is not armed, if the
   * initialization process is not enabled, if the user has accepted initialization, or if the MFD control mode is not
   * currently selected. Opening the initialization page will disarm automatic opening. If the initialization page is
   * already in use, then it will not be opened, but automatic opening will still be disarmed.
   */
  private tryAutoOpenInitializationPage(): void {
    if (
      !this.isInitializationPageArmed
      || !this._initializationDataProvider.isEnabled.get()
      || this._initializationDataProvider.isAccepted.get()
      || this._activeControlMode.get() !== 'MFD'
    ) {
      return;
    }

    this.openInitializationPage();

    this.isInitializationPageArmed = false;
  }

  /**
   * Opens the initialization page in the view stack of the currently selected control mode and display pane if it is
   * not already in use. If the MFD control mode is not currently selected, then this method does nothing.
   */
  private openInitializationPage(): void {
    if (this._activeControlMode.get() !== 'MFD') {
      return;
    }

    if (!this.isInitializationPageInUse(this.desiredDisplayPane.get())) {
      this.changePageTo(GtcViewKeys.Initialization);
    }
  }

  /**
   * Creates a new empty view entry.
   * @param key The key of the view entry.
   * @param controlMode The control mode of the new entry.
   * @param displayPaneIndex The display pane index of the new entry.
   * @returns A new empty view entry.
   */
  private createEmptyViewEntry(key: string, controlMode: GtcControlMode, displayPaneIndex?: ControllableDisplayPaneIndex): RenderedViewEntry {
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
      isInUse: false,
      isVisible,
      layer,
      type,
      popupType,
      popupBackgroundOcclusion,
      occlusion
    };
  }

  /**
   * Gets the key for a view stack.
   * @param controlMode The control mode of the view stack for which to get a key.
   * @param isOverlay Whether the view stack for which to get a key is an overlay stack.
   * @param displayPaneIndex The index of the display pane associated with the view stack for which to get a key. Only
   * applicable for MFD control mode main view stacks.
   * @returns The key for the specified view stack.
   * @throws Error if a key could not be retrieved.
   */
  private static getViewStackKey(controlMode: GtcControlMode, isOverlay: boolean, displayPaneIndex?: ControllableDisplayPaneIndex): GtcViewStackKey {
    if (isOverlay) {
      switch (controlMode) {
        case 'PFD':
          return GtcViewStackKey.PfdOverlay;
        case 'MFD':
          return GtcViewStackKey.MfdOverlay;
        case 'NAV_COM':
          return GtcViewStackKey.NavComOverlay;
      }
    } else {
      switch (controlMode) {
        case 'PFD':
          return GtcViewStackKey.Pfd;
        case 'MFD':
          switch (displayPaneIndex) {
            case DisplayPaneIndex.LeftPfd:
              return GtcViewStackKey.Mfd1;
            case DisplayPaneIndex.LeftMfd:
              return GtcViewStackKey.Mfd2;
            case DisplayPaneIndex.RightMfd:
              return GtcViewStackKey.Mfd3;
            case DisplayPaneIndex.RightPfd:
              return GtcViewStackKey.Mfd4;
          }
          break;
        case 'NAV_COM':
          return GtcViewStackKey.NavCom;
      }
    }

    throw new Error('GtcService: could not retrieve view stack key');
  }

  /**
   * Checks whether a view stack key is for an overlay view stack.
   * @param key The key to check.
   * @returns Whether the specified key is for an overlay view stack.
   */
  private static isViewStackKeyOverlay(key: GtcViewStackKey): key is (GtcViewStackKey.PfdOverlay | GtcViewStackKey.MfdOverlay | GtcViewStackKey.NavComOverlay) {
    switch (key) {
      case GtcViewStackKey.PfdOverlay:
      case GtcViewStackKey.MfdOverlay:
      case GtcViewStackKey.NavComOverlay:
        return true;
      default:
        return false;
    }
  }

  /**
   * Gets the index of a view entry in a view stack.
   * @param stack The view stack to search.
   * @param viewEntry The view entry for which to search.
   * @returns The index of the specified view entry in the view stack, or `-1` if the entry is not in the stack.
   */
  private static indexOfViewEntryInStack(stack: readonly ViewStackItem[], viewEntry: ViewEntry): number {
    for (let i = 0; i < stack.length; i++) {
      if (stack[i].viewEntry === viewEntry) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Gets the index of an initialization task in the initialization process.
   * @param tasks An array of data describing tasks, in the same order as the corresponding tasks in the initialization
   * process.
   * @param uid The unique ID of the task for which to get the index.
   * @returns The index of the initialization task with the specified unique ID in the initialization process, or `-1`
   * if no task with the unique ID could be found.
   */
  private static indexOfInitializationTask(tasks: readonly InitializationTaskData[], uid: string): number {
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].taskDef.uid === uid) {
        return i;
      }
    }

    return -1;
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
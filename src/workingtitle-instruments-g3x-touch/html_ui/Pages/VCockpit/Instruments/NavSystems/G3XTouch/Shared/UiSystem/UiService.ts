import {
  BitFlags, EventBus, HEvent, MappedSubject, MutableSubscribable, NodeReference, Subject,
  Subscribable, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { MfdMainPageKeys } from '../../MFD/MainView/MfdMainPageKeys';
import { MfdNrstPageKeys } from '../../MFD/NrstView/MfdNrstPageKeys';
import { EisLayouts, InstrumentType, PfdPaneSide } from '../CommonTypes';
import { DisplayLocationSettingMode, DisplayScreenSideSettingMode, DisplayUserSettingTypes } from '../Settings/DisplayUserSettings';
import { UiInteractionEvent, UiInteractionHandler } from './UiInteraction';
import { UiInteractionMapper } from './UiInteractionMapper';
import { UiKnobControlSide, UiKnobId, UiKnobLabelState, UiKnobRequestedLabelState } from './UiKnobTypes';
import { UiView } from './UiView';
import { UiViewKeys } from './UiViewKeys';
import { UiPopupOpenOptions, UiViewStack } from './UiViewStack';
import { UiViewStackContainer } from './UiViewStackContainer';
import { RenderedUiViewEntry, UiViewLifecyclePolicy, UiViewStackItem, UiViewStackLayer } from './UiViewTypes';
import { AvionicsConfig } from '../AvionicsConfig/AvionicsConfig';
import { InstrumentConfig } from '../InstrumentConfig/InstrumentConfig';

/**
 * A service which manages the state of a G3X Touch instrument's UI panes and views.
 */
export class UiService {

  private readonly pfdViewStack: UiViewStack;
  private readonly mfdViewStack: UiViewStack;

  private readonly interactionMapper = new UiInteractionMapper(this.instrumentIndex);

  /** The index of this service's parent GDU. */
  public readonly gduIndex = this.instrumentIndex;

  /** The format of this service's parent GDU. */
  public readonly gduFormat = this.instrumentConfig.gduFormat;

  /** The instrument type of this service's parent instrument. */
  public readonly instrumentType = this.instrumentConfig.type;

  private readonly _isReversionaryMode = Subject.create(false);
  /** Whether this service is operating in reversionary mode. */
  public readonly isReversionaryMode = this._isReversionaryMode as Subscribable<boolean>;

  private readonly _operatingType = Subject.create<InstrumentType>(this.instrumentType);
  /** The current operating type of this service's parent instrument. */
  public readonly operatingType = this._operatingType as Subscribable<InstrumentType>;

  private readonly _isInStartupPhase = Subject.create(false);
  /** Whether this service is in the startup phase. */
  public readonly isInStartupPhase = this._isInStartupPhase as Subscribable<boolean>;

  private readonly _gdu460PfdPaneSide = Subject.create<PfdPaneSide>('left');
  /** The side on which the PFD pane is positioned. Only applicable for GDU460 displays. */
  public readonly gdu460PfdPaneSide = this._gdu460PfdPaneSide as Subscribable<PfdPaneSide>;

  private readonly _gdu460EisLayout = this.config.engine.includeEis
    ? MappedSubject.create(
      ([operatingType, location, side, isReversionaryMode]) => {
        if (
          !isReversionaryMode
          && (
            location === DisplayLocationSettingMode.MFD && operatingType === 'PFD'
            || location === DisplayLocationSettingMode.PFD && operatingType === 'MFD'
          )
        ) {
          return EisLayouts.None;
        } else {
          return side === DisplayScreenSideSettingMode.Left ? EisLayouts.Left : EisLayouts.Right;
        }
      },
      this._operatingType,
      this.displaySettingManager.getSetting('displayEisLocation'),
      this.displaySettingManager.getSetting('displayEisScreenSide'),
      this._isReversionaryMode
    )
    : Subject.create(EisLayouts.None);
  /** The current EIS layout. Only applicable for GDU460 displays. */
  public readonly gdu460EisLayout = this._gdu460EisLayout as Subscribable<EisLayouts>;

  /** The current EIS size, or `undefined` if the EIS is not included. Only applicable for GDU460 displays. */
  public readonly gdu460EisSize = this.config.engine.eisSize;

  private readonly _isPaneSplit = Subject.create(false);
  /** Whether the UI panes are currently displayed in split mode. */
  public readonly isPaneSplit = this._isPaneSplit as Subscribable<boolean>;

  private readonly _selectedPfdPageKey = Subject.create<string>(UiViewKeys.PfdInstruments);
  /** The key of the currently selected PFD page. */
  public readonly selectedPfdPageKey = this._selectedPfdPageKey as Subscribable<string>;

  private readonly _selectedMfdMainPageKey = Subject.create<string>(MfdMainPageKeys.Map);
  /** The key of the currently selected MFD main page. */
  public readonly selectedMfdMainPageKey = this._selectedMfdMainPageKey as Subscribable<string>;

  private readonly _selectedMfdNrstPageKey = Subject.create<string>(MfdNrstPageKeys.Airport);
  /** The key of the currently selected MFD NRST page. */
  public readonly selectedMfdNrstPageKey = this._selectedMfdNrstPageKey as Subscribable<string>;

  /** An array of IDs of the valid bezel rotary knobs supported by this service's parent GDU. */
  public readonly validKnobIds = this.gduFormat === '460'
    ? [UiKnobId.LeftOuter, UiKnobId.LeftInner, UiKnobId.LeftInnerPush, UiKnobId.RightOuter, UiKnobId.RightInner, UiKnobId.RightInnerPush]
    : [UiKnobId.SingleOuter, UiKnobId.SingleInner, UiKnobId.SingleInnerPush] as readonly UiKnobId[];

  private readonly paneKnobControlCode = this.gduFormat === '460'
    ? MappedSubject.create(
      ([isPfdVisible, isMfdVisible, pfdPaneSide]) => {
        if (isPfdVisible && isMfdVisible) {
          return pfdPaneSide === 'right'
            ? UiService.knobControlSidesToCode(UiKnobControlSide.Right, UiKnobControlSide.Left)
            : UiService.knobControlSidesToCode(UiKnobControlSide.Left, UiKnobControlSide.Right);
        } else if (isPfdVisible) {
          return UiService.knobControlSidesToCode(UiKnobControlSide.Both, UiKnobControlSide.None);
        } else if (isMfdVisible) {
          return UiService.knobControlSidesToCode(UiKnobControlSide.None, UiKnobControlSide.Both);
        } else {
          return 0;
        }
      },
      this.isPfdPaneVisible,
      this.isMfdPaneVisible,
      this._gdu460PfdPaneSide
    )
    : this.isMfdPaneVisible.map(isMfdPaneVisible => {
      if (isMfdPaneVisible) {
        return UiService.knobControlSidesToCode(UiKnobControlSide.None, UiKnobControlSide.Both);
      } else {
        return UiService.knobControlSidesToCode(UiKnobControlSide.Both, UiKnobControlSide.None);
      }
    });

  private readonly _pfdPaneKnobControlSide = this.paneKnobControlCode.map(UiService.knobControlCodeToSide.bind(undefined, 'pfd'));
  /** The side(s) for which the PFD pane controls the bezel rotary knobs. */
  public readonly pfdPaneKnobControlSide = this._pfdPaneKnobControlSide as Subscribable<number>;

  private readonly _mfdPaneKnobControlSide = this.paneKnobControlCode.map(UiService.knobControlCodeToSide.bind(undefined, 'mfd'));
  /** The side(s) for which the MFD pane controls the bezel rotary knobs. */
  public readonly mfdPaneKnobControlSide = this._mfdPaneKnobControlSide as Subscribable<number>;

  private readonly _knobLabelState: Record<UiKnobId, Subject<string>> = {
    [UiKnobId.SingleOuter]: Subject.create(''),
    [UiKnobId.SingleInner]: Subject.create(''),
    [UiKnobId.SingleInnerPush]: Subject.create(''),
    [UiKnobId.LeftOuter]: Subject.create(''),
    [UiKnobId.LeftInner]: Subject.create(''),
    [UiKnobId.LeftInnerPush]: Subject.create(''),
    [UiKnobId.RightOuter]: Subject.create(''),
    [UiKnobId.RightInner]: Subject.create(''),
    [UiKnobId.RightInnerPush]: Subject.create('')
  };
  /** This service's computed label state for the bezel rotary knobs. */
  public readonly knobLabelState = this._knobLabelState as UiKnobLabelState;

  private readonly selectedPfdPageKeyPipe = this.displaySettingManager.getSetting('displayMfdSplitScreenPageKey').pipe(this._selectedPfdPageKey, true);
  private readonly selectedPfdPageKeySub = this._selectedPfdPageKey.sub(this.onSelectedPfdPageKeyChanged.bind(this), false, true);

  private _isAwake = false;
  private _isInitialized = false;

  private areViewStackContainersAttached = false;

  /**
   * Creates a new instance of UiService.
   * @param instrumentIndex The index of this service's parent instrument.
   * @param config The general avionics configuration object.
   * @param instrumentConfig The configuration object of this service's parent instrument.
   * @param bus The event bus.
   * @param isPfdPaneVisible A {@link MutableSubscribable} which controls whether this service's parent instrument's
   * PFD UI pane is visible.
   * @param isMfdPaneVisible A {@link MutableSubscribable} which controls whether this service's parent instrument's
   * MFD UI pane is visible.
   * @param displaySettingManager A manager for display user settings for this service's parent instrument.
   */
  public constructor(
    public readonly instrumentIndex: number,
    private readonly config: AvionicsConfig,
    private readonly instrumentConfig: InstrumentConfig,
    public readonly bus: EventBus,
    private readonly isPfdPaneVisible: MutableSubscribable<boolean>,
    private readonly isMfdPaneVisible: MutableSubscribable<boolean>,
    private readonly displaySettingManager: UserSettingManager<DisplayUserSettingTypes>
  ) {
    this.pfdViewStack = new UiViewStack(this);
    this.mfdViewStack = new UiViewStack(this);
  }

  /**
   * Attaches containers to this service's view stacks.
   * @param pfdContainer The container to which to attach the PFD view stack.
   * @param mfdContainer The container to which to attach the MFD view stack.
   * @throws Error if this service's view stacks have already been attached to containers.
   */
  public attachViewStackContainers(pfdContainer: UiViewStackContainer, mfdContainer: UiViewStackContainer): void {
    if (this.areViewStackContainersAttached) {
      throw new Error('UiService: cannot attach view stacks to containers after they have already been attached');
    }

    this.pfdViewStack.attachToContainer(pfdContainer);
    this.mfdViewStack.attachToContainer(mfdContainer);

    this.areViewStackContainersAttached = true;
  }

  /**
   * Registers and renders a view with this service's PFD view stack. Once a view is registered, it may be opened by
   * referencing its key.
   * @param layer The view stack layer to which to assign the view.
   * @param lifecyclePolicy The lifecycle policy to apply to the view.
   * @param key The key to register the view under.
   * @param factory A function which renders the view.
   * @throws Error if the specified key is invalid.
   */
  public registerPfdView(
    layer: UiViewStackLayer,
    lifecyclePolicy: UiViewLifecyclePolicy,
    key: string,
    factory: (uiService: UiService, containerRef: NodeReference<HTMLElement>) => VNode
  ): void {
    this.pfdViewStack.registerView(layer, lifecyclePolicy, key, factory);
  }

  /**
   * Registers and renders a view with this service's MFD view stack. Once a view is registered, it may be opened by
   * referencing its key.
   * @param layer The view stack layer to which to assign the view.
   * @param lifecyclePolicy The lifecycle policy to apply to the view.
   * @param key The key to register the view under.
   * @param factory A function which renders the view.
   * @throws Error if the specified key is invalid.
   */
  public registerMfdView(
    layer: UiViewStackLayer,
    lifecyclePolicy: UiViewLifecyclePolicy,
    key: string,
    factory: (uiService: UiService, containerRef: NodeReference<HTMLElement>) => VNode
  ): void {
    this.mfdViewStack.registerView(layer, lifecyclePolicy, key, factory);
  }

  /**
   * Initializes this service.
   * @throws Error if this service's view stacks are not attached to containers.
   */
  public initialize(): void {
    if (!this.areViewStackContainersAttached) {
      throw new Error('UiService: cannot initialize service before view stacks are attached to containers');
    }

    if (this._isInitialized) {
      return;
    }

    this._isInitialized = true;

    this.displaySettingManager.getSetting('displayPfdPaneSide').pipe(this._gdu460PfdPaneSide, setting => {
      return setting === DisplayScreenSideSettingMode.Right ? 'right' : 'left';
    });

    if (this._operatingType.get() === 'PFD') {
      // If we are operating as a PFD, then the selected PFD page is always the PFD instruments view.
      this.selectedPfdPageKeyPipe.pause();
      this._selectedPfdPageKey.set(UiViewKeys.PfdInstruments);

      if (this._isInStartupPhase.get()) {
        // If we are in the startup phase, then the panes should be split and the MFD startup page should be open.
        this._isPaneSplit.set(true);
        this.isPfdPaneVisible.set(true);
        this.isMfdPaneVisible.set(true);

        this.mfdViewStack.changePageTo(UiViewKeys.Startup);
      } else {
        // If we are not in the startup phase, then reversionary mode and user setting will determine whether to start
        // the panes in split mode. If the MFD pane is visible, then the MFD main page should be open.

        const shouldSplit = this._isReversionaryMode.get() || this.displaySettingManager.getSetting('displayStartupSplitMode').value;

        this._isPaneSplit.set(shouldSplit);
        this.isPfdPaneVisible.set(true);
        this.isMfdPaneVisible.set(shouldSplit);

        if (shouldSplit) {
          this.mfdViewStack.changePageTo(UiViewKeys.MfdMain);
        }
      }

      this.pfdViewStack.changePageTo(UiViewKeys.PfdInstruments);
    } else {
      // If we are operating as an MFD, then the selected PFD page should be kept in sync with the user setting.
      this.selectedPfdPageKeyPipe.resume(true);

      if (this._isInStartupPhase.get()) {
        // If we are in the startup phase, then the MFD pane should be full screen and the MFD startup page should be open.
        this._isPaneSplit.set(true);
        this.isPfdPaneVisible.set(true);
        this.isMfdPaneVisible.set(true);

        this.mfdViewStack.changePageTo(UiViewKeys.Startup);
      } else {
        // If we are not in the startup phase, then user setting will determine whether to start the panes in split
        // mode. The MFD main page should be open.

        const shouldSplit = this.displaySettingManager.getSetting('displayStartupSplitMode').value;

        this._isPaneSplit.set(shouldSplit);
        this.isPfdPaneVisible.set(shouldSplit);
        this.isMfdPaneVisible.set(true);

        this.mfdViewStack.changePageTo(UiViewKeys.MfdMain);

        if (shouldSplit) {
          this.selectedPfdPageKeySub.resume(true);
        }
      }
    }

    MappedSubject.create(
      this.paneKnobControlCode,
      this.pfdViewStack.knobLabelState,
      this.mfdViewStack.knobLabelState,
    ).sub(this.updateKnobLabelState.bind(this), true);

    this.bus.getSubscriber<HEvent>().on('hEvent').handle(this.onHEvent.bind(this));
  }

  /**
   * Wakes this service.
   */
  public wake(): void {
    if (this._isAwake) {
      return;
    }

    this.pfdViewStack.wake();
    this.mfdViewStack.wake();

    this._isAwake = true;
  }

  /**
   * Puts this service to sleep.
   */
  public sleep(): void {
    if (!this._isAwake) {
      return;
    }

    this.pfdViewStack.sleep();
    this.mfdViewStack.sleep();

    this._isAwake = false;
  }

  /**
   * Enters the startup phase. When entering the startup phase, the MFD pane is made visible (split screen if this
   * service's parent instrument is operating as a PFD, and full screen if operating as an MFD), all popups on both
   * panes are closed, and the MFD startup view is opened.
   */
  public enterStartupPhase(): void {
    if (this._isInStartupPhase.get()) {
      return;
    }

    this._isInStartupPhase.set(true);

    if (!this._isInitialized) {
      return;
    }

    if (this._operatingType.get() === 'PFD') {
      this.closeAllPfdPopups();

      if (this._isPaneSplit.get()) {
        this.mfdViewStack.goBackToEmptyPage();
        this.mfdViewStack.changePageTo(UiViewKeys.Startup);
      } else {
        this.toggleSplitPaneMode(true, UiViewKeys.Startup);
      }
    } else {
      this.toggleSplitPaneMode(false);

      this.mfdViewStack.goBackToEmptyPage();
      this.mfdViewStack.changePageTo(UiViewKeys.Startup);
    }
  }

  /**
   * Exits the startup phase. When exiting the startup phase, the full/split screen mode defined by the
   * `displayStartupSplitMode` user setting is applied, and if the MFD pane is visible the MFD main view is opened.
   */
  public exitStartupPhase(): void {
    if (!this._isInStartupPhase.get()) {
      return;
    }

    this._isInStartupPhase.set(false);

    if (!this._isInitialized) {
      return;
    }

    this.toggleSplitPaneMode(this._isReversionaryMode.get() || this.displaySettingManager.getSetting('displayStartupSplitMode').value);

    // If the MFD pane is visible, ensure the main page is open.
    if (this.isMfdPaneVisible.get()) {
      this.mfdViewStack.goBackToEmptyPage();
      this.mfdViewStack.changePageTo(UiViewKeys.MfdMain);

      // TODO: support startup page user setting.
      this._selectedMfdMainPageKey.set(MfdMainPageKeys.Map);
    }
  }

  /**
   * Sets whether this service is operating in reversionary mode.
   * @param isReversionaryMode Whether this service is operating in reversionary mode.
   */
  public setReversionaryMode(isReversionaryMode: boolean): void {
    if (this._isReversionaryMode.get() === isReversionaryMode) {
      return;
    }

    this._isReversionaryMode.set(isReversionaryMode);

    this._operatingType.set(this.instrumentType === 'MFD' && !isReversionaryMode ? 'MFD' : 'PFD');

    if (!this._isInitialized) {
      return;
    }

    if (this.instrumentType === 'MFD') {
      if (isReversionaryMode) {
        // In reversionary mode, the selected PFD page is always the PFD instruments view.
        this.selectedPfdPageKeySub.pause();
        this.selectedPfdPageKeyPipe.pause();
        this._selectedPfdPageKey.set(UiViewKeys.PfdInstruments);

        // Always ensure the pane is split when entering reversionary mode.
        this._isPaneSplit.set(true);
        this.isPfdPaneVisible.set(true);
        this.isMfdPaneVisible.set(true);

        // Open the PFD instruments view if it is not already open.
        if (this.pfdViewStack.openPage.get().key !== UiViewKeys.PfdInstruments) {
          this.pfdViewStack.goBackToEmptyPage();
          this.pfdViewStack.changePageTo(UiViewKeys.PfdInstruments);
        }
      } else {
        // Outside of reversionary mode, the selected PFD page should be kept in sync with the user setting.
        this.selectedPfdPageKeyPipe.resume(true);

        if (this._isInStartupPhase.get()) {
          this._isPaneSplit.set(false);
          this.isPfdPaneVisible.set(false);
          this.isMfdPaneVisible.set(true);

          if (this.mfdViewStack.openPage.get().key !== UiViewKeys.Startup) {
            this.mfdViewStack.goBackToEmptyPage();
            this.mfdViewStack.changePageTo(UiViewKeys.Startup);
          }
        } else {
          if (this._isPaneSplit.get()) {
            this.selectedPfdPageKeySub.resume(true);
          } else {
            this.pfdViewStack.goBackToEmptyPage();
            this.isPfdPaneVisible.set(false);

            this.isMfdPaneVisible.set(true);
            this.mfdViewStack.changePageTo(UiViewKeys.MfdMain);
          }
        }
      }
    } else {
      if (isReversionaryMode) {
        // Split the pane if entering reversionary mode. If we are in startup mode, then the pane should already be
        // split, so this operation will correctly do nothing.
        this.setSplitPaneMode(true, UiViewKeys.MfdMain);
      }
    }
  }

  /**
   * Updates this service's PFD view stack. Has no effect if this service is not initialized or is asleep.
   * @param time The current real (operating system) time, as a Javascript timestamp.
   */
  public updatePfdViewStack(time: number): void {
    if (this._isInitialized && this._isAwake) {
      this.pfdViewStack.update(time);
    }
  }

  /**
   * Updates this service's MFD view stack. Has no effect if this service is not initialized or is asleep.
   * @param time The current real (operating system) time, as a Javascript timestamp.
   */
  public updateMfdViewStack(time: number): void {
    if (this._isInitialized && this._isAwake) {
      this.mfdViewStack.update(time);
    }
  }

  /**
   * Opens the MFD pane. This method does nothing if the MFD pane is already visible.
   * @param openMfdPageKey The MFD view page to open if the MFD pane is made visible as a result of this operation.
   * Defaults to `UiViewKeys.MfdMain`.
   */
  public openMfdPane(openMfdPageKey: string = UiViewKeys.MfdMain): void {
    if (this._operatingType.get() === 'PFD') {
      this.setSplitPaneMode(true, openMfdPageKey);
    }
  }

  /**
   * Toggles whether the UI panes should be displayed in split mode.
   * @param force The split mode state to which to toggle (`true` = split, `false` = full). If not defined, then the
   * state will be toggled to the opposite of the current state.
   * @param openMfdPageKey The MFD view page to open if the MFD pane is made visible as a result of turning split mode
   * on. Defaults to `UiViewKeys.MfdMain`.
   * @throws Error if this service is not initialized.
   */
  public toggleSplitPaneMode(force?: boolean, openMfdPageKey: string = UiViewKeys.MfdMain): void {
    this.setSplitPaneMode(force ?? !this._isPaneSplit.get(), openMfdPageKey);
  }

  /**
   * Sets whether the UI panes should be displayed in split mode.
   * @param split Whether to display the UI panes in split mode.
   * @param openMfdPageKey The MFD view page to open if the MFD pane is made visible as a result of turning split mode
   * on. If not defined, then the empty page will remain open on the MFD view stack if the MFD pane is made visible.
   * @throws Error if this service is not initialized.
   */
  private setSplitPaneMode(split: boolean, openMfdPageKey?: string): void {
    if (!this._isInitialized) {
      throw new Error('UiService: cannot set split pane mode before initialization');
    }

    const isSplit = this._isPaneSplit.get();

    if (split === isSplit) {
      return;
    }

    const operatingType = this._operatingType.get();

    if (operatingType === 'PFD') {
      if (!split) {
        // We are closing the MFD pane.
        this.mfdViewStack.goBackToEmptyPage();
        this.mfdViewStack.resetViewAnimations();
      }

      this.isMfdPaneVisible.set(split);
    } else {
      if (!split) {
        // We are closing the PFD pane.
        this.pfdViewStack.goBackToEmptyPage();
        this.pfdViewStack.resetViewAnimations();
      }

      this.isPfdPaneVisible.set(split);
    }

    this._isPaneSplit.set(split);

    // If we are operating as an MFD and the PFD pane was opened, then make sure the open PFD page stays in sync with
    // the selected PFD page. Otherwise, the open PFD page should remain the same (if we are operating as a PFD, then
    // the open page is already set to the PFD instruments view and should not change, and if the PFD pane was closed,
    // then the open page should remain the empty page).
    if (
      operatingType === 'MFD'
      && split
    ) {
      this.selectedPfdPageKeySub.resume(true);
    } else {
      this.selectedPfdPageKeySub.pause();
    }

    // If we are opening the MFD pane, then check if we need to push an MFD page onto the MFD view stack.
    if (
      operatingType === 'PFD'
      && split
      && openMfdPageKey !== undefined
    ) {
      this.mfdViewStack.changePageTo(openMfdPageKey);
    }
  }

  /**
   * Opens a PFD view as a popup. The opened view will be brought to the top of the view stack.
   * @param key The key of the view to open.
   * @param closeOtherPopups Whether to close other popups before opening the new popup. If `true` and the new popup
   * is opened in the overlay layer, then all popups in the overlay layer will be closed. If `true` and the new popup
   * is opened in the main layer, then all popups in both the main and overlay layers will be closed. Defaults to
   * `false`.
   * @param popupOptions Options describing how to open the popup. If not defined, then the popup will default to type
   * `'normal'` and with a background occlusion type of `'darken'`.
   * @returns The entry of the opened view.
   * @throws Error if this service is not initialized, the specified key is equal to `UiViewKeys.EmptyPage`, there is
   * no view registered under the specified key, or the view to open is already open.
   */
  public openPfdPopup<T extends UiView = UiView>(
    key: string,
    closeOtherPopups = false,
    popupOptions?: Readonly<UiPopupOpenOptions>
  ): RenderedUiViewEntry<T> {
    if (!this._isInitialized) {
      throw new Error('UiService: cannot open PFD popup before initialization');
    }

    if (key === UiViewKeys.EmptyPage) {
      throw new Error('UiService: cannot open the empty page as a PFD popup');
    }

    if (this._operatingType.get() === 'MFD' && !this._isPaneSplit.get()) {
      // If we are opening a PFD popup and the PFD pane is not visible, then split the pane.
      this.setSplitPaneMode(true);
    }

    if (closeOtherPopups) {
      this.pfdViewStack.closeAllOverlayViews();
    }

    return this.pfdViewStack.openPopup(UiViewStackLayer.Overlay, key, popupOptions);
  }

  /**
   * Returns to the most recent previous history state of the PFD view stack. If the PFD pane is not visible, then this
   * method does nothing.
   * @returns The active view entry in the PFD view stack after the operation is complete, or `null` if the PFD pane is
   * not visible.
   * @throws Error if this service is not initialized.
   */
  public goBackPfd(): RenderedUiViewEntry | null {
    if (!this._isInitialized) {
      throw new Error('UiService: cannot return to a previous PFD view stack state before initialization');
    }

    if (!this.isPfdPaneVisible.get()) {
      return null;
    }

    const activeViewEntry = this.pfdViewStack.activeView.get();

    // Do not allow the PFD view stack page to be closed.
    if (activeViewEntry === this.pfdViewStack.openPage.get()) {
      return activeViewEntry;
    }

    return this.pfdViewStack.goBack();
  }

  /**
   * Attempts to return to a previous history state of the PFD view stack. If the PFD pane is not visible, then this
   * method does nothing.
   * @param selector A function which selects the history state to which to return. The function is called once for
   * each history state in order of increasing age and takes two arguments: the number of steps from the present state
   * to the selected state and a function which allows one to peek into the selected state's view stack. The function
   * should return `true` if the operation should return to the selected state and `false` otherwise. If the function
   * returns `false` for every selected state, then the operation is aborted.
   * @returns The active view entry in the MFD view stack after the operation is complete, or `null` if the MFD pane is
   * not visible after the operation is complete.
   * @throws Error if this service is not initialized.
   */
  public goBackToPfd(
    selector: (steps: number, stackPeeker: (depth: number) => UiViewStackItem | undefined) => boolean
  ): RenderedUiViewEntry | null {
    if (!this._isInitialized) {
      throw new Error('UiService: cannot return to a previous MFD view stack state before initialization');
    }

    if (!this.isPfdPaneVisible.get()) {
      return null;
    }

    let skip = false;

    const wrappedSelector = (steps: number, stackPeeker: (depth: number) => UiViewStackItem | undefined): boolean => {
      if (skip) {
        return false;
      }

      // Do not allow the PFD view stack page to be closed.
      const topView = stackPeeker(0) as UiViewStackItem;
      if (topView.type === 'page') {
        skip = true;
      }

      return selector(steps, stackPeeker);
    };

    return this.pfdViewStack.goBackTo(wrappedSelector);
  }

  /**
   * Attempts to close a popup in the PFD view stack by rewinding the history state of the view stack until the target
   * popup is no longer open. If the PFD pane is not visible, then this method does nothing.
   * @param filter A filter function which takes in a popup with the specified key and returns whether it is
   * the popup to close.
   * @returns `true` if the specified popup was closed, or `false` if the popup was not open in the first place.
   * @throws Error if this service is not initialized.
   */
  public closePfdPopup<F extends RenderedUiViewEntry = RenderedUiViewEntry>(
    filter: (popup: F) => boolean
  ): boolean {
    if (!this._isInitialized) {
      throw new Error('UiService: cannot return to a previous MFD view stack state before initialization');
    }

    if (!this.isPfdPaneVisible.get()) {
      return false;
    }

    let didClose = false;

    // This operation will attempt to rewind the history state such that the target popup is the active view...
    this.pfdViewStack.goBackTo((steps, stackPeeker) => {
      const topView = stackPeeker(0) as UiViewStackItem;
      if (topView.type === 'popup' && filter(topView.viewEntry as F)) {
        didClose = true;
        return true;
      } else {
        return false;
      }
    });

    // ... and this will rewind the history state one more time to close the target popup (if it was found to be open).
    if (didClose) {
      this.pfdViewStack.goBack();
    }

    return didClose;
  }

  /**
   * Returns to the most recent history state of the PFD view stack in which the view stack contains no open popups. If
   * the PFD pane is not visible, then this method does nothing.
   * @returns The active view entry in the PFD view stack after the operation is complete, or `null` if the PFD pane is
   * not visible.
   * @throws Error if this service is not initialized.
   */
  public closeAllPfdPopups(): RenderedUiViewEntry | null {
    if (!this._isInitialized) {
      throw new Error('UiService: cannot return to a previous PFD view stack state before initialization');
    }

    if (!this.isPfdPaneVisible.get()) {
      return null;
    }

    return this.pfdViewStack.closeAllOverlayViews();
  }

  /**
   * Resets the state of the MFD pane such that the open page and active view is a page with a given key. First, an
   * attempt is made to rewind the history state of the MFD pane until the above conditions are met. If this is not
   * possible, then the history state is rewound until only the empty page is open and then the page with the specified
   * key is opened. If the MFD pane is not visible, then this method does nothing.
   * @param key The key of the page view to which to reset.
   * @returns The entry of the page view to which the MFD pane was reset, or `null` if the MFD pane is not visible.
   * @throws Error if this service is not initialized, the specified key is equal to `UiViewKeys.EmptyPage`, or there
   * is no view registered under the specified key.
   */
  public resetMfdToPage<T extends UiView = UiView>(key: string): RenderedUiViewEntry<T> | null {
    if (!this._isInitialized) {
      throw new Error('UiService: cannot change MFD page before initialization');
    }

    if (!this.isMfdPaneVisible.get()) {
      return null;
    }

    const viewEntry = this.mfdViewStack.goBackTo((steps, stackPeeker) => {
      const topViewEntry = stackPeeker(0);
      return topViewEntry !== undefined
        && topViewEntry.viewEntry.layer === UiViewStackLayer.Main
        && topViewEntry.viewEntry.key === key;
    });

    if (viewEntry.layer === UiViewStackLayer.Main && viewEntry.key === key) {
      return viewEntry as RenderedUiViewEntry<T>;
    }

    this.mfdViewStack.goBackToEmptyPage();
    return this.mfdViewStack.changePageTo(key);
  }

  /**
   * Changes the open MFD page. Changing the page also closes all open MFD popups. If the MFD pane is not visible, then
   * this method does nothing.
   * @param key The key of the view to open.
   * @returns The entry of the opened view, or `null` if the MFD pane is not visible.
   * @throws Error if this service is not initialized, the specified key is equal to `UiViewKeys.EmptyPage`, there is
   * no view registered under the specified key, or the view to open is already open.
   */
  public changeMfdPage<T extends UiView = UiView>(key: string): RenderedUiViewEntry<T> | null {
    if (!this._isInitialized) {
      throw new Error('UiService: cannot change MFD page before initialization');
    }

    if (key === UiViewKeys.EmptyPage) {
      throw new Error('UiService: cannot change MFD page to the empty page');
    }

    if (!this.isMfdPaneVisible.get()) {
      return null;
    }

    this.closeAllMfdPopups(false);
    return this.mfdViewStack.changePageTo(key);
  }

  /**
   * Opens an MFD view as a popup. The opened view will be brought to the top of its view stack layer.
   * @param layer The view stack layer in which to open the view.
   * @param key The key of the view to open.
   * @param closeOtherPopups Whether to close other popups before opening the new popup. If `true` and the new popup
   * is opened in the overlay layer, then all popups in the overlay layer will be closed. If `true` and the new popup
   * is opened in the main layer, then all popups in both the main and overlay layers will be closed. Defaults to
   * `false`.
   * @param popupOptions Options describing how to open the popup. If not defined, then the popup will default to type
   * `'normal'` and with a background occlusion type of `'darken'`.
   * @returns The entry of the opened view.
   * @throws Error if this service is not initialized, the specified key is equal to `UiViewKeys.EmptyPage`, there is
   * no view registered under the specified key, or the view to open is already open.
   */
  public openMfdPopup<T extends UiView = UiView>(
    layer: UiViewStackLayer,
    key: string,
    closeOtherPopups = false,
    popupOptions?: Readonly<UiPopupOpenOptions>
  ): RenderedUiViewEntry<T> {
    if (!this._isInitialized) {
      throw new Error('UiService: cannot open MFD popup before initialization');
    }

    if (key === UiViewKeys.EmptyPage) {
      throw new Error('UiService: cannot open the empty page as an MFD popup');
    }

    if (this._operatingType.get() === 'PFD' && !this._isPaneSplit.get()) {
      // If we are opening an MFD popup and the MFD pane is not visible, then split the pane.
      this.setSplitPaneMode(true, layer === UiViewStackLayer.Main ? UiViewKeys.MfdMain : undefined);
    }

    if (closeOtherPopups) {
      if (layer === UiViewStackLayer.Overlay) {
        this.mfdViewStack.closeAllOverlayViews();
      } else {
        this.mfdViewStack.goBackToPage();
      }
    }

    return this.mfdViewStack.openPopup(layer, key, popupOptions);
  }

  /**
   * Returns to the most recent previous history state of the MFD view stack. If the MFD pane is not visible, then this
   * method does nothing.
   * @param closeMfdPaneIfEmpty Whether to close the MFD pane if possible should there be no previous history state to
   * which to return or should the operation result in the MFD view stack containing no open views except the empty
   * page. Defaults to `true`.
   * @returns The active view entry in the MFD view stack after the operation is complete, or `null` if the MFD pane is
   * not visible after the operation is complete.
   * @throws Error if this service is not initialized.
   */
  public goBackMfd(closeMfdPaneIfEmpty = true): RenderedUiViewEntry | null {
    if (!this._isInitialized) {
      throw new Error('UiService: cannot return to a previous MFD view stack state before initialization');
    }

    if (!this.isMfdPaneVisible.get()) {
      return null;
    }

    if (this._operatingType.get() === 'MFD' && this.mfdViewStack.activeView.get() === this.mfdViewStack.openPage.get()) {
      // If the active MFD view is the open page and we are operating as an MFD, then we need to ensure that we don't
      // go back to the state where the active view is the empty page.

      let canGoBack = false;
      this.mfdViewStack.visitHistory((step, stackPeeker) => {
        if (step === 1) {
          canGoBack = stackPeeker(0)?.viewEntry.key !== UiViewKeys.EmptyPage;
          return false;
        } else {
          return true;
        }
      });

      if (canGoBack) {
        return this.mfdViewStack.goBack();
      } else {
        return this.mfdViewStack.activeView.get();
      }
    } else {
      // If the active MFD view is not the open page, then revert to the previous history state in the MFD view stack.
      // If the resulting new active view is the empty page, then close the MFD pane if we are able to do so.
      const activeView = this.mfdViewStack.goBack();
      if (activeView.key === UiViewKeys.EmptyPage) {
        if (this._operatingType.get() === 'PFD') {
          if (closeMfdPaneIfEmpty) {
            this.setSplitPaneMode(false);
            return null;
          } else {
            return activeView;
          }
        } else {
          // It should be impossible to fall into this case...
          this.mfdViewStack.goBackToEmptyPage();
          this.mfdViewStack.changePageTo(UiViewKeys.MfdMain);
          return this.mfdViewStack.activeView.get();
        }
      } else {
        return activeView;
      }
    }
  }

  /**
   * Attempts to return to a previous history state of the MFD view stack. If the MFD pane is not visible, then this
   * method does nothing.
   * @param selector A function which selects the history state to which to return. The function is called once for
   * each history state in order of increasing age and takes two arguments: the number of steps from the present state
   * to the selected state and a function which allows one to peek into the selected state's view stack. The function
   * should return `true` if the operation should return to the selected state and `false` otherwise. If the function
   * returns `false` for every selected state, then the operation is aborted.
   * @param closeMfdPaneIfEmpty Whether to close the MFD pane if possible should the operation result in the MFD view
   * stack containing no open views except the empty page. Defaults to `true`.
   * @returns The active view entry in the MFD view stack after the operation is complete, or `null` if the MFD pane is
   * not visible after the operation is complete.
   * @throws Error if this service is not initialized.
   */
  public goBackToMfd(
    selector: (steps: number, stackPeeker: (depth: number) => UiViewStackItem | undefined) => boolean,
    closeMfdPaneIfEmpty = true
  ): RenderedUiViewEntry | null {
    if (!this._isInitialized) {
      throw new Error('UiService: cannot return to a previous MFD view stack state before initialization');
    }

    if (!this.isMfdPaneVisible.get()) {
      return null;
    }

    let skip = false;
    let shouldCloseMfdPane = false;

    const wrappedSelector = (steps: number, stackPeeker: (depth: number) => UiViewStackItem | undefined): boolean => {
      if (skip) {
        return false;
      }

      // Do not allow the empty page to be closed.
      const topView = stackPeeker(0) as UiViewStackItem;
      if (topView.type === 'page' && topView.viewEntry.key === UiViewKeys.EmptyPage) {
        skip = true;
      }

      const result = selector(steps, stackPeeker);

      // If we are reverting to a state where the empty page is the active view, then check if we should close the
      // MFD pane. If so, then we will skip reverting the view stack state because closing the pane will do that for
      // us.
      if (result && skip && closeMfdPaneIfEmpty) {
        shouldCloseMfdPane = true;
        return false;
      }

      return result;
    };

    const activeView = this.mfdViewStack.goBackTo(wrappedSelector);
    if (shouldCloseMfdPane) {
      this.setSplitPaneMode(false);
      return null;
    } else {
      return activeView;
    }
  }

  /**
   * Attempts to close a popup in the MFD view stack by rewinding the history state of the view stack until the target
   * popup is no longer open. If the MFD pane is not visible, then this method does nothing.
   * @param filter A filter function which takes in a popup with the specified key and returns whether it is
   * the popup to close.
   * @param closeMfdPaneIfEmpty Whether to close the MFD pane if possible should the operation result in the MFD view
   * stack containing no open views except the empty page. Defaults to `true`.
   * @returns `true` if the specified popup was closed, or `false` if the popup was not open in the first place.
   * @throws Error if this service is not initialized.
   */
  public closeMfdPopup<F extends RenderedUiViewEntry = RenderedUiViewEntry>(
    filter: (popup: F) => boolean,
    closeMfdPaneIfEmpty = true
  ): boolean {
    if (!this._isInitialized) {
      throw new Error('UiService: cannot return to a previous MFD view stack state before initialization');
    }

    if (!this.isMfdPaneVisible.get()) {
      return false;
    }

    let didClose = false;

    // This operation will attempt to rewind the history state such that the target popup is the active view...
    this.mfdViewStack.goBackTo((steps, stackPeeker) => {
      const topView = stackPeeker(0) as UiViewStackItem;
      if (topView.type === 'popup' && filter(topView.viewEntry as F)) {
        didClose = true;
        return true;
      } else {
        return false;
      }
    });

    // ... and this will rewind the history state one more time to close the target popup (if it was found to be open).
    if (didClose) {
      this.mfdViewStack.goBack();

      if (this._operatingType.get() === 'PFD' && closeMfdPaneIfEmpty && this.mfdViewStack.activeView.get().key === UiViewKeys.EmptyPage) {
        this.setSplitPaneMode(false);
      }
    }

    return didClose;
  }

  /**
   * Returns to the most recent history state of the MFD view stack in which the overlay layer contains no open views.
   * If the MFD pane is not visible, then this method does nothing.
   * @param closeMfdPaneIfEmpty Whether to close the MFD pane if possible should the operation result in the MFD view
   * stack containing no open views except the empty page. Defaults to `true`.
   * @returns The active view entry in the MFD view stack after the operation is complete, or `null` if the MFD pane is
   * not visible after the operation is complete.
   * @throws Error if this service is not initialized.
   */
  public closeAllMfdOverlayViews(closeMfdPaneIfEmpty = true): RenderedUiViewEntry | null {
    if (!this._isInitialized) {
      throw new Error('UiService: cannot return to a previous MFD view stack state before initialization');
    }

    if (!this.isMfdPaneVisible.get()) {
      return null;
    }

    const activeViewEntry = this.mfdViewStack.closeAllOverlayViews();

    if (this._operatingType.get() === 'PFD' && closeMfdPaneIfEmpty && activeViewEntry.key === UiViewKeys.EmptyPage) {
      this.setSplitPaneMode(false);
      return null;
    } else {
      return activeViewEntry;
    }
  }

  /**
   * Returns to the most recent history state of the MFD view stack in which the MFD view stack contains no open
   * popups. If the MFD pane is not visible, then this method does nothing.
   * @param closeMfdPaneIfEmpty Whether to close the MFD pane if possible should the operation result in the MFD view
   * stack containing no open views except the empty page. Defaults to `true`.
   * @returns The active view entry in the MFD view stack after the operation is complete, or `null` if the MFD pane is
   * not visible after the operation is complete.
   * @throws Error if this service is not initialized.
   */
  public closeAllMfdPopups(closeMfdPaneIfEmpty = true): RenderedUiViewEntry | null {
    if (!this._isInitialized) {
      throw new Error('UiService: cannot return to a previous MFD view stack state before initialization');
    }

    if (!this.isMfdPaneVisible.get()) {
      return null;
    }

    const activeViewEntry = this.mfdViewStack.goBackToPage();

    if (this._operatingType.get() === 'PFD' && closeMfdPaneIfEmpty && activeViewEntry.key === UiViewKeys.EmptyPage) {
      this.setSplitPaneMode(false);
      return null;
    } else {
      return activeViewEntry;
    }
  }

  /**
   * Selects an MFD main page to display.
   * @param key The key of the page to select.
   */
  public selectMfdMainPage(key: string): void {
    this._selectedMfdMainPageKey.set(key);
  }

  /**
   * Selects an MFD NRST page to display.
   * @param key The key of the page to select.
   */
  public selectMfdNrstPage(key: string): void {
    this._selectedMfdNrstPageKey.set(key);
  }

  /**
   * Responds to when the key of the selected PFD page changes.
   * @param key The key of the new selected PFD page.
   */
  private onSelectedPfdPageKeyChanged(key: string): void {
    if (this.pfdViewStack.openPage.get().key !== key) {
      this.pfdViewStack.goBackToEmptyPage();
      this.pfdViewStack.changePageTo(key);
    }
  }

  /**
   * Updates this service's bezel rotary knob label state.
   * @param state The current input state for the knob label state.
   * @param state."0" The current knob control code.
   * @param state."1" The current knob label state requested by the PFD pane.
   * @param state."2" The current knob label state requested by the MFD pane.
   */
  private updateKnobLabelState(
    [controlCode, pfdRequestedState, mfdRequestedState]: readonly [
      number,
      UiKnobRequestedLabelState,
      UiKnobRequestedLabelState
    ]
  ): void {
    this.setKnobLabelState(UiService.knobControlCodeToSide('pfd', controlCode), pfdRequestedState);
    this.setKnobLabelState(UiService.knobControlCodeToSide('mfd', controlCode), mfdRequestedState);
  }

  /**
   * Sets the bezel rotary knob label state based on a requested state and its corresponding knob control side flags.
   * @param controlSide The knob control side flags that determine which knob(s) are controlled by the requested knob
   * label state.
   * @param requestedState The requested knob label state to apply.
   */
  private setKnobLabelState(controlSide: number, requestedState: UiKnobRequestedLabelState): void {
    if (this.gduFormat === '460') {
      if (BitFlags.isAll(controlSide, UiKnobControlSide.Left)) {
        this._knobLabelState[UiKnobId.LeftOuter].set(requestedState.get(UiKnobId.LeftOuter) ?? '');
        this._knobLabelState[UiKnobId.LeftInner].set(requestedState.get(UiKnobId.LeftInner) ?? '');
        this._knobLabelState[UiKnobId.LeftInnerPush].set(requestedState.get(UiKnobId.LeftInnerPush) ?? '');
      }
      if (BitFlags.isAll(controlSide, UiKnobControlSide.Right)) {
        this._knobLabelState[UiKnobId.RightOuter].set(requestedState.get(UiKnobId.RightOuter) ?? '');
        this._knobLabelState[UiKnobId.RightInner].set(requestedState.get(UiKnobId.RightInner) ?? '');
        this._knobLabelState[UiKnobId.RightInnerPush].set(requestedState.get(UiKnobId.RightInnerPush) ?? '');
      }
    } else {
      if (BitFlags.isAny(controlSide, UiKnobControlSide.Both)) {
        this._knobLabelState[UiKnobId.SingleOuter].set(requestedState.get(UiKnobId.SingleOuter) ?? '');
        this._knobLabelState[UiKnobId.SingleInner].set(requestedState.get(UiKnobId.SingleInner) ?? '');
        this._knobLabelState[UiKnobId.SingleInnerPush].set(requestedState.get(UiKnobId.SingleInnerPush) ?? '');
      }
    }
  }

  /**
   * Responds to when an H event is triggered.
   * @param hEvent The triggered H event.
   */
  private onHEvent(hEvent: string): void {
    const interactionEvent = this.interactionMapper.mapEvent(hEvent);
    if (interactionEvent !== undefined) {
      this.onUiInteractionEvent(interactionEvent);
    }
  }

  /**
   * Responds to when a UI interaction event is triggered.
   * @param event The triggered interaction event.
   */
  private onUiInteractionEvent(event: UiInteractionEvent): void {
    if (
      this.isMfdPaneVisible.get()
      && this.routeInteractionEventToPane(this.mfdViewStack, event, this._mfdPaneKnobControlSide.get())
    ) {
      return;
    }

    if (
      this.isPfdPaneVisible.get()
      && this.routeInteractionEventToPane(this.pfdViewStack, event, this._pfdPaneKnobControlSide.get())
    ) {
      return;
    }

    const isInStartupPhase = this._isInStartupPhase.get();

    switch (event) {
      case UiInteractionEvent.DirectToPress:
        this.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.DirectTo, true);
        break;
      case UiInteractionEvent.NrstPress:
        if (!isInStartupPhase) {
          if (this.isMfdPaneVisible.get()) {
            if (this.mfdViewStack.openPage.get().key === UiViewKeys.MfdNrst) {
              this.closeAllMfdPopups();
              this.goBackMfd();
            } else {
              this.changeMfdPage(UiViewKeys.MfdNrst);
            }
          } else {
            this.toggleSplitPaneMode(true, UiViewKeys.MfdNrst);
          }
        }
        break;
      case UiInteractionEvent.BackPress:
        if (!isInStartupPhase) {
          if (this.displaySettingManager.getSetting('displayToggleSplitWithBack').value && (
            !this.isMfdPaneVisible.get()
            || (this._operatingType.get() === 'MFD' && this.mfdViewStack.activeView.get().key === UiViewKeys.MfdMain)
          )) {
            this.toggleSplitPaneMode();
          } else {
            this.goBackMfd();
          }
        }
        break;
    }
  }

  /**
   * Routes a UI interaction event to a pane.
   * @param handler The interaction handler for the pane to which to route the event.
   * @param event The event to route.
   * @param knobControlSide The bezel rotary knob control side flags for the pane to which to route the event.
   * @returns Whether the event was handled.
   */
  private routeInteractionEventToPane(handler: UiInteractionHandler, event: UiInteractionEvent, knobControlSide: UiKnobControlSide): boolean {
    switch (event) {
      case UiInteractionEvent.SingleKnobOuterInc:
      case UiInteractionEvent.SingleKnobOuterDec:
      case UiInteractionEvent.SingleKnobInnerInc:
      case UiInteractionEvent.SingleKnobInnerDec:
      case UiInteractionEvent.SingleKnobPress:
      case UiInteractionEvent.SingleKnobPressLong:
        if (!BitFlags.isAny(knobControlSide, UiKnobControlSide.Both)) {
          return false;
        }
        break;
      case UiInteractionEvent.LeftKnobOuterInc:
      case UiInteractionEvent.LeftKnobOuterDec:
      case UiInteractionEvent.LeftKnobInnerInc:
      case UiInteractionEvent.LeftKnobInnerDec:
      case UiInteractionEvent.LeftKnobPress:
      case UiInteractionEvent.LeftKnobPressLong:
        if (!BitFlags.isAll(knobControlSide, UiKnobControlSide.Left)) {
          return false;
        }
        break;
      case UiInteractionEvent.RightKnobOuterInc:
      case UiInteractionEvent.RightKnobOuterDec:
      case UiInteractionEvent.RightKnobInnerInc:
      case UiInteractionEvent.RightKnobInnerDec:
      case UiInteractionEvent.RightKnobPress:
      case UiInteractionEvent.RightKnobPressLong:
        if (!BitFlags.isAll(knobControlSide, UiKnobControlSide.Right)) {
          return false;
        }
        break;
    }

    return handler.onUiInteractionEvent(event);
  }

  /**
   * Converts a global knob control code to knob control side flags for a pane.
   * @param pane The pane for which to get knob control side flags.
   * @param code The global knob control code to convert.
   * @returns The knob control side flags for the specified pane corresponding to the specified global knob control code.
   */
  private static knobControlCodeToSide(pane: 'pfd' | 'mfd', code: number): number {
    return (code >> (pane === 'pfd' ? 0 : 2)) & 3;
  }

  /**
   * Converts a pair of pane knob control side flags to a global knob control code.
   * @param pfd The knob control side flags for the PFD pane.
   * @param mfd The knob control side flags for the MFD pane.
   * @returns The global knob control code corresponding to the specified knob control side flags.
   */
  private static knobControlSidesToCode(pfd: number, mfd: number): number {
    return pfd + (mfd << 2);
  }
}
import { EventBus, MappedSubject, Subject, UserSetting } from '@microsoft/msfs-sdk';

import {
  ControllableDisplayPaneIndex, DisplayPaneControlEvents, DisplayPaneControlGtcIndex, DisplayPaneController,
  DisplayPaneEvents, DisplayPaneIndex, DisplayPaneUtils, DisplayPaneViewKeys, DisplayPanesUserSettings, PfdIndex
} from '@microsoft/msfs-wtg3000-common';

import { DisplayPanePowerOnOptions } from './DisplayPanePowerOnOptions';

/**
 * The keys of the display pane views to select and designate at initial system power-on for a controllable display
 * pane.
 */
type PowerOnPaneViewKeys = {
  /**
   * The key of the display pane view to select and designate at initial system power-on, or a function that returns
   * the key.
   */
  displayKey: string | (() => string);

  /**
   * The key of the display pane view to set as the designated weather pane view at initial system power-on, or a
   * function that returns the key. If the value is `null` instead of a key, then the existing designated weather pane
   * view should be retained at system power-on.
   */
  designatedWeatherKey: string | null | (() => string | null);
};

/**
 * Keeps track of which display pane is being controlled by which GTC.
 */
export class DisplayPanesController {
  private readonly displayPanePublisher = this.bus.getPublisher<DisplayPaneEvents>();

  private readonly enabledControllablePanes = DisplayPaneUtils.getEnabledControllablePanes(this.pfdCount);

  private readonly powerOnViewKeys: Record<ControllableDisplayPaneIndex, PowerOnPaneViewKeys> = {
    [DisplayPaneIndex.LeftPfd]: { displayKey: DisplayPaneViewKeys.NavigationMap, designatedWeatherKey: null },
    [DisplayPaneIndex.LeftMfd]: { displayKey: DisplayPaneViewKeys.NavigationMap, designatedWeatherKey: null },
    [DisplayPaneIndex.RightMfd]: { displayKey: DisplayPaneViewKeys.TrafficMap, designatedWeatherKey: null },
    [DisplayPaneIndex.RightPfd]: { displayKey: DisplayPaneViewKeys.NavigationMap, designatedWeatherKey: null }
  };

  private readonly gtc1SelectedPane = Subject.create<-1 | ControllableDisplayPaneIndex>(-1);
  private readonly gtc2SelectedPane = Subject.create<-1 | ControllableDisplayPaneIndex>(-1);
  private readonly gtcSelectedPanes = {
    [DisplayPaneControlGtcIndex.LeftGtc]: this.gtc1SelectedPane,
    [DisplayPaneControlGtcIndex.RightGtc]: this.gtc2SelectedPane,
  };

  private readonly gtcSelectedPaneState = MappedSubject.create(
    this.gtc1SelectedPane,
    this.gtc2SelectedPane
  );

  private readonly displayPaneSettingManager = DisplayPanesUserSettings.getMasterManager(this.bus);

  private readonly displayPaneVisibleSettings: Record<DisplayPaneIndex, UserSetting<boolean>> = {
    [DisplayPaneIndex.LeftPfdInstrument]: this.displayPaneSettingManager.getSetting(`displayPaneVisible_${DisplayPaneIndex.LeftPfdInstrument}`),
    [DisplayPaneIndex.LeftPfd]: this.displayPaneSettingManager.getSetting(`displayPaneVisible_${DisplayPaneIndex.LeftPfd}`),
    [DisplayPaneIndex.LeftMfd]: this.displayPaneSettingManager.getSetting(`displayPaneVisible_${DisplayPaneIndex.LeftMfd}`),
    [DisplayPaneIndex.RightMfd]: this.displayPaneSettingManager.getSetting(`displayPaneVisible_${DisplayPaneIndex.RightMfd}`),
    [DisplayPaneIndex.RightPfd]: this.displayPaneSettingManager.getSetting(`displayPaneVisible_${DisplayPaneIndex.RightPfd}`),
    [DisplayPaneIndex.RightPfdInstrument]: this.displayPaneSettingManager.getSetting(`displayPaneVisible_${DisplayPaneIndex.RightPfdInstrument}`),
  };

  private readonly displayPaneControllerSettings: Record<DisplayPaneIndex, UserSetting<DisplayPaneController>> = {
    [DisplayPaneIndex.LeftPfdInstrument]: this.displayPaneSettingManager.getSetting(`displayPaneController_${DisplayPaneIndex.LeftPfdInstrument}`),
    [DisplayPaneIndex.LeftPfd]: this.displayPaneSettingManager.getSetting(`displayPaneController_${DisplayPaneIndex.LeftPfd}`),
    [DisplayPaneIndex.LeftMfd]: this.displayPaneSettingManager.getSetting(`displayPaneController_${DisplayPaneIndex.LeftMfd}`),
    [DisplayPaneIndex.RightMfd]: this.displayPaneSettingManager.getSetting(`displayPaneController_${DisplayPaneIndex.RightMfd}`),
    [DisplayPaneIndex.RightPfd]: this.displayPaneSettingManager.getSetting(`displayPaneController_${DisplayPaneIndex.RightPfd}`),
    [DisplayPaneIndex.RightPfdInstrument]: this.displayPaneSettingManager.getSetting(`displayPaneController_${DisplayPaneIndex.RightPfdInstrument}`),
  };

  private readonly displayPaneHalfSizeOnlySettings: Record<DisplayPaneIndex.LeftMfd | DisplayPaneIndex.RightMfd, UserSetting<boolean>> = {
    [DisplayPaneIndex.LeftMfd]: this.displayPaneSettingManager.getSetting(`displayPaneHalfSizeOnly_${DisplayPaneIndex.LeftMfd}`),
    [DisplayPaneIndex.RightMfd]: this.displayPaneSettingManager.getSetting(`displayPaneHalfSizeOnly_${DisplayPaneIndex.RightMfd}`)
  };

  private mfdState = 'split' as 'split' | 'left' | 'right';

  /**
   * Creates a new DisplayPanesController.
   * @param bus The event bus.
   * @param pfdCount The number of supported PFD GDUs.
   */
  public constructor(private readonly bus: EventBus, private readonly pfdCount: 1 | 2) {

    this.gtc1SelectedPane.sub(v => {
      this.displayPanePublisher.pub('left_gtc_selected_display_pane', v, true, true);
    }, true);

    this.gtc2SelectedPane.sub(v => {
      this.displayPanePublisher.pub('right_gtc_selected_display_pane', v, true, true);
    }, true);

    this.gtcSelectedPaneState.sub(([gtc1SelectedPane, gtc2SelectedPane]) => {
      // update pane controller settings
      for (const paneIndex of DisplayPaneUtils.ALL_INDEXES) {
        const controllerSetting = this.displayPaneControllerSettings[paneIndex];
        controllerSetting.value = gtc1SelectedPane === paneIndex
          ? DisplayPaneControlGtcIndex.LeftGtc
          : gtc2SelectedPane === paneIndex
            ? DisplayPaneControlGtcIndex.RightGtc
            : -1 as DisplayPaneControlGtcIndex; // Explicitly cast -1 to DisplayPaneControlGtcIndex
      }
    }, true);

    // If a half-size only display pane is displayed on an MFD pane, ensure that the MFD is in half pane mode.
    this.displayPaneHalfSizeOnlySettings[DisplayPaneIndex.LeftMfd].sub(isHalfSizeOnly => {
      if (isHalfSizeOnly && !this.displayPaneVisibleSettings[DisplayPaneIndex.RightMfd].value) {
        this.splitMfd();
      }
    });
    this.displayPaneHalfSizeOnlySettings[DisplayPaneIndex.RightMfd].sub(isHalfSizeOnly => {
      if (isHalfSizeOnly && !this.displayPaneVisibleSettings[DisplayPaneIndex.LeftMfd].value) {
        this.splitMfd();
      }
    });

    const displayPaneControlEvents = this.bus.getSubscriber<DisplayPaneControlEvents>();

    displayPaneControlEvents.on('gtc_1_display_pane_select').handle(this.onSelectDisplayPane.bind(this, DisplayPaneControlGtcIndex.LeftGtc));
    displayPaneControlEvents.on('gtc_2_display_pane_select').handle(this.onSelectDisplayPane.bind(this, DisplayPaneControlGtcIndex.RightGtc));
    displayPaneControlEvents.on('change_display_pane_select_left').handle(this.onChangeSelectedDisplayPane.bind(this, -1));
    displayPaneControlEvents.on('change_display_pane_select_right').handle(this.onChangeSelectedDisplayPane.bind(this, 1));
    displayPaneControlEvents.on('toggle_pfd_split').handle(this.onTogglePfdSplit.bind(this));
    displayPaneControlEvents.on('toggle_mfd_split').handle(this.onToggleMfdSplit.bind(this));
  }

  /**
   * Initializes this controller.
   * @param powerOnOptions Options with which to configure display pane logic on initial system power-on.
   */
  public init(powerOnOptions: Readonly<DisplayPanePowerOnOptions> | undefined): void {
    if (powerOnOptions?.powerOnViewKeys) {
      for (const paneIndex of DisplayPaneUtils.CONTROLLABLE_INDEXES) {
        const keys = powerOnOptions.powerOnViewKeys[paneIndex];
        if (!keys) {
          continue;
        }

        if (keys.displayKey !== undefined) {
          this.powerOnViewKeys[paneIndex].displayKey = keys.displayKey;
        }

        if (keys.designatedWeatherKey !== undefined) {
          this.powerOnViewKeys[paneIndex].designatedWeatherKey = keys.designatedWeatherKey;
        }
      }
    }
  }

  /**
   * Resets this controller's display panes to their default configuration:
   * * MFD in Half Mode.
   * * Navigation Map displayed on both PFD panes and the Left MFD pane.
   * * Traffic Map displayed on the Right MFD pane.
   *
   * This operation leaves PFD Full/Split mode unchanged for both PFDs.
   */
  public reset(): void {
    this.splitMfd();

    for (const paneIndex of this.enabledControllablePanes) {
      const keys = this.powerOnViewKeys[paneIndex];

      const designedWeatherKey = typeof keys.designatedWeatherKey === 'function' ? keys.designatedWeatherKey() : keys.designatedWeatherKey;
      if (designedWeatherKey !== null) {
        this.displayPaneSettingManager.getSetting(`displayPaneDesignatedWeatherView_${paneIndex}`).value = designedWeatherKey;
      }

      const displayKey = typeof keys.displayKey === 'function' ? keys.displayKey() : keys.displayKey;
      this.displayPaneSettingManager.getSetting(`displayPaneDesignatedView_${paneIndex}`).value = displayKey;
      this.displayPaneSettingManager.getSetting(`displayPaneView_${paneIndex}`).value = displayKey;
    }
  }

  /**
   * Gets an array of indexes of controllable display panes that are available for selection by a
   * display pane-controlling GTC.
   * @param controlGtcIndex The display pane control index of the GTC for which to get available display panes.
   * @returns An array of indexes of controllable display panes that are available to be selected for the specified GTC
   * in ascending order.
   */
  private getAvailablePanes(controlGtcIndex: DisplayPaneControlGtcIndex): readonly ControllableDisplayPaneIndex[] {
    return DisplayPaneUtils.getAvailableControllablePanes(
      this.enabledControllablePanes,
      this.gtcSelectedPanes[
        controlGtcIndex === DisplayPaneControlGtcIndex.LeftGtc
          ? DisplayPaneControlGtcIndex.RightGtc
          : DisplayPaneControlGtcIndex.LeftGtc
      ].get(),
      this.displayPaneSettingManager
    );
  }

  /** Split MFD */
  private splitMfd(): void {
    this.mfdState = 'split';
    this.displayPaneSettingManager.getSetting('displayPaneVisible_2').set(true);
    this.displayPaneSettingManager.getSetting('displayPaneVisible_3').set(true);
  }

  /** Hide right MFD pane */
  private fullMfdLeft(): void {
    this.mfdState = 'left';
    if (this.gtc1SelectedPane.get() === DisplayPaneIndex.RightMfd) {
      this.gtc1SelectedPane.set(-1);
    }
    if (this.gtc2SelectedPane.get() === DisplayPaneIndex.RightMfd) {
      this.gtc2SelectedPane.set(-1);
    }
    this.displayPaneSettingManager.getSetting('displayPaneVisible_2').set(true);
    this.displayPaneSettingManager.getSetting('displayPaneVisible_3').set(false);
  }

  /** Hide left MFD pane */
  private fullMfdRight(): void {
    this.mfdState = 'right';
    if (this.gtc1SelectedPane.get() === DisplayPaneIndex.LeftMfd) {
      this.gtc1SelectedPane.set(-1);
    }
    if (this.gtc2SelectedPane.get() === DisplayPaneIndex.LeftMfd) {
      this.gtc2SelectedPane.set(-1);
    }
    this.displayPaneSettingManager.getSetting('displayPaneVisible_3').set(true);
    this.displayPaneSettingManager.getSetting('displayPaneVisible_2').set(false);
  }

  /**
   * Responds to when a select display pane command is received.
   * @param controlGtcIndex The display pane control index of the GTC that issued the command.
   * @param paneIndex The index of the display pane to select.
   */
  private onSelectDisplayPane(controlGtcIndex: DisplayPaneControlGtcIndex, paneIndex: -1 | ControllableDisplayPaneIndex): void {
    const selectedPaneIndex = this.gtcSelectedPanes[controlGtcIndex];
    const currentSelectedIndex = selectedPaneIndex.get();

    let needNotify = true;
    if (paneIndex !== currentSelectedIndex) {
      const paneToSelectIndex = DisplayPaneUtils.getControllablePaneToSelect(
        controlGtcIndex,
        paneIndex,
        this.getAvailablePanes(controlGtcIndex)
      );

      if (paneToSelectIndex !== currentSelectedIndex) {
        needNotify = false;
        selectedPaneIndex.set(paneToSelectIndex);
      }
    }

    // We notify in case the selected pane hasn't changed, because GtcService needs to get corrected
    if (needNotify) {
      selectedPaneIndex.notify();
    }
  }

  /**
   * Responds to when a change selected display pane command is received.
   * @param direction The direction of the change.
   * @param controlGtcIndex The display pane control index of the GTC that issued the command.
   */
  private onChangeSelectedDisplayPane(direction: 1 | -1, controlGtcIndex: DisplayPaneControlGtcIndex): void {
    const selectedPaneIndex = this.gtcSelectedPanes[controlGtcIndex];
    const currentIndex = selectedPaneIndex.get();
    const indexOffset = currentIndex === -1
      ? direction === 1 ? -1 : 5
      : -currentIndex;
    const availablePanes = this.getAvailablePanes(controlGtcIndex);

    const startIndex = direction === 1 ? 0 : availablePanes.length - 1;

    let newPaneIndex: ControllableDisplayPaneIndex | -1 = -1;
    for (let i = 0; i < availablePanes.length; i++) {
      const paneIndex = availablePanes[startIndex + i * direction];
      if ((paneIndex + indexOffset) * direction > 0) {
        newPaneIndex = paneIndex;
        break;
      }
    }

    if (newPaneIndex > 0) {
      selectedPaneIndex.set(newPaneIndex);
    }
  }

  /**
   * Responds to when a toggle PFD split mode command is received.
   * @param pfdIndex The index of the PFD for which the command was issued.
   */
  private onTogglePfdSplit(pfdIndex: PfdIndex): void {
    if (pfdIndex > this.pfdCount) {
      return;
    }

    const paneIndex = pfdIndex === 1 ? DisplayPaneIndex.LeftPfd : DisplayPaneIndex.RightPfd;
    const isVisibleSetting = this.displayPaneVisibleSettings[paneIndex];

    const newPfdPaneVisiblity = !isVisibleSetting.get();

    let reselectLeft = false;
    let reselectRight = false;

    if (!newPfdPaneVisiblity) {
      if (this.gtc1SelectedPane.get() === paneIndex) {
        this.gtc1SelectedPane.set(-1);
        reselectLeft = true;
      }
      if (this.gtc2SelectedPane.get() === paneIndex) {
        this.gtc2SelectedPane.set(-1);
        reselectRight = true;
      }
    }

    isVisibleSetting.set(newPfdPaneVisiblity);

    // After pfd pane visiblity is changed, if it was hidden, attempt to select a new pane for the gtc
    if (reselectLeft) {
      this.gtc1SelectedPane.set(DisplayPaneUtils.getControllablePaneToSelect(
        DisplayPaneControlGtcIndex.LeftGtc,
        paneIndex,
        this.getAvailablePanes(DisplayPaneControlGtcIndex.LeftGtc)
      ));
    } else if (reselectRight) {
      this.gtc2SelectedPane.set(DisplayPaneUtils.getControllablePaneToSelect(
        DisplayPaneControlGtcIndex.RightGtc,
        paneIndex,
        this.getAvailablePanes(DisplayPaneControlGtcIndex.RightGtc)
      ));
    }
  }

  /**
   * Responds to when a toggle MFD split mode command is received.
   * @param controlGtcIndex The display pane control index of the GTC that issued the command.
   */
  private onToggleMfdSplit(controlGtcIndex: DisplayPaneControlGtcIndex): void {
    if (this.mfdState === 'left') {
      this.splitMfd();
    } else if (this.mfdState === 'right') {
      this.splitMfd();
    } else if (this.mfdState === 'split') {
      // Only switch to full mode if the selected pane supports it.
      if (
        this.gtcSelectedPanes[controlGtcIndex].get() === DisplayPaneIndex.LeftMfd
        && !this.displayPaneHalfSizeOnlySettings[DisplayPaneIndex.LeftMfd].value
      ) {
        this.fullMfdLeft();
      }
      if (
        this.gtcSelectedPanes[controlGtcIndex].get() === DisplayPaneIndex.RightMfd
        && !this.displayPaneHalfSizeOnlySettings[DisplayPaneIndex.RightMfd].value
      ) {
        this.fullMfdRight();
      }
    }
  }
}

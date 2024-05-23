import { EventBus, MappedSubject, Subject, UserSetting } from '@microsoft/msfs-sdk';

import { DisplayPaneController, DisplayPanesUserSettings } from '../../Settings/DisplayPanesUserSettings';
import { DisplayPaneControlEvents } from './DisplayPaneControlEvents';
import { DisplayPaneEvents } from './DisplayPaneEvents';
import { ControllableDisplayPaneIndex, DisplayPaneControlGtcIndex, DisplayPaneIndex } from './DisplayPaneTypes';
import { DisplayPaneViewKeys } from './DisplayPaneViewKeys';

/**
 * Keeps track of which display pane is being controlled by which GTC.
 */
export class DisplayPanesController {
  private static readonly DISPLAY_PANE_INDEXES = [
    DisplayPaneIndex.LeftPfdInstrument,
    DisplayPaneIndex.LeftPfd,
    DisplayPaneIndex.LeftMfd,
    DisplayPaneIndex.RightMfd,
    DisplayPaneIndex.RightPfd,
    DisplayPaneIndex.RightPfdInstrument
  ] as const;

  private static readonly CONTROLLABLE_DISPLAY_PANE_INDEXES = [
    DisplayPaneIndex.LeftPfd,
    DisplayPaneIndex.LeftMfd,
    DisplayPaneIndex.RightMfd,
    DisplayPaneIndex.RightPfd
  ] as const;

  private readonly gtc1SelectedPane = Subject.create<-1 | ControllableDisplayPaneIndex>(-1);
  private readonly gtc2SelectedPane = Subject.create<-1 | ControllableDisplayPaneIndex>(-1);
  private readonly paneSelections = {
    [DisplayPaneControlGtcIndex.LeftGtc]: this.gtc1SelectedPane,
    [DisplayPaneControlGtcIndex.RightGtc]: this.gtc2SelectedPane,
  };

  private readonly gtcSelectedPaneState = MappedSubject.create(
    this.gtc1SelectedPane,
    this.gtc2SelectedPane
  );

  private readonly displayPanePublisher = this.bus.getPublisher<DisplayPaneEvents>();

  private readonly displayPanesSettings = DisplayPanesUserSettings.getMasterManager(this.bus);

  private readonly displayPaneVisibleSettings: Record<DisplayPaneIndex, UserSetting<boolean>> = {
    [DisplayPaneIndex.LeftPfdInstrument]: this.displayPanesSettings.getSetting(`displayPaneVisible_${DisplayPaneIndex.LeftPfdInstrument}`),
    [DisplayPaneIndex.LeftPfd]: this.displayPanesSettings.getSetting(`displayPaneVisible_${DisplayPaneIndex.LeftPfd}`),
    [DisplayPaneIndex.LeftMfd]: this.displayPanesSettings.getSetting(`displayPaneVisible_${DisplayPaneIndex.LeftMfd}`),
    [DisplayPaneIndex.RightMfd]: this.displayPanesSettings.getSetting(`displayPaneVisible_${DisplayPaneIndex.RightMfd}`),
    [DisplayPaneIndex.RightPfd]: this.displayPanesSettings.getSetting(`displayPaneVisible_${DisplayPaneIndex.RightPfd}`),
    [DisplayPaneIndex.RightPfdInstrument]: this.displayPanesSettings.getSetting(`displayPaneVisible_${DisplayPaneIndex.RightPfdInstrument}`),
  };

  private readonly displayPaneControllerSettings: Record<DisplayPaneIndex, UserSetting<DisplayPaneController>> = {
    [DisplayPaneIndex.LeftPfdInstrument]: this.displayPanesSettings.getSetting(`displayPaneController_${DisplayPaneIndex.LeftPfdInstrument}`),
    [DisplayPaneIndex.LeftPfd]: this.displayPanesSettings.getSetting(`displayPaneController_${DisplayPaneIndex.LeftPfd}`),
    [DisplayPaneIndex.LeftMfd]: this.displayPanesSettings.getSetting(`displayPaneController_${DisplayPaneIndex.LeftMfd}`),
    [DisplayPaneIndex.RightMfd]: this.displayPanesSettings.getSetting(`displayPaneController_${DisplayPaneIndex.RightMfd}`),
    [DisplayPaneIndex.RightPfd]: this.displayPanesSettings.getSetting(`displayPaneController_${DisplayPaneIndex.RightPfd}`),
    [DisplayPaneIndex.RightPfdInstrument]: this.displayPanesSettings.getSetting(`displayPaneController_${DisplayPaneIndex.RightPfdInstrument}`),
  };

  private readonly displayPaneHalfSizeOnlySettings: Record<DisplayPaneIndex.LeftMfd | DisplayPaneIndex.RightMfd, UserSetting<boolean>> = {
    [DisplayPaneIndex.LeftMfd]: this.displayPanesSettings.getSetting(`displayPaneHalfSizeOnly_${DisplayPaneIndex.LeftMfd}`),
    [DisplayPaneIndex.RightMfd]: this.displayPanesSettings.getSetting(`displayPaneHalfSizeOnly_${DisplayPaneIndex.RightMfd}`)
  };

  private mfdState = 'split' as 'split' | 'left' | 'right';

  /**
   * Creates a new DisplayPanesController.
   * @param bus The event bus.
   */
  public constructor(private readonly bus: EventBus) {

    this.gtc1SelectedPane.sub(v => {
      this.displayPanePublisher.pub('left_gtc_selected_display_pane', v, true);
    }, true);

    this.gtc2SelectedPane.sub(v => {
      this.displayPanePublisher.pub('right_gtc_selected_display_pane', v, true);
    }, true);

    this.gtcSelectedPaneState.sub(([gtc1SelectedPane, gtc2SelectedPane]) => {
      // update pane controller settings
      for (const paneIndex of DisplayPanesController.DISPLAY_PANE_INDEXES) {
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

    displayPaneControlEvents.on('gtc_1_display_pane_select').handle(paneIndex => {
      if (paneIndex !== this.gtc1SelectedPane.get()) {
        this.gtc1SelectedPane.set(
          DisplayPanesController.getBestAvailablePane(
            DisplayPaneControlGtcIndex.LeftGtc, paneIndex, this._getAvailablePanes()));
      }
      // We notify in case the selected pane hasn't changed, because GtcService needs to get corrected
      this.gtc1SelectedPane.notify();
    });

    displayPaneControlEvents.on('gtc_2_display_pane_select').handle(paneIndex => {
      if (paneIndex !== this.gtc2SelectedPane.get()) {
        this.gtc2SelectedPane.set(
          DisplayPanesController.getBestAvailablePane(
            DisplayPaneControlGtcIndex.RightGtc, paneIndex, this._getAvailablePanes()));
      }
      // We notify in case the selected pane hasn't changed, because GtcService needs to get corrected
      this.gtc2SelectedPane.notify();
    });

    displayPaneControlEvents.on('change_display_pane_select_left').handle(gtcIndex => {
      const gtc = this.paneSelections[gtcIndex];
      const gtcPaneSelection = gtc.get() === -1 ? 5 : gtc.get();
      const availablePanes = this._getAvailablePanes();
      let newPaneIndex = 0;

      for (let i = 0; i < availablePanes.length; i++) {
        const paneIndex = availablePanes[i];
        if (paneIndex < gtcPaneSelection) {
          newPaneIndex = paneIndex;
        }
      }
      if (newPaneIndex > 0) {
        gtc.set(newPaneIndex);
      }
    });

    displayPaneControlEvents.on('change_display_pane_select_right').handle(gtcIndex => {
      const gtc = this.paneSelections[gtcIndex];
      const gtcPaneSelection = gtc.get() === -1 ? 0 : gtc.get();
      const availablePanes = this._getAvailablePanes();

      for (let i = 0; i < availablePanes.length; i++) {
        if (availablePanes[i] > gtcPaneSelection) {
          gtc.set(availablePanes[i]);
          break;
        }
      }
    });

    displayPaneControlEvents.on('toggle_pfd_split').handle(pfdIndex => {
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
        this.gtc1SelectedPane.set(
          DisplayPanesController.getBestAvailablePane(
            DisplayPaneControlGtcIndex.LeftGtc, paneIndex, this._getAvailablePanes()));
      } else if (reselectRight) {
        this.gtc2SelectedPane.set(
          DisplayPanesController.getBestAvailablePane(
            DisplayPaneControlGtcIndex.RightGtc, paneIndex, this._getAvailablePanes()));
      }
    });

    displayPaneControlEvents.on('toggle_mfd_split').handle(gtcIndex => {
      if (this.mfdState === 'left') {
        this.splitMfd();
      } else if (this.mfdState === 'right') {
        this.splitMfd();
      } else if (this.mfdState === 'split') {
        // Only switch to full mode if the selected pane supports it.
        if (
          this.paneSelections[gtcIndex].get() === DisplayPaneIndex.LeftMfd
          && !this.displayPaneHalfSizeOnlySettings[DisplayPaneIndex.LeftMfd].value
        ) {
          this.fullMfdLeft();
        }
        if (
          this.paneSelections[gtcIndex].get() === DisplayPaneIndex.RightMfd
          && !this.displayPaneHalfSizeOnlySettings[DisplayPaneIndex.RightMfd].value
        ) {
          this.fullMfdRight();
        }
      }
    });
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

    this.displayPanesSettings.getSetting(`displayPaneDesignatedView_${DisplayPaneIndex.LeftPfd}`).value = DisplayPaneViewKeys.NavigationMap;
    this.displayPanesSettings.getSetting(`displayPaneView_${DisplayPaneIndex.LeftPfd}`).value = DisplayPaneViewKeys.NavigationMap;

    this.displayPanesSettings.getSetting(`displayPaneDesignatedView_${DisplayPaneIndex.LeftMfd}`).value = DisplayPaneViewKeys.NavigationMap;
    this.displayPanesSettings.getSetting(`displayPaneView_${DisplayPaneIndex.LeftMfd}`).value = DisplayPaneViewKeys.NavigationMap;

    this.displayPanesSettings.getSetting(`displayPaneDesignatedView_${DisplayPaneIndex.RightMfd}`).value = DisplayPaneViewKeys.TrafficMap;
    this.displayPanesSettings.getSetting(`displayPaneView_${DisplayPaneIndex.RightMfd}`).value = DisplayPaneViewKeys.TrafficMap;

    this.displayPanesSettings.getSetting(`displayPaneDesignatedView_${DisplayPaneIndex.RightPfd}`).value = DisplayPaneViewKeys.NavigationMap;
    this.displayPanesSettings.getSetting(`displayPaneView_${DisplayPaneIndex.RightPfd}`).value = DisplayPaneViewKeys.NavigationMap;
  }

  /**
   * Returns an array of controllable display pane indices that are selectable.
   * @returns An array of controllable display pane indices that are selectable.
   */
  private _getAvailablePanes(): readonly ControllableDisplayPaneIndex[] {
    return DisplayPanesController.getAvailablePanes(
      this.gtc1SelectedPane.get(), this.gtc2SelectedPane.get(), this.displayPaneVisibleSettings);
  }

  /** Split MFD */
  private splitMfd(): void {
    this.mfdState = 'split';
    this.displayPanesSettings.getSetting('displayPaneVisible_2').set(true);
    this.displayPanesSettings.getSetting('displayPaneVisible_3').set(true);
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
    this.displayPanesSettings.getSetting('displayPaneVisible_2').set(true);
    this.displayPanesSettings.getSetting('displayPaneVisible_3').set(false);
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
    this.displayPanesSettings.getSetting('displayPaneVisible_3').set(true);
    this.displayPanesSettings.getSetting('displayPaneVisible_2').set(false);
  }

  /**
   * Returns an array of controllable display pane indices that are selectable.
   * @param gtc1SelectedPane The index of the selected pane for the left GTC.
   * @param gtc2SelectedPane The index of the selected pane for the right GTC.
   * @param displayPaneVisibleSettings A record of the visibility settings for each controllable display pane.
   * @returns An array of controllable display pane indices that are selectable.
   */
  public static getAvailablePanes(
    gtc1SelectedPane: ControllableDisplayPaneIndex | -1,
    gtc2SelectedPane: ControllableDisplayPaneIndex | -1,
    displayPaneVisibleSettings: Record<ControllableDisplayPaneIndex, UserSetting<boolean>>,
  ): readonly ControllableDisplayPaneIndex[] {
    return DisplayPanesController.CONTROLLABLE_DISPLAY_PANE_INDEXES.filter(index => {
      return gtc1SelectedPane !== index
        && gtc2SelectedPane !== index
        && displayPaneVisibleSettings[index].value;
    });
  }

  /**
   * Determines which pane should be selected from the available panes.
   * @param side Which GTC side is this for.
   * @param desiredPane The preferred pane to select, if available.
   * @param availablePanes The available panes.
   * @returns The pane to be selected.
   */
  public static getBestAvailablePane(
    side: DisplayPaneControlGtcIndex,
    desiredPane: ControllableDisplayPaneIndex | -1,
    availablePanes: readonly ControllableDisplayPaneIndex[],
  ): ControllableDisplayPaneIndex | -1 {
    if (desiredPane === -1) {
      return -1;
    } else {
      if (availablePanes.includes(desiredPane)) {
        // If pane is available, use that
        return desiredPane;
      } else if (availablePanes.length > 0) {
        if (side === DisplayPaneControlGtcIndex.LeftGtc) {
          return availablePanes[0];
        } else {
          return availablePanes[availablePanes.length - 1];
        }
      } else {
        return -1;
      }
    }
  }
}

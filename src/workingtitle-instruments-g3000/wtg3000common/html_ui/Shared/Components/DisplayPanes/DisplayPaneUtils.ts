import { UserSettingManager } from '@microsoft/msfs-sdk';

import { type DisplayPaneAllUserSettingTypes } from '../../Settings/DisplayPanesUserSettings';
import { ControllableDisplayPaneIndex, DisplayPaneControlGtcIndex, DisplayPaneIndex } from './DisplayPaneTypes';

/** Collection of functions for working with Display Panes. */
export class DisplayPaneUtils {
  /** An array of indexes of all display panes. */
  public static readonly ALL_INDEXES = [
    DisplayPaneIndex.LeftPfdInstrument,
    DisplayPaneIndex.LeftPfd,
    DisplayPaneIndex.LeftMfd,
    DisplayPaneIndex.RightMfd,
    DisplayPaneIndex.RightPfd,
    DisplayPaneIndex.RightPfdInstrument
  ] as const;

  /** An array of indexes of display panes that are controllable by GTCs. */
  public static readonly CONTROLLABLE_INDEXES = [
    DisplayPaneIndex.LeftPfd,
    DisplayPaneIndex.LeftMfd,
    DisplayPaneIndex.RightMfd,
    DisplayPaneIndex.RightPfd
  ] as const;

  /** An array of indexes of PFD instrument display panes. */
  public static readonly PFD_INSTRUMENT_INDEXES = [
    DisplayPaneIndex.LeftPfdInstrument,
    DisplayPaneIndex.RightPfdInstrument
  ] as const;

  /** An array of indexes of PFD display panes. */
  public static readonly PFD_INDEXES = [
    DisplayPaneIndex.LeftPfd,
    DisplayPaneIndex.RightPfd
  ] as const;

  /** An array of indexes of MFD display panes. */
  public static readonly MFD_INDEXES = [
    DisplayPaneIndex.LeftMfd,
    DisplayPaneIndex.RightMfd
  ] as const;

  /**
   * Checks whether a value is a controllable display pane index.
   * @param value The value to check.
   * @returns Whether the specified value is a controllable display pane index.
   */
  public static isControllableDisplayPaneIndex(value: unknown): value is ControllableDisplayPaneIndex {
    if (typeof (value) === 'number') {
      return DisplayPaneUtils.CONTROLLABLE_INDEXES.includes(value);
    } else {
      return false;
    }
  }

  /**
   * Checks whether a value is a PFD instrument display pane index.
   * @param value The value to check.
   * @returns Whether the specified value is a PFD instrument display pane index.
   */
  public static isPfdInstrumentDisplayPaneIndex(value: unknown): value is DisplayPaneIndex.LeftPfdInstrument | DisplayPaneIndex.RightPfdInstrument {
    if (typeof (value) === 'number') {
      return DisplayPaneUtils.PFD_INSTRUMENT_INDEXES.includes(value);
    } else {
      return false;
    }
  }

  /**
   * Checks whether a value is a PFD display pane index.
   * @param value The value to check.
   * @returns Whether the specified value is a PFD display pane index.
   */
  public static isPfdDisplayPaneIndex(value: unknown): value is DisplayPaneIndex.LeftPfd | DisplayPaneIndex.RightPfd {
    if (typeof (value) === 'number') {
      return DisplayPaneUtils.PFD_INDEXES.includes(value);
    } else {
      return false;
    }
  }

  /**
   * Checks whether a value is an MFD display pane index.
   * @param value The value to check.
   * @returns Whether the specified value is an MFD display pane index.
   */
  public static isMfdDisplayPaneIndex(value: unknown): value is DisplayPaneIndex.LeftMfd | DisplayPaneIndex.RightMfd {
    if (typeof (value) === 'number') {
      return DisplayPaneUtils.MFD_INDEXES.includes(value);
    } else {
      return false;
    }
  }

  /**
   * Gets an array of indexes of controllable display panes that are enabled for a given GDU configuration.
   * @param pfdCount The number of supported PFD GDUs.
   * @returns An array of indexes of controllable display panes that are enabled for the specified GDU configuration in
   * ascending order.
   */
  public static getEnabledControllablePanes(pfdCount: 1 | 2): ControllableDisplayPaneIndex[] {
    return pfdCount === 1
      ? DisplayPaneUtils.CONTROLLABLE_INDEXES.slice(0, 3)
      : DisplayPaneUtils.CONTROLLABLE_INDEXES.slice();
  }

  /**
   * Gets an array of indexes of controllable display panes that are available to be selected by a
   * display pane-controlling GTC.
   * @param enabledPaneIndexes An array containing the indexes of all enabled controllable display panes in ascending
   * order.
   * @param otherGtcSelectedPaneIndex The index of the display pane selected by the left display pane-controlling GTC, or `-1`
   * if the GTC has not selected a pane.
   * @param displayPaneSettingManager A manager for all display pane user settings.
   * @returns An array of indexes of controllable display panes that are available to be selected in ascending order.
   */
  public static getAvailableControllablePanes(
    enabledPaneIndexes: readonly ControllableDisplayPaneIndex[],
    otherGtcSelectedPaneIndex: ControllableDisplayPaneIndex | -1,
    displayPaneSettingManager: UserSettingManager<DisplayPaneAllUserSettingTypes>,
  ): readonly ControllableDisplayPaneIndex[] {
    return enabledPaneIndexes.filter(index => {
      return otherGtcSelectedPaneIndex !== index
        && displayPaneSettingManager.getSetting(`displayPaneVisible_${index}`).value;
    });
  }

  /**
   * Gets the controllable display pane that should be selected when a GTC attempts to select a desired pane.
   * @param controlGtcIndex The display pane control index of the GTC that is attempting to select a desired pane.
   * @param desiredPaneIndex The index of the desired pane to select, or `-1` if the GTC is attempting to clear its
   * selected pane.
   * @param availablePanes An array containing the indexes of all available controllable display panes, in ascending
   * order.
   * @returns The index of the display pane to be selected, or `-1` if no pane should be selected.
   */
  public static getControllablePaneToSelect(
    controlGtcIndex: DisplayPaneControlGtcIndex,
    desiredPaneIndex: ControllableDisplayPaneIndex | -1,
    availablePanes: readonly ControllableDisplayPaneIndex[],
  ): ControllableDisplayPaneIndex | -1 {
    if (desiredPaneIndex === -1) {
      // Always allow pane selection to be cleared.
      return -1;
    } else {
      if (availablePanes.includes(desiredPaneIndex)) {
        // If the desired pane is available, select it.
        return desiredPaneIndex;
      } else if (availablePanes.length > 0) {
        // If the desired pane is unavailable but at least one other pane is available, then select either the first
        // (left-most) or last (right-most) pane depending on which GTC is attempting to select a pane.
        if (controlGtcIndex === DisplayPaneControlGtcIndex.LeftGtc) {
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
import { ControllableDisplayPaneIndex, DisplayPaneIndex } from './DisplayPaneTypes';

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
}
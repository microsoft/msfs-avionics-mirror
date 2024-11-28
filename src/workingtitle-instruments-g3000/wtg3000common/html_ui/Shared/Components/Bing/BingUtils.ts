import { PfdIndex } from '../../CommonTypes';
import { DisplayPaneIndex } from '../DisplayPanes/DisplayPaneTypes';

/**
 * A utility class for working with Bing instances.
 */
export class BingUtils {
  /**
   * Gets the amount of the time, in milliseconds, to delay binding a Bing instance for a map containedin a display
   * pane.
   * @param paneIndex The index of the display pane.
   * @returns The amount of the time, in milliseconds, to delay binding a Bing instance for map contained in the
   * specified display pane.
   */
  public static getBindDelayForPane(paneIndex: DisplayPaneIndex): number {
    switch (paneIndex) {
      case DisplayPaneIndex.LeftMfd:
        return 0;
      case DisplayPaneIndex.RightMfd:
        return 2000;
      case DisplayPaneIndex.LeftPfdInstrument:
        return 4000;
      case DisplayPaneIndex.RightPfdInstrument:
        return 4000;
      case DisplayPaneIndex.LeftPfd:
        return 8000;
      case DisplayPaneIndex.RightPfd:
        return 8000;
    }
  }

  /**
   * Gets the amount of time, in milliseconds, to delay binding a Bing instance for a synthetic vision (SVT) display.
   * @param pfdIndex The index of the SVT display's parent PFD.
   * @returns The amount of time, in milliseconds, to delay binding a Bing instance for the specified synthetic vision
   * (SVT) display.
   */
  public static getBindDelayForSvt(pfdIndex: PfdIndex): number {
    return pfdIndex === 1 ? 6000 : 6000;
  }
}
import { SoftKeyMenu } from '@microsoft/msfs-garminsdk';
import { Subscribable } from '@microsoft/msfs-sdk';

/**
 * Utility class for creating softkey H event mapping functions.
 */
export class SoftKeyHEventMap {
  private static readonly SPLIT_MODE_SOFTKEY_COUNT = 7;

  /**
   * Creates a function which maps H events to softkey indexes for a PFD instrument. The function returns the index
   * of the softkey that was pressed for softkey press H events, and `undefined` for all other H events.
   * @param prefix The prefix of softkey press H events for the softkey bar's parent PFD instrument.
   * @param side The side on which the softkey bar is placed on the PFD in split mode.
   * @param isInSplitMode Whether the softkey bar's parent PFD is in split mode.
   * @returns A function which maps H events to softkey indexes for a PFD instrument.
   */
  public static create(
    prefix: string,
    side: 'left' | 'right',
    isInSplitMode: Subscribable<boolean>,
  ): (hEvent: string) => number | undefined {
    const fullPrefix = `${prefix}_SOFTKEYS_`;
    const splitModeMin = side === 'left' ? 0 : 5;

    return (hEvent: string): number | undefined => {
      if (hEvent.startsWith(fullPrefix)) {
        const rawIndex = Number(hEvent.substring(fullPrefix.length)) - 1;

        if (!isNaN(rawIndex)) {
          let min, max;

          if (isInSplitMode.get()) {
            min = splitModeMin;
            max = min + SoftKeyHEventMap.SPLIT_MODE_SOFTKEY_COUNT;
          } else {
            min = 0;
            max = SoftKeyMenu.SOFTKEY_COUNT;
          }

          if (rawIndex >= min && rawIndex < max) {
            return rawIndex - min;
          }
        }
      }

      return undefined;
    };
  }
}
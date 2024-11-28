import { Subscribable } from '@microsoft/msfs-sdk';

import { SoftKeyMenu } from '@microsoft/msfs-garminsdk';

import { GduSoftkeyInteractionEvent } from '../Input/GduSoftkeyInteractionEvent';

/**
 * A utility class for working with softkey menus.
 */
export class SoftKeyUtils {
  private static readonly SPLIT_MODE_SOFTKEY_COUNT = 7;

  private static readonly INTERACTION_EVENT_TO_INDEX_MAP: Partial<Record<string, number>> = {
    [GduSoftkeyInteractionEvent.SoftKey01]: 0,
    [GduSoftkeyInteractionEvent.SoftKey02]: 1,
    [GduSoftkeyInteractionEvent.SoftKey03]: 2,
    [GduSoftkeyInteractionEvent.SoftKey04]: 3,
    [GduSoftkeyInteractionEvent.SoftKey05]: 4,
    [GduSoftkeyInteractionEvent.SoftKey06]: 5,
    [GduSoftkeyInteractionEvent.SoftKey07]: 6,
    [GduSoftkeyInteractionEvent.SoftKey08]: 7,
    [GduSoftkeyInteractionEvent.SoftKey09]: 8,
    [GduSoftkeyInteractionEvent.SoftKey10]: 9,
    [GduSoftkeyInteractionEvent.SoftKey11]: 10,
    [GduSoftkeyInteractionEvent.SoftKey12]: 11,
  };

  /**
   * Creates a function that maps interaction events to softkey indexes for a PFD instrument. The function will return
   * the index of the softkey that was pressed for softkey press interaction events, and `undefined` for all other
   * events.
   * @param side The side on which the softkey menu is placed on the PFD in split mode.
   * @param isInSplitMode Whether the softkey menu's parent PFD is in split mode.
   * @returns A function that maps interaction events to softkey indexes for a PFD instrument. If the interaction event
   * cannot be mapped, then the function will return `undefined`.
   */
  public static createPfdInteractionEventMap(
    side: 'left' | 'right',
    isInSplitMode: Subscribable<boolean>,
  ): (event: string) => number | undefined {
    const splitModeMin = side === 'left' ? 0 : 5;

    return (event: string): number | undefined => {
      const rawIndex = SoftKeyUtils.INTERACTION_EVENT_TO_INDEX_MAP[event];

      if (rawIndex !== undefined) {
        let min, max;

        if (isInSplitMode.get()) {
          min = splitModeMin;
          max = min + SoftKeyUtils.SPLIT_MODE_SOFTKEY_COUNT;
        } else {
          min = 0;
          max = SoftKeyMenu.SOFTKEY_COUNT;
        }

        if (rawIndex >= min && rawIndex < max) {
          return rawIndex - min;
        }
      }

      return undefined;
    };
  }
}

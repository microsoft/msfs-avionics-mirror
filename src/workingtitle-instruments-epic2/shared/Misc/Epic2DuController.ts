import { ConsumerValue, EventBus, HEventPublisher } from '@microsoft/msfs-sdk';

import { DisplayUnitIndices } from '../InstrumentIndices';
import { Epic2BezelButtonEvents } from './Epic2BezelButtonEvents';
import { Epic2DuControlEvents } from './Epic2DuControlEvents';

/** Object index signature for softKeyEventMap */
type ControlSoftKeyEventMapType = { [k in string]: Epic2BezelButtonEvents };
const softKeyEventMap: ControlSoftKeyEventMapType = {
  'SOFTKEY_1': Epic2BezelButtonEvents.LSK_L1,
  'SOFTKEY_2': Epic2BezelButtonEvents.LSK_L2,
  'SOFTKEY_3': Epic2BezelButtonEvents.LSK_L3,
  'SOFTKEY_4': Epic2BezelButtonEvents.LSK_L4,
  'SOFTKEY_5': Epic2BezelButtonEvents.LSK_L5,
  'SOFTKEY_6': Epic2BezelButtonEvents.LSK_L6,
  'SOFTKEY_7': Epic2BezelButtonEvents.LSK_L7,
  'SOFTKEY_8': Epic2BezelButtonEvents.LSK_L8,
  'SOFTKEY_9': Epic2BezelButtonEvents.LSK_L9,
  'SOFTKEY_10': Epic2BezelButtonEvents.LSK_L10,
  'SOFTKEY_11': Epic2BezelButtonEvents.LSK_L11,
  'SOFTKEY_12': Epic2BezelButtonEvents.LSK_L12,
  'SOFTKEY_13': Epic2BezelButtonEvents.LSK_R1,
  'SOFTKEY_14': Epic2BezelButtonEvents.LSK_R2,
  'SOFTKEY_15': Epic2BezelButtonEvents.LSK_R3,
  'SOFTKEY_16': Epic2BezelButtonEvents.LSK_R4,
  'SOFTKEY_17': Epic2BezelButtonEvents.LSK_R5,
  'SOFTKEY_18': Epic2BezelButtonEvents.LSK_R6,
  'SOFTKEY_19': Epic2BezelButtonEvents.LSK_R7,
  'SOFTKEY_20': Epic2BezelButtonEvents.LSK_R8,
  'SOFTKEY_21': Epic2BezelButtonEvents.LSK_R9,
  'SOFTKEY_22': Epic2BezelButtonEvents.LSK_R10,
  'SOFTKEY_23': Epic2BezelButtonEvents.LSK_R11,
  'SOFTKEY_24': Epic2BezelButtonEvents.LSK_R12,
};

const EPIC2_H_EVENT_SOFT_KEY_REGEX = /^(PFD|MFD)_([12])_SOFTKEY_(\d{1,2})$/;

/** Handles the DU bezel buttons interface. */
export class Epic2DuController {

  private readonly isMFDSwapped = ConsumerValue.create(
    this.bus.getSubscriber<Epic2DuControlEvents>().on('epic2_mfd_swap'), false
  );

  /**
   * Constructs a new MFD controller.
   * @param bus An instance of the EventBus.
   * @param duIndex The display unit index for this MFD.
   * @param hEventPublisher The HEventPublisher.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly duIndex: DisplayUnitIndices,
    private readonly hEventPublisher: HEventPublisher,
  ) {

  }

  /**
   * Gets the soft key index number from the soft key HEvent.
   * @param hEvent The soft key HEvent.
   * @returns a number.
   */
  public static getSoftKeyIndexFromSoftKeyHEvent(hEvent: string): number {
    return parseInt(hEvent.slice(5));
  }

  /**
   * Maps an H event to an FmcEvent
   * @param hEvent the raw H event string
   * @returns Whether the HEvent is sucessfully matched to a Epic2BezelButtonEvents.
   * @throws if the event is invalid or unmapped
   */
  mapHEventToSoftKeyEvent(hEvent: string): boolean {
    const hEventWithoutPrefix = EPIC2_H_EVENT_SOFT_KEY_REGEX[Symbol.match](hEvent);

    if (hEventWithoutPrefix === null) {
      return false;
    }

    const duType = hEventWithoutPrefix[1]; // Expecting "MFD" or "PFD"
    const duTypeIndex = Number(hEventWithoutPrefix[2]); // Expecting 1 or 2.
    const eventDuIndex: number | undefined = ((): number | undefined => {
      if (duType === 'MFD') {
        if (this.isMFDSwapped.get()) {
          if (duTypeIndex === 1) { return 3; }
          if (duTypeIndex === 2) { return 2; }
        }

        if (duTypeIndex === 1 || duTypeIndex === 2) {
          return duTypeIndex + 1;
        }

        return undefined;
      }

      if (duType === 'PFD') {
        if (duTypeIndex === 1) { return 1; }
        if (duTypeIndex === 2) { return 4; }
        return undefined;
      }

      return undefined;
    })();

    if (eventDuIndex !== this.duIndex) {
      { return false; }
    }

    const btnIndex = hEventWithoutPrefix[3]; // Expecting from 1 to 24.
    if (!btnIndex) {
      return false;
    }

    const mappedEvent: Epic2BezelButtonEvents = softKeyEventMap[`SOFTKEY_${btnIndex.toUpperCase()}`];
    if (mappedEvent === undefined) {
      throw new Error(`[mapHEventToSoftKeyEvent] Unmapped H event 'SOFTKEY_${btnIndex.toUpperCase()}'.`);
    }

    this.hEventPublisher.dispatchHEvent(mappedEvent);

    return true;
  }
}

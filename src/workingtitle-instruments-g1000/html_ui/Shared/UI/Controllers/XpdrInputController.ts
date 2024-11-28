import { EventBus } from '@microsoft/msfs-sdk';

import { G1000ControlEvents, G1000ControlPublisher } from '../../G1000Events';

/**
 * Controller that maps control pad input to the xpdr bus events.
 */
export class XpdrInputController {
  private readonly controlPadXpdrInputMap: Map<string, number> = new Map([
    ['AS1000_CONTROL_PAD_0', 0],
    ['AS1000_CONTROL_PAD_1', 1],
    ['AS1000_CONTROL_PAD_2', 2],
    ['AS1000_CONTROL_PAD_3', 3],
    ['AS1000_CONTROL_PAD_4', 4],
    ['AS1000_CONTROL_PAD_5', 5],
    ['AS1000_CONTROL_PAD_6', 6],
    ['AS1000_CONTROL_PAD_7', 7],
    ['AS1000_CONTROL_PAD_8', 8],
    ['AS1000_CONTROL_PAD_9', 9],
  ]);
  private readonly validXpdrDigits = [0, 1, 2, 3, 4, 5, 6, 7];

  private digitPosition = 0;
  private readonly g1000ControlPublisher = new G1000ControlPublisher(this.bus);

  /**
   * Constructs the controller.
   * @param bus The event bus.
   * @param isPfd true if the controller is for the PFD, false if for the MFD
   */
  constructor(private readonly bus: EventBus, private readonly isPfd: boolean) {
    this.g1000ControlPublisher.startPublish();
  }
  /**
   * Enters XPDR Entry mode
   */
  public startXpdrEntry(): void {
    this.digitPosition = 0;
    this.publishEvent('xpdr_code_push', true);
  }

  /**
   * Handles the XPDR input event
   * @param hEvent received hEvent
   * @returns true if handled, false if the not
   */
  public handleXpdrEntry(hEvent: string): boolean {
    let isHandled = true;
    const digit = this.controlPadXpdrInputMap.get(hEvent);
    if (digit !== undefined) {
      if (this.validXpdrDigits.includes(digit)) {
        // We received a valid input for xpdr input:
        this.publishEvent('xpdr_code_digit', digit);
        this.digitPosition++;
        if (this.digitPosition > 3) {
          this.publishEvent('xpdr_code_push', false);
          isHandled = false;
        }
      }
    } else {
      // we ignore XPDR button press when handling XPDR input
      if (hEvent !== 'AS1000_CONTROL_PAD_XPDR') {
        this.digitPosition = 0;
        this.publishEvent('xpdr_code_push', false);
        isHandled = false;
      }
    }
    return isHandled;
  }

  /**
   * Publishes the event to the bus if the controller is for the PFD.
   * @param event the event to publish
   * @param value the value to publish
   */
  private publishEvent(event: keyof G1000ControlEvents, value: number | boolean): void {
    if (this.isPfd) {
      this.g1000ControlPublisher.publishEvent(event, value);
    }
  }
}

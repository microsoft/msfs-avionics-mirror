import { ConsumerValue, EventBus, HEvent, SimVarValueType } from '@microsoft/msfs-sdk';

import { Epic2DuControlEvents, Epic2DuControlLocalVars } from '@microsoft/msfs-epic2-shared';

/** Handles the TSC bezel buttons interface. */
export class Epic2TscController {
  private readonly isMFDSwapped = ConsumerValue.create(this.bus.getSubscriber<Epic2DuControlEvents>().on('epic2_mfd_swap'), false);

  /**
   * Constructs a new TSC controller.
   * @param bus An instance of the EventBus.
   */
  constructor(
    private readonly bus: EventBus,
  ) {
    this.bus.getSubscriber<HEvent>().on('hEvent').handle((event: string) => {
      if (event === 'TSC_SOFTKEY_2') { this.handleMFDSwapBezelButton(); }
    });
  }

  /** Handler for when `MFD Swap` button is pressed. */
  private handleMFDSwapBezelButton(): void {
    SimVar.SetSimVarValue(Epic2DuControlLocalVars.MfdSwap, SimVarValueType.Bool, !this.isMFDSwapped.get());
  }
}

import { EventBus, Publisher } from '@microsoft/msfs-sdk';

import { MFDViewServiceEvents } from '../../../Shared/UI/Controllers/ControlpadInputController';
import { FmsHEvent } from '../../../Shared/UI/FmsHEvent';
import { ViewService } from '../../../Shared/UI/ViewService';

/**
 * A service to manage views.
 */
export class MFDViewService extends ViewService {

  /** A publisher for publishing flight planner update events. */
  private readonly publisher: Publisher<MFDViewServiceEvents>;

  protected readonly fmsEventMap: Map<string, FmsHEvent> = new Map([
    ['AS1000_MFD_FMS_Upper_INC', FmsHEvent.UPPER_INC],
    ['AS1000_MFD_FMS_Upper_DEC', FmsHEvent.UPPER_DEC],
    ['AS1000_MFD_FMS_Lower_INC', FmsHEvent.LOWER_INC],
    ['AS1000_MFD_FMS_Lower_DEC', FmsHEvent.LOWER_DEC],
    ['AS1000_MFD_MENU_Push', FmsHEvent.MENU],
    ['AS1000_MFD_CLR', FmsHEvent.CLR],
    ['AS1000_MFD_ENT_Push', FmsHEvent.ENT],
    ['AS1000_MFD_FMS_Upper_PUSH', FmsHEvent.UPPER_PUSH],
    ['AS1000_MFD_DIRECTTO', FmsHEvent.DIRECTTO],
    ['AS1000_MFD_FPL_Push', FmsHEvent.FPL],
    ['AS1000_MFD_PROC_Push', FmsHEvent.PROC],
    ['AS1000_MFD_RANGE_INC', FmsHEvent.RANGE_INC],
    ['AS1000_MFD_RANGE_DEC', FmsHEvent.RANGE_DEC],
    ['AS1000_MFD_JOYSTICK_PUSH', FmsHEvent.JOYSTICK_PUSH],
    ['AS1000_MFD_JOYSTICK_LEFT', FmsHEvent.JOYSTICK_LEFT],
    ['AS1000_MFD_JOYSTICK_UP', FmsHEvent.JOYSTICK_UP],
    ['AS1000_MFD_JOYSTICK_RIGHT', FmsHEvent.JOYSTICK_RIGHT],
    ['AS1000_MFD_JOYSTICK_DOWN', FmsHEvent.JOYSTICK_DOWN],
  ]);

  /**
   * Constructs the view service.
   * @param bus The event bus.
   */
  constructor(readonly bus: EventBus) {
    super(bus);

    this.publisher = bus.getPublisher<MFDViewServiceEvents>();

    // For the controlpad input routing, we need to share among the instruments, whether the MFD has opened the home view (nav map) or not:
    this.activeViewKey.sub(newViewKey => {
      const isNotNavMapPage = newViewKey !== 'NavMapPage';  // Prevent generic controlpad use (COM, NAV, XPDR) if any otehr page than NavMap is opened.
      this.bus.getPublisher<MFDViewServiceEvents>().pub('inhibitGenericControlpadUse', isNotNavMapPage, true, true);
    }, true);
  }
}

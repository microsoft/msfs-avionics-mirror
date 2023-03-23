import { GuiHEvent } from '../../Shared/UI/GuiHEvent';
import { MenuViewService } from '../../Shared/UI/MenuViewService';
import { MfdLwrMenu } from './MfdLwrMenu';

const WT21_H_EVENT_MFD_REGEX = /Generic_Lwr_([12])_(.*)/;

/**
 * A service to manage mfd lower menu views.
 */
export class MfdLwrMenuViewService extends MenuViewService {
  protected readonly guiEventMap: Map<string, GuiHEvent> = new Map([
    ['MENU_ADV_INC', GuiHEvent.LOWER_INC],
    ['MENU_ADV_DEC', GuiHEvent.LOWER_DEC],
    ['DATA_INC', GuiHEvent.UPPER_INC],
    ['DATA_DEC', GuiHEvent.UPPER_DEC],
    ['DATA_PUSH', GuiHEvent.UPPER_PUSH],
    ['Push_LWR_MENU', GuiHEvent.LWR_MENU_PUSH],
    ['Push_ESC', GuiHEvent.MFD_ESC]
  ]);

  /** MfdLwrMenuViewService constructor
   * @param otherMenuServices Other menus on this screen that should be closed when this menu is opened
   */
  public constructor(public readonly otherMenuServices: MenuViewService[] = []) {
    super();
  }

  /** @inheritdoc */
  public onInteractionEvent(hEvent: string, instrumentIndex: number): boolean {
    const hEventWithoutPrefix = WT21_H_EVENT_MFD_REGEX[Symbol.match](hEvent);
    if (hEventWithoutPrefix !== null) {
      const evtIndex = hEventWithoutPrefix[1];
      if (Number(evtIndex) === instrumentIndex) {
        const evt = this.guiEventMap.get(hEventWithoutPrefix[2]);
        if (evt !== undefined) {
          this.startInteractionTimeout();
          if (evt === GuiHEvent.LWR_MENU_PUSH) {
            this.otherMenuServices.forEach(x => x.activeView.get()?.close());
            (this.activeView.get() instanceof MfdLwrMenu) ? this.activeView.get()?.close() : this.open('MfdLwrMenu');
            return true;
          } else if (evt == GuiHEvent.MFD_ESC) {
            const isInSubmenu = (this.activeView.get() && !(this.activeView.get() instanceof MfdLwrMenu));
            this.activeView.get()?.close();
            if (isInSubmenu) {
              this.open('MfdLwrMenu');
            }
            return true;
          } else {
            return this.routeInteractionEventToViews(evt);
          }
        }
      }
    }

    return false;
  }
}
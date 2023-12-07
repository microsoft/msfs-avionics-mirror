import { GuiHEvent } from '../../Shared/UI/GuiHEvent';
import { MenuViewService } from '../../Shared/UI/MenuViewService';
import { MfdUprMenu } from './MfdUprMenu';

const WT21_H_EVENT_MFD_REGEX = /Generic_Lwr_([12])_(.*)/;

/**
 * MFD upper view keys
 */
export interface MfdUprMenuViewKeys {
  /** MFD upper menu */
  'MfdUprMenu': void,
}

/**
 * A service to manage mfd upper menu views.
 */
export class MfdUprMenuViewService extends MenuViewService<MfdUprMenuViewKeys> {
  protected readonly guiEventMap: Map<string, GuiHEvent> = new Map([
    ['MENU_ADV_INC', GuiHEvent.LOWER_INC],
    ['MENU_ADV_DEC', GuiHEvent.LOWER_DEC],
    ['DATA_INC', GuiHEvent.UPPER_INC],
    ['DATA_DEC', GuiHEvent.UPPER_DEC],
    ['DATA_PUSH', GuiHEvent.UPPER_PUSH],
    ['Push_UPR_MENU', GuiHEvent.UPR_MENU_PUSH],
    ['Push_ESC', GuiHEvent.MFD_ESC]
  ]);

  /** MfdUprMenuViewService constructor
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
          if (evt === GuiHEvent.UPR_MENU_PUSH) {
            this.otherMenuServices.forEach(x => x.activeView.get()?.close());
            (this.activeView.get() instanceof MfdUprMenu) ? this.activeView.get()?.close() : this.open('MfdUprMenu');
            return true;
          } else if (evt == GuiHEvent.MFD_ESC) {
            const isInSubmenu = (this.activeView.get() && !(this.activeView.get() instanceof MfdUprMenu));
            this.activeView.get()?.close();
            if (isInSubmenu) {
              this.open('MfdUprMenu');
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
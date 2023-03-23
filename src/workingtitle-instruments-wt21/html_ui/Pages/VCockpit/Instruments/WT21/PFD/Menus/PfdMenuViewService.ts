import { GuiHEvent } from '../../Shared/UI/GuiHEvent';
import { MenuViewService } from '../../Shared/UI/MenuViewService';
import { PfdMenu } from './PfdMenu';
import { PfdRefsMenu } from './PfdRefsMenu';

/**
 * A service to manage pfd menu views.
 */
export class PfdMenuViewService extends MenuViewService {
  protected readonly guiEventMap: Map<string, GuiHEvent> = new Map([
    ['MENU_ADV_INC', GuiHEvent.LOWER_INC],
    ['MENU_ADV_DEC', GuiHEvent.LOWER_DEC],
    ['DATA_INC', GuiHEvent.UPPER_INC],
    ['DATA_DEC', GuiHEvent.UPPER_DEC],
    ['DATA_PUSH', GuiHEvent.UPPER_PUSH],
    ['Push_PFD_MENU', GuiHEvent.PFD_MENU_PUSH],
    ['Push_REFS_MENU', GuiHEvent.REFS_MENU_PUSH],
    ['Push_ESC', GuiHEvent.PFD_ESC]
  ]);

  /** @inheritdoc */
  public onInteractionEvent(hEvent: string): boolean {
    const evt = this.guiEventMap.get(hEvent.replace(/Generic_Upr_([12])_/, ''));

    if (evt !== undefined) {
      this.startInteractionTimeout();
      if (evt === GuiHEvent.PFD_MENU_PUSH) {
        (this.activeView.get() instanceof PfdMenu) ? this.activeView.get()?.close() : this.open('PfdMenu');
        return true;
      } else if (evt == GuiHEvent.PFD_ESC) {
        const isInSubmenu = (this.activeView.get() && !(this.activeView.get() instanceof PfdMenu));
        this.activeView.get()?.close();
        if (isInSubmenu) {
          this.open('PfdMenu');
        }

        return true;
      } else if (evt === GuiHEvent.REFS_MENU_PUSH) {
        // TODO check if Refs menu is already open
        (this.activeView.get() instanceof PfdRefsMenu) ? this.activeView.get()?.close() : this.open('PfdRefsMenu');
        return true;
      } else {
        return this.routeInteractionEventToViews(evt);
      }
    }

    return false;
  }
}
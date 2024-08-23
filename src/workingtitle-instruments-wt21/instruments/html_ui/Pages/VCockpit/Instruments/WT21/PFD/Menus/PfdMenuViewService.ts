import { EventBus } from '@microsoft/msfs-sdk';

import { DisplayUnitConfigInterface, DisplayUnitLayout, GuiHEvent, MenuViewService, WT21CourseNeedleNavIndicator, DcpEvent, DcpEvents } from '@microsoft/msfs-wt21-shared';

import { PfdMenu } from './PfdMenu';
import { PfdRefsMenu } from './PfdRefsMenu';
import { PfdSideButtonsRefs1Menu } from './PfdSideButtonsRefs1Menu';
import { PfdSideButtonsRefs2Menu } from './PfdSideButtonsRefs2Menu';

/**
 * PFD view keys
 */
export interface PfdMenuViewKeys {
  /** PFD menu */
  'PfdMenu': void,

  /** BRG SRC menu */
  'BrgSrcMenu': void,

  /** PFD config menu */
  'PfdConfigMenu': void,

  /** PFD refs menu */
  'PfdRefsMenu': void,

  /** PFD overlays menu */
  'PfdOverlaysMenu': void,

  /** PFD baro set menu */
  'PfdBaroSetMenu': void,

  /** PFD (side button layout) NAV/BRG SRC menu */
  'PfdSideButtonsNavBrgSrcMenu': void,

  /** PFD (side button layout) REFS 1/2 menu */
  'PfdSideButtonsRefs1Menu': void,

  /** PFD (side button layout) REFS 2/2 menu */
  'PfdSideButtonsRefs2Menu': void,
}

/**
 * A service to manage pfd menu views.
 */
export class PfdMenuViewService extends MenuViewService<PfdMenuViewKeys> {
  /**
   * Ctor
   * @param bus the event bus
   * @param displayUnitConfig the display unit config for the PFD
   * @param courseNeedleNavIndicator the course needle nav indicator, used to perform nav swap on PRESET LSK press
   */
  constructor(
    private readonly bus: EventBus,
    private readonly displayUnitConfig: DisplayUnitConfigInterface,
    private readonly courseNeedleNavIndicator: WT21CourseNeedleNavIndicator,
  ) {
    super();

    const dcpSubscriber = bus.getSubscriber<DcpEvents>();

    if (displayUnitConfig.displayUnitLayout === DisplayUnitLayout.Softkeys) {
      dcpSubscriber.on('dcpEvent').handle((event) => {
        if (event === DcpEvent.DCP_NAV) {
          const activeView = this.activeViewKey.get();

          if (activeView === 'PfdSideButtonsNavBrgSrcMenu') {
            this.activeView.get()?.close();
          } else {
            this.open('PfdSideButtonsNavBrgSrcMenu');
          }
        }
      });
    }
  }

  private readonly isUsingSoftkeys = this.displayUnitConfig.displayUnitLayout === DisplayUnitLayout.Softkeys;

  protected readonly guiEventMap: Map<string, GuiHEvent> = new Map([
    ['MENU_ADV_INC', GuiHEvent.LOWER_INC],
    ['MENU_ADV_DEC', GuiHEvent.LOWER_DEC],
    ['DATA_INC', GuiHEvent.UPPER_INC],
    ['DATA_DEC', GuiHEvent.UPPER_DEC],
    ['DATA_PUSH', GuiHEvent.UPPER_PUSH],
    ['Push_PFD_MENU', GuiHEvent.PFD_MENU_PUSH],
    ['Push_REFS_MENU', GuiHEvent.REFS_MENU_PUSH],
    ['Push_ESC', GuiHEvent.PFD_ESC],
    ['Push_1L', GuiHEvent.SOFTKEY_1L],
    ['Push_2L', GuiHEvent.SOFTKEY_2L],
    ['Push_3L', GuiHEvent.SOFTKEY_3L],
    ['Push_4L', GuiHEvent.SOFTKEY_4L],
    ['Push_1R', GuiHEvent.SOFTKEY_1R],
    ['Push_2R', GuiHEvent.SOFTKEY_2R],
    ['Push_3R', GuiHEvent.SOFTKEY_3R],
    ['Push_4R', GuiHEvent.SOFTKEY_4R],
  ]);

  /** @inheritdoc */
  public onInteractionEvent(hEvent: string): boolean {
    const activeView = this.activeView.get();

    if (hEvent.startsWith('Generic_Upr')) {
      const evt = this.guiEventMap.get(hEvent.replace(/Generic_Upr_([12])_/, ''));

      if (evt !== undefined) {
        this.startInteractionTimeout();

        switch (evt) {
          case GuiHEvent.PFD_MENU_PUSH: {
            (activeView instanceof PfdMenu) ? activeView?.close() : this.open('PfdMenu');
            return true;
          }
          case GuiHEvent.PFD_ESC: {
            const isInSubmenu = (activeView && !(activeView instanceof PfdMenu));

            activeView?.close();

            if (isInSubmenu) {
              this.open('PfdMenu');
            }

            return true;
          }
          case GuiHEvent.REFS_MENU_PUSH: {
            // TODO check if Refs menu is already open
            if (this.isUsingSoftkeys) {
              if (activeView instanceof PfdSideButtonsRefs1Menu) {
                this.open('PfdSideButtonsRefs2Menu');
              } else if (activeView instanceof PfdSideButtonsRefs2Menu) {
                activeView.close();
              } else {
                this.open('PfdSideButtonsRefs1Menu');
                return true;
              }
              return true;
            } else {
              (activeView instanceof PfdRefsMenu) ? activeView?.close() : this.open('PfdRefsMenu');
              return true;
            }
          }
          default:
            return this.routeInteractionEventToViews(evt);
        }
      }

      return false;
    } else if (this.isUsingSoftkeys && hEvent.startsWith('Generic_Display_')) {
      const evt = this.guiEventMap.get(hEvent.replace(/Generic_Display_PFD([12])_/, '')) as GuiHEvent;

      if (activeView) {
        return this.routeInteractionEventToViews(evt);
      }

      switch (evt) {
        case GuiHEvent.SOFTKEY_1L: {
          // noop
          return false;
        }
        case GuiHEvent.SOFTKEY_2L: {
          // PRESET TODO noop
          this.courseNeedleNavIndicator.navSwap();
          return false;
        }
        case GuiHEvent.SOFTKEY_3L: {
          // noop
          return false;
        }
        case GuiHEvent.SOFTKEY_4L: {
          // ET
          this.bus.getPublisher<DcpEvents>().pub('dcpEvent', DcpEvent.DCP_ET);
          return false;
        }
        case GuiHEvent.SOFTKEY_1R: {
          // FORMAT
          // TODO this is not super great - ideally, the HSI container would be a view, and it would transmit events to components.
          // But this requires a larger refactor.
          // For now, we transmit the corresponding DCP event instead.
          this.bus.getPublisher<DcpEvents>().pub('dcpEvent', DcpEvent.DCP_FRMT);
          return true;
        }
        case GuiHEvent.SOFTKEY_2R: {
          // OVERLAYS
          // TODO this is not super great - ideally, the HSI container would be a view, and it would transmit events to components.
          // But this requires a larger refactor.
          // For now, we transmit the corresponding DCP event instead.
          this.bus.getPublisher<DcpEvents>().pub('dcpEvent', DcpEvent.DCP_TERR_WX);
          return true;
        }
        case GuiHEvent.SOFTKEY_3R: {
          // TFC
          // TODO this is not super great - ideally, the HSI container would be a view, and it would transmit events to components.
          // But this requires a larger refactor.
          // For now, we transmit the corresponding DCP event instead.
          this.bus.getPublisher<DcpEvents>().pub('dcpEvent', DcpEvent.DCP_TFC);
          return false;
        }
        case GuiHEvent.SOFTKEY_4R: {
          // ??? TODO noop
          return false;
        }
      }

      return false;
    }

    return false;
  }
}

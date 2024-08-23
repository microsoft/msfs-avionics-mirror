import { EventBus, Subject } from '@microsoft/msfs-sdk';

import {
  DisplayUnitConfigInterface, DisplayUnitLayout, GuiHEvent, MapUserSettings, MenuViewService, MFDUpperWindowState, MFDUserSettings, WT21ControlPublisher, WT21DisplayUnitIndex,
} from '@microsoft/msfs-wt21-shared';

import { CcpEvent } from '../CCP/CcpEvent';
import { CcpEventPublisherType } from '../CCP/CcpEventPublisher';
import { MfdLwrMenu } from './MfdLwrMenu';

/**
 * MFD lower view keys
 */
export interface MfdLwrMenuViewKeys {
  /** MFD lower menu */
  'MfdLwrMenu': void,

  /** MFD lower overlays menu */
  'MfdLwrOverlaysMenu': void,

  /** MFD lower map symbols menu */
  'MfdLwrMapSymbolsMenu': void,
}

/**
 * A service to manage mfd lower menu views.
 */
export class MfdLwrMenuViewService extends MenuViewService<MfdLwrMenuViewKeys> {
  protected readonly guiEventMap: Map<string, GuiHEvent> = new Map([
    ['MENU_ADV_INC', GuiHEvent.LOWER_INC],
    ['MENU_ADV_DEC', GuiHEvent.LOWER_DEC],
    ['DATA_INC', GuiHEvent.UPPER_INC],
    ['DATA_DEC', GuiHEvent.UPPER_DEC],
    ['DATA_PUSH', GuiHEvent.UPPER_PUSH],
    ['Push_LWR_MENU', GuiHEvent.LWR_MENU_PUSH],
    ['Push_ESC', GuiHEvent.MFD_ESC],
    ['Push_1L', GuiHEvent.SOFTKEY_1L],
    ['Push_2L', GuiHEvent.SOFTKEY_2L],
    ['Push_3L', GuiHEvent.SOFTKEY_3L],
    ['Push_4L', GuiHEvent.SOFTKEY_4L],
    ['Push_1R', GuiHEvent.SOFTKEY_1R],
    ['Push_2R', GuiHEvent.SOFTKEY_2R],
    ['Push_3R', GuiHEvent.SOFTKEY_3R],
    ['Push_4R', GuiHEvent.SOFTKEY_4R],
  ]);

  private readonly mapSettingsManagerMfd = MapUserSettings.getAliasedManager(this.bus, 'MFD');
  private readonly userSettingsManagerMfd = MFDUserSettings.getAliasedManager(this.bus);

  private readonly mfdLowerFormatSetting = this.mapSettingsManagerMfd.getSetting('hsiFormat');
  private readonly mfdUpperFormatSetting = this.userSettingsManagerMfd.getSetting('mfdUpperWindowState');

  private mfdSoftkeyFormatChangeActiveTimeout: NodeJS.Timeout | undefined = undefined;
  private readonly isUsingSoftkeys = this.displayUnitConfig.displayUnitLayout === DisplayUnitLayout.Softkeys;
  private readonly formatChangeActiveSubject = Subject.create<boolean>(false);

  /**
   * MfdLwrMenuViewService constructor
   * @param bus the event bus
   * @param displayUnitConfig the display unit config
   * @param displayUnitIndex the display unit index
   * @param wt21ControlPublisher the WT21 control publisher
   * @param otherMenuServices Other menus on this screen that should be closed when this menu is opened
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly displayUnitConfig: DisplayUnitConfigInterface,
    private readonly displayUnitIndex: WT21DisplayUnitIndex,
    private readonly wt21ControlPublisher: WT21ControlPublisher,
    public readonly otherMenuServices: MenuViewService[] = [],
  ) {
    super();

    this.formatChangeActiveSubject.sub((isActive) => {
      this.wt21ControlPublisher.publishEvent(`softkeyFormatChangeActive_${this.displayUnitIndex}`, isActive);
    });
  }

  /**
   * Set the format change active state.
   * @param isActive Whether the format change is active.
   */
  private setFormatChangedActive(isActive: boolean): void {
    this.formatChangeActiveSubject.set(isActive);
  }

  /** @inheritdoc */
  public onInteractionEvent(hEvent: string, instrumentIndex: number): boolean {
    if (hEvent.startsWith('Generic_Lwr_')) {
      const hEventWithoutPrefix = /Generic_Lwr_([12])_(.*)/[Symbol.match](hEvent);

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
    } else if (this.isUsingSoftkeys && hEvent.startsWith('Generic_Display_')) {
      const hEventWithoutPrefix = /Generic_Display_MFD([12])_(.*)/[Symbol.match](hEvent);

      if (hEventWithoutPrefix !== null) {
        const evtIndex = hEventWithoutPrefix[1];

        if (Number(evtIndex) === instrumentIndex) {
          const evt = this.guiEventMap.get(hEventWithoutPrefix[2]);

          if (evt !== undefined) {
            this.startInteractionTimeout();

            switch (evt) {
              case GuiHEvent.SOFTKEY_1L: {
                if (this.mfdSoftkeyFormatChangeActiveTimeout !== undefined) {
                  clearTimeout(this.mfdSoftkeyFormatChangeActiveTimeout);
                }

                this.mfdSoftkeyFormatChangeActiveTimeout = setTimeout(() => this.setFormatChangedActive(false), 10_000);

                if (!this.formatChangeActiveSubject.get()) {
                  this.setFormatChangedActive(true);
                  return true;
                }

                const currentFormat = this.mfdUpperFormatSetting.get();

                let nextFormat;
                switch (currentFormat) {
                  default:
                  case MFDUpperWindowState.Off:
                    nextFormat = MFDUpperWindowState.FmsText;
                    break;
                  case MFDUpperWindowState.FmsText:
                    nextFormat = MFDUpperWindowState.Checklist;
                    break;
                  // case MFDUpperWindowState.Checklist: nextFormatIndex = MFDUpperWindowState.PassBrief; break;
                  case MFDUpperWindowState.Checklist:
                    nextFormat = MFDUpperWindowState.Systems;
                    break;
                }

                this.mfdUpperFormatSetting.set(nextFormat);
                break;
              }
              case GuiHEvent.SOFTKEY_1R: {
                if (this.mfdSoftkeyFormatChangeActiveTimeout !== undefined) {
                  clearTimeout(this.mfdSoftkeyFormatChangeActiveTimeout);
                }

                this.mfdSoftkeyFormatChangeActiveTimeout = setTimeout(() => this.setFormatChangedActive(false), 10_000);

                if (!this.formatChangeActiveSubject.get()) {
                  this.setFormatChangedActive(true);
                  return true;
                }

                const lowerFormats = MapUserSettings.hsiFormatsMFD;
                const currentFormatIndex = lowerFormats.indexOf(this.mfdLowerFormatSetting.get());
                const nextFormatIndex = (currentFormatIndex + 1) % (lowerFormats.length - 1);

                this.mfdLowerFormatSetting.set(lowerFormats[nextFormatIndex]);
                break;
              }
              case GuiHEvent.SOFTKEY_2R: {
                // OVERLAYS
                // TODO this is not super great - ideally, the HSI container would be a view, and it would transmit events to components.
                //  But this requires a larger refactor.
                // For now, we transmit the corresponding DCP event instead.
                this.bus.getPublisher<CcpEventPublisherType>().pub('ccpEvent', CcpEvent.CCP_TERR_WX);
                return true;
              }
              case GuiHEvent.SOFTKEY_3R: {
                // TFC
                // TODO this is not super great - ideally, the HSI container would be a view, and it would transmit events to components.
                //  But this requires a larger refactor.
                // For now, we transmit the corresponding DCP event instead.
                this.bus.getPublisher<CcpEventPublisherType>().pub('ccpEvent', CcpEvent.CCP_TFC);
                return false;
              }
              default:
                return this.routeInteractionEventToViews(evt);
            }
          }
        }
      }
    }

    return false;
  }
}

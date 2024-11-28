import { FSComponent, SimVarValueType, VNode } from '@microsoft/msfs-sdk';

import { AvionicsConfig } from '../../../Shared/AvionicsConfig/AvionicsConfig';
import { UiList } from '../../../Shared/Components/List/UiList';
import { UiListFocusable } from '../../../Shared/Components/List/UiListFocusable';
import { UiImgTouchButton } from '../../../Shared/Components/TouchButton/UiImgTouchButton';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiFocusDirection } from '../../../Shared/UiSystem/UiFocusTypes';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { ComFrequencyDialog } from '../ComFrequencyDialog/ComFrequencyDialog';
import { NavFrequencyDialog } from '../NavFrequencyDialog/NavFrequencyDialog';
import { ComRadioDefinition, NavRadioDefinition } from '../../../Shared/AvionicsConfig/RadiosConfig';

import './MainMenuView.css';

/**
 * Component props for {@link MainMenuView}.
 */
export interface MainMenuViewProps extends UiViewProps {
  /** The global avionics configuration object. */
  config: AvionicsConfig;
}

/**
 * A main menu.
 */
export class MainMenuView extends AbstractUiView<MainMenuViewProps> {
  private readonly listRef = FSComponent.createRef<UiList<any>>();

  private readonly listItemLengthPx = this.props.uiService.gduFormat === '460' ? 160 : 80;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.listRef.instance.knobLabelState.pipe(this._knobLabelState);
    this.listRef.instance.focusFirst(UiFocusDirection.Forward);
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    if (event === UiInteractionEvent.MenuPress) {
      this.props.uiService.goBackMfd();
      return true;
    }

    return this.listRef.instance.onUiInteractionEvent(event);
  }

  /** @inheritDoc */
  public render(): VNode {
    const buttonNodes = this.renderButtons();

    return (
      <div class='main-menu-view ui-view-generic-bg ui-titled-view'>
        <div class='main-menu-view-title ui-view-title'>
          <img src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_main_menu.png`} class={'main-menu-view-title-img'} />
          <div>Main Menu</div>
        </div>
        <div class='main-menu-view-content ui-titled-view-content'>
          <UiList
            ref={this.listRef}
            bus={this.props.uiService.bus}
            validKnobIds={this.props.uiService.validKnobIds}
            listItemLengthPx={this.listItemLengthPx}
            itemsPerPage={4}
            autoDisableOverscroll
            showScrollBar='auto'
            class='main-menu-view-list'
          >
            {
              buttonNodes
                .reduce((rows, node, index) => {
                  // Four buttons per row.
                  const rowIndex = Math.trunc(index / 4);
                  (rows[rowIndex] ??= []).push(node);
                  return rows;
                }, [] as VNode[][])
                .map(row => {
                  return (
                    <div class='main-menu-view-row'>
                      <UiListFocusable>
                        {row}
                      </UiListFocusable>
                    </div>
                  );
                })
            }
          </UiList>
        </div>
      </div>
    );
  }

  /**
   * This will open the right com dialog when pressing the Com Radio buttons in the Main Menu
   * This will also handle grabing the right indexs so the new frequency can be set.
   * @param comDefinitions The come definition to then get the proper sim index
   */
  private async openComRadioDialogsInMainMenu(comDefinitions: ComRadioDefinition): Promise<void> {
    const spacingMode = SimVar.GetSimVarValue(`COM SPACING MODE:${comDefinitions.simIndex}`, SimVarValueType.Enum);
    const initValue = SimVar.GetSimVarValue(`COM STANDBY FREQUENCY:${comDefinitions.simIndex}`, SimVarValueType.Hertz);
    const result = await this.props.uiService
      .openMfdPopup<ComFrequencyDialog>(UiViewStackLayer.Overlay, UiViewKeys.ComFrequencyDialog, true, { popupType: 'slideout-top-full' })
      .ref.request({
        spacing: spacingMode,
        radioIndex: comDefinitions.index,
        initialValue: initValue
      });

    if (!result.wasCancelled) {
      SimVar.SetSimVarValue(`K:COM${comDefinitions.simIndex === 1 ? '' : comDefinitions.simIndex}_STBY_RADIO_SET_HZ`, SimVarValueType.Number, result.payload.frequency);
      if (result.payload.transfer) {
        SimVar.SetSimVarValue(`K:COM${comDefinitions.simIndex}_RADIO_SWAP`, SimVarValueType.Number, 0);
      }
    }
  }

  /**
   * This will open the right nav dialog when pressing the nav Radio buttons in the Main Menu
   * This will also handle grabing the right indexs so the new frequency can be set.
   * @param navDefinitions The nav definition to then get the proper sim index
   */
  private async openNavRadioDialogsInMainMenu(navDefinitions: NavRadioDefinition): Promise<void> {
    const result = await this.props.uiService
      .openMfdPopup<NavFrequencyDialog>(UiViewStackLayer.Overlay, UiViewKeys.NavFrequencyDialog, true, { popupType: 'slideout-top-full' })
      .ref.request({
        radioIndex: navDefinitions.index,
        initialValue: SimVar.GetSimVarValue(`NAV STANDBY FREQUENCY:${navDefinitions.simIndex}`, SimVarValueType.Hertz)
      });

    if (!result.wasCancelled) {
      SimVar.SetSimVarValue(`K:NAV${navDefinitions.simIndex}_STBY_SET_HZ`, SimVarValueType.Number, result.payload.frequency);

      if (result.payload.transfer) {
        SimVar.SetSimVarValue(`K:NAV${navDefinitions.simIndex}_RADIO_SWAP`, SimVarValueType.Number, 0);
      }
    }
  }

  /**
   * Renders this menu's buttons into an array.
   * @returns This menu's buttons, as an array of VNodes.
   */
  private renderButtons(): VNode[] {
    // TODO: exclude certain buttons based on configuration.

    return [
      <UiImgTouchButton
        label='Emergency'
        class='ui-directory-button'
        isEnabled={false}
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_emergency.png`}
      />,
      (
        this.props.config.autopilot
          ? (
            < UiImgTouchButton
              label={'Flight\nControls'}
              imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_flight_controls.png`}
              onPressed={() => {
                this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.AfcsControlsView, true);
              }}
              class='ui-directory-button'
            />
          )
          : null
      ),
      (
        this.props.config.radios.comCount >= 1
          ? (
            <UiImgTouchButton
              label={'COM 1\nRadio'}
              class='ui-directory-button'
              imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_com_radio_1.png`}
              onPressed={() => this.openComRadioDialogsInMainMenu(this.props.config.radios.comDefinitions[1])}
            />
          )
          : null
      ),
      (
        this.props.config.radios.comCount >= 2
          ? (
            <UiImgTouchButton
              label={'COM 2\nRadio'}
              class='ui-directory-button'
              imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_com_radio_2.png`}
              onPressed={() => this.openComRadioDialogsInMainMenu(this.props.config.radios.comDefinitions[2])}
            />
          )
          : null
      ),
      (
        this.props.config.radios.navDefinitions[1] !== undefined
          ? (
            <UiImgTouchButton
              label={'NAV 1\nRadio'}
              class='ui-directory-button'
              imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_nav_radio_1.png`}
              onPressed={() => this.openNavRadioDialogsInMainMenu(this.props.config.radios.navDefinitions[1]!)}
            />
          )
          : null
      ),
      (
        this.props.config.radios.navDefinitions[2] !== undefined
          ? (
            <UiImgTouchButton
              label={'NAV 2\nRadio'}
              class='ui-directory-button'
              imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_nav_radio_2.png`}
              onPressed={() => this.openNavRadioDialogsInMainMenu(this.props.config.radios.navDefinitions[2]!)}
            />
          )
          : null
      ),
      (
        this.props.config.audio.audioPanel !== undefined
          ? (
            <UiImgTouchButton
              label={'Audio\nPanel'}
              class='ui-directory-button'
              imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_audio.png`}
              onPressed={() => {
                this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.AudioPopup, false);
              }}
            />
          )
          : null
      ),
      (
        this.props.config.transponder !== undefined
          ? (
            <UiImgTouchButton
              label='XPDR'
              onPressed={() => {
                this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.Transponder, true, { popupType: 'slideout-bottom-full' });
              }}
              class='ui-directory-button'
              imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_xpdr.png`}
            />
          )
          : null
      ),
      <UiImgTouchButton
        label='Flight Log'
        isEnabled={false}
        class='ui-directory-button'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_flight_log.png`}
      />,
      <UiImgTouchButton
        label={'Flight Plan\nList'}
        isEnabled={false}
        class='ui-directory-button'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_fpl_list.png`}
      />,
      <UiImgTouchButton
        label='VNAV'
        class='ui-directory-button'
        isEnabled={false}
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_VNAV.png`}
      />,
      <UiImgTouchButton
        label='Track Log'
        isEnabled={false}
        class='ui-directory-button'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_track_log.png`}
      />,
      <UiImgTouchButton
        label='User Timer'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_small_timers.png`}
        onPressed={() => {
          this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.UserTimer, false);
        }}
        class='ui-directory-button'
      />,
      <UiImgTouchButton
        label={'User\nWaypoints'}
        class='ui-directory-button'
        isEnabled={false}
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_user_waypoint.png`}
      />,
      <UiImgTouchButton
        label={'Weight\n& Balance'}
        class='ui-directory-button'
        isEnabled={false}
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_weight_balance.png`}
      />,
      <UiImgTouchButton
        label='Data Link'
        isEnabled={false}
        class='ui-directory-button'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_data_link.png`}
      />,
      <UiImgTouchButton
        label='Tools'
        class='ui-directory-button'
        isEnabled={false}
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_tools.png`}
      />,
      <UiImgTouchButton
        label='Setup'
        onPressed={() => {
          this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.Setup, false, { popupType: 'slideout-right-full' });
        }}
        class='ui-directory-button'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_setup.png`}
      />,
      <UiImgTouchButton
        label={'Backlight\nIntensity'}
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_display_setup.png`}
        onPressed={() => {
          this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.BacklightIntensityPopup, false);
        }}
        class='ui-directory-button'
      />
    ].filter(node => node !== null);
  }
}

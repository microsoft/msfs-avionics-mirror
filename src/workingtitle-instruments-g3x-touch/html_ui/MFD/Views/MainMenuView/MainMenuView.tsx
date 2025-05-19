import { FSComponent, SimVarValueType, VNode } from '@microsoft/msfs-sdk';

import { AvionicsConfig } from '../../../Shared/AvionicsConfig/AvionicsConfig';
import { UiList } from '../../../Shared/Components/List/UiList';
import { UiListFocusable } from '../../../Shared/Components/List/UiListFocusable';
import { UiImgTouchButton } from '../../../Shared/Components/TouchButton/UiImgTouchButton';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { G3XComRadioDataProvider, G3XNavRadioDataProvider, G3XRadiosDataProvider } from '../../../Shared/Radio/G3XRadiosDataProvider';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiFocusDirection } from '../../../Shared/UiSystem/UiFocusTypes';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { ComFrequencyDialog } from '../ComFrequencyDialog/ComFrequencyDialog';
import { NavFrequencyDialog } from '../NavFrequencyDialog/NavFrequencyDialog';

import './MainMenuView.css';

/**
 * Component props for {@link MainMenuView}.
 */
export interface MainMenuViewProps extends UiViewProps {
  /** The global avionics configuration object. */
  config: AvionicsConfig;

  /** A provider of radios data. */
  radiosDataProvider: G3XRadiosDataProvider;
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
   * Opens the COM radio frequency dialog and changes the standby and/or active frequency of a COM radio based on the
   * dialog result.
   * @param dataProvider A provider of data for the radio for which to open the dialog.
   */
  private async openComFrequencyDialog(dataProvider: G3XComRadioDataProvider): Promise<void> {
    const result = await this.props.uiService
      .openMfdPopup<ComFrequencyDialog>(UiViewStackLayer.Overlay, UiViewKeys.ComFrequencyDialog, true, { popupType: 'slideout-top-full' })
      .ref.request({
        radioIndex: dataProvider.index,
        spacing: dataProvider.frequencySpacing.get(),
        initialValue: dataProvider.standbyFrequency.get() * 1e6
      });

    if (!result.wasCancelled) {
      SimVar.SetSimVarValue(`K:COM${dataProvider.simIndex === 1 ? '' : dataProvider.simIndex}_STBY_RADIO_SET_HZ`, SimVarValueType.Number, result.payload.frequency);
      if (result.payload.transfer) {
        SimVar.SetSimVarValue(`K:COM${dataProvider.simIndex}_RADIO_SWAP`, SimVarValueType.Number, 0);
      }
    }
  }

  /**
   * Opens the NAV radio frequency dialog and changes the standby and/or active frequency of a NAV radio based on the
   * dialog result.
   * @param dataProvider A provider of data for the radio for which to open the dialog.
   */
  private async openNavFrequencyDialog(dataProvider: G3XNavRadioDataProvider): Promise<void> {
    const result = await this.props.uiService
      .openMfdPopup<NavFrequencyDialog>(UiViewStackLayer.Overlay, UiViewKeys.NavFrequencyDialog, true, { popupType: 'slideout-top-full' })
      .ref.request({
        radioIndex: dataProvider.index,
        initialValue: dataProvider.standbyFrequency.get() * 1e6
      });

    if (!result.wasCancelled) {
      SimVar.SetSimVarValue(`K:NAV${dataProvider.simIndex}_STBY_SET_HZ`, SimVarValueType.Number, result.payload.frequency);
      if (result.payload.transfer) {
        SimVar.SetSimVarValue(`K:NAV${dataProvider.simIndex}_RADIO_SWAP`, SimVarValueType.Number, 0);
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
        this.props.radiosDataProvider.comRadioDataProviders[1] !== undefined
          ? (
            <UiImgTouchButton
              label={'COM 1\nRadio'}
              imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_com_radio_1.png`}
              isEnabled={this.props.radiosDataProvider.comRadioDataProviders[1].isPowered}
              onPressed={this.openComFrequencyDialog.bind(this, this.props.radiosDataProvider.comRadioDataProviders[1])}
              class='ui-directory-button'
            />
          )
          : null
      ),
      (
        this.props.radiosDataProvider.comRadioDataProviders[2] !== undefined
          ? (
            <UiImgTouchButton
              label={'COM 2\nRadio'}
              imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_com_radio_2.png`}
              isEnabled={this.props.radiosDataProvider.comRadioDataProviders[2].isPowered}
              onPressed={this.openComFrequencyDialog.bind(this, this.props.radiosDataProvider.comRadioDataProviders[2])}
              class='ui-directory-button'
            />
          )
          : null
      ),
      (
        this.props.radiosDataProvider.navRadioDataProviders[1] !== undefined
          ? (
            <UiImgTouchButton
              label={'NAV 1\nRadio'}
              imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_nav_radio_1.png`}
              isEnabled={this.props.radiosDataProvider.navRadioDataProviders[1].isPowered}
              onPressed={this.openNavFrequencyDialog.bind(this, this.props.radiosDataProvider.navRadioDataProviders[1])}
              class='ui-directory-button'
            />
          )
          : null
      ),
      (
        this.props.radiosDataProvider.navRadioDataProviders[2] !== undefined
          ? (
            <UiImgTouchButton
              label={'NAV 2\nRadio'}
              imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_nav_radio_2.png`}
              isEnabled={this.props.radiosDataProvider.navRadioDataProviders[2].isPowered}
              onPressed={this.openNavFrequencyDialog.bind(this, this.props.radiosDataProvider.navRadioDataProviders[2])}
              class='ui-directory-button'
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

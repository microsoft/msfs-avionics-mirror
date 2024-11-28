import { FSComponent, VNode } from '@microsoft/msfs-sdk';

import { UiList } from '../../../Shared/Components/List/UiList';
import { UiListFocusable } from '../../../Shared/Components/List/UiListFocusable';
import { UiImgTouchButton } from '../../../Shared/Components/TouchButton/UiImgTouchButton';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiFocusDirection } from '../../../Shared/UiSystem/UiFocusTypes';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';

import './SetupView.css';

/**
 * A setup menu.
 */
export class SetupView extends AbstractUiView {
  private readonly listRef = FSComponent.createRef<UiList<any>>();

  private readonly listItemLengthPx = this.props.uiService.gduFormat === '460' ? 160 : 80;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.listRef.instance.knobLabelState.pipe(this._knobLabelState);
    this.listRef.instance.focusFirst(UiFocusDirection.Forward);
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.listRef.instance.onUiInteractionEvent(event);
  }

  /** @inheritDoc */
  public render(): VNode {
    const buttonNodes = this.renderButtons();

    return (
      <div class='setup-view ui-view-generic-bg ui-titled-view'>
        <div class='setup-view-title ui-view-title'>
          <div>Setup</div>
        </div>
        <div class='setup-view-content ui-titled-view-content'>
          <UiList
            ref={this.listRef}
            bus={this.props.uiService.bus}
            validKnobIds={this.props.uiService.validKnobIds}
            listItemLengthPx={this.listItemLengthPx}
            itemsPerPage={4}
            autoDisableOverscroll
            showScrollBar='auto'
            class='setup-view-list'
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
                    <div class='setup-view-row'>
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
   * Renders this menu's buttons into an array.
   * @returns This menu's buttons, as an array of VNodes.
   */
  private renderButtons(): VNode[] {
    // TODO: exclude certain buttons based on configuration.

    return [
      <UiImgTouchButton
        label='Data Bar'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_databar_setup.png`}
        onPressed={() => {
          this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.DataBarSetup, false, { popupType: 'slideout-right-full' });
        }}
        class='ui-directory-button'
      />,
      <UiImgTouchButton
        label='Display'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_display_setup.png`}
        onPressed={() => {
          this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.DisplaySetup, false, { popupType: 'slideout-right-full' });
        }}
        class='ui-directory-button'
      />,
      <UiImgTouchButton
        label='Sound'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_sound_setup.png`}
        onPressed={() => {
          this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.SoundSetup, false, { popupType: 'slideout-right-full' });
        }}
        class='ui-directory-button'
      />,
      <UiImgTouchButton
        label='Units'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_units_setup.png`}
        onPressed={() => {
          this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.UnitsSetup, false, { popupType: 'slideout-right-full' });
        }}
        class='ui-directory-button'
      />,
      <UiImgTouchButton
        label='Time'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_time_setup.png`}
        class='ui-directory-button'
        onPressed={() => {
          this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.TimeSetup, false, { popupType: 'slideout-right-full' });
        }}
      />,
      <UiImgTouchButton
        label='Map'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_map_setup.png`}
        onPressed={() => {
          this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.MapSetup, false, { popupType: 'slideout-bottom-full', backgroundOcclusion: 'hide' });
        }}
        class='ui-directory-button'
      />,
      <UiImgTouchButton
        label='Position'
        isEnabled={false}
        class='ui-directory-button'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_position_setup.png`}
      />,
      <UiImgTouchButton
        label='Alarms'
        isEnabled={false}
        class='ui-directory-button'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_alarms_setup.png`}
      />,
      <UiImgTouchButton
        label='Airspace'
        isEnabled={false}
        class='ui-directory-button'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_airspace_setup.png`}
      />,
      <UiImgTouchButton
        label='Bluetooth'
        isEnabled={false}
        class='ui-directory-button'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_bluetooth_setup.png`}
      />,
      <UiImgTouchButton
        label='PFD'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_pfd_setup.png`}
        onPressed={() => {
          this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.PfdSetup, false, { popupType: 'slideout-right-full' });
        }}
        class='ui-directory-button'
      />,
      <UiImgTouchButton
        label='Autopilot'
        isEnabled={false}
        class='ui-directory-button'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_autopilot_setup.png`}
      />,
      <UiImgTouchButton
        label={'Flight\nDirector'}
        isEnabled={false}
        class='ui-directory-button'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_flight_director_setup.png`}
      />,
      <UiImgTouchButton
        label='Trim'
        isEnabled={false}
        class='ui-directory-button'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_trim_setup.png`}
      />,
      <UiImgTouchButton
        label='Navigation'
        isEnabled={false}
        class='ui-directory-button'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_navigation_setup.png`}
      />,
      <UiImgTouchButton
        label='Keyboard'
        isEnabled={false}
        class='ui-directory-button'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_keyboard_setup.png`}
      />,
    ];
  }

  /** @inheritDoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    super.destroy();
  }
}

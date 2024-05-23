import { FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { TrafficAltitudeModeSetting } from '@microsoft/msfs-garminsdk';

import { UiToggleTouchButton } from '../../../../Shared/Components/TouchButton/UiToggleTouchButton';
import { UiTouchButton } from '../../../../Shared/Components/TouchButton/UiTouchButton';
import { UiValueTouchButton } from '../../../../Shared/Components/TouchButton/UiValueTouchButton';
import { G3XTouchFilePaths } from '../../../../Shared/G3XTouchFilePaths';
import { G3XTrafficUserSettings } from '../../../../Shared/Settings/G3XTrafficUserSettings';
import { AbstractUiView } from '../../../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent } from '../../../../Shared/UiSystem/UiInteraction';
import { UiViewKeys } from '../../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../../Shared/UiSystem/UiViewTypes';
import { UiListSelectTouchButton } from '../../../Components/TouchButton/UiListSelectTouchButton';

import './MfdTrafficOptionsPopup.css';

/**
 * An MFD traffic options menu.
 */
export class MfdTrafficOptionsPopup extends AbstractUiView {
  private thisNode?: VNode;

  private readonly trafficSettingManager = G3XTrafficUserSettings.getManager(this.props.uiService.bus);

  private readonly selectionListItemHeight = this.props.uiService.gduFormat ? 78 : 40;
  private readonly selectionListItemSpacing = this.props.uiService.gduFormat ? 2 : 1;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.focusController.setActive(true);

    this.focusController.knobLabelState.pipe(this._knobLabelState);
  }

  /** @inheritdoc */
  public onResume(): void {
    this.focusController.focusRecent();
  }

  /** @inheritdoc */
  public onPause(): void {
    this.focusController.removeFocus();
  }

  /** @inheritdoc */
  public onClose(): void {
    this.focusController.clearRecentFocus();
  }

  /** @inheritdoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    if (event === UiInteractionEvent.MenuPress) {
      this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.MainMenu, true, {
        popupType: 'slideout-bottom-full',
        backgroundOcclusion: 'hide'
      });
      return true;
    }

    return this.focusController.onUiInteractionEvent(event);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='mfd-traffic-options-popup ui-view-panel'>
        <div class='mfd-traffic-options-popup-title'>Traffic Options</div>
        <div class='mfd-traffic-options-popup-main'>
          <div class='mfd-traffic-options-popup-row'>
            <UiTouchButton
              label='More Info...'
              isEnabled={false}
              focusController={this.focusController}
            />
            <UiToggleTouchButton
              label={'Target\nIdentifiers'}
              state={Subject.create(false)}
              isEnabled={false}
              focusController={this.focusController}
            />
            <UiToggleTouchButton
              label={'Target\nTrend'}
              state={Subject.create(false)}
              isEnabled={false}
              focusController={this.focusController}
            />
          </div>
          <div class='mfd-traffic-options-popup-row'>
            <UiValueTouchButton
              label={'Alerts'}
              state={Subject.create(true)}
              renderValue={isEnabled => isEnabled ? 'Enabled' : 'Disabled'}
              isEnabled={false}
              focusController={this.focusController}
              class='ui-list-select-button ui-list-select-button-no-dropdown'
            />
            <UiListSelectTouchButton
              uiService={this.props.uiService}
              listDialogLayer={UiViewStackLayer.Overlay}
              listDialogKey={UiViewKeys.ListDialog1}
              openDialogAsPositioned
              containerRef={this.props.containerRef}
              label={'Altitude Filter'}
              state={this.trafficSettingManager.getSetting('trafficAltitudeMode')}
              renderValue={mode => {
                switch (mode) {
                  case TrafficAltitudeModeSetting.Normal:
                    return 'Normal';
                  case TrafficAltitudeModeSetting.Above:
                    return 'Above';
                  case TrafficAltitudeModeSetting.Below:
                    return 'Below';
                  case TrafficAltitudeModeSetting.Unrestricted:
                    return 'Unrestricted';
                  default:
                    return '';
                }
              }}
              listParams={{
                selectedValue: this.trafficSettingManager.getSetting('trafficAltitudeMode'),
                inputData: [
                  {
                    value: TrafficAltitudeModeSetting.Unrestricted,
                    labelRenderer: () => 'Unrestricted'
                  },
                  {
                    value: TrafficAltitudeModeSetting.Normal,
                    labelRenderer: () => 'Normal'
                  },
                  {
                    value: TrafficAltitudeModeSetting.Above,
                    labelRenderer: () => 'Above'
                  },
                  {
                    value: TrafficAltitudeModeSetting.Below,
                    labelRenderer: () => 'Below'
                  }
                ],
                listItemHeightPx: this.selectionListItemHeight,
                listItemSpacingPx: this.selectionListItemSpacing,
                itemsPerPage: 4,
                autoDisableOverscroll: true,
                class: 'mfd-traffic-options-popup-list-dialog'
              }}
              focusController={this.focusController}
              hideDropdownArrow
            />
          </div>
        </div>
        <div class='mfd-traffic-options-popup-main-menu-msg'>
          <img src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_menu_button.png`} class='mfd-traffic-options-popup-main-menu-icon' /> for Main Menu
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}
import { FSComponent, VNode } from '@microsoft/msfs-sdk';

import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';

import './NoOptionsPopup.css';

/**
 * A popup that displays a "No Options" notification and allows navigation to the Main Menu by pressing the MENU
 * key.
 */
export class NoOptionsPopup extends AbstractUiView {
  /** @inheritDoc */
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

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='no-options-popup ui-view-panel'>
        <div class='no-options-popup-main'>No Options</div>
        <div class='no-options-popup-main-menu-msg'>
          <img src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_menu_button.png`} class='no-options-popup-main-menu-icon' /> for Main Menu
        </div>
      </div>
    );
  }
}
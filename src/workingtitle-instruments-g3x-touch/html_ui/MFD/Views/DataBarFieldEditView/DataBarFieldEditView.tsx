/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { FSComponent, Subscription, VNode, Wait } from '@microsoft/msfs-sdk';

import { TouchButtonOnTouchedAction } from '@microsoft/msfs-garminsdk';

import { G3XNavDataBarEditController } from '../../../Shared/Components/CnsDataBar/CnsDataBarFields/G3XNavDataBarEditController';
import { TouchButton } from '../../../Shared/Components/TouchButton/TouchButton';
import { CnsDataBarUserSettings } from '../../../Shared/Settings/CnsDataBarUserSettings';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { DataBarFieldSelectDialog } from './DataBarFieldSelectDialog';

import './DataBarFieldEditView.css';

/**
 * Component props for DataBarFieldEditView.
 */
export interface DataBarFieldEditViewProps extends UiViewProps {
  /** A controller for editing CNS data bar fields. */
  navDataBarEditController: G3XNavDataBarEditController;
}

/**
 * A CNS data bar field editing menu.
 */
export class DataBarFieldEditView extends AbstractUiView<DataBarFieldEditViewProps> {
  private readonly buttonRef = FSComponent.createRef<TouchButton>();

  private readonly dataBarSettingManager = CnsDataBarUserSettings.getManager(this.props.uiService.bus);

  private editingIndexSub?: Subscription;

  private isOpen = false;
  private isAwaitingDialogOpen = false;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.editingIndexSub = this.props.navDataBarEditController.editingIndex.sub(this.onEditingIndexChanged.bind(this), false, true);
  }

  /** @inheritdoc */
  public onOpen(): void {
    this.isOpen = true;
    this.props.navDataBarEditController.activateEditing();
    this.editingIndexSub!.resume();
  }

  /** @inheritdoc */
  public onClose(): void {
    this.isOpen = false;
    this.editingIndexSub!.pause();
    this.props.navDataBarEditController.deactivateEditing();
  }

  /**
   * Responds to when the index of the data field being edited changes while this view is resumed.
   * @param index The index of the new data field being edited, or `-1` if no data field is being edited.
   */
  private async onEditingIndexChanged(index: number): Promise<void> {
    if (index < 0 || this.isAwaitingDialogOpen) {
      return;
    }

    const wasClosed = this.props.uiService.closeMfdPopup(popup => popup.key === UiViewKeys.DataBarFieldSelectDialog);

    // If we closed the selection dialog, then wait a short delay to let the closing animation play before re-opening
    // the dialog.
    if (wasClosed) {
      this.isAwaitingDialogOpen = true;
      await Wait.awaitDelay(250);
      this.isAwaitingDialogOpen = false;

      if (!this.isOpen) {
        return;
      }

      index = this.props.navDataBarEditController.editingIndex.get();

      if (index < 0) {
        return;
      }
    }

    const setting = this.dataBarSettingManager.getSetting(`navDataBarField${index}`);

    const result = await this.props.uiService
      .openMfdPopup<DataBarFieldSelectDialog>(UiViewStackLayer.Overlay, UiViewKeys.DataBarFieldSelectDialog)
      .ref.request({ initialValue: setting.value });

    if (!result.wasCancelled) {
      setting.value = result.payload;
      this.props.navDataBarEditController.setEditingIndex(-1);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <TouchButton
        ref={this.buttonRef}
        label={'Touch data bar field to change.\nTouch this page or press BACK to exit.'}
        onTouched={() => TouchButtonOnTouchedAction.Press}
        onPressed={() => { this.props.uiService.goBackMfd(); }}
        class='data-bar-field-edit-view'
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.buttonRef.getOrDefault()?.destroy();

    this.editingIndexSub?.destroy();

    super.destroy();
  }
}
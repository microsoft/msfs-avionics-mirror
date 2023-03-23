import { AuxPage } from '../AuxPages';
import { ComSpacing, FocusPosition, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { GeneralUserSettingsManager } from '../../../../Settings/GeneralSettingsProvider';
import { SelectableText } from '../../../Controls/SelectableText';
import { GNSUiControl } from '../../../GNSUiControl';
import { OptionDialog } from '../../../Controls/OptionDialog';

import './ComConfiguration.css';

const COM_FREQUENCY_SPACING_NAME_LIST = {
  [ComSpacing.Spacing833Khz]: '8.33 kHz',
  [ComSpacing.Spacing25Khz]: '25.0 kHz',
};

/**
 * COM CONFIGURATION page
 */
export class ComConfiguration extends AuxPage {
  private readonly scrollContainerRef = FSComponent.createRef<GNSUiControl>();

  private readonly dialogRef = FSComponent.createRef<OptionDialog>();

  private readonly generalSettings = GeneralUserSettingsManager.getManager(this.props.bus);

  private readonly comFrequencySpacingSetting = this.generalSettings.getSetting('com_frequency_spacing');

  /**
   * handles opening the popup
   *
   * @returns true
   */
  private handleOpenPopup(): boolean {
    this.scrollContainerRef.instance.blur();
    this.dialogRef.instance.openPopout(0);
    this.dialogRef.instance.focus(FocusPosition.First);
    return true;
  }

  /**
   * handles opening the popup
   *
   * @returns true
   */
  private handleClosePopup(): boolean {
    this.dialogRef.instance.closePopout();
    this.dialogRef.instance.blur();
    this.scrollContainerRef.instance.focus(FocusPosition.First);
    return true;
  }

  /**
   * Handles changing the COM spacing mode using the dialog
   *
   * @param mode the new mode to set
   */
  private handleModeChange(mode: ComSpacing): void {
    this.comFrequencySpacingSetting.set(mode);

    this.handleClosePopup();
  }

  /** @inheritDoc */
  onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.dialogRef.instance.setItems(Object.values(COM_FREQUENCY_SPACING_NAME_LIST));
  }

  /** @inheritDoc */
  render(): VNode {
    return (
      <div class="page aux-page hide-element" ref={this.el}>
        <div class='aux-page-header'>
        </div>
        <div class='aux-table-header'>
          COM CONFIGURATION
        </div>

        <div class="com-configuration-container">
          <div class="com-configuration-side-title cyan">CHANNEL SPACING</div>
          <div class="aux-table com-configuration-table">
            <GNSUiControl ref={this.scrollContainerRef} isolateScroll>
              <SelectableText
                class="aux-entry com-configuration-spacing"
                data={this.comFrequencySpacingSetting.map((it) => COM_FREQUENCY_SPACING_NAME_LIST[it])}
                onRightInnerInc={this.handleOpenPopup.bind(this)}
                onRightInnerDec={this.handleOpenPopup.bind(this)}
              />
            </GNSUiControl>
            <OptionDialog
              ref={this.dialogRef}
              class="com-configuration-dialog"
              label="SPACING"
              onSelected={(index): void => this.handleModeChange(index === 1 ? ComSpacing.Spacing833Khz : ComSpacing.Spacing25Khz)}
            />
          </div>
        </div>
      </div>
    );
  }
}
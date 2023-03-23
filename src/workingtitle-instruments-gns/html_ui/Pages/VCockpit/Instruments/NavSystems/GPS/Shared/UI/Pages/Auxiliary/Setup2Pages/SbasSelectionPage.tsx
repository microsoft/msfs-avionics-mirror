import { FocusPosition, FSComponent, NodeReference, UserSetting, VNode } from '@microsoft/msfs-sdk';

import { OptionDialog } from '../../../Controls/OptionDialog';
import { SelectableText } from '../../../Controls/SelectableText';
import { GNSUiControl } from '../../../GNSUiControl';
import { AuxPage } from '../AuxPages';

import './SbasSelectionPage.css';

/**
 * An aux page that allows the user to select SBAS groups.
 */
export class SbasSelectionPage extends AuxPage {
  private readonly rootControl = FSComponent.createRef<GNSUiControl>();
  private readonly waasDialogRef = FSComponent.createRef<OptionDialog>();
  private readonly egnosDialogRef = FSComponent.createRef<OptionDialog>();
  private readonly gaganDialogRef = FSComponent.createRef<OptionDialog>();
  private readonly msasDialogRef = FSComponent.createRef<OptionDialog>();
  private readonly gpsSettings = this.props.settingsProvider.gps;

  private currentSetting = this.gpsSettings.getSetting('sbas_waas_enabled');

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.waasDialogRef.instance.setDisabled(true);
    this.egnosDialogRef.instance.setDisabled(true);
    this.gaganDialogRef.instance.setDisabled(true);
    this.msasDialogRef.instance.setDisabled(true);
  }

  /**
   * Opens the option setting popup.
   * @param setting The setting to set.
   * @param dialog The dialog to open.
   * @returns True.
   */
  private openPopup(setting: UserSetting<boolean>, dialog: NodeReference<OptionDialog>): boolean {
    this.rootControl.instance.blur();
    dialog.instance.setDisabled(false);

    dialog.instance.setItems(['Off', 'On'], false);
    dialog.instance.openPopout(setting.get() ? 1 : 0);

    this.currentSetting = setting;
    return true;
  }

  /**
   * Closes the option setting popup.
   * @param dialog The dialog to close.
   */
  private onDialogClosed(dialog: NodeReference<OptionDialog>): void {
    dialog.instance.setDisabled(true);
    this.rootControl.instance.focus(FocusPosition.MostRecent);
  }

  /**
   * Handles when an option is selected in an option menu.
   * @param index The index that was selected.
   * @param dialog The dialog to close.
   */
  private onOptionSelected(index: number, dialog: NodeReference<OptionDialog>): void {
    this.currentSetting.set(index === 0 ? false : true);
    this.onDialogClosed(dialog);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="page aux-page hide-element" ref={this.el}>
        <div class='aux-page-header'>
        </div>
        <div class='aux-table-header'>
          SBAS SELECTION
        </div>

        <div class="sbas-selection-page">
          <div>
            <div class='sbas-selection-label'>WAAS</div>
            <div class='sbas-selection-label'>EGNOS</div>
            <div class='sbas-selection-label'>GAGAN</div>
            <div class='sbas-selection-label'>MSAS</div>
          </div>
          <div>
            <GNSUiControl ref={this.rootControl} isolateScroll>
              <div class='sbas-selection-selector'>
                <SelectableText
                  class='aux-entry'
                  data={this.gpsSettings.getSetting('sbas_waas_enabled').map(e => e ? 'On' : 'Off')}
                  onRightInnerInc={() => this.openPopup(this.gpsSettings.getSetting('sbas_waas_enabled'), this.waasDialogRef)}
                  onRightInnerDec={() => this.openPopup(this.gpsSettings.getSetting('sbas_waas_enabled'), this.waasDialogRef)}
                />
                <OptionDialog
                  ref={this.waasDialogRef}
                  class="sbas-configuration-dialog"
                  label="ENABLED"
                  onSelected={index => this.onOptionSelected(index, this.waasDialogRef)}
                  onClosed={() => this.onDialogClosed(this.waasDialogRef)}
                  isolateScroll
                />
              </div>
              <div class='sbas-selection-selector'>
                <SelectableText
                  class='aux-entry'
                  data={this.gpsSettings.getSetting('sbas_egnos_enabled').map(e => e ? 'On' : 'Off')}
                  onRightInnerInc={() => this.openPopup(this.gpsSettings.getSetting('sbas_egnos_enabled'), this.egnosDialogRef)}
                  onRightInnerDec={() => this.openPopup(this.gpsSettings.getSetting('sbas_egnos_enabled'), this.egnosDialogRef)}
                />
                <OptionDialog
                  ref={this.egnosDialogRef}
                  class="sbas-configuration-dialog"
                  label="ENABLED"
                  onSelected={index => this.onOptionSelected(index, this.egnosDialogRef)}
                  onClosed={() => this.onDialogClosed(this.egnosDialogRef)}
                  isolateScroll
                />
              </div>
              <div class='sbas-selection-selector'>
                <SelectableText
                  class='aux-entry'
                  data={this.gpsSettings.getSetting('sbas_gagan_enabled').map(e => e ? 'On' : 'Off')}
                  onRightInnerInc={() => this.openPopup(this.gpsSettings.getSetting('sbas_gagan_enabled'), this.gaganDialogRef)}
                  onRightInnerDec={() => this.openPopup(this.gpsSettings.getSetting('sbas_gagan_enabled'), this.gaganDialogRef)}
                />
                <OptionDialog
                  ref={this.gaganDialogRef}
                  class="sbas-configuration-dialog"
                  label="ENABLED"
                  onSelected={index => this.onOptionSelected(index, this.gaganDialogRef)}
                  onClosed={() => this.onDialogClosed(this.gaganDialogRef)}
                  isolateScroll
                />
              </div>
              <div class='sbas-selection-selector'>
                <SelectableText
                  class='aux-entry'
                  data={this.gpsSettings.getSetting('sbas_msas_enabled').map(e => e ? 'On' : 'Off')}
                  onRightInnerInc={() => this.openPopup(this.gpsSettings.getSetting('sbas_msas_enabled'), this.msasDialogRef)}
                  onRightInnerDec={() => this.openPopup(this.gpsSettings.getSetting('sbas_msas_enabled'), this.msasDialogRef)}
                />
                <OptionDialog
                  ref={this.msasDialogRef}
                  class="sbas-configuration-dialog"
                  label="ENABLED"
                  onSelected={index => this.onOptionSelected(index, this.msasDialogRef)}
                  onClosed={() => this.onDialogClosed(this.msasDialogRef)}
                  isolateScroll
                />
              </div>
            </GNSUiControl>
          </div>
        </div>
      </div>
    );
  }
}
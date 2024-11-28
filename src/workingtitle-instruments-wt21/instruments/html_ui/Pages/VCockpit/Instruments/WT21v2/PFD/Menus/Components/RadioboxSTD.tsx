/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FSComponent, SimVarValueType, Subject } from '@microsoft/msfs-sdk';

import { PFDUserSettings, RadioBoxNumeric } from '@microsoft/msfs-wt21-shared';

/**
 * The RadioBoxNumeric component.
 */
export class RadioBoxSTD extends RadioBoxNumeric {

  protected readonly pfdSettingsManager = PFDUserSettings.getManager(this.props.bus!);
  protected readonly el = FSComponent.createRef<HTMLDivElement>();
  protected readonly isChecked = Subject.create(false);
  protected readonly inputRef = FSComponent.createRef<HTMLInputElement>();
  protected readonly checkOnChange = Subject.create(this.props.checkOnChange !== undefined ? this.props.checkOnChange : true);
  protected unitHpa = this.pfdSettingsManager.getSetting('pressureUnitHPA').value;
  protected baroStd = false;
  protected readonly label = Subject.create('');

  /** @inheritdoc */
  public onUpperKnobPush(): boolean {
    if (this.isDisabled === false) {
      if (this.props.selectedIndex.get() != this.props.index) {
        SimVar.SetSimVarValue('L:XMLVAR_Baro1_ForcedToSTD', 'Bool', true);
        SimVar.SetSimVarValue('L:XMLVAR_Baro1_SavedPressure', SimVarValueType.Number, SimVar.GetSimVarValue('KOHLSMAN SETTING HG:1', SimVarValueType.MB) * 16);
        SimVar.SetSimVarValue('K:KOHLSMAN_SET', SimVarValueType.MB, 1013.25 * 16);
        this.props.selectedIndex.set(this.props.index);
      }
    }
    return true;
  }
}

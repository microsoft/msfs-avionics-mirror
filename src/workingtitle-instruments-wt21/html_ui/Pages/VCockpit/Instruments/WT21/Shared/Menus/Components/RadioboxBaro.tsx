/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AdcEvents, FSComponent, SimVarValueType, Subject, UnitType, VNode } from '@microsoft/msfs-sdk';

import { PFDUserSettings } from '../../../PFD/PFDUserSettings';
import { RadioBoxNumeric } from './RadioboxNumeric';

/**
 * The RadioBoxNumeric component.
 */
export class RadioBoxBaro extends RadioBoxNumeric {

  protected readonly pfdSettingsManager = PFDUserSettings.getManager(this.props.bus!);
  protected readonly el = FSComponent.createRef<HTMLDivElement>();
  protected readonly isChecked = Subject.create(false);
  protected readonly inputRef = FSComponent.createRef<HTMLInputElement>();
  protected readonly checkOnChange = Subject.create(this.props.checkOnChange !== undefined ? this.props.checkOnChange : true);
  protected unitHpa = this.pfdSettingsManager.getSetting('pressureUnitHPA').value;
  protected baroStd = false;
  protected readonly label = Subject.create('');

  /** @inheritdoc */
  public onUpperKnobInc(): boolean {
    if (this.isDisabled === false && this.props.dataRef) {
      this.updateBaro(true);
    }
    return true;
  }

  /** @inheritdoc */
  public onUpperKnobDec(): boolean {
    if (this.isDisabled === false && this.props.dataRef) {
      this.updateBaro(false);
    }
    return true;
  }

  /** @inheritdoc */
  public onUpperKnobPush(): boolean {
    if (this.isDisabled === false) {
      if (this.props.selectedIndex.get() != this.props.index) {
        SimVar.SetSimVarValue('L:XMLVAR_Baro1_ForcedToSTD', 'Bool', false);
        SimVar.SetSimVarValue('K:KOHLSMAN_SET', SimVarValueType.Number, SimVar.GetSimVarValue('L:XMLVAR_Baro1_SavedPressure', SimVarValueType.Number));
        this.props.selectedIndex.set(this.props.index);
      }
    }
    return true;
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this.pfdSettingsManager.whenSettingChanged('pressureUnitHPA').handle(v => {
      this.unitHpa = v;
      this.updateLabel();
    });

    this.props.bus?.getSubscriber<AdcEvents>().on('altimeter_baro_is_std_1').handle(v => this.baroStd = v);

    this.props.dataRef?.sub(() => this.updateLabel());
    this.updateLabel();
  }

  /**
   * Updates the correct SimVar.
   * @param increase Whether the Simvar should be increased or not
   */
  public updateBaro(increase = true): void {
    const inc = this.unitHpa ? 0.02953 : 0.01;
    const value = increase === true ? this.props.dataRef!.get() + inc : this.props.dataRef!.get() - inc;
    if (this.baroStd) {
      SimVar.SetSimVarValue('L:XMLVAR_Baro1_SavedPressure', SimVarValueType.Number, value / 0.02953 * 16);
    } else {
      SimVar.SetSimVarValue('K:KOHLSMAN_SET', SimVarValueType.MB, value / 0.02953 * 16);
    }
  }

  /**
   * Updates the label.
   */
  public updateLabel(): void {
    if (this.unitHpa) {
      this.label.set(Math.round(UnitType.IN_HG.convertTo(this.props.dataRef!.get(), UnitType.HPA)) + ' HPA');
    } else {
      this.label.set((Math.round(this.props.dataRef!.get() * 100) / 100).toFixed(2) + ' IN');
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <label class="popup-menu-line radio-label radio-select" ref={this.el}>
        <input type="radio" class="radio-input" name={this.props.name} ref={this.inputRef} />
        <div class="radio-design">
          <svg height="16" width="16" viewBox="0 0 14 14">
            <line x1="0" x2="14" y1="0" y2="14" stroke="var(--wt21-colors-white)" stroke-width="2" />
            <line x1="0" x2="14" y1="14" y2="0" stroke="var(--wt21-colors-white)" stroke-width="2" />
          </svg>
        </div>
        <div class="radio-text">
          {this.label}
        </div>
      </label>
    );
  }
}
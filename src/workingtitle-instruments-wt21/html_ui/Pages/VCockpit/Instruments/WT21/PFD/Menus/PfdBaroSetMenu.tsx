import { AdcEvents, EventBus, FSComponent, SimVarValueType, Subject, VNode } from '@microsoft/msfs-sdk';

import { PopupMenuSection } from '../../Shared/Menus/Components/PopupMenuSection';
import { PopupSubMenu } from '../../Shared/Menus/Components/PopupSubMenu';
import { RadioBoxBaro } from '../../Shared/Menus/Components/RadioboxBaro';
import { RadioBoxSTD } from '../../Shared/Menus/Components/RadioboxSTD';
import { GuiDialog, GuiDialogProps } from '../../Shared/UI/GuiDialog';

/** @inheritdoc */
interface PfdBaroSetMenuProps extends GuiDialogProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/**
 * The PfdMenu component.
 */
export class PfdBaroSetMenu extends GuiDialog<PfdBaroSetMenuProps> {
  private baroSTD = false;
  private baroSetting = SimVar.GetSimVarValue('KOHLSMAN SETTING HG:1', SimVarValueType.InHG);
  private baroPreset = SimVar.GetSimVarValue('L:XMLVAR_Baro1_SavedPressure', SimVarValueType.Number) * 0.02953 / 16;
  private readonly baroSelectedIndex = Subject.create(SimVar.GetSimVarValue('L:XMLVAR_Baro1_ForcedToSTD', SimVarValueType.Bool) ? 1 : 0);
  private readonly baroValue = Subject.create(this.baroSetting);


  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    const adc = this.props.bus?.getSubscriber<AdcEvents>();

    adc?.on('altimeter_baro_is_std_1')
      .whenChanged()
      .handle(b => {
        this.baroSTD = b;
        this.baroSelectedIndex.set(b ? 1 : 0);
        this.updateValue();
      });

    adc?.on('altimeter_baro_setting_inhg_1')
      .withPrecision(2)
      .handle(v => {
        this.baroSetting = v;
        this.updateValue();
      });

    adc?.on('altimeter_baro_preselect_inhg_1')
      .withPrecision(2)
      .handle(v => {
        this.baroPreset = v;
        this.updateValue();
      });
  }

  /** @inheritdoc */
  public updateValue(): boolean {
    this.baroValue.set(this.baroSTD ? this.baroPreset : this.baroSetting);
    return true;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <PopupSubMenu label='PFD MENU' sublabel='BARO SET' class="pfd-popup-menu-baroset">
          <PopupMenuSection>
            <RadioBoxBaro label="" index={0} selectedIndex={this.baroSelectedIndex} dataRef={this.baroValue} bus={this.props.bus} />
            <RadioBoxSTD label="STD" index={1} selectedIndex={this.baroSelectedIndex} />
          </PopupMenuSection>
        </PopupSubMenu>
      </>
    );
  }
}
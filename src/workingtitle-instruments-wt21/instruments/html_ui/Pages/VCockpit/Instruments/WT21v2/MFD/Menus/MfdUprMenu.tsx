/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EventBus, FSComponent, Subject, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { GuiDialog, GuiDialogProps, MFDSettingsAliased, PopupMenu, PopupMenuSection, RadioBox, RadioList } from '@microsoft/msfs-wt21-shared';

/** @inheritdoc */
interface MfdUprMenuProps extends GuiDialogProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The mfd setting manager */
  mfdSettingManager: UserSettingManager<MFDSettingsAliased>;
}

/** The MfdUprMenu component. */
export class MfdUprMenu extends GuiDialog<MfdUprMenuProps> {
  private readonly mfdUpperWindowStateSetting = this.props.mfdSettingManager.getSetting('mfdUpperWindowState');

  private readonly formatOption = Subject.create<number>(1);

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.props.mfdSettingManager.whenSettingChanged('mfdUpperWindowState').handle(state => { this.formatOption.set(state); });

    this.formatOption.sub(option => {
      this.mfdUpperWindowStateSetting.value = option;
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <PopupMenu label='UPR MENU' class="mfd-upr-popup-menu">
          <PopupMenuSection label='FORMAT'>
            <RadioList dataRef={this.formatOption}>
              <RadioBox name="upr-format" label='OFF'></RadioBox>
              <RadioBox name="upr-format" label='FMS TEXT'></RadioBox>
              <RadioBox name="upr-format" label='CHECKLIST' enabled={false}></RadioBox>
              <RadioBox name="upr-format" label='PASS BRIEF' enabled={false}></RadioBox>
              <RadioBox name="upr-format" label='SYSTEMS 1/2'></RadioBox>
            </RadioList>
          </PopupMenuSection>
        </PopupMenu>
      </>
    );
  }
}

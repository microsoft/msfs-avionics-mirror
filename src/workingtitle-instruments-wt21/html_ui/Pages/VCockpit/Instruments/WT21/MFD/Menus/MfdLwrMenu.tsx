/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ArraySubject, EventBus, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { MapUserSettings } from '../../Shared/Map/MapUserSettings';
import { CheckBox } from '../../Shared/Menus/Components/Checkbox';
import { PopupMenu } from '../../Shared/Menus/Components/PopupMenu';
import { PopupMenuSection } from '../../Shared/Menus/Components/PopupMenuSection';
import { RadioBox } from '../../Shared/Menus/Components/Radiobox';
import { RadioList } from '../../Shared/Menus/Components/RadioList';
import { SelectInput } from '../../Shared/Menus/Components/SelectInput';
import { SubmenuLink } from '../../Shared/Menus/Components/SubmenuLink';
import { GuiDialog, GuiDialogProps } from '../../Shared/UI/GuiDialog';

/** @inheritdoc */
interface MfdLwrMenuProps extends GuiDialogProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/** The MfdLwrMenu component. */
export class MfdLwrMenu extends GuiDialog<MfdLwrMenuProps> {
  private readonly formatOption = Subject.create(0);
  private readonly mapSrcOption = Subject.create(0);
  private readonly mapSources = ArraySubject.create(['FMS1', 'FMS2']);
  private readonly nexradOption = Subject.create(false);
  private readonly mapSettingsManagerMfd = MapUserSettings.getAliasedManager(this.props.bus, 'MFD');

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.linkFormatSetting();
    this.linkNexradSetting();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkFormatSetting(): void {
    const hsiFormatSetting = this.mapSettingsManagerMfd.getSetting('hsiFormat');
    this.formatOption.sub(x => {
      hsiFormatSetting.value = MapUserSettings.hsiFormatsMFD[x];
    });
    this.mapSettingsManagerMfd.whenSettingChanged('hsiFormat').handle(x => {
      this.formatOption.set(MapUserSettings.hsiFormatsMFD.indexOf(x));
    });
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkNexradSetting(): void {
    const nexradSetting = this.mapSettingsManagerMfd.getSetting('nexradEnabled');
    this.nexradOption.sub(x => {
      nexradSetting.value = x;
    });
    this.mapSettingsManagerMfd.whenSettingChanged('nexradEnabled').handle(x => {
      this.nexradOption.set(x);
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <PopupMenu label='LWR MENU' class="mfd-lwr-popup-menu">
          <PopupMenuSection label='FORMAT'>
            <RadioList dataRef={this.formatOption}>
              <RadioBox name="frmt" label='ROSE'></RadioBox>
              <RadioBox name="frmt" label='ARC'></RadioBox>
              <RadioBox name="frmt" label='PPOS'></RadioBox>
              <RadioBox name="frmt" label='PLAN'></RadioBox>
              <RadioBox name="frmt" label='GWX' enabled={false}></RadioBox>
              <RadioBox name="frmt" label='TCAS'></RadioBox>
            </RadioList>
          </PopupMenuSection>

          <PopupMenuSection label='CONTROLS'>
            <SelectInput label='MAP-SRC' data={this.mapSources} dataRef={this.mapSrcOption} />
            <CheckBox label='NEXRAD' checkedDataRef={this.nexradOption} />
            <SubmenuLink label='OVERLAYS' viewId='MfdLwrOverlaysMenu' viewService={this.props.viewService} />
            <SubmenuLink label='MAP SYMBOLS' viewId='MfdLwrMapSymbolsMenu' viewService={this.props.viewService} />
            <SubmenuLink label='TFR TEXT' viewId='TfrTextMenu' disabled={true} viewService={this.props.viewService} />
            <SubmenuLink label='SYS TEST' viewId='SysTestMenu' disabled={true} viewService={this.props.viewService} />
          </PopupMenuSection>

          <PopupMenuSection>
            <SubmenuLink label='L PFD MENU' viewId='LPFDMenu' disabled={true} viewService={this.props.viewService} />
          </PopupMenuSection>
        </PopupMenu>
      </>
    );
  }
}
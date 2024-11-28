/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ArraySubject, EventBus, FSComponent, Subject, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import {
  CheckBox, GuiDialog, GuiDialogProps, MapSettingsMfdAliased, MapUserSettings, PopupMenu, PopupMenuSection, RadioBox, RadioList, SelectInput, SubmenuLink
} from '@microsoft/msfs-wt21-shared';

/** @inheritdoc */
interface MfdLwrMenuProps extends GuiDialogProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The map user settings */
  mapSettingsManager: UserSettingManager<MapSettingsMfdAliased>
}

/** The MfdLwrMenu component. */
export class MfdLwrMenu extends GuiDialog<MfdLwrMenuProps> {
  private readonly formatOption = Subject.create(0);
  private readonly mapSrcOption = Subject.create(0);
  private readonly mapSources = ArraySubject.create(['FMS1', 'FMS2']);
  private readonly nexradOption = Subject.create(false);

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.linkFormatSetting();
    this.linkNexradSetting();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkFormatSetting(): void {
    const hsiFormatSetting = this.props.mapSettingsManager.getSetting('hsiFormat');
    this.formatOption.sub(x => {
      hsiFormatSetting.value = MapUserSettings.hsiFormatsMFD[x];
    });
    this.props.mapSettingsManager.whenSettingChanged('hsiFormat').handle(x => {
      this.formatOption.set(MapUserSettings.hsiFormatsMFD.indexOf(x));
    });
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkNexradSetting(): void {
    const nexradSetting = this.props.mapSettingsManager.getSetting('nexradEnabled');
    this.nexradOption.sub(x => {
      nexradSetting.value = x;
    });
    this.props.mapSettingsManager.whenSettingChanged('nexradEnabled').handle(x => {
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

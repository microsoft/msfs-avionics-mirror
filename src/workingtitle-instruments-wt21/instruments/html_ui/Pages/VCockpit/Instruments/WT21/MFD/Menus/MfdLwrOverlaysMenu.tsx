/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EventBus, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { GuiDialog, GuiDialogProps, MapUserSettings, PopupMenuSection, PopupSubMenu, RadioBox, RadioList } from '@microsoft/msfs-wt21-shared';

/** @inheritdoc */
interface MfdLwrOverlaysMenuProps extends GuiDialogProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/** The MfdLwrOverlaysMenu component. */
export class MfdLwrOverlaysMenu extends GuiDialog<MfdLwrOverlaysMenuProps> {
  private readonly terwxOption = Subject.create<number>(0);
  private readonly tfcOption = Subject.create<number>(0);
  private readonly mapSettingsManager = MapUserSettings.getAliasedManager(this.props.bus, 'MFD');

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.linkTerrainWxOption();
    this.linkTFCOption();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkTerrainWxOption(): void {
    const terrWxSetting = this.mapSettingsManager.getSetting('terrWxState');
    this.terwxOption.sub(x => {
      terrWxSetting.value = MapUserSettings.terrWxStates[x];
    });
    this.mapSettingsManager.whenSettingChanged('terrWxState').handle(x => {
      this.terwxOption.set(MapUserSettings.terrWxStates.indexOf(x));
    });
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkTFCOption(): void {
    const tfcEnabled = this.mapSettingsManager.getSetting('tfcEnabled');
    this.tfcOption.sub(x => {
      tfcEnabled.value = !!x;
    });
    this.mapSettingsManager.whenSettingChanged('tfcEnabled').handle(x => {
      this.tfcOption.set(x ? 1 : 0);
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <PopupSubMenu label='LWR MENU' sublabel='OVERLAYS' class="mfd-lwr-popup-menu-overlays">
          <PopupMenuSection label='TERR/WX' >
            <RadioList dataRef={this.terwxOption}>
              <RadioBox name="terwx" label='OFF' checked={true}></RadioBox>
              <RadioBox name="terwx" label='TERR'></RadioBox>
              <RadioBox name="terwx" label='WX'></RadioBox>
            </RadioList>
          </PopupMenuSection>
          <PopupMenuSection label='TFC' >
            <RadioList dataRef={this.tfcOption}>
              <RadioBox name="tfc" label='OFF' checked={true}></RadioBox>
              <RadioBox name="tfc" label='ON'></RadioBox>
            </RadioList>
          </PopupMenuSection>
        </PopupSubMenu>
      </>
    );
  }
}

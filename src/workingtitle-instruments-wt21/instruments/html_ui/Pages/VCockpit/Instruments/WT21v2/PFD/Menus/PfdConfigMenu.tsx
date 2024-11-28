import { DefaultUserSettingManager, EventBus, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { GuiDialog, GuiDialogProps, PFDSettings, PFDUserSettings, PopupSubMenu, RadioBox, RadioList } from '@microsoft/msfs-wt21-shared';

/** @inheritdoc */
interface PfdConfigMenuProps extends GuiDialogProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/**
 * The PfdMenu component.
 */
export class PfdConfigMenu extends GuiDialog<PfdConfigMenuProps> {
  private readonly pressureOption = Subject.create<number>(0);
  private readonly fltDirOption = Subject.create<number>(0);
  private readonly metricOption = Subject.create<number>(0);
  private readonly flAlertOption = Subject.create<number>(0);
  private readonly aoaOption = Subject.create<number>(0);
  private pfdSettingsManager!: DefaultUserSettingManager<PFDSettings>;

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.pfdSettingsManager = PFDUserSettings.getManager(this.props.bus);
    this.linkPressureOption();
    this.linkAOASetting();
    this.linkFDStyle();
    this.linkMetricSetting();
    this.linkFlAlertSetting();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkPressureOption(): void {
    const fltDirStyle = this.pfdSettingsManager.getSetting('pressureUnitHPA');
    this.pressureOption.sub(x => {
      fltDirStyle.value = !!x;
    });
    this.pfdSettingsManager.whenSettingChanged('pressureUnitHPA').handle(x => {
      this.pressureOption.set(x ? 1 : 0);
    });
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkAOASetting(): void {
    const aoaFormatSetting = this.pfdSettingsManager.getSetting('aoaFormat');
    this.aoaOption.sub(x => {
      aoaFormatSetting.value = PFDUserSettings.aoaFormatOptions[x];
    });
    this.pfdSettingsManager.whenSettingChanged('aoaFormat').handle(x => {
      this.aoaOption.set(PFDUserSettings.aoaFormatOptions.indexOf(x));
    });
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkFDStyle(): void {
    const fltDirStyle = this.pfdSettingsManager.getSetting('fltDirStyle');
    this.fltDirOption.sub(x => {
      fltDirStyle.value = !!x;
    });
    this.pfdSettingsManager.whenSettingChanged('fltDirStyle').handle(x => {
      this.fltDirOption.set(x ? 1 : 0);
    });
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkMetricSetting(): void {
    const metricSetting = this.pfdSettingsManager.getSetting('altMetric');
    this.metricOption.sub(x => {
      metricSetting.value = !!x;
    });
    this.pfdSettingsManager.whenSettingChanged('altMetric').handle(x => {
      this.metricOption.set(x ? 1 : 0);
    });
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkFlAlertSetting(): void {
    const flAlertSetting = this.pfdSettingsManager.getSetting('flightLevelAlert');
    this.flAlertOption.sub(x => {
      flAlertSetting.value = !!x;
    });
    this.pfdSettingsManager.whenSettingChanged('flightLevelAlert').handle(x => {
      this.flAlertOption.set(x ? 1 : 0);
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <PopupSubMenu label='PFD MENU' sublabel='CONFIG' class="pfd-popup-menu-config">
          <RadioList label='PRESSURE' inline={true} dataRef={this.pressureOption}>
            <RadioBox name="press" label='IN' checked={true}></RadioBox>
            <RadioBox name="press" label='HPA'></RadioBox>
          </RadioList>
          <RadioList label='FLT DIR' inline={true} dataRef={this.fltDirOption}>
            <RadioBox name="flt" label='V-BAR' checked={true}></RadioBox>
            <RadioBox name="flt" label='X-PTR'></RadioBox>
          </RadioList>
          <RadioList label='METRIC ALT' inline={true} dataRef={this.metricOption}>
            <RadioBox name="mtrs" label='OFF' checked={true}></RadioBox>
            <RadioBox name="mtrs" label='ON'></RadioBox>
          </RadioList>
          <RadioList label='FL ALERT' inline={true} dataRef={this.flAlertOption}>
            <RadioBox name="fla" label='OFF'></RadioBox>
            <RadioBox name="fla" label='ON' checked={true}></RadioBox>
          </RadioList>
          <RadioList label='AOA DISPLAY' inline={true} dataRef={this.aoaOption}>
            <RadioBox name="aoa" label='OFF'></RadioBox>
            <RadioBox name="aoa" label='ON' checked={true}></RadioBox>
            <RadioBox name="aoa" label='AUTO'></RadioBox>
          </RadioList>
        </PopupSubMenu>
      </>
    );
  }
}

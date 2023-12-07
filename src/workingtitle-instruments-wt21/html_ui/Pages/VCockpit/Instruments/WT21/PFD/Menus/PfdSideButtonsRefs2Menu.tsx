import { EventBus, FlightPlanner, FocusPosition, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { PopupSubMenu } from '../../Shared/Menus/Components/PopupSubMenu';
import { GuiDialog, GuiDialogProps } from '../../Shared/UI/GuiDialog';
import { GuiHEvent } from '../../Shared/UI/GuiHEvent';
import { RadioList, RadioListStyle } from '../../Shared/Menus/Components/RadioList';
import { RadioBox } from '../../Shared/Menus/Components/Radiobox';
import { PFDUserSettings } from '../PFDUserSettings';

import './PfdSideButtonsRefs2Menu.css';

/**
 * Props for {@link PfdSideButtonsRefsMenu}
 */
export interface PfdSideButtonsRefs2MenuProps extends GuiDialogProps {
  /** The event bus */
  bus: EventBus,

  /** An instance of the flight planner. */
  planner: FlightPlanner;
}

/**
 * PFD (side button layout) REFS menu
 */
export class PfdSideButtonsRefs2Menu extends GuiDialog<PfdSideButtonsRefs2MenuProps> {
  private readonly elementRefs = [
    FSComponent.createRef<RadioList>(),
    FSComponent.createRef<RadioList>(),
    FSComponent.createRef<RadioList>(),
    FSComponent.createRef<RadioList>(),
  ];

  private readonly pressureOption = Subject.create<number>(0);
  private readonly fltDirOption = Subject.create<number>(0);
  private readonly metricOption = Subject.create<number>(0);
  private readonly flAlertOption = Subject.create<number>(0);

  private readonly pfdSettingsManager = PFDUserSettings.getManager(this.props.bus);

  /** @inheritDoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.linkPressureOption();
    this.linkMetricSetting();
    this.linkFlAlertSetting();
    this.linkFDStyle();
  }

  /** @inheritDoc */
  public onInteractionEvent(evt: GuiHEvent): boolean {
    switch (evt) {
      case GuiHEvent.SOFTKEY_1L: return this.elementRefs[0].instance.focus(FocusPosition.None) ?? false;
      case GuiHEvent.SOFTKEY_2L: return this.elementRefs[1].instance.focus(FocusPosition.None) ?? false;
      case GuiHEvent.SOFTKEY_3L: return this.elementRefs[2].instance.focus(FocusPosition.None) ?? false;
      case GuiHEvent.SOFTKEY_4L: return this.elementRefs[3].instance.focus(FocusPosition.None) ?? false;
    }

    return super.onInteractionEvent(evt);
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

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div>
        <PopupSubMenu label="REFS 2/2" class="pfd-popup-refs-1" showBorder={false}>
          <RadioList ref={this.elementRefs[0]} label='PRESSURE' style={RadioListStyle.SideButtonBound} inline={true} orientation="left" dataRef={this.pressureOption}>
            <RadioBox name="press" label='IN' checked={true} showCheckbox={false} />
            <RadioBox name="press" label='HPA' showCheckbox={false} />
          </RadioList>

          <RadioList ref={this.elementRefs[1]} label='METRIC ALT' style={RadioListStyle.SideButtonBound} inline={true} orientation="left" dataRef={this.metricOption}>
            <RadioBox name="mtrs" label='OFF' checked={true} showCheckbox={false} />
            <RadioBox name="mtrs" label='ON' showCheckbox={false} />
          </RadioList>

          <RadioList ref={this.elementRefs[2]} label='FL ALERT' style={RadioListStyle.SideButtonBound} inline={true} orientation="left" dataRef={this.flAlertOption}>
            <RadioBox name="fla" label='OFF' showCheckbox={false} />
            <RadioBox name="fla" label='ON' checked={true} showCheckbox={false} />
          </RadioList>

          <RadioList ref={this.elementRefs[3]} label='FLT DIR' style={RadioListStyle.SideButtonBound} inline={true} orientation="left" dataRef={this.fltDirOption}>
            <RadioBox name="flt" label='V-BAR' checked={true} showCheckbox={false} />
            <RadioBox name="flt" label='X-PTR' showCheckbox={false} />
          </RadioList>
        </PopupSubMenu>

        <PopupSubMenu label="REFS 2/2" class="pfd-popup-refs-2" showBorder={false} />
      </div>
    );
  }
}

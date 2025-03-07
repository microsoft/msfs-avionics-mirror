import { AvionicsSystemState, ConsumerSubject, FSComponent, MappedSubject, Subject, VNode, XPDRSimVarEvents } from '@microsoft/msfs-sdk';

import {
  AirGroundDataProviderEvents, DisplayUnitIndices, Epic2RadioUtils, Epic2TransponderEvents, TcasOperatingModeSetting, TouchButton, TrafficUserSettings
} from '@microsoft/msfs-epic2-shared';

import { AdsBroadcastOutMode, RadioSubWindowDetailPage } from './DetailPages';
import { RadioSubWindow, RadioSubWindowControlEventTopics } from './RadioSubWindow';

const TCAS_MODE_MAP = {
  [TcasOperatingModeSetting.TA_RA]: 'TA/RA',
  [TcasOperatingModeSetting.TAOnly]: 'TA',
  [TcasOperatingModeSetting.On]: 'STBY',
  [TcasOperatingModeSetting.Standby]: 'ALT',
};

/** A transponder radio sub-window */
export class XpdrRadioSubWindow extends RadioSubWindow {
  private readonly trafficUserSettings = TrafficUserSettings.getManager(this.props.bus);
  private readonly xpdrCode = ConsumerSubject.create(this.radioSub.on('xpdr_code_1').whenChanged(), 0);
  private readonly tcasMode = this.props.detailPagesController.currentTcasModes[0] as Subject<TcasOperatingModeSetting>;
  private readonly onGround = ConsumerSubject.create(this.props.bus.getSubscriber<AirGroundDataProviderEvents>().on('air_ground_is_on_ground'), false);
  private readonly adsB = this.props.detailPagesController.currentXpdrModes[1] as Subject<AdsBroadcastOutMode>;
  private readonly ident = ConsumerSubject.create(this.props.bus.getSubscriber<XPDRSimVarEvents>().on('xpdr_ident_1'), false);
  private readonly xpdrState = ConsumerSubject.create(this.radioSub.on('xpdr_state_1').whenChanged(), null);
  private readonly powered = this.xpdrState.map((state) => state?.current === AvionicsSystemState.On);

  private readonly xpdrCodeDisp = MappedSubject.create(([code, powered]) => powered ? code.toFixed().padStart(4, '0') : '----', this.xpdrCode, this.powered);
  private readonly tcasModeDisp = this.tcasMode.map((mode: TcasOperatingModeSetting) => TCAS_MODE_MAP[mode]);
  private readonly alternateModeDisp = this.trafficUserSettings.getSetting('trafficAlternativeMode').map((mode: TcasOperatingModeSetting) => TCAS_MODE_MAP[mode]);
  private readonly groundDisp = this.onGround.map((onGround) => onGround ? 'GND' : '');
  private readonly adsBDisp = MappedSubject.create(([adsMode, powered]) => powered && adsMode === AdsBroadcastOutMode.ON ? 'ADS-B' : '', this.adsB, this.powered);
  private readonly identDisp = this.ident.map((ident) => ident ? 'IDT' : '');


  /** @inheritDoc */
  public handleRadioControlEvents = (topic: RadioSubWindowControlEventTopics): Promise<void> | void => {
    switch (topic) {
      case 'pfd_control_sel_coarse_increment':
        return this.handleXpdrCodeChange('COARSE', 1);
      case 'pfd_control_sel_coarse_decrement':
        return this.handleXpdrCodeChange('COARSE', -1);
      case 'pfd_control_sel_fine_increment':
        return this.handleXpdrCodeChange('FINE', 1);
      case 'pfd_control_sel_fine_decrement':
        return this.handleXpdrCodeChange('FINE', -1);
      case 'pfd_control_detail_push':
        return this.props.detailPagesController.handleDetailButtonPressed(RadioSubWindowDetailPage.XPDR);
      case 'pfd_control_vfr_push':
        return this.props.detailPagesController.handleVfrButtonPress();
      case 'BEZEL_BUTTON':
        return this.props.bus.getPublisher<Epic2TransponderEvents>().pub('epic2_xpdr_toggle_modes', true);
      case 'epic2_du_xpdr_button':
        if (this.props.duIndex === DisplayUnitIndices.PfdLeft) {
          return this.props.bus.getPublisher<Epic2TransponderEvents>().pub('epic2_xpdr_toggle_modes', true);
        } else {
          return;
        }
    }

    super.handleRadioControlEvents(topic);
  };

  /**
   * Sets a new transponder code.
   * @param increment Whether to make coarse or fine adjustments
   * @param sign Whether to increment or decrement the code.
   */
  private handleXpdrCodeChange(increment: 'COARSE' | 'FINE', sign: 1 | -1): void {
    Epic2RadioUtils.changeXpdrCode(
      increment,
      sign,
      this.xpdrCode.get(),
      this.props.bus.getPublisher<Epic2TransponderEvents>()
    );
  }

  // TODO Selectable mode

  /** @inheritDoc */
  render(): VNode {
    return (
      <div class='radio-sub-window xpdr-radio-sub-window' ref={this.subWindowRef}>
        <div class={{ 'active-freq': true, 'xpdr-code': true, 'powered': this.powered }}>
          <div class='xpdr-code-number'>{this.xpdrCodeDisp}</div>
          <div class='xpdr-adsb'>{this.adsBDisp}</div>
        </div>
        <div class={{ 'xpdr-annunciations': true, 'hidden': this.powered.map((x) => !x) }}>
          <div class="xpdr-tcas">{this.tcasModeDisp}</div>
          <div class="xpdr-tcas-alt-mode">{this.alternateModeDisp}</div>
          <div class="xpdr-ground">{this.groundDisp}</div>
          <div class="xpdr-ident">{this.identDisp}</div>
        </div>
        <TouchButton
          variant='base'
          class={this.softKeyClass}
          onPressed={this.softKeyHandler}
        >
          <span class="radio-sub-window-soft-key-label">
            {this.isSelected.map(isSel => isSel ? 'XPDR\nMODE' : 'XPDR')}
          </span>
        </TouchButton>
        <div class='bottom-separator' ref={this.separatorRef}></div>
      </div>
    );
  }
}

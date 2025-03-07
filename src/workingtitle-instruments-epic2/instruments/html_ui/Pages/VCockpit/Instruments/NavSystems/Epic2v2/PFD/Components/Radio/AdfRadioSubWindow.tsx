import { AvionicsSystemState, ConsumerSubject, FSComponent, MappedSubject, SimVarValueType, VNode } from '@microsoft/msfs-sdk';

import { Epic2RadioUtils, TouchButton } from '@microsoft/msfs-epic2-shared';

import { RadioSubWindowDetailPage } from './DetailPages';
import { RadioSubWindow, RadioSubWindowControlEventTopics } from './RadioSubWindow';

/** An ADF radio sub-window */
export class AdfRadioSubWindow extends RadioSubWindow {
  private readonly activeFreq = ConsumerSubject.create(this.radioSub.on('adf_active_frequency_1'), 0);
  private readonly adfState = ConsumerSubject.create(this.radioSub.on('adf_state_1'), null);
  private readonly powered = this.adfState.map((state) => state?.current === AvionicsSystemState.On);

  private readonly activeFreqDisp = MappedSubject.create(([freq, powered]) => powered ? freq.toFixed(1).padStart(6, ' ') : '---.-', this.activeFreq, this.powered);

  /** @inheritDoc */
  public handleRadioControlEvents = (topic: RadioSubWindowControlEventTopics): Promise<void> | void => {
    switch (topic) {
      case 'pfd_control_sel_coarse_increment':
        return Epic2RadioUtils.changeActiveAdfFrequency('LEFT', 'INC', this.activeFreq.get() * 1000);
      case 'pfd_control_sel_coarse_decrement':
        return Epic2RadioUtils.changeActiveAdfFrequency('LEFT', 'DEC', this.activeFreq.get() * 1000);
      case 'pfd_control_sel_fine_increment':
        return Epic2RadioUtils.changeActiveAdfFrequency('RIGHT', 'INC', this.activeFreq.get() * 1000);
      case 'pfd_control_sel_fine_decrement':
        return Epic2RadioUtils.changeActiveAdfFrequency('RIGHT', 'DEC', this.activeFreq.get() * 1000);
      case 'pfd_control_detail_push':
        return this.props.detailPagesController.handleDetailButtonPressed(RadioSubWindowDetailPage.ADF);
      case 'pfd_control_volume_increment':
        return SimVar.SetSimVarValue('K:ADF_VOLUME_INC', SimVarValueType.Bool, true);
      case 'pfd_control_volume_decrement':
        return SimVar.SetSimVarValue('K:ADF_VOLUME_DEC', SimVarValueType.Bool, true);
    }

    super.handleRadioControlEvents(topic);
  };

  // TODO ADF mode

  /** @inheritDoc */
  render(): VNode {
    return (
      <div class='radio-sub-window adf-radio-sub-window' ref={this.subWindowRef}>
        <div class='top-right'>ADF</div>
        <div class='volume'></div>
        <div class={{ 'active-freq': true, 'adf-freq': true, 'powered': this.powered }}>{this.activeFreqDisp}</div>
        <TouchButton
          variant='base'
          class={this.softKeyClass}
          onPressed={this.softKeyHandler}
        >
          <span class="radio-sub-window-soft-key-label">ADF</span>
        </TouchButton>
        <div class='bottom-separator' ref={this.separatorRef}></div>
      </div>
    );
  }

}

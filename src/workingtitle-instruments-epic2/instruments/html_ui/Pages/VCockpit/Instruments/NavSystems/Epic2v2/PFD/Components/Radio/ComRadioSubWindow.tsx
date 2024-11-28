import { ConsumerSubject, FSComponent, MappedSubject, SimVarValueType, VNode } from '@microsoft/msfs-sdk';

import { TouchButton } from '@microsoft/msfs-epic2-shared';

import { RadioSubWindowDetailPage } from './DetailPages';
import { RadioSubWindow, RadioSubWindowControlEventTopics, RadioSubWindowProps } from './RadioSubWindow';

/** ComRadioSubWindow Props */
export interface ComRadioSubWindowProps extends RadioSubWindowProps {
  /** Com radio index. */
  index: 1 | 2,
}

/** A com radio sub-window */
export class ComRadioSubWindow extends RadioSubWindow<ComRadioSubWindowProps> {
  private readonly activeFreq = ConsumerSubject.create(this.radioSub.on(`com_active_frequency_${this.props.index}`), 0);
  private readonly stbyFreq = ConsumerSubject.create(this.radioSub.on(`com_standby_frequency_${this.props.index}`), 0);
  private readonly spacing = ConsumerSubject.create(this.radioSub.on(`com_spacing_mode_${this.props.index}`), 0);
  private readonly powered = ConsumerSubject.create(this.radioSub.on(`elec_circuit_com_on_${this.props.index}`), false);

  private readonly activeFreqDisp = MappedSubject.create(RadioSubWindow.FrequencyFormatter, this.activeFreq, this.spacing, this.powered);
  private readonly stbyFreqDisp = MappedSubject.create(RadioSubWindow.FrequencyFormatter, this.stbyFreq, this.spacing, this.powered);
  private readonly txRxDisp = MappedSubject.create(
    ([isTx, isRx]) => isTx ? ' T' : (isRx ? ' R' : ''),
    ConsumerSubject.create(this.radioSub.on(`com_transmit_${this.props.index}`), false),
    ConsumerSubject.create(this.radioSub.on(`com_receive_${this.props.index}`), false),
  );

  /** @inheritDoc */
  public handleRadioControlEvents = (topic: RadioSubWindowControlEventTopics): Promise<void> | void => {
    switch (topic) {
      case 'pfd_control_sel_coarse_increment':
        return SimVar.SetSimVarValue(`K:COM${this.props.index === 1 ? '' : '2'}_RADIO_WHOLE_INC`, SimVarValueType.Number, 0);
      case 'pfd_control_sel_coarse_decrement':
        return SimVar.SetSimVarValue(`K:COM${this.props.index === 1 ? '' : '2'}_RADIO_WHOLE_DEC`, SimVarValueType.Number, 0);
      case 'pfd_control_sel_fine_increment':
        return SimVar.SetSimVarValue(`K:COM${this.props.index === 1 ? '' : '2'}_RADIO_FRACT_INC`, SimVarValueType.Number, 0);
      case 'pfd_control_sel_fine_decrement':
        return SimVar.SetSimVarValue(`K:COM${this.props.index === 1 ? '' : '2'}_RADIO_FRACT_DEC`, SimVarValueType.Number, 0);
      case 'pfd_control_sel_push':
      case 'BEZEL_BUTTON':
      case 'epic2_du_frequency_swap_button':
        return SimVar.SetSimVarValue(`K:COM${this.props.index}_RADIO_SWAP`, SimVarValueType.Number, 0);
      case 'pfd_control_detail_push':
        return this.props.detailPagesController.handleDetailButtonPressed(RadioSubWindowDetailPage[`COM${this.props.index}`]);
      case 'pfd_control_volume_increment':
        return SimVar.SetSimVarValue(`K:COM${this.props.index}_VOLUME_INC`, SimVarValueType.Bool, true);
      case 'pfd_control_volume_decrement':
        return SimVar.SetSimVarValue(`K:COM${this.props.index}_VOLUME_DEC`, SimVarValueType.Bool, true);

    }

    super.handleRadioControlEvents(topic);
  };

  /** @inheritDoc */
  render(): VNode {
    return (
      <div class='radio-sub-window' ref={this.subWindowRef}>
        <div class='top-left'></div>
        <div class='top-middle'></div>
        {/* FIXME Tx/Rx simvars always true for COM1 */}
        <div class='top-right'>{/*{this.txRxDisp}*/}</div>
        <div class='volume'></div>
        <div class={{ 'active-freq': true, 'powered': this.powered }}>{this.activeFreqDisp}</div>
        <div class={{ 'standby-freq': true, 'powered': this.powered }}>{this.stbyFreqDisp}</div>
        <TouchButton
          variant='base'
          class={this.softKeyClass}
          onPressed={() => this.publishHEventOnSoftKeyPressed()}
        >
          <span class="radio-sub-window-soft-key-label">
            {`COM${this.props.index}`}
          </span>
          <svg
            class={{
              'soft-key-swap-arrow': true,
              'hidden': this.props.isSelected.map(is => !is)
            }}
            viewBox='0 0 80 20'
          >
            <polygon points='80,10 57,0 57,6 23,6 23,0 0,10 23,20 23,14 57,14 57,20' />
          </svg>
        </TouchButton>
        <div class='bottom-separator' ref={this.separatorRef}></div>
      </div>
    );
  }

}

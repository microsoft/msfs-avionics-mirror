import { ComSpacing, ConsumerSubject, FSComponent, MappedSubject, SimVarValueType, Subject, VNode } from '@microsoft/msfs-sdk';

import { TouchButton } from '@microsoft/msfs-epic2-shared';

import { RadioSubWindowDetailPage } from './DetailPages';
import { RadioSubWindow, RadioSubWindowControlEventTopics, RadioSubWindowProps } from './RadioSubWindow';

/** NavRadioSubWindow Props */
export interface NavRadioSubWindowProps extends RadioSubWindowProps {
  /** Nav radio index. */
  index: 1 | 2,
}

/** A nav radio sub-window */
export class NavRadioSubWindow extends RadioSubWindow<NavRadioSubWindowProps> {
  // FIXME use NavIndicators instead of raw data.
  private readonly activeFreq = ConsumerSubject.create(this.radioSub.on(`nav_active_frequency_${this.props.index}`), 0);
  private readonly stbyFreq = ConsumerSubject.create(this.radioSub.on(`nav_standby_frequency_${this.props.index}`), 0);
  private readonly rawIdent = ConsumerSubject.create(this.radioSub.on(`nav_ident_${this.props.index}`), '');
  private readonly signal = ConsumerSubject.create(this.radioSub.on(`nav_signal_${this.props.index}`), 0);
  private readonly powered = ConsumerSubject.create(this.radioSub.on(`elec_circuit_nav_on_${this.props.index}`), false);
  // TODO volume indicator
  // private readonly navVolume = ConsumerSubject.create(this.radioSub.on(`nav_volume_${this.props.index}`), 0);
  private readonly isNavSoundOn = ConsumerSubject.create(this.radioSub.on(`nav_sound_${this.props.index}`), false);
  private readonly identOnText = this.isNavSoundOn.map((v) => v ? 'ID' : '');
  private readonly dmeAssociation = ConsumerSubject.create(this.radioSub.on(`epic2_nav${this.props.index}_dme_association`), this.props.index);
  private readonly dmeText = this.dmeAssociation.map((v) => `DME${v}`);
  private readonly dmeHold = ConsumerSubject.create(this.radioSub.on(`epic2_nav${this.props.index}_dme_hold`), false);
  private readonly dmeHoldText = this.dmeHold.map((v) => v ? 'H' : '');

  private readonly activeFreqDisp = MappedSubject.create(RadioSubWindow.FrequencyFormatter, this.activeFreq, Subject.create(ComSpacing.Spacing25Khz), this.powered);
  private readonly stbyFreqDisp = MappedSubject.create(RadioSubWindow.FrequencyFormatter, this.stbyFreq, Subject.create(ComSpacing.Spacing25Khz), this.powered);
  private readonly ident = MappedSubject.create(
    ([rawIdent, signal]) => signal > 0 ? rawIdent : '',
    this.rawIdent,
    this.signal,
  );

  /** @inheritDoc */
  public handleRadioControlEvents = (topic: RadioSubWindowControlEventTopics): Promise<void> | void => {
    switch (topic) {
      case 'pfd_control_sel_coarse_increment':
        return SimVar.SetSimVarValue(`K:NAV${this.props.index}_RADIO_WHOLE_INC`, SimVarValueType.Number, 0);
      case 'pfd_control_sel_coarse_decrement':
        return SimVar.SetSimVarValue(`K:NAV${this.props.index}_RADIO_WHOLE_DEC`, SimVarValueType.Number, 0);
      case 'pfd_control_sel_fine_increment':
        return SimVar.SetSimVarValue(`K:NAV${this.props.index}_RADIO_FRACT_INC`, SimVarValueType.Number, 0);
      case 'pfd_control_sel_fine_decrement':
        return SimVar.SetSimVarValue(`K:NAV${this.props.index}_RADIO_FRACT_DEC`, SimVarValueType.Number, 0);
      case 'pfd_control_sel_push':
      case 'BEZEL_BUTTON':
      case 'epic2_du_frequency_swap_button':
        return SimVar.SetSimVarValue(`K:NAV${this.props.index}_RADIO_SWAP`, SimVarValueType.Number, 0);
      case 'pfd_control_detail_push':
        return this.props.detailPagesController.handleDetailButtonPressed(RadioSubWindowDetailPage[`NAV${this.props.index}`]);
      case 'pfd_control_volume_increment':
        return SimVar.SetSimVarValue(`K:NAV${this.props.index}_VOLUME_INC`, SimVarValueType.Number, 0);
      case 'pfd_control_volume_decrement':
        return SimVar.SetSimVarValue(`K:NAV${this.props.index}_VOLUME_DEC`, SimVarValueType.Number, 0);
      case 'pfd_control_volume_push':
        return SimVar.SetSimVarValue(`K:RADIO_VOR${this.props.index}_IDENT_TOGGLE`, SimVarValueType.Number, 0);
    }

    super.handleRadioControlEvents(topic);
  };

  // TODO VOR radial/bearing
  //  Tuning changes active frequency
  //  The swap arrow is not shown, but a blind transfer can be done

  /** @inheritDoc */
  render(): VNode {
    return (
      <div class='radio-sub-window' ref={this.subWindowRef}>
        <div class='top-left'>{this.dmeText}<span class="dme-hold">{this.dmeHoldText}</span></div>
        <div class='top-middle'></div>
        <div class='top-right'>{this.ident}</div>
        <div class='volume'>{this.identOnText}</div>
        <div class={{ 'active-freq': true, 'powered': this.powered }}>{this.activeFreqDisp}</div>
        <div class={{ 'standby-freq': true, 'powered': this.powered }}>{this.stbyFreqDisp}</div>
        <TouchButton
          variant='base'
          class={this.softKeyClass}
          onPressed={this.softKeyHandler}
        >
          <span class="radio-sub-window-soft-key-label">
            {`NAV${this.props.index}`}
          </span>
          <svg
            class={{
              'soft-key-swap-arrow': true,
              'hidden': this.isSelected.map(is => !is)
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

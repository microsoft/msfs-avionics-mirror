import { ArraySubject, FSComponent, VNode, FocusPosition, FacilityFrequency, FacilityFrequencyType } from '@microsoft/msfs-sdk';
import { G1000UiControlProps, G1000UiControl, G1000ControlList, GroupBox, UiView, UiViewProps, FmsHEvent } from '@microsoft/msfs-wtg1000';
import './Sr22tLoadFrequencyPopup.css';

/** The type of an option of this Frequency Load dialog. */
type FrequencyOption = {
  /** The selected frequency value to set COM frequencies, in MHz. */
  value: number;
  /** Whether to Load or Transfer this frequency. */
  action: 'XFER' | 'Load';
  /** Whether this frequency should be sent to a COM or NAV radio. */
  target: 'NAV' | 'COM';
  /** The index of the target radio. */
  targetIndex: 1 | 2;
  /** Whether to Active or Standby COM. */
  targetStatus: 'Active' | 'Standby'
}

/**
 * A component that displays a list of loading options for COM frequencies
 * on the MFD nearest airports page.
 */
export class Sr22tLoadFrequencyPopup extends UiView<UiViewProps> {

  private readonly controlRef = FSComponent.createRef<G1000UiControl>();
  private readonly optionListRef = FSComponent.createRef<G1000ControlList<FrequencyOption>>();

  private readonly frequencyOptions = ArraySubject.create<FrequencyOption>();


  /** @inheritDoc */
  protected onViewOpened(): void {
    super.onViewOpened();
    this.optionListRef.instance.focus(FocusPosition.First);
  }


  /** @inheritDoc */
  protected onInputDataSet(frequency: FacilityFrequency): void {
    super.onInputDataSet(frequency);

    const target = frequency.type === FacilityFrequencyType.None ? 'NAV' : 'COM';
    this.frequencyOptions.set([
      { value: frequency.freqMHz, action: 'XFER', target, targetIndex: 1, targetStatus: 'Active' },
      { value: frequency.freqMHz, action: 'Load', target, targetIndex: 1, targetStatus: 'Standby' },
      { value: frequency.freqMHz, action: 'XFER', target, targetIndex: 2, targetStatus: 'Active' },
      { value: frequency.freqMHz, action: 'Load', target, targetIndex: 2, targetStatus: 'Standby' },
    ]);
    this.optionListRef.instance.scrollToIndex(0);
  }

  /** @inheritDoc */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    if (evt === FmsHEvent.CLR || evt === FmsHEvent.UPPER_PUSH) {
      this.close();
      return true;
    }
    return this.controlRef.instance.onInteractionEvent(evt);
  }

  /**
   * Builds a frequency list option from a provided frequency.
   * @param frequency The frequency to build the list option from.
   * @returns A new list option node.
   */
  private buildFrequencyOption(frequency: FrequencyOption): VNode {
    return (
      <FrequencyItem frequency={frequency} onSelected={this.onOptionSelected.bind(this)} innerKnobScroll />
    );
  }

  /**
   * A callback called when a frequency is selected using the ENT key.
   * @param frequency The frequency that was selected.
   */
  protected onOptionSelected(frequency: FrequencyOption): void {
    this.setComFrequency(frequency.target, frequency.targetIndex, frequency.value, frequency.targetStatus === 'Standby');
    this.closePopup();
  }

  /** Close this popup. */
  private closePopup(): void {
    this.accept();
  }

  /**
   * Sets the COM frequency.
   * @param name `'NAV'` or `'COM'` string.
   * @param com The COM index to set.
   * @param freq The frequency to set.
   * @param isStandby Whether the frequency is a standby frequency.
   */
  private setComFrequency(name: 'NAV' | 'COM', com: number, freq: number, isStandby = false): void {
    const comStr = name === 'NAV'
      ? com.toString()
      : (com === 1) ? '' : '2';

    const stbySimVarString = `K:${name}${comStr}_STBY${name === 'NAV' ? '' : '_RADIO'}_SET_HZ`;
    const stbyUnitString = name === 'NAV' ? 'Hz' : 'Megahertz';

    if (isStandby) {
      SimVar.SetSimVarValue(stbySimVarString, 'Megahertz', freq * 1_000_000);
    } else {
      // FIXME get this in another way - an oldValue parameter on the datasource modifier, or some other way...
      const currentFreq = SimVar.GetSimVarValue(`COM ACTIVE FREQUENCY:${com}`, 'Hz');

      SimVar.SetSimVarValue(`K:${name}${comStr}_RADIO_SET_HZ`, 'Megahertz', freq * 1_000_000);
      SimVar.SetSimVarValue(stbySimVarString, stbyUnitString, currentFreq);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="mfd-page sr22t-mfd-load-frequency-popup" ref={this.viewContainerRef}>
        <div class="mfd-load-frequency-header-text">
          {this.props.title}
        </div>

        <G1000UiControl innerKnobScroll ref={this.controlRef}>
          <GroupBox title='Options'>
            <G1000ControlList
              innerKnobScroll
              class='mfd-load-frequency-options'
              data={this.frequencyOptions}
              renderItem={this.buildFrequencyOption.bind(this)}
              ref={this.optionListRef}
            />
          </GroupBox>
        </G1000UiControl>

        <div class="mfd-load-frequency-footer-text">
          Press the FMS CRSR knob to return to base page.
        </div>
      </div>
    );
  }
}

/**
 * Props on the FrequencyItem component.
 */
interface FrequencyItemProps extends G1000UiControlProps {
  /** The frequency that this item will display. */
  frequency: FrequencyOption;

  /** A callback called when a frequency is selected. */
  onSelected: (frequency: FrequencyOption) => void;
}

/**
 * A component that represent a single row in the nearest airport
 * frequency list.
 */
class FrequencyItem extends G1000UiControl<FrequencyItemProps> {
  private readonly row = FSComponent.createRef<HTMLDivElement>();

  /** @inheritdoc */
  protected onFocused(source: G1000UiControl): void {
    this.row.instance.classList.add('highlight-select');
    super.onFocused(source);
  }

  /** @inheritdoc */
  protected onBlurred(source: G1000UiControl): void {
    this.row.instance.classList.remove('highlight-select');
    super.onBlurred(source);
  }

  /** @inheritdoc */
  public onEnter(): boolean {
    this.props.onSelected(this.props.frequency);
    this.scroll('forward');

    return true;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="load-frequency-option" ref={this.row}>
        {`${this.props.frequency.action} ${this.props.frequency.value.toFixed(2)} to ${this.props.frequency.target}${this.props.frequency.targetIndex} ${this.props.frequency.targetStatus}`}
      </div>
    );
  }
}

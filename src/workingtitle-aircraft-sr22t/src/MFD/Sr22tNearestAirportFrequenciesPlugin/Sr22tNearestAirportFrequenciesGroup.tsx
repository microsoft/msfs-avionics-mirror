
import { AirportFacility, ArraySubject, FSComponent, FacilityFrequency, VNode } from '@microsoft/msfs-sdk';
import { FrequencyItem, G1000ControlList, G1000UiControl, GroupBox, NearestAirportFrequenciesGroupProps, ViewService } from '@microsoft/msfs-wtg1000';
import { Sr22tLoadFrequencyPopup } from './Sr22tLoadFrequency';

/**
 * A component that displays a list of selectable radio frequencies
 * on the SR22T's MFD nearest airports page.
 */
export class Sr22tNearestAirportFrequenciesGroup extends G1000UiControl<NearestAirportFrequenciesGroupProps & {
  /** The view service to which this page belongs. */
  viewService: ViewService
}> {

  protected readonly frequencies = ArraySubject.create<FacilityFrequency>();
  protected readonly frequencyList = FSComponent.createRef<G1000ControlList<FacilityFrequency>>();

  /**
   * Sets the currently displayed facility.
   * @param facility The airport facility whose frequencies should be displayed.
   */
  public set(facility: AirportFacility | null): void {
    this.frequencies.clear();
    if (facility !== null) {
      this.frequencies.set([...facility.frequencies]);
    }
  }

  /**
   * Builds a frequency list item from a provided frequency.
   * @param frequency The frequency to build the list item from.
   * @returns A new list item node.
   */
  protected buildFrequencyItem(frequency: FacilityFrequency): VNode {
    return (
      <FrequencyItem frequency={frequency} onSelected={this.onFrequencySelected.bind(this)} innerKnobScroll />
    );
  }

  /**
   * A callback called when a frequency is selected using the ENT key.
   * @param frequency The frequency that was selected.
   */
  protected onFrequencySelected(frequency: FacilityFrequency): void {
    this.props.viewService
      .open<Sr22tLoadFrequencyPopup>('Sr22tLoadFrequencyPopup')
      .setInput(frequency);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <GroupBox title='Frequencies'>
        <G1000ControlList
          innerKnobScroll
          class='mfd-nearest-airport-frequencies'
          data={this.frequencies}
          renderItem={this.buildFrequencyItem.bind(this)}
          ref={this.frequencyList} />
      </GroupBox>
    );
  }
}

import {
  ComponentProps, ComSpacing, DisplayComponent, FacilityFrequency, FacilityFrequencyType, FSComponent, ICAO, RadioFrequencyFormatter, RadioType, RadioUtils, VNode,
} from '@microsoft/msfs-sdk';
import { AirportWaypoint } from '@microsoft/msfs-garminsdk';

import { NearestWaypointEntry } from '../../../../Shared/Nearest/NearestWaypointEntry';
import { G3XUnitsUserSettingManager } from '../../../../Shared/Settings/G3XUnitsUserSettings';
import { UiTouchButton } from '../../../../Shared/Components/TouchButton/UiTouchButton';
import { UiNearestWaypointListItem } from '../../../Components/Nearest/UiNearestWaypointListItem';
import { UiService } from '../../../../Shared/UiSystem/UiService';
import { AirportFrequencyDialog } from '../../../Dialogs/AirportFrequencyDialog';
import { UiViewStackLayer } from '../../../../Shared/UiSystem/UiViewTypes';
import { UiViewKeys } from '../../../../Shared/UiSystem/UiViewKeys';
import { WaypointInfoPopup } from '../../WaypointInfoPopup';

import './FindFrequencyNearestAirportListItem.css';

/** Component props for {@link FindFrequencyNearestAirportListItem}. */
export interface FindFrequencyNearestAirportListItemProps extends ComponentProps {
  /** The UI service. */
  uiService: UiService;
  /** The airport data. */
  airportData: NearestWaypointEntry<AirportWaypoint>;
  /** A manager for display unit settings. */
  unitsSettingManager: G3XUnitsUserSettingManager;
  /** The type of the find frequency dialog */
  radioType: 'com25' | 'com833' | 'nav';
  /** A function which is called when the list item is selected. */
  onFrequencySelected: (frequency: number, name?: string) => void;
}

/** A list item for a nearby airport for a find frequency dialog list. */
export class FindFrequencyNearestAirportListItem extends DisplayComponent<FindFrequencyNearestAirportListItemProps> {
  private readonly facilityTypeMap = new Map<FacilityFrequencyType, string>([
    [FacilityFrequencyType.ATIS, 'ATIS'],
    [FacilityFrequencyType.Unicom, 'Unicom'],
    [FacilityFrequencyType.Multicom, 'Multicom'],
    [FacilityFrequencyType.CTAF, 'CTAF'],
    [FacilityFrequencyType.Ground, 'Ground'],
    [FacilityFrequencyType.Tower, 'Tower'],
    [FacilityFrequencyType.Clearance, 'Clearance'],
    [FacilityFrequencyType.Approach, 'Approach'],
    [FacilityFrequencyType.Departure, 'Departure'],
    [FacilityFrequencyType.Center, 'Center'],
    [FacilityFrequencyType.FSS, 'FSS'],
    [FacilityFrequencyType.AWOS, 'AWOS'],
    [FacilityFrequencyType.ASOS, 'ASOS'],
    [FacilityFrequencyType.CPT, 'Pre-Taxi'],
    [FacilityFrequencyType.GCO, 'Remote Clearance'],
  ]);

  private readonly actionButtonSingleFreqTextRef = FSComponent.createRef<HTMLDivElement>();

  private readonly frequencyFormatter = this.props.radioType === 'nav'
    ? RadioFrequencyFormatter.createNav('___.__')
    : RadioFrequencyFormatter.createCom(
      this.props.radioType === 'com25' ? ComSpacing.Spacing25Khz : ComSpacing.Spacing833Khz,
      '___.__',
    );

  private readonly frequencies: FacilityFrequency[] = this.props.airportData.waypoint.facility.get().frequencies.filter(f => {
    switch (this.props.radioType) {
      case 'com25':
        return RadioUtils.isCom25Frequency(f.freqMHz);
      case 'com833':
        return RadioUtils.isCom25Frequency(f.freqMHz) || RadioUtils.isCom833Frequency(f.freqMHz);
      case 'nav':
        return RadioUtils.isNavFrequency(f.freqMHz);
    }
  });

  private readonly airportIdent = ICAO.getIdent(this.props.airportData.waypoint.facility.get().icao);

  /** Handles when the airport button is pressed. */
  private onAirportButtonPressed(): void {
    this.props.uiService
      .openMfdPopup<WaypointInfoPopup>(UiViewStackLayer.Overlay, UiViewKeys.WaypointInfoPopup, true, {
        popupType: 'slideout-right-full',
        backgroundOcclusion: 'hide',
      })
      .ref.setWaypoint(this.props.airportData.waypoint);
  }

  /**
   * Handles when the action button is pressed.
   * Depending on the number of frequencies, it either tunes the single frequency or opens a frequency selection dialog.
   */
  private async onActionButtonPressed(): Promise<void> {
    let frequencyData: FacilityFrequency;

    if (this.frequencies.length === 1) {
      frequencyData = this.frequencies[0];
    } else {
      const result = await this.props.uiService.openMfdPopup<AirportFrequencyDialog>(
        UiViewStackLayer.Overlay,
        UiViewKeys.AirportFrequencyDialog,
        false,
        { popupType: 'slideout-top-full' },
      ).ref.request({
        type: this.props.radioType === 'nav' ? RadioType.Nav : RadioType.Com, // spacing does not matter here, the array is already filtered
        frequencies: this.frequencies,
        airport: this.props.airportData.waypoint,
        frequencyFormatter: this.frequencyFormatter,
      });

      if (result.wasCancelled) {
        return;
      }

      frequencyData = result.payload.frequency;
    }

    const frequency = frequencyData.freqMHz;
    this.props.onFrequencySelected(frequency, this.getFrequencyName(frequencyData));
  }

  /**
   * Gets the name of a frequency.
   * @param freq The facility frequency to get the name of.
   * @returns The name of the frequency.
   */
  private getFrequencyName(freq: FacilityFrequency): string {
    if (this.props.radioType === 'nav') {
      return `${this.airportIdent} ${freq.name}`;
    } else {
      return `${this.airportIdent} ${this.facilityTypeMap.get(freq.type) ?? ''}`;
    }
  }

  /** @inheritDoc */
  public render(): VNode {

    return (
      <UiNearestWaypointListItem
        entry={this.props.airportData}
        compactBrgDis={true}
        showCity={false}
        unitsSettingManager={this.props.unitsSettingManager}
        gduFormat={this.props.uiService.gduFormat}
        hideBorder={true}
        onButtonPressed={this.onAirportButtonPressed.bind(this)}
        class="find-freq-nearest-list-item"
      >
        <UiTouchButton
          class="find-freq-nearest-list-item-action-button"
          gduFormat={this.props.uiService.gduFormat}
          isInList
          label={this.frequencies.length > 1 ? 'Select\nFrequency...' : ''}
          onPressed={this.onActionButtonPressed.bind(this)}
        >
          {this.frequencies.length === 1 &&
            <div ref={this.actionButtonSingleFreqTextRef} class="find-freq-nearest-list-item-action-button-label">
              <div class="find-freq-nearest-list-item-action-button-frequency">{this.frequencyFormatter(this.frequencies[0].freqMHz * 1e6)}</div>
              <div class="find-freq-nearest-list-item-action-button-type">{this.facilityTypeMap.get(this.frequencies[0].type) ?? this.frequencies[0].name}</div>
            </div>
          }
        </UiTouchButton>
      </UiNearestWaypointListItem>
    );
  }
}

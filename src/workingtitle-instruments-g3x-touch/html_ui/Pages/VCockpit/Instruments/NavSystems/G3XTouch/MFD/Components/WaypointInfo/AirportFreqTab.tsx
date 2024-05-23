import {
  AirportFacility, ApproachUtils, ArraySubject, ComRadioIndex, ComSpacing, ExtendedApproachType, Facility,
  FacilityFrequencyType, FacilityLoader, FacilityType, FacilityUtils, FSComponent, MappedSubject, MathUtils,
  NavRadioIndex, RadioFrequencyFormatter, RadioUtils, ReadonlyFloat64Array, Subject, Subscribable, Subscription, VNode,
} from '@microsoft/msfs-sdk';

import { DynamicListData, FmsUtils } from '@microsoft/msfs-garminsdk';

import { RadiosConfig } from '../../../Shared/AvionicsConfig/RadiosConfig';
import { UiList } from '../../../Shared/Components/List/UiList';
import { UiListFocusable } from '../../../Shared/Components/List/UiListFocusable';
import { UiListItem } from '../../../Shared/Components/List/UiListItem';
import { AbstractTabbedContent } from '../../../Shared/Components/TabbedContainer/AbstractTabbedContent';
import { TabbedContentProps } from '../../../Shared/Components/TabbedContainer/TabbedContent';
import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { G3XFmsUtils } from '../../../Shared/FlightPlan/G3XFmsUtils';
import { ComRadioSpacingDataProvider } from '../../../Shared/Radio/ComRadioSpacingDataProvider';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiKnobId } from '../../../Shared/UiSystem/UiKnobTypes';
import { UiService } from '../../../Shared/UiSystem/UiService';
import { SelectRadioDialog } from '../../Views/SelectRadioDialog';
import { UiViewKeys, UiViewStackLayer } from '../../../Shared/UiSystem';
import { G3XNavComControlEvents } from '../../../Shared/NavCom/G3XNavComEventPublisher';

import './AirportFreqTab.css';

/**
 * Component props for {@link AirportFreqTab}.
 */
export interface AirportFreqTabProps extends TabbedContentProps {
  /** The UI service */
  uiService: UiService;

  /** The facility loader */
  facLoader: FacilityLoader;

  /** A configuration object defining options for radios. */
  radiosConfig: RadiosConfig;

  /** The facility to display */
  facility: Subscribable<Facility | null>;

  /** The dimensions of the tab's content area, as `[width, height]` in pixels. */
  tabContentDimensions: Subscribable<ReadonlyFloat64Array>;

  /** A provider of COM radio spacing mode data. */
  comRadioSpacingDataProvider: ComRadioSpacingDataProvider;
}

/**
 * Data for an airport frequency.
 */
interface AirportFrequencyData extends DynamicListData {
  /** The frequency's parent airport. */
  facility: AirportFacility;

  /** The type of the frequency. */
  type: FacilityFrequencyType;

  /** The frequency's radio type. */
  radioType: 'COM' | 'NAV';

  /** The name of the frequency. */
  name: string;

  /** The frequency value, in hertz. */
  frequencyHz: number;
}

/**
 * An airport frequencies tab.
 */
export class AirportFreqTab extends AbstractTabbedContent<AirportFreqTabProps> {
  private static readonly FREQ_NAME_MAP = {
    [FacilityFrequencyType.ASOS]: 'ASOS',
    [FacilityFrequencyType.ATIS]: 'ATIS',
    [FacilityFrequencyType.AWOS]: 'AWOS',
    [FacilityFrequencyType.Approach]: 'Approach',
    [FacilityFrequencyType.CPT]: 'Pre-Taxi',
    [FacilityFrequencyType.CTAF]: 'Tower',
    [FacilityFrequencyType.Center]: 'Center',
    [FacilityFrequencyType.Clearance]: 'Clearance',
    [FacilityFrequencyType.Departure]: 'Departure',
    [FacilityFrequencyType.FSS]: 'FSS',
    [FacilityFrequencyType.GCO]: 'GCO',
    [FacilityFrequencyType.Ground]: 'Ground',
    [FacilityFrequencyType.Multicom]: 'Multicom',
    [FacilityFrequencyType.Tower]: 'Tower',
    [FacilityFrequencyType.Unicom]: 'Unicom',
    [FacilityFrequencyType.None]: 'Unknown'
  };

  private static readonly FREQ_TYPE_PRIORITY = {
    [FacilityFrequencyType.ATIS]: 0,
    [FacilityFrequencyType.ASOS]: 1,
    [FacilityFrequencyType.AWOS]: 2,
    [FacilityFrequencyType.CPT]: 3,
    [FacilityFrequencyType.Clearance]: 4,
    [FacilityFrequencyType.Ground]: 5,
    [FacilityFrequencyType.Tower]: 6,
    [FacilityFrequencyType.CTAF]: 7,
    [FacilityFrequencyType.Unicom]: 8,
    [FacilityFrequencyType.Multicom]: 9,
    [FacilityFrequencyType.Departure]: 10,
    [FacilityFrequencyType.Approach]: 11,
    [FacilityFrequencyType.FSS]: 12,
    [FacilityFrequencyType.GCO]: 13,
    [FacilityFrequencyType.Center]: 14,
    [FacilityFrequencyType.None]: 15
  };

  private static readonly FREQ_SORT = (a: AirportFrequencyData, b: AirportFrequencyData): number => {
    return AirportFreqTab.FREQ_TYPE_PRIORITY[a.type] - AirportFreqTab.FREQ_TYPE_PRIORITY[b.type];
  };

  private static readonly NAV_FORMATTER = RadioFrequencyFormatter.createNav();
  private static readonly COM_25_FORMATTER = RadioFrequencyFormatter.createCom(ComSpacing.Spacing25Khz);
  private static readonly COM_833_FORMATTER = RadioFrequencyFormatter.createCom(ComSpacing.Spacing833Khz);

  private static readonly ILS_LOC_APPROACH_TYPES = new Set<ExtendedApproachType>([
    ApproachType.APPROACH_TYPE_ILS,
    ApproachType.APPROACH_TYPE_LOCALIZER,
    ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE,
    ApproachType.APPROACH_TYPE_LDA,
    ApproachType.APPROACH_TYPE_SDF
  ]);

  private readonly listRef = FSComponent.createRef<UiList<any>>();

  // TODO: Support GDU470 (portrait)
  private readonly listVerticalMargin = this.props.uiService.gduFormat === '460' ? 4 : 2;
  private readonly listItemHeightPx = this.props.uiService.gduFormat === '460' ? 82 : 41;
  private readonly listItemSpacingPxMin = this.props.uiService.gduFormat === '460' ? 2 : 1;
  private readonly listItemSpacingPxMax = this.props.uiService.gduFormat === '460' ? 8 : 4;
  private readonly itemsPerPage = Subject.create(1);
  private readonly listItemSpacingPx = Subject.create(0);

  private readonly frequencies = ArraySubject.create<AirportFrequencyData>();
  private generateFrequencyDataOpId = 0;

  private readonly facilityState = MappedSubject.create(
    this.props.facility,
    this.props.comRadioSpacingDataProvider.combinedComSpacing
  );

  private readonly navComControlEventPub = this.props.uiService.bus.getPublisher<G3XNavComControlEvents>();

  private readonly subscriptions: Subscription[] = [
    this.facilityState
  ];

  /** @inheritDoc */
  public onAfterRender(): void {
    this._knobLabelState.set([
      [UiKnobId.SingleInnerPush, 'Freqs'],
      [UiKnobId.LeftInnerPush, 'Freqs'],
      [UiKnobId.RightInnerPush, 'Freqs']
    ]);

    this.subscriptions.push(
      this.props.tabContentDimensions.sub(this.onTabContentDimensionsChanged.bind(this), true)
    );

    this.facilityState.sub(async ([facility, comSpacingMode]) => {
      if (facility === null || !FacilityUtils.isFacilityType(facility, FacilityType.Airport)) {
        this.frequencies.clear();
      } else {
        const opId = ++this.generateFrequencyDataOpId;
        const data = await this.generateFrequencyData(facility, comSpacingMode);

        if (opId !== this.generateFrequencyDataOpId) {
          return;
        }

        this.frequencies.set(data);
      }

      this.listRef.instance.scrollToIndex(0, 0, false, false);
    }, true);
  }

  /** @inheritDoc */
  public onResume(): void {
    this.listRef.instance.focusRecent();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.listRef.instance.removeFocus();
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.listRef.instance.onUiInteractionEvent(event);
  }

  /**
   * Responds to changes in the dimensions of this tab's content area.
   * @param tabContentDimensions The new dimensions of this tab's content area, as `[width, height]` in pixels.
   */
  private onTabContentDimensionsChanged(tabContentDimensions: ReadonlyFloat64Array): void {
    const listHeight = tabContentDimensions[1] - this.listVerticalMargin;
    const itemsPerPage = Math.floor((listHeight + this.listItemSpacingPxMin) / (this.listItemHeightPx + this.listItemSpacingPxMin));

    const totalListItemHeight = itemsPerPage * this.listItemHeightPx;
    const listItemSpacingPx = MathUtils.clamp(
      Math.floor((listHeight - totalListItemHeight) / (itemsPerPage - 1)),
      this.listItemSpacingPxMin,
      this.listItemSpacingPxMax
    );

    this.itemsPerPage.set(itemsPerPage);
    this.listItemSpacingPx.set(listItemSpacingPx);
  }

  /**
   * Sets the standby frequency of a COM radio
   *
   * @param radioIndex the radio index
   * @param frequency the frequency to set
   * @param name the name of the radio station
   */
  private setStandbyComFrequency(radioIndex: ComRadioIndex, frequency: number, name?: string): void {
    const comStr = (radioIndex === 1) ? '' : radioIndex;

    SimVar.SetSimVarValue(`K:COM${comStr}_STBY_RADIO_SET_HZ`, 'Hz', frequency);
    this.navComControlEventPub.pub('add_saved_frequency', {
      radioType: 'com',
      frequencyType: 'recent',
      frequency: frequency / 1e6,
      name: name ?? ''
    }, true, false);
  }

  /**
   * Sets the standby frequency of a COM radio
   *
   * @param radioIndex the radio index
   * @param frequency the frequency to set
   * @param name the name of the radio station
   */
  private setStandbyNavFrequency(radioIndex: NavRadioIndex, frequency: number, name?: string): void {
    SimVar.SetSimVarValue(`K:NAV${radioIndex}_STBY_SET_HZ`, 'Hz', frequency);
    this.navComControlEventPub.pub('add_saved_frequency', {
      radioType: 'nav',
      frequencyType: 'recent',
      frequency: frequency / 1e6,
      name: name ?? ''
    }, true, false);
  }

  /**
   * Generates a frequency data array from an airport facility.
   * @param facility An airport facility.
   * @param comSpacingMode The current COM channel spacing mode.
   * @returns An array of frequency data for the specified airport.
   */
  private async generateFrequencyData(facility: AirportFacility, comSpacingMode: ComSpacing): Promise<AirportFrequencyData[]> {
    const data: AirportFrequencyData[] = [];

    const frequencies = facility.frequencies;
    for (let i = 0; i < frequencies.length; i++) {
      const freq = frequencies[i];

      const freqHz = MathUtils.round(freq.freqMHz * 1e6, 1e3);
      if (freqHz < 118e6) {
        // Do not include ILS/LOC frequencies.
        continue;
      }

      if (comSpacingMode !== ComSpacing.Spacing833Khz && RadioUtils.isCom833Frequency(freqHz / 1e6)) {
        // Do not include 8.33 kHz spacing frequencies when in 25 kHz spacing mode.
        continue;
      }

      data.push({
        facility,
        type: freq.type,
        radioType: 'COM',
        name: AirportFreqTab.FREQ_NAME_MAP[freq.type],
        frequencyHz: freqHz
      });
    }

    data.sort(AirportFreqTab.FREQ_SORT);

    // Populate ILS/LOC frequencies

    const approachItems = FmsUtils.getApproaches(facility, false)
      .filter(approachItem => AirportFreqTab.ILS_LOC_APPROACH_TYPES.has(approachItem.approach.approachType))
      .sort(G3XFmsUtils.sortApproachItem);
    const referenceFacilities = await Promise.all(approachItems.map(approachItem => ApproachUtils.getReferenceFacility(approachItem.approach, this.props.facLoader)));

    for (let i = 0; i < referenceFacilities.length; i++) {
      const referenceFacility = referenceFacilities[i];
      if (referenceFacility) {
        data.push({
          facility,
          type: FacilityFrequencyType.None,
          radioType: 'NAV',
          name: FmsUtils.getApproachNameAsString(approachItems[i].approach),
          frequencyHz: MathUtils.round(referenceFacility.freqMHz * 1e6, 1e3)
        });
      }
    }

    return data;
  }

  /**
   * Responds to when one of this tab's frequency buttons is pressed.
   * @param data The frequency data associated with the button that was pressed.
   */
  private async onFrequencyPressed(data: AirportFrequencyData): Promise<void> {
    const radioType = data.radioType;
    const radioCount = radioType === 'NAV' ? this.props.radiosConfig.navCount : this.props.radiosConfig.comCount;

    if (radioCount === 0) {
      return;
    }

    const radioDefs = radioType === 'NAV' ? this.props.radiosConfig.navDefinitions : this.props.radiosConfig.comDefinitions;

    let simRadioIndex: ComRadioIndex | NavRadioIndex | undefined;

    if (radioCount > 1) {
      // If there is more than one addressable radio, open a dialog to let the user choose a radio.

      const result = await this.props.uiService
        .openMfdPopup<SelectRadioDialog>(UiViewStackLayer.Overlay, UiViewKeys.SelectRadioDialog, false, { popupType: 'slideout-right-full' })
        .ref.request({
          radioType,
          frequencyName: data.name,
          frequencyText: this.formatFrequency(data)
        });

      if (result.wasCancelled) {
        return;
      }

      simRadioIndex = radioDefs[result.payload]?.simIndex;
    } else {
      // If there is only one addressable radio, automatically tune that radio.
      simRadioIndex = radioDefs.find(def => !!def)?.simIndex;
    }

    if (simRadioIndex === undefined) {
      return;
    }

    if (radioType === 'COM') {
      this.setStandbyComFrequency(simRadioIndex as ComRadioIndex, data.frequencyHz, `${data.facility.icao.slice(7, 11)} ${data.name}`);
    } else {
      this.setStandbyNavFrequency(simRadioIndex as NavRadioIndex, data.frequencyHz, `${data.facility.icao.slice(7, 11)} ${data.name}`);
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='airport-freq-tab'>
        <UiList<AirportFrequencyData>
          ref={this.listRef}
          bus={this.props.uiService.bus}
          data={this.frequencies}
          listItemLengthPx={this.listItemHeightPx}
          listItemSpacingPx={this.listItemSpacingPx}
          itemsPerPage={this.itemsPerPage}
          renderItem={this.renderListItem.bind(this)}
          class='airport-freq-tab-list'
        />
      </div>
    );
  }

  /**
   * Renders a frequency list item.
   * @param data The frequency data associated with the item to render.
   * @returns A frequency list item for the specified data, as a VNode.
   */
  private renderListItem(data: AirportFrequencyData): VNode {
    const remarkText = this.getRemarkText(data);
    const frequencyText = this.formatFrequency(data);

    return (
      <UiListItem>
        <div class='airport-freq-tab-list-item-left'>
          <div class='airport-freq-tab-label'>{data.name}</div>
          <div class='airport-freq-tab-remark'>{remarkText}</div>
        </div>

        <UiListFocusable>
          <UiTouchButton
            label={frequencyText}
            isEnabled={(data.radioType === 'COM' ? this.props.radiosConfig.comCount : this.props.radiosConfig.navCount) > 0}
            onPressed={this.onFrequencyPressed.bind(this, data)}
            class='airport-freq-tab-freq-button'
          />
        </UiListFocusable>
      </UiListItem>
    );
  }

  /**
   * Gets the remark text to display for a frequency.
   * @param data Data describing the frequency for which to get remark text.
   * @returns The remark text to display for the specified frequency.
   */
  private getRemarkText(data: AirportFrequencyData): string {
    switch (data.type) {
      case FacilityFrequencyType.CTAF:
        return 'CTAF';
      case FacilityFrequencyType.ATIS:
      case FacilityFrequencyType.ASOS:
      case FacilityFrequencyType.AWOS:
        return 'RX';
      default:
        return '';
    }
  }

  /**
   * Formats a frequency value.
   * @param data Data describing the frequency to format.
   * @returns A formatted string for the specified frequency.
   */
  private formatFrequency(data: AirportFrequencyData): string {
    let frequencyFormatter;
    if (data.radioType === 'COM') {
      if (this.props.comRadioSpacingDataProvider.combinedComSpacing.get() === ComSpacing.Spacing833Khz) {
        frequencyFormatter = AirportFreqTab.COM_833_FORMATTER;
      } else {
        frequencyFormatter = AirportFreqTab.COM_25_FORMATTER;
      }
    } else {
      frequencyFormatter = AirportFreqTab.NAV_FORMATTER;
    }

    return frequencyFormatter(data.frequencyHz);
  }

  /** @inheritDoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}

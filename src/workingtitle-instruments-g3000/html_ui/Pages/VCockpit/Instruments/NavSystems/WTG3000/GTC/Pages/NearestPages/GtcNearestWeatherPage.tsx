import {
  AirportFacility, ComSpacing, FacilityFrequency, FacilityFrequencyType, FacilityType, FSComponent, GeoPointInterface, ICAO, MappedSubject, NearestSubscription,
  RadioFrequencyFormatter, RadioUtils, Subscribable, VNode
} from '@microsoft/msfs-sdk';

import { AirportWaypoint, ComRadioSpacingSettingMode, ComRadioUserSettings } from '@microsoft/msfs-garminsdk';
import { BasicNearestWaypointEntry, ControllableDisplayPaneIndex, G3000NearestContext, NearestPaneSelectionType } from '@microsoft/msfs-wtg3000-common';

import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcLoadFrequencyDialog } from '../../Dialog/GtcLoadFrequencyDialog';
import { GtcControlMode, GtcService, GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcNearestAirportOptionsPopup } from './GtcNearestAirportOptionsPopup';
import { GtcNearestWaypointPageListItem, GtcNearestWaypointPage } from './GtcNearestWaypointPage';

import './GtcNearestWeatherPage.css';

/**
 * GTC view keys for popups owned by nearest weather pages.
 */
enum GtcNearestWeatherPagePopupKeys {
  Options = 'NearestWeatherOptions'
}

/**
 * A GTC nearest weather page.
 */
export class GtcNearestWeatherPage extends GtcNearestWaypointPage<FacilityType.Airport, GtcNearestWeatherData> {
  private static readonly FREQ_FORMATTER_25 = RadioFrequencyFormatter.createCom(ComSpacing.Spacing25Khz, '___.__');
  private static readonly FREQ_FORMATTER_833 = RadioFrequencyFormatter.createCom(ComSpacing.Spacing833Khz, '___.___');

  private static readonly FREQ_NAME_MAP: Record<number, string> = {
    [FacilityFrequencyType.ATIS]: 'ATIS',
    [FacilityFrequencyType.ASOS]: 'ASOS',
    [FacilityFrequencyType.AWOS]: 'AWOS'
  };

  /** @inheritdoc */
  protected readonly optionsPopupKey = GtcNearestWeatherPagePopupKeys.Options;

  /** @inheritdoc */
  protected readonly showOnMapType = NearestPaneSelectionType.Weather;

  private readonly comSpacingSetting = ComRadioUserSettings.getManager(this.bus).getSetting('comRadioSpacing');
  private readonly comFreqFormatter = this.comSpacingSetting.map(mode => {
    return mode === ComRadioSpacingSettingMode.Spacing8_33Khz ? GtcNearestWeatherPage.FREQ_FORMATTER_833 : GtcNearestWeatherPage.FREQ_FORMATTER_25;
  });

  /** @inheritdoc */
  protected getNearestSubscription(context: G3000NearestContext): NearestSubscription<AirportFacility> {
    return context.weather;
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Persistent,
      this.optionsPopupKey,
      this.props.controlMode,
      this.renderOptionsPopup.bind(this),
      this.props.displayPaneIndex
    );

    this._title.set('Nearest Weather');
  }

  /** @inheritdoc */
  protected createWaypointEntry(waypoint: AirportWaypoint): GtcNearestWeatherData {
    return new GtcNearestWeatherData(waypoint, this.ppos, this.planeHeadingTrue);
  }

  /** @inheritdoc */
  protected getCssClass(): string {
    return 'nearest-weather-page';
  }

  /** @inheritdoc */
  protected getHeaderTypeLabel(): string {
    return 'Weather';
  }

  /** @inheritdoc */
  protected renderAdditionalHeaderColumns(): VNode | null {
    return (
      <div class='nearest-page-header-freq'>Frequency</div>
    );
  }

  /** @inheritdoc */
  protected renderListItem(data: GtcNearestWeatherData): VNode {
    const facilityIdent = ICAO.getIdent(data.waypoint.facility.get().icao);
    const frequencies = data.weatherFrequencies;
    const displayFreq = this.comSpacingSetting.map(mode => {
      if (mode === ComRadioSpacingSettingMode.Spacing8_33Khz) {
        return frequencies[0];
      } else {
        return frequencies.find(GtcNearestWeatherPage.is25Frequency);
      }
    });
    const freqMhzText = MappedSubject.create(
      ([freq, formatter]) => {
        return formatter((freq?.freqMHz ?? NaN) * 1e6);
      },
      displayFreq,
      this.comFreqFormatter
    );
    const freqTypeText = displayFreq.map(freq => freq === undefined ? '' : GtcNearestWeatherPage.FREQ_NAME_MAP[freq.type] ?? '');

    return (
      <GtcNearestWaypointPageListItem
        gtcService={this.props.gtcService}
        optionsPopupKey={this.optionsPopupKey}
        entry={data}
        selectedWaypoint={this.selectedWaypoint}
        unitsSettingManager={this.unitsSettingManager}
        paddedListItem
      >
        <GtcTouchButton
          isEnabled={displayFreq.map(freq => freq !== undefined)}
          onPressed={() => {
            const freqMhz = displayFreq.get()?.freqMHz;

            if (freqMhz !== undefined) {
              this.props.gtcService.openPopup<GtcLoadFrequencyDialog>(GtcViewKeys.LoadFrequencyDialog)
                .ref.request({
                  type: 'COM',
                  frequency: freqMhz,
                  label: `${facilityIdent} ${freqTypeText.get()}`
                });
            }
          }}
          isInList
          gtcOrientation={this.props.gtcService.orientation}
          onDestroy={() => {
            displayFreq.destroy();
            freqMhzText.destroy();
          }}
          class='nearest-page-list-item-freq'
        >
          <div class='nearest-weather-page-list-item-freq-value'>{freqMhzText}</div>
          <div class='nearest-weather-page-list-item-freq-type'>{freqTypeText}</div>
        </GtcTouchButton>
      </GtcNearestWaypointPageListItem>
    );
  }

  /**
   * Renders this page's options popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @param displayPaneIndex The index of the display pane associated with the popup.
   * @returns This page's options popup, as a VNode.
   */
  protected renderOptionsPopup(gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex?: ControllableDisplayPaneIndex): VNode {
    return (
      <GtcNearestAirportOptionsPopup
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
        title='Nearest Weather'
        selectedWaypoint={this.selectedWaypoint}
        showOnMap={this.showOnMap}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.comFreqFormatter.destroy();

    super.destroy();
  }

  /**
   * Checks if an airport COM frequency is compatible with 25 kHz spacing.
   * @param freq An airport COM frequency.
   * @returns Whether the specified airport COM frequency is compatible with 25 kHz spacing.
   */
  private static is25Frequency(freq: FacilityFrequency): boolean {
    return RadioUtils.isCom25Frequency(freq.freqMHz);
  }
}

/**
 * A data item describing a nearest weather airport waypoint for a GTC nearest weather page.
 */
class GtcNearestWeatherData extends BasicNearestWaypointEntry<AirportWaypoint> {
  private static readonly FREQ_SORT = (a: FacilityFrequency, b: FacilityFrequency): number => {
    return GtcNearestWeatherData.getFrequencyPriority(b) - GtcNearestWeatherData.getFrequencyPriority(a);
  };

  /**
   * An array of frequencies that provide weather information available at this data item's airport waypoint. The
   * frequencies are sorted in order of decreasing priority (ATIS -> ASOS -> AWOS).
   */
  public readonly weatherFrequencies: readonly FacilityFrequency[];

  /**
   * Constructor.
   * @param waypoint This data item's waypoint.
   * @param ppos The current airplane position.
   * @param planeHeading The current true heading of the airplane, in degrees.
   */
  public constructor(public readonly waypoint: AirportWaypoint, ppos: Subscribable<GeoPointInterface>, planeHeading: Subscribable<number>) {
    super(waypoint, ppos, planeHeading);

    const weatherFrequencies: FacilityFrequency[] = [];
    const frequencies = waypoint.facility.get().frequencies;
    for (let i = 0; i < frequencies.length; i++) {
      const freq = frequencies[i];
      if (GtcNearestWeatherData.getFrequencyPriority(freq) > 0) {
        weatherFrequencies.push(freq);
      }
    }

    weatherFrequencies.sort(GtcNearestWeatherData.FREQ_SORT);

    this.weatherFrequencies = weatherFrequencies;
  }

  /**
   * Gets the priority of an airport frequency to be displayed as a weather frequency. Given two frequencies, the one
   * with the higher priority should be displayed over the other. Frequencies with a priority of zero should not be
   * displayed as a weather frequency.
   * @param frequency An airport frequency.
   * @returns The priority of the specified airport frequency to be displayed as a weather frequency.
   */
  private static getFrequencyPriority(frequency: FacilityFrequency): number {
    switch (frequency.type) {
      case FacilityFrequencyType.ATIS:
        return 3;
      case FacilityFrequencyType.ASOS:
        return 2;
      case FacilityFrequencyType.AWOS:
        return 1;
      default:
        return 0;
    }
  }
}
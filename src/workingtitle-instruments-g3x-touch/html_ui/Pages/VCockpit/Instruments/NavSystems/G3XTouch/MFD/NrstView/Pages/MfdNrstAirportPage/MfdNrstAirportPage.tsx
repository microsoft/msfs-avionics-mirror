import {
  AirportFacility, ComSpacing, ComponentProps, DisplayComponent, FSComponent, FacilityFrequency, FacilityFrequencyType,
  FacilityType, NearestSubscription, RadioFrequencyFormatter, RadioUtils, ReadonlyFloat64Array, Subject, Subscribable,
  SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { AirportWaypoint } from '@microsoft/msfs-garminsdk';

import { EisLayouts } from '../../../../Shared/CommonTypes';
import { G3XTouchFilePaths } from '../../../../Shared/G3XTouchFilePaths';
import { G3XNearestContext } from '../../../../Shared/Nearest/G3XNearestContext';
import { NearestWaypointEntry } from '../../../../Shared/Nearest/NearestWaypointEntry';
import { ComRadioSpacingDataProvider } from '../../../../Shared/Radio/ComRadioSpacingDataProvider';
import { G3XNearestAirportUserSettings } from '../../../../Shared/Settings/G3XNearestAirportUserSettings';
import { UiInteractionEvent } from '../../../../Shared/UiSystem/UiInteraction';
import { UiViewLifecyclePolicy, UiViewStackLayer } from '../../../../Shared/UiSystem/UiViewTypes';
import { UiNearestWaypointListItem } from '../../../Components/Nearest/UiNearestWaypointListItem';
import { MfdPageSizeMode } from '../../../PageNavigation/MfdPageTypes';
import { AbstractMfdNrstFacilityPage } from '../../AbstractMfdNrstFacilityPage';
import { AbstractMfdNrstPageProps } from '../../AbstractMfdNrstPage';
import { MfdNrstAirportOptionsPopup } from './MfdNrstAirportOptionsPopup';

import './MfdNrstAirportPage.css';

/**
 * Component props for {@link MfdNrstAirportPage}.
 */
export interface MfdNrstAirportPageProps extends AbstractMfdNrstPageProps {
  /** A provider of COM radio spacing mode data. */
  comRadioSpacingDataProvider: ComRadioSpacingDataProvider;
}

/**
 * UI view keys for popups owned by the MFD nearest airport page.
 */
enum MfdNrstAirportPagePopupKeys {
  NearestAirportOptions = 'MfdNrstAirportPageOptions'
}

/**
 * An MFD nearest airport page.
 */
export class MfdNrstAirportPage extends AbstractMfdNrstFacilityPage<FacilityType.Airport, NearestWaypointEntry<AirportWaypoint>, MfdNrstAirportPageProps> {
  private readonly nearestAirportSettingManager = G3XNearestAirportUserSettings.getManager(this.props.uiService.bus);

  // TODO: support GDU470 (portrait)
  private readonly compactBrgDis = this.props.uiService.gdu460EisLayout.map(eisLayout => {
    return eisLayout !== EisLayouts.None;
  }).pause();

  /** @inheritDoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this.props.uiService.registerMfdView(
      UiViewStackLayer.Overlay, UiViewLifecyclePolicy.Transient, MfdNrstAirportPagePopupKeys.NearestAirportOptions,
      (uiService, containerRef) => {
        return (
          <MfdNrstAirportOptionsPopup
            uiService={uiService}
            containerRef={containerRef}
          />
        );
      }
    );

    this.rootCssClass.add('mfd-nrst-airport-page');

    this._title.set('Airports');
    this._iconSrc.set(`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_nrst_airport.png`);
  }

  /** @inheritDoc */
  public onOpen(sizeMode: MfdPageSizeMode, dimensions: ReadonlyFloat64Array): void {
    super.onOpen(sizeMode, dimensions);

    this.compactBrgDis.resume();
  }

  /** @inheritDoc */
  public onClose(): void {
    super.onClose();

    this.compactBrgDis.pause();
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    if (event === UiInteractionEvent.MenuPress) {
      this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, MfdNrstAirportPagePopupKeys.NearestAirportOptions, false, { popupType: 'slideout-bottom-full' });
      return true;
    }

    return super.onUiInteractionEvent(event);
  }

  /** @inheritDoc */
  protected getNearestSubscription(context: G3XNearestContext): NearestSubscription<AirportFacility> {
    return context.airports;
  }

  /** @inheritDoc */
  protected renderListItem(data: NearestWaypointEntry<AirportWaypoint>): VNode {
    return (
      <UiNearestWaypointListItem
        entry={data}
        compactBrgDis={this.compactBrgDis}
        showCity={this.nearestAirportSettingManager.getSetting('nearestAptShowCity')}
        runwaySurfaceFilter={this.nearestAirportSettingManager.getSetting('nearestAptRunwaySurfaceTypes')}
        unitsSettingManager={this.unitsSettingManager}
        gduFormat={this.props.uiService.gduFormat}
        onFocusGained={entry => { this._selectedWaypoint.set(entry.waypoint); }}
        onButtonPressed={entry => { this.openWaypointInfoPopup(entry.waypoint); }}
        class='mfd-nrst-airport-page-list-item'
      >
        <div class='nearest-wpt-list-item-divider nearest-airport-page-list-item-freq-divider' />
        <NearestAirportFrequencyDisplay
          entry={data}
          comSpacing={this.props.comRadioSpacingDataProvider.combinedComSpacing}
        />
      </UiNearestWaypointListItem>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.compactBrgDis.destroy();

    super.destroy();
  }
}

/**
 * Component props for {@link NearestAirportFrequencyDisplay}.
 */
interface NearestAirportFrequencyDisplayProps extends ComponentProps {
  /** Data pertaining to the airport waypoint for which to display frequency information. */
  entry: NearestWaypointEntry<AirportWaypoint>;

  /** The current COM radio spacing mode. */
  comSpacing: ComSpacing | Subscribable<ComSpacing>;
}

/**
 * A component that displays the value and type of a nearest airport's best frequency.
 */
class NearestAirportFrequencyDisplay extends DisplayComponent<NearestAirportFrequencyDisplayProps> {
  private static readonly FORMATTER_25 = RadioFrequencyFormatter.createCom(ComSpacing.Spacing25Khz, '');
  private static readonly FORMATTER_833 = RadioFrequencyFormatter.createCom(ComSpacing.Spacing833Khz, '');

  private readonly freqValueText = Subject.create('');
  private readonly freqTypeText = Subject.create('');

  private facilitySub?: Subscription;
  private comSpacingSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    const updateFrequencyHandler = this.updateFrequency.bind(this);
    this.facilitySub = this.props.entry.store.facility.sub(updateFrequencyHandler);
    if (SubscribableUtils.isSubscribable(this.props.comSpacing)) {
      this.comSpacingSub = this.props.comSpacing.sub(updateFrequencyHandler);
    }
    updateFrequencyHandler();
  }

  /**
   * Responds to when this display's airport facility changes.
   */
  private updateFrequency(): void {
    const airport = this.props.entry.store.facility.get() as AirportFacility;

    if (airport === null) {
      this.freqValueText.set('');
      this.freqTypeText.set('');
      return;
    }

    const comSpacing = SubscribableUtils.isSubscribable(this.props.comSpacing) ? this.props.comSpacing.get() : this.props.comSpacing;

    let bestFreq: FacilityFrequency | null = null;
    let bestFreqPriority = -Infinity;

    for (let i = 0; i < airport.frequencies.length; i++) {
      const freq = airport.frequencies[i];

      if (comSpacing === ComSpacing.Spacing25Khz && RadioUtils.isCom833Frequency(freq.freqMHz)) {
        continue;
      }

      let freqPriority = -Infinity;

      switch (freq.type) {
        case FacilityFrequencyType.Tower:
          freqPriority = 0;
          break;
        case FacilityFrequencyType.CTAF:
          freqPriority = -1;
          break;
      }

      if (freqPriority > bestFreqPriority) {
        bestFreq = freq;
        bestFreqPriority = freqPriority;
      }
    }

    if (bestFreq === null) {
      this.freqValueText.set('');
      this.freqTypeText.set('');
    } else {
      const formatter = comSpacing === ComSpacing.Spacing25Khz
        ? NearestAirportFrequencyDisplay.FORMATTER_25
        : NearestAirportFrequencyDisplay.FORMATTER_833;

      this.freqValueText.set(formatter(bestFreq.freqMHz * 1e6));

      switch (bestFreq.type) {
        case FacilityFrequencyType.Tower:
          this.freqTypeText.set('Tower');
          break;
        case FacilityFrequencyType.CTAF:
          this.freqTypeText.set('Tower/CTAF');
          break;
        default:
          this.freqTypeText.set('');
      }
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='mfd-nrst-airport-page-list-item-freq'>
        <div class='mfd-nrst-airport-page-list-item-freq-value'>{this.freqValueText}</div>
        <div class='mfd-nrst-airport-page-list-item-freq-type'>{this.freqTypeText}</div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.facilitySub?.destroy();
    this.comSpacingSub?.destroy();

    super.destroy();
  }
}
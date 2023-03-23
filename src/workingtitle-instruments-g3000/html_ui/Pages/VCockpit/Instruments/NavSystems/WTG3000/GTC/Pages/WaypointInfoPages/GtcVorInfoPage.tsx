import {
  FacilitySearchType, FacilityType, FacilityWaypoint, FSComponent, ICAO, MathUtils, MutableSubscribable,
  RadioFrequencyFormatter, Subscribable, Subscription, VNode, VorClass, VorFacility, VorType,
} from '@microsoft/msfs-sdk';
import { MagVarDisplay } from '@microsoft/msfs-garminsdk';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcLoadFrequencyDialog } from '../../Dialog/GtcLoadFrequencyDialog';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcWaypointInfoPage, GtcWaypointInfoPageNoWaypointMessage, GtcWaypointInfoPageProps } from './GtcWaypointInfoPage';
import { GtcWaypointInfoPageInfo } from './GtcWaypointInfoPageInfo';

import './GtcVorInfoPage.css';

/**
 * Component props for GtcVorInfoPage.
 */
export interface GtcVorInfoPageProps extends GtcWaypointInfoPageProps {
  /** A mutable subscribable from and to which to sync the page's selected VOR waypoint. */
  selectedVor: MutableSubscribable<FacilityWaypoint<VorFacility> | null>;
}

/**
 * GTC view keys for popups owned by VOR information pages.
 */
enum GtcVorInfoPagePopupKeys {
  Options = 'VorInfoOptions'
}

/**
 * A GTC VOR information page.
 */
export class GtcVorInfoPage extends GtcWaypointInfoPage<FacilitySearchType.Vor, GtcVorInfoPageProps> {
  private static readonly CLASS_TEXT = {
    [VorClass.HighAlt]: 'High Altitude',
    [VorClass.LowAlt]: 'Low Altitude',
    [VorClass.Terminal]: 'Terminal',
    [VorClass.ILS]: 'Terminal',
    [VorClass.VOT]: '',
    [VorClass.Unknown]: ''
  };

  private static readonly TYPE_TEXT = {
    [VorType.VOR]: 'VOR',
    [VorType.VORDME]: 'VOR-DME',
    [VorType.VORTAC]: 'VOR-TACAN',
    [VorType.DME]: 'DME',
    [VorType.TACAN]: 'TACAN',
    [VorType.ILS]: 'ILS',
    [VorType.VOT]: 'VOT',
    [VorType.Unknown]: ''
  };

  private static readonly FREQ_FORMATTER = RadioFrequencyFormatter.createNav();

  protected readonly waypointSelectType = FacilitySearchType.Vor;
  protected readonly optionsPopupKey = GtcVorInfoPagePopupKeys.Options;

  private readonly infoRef = FSComponent.createRef<GtcWaypointInfoPageInfo>();

  private readonly classText = this.selectedFacility.map(facility => facility === null ? '' : GtcVorInfoPage.CLASS_TEXT[facility.vorClass]);
  private readonly typeText = this.selectedFacility.map(facility => facility === null ? '' : GtcVorInfoPage.TYPE_TEXT[facility.type]);

  private readonly magVar = this.selectedFacility.map(facility => facility === null ? 0 : -facility.magneticVariation);

  private readonly freqText = this.selectedFacility.map(facility => facility === null ? '' : GtcVorInfoPage.FREQ_FORMATTER(facility.freqMHz * 1e6));

  private selectedVorPipeOut?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this._title.set('VOR Information');

    this.selectedVorPipeOut = this.selectedWaypoint.pipe(this.props.selectedVor);

    this.selectedFacility.pipe(this.showOnMapData, facility => {
      return { icao: facility?.icao ?? '', runwayIndex: -1 };
    });
  }

  /**
   * Initializes this page's VOR selection.
   * @param facility The VOR facility to select, or its ICAO. If not defined, the selection will be initialized to the
   * most recently selected VOR.
   */
  public async initSelection(facility?: VorFacility | string): Promise<void> {
    if (facility === undefined) {
      this.selectedWaypoint.set(this.props.selectedVor.get());
    } else {
      if (typeof facility === 'string') {
        if (ICAO.isFacility(facility, FacilityType.VOR)) {
          try {
            facility = await this.props.facLoader.getFacility(FacilityType.VOR, facility);
            this.selectedWaypoint.set(this.facWaypointCache.get(facility) as FacilityWaypoint<VorFacility>);
          } catch {
            // noop
          }
        }
      } else {
        this.selectedWaypoint.set(this.facWaypointCache.get(facility) as FacilityWaypoint<VorFacility>);
      }
    }
  }

  /** @inheritdoc */
  public onOpen(): void {
    super.onOpen();

    this.selectedVorPipeOut?.resume();
  }

  /** @inheritdoc */
  public onClose(): void {
    super.onClose();

    this.selectedVorPipeOut?.pause();
  }

  /** @inheritdoc */
  protected getCssClass(): string {
    return 'vor-info-page';
  }

  /** @inheritdoc */
  protected renderContent(): VNode {
    return (
      <div class='vor-info-page-content'>
        <GtcWaypointInfoPageInfo
          ref={this.infoRef}
          city={this.selectedWaypointInfo.city}
          region={this.selectedWaypointInfo.region}
          location={this.selectedWaypointInfo.location}
          bearing={this.selectedWaypointInfo.bearing}
          relativeBearing={this.selectedWaypointRelativeBearing}
          distance={this.selectedWaypointInfo.distance}
          unitsSettingManager={this.unitsSettingManager}
        >
          <div class='wpt-info-page-info-section wpt-info-page-info-section-bottom-separator vor-info-page-info-type-magvar'>
            <div class='vor-info-page-info-type-magvar-left'>{this.classText}</div>
            <MagVarDisplay magvar={this.magVar} class='vor-info-page-info-type-magvar-right' />
            <div class='vor-info-page-info-type-magvar-left'>{this.typeText}</div>
          </div>
          <div class='wpt-info-page-info-section vor-info-page-info-nrst'>
            <div class='vor-info-page-info-nrst-title'>Nearest Airport</div>
          </div>
          <GtcTouchButton
            isEnabled={this.hasSelectedWaypoint}
            onPressed={() => {
              const facility = this.selectedFacility.get();

              if (facility !== null) {
                this.props.gtcService.openPopup<GtcLoadFrequencyDialog>(GtcViewKeys.LoadFrequencyDialog)
                  .ref.request({
                    type: 'NAV',
                    frequency: MathUtils.round(facility.freqMHz, 0.01),
                    label: `${ICAO.getIdent(facility.icao)} VOR`
                  });
              }
            }}
            class='vor-info-page-info-freq-button'
          >
            <div>Frequency:</div>
            <div class='vor-info-page-info-freq-button-freq'>{this.freqText}</div>
          </GtcTouchButton>
          <GtcWaypointInfoPageNoWaypointMessage selectedWaypoint={this.selectedWaypoint as Subscribable<FacilityWaypoint | null>}>
            No VOR Available
          </GtcWaypointInfoPageNoWaypointMessage>
        </GtcWaypointInfoPageInfo>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.infoRef.getOrDefault()?.destroy();

    this.selectedVorPipeOut?.destroy();

    super.destroy();
  }
}
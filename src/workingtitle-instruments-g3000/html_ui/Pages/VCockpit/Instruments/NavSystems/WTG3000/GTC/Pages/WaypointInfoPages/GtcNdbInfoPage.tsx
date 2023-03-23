import {
  FacilitySearchType, FacilityType, FacilityWaypoint, FSComponent, ICAO, MutableSubscribable, NdbFacility, RadioFrequencyFormatter,
  Subscribable, Subscription, VNode
} from '@microsoft/msfs-sdk';
import { GtcWaypointInfoPage, GtcWaypointInfoPageNoWaypointMessage, GtcWaypointInfoPageProps } from './GtcWaypointInfoPage';
import { GtcWaypointInfoPageInfo } from './GtcWaypointInfoPageInfo';

import './GtcNdbInfoPage.css';

/**
 * Component props for GtcNdbInfoPage.
 */
export interface GtcNdbInfoPageProps extends GtcWaypointInfoPageProps {
  /** A mutable subscribable from and to which to sync the page's selected NDB waypoint. */
  selectedNdb: MutableSubscribable<FacilityWaypoint<NdbFacility> | null>;
}

/**
 * GTC view keys for popups owned by NDB information pages.
 */
enum GtcNdbInfoPagePopupKeys {
  Options = 'NdbInfoOptions'
}

/**
 * A GTC NDB information page.
 */
export class GtcNdbInfoPage extends GtcWaypointInfoPage<FacilitySearchType.Ndb, GtcNdbInfoPageProps> {
  private static readonly FREQ_FORMATTER = RadioFrequencyFormatter.createAdf();

  protected readonly waypointSelectType = FacilitySearchType.Ndb;
  protected readonly optionsPopupKey = GtcNdbInfoPagePopupKeys.Options;

  private readonly infoRef = FSComponent.createRef<GtcWaypointInfoPageInfo>();

  // Even though the property is called freqMHz, for NDBs the frequency is reported in kHz
  private readonly freqText = this.selectedFacility.map(facility => facility === null ? '' : GtcNdbInfoPage.FREQ_FORMATTER(facility.freqMHz * 1e3));

  private selectedNdbPipeOut?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this._title.set('NDB Information');

    this.selectedNdbPipeOut = this.selectedWaypoint.pipe(this.props.selectedNdb);

    this.selectedFacility.pipe(this.showOnMapData, facility => {
      return { icao: facility?.icao ?? '', runwayIndex: -1 };
    });
  }

  /**
   * Initializes this page's VOR selection.
   * @param facility The VOR facility to select, or its ICAO. If not defined, the selection will be initialized to the
   * most recently selected VOR.
   */
  public async initSelection(facility?: NdbFacility): Promise<void> {
    if (facility === undefined) {
      this.selectedWaypoint.set(this.props.selectedNdb.get());
    } else {
      if (typeof facility === 'string') {
        if (ICAO.isFacility(facility, FacilityType.NDB)) {
          try {
            facility = await this.props.facLoader.getFacility(FacilityType.NDB, facility);
            this.selectedWaypoint.set(this.facWaypointCache.get(facility) as FacilityWaypoint<NdbFacility>);
          } catch {
            // noop
          }
        }
      } else {
        this.selectedWaypoint.set(this.facWaypointCache.get(facility) as FacilityWaypoint<NdbFacility>);
      }
    }
  }

  /** @inheritdoc */
  public onOpen(): void {
    super.onOpen();

    this.selectedNdbPipeOut?.resume();
  }

  /** @inheritdoc */
  public onClose(): void {
    super.onClose();

    this.selectedNdbPipeOut?.pause();
  }

  /** @inheritdoc */
  protected getCssClass(): string {
    return 'ndb-info-page';
  }

  /** @inheritdoc */
  protected renderContent(): VNode {
    return (
      <div class='ndb-info-page-content'>
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
          <div class='wpt-info-page-info-section ndb-info-page-info-nrst'>
            <div class='ndb-info-page-info-section-title'>Nearest Airport</div>
          </div>
          <div class='wpt-info-page-info-section ndb-info-page-info-freq'>
            <div class='ndb-info-page-info-section-title'>Frequency</div>
            <div class='ndb-info-page-info-freq-value'>{this.freqText}</div>
          </div>
          <GtcWaypointInfoPageNoWaypointMessage selectedWaypoint={this.selectedWaypoint as Subscribable<FacilityWaypoint | null>}>
            No NDB Available
          </GtcWaypointInfoPageNoWaypointMessage>
        </GtcWaypointInfoPageInfo>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.infoRef.getOrDefault()?.destroy();

    this.selectedNdbPipeOut?.destroy();

    super.destroy();
  }
}
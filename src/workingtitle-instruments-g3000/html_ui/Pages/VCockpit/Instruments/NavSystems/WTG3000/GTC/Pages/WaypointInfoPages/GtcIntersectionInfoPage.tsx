import {
  BasicNavAngleSubject, BasicNavAngleUnit, FacilitySearchType, FacilityType, FacilityWaypoint, FSComponent, ICAO, IntersectionFacility,
  MutableSubscribable, NumberFormatter, NumberUnitSubject, Subscribable, Subscription, UnitType, VNode, VorType
} from '@microsoft/msfs-sdk';

import { DefaultWaypointIconImageKey } from '@microsoft/msfs-garminsdk';
import { BearingDisplay, NumberUnitDisplay } from '@microsoft/msfs-wtg3000-common';

import { GtcUiMapWaypointIconImageCache } from '../../Components/GtcWaypointIcon/GtcUiWaypointIconImageCache';
import { GtcWaypointInfoPage, GtcWaypointInfoPageNoWaypointMessage, GtcWaypointInfoPageProps } from './GtcWaypointInfoPage';
import { GtcWaypointInfoPageInfo } from './GtcWaypointInfoPageInfo';

import './GtcIntersectionInfoPage.css';

/**
 * Component props for GtcIntersectionInfoPage.
 */
export interface GtcIntersectionInfoPageProps extends GtcWaypointInfoPageProps {
  /** A mutable subscribable from and to which to sync the page's selected intersection waypoint. */
  selectedIntersection: MutableSubscribable<FacilityWaypoint<IntersectionFacility> | null>;
}

/**
 * GTC view keys for popups owned by intersection information pages.
 */
enum GtcIntersectionInfoPagePopupKeys {
  Options = 'IntersectionInfoOptions'
}

/**
 * A GTC intersection information page.
 */
export class GtcIntersectionInfoPage extends GtcWaypointInfoPage<FacilitySearchType.Intersection, GtcIntersectionInfoPageProps> {
  private static readonly VOR_ICON_KEY_MAP = {
    [VorType.VOR]: DefaultWaypointIconImageKey.Vor,
    [VorType.DME]: DefaultWaypointIconImageKey.DmeOnly,
    [VorType.ILS]: DefaultWaypointIconImageKey.DmeOnly,
    [VorType.TACAN]: DefaultWaypointIconImageKey.Tacan,
    [VorType.VORDME]: DefaultWaypointIconImageKey.VorDme,
    [VorType.VORTAC]: DefaultWaypointIconImageKey.Vortac,
    [VorType.VOT]: DefaultWaypointIconImageKey.Vor,
    [VorType.Unknown]: DefaultWaypointIconImageKey.Vor
  };

  private static readonly BEARING_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' });
  private static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3, nanString: '__._' });

  protected readonly waypointSelectType = FacilitySearchType.Intersection;
  protected readonly optionsPopupKey = GtcIntersectionInfoPagePopupKeys.Options;

  private readonly infoRef = FSComponent.createRef<GtcWaypointInfoPageInfo>();

  private readonly iconCache = GtcUiMapWaypointIconImageCache.getCache();

  private readonly nearestVorIdent = this.selectedFacility.map(facility => facility === null ? ' ' : ICAO.getIdent(facility.nearestVorICAO));
  private readonly nearestVorIconSrc = this.selectedFacility.map(facility => {
    return facility === null ? '' : this.iconCache.get(GtcIntersectionInfoPage.VOR_ICON_KEY_MAP[facility.nearestVorType])?.src ?? '';
  });

  private readonly nearestVorRadial = BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(NaN));
  private readonly nearestVorDistance = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));

  private selectedIntPipeOut?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this._title.set('Intersection Information');

    this.selectedIntPipeOut = this.selectedWaypoint.pipe(this.props.selectedIntersection);

    this.selectedFacility.sub(facility => {
      if (facility === null) {
        this.nearestVorRadial.set(NaN);
        this.nearestVorDistance.set(NaN);
      } else {
        this.nearestVorRadial.set(facility.nearestVorMagneticRadial, facility.nearestVorTrueRadial - facility.nearestVorMagneticRadial);
        this.nearestVorDistance.set(facility.nearestVorDistance);
      }
    }, true);

    this.selectedFacility.pipe(this.showOnMapData, facility => {
      return { icao: facility?.icao ?? '', runwayIndex: -1 };
    });
  }

  /**
   * Initializes this page's intersection selection.
   * @param facility The intersection facility to select, or its ICAO. If not defined, the selection will be
   * initialized to the most recently selected intersection.
   */
  public async initSelection(facility?: IntersectionFacility): Promise<void> {
    if (facility === undefined) {
      this.selectedWaypoint.set(this.props.selectedIntersection.get());
    } else {
      if (typeof facility === 'string') {
        if (ICAO.isFacility(facility, FacilityType.Intersection)) {
          try {
            facility = await this.props.facLoader.getFacility(FacilityType.Intersection, facility);
            this.selectedWaypoint.set(this.facWaypointCache.get(facility) as FacilityWaypoint<IntersectionFacility>);
          } catch {
            // noop
          }
        }
      } else {
        this.selectedWaypoint.set(this.facWaypointCache.get(facility) as FacilityWaypoint<IntersectionFacility>);
      }
    }
  }

  /** @inheritdoc */
  public onOpen(): void {
    super.onOpen();

    this.selectedIntPipeOut?.resume();
  }

  /** @inheritdoc */
  public onClose(): void {
    super.onClose();

    this.selectedIntPipeOut?.pause();
  }

  /** @inheritdoc */
  protected getCssClass(): string {
    return 'int-info-page';
  }

  /** @inheritdoc */
  protected renderContent(): VNode {
    return (
      <div class='int-info-page-content'>
        <GtcWaypointInfoPageInfo
          ref={this.infoRef}
          region={this.selectedWaypointInfo.region}
          location={this.selectedWaypointInfo.location}
          bearing={this.selectedWaypointInfo.bearing}
          relativeBearing={this.selectedWaypointRelativeBearing}
          distance={this.selectedWaypointInfo.distance}
          unitsSettingManager={this.unitsSettingManager}
        >
          <div class='wpt-info-page-info-section int-info-page-info-nrst'>
            <div class='int-info-page-info-nrst-title'>Nearest VOR</div>
            <div class='int-info-page-info-nrst-vor'>
              <span class='int-info-page-info-nrst-ident'>{this.nearestVorIdent}</span>
              <img class='int-info-page-info-nrst-icon' src={this.nearestVorIconSrc} />
            </div>
            <div class='int-info-page-info-nrst-pos'>
              <div class='wpt-info-page-info-field int-info-page-info-nrst-rad'>
                <div class='wpt-info-page-info-field-title'>RAD</div>
                <BearingDisplay
                  value={this.nearestVorRadial}
                  displayUnit={this.unitsSettingManager.navAngleUnits}
                  formatter={GtcIntersectionInfoPage.BEARING_FORMATTER}
                />
              </div>
              <div class='wpt-info-page-info-field int-info-page-info-nrst-dis'>
                <div class='wpt-info-page-info-field-title'>DIS</div>
                <NumberUnitDisplay
                  value={this.nearestVorDistance}
                  displayUnit={this.unitsSettingManager.distanceUnitsLarge}
                  formatter={GtcIntersectionInfoPage.DISTANCE_FORMATTER}
                />
              </div>
            </div>
          </div>
          <GtcWaypointInfoPageNoWaypointMessage selectedWaypoint={this.selectedWaypoint as Subscribable<FacilityWaypoint | null>}>
            No Intersection Available
          </GtcWaypointInfoPageNoWaypointMessage>
        </GtcWaypointInfoPageInfo >
      </div >
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.infoRef.getOrDefault()?.destroy();

    this.selectedIntPipeOut?.destroy();

    super.destroy();
  }
}
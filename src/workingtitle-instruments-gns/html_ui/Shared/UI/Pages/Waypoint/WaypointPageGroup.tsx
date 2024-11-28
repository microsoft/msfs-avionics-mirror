import {
  AirportFacility, FacilityType, FSComponent, GeoPoint, GeoPointSubject, GNSSEvents,
  IntersectionFacility, NdbFacility, NearestContext, Subject, UserFacility,
  VNode, VorFacility
} from '@microsoft/msfs-sdk';

import { Fms } from '@microsoft/msfs-garminsdk';

import { GNSSettingsProvider } from '../../../Settings/GNSSettingsProvider';
import { GNSType } from '../../../UITypes';
import { GnsNearestPagesOutputEvents } from '../Nearest/GnsNearestPagesOutputEvents';
import { PageGroup, PageGroupProps } from '../Pages';
import { ProcApproachPage } from './ProcApproachPage';
import { ProcArrivalPage } from './ProcArrivalPage';
import { ProcDeparturePage } from './ProcDeparturePage';
import { WaypointAirportPage } from './WaypointAirportPage';
import { WaypointFrequenciesPage } from './WaypointFrequenciesPage';
import { WaypointIntersectionPage } from './WaypointIntersectionPage';
import { WaypointNonDirectionalBeaconPage } from './WaypointNonDirectionalBeaconPage';
import { WaypointRunwayPage } from './WaypointRunwayPage';
import { WaypointUsrPage } from './WaypointUsrPage';

import './WaypointPageGroup.css';
import { WaypointVorPage } from './WaypointVorPage';
import { MainScreenOptions } from '../../../MainScreen';

/**
 * Props on the WaypointPageGroup component.
 */
interface WaypointPageGroupProps extends PageGroupProps {
  /** The type of GNS that is being displayed. */
  gnsType: GNSType;

  /** An instance of the flight management system. */
  fms: Fms;

  /** The settings provider for map and other settings. */
  settingsProvider: GNSSettingsProvider;

  /** The options for this instrument. */
  options: MainScreenOptions;

  /**
   * Callback for when the "Done" button associated with a popup page in this group is pressed
   */
  onPopupDonePressed: () => void,
}

/**
 * Facility type that has a dedicated page on the WAYPOINTS page group
 */
type WaypointPageCompatibleFacilityType = Exclude<FacilityType, FacilityType.RWY | FacilityType.VIS>;

/**
 * A page group for the WPT GNS pages.
 */
export class WaypointPageGroup extends PageGroup<WaypointPageGroupProps> {
  private readonly FacilityTypeToPageMap: { [k in WaypointPageCompatibleFacilityType]: number } = {
    [FacilityType.Airport]: 0,
    [FacilityType.Intersection]: 6,
    [FacilityType.NDB]: 7,
    [FacilityType.VOR]: 8,
    [FacilityType.USR]: 9,
  };

  private readonly airport = Subject.create<AirportFacility | undefined>(undefined);
  private readonly intersection = Subject.create<IntersectionFacility | undefined>(undefined);
  private readonly vor = Subject.create<VorFacility | undefined>(undefined);
  private readonly ndb = Subject.create<NdbFacility | undefined>(undefined);
  private readonly user = Subject.create<UserFacility | undefined>(undefined);

  private readonly ppos = GeoPointSubject.create(new GeoPoint(0, 0));

  /**
   * Whether this page was shown from an external interaction, e.g. selecting an airport on the NEAREST AIRPORT page
   */
  public readonly isPopup = Subject.create(false);

  /**
   * Called when a facility FS ICAO is selected by another page
   *
   * @param icao         the airport's FS ICAO
   * @param facilityType the facility type
   */
  private async handleFacilityRemotelySelected<T extends WaypointPageCompatibleFacilityType>(icao: string, facilityType: T): Promise<void> {
    const facility = await this.props.fms.facLoader.getFacility(facilityType, icao);

    this.isPopup.set(true);

    // Navigate to page associated with the facility type
    this.setPage(this.FacilityTypeToPageMap[facilityType]);

    switch (facilityType) {
      case FacilityType.Airport:
        this.airport.set(facility as AirportFacility);
        break;
      case FacilityType.Intersection:
        this.intersection.set(facility as IntersectionFacility);
        break;
      case FacilityType.VOR:
        this.vor.set(facility as VorFacility);
        break;
      case FacilityType.NDB:
        this.ndb.set(facility as NdbFacility);
        break;
      case FacilityType.USR:
        this.user.set(facility as UserFacility);
        break;
      default:
        throw new Error('Unsupported facility type: ' + facilityType);
    }
  }

  /** @inheritDoc */
  suspend(): void {
    super.suspend();
    this.isPopup.set(false);
  }

  /** @inheritDoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    let attempts = 60;

    const scan = (): void => {
      if (attempts > 0) {
        try {
          const nearestContext = NearestContext.getInstance();

          this.airport.set(nearestContext.getNearest(FacilityType.Airport));
          this.intersection.set(nearestContext.getNearest(FacilityType.Intersection));
          this.vor.set(nearestContext.getNearest(FacilityType.VOR));
          this.ndb.set(nearestContext.getNearest(FacilityType.NDB));
        } catch (err) {
          setTimeout(scan, 1000);
        }

        if (this.airport.get() === undefined || this.intersection.get() === undefined
          || this.vor.get() === undefined || this.ndb.get() === undefined) {

          setTimeout(scan, 1000);
        }

        attempts--;
      }
    };

    scan();

    this.props.bus.getSubscriber<GNSSEvents>().on('gps-position').atFrequency(1).handle(pos => this.ppos.set(pos.lat, pos.long));

    // Handle events for external selections of facilities

    this.props.bus.getSubscriber<GnsNearestPagesOutputEvents>()
      .on('gns_nearest_pages_select_wpt_apt')
      .handle((icao) => this.handleFacilityRemotelySelected(icao, FacilityType.Airport));

    this.props.bus.getSubscriber<GnsNearestPagesOutputEvents>()
      .on('gns_nearest_pages_select_wpt_int')
      .handle((icao) => this.handleFacilityRemotelySelected(icao, FacilityType.Intersection));

    this.props.bus.getSubscriber<GnsNearestPagesOutputEvents>()
      .on('gns_nearest_pages_select_wpt_ndb')
      .handle((icao) => this.handleFacilityRemotelySelected(icao, FacilityType.NDB));

    this.props.bus.getSubscriber<GnsNearestPagesOutputEvents>()
      .on('gns_nearest_pages_select_wpt_vor')
      .handle((icao) => this.handleFacilityRemotelySelected(icao, FacilityType.VOR));

    this.props.bus.getSubscriber<GnsNearestPagesOutputEvents>()
      .on('gns_nearest_pages_select_wpt_usr')
      .handle((icao) => this.handleFacilityRemotelySelected(icao, FacilityType.USR));
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <>
        <WaypointAirportPage
          bus={this.props.bus}
          gnsType={this.props.gnsType}
          instrumentIndex={this.props.options.instrumentIndex}
          selectedAirport={this.airport}
          ppos={this.ppos}
          fms={this.props.fms}
          isPopup={this.isPopup}
          onPopupDonePressed={this.props.onPopupDonePressed}
        />
        <WaypointRunwayPage
          bus={this.props.bus}
          settingsProvider={this.props.settingsProvider}
          gnsType={this.props.gnsType}
          instrumentIndex={this.props.options.instrumentIndex}
          selectedAirport={this.airport}
          ppos={this.ppos}
          fms={this.props.fms}
          isPopup={this.isPopup}
          onPopupDonePressed={this.props.onPopupDonePressed}
        />
        <WaypointFrequenciesPage
          bus={this.props.bus}
          gnsType={this.props.gnsType}
          instrumentIndex={this.props.options.instrumentIndex}
          fms={this.props.fms}
          ppos={this.ppos}
          selectedAirport={this.airport}
          isPopup={this.isPopup}
          onPopupDonePressed={this.props.onPopupDonePressed}
          comIndex={this.props.options.comIndex}
          navIndex={this.props.options.navIndex}
        />
        <ProcApproachPage
          bus={this.props.bus}
          gnsType={this.props.gnsType}
          instrumentIndex={this.props.options.instrumentIndex}
          selectedAirport={this.airport}
          settingsProvider={this.props.settingsProvider}
          ppos={this.ppos}
          fms={this.props.fms}
          isPopup={this.isPopup}
          onPopupDonePressed={this.props.onPopupDonePressed}
        />
        <ProcArrivalPage
          bus={this.props.bus}
          gnsType={this.props.gnsType}
          instrumentIndex={this.props.options.instrumentIndex}
          selectedAirport={this.airport}
          settingsProvider={this.props.settingsProvider}
          ppos={this.ppos}
          fms={this.props.fms}
          isPopup={this.isPopup}
          onPopupDonePressed={this.props.onPopupDonePressed}
        />
        <ProcDeparturePage
          bus={this.props.bus}
          gnsType={this.props.gnsType}
          instrumentIndex={this.props.options.instrumentIndex}
          selectedAirport={this.airport}
          settingsProvider={this.props.settingsProvider}
          ppos={this.ppos}
          fms={this.props.fms}
          isPopup={this.isPopup}
          onPopupDonePressed={this.props.onPopupDonePressed}
        />
        <WaypointIntersectionPage
          bus={this.props.bus}
          gnsType={this.props.gnsType}
          instrumentIndex={this.props.options.instrumentIndex}
          selectedIntersection={this.intersection}
          ppos={this.ppos}
          fms={this.props.fms}
          isPopup={this.isPopup}
          onPopupDonePressed={this.props.onPopupDonePressed}
        />
        <WaypointNonDirectionalBeaconPage
          bus={this.props.bus}
          gnsType={this.props.gnsType}
          instrumentIndex={this.props.options.instrumentIndex}
          selectedNdb={this.ndb}
          ppos={this.ppos}
          fms={this.props.fms}
          isPopup={this.isPopup}
          onPopupDonePressed={this.props.onPopupDonePressed}
        />
        <WaypointVorPage
          bus={this.props.bus}
          gnsType={this.props.gnsType}
          instrumentIndex={this.props.options.instrumentIndex}
          selectedVor={this.vor}
          ppos={this.ppos}
          fms={this.props.fms}
          isPopup={this.isPopup}
          onPopupDonePressed={this.props.onPopupDonePressed}
        />
        <WaypointUsrPage
          bus={this.props.bus}
          gnsType={this.props.gnsType}
          instrumentIndex={this.props.options.instrumentIndex}
          selectedUsr={this.user}
          ppos={this.ppos}
          fms={this.props.fms}
          isPopup={this.isPopup}
          onPopupDonePressed={this.props.onPopupDonePressed}
        />
      </>
    );
  }
}
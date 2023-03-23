import {
  Subject, NdbFacility, GeoPointSubject, FSComponent, ICAO, ComputedSubject, GeoPoint, VNode, FocusPosition, AirportFacility,
  IntersectionFacility, VorFacility, UserFacility, FacilitySearchType, LatLonDisplay,
} from '@microsoft/msfs-sdk';
import { Regions } from '@microsoft/msfs-garminsdk';
import { WaypointChangedEvent } from '../../Controls/WaypointSelection';
import { GNSUiControl } from '../../GNSUiControl';
import { InteractionEvent } from '../../InteractionEvent';
import { WaypointPageIdentInput } from './WaypointPageIdentInput';
import { WaypointNonDirectionalBeaconMenu } from './WaypointNonDirectionalBeaconMenu';
import { WaypointPage, WaypointPageProps } from './WaypointPage';

import './WaypointNonDirectionalBeacon.css';
import { ViewService } from '../Pages';

/**
 * WaypointNonDirectionalBeacon props
 */
interface WaypointNonDirectionalBeaconPageProps extends WaypointPageProps {
  /** The ndb Facility that is currently selected on the waypoint pages. */
  selectedNdb: Subject<NdbFacility | undefined>;
}

/**
 * The WaypointNonDirectionalBeacon page
 */
export class WaypointNonDirectionalBeaconPage extends WaypointPage<WaypointNonDirectionalBeaconPageProps> {
  protected readonly menu = new WaypointNonDirectionalBeaconMenu();

  private readonly facilityFrequency = ComputedSubject.create<NdbFacility | undefined, string>(undefined, (v: NdbFacility | undefined): string => {
    if (v === undefined) {
      return '____._';
    }
    return '' + v.freqMHz.toFixed(1);
  });

  private readonly facilityName = ComputedSubject.create<NdbFacility | undefined, string>(undefined, (v: NdbFacility | undefined): string => {
    if (v === undefined) {
      return '__________________________';
    }
    const name = Utils.Translate(v.name).toUpperCase();
    return name === '' ? ICAO.getIdent(v.icao).toUpperCase() : name.substr(0, 20).toUpperCase();
  });

  private readonly facilityCity = ComputedSubject.create<NdbFacility | undefined, string>(undefined, (v: NdbFacility | undefined): string => {
    if (v === undefined) {
      return '________________________';
    }
    const city = v.city.split(', ').map(a => Utils.Translate(a)).join(', ');
    return city === '' ? ' ' : city.substr(0, 20).toUpperCase().toUpperCase();
  });

  private readonly facilityRegion = ComputedSubject.create<NdbFacility | undefined, string>(undefined, (v: NdbFacility | undefined): string => {
    if (v === undefined) {
      return '__________';
    }
    return Regions.getName(v.icao.substring(1, 3));
  });

  private readonly position = GeoPointSubject.create(new GeoPoint(NaN, NaN));


  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.props.selectedNdb.sub(this.onAirportSelected.bind(this), true);
    this.onSuspend();
  }

  /** @inheritdoc */
  public onResume(): void {
    this.el.instance.classList.remove('hide-element');
    this.active = true;
    const ndb = this.props.selectedNdb.get();
    if (ndb !== undefined) {
      this.waypointSelection.instance.setIdent(ICAO.getIdent(ndb.icao).trim(), false);
    }

    if (this.props.isPopup.get()) {
      this.root.instance.focus(FocusPosition.Last);
    }
  }

  /**
   * Method to set the display values when the NDB facility changes.
   * @param ndb The Facility to load.
   */
  private onAirportSelected(ndb?: NdbFacility): void {
    this.facilityName.set(ndb);
    this.facilityCity.set(ndb);
    this.facilityRegion.set(ndb);
    this.facilityFrequency.set(ndb);


    if (ndb !== undefined) {
      this.position.set(ndb.lat, ndb.lon);

      this.waypointSelection.instance.setIdent(ICAO.getIdent(ndb.icao).trim(), false);
    } else {
      this.facilityFrequency.set(undefined);
      this.position.set(NaN, NaN);
    }
  }

  /**
   * Handles when the input waypoint is changed.
   * @param e The waypoint change event to process.
   */
  private onWaypointChanged(e: WaypointChangedEvent): void {
    const ndb = e.facility as (NdbFacility | undefined);
    this.props.selectedNdb.set(ndb);
  }

  /**
   * Handles when waypoint input is finalized.
   */
  private onWaypointFinalized(): void {
    this.waypointSelection.instance.focusSelf();
    this.root.instance.scroll('forward');
    this.root.instance.triggerEvent(InteractionEvent.RightInnerInc, this.root.instance);
  }

  /** @inheritDoc */
  protected onDirectPressed(): boolean {
    const facility = this.props.selectedNdb.get();
    if (facility !== undefined) {
      ViewService.directToDialogWithIcao(facility.icao);
      return true;
    } else {
      return false;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='page waypoint-page' ref={this.el}>
        <GNSUiControl ref={this.root} isolateScroll>
          <WaypointPageIdentInput
            selectedFacility={this.props.selectedNdb as Subject<AirportFacility | IntersectionFacility | VorFacility | UserFacility | undefined>}
            onChanged={this.onWaypointChanged.bind(this)}
            onFinalized={this.onWaypointFinalized.bind(this)}
            onPopupDonePressed={this.props.onPopupDonePressed}
            showDoneButton={this.props.isPopup}
            length={4}
            ppos={this.props.ppos}
            facilityLoader={this.props.fms.facLoader}
            title={'NDB'}
            ref={this.waypointSelection}
            gnsType={this.props.gnsType}
            filter={FacilitySearchType.Ndb}
          />

          <div class='waypoint-ndb-location'>FACILITY, CITY & REGION
            <div>
              {this.facilityName}<br />
              {this.facilityCity}<br />
              {this.facilityRegion}
            </div>
          </div>

          <div class='waypoint-ndb-position'>POSITION
            <LatLonDisplay location={this.position} />
          </div>
          <div class='waypoint-ndb-freq'>FREQ
            <div>
              {this.facilityFrequency}
            </div>
          </div>

          {this.props.gnsType === 'wt530' && (
            <div class='waypoint-ndb-wxbrdcst'>WX BRDCST
              <div>
                No
              </div>
            </div>
          )}
        </GNSUiControl>
      </div>
    );
  }
}

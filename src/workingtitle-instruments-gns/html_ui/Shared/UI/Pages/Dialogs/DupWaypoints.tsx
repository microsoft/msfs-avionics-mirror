import { ArraySubject, Facility, FacilityType, FocusPosition, FSComponent, GeoPoint, GNSSEvents, ICAO, Subject, VNode } from '@microsoft/msfs-sdk';

import { Fms, Regions } from '@microsoft/msfs-garminsdk';

import { GNSUiControl, GNSUiControlList, GNSUiControlProps } from '../../GNSUiControl';
import { Icons } from '../../Icons';
import { PageProps } from '../Pages';
import { Dialog } from './Dialog';

import './DupWaypoints.css';

/**
 * Props on the DupWaypoints dialog component.
 */
interface DupWaypointsProps extends PageProps {
  /** An instance of the flight management system. */
  fms: Fms;
}

/**
 * A dialog that allows a selection from duplicate waypoints.
 */
export class DupWaypoints extends Dialog<DupWaypointsProps> {

  private readonly ppos = new GeoPoint(0, 0);
  private readonly ident = Subject.create('');
  private readonly facilities = ArraySubject.create<Facility>();
  private readonly duplicatesList = FSComponent.createRef<GNSUiControlList<Facility>>();

  private resolve: (facility: Facility | PromiseLike<Facility>) => void = () => { };

  /**
   * Sets the ident to display in the dialog.
   * @param ident The ident to display.
   */
  public setIdent(ident: string): void {
    this.ident.set(ident);
  }

  /**
   * Sets the facilities to display in the dialog.
   * @param icaos The icaos of the facilities to display.
   */
  public setIcaos(icaos: string[]): void {
    this.facilities.clear();
    Promise.all(icaos.map(icao => this.props.fms.facLoader.getFacility(ICAO.getFacilityType(icao), icao)))
      .then(facs => {
        this.facilities.insertRange(0, facs);
        this.duplicatesList.instance.updateOrder();
        this.duplicatesList.instance.focus(FocusPosition.First);
      });
  }

  /**
   * Sets the dialog promise resolution function.
   * @param resolve The promise resolution function with which to resolve the dialog.
   */
  public setResolve(resolve: (facility: Facility | PromiseLike<Facility>) => void): void {
    this.resolve = resolve;
  }

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.props.bus.getSubscriber<GNSSEvents>()
      .on('gps-position')
      .handle(pos => this.ppos.set(pos.lat, pos.long));
  }

  /**
   * Orders facilities by their distance to the plane PPOS.
   * @param a The first facility.
   * @param b The second facility.
   * @returns The comparison order number.
   */
  public orderByPPosDistance(a: Facility, b: Facility): number {
    const aDist = this.ppos.distance(a.lat, a.lon);
    const bDist = this.ppos.distance(b.lat, b.lon);

    if (aDist < bDist) {
      return -1;
    }

    if (aDist > bDist) {
      return 1;
    }

    return 0;
  }

  /** @inheritdoc */
  public renderDialog(): VNode {
    return (
      <>
        <h2 class="cyan">DUPLICATE WAYPOINTS</h2>
        <hr />
        <div class='dup-waypoints-ident'>
          <span>WPT</span> {this.ident}
        </div>
        <GNSUiControlList<Facility> class='dup-waypoints-list' data={this.facilities}
          renderItem={(data: Facility): VNode => <DupWaypoint facility={data} onSelected={this.resolve} />}
          orderBy={this.orderByPPosDistance.bind(this)} ref={this.duplicatesList} />
      </>
    );
  }
}

/**
 * Props on the DupWaypoint control.
 */
interface DupWaypointProps extends GNSUiControlProps {
  /** The facility to display. */
  facility: Facility;

  /** A callback called when a facility is selected. */
  onSelected: (facility: Facility) => void;
}

/**
 * A duplicate waypoint item in the duplicate waypoints list.
 */
class DupWaypoint extends GNSUiControl<DupWaypointProps> {
  private readonly region = FSComponent.createRef<HTMLDivElement>();

  /** @inheritdoc */
  protected onFocused(): void {
    this.region.instance.classList.add('selected-white');
  }

  /** @inheritdoc */
  protected onBlurred(): void {
    this.region.instance.classList.remove('selected-white');
  }

  /** @inheritdoc */
  public onEnt(): boolean {
    this.props.onSelected(this.props.facility);
    return true;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='dup-waypoint'>
        <div class='dup-waypoint-type'>{this.getTypeLabel()}</div>
        <div class='dup-waypoint-icon'>
          <img src={Icons.getByFacility(this.props.facility).src} />
        </div>
        <div class='dup-waypoint-region' ref={this.region}>{this.getRegion().substr(0, 14)}</div>
      </div>
    );
  }

  /**
   * Gets the type label for the given facility.
   * @returns The facility's type label.
   */
  private getTypeLabel(): string {
    const type = ICAO.getFacilityType(this.props.facility.icao);

    switch (type) {
      case FacilityType.Airport:
        return 'APT';
      case FacilityType.NDB:
        return 'NDB';
      case FacilityType.VOR:
        return 'VOR';
      case FacilityType.USR:
        return 'USR';
      case FacilityType.Intersection:
        return 'INT';
      default:
        return 'UNK';
    }
  }

  /**
   * Gets a region label for the facility.
   * @returns The facility's region label.
   */
  private getRegion(): string {
    const facilityIdent = ICAO.getIdent(this.props.facility.icao).trim();
    if (ICAO.getFacilityType(this.props.facility.icao) === FacilityType.Airport) {
      let region = facilityIdent.length === 4 ? Regions.getName(facilityIdent.substr(0, 2)) : '';
      if (region === '' && this.props.facility.city !== '') {
        region = this.props.facility.city.split(', ').map(v => Utils.Translate(v)).join(', ');
      }

      return (region === '' ? 'UNKNOWN' : region.toUpperCase().substr(0, 10));
    } else {
      const region = Regions.getName(this.props.facility.icao.substr(1, 2));
      return (region === '' ? 'UNKNOWN' : region);
    }
  }
}
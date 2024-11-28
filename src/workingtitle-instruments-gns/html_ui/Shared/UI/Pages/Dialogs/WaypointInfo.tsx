import {
  Facility, FacilitySearchType, FacilityType, FSComponent, GeoPoint, GeoPointSubject, GNSSEvents, ICAO, LatLonDisplay, NearestContext, Subject, VNode
} from '@microsoft/msfs-sdk';

import { Fms, Regions } from '@microsoft/msfs-garminsdk';

import { AlphaNumInput } from '../../Controls/AlphaNumInput';
import { Icons } from '../../Icons';
import { InteractionEvent } from '../../InteractionEvent';
import { PageProps, ViewService } from '../Pages';
import { Dialog } from './Dialog';

import './WaypointInfo.css';

/**
 * Props on the WaypointInfo page component.
 */
interface WaypointInfoProps extends PageProps {
  /** An instance of the flight management system. */
  fms: Fms;
}

/**
 * A page component that displays the waypoint info dialog box.
 */
export class WaypointInfo extends Dialog<WaypointInfoProps> {
  private debounceTimeout?: number;
  private readonly input = FSComponent.createRef<AlphaNumInput>();

  private readonly name = Subject.create('____________________');
  private readonly city = Subject.create('____________________');
  private readonly region = Subject.create('__________');
  private readonly message = Subject.create('TO ACCEPT');
  private readonly position = GeoPointSubject.create(new GeoPoint(NaN, NaN));

  private readonly icon = FSComponent.createRef<HTMLImageElement>();
  private facility?: Facility;
  private matchingIcaos: string[] = [];

  private resolve: (facility: Facility) => void = () => { };
  private readonly ppos = new GeoPoint(0, 0);

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.props.bus.getSubscriber<GNSSEvents>()
      .on('gps-position')
      .handle(pos => this.ppos.set(pos.lat, pos.long));
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {
    if (evt === InteractionEvent.CLR) {

      if (this.isInputActive()) {
        this.input.instance.focusSelf();
        this.clear();

        return true;
      } else {
        return false;
      }
    }

    if (evt === InteractionEvent.ENT) {
      if (this.matchingIcaos.length > 1 && this.facility !== undefined) {
        ViewService.resolveDups(ICAO.getIdent(this.facility.icao).trim(), this.matchingIcaos).then(this.resolve);
      } else if (this.matchingIcaos.length === 1 && this.facility !== undefined) {
        this.resolve(this.facility);
      }

      return true;
    }

    if (evt === InteractionEvent.FPL || evt === InteractionEvent.VNAV || evt === InteractionEvent.PROC || evt === InteractionEvent.DirectTo) {
      ViewService.back();

      if (evt === InteractionEvent.FPL) {
        return true;
      }
    }

    return super.onInteractionEvent(evt);
  }

  /**
   * Sets the promise resolution function for this dialog.
   * @param resolve The promise resolution function.
   */
  public setResolve(resolve: (facility: Facility) => void): void {
    this.resolve = resolve;
  }

  /** @inheritdoc */
  public onResume(): void {
    this.input.instance.enableSlots();
    const inputPrefix = NearestContext.getInstance().getRegionIdent();
    if (inputPrefix !== undefined) {
      this.input.instance.set(inputPrefix);
      this.onIdentChanged(inputPrefix);
    }

    super.onResume();
  }

  /** @inheritdoc */
  public onSuspend(): void {
    super.onSuspend();
    this.clear();
  }

  /**
   * Checks to see if the input is active by checking if any character slots
   * are focused.
   * @returns True if active, false otherwise.
   */
  private isInputActive(): boolean {
    for (let i = 0; i < this.input.instance.length; i++) {
      if (this.input.instance.getChild(i)?.isFocused) {
        return true;
      }
    }

    return false;
  }

  /**
   * Clears the waypoint info display.
   */
  private clear(): void {
    this.facility = undefined;
    this.matchingIcaos.length = 0;
    this.input.instance.set('');
    this.message.set('TO ACCEPT');

    this.updateName();
    this.updateCity();
    this.updateIcon();
    this.updateRegion();
    this.updatePosition();
  }

  /**
   * Handles when the ident is changed in the input control.
   * @param ident The new ident.
   */
  private async onIdentChanged(ident: string): Promise<void> {
    this.facility = undefined;
    this.matchingIcaos.length = 0;

    if (this.debounceTimeout !== undefined) {
      window.clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = window.setTimeout(() => this.loadIdent(ident), 250);
  }

  /**
   * Loads an ident into the waypoint display.
   * @param ident The ident to search for.
   */
  private async loadIdent(ident: string): Promise<void> {
    const icaos = await this.props.fms.facLoader.searchByIdent(FacilitySearchType.All, ident, 10);
    if (icaos.length !== 0) {
      const facilityIdent = ICAO.getIdent(icaos[0]).trim();
      this.input.instance.set(facilityIdent);

      this.matchingIcaos = icaos.filter(icao => ICAO.getIdent(icao).trim() === facilityIdent);
      if (this.matchingIcaos.length === 1) {
        this.message.set('TO ACCEPT');
      } else {
        this.message.set('FOR DUPS');
      }

      const facilities: Facility[] = await Promise.all(this.matchingIcaos.map(icao => this.props.fms.facLoader.getFacility(ICAO.getFacilityType(icao), icao)));
      this.facility = facilities.sort((a, b) => this.orderByPPosDistance(a, b))[0];
    }

    this.updateName();
    this.updateCity();
    this.updateIcon();
    this.updateRegion();
    this.updatePosition();
  }

  /**
   * Updates the facility name display.
   */
  private updateName(): void {
    if (this.facility !== undefined) {
      const name = Utils.Translate(this.facility.name).toUpperCase();
      this.name.set(name === '' ? ICAO.getIdent(this.facility.icao) : name.substr(0, 20));
    } else {
      this.name.set('____________________');
    }
  }

  /**
   * Updates the facility city display.
   */
  private updateCity(): void {
    if (this.facility !== undefined && this.facility.city !== '@') {
      const city = this.facility.city.split(', ').map(v => Utils.Translate(v)).join(', ').toUpperCase();
      this.city.set(city === '' ? ' ' : city.substr(0, 20));
    } else {
      this.city.set('____________________');
    }
  }

  /**
   * Updates the waypoint icon display.
   */
  private updateIcon(): void {
    if (this.facility !== undefined) {
      this.icon.instance.src = Icons.getByFacility(this.facility).src;
    } else {
      this.icon.instance.src = '';
    }
  }

  /**
   * Updates the waypoint region display.
   */
  private updateRegion(): void {
    if (this.facility !== undefined) {
      const facilityIdent = ICAO.getIdent(this.facility.icao).trim();

      if (ICAO.getFacilityType(this.facility.icao) === FacilityType.Airport) {
        let region = facilityIdent.length === 4 ? Regions.getName(facilityIdent.substr(0, 2)) : '';
        if (region === '' && this.facility.city !== '') {
          region = this.facility.city.split(', ').map(v => Utils.Translate(v)).join(', ');
        }

        this.region.set(region === '' ? ' ' : region.toUpperCase().substr(0, 10));
      } else {
        const region = Regions.getName(this.facility.icao.substr(1, 2));
        this.region.set(region === '' ? ' ' : region);
      }
    } else {
      this.region.set('__________');
    }
  }

  /**
   * Updates the waypoint lat/lon display.
   */
  private updatePosition(): void {
    if (this.facility !== undefined) {
      this.position.set(this.facility.lat, this.facility.lon);
    } else {
      this.position.set(NaN, NaN);
    }

  }

  /**
   * Orders facilities by their distance to the plane PPOS.
   * @param a The first facility.
   * @param b The second facility.
   * @returns The comparison order number.
   */
  private orderByPPosDistance(a: Facility, b: Facility): number {
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
  protected renderDialog(): VNode {
    return (
      <>
        <h2 class="cyan">WAYPOINT INFORMATION</h2>
        <hr />
        <div class='waypoint-info'>
          <h2>IDENT, FACILITY, & CITY</h2>
          <div class='waypoint-info-identbox'>
            <AlphaNumInput
              class='waypoint-info-input'
              onChanged={this.onIdentChanged.bind(this)}
              ref={this.input}
              gnsType={this.props.gnsType}
              enableKeyboard />
            <div class='waypoint-info-icon'>
              <img ref={this.icon} />
            </div>
            <div class='waypoint-info-region'>{this.region}</div>
            <div class='waypoint-info-name'>{this.name}</div>
            <div class='waypoint-info-city'>{this.city}</div>
          </div>
          <h2>POSITION</h2>
          <LatLonDisplay class={'waypoint-info-posbox'} location={this.position} />
          <div class='waypoint-info-msg'>
            PRESS <span class='waypoint-info-ent'>ENT</span> {this.message}
          </div>
        </div>
      </>
    );
  }
}
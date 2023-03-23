import {
  AirportFacility, ComputedSubject, Facility, FacilitySearchType, FSComponent, GeoPoint, GeoPointSubject, ICAO, IntersectionFacility, LatLonDisplay,
  NumberFormatter, NumberUnitSubject, Subject, Unit, UnitFamily, UnitType, UserFacility, VNode, VorFacility
} from '@microsoft/msfs-sdk';

import { Regions } from '@microsoft/msfs-garminsdk';

import { GnsFmsUtils } from '../../../Navigation/GnsFmsUtils';
import { GNSNumberUnitDisplay } from '../../Controls/GNSNumberUnitDisplay';
import { WaypointChangedEvent } from '../../Controls/WaypointSelection';
import { GNSUiControl } from '../../GNSUiControl';
import { InteractionEvent } from '../../InteractionEvent';
import { WaypointAirportPageMenu } from './WaypointAirportPageMenu';
import { WaypointPage, WaypointPageProps } from './WaypointPage';
import { WaypointPageIdentInput } from './WaypointPageIdentInput';

import './WaypointAirportPage.css';
import { ViewService } from '../Pages';

/**
 * WaypointAirportPage props
 */
interface WaypointAirportPageProps extends WaypointPageProps {
  /** The airport that is currently selected on the waypoint pages. */
  selectedAirport: Subject<AirportFacility | undefined>;
}

/**
 * WaypointAirportPage
 */
export class WaypointAirportPage extends WaypointPage<WaypointAirportPageProps> {
  protected readonly menu = new WaypointAirportPageMenu(this.props.bus, this.props.fms, (facility: string | undefined): void => {
    facility && this.waypointSelection.instance.setIdent(ICAO.getIdent(facility));
  });

  private readonly elevationUnit = Subject.create<Unit<UnitFamily.Distance>>(UnitType.FOOT);

  private readonly facilityName = ComputedSubject.create<AirportFacility | undefined, string>(undefined, (v: AirportFacility | undefined): string => {
    if (v === undefined) {
      return '__________________________';
    }
    const name = Utils.Translate(v.name).toUpperCase();
    return name === '' ? ICAO.getIdent(v.icao).toUpperCase() : name.substr(0, 20).toUpperCase();
  });

  private readonly facilityCity = ComputedSubject.create<AirportFacility | undefined, string>(undefined, (v: AirportFacility | undefined): string => {
    if (v === undefined) {
      return '________________________';
    }
    const city = v.city.split(', ').map(a => Utils.Translate(a)).join(', ');
    return city === '' ? ' ' : city.substr(0, 20).toUpperCase().toUpperCase();
  });

  private readonly facilityRegion = ComputedSubject.create<AirportFacility | undefined, string>(undefined, (v: AirportFacility | undefined): string => {
    if (v === undefined) {
      return '__________';
    }
    // airports don't have region codes in their ICAO strings, we will try to grab the code from the first 2
    // letters of the ident. However, some airports (e.g. in the US and those w/o 4-letter idents) don't use the
    // region code for the ident, so we need a third fallback, which is to just display the city name instead.
    const ident = ICAO.getIdent(v.icao).trim();
    let text = ident.length === 4 ? Regions.getName(ident.substr(0, 2)) : '';
    if (text === '' && v.city !== '') {
      text = v.city.split(', ').map(name => Utils.Translate(name)).join(', ');
    }

    if (text) {
      return text.toUpperCase();
    }
    return '';
  });

  private readonly position = GeoPointSubject.create(new GeoPoint(NaN, NaN));

  private readonly elevation = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));

  private readonly fuelType1 = ComputedSubject.create<AirportFacility | undefined, string>(undefined, (v: AirportFacility | undefined): string => {
    if (v === undefined) {
      return '';
    }
    return v.fuel1;
  });
  private readonly fuelType2 = ComputedSubject.create<AirportFacility | undefined, string>(undefined, (v: AirportFacility | undefined): string => {
    if (v === undefined) {
      return '';
    }
    return v.fuel2;
  });

  private readonly approachType = ComputedSubject.create<Facility | undefined, string>(undefined,
    (v: Facility | undefined): string => GnsFmsUtils.getBestApproachTypeString(v as AirportFacility, this.props.gnsType === 'wt430'));

  /** @inheritDoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.props.selectedAirport.sub(this.onAirportSelected.bind(this), true);

    this.onSuspend();
  }

  /** @inheritDoc */
  public onResume(): void {
    super.onResume();

    this.el.instance.classList.remove('hide-element');
    this.active = true;
    const airport = this.props.selectedAirport.get();
    if (airport !== undefined) {
      this.waypointSelection.instance.setIdent(ICAO.getIdent(airport.icao).trim(), false);
    }
    this.menu.onPlanChanged();
  }

  /**
   * Method to set the display values when the facility changes.
   * @param facility The Facility to load.
   */
  private onAirportSelected(facility?: AirportFacility): void {
    this.facilityName.set(facility);
    this.facilityCity.set(facility);
    this.facilityRegion.set(facility);
    this.fuelType1.set(facility);
    this.fuelType2.set(facility);
    this.approachType.set(facility);
    if (facility !== undefined) {
      this.position.set(facility.lat, facility.lon);
      this.elevation.set(facility.runways[0].elevation, UnitType.METER);
      this.waypointSelection.instance.setIdent(ICAO.getIdent(facility.icao).trim(), false);
    } else {
      this.elevation.set(NaN);
      this.position.set(NaN, NaN);
    }
  }

  /**
   * Handles when the input waypoint is changed.
   * @param e The waypoint change event to process.
   */
  private onWaypointChanged(e: WaypointChangedEvent): void {
    const airport = e.facility as (AirportFacility | undefined);
    this.props.selectedAirport.set(airport);
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
    const facility = this.props.selectedAirport.get();
    if (facility !== undefined) {
      ViewService.directToDialogWithIcao(facility.icao);
      return true;
    } else {
      return false;
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='page waypoint-page' ref={this.el}>
        <GNSUiControl ref={this.root} isolateScroll>
          <WaypointPageIdentInput
            selectedFacility={this.props.selectedAirport as Subject<AirportFacility | IntersectionFacility | VorFacility | UserFacility | undefined>}
            onChanged={this.onWaypointChanged.bind(this)}
            onFinalized={this.onWaypointFinalized.bind(this)}
            onPopupDonePressed={this.props.onPopupDonePressed}
            showDoneButton={this.props.isPopup}
            length={4}
            ppos={this.props.ppos}
            facilityLoader={this.props.fms.facLoader}
            title={'APT'}
            ref={this.waypointSelection}
            gnsType={this.props.gnsType}
            filter={FacilitySearchType.Airport}
          />

          <div class='waypoint-airport-location'>
            <h2>{this.props.gnsType === 'wt530' ? 'FACILITY, CITY & REGION' : 'FACILITY & CITY NAME'}</h2>
            <div>
              {this.facilityName}<br />
              {this.facilityCity}<br />
              {this.props.gnsType === 'wt530' && this.facilityRegion}
            </div>
          </div>

          <div class='waypoint-airport-position'>
            <h2>POSITION</h2>
            <LatLonDisplay location={this.position} />
          </div>

          <div class='waypoint-airport-elev'>
            <h2>ELEV</h2>
            <GNSNumberUnitDisplay
              formatter={NumberFormatter.create({ precision: 1, forceDecimalZeroes: false, maxDigits: 4, nanString: '____' })}
              value={this.elevation}
              displayUnit={this.elevationUnit}
            />
          </div>
          <div class='waypoint-airport-fuel'>
            <h2>FUEL</h2>
            <div>
              {this.fuelType1}
              {this.fuelType2}
            </div>
          </div>

          <div class='waypoint-airport-approach'>
            <h2>{this.props.gnsType === 'wt530' ? 'APPROACH' : 'APR'}</h2>
            <div>{this.approachType}</div>
          </div>
          <div class='waypoint-airport-radar'>
            <h2>RADAR</h2>
            <div></div>
          </div>
          <div class='waypoint-airport-airspace'>
            <h2>{this.props.gnsType === 'wt530' ? 'AIRSPACE' : 'ARSPC'}</h2>
            <div />
          </div>
        </GNSUiControl >

      </div >

    );
  }
}

import {
  Subject, GeoPointSubject, FSComponent, ICAO, ComputedSubject, GeoPoint, VNode, AirportFacility,
  IntersectionFacility, VorFacility, UserFacility, FacilitySearchType, LatLonDisplay
} from '@microsoft/msfs-sdk';
import { Regions } from '@microsoft/msfs-garminsdk';
import { WaypointChangedEvent } from '../../Controls/WaypointSelection';
import { GNSUiControl } from '../../GNSUiControl';
import { InteractionEvent } from '../../InteractionEvent';
import { WaypointPageIdentInput } from './WaypointPageIdentInput';
import { WaypointVorPageMenu } from './WaypointVorPageMenu';
import './WaypointVorPage.css';
import { WaypointPage, WaypointPageProps } from './WaypointPage';
import { ViewService } from '../Pages';

/**
 * WaypointVorPage Props
 */
interface WaypointVorPageProps extends WaypointPageProps {
  /** The Vor Facility that is currently selected on the waypoint pages. */
  selectedVor: Subject<VorFacility | undefined>;
}

/**
 * The WaypointVorPage page
 */
export class WaypointVorPage extends WaypointPage<WaypointVorPageProps> {
  protected readonly menu = new WaypointVorPageMenu();

  private readonly magvar = ComputedSubject.create<VorFacility | undefined, string>(undefined, (v: VorFacility | undefined): string => {

    if (v === undefined) {
      return '____°';
    }

    if (v.magneticVariation > 180) {
      const magV = v.magneticVariation * -1;
      const magVarCorrected = ((magV + 540) % 360 - 180);
      return 'E' + (Math.abs(magVarCorrected)).toFixed(0).padStart(3, '0') + '°';
    } else {
      const magV = 360 - v.magneticVariation;
      const magVarCorrected = ((magV + 540) % 360 - 180);
      return 'W' + (Math.abs(magVarCorrected)).toFixed(0).padStart(3, '0') + '°';
    }

  });

  private readonly facilityFrequency = ComputedSubject.create<VorFacility | undefined, string>(undefined, (v: VorFacility | undefined): string => {
    if (v === undefined) {
      return '____._';
    }
    return '' + v.freqMHz.toFixed(2);
  });

  private readonly facilityName = ComputedSubject.create<VorFacility | undefined, string>(undefined, (v: VorFacility | undefined): string => {
    if (v === undefined) {
      return '__________________________';
    }
    const name = Utils.Translate(v.name).toUpperCase();
    return name === '' ? ICAO.getIdent(v.icao).toUpperCase() : name.substr(0, 20).toUpperCase();
  });

  private readonly facilityCity = ComputedSubject.create<VorFacility | undefined, string>(undefined, (v: VorFacility | undefined): string => {
    if (v === undefined) {
      return '________________________';
    }
    const city = v.city.split(', ').map(a => Utils.Translate(a)).join(', ');
    return city === '' ? ' ' : city.substr(0, 20).toUpperCase().toUpperCase();
  });

  private readonly facilityRegion = ComputedSubject.create<VorFacility | undefined, string>(undefined, (v: VorFacility | undefined): string => {
    if (v === undefined) {
      return '__________';
    }
    return Regions.getName(v.icao.substring(1, 3));
  });

  private readonly position = GeoPointSubject.create(new GeoPoint(NaN, NaN));


  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.props.selectedVor.sub(this.onVorSelected.bind(this), true);
    this.onSuspend();
  }

  /** @inheritDoc */
  public onResume(): void {
    super.onResume();
    this.el.instance.classList.remove('hide-element');
    this.active = true;
    const vor = this.props.selectedVor.get();
    if (vor !== undefined) {
      this.waypointSelection.instance.setIdent(ICAO.getIdent(vor.icao).trim(), false);
    }
  }

  /**
   * Method to set the display values when the vor facility changes.
   * @param vor The Facility to load.
   */
  private onVorSelected(vor?: VorFacility): void {
    this.facilityName.set(vor);
    this.facilityCity.set(vor);
    this.facilityRegion.set(vor);
    this.facilityFrequency.set(vor);
    if (vor !== undefined) {
      this.position.set(vor.lat, vor.lon);
      this.waypointSelection.instance.setIdent(ICAO.getIdent(vor.icao).trim(), false);
      this.magvar.set(vor);
    } else {
      this.facilityFrequency.set(undefined);
      this.position.set(NaN, NaN);
      this.magvar.set(undefined);
    }
  }

  /**
   * Handles when the input waypoint is changed.
   * @param e The waypoint change event to process.
   */
  private onWaypointChanged(e: WaypointChangedEvent): void {
    const vor = e.facility as (VorFacility | undefined);
    this.props.selectedVor.set(vor);
  }

  /**
   * Handles when waypoint input is finalized.
   */
  private onWaypointFinalized(): void {
    this.waypointSelection.instance.focusSelf();
    this.root.instance.scroll('forward');
    this.root.instance.triggerEvent(InteractionEvent.RightInnerInc, this.root.instance);
  }

  /**
   * renders the Wx brodcast if its on the 430 or the 530
   * @returns the div that holds the content
   */
  private renderWxbrdcst(): VNode {
    if (this.props.gnsType === 'wt430') {
      return (<div></div>);
    } else {
      return (<div class='waypoint-vor-wxbrdcst'>WX BRDCST
        <div>
          No
        </div>
      </div>);
    }
  }

  /** @inheritDoc */
  protected onDirectPressed(): boolean {
    const facility = this.props.selectedVor.get();
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
            selectedFacility={this.props.selectedVor as Subject<AirportFacility | IntersectionFacility | VorFacility | UserFacility | undefined>}
            onChanged={this.onWaypointChanged.bind(this)}
            onFinalized={this.onWaypointFinalized.bind(this)}
            onPopupDonePressed={this.props.onPopupDonePressed}
            showDoneButton={this.props.isPopup}
            length={4}
            ppos={this.props.ppos}
            facilityLoader={this.props.fms.facLoader}
            title={'VOR'}
            ref={this.waypointSelection}
            filter={FacilitySearchType.Vor}
            gnsType={this.props.gnsType}
          />

          <div class='waypoint-vor-location'>FACILITY, CITY & REGION
            <div>
              {this.facilityName}<br />
              {this.facilityCity}<br />
              {this.facilityRegion}
            </div>
          </div>

          <div class='waypoint-vor-position'>POSITION
            <LatLonDisplay location={this.position} />
          </div>
          <div class='waypoint-vor-freq'>FREQ
            <div>
              {this.facilityFrequency}
            </div>
          </div>
          {this.renderWxbrdcst()}
          <div class='waypoint-vor-var'>
            <span>VAR</span>
            <div>
              {this.magvar}
            </div>
          </div>

        </GNSUiControl >

      </div >

    );
  }
}

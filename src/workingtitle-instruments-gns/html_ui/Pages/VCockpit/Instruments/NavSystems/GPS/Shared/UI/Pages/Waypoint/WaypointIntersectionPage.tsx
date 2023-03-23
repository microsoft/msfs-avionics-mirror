import {
  AirportFacility, ComputedSubject, Facility, FacilitySearchType, FSComponent, GeoPoint, GeoPointSubject, ICAO, IntersectionFacility,
  LatLonDisplay, NumberFormatter, NumberUnitSubject, Subject, Unit, UnitFamily, UnitType, UserFacility, VNode, VorFacility
} from '@microsoft/msfs-sdk';

import { Regions } from '@microsoft/msfs-garminsdk';

import { GNSNumberUnitDisplay } from '../../Controls/GNSNumberUnitDisplay';
import { WaypointChangedEvent } from '../../Controls/WaypointSelection';
import { GNSUiControl } from '../../GNSUiControl';
import { Icons } from '../../Icons';
import { InteractionEvent } from '../../InteractionEvent';
import { WaypointIntersectionMenu } from './WaypointIntersectionMenu';
import { WaypointPage, WaypointPageProps } from './WaypointPage';
import { WaypointPageIdentInput } from './WaypointPageIdentInput';

import './WaypointIntersectionPage.css';
import { ViewService } from '../Pages';

/**
 * WaypointIntersectionPage props
 */
interface WaypointIntersectionPageProps extends WaypointPageProps {
  /** The intersection that is currently selected on the waypoint pages. */
  selectedIntersection: Subject<IntersectionFacility | undefined>;
}

/**
 * WaypointIntersectionPage
 */
export class WaypointIntersectionPage extends WaypointPage<WaypointIntersectionPageProps> {
  protected readonly menu = new WaypointIntersectionMenu();

  private readonly iconVOR = FSComponent.createRef<HTMLImageElement>();
  private readonly distanceUnit = Subject.create<Unit<UnitFamily.Distance>>(UnitType.NMILE);
  private readonly degree = Subject.create<Unit<UnitFamily.Angle>>(UnitType.DEGREE);
  public readonly rad = NumberUnitSubject.create(UnitType.DEGREE.createNumber(NaN));
  public readonly dis = NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN));

  private readonly nearestVOR = ComputedSubject.create<IntersectionFacility | undefined, string>(undefined, (v: IntersectionFacility | undefined): string => {
    if (v === undefined) {
      return '____';
    }
    return ICAO.getIdent(v.nearestVorICAO);
  });
  private readonly facilityCity = ComputedSubject.create<IntersectionFacility | undefined, string>(undefined, (v: IntersectionFacility | undefined): string => {
    if (v === undefined) {
      return '________________________';
    }
    const city = v.city.split(', ').map(a => Utils.Translate(a)).join(', ');
    return city === '' ? ' ' : city.substr(0, 20).toUpperCase().toUpperCase();
  });

  private readonly facilityRegion = ComputedSubject.create<IntersectionFacility | undefined, string>(undefined, (v: IntersectionFacility | undefined): string => {
    if (v === undefined) {
      return '__________';
    }
    return Regions.getName(v.icao.substring(1, 3));

  });
  private readonly position = GeoPointSubject.create(new GeoPoint(NaN, NaN));

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.props.selectedIntersection.sub(this.onIntersectionSelected.bind(this), true);
    this.onSuspend();
  }

  /** @inheritDoc */
  public onResume(): void {
    super.onResume();

    this.el.instance.classList.remove('hide-element');
    this.active = true;
    const intersection = this.props.selectedIntersection.get();
    if (intersection !== undefined) {
      this.waypointSelection.instance.setIdent(ICAO.getIdent(intersection.icao).trim(), false);
    }
  }

  /**
   * gets the nearest vor facility then sets the icon
   * @param icao the icao of the facility
   */
  private async setNearestVorIcon(icao?: string): Promise<void> {

    if (!icao) {
      this.iconVOR.instance.src = '';
    } else {
      const facility = await this.props.fms.facLoader.getFacility(ICAO.getFacilityType(icao), icao);
      if (facility === undefined) {
        this.iconVOR.instance.src = '';
      } else {
        this.iconVOR.instance.src = Icons.getByFacility(facility as Facility).src;
      }
    }
  }

  /**
   * Method to set the display values when the Intersection Facility changes.
   * @param intersection The Facility to load.
   */
  private onIntersectionSelected(intersection?: IntersectionFacility): void {
    this.facilityCity.set(intersection);
    this.facilityRegion.set(intersection);

    if (intersection !== undefined) {
      this.position.set(intersection.lat, intersection.lon);
      this.nearestVOR.set(intersection);
      this.setNearestVorIcon(intersection.nearestVorICAO);
      this.rad.set(intersection.nearestVorMagneticRadial, UnitType.DEGREE);
      this.dis.set(intersection.nearestVorDistance, UnitType.METER);
      this.waypointSelection.instance.setIdent(ICAO.getIdent(intersection.icao).trim(), false);
    } else {
      this.nearestVOR.set(undefined);
      this.setNearestVorIcon();
      this.rad.set(NaN);
      this.iconVOR.instance.src = '';
      this.dis.set(NaN);
      this.position.set(NaN, NaN);
    }
  }

  /**
   * Handles when the input waypoint is changed.
   * @param e The waypoint change event to process.
   */
  private onWaypointChanged(e: WaypointChangedEvent): void {
    const intersection = e.facility as (IntersectionFacility | undefined);
    this.props.selectedIntersection.set(intersection);
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
    const facility = this.props.selectedIntersection.get();
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
            selectedFacility={this.props.selectedIntersection as Subject<AirportFacility | IntersectionFacility | VorFacility | UserFacility | undefined>}
            onChanged={this.onWaypointChanged.bind(this)}
            onFinalized={this.onWaypointFinalized.bind(this)}
            onPopupDonePressed={this.props.onPopupDonePressed}
            showDoneButton={this.props.isPopup}
            length={5}
            ppos={this.props.ppos}
            facilityLoader={this.props.fms.facLoader}
            title={'INT'}
            ref={this.waypointSelection}
            gnsType={this.props.gnsType}
            filter={FacilitySearchType.Intersection}
          />

          <div class='waypoint-intersection-region'>REGION
            <div>
              {this.facilityRegion}
            </div>
          </div>

          <div class='waypoint-intersection-position'>POSITION
            <LatLonDisplay location={this.position} />
          </div>

          <div class='waypoint-intersection-nearestvor'>
            NEAREST VOR
            <div>
              <div style="width: 40px; display: inline-block;">
                {this.nearestVOR}
              </div>
              <div class='waypoint-page-icon'>
                <img ref={this.iconVOR} />
              </div>
            </div>

          </div>
          <div class='waypoint-intersection-dis-and-rad'>
            <div class='waypoint-intersection-rad'>
              <h2 class='waypoint-intersection-rad-span'>RAD</h2>
              <GNSNumberUnitDisplay
                formatter={NumberFormatter.create({ precision: 1, pad: 3, forceDecimalZeroes: true, maxDigits: 3, nanString: '___' })}
                value={this.rad} displayUnit={this.degree}
              />
            </div>
            <div class='waypoint-intersection-dis'>
              <h2 class='waypoint-intersection-dis-span'>DIS</h2>
              <GNSNumberUnitDisplay
                formatter={NumberFormatter.create({ precision: -1, forceDecimalZeroes: true, maxDigits: 3, nanString: '__._' })}
                value={this.dis} displayUnit={this.distanceUnit}
              />
            </div>
          </div>

        </GNSUiControl >
      </div >
    );
  }
}

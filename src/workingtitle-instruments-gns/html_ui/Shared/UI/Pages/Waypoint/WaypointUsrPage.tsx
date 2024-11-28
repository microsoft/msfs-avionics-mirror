import {
  AirportFacility, FacilitySearchType, FSComponent, GeoPoint, GeoPointSubject, ICAO, IntersectionFacility, LatLonDisplay, NumberUnitSubject, Subject,
  Subscribable, Unit, UnitFamily, UnitType, UserFacility, VNode, VorFacility
} from '@microsoft/msfs-sdk';

import { GNSDigitInput } from '../../Controls/GNSDigitInput';
import { GNSVerticalUnitDisplay } from '../../Controls/GNSNumberUnitDisplay';
import { GNSNumberUnitInput } from '../../Controls/GNSNumberUnitInput';
import { WaypointChangedEvent, WaypointSelection } from '../../Controls/WaypointSelection';
import { GNSUiControl } from '../../GNSUiControl';
import { InteractionEvent } from '../../InteractionEvent';
import { WaypointPage, WaypointPageProps } from './WaypointPage';
import { WaypointPageIdentInput } from './WaypointPageIdentInput';
import { WaypointPageSelector } from './WaypointPageSelector';
import { WaypointUsrPageMenu } from './WaypointUsrPageMenu';

import './WaypointUsrPage.css';
import { ViewService } from '../Pages';

/**
 * WaypointUsrPage props
 */
interface WaypointUsrPageProps extends WaypointPageProps {
  /** The intersection that is currently selected on the waypoint pages. */
  selectedUsr: Subject<UserFacility | undefined>;
}

/**
 * WaypointUsrPage
 */
export class WaypointUsrPage extends WaypointPage<WaypointUsrPageProps> {
  protected readonly menu = new WaypointUsrPageMenu();

  private readonly distanceUnit = Subject.create<Unit<UnitFamily.Distance>>(UnitType.NMILE);
  private readonly angleUnit = Subject.create<Unit<UnitFamily.Angle>>(UnitType.DEGREE);

  private readonly rad1 = NumberUnitSubject.create(UnitType.DEGREE.createNumber(0));
  private readonly rad2 = NumberUnitSubject.create(UnitType.DEGREE.createNumber(0));

  readonly dis = NumberUnitSubject.create(UnitType.NMILE.createNumber(0));
  private readonly position = GeoPointSubject.create(new GeoPoint(NaN, NaN));

  private readonly refWpt1 = FSComponent.createRef<WaypointPageSelector>();
  private readonly refWpt2 = FSComponent.createRef<WaypointPageSelector>();

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.props.selectedUsr.sub(this.onUsrSelected.bind(this), true);
    this.onSuspend();
  }

  /** @inheritdoc */
  public onResume(): void {
    super.onResume();
    this.el.instance.classList.remove('hide-element');
    this.active = true;
    const intersection = this.props.selectedUsr.get();
    if (intersection !== undefined) {
      this.waypointSelection.instance.setIdent(ICAO.getIdent(intersection.icao).trim(), false);
    }
  }

  /**
   * Method to set the display values when the usr facility changes.
   * @param usr The Facility to load.
   */
  private onUsrSelected(usr?: UserFacility): void {
    if (usr !== undefined) {
      this.position.set(usr.lat, usr.lon);
      if (usr.reference1Radial !== undefined) {
        //this.rad1.set(usr.referenceFacility1, UnitType.DEGREE);
      } else {
        this.rad1.set(0);
      }

      this.waypointSelection.instance.setIdent(ICAO.getIdent(usr.icao).trim(), false);
    } else {

      this.rad1.set(0);

      //this.dis.set(NaN);
      this.position.set(NaN, NaN);
    }
  }


  /**
   * Callback to render an inactive value.
   * @param value The value to display.
   * @param unit The display unit of the value.
   * @returns a VNODE to render.
   */
  private renderInactiveValue<F extends string>(value: string, unit: Subscribable<Unit<F>>): VNode {
    return (
      <div>
        {value}
        <GNSVerticalUnitDisplay unit={unit} />
      </div>
    );
  }

  /**
   * Handles when the input waypoint is changed.
   * @param e The waypoint change event to process.
   */
  private onWaypointChanged(e: WaypointChangedEvent): void {
    const usr = e.facility as (UserFacility | undefined);
    this.props.selectedUsr.set(usr);
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
    const facility = this.props.selectedUsr.get();
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
            selectedFacility={this.props.selectedUsr as Subject<AirportFacility | IntersectionFacility | VorFacility | UserFacility | undefined>}
            onChanged={this.onWaypointChanged.bind(this)}
            onFinalized={this.onWaypointFinalized.bind(this)}
            onPopupDonePressed={this.props.onPopupDonePressed}
            showDoneButton={this.props.isPopup}
            length={5}
            ppos={this.props.ppos}
            facilityLoader={this.props.fms.facLoader}
            title={'USR'}
            ref={this.waypointSelection}
            gnsType={this.props.gnsType}
            filter={FacilitySearchType.User}
          />
          <div class='waypoint-runway-page-selectors'>
          </div>
          <div class='waypoint-usr-ref-wpt-1'>REF WPT
            <div>
              <WaypointSelection class={'waypoint-page-ident-input'} onChanged={this.onWaypointChanged.bind(this)} onFinalized={this.onWaypointFinalized.bind(this)} length={5}
                ppos={this.props.ppos} facilityLoader={this.props.fms.facLoader} ref={this.refWpt1} gnsType={this.props.gnsType} />
            </div>
          </div>
          <div class='waypoint-usr-rad-1'>RAD
            <div>
              <GNSNumberUnitInput
                data={this.rad1 as unknown as NumberUnitSubject<UnitFamily.Angle>}
                displayUnit={this.angleUnit}
                digitizer={(value, signValues, digitValues): void => {
                  digitValues[0].set(Math.floor(value / 1000));
                  digitValues[1].set(Math.floor((value % 1000) / 100));
                  digitValues[2].set(Math.floor((value % 100) / 10));
                  digitValues[3].set(Math.floor((value % 10) / 1));
                }}
                editOnActivate={false}
                class=''
                renderInactiveValue={(value): VNode => {
                  return this.renderInactiveValue(value.toFixed(0), this.angleUnit);
                }}
                onInputAccepted={(v): void => {
                  this.rad1.set(v, this.angleUnit.get());
                }}
              >
                <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={4} increment={1} scale={1000} wrap={true} />
                <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={7} increment={1} scale={100} wrap={true} />
                <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={10} wrap={true} />
                <span>.</span>
                <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1} wrap={true} />
                <GNSVerticalUnitDisplay unit={this.angleUnit} />
              </GNSNumberUnitInput>
            </div>
          </div>
          <div class='waypoint-usr-dis-1'>DIS
            <div>
              <GNSNumberUnitInput
                data={this.dis as unknown as NumberUnitSubject<UnitFamily.Distance>}
                displayUnit={this.distanceUnit}
                digitizer={(value, signValues, digitValues): void => {
                  digitValues[0].set(Math.floor(value / 1000));
                  digitValues[1].set(Math.floor((value % 1000) / 100));
                  digitValues[2].set(Math.floor((value % 100) / 10));
                  digitValues[3].set(Math.floor((value % 10) / 1));
                }}
                editOnActivate={false}
                class=''
                renderInactiveValue={(value): VNode => {
                  return this.renderInactiveValue(value.toFixed(0), this.distanceUnit);
                }}
                onInputAccepted={(v): void => {
                  this.dis.set(v, this.distanceUnit.get());
                }}
              >
                <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1000} wrap={true} />
                <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={100} wrap={true} />
                <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={10} wrap={true} />
                <span>.</span>
                <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1} wrap={true} />
                <GNSVerticalUnitDisplay unit={this.distanceUnit} />
              </GNSNumberUnitInput>
            </div>

          </div>
          <div class='waypoint-usr-ref-wpt-2'>
            <WaypointSelection class={'waypoint-page-ident-input'} onChanged={this.onWaypointChanged.bind(this)} onFinalized={this.onWaypointFinalized.bind(this)} length={5}
              ppos={this.props.ppos} facilityLoader={this.props.fms.facLoader} ref={this.refWpt2} gnsType={this.props.gnsType} />
          </div>

          <div class='waypoint-usr-rad-2'>
            <div>
              <GNSNumberUnitInput
                data={this.rad2 as unknown as NumberUnitSubject<UnitFamily.Angle>}
                displayUnit={this.angleUnit}
                digitizer={(value, signValues, digitValues): void => {
                  digitValues[0].set(Math.floor((value / 100)));
                  digitValues[1].set(Math.floor((value % 100) / 10));
                  digitValues[2].set(Math.floor((value % 10)));
                }}
                editOnActivate={false}
                class=''
                renderInactiveValue={(value): VNode => {
                  return this.renderInactiveValue(value.toFixed(0), this.angleUnit);
                }}
                onInputAccepted={(v): void => {
                  this.rad2.set(v, this.angleUnit.get());
                }}
              >
                <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={4} increment={1} scale={1000} wrap={true} />
                <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={7} increment={1} scale={100} wrap={true} />
                <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={10} wrap={true} />
                <span>.</span>
                <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1} wrap={true} />
                <GNSVerticalUnitDisplay unit={this.angleUnit} />
              </GNSNumberUnitInput>
            </div>
          </div>
          <div class='waypoint-usr-position'>
            POSITION
            <LatLonDisplay location={this.position} />
          </div>
        </GNSUiControl >
      </div >
    );
  }
}

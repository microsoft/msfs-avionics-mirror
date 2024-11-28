import {
  Subject, AirportFacility, FSComponent, FacilityFrequency, ArraySubject, VNode,
  IntersectionFacility, VorFacility, UserFacility, FacilitySearchType, ICAO, ComRadioIndex, NavRadioIndex
} from '@microsoft/msfs-sdk';
import { GnsFmsUtils } from '../../../Navigation/GnsFmsUtils';
import { WaypointChangedEvent } from '../../Controls/WaypointSelection';
import { GNSUiControl, GNSUiControlList, GNSUiControlProps } from '../../GNSUiControl';
import { InteractionEvent } from '../../InteractionEvent';
import { WaypointPageIdentInput } from './WaypointPageIdentInput';
import { WaypointAirportPageMenu } from './WaypointAirportPageMenu';
import { WaypointPage, WaypointPageProps } from './WaypointPage';

import './WaypointFrequenciesPage.css';
import { ViewService } from '../Pages';

/**
 * WaypointFrequenciesPageProps props
 */
interface WaypointFrequenciesPageProps extends WaypointPageProps {
  /** The airport that is currently selected on the waypoint pages. */
  selectedAirport: Subject<AirportFacility | undefined>;

  /** The COM radio index to use. */
  comIndex: ComRadioIndex;

  /** The unit's nav radio index. */
  navIndex: NavRadioIndex;
}

/**
 * WaypointFrequenciesPage
 */
export class WaypointFrequenciesPage extends WaypointPage<WaypointFrequenciesPageProps> {
  private readonly frequencyListRef = FSComponent.createRef<GNSUiControlList<FacilityFrequency>>();
  private readonly frequenciesUnavailableRef = FSComponent.createRef<HTMLDivElement>();

  private readonly frequencyList = ArraySubject.create<FacilityFrequency>();

  protected readonly menu = new WaypointAirportPageMenu(this.props.bus, this.props.fms, (facility: string | undefined): void => {
    facility && this.waypointSelection.instance.setIdent(ICAO.getIdent(facility));
  });

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.props.selectedAirport.sub(this.onAirportSelected.bind(this), true);
    this.onSuspend();
  }

  /** @inheritdoc */
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
    this.frequencyList.clear();
    if (facility !== undefined) {
      this.waypointSelection.instance.setIdent(ICAO.getIdent(facility.icao).trim(), false);
    }
    if (facility && facility.frequencies.length > 0) {
      this.frequencyList.insertRange(0, facility.frequencies);
      this.frequenciesUnavailableRef.instance.classList.add('hide-element');
    }
    if (this.frequencyList.length === 0) {
      this.frequenciesUnavailableRef.instance.classList.remove('hide-element');
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

  /**
   * Sets the standby com radio frequency.
   * @param facilityFrequency The facility frequency to set to the standby radio frequency.
   */
  public setStandbyFrequency = (facilityFrequency: FacilityFrequency): void => {
    if (facilityFrequency.freqMHz < 118) {
      SimVar.SetSimVarValue(`K:${this.props.navIndex === 1 ? 'NAV1' : 'NAV2'}_STBY_SET`, 'number', facilityFrequency.freqBCD16);
    } else {
      SimVar.SetSimVarValue(`K:${this.props.comIndex === 1 ? 'COM' : 'COM2'}_STBY_RADIO_SET`, 'number', facilityFrequency.freqBCD16);
    }
  };

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

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="page waypoint-page" ref={this.el}>
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
          <div class='waypoint-frequencies-table'>
            <div class='facility-frequency-unavailable' ref={this.frequenciesUnavailableRef}>Frequencies Unavailable</div>

            <GNSUiControlList<FacilityFrequency>
              orderBy={(a, b): number => GnsFmsUtils.orderFacilityFrequencies(a, b)}
              data={this.frequencyList}
              renderItem={(data: FacilityFrequency): VNode => <FrequencyListItem facilityFrequency={data} onSelected={this.setStandbyFrequency} />}
              ref={this.frequencyListRef}
              class={''} />
          </div>
        </GNSUiControl>
      </div >
    );
  }
}

/**
 * Props on the waypoint frequency control.
 */
interface FrequencyListItemProps extends GNSUiControlProps {
  /** The facility frequency to display. */
  facilityFrequency: FacilityFrequency;

  /** A callback called when a facility frequency is selected. */
  onSelected: (facilityFrequency: FacilityFrequency) => void;
}

/**
 * A frequency item in the facility frequency list.
 */
class FrequencyListItem extends GNSUiControl<FrequencyListItemProps> {
  private readonly frequencyRef = FSComponent.createRef<HTMLDivElement>();

  /** @inheritdoc */
  protected onFocused(): void {
    this.frequencyRef.instance.classList.add('selected');

  }

  /** @inheritdoc */
  protected onBlurred(): void {
    this.frequencyRef.instance.classList.remove('selected');
  }

  /** @inheritdoc */
  public onEnt(): boolean {
    this.props.onSelected(this.props.facilityFrequency);
    return true;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='facility-frequency'>
        <div class='facility-frequency-type'>{GnsFmsUtils.getFacilityFrequencyType(this.props.facilityFrequency)}</div>
        <div ref={this.frequencyRef} class='facility-frequency-frequency'>{this.props.facilityFrequency.freqMHz.toFixed(3)}</div>
      </div>
    );
  }
}

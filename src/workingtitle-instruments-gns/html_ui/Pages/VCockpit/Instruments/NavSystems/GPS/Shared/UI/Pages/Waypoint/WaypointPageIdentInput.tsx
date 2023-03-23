import {
  AirportFacility,
  ComponentProps,
  ComputedSubject,
  DisplayComponent,
  Facility,
  FacilityLoader,
  FacilitySearchType,
  FacilityType,
  FocusPosition,
  FSComponent,
  GeoPointSubject,
  ICAO,
  IntersectionFacility,
  NdbFacility,
  Subject,
  UserFacility,
  VNode,
  VorFacility
} from '@microsoft/msfs-sdk';
import { GnsFmsUtils } from '../../../Navigation/GnsFmsUtils';
import { GNSType } from '../../../UITypes';
import { SelectableText } from '../../Controls/SelectableText';
import { WaypointChangedEvent, WaypointSelection } from '../../Controls/WaypointSelection';
import { Icons } from '../../Icons';

/**
 * Props on the WaypointSelection control.
 */
interface WaypointPageIdentInputProps extends ComponentProps {

  /** The facility that is currently selected on the waypoint pages. */
  selectedFacility: Subject<AirportFacility | IntersectionFacility | VorFacility | UserFacility | undefined>;

  /** An event that fires when the waypoint input is changed. */
  onChanged: (e: WaypointChangedEvent) => void;

  /** An event that fires when the selection is finalized. */
  onFinalized: () => void;

  /**
   * Callback for when the "Done" button associated with a popup page is pressed
   */
  onPopupDonePressed: () => void,

  /**
   * Whether to show the "Done ?" button
   */
  showDoneButton: Subject<boolean>,

  /** The number of characters in the waypoint selection. */
  length: number;

  /** The present GPS position to search against. */
  ppos: GeoPointSubject;

  /** The facility loader to use to load facilities. */
  facilityLoader: FacilityLoader;

  /** The page title string. */
  title: string;

  /** The facility search type to filter by. */
  filter?: FacilitySearchType;

  /** The GNS type */
  gnsType: GNSType;

  /** The CSS class to apply to this control. */
  class?: string;
}

/**
 * A control that allows a waypoint to be selected via an alphanumeric input.
 */
export class WaypointPageIdentInput extends DisplayComponent<WaypointPageIdentInputProps> {
  private readonly waypointSelection = FSComponent.createRef<WaypointSelection>();
  private readonly icon = FSComponent.createRef<HTMLImageElement>();
  private readonly airportPrivacy = ComputedSubject.create<AirportFacility | undefined, string>(undefined,
    (v: AirportFacility | undefined): string => GnsFmsUtils.getAirportPrivateTypeString(v));

  private readonly doneButtonContainer = FSComponent.createRef<HTMLSpanElement>();
  private readonly doneButton = FSComponent.createRef<SelectableText>();

  /** @inheritDoc */
  public onAfterRender(): void {
    this.doneButton.instance.setDisabled(true);

    this.props.selectedFacility.sub(this.onFacilitySelected.bind(this), true);
    this.props.showDoneButton?.sub(show => {
      if (show) {
        this.doneButtonContainer.instance.classList.remove('hide-element');
        this.doneButton.instance.setDisabled(false);
      } else {
        this.doneButtonContainer.instance.classList.add('hide-element');
        this.doneButton.instance.setDisabled(true);
      }
    });
  }

  /**
   * Updates the waypoint icon and privacy text display.
   * @param facility The Selected Facility.
   */
  private onFacilitySelected(facility: NdbFacility | AirportFacility | IntersectionFacility | VorFacility | UserFacility | undefined): void {

    if (facility && ICAO.getFacilityType(facility.icao) === FacilityType.Airport) {
      this.airportPrivacy.set(facility as AirportFacility);
    } else {
      this.airportPrivacy.set(undefined);
    }

    if (facility !== undefined) {
      this.icon.instance.src = Icons.getByFacility(facility as Facility).src;
    } else {
      this.icon.instance.src = '';
    }
  }

  /**
   * Passes a focus-self to the WaypointSelection component.
   */
  public focusSelf(): void {
    if (this.props.showDoneButton?.get()) {
      this.doneButton.instance.focus(FocusPosition.First);
    } else {
      this.waypointSelection.instance.focusSelf();
    }
  }

  /**
   * Sets the ident in the WaypointSelection component.
   * @param ident The ident to set.
   * @param notify Whether or not to call the onChanged callback when set.
   */
  public setIdent(ident: string, notify = true): void {
    this.waypointSelection.instance.setIdent(ident, notify);
  }

  /**
   * Sets the facility in the waypoint input control.
   * @param facility The facility to set.
   * @param notify Whether or not to call the onChanged callback when set.
   */
  public setFacility(facility: Facility | undefined, notify = true): void {
    this.waypointSelection.instance.setFacility(facility, notify);
  }

  /**
   * Shows the Keyboard icon.
   * @param display Boolean to show keyboard icon.
   */
  public displayKeyboardIcon(display: boolean): void {
    this.waypointSelection.instance.displayKeyboardIcon(display);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={this.props.class ?? 'waypoint-page-header'}>
        <span class='waypoint-page-title'>{this.props.title}</span>
        <div class='waypoint-page-inputbox'>
          <WaypointSelection class={'waypoint-page-ident-input'} onChanged={this.props.onChanged.bind(this)} onFinalized={this.props.onFinalized.bind(this)} length={this.props.length}
            ppos={this.props.ppos} facilityLoader={this.props.facilityLoader} filter={this.props.filter} ref={this.waypointSelection} gnsType={this.props.gnsType} />
          <div class='waypoint-page-icon'>
            <img ref={this.icon} />
          </div>
          <div class='waypoint-page-privacy'>{this.airportPrivacy}</div>
        </div>

        {/* TODO add question mark when font support it */}
        <span ref={this.doneButtonContainer} class="hide-element">
          <SelectableText
            ref={this.doneButton}
            class="waypoint-page-done"
            selectedClass="selected-white"
            data={Subject.create('Done?')}
            onEnt={(): boolean => {
              this.props.onPopupDonePressed?.();
              return true;
            }}
          />
        </span>
      </div>
    );
  }
}
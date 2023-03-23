import {
  Facility, FacilityLoader, FacilitySearchType, FSComponent,
  GeoPointSubject, ICAO, VNode
} from '@microsoft/msfs-sdk';

import { GNSUiControl, GNSUiControlProps } from '../GNSUiControl';
import { ViewService } from '../Pages/Pages';
import { AlphaNumInput } from './AlphaNumInput';
import { GNSType } from '../../UITypes';

/**
 * An event emitted when a waypoint is changed in the waypoint input control.
 */
export interface WaypointChangedEvent {
  /** The facility that was the closest match. */
  facility?: Facility;

  /** The list of ICAOs that were a potential match given the ident. */
  matchingIcaos: string[];
}

/**
 * Props on the WaypointSelection control.
 */
interface WaypointSelectionProps extends GNSUiControlProps {
  /** An event that fires when the waypoint input is changed. */
  onChanged: (e: WaypointChangedEvent) => void;

  /** An event that fires when the selection is finalized. */
  onFinalized: () => void;

  /** The facility search type to filter by. */
  filter?: FacilitySearchType;

  /** The number of characters in the waypoint selection. */
  length: number;

  /** The present GPS position to search against. */
  ppos: GeoPointSubject;

  /** The CSS class to apply to this control. */
  class?: string;

  /** The facility loader to use to load facilities. */
  facilityLoader: FacilityLoader;

  /** The GNS type */
  gnsType: GNSType;
}

/**
 * A control that allows a waypoint to be selected via an alphanumeric input.
 */
export class WaypointSelection extends GNSUiControl<WaypointSelectionProps> {
  private readonly input = FSComponent.createRef<AlphaNumInput>();

  private facility?: Facility;
  private matchingIcaos: string[] = [];
  private debounceTimeout?: number;

  private currentRequestId = 0;

  /**
   * Handles when the ident is changed in the input control.
   * @param ident The new ident.
   * @param index The input index that changed.
   * @param changedTo The value the input index changed to.
   */
  private onInputChanged(ident: string, index: number, changedTo: string): void {
    this.facility = undefined;
    this.matchingIcaos.length = 0;

    if (this.debounceTimeout !== undefined) {
      window.clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = window.setTimeout(() => this.loadIdent(ident, ++this.currentRequestId, changedTo === '_'), 250);
  }

  /**
   * Loads an ident into the waypoint display.
   * @param ident The ident to search for.
   * @param requestId The ID of the ident search request to process.
   * @param exactOnly Whether or not to return only an exact match.
   */
  private async loadIdent(ident: string, requestId: number, exactOnly: boolean): Promise<void> {
    let icaos = await this.props.facilityLoader.searchByIdent(this.props.filter ?? FacilitySearchType.AllExceptVisual, ident, 10);
    if (icaos.length !== 0) {
      if (this.props.filter === FacilitySearchType.Intersection) {
        icaos = icaos.filter(icao => icao[0] === 'W');
        if (icaos.length < 1) {
          this.props.onChanged({ matchingIcaos: [] });
          return;
        }
      }
      const facilityIdent = ICAO.getIdent(icaos[0]).trim();
      const matchingIcaos = exactOnly
        ? icaos.filter(icao => ICAO.getIdent(icao).trim() === ident)
        : icaos.filter(icao => ICAO.getIdent(icao).trim() === facilityIdent);

      const facilities: Facility[] = await Promise.all(matchingIcaos.map(icao => this.props.facilityLoader.getFacility(ICAO.getFacilityType(icao), icao)));

      if (this.currentRequestId === requestId && facilities.length > 0) {
        this.facility = facilities.sort((a, b) => this.orderByPPosDistance(a, b))[0];
        this.matchingIcaos = matchingIcaos;
        this.input.instance.set(facilityIdent);

        this.props.onChanged({ facility: this.facility, matchingIcaos: this.matchingIcaos });
      } else if (this.currentRequestId === requestId) {
        this.props.onChanged({ matchingIcaos: this.matchingIcaos });
      }
    } else {
      this.props.onChanged({ matchingIcaos: [] });
    }
  }

  /** @inheritdoc */
  public onEnt(): boolean {
    if (this.matchingIcaos.length > 1 && this.facility !== undefined) {
      ViewService.resolveDups(ICAO.getIdent(this.facility.icao).trim(), this.matchingIcaos)
        .then(fac => {
          if (this.facility?.icao !== fac.icao) {
            this.facility = fac;
            this.props.onChanged({ facility: this.facility, matchingIcaos: this.matchingIcaos });
          }

          this.props.onFinalized();
        });
    }

    if (this.matchingIcaos.length === 1) {
      this.props.onFinalized();
    }

    return true;
  }
  /** @inheritdoc */
  public onRightKnobPush(): boolean {
    if (this.isFocused) {
      if (this.input.instance.isEditing) {
        this.focusSelf();
        return true;
      }
    }
    return false;
  }

  /** @inheritdoc */
  public onRightInnerInc(): boolean {
    if (!this.input.instance.isEditing) {
      return this.input.instance.onRightInnerInc();
    }
    return false;
  }

  /** @inheritdoc */
  public onRightInnerDec(): boolean {
    if (!this.input.instance.isEditing) {
      return this.input.instance.onRightInnerDec();
    }
    return false;
  }

  /** @inheritdoc */
  protected onFocused(): void {
    this.focusSelf();
  }

  /**
   * Sets the ident in the waypoint input.
   * @param ident The ident to set.
   * @param notify Whether or not to call the onChanged callback when set.
   */
  public setIdent(ident: string, notify = true): void {
    this.input.instance.set(ident);
    if (notify) {
      this.onInputChanged(ident, 0, ident[0]);
    }
  }

  /**
   * Sets the facility in the waypoint input control.
   * @param facility The facility to set.
   * @param notify Whether or not to call the onChanged callback when set.
   */
  public setFacility(facility: Facility | undefined, notify = true): void {
    this.facility = facility;
    this.matchingIcaos.length = 0;

    if (facility !== undefined) {
      const ident = ICAO.getIdent(facility.icao).trim();
      this.input.instance.set(ident);
      this.matchingIcaos.push(facility.icao);

      if (notify) {
        this.props.onChanged({ facility, matchingIcaos: [facility.icao] });
      }
    } else {
      this.input.instance.set('');
      if (notify) {
        this.props.onChanged({ facility, matchingIcaos: [] });
      }
    }
  }

  /**
   * Shifts focus to the control itself and not the children.
   */
  public focusSelf(): void {
    this.input.instance.focusSelf();
  }

  /**
   * Enables the individual alphanumeric input slots.
   */
  public enableSlots(): void {
    this.input.instance.enableSlots();
  }

  /**
   * Disables the individual alphanumeric input slots.
   */
  public disableSlots(): void {
    this.input.instance.disableSlots();
  }

  /**
   * Disables the individual alphanumeric input slots.
   */
  public disableInput(): void {
    this.disableSlots();
  }

  /**
   * Makes the inactive value initially visible.
   */
  public setVisible(): void {
    this.input.instance.setDisabled(false);
    this.disableSlots();
  }

  /**
   * Shows the Keyboard icon.
   * @param display Boolean to show keyboard icon.
   */
  public displayKeyboardIcon(display: boolean): void {
    this.input.instance.displayKeyboardIcon(display);
  }


  /**
   * Orders facilities by their distance to the plane PPOS.
   * @param a The first facility.
   * @param b The second facility.
   * @returns The comparison order number.
   */
  private orderByPPosDistance(a: Facility, b: Facility): number {
    const aDist = this.props.ppos.get().distance(a.lat, a.lon);
    const bDist = this.props.ppos.get().distance(b.lat, b.lon);

    if (aDist < bDist) {
      return -1;
    }

    if (aDist > bDist) {
      return 1;
    }

    return 0;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <AlphaNumInput class={`waypoint-input ${this.props.class ?? ''}`} length={this.props.length}
          onChanged={this.onInputChanged.bind(this)} ref={this.input} gnsType={this.props.gnsType} enableKeyboard />
      </>
    );
  }
}
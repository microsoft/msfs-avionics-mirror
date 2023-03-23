import {
  AirportFacility, AirportRunway, ComputedSubject, FacilitySearchType, FSComponent, ICAO, IntersectionFacility, NumberFormatter, NumberUnitSubject,
  RunwayLightingType, RunwaySurfaceCategory, RunwayUtils, Subject, Unit, UnitFamily, UnitType, UserFacility, VNode, VorFacility
} from '@microsoft/msfs-sdk';

import { AirportWaypoint, GarminFacilityWaypointCache } from '@microsoft/msfs-garminsdk';

import { GNSSettingsProvider } from '../../../Settings/GNSSettingsProvider';
import { GNSNumberUnitDisplay } from '../../Controls/GNSNumberUnitDisplay';
import { WaypointChangedEvent } from '../../Controls/WaypointSelection';
import { GNSUiControl } from '../../GNSUiControl';
import { InteractionEvent } from '../../InteractionEvent';
import { GNSMapBuilder } from '../Map/GNSMapBuilder';
import { GNSMapController } from '../Map/GNSMapController';
import { GNSMapContextProps, GNSMapControllers, GNSMapKeys, GNSMapLayers, GNSMapModules } from '../Map/GNSMapSystem';
import { WaypointPage, WaypointPageProps } from './WaypointPage';
import { WaypointPageIdentInput } from './WaypointPageIdentInput';
import { WaypointPageSelector } from './WaypointPageSelector';

import './WaypointRunwayPage.css';
import { ViewService } from '../Pages';

/** A type describing the arc map controllers. */
type GNSStandardMapControllers = GNSMapControllers & {

  /** The root map controller instance. */
  [GNSMapKeys.Controller]: GNSMapController;
}

/**
 * Props on the WaypointRunwayPageProps page.
 */
interface WaypointRunwayPageProps extends WaypointPageProps {
  /** The airport that is currently selected on the waypoint pages. */
  selectedAirport: Subject<AirportFacility | undefined>;

  /** The settings provider for map and other settings. */
  settingsProvider: GNSSettingsProvider;
}

/**
 * The airport runway page.
 */
export class WaypointRunwayPage extends WaypointPage<WaypointRunwayPageProps> {
  private readonly runways = FSComponent.createRef<WaypointPageSelector>();

  private readonly distanceUnit = Subject.create<Unit<UnitFamily.Distance>>(UnitType.FOOT);
  private readonly runwayLength = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));
  private readonly runwayWidth = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));
  private readonly runwaySurface = ComputedSubject.create<AirportRunway | undefined, string>(undefined, v => {
    const suffix = this.props.gnsType === 'wt530' ? ' Surface' : '';

    if (v !== undefined) {
      switch (RunwayUtils.getSurfaceCategory(v)) {
        case RunwaySurfaceCategory.Hard:
          return `HARD${suffix}`;
        case RunwaySurfaceCategory.Soft:
          return `SOFT${suffix}`;
        case RunwaySurfaceCategory.Water:
          return `WATER${suffix}`;
        default:
          return `UNKNOWN${suffix}`;
      }
    }
    return '';
  });
  private readonly runwayLighting = ComputedSubject.create<AirportRunway | undefined, string>(undefined, v => {
    if (v !== undefined) {
      switch (v.lighting) {
        case RunwayLightingType.FullTime:
          return 'FULL TIME';
        case RunwayLightingType.PartTime:
          return 'PART TIME';
        case RunwayLightingType.Frequency:
          return 'PILOT CONTROLLED';
        case RunwayLightingType.None:
          return 'NO LIGHTS';
        default:
          return '';
      }
    }
    return '';
  });

  private selectedRunway?: number;

  private readonly AirportMap = GNSMapBuilder
    .withAirportMap(this.props.bus, this.props.settingsProvider, this.props.gnsType, this.props.instrumentIndex)
    .withController(GNSMapKeys.Controller, c => new GNSMapController(c, this.props.settingsProvider, this.props.fms.flightPlanner))
    .build<GNSMapModules, GNSMapLayers, GNSStandardMapControllers, GNSMapContextProps>('waypoint-runway-page-map');

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
      this.waypointSelection.instance.setFacility(airport, false);
    }

    this.AirportMap.ref.instance.wake();
  }

  /** @inheritdoc */
  public onSuspend(): void {
    super.onSuspend();
    this.AirportMap.ref.instance.sleep();
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {
    if (evt === InteractionEvent.RangeIncrease) {
      this.AirportMap.context.getController(GNSMapKeys.Controller).increaseRange();
      return true;
    } else if (evt === InteractionEvent.RangeDecrease) {
      this.AirportMap.context.getController(GNSMapKeys.Controller).decreaseRange();
      return true;
    }

    let handled = false;
    if (this.root.instance.isFocused) {
      handled = this.root.instance.onInteractionEvent(evt);
    }

    if (handled) {
      return handled;
    }

    return super.onInteractionEvent(evt);
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
   * Handles when a new airport is selected in the page group.
   * @param airport The airport that was selected.
   */
  private onAirportSelected(airport: AirportFacility | undefined): void {
    if (airport !== undefined) {
      this.runways.instance.setItems(airport.runways.map(runway => this.buildRunwayName(runway)));
      this.waypointSelection.instance.setIdent(ICAO.getIdent(airport.icao).trim(), false);

      this.onRunwaySelected(0);
    }
  }

  /**
   * Handles when an runway has been selected for an airport.
   * @param index The index of the approach.
   */
  private onRunwaySelected(index: number): void {
    if (index < 0) {
      return;
    }

    const airport = this.props.selectedAirport.get();
    if (airport !== undefined) {
      const runway = airport.runways[index];

      this.runwayLength.set(runway.length, UnitType.METER);
      this.runwayWidth.set(runway.width, UnitType.METER);

      this.runwaySurface.set(runway);
      this.runwayLighting.set(runway);

      const airportWaypoint = GarminFacilityWaypointCache.getCache(this.props.bus).get(airport) as AirportWaypoint;
      this.AirportMap.context.getController(GNSMapKeys.Controller).focusAirport(airportWaypoint, index);
    } else {
      this.runwayLength.set(NaN);
      this.runwayWidth.set(NaN);
      this.runwaySurface.set(undefined);
      this.runwayLighting.set(undefined);

      this.AirportMap.context.getController(GNSMapKeys.Controller).unfocusAirport();
    }
  }

  /**
   * Handles when waypoint input is finalized.
   */
  private onWaypointFinalized(): void {
    this.waypointSelection.instance.focusSelf();
    this.root.instance.scroll('forward');
    this.runways.instance.openPopout();
  }

  /**
   * Builds a text based runway name for selection display.
   * @param runway The runway to build the name for.
   * @returns The runway name.
   */
  private buildRunwayName(runway: AirportRunway): string {
    const hypenIndex = runway.designation.indexOf('-');
    let runway1 = runway.designation.substring(0, hypenIndex).trim().padStart(2, '0');
    let runway2 = runway.designation.substring(hypenIndex + 1).trim().padStart(2, '0');
    runway1 += RunwayUtils.getDesignatorLetter(runway.designatorCharPrimary);
    runway2 += RunwayUtils.getDesignatorLetter(runway.designatorCharSecondary);
    return runway1 + '-' + runway2;
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

  /** @inheritdoc */
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
          <div class='waypoint-page-body'>
            {this.AirportMap.map}
            <div class='waypoint-runway-page-selectors'>
              <WaypointPageSelector class='runway' label='RUNWAY' onSelected={this.onRunwaySelected.bind(this)} ref={this.runways} />
              <div class='waypoint-runway-page-databox-label'>INFO</div>
              <div class='waypoint-runway-page-databox' style="padding-top: 4px">
                <GNSNumberUnitDisplay
                  formatter={NumberFormatter.create({ precision: 1, forceDecimalZeroes: false, maxDigits: 5, nanString: '' })}
                  value={this.runwayLength} displayUnit={this.distanceUnit}
                  class={'waypoint-runway-length'}
                />
                <div style='margin-left: 41px; margin-top: 3px; font-size: 12px; float: left;'>X</div>
                <GNSNumberUnitDisplay
                  formatter={NumberFormatter.create({ precision: 1, forceDecimalZeroes: false, maxDigits: 3, nanString: '' })}
                  value={this.runwayWidth} displayUnit={this.distanceUnit}
                  class={'waypoint-runway-width'}
                />

                {this.props.gnsType === 'wt430' && (
                  <>
                    <span class="waypoint-runway-surface-type">{this.runwaySurface}</span>
                    <span class="waypoint-runway-lighting">{this.runwayLighting}</span>
                  </>
                )}
              </div>

              {this.props.gnsType === 'wt530' && (
                <>
                  <div class='waypoint-runway-page-databox' style='padding-left: 18px; padding-top: 4px; word-break: break-word; line-height: 15px; text-indent: -15px;'>
                    {this.runwaySurface}
                  </div>
                  <div class='waypoint-runway-page-databox' style="padding-left: 0; padding-right: 0; padding-top: 4px; white-space: nowrap;">
                    {this.runwayLighting}
                  </div>
                </>
              )}
            </div>
          </div>
        </GNSUiControl>
      </div>
    );
  }
}

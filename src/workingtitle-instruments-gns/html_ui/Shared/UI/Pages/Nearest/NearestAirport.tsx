import {
  AirportFacility, CombinedSubject, FacilityFrequency, FSComponent, GeoPoint, GeoPointSubject, ICAO, MagVar, NearestContext, OneWayRunway, RunwayUtils, Subject,
  SubscribableArrayEventType, UnitType, VNode
} from '@microsoft/msfs-sdk';
import { GnsFmsUtils } from '../../../Navigation/GnsFmsUtils';
import { SelectableText } from '../../Controls/SelectableText';
import { GNSUiControl, GNSUiControlList, GNSUiControlProps } from '../../GNSUiControl';
import { Icons } from '../../Icons';
import { GnsNearestPagesOutputEvents } from './GnsNearestPagesOutputEvents';
import { NearestFacilityPage, NearestFacilityPageProps } from './NearestFacilityPage';
import './NearestAirport.css';
import { GNSVerticalUnitDisplay } from '../../Controls/GNSNumberUnitDisplay';
import { ViewService } from '../Pages';
import { InteractionEvent } from '../../InteractionEvent';

/**
 * Props for {@link NearestAirport}
 */
export interface NearestAirportProps extends NearestFacilityPageProps {
  /**
   * Callback for when an airport is selected to be displayed on the WPT APT page
   */
  onAirportSelected: () => void,
}

/**
 * NEAREST AIRPORT page
 */
export class NearestAirport extends NearestFacilityPage<AirportFacility, NearestAirportProps> {
  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    NearestContext.onInitialized((instance) => {
      instance.airports.sub((index, type, item) => {
        switch (type) {
          case SubscribableArrayEventType.Added:
            this.facilities.insert(item as AirportFacility, index);
            break;
          case SubscribableArrayEventType.Removed:
            this.facilities.removeAt(index);
            break;
          case SubscribableArrayEventType.Cleared:
            this.facilities.clear();
            break;
        }
      });
    });
  }

  /**
   * Handles an airport being selected
   *
   * @param icao the airport FS ICAO
   *
   * @returns true
   */
  private handleAirportSelected(icao: string): boolean {
    this.props.bus.getPublisher<GnsNearestPagesOutputEvents>().pub('gns_nearest_pages_select_wpt_apt', icao);
    this.props.onAirportSelected();
    return true;
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {

    if ((evt === InteractionEvent.RightInnerInc || evt === InteractionEvent.RightInnerDec) && this.list.instance.isFocused) {
      return true;
    } else {

      return super.onInteractionEvent(evt);
    }
  }

  /**
   * Sets the standby com radio frequency.
   * @param facilityFrequency The facility frequency to set to the standby radio frequency.
   */
  public handleSetStandbyFrequency(facilityFrequency: FacilityFrequency): void {
    if (facilityFrequency.freqMHz < 118) {
      SimVar.SetSimVarValue(`K:${this.props.navIndex === 1 ? 'NAV1' : 'NAV2'}_STBY_SET`, 'number', facilityFrequency.freqBCD16);
    } else {
      SimVar.SetSimVarValue(`K:${this.props.comIndex === 1 ? 'COM' : 'COM2'}_STBY_RADIO_SET`, 'number', facilityFrequency.freqBCD16);
    }
  }

  /** @inheritDoc */
  render(): VNode {
    return (
      <div ref={this.el} class="aux-page hide-element">
        <div class='aux-page-header' />
        <div class='aux-table-header'>NEAREST AIRPORT</div>

        <div class="aux-table-labels-nearest-airport">
          <div><span>APT</span></div>
          <div><span>BRG</span></div>
          <div><span>DIS</span></div>
          <div><span>APR</span></div>
        </div>

        <div class="aux-table nearest-airport-table">
          <GNSUiControlList<AirportFacility>
            ref={this.list}
            orderBy={(a, b): number => {
              const aPos = new GeoPoint(a.lat, a.lon);
              const aDistanceGARadians = this.ppos.get().distance(aPos);
              const aDistanceNM = UnitType.GA_RADIAN.convertTo(aDistanceGARadians, UnitType.NMILE);

              const bPos = new GeoPoint(b.lat, b.lon);
              const bDistanceGARadians = this.ppos.get().distance(bPos);
              const bDistanceNM = UnitType.GA_RADIAN.convertTo(bDistanceGARadians, UnitType.NMILE);

              return aDistanceNM - bDistanceNM;
            }}
            data={this.facilities}
            renderItem={(data): VNode => (
              <NearestAirportItem
                facility={data}
                ppos={this.ppos}
                onSelected={(): boolean => this.handleAirportSelected(data.icao)}
                onFrequencySelected={(freq): void => this.handleSetStandbyFrequency(freq)}
              />
            )}
            isolateScroll
          />
        </div>
      </div>
    );
  }
}

/**
 * Props for {@link NearestAirportItem}
 */
interface NearestAirportItemProps extends GNSUiControlProps {
  /**
   * The airport facility for this item
   */
  facility: AirportFacility,

  /**
   * Aircraft PPOS
   */
  ppos: GeoPointSubject,

  /**
   * Callback when airport ICAO selected
   */
  onSelected: () => void,

  /**
   * Callback when airport Tower/CTAF frequency set
   */
  onFrequencySelected: (freq: FacilityFrequency) => void,
}

/**
 * Item for the NEAREST AIRPORT page
 */
class NearestAirportItem extends GNSUiControl<NearestAirportItemProps> {
  private readonly icon = FSComponent.createRef<HTMLImageElement>();

  private readonly runway = Subject.create<OneWayRunway | null>(null);

  private readonly airportLla = GeoPointSubject.create(new GeoPoint(0, 0));

  private readonly mainFrequency = Subject.create<FacilityFrequency | null>(null);

  /** @inheritDoc */
  onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.airportLla.set(this.props.facility.lat, this.props.facility.lon);

    this.runway.set(this.findBestRunway());

    this.mainFrequency.set(this.findMainFrequency());

    this.icon.instance.src = Icons.getByFacility(this.props.facility).src;
  }

  /**
   * Finds the longest one way runway in an airport facility
   *
   * @returns the one way runway
   */
  private findBestRunway(): OneWayRunway | null {
    let longest: OneWayRunway | null = null;

    for (let i = 0; i < this.props.facility.runways.length; i++) {
      const runway = this.props.facility.runways[i];

      const onrWayRunways = RunwayUtils.getOneWayRunways(runway, i);

      if (onrWayRunways[0].length > (longest?.length ?? -1)) {
        longest = onrWayRunways[0];
      }

      if (onrWayRunways[1].length > (longest?.length ?? -1)) {
        longest = onrWayRunways[1];
      }
    }

    return longest;
  }

  /**
   * Finds the main airport facility frequency to display
   *
   * @returns a facility frequency
   */
  private findMainFrequency(): FacilityFrequency {
    const types = GnsFmsUtils.towerOrCtafFrequencyTypes;

    return (this.props.facility.frequencies
      .filter((it) => types.includes(it.type))
      .sort((a, b) => types.indexOf(a.type) - types.indexOf(b.type))
    )[0];
  }

  private readonly bearing = CombinedSubject.create(this.props.ppos, this.airportLla).map(([ppos, airportLla]) => {
    const magBearing = MagVar.trueToMagnetic(ppos.bearingTo(airportLla), ppos);

    return magBearing.toFixed(0).padStart(3, '0');
  });

  private readonly distance = CombinedSubject.create(this.props.ppos, this.airportLla).map(([ppos, airportLla]) => {
    const distanceGARadians = airportLla.distance(ppos);
    const distanceNM = UnitType.GA_RADIAN.convertTo(distanceGARadians, UnitType.NMILE);

    return distanceNM.toFixed(1);
  });

  private readonly mainFrequencyType = this.mainFrequency.map((it) => {
    if (it) {
      return GnsFmsUtils.towerOrCtafFrequencyShortName.get(it.type);
    } else {
      return '___';
    }
  });

  private readonly mainFrequencyString = this.mainFrequency.map((it) => {
    if (it) {
      return it.freqMHz.toFixed(3);
    } else {
      return '___.___';
    }
  });

  private readonly runwayLength = this.runway.map((it) => {
    if (!it) {
      return '';
    }

    const lengthFeet = UnitType.METER.convertTo(it.length, UnitType.FOOT);

    return lengthFeet.toFixed(0);
  });

  /**
   * Handles the Tower/CTAF frequency being pressed ENTon
   *
   * @returns if the event was handled
   */
  private handleFrequencyEnt(): boolean {
    const freq = this.mainFrequency.get();
    if (freq) {
      this.props.onFrequencySelected(freq);
      return true;
    }
    return false;
  }

  /** @inheritDoc */
  public onDirectTo(): boolean {
    if (this.props.facility !== undefined) {
      ViewService.directToDialogWithIcao(this.props.facility.icao);
      return true;
    } else {
      return false;
    }
  }

  /** @inheritDoc */
  render(): VNode {
    return (
      <span class="aux-entry nearest-airport-item">
        <span class="nearest-airport-info-container">
          <SelectableText class="nearest-airport-icao" data={Subject.create((ICAO.getIdent(this.props.facility.icao)))} onEnt={(): boolean => {
            this.props.onSelected();
            return true;
          }} />
          <div class="nearest-airport-icon">
            <img ref={this.icon} />
          </div>
        </span>

        <span class="nearest-airport-brg">
          {this.bearing}
          <GNSVerticalUnitDisplay unit={Subject.create(UnitType.DEGREE)} />
        </span>

        <span class="nearest-airport-dis">
          {this.distance}
          <GNSVerticalUnitDisplay unit={Subject.create(UnitType.NMILE)} />
        </span>

        <span class="nearest-airport-apr">
          {GnsFmsUtils.getBestApproachTypeString(this.props.facility)}
        </span>

        <span class="nearest-airport-frequency-container">
          <span class="nearest-airport-freqtype">
            {this.mainFrequencyType}
          </span>
          <SelectableText class="nearest-airport-frequency" data={this.mainFrequencyString} onEnt={this.handleFrequencyEnt.bind(this)} />
        </span>

        <span className="nearest-airport-runway-length-label">rwy</span>

        <span class="nearest-airport-runway-length">
          {this.runwayLength}
          <GNSVerticalUnitDisplay unit={Subject.create(UnitType.FOOT)} />
        </span>
      </span>
    );
  }
}

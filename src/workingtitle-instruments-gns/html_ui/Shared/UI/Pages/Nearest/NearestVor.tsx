import {
  CombinedSubject, FSComponent, GeoPoint, GeoPointSubject,
  ICAO, MagVar, NearestContext, Subject, SubscribableArrayEventType, UnitType, VNode, VorFacility
} from '@microsoft/msfs-sdk';

import { GNSVerticalUnitDisplay } from '../../Controls/GNSNumberUnitDisplay';
import { SelectableText } from '../../Controls/SelectableText';
import { GNSUiControl, GNSUiControlList, GNSUiControlProps } from '../../GNSUiControl';
import { Icons } from '../../Icons';
import { InteractionEvent } from '../../InteractionEvent';
import { ViewService } from '../Pages';
import { GnsNearestPagesOutputEvents } from './GnsNearestPagesOutputEvents';
import { NearestFacilityPage, NearestFacilityPageProps } from './NearestFacilityPage';

import './NearestVor.css';

/**
 * Props for {@link NearestVor}
 */
export interface NearestVorProps extends NearestFacilityPageProps {
  /**
   * Callback for when a VOR is selected to be displayed on the WPT VOR page
   */
  onVorSelected: () => void,
}

/**
 * NEAREST VOR page.
 */
export class NearestVor extends NearestFacilityPage<VorFacility, NearestVorProps> {
  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    NearestContext.onInitialized((instance) => {
      instance.vors.sub((index, type, item) => {
        switch (type) {
          case SubscribableArrayEventType.Added:
            this.facilities.insert(item as VorFacility, index);
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

  /** @inheritdoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {

    if ((evt === InteractionEvent.RightInnerInc || evt === InteractionEvent.RightInnerDec) && this.list.instance.isFocused) {
      return true;
    } else {

      return super.onInteractionEvent(evt);
    }
  }

  /**
   * Handles a VOR being selected
   *
   * @param icao the VOR FS ICAO
   *
   * @returns true
   */
  private handleVorSelected(icao: string): boolean {
    this.props.bus.getPublisher<GnsNearestPagesOutputEvents>().pub('gns_nearest_pages_select_wpt_vor', icao);
    this.props.onVorSelected();
    return true;
  }

  /**
   * Sets the standby vor radio frequency.
   * @param facility The facility frequency to set to the standby radio frequency.
   * @returns If the method finishes.
   */
  private setStandbyFrequency(facility: VorFacility | null): boolean {

    if (facility !== null) {
      if (facility.freqMHz < 118) {
        SimVar.SetSimVarValue(`K:${this.props.navIndex === 1 ? 'NAV1' : 'NAV2'}_STBY_SET`, 'number', facility.freqBCD16);
      } else {
        SimVar.SetSimVarValue(`K:${this.props.comIndex === 1 ? 'COM' : 'COM2'}_STBY_RADIO_SET`, 'number', facility.freqBCD16);
      }
      return true;
    }
    return false;
  }

  /** @inheritDoc */
  render(): VNode {
    return (
      <div ref={this.el} class="aux-page hide-element">
        <div class='aux-page-header' />
        <div class='aux-table-header'>NEAREST VOR</div>

        <div class="aux-table-labels-nearest-vor">
          <div><span>VOR</span></div>
          <div><span>BRG</span></div>
          <div><span>DIS</span></div>
          <div><span>FREQ</span></div>
        </div>

        <div class="aux-table nearest-vor-table">
          <GNSUiControlList<VorFacility>
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
              <NearestVorItem
                facility={data}
                ppos={this.ppos}
                onSelected={(): boolean => this.handleVorSelected(data.icao)}
                onFrequencySelected={(): boolean => this.setStandbyFrequency(data)}
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
 * Props for {@link NearestVorItem}
 */
interface NearestVorItemProps extends GNSUiControlProps {
  /**
   * The airport facility for this item
   */
  facility: VorFacility,

  /**
   * Aircraft PPOS
   */
  ppos: GeoPointSubject,

  /**
   * Callback when VOR ICAO selected
   */
  onSelected: () => boolean,

  /**
   * Callback when VOR frequency selected
   */
  onFrequencySelected: () => boolean,
}

/**
 * Nearest NDB list item
 */
class NearestVorItem extends GNSUiControl<NearestVorItemProps> {
  private readonly icon = FSComponent.createRef<HTMLImageElement>();

  private readonly vorLla = GeoPointSubject.create(new GeoPoint(0, 0));

  private readonly ident = Subject.create(ICAO.getIdent(this.props.facility.icao));

  private readonly mainFrequency = Subject.create<number | null>(null);

  private readonly bearing = CombinedSubject.create(this.props.ppos, this.vorLla).map(([ppos, airportLla]) => {
    const magBearing = MagVar.trueToMagnetic(ppos.bearingTo(airportLla), ppos);

    return magBearing.toFixed(0).padStart(3, '0');
  });

  private readonly distance = CombinedSubject.create(this.props.ppos, this.vorLla).map(([ppos, airportLla]) => {
    const distanceGARadians = airportLla.distance(ppos);
    const distanceNM = UnitType.GA_RADIAN.convertTo(distanceGARadians, UnitType.NMILE);

    return distanceNM.toFixed(1);
  });

  private readonly mainFrequencyString = this.mainFrequency.map((it) => {
    if (it) {
      return it.toFixed(2);
    } else {
      return '___.__';
    }
  });

  /** @inheritDoc */
  onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.vorLla.set(this.props.facility.lat, this.props.facility.lon);

    this.mainFrequency.set(this.props.facility.freqMHz);

    this.icon.instance.src = Icons.getByFacility(this.props.facility).src;
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
      <span class="aux-entry nearest-vor-item">
        <span>
          <SelectableText class="nearest-vor-item-icao" data={this.ident} onEnt={this.props.onSelected} />

          <img class="nearest-vor-item-icon-img" ref={this.icon} />
        </span>

        <span class="nearest-vor-item-brg">
          {this.bearing}
          <GNSVerticalUnitDisplay unit={Subject.create(UnitType.DEGREE)} />
        </span>

        <span class="nearest-vor-item-dis">
          {this.distance}
          <GNSVerticalUnitDisplay unit={Subject.create(UnitType.NMILE)} />
        </span>

        <span class="nearest-vor-item-freq">
          <SelectableText class="nearest-vor-item-freq-num" data={this.mainFrequencyString} onEnt={this.props.onFrequencySelected} />
        </span>
      </span>
    );
  }
}
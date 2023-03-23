import {
  CombinedSubject, FSComponent, GeoPoint, GeoPointSubject, ICAO, IntersectionFacility, MagVar, NearestContext, Subject, SubscribableArrayEventType, UnitType,
  VNode
} from '@microsoft/msfs-sdk';
import { GNSVerticalUnitDisplay } from '../../Controls/GNSNumberUnitDisplay';

import { SelectableText } from '../../Controls/SelectableText';
import { GNSUiControl, GNSUiControlList, GNSUiControlProps } from '../../GNSUiControl';
import { Icons } from '../../Icons';
import { InteractionEvent } from '../../InteractionEvent';
import { ViewService } from '../Pages';
import { GnsNearestPagesOutputEvents } from './GnsNearestPagesOutputEvents';
import { NearestFacilityPage, NearestFacilityPageProps } from './NearestFacilityPage';

import './NearestIntersection.css';

/**
 * Props for {@link NearestIntersection}
 */
export interface NearestIntersectionProps extends NearestFacilityPageProps {
  /**
   * Callback for when an intersection is selected to be displayed on the WPT INT page
   */
  onIntersectionSelected: () => void,
}

/**
 * NEAREST INTERSECTION page
 */
export class NearestIntersection extends NearestFacilityPage<IntersectionFacility, NearestIntersectionProps> {
  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    NearestContext.onInitialized((instance) => {
      instance.intersections.sub((index, type, item) => {
        switch (type) {
          case SubscribableArrayEventType.Added:
            this.facilities.insert(item as unknown as IntersectionFacility, index);
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
   * Handles an intersection being selected
   *
   * @param icao the intersection FS ICAO
   *
   * @returns true
   */
  private handleIntersectionSelected(icao: string): boolean {
    this.props.bus.getPublisher<GnsNearestPagesOutputEvents>().pub('gns_nearest_pages_select_wpt_int', icao);
    this.props.onIntersectionSelected();
    return true;
  }

  /** @inheritDoc */
  render(): VNode {
    return (
      <div ref={this.el} class="aux-page hide-element">
        <div class='aux-page-header' />
        <div class='aux-table-header'>NEAREST INTERSECTION</div>

        <div class="nearest-intersection-labels">
          <div><span>INT</span></div>
          <div></div>
          <div><span>BRG</span></div>
          <div><span>DIS</span></div>
        </div>

        <div class="aux-table nearest-intersection-table">
          <GNSUiControlList<IntersectionFacility>
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
              <NearestIntersectionItem
                facility={data}
                ppos={this.ppos}
                onSelected={(): boolean => this.handleIntersectionSelected(data.icao)}
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
 * Props for {@link NearestIntersectionItem}
 */
interface NearestIntersectionItemProps extends GNSUiControlProps {
  /**
   * The intersection facility for this item
   */
  facility: IntersectionFacility,

  /**
   * Aircraft PPOS
   */
  ppos: GeoPointSubject,

  /**
   * Callback when airport ICAO selected
   */
  onSelected: () => boolean,

}

/**
 * Nearest intersection list item
 */
class NearestIntersectionItem extends GNSUiControl<NearestIntersectionItemProps> {
  private readonly icon = FSComponent.createRef<HTMLImageElement>();

  private readonly airportLla = GeoPointSubject.create(new GeoPoint(0, 0));

  private readonly ident = Subject.create(ICAO.getIdent(this.props.facility.icao));

  private readonly bearing = CombinedSubject.create(this.props.ppos, this.airportLla).map(([ppos, airportLla]) => {
    const magBearing = MagVar.trueToMagnetic(ppos.bearingTo(airportLla), ppos);

    return magBearing.toFixed(0).padStart(3, '0');
  });

  private readonly distance = CombinedSubject.create(this.props.ppos, this.airportLla).map(([ppos, airportLla]) => {
    const distanceGARadians = airportLla.distance(ppos);
    const distanceNM = UnitType.GA_RADIAN.convertTo(distanceGARadians, UnitType.NMILE);

    return distanceNM.toFixed(1);
  });

  /** @inheritDoc */
  onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.airportLla.set(this.props.facility.lat, this.props.facility.lon);

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
      <span class="aux-entry nearest-intersection-item">
        <span>
          <SelectableText class="nearest-intersection-item-icao" data={this.ident} onEnt={this.props.onSelected} />
        </span>

        <span class="nearest-intersection-item-icon">
          <img class="nearest-intersection-item-icon-img" ref={this.icon} />
        </span>

        <span class="nearest-intersection-item-brg">
          {this.bearing}
          <GNSVerticalUnitDisplay unit={Subject.create(UnitType.DEGREE)} />
        </span>

        <span class="nearest-intersection-item-dis">
          {this.distance}
          <GNSVerticalUnitDisplay unit={Subject.create(UnitType.NMILE)} />
        </span>
      </span>
    );
  }
}
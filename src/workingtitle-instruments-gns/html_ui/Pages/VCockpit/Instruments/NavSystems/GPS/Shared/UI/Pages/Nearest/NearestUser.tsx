import {
  CombinedSubject, FSComponent, GeoPoint, GeoPointSubject, ICAO, MagVar, NearestContext, Subject, SubscribableArrayEventType, UnitType, UserFacility,
  UserFacilityUtils, VNode
} from '@microsoft/msfs-sdk';
import { GNSVerticalUnitDisplay } from '../../Controls/GNSNumberUnitDisplay';
import { SelectableText } from '../../Controls/SelectableText';
import { GNSUiControl, GNSUiControlList, GNSUiControlProps } from '../../GNSUiControl';
import { Icons } from '../../Icons';
import { InteractionEvent } from '../../InteractionEvent';
import { ViewService } from '../Pages';
import { GnsNearestPagesOutputEvents } from './GnsNearestPagesOutputEvents';
import { NearestFacilityPage, NearestFacilityPageProps } from './NearestFacilityPage';

import './NearestUser.css';

/**
 * Props for {@link NearestUser}
 */
export interface NearestUserProps extends NearestFacilityPageProps {
  /**
   * Callback for when a user facility is selected to be displayed on the WPT INT page
   */
  onUsrSelected: () => void,
}

/**
 * NEAREST USER page
 */
export class NearestUser extends NearestFacilityPage<UserFacility, NearestUserProps> {
  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    NearestContext.onInitialized((instance) => {
      instance.usrs.sub((index, type, item) => {
        switch (type) {
          case SubscribableArrayEventType.Added:
            this.facilities.insert(item as unknown as UserFacility, index);
            break;
          case SubscribableArrayEventType.Removed:
            this.facilities.removeAt(index);
            break;
          case SubscribableArrayEventType.Cleared:
            this.facilities.clear();
            break;
        }
        this.ensureListContainsPaddingItems();
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
   * Ensures the facility list has padding items
   */
  private ensureListContainsPaddingItems(): void {
    const listSize = this.facilities.length;

    if (listSize < 8) {
      let iterCount = 0;
      while (this.facilities.length < 8 && iterCount < 8) {
        iterCount++;
        this.facilities.insert(UserFacilityUtils.createFromLatLon(ICAO.emptyIcao, 0, 0, true, ''), this.facilities.length);
      }
    } else if (listSize > 8) {
      let iterCount = 0;
      while (this.facilities.get(this.facilities.length - 1)?.icao === ICAO.emptyIcao && iterCount < 8) {
        iterCount++;
        this.facilities.removeAt(this.facilities.length - 1);
      }
    }
  }

  /**
   * Handles a user facility being selected
   *
   * @param icao the user facility FS ICAO
   *
   * @returns true
   */
  private handleIntersectionSelected(icao: string): boolean {
    this.props.bus.getPublisher<GnsNearestPagesOutputEvents>().pub('gns_nearest_pages_select_wpt_usr', icao);
    this.props.onUsrSelected();
    return true;
  }

  /** @inheritDoc */
  render(): VNode {
    return (
      <div ref={this.el} class="aux-page hide-element">
        <div class='aux-page-header' />
        <div class='aux-table-header'>NEAREST USER</div>

        <div class="aux-table-labels aux-table-labels-nearest-user cyan">
          <div><span>USR</span></div>
          <div></div>
          <div><span>BRG</span></div>
          <div><span>DIS</span></div>
        </div>

        <div class="aux-table nearest-user-table">
          <GNSUiControlList<UserFacility>
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
              <NearestUserItem
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
 * Props for {@link NearestUserItem}
 */
interface NearestUserItemProps extends GNSUiControlProps {
  /**
   * The user facility for this item
   */
  facility: UserFacility,

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
 * Nearest user list item
 */
class NearestUserItem extends GNSUiControl<NearestUserItemProps> {
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

    if (this.props.facility.icao !== ICAO.emptyIcao) {
      this.icon.instance.src = Icons.getByFacility(this.props.facility).src;
    }
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
    if (this.props.facility.icao === ICAO.emptyIcao) {
      return (
        <span class="aux-entry nearest-user-item">
          <span>
            <SelectableText class="nearest-user-item-icao" data={Subject.create('_____')} onEnt={this.props.onSelected} />
          </span>

          <span class="nearest-user-item-icon">
            <img class="nearest-user-item-icon-img" ref={this.icon} />
          </span>

          <span class="nearest-user-item-brg">
            ___
            <GNSVerticalUnitDisplay unit={Subject.create(UnitType.DEGREE)} />
          </span>

          <span class="nearest-user-item-dis">
            ___
            <GNSVerticalUnitDisplay unit={Subject.create(UnitType.NMILE)} />
          </span>
        </span>
      );
    }

    return (
      <span class="aux-entry nearest-user-item">
        <span>
          <SelectableText class="nearest-user-item-icao" data={this.ident} onEnt={this.props.onSelected} />
        </span>

        <span class="nearest-user-item-icon">
          <img class="nearest-user-item-icon-img" ref={this.icon} />
        </span>

        <span class="nearest-user-item-brg">
          {this.bearing}
          <GNSVerticalUnitDisplay unit={Subject.create(UnitType.DEGREE)} />
        </span>

        <span class="nearest-user-item-dis">
          {this.distance}
          <GNSVerticalUnitDisplay unit={Subject.create(UnitType.NMILE)} />
        </span>
      </span>
    );
  }
}
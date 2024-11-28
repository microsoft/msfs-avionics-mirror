import {
  CombinedSubject, FSComponent, GeoPoint, GeoPointSubject, ICAO, MagVar, NdbFacility, NearestContext, Subject, SubscribableArrayEventType, UnitType, VNode
} from '@microsoft/msfs-sdk';
import { GNSVerticalUnitDisplay } from '../../Controls/GNSNumberUnitDisplay';

import { SelectableText } from '../../Controls/SelectableText';
import { GNSUiControl, GNSUiControlList, GNSUiControlProps } from '../../GNSUiControl';
import { Icons } from '../../Icons';
import { InteractionEvent } from '../../InteractionEvent';
import { ViewService } from '../Pages';
import { GnsNearestPagesOutputEvents } from './GnsNearestPagesOutputEvents';
import { NearestFacilityPage, NearestFacilityPageProps } from './NearestFacilityPage';

import './NearestNdb.css';

/**
 * Props for {@link NearestNdb}
 */
export interface NearestNdbPageProps extends NearestFacilityPageProps {
  /**
   * Callback for when an NDB is selected to be displayed on the WPT NDB page
   */
  onNdbSelected: () => void,
}

/**
 * NEAREST NDB page
 */
export class NearestNdb extends NearestFacilityPage<NdbFacility, NearestNdbPageProps> {
  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    NearestContext.onInitialized((instance) => {
      instance.ndbs.sub((index, type, item) => {
        switch (type) {
          case SubscribableArrayEventType.Added:
            this.facilities.insert(item as NdbFacility, index);
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
   * Handles an NDB being selected
   *
   * @param icao the NDB FS ICAO
   *
   * @returns true
   */
  private handeNdbSelected(icao: string): boolean {
    this.props.bus.getPublisher<GnsNearestPagesOutputEvents>().pub('gns_nearest_pages_select_wpt_ndb', icao);
    this.props.onNdbSelected();
    return true;
  }

  /** @inheritDoc */
  render(): VNode {
    return (
      <div ref={this.el} class="aux-page hide-element">
        <div class='aux-page-header' />
        <div class='aux-table-header'>NEAREST NDB</div>

        <div class="aux-table-labels-nearest-ndb">
          <div><span>NDB</span></div>
          <div><span>BRG</span></div>
          <div><span>DIS</span></div>
          <div><span>FREQ</span></div>
        </div>

        <div class="aux-table nearest-intersection-table">
          <GNSUiControlList<NdbFacility>
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
              <NearestNdbItem
                facility={data}
                ppos={this.ppos}
                onSelected={(): boolean => this.handeNdbSelected(data.icao)}
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
 * Props for {@link NearestNdbItem}
 */
interface NearestNdbItemProps extends GNSUiControlProps {
  /**
   * The airport facility for this item
   */
  facility: NdbFacility,

  /**
   * Aircraft PPOS
   */
  ppos: GeoPointSubject,

  /**
   * Callback when NDB ICAO selected
   */
  onSelected: () => boolean,
}

/**
 * Nearest NDB list item
 */
class NearestNdbItem extends GNSUiControl<NearestNdbItemProps> {
  private readonly icon = FSComponent.createRef<HTMLImageElement>();

  private readonly ndbLla = GeoPointSubject.create(new GeoPoint(0, 0));

  private readonly ident = Subject.create(ICAO.getIdent(this.props.facility.icao));

  private readonly mainFrequency = Subject.create<number | null>(null);

  private readonly bearing = CombinedSubject.create(this.props.ppos, this.ndbLla).map(([ppos, airportLla]) => {
    const magBearing = MagVar.trueToMagnetic(ppos.bearingTo(airportLla), ppos);

    return magBearing.toFixed(0).padStart(3, '0');
  });

  private readonly distance = CombinedSubject.create(this.props.ppos, this.ndbLla).map(([ppos, airportLla]) => {
    const distanceGARadians = airportLla.distance(ppos);
    const distanceNM = UnitType.GA_RADIAN.convertTo(distanceGARadians, UnitType.NMILE);

    return distanceNM.toFixed(1);
  });

  private readonly mainFrequencyString = this.mainFrequency.map((it) => {
    if (it) {
      return it.toFixed(1);
    } else {
      return '___._';
    }
  });

  /** @inheritDoc */
  onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.ndbLla.set(this.props.facility.lat, this.props.facility.lon);

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
      <span class="aux-entry nearest-ndb-item">
        <span>
          <SelectableText class="nearest-ndb-item-icao" data={this.ident} onEnt={this.props.onSelected} />

          <img class="nearest-ndb-item-icon-img" ref={this.icon} />
        </span>

        <span class="nearest-ndb-item-brg">
          {this.bearing}
          <GNSVerticalUnitDisplay unit={Subject.create(UnitType.DEGREE)} />
        </span>

        <span class="nearest-ndb-item-dis">
          {this.distance}
          <GNSVerticalUnitDisplay unit={Subject.create(UnitType.NMILE)} />
        </span>

        <span class="nearest-ndb-item-freq">
          {this.mainFrequencyString}
        </span>
      </span>
    );
  }
}
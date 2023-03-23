import {
  ArraySubject,
  ComRadioIndex,
  Facility,
  FocusPosition,
  FSComponent,
  GeoPoint,
  GeoPointSubject, GNSSEvents, NavRadioIndex, VNode
} from '@microsoft/msfs-sdk';
import { Page, PageProps } from '../Pages';
import { InteractionEvent } from '../../InteractionEvent';
import { GNSUiControlList } from '../../GNSUiControl';

/**
 * Props for {@link NearestFacilityPage}
 */
export interface NearestFacilityPageProps extends PageProps {

  /** This instrument's nav radio index */
  navIndex: NavRadioIndex;

  /** This instrument's com radio index */
  comIndex: ComRadioIndex;
}

/**
 * Base page for a simple NEAREST <FACILITY> page
 */
export class NearestFacilityPage<T extends Facility, U extends NearestFacilityPageProps = NearestFacilityPageProps> extends Page<U> {
  protected readonly facilities = ArraySubject.create<T>([]);

  protected readonly list = FSComponent.createRef<GNSUiControlList<T>>();

  protected readonly ppos = GeoPointSubject.create(new GeoPoint(0, 0));

  /** @inheritDoc */
  onInteractionEvent(evt: InteractionEvent): boolean {
    if (evt === InteractionEvent.RightKnobPush) {
      if (this.list.instance.isFocused) {
        this.list.instance.blur();
      } else {
        this.list.instance.focus(FocusPosition.First);
      }
    }

    if (this.list.instance.isFocused) {
      return this.list.instance.onInteractionEvent(evt);
    }

    return false;
  }

  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.props.bus.getSubscriber<GNSSEvents>().on('gps-position').handle(({ lat, long }) => {
      this.ppos.set(lat, long);
    });
  }
}
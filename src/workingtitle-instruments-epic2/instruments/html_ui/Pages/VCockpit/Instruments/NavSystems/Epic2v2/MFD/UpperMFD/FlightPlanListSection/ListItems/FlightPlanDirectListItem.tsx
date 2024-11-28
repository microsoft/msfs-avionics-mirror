/* eslint-disable max-len */
import { DisplayComponent, EventBus, FSComponent, SetSubject, Subject, Subscription, VNode } from '@microsoft/msfs-sdk';

import { DirectListData, FlightPlanStore, ListItem, SectionOutline } from '@microsoft/msfs-epic2-shared';

import './FlightPlanDirectListItem.css';

/** The props for FlightPlanLegListItem. */
interface FlightPlanLegListItemProps {
  /** Data describing the list item's associated flight plan leg. */
  listData: DirectListData;

  /** The flight plan index. */
  planIndex: number;

  /** The flight plan store. */
  store: FlightPlanStore;

  /** The event bus */
  bus: EventBus
}

/** A component that wraps list item content for use with GtcList. */
export class FlightPlanDirectListItem extends DisplayComponent<FlightPlanLegListItemProps> {
  private readonly listItemRef = FSComponent.createRef<DisplayComponent<any>>();
  private readonly outlineRef = FSComponent.createRef<SectionOutline>();

  private readonly hideBorder = Subject.create(false);
  private readonly paddedListItem = Subject.create(true);

  private readonly classList = SetSubject.create(['flight-plan-direct-list-item', 'from-leg']);

  private readonly subs = [] as Subscription[];
  private readonly airwaySubs = [] as Subscription[];

  /** Runs when the outlined element is selected */
  private onMouseDown(): void {
    const isThisSelected = this.props.store.selectedEnrouteWaypoint.get() == this.props.listData;
    this.props.store.selectedEnrouteWaypoint.set(!isThisSelected ? this.props.listData : undefined);
  }

  /** @inheritdoc */
  public override onAfterRender(): void {
    if (this.outlineRef.getOrDefault()?.outlineElement.getOrDefault()) {
      this.outlineRef.instance.outlineElement.instance.addEventListener('mousedown', () => this.onMouseDown());
      this.props.store.selectedEnrouteWaypoint.sub((legListData) => {
        const isThisSelected = legListData == this.props.listData;
        this.outlineRef.instance.forceOutline(isThisSelected);
      });
    }
  }

  /** @inheritdoc */
  public override render(): VNode | null {
    const { listData } = this.props;

    return (
      <ListItem
        ref={this.listItemRef}
        hideBorder={this.hideBorder}
        paddedListItem={this.paddedListItem}
        class={this.classList}
        isVisible={listData.isVisible}
      >
        <div class="container">
          <SectionOutline bus={this.props.bus} ref={this.outlineRef}>
            <div class="bottom-row">
              <div class="leg-name">Direct</div>
            </div>
          </SectionOutline>
        </div>
      </ListItem >
    );
  }

  /** @inheritdoc */
  public override destroy(): void {
    this.listItemRef.getOrDefault()?.destroy();

    this.subs.forEach(sub => { sub.destroy(); });
    this.airwaySubs.forEach(sub => { sub.destroy(); });

    super.destroy();
  }
}

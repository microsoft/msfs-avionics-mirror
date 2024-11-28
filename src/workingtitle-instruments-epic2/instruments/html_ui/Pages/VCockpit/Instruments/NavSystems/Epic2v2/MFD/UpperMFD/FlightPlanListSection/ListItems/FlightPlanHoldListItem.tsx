/* eslint-disable max-len */
import { DisplayComponent, EventBus, FSComponent, SetSubject, Subject, VNode } from '@microsoft/msfs-sdk';

import { FlightPlanStore, HoldListData, ListItem, SectionOutline } from '@microsoft/msfs-epic2-shared';

import './FlightPlanHoldListItem.css';

/** The props for FlightPlanLegListItem. */
interface FlightPlanLegListItemProps {
  /** Data describing the list item's associated flight plan leg. */
  listData: HoldListData;

  /** The flight plan index. */
  planIndex: number;

  /** The flight plan store. */
  store: FlightPlanStore;

  /** The event bus */
  bus: EventBus
}

/** A component that wraps list item content for use with GtcList. */
export class FlightPlanHoldListItem extends DisplayComponent<FlightPlanLegListItemProps> {
  private readonly listItemRef = FSComponent.createRef<DisplayComponent<any>>();
  private readonly outlineRef = FSComponent.createRef<SectionOutline>();

  private readonly hideBorder = Subject.create(false);
  private readonly paddedListItem = Subject.create(true);

  private readonly classList = SetSubject.create(['flight-plan-hold-list-item', 'active-leg']);

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
          <div class="bottom-row">
            <div class="leg-name">{this.props.listData.exiting.map((exiting) => exiting ? 'Exiting Hold' : 'Holding')}</div>
          </div>
        </div>
      </ListItem >
    );
  }

  /** @inheritdoc */
  public override destroy(): void {
    this.listItemRef.getOrDefault()?.destroy();

    super.destroy();
  }
}

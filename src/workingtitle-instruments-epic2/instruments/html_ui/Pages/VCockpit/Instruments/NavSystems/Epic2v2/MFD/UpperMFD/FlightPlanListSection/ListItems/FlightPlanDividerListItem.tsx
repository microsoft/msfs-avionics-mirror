/* eslint-disable max-len */
import { DisplayComponent, FSComponent, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';

import './FlightPlanDividerListItem.css';
import { ListItem } from '@microsoft/msfs-epic2-shared';

/** The props for FlightPlanDividerListItem. */
interface FlightPlanDividerListItemProps {
  /** The label */
  label: string;

  /** Whether the item is visible or not */
  isVisible: boolean | Subscribable<boolean>
}

/** A component that wraps list item content for use with GtcList. */
export class FlightPlanDividerListItem extends DisplayComponent<FlightPlanDividerListItemProps> {
  private readonly listItemRef = FSComponent.createRef<DisplayComponent<any>>();
  private readonly hideBorder = Subject.create(false);
  private readonly paddedListItem = Subject.create(true);

  /** @inheritdoc */
  public override render(): VNode | null {
    return (
      <ListItem
        hideBorder={this.hideBorder}
        paddedListItem={this.paddedListItem}
        class='flight-plan-divider-list-item'
        isVisible={this.props.isVisible}
      >
        <div class="container">{this.props.label}</div>
      </ListItem >
    );
  }

  /** @inheritdoc */
  public override destroy(): void {
    this.listItemRef.getOrDefault()?.destroy();

    super.destroy();
  }
}

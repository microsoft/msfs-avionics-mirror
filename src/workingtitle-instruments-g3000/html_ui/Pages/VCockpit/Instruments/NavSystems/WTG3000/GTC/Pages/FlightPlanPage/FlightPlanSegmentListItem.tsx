import {
  ComponentProps, DisplayComponent, VNode, FSComponent,
  SetSubject, Subscription,
} from '@microsoft/msfs-sdk';
import { FlightPlanSegmentListData } from '@microsoft/msfs-wtg3000-common';
import { GtcListButton } from '../../Components/List/GtcListButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';

import './FlightPlanSegmentListItem.css';

/** The props for FlightPlanSegmentListItem. */
interface FlightPlanSegmentListItemProps extends ComponentProps {
  /** The leg list item data. */
  segmentListData: FlightPlanSegmentListData;
}

/** A component that wraps list item content for use with GtcList. */
export class FlightPlanSegmentListItem extends DisplayComponent<FlightPlanSegmentListItemProps> {
  private readonly gtcListButtonRef = FSComponent.createRef<GtcTouchButton>();
  private readonly subscriptions = [] as Subscription[];

  /** @inheritdoc */
  public render(): VNode {
    const { segmentListData: listItem } = this.props;

    const listItemClasses = SetSubject.create<string>(['medium-font', 'segment-list-item']);

    this.subscriptions.push(listItem.isVisible.sub(x => {
      if (x) {
        listItemClasses.delete('hidden');
      } else {
        listItemClasses.add('hidden');
      }
    }, true));

    return (
      <GtcListButton
        ref={this.gtcListButtonRef}
        fullSizeButton={true}
        label={listItem.segmentData.segment.segmentType}
        isEnabled={false}
        listItemClasses={listItemClasses}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();
    this.gtcListButtonRef.getOrDefault()?.destroy();
    this.subscriptions.forEach(x => x.destroy());
  }
}
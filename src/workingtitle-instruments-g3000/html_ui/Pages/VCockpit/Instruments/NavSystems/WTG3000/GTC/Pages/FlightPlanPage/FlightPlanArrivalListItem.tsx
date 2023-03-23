import {
  ComponentProps, DisplayComponent, VNode, FSComponent,
  Subscribable, MutableSubscribable,
} from '@microsoft/msfs-sdk';
import { TouchButton } from '@microsoft/msfs-garminsdk';
import { FlightPlanSegmentListData, SelectableFlightPlanListData } from '@microsoft/msfs-wtg3000-common';
import { GtcListButton } from '../../Components/List/GtcListButton';
import { GtcService } from '../../GtcService/GtcService';

import './FlightPlanSegmentListItem.css';

/** The props for FlightPlanArrivalListItem. */
interface FlightPlanArrivalListItemProps extends ComponentProps {
  /** Data describing the list item's associated flight plan segment. */
  segmentListData: FlightPlanSegmentListData;

  /** The GtcService. */
  gtcService: GtcService;

  /** The flight plan arrival string. */
  arrivalString: Subscribable<string>;

  /** A mutable subscribable which controls the selected list data. */
  selectedListData: MutableSubscribable<SelectableFlightPlanListData | null>;
}

/** The flight plan list item for an arrival procedure. */
export class FlightPlanArrivalListItem extends DisplayComponent<FlightPlanArrivalListItemProps> {
  private readonly gtcListButtonRef = FSComponent.createRef<TouchButton>();

  private readonly isSelected = this.props.selectedListData.map(selected => selected === this.props.segmentListData);

  /** @inheritdoc */
  public render(): VNode {
    return (
      <GtcListButton
        ref={this.gtcListButtonRef}
        fullSizeButton={true}
        onPressed={() => {
          this.props.selectedListData.set(this.isSelected.get() ? null : this.props.segmentListData);
        }}
        label={
          <div style="display: flex; flex-wrap: wrap; justify-content: center;">
            <span>Arrival – </span>
            <span>{this.props.arrivalString}</span>
          </div>
        }
        isHighlighted={this.isSelected}
        listItemClasses='medium-font segment-list-item segment-list-item-cyan'
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.gtcListButtonRef.getOrDefault()?.destroy();

    this.isSelected.destroy();

    super.destroy();
  }
}
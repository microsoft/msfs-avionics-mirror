import { ComponentProps, DisplayComponent, FSComponent, MutableSubscribable, VNode } from '@microsoft/msfs-sdk';

import { TouchButton } from '@microsoft/msfs-garminsdk';
import { ApproachNameDisplay, FlightPlanSegmentListData, FlightPlanStore, SelectableFlightPlanListData } from '@microsoft/msfs-wtg3000-common';

import { GtcListButton } from '../../Components/List/GtcListButton';
import { GtcService } from '../../GtcService/GtcService';

import './FlightPlanSegmentListItem.css';

/** The props for FlightPlanApproachListItem. */
interface FlightPlanApproachListItemProps extends ComponentProps {
  /** Data describing the list item's associated flight plan segment. */
  segmentListData: FlightPlanSegmentListData;

  /** The GtcService. */
  gtcService: GtcService;

  /** The flight plan store. */
  store: FlightPlanStore;

  /** A mutable subscribable which controls the selected list data. */
  selectedListData: MutableSubscribable<SelectableFlightPlanListData | null>;
}

/** The flight plan list item for an approach procedure. */
export class FlightPlanApproachListItem extends DisplayComponent<FlightPlanApproachListItemProps> {
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
          <ApproachNameDisplay
            prefix={this.props.store.approachStringPrefix}
            approach={this.props.store.approachForDisplay.map(x => x ?? null)}
            airport={this.props.store.destinationFacility.map(x => x ?? null)}
            useZeroWithSlash={true}
          />
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
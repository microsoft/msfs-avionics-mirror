import {
  ComponentProps, DisplayComponent, VNode, FSComponent,
  SetSubject, Subscription, MutableSubscribable, MappedSubject,
} from '@microsoft/msfs-sdk';

import { FlightPlanSegmentListData, G3000FilePaths, SelectableFlightPlanListData } from '@microsoft/msfs-wtg3000-common';

import { GtcService } from '../../GtcService/GtcService';
import { GtcListButton } from '../../Components/List/GtcListButton';

import './FlightPlanSegmentListItem.css';
import './FlightPlanEnrouteListItem.css';

/** The props for FlightPlanSegmentListItem. */
interface FlightPlanEnrouteListItemProps extends ComponentProps {
  /** The GtcService. */
  gtcService: GtcService;

  /** The leg list item data. */
  segmentListData: FlightPlanSegmentListData;

  /** A mutable subscribable which controls the selected list data. */
  selectedListData: MutableSubscribable<SelectableFlightPlanListData | null>;
}

/** A component that wraps list item content for use with GtcList. */
export class FlightPlanEnrouteListItem extends DisplayComponent<FlightPlanEnrouteListItemProps> {
  private static readonly LIST_ITEM_CLASSES = ['medium-font', 'segment-list-item', 'enroute-segment-list-item', 'segment-list-item-cyan'];

  private readonly gtcListButtonRef = FSComponent.createRef<DisplayComponent<unknown>>();

  private readonly listItemClasses = SetSubject.create(FlightPlanEnrouteListItem.LIST_ITEM_CLASSES);

  private readonly isSelected = this.props.selectedListData.map(selected => selected === this.props.segmentListData);

  private readonly labelText = MappedSubject.create(
    ([isAirway, airwayText]) => isAirway ? airwayText : 'Enroute',
    this.props.segmentListData.segmentData.isAirway,
    this.props.segmentListData.airwayText
  );

  private readonly subscriptions = [] as Subscription[];

  /** @inheritdoc */
  public onAfterRender(): void {
    this.subscriptions.push(
      this.props.segmentListData.segmentData.isAirway.sub(isAirway => {
        this.listItemClasses.toggle('airway', isAirway);
      }, true),

      this.props.segmentListData.isVisible.sub(isVisible => {
        this.listItemClasses.toggle('hidden', !isVisible);
      }, true)
    );
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <GtcListButton
        ref={this.gtcListButtonRef}
        fullSizeButton={true}
        onPressed={() => {
          this.props.selectedListData.set(this.isSelected.get() ? null : this.props.segmentListData);
        }}
        label={this.labelText}
        isHighlighted={this.isSelected}
        gtcOrientation={this.props.gtcService.orientation}
        listItemClasses={this.listItemClasses}
      >
        <img class="airway-dot" src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/wt-airway-dot-large.png`} />
      </GtcListButton>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.gtcListButtonRef.getOrDefault()?.destroy();

    this.isSelected.destroy();
    this.labelText.destroy();
    this.subscriptions.forEach(x => x.destroy());

    super.destroy();
  }
}

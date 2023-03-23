import {
  ComponentProps, DisplayComponent, VNode, FSComponent,
  Subject, MappedSubject, Subscription, MutableSubscribable, SetSubject,
} from '@microsoft/msfs-sdk';
import { Fms, TouchButton } from '@microsoft/msfs-garminsdk';
import { FlightPlanSegmentListData, FlightPlanStore, SelectableFlightPlanListData } from '@microsoft/msfs-wtg3000-common';
import { GtcListButton } from '../../Components/List/GtcListButton';
import { GtcService } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService';
import { GtcFlightPlanDialogs } from './GtcFlightPlanDialogs';

import './FlightPlanSegmentListItem.css';

/** The state of the origin button. */
type OriginButtonState = 'noDestination' | 'noRunway' | 'runwaySelected';

/** The props for FlightPlanDestinationListItem. */
interface FlightPlanDestinationListItemProps extends ComponentProps {
  /** Data describing the list item's associated flight plan segment. */
  segmentListData: FlightPlanSegmentListData;

  /** The flight plan destination name. */
  store: FlightPlanStore;

  /** The GtcService. */
  gtcService: GtcService;

  /** The FMS. */
  fms: Fms;

  /** A mutable subscribable which controls the selected list data. */
  selectedListData: MutableSubscribable<SelectableFlightPlanListData | null>;
}

/** The flight plan list item for the destination segment. */
export class FlightPlanDestinationListItem extends DisplayComponent<FlightPlanDestinationListItemProps> {
  private readonly gtcListButtonRef = FSComponent.createRef<TouchButton>();

  private readonly rootCssClass = SetSubject.create(['medium-font', 'segment-list-item']);

  private readonly subs = [] as Subscription[];
  private readonly row1Text = Subject.create<string>('');
  private readonly destinationButtonState = MappedSubject.create(([destination, runway]): OriginButtonState => {
    if (destination === undefined) {
      return 'noDestination';
    } else if (!runway) {
      return 'noRunway';
    } else {
      return 'runwaySelected';
    }
  }, this.props.store.destinationFacility, this.props.store.destinationRunway);

  private readonly isSelected = this.props.selectedListData.map(selected => selected === this.props.segmentListData);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.subs.push(this.destinationButtonState.sub(this.updateRowStyles, true));

    this.subs.push(this.destinationButtonState.sub(this.updateRowTexts));
    this.subs.push(this.props.store.destinationString.sub(this.updateRowTexts));
    this.updateRowTexts();
  }

  /** Updates the stlyes for the rows. */
  private readonly updateRowStyles = (): void => {
    const state = this.destinationButtonState.get();
    this.rootCssClass.toggle('segment-list-item-cyan', state !== 'noDestination');
  };

  /** Updates the text for each row. */
  private readonly updateRowTexts = (): void => {
    const state = this.destinationButtonState.get();
    const destinationString = this.props.store.destinationString.get();
    switch (state) {
      case 'noDestination':
        this.row1Text.set('Add Destination');
        break;
      case 'noRunway':
        this.row1Text.set(destinationString);
        break;
      case 'runwaySelected':
        this.row1Text.set(destinationString);
        break;
    }
  };

  private readonly handlePressed = async (): Promise<void> => {
    switch (this.destinationButtonState.get()) {
      case 'noDestination': {
        // Don't do anything if a slideout menu is open
        if (this.props.gtcService.activeView.get().key !== GtcViewKeys.FlightPlan) { return; }

        const result = await GtcFlightPlanDialogs.openAirportDialog(this.props.gtcService);
        if (!result.wasCancelled) {
          this.props.fms.setDestination(result.payload);
        }
        break;
      }
      default:
        this.props.selectedListData.set(this.isSelected.get() ? null : this.props.segmentListData);
    }
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <GtcListButton
        ref={this.gtcListButtonRef}
        fullSizeButton={true}
        onPressed={this.handlePressed}
        label={this.row1Text}
        isHighlighted={this.isSelected}
        gtcOrientation={this.props.gtcService.orientation}
        listItemClasses={this.rootCssClass}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.gtcListButtonRef.getOrDefault()?.destroy();

    this.isSelected.destroy();
    this.subs.forEach(x => x.destroy());

    super.destroy();
  }
}
import {
  ComponentProps, DisplayComponent, VNode, FSComponent, Subject,
  Subscribable,
} from '@microsoft/msfs-sdk';
import { Fms } from '@microsoft/msfs-garminsdk';
import { GtcListItem } from '../../Components/List';
import { GtcService } from '../../GtcService/GtcService';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcViewKeys } from '../../GtcService';
import { GtcFlightPlanDialogs } from './GtcFlightPlanDialogs';

/** The props for AddEnrouteWaypointListItem. */
interface AddEnrouteWaypointListItemProps extends ComponentProps {
  /** The GtcService. */
  gtcService: GtcService;
  /** The FMS. */
  fms: Fms;
  /** The plan index to use. */
  planIndex: number;
  /** Whether this button is visible. Will be set to false when Done is clicked. */
  isVisible: Subject<boolean>;
  /** Whether the Done button should be enabled. */
  isDoneEnabled: Subscribable<boolean>;
}

/** Renders the Add Enroute Waypoint button for the flight plan list. */
export class AddEnrouteWaypointListItem extends DisplayComponent<AddEnrouteWaypointListItemProps> {
  private readonly addEnrouteWaypointButton = FSComponent.createRef<GtcTouchButton>();
  private readonly doneButton = FSComponent.createRef<GtcTouchButton>();

  private readonly onDoneButtonPressed = (): void => {
    this.props.isVisible.set(false);
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <GtcListItem>
        <GtcTouchButton
          ref={this.addEnrouteWaypointButton}
          class="medium-font add-enroute-waypoint-button"
          onPressed={() => {
            // Don't do anything if a slideout menu is open
            if (this.props.gtcService.activeView.get().key !== GtcViewKeys.FlightPlan) { return; }

            GtcFlightPlanDialogs.addEnrouteWaypoint(this.props.gtcService, this.props.fms, this.props.planIndex);
          }}
          label="Add Enroute Waypoint"
          isInList
          gtcOrientation={this.props.gtcService.orientation}
        />
        <GtcTouchButton
          ref={this.doneButton}
          class="medium-font add-enroute-waypoint-done-button"
          onPressed={this.onDoneButtonPressed}
          isEnabled={this.props.isDoneEnabled}
          label="Done"
          isInList
          gtcOrientation={this.props.gtcService.orientation}
        />
      </GtcListItem>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.addEnrouteWaypointButton.instance.destroy();
    this.doneButton.instance.destroy();
  }
}
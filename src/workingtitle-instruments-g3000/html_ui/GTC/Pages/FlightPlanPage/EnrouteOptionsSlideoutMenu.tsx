import { VNode, FSComponent, LegDefinition } from '@microsoft/msfs-sdk';
import { Fms } from '@microsoft/msfs-garminsdk';
import { FlightPlanSegmentListData } from '@microsoft/msfs-wtg3000-common';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcFlightPlanDialogs } from './GtcFlightPlanDialogs';
import { GtcFlightPlanPageSlideoutMenu, GtcFlightPlanPageSlideoutMenuProps } from './GtcFlightPlanPageSlideoutMenu';

/**
 * Component props for EnrouteOptionsSlideoutMenu.
 */
export interface EnrouteOptionsSlideoutMenuProps extends GtcFlightPlanPageSlideoutMenuProps {
  /** An instance of the Fms. */
  fms: Fms;

  /** Which flight plan index to work with. */
  planIndex: number;

  /** Callback to call when a waypoint was inserted from this menu. */
  onWaypointInserted: (newLeg: LegDefinition) => void;
}

/** EnrouteOptionsSlideoutMenu. */
export class EnrouteOptionsSlideoutMenu extends GtcFlightPlanPageSlideoutMenu<FlightPlanSegmentListData, EnrouteOptionsSlideoutMenuProps> {
  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this._title.set('Enroute Options');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='gtc-popup-panel gtc-slideout gtc-slideout-grid enroute-options'>
        <div class='slideout-grid-row'>
          <GtcTouchButton
            label={'Insert\nWaypoint'}
            onPressed={async () => {
              const newLeg = await GtcFlightPlanDialogs.insertEnrouteWaypoint(this.props.gtcService, this.props.fms, this.props.planIndex);
              if (newLeg !== undefined) {
                this.closeMenu();
                this.props.onWaypointInserted(newLeg);
              }
            }}
          />
          <div />
        </div>
        <div class='slideout-grid-row'>
          <div />
          <div />
        </div>
        <div class='slideout-grid-row'>
          <div />
          <div />
        </div>
        <div class='slideout-grid-row'>
          <div />
          <div />
        </div>
        <div class='slideout-grid-row'>
          <div />
          <div />
        </div>
      </div>
    );
  }
}
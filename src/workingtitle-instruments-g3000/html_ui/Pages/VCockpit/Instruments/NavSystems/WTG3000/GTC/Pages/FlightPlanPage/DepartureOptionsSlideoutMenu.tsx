import { VNode, FSComponent } from '@microsoft/msfs-sdk';
import { Fms } from '@microsoft/msfs-garminsdk';
import { FlightPlanStore, FlightPlanSegmentListData } from '@microsoft/msfs-wtg3000-common';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcDeparturePage } from '../Procedures/GtcDeparturePage';
import { GtcFlightPlanDialogs } from './GtcFlightPlanDialogs';
import { GtcFlightPlanPageSlideoutMenu, GtcFlightPlanPageSlideoutMenuProps } from './GtcFlightPlanPageSlideoutMenu';

/**
 * Component props for DepartureOptionsSlideoutMenu.
 */
export interface DepartureOptionsSlideoutMenuProps extends GtcFlightPlanPageSlideoutMenuProps {
  /** An instance of the Fms. */
  fms: Fms;

  /** Which flight plan index to work with. */
  planIndex: number;

  /** The flight plan store. */
  store: FlightPlanStore;
}

/** DepartureOptionsSlideoutMenu. */
export class DepartureOptionsSlideoutMenu extends GtcFlightPlanPageSlideoutMenu<FlightPlanSegmentListData, DepartureOptionsSlideoutMenuProps> {
  private readonly hasDeparture = this.props.store.departureProcedure.map(x => !!x);

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this._title.set('Departure Options');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='gtc-popup-panel gtc-slideout gtc-slideout-grid departure-options'>
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
          <GtcTouchButton
            label={'Show\nChart'}
            isEnabled={false}
          />
          <div />
        </div>
        <div class='slideout-grid-row'>
          <GtcTouchButton
            label={'Remove\nDeparture'}
            isEnabled={this.hasDeparture}
            onPressed={async () => {
              const removed = await GtcFlightPlanDialogs.removeDeparture(this.props.gtcService, this.props.store, this.props.fms);
              if (removed === true && this.props.gtcService.activeView.get().ref === this) {
                this.closeMenu();
              }
            }}
          />
          <GtcTouchButton
            label={'Edit\nDeparture'}
            onPressed={() => {
              this.closeMenu();
              this.props.gtcService.changePageTo<GtcDeparturePage>(GtcViewKeys.Departure).ref.initSelection();
            }}
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.hasDeparture.destroy();

    super.destroy();
  }
}
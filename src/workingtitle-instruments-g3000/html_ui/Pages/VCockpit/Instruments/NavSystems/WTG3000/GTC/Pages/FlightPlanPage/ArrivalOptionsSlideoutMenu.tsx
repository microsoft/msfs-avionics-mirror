import { VNode, FSComponent } from '@microsoft/msfs-sdk';
import { Fms } from '@microsoft/msfs-garminsdk';
import { FlightPlanStore, FlightPlanSegmentListData } from '@microsoft/msfs-wtg3000-common';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcApproachPage } from '../Procedures/GtcApproachPage';
import { GtcArrivalPage } from '../Procedures/GtcArrivalPage';
import { GtcFlightPlanDialogs } from './GtcFlightPlanDialogs';
import { GtcFlightPlanPageSlideoutMenu, GtcFlightPlanPageSlideoutMenuProps } from './GtcFlightPlanPageSlideoutMenu';

/**
 * Component props for ArrivalOptionsSlideoutMenu.
 */
export interface ArrivalOptionsSlideoutMenuProps extends GtcFlightPlanPageSlideoutMenuProps {
  /** An instance of the Fms. */
  fms: Fms;

  /** Which flight plan index to work with. */
  planIndex: number;

  /** The flight plan store. */
  store: FlightPlanStore;
}

/** ArrivalOptionsSlideoutMenu. */
export class ArrivalOptionsSlideoutMenu extends GtcFlightPlanPageSlideoutMenu<FlightPlanSegmentListData, ArrivalOptionsSlideoutMenuProps> {
  private readonly hasArrival = this.props.store.arrivalProcedure.map(x => !!x);

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this._title.set('Arrival Options');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='gtc-popup-panel gtc-slideout gtc-slideout-grid arrival-options'>
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
          <GtcTouchButton
            label={'Select\nApproach'}
            onPressed={() => {
              this.closeMenu();
              this.props.gtcService.changePageTo<GtcApproachPage>(GtcViewKeys.Approach).ref.initSelection();
            }}
          />
        </div>
        <div class='slideout-grid-row'>
          <GtcTouchButton
            label={'Remove\nArrival'}
            isEnabled={this.hasArrival}
            onPressed={async () => {
              const removed = await GtcFlightPlanDialogs.removeArrival(this.props.gtcService, this.props.store, this.props.fms);
              if (removed === true) {
                this.closeMenu();
              }
            }}
          />
          <GtcTouchButton
            label={'Edit\nArrival'}
            onPressed={() => {
              this.closeMenu();
              this.props.gtcService.changePageTo<GtcArrivalPage>(GtcViewKeys.Arrival).ref.initSelection();
            }}
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.hasArrival.destroy();

    super.destroy();
  }
}
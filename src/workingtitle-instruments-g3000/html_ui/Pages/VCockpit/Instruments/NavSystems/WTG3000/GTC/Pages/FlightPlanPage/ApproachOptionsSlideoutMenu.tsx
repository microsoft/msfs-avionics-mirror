import { VNode, FSComponent, Subject, ClockEvents, Subscription } from '@microsoft/msfs-sdk';
import { Fms } from '@microsoft/msfs-garminsdk';
import { FlightPlanStore, FlightPlanSegmentListData } from '@microsoft/msfs-wtg3000-common';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcApproachPage } from '../Procedures/GtcApproachPage';
import { GtcArrivalPage } from '../Procedures/GtcArrivalPage';
import { GtcFlightPlanDialogs } from './GtcFlightPlanDialogs';
import { GtcFlightPlanPageSlideoutMenu, GtcFlightPlanPageSlideoutMenuProps } from './GtcFlightPlanPageSlideoutMenu';

/**
 * The properties for the ApproachOptionsSlideoutMenu component.
 */
export interface ApproachOptionsSlideoutMenuProps extends GtcFlightPlanPageSlideoutMenuProps {
  /** An instance of the Fms. */
  fms: Fms;

  /** Which flight plan index to work with. */
  planIndex: number;

  /** The flight plan store. */
  store: FlightPlanStore;
}

/**
 * Displays the loaded procedures and links to the procedure pages.
 */
export class ApproachOptionsSlideoutMenu extends GtcFlightPlanPageSlideoutMenu<FlightPlanSegmentListData, ApproachOptionsSlideoutMenuProps> {
  private readonly canActivateApproach = Subject.create(false);
  private readonly canActivateVtf = Subject.create(false);
  private readonly canMissedApproachActivate = Subject.create(false);

  private clockSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this._title.set('Approach Options');

    this.clockSub = this.bus.getSubscriber<ClockEvents>().on('realTime').atFrequency(1).handle(this.update.bind(this)).pause();
  }

  /** @inheritdoc */
  public override onResume(): void {
    super.onResume();

    this.clockSub?.resume(true);
  }

  /** @inheritdoc */
  public override onPause(): void {
    super.onPause();

    this.clockSub?.pause();
  }

  /** Runs checks to see if certain buttons should be enabled or not. */
  private update(): void {
    this.canActivateApproach.set(this.props.fms.canActivateApproach());
    this.canActivateVtf.set(this.props.fms.canActivateVtf());
    this.canMissedApproachActivate.set(this.props.fms.canMissedApproachActivate());
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='gtc-popup-panel gtc-slideout gtc-slideout-grid approach-options'>
        <div class='slideout-grid-row'>
          <GtcTouchButton
            label={'Activate\nApproach'}
            isEnabled={this.canActivateApproach}
            onPressed={() => {
              this.props.fms.activateApproach();
              this.closeMenu();
            }}
          />
          <GtcTouchButton
            label={'Activate\nVectors to\nFinal'}
            isEnabled={this.canActivateVtf}
            onPressed={() => {
              this.props.fms.activateVtf();
              this.closeMenu();
            }}
          />
        </div>
        <div class='slideout-grid-row'>
          <GtcTouchButton
            label={'Activate\nMissed\nApproach'}
            isEnabled={this.canMissedApproachActivate}
            onPressed={() => {
              this.props.fms.activateMissedApproach();
              this.closeMenu();
            }}
          />
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
            label={'Select\nArrival'}
            onPressed={() => {
              this.closeMenu();
              this.gtcService.changePageTo<GtcArrivalPage>(GtcViewKeys.Arrival).ref.initSelection();
            }}
          />
        </div>
        <div class='slideout-grid-row'>
          <GtcTouchButton
            label={'Remove\nApproach'}
            isEnabled={this.props.store.isApproachLoaded}
            onPressed={async () => {
              const removed = await GtcFlightPlanDialogs.removeApproach(this.gtcService, this.props.store, this.props.fms);
              if (removed === true) {
                this.closeMenu();
              }
            }}
          />
          <GtcTouchButton
            label={'Edit\nApproach'}
            onPressed={() => {
              this.closeMenu();
              this.gtcService.changePageTo<GtcApproachPage>(GtcViewKeys.Approach).ref.initSelection();
            }}
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.clockSub?.destroy();

    super.destroy();
  }
}

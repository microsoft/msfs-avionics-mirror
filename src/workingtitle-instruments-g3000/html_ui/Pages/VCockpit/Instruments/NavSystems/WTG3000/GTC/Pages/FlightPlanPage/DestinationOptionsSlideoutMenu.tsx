import { VNode, FSComponent, MappedSubject, AirportFacility } from '@microsoft/msfs-sdk';
import { Fms } from '@microsoft/msfs-garminsdk';
import { FlightPlanStore, FlightPlanSegmentListData } from '@microsoft/msfs-wtg3000-common';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcDialogs } from '../../Dialog/GtcDialogs';
import { GtcApproachPage } from '../Procedures/GtcApproachPage';
import { GtcArrivalPage } from '../Procedures/GtcArrivalPage';
import { GtcAirportInfoPage } from '../WaypointInfoPages';
import { GtcFlightPlanPageSlideoutMenu, GtcFlightPlanPageSlideoutMenuProps } from './GtcFlightPlanPageSlideoutMenu';
import { GtcFlightPlanDialogs } from './GtcFlightPlanDialogs';

/** Component props for DestinationOptionsSlideoutMenu. */
export interface DestinationOptionsSlideoutMenuProps extends GtcFlightPlanPageSlideoutMenuProps {
  /** An instance of the Fms. */
  fms: Fms;

  /** Which flight plan index to work with. */
  planIndex: number;

  /** The flight plan store. */
  store: FlightPlanStore;
}

/** DestinationOptionsSlideoutMenu. */
export class DestinationOptionsSlideoutMenu extends GtcFlightPlanPageSlideoutMenu<FlightPlanSegmentListData, DestinationOptionsSlideoutMenuProps> {
  private readonly areArrivalAndApproachEmpty = MappedSubject.create(([arrival, approach]) => {
    return !arrival && !approach;
  }, this.props.store.arrivalProcedure, this.props.store.isApproachLoaded);

  private readonly hasDestination = this.props.store.destinationFacility.map(x => !!x);

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this._title.set('Destination Options');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='gtc-popup-panel gtc-slideout gtc-slideout-grid destination-options'>
        <div class='slideout-grid-row'>
          <GtcTouchButton
            label={'Select\nDestination\nAirport'}
            onPressed={async () => {
              const hasArrival = !!this.props.store.arrivalProcedure.get();
              const hasApproach = this.props.store.isApproachLoaded.get();

              if (hasArrival || hasApproach) {
                const accepted = await GtcDialogs.openMessageDialog(this.props.gtcService, 'Select Destination Airport?' + DestinationOptionsSlideoutMenu.getWarningMessage(hasArrival, hasApproach));
                if (!accepted) { return; }
                if (hasArrival) { await this.props.fms.removeArrival(); }
                if (hasApproach) { await this.props.fms.removeApproach(); }
                this.props.fms.setDestination(undefined);
              }

              const result = await GtcFlightPlanDialogs.openAirportDialog(this.props.gtcService);

              if (!result.wasCancelled) {
                this.props.fms.setDestination(result.payload);
                this.closeMenu();
              }
            }}
          />
          <GtcTouchButton
            label={'Waypoint\nInfo'}
            isEnabled={this.hasDestination}
            onPressed={() => {
              const facility = this.props.store.destinationFacility.get();

              if (!facility) { return; }

              // Close menu before opening new page
              this.closeMenu();

              this.gtcService.changePageTo<GtcAirportInfoPage>(GtcViewKeys.AirportInfo).ref.initSelection(facility as AirportFacility);
            }}
          />
        </div>
        <div class='slideout-grid-row'>
          <GtcTouchButton
            label={'Select\nArrival\nRunway'}
            isVisible={this.areArrivalAndApproachEmpty}
            onPressed={async () => {
              let destination = this.props.store.destinationFacility.get();
              if (!destination) { return; }
              const result = await GtcFlightPlanDialogs.openRunwayDialog(this.props.gtcService, destination, this.props.store.destinationRunway.get());
              if (!result.wasCancelled) {
                destination = this.props.store.destinationFacility.get();
                if (!destination) { return; }
                this.props.fms.setDestination(destination, result.payload);
                this.closeMenu();
              }
            }}
          />
          <div />
        </div>
        <div class='slideout-grid-row'>
          <GtcTouchButton
            label={'Select\nArrival'}
            onPressed={() => {
              this.closeMenu();
              this.props.gtcService.changePageTo<GtcArrivalPage>(GtcViewKeys.Arrival).ref.initSelection();
            }}
          />
          <div />
        </div>
        <div class='slideout-grid-row'>
          <GtcTouchButton
            label={'Select\nApproach'}
            onPressed={() => {
              this.closeMenu();
              this.props.gtcService.changePageTo<GtcApproachPage>(GtcViewKeys.Approach).ref.initSelection();
            }}
          />
          <div />
        </div>
        <div class='slideout-grid-row'>
          <GtcTouchButton
            label={'Remove\nDestination\nAirport'}
            isEnabled={this.hasDestination}
            onPressed={async () => {
              let destination = this.props.store.destinationFacility.get();

              if (!destination) { return; }

              const hasArrival = !!this.props.store.arrivalProcedure.get();
              const hasApproach = this.props.store.isApproachLoaded.get();

              const accepted = await GtcDialogs.openMessageDialog(this.props.gtcService, 'Remove Destination Airport?' + DestinationOptionsSlideoutMenu.getWarningMessage(hasArrival, hasApproach));

              if (accepted) {
                destination = this.props.store.destinationFacility.get();
                if (!destination) { return; }
                if (hasArrival) { await this.props.fms.removeArrival(); }
                if (hasApproach) { await this.props.fms.removeApproach(); }
                this.props.fms.setDestination(undefined);
                this.closeMenu();
              }
            }}
          />
          <div />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.areArrivalAndApproachEmpty.destroy();
    this.hasDestination.destroy();

    super.destroy();
  }

  /**
   * Gets the warning message to use when removing or changing the destination airport.
   * @param hasArrival Whether the plan has an arrival.
   * @param hasApproach Whether the plan has an approach.
   * @returns The warning message.
   */
  private static getWarningMessage(hasArrival: boolean, hasApproach: boolean): string {
    if (hasArrival && hasApproach) {
      return '\nThe current arrival and approach\nwill be removed from the flight\nplan.';
    }
    if (hasArrival) {
      return '\nThe current arrival will be\nremoved from the flight plan.';
    }
    if (hasApproach) {
      return '\nThe current approach will be\nremoved from the flight plan.';
    }
    return '';
  }
}
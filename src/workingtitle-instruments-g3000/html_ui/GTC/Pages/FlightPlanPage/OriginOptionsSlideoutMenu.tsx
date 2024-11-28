import { VNode, FSComponent, AirportFacility } from '@microsoft/msfs-sdk';
import { Fms, TouchButton } from '@microsoft/msfs-garminsdk';
import { FlightPlanStore, FlightPlanSegmentListData } from '@microsoft/msfs-wtg3000-common';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcDialogs } from '../../Dialog/GtcDialogs';
import { GtcFlightPlanDialogs } from './GtcFlightPlanDialogs';
import { GtcDeparturePage } from '../Procedures/GtcDeparturePage';
import { GtcFlightPlanPageSlideoutMenu, GtcFlightPlanPageSlideoutMenuProps } from './GtcFlightPlanPageSlideoutMenu';
import { GtcTouchButton } from '../../Components';
import { GtcAirportInfoPage } from '../WaypointInfoPages';

/** Component props for OriginOptionsSlideoutMenu. */
export interface OriginOptionsSlideoutMenuProps extends GtcFlightPlanPageSlideoutMenuProps {
  /** An instance of the Fms. */
  fms: Fms;

  /** Which flight plan index to work with. */
  planIndex: number;

  /** The flight plan store. */
  store: FlightPlanStore;
}

/** OriginOptionsSlideoutMenu. */
export class OriginOptionsSlideoutMenu extends GtcFlightPlanPageSlideoutMenu<FlightPlanSegmentListData, OriginOptionsSlideoutMenuProps> {
  private readonly hasOrigin = this.props.store.originFacility.map(x => !!x);

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this._title.set('Origin Options');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='gtc-popup-panel gtc-slideout gtc-slideout-grid origin-options'>
        <div class='slideout-grid-row'>
          <TouchButton
            label={'Select\nOrigin\nAirport'}
            onPressed={async () => {
              const result = await GtcFlightPlanDialogs.openAirportDialog(this.props.gtcService);
              if (!result.wasCancelled) {
                this.props.fms.setOrigin(result.payload);
                this.closeMenu();
              }
            }}
          />
          <GtcTouchButton
            label={'Waypoint\nInfo'}
            isEnabled={this.hasOrigin}
            onPressed={() => {
              const facility = this.props.store.originFacility.get();

              if (!facility) { return; }

              // Close menu before opening new page
              this.closeMenu();

              this.gtcService.changePageTo<GtcAirportInfoPage>(GtcViewKeys.AirportInfo).ref.initSelection(facility as AirportFacility);
            }}
          />
        </div>
        <div class='slideout-grid-row'>
          <TouchButton
            label={'Select\nDeparture\nRunway'}
            isEnabled={this.hasOrigin}
            onPressed={async () => {
              let origin = this.props.store.originFacility.get();
              if (!origin) { return; }
              const result = await GtcFlightPlanDialogs.openRunwayDialog(this.props.gtcService, origin, this.props.store.originRunway.get());
              if (!result.wasCancelled) {
                origin = this.props.store.originFacility.get();
                if (!origin) { return; }
                this.props.fms.setOrigin(origin, result.payload);
                this.closeMenu();
              }
            }}
          />
          <div />
        </div>
        <div class='slideout-grid-row'>
          <TouchButton
            label={'Select\nDeparture'}
            onPressed={() => {
              this.closeMenu();
              this.props.gtcService.changePageTo<GtcDeparturePage>(GtcViewKeys.Departure).ref.initSelection();
            }}
          />
          <div />
        </div>
        <div class='slideout-grid-row'>
          <div />
          <div />
        </div>
        <div class='slideout-grid-row'>
          <TouchButton
            label={'Remove\nOrigin\nAirport'}
            isEnabled={this.hasOrigin}
            onPressed={async () => {
              let origin = this.props.store.originFacility.get();
              if (!origin) { return; }
              const accepted = await GtcDialogs.openMessageDialog(this.props.gtcService, 'Remove Origin Airport?');
              if (accepted) {
                origin = this.props.store.originFacility.get();
                if (!origin) { return; }
                this.props.fms.setOrigin(undefined);
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
    this.hasOrigin.destroy();

    super.destroy();
  }
}
import { VNode, FSComponent, Subject, Subscription, FlightPlanSegment } from '@microsoft/msfs-sdk';
import { Fms } from '@microsoft/msfs-garminsdk';
import { FlightPlanStore, FlightPlanListManager, FlightPlanSegmentListData } from '@microsoft/msfs-wtg3000-common';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcDialogs } from '../../Dialog/GtcDialogs';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcFlightPlanPageSlideoutMenu, GtcFlightPlanPageSlideoutMenuProps } from './GtcFlightPlanPageSlideoutMenu';
import { GtcFlightPlanDialogs } from './GtcFlightPlanDialogs';

/** The properties for the AirwayOptionsSlideoutMenu component. */
export interface AirwayOptionsSlideoutMenuProps extends GtcFlightPlanPageSlideoutMenuProps {
  /** An instance of the Fms. */
  fms: Fms;
  /** The flight plan index. */
  planIndex: number;
  /** The flight plan store. */
  store: FlightPlanStore;
  /** The flight plan list manager. */
  listManager: FlightPlanListManager;
}

/** AirwayOptionsSlideoutMenu. */
export class AirwayOptionsSlideoutMenu extends GtcFlightPlanPageSlideoutMenu<FlightPlanSegmentListData, AirwayOptionsSlideoutMenuProps> {
  private readonly loadNewAirwaysCollapsedSetting = this.gtcService.gtcSettings.getSetting('loadNewAirwaysCollapsed');
  private readonly isAirwayCollapsed = Subject.create(false);

  private readonly pipes = [] as Subscription[];

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this._title.set('Airway Options');

    this.listItemData.sub(data => {
      this.pipes.forEach(pipe => pipe.destroy());

      if (data) {
        this.pipes.push(data.isCollapsed.pipe(this.isAirwayCollapsed));
      } else {
        this.isAirwayCollapsed.set(false);
      }
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='gtc-popup-panel gtc-slideout gtc-slideout-grid large-font airway-options'>
        <div class='slideout-grid-row'>
          <GtcTouchButton
            label={'Collapse\nAirway'}
            isEnabled={this.isAirwayCollapsed.map(x => x === false)}
            onPressed={() => {
              const segment = this.listItemData.get()?.segmentData.segment;
              if (!segment) { return; }
              this.props.listManager.collapsedAirwaySegments.add(segment);
              this.closeMenu();
            }}
          />
          <GtcTouchButton
            label={'Expand\nAirway'}
            isEnabled={this.isAirwayCollapsed}
            onPressed={() => {
              const segment = this.listItemData.get()?.segmentData.segment;
              if (!segment) { return; }
              this.props.listManager.collapsedAirwaySegments.delete(segment);
              this.closeMenu();
            }}
          />
        </div>
        <div class='slideout-grid-row'>
          <GtcTouchButton
            label={'Collapse\nAll'}
            onPressed={() => {
              const plan = this.props.fms.getFlightPlan(this.props.planIndex);
              const segments = [] as FlightPlanSegment[];
              for (const segment of plan.segments()) {
                segments.push(segment);
              }
              this.props.listManager.collapsedAirwaySegments.set(segments);
              this.closeMenu();
            }}
          />
          <GtcTouchButton
            label={'Expand\nAll'}
            onPressed={() => {
              this.props.listManager.collapsedAirwaySegments.clear();
              this.closeMenu();
            }}
          />
        </div>
        <div class='slideout-grid-row'>
          <GtcListSelectTouchButton
            class="wide"
            label="Load New Airways"
            gtcService={this.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.loadNewAirwaysCollapsedSetting}
            renderValue={value => value ? 'Collapsed' : 'Expanded'}
            occlusionType="hide"
            listParams={{
              title: 'Load New Airways Settings',
              inputData: [
                {
                  value: true,
                  labelRenderer: () => 'Collapsed'
                },
                {
                  value: false,
                  labelRenderer: () => 'Expanded'
                },
              ],
              selectedValue: this.loadNewAirwaysCollapsedSetting,
            }}
          />
        </div>
        <div class='slideout-grid-row'>
          <div />
          <div />
        </div>
        <div class='slideout-grid-row'>
          <GtcTouchButton
            label={'Remove\nAirway'}
            onPressed={async () => {
              const segment = this.listItemData.get()?.segmentData.segment;
              if (!segment) { return; }
              const airwayName = `Airway – ${segment.airway}`;
              const accepted = await GtcDialogs.openMessageDialog(this.gtcService, `Remove ${airwayName}\nfrom flight plan?`);
              if (!accepted) { return; }
              this.props.fms.removeAirway(segment.segmentIndex);

              // Removing the airway will cause this menu to close.
            }}
          />
          <GtcTouchButton
            label={'Edit\nAirway'}
            onPressed={() => {
              const data = this.listItemData.get();
              if (!data) { return; }

              GtcFlightPlanDialogs.editAirway(
                this.props.gtcService,
                this.props.fms,
                this.props.planIndex,
                data.segmentData.segment.segmentIndex,
                this.props.listManager
              );

              // If the airway was successfully edited, this menu will close by itself since the old segment will be removed.
            }}
          />
        </div>
      </div>
    );
  }
}
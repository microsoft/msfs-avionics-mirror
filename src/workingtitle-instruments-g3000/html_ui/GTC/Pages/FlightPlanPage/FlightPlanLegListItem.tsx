import {
  DisplayComponent, VNode, FSComponent, Subscription, SetSubject, MutableSubscribable, Subject,
} from '@microsoft/msfs-sdk';

import { FlightPlanLegListData, FlightPlanStore, G3000FilePaths, SelectableFlightPlanListData } from '@microsoft/msfs-wtg3000-common';

import { GtcListItem } from '../../Components/List';
import { FlightPlanAltitudeConstraintBox } from './FlightPlanAltitudeConstraintBox';
import { FlightPlanDataFieldsBox } from './FlightPlanDataFieldsBox';
import { FlightPlanFpaSpeedBox } from './FlightPlanFpaSpeedBox';
import { FlightPlanLegButton, FlightPlanLegButtonProps } from './FlightPlanLegButton';

import './FlightPlanLegListItem.css';

/** The props for FlightPlanLegListItem. */
interface FlightPlanLegListItemProps extends FlightPlanLegButtonProps {
  /** Data describing the list item's associated flight plan leg. */
  legListData: FlightPlanLegListData;

  /** The flight plan index. */
  planIndex: number;

  /** The flight plan store. */
  store: FlightPlanStore;

  /**
   * A mutable subscribable which controls the selected list data. If not defined, pressing the list item's leg button
   * will not cause its list data to become selected or unselected.
   */
  selectedListData?: MutableSubscribable<SelectableFlightPlanListData | null>;
}

/** A component that wraps list item content for use with GtcList. */
export class FlightPlanLegListItem extends DisplayComponent<FlightPlanLegListItemProps> {
  private readonly listItemRef = FSComponent.createRef<DisplayComponent<any>>();
  private readonly legButtonRef = FSComponent.createRef<FlightPlanLegButton>();
  private readonly altitudeBoxRef = FSComponent.createRef<FlightPlanAltitudeConstraintBox>();
  private readonly fpaSpeedBox = FSComponent.createRef<DisplayComponent<any>>();
  private readonly dataFieldsBoxRef = FSComponent.createRef<DisplayComponent<any>>();

  private readonly hideBorder = Subject.create(false);
  private readonly paddedListItem = Subject.create(true);

  private readonly classList = SetSubject.create(['flight-plan-leg-list-item']);

  private readonly subs = [] as Subscription[];
  private readonly airwaySubs = [] as Subscription[];

  /** @inheritdoc */
  public override onAfterRender(): void {
    const { legListData } = this.props;
    const { legData } = legListData;

    this.classList.toggle('direct-to-random-leg', this.props.isDirectToRandom === true);

    this.classList.toggle('direct-to-random-main-leg', this.props.isDirectToRandom === true && !legData.isHoldLeg);

    this.classList.toggle('direct-to-random-hold-leg', this.props.isDirectToRandom === true && legData.isHoldLeg);

    this.airwaySubs.push(
      legData.isFirstLegInSegment.sub(isFirstLegInSegment => {
        this.classList.toggle('first-leg-in-segment', isFirstLegInSegment);
      }, false, true),

      legListData.isFirstVisibleLegInSegment.sub(isFirst => {
        this.classList.toggle('first-visible-leg-in-segment', isFirst);
      }, false, true),

      legListData.hasHiddenAirwayLegsBefore.sub(hasHidden => {
        this.classList.toggle('use-airway-exit-list-item', hasHidden);
        this.hideBorder.set(hasHidden);
        this.paddedListItem.set(!hasHidden);
      }, false, true)
    );

    this.subs.push(
      legData.isActiveLeg.sub(isActive => {
        this.classList.toggle('active-leg', isActive);
      }, true),

      legData.isInAirwaySegment.sub(isInAirway => {
        if (isInAirway) {
          this.classList.add('airway-leg');
          this.airwaySubs.forEach(sub => { sub.resume(true); });
        } else {
          this.classList.delete('airway-leg');
          this.airwaySubs.forEach(sub => { sub.pause(); });
          this.classList.delete('first-leg-in-segment');
          this.classList.delete('first-visible-leg-in-segment');
          this.classList.delete('use-airway-exit-list-item');
          this.hideBorder.set(false);
          this.paddedListItem.set(true);
        }
      }, true),

      legListData.isVisible.sub(isVisible => {
        this.classList.toggle('hidden', !isVisible);
      }, true)
    );
  }

  /** @inheritdoc */
  public override render(): VNode | null {
    const { legListData } = this.props;
    const { legData } = legListData;

    // Some legs are never visible
    if (legData.isVisibleLegType === false) {
      // Need to put something in the DOM so that it gets removed properly
      return <div class="hidden-leg" style="display: none;" />;
    }

    return (
      <GtcListItem
        ref={this.listItemRef}
        hideBorder={this.hideBorder}
        paddedListItem={this.paddedListItem}
        class={this.classList}
      >
        <FlightPlanLegButton
          ref={this.legButtonRef}
          fms={this.props.fms}
          gtcService={this.props.gtcService}
          legListData={legListData}
          waypointCache={this.props.waypointCache}
          isDirectToRandom={this.props.isDirectToRandom}
          selectedListData={this.props.selectedListData}
        >
          <div class="airway-exit-text cyan medium-font">{this.props.legListData.airwayExitText}</div>
        </FlightPlanLegButton>
        {this.props.isDirectToRandom !== true &&
          <FlightPlanAltitudeConstraintBox
            ref={this.altitudeBoxRef}
            fms={this.props.fms}
            gtcService={this.props.gtcService}
            legData={legData}
            planIndex={this.props.planIndex}
          />
        }
        {this.props.gtcService.isAdvancedVnav
          ? <FlightPlanFpaSpeedBox
            ref={this.fpaSpeedBox}
            legData={legData}
            fms={this.props.fms}
            planIndex={this.props.planIndex}
            gtcService={this.props.gtcService}
          />
          : <FlightPlanDataFieldsBox
            ref={this.dataFieldsBoxRef}
            legListData={legListData}
            store={this.props.store}
            gtcService={this.props.gtcService}
          />
        }
        <img class="airway-connector-first" src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/wt-airway-connector-first-large.png`} />
        <img class="airway-connector" src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/wt-airway-connector-large.png`} />
        <img class="airway-connector-dashed" src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/wt-airway-connector-dashed-large.png`} />
        {this.props.children}
      </GtcListItem>
    );
  }

  /** @inheritdoc */
  public override destroy(): void {
    this.legButtonRef.getOrDefault()?.destroy();
    this.listItemRef.getOrDefault()?.destroy();
    this.altitudeBoxRef.getOrDefault()?.destroy();
    this.fpaSpeedBox.getOrDefault()?.destroy();
    this.dataFieldsBoxRef.getOrDefault()?.destroy();

    this.subs.forEach(sub => { sub.destroy(); });
    this.airwaySubs.forEach(sub => { sub.destroy(); });

    super.destroy();
  }
}

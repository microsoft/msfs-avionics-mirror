/* eslint-disable max-len */
import { DisplayComponent, EventBus, FSComponent, SetSubject, Subject, Subscription, VNode } from '@microsoft/msfs-sdk';

import { FlightPlanLegListData, FlightPlanStore, ListItem, SectionOutline } from '@microsoft/msfs-epic2-shared';

import { LogControllerOptions } from '../../FlightPlanLogControllerSection';

import './FlightPlanDiscoListItem.css';

/** The props for FlightPlanLegListItem. */
interface FlightPlanLegListItemProps {
  /** Data describing the list item's associated flight plan leg. */
  legListData: FlightPlanLegListData;

  /** The flight plan index. */
  planIndex: number;

  /** The flight plan store. */
  store: FlightPlanStore;

  /** The event bus */
  bus: EventBus;

  /** Log Controller Option List **/
  selectedLogControllerOption: Subject<LogControllerOptions>;
  // /**
  //  * A mutable subscribable which controls the selected list data. If not defined, pressing the list item's leg button
  //  * will not cause its list data to become selected or unselected.
  //  */
  // selectedListData?: MutableSubscribable<SelectableFlightPlanListData | null>;
}

/** A component that wraps list item content for use with GtcList. */
export class FlightPlanDiscoListItem extends DisplayComponent<FlightPlanLegListItemProps> {
  private readonly listItemRef = FSComponent.createRef<DisplayComponent<any>>();
  private readonly outlineRef = FSComponent.createRef<SectionOutline>();

  private readonly hideBorder = Subject.create(false);
  private readonly paddedListItem = Subject.create(true);
  private readonly classListControllerOption = Subject.create('');

  private readonly classList = SetSubject.create(['flight-plan-disco-list-item']);

  private readonly subs = [] as Subscription[];
  private readonly airwaySubs = [] as Subscription[];

  /** Runs when the outlined element is selected */
  private onMouseDown(): void {
    const isThisSelected = this.props.store.selectedEnrouteWaypoint.get() == this.props.legListData;
    this.props.store.selectedEnrouteWaypoint.set(!isThisSelected ? this.props.legListData : undefined);
  }

  /** @inheritdoc */
  public override onAfterRender(): void {
    this.props.legListData.legData.isActiveLeg.sub(isActiveLeg => {
      this.classList.toggle('active-leg', isActiveLeg);
    }, true);
    this.props.legListData.legData.isFromLeg.sub(isFromLeg => {
      this.classList.toggle('from-leg', isFromLeg);
    }, true);

    this.props.legListData.legData.isBehindActiveLeg.sub(removing => this.classList.toggle('removing-leg', removing));
    this.props.legListData.isBeingRemoved.sub(removing => this.classList.toggle('removing-leg', removing));
    this.props.selectedLogControllerOption.sub((x) => {
      this.classListControllerOption.set(`list-view-${x.toLowerCase().replace(/\//g, '-')}`);
    }, true);

    if (this.outlineRef.getOrDefault()?.outlineElement.getOrDefault()) {
      this.outlineRef.instance.outlineElement.instance.addEventListener('mousedown', () => this.onMouseDown());
      this.props.store.selectedEnrouteWaypoint.sub((legListData) => {
        const isThisSelected = legListData == this.props.legListData;
        this.outlineRef.instance.forceOutline(isThisSelected);
      });
    }
  }

  /** @inheritdoc */
  public override render(): VNode | null {
    const { legListData } = this.props;
    const { legData } = legListData;

    // Some legs are never visible
    if (!legData.isVisibleLegType) {
      // Need to put something in the DOM so that it gets removed properly
      return <div class="hidden-leg" style="display: none;" />;
    }

    return (
      <ListItem
        ref={this.listItemRef}
        hideBorder={this.hideBorder}
        paddedListItem={this.paddedListItem}
        class={this.classList}
        isVisible={this.props.legListData.isVisible}
      >
        <div class="container">
          <SectionOutline bus={this.props.bus} ref={this.outlineRef}>
            <div class="bottom-row">
              <div class="leg-name">Discontinuity</div>
            </div>
          </SectionOutline>
        </div>
      </ListItem >
    );
  }

  /** @inheritdoc */
  public override destroy(): void {
    this.listItemRef.getOrDefault()?.destroy();

    this.subs.forEach(sub => { sub.destroy(); });
    this.airwaySubs.forEach(sub => { sub.destroy(); });

    super.destroy();
  }
}

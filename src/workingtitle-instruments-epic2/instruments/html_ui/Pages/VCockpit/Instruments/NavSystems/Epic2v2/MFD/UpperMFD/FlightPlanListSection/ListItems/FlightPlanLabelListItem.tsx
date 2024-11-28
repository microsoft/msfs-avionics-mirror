/* eslint-disable max-len */
import { DisplayComponent, EventBus, FSComponent, SetSubject, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { FlightPlanLegListData, FlightPlanStore, ListItem, SectionOutline } from '@microsoft/msfs-epic2-shared';

import './FlightPlanLabelListItem.css';

/** The props for FlightPlanLegListItem. */
interface FlightPlanLabelListItemProps {
  /** The upper label */
  upperLabel?: string;

  /** The label */
  label: string;

  /** Whether the item is visible or not */
  isVisible: boolean | Subscribable<boolean>;

  /** Whether the item can be selected in the flight plan */
  isSelectable: boolean;

  /** The leg data */
  legListData?: FlightPlanLegListData;

  /** List of classes to apply */
  classList?: string[]

  /** The event bus */
  bus: EventBus;

  /** The flight plan store. */
  store: FlightPlanStore;
}

/** A component that wraps list item content for use with GtcList. */
export class FlightPlanLabelListItem extends DisplayComponent<FlightPlanLabelListItemProps> {
  private readonly listItemRef = FSComponent.createRef<DisplayComponent<any>>();
  private readonly outlineRef = FSComponent.createRef<SectionOutline>();
  private readonly hideBorder = Subject.create(false);
  private readonly paddedListItem = Subject.create(true);

  private readonly classList = SetSubject.create(['flight-plan-label-list-item']);


  /** Runs when the outlined element is selected */
  private onMouseDown(): void {
    const isThisSelected = this.props.store.selectedEnrouteWaypoint.get() === this.props.legListData;
    this.props.store.selectedEnrouteWaypoint.set(!isThisSelected ? this.props.legListData : undefined);
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.legListData?.legData.isFromLeg.sub(isFromLeg => {
      this.classList.toggle('from-leg', isFromLeg);
    }, true);
    this.props.legListData?.isBeingRemoved.sub(removing => {
      this.classList.toggle('removing-leg', removing);
    });

    if (this.props.classList) {
      this.props.classList.forEach((classString) => {
        this.classList.add(classString);
      });
    }

    if (this.props.isSelectable && this.outlineRef.getOrDefault()) {
      this.outlineRef.instance.outlineElement.instance.addEventListener('mousedown', () => this.onMouseDown());
      this.props.store.selectedEnrouteWaypoint.sub((legListData) => {
        const isThisSelected = legListData === this.props.legListData;
        this.outlineRef.instance.forceOutline(isThisSelected);
      });
    }
  }

  /** @inheritdoc */
  public override render(): VNode | null {
    return (
      <ListItem
        hideBorder={this.hideBorder}
        paddedListItem={this.paddedListItem}
        class={this.classList}
        isVisible={this.props.isVisible}
      >
        <SectionOutline bus={this.props.bus} ref={this.outlineRef}>
          <div class="top-row">
            <div class="leg-name">{this.props.upperLabel}</div>
          </div>
          <div class="bottom-row">
            <div class="leg-name">{this.props.label}</div>
          </div>
        </SectionOutline>
      </ListItem >
    );
  }

  /** @inheritdoc */
  public override destroy(): void {
    this.listItemRef.getOrDefault()?.destroy();

    super.destroy();
  }
}

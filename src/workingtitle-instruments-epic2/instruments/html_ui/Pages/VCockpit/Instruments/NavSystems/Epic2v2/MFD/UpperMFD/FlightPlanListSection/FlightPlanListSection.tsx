/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BitFlags, ComponentProps, DisplayComponent, EventBus, FlightPlanUtils, FSComponent, LegDefinitionFlags, LegType, NumberFormatter, Subject, VNode
} from '@microsoft/msfs-sdk';

import {
  AmendRouteButtonListData, Epic2ExtraLegDefinitionFlags, Epic2Fms, Epic2FmsUtils, Epic2List, FlightPlanLegListData, FlightPlanListData, FlightPlanListManager,
  FlightPlanStore, ListItem, ModalService, SectionOutline
} from '@microsoft/msfs-epic2-shared';

import { ActivatePlanButtonBar } from '../Common/ActivatePlanButtonBar';
import { HoldButton } from '../Common/HoldButton';
import { VectorsButton } from '../Common/VectorsButton';
import { DestinationInfo } from '../FlightPlanConfigSection/DestinationInfo/DestinationInfo';
import { LogControllerOptions } from '../FlightPlanLogControllerSection';
import { FlightPlanAmendListItem } from './ListItems/FlightPlanAmendListItem';
import { FlightPlanDirectListItem } from './ListItems/FlightPlanDirectListItem';
import { FlightPlanDiscoListItem } from './ListItems/FlightPlanDiscoListItem';
import { FlightPlanDividerListItem } from './ListItems/FlightPlanDividerListItem';
import { FlightPlanDtoRandomListItem } from './ListItems/FlightPlanDtoRandomListItem';
import { FlightPlanHoldListItem } from './ListItems/FlightPlanHoldListItem';
import { FlightPlanLabelListItem } from './ListItems/FlightPlanLabelListItem';
import { FlightPlanLegListItem } from './ListItems/FlightPlanLegListItem';

import './FlightPlanListSection.css';

/** The properties for the {@link FlightPlanListSection} component. */
interface FlightPlanListSectionProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The GtcService instance */
  fms: Epic2Fms;
  /** Which flight plan index to handle events for. */
  planIndex: number;
  /** The flight plan store to use for the active plan. */
  storeActive: FlightPlanStore;
  /** The flight plan store to use for the pending plan. */
  storePending: FlightPlanStore;
  /** The flight plan list to use for the active plan. */
  listManagerActive: FlightPlanListManager;
  /** The flight plan list to use for the pending plan. */
  listManagerPending: FlightPlanListManager;
  /** Log Controller Option List **/
  selectedLogControllerOption: Subject<LogControllerOptions>;
  /** The modal service */
  modalService: ModalService
}

/** The FlightPlanListSection component. */
export class FlightPlanListSection extends DisplayComponent<FlightPlanListSectionProps> {
  private readonly flightPlanListActive = FSComponent.createRef<Epic2List<FlightPlanListData>>();
  private readonly flightPlanListPending = FSComponent.createRef<Epic2List<FlightPlanListData>>();

  private readonly isExpanded = this.props.storeActive.isFlightPlanListExpanded;

  private readonly listItemHeightPx = 63;
  private readonly listItemSpacingPx = 2;

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    // scroll to the top of the plan when DTO random opens
    this.props.storeActive.isDtoRandomEntryShown.sub((isVisible) => isVisible && this.flightPlanListActive.instance.scrollToIndex(0, 0, false));
    this.props.storePending.isDtoRandomEntryShown.sub((isVisible) => isVisible && this.flightPlanListPending.instance.scrollToIndex(0, 0, false));

    this.props.storePending.amendWaypointForDisplay.sub(() => {
      const index = this.findAmendListItemIndex(this.flightPlanListPending.instance);
      if (index) { this.flightPlanListPending.instance.scrollToIndex(index, 1, false); }
    });
  }

  /**
   * Finds the index of the amend route list item
   * @param list The flight plan list
   * @returns The index of the amend route list item, or null
   */
  private findAmendListItemIndex(list: Epic2List<FlightPlanListData>): number | null {
    return list.props.data?.getArray().findIndex((v) => v.type === 'amendRouteButton') ?? null;
  }

  /**
   * Renders a flight plan list item.
   * @param listItem The list item to render.
   * @returns The rendered list item.
   * @throws If the list item is not of a type that has been handled - this should never occur
   */
  private readonly renderItem = (listItem: FlightPlanListData): VNode => {
    /*  eslint-disable no-case-declarations */
    switch (listItem.type) {
      case 'segment': {
        switch (listItem.segmentData.segment.segmentType) {
          default:
            return (
              <ListItem isVisible={listItem.isVisible}>
                SEG - {listItem.segmentData.segment.segmentType}
              </ListItem>
            );
        }
      }
      case 'leg':
        /* eslint-disable no-case-declarations */
        const leg = (listItem as FlightPlanLegListData).legData.leg;
        const legType = leg.leg.type;
        const formatHeading = NumberFormatter.create({ precision: 1, pad: 3, nanString: '' });
        if (BitFlags.isAny(leg.flags, Epic2ExtraLegDefinitionFlags.DirectToTarget)) {
          return (
            <FlightPlanLegListItem
              selectedLogControllerOption={this.props.selectedLogControllerOption}
              legListData={listItem}
              planIndex={this.props.planIndex}
              store={this.props.storeActive}
              bus={this.props.bus}
            />
          );
        } else if (FlightPlanUtils.isDiscontinuityLeg(legType) && BitFlags.isAny(leg.flags, LegDefinitionFlags.VectorsToFinal | LegDefinitionFlags.VectorsToFinalFaf)) {
          return (
            <FlightPlanLabelListItem
              label='Fly VECTORS to intercept'
              isVisible={listItem.isVisible}
              legListData={listItem}
              isSelectable={true}
              bus={this.props.bus}
              store={this.props.storeActive}
            />
          );
        } else if (legType == LegType.VM || legType == LegType.FM) {
          return (
            <FlightPlanLabelListItem
              upperLabel={`Fly ${formatHeading(leg.leg.course)}° or as assigned`}
              label='LNAV disengages after turn'
              isVisible={listItem.isVisible}
              legListData={listItem}
              isSelectable={true}
              bus={this.props.bus}
              store={this.props.storeActive}
            />
          );
        } else if (legType == LegType.VI || BitFlags.isAny(leg.flags, Epic2ExtraLegDefinitionFlags.HeadingInterceptLeg)) {
          return (
            <FlightPlanLabelListItem
              label='Fly HDG Sel to intercept'
              isVisible={listItem.isVisible.map(vis => vis && !Epic2FmsUtils.isDiscontinuityLeg(legType))}
              legListData={listItem}
              isSelectable={true}
              bus={this.props.bus}
              store={this.props.storeActive}
            />
          );
        } else if (FlightPlanUtils.isDiscontinuityLeg(legType)) {
          return (
            <FlightPlanDiscoListItem
              selectedLogControllerOption={this.props.selectedLogControllerOption}
              legListData={listItem}
              planIndex={this.props.planIndex}
              store={this.props.storeActive}
              bus={this.props.bus}
            />
          );
        } else {
          return (
            <FlightPlanLegListItem
              selectedLogControllerOption={this.props.selectedLogControllerOption}
              legListData={listItem}
              planIndex={this.props.planIndex}
              store={this.props.storeActive}
              bus={this.props.bus}
            />
          );
        }
      case 'missedApproachDivider':
        return (
          <FlightPlanDividerListItem
            label='Missed Approach'
            isVisible={listItem.isVisible}
          />
        );
      case 'alternatePlanDivider':
        return (
          <FlightPlanDividerListItem
            label='Alternate FPLN'
            isVisible={listItem.isVisible}
          />
        );
      case 'nextLegUndefined':
        return (
          <FlightPlanLabelListItem label='Next Leg Undefined' isVisible={listItem.isVisible} isSelectable={false} bus={this.props.bus} store={this.props.storeActive} />
        );
      case 'amendRouteButton':
        return (
          <FlightPlanAmendListItem
            planIndex={this.props.planIndex}
            store={this.props.storePending}
            bus={this.props.bus}
            fms={this.props.fms}
            isVisible={listItem.isVisible}
            modalService={this.props.modalService}
          />
        );
      case 'directTo':
        return (
          <FlightPlanDirectListItem
            listData={listItem}
            planIndex={this.props.planIndex}
            store={this.props.storeActive}
            bus={this.props.bus}
          />
        );
      case 'hold':
        return (
          <FlightPlanHoldListItem
            listData={listItem}
            planIndex={this.props.planIndex}
            store={this.props.storeActive}
            bus={this.props.bus}
          />);
      case 'directToRandomEntry':
        return (
          <FlightPlanDtoRandomListItem
            planIndex={this.props.planIndex}
            store={this.props.storePending}
            bus={this.props.bus}
            fms={this.props.fms}
            isVisible={listItem.isVisible}
            modalService={this.props.modalService}
          />
        );
      case 'toc':
        return (
          <FlightPlanLabelListItem
            label='*TOC'
            isVisible={true}
            classList={['top-of-marker']}
            isSelectable={false}
            bus={this.props.bus}
            store={this.props.storeActive}
          />
        );
      case 'tod':
        return (
          <FlightPlanLabelListItem
            label='*TOD'
            isVisible={true}
            classList={['top-of-marker']}
            isSelectable={false}
            bus={this.props.bus}
            store={this.props.storeActive}
          />
        );
      default:
        throw Error('[F/PLN LIST] renderItem() failed to return a valid list item');
    }
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={{ 'flight-plan-list-section': true, 'expanded': this.isExpanded }} data-checklist="checklist-flight-plan">
        <SectionOutline bus={this.props.bus}>
          <div class="flight-plan-list-group">
            <div class="flight-plan-list-column-headers"></div>
            <div class="flight-plan-list-box">
              <Epic2List<FlightPlanListData>
                ref={this.flightPlanListActive}
                class="flight-plan-list plan-active"
                bus={this.props.bus}
                listItemHeightPx={this.listItemHeightPx}
                heightPx={this.isExpanded.map(x => x ? 648 : 258)}
                listItemSpacingPx={this.listItemSpacingPx}
                itemsPerPage={this.isExpanded.map(x => x ? 10 : 4)}
                data={this.props.listManagerActive.dataList}
                renderItem={this.renderItem}
                // onTopVisibleIndexChanged={this.calcTopRow}
                isVisible={this.props.fms.planInMod.map(x => !x)}
                scrollbarStyle="outside"
              />
              <Epic2List<FlightPlanListData>
                ref={this.flightPlanListPending}
                class="flight-plan-list plan-pending"
                bus={this.props.bus}
                listItemHeightPx={this.listItemHeightPx}
                heightPx={this.isExpanded.map(x => x ? 648 : 258)}
                listItemSpacingPx={this.listItemSpacingPx}
                itemsPerPage={this.isExpanded.map(x => x ? 10 : 4)}
                data={this.props.listManagerPending.dataList}
                renderItem={this.renderItem}
                isVisible={this.props.fms.planInMod}
                scrollbarStyle="outside"
              />
            </div>
          </div>
          <ActivatePlanButtonBar fms={this.props.fms} />
          <HoldButton fms={this.props.fms} bus={this.props.bus} store={this.props.storeActive} />
          <VectorsButton fms={this.props.fms} bus={this.props.bus} store={this.props.storeActive} />
          <DestinationInfo store={this.props.storeActive} bus={this.props.bus} />
        </SectionOutline>
      </div>
    );
  }
}

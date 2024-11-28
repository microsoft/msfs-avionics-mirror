/* eslint-disable max-len */
import {
  ComputedSubject, DisplayComponent, EventBus, Facility, FacilitySearchType, FacilityType, FlightPlanSegmentType, FSComponent, ICAO, LegDefinition,
  MappedSubject, SetSubject, Subject, Subscribable, Subscription, VNode
} from '@microsoft/msfs-sdk';

import {
  BarTouchButtonArrow, Epic2CoordinatesUtils, Epic2Fms, Epic2FmsUtils, FlightPlanLegData, FlightPlanStore, FmsMessageKey, FmsMessageTransmitter, InputField,
  KeyboardInputButton, ListItem, ModalKey, ModalService, SectionOutline, TouchButton, UppercaseTextInputFormat
} from '@microsoft/msfs-epic2-shared';

import { JoinAirwayOverlay } from '../../Modals/JoinOverlayModal';
import { SelectObjectModal } from '../../Modals/SelectObjectModal';

import './FlightPlanAmendListItem.css';

/** The props for FlightPlanLegListItem. */
interface FlightPlanAmendListItemProps {

  /** The flight plan index. */
  planIndex: number;

  /** The flight plan store. */
  store: FlightPlanStore;

  /** The event bus */
  bus: EventBus;

  /** The fms */
  fms: Epic2Fms;

  /** Is this item visible? */
  isVisible: Subscribable<boolean>

  /** The modal service */
  modalService: ModalService
}

/** A component that wraps list item content for use with GtcList. */
export class FlightPlanAmendListItem extends DisplayComponent<FlightPlanAmendListItemProps> {
  private readonly fmsMessageTransmitter = new FmsMessageTransmitter(this.props.bus);
  private readonly listItemRef = FSComponent.createRef<DisplayComponent<any>>();
  private readonly outlineRef = FSComponent.createRef<SectionOutline>();

  private readonly hideBorder = Subject.create(false);
  private readonly paddedListItem = Subject.create(true);
  private readonly legName = ComputedSubject.create<FlightPlanLegData | undefined, string>(this.props.store.amendWaypointForDisplay.get(), (legData) => legData?.leg.name ?? '');
  private readonly input = Subject.create<string | null>(null);
  private readonly classList = SetSubject.create(['amend-route-list-item']);
  private readonly isVisible = Subject.create(true);
  private readonly isIntersection = Subject.create(false);

  private readonly subs = [] as Subscription[];
  private readonly airwaySubs = [] as Subscription[];

  /**
   * Creates the waypoint in the list, and then sets the amend route list item to point towards the new waypoint
   * @param facility The facility to create the waypoint from
   * @param segmentIndex The index of the segment to insert it into
   * @param segmentLegIndex The local index of the leg to insert it into
   */
  private createWaypointAndSetListIndex(facility: Facility, segmentIndex: number, segmentLegIndex: number): void {
    const plan = this.props.fms.getModFlightPlan();
    const segmentType = plan.getSegment(segmentIndex).segmentType;
    const isLastInSegment = Epic2FmsUtils.isLastLegInSegment(plan, segmentIndex, segmentLegIndex - 1);
    if (segmentType === FlightPlanSegmentType.Departure || segmentType === FlightPlanSegmentType.Destination) {
      segmentIndex = isLastInSegment ? segmentIndex + 1 : segmentIndex;
      segmentLegIndex = isLastInSegment ? 0 : segmentLegIndex;
    }

    this.props.fms.insertWaypoint(facility, segmentIndex, segmentLegIndex);

    const insertedLeg = plan.tryGetLeg(segmentIndex, segmentLegIndex);
    if (insertedLeg) {
      this.setAmendListItemIndex(insertedLeg);
    }
  }

  /**
   * Gets a facility from an icao
   * @param icaoA The first icao
   * @param icaoB The second icao if both have conflicting names
   * @returns The chosen facility, or null if there are none
   */
  private async getFacilityFromIcao(icaoA: string, icaoB?: string): Promise<[Facility | null, Facility | null]> {
    const waypointsA = (await this.props.fms.facLoader.searchByIdent(FacilitySearchType.AllExceptVisual, icaoA)).filter((waypoint) => ICAO.getIdent(waypoint) == icaoA.toUpperCase());
    const waypointsB = icaoB ? (await this.props.fms.facLoader.searchByIdent(FacilitySearchType.AllExceptVisual, icaoB)).filter((waypoint) => ICAO.getIdent(waypoint) == icaoB.toUpperCase()) : null;

    if (!waypointsA || waypointsA.length == 0 || (waypointsB && waypointsB.length == 0)) {
      return [null, null];
    } else {
      let resultA = null, resultB = null;
      if (waypointsA.length == 1 && waypointsA[0]) {
        // Set result A if there is only one waypoint matching icao A
        resultA = await this.props.fms.facLoader.getFacility(ICAO.getFacilityType(waypointsA[0]), waypointsA[0]);
      }

      if (waypointsB) {
        if (waypointsB.length == 1 && waypointsB[0]) {
          // Set result B if there is only one waypoint matching icao A
          resultB = await this.props.fms.facLoader.getFacility(ICAO.getFacilityType(waypointsB[0]), waypointsB[0]);

          // If one waypoint matches icao B, but multiple match icao A, then we want to only show icao A on select waypoint menu
          if (!resultA) {
            [resultA] = await this.props.modalService.open<SelectObjectModal>(ModalKey.SelectObject).modal.getFacility(waypointsA);
          }
        } else {
          [resultA, resultB] = await this.props.modalService.open<SelectObjectModal>(ModalKey.SelectObject).modal.getFacility(waypointsA, waypointsB);
        }
      }

      if (!resultA && !waypointsB) {
        // If there is no icao B provided, and there are multiple matching waypoints to icao A
        [resultA] = await this.props.modalService.open<SelectObjectModal>(ModalKey.SelectObject).modal.getFacility(waypointsA);
      }

      return [resultA, resultB];
    }
  }

  /**
   * Handles when the enter button is pressed
   * @returns nothing
   */
  private async onEnterPress(): Promise<void> {
    const flightPlan = this.props.fms.getModFlightPlan();
    const displayWaypoint = this.props.store.amendWaypointForDisplay.get();

    if (displayWaypoint) {
      const displaySegmentIndex = flightPlan.getSegmentIndex(displayWaypoint.globalLegIndex.get());
      const displaySegmentLegIndex = flightPlan.getSegmentLegIndex(displayWaypoint.globalLegIndex.get());

      const input = this.input.get() ?? '';
      const latLonInput = Epic2CoordinatesUtils.parseLatLong(input, true);
      const isPBDInput = input.split('/').length == 3;
      const isPBPBInput = input.split('/').length == 4;
      const isAirwayInput = input.split('.').length == 2;

      if (latLonInput !== null) {
        const facility = this.props.fms.createLLWaypoint(latLonInput);
        this.createWaypointAndSetListIndex(facility, displaySegmentIndex, displaySegmentLegIndex + 1);
      } else if (isPBDInput) {
        const [place, bearing, distance] = input.split('/');
        const [placeFacility] = await this.getFacilityFromIcao(place);
        const numBearing = Number(bearing), numDistance = Number(distance);

        if (!placeFacility) {
          return this.fmsMessageTransmitter.sendMessage(FmsMessageKey.GenericInvalidEntry);
        }

        if (isNaN(numBearing) || numBearing < 0 || numBearing > 360 || isNaN(numDistance)) {
          this.fmsMessageTransmitter.sendMessage(FmsMessageKey.GenericInvalidEntry);
        } else {
          const facility = this.props.fms.createPBDWaypoint(placeFacility, numBearing, numDistance);
          this.createWaypointAndSetListIndex(facility, displaySegmentIndex, displaySegmentLegIndex + 1);
        }
      } else if (isPBPBInput) {
        const [place1, bearing1, place2, bearing2] = input.split('/');
        const [place1Facility, place2Facility] = await this.getFacilityFromIcao(place1, place2);
        const numBearing1 = Number(bearing1), numBearing2 = Number(bearing2);

        if (!place1Facility || !place2Facility) {
          return this.fmsMessageTransmitter.sendMessage(FmsMessageKey.GenericInvalidEntry);
        }

        if (isNaN(numBearing1) || numBearing1 < 0 || numBearing1 > 360 || isNaN(numBearing2) || numBearing2 < 0 || numBearing2 > 360) {
          this.fmsMessageTransmitter.sendMessage(FmsMessageKey.GenericInvalidEntry);
        } else {
          const facility = this.props.fms.createPBPBWaypoint(place1Facility, numBearing1, place2Facility, numBearing2);
          if (facility) {
            this.createWaypointAndSetListIndex(facility, displaySegmentIndex, displaySegmentLegIndex + 1);
          } else {
            this.fmsMessageTransmitter.sendMessage(FmsMessageKey.GenericInvalidEntry);
          }
        }
      } else if (isAirwayInput) {
        const [airway, waypoint] = input.split('.');
        const currentWaypointIcao = displayWaypoint?.leg.leg.fixIcao;
        if (currentWaypointIcao) {
          this.props.fms.facLoader.getFacility(FacilityType.Intersection, currentWaypointIcao).then(async (entryFacility) => {
            const segmentType = flightPlan.getSegment(displaySegmentIndex).segmentType;
            const validAirways = entryFacility.routes;
            const selectedAirwaySegment = validAirways.find((airwaySearch) => airway == airwaySearch.name);

            if (!selectedAirwaySegment) {
              return this.fmsMessageTransmitter.sendMessage(FmsMessageKey.GenericInvalidEntry);
            }

            const selectedAirway = await this.props.fms.facLoader.getAirway(selectedAirwaySegment.name, selectedAirwaySegment.type, currentWaypointIcao);
            const selectedWaypoint = selectedAirway.waypoints.find((waypointSearch) => ICAO.getIdent(waypointSearch.icao) == waypoint);


            if (!selectedWaypoint || !(segmentType == FlightPlanSegmentType.Enroute || segmentType == FlightPlanSegmentType.Departure)) {
              return this.fmsMessageTransmitter.sendMessage(FmsMessageKey.GenericInvalidEntry);
            }

            this.props.fms.insertAirwaySegment(selectedAirway, entryFacility, selectedWaypoint, displaySegmentIndex, displaySegmentLegIndex);
            for (const segment of flightPlan.segmentsOfType(FlightPlanSegmentType.Enroute)) {
              if (segment.airway == airway.toUpperCase()) {
                this.setAmendListItemIndex(segment.legs[segment.legs.length - 1]);
              }
            }
          }).catch(() => {
            this.fmsMessageTransmitter.sendMessage(FmsMessageKey.GenericInvalidEntry);
          });
        }
      } else {
        const [facility] = await this.getFacilityFromIcao(input);

        if (!facility) {
          return this.fmsMessageTransmitter.sendMessage(FmsMessageKey.GenericInvalidEntry);
        }

        this.createWaypointAndSetListIndex(facility, displaySegmentIndex, displaySegmentLegIndex + 1);
      }
    }
  }

  /**
   * Sets the index of the amend list item
   * @param referenceLegDef the leg definition to be used for setting the index
   */
  private setAmendListItemIndex(referenceLegDef: LegDefinition): void {
    const referenceLeg = this.props.store.legMap.get(referenceLegDef);

    this.props.store.amendWaypointForDisplay.set(referenceLeg);
  }

  /**
   * Sets the visibility of the join button
   * @param data The amend waypoint selected
   */
  private setJoinButtonVisibility(data: FlightPlanLegData | undefined): void {
    if (data && data.leg.leg.fixIcao.trim().length > 0) {
      const segmentType = data.segment.segmentType;
      if (segmentType == FlightPlanSegmentType.Departure || segmentType == FlightPlanSegmentType.Enroute) {
        this.props.fms.facLoader.getFacility(FacilityType.Intersection, data.leg.leg.fixIcao).then((fac) => {
          this.isIntersection.set((fac && fac.routes !== undefined && fac.routes.length > 0) ? true : false);
        });
      } else {
        this.isIntersection.set(false);
      }
    } else {
      this.isIntersection.set(false);
    }
  }

  /** @inheritdoc */
  public override onAfterRender(): void {
    this.props.store.amendWaypointForDisplay.sub((itemData) => {
      this.legName.set(itemData);
      this.setJoinButtonVisibility(itemData);
    }, true);

    MappedSubject.create(this.props.store.amendWaypointForDisplay.map((input) => input !== undefined), this.props.isVisible).sub(([waypointDisplay, isVisible]) => {
      this.isVisible.set(waypointDisplay == true && isVisible == true);
    });
  }

  private readonly amendRouteInputFormatter = new UppercaseTextInputFormat('- '.repeat(16), 30);

  /** @inheritdoc */
  public override render(): VNode | null {
    return (
      <ListItem
        ref={this.listItemRef}
        hideBorder={this.hideBorder}
        paddedListItem={this.paddedListItem}
        class={this.classList}
        isVisible={this.isVisible}
      >
        <div class='amend-route-touch-button'>
          <div class='amend-route-top-row-container'>
            <div>After: <span class='amend-route-leg-name'>{this.legName}</span></div>
            <KeyboardInputButton bus={this.props.bus} classes='keyboard-button' />
            <TouchButton isVisible={this.isIntersection} isEnabled={true} variant='bar' class={'join-button'} onPressed={() => this.props.modalService.open<JoinAirwayOverlay>(ModalKey.JoinAirway)}>
              <div class="text">Join</div>
              <BarTouchButtonArrow isRightArrow={true}></BarTouchButtonArrow>
            </TouchButton>
          </div>
          <div class='amend-route-bottom-row-container'>
            <InputField
              bus={this.props.bus}
              textAlign='center'
              bind={this.input}
              formatter={this.amendRouteInputFormatter}
              maxLength={30}
              tscConnected
              blurOnEnter
              onBlur={this.onEnterPress.bind(this)}
            />
            <TouchButton onPressed={this.onEnterPress.bind(this)} isEnabled={true} variant='bar' class={'enter-button'}>
              <div class="text">Enter</div>
            </TouchButton>
          </div>
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

import {
  AirportFacility, BitFlags, Facility, FacilitySearchType, FixTypeFlags, FlightPlanSegment, FlightPlanSegmentType,
  FlightPlanUtils, FSComponent, LegDefinition, LegDefinitionFlags, LegType, MagVar, OneWayRunway, RunwayUtils, VNode,
} from '@microsoft/msfs-sdk';

import { ApproachNameDisplay, Fms, FmsUtils } from '@microsoft/msfs-garminsdk';

import { FlightPlanListManager, FlightPlanStore } from '@microsoft/msfs-wtg3000-common';
import { GtcAirwaySelectionDialog } from '../../Dialog/GtcAirwaySelectionDialog';
import { GtcDialogs } from '../../Dialog/GtcDialogs';
import { GtcDialogResult } from '../../Dialog/GtcDialogView';
import { GtcKeyboardDialog } from '../../Dialog/GtcKeyboardDialog';
import { GtcListDialog, ListDialogItemDefinition } from '../../Dialog/GtcListDialog';
import { GtcService } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';


/** Collection of utility functions to open different flight plan related dialogs. */
export class GtcFlightPlanDialogs {
  /**
   * Opens an Airport Identifier Lookup keyboard dialog.
   * @param gtcService The GtcService.
   * @param initialInputText Initial input text, if it should show an airport as already beign typed out.
   * @returns The selected airport, if one was selected.
   */
  public static openAirportDialog(gtcService: GtcService, initialInputText?: string): Promise<GtcDialogResult<AirportFacility>> {
    return gtcService
      .openPopup<GtcKeyboardDialog<AirportFacility>>(GtcViewKeys.KeyboardDialog, 'normal', 'hide')
      .ref.request({
        facilitySearchType: FacilitySearchType.Airport,
        label: 'Airport Identifier Lookup',
        allowSpaces: false,
        maxLength: 6,
        initialInputText,
      });
  }

  /**
   * Opens an Airport Identifier Lookup keyboard dialog.
   * @param gtcService The GtcService.
   * @param airportFacility The airport facility to get the runways from.
   * @param selectedRunway The currently selected runway.
   * @returns The selected airport, if one was selected.
   */
  public static openRunwayDialog(
    gtcService: GtcService,
    airportFacility: AirportFacility,
    selectedRunway?: OneWayRunway,
  ): Promise<GtcDialogResult<OneWayRunway>> {
    const runways = RunwayUtils.getOneWayRunwaysFromAirport(airportFacility);

    const inputData = runways.map<ListDialogItemDefinition<OneWayRunway>>(runway => ({
      labelRenderer: () => 'RW' + runway.designation,
      value: runway,
    }));

    const foundRunway = runways.find(x => x.designation === selectedRunway?.designation);

    return gtcService
      .openPopup<GtcListDialog>(GtcViewKeys.ListDialog1, 'normal', 'hide')
      .ref.request({
        title: 'Select Runway',
        selectedValue: foundRunway ?? inputData[0].value,
        inputData: inputData,
        class: 'gtc-list-dialog-wide',
      });
  }

  /**
   * Shows remove waypoint dialog, removing the waypoint if user confirms.
   * @param gtcService The GtcService.
   * @param fms The Fms.
   * @param store The flight plan store.
   * @param segment The segment containing the leg.
   * @param leg The leg to remove.
   * @param legName The leg name.
   */
  public static async removeWaypoint(gtcService: GtcService, fms: Fms, store: FlightPlanStore, segment: FlightPlanSegment, leg: LegDefinition, legName?: string): Promise<boolean> {
    const accepted = await GtcDialogs
      .openMessageDialog(gtcService, `Remove ${legName ?? leg.name}?`);
    if (accepted === true) {
      const planLeg = fms.getPrimaryFlightPlan().getLeg(segment.segmentIndex, segment.legs.indexOf(leg));
      // In case plan has changed
      if (planLeg !== leg) { return false; }

      const isLastLegInSegment = segment.legs.length === 1;
      const isOnlyDepartureLeg = segment.segmentType === FlightPlanSegmentType.Departure && isLastLegInSegment;
      const isOnlyDestinationLeg = segment.segmentType === FlightPlanSegmentType.Destination && isLastLegInSegment;
      const origin = store.originFacility.get();
      const departure = store.departureProcedure.get();
      const destination = store.destinationFacility.get();

      const removed = fms.removeWaypoint(segment.segmentIndex, segment.legs.indexOf(leg));

      if (removed) {
        if (isOnlyDepartureLeg && origin) {
          if (leg.leg.fixIcao === origin.icao) {
            // If removing the origin leg, then we want to clear the origin from the plan
            fms.setOrigin(undefined, undefined);
          } else if (origin && !departure && leg.name?.startsWith('RW') && leg.name.replace('RW', '').toLowerCase() === store.originRunway.get()?.designation.toLowerCase()) {
            // If no departure procedure has been loaded, but a the runway leg was removed, just clear the runway from the plan
            fms.setOrigin(origin, undefined);
          }
        } else if (isOnlyDestinationLeg && destination) {
          if (leg.leg.fixIcao === destination.icao) {
            // If removing the destination leg, then we want to clear the destination from the plan
            fms.setDestination(undefined, undefined);
          } else if (destination && leg.name?.startsWith('RW') && leg.name.replace('RW', '').toLowerCase() === store.destinationRunway.get()?.designation.toLowerCase()) {
            // If a the runway leg was removed, clear the runway from the plan
            fms.setDestination(destination, undefined);
          }
        }
      }
      return removed;
    }
    return false;
  }

  /**
   * Shows remove departure dialog, removing the departure if user confirms.
   * @param gtcService The GtcService.
   * @param store The Flight Plan Store.
   * @param fms The Fms.
   */
  public static async removeDeparture(gtcService: GtcService, store: FlightPlanStore, fms: Fms): Promise<boolean> {
    let departure = store.departureProcedure.get();
    if (!departure) { return false; }
    const accepted = await GtcDialogs
      .openMessageDialog(gtcService, `Remove Departure – \n${store.departureString.get()} from flight plan?`);
    if (accepted === true) {
      departure = store.departureProcedure.get();
      if (!departure) { return false; }
      fms.removeDeparture();
      return true;
    }
    return false;
  }

  /**
   * Shows remove arrival dialog, removing the arrival if user confirms.
   * @param gtcService The GtcService.
   * @param store The Flight Plan Store.
   * @param fms The Fms.
   */
  public static async removeArrival(gtcService: GtcService, store: FlightPlanStore, fms: Fms): Promise<boolean> {
    let arrival = store.arrivalProcedure.get();
    if (!arrival) { return false; }
    const accepted = await GtcDialogs.openMessageDialog(gtcService,
      `Remove Arrival – \n${store.arrivalString.get()} from flight plan?`);
    if (accepted === true) {
      arrival = store.arrivalProcedure.get();
      if (!arrival) { return false; }
      fms.removeArrival();
      return true;
    }
    return false;
  }

  /**
   * Shows remove approach dialog, removing the approach if user confirms.
   * @param gtcService The GtcService.
   * @param store The Flight Plan Store.
   * @param fms The Fms.
   */
  public static async removeApproach(gtcService: GtcService, store: FlightPlanStore, fms: Fms): Promise<boolean> {
    if (!store.isApproachLoaded.get()) { return false; }
    const accepted = await GtcDialogs.openMessageDialog(gtcService,
      <>
        <div>Remove {store.approachStringPrefix.get()}</div>
        <div>
          <ApproachNameDisplay
            approach={store.approachForDisplay.map(x => x ?? null)}
            airport={store.destinationFacility.map(x => x ?? null)}
            useZeroWithSlash={true}
          />
          <span> from</span>
        </div>
        <div>flight plan?</div>
      </>
    );
    if (accepted === true) {
      if (!store.isApproachLoaded.get()) { return false; }
      fms.removeApproach();
      return true;
    }
    return false;
  }

  /**
   * Shows keyboard dialog for selecting a waypoint to insert at the beginning of the first enroute segment.
   * @param gtcService The GtcService.
   * @param fms The Fms.
   * @param planIndex The plan index.
   */
  public static async insertEnrouteWaypoint(gtcService: GtcService, fms: Fms, planIndex: number): Promise<LegDefinition | undefined> {
    const result = await this.openWaypointIdentifierLookup(gtcService);
    if (result.wasCancelled) { return undefined; }
    const firstEnrouteSegmentIndex = fms.findFirstEnrouteSegmentIndex(fms.getFlightPlan(planIndex));
    return fms.insertWaypoint(firstEnrouteSegmentIndex, result.payload, 0);
  }

  /**
   * Shows keyboard dialog for selecting a waypoint to add to the end of the last enroute segment.
   * @param gtcService The GtcService.
   * @param fms The Fms.
   * @param planIndex The plan index.
   */
  public static async addEnrouteWaypoint(gtcService: GtcService, fms: Fms, planIndex: number): Promise<void> {
    const result = await this.openWaypointIdentifierLookup(gtcService);
    if (result.wasCancelled) { return; }
    const lastEnrouteSegmentIndex = fms.findLastEnrouteSegmentIndex(fms.getFlightPlan(planIndex));
    fms.insertWaypoint(lastEnrouteSegmentIndex, result.payload);
  }

  /**
   * Shows keyboard dialog for selecting a waypoint to insert at the beginning of the first enroute segment.
   * @param gtcService The GtcService.
   * @param fms The Fms.
   * @param planIndex Tha flight plan index.
   * @param leg The existing leg to place the new leg relative to.
   * @param position Whether to place the new leg before or after the existing leg.
   */
  public static async insertWaypointBeforeAfter(
    gtcService: GtcService,
    fms: Fms,
    planIndex: number,
    leg: LegDefinition,
    position: 'before' | 'after',
  ): Promise<LegDefinition | undefined> {
    const result = await this.openWaypointIdentifierLookup(gtcService);
    if (result.wasCancelled) { return undefined; }
    const plan = fms.getFlightPlan(planIndex);
    const indexes = FmsUtils.getLegIndexes(plan, leg);

    if (indexes === undefined) {
      return undefined;
    }

    let offset = position === 'after' ? 1 : 0;

    if (
      position === 'after'
      && plan.directToData.segmentIndex === indexes.segmentIndex
      && plan.directToData.segmentLegIndex === indexes.segmentLegIndex
    ) {
      // If we are inserting after a direct-to target leg, adjust the index to insert after the direct-to leg so that
      // we don't end up inserting a leg in the direct-to sequence.
      offset += FmsUtils.DTO_LEG_OFFSET;
    }

    if (
      position === 'before'
      && BitFlags.isAll(leg.flags, LegDefinitionFlags.VectorsToFinalFaf)
      && BitFlags.isAll(plan.getLeg(indexes.globalLegIndex).flags, LegDefinitionFlags.VectorsToFinal)
    ) {
      // If we are inserting before a VTF faf leg with a preceding discontinuity leg, we need to shift the index
      // by -1 to ensure we insert the new leg before the discontinuity leg.
      offset -= 1;
    }

    return fms.insertWaypoint(indexes.segmentIndex, result.payload, indexes.segmentLegIndex + offset);
  }

  /**
   * Opens the keyboard dialog and starts a request for selecting a waypoint of any type.
   * @param gtcService The GtcService.
   * @returns The result of the keyboard dialog request.
   */
  public static async openWaypointIdentifierLookup(gtcService: GtcService): Promise<GtcDialogResult<Facility>> {
    return gtcService.openPopup<GtcKeyboardDialog<Facility>>(
      GtcViewKeys.KeyboardDialog, 'normal', 'hide').ref.request({
        facilitySearchType: FacilitySearchType.AllExceptVisual,
        label: 'Waypoint Identifier Lookup',
        allowSpaces: false,
        maxLength: 6,
      });
  }

  /**
   * Opens a dialog prompting the user to accept whether to activate a flight plan leg. If the user accepts, then
   * the leg is activated. Otherwise, no action is taken.
   * @param gtcService The GTC service.
   * @param fms The FMS.
   * @param leg The leg to activate.
   * @param useTrueBearing Whether to use true bearing when displaying course or heading.
   * @returns A Promise which is fulfilled with whether the leg was successfully activated.
   */
  public static async activateLegToWaypoint(
    gtcService: GtcService,
    fms: Fms,
    leg: LegDefinition,
    useTrueBearing: boolean
  ): Promise<boolean>;
  /**
   * Opens a dialog prompting the user to accept whether to activate a flight plan leg. If the user accepts, then
   * the leg is activated. Otherwise, no action is taken.
   * @param gtcService The GTC service.
   * @param fms The FMS.
   * @param segmentIndex The index of the segment containing the leg to activate.
   * @param segmentLegIndex The index of the leg to activate in its segment.
   * @param useTrueBearing Whether to use true bearing when displaying course or heading.
   * @returns A Promise which is fulfilled with whether the leg was successfully activated.
   */
  public static async activateLegToWaypoint(
    gtcService: GtcService,
    fms: Fms,
    segmentIndex: number,
    segmentLegIndex: number,
    useTrueBearing: boolean
  ): Promise<boolean>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static async activateLegToWaypoint(
    gtcService: GtcService,
    fms: Fms,
    arg3: LegDefinition | number,
    arg4: number | boolean,
    arg5?: boolean
  ): Promise<boolean> {
    const plan = fms.hasPrimaryFlightPlan() && fms.getPrimaryFlightPlan();

    if (!plan) {
      return false;
    }

    let leg: LegDefinition, segmentIndex: number, segmentLegIndex: number, useTrueBearing: boolean;

    if (typeof arg3 === 'number') {
      segmentIndex = arg3;
      segmentLegIndex = arg4 as number;
      const tryLeg = plan.tryGetLeg(segmentIndex, segmentLegIndex);

      if (!tryLeg) {
        return false;
      }

      leg = tryLeg;
      useTrueBearing = arg5 as boolean;
    } else {
      const indexes = FmsUtils.getLegIndexes(plan, arg3);

      if (!indexes) {
        return false;
      }

      leg = arg3;
      segmentIndex = indexes.segmentIndex;
      segmentLegIndex = indexes.segmentLegIndex;
      useTrueBearing = arg4 as boolean;
    }

    if (!fms.canActivateLeg(segmentIndex, segmentLegIndex)) {
      return false;
    }

    const prevLeg = plan.getPrevLeg(segmentIndex, segmentLegIndex);

    const arrow = (
      <img src="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/wt_magenta_activate_leg_arrow.png" />
    );

    const magVar = leg.calculated?.courseMagVar ?? 0;

    let course = leg.leg.course;
    if (useTrueBearing && !leg.leg.trueDegrees) {
      course = MagVar.magneticToTrue(course, magVar);
    } else if (!useTrueBearing && leg.leg.trueDegrees) {
      course = MagVar.trueToMagnetic(course, magVar);
    }

    course = Math.round(course);

    let renderContent: VNode;

    if (BitFlags.isAll(leg.flags, LegDefinitionFlags.VectorsToFinalFaf)) {
      renderContent = (
        <div class="main-text" >
          vtf {(course === 0 ? 360 : course).toString().padStart(3, '0')}°{useTrueBearing ? 'ᴛ' : ''} {arrow} {GtcFlightPlanDialogs.getActivateLegDialogLegText(leg)}
        </div>
      );
    } else if (
      leg.leg.type === LegType.CF
      && (!prevLeg || FlightPlanUtils.isDiscontinuityLeg(leg.leg.type) || FlightPlanUtils.isManualDiscontinuityLeg(leg.leg.type))
    ) {
      renderContent = (
        <div class="main-text" >
          crs {(course === 0 ? 360 : course).toString().padStart(3, '0')}°{useTrueBearing ? 'ᴛ' : ''} {arrow} {GtcFlightPlanDialogs.getActivateLegDialogLegText(leg)}
        </div>
      );
    } else {
      const fromLeg = FmsUtils.getNominalFromLeg(plan, segmentIndex, segmentLegIndex);
      renderContent = (
        <div class="main-text" >
          {fromLeg ? GtcFlightPlanDialogs.getActivateLegDialogLegText(fromLeg) : ''}{arrow} {GtcFlightPlanDialogs.getActivateLegDialogLegText(leg)}
        </div>
      );
    }

    renderContent = (
      <div class="activate-leg-dialog-msg" >
        <div class="title" > Activate Leg ? </div>
        {renderContent}
      </div>
    );

    const accepted = await GtcDialogs.openMessageDialog(gtcService, renderContent);

    // Get the leg again in case something changed the flight plan while we were awaiting the dialog.

    const legToActivate = plan.tryGetLeg(segmentIndex, segmentLegIndex);

    if (accepted && legToActivate !== null && fms.canActivateLeg(segmentIndex, segmentLegIndex)) {
      if (BitFlags.isAll(legToActivate.flags, LegDefinitionFlags.VectorsToFinalFaf)) {
        fms.activateVtf();
      } else {
        fms.activateLeg(segmentIndex, segmentLegIndex, Fms.PRIMARY_PLAN_INDEX, true);
      }

      return true;
    }

    return false;
  }

  /**
   * Gets the display text for a flight plan leg as it should appear in the activate leg dialog.
   * @param leg A flight plan leg.
   * @returns The display text for the flight plan leg as it should appear in the activate leg dialog.
   */
  private static getActivateLegDialogLegText(leg: LegDefinition): string {
    const name = leg.name ?? 'NONAME';
    if (BitFlags.isAll(leg.leg.fixTypeFlags, FixTypeFlags.IAF)) {
      return `${name} iaf`;
    } else if (BitFlags.isAll(leg.leg.fixTypeFlags, FixTypeFlags.FAF)) {
      return `${name} faf`;
    } else if (BitFlags.isAll(leg.leg.fixTypeFlags, FixTypeFlags.MAP)) {
      return `${name} map`;
    } else if (BitFlags.isAll(leg.leg.fixTypeFlags, FixTypeFlags.MAHP)) {
      return `${name} mahp`;
    }

    return name;
  }

  /**
   * Opens the airway selection dialog to load an airway into a flight plan.
   * @param gtcService The GTC service.
   * @param fms The FMS.
   * @param planIndex The index of the flight plan into which to load the airway.
   * @param entryLeg The entry leg of the airway to load.
   * @param listManager The flight plan list manager for the flight plan into which to load the airway.
   * @returns A Promise which is fulfilled with the index of the new airway segment if an airway was loaded, or `-1`
   * if an airway was not loaded.
   */
  public static async loadAirway(
    gtcService: GtcService,
    fms: Fms,
    planIndex: number,
    entryLeg: LegDefinition,
    listManager: FlightPlanListManager,
  ): Promise<number> {
    const result = await gtcService.openPopup<GtcAirwaySelectionDialog>(GtcViewKeys.AirwaySelectionDialog).ref.request({
      leg: entryLeg,
      planIndex,
      listManager: listManager
    });

    if (result.wasCancelled) {
      return -1;
    }

    const { airway, entry, exit, segmentIndex, segmentLegIndex } = result.payload;

    return fms.insertAirwaySegment(airway, entry, exit, segmentIndex, segmentLegIndex);
  }

  /**
   * Opens the airway selection dialog to edit an existing airway in a flight plan.
   * @param gtcService The GTC service.
   * @param fms The FMS.
   * @param planIndex The index of the flight plan to edit.
   * @param editAirwaySegmentIndex The index of the airway segment to edit.
   * @param listManager The flight plan list manager for the flight plan to edit.
   * @returns A Promise which is fulfilled with the index of the edited airway segment if the airway was edited, or
   * `-1` if it was not edited.
   */
  public static async editAirway(
    gtcService: GtcService,
    fms: Fms,
    planIndex: number,
    editAirwaySegmentIndex: number,
    listManager: FlightPlanListManager,
  ): Promise<number> {
    const plan = fms.hasFlightPlan(planIndex) && fms.getFlightPlan(planIndex);

    if (!plan) {
      return -1;
    }

    const result = await gtcService.openPopup<GtcAirwaySelectionDialog>(GtcViewKeys.AirwaySelectionDialog).ref.request({
      planIndex,
      editAirwaySegmentIndex,
      listManager: listManager
    });

    if (result.wasCancelled) {
      return -1;
    }

    const { airway, entry, exit, segmentIndex, segmentLegIndex, editSegmentIndex, isEditedAirwayCollapsed } = result.payload;

    if (editSegmentIndex === undefined) {
      return -1;
    }

    // Remove the old airway first.
    fms.removeAirway(editSegmentIndex);

    const newAirwaySegmentIndex = fms.insertAirwaySegment(airway, entry, exit, segmentIndex, segmentLegIndex);

    // Make sure the collapsed state of the airway stays the same as before the edit.
    const newAirwaySegment = plan.getSegment(newAirwaySegmentIndex);
    if (isEditedAirwayCollapsed) {
      listManager.collapsedAirwaySegments.add(newAirwaySegment);
    } else {
      listManager.collapsedAirwaySegments.delete(newAirwaySegment);
    }

    return newAirwaySegmentIndex;
  }
}
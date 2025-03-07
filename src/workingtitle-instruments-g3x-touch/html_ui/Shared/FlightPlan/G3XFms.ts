import {
  AirportFacility, BitFlags, Consumer, ConsumerSubject, EventBus, EventSubscriber, Facility, FacilityLoader,
  FacilityType, FlightPathCalculator, FlightPlan, FlightPlanner, FlightPlanSegment, FlightPlanSegmentType, ICAO,
  LegDefinition, LegDefinitionFlags, OneWayRunway, UserFacility, VNavPathCalculator
} from '@microsoft/msfs-sdk';

import {
  BaseFmsEvents, DirectToState, Fms, FmsEventsForId, FmsFplUserDataKey, FmsFplVfrApproachData, FmsUtils, LegIndexes
} from '@microsoft/msfs-garminsdk';

import { G3XFlightPlannerId } from '../CommonTypes';
import { G3XFmsFplLoadedApproachData, G3XFmsFplUserDataKey, G3XFmsFplUserDataTypeMap } from './G3XFmsFplUserDataTypes';
import { G3XFplSourceEvents } from './G3XFplSourceEvents';
import { G3XExternalFplSourceIndex, G3XFplSource } from './G3XFplSourceTypes';

/**
 * Configuration options for an external flight plan data source for {@link G3XFms}.
 */
export type G3XFmsExternalFplSourceOptions = {
  /** The flight planner of the external flight plan data source. */
  flightPlanner: FlightPlanner;

  /**
   * The vertical path calculator to use with the external flight plan data source, or `undefined` if the external
   * source does not support VNAV.
   */
  verticalPathCalculator?: VNavPathCalculator;

  /** The index of the LNAV instance used by the external flight plan data source. */
  lnavIndex: number;

  /** Whether the external flight plan data source uses the sim's native OBS state. */
  useSimObsState: boolean;

  /** The index of the VNAV instance used by the external flight plan data source. */
  vnavIndex: number;

  /** The ID of the CDI used by the external flight plan data source. */
  cdiId: string;
};

/**
 * Configuration options for {@link G3XFms}.
 */
export type G3XFmsOptions = {
  /** The index of the LNAV computer associated with the FMS's active flight plan. */
  lnavIndex: number;

  /**
   * Whether the FMS's internal navigation source uses the sim's native OBS state. If `true`, then the sim's OBS state
   * as exposed through the event bus topics defined in `NavEvents` will be used, and standard sim OBS key events will
   * be used to control the state. If `false`, then the OBS state exposed through the event bus topics defined in
   * `LNavObsEvents` will be used, and control events defined in `LNavObsControlEvents` will be used to control the
   * state. Defaults to `true`.
   */
  useSimObsState: boolean;

  /**
   * Configuration options for external flight plan data sources, indexed by external source index. If not defined,
   * then external sources will not be supported.
   */
  externalFplSourceOptions?: readonly (Readonly<G3XFmsExternalFplSourceOptions> | undefined)[];
};

/**
 * A G3X Touch flight management system.
 */
export class G3XFms {
  private readonly publisher = this.bus.getPublisher<G3XFplSourceEvents>();

  /** The Garmin FMS instance to which this FMS delegates for its internal flight plan data source. */
  public readonly internalFms: Fms<G3XFlightPlannerId>;

  /** The facility loader used by this FMS. */
  public readonly facLoader: FacilityLoader;

  /** The internal flight planner used by this FMS. */
  public readonly flightPlanner: FlightPlanner<G3XFlightPlannerId>;

  private readonly externalFms: readonly (Fms | undefined)[];

  private readonly currentFplSource = ConsumerSubject.create(null, G3XFplSource.Internal);

  /**
   * Creates a new instance of G3XFms.
   * @param isPrimary Whether this FMS is the primary instance. Only the primary FMS will execute certain operations
   * that have global effects across the entire airplane.
   * @param bus The event bus.
   * @param flightPlanner The internal flight planner for the new FMS to use.
   * @param options Options with which to configure the FMS.
   */
  public constructor(
    private readonly isPrimary: boolean,
    private readonly bus: EventBus,
    flightPlanner: FlightPlanner<G3XFlightPlannerId>,
    options: Readonly<G3XFmsOptions>
  ) {
    this.internalFms = new Fms(
      isPrimary,
      bus,
      flightPlanner,
      undefined,
      {
        lnavIndex: options.lnavIndex,
        useSimObsState: options.useSimObsState,
        navRadioIndexes: [],
        disableApproachAvailablePublish: true
      }
    );
    this.facLoader = this.internalFms.facLoader;
    this.flightPlanner = this.internalFms.flightPlanner;

    if (options.externalFplSourceOptions) {
      this.externalFms = options.externalFplSourceOptions.slice(0, 3).map(externalFplSourceOption => {
        if (!externalFplSourceOption) {
          return undefined;
        }

        return new Fms(
          false,
          bus,
          externalFplSourceOption.flightPlanner,
          externalFplSourceOption.verticalPathCalculator,
          {
            lnavIndex: externalFplSourceOption.lnavIndex,
            useSimObsState: externalFplSourceOption.useSimObsState,
            vnavIndex: externalFplSourceOption.vnavIndex,
            cdiId: externalFplSourceOption.cdiId,
            disableApproachAvailablePublish: true
          }
        );
      });
    } else {
      this.externalFms = [];
    }

    this.currentFplSource.setConsumer(bus.getSubscriber<G3XFplSourceEvents>().on('g3x_fpl_source_current'));
  }

  /**
   * Gets an event bus subscriber for topics published by this FMS.
   * @returns An event bus subscriber for topics published by this flight planner.
   */
  public getInternalEventSubscriber(): EventSubscriber<FmsEventsForId<G3XFlightPlannerId>> {
    return this.internalFms.getEventSubscriber();
  }

  /**
   * Subscribes to one of the event bus topics published by this FMS.
   * @param baseTopic The base name of the topic to which to subscribe.
   * @returns A consumer for the specified event bus topic.
   */
  public onInternalEvent<K extends keyof BaseFmsEvents>(baseTopic: K): Consumer<BaseFmsEvents[K]> {
    return this.internalFms.onEvent(baseTopic);
  }

  /**
   * Attempts to retrieve the Garmin FMS instance to which this FMS delegates for an external flight plan source.
   * @param index The index of the external flight plan source for which to retrieve an FMS.
   * @returns The Garmin FMS instance to which this FMS delegates for the specified external flight plan source, or
   * `undefined` if the external flight plan source is not supported.
   */
  public tryGetExternalFms(index: G3XExternalFplSourceIndex): Fms | undefined {
    return this.externalFms[index];
  }

  /**
   * Retrieves the Garmin FMS instance to which this FMS delegates for an external flight plan source.
   * @param index The index of the external flight plan source for which to retrieve an FMS.
   * @returns The Garmin FMS instance to which this FMS delegates for the specified external flight plan source.
   * @throws Error if the external flight plan source is not supported.
   */
  public getExternalFms(index: G3XExternalFplSourceIndex): Fms {
    const fms = this.tryGetExternalFms(index);
    if (!fms) {
      throw new Error(`G3XFms: external flight plan source at index ${index} is not supported`);
    }

    return fms;
  }

  /**
   * Gets the Garmin FMS instance for the current flight plan source.
   * @returns The Garmin FMS instance for the current flight plan source.
   */
  public getCurrentFms(): Fms {
    switch (this.currentFplSource.get()) {
      case G3XFplSource.External1:
        return this.externalFms[1] ?? this.internalFms;
      case G3XFplSource.External2:
        return this.externalFms[2] ?? this.internalFms;
      default:
        return this.internalFms;
    }
  }

  /**
   * Initializes the primary flight plan for the internal flight plan source.
   * @param force Whether to force a new primary flight plan to be created, even if one already exists.
   */
  public async initPrimaryFlightPlan(force = false): Promise<void> {
    await this.internalFms.initPrimaryFlightPlan(force);
  }

  /**
   * Checks whether an internal indexed flight plan exists.
   * @param index A flight plan index.
   * @returns Whether an internal flight plan at the specified index exists.
   */
  public hasInternalFlightPlan(index: number): boolean {
    return this.internalFms.hasFlightPlan(index);
  }

  /**
   * Checks whether an external indexed flight plan exists.
   * @param sourceIndex The index of the external flight plan source to check.
   * @param index A flight plan index.
   * @returns Whether an external flight plan at the specified index exists.
   */
  public hasExternalFlightPlan(sourceIndex: G3XExternalFplSourceIndex, index: number): boolean {
    return this.tryGetExternalFms(sourceIndex)?.hasFlightPlan(index) ?? false;
  }

  /**
   * Checks whether an indexed flight plan exists for the current flight plan source.
   * @param index A flight plan index.
   * @returns Whether a flight plan at the specified index exists for the current flight plan source.
   */
  public hasFlightPlan(index: number): boolean {
    return this.getCurrentFms().hasFlightPlan(index);
  }

  /**
   * Gets a specified internal flight plan.
   * @param index The index of the flight plan. Defaults to the index of the primary flight plan.
   * @returns The requested internal flight plan.
   * @throws Error if no flight plan exists at the specified index.
   */
  public getInternalFlightPlan(index = FmsUtils.PRIMARY_PLAN_INDEX): FlightPlan {
    return this.internalFms.getFlightPlan(index);
  }

  /**
   * Gets a specified external flight plan.
   * @param sourceIndex The index of the external flight plan source from which to get a flight plan.
   * @param index The index of the flight plan. Defaults to the index of the primary flight plan.
   * @returns The requested external flight plan.
   * @throws Error if the external flight plan source is not supported or if no flight plan exists at the specified
   * index.
   */
  public getExternalFlightPlan(sourceIndex: G3XExternalFplSourceIndex, index = FmsUtils.PRIMARY_PLAN_INDEX): FlightPlan {
    return this.getExternalFms(sourceIndex).getFlightPlan(index);
  }

  /**
   * Gets a specified flight plan from the current flight plan source.
   * @param index The index of the flight plan. Defaults to the index of the primary flight plan.
   * @returns The requested flight plan from the current flight plan source.
   * @throws Error if no flight plan exists at the specified index.
   */
  public getFlightPlan(index = FmsUtils.PRIMARY_PLAN_INDEX): FlightPlan {
    return this.getCurrentFms().getFlightPlan(index);
  }

  /**
   * Checks whether the primary flight plan exists for the internal flight plan source.
   * @returns Whether the primary flight plan exists for the internal flight plan source.
   */
  public hasInternalPrimaryFlightPlan(): boolean {
    return this.internalFms.hasPrimaryFlightPlan();
  }

  /**
   * Checks whether the primary flight plan exists for an external flight plan source.
   * @param index The index of the external flight plan source to check.
   * @returns Whether the primary flight plan exists for the specified external flight plan source.
   */
  public hasExternalPrimaryFlightPlan(index: G3XExternalFplSourceIndex): boolean {
    return this.tryGetExternalFms(index)?.hasPrimaryFlightPlan() ?? false;
  }

  /**
   * Checks whether the primary flight plan exists for the current flight plan source.
   * @returns Whether the primary flight plan exists for the current flight plan source.
   */
  public hasPrimaryFlightPlan(): boolean {
    return this.getCurrentFms().hasPrimaryFlightPlan();
  }

  /**
   * Gets the primary flight plan for the internal flight plan source.
   * @returns The primary flight plan for the internal flight plan source.
   * @throws Error if the primary flight plan does not exist.
   */
  public getInternalPrimaryFlightPlan(): FlightPlan {
    return this.internalFms.getPrimaryFlightPlan();
  }

  /**
   * Gets the primary flight plan for an external flight plan source.
   * @param index The index of the external flight plan source from which to get the flight plan.
   * @returns The primary flight plan for the specified external flight plan source.
   * @throws Error if the external flight plan source is not supported or if the primary flight plan does not exist.
   */
  public getExternalPrimaryFlightPlan(index: G3XExternalFplSourceIndex): FlightPlan {
    return this.getExternalFms(index).getPrimaryFlightPlan();
  }

  /**
   * Gets the primary flight plan for the current flight plan source.
   * @returns The primary flight plan for the current flight plan source.
   * @throws Error if the primary flight plan does not exist.
   */
  public getPrimaryFlightPlan(): FlightPlan {
    return this.getCurrentFms().getPrimaryFlightPlan();
  }

  /**
   * Checks whether the off-route Direct-To flight plan exists for the internal flight plan source.
   * @returns Whether the off-route Direct-To flight plan exists for the internal flight plan source.
   */
  public hasInternalDirectToFlightPlan(): boolean {
    return this.internalFms.hasDirectToFlightPlan();
  }

  /**
   * Checks whether the off-route Direct-To flight plan exists for an external flight plan source.
   * @param index The index of the external flight plan source to check.
   * @returns Whether the off-route Direct-To flight plan exists for the specified external flight plan source.
   */
  public hasExternalDirectToFlightPlan(index: G3XExternalFplSourceIndex): boolean {
    return this.tryGetExternalFms(index)?.hasDirectToFlightPlan() ?? false;
  }

  /**
   * Checks whether the off-route Direct-To flight plan exists for the current flight plan source.
   * @returns Whether the off-route Direct-To flight plan exists for the current flight plan source.
   */
  public hasDirectToFlightPlan(): boolean {
    return this.getCurrentFms().hasDirectToFlightPlan();
  }

  /**
   * Gets the off-route Direct-To flight plan for the internal flight plan source.
   * @returns The off-route Direct-To flight plan for the internal flight plan source.
   * @throws Error if the off-route Direct-To flight plan does not exist.
   */
  public getInternalDirectToFlightPlan(): FlightPlan {
    return this.internalFms.getDirectToFlightPlan();
  }

  /**
   * Gets the off-route Direct-To flight plan for an external flight plan source.
   * @param index The index of the external flight plan source from which to get the flight plan.
   * @returns The off-route Direct-To flight plan for the specified external flight plan source.
   * @throws Error if the external flight plan source is not supported or if the off-route Direct-To flight plan does
   * not exist.
   */
  public getExternalDirectToFlightPlan(index: G3XExternalFplSourceIndex): FlightPlan {
    return this.getExternalFms(index).getDirectToFlightPlan();
  }

  /**
   * Gets the off-route Direct-To flight plan for the current flight plan source.
   * @returns The off-route Direct-To flight plan for the current flight plan source.
   * @throws Error if the off-route Direct-To flight plan does not exist.
   */
  public getDirectToFlightPlan(): FlightPlan {
    return this.getCurrentFms().getDirectToFlightPlan();
  }

  /**
   * Checks whether the internal flight plans can be edited.
   * @returns Whether the internal flight plans can be edited.
   */
  public canEdit(): boolean {
    return this.currentFplSource.get() === G3XFplSource.Internal || this.currentFplSource.get() === G3XFplSource.InternalRev;
  }

  /**
   * Gets the approach runway:
   * @returns Selected approach runway
   */
  public getApproachRunway(): OneWayRunway | null {
    return this.internalFms.getApproachRunway();
  }

  /**
   * Sets the name of an internal flight plan.
   * @param planIndex The index of the flight plan for which to set the name.
   * @param name The new name for the flight plan.
   */
  public setFlightPlanName(planIndex: number, name: string): void {
    this.internalFms.setFlightPlanName(planIndex, name);
  }

  /**
   * Deletes the name of an internal flight plan.
   * @param planIndex The index of the flight plan for which to delete the name.
   */
  public deleteFlightPlanName(planIndex: number): void {
    this.internalFms.deleteFlightPlanName(planIndex);
  }

  /**
   * Checks whether a leg in the primary flight plan can be manually activated.
   * @param segmentIndex The index of the segment in which the leg resides.
   * @param segmentLegIndex The index of the leg in its segment.
   * @returns Whether the leg can be manually activated.
   */
  public canActivateLeg(segmentIndex: number, segmentLegIndex: number): boolean {
    return this.internalFms.canActivateLeg(segmentIndex, segmentLegIndex);
  }

  /**
   * Checks whether a leg in the primary flight plan is a valid direct to target.
   * @param segmentIndex The index of the segment in which the leg resides.
   * @param segmentLegIndex The index of the leg in its segment.
   * @returns Whether the leg is a valid direct to target.
   * @throws Error if a leg could not be found at the specified location.
   */
  public canDirectTo(segmentIndex: number, segmentLegIndex: number): boolean {
    return this.internalFms.canDirectTo(segmentIndex, segmentLegIndex);
  }

  /**
   * Gets the current Direct To State.
   * @returns the DirectToState.
   */
  public getDirectToState(): DirectToState {
    return this.internalFms.getDirectToState();
  }

  /**
   * Gets the ICAO string of the current Direct To target.
   * @returns The ICAO string of the current Direct To target, or undefined if Direct To is not active.
   */
  public getDirectToTargetIcao(): string | undefined {
    return this.internalFms.getDirectToTargetIcao();
  }

  /**
   * Checks if a segment is the first enroute segment that is not an airway.
   * @param segmentIndex is the segment index of the segment to check
   * @returns whether or not the segment is the first enroute segment that is not an airway.
   */
  public isFirstEnrouteSegment(segmentIndex: number): boolean {
    return this.internalFms.isFirstEnrouteSegment(segmentIndex);
  }

  /**
   * Adds a user facility.
   * @param userFacility the facility to add.
   */
  public addUserFacility(userFacility: UserFacility): void {
    this.internalFms.addUserFacility(userFacility);
  }

  /**
   * Removes a user facility.
   * @param userFacility the facility to remove.
   */
  public removeUserFacility(userFacility: UserFacility): void {
    this.internalFms.removeUserFacility(userFacility);
  }

  /**
   * Inserts a waypoint into the internal primary flight plan.
   * @param segmentIndex The index of the flight plan segment into which to insert the waypoint.
   * @param facility The waypoint facility to insert.
   * @param segmentLegIndex The index in the segment at which to insert the waypoint. If a leg already exists at the index,
   * the existing leg and all subsequent legs will be shifted to the right. If not defined, the waypoint will be
   * inserted at the end of the segment.
   * @returns The leg that was inserted into the flight plan, or `undefined` if the insertion operation could not be
   * carried out.
   */
  public async insertWaypoint(segmentIndex: number, facility: Facility, segmentLegIndex?: number): Promise<LegDefinition | undefined> {
    if (!this.internalFms.hasPrimaryFlightPlan()) {
      return undefined;
    }

    const plan = this.internalFms.getPrimaryFlightPlan();
    const segment = plan.tryGetSegment(segmentIndex);

    if (!segment || segment.segmentType === FlightPlanSegmentType.Approach) {
      return undefined;
    }

    if (segment.segmentType === FlightPlanSegmentType.Departure && segmentLegIndex !== 0) {
      // If we are trying to insert into the departure segment at any position except the first, then insert into the
      // beginning of the first enroute segment instead. If we are inserting into the first position, then origin
      // reconciliation will take care of it.
      segmentIndex = this.internalFms.findFirstEnrouteSegmentIndex(plan);
      segmentLegIndex = 0;
    } else if (segment.segmentType === FlightPlanSegmentType.Destination && segmentLegIndex !== undefined && segmentLegIndex < segment.legs.length) {
      segmentIndex = this.internalFms.findLastEnrouteSegmentIndex(plan);
      segmentLegIndex = undefined;
    }

    const leg = this.internalFms.insertWaypoint(segmentIndex, facility, segmentLegIndex);

    if (leg) {
      await this.reconcileOriginDestination();

      if (plan.length === 1) {
        // If we have just added the only leg in the flight plan, then activate an on-route DTO to the leg's waypoint.
        const firstLegSegment = plan.getSegmentFromLeg(plan.getLeg(0));
        if (firstLegSegment) {
          this.internalFms.createDirectToExisting(firstLegSegment.segmentIndex, 0);
        }
      }
    }

    return leg;
  }

  /**
   * Inserts a waypoint at the end of the internal primary flight plan.
   * @param facility The waypoint facility to insert.
   * @returns The leg that was inserted into the flight plan, or `undefined` if the insertion operation could not be
   * carried out.
   */
  public async insertWaypointAtEnd(facility: Facility): Promise<LegDefinition | undefined> {
    if (!this.internalFms.hasPrimaryFlightPlan()) {
      return undefined;
    }

    const plan = this.internalFms.getPrimaryFlightPlan();
    if (plan.length > 0) {
      // If the plan is not empty, then insert at the end of segment containing the last leg.
      return this.insertWaypoint(plan.getSegmentIndex(plan.length - 1), facility);
    } else {
      // If the plan is empty, then insert at the end of the enroute segment.
      const firstEnrouteSegment = FmsUtils.getFirstEnrouteSegment(plan);
      if (firstEnrouteSegment) {
        return this.insertWaypoint(firstEnrouteSegment.segmentIndex, facility);
      }
    }
  }

  /**
   * Removes a leg to a waypoint from the internal primary flight plan.
   * @param segmentIndex The index of the segment containing the leg to remove.
   * @param segmentLegIndex The index of the leg to remove in its segment.
   * @returns Whether the waypoint was successfully removed.
   */
  public async removeWaypoint(segmentIndex: number, segmentLegIndex: number): Promise<boolean> {
    if (!this.internalFms.hasPrimaryFlightPlan()) {
      return false;
    }

    const plan = this.internalFms.getPrimaryFlightPlan();
    const segment = plan.tryGetSegment(segmentIndex);

    if (plan.length === 0 || !segment || segment.segmentType === FlightPlanSegmentType.Approach) {
      return false;
    }

    const success = this.internalFms.removeWaypoint(segmentIndex, segmentLegIndex);

    if (success) {
      await this.reconcileOriginDestination();

      // If removing a waypoint caused a reversion to an off-route DTO, then cancel the DTO. This will cause the
      // "nearest" leg in the primary flight plan to become activated.
      if (this.internalFms.getDirectToState() === DirectToState.TORANDOM) {
        this.internalFms.cancelDirectTo();
      }

      if (plan.length === 1) {
        // If we have just removed all but one leg in the flight plan, then activate an on-route DTO to the leg's
        // waypoint.
        const firstLegSegment = plan.getSegmentFromLeg(plan.getLeg(0));
        if (firstLegSegment) {
          this.internalFms.createDirectToExisting(firstLegSegment.segmentIndex, 0);
        }
      }
    }

    return success;
  }

  /**
   * Loads an approach into the internal primary flight plan.
   * @param facility The airport facility containing the published approach on which the VFR approach to load is
   * based.
   * @param approachIndex The index of the published approach on which the VFR approach to load is based.
   * @param activate Whether to immediately activate the approach after it has been loaded. Defaults to `false`.
   * @param isVtf Whether to activate the approach as a vectors-to-final (VTF) approach. Ignored if `activate` is
   * `false`. Defaults to `false`.
   * @returns A Promise which will be fulfilled with whether the specified approach was successfully loaded into the
   * flight plan.
   */
  public async loadApproach(
    facility: AirportFacility,
    approachIndex: number,
    activate = false,
    isVtf = false
  ): Promise<boolean> {
    if (!this.internalFms.hasPrimaryFlightPlan()) {
      return false;
    }

    const approach = FmsUtils.buildVfrApproach(facility, approachIndex);

    if (!approach) {
      return false;
    }

    const plan = this.internalFms.getPrimaryFlightPlan();
    const existingApproachData = plan.getUserData<Readonly<G3XFmsFplLoadedApproachData>>(G3XFmsFplUserDataKey.LoadedApproach);
    const isExistingApproachEqual = existingApproachData
      && existingApproachData.airportIcao === facility.icao
      && existingApproachData.approachIndex === approachIndex;

    if (existingApproachData && !isExistingApproachEqual) {
      await this.removeApproach();
    }

    if (!isExistingApproachEqual) {
      const approachData: G3XFmsFplLoadedApproachData = {
        airportIcao: facility.icao,
        approachIndex,
        approach
      };

      plan.setUserData<Readonly<G3XFmsFplLoadedApproachData>>(G3XFmsFplUserDataKey.LoadedApproach, approachData);
    }

    // The approach must be activated if the flight plan is empty.
    activate ||= plan.length === 0;

    if (activate) {
      await this.activateApproach(isVtf);
    }

    return true;
  }

  /**
   * Removes the approach that is currently loaded into the internal primary flight plan.
   */
  public async removeApproach(): Promise<void> {
    if (!this.internalFms.hasPrimaryFlightPlan()) {
      return;
    }

    const plan = this.internalFms.getPrimaryFlightPlan();
    const approachData = plan.getUserData<Readonly<G3XFmsFplLoadedApproachData>>(G3XFmsFplUserDataKey.LoadedApproach);

    if (!approachData) {
      return;
    }

    const vfrApproachData = plan.getUserData<Readonly<FmsFplVfrApproachData>>(FmsFplUserDataKey.VfrApproach);

    let didRemoveInsertedApproach = false;
    if (vfrApproachData) {
      await this.internalFms.removeApproach();
      didRemoveInsertedApproach = true;
    }

    plan.deleteUserData(G3XFmsFplUserDataKey.LoadedApproach);

    if (!didRemoveInsertedApproach) {
      return;
    }

    const isLastNonDestLegToAirport = plan.findLeg(
      (leg, segment) => {
        return segment.segmentType !== FlightPlanSegmentType.Destination
          && !BitFlags.isAny(leg.flags, LegDefinitionFlags.DirectTo);
      },
      true
    )?.leg.fixIcao === approachData.airportIcao;

    if (isLastNonDestLegToAirport) {
      // The last non-destination leg is to the removed approach airport. In this case, we should not set the
      // destination leg to the airport because that would create consecutive duplicate legs. Instead, we will make
      // sure the destination segment is empty.
      this.internalFms.setDestination(undefined);
    } else {
      // The last non-destination leg is not to the removed approach airport. In this case, check to see if we need to
      // set the destination leg to the removed approach airport. Note that we always add the airport leg to the
      // destination segment because we want it to be the last leg in the plan. The subsequent call to
      // reconcileOriginDestination() will ensure that the leg gets moved into the appropriate segment if necessary.

      let needSetDestinationAirport = true;
      const destinationSegment = FmsUtils.getDestinationSegment(plan);
      if (destinationSegment) {
        if (destinationSegment.legs.length === 1 && destinationSegment.legs[0].leg.fixIcao === approachData.airportIcao) {
          needSetDestinationAirport = false;
        }
      }

      if (needSetDestinationAirport) {
        this.internalFms.setDestination(approachData.airportIcao);
      }
    }

    await this.reconcileOriginDestination();

    if (plan.length === 1) {
      // If we have just removed all but one leg in the flight plan, then activate an on-route DTO to the leg's waypoint.
      const firstLegSegment = plan.getSegmentFromLeg(plan.getLeg(0));
      if (firstLegSegment) {
        this.internalFms.createDirectToExisting(firstLegSegment.segmentIndex, 0);
      }
    } else {
      // If removing the approach caused a reversion to an off-route DTO, then cancel the DTO. This will cause the
      // "nearest" leg in the primary flight plan to become activated.
      if (this.internalFms.getDirectToState() === DirectToState.TORANDOM) {
        this.internalFms.cancelDirectTo();
      }
    }
  }

  /**
   * Reconciles the origin and destination airport states of the internal primary flight plan.
   *
   * When reconciling the origin airport state, this method will move flight plan legs into and out of the departure
   * segment and set the flight plan's origin airport as appropriate to ensure that the first (non-approach) airport
   * waypoint in the flight plan is always considered to be the origin airport.
   *
   * When reconciling the destination airport state, this method will move flight plan legs into and out of the
   * destination segment and set the flight plan's destination airport as appropriate to ensure that when an approach
   * is not loaded, the last (non-origin) airport waypoint in the flight plan is always considered to be the
   * destination airport.
   */
  private async reconcileOriginDestination(): Promise<void> {
    await this.reconcileOrigin();
    await this.reconcileDestination();
  }

  /**
   * Reconciles the origin airport state of the internal primary flight plan. This method will move flight plan legs
   * into and out of the departure segment and set the flight plan's origin airport as appropriate to ensure that the
   * first (non-approach) airport waypoint in the flight plan is always considered to be the origin airport.
   */
  private async reconcileOrigin(): Promise<void> {
    const plan = this.internalFms.getPrimaryFlightPlan();

    const firstLeg = plan.tryGetLeg(0);

    // If there is no first leg (i.e. the flight plan is empty), we will make sure to clear the origin.
    if (!firstLeg) {
      plan.removeOriginAirport();
      return;
    }

    const firstLegSegment = plan.getSegmentFromLeg(firstLeg) as FlightPlanSegment;
    let departureSegment = FmsUtils.getDepartureSegment(plan);
    if (!departureSegment) {
      departureSegment = plan.insertSegment(0, FlightPlanSegmentType.Departure);
    }

    // If the first leg is in the approach segment, then there can be no origin, so we will make sure to clear the
    // origin.
    if (firstLegSegment.segmentType === FlightPlanSegmentType.Approach) {
      plan.removeOriginAirport();
      return;
    }

    const firstLegAirportIcao = ICAO.isFacility(firstLeg.leg.fixIcao, FacilityType.Airport) ? firstLeg.leg.fixIcao : undefined;

    // Check if the origin state is already correct. If so, we can skip the rest of this method.
    if (firstLegAirportIcao === undefined) {
      if (
        plan.originAirport === undefined
        && departureSegment.legs.length === 0
      ) {
        return;
      }
    } else {
      if (
        plan.originAirport === firstLegAirportIcao
        && (
          departureSegment.legs.length === 1
          || (
            plan.directToData.segmentIndex === departureSegment.segmentIndex
            && departureSegment.legs.length === 1 + FmsUtils.DTO_LEG_OFFSET
          )
        )
      ) {
        return;
      }
    }

    // Keep track of whether we need to calculate the flight plan after reconciliation. We only need to calculate if we
    // move or replace any legs. Note that the reconciliation operation is guaranteed to not change the length of the
    // flight plan or the global index of the active leg.
    let needCalculate = false;

    if (departureSegment.legs.length > 0) {
      // If the departure segment is not empty, then that means we may need to move legs from the departure segment
      // into the first enroute segment. We will start from the end of the departure segment and move all legs that are
      // not to the desired origin airport. If there is no origin airport, then we will move all legs out of the
      // departure segment.

      let startIndex = 0;
      if (firstLegAirportIcao !== undefined) {
        for (let i = departureSegment.legs.length - 1; i >= 0; i--) {
          const leg = departureSegment.legs[i];
          if (leg.leg.fixIcao === firstLegAirportIcao) {
            startIndex = i + 1;
            break;
          }
        }
      }

      let firstEnrouteSegment = FmsUtils.getFirstEnrouteSegment(plan);
      if (!firstEnrouteSegment) {
        firstEnrouteSegment = plan.insertSegment(departureSegment.segmentIndex + 1, FlightPlanSegmentType.Enroute);
      }

      // If we are moving DTO legs, we need to update the DTO data to point to the new indexes after the move.
      if (plan.directToData.segmentIndex === departureSegment.segmentIndex && plan.directToData.segmentLegIndex >= startIndex) {
        plan.setDirectToData(firstEnrouteSegment.segmentIndex, plan.directToData.segmentLegIndex - startIndex);
      }

      needCalculate = this.shiftLegsToLaterSegment(plan, departureSegment, startIndex, firstEnrouteSegment);
    } else {
      // If the departure segment is empty, then that means we may need to move legs into the departure segment. If the
      // first leg exists and is to the desired origin airport, then we need to move it to the departure segment if it
      // is not already in it.

      if (firstLegAirportIcao !== undefined) {
        const firstLegSegmentIndex = firstLegSegment.legs.indexOf(firstLeg);
        let endIndex = firstLegSegmentIndex + 1;

        // If we are moving DTO legs, we need to update the DTO data to point to the new indexes after the move.
        if (plan.directToData.segmentIndex === firstLegSegment.segmentIndex && plan.directToData.segmentLegIndex === firstLegSegmentIndex) {
          endIndex += FmsUtils.DTO_LEG_OFFSET;
          plan.setDirectToData(departureSegment.segmentIndex, 0);
        }

        needCalculate = this.shiftLegsToPriorSegment(plan, firstLegSegment, endIndex, departureSegment);

        if (firstLegSegment.segmentType === FlightPlanSegmentType.Destination) {
          plan.removeDestinationAirport();
        }
      }
    }

    if (firstLegAirportIcao === undefined) {
      plan.removeOriginAirport();
    } else {
      plan.setOriginAirport(firstLegAirportIcao);
    }

    if (needCalculate) {
      const calculateIndex = Math.max(
        plan.activeLateralLeg - (this.internalFms.getDirectToState() === DirectToState.TOEXISTING ? FmsUtils.DTO_LEG_OFFSET : 1),
        0
      );
      await plan.calculate(calculateIndex);
    }
  }

  /**
   * Reconciles the destination airport state of the internal primary flight plan. This method will move flight plan
   * legs into and out of the destination segment and set the flight plan's destination airport as appropriate to
   * ensure that when an approach is not loaded, the last (non-origin) airport waypoint in the flight plan is always
   * considered to be the destination airport.
   */
  private async reconcileDestination(): Promise<void> {
    const plan = this.internalFms.getPrimaryFlightPlan();

    // If the flight plan has one or fewer legs, then there can't be a destination (if the only leg is to an airport,
    // then it would be the origin). Therefore, we will clear the destination.
    if (plan.length <= 1 + (plan.directToData.segmentIndex < 0 ? 0 : FmsUtils.DTO_LEG_OFFSET)) {
      plan.removeDestinationAirport();
      return;
    }

    const isApproachInserted = !!FmsUtils.getApproachSegment(plan);

    // If an approach is inserted, then the destination airport will already have been set.
    if (isApproachInserted) {
      return;
    }

    const lastLeg = plan.findLeg(leg => !BitFlags.isAny(leg.flags, LegDefinitionFlags.DirectTo), true) as LegDefinition;
    let destinationSegment = FmsUtils.getDestinationSegment(plan);
    if (!destinationSegment) {
      destinationSegment = plan.insertSegment(plan.segmentCount, FlightPlanSegmentType.Destination);
    }

    const lastLegAirportIcao = ICAO.isFacility(lastLeg.leg.fixIcao, FacilityType.Airport) ? lastLeg.leg.fixIcao : undefined;

    // Keep track of whether we need to calculate the flight plan after reconciliation. We only need to calculate if we
    // move or replace any legs. Note that the reconciliation operation is guaranteed to not change the length of the
    // flight plan or the global index of the active leg.

    if (lastLegAirportIcao === undefined) {
      if (
        plan.destinationAirport === undefined
        && destinationSegment.legs.length === 0
      ) {
        return;
      }
    } else {
      if (
        plan.destinationAirport === lastLegAirportIcao
        && (
          destinationSegment.legs.length === 1
          || (
            plan.directToData.segmentIndex === destinationSegment.segmentIndex
            && destinationSegment.legs.length === 1 + FmsUtils.DTO_LEG_OFFSET
          )
        )
      ) {
        return;
      }
    }

    // Keep track of whether we need to calculate the flight plan after reconciliation. We only need to calculate if we
    // move or replace any legs. Note that the reconciliation operation is guaranteed to not change the length of the
    // flight plan or the global index of the active leg.
    let needCalculate = false;

    // Move all legs in the destination segment to the enroute segment. If we are setting the destination airport to a
    // defined value, then leg de-dup will automatically remove the copy of the destination leg that we moved to
    // enroute once the new copy is added to the destination segment.
    if (destinationSegment.legs.length > 0) {
      // If the destination segment is not empty, then that means we may need to move legs from the destination
      // segment into the last enroute segment. We will start from the beginning of the destination segment and move
      // all legs that are not to the desired destination airport. If there is no destination airport, then we will
      // move all legs out of the destination segment.

      let endIndex = destinationSegment.legs.length;
      if (lastLegAirportIcao !== undefined) {
        for (let i = 0; i < destinationSegment.legs.length; i++) {
          const leg = destinationSegment.legs[i];
          if (!BitFlags.isAny(leg.flags, LegDefinitionFlags.DirectTo) && leg.leg.fixIcao === lastLegAirportIcao) {
            endIndex = i;
            break;
          }
        }
      }

      let lastEnrouteSegment = FmsUtils.getLastEnrouteSegment(plan);
      if (!lastEnrouteSegment) {
        lastEnrouteSegment = plan.insertSegment(destinationSegment.segmentIndex, FlightPlanSegmentType.Enroute);
      }

      // If we are moving DTO legs, we need to update the DTO data to point to the new indexes after the move.
      if (plan.directToData.segmentIndex === destinationSegment.segmentIndex && plan.directToData.segmentLegIndex < endIndex) {
        plan.setDirectToData(lastEnrouteSegment.segmentIndex, lastEnrouteSegment.legs.length + plan.directToData.segmentLegIndex);
      }

      needCalculate = this.shiftLegsToPriorSegment(plan, destinationSegment, endIndex, lastEnrouteSegment);
    } else {
      // If the destination segment is empty, then that means we may need to move legs into the destination segment.
      // If the last leg exists and is to the desired destination airport, then we need to move it to the destination
      // segment if it is not already in it.

      if (lastLegAirportIcao !== undefined && lastLeg) {
        const lastLegSegment = plan.getSegmentFromLeg(lastLeg) as FlightPlanSegment;
        const startIndex = lastLegSegment.legs.indexOf(lastLeg);

        // If we are moving DTO legs, we need to update the DTO data to point to the new indexes after the move.
        if (plan.directToData.segmentIndex === lastLegSegment.segmentIndex && plan.directToData.segmentLegIndex >= startIndex) {
          plan.setDirectToData(destinationSegment.segmentIndex, 0);
        }

        needCalculate = this.shiftLegsToLaterSegment(plan, lastLegSegment, startIndex, destinationSegment);
      }
    }

    if (lastLegAirportIcao === undefined) {
      plan.removeDestinationAirport();
    } else {
      plan.setDestinationAirport(lastLegAirportIcao);
    }

    if (needCalculate) {
      const calculateIndex = Math.max(
        plan.activeLateralLeg - (this.internalFms.getDirectToState() === DirectToState.TOEXISTING ? FmsUtils.DTO_LEG_OFFSET : 1),
        0
      );
      await plan.calculate(calculateIndex);
    }
  }

  /**
   * Shifts a range of flight plan legs from their original segment to a prior segment.
   * @param plan The flight plan containing the legs to shift.
   * @param fromSegment The original segment containing the legs to shift.
   * @param endSegmentLegIndex The index of the leg in the original segment at which to stop shifting. Legs with
   * indexes in the range `[0, endSegmentLegIndex)` will be shifted.
   * @param toSegment The segment into which to shift the legs. If there are any non-empty segments between the
   * original and target segments, or if the target segment is not positioned before the original segment, then no legs
   * will be shifted.
   * @returns Whether at least one leg was shifted from the original segment to the target segment.
   */
  private shiftLegsToPriorSegment(
    plan: FlightPlan,
    fromSegment: FlightPlanSegment,
    endSegmentLegIndex: number,
    toSegment: FlightPlanSegment
  ): boolean {
    if (toSegment.segmentIndex >= fromSegment.segmentIndex || fromSegment.offset !== toSegment.offset + toSegment.legs.length) {
      return false;
    }

    const legCount = Math.min(fromSegment.legs.length, endSegmentLegIndex);
    if (legCount <= 0) {
      return false;
    }

    for (let i = 0; i < legCount; i++) {
      const legToMove = fromSegment.legs[0];
      plan.removeLeg(fromSegment.segmentIndex, 0);
      plan.addLeg(toSegment.segmentIndex, FlightPlan.createLeg(legToMove.leg), undefined, legToMove.flags);
    }

    return true;
  }

  /**
   * Shifts a range of flight plan legs from their original segment to a later segment.
   * @param plan The flight plan containing the legs to shift.
   * @param fromSegment The original segment containing the legs to shift.
   * @param startSegmentLegIndex The index of the leg in the original segment at which to start shifting. Legs with
   * indexes in the range `[startSegmentLegIndex, fromSegment.legs.length)` will be shifted.
   * @param toSegment The segment into which to shift the legs. If there are any non-empty segments between the
   * original and target segments, or if the target segment is not positioned after the original segment, then no legs
   * will be shifted.
   * @returns Whether at least one leg was shifted from the original segment to the target segment.
   */
  private shiftLegsToLaterSegment(
    plan: FlightPlan,
    fromSegment: FlightPlanSegment,
    startSegmentLegIndex: number,
    toSegment: FlightPlanSegment
  ): boolean {
    if (toSegment.segmentIndex <= fromSegment.segmentIndex || toSegment.offset !== fromSegment.offset + fromSegment.legs.length) {
      return false;
    }

    const endIndex = Math.max(0, startSegmentLegIndex);
    if (endIndex >= fromSegment.legs.length) {
      return false;
    }

    for (let i = fromSegment.legs.length - 1; i >= endIndex; i--) {
      const legToMove = fromSegment.legs[i];
      plan.removeLeg(fromSegment.segmentIndex, i);
      plan.addLeg(toSegment.segmentIndex, FlightPlan.createLeg(legToMove.leg), 0, legToMove.flags);
    }

    return true;
  }

  /**
   * Inverts the internal primary flightplan.
   */
  public invertFlightplan(): void {
    this.internalFms.invertFlightplan();
  }

  /**
   * Method to check whether an approach can load, or only activate.
   * @returns true if the approach can be loaded and not activated, otherwise the approach can only be immediatly activated.
   */
  public canApproachLoad(): boolean {
    const plan = this.getFlightPlan();
    if (plan.length > 0) {
      const activeSegment = plan.getSegment(plan.getSegmentIndex(plan.activeLateralLeg));
      if (activeSegment.segmentType !== FlightPlanSegmentType.Approach && plan.length > 1) {
        return true;
      }
    }
    return false;
  }

  /**
   * Activates a flight plan leg for the internal flight plan source.
   * @param segmentIndex The index of the flight plan segment containing the leg to activate.
   * @param segmentLegIndex The index of the leg to activate in its containing segment.
   * @param planIndex The index of the flight plan containing the leg to activate. Defaults to the index of the primary
   * flight plan.
   * @param inhibitImmediateSequence Whether to inhibit immediate automatic sequencing past the activated leg. Defaults
   * to `false`.
   */
  public activateLeg(
    segmentIndex: number,
    segmentLegIndex: number,
    planIndex = FmsUtils.PRIMARY_PLAN_INDEX,
    inhibitImmediateSequence = false
  ): void {
    this.internalFms.activateLeg(segmentIndex, segmentLegIndex, planIndex, inhibitImmediateSequence);
  }

  /**
   * Checks whether an approach can be activated. An approach can be activated if and only if the primary flight plan
   * has a non-vectors-to-final approach loaded.
   * @returns Whether an approach can be activated.
   */
  public canActivateApproach(): boolean {
    const plan = this.internalFms.hasPrimaryFlightPlan() && this.internalFms.getPrimaryFlightPlan();
    if (!plan) {
      return false;
    }

    return plan.getUserData<G3XFmsFplUserDataTypeMap[G3XFmsFplUserDataKey.LoadedApproach]>(G3XFmsFplUserDataKey.LoadedApproach) !== undefined;
  }

  private activateApproachOpId = 0;

  /**
   * Activates the approach that is currently loaded into the internal primary flight plan. Activating the approach
   * will insert the approach legs into the internal primary flight plan and either activate an on-route Direct-To
   * targeting the faf (for non-vectors-to-final approaches) or activate the vectors-to-final leg to the faf (for
   * vectors-to-final approaches).
   * @param isVtf Whether to activate the approach as a vectors-to-final (VTF) approach.
   */
  public async activateApproach(isVtf: boolean): Promise<void> {
    if (!this.canActivateApproach()) {
      return;
    }

    const activateApproachOpId = ++this.activateApproachOpId;

    const plan = this.internalFms.getPrimaryFlightPlan();
    const approachData = plan.getUserData(G3XFmsFplUserDataKey.LoadedApproach) as Readonly<G3XFmsFplLoadedApproachData>;

    const vfrApproachData = plan.getUserData<Readonly<FmsFplVfrApproachData>>(FmsFplUserDataKey.VfrApproach);
    if (
      plan.procedureDetails.approachFacilityIcao === approachData.airportIcao
      && vfrApproachData
      && vfrApproachData.isVtf === isVtf
      && vfrApproachData.approachIndex === approachData.approachIndex
    ) {
      // The VFR approach is already inserted into the flight plan. Therefore we just need to activate the approach.
      if (isVtf) {
        await this.internalFms.activateVtf();
      } else {
        this.internalFms.activateApproach();
      }
    } else {
      // The VFR approach is not already inserted into the flight plan.
      try {
        const facility = await this.facLoader.getFacility(FacilityType.Airport, approachData.airportIcao);

        if (activateApproachOpId !== this.activateApproachOpId) {
          return;
        }

        if (vfrApproachData) {
          await this.internalFms.removeApproach();
          this.internalFms.setDestination(undefined);
        }

        // Check to see if the last non-approach waypoint is the same as the approach airport. If so, then remove the
        // last waypoint.

        const lastLeg = plan.findLeg(leg => !BitFlags.isAny(leg.flags, LegDefinitionFlags.DirectTo), true);

        if (lastLeg?.leg.fixIcao === approachData.airportIcao) {
          const { segmentIndex, segmentLegIndex } = FmsUtils.getLegIndexes(plan, lastLeg) as LegIndexes;
          await this.removeWaypoint(segmentIndex, segmentLegIndex);
        } else {
          // If we are not removing the last waypoint, then we need to check to see if we need to move the current
          // destination leg to the end of the enroute segment. (If we had removed the last waypoint, then the
          // destination segment would be empty.)

          const destinationSegment = FmsUtils.getDestinationSegment(plan);
          if (destinationSegment && destinationSegment.legs.length > 0) {
            const lastEnrouteSegment = FmsUtils.getLastEnrouteSegment(plan);

            if (lastEnrouteSegment) {
              // If we are moving DTO legs, we need to update the DTO data to point to the new indexes after the move.
              if (plan.directToData.segmentIndex === destinationSegment.segmentIndex) {
                plan.setDirectToData(lastEnrouteSegment.segmentIndex, lastEnrouteSegment.legs.length + plan.directToData.segmentLegIndex);
              }

              const legCount = destinationSegment.legs.length;
              for (let i = 0; i < legCount; i++) {
                const legToMove = destinationSegment.legs[0];
                plan.removeLeg(destinationSegment.segmentIndex, 0);
                plan.addLeg(lastEnrouteSegment.segmentIndex, FlightPlan.createLeg(legToMove.leg), undefined, legToMove.flags);
              }

              plan.removeDestinationAirport();

              // await plan.calculate(plan.activeLateralLeg - 1);
            } else {
              this.internalFms.setDestination(undefined);
            }
          }
        }

        await this.internalFms.insertVfrApproach(facility, approachData.approachIndex, isVtf, true);

        await this.reconcileOriginDestination();
      } catch {
        // noop
      }
    }
  }

  /**
   * Creates and activates a Direct-To for the internal flight plan source. If the target fix does not appear in the
   * internal flight plan, then this will replace the primary flight plan with a single leg to the Direct-To's target
   * waypoint and create and activate a Direct-To targeting the waypoint. If the target fix does appear in the internal
   * flight plan, then this will create and activate an on-route Direct-To targeting the last occurrence of the target
   * fix in the flight plan.
   * @param target The Direct-To's target waypoint facility.
   * @param course The magnetic course for the Direct-To, in degrees. If not defined, then the Direct-To will be
   * initiated from the airplane's present position.
   */
  public async createDirectTo(target: Facility, course?: number): Promise<void> {
    if (!this.internalFms.hasPrimaryFlightPlan()) {
      return;
    }

    const plan = this.internalFms.getPrimaryFlightPlan();

    let targetSegmentIndex = -1;
    let targetSegmentLegIndex = -1;

    // Check to see if the target fix is the terminator fix of an existing flight plan leg that can be the target of
    // an on-route Direct-To. If so, create an on-route Direct-To instead of an off-route Direct-To. If the target fix
    // appears more than once, legs that appear later in the flight plan have priority.

    let isDone = false;
    const segments = Array.from(plan.segments());
    for (let i = segments.length - 1; i >= 0; i--) {
      const segment = segments[i];
      for (let segmentLegIndex = segment.legs.length - 1; segmentLegIndex >= 0; segmentLegIndex--) {
        const leg = segment.legs[segmentLegIndex];
        if (BitFlags.isAny(leg.flags, LegDefinitionFlags.DirectTo | LegDefinitionFlags.VectorsToFinal)) {
          continue;
        }

        if (
          this.internalFms.canDirectTo(segment.segmentIndex, segmentLegIndex)
          && leg.leg.fixIcao === target.icao
        ) {
          targetSegmentIndex = segment.segmentIndex;
          targetSegmentLegIndex = segmentLegIndex;
          isDone = true;
          break;
        }
      }

      if (isDone) {
        break;
      }
    }

    if (targetSegmentIndex < 0 || targetSegmentLegIndex < 0) {
      // Off-route

      await this.internalFms.emptyPrimaryFlightPlan();

      const leg = await this.insertWaypoint(0, target);
      if (leg) {
        const legSegment = plan.getSegmentFromLeg(plan.getLeg(0));
        if (legSegment) {
          this.internalFms.createDirectToExisting(legSegment.segmentIndex, 0, course);
        }
      }
    } else {
      // On-route

      this.internalFms.createDirectToExisting(targetSegmentIndex, targetSegmentLegIndex, course);
    }
  }

  /**
   * Cancels the currently active internal on-route or off-route Direct-To.
   * @returns Whether an active Direct-To was cancelled.
   */
  public cancelDirectTo(): boolean {
    return this.internalFms.cancelDirectTo();
  }

  /**
   * Empties the internal primary flight plan.
   */
  public async emptyPrimaryFlightPlan(): Promise<void> {
    if (!this.internalFms.hasPrimaryFlightPlan()) {
      return;
    }

    this.internalFms.getPrimaryFlightPlan().deleteUserData(G3XFmsFplUserDataKey.LoadedApproach);

    await this.internalFms.emptyPrimaryFlightPlan();
  }

  /**
   * Empties the internal primary flight plan and deletes its name.
   */
  public async deletePrimaryFlightPlan(): Promise<void> {
    if (!this.internalFms.hasPrimaryFlightPlan()) {
      return;
    }

    this.internalFms.getPrimaryFlightPlan().deleteUserData(G3XFmsFplUserDataKey.LoadedApproach);

    await this.internalFms.deletePrimaryFlightPlan();
  }

  /**
   * Resets all internal flight plans to their initial empty states, and cancels any active off-route Direct-To.
   */
  public async resetAllFlightPlans(): Promise<void> {
    await this.deletePrimaryFlightPlan();
    this.flightPlanner.setActivePlanIndex(Fms.PRIMARY_PLAN_INDEX);
    this.flightPlanner.deleteFlightPlan(Fms.DTO_RANDOM_PLAN_INDEX);
  }

  /**
   * Activates the nearest and most applicable leg of the internal primary flight plan.
   * @param allowMissedApproach Whether to allow activation of missed approach legs. Defaults to `false`.
   * @returns Whether a leg was successfully activated.
   */
  public activateNearestLeg(allowMissedApproach = false): boolean {
    return this.internalFms.activateNearestLeg(allowMissedApproach);
  }

  /**
   * Builds a flight plan to preview an approach procedure that can be loaded into the internal primary flight plan.
   * @param calculator The flight path calculator to assign to the preview plan.
   * @param facility The airport facility containing the published approach on which the VFR approach to preview is
   * based.
   * @param approachIndex The index of the published approach on which the VFR approach to preview is based.
   * @param isVtf Whether to preview the approach as a vectors-to-final (VTF) approach.
   * @returns A Promise which will be fulfilled with the preview plan after it has been built.
   */
  public async buildApproachPreviewPlan(
    calculator: FlightPathCalculator,
    facility: AirportFacility,
    approachIndex: number,
    isVtf: boolean
  ): Promise<FlightPlan> {
    return this.internalFms.buildVfrApproachPreviewPlan(calculator, facility, approachIndex, isVtf);
  }
}

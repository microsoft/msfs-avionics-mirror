import {
  AirportFacility, AirportUtils, AirwayData, AirwayType, ApproachIdentifier, ArrayUtils, Facility, FacilityType,
  FacilityUtils, FlightPlan, FlightPlanSegmentType, FlightPlanUtils, ICAO, IcaoValue, IntersectionFacility,
  LegDefinition, LegType, MagVar, OneWayRunway, Procedure, ReadonlyFlightPlanRoute, RunwayIdentifier, RunwayUtils,
  UserFacility, UserFacilityUtils
} from '@microsoft/msfs-sdk';

import { UnsFms } from '../UnsFms';
import { UnsFlightPlans } from '../UnsFmsTypes';
import { UnsFlightPlanRouteUtils } from './UnsFlightPlanRouteUtils';
import { UnsPilotWaypointUtils } from '../UnsPilotWaypointUtils';
import { UnsFmsUtils } from '../UnsFmsUtils';

/**
 * A loader of flight plan routes into an instance of {@link UnsFms}.
 */
export class UnsFlightPlanRouteLoader {
  private loadOpId = 0;
  private activeLoadPromise?: Promise<boolean>;

  /**
   * Creates a new instance of UnsFlightPlanRouteLoader.
   * @param fms The FMS containing the primary flight plan to which the loader loads flight plan routes.
   */
  public constructor(private readonly fms: UnsFms) {
  }

  /**
   * Checks whether this loader is currently loading a flight plan route.
   * @returns Whether this loader is currently loading a flight plan route.
   */
  public isLoadInProgress(): boolean {
    return !!this.activeLoadPromise;
  }

  /**
   * Waits until this loader is finished with any in-progress operation to load a flight plan route. If there is no
   * such operation, then the returned Promise is fulfilled immediately. The returned Promise is guaranteed to never be
   * rejected.
   */
  public async awaitLoad(): Promise<void> {
    if (this.activeLoadPromise) {
      await this.activeLoadPromise;
    }
  }

  /**
   * Loads a flight plan route. This will preempt any existing in-progress route-loading operation.
   * @param route The flight plan route to load.
   * @returns A Promise which is fulfilled when the loading operation ends. The fulfillment value reports whether the
   * operation completed successfully without being cancelled. The returned Promise is guaranteed to never be rejected.
   */
  public loadRoute(route: ReadonlyFlightPlanRoute): Promise<boolean> {
    return this.scheduleLoadFromRoute(route);
  }

  /**
   * Stops any in-progress operation by this loader to load a flight plan route.
   * @returns A Promise which is fulfilled after the in-progress operation to load a flight plan route at the time this
   * method is called has been stopped. If there is no in-progress operation, then the Promise is fulfilled
   * immediately. The returned Promise is guaranteed to never be rejected.
   */
  public async cancelLoad(): Promise<void> {
    ++this.loadOpId;

    if (this.activeLoadPromise) {
      return this.activeLoadPromise.then();
    } else {
      return;
    }
  }

  /**
   * Schedules an operation to load a flight plan route.
   * @param route The flight plan route to load.
   * @returns A Promise which is fulfilled when the scheduled operation ends. The fulfillment value reports whether
   * the operation successfully completed without being cancelled. The returned Promise is guaranteed to never be
   * rejected.
   */
  private async scheduleLoadFromRoute(route: ReadonlyFlightPlanRoute): Promise<boolean> {
    const opId = ++this.loadOpId;

    if (this.activeLoadPromise) {
      await this.activeLoadPromise;
    }

    if (opId !== this.loadOpId) {
      return false;
    }

    const promise = this.loadFromRoute(opId, route);
    this.activeLoadPromise = promise;

    const result = await promise;

    if (this.activeLoadPromise === promise) {
      this.activeLoadPromise = undefined;
    }

    return result;
  }

  /**
   * Loads a flight plan route.
   * @param opId The load operation ID.
   * @param route The flight plan route to load.
   * @returns A Promise which is fulfilled when the load operation ends. The fulfillment value reports whether the
   * operation successfully completed without being cancelled. The returned Promise is guaranteed to never be rejected.
   */
  private async loadFromRoute(opId: number, route: ReadonlyFlightPlanRoute): Promise<boolean> {
    let plan: FlightPlan | undefined;
    let batchUuid: string | undefined;

    try {
      if (!this.fms.hasFlightPlan(UnsFlightPlans.Active)) {
        return false;
      }

      plan = this.fms.getPrimaryFlightPlan();

      // Check if there are any open batches. If there are, then some operation on the flight plan is in-progress. In
      // this case we will immediately abort.
      if (plan.getBatchStack()) {
        return false;
      }

      batchUuid = plan.openBatch(UnsFlightPlanRouteUtils.DEFAULT_LOAD_ROUTE_BATCH_NAME);

      this.fms.emptyFlightPlan(UnsFlightPlans.Active);

      if (ICAO.isValueFacility(route.departureAirport, FacilityType.Airport)) {
        const origin = await this.retrieveOriginDest(route.departureAirport, route.departureRunway);

        if (opId !== this.loadOpId) {
          return false;
        }

        if (origin) {
          const departureIndexes = this.retrieveDepartureArrivalIndexes(
            origin.airport,
            origin.airport.departures,
            route.departure,
            route.departureTransition,
            origin.runway
          );

          if (departureIndexes.procedureIndex >= 0) {
            this.fms.insertDeparture(
              origin.airport,
              departureIndexes.procedureIndex,
              departureIndexes.runwayTransitionIndex,
              departureIndexes.enrouteTransitionIndex,
              origin.runway
            );
          } else {
            this.fms.setOrigin(origin.airport, origin.runway);
          }
        }
      }

      const directToTargetLeg = await this.loadEnrouteLegs(opId, plan, route);

      if (opId !== this.loadOpId) {
        return false;
      }

      if (ICAO.isValueFacility(route.destinationAirport, FacilityType.Airport)) {
        const destination = await this.retrieveOriginDest(route.destinationAirport, route.destinationRunway);

        if (opId !== this.loadOpId) {
          return false;
        }

        if (destination) {
          const arrivalIndexes = this.retrieveDepartureArrivalIndexes(
            destination.airport,
            destination.airport.arrivals,
            route.arrival,
            route.arrivalTransition,
            destination.runway
          );

          if (arrivalIndexes.procedureIndex >= 0) {
            this.fms.insertArrival(
              destination.airport,
              arrivalIndexes.procedureIndex,
              arrivalIndexes.runwayTransitionIndex,
              arrivalIndexes.enrouteTransitionIndex,
              destination.runway
            );
          }

          const approachIndexes = this.retrieveApproachIndexes(
            destination.airport,
            route.approach,
            route.approachTransition
          );

          if (approachIndexes.approachIndex >= 0) {
            await this.fms.insertApproach(
              {
                facility: destination.airport,
                approachIndex: approachIndexes.approachIndex,
                approachTransitionIndex: approachIndexes.transitionIndex,
              }
            );
          }

          if (plan.procedureDetails.arrivalIndex < 0 && plan.procedureDetails.approachIndex < 0) {
            this.fms.setDestination(destination.airport, destination.runway);
          }
        }
      }

      let directToTargetIndexes = FlightPlanUtils.emptyLegIndexes();

      if (
        ArrayUtils.peekLast(route.enroute)?.isPpos
        || (directToTargetLeg && plan.getLegIndexFromLeg(directToTargetLeg) < 0)
      ) {
        // If the last enroute leg is PPOS or if a DTO target leg was found in enroute but is no longer in the plan, then
        // try to create an on-route DTO to the first leg after the last enroute segment.
        const lastEnrouteSegment = ArrayUtils.peekLast(Array.from(plan.segmentsOfType(FlightPlanSegmentType.Approach)));
        if (lastEnrouteSegment) {
          // There should always be at least one enroute segment in the plan.
          const legAfterEnroute = plan.getNextLeg(lastEnrouteSegment.segmentIndex, lastEnrouteSegment.legs.length);
          if (legAfterEnroute) {
            directToTargetIndexes = plan.getLegIndexesFromLeg(legAfterEnroute);
          }
        }
      } else if (directToTargetLeg) {
        plan.getLegIndexesFromLeg(directToTargetLeg, directToTargetIndexes);
      }

      if (this.fms.canDirectTo(directToTargetIndexes)) {
        this.fms.createDirectTo({ ...directToTargetIndexes, isNewDto: true });
      }

      plan.closeBatch(batchUuid);

      return true;
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        console.error(e.stack);
      }

      return false;
    } finally {
      if (plan && batchUuid !== undefined) {
        plan.closeBatch(batchUuid);
      }
    }
  }

  /**
   * Loads the enroute legs of a flight plan route into the primary flight plan. This method should be called when the
   * primary flight plan does not have any loaded destination, arrival, or approach procedures.
   * @param opId The load operation ID.
   * @param plan The primary flight plan.
   * @param route The flight plan route to load.
   * @returns The desired on-route direct-to target leg within the enroute segments specified by the loaded flight plan
   * route, or `null` if there is no such leg.
   */
  private async loadEnrouteLegs(opId: number, plan: FlightPlan, route: ReadonlyFlightPlanRoute): Promise<LegDefinition | null> {
    const firstEnrouteSegment = plan.segmentsOfType(FlightPlanSegmentType.Enroute).next().value;

    if (!firstEnrouteSegment) {
      // This should never happen.
      return null;
    }

    const userFacilities = this.fms.getUserFacilities();

    const departureSegment = plan.segmentsOfType(FlightPlanSegmentType.Departure).next().value;
    const lastDepartureLeg = departureSegment ? ArrayUtils.peekLast(departureSegment.legs) : undefined;

    let airwayEntryFacility: IntersectionFacility | null = null;
    let airwayEntrySegmentIndex = -1;
    let airwayEntrySegmentLegIndex = -1;

    if (lastDepartureLeg) {
      switch (lastDepartureLeg.leg.type) {
        case LegType.AF:
        case LegType.CF:
        case LegType.DF:
        case LegType.HF:
        case LegType.HA:
        case LegType.HM:
        case LegType.IF:
        case LegType.RF:
        case LegType.TF:
          airwayEntryFacility = await this.retrieveIntersectionFacility(ICAO.stringV1ToValue(lastDepartureLeg.leg.fixIcao));

          if (opId !== this.loadOpId) {
            return null;
          }

          if (airwayEntryFacility) {
            airwayEntrySegmentIndex = departureSegment!.segmentIndex;
            airwayEntrySegmentLegIndex = departureSegment!.legs.length - 1;
          }
      }
    }

    let currentSegment = firstEnrouteSegment;

    // We will interpret PPOS legs as an indication to create an on-route DTO to the next leg.
    let isPrevLegPpos = false;
    let directToTargetLeg: LegDefinition | null = null;

    for (const leg of route.enroute) {
      if (leg.isPpos) {
        isPrevLegPpos = true;
        continue;
      }

      if (leg.hasLatLon || leg.hasPointBearingDistance) {
        let facility: UserFacility | undefined;

        if (leg.hasLatLon) {
          const ident = UnsPilotWaypointUtils.nextAutoGeneratedName(userFacilities, 'LL');
          facility = UserFacilityUtils.createFromLatLon(`U      ${ident}`, leg.lat, leg.lon);
        } else if (ICAO.isValueFacility(leg.referenceIcao)) {
          const referenceFacility = await this.retrieveFacility(leg.referenceIcao);

          if (opId !== this.loadOpId) {
            return null;
          }

          if (referenceFacility) {
            const ident = UnsPilotWaypointUtils.nextAutoGeneratedName(userFacilities, leg.referenceIcao.ident);
            facility = UserFacilityUtils.createFromRadialDistance(
              `U      ${ident}`,
              referenceFacility,
              MagVar.trueToMagnetic(leg.bearing, FacilityUtils.getMagVar(referenceFacility)),
              leg.distance
            );
          }
        }

        if (facility) {
          this.fms.addUserFacility(facility);
          const inserted = this.fms.insertWaypoint(facility, currentSegment.segmentIndex);

          if (inserted) {
            // User facilities can never be airway entry waypoints.
            airwayEntryFacility = null;
            airwayEntrySegmentIndex = -1;
            airwayEntrySegmentLegIndex = -1;

            if (isPrevLegPpos) {
              directToTargetLeg = currentSegment.legs[currentSegment.legs.length - 1];
            }
          }
        }
      } else {
        if (ICAO.isValueFacility(leg.fixIcao)) {
          const facility = await this.retrieveFacility(leg.fixIcao);
          if (facility) {
            let airway: Awaited<ReturnType<typeof this.retrieveAirway>> = null;
            let airwayExitFacility: IntersectionFacility | null = null;

            if (leg.via !== '') {
              // Handle airway

              if (airwayEntryFacility) {
                if (FacilityUtils.isFacilityType(facility, FacilityType.Intersection)) {
                  airwayExitFacility = facility;
                } else {
                  airwayExitFacility = await this.retrieveIntersectionFacility(leg.fixIcao);
                }

                if (airwayExitFacility) {
                  airway = await this.retrieveAirway(leg.via, airwayEntryFacility, airwayExitFacility);
                } else {
                  console.warn(`UnsFlightPlanRouteLoader: could not load airway '${leg.via}' to fix ${leg.fixIcao.ident} - the fix is not a valid exit waypoint`);
                }
              } else {
                console.warn(`UnsFlightPlanRouteLoader: could not load airway '${leg.via}' to fix ${leg.fixIcao.ident} - no valid entry waypoint`);
              }
            }

            if (opId !== this.loadOpId) {
              return null;
            }

            // There should never be any legs after the segment we are currently inserting into. If there are, then we
            // will immediately abort and force the current load operation to be cancelled.
            if (plan.getNextLeg(currentSegment.segmentIndex, currentSegment.legs.length)) {
              ++this.loadOpId;
              return null;
            }

            if (airway) {
              // Note: we don't have to worry about duplicate legs because airway segments cannot duplicate the leg
              // before it (i.e. the entry waypoint) and we are guaranteed to be adding the segment to the end of the
              // flight plan so there is nothing after the segment to duplicate.

              const airwaySegmentIndex = this.fms.insertAirwaySegment(
                airway.airway,
                airwayEntryFacility!,
                airwayExitFacility!,
                airwayEntrySegmentIndex,
                airwayEntrySegmentLegIndex
              );

              // There is guaranteed to be an enroute segment after the airway segment that was just inserted.
              currentSegment = plan.getSegment(airwaySegmentIndex + 1);

              airwayEntryFacility = airwayExitFacility;
              airwayEntrySegmentIndex = airwaySegmentIndex;
              airwayEntrySegmentLegIndex = plan.getSegment(airwaySegmentIndex).legs.length - 1;

              if (isPrevLegPpos) {
                directToTargetLeg = plan.getSegment(airwaySegmentIndex).legs[0];
              }
            } else {
              const inserted = this.fms.insertWaypoint(facility, currentSegment.segmentIndex);

              if (inserted) {
                if (FacilityUtils.isFacilityType(facility, FacilityType.Intersection)) {
                  airwayEntryFacility = facility;
                } else {
                  airwayEntryFacility = await this.retrieveIntersectionFacility(leg.fixIcao);
                }

                if (airwayEntryFacility) {
                  airwayEntrySegmentIndex = currentSegment.segmentIndex;
                  airwayEntrySegmentLegIndex = currentSegment.legs.length - 1;
                } else {
                  airwayEntrySegmentIndex = -1;
                  airwayEntrySegmentLegIndex = -1;
                }

                if (isPrevLegPpos) {
                  directToTargetLeg = currentSegment.legs[currentSegment.legs.length - 1];
                }
              }
            }
          }

          if (opId !== this.loadOpId) {
            return null;
          }
        } else {
          console.warn(`UnsFlightPlanRouteLoader: enroute fix with ICAO '${ICAO.valueToStringV1(leg.fixIcao)}' has invalid facility type`);
        }
      }

      isPrevLegPpos = false;
    }

    return directToTargetLeg;
  }

  /**
   * Retrieves a facility with a given ICAO.
   * @param icao The ICAO of the facility to retrieve.
   * @returns A Promise which is fulfilled with the requested facility, or `null` if such a facility could not be
   * found.
   */
  private async retrieveFacility(icao: IcaoValue): Promise<Facility | null> {
    try {
      return await this.fms.facLoader.getFacility(ICAO.getFacilityTypeFromValue(icao), ICAO.valueToStringV1(icao));
    } catch {
      console.warn(`UnsFlightPlanRouteLoader: unable to retrieve facility with ICAO '${ICAO.valueToStringV1(icao)}'`);
    }

    return null;
  }

  /**
   * Retrieves an origin or destination airport and runway.
   * @param airportIcao The ICAO of the airport.
   * @param runwayIdentifier The runway identifier.
   * @returns The airport and runway defined by the specified ICAO and runway identifier.
   */
  private async retrieveOriginDest(airportIcao: IcaoValue, runwayIdentifier: Readonly<RunwayIdentifier>): Promise<
    {
      /** The airport. */
      airport: AirportFacility;

      /** The runway. */
      runway: OneWayRunway | undefined;
    } | null
  > {
    if (ICAO.isValueFacility(airportIcao, FacilityType.Airport)) {
      const airport = await this.retrieveFacility(airportIcao) as AirportFacility | null;
      if (airport) {
        let runway: OneWayRunway | undefined;
        if (runwayIdentifier.number !== '') {
          const designation = `${runwayIdentifier.number}${runwayIdentifier.designator}`;
          runway = RunwayUtils.matchOneWayRunwayFromDesignation(airport, designation);

          if (!runway) {
            console.warn(`UnsFlightPlanRouteLoader: unable to retrieve find runway with designation '${designation}' in airport ${airportIcao.ident}`);
          }
        }

        return { airport, runway };
      }
    }

    return null;
  }

  /**
   * Retrieves indexes for a departure or arrival procedure.
   * @param airport The airport in which to search for the procedure.
   * @param procArray The procedure array in which to search for the procedure.
   * @param procedureName The name of the procedure to retrieve.
   * @param transitionName The name of the procedure enroute transition to retrieve.
   * @param runway The runway associated with the procedure runway transition to retrieve, or `undefined` if a runway
   * transition should not be retrieved.
   * @returns The indexes for the departure or arrival procedure defined by the specified parameters.
   */
  private retrieveDepartureArrivalIndexes(
    airport: AirportFacility,
    procArray: readonly Procedure[],
    procedureName: string,
    transitionName: string,
    runway: OneWayRunway | undefined
  ): ReturnType<typeof AirportUtils.findDepartureArrivalIndexesFromName> {
    const result = AirportUtils.findDepartureArrivalIndexesFromName(
      procArray,
      procedureName,
      transitionName,
      runway ? RunwayUtils.getIdentifierFromOneWayRunway(runway) : RunwayUtils.emptyIdentifier()
    );

    if (procedureName !== '' && result.procedureIndex < 0) {
      console.warn(`UnsFlightPlanRouteLoader: unable to find procedure with name '${procedureName}' in airport ${ICAO.getAirportIdentFromStringV1(airport.icao)}`);
    }

    if (result.procedureIndex >= 0 && transitionName !== '' && result.enrouteTransitionIndex < 0) {
      console.warn(`UnsFlightPlanRouteLoader: unable to find enroute transition with name '${transitionName}' in procedure ${ICAO.getAirportIdentFromStringV1(airport.icao)}.${procArray[result.procedureIndex].name}`);
    }

    return result;
  }

  /**
   * Retrieves indexes for an approach procedure.
   * @param airport The airport in which to search for the approach procedure.
   * @param approachIdentifier The identifier for the approach procedure.
   * @param transitionName The name of the approach transition to retrieve.
   * @returns The indexes for the approach procedure defined by the specified parameters.
   */
  private retrieveApproachIndexes(
    airport: AirportFacility,
    approachIdentifier: Readonly<ApproachIdentifier>,
    transitionName: string
  ): ReturnType<typeof AirportUtils.findApproachIndexesFromIdentifier> {
    const result = AirportUtils.findApproachIndexesFromIdentifier(airport, approachIdentifier, transitionName);

    if (approachIdentifier.type !== '' && result.approachIndex < 0) {
      console.warn(`UnsFlightPlanRouteLoader: unable to find approach ${approachIdentifier.type}${approachIdentifier.suffix === '' ? '' : ` ${approachIdentifier.suffix}`}${approachIdentifier.runway.number === '' ? '' : ` for runway ${approachIdentifier.runway.number}${approachIdentifier.runway.designator}`} in airport ${ICAO.getAirportIdentFromStringV1(airport.icao)}`);
    }

    if (result.approachIndex >= 0 && transitionName !== '' && result.transitionIndex < 0) {
      console.warn(`UnsFlightPlanRouteLoader: unable to find approach transition with name '${transitionName}' in approach ${ICAO.getAirportIdentFromStringV1(airport.icao)}.${UnsFmsUtils.getApproachNameAsString(airport.approaches[result.approachIndex])}`);
    }

    return result;
  }

  /**
   * Retrieves an intersection facility with a given ICAO.
   * @param icao The ICAO of the intersection facility to retrieve.
   * @returns A Promise which is fulfilled with the requested intersection facility, or `null` if such a facility could
   * not be found.
   */
  private async retrieveIntersectionFacility(icao: IcaoValue): Promise<IntersectionFacility | null> {
    if (ICAO.isValueFacility(icao)) {
      switch (ICAO.getFacilityTypeFromValue(icao)) {
        case FacilityType.VOR:
        case FacilityType.NDB:
        case FacilityType.Intersection:
          try {
            return await this.fms.facLoader.getFacility(FacilityType.Intersection, ICAO.valueToStringV1(icao));
          } catch {
            console.warn(`UnsFlightPlanRouteLoader: unable to retrieve waypoint with ICAO '${ICAO.valueToStringV1(icao)}'`);
          }
      }
    }

    return null;
  }

  /**
   * Retrieves an airway connecting two waypoints.
   * @param airwayName The name of the airway to retrieve.
   * @param entryFacility The entry waypoint.
   * @param exitFacility The exit waypoint.
   * @returns A Promise which is fulfilled with the requested airway, or `null` if such an airway could not be found.
   */
  private async retrieveAirway(airwayName: string, entryFacility: IntersectionFacility, exitFacility: IntersectionFacility): Promise<
    {
      /** The airway. */
      airway: AirwayData;

      /** The index of the entry waypoint in the airway's waypoint array. */
      entryIndex: number;

      /** The index of the exit waypoint in the airway's waypoint array. */
      exitIndex: number;
    } | null
  > {
    if (ICAO.valueEquals(entryFacility.icaoStruct, exitFacility.icaoStruct)) {
      console.warn(`UnsFlightPlanRouteLoader: could not load airway '${airwayName}' to fix ${ICAO.tryValueToStringV2(exitFacility.icaoStruct)} - the fix is the same as the entry fix`);
      return null;
    }

    try {
      // Note: airway type passed to getAirway() doesn't actually matter, so we will just use an arbitrary value.
      const airway = await this.fms.facLoader.getAirway(airwayName, AirwayType.None, exitFacility.icao);

      let entryIndex = -1;
      let exitIndex = -1;

      if ((exitIndex = airway.waypoints.findIndex(airwayFix => ICAO.valueEquals(airwayFix.icaoStruct, exitFacility.icaoStruct))) >= 0) {
        // Find the entry waypoint in the airway
        if ((entryIndex = airway.waypoints.findIndex(airwayFix => ICAO.valueEquals(airwayFix.icaoStruct, entryFacility.icaoStruct))) >= 0) {
          return { airway, entryIndex, exitIndex };
        } else {
          console.warn(`UnsFlightPlanRouteLoader: could not load airway '${airwayName}' to fix ${ICAO.tryValueToStringV2(exitFacility.icaoStruct)} - the entry fix ${ICAO.tryValueToStringV2(entryFacility.icaoStruct)} is not part of the specified airway`);
        }
      } else {
        // Should never happen.
        console.warn(`UnsFlightPlanRouteLoader: could not load airway '${airwayName}' to fix ${ICAO.tryValueToStringV2(exitFacility.icaoStruct)} - the fix is not part of the specified airway`);
      }
    } catch {
      console.warn(`UnsFlightPlanRouteLoader: could not load airway '${airwayName}' to fix ${ICAO.tryValueToStringV2(exitFacility.icaoStruct)} - the fix is not part of the specified airway`);
    }

    return null;
  }
}

import {
  AirportFacility, AirportUtils, AirwayData, AirwayType, ApproachIdentifier, ArrayUtils, Facility,
  FacilityType, FacilityUtils, FlightPlan, FlightPlanUtils, GeoMath, GeoPoint, ICAO, IcaoType, IcaoValue, IntersectionFacility,
  LatLonInterface, LegDefinition, LegType, OneWayRunway, Procedure, ReadonlyFlightPlanRoute, RunwayIdentifier,
  RunwayUtils, SimVarValueType, UnitType, UserFacility, UserFacilityUtils
} from '@microsoft/msfs-sdk';

import { Fms } from './Fms';
import { FmsUtils } from './FmsUtils';
import { GarminFlightPlanRouteLoader } from './GarminFlightPlanRouteLoader';
import { GarminFlightPlanRouteUtils } from './GarminFlightPlanRouteUtils';

/**
 * Configuration options for {@link GarminPrimaryFlightPlanRouteLoader}.
 */
export type GarminPrimaryFlightPlanRouteLoaderOptions = {
  /**
   * The name to assign the flight plan modification batch opened on the primary flight plan when an operation to load
   * a flight plan route into the plan is in progress. Defaults to
   * {@link GarminFlightPlanRouteUtils.DEFAULT_LOAD_ROUTE_BATCH_NAME}.
   */
  loadRouteBatchName?: string;

  /**
   * Whether to flatten airways to their constituent waypoints when loading a flight plan route into a flight plan.
   * Defaults to `false`.
   */
  flattenAirways?: boolean;

  /**
   * The scope to assign user facilities created by the loader. The scope is written to the airport ident field of the
   * facilities' ICAO values. Must be four characters or less. Defaults to the empty string.
   */
  userFacilityScope?: string;

  /**
   * The prefix to use when assigning idents to user facilities created by the loader. A three-digit number is appended
   * to the prefix to form the full ident. Must be three characters or less. Defaults to `'FPL'`.
   */
  userFacilityIdentPrefix?: string;
};

/**
 * A loader of flight plan routes into the primary flight plan of an instance of {@link Fms}.
 */
export class GarminPrimaryFlightPlanRouteLoader implements GarminFlightPlanRouteLoader {
  private readonly loadRouteBatchName: string;
  private readonly flattenAirways: boolean;
  private readonly userFacilityScope: string;
  private readonly userFacilityIdentPrefix: string;

  private loadOpId = 0;
  private activeLoadPromise?: Promise<boolean>;

  /**
   * Creates a new instance of GarminPrimaryFlightPlanRouteLoader.
   * @param fms The FMS containing the primary flight plan to which the loader loads flight plan routes.
   * @param options Options with which to configure the loader.
   */
  public constructor(private readonly fms: Fms, options?: Readonly<GarminPrimaryFlightPlanRouteLoaderOptions>) {
    this.loadRouteBatchName = options?.loadRouteBatchName ?? GarminFlightPlanRouteUtils.DEFAULT_LOAD_ROUTE_BATCH_NAME;
    this.flattenAirways = options?.flattenAirways ?? false;
    this.userFacilityScope = options?.userFacilityScope ?? '';
    this.userFacilityIdentPrefix = options?.userFacilityIdentPrefix ?? 'FPL';

    if (this.userFacilityScope.length > 4) {
      throw new Error(`GarminPrimaryFlightPlanRouteLoader: invalid user facility scope "${this.userFacilityScope}" (exceeds maximum length of 4 characters)`);
    }

    if (this.userFacilityIdentPrefix.length > 3) {
      throw new Error(`GarminPrimaryFlightPlanRouteLoader: invalid user facility ident prefix "${this.userFacilityIdentPrefix}" (exceeds maximum length of 3 characters)`);
    }
  }

  /** @inheritDoc */
  public isLoadInProgress(): boolean {
    return !!this.activeLoadPromise;
  }

  /** @inheritDoc */
  public async awaitLoad(): Promise<void> {
    if (this.activeLoadPromise) {
      await this.activeLoadPromise;
    }
  }

  /** @inheritDoc */
  public loadRoute(route: ReadonlyFlightPlanRoute): Promise<boolean> {
    return this.scheduleLoadFromRoute(route);
  }

  /** @inheritDoc */
  public async cancelLoad(): Promise<void> {
    ++this.loadOpId;

    if (this.activeLoadPromise) {
      return this.activeLoadPromise.then();
    } else {
      return;
    }
  }

  /**
   * Schedules an operation to load a flight plan route into the primary flight plan.
   * @param route The flight plan route to load.
   * @returns A Promise which is fulfilled when the scheduled operation ends. The fulfillment value reports whether
   * the operation successfully completed without being cancelled.
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
   * Loads a flight plan route into the primary flight plan.
   * @param opId The load operation ID.
   * @param route The flight plan route to load.
   * @returns A Promise which is fulfilled when the load operation ends. The fulfillment value reports whether the
   * operation successfully completed without being cancelled. The returned Promise is guaranteed to never be rejected.
   */
  private async loadFromRoute(opId: number, route: ReadonlyFlightPlanRoute): Promise<boolean> {
    let plan: FlightPlan | undefined;
    let batchUuid: string | undefined;

    try {
      if (!this.fms.hasPrimaryFlightPlan()) {
        return false;
      }

      plan = this.fms.getPrimaryFlightPlan();

      // Check if there are any open batches. If there are, then some operation on the flight plan is in-progress. In
      // this case we will immediately abort.
      if (plan.getBatchStack()) {
        return false;
      }

      batchUuid = plan.openBatch(this.loadRouteBatchName);

      await this.fms.emptyPrimaryFlightPlan();

      if (opId !== this.loadOpId) {
        return false;
      }

      // Cancel any off-route DTO (on-route DTOs would have been cancelled by emptying the primary flight plan).
      this.fms.cancelDirectTo();

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
              destination.airport,
              approachIndexes.approachIndex,
              approachIndexes.transitionIndex
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
        const lastEnrouteSegment = FmsUtils.getLastEnrouteSegment(plan);
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

      await plan.calculate(0);

      if (opId !== this.loadOpId) {
        return false;
      }

      if (plan.length > 1) {
        if (this.fms.canDirectTo(directToTargetIndexes.segmentIndex, directToTargetIndexes.segmentLegIndex)) {
          this.fms.createDirectToExisting(directToTargetIndexes.segmentIndex, directToTargetIndexes.segmentLegIndex);
        } else if (SimVar.GetSimVarValue('SIM ON GROUND', SimVarValueType.Bool) === 0) {
          this.fms.activateNearestLeg();
        }
        // If we are not activating a DTO and we are on the ground, then don't attempt to activate any legs. The active
        // leg should already be set to an appropriate flight plan leg.
      }

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
    const firstEnrouteSegment = FmsUtils.getFirstEnrouteSegment(plan);

    if (!firstEnrouteSegment) {
      // This should never happen.
      return null;
    }

    const inUseUserFacilityIndexes = this.getInUseUserFacilityIndexes();
    let currentInUseUserFacilityIndexesIndex = 0;
    let currentUserFacilityIndex = 0;
    while (currentInUseUserFacilityIndexesIndex < inUseUserFacilityIndexes.length) {
      if (inUseUserFacilityIndexes[currentInUseUserFacilityIndexesIndex] !== currentUserFacilityIndex) {
        break;
      } else {
        ++currentInUseUserFacilityIndexesIndex;
        ++currentUserFacilityIndex;
      }
    }

    const departureSegment = FmsUtils.getDepartureSegment(plan);
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
          airwayEntryFacility = await this.retrieveIntersectionFacility(lastDepartureLeg.leg.fixIcaoStruct);

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
        if (currentUserFacilityIndex < 999) {

          let latLon: LatLonInterface | undefined;

          if (leg.hasLatLon) {
            latLon = leg;
          } else if (ICAO.isValueFacility(leg.referenceIcao)) {
            const referenceFacility = await this.retrieveFacility(leg.referenceIcao);

            if (opId !== this.loadOpId) {
              return null;
            }

            if (referenceFacility) {
              if (Math.abs(leg.distance) <= GeoMath.ANGULAR_TOLERANCE) {
                latLon = referenceFacility;
              } else {
                latLon = new GeoPoint(referenceFacility.lat, referenceFacility.lon)
                  .offset(leg.bearing, UnitType.NMILE.convertTo(leg.distance, UnitType.GA_RADIAN));
              }
            }
          }

          if (latLon) {
            const userFacility = this.createUserFacility(latLon, currentUserFacilityIndex);

            this.fms.addUserFacility(userFacility);
            const inserted = this.fms.insertWaypoint(currentSegment.segmentIndex, userFacility);

            if (inserted) {
              ++currentUserFacilityIndex;
              while (currentInUseUserFacilityIndexesIndex < inUseUserFacilityIndexes.length) {
                if (inUseUserFacilityIndexes[currentInUseUserFacilityIndexesIndex] !== currentUserFacilityIndex) {
                  break;
                } else {
                  ++currentInUseUserFacilityIndexesIndex;
                  ++currentUserFacilityIndex;
                }
              }

              // User facilities can never be airway entry waypoints.
              airwayEntryFacility = null;
              airwayEntrySegmentIndex = -1;
              airwayEntrySegmentLegIndex = -1;

              if (isPrevLegPpos) {
                directToTargetLeg = inserted;
              }
            }
          }
        } else {
          console.warn('GarminPrimaryFlightPlanRouteLoader: cannot load lat/lon or PBD enroute leg due to user waypoint limit reached');
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
                  console.warn(`GarminPrimaryFlightPlanRouteLoader: could not load airway '${leg.via}' to fix ${leg.fixIcao.ident} - the fix is not a valid exit waypoint`);
                }
              } else {
                console.warn(`GarminPrimaryFlightPlanRouteLoader: could not load airway '${leg.via}' to fix ${leg.fixIcao.ident} - no valid entry waypoint`);
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

              if (this.flattenAirways) {
                const sign = Math.sign(airway.exitIndex - airway.entryIndex);
                if (sign !== 0) {
                  let firstAirwayLeg: LegDefinition | undefined;

                  // Insert airway waypoints (minus the exit waypoint).
                  const count = (airway.exitIndex - airway.entryIndex) * sign;
                  for (let i = 1; i < count; i++) {
                    const facilityToInsert = await this.retrieveFacilityFromIntersection(airway.airway.waypoints[airway.entryIndex + i * sign]);

                    if (opId !== this.loadOpId) {
                      return null;
                    }

                    if (facilityToInsert) {
                      const insertedLeg = this.fms.insertWaypoint(currentSegment.segmentIndex, facilityToInsert);
                      firstAirwayLeg ??= insertedLeg;
                    }
                  }

                  // Insert exit waypoint.
                  const insertedLeg = this.fms.insertWaypoint(currentSegment.segmentIndex, facility);
                  firstAirwayLeg ??= insertedLeg;

                  airwayEntryFacility = airwayExitFacility;
                  airwayEntrySegmentIndex = currentSegment.segmentIndex;
                  airwayEntrySegmentLegIndex = currentSegment.legs.length - 1;

                  if (isPrevLegPpos && firstAirwayLeg) {
                    directToTargetLeg = firstAirwayLeg;
                  }
                }
              } else {
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
              }
            } else {
              const inserted = this.fms.insertWaypoint(currentSegment.segmentIndex, facility);

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
                  directToTargetLeg = inserted;
                }
              }
            }
          }

          if (opId !== this.loadOpId) {
            return null;
          }
        } else {
          console.warn(`GarminPrimaryFlightPlanRouteLoader: enroute fix with ICAO '${ICAO.valueToStringV1(leg.fixIcao)}' has invalid facility type`);
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
      console.warn(`GarminPrimaryFlightPlanRouteLoader: unable to retrieve facility with ICAO '${ICAO.valueToStringV1(icao)}'`);
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
            console.warn(`GarminPrimaryFlightPlanRouteLoader: unable to retrieve find runway with designation '${designation}' in airport ${airportIcao.ident}`);
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
      console.warn(`GarminPrimaryFlightPlanRouteLoader: unable to find procedure with name '${procedureName}' in airport ${ICAO.getAirportIdentFromStringV1(airport.icao)}`);
    }

    if (result.procedureIndex >= 0 && transitionName !== '' && result.enrouteTransitionIndex < 0) {
      console.warn(`GarminPrimaryFlightPlanRouteLoader: unable to find enroute transition with name '${transitionName}' in procedure ${ICAO.getAirportIdentFromStringV1(airport.icao)}.${procArray[result.procedureIndex].name}`);
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
      console.warn(`GarminPrimaryFlightPlanRouteLoader: unable to find approach ${approachIdentifier.type}${approachIdentifier.suffix === '' ? '' : ` ${approachIdentifier.suffix}`}${approachIdentifier.runway.number === '' ? '' : ` for runway ${approachIdentifier.runway.number}${approachIdentifier.runway.designator}`} in airport ${ICAO.getAirportIdentFromStringV1(airport.icao)}`);
    }

    if (result.approachIndex >= 0 && transitionName !== '' && result.transitionIndex < 0) {
      console.warn(`GarminPrimaryFlightPlanRouteLoader: unable to find approach transition with name '${transitionName}' in approach ${ICAO.getAirportIdentFromStringV1(airport.icao)}.${FmsUtils.getApproachNameAsString(airport.approaches[result.approachIndex])}`);
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
            console.warn(`GarminPrimaryFlightPlanRouteLoader: unable to retrieve waypoint with ICAO '${ICAO.valueToStringV1(icao)}'`);
          }
      }
    }

    return null;
  }

  /**
   * Retrieves the type-matched facility corresponding to an intersection facility.
   * @param facility The intersection facility for which to retrieve the type-matched facility.
   * @returns A Promise which is fulfilled with the requested facility, or `null` if such a facility could not be
   * found.
   */
  private async retrieveFacilityFromIntersection(facility: IntersectionFacility): Promise<Facility | null> {
    if (ICAO.isStringV1Facility(facility.icao, FacilityType.Intersection)) {
      return facility;
    }

    return this.retrieveFacility(ICAO.stringV1ToValue(facility.icao));
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
      console.warn(`GarminPrimaryFlightPlanRouteLoader: could not load airway '${airwayName}' to fix ${ICAO.tryValueToStringV2(exitFacility.icaoStruct)} - the fix is the same as the entry fix`);
      return null;
    }

    try {
      // Note: airway type passed to getAirway() doesn't actually matter, so we will just use an arbitrary value.
      const airway = await this.fms.facLoader.getAirway(airwayName, AirwayType.None, exitFacility.icaoStruct);

      let entryIndex = -1;
      let exitIndex = -1;

      if ((exitIndex = airway.waypoints.findIndex(airwayFix => ICAO.valueEquals(airwayFix.icaoStruct, exitFacility.icaoStruct))) >= 0) {
        // Find the entry waypoint in the airway
        if ((entryIndex = airway.waypoints.findIndex(airwayFix => ICAO.valueEquals(airwayFix.icaoStruct, entryFacility.icaoStruct))) >= 0) {
          return { airway, entryIndex, exitIndex };
        } else {
          console.warn(`GarminPrimaryFlightPlanRouteLoader: could not load airway '${airwayName}' to fix ${ICAO.tryValueToStringV2(exitFacility.icaoStruct)} - the entry fix ${ICAO.tryValueToStringV2(entryFacility.icaoStruct)} is not part of the specified airway`);
        }
      } else {
        // Should never happen.
        console.warn(`GarminPrimaryFlightPlanRouteLoader: could not load airway '${airwayName}' to fix ${ICAO.tryValueToStringV2(exitFacility.icaoStruct)} - the fix is not part of the specified airway`);
      }
    } catch {
      console.warn(`GarminPrimaryFlightPlanRouteLoader: could not load airway '${airwayName}' to fix ${ICAO.tryValueToStringV2(exitFacility.icaoStruct)} - the fix is not part of the specified airway`);
    }

    return null;
  }

  /**
   * Gets an array of all user facility indexes that are currently in-use, sorted in ascending order.
   * @returns An array of all user facility indexes that are currently in-use, sorted in ascending order.
   */
  private getInUseUserFacilityIndexes(): number[] {
    const indexes: number[] = [];

    if (this.fms.hasDirectToFlightPlan()) {
      indexes.push(...this.getInUseUserFacilityIndexesFromPlan(this.fms.getDirectToFlightPlan()));
    }

    if (this.fms.hasPrimaryFlightPlan()) {
      indexes.push(...this.getInUseUserFacilityIndexesFromPlan(this.fms.getPrimaryFlightPlan()));
    }

    return indexes.sort();
  }

  /**
   * Gets an array of all user facility indexes that are referenced in a flight plan.
   * @param plan The flight plan to check.
   * @returns An array of all user facility indexes that are references in the specified flight plan.
   */
  private getInUseUserFacilityIndexesFromPlan(plan: FlightPlan): number[] {
    const indexes: number[] = [];

    for (const leg of plan.legs()) {
      // Garmin flight plans can only reference user facilities as terminator fixes, so we only need to check fixIcao.

      if (!ICAO.isValueFacility(leg.leg.fixIcaoStruct, FacilityType.USR)) {
        continue;
      }

      if (leg.leg.fixIcaoStruct.airport === this.userFacilityScope) {
        const ident = leg.leg.fixIcaoStruct.ident;
        if (ident.startsWith(this.userFacilityIdentPrefix)) {
          const facilityIndex = Number(ident.substring(this.userFacilityIdentPrefix.length));
          if (Number.isInteger(facilityIndex) && facilityIndex >= 0) {
            indexes.push(facilityIndex);
          }
        }
      }
    }

    return indexes;
  }

  /**
   * Creates a new user facility to reference from a flight plan leg.
   * @param latLon The latitude/longitude coordinates of the facility to create.
   * @param index The index of the facility to create.
   * @returns A new user facility with the specified parameters.
   */
  private createUserFacility(latLon: LatLonInterface, index: number): UserFacility {
    const userIcao = ICAO.value(
      IcaoType.User,
      '',
      this.userFacilityScope,
      `${this.userFacilityIdentPrefix}${index.toString().padStart(3, '0')}`
    );

    return UserFacilityUtils.createFromLatLon(ICAO.valueToStringV1(userIcao), latLon.lat, latLon.lon, true);
  }
}

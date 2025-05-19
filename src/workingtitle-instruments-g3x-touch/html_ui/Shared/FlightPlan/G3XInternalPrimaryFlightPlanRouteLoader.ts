import {
  AirportFacility, AirportUtils, AirwayData, AirwayType, ApproachIdentifier, Facility, FacilityType, FacilityUtils,
  FlightPlan, GeoMath, GeoPoint, ICAO, IcaoType, IcaoValue, IntersectionFacility, LatLonInterface, OneWayRunway,
  ReadonlyFlightPlanRoute, RunwayIdentifier, RunwayUtils, SimVarValueType, UnitType, UserFacility, UserFacilityUtils
} from '@microsoft/msfs-sdk';

import { FmsUtils, GarminFlightPlanRouteLoader, GarminFlightPlanRouteUtils } from '@microsoft/msfs-garminsdk';

import { G3XFacilityUtils } from '../Navigation/G3XFacilityUtils';
import { G3XFms } from './G3XFms';

/**
 * A loader of flight plan routes into the internal primary flight plan of an instance of {@link G3XFms}.
 */
export class G3XInternalPrimaryFlightPlanRouteLoader implements GarminFlightPlanRouteLoader {
  private static readonly USER_FACILITY_IDENT_PREFIX = 'FPL';

  private loadOpId = 0;
  private activeLoadPromise?: Promise<boolean>;

  /**
   * Creates a new instance of G3XInternalPrimaryFlightPlanRouteLoader.
   * @param fms The FMS containing the primary flight plan to which the loader loads flight plan routes.
   */
  public constructor(private readonly fms: G3XFms) {
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
      if (!this.fms.hasInternalPrimaryFlightPlan()) {
        return false;
      }

      plan = this.fms.getInternalPrimaryFlightPlan();

      // Check if there are any open batches. If there are, then some operation on the flight plan is in-progress. In
      // this case we will immediately abort.
      if (plan.getBatchStack()) {
        return false;
      }

      batchUuid = plan.openBatch(GarminFlightPlanRouteUtils.DEFAULT_LOAD_ROUTE_BATCH_NAME);

      await this.fms.emptyPrimaryFlightPlan();

      if (opId !== this.loadOpId) {
        return false;
      }

      // Cancel any off-route DTO (on-route DTOs would have been cancelled by emptying the primary flight plan).
      this.fms.cancelDirectTo();

      // Find the last PPOS leg, if one exists.
      const pposLegIndex = route.enroute.reduce((legIndex, leg, index) => leg.isPpos ? index : legIndex, -1);

      // Only insert the departure airport if there is no PPOS leg.
      if (pposLegIndex < 0) {
        if (ICAO.isValueFacility(route.departureAirport, FacilityType.Airport)) {
          const origin = await this.retrieveOriginDest(route.departureAirport, route.departureRunway);

          if (opId !== this.loadOpId) {
            return false;
          }

          if (origin) {
            await this.fms.insertWaypoint(0, origin.airport);

            if (opId !== this.loadOpId) {
              return false;
            }
          }
        }
      }

      await this.loadEnrouteLegs(opId, route, pposLegIndex);

      if (opId !== this.loadOpId) {
        return false;
      }

      if (ICAO.isValueFacility(route.destinationAirport, FacilityType.Airport)) {
        const destination = await this.retrieveOriginDest(route.destinationAirport, route.destinationRunway);

        if (opId !== this.loadOpId) {
          return false;
        }

        if (destination) {
          if (plan.length > 0) {
            // If the plan is not empty, then insert at the end of segment containing the last leg.
            await this.fms.insertWaypoint(plan.getSegmentIndex(plan.length - 1), destination.airport);
          } else {
            // If the plan is empty, then insert at the end of the enroute segment.
            const firstEnrouteSegment = FmsUtils.getFirstEnrouteSegment(plan);
            if (firstEnrouteSegment) {
              await this.fms.insertWaypoint(firstEnrouteSegment.segmentIndex, destination.airport);
            }
          }

          if (opId !== this.loadOpId) {
            return false;
          }

          const approachIndexes = this.retrieveApproachIndexes(
            destination.airport,
            route.approach,
            route.approachTransition
          );

          if (approachIndexes.approachIndex >= 0) {
            await this.fms.loadApproach(destination.airport, approachIndexes.approachIndex);

            if (opId !== this.loadOpId) {
              return false;
            }
          }
        }
      }

      await plan.calculate(0);

      if (opId !== this.loadOpId) {
        return false;
      }

      if (plan.length > 1) {
        // Only activate the nearest leg if we are not on the ground and there is no PPOS leg defined in the route.
        if (pposLegIndex < 0 && SimVar.GetSimVarValue('SIM ON GROUND', SimVarValueType.Bool) === 0) {
          this.fms.activateNearestLeg();
        }
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
   * @param route The flight plan route to load.
   * @param pposLegIndex The index of the last PPOS leg in the enroute legs array, or `-1` if there are no PPOS legs.
   * @returns The desired on-route direct-to target leg within the enroute segments specified by the loaded flight plan
   * route, or `null` if there is no such leg.
   */
  private async loadEnrouteLegs(opId: number, route: ReadonlyFlightPlanRoute, pposLegIndex: number): Promise<void> {
    // If the PPOS leg is the last enroute leg, then we are skipping every enroute leg, so there is nothing to do.
    if (pposLegIndex === route.enroute.length - 1) {
      return;
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

    // The G3X internal flight plan can only have the origin airport in the departure segment, so we don't have to
    // worry about initializing the airway entry facility to the last waypoint in the departure segment.

    let airwayEntryFacility: IntersectionFacility | null = null;

    for (let legIndex = 0; legIndex < route.enroute.length; legIndex++) {
      const leg = route.enroute[legIndex];

      if (leg.isPpos) {
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
              return;
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
            const inserted = await this.fms.insertWaypointAtEnd(userFacility);

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
            }
          }
        } else {
          console.warn('G3XInternalPrimaryFlightPlanRouteLoader: cannot load lat/lon or PBD enroute leg due to user waypoint limit reached');
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
                  console.warn(`G3XInternalPrimaryFlightPlanRouteLoader: could not load airway '${leg.via}' to fix ${leg.fixIcao.ident} - the fix is not a valid exit waypoint`);
                }
              } else {
                console.warn(`G3XInternalPrimaryFlightPlanRouteLoader: could not load airway '${leg.via}' to fix ${leg.fixIcao.ident} - no valid entry waypoint`);
              }
            }

            if (opId !== this.loadOpId) {
              return;
            }

            if (airway) {
              // We always flatten airways.

              // Note: we don't have to worry about duplicate legs because airway segments cannot duplicate the leg
              // before it (i.e. the entry waypoint) and we are guaranteed to be adding to the segment to the end of the
              // flight plan so there is nothing after the segment to duplicate.

              // Only insert the waypoints into the plan if the exit leg is after the last PPOS leg.
              if (legIndex > pposLegIndex) {
                const sign = Math.sign(airway.exitIndex - airway.entryIndex);
                if (sign !== 0) {

                  // Insert airway waypoints (minus the exit waypoint).
                  const count = (airway.exitIndex - airway.entryIndex) * sign;
                  for (let i = 1; i < count; i++) {
                    const facilityToInsert = await this.retrieveFacilityFromIntersection(airway.airway.waypoints[airway.entryIndex + i * sign]);

                    if (opId !== this.loadOpId) {
                      return;
                    }

                    if (facilityToInsert) {
                      await this.fms.insertWaypointAtEnd(facilityToInsert);

                      if (opId !== this.loadOpId) {
                        return;
                      }
                    }
                  }

                  // Insert exit waypoint.
                  await this.fms.insertWaypointAtEnd(facility);
                }
              }

              airwayEntryFacility = airwayExitFacility;
            } else {
              let updateAirwayEntry: boolean;

              // Only insert the waypoint into the plan if the leg is after the last PPOS leg.
              if (legIndex > pposLegIndex) {
                const inserted = await this.fms.insertWaypointAtEnd(facility);
                updateAirwayEntry = !!inserted;
              } else {
                updateAirwayEntry = true;
              }

              if (updateAirwayEntry) {
                if (FacilityUtils.isFacilityType(facility, FacilityType.Intersection)) {
                  airwayEntryFacility = facility;
                } else {
                  airwayEntryFacility = await this.retrieveIntersectionFacility(leg.fixIcao);
                }
              }
            }
          }
        } else {
          console.warn(`G3XInternalPrimaryFlightPlanRouteLoader: enroute fix with ICAO '${ICAO.tryValueToStringV2(leg.fixIcao)}' has invalid facility type`);
        }
      }

      if (opId !== this.loadOpId) {
        return;
      }
    }
  }

  /**
   * Retrieves a facility with a given ICAO.
   * @param icao The ICAO of the facility to retrieve.
   * @returns A Promise which is fulfilled with the requested facility, or `null` if such a facility could not be
   * found.
   */
  private async retrieveFacility(icao: IcaoValue): Promise<Facility | null> {
    try {
      return await this.fms.facLoader.getFacility(ICAO.getFacilityTypeFromValue(icao), icao);
    } catch {
      console.warn(`G3XInternalPrimaryFlightPlanRouteLoader: unable to retrieve facility with ICAO '${ICAO.tryValueToStringV2(icao)}'`);
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
            console.warn(`G3XInternalPrimaryFlightPlanRouteLoader: unable to retrieve find runway with designation '${designation}' in airport ${airportIcao.ident}`);
          }
        }

        return { airport, runway };
      }
    }

    return null;
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
      console.warn(`G3XInternalPrimaryFlightPlanRouteLoader: unable to find approach ${approachIdentifier.type}${approachIdentifier.suffix === '' ? '' : ` ${approachIdentifier.suffix}`}${approachIdentifier.runway.number === '' ? '' : ` for runway ${approachIdentifier.runway.number}${approachIdentifier.runway.designator}`} in airport ${ICAO.getAirportIdentFromStringV1(airport.icao)}`);
    }

    if (result.approachIndex >= 0 && transitionName !== '' && result.transitionIndex < 0) {
      console.warn(`G3XInternalPrimaryFlightPlanRouteLoader: unable to find approach transition with name '${transitionName}' in approach ${ICAO.getAirportIdentFromStringV1(airport.icao)}.${FmsUtils.getApproachNameAsString(airport.approaches[result.approachIndex])}`);
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
            return await this.fms.facLoader.getFacility(FacilityType.Intersection, icao);
          } catch {
            console.warn(`G3XInternalPrimaryFlightPlanRouteLoader: unable to retrieve waypoint with ICAO '${ICAO.tryValueToStringV2(icao)}'`);
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
    if (ICAO.isValueFacility(facility.icaoStruct, FacilityType.Intersection)) {
      return facility;
    }

    return this.retrieveFacility(facility.icaoStruct);
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
      console.warn(`G3XInternalPrimaryFlightPlanRouteLoader: could not load airway '${airwayName}' to fix ${ICAO.tryValueToStringV2(exitFacility.icaoStruct)} - the fix is the same as the entry fix`);
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
          console.warn(`G3XInternalPrimaryFlightPlanRouteLoader: could not load airway '${airwayName}' to fix ${ICAO.tryValueToStringV2(exitFacility.icaoStruct)} - the entry fix ${ICAO.tryValueToStringV2(entryFacility.icaoStruct)} is not part of the specified airway`);
        }
      } else {
        // Should never happen.
        console.warn(`G3XInternalPrimaryFlightPlanRouteLoader: could not load airway '${airwayName}' to fix ${ICAO.tryValueToStringV2(exitFacility.icaoStruct)} - the fix is not part of the specified airway`);
      }
    } catch {
      console.warn(`G3XInternalPrimaryFlightPlanRouteLoader: could not load airway '${airwayName}' to fix ${ICAO.tryValueToStringV2(exitFacility.icaoStruct)} - the fix is not part of the specified airway`);
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

      if (leg.leg.fixIcaoStruct.airport === G3XFacilityUtils.USER_FACILITY_SCOPE) {
        const ident = leg.leg.fixIcaoStruct.ident;
        if (ident.startsWith(G3XInternalPrimaryFlightPlanRouteLoader.USER_FACILITY_IDENT_PREFIX)) {
          const facilityIndex = Number(ident.substring(G3XInternalPrimaryFlightPlanRouteLoader.USER_FACILITY_IDENT_PREFIX.length));
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
      G3XFacilityUtils.USER_FACILITY_SCOPE,
      `${G3XInternalPrimaryFlightPlanRouteLoader.USER_FACILITY_IDENT_PREFIX}${index.toString().padStart(3, '0')}`
    );

    return UserFacilityUtils.createFromLatLon(userIcao, latLon.lat, latLon.lon, true);
  }
}

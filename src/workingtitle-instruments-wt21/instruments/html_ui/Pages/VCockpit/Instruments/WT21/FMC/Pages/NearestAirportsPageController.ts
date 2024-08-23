import {
  AirportFacility, EventBus, FacilitySearchType, FacilityType, GeoPoint, ICAO, MagVar, NavMath, NearestAirportSearchSession, RunwayUtils, UnitType
} from '@microsoft/msfs-sdk';

import { WT21Fms } from '../FlightPlan/WT21Fms';
import { NearestAirportsPageStore } from './NearestAirportsPageStore';

/**
 * A controller for the nearest airports page.
 */
export class NearestAirportsPageController {
  private static readonly SEARCH_RADIUS = UnitType.NMILE.convertTo(200, UnitType.METER);
  private static readonly MAX_SEARCH_ITEMS = 20;

  private nrstSearchSession?: NearestAirportSearchSession;
  private isSearchQueued = false;
  private latestPPos = new GeoPoint(0, 0);
  private nearestAirports: AirportFacility[] = [];

  private isSearchBusy = false;

  /**
   * Constructor.
   * @param eventBus The event bus.
   * @param fms The FMS.
   * @param store The data store associated with this controller.
   * @param onNearestSearchInit A callback function to execute when this controller's nearest search session is
   * initialized.
   */
  constructor(
    private readonly eventBus: EventBus,
    private readonly fms: WT21Fms,
    private readonly store: NearestAirportsPageStore,
    onNearestSearchInit?: () => void
  ) {
    this.fms.facLoader.startNearestSearchSession(FacilitySearchType.Airport).then(session => {
      this.nrstSearchSession = session;

      onNearestSearchInit && onNearestSearchInit();
    });
  }

  /**
   * Enqueues an update of the displayed nearest airport list.
   */
  public enqueueUpdate(): void {
    this.isSearchQueued = true;
  }

  /**
   * Dequeues an update of the displayed nearest airport list.
   */
  public dequeueUpdate(): void {
    if (!this.nrstSearchSession || !this.isSearchQueued || this.isSearchBusy) {
      return;
    }

    this.isSearchQueued = false;
    this.doUpdate();
  }

  /**
   * Performs an update of the displayed nearest airport list. The list will be populated with the ORIGIN and
   * DESTINATION airports, if they exist, followed by nearest airports in increasing distance from PPOS (if two or
   * more airports are equidistant, then they are ordered by increasing deviation from the aircraft's current ground
   * track) up to a total of five airports.
   */
  private async doUpdate(): Promise<void> {
    if (!this.nrstSearchSession) {
      return;
    }

    this.isSearchBusy = true;

    // Update nearest airport search sesion
    const ppos = this.store.ppos.get();
    const results = await this.nrstSearchSession.searchNearest(ppos.lat, ppos.long, NearestAirportsPageController.SEARCH_RADIUS, NearestAirportsPageController.MAX_SEARCH_ITEMS);

    // Update nearest airports list with results from latest search
    this.nearestAirports = this.nearestAirports.filter(airport => !results.removed.includes(airport.icao));

    const newAirports = await Promise.all(results.added.map(icao => this.fms.facLoader.getFacility(FacilityType.Airport, icao)));
    this.latestPPos.set(ppos.lat, ppos.long);
    const course = this.store.course.get();

    const distances = this.nearestAirports.map(airport => this.latestPPos.distance(airport));

    // Sort airports in order of increasing distance from ppos, then in order of increasing course deviation
    for (let i = 0; i < newAirports.length; i++) {
      let insert = false;
      const newAirport = newAirports[i];
      const dis = this.latestPPos.distance(newAirport);
      for (let j = 0; j < this.nearestAirports.length; j++) {
        if (dis < distances[j]) {
          insert = true;
        } else if (dis === distances[j]) {
          const courseDevToNewAirport = Math.abs(NavMath.diffAngle(this.latestPPos.bearingTo(newAirport), course));
          const courseDevToExistingAirport = Math.abs(NavMath.diffAngle(this.latestPPos.bearingTo(this.nearestAirports[j]), course));
          insert = courseDevToNewAirport < courseDevToExistingAirport;
        }

        if (insert) {
          this.nearestAirports.splice(j, 0, newAirport);
          distances.splice(j, 0, dis);
          break;
        }
      }

      if (!insert) {
        this.nearestAirports.push(newAirport);
        distances.push(dis);
      }
    }

    // Get the origin and destination airports from the primary flight plan.

    const plan = this.fms.getPrimaryFlightPlan();
    const planIcaos = [
      plan.originAirport,
      plan.destinationAirport
    ];

    const planAirports = await Promise.all(planIcaos.map(icao => {
      return icao !== undefined && ICAO.isFacility(icao) && ICAO.getFacilityType(icao) === FacilityType.Airport
        ? this.fms.facLoader.getFacility(FacilityType.Airport, icao)
        : Promise.resolve(undefined);
    }));

    if (this.isSearchQueued) {
      // If there is another search queued, don't bother updating the displayed airports; just run the search again.
      this.isSearchBusy = false;
      this.dequeueUpdate();
      return;
    }

    // Display the origin and destination airports (if they exist), followed by the nearest airports that meet the
    // minimum runway length criterion, up to a total of 5 airports.

    // TODO: Hook up min runway length setting
    const minRunwayLengthMeters = UnitType.FOOT.convertTo(1500, UnitType.METER);

    const displayedAirports = planAirports.filter(airport => !!airport) as AirportFacility[];
    for (let i = 0; i < this.nearestAirports.length && displayedAirports.length < 5; i++) {
      const airport = this.nearestAirports[i];
      if (airport.runways.some(runway => runway.length - runway.primaryThresholdLength - runway.secondaryThresholdLength >= minRunwayLengthMeters)
        && !planIcaos.includes(airport.icao)) {
        displayedAirports.push(airport);
      }
    }

    const gs = this.store.groundSpeed.get();
    const ff = this.store.fuelFlow.get();
    const fob = this.store.fob.get();

    this.store.displayedAirports.set(displayedAirports.map(airport => {
      const bearing = MagVar.trueToMagnetic(this.latestPPos.bearingTo(airport), this.latestPPos);
      const distance = UnitType.GA_RADIAN.convertTo(this.latestPPos.distance(airport), UnitType.NMILE);

      const longestRunwayIndex = airport.runways.reduce((prevIndex, curr, index, arr) => {
        if (prevIndex === -1) {
          return index;
        }

        const prev = arr[prevIndex];

        const currLength = curr.length - curr.primaryThresholdLength - curr.secondaryThresholdLength;
        const prevLength = prev.length - prev.primaryThresholdLength - prev.secondaryThresholdLength;

        if (currLength > prevLength) {
          return index;
        }

        if (currLength === prevLength) {
          const currPrimaryName = curr.designation.split('-')[0].padStart(2, '0') + RunwayUtils.getDesignatorLetter(curr.designatorCharPrimary);
          const prevPrimaryName = prev.designation.split('-')[0].padStart(2, '0') + RunwayUtils.getDesignatorLetter(prev.designatorCharPrimary);

          if (currPrimaryName.localeCompare(prevPrimaryName) < 0) {
            return index;
          }
        }

        return prevIndex;
      }, -1);

      const eteHours = distance / Math.max(150, gs);

      const fuelBurn = ff * eteHours;
      const fod = UnitType.GALLON_FUEL.convertTo(fob - fuelBurn, UnitType.POUND);

      return {
        airport,
        runway: longestRunwayIndex >= 0 ? RunwayUtils.getOneWayRunways(airport.runways[longestRunwayIndex], longestRunwayIndex)[0] : null,
        bearing,
        distance,
        ete: eteHours * 60,
        fod
      };
    }));

    this.isSearchBusy = false;
  }

  /**
   * Destroys this controller.
   */
  public destroy(): void {
    // noop
  }
}

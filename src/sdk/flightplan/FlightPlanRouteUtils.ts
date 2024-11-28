import { ApproachUtils } from '../navigation/ApproachUtils';
import { ICAO } from '../navigation/IcaoUtils';
import { RunwayUtils } from '../navigation/RunwayUtils';
import { DeepReadonly } from '../utils/types/UtilityTypes';
import {
  FlightPlanRoute, FlightPlanRouteAltitude, FlightPlanRouteEnrouteLeg, FlightPlanRouteVfrPatternApproach,
  FlightPlanRouteVfrPatternApproachType, FlightPlanRouteVfrPatternDeparture,
  FlightPlanRouteVfrPatternDepartureType, ReadonlyFlightPlanRoute
} from './FlightPlanRoute';

/**
 * A utility class for working with flight plan routes.
 */
export class FlightPlanRouteUtils {
  /**
   * Creates an empty flight plan route.
   * @returns An empty flight plan route.
   */
  public static emptyRoute(): FlightPlanRoute {
    return {
      __Type: 'JS_FlightPlanRoute',
      departureAirport: ICAO.emptyValue(),
      departureRunway: RunwayUtils.emptyIdentifier(),
      destinationAirport: ICAO.emptyValue(),
      destinationRunway: RunwayUtils.emptyIdentifier(),
      enroute: [],
      departure: '',
      departureTransition: '',
      departureVfrPattern: FlightPlanRouteUtils.emptyVfrPatternDeparture(),
      arrival: '',
      arrivalTransition: '',
      approach: ApproachUtils.emptyIdentifier(),
      approachTransition: '',
      approachVfrPattern: FlightPlanRouteUtils.emptyVfrPatternApproach(),
      cruiseAltitude: null,
      isVfr: false
    };
  }

  /**
   * Sets a flight plan route to be empty.
   * @param route The route to set.
   * @returns The specified flight plan route, after it has been set to be empty.
   */
  public static toEmptyRoute(route: FlightPlanRoute): FlightPlanRoute {
    route.departureAirport = ICAO.emptyValue();
    RunwayUtils.toEmptyIdentifier(route.departureRunway);
    route.destinationAirport = ICAO.emptyValue();
    RunwayUtils.toEmptyIdentifier(route.destinationRunway);
    route.enroute.length = 0;
    route.departure = '';
    route.departureTransition = '';
    route.arrival = '';
    route.arrivalTransition = '';
    ApproachUtils.toEmptyIdentifier(route.approach);
    route.approachTransition = '';
    route.cruiseAltitude = null;
    return route;
  }

  /**
   * Creates an empty flight plan enroute leg.
   * @returns An empty flight plan enroute leg.
   */
  public static emptyEnrouteLeg(): FlightPlanRouteEnrouteLeg {
    return {
      __Type: 'JS_EnrouteLeg',
      fixIcao: ICAO.emptyValue(),
      via: '',
      isPpos: false,
      hasLatLon: false,
      lat: 0,
      lon: 0,
      hasPointBearingDistance: false,
      referenceIcao: ICAO.emptyValue(),
      bearing: 0,
      distance: 0,
      altitude: null,
      name: '',
    };
  }

  /**
   * Sets a flight plan enroute leg to be empty.
   * @param leg The leg to set.
   * @returns The specified leg, after it has been set to be empty.
   */
  public static toEmptyEnrouteLeg(leg: FlightPlanRouteEnrouteLeg): FlightPlanRouteEnrouteLeg {
    leg.fixIcao = ICAO.emptyValue();
    leg.via = '';
    leg.isPpos = false;
    leg.hasLatLon = false;
    leg.lat = 0;
    leg.lon = 0;
    leg.hasPointBearingDistance = false;
    leg.referenceIcao = ICAO.emptyValue();
    leg.bearing = 0;
    leg.distance = 0;
    leg.altitude = null;
    leg.name = '';
    return leg;
  }

  /**
   * Creates an empty flight plan altitude.
   * @returns An empty flight plan altitude.
   */
  public static emptyAltitude(): FlightPlanRouteAltitude {
    return {
      __Type: 'JS_FlightAltitude',
      altitude: 0,
      isFlightLevel: false
    };
  }

  /**
   * Creates an empty VFR traffic pattern departure procedure description.
   * @returns An empty VFR traffic pattern departure procedure description.
   */
  public static emptyVfrPatternDeparture(): FlightPlanRouteVfrPatternDeparture {
    return {
      __Type: 'JS_VfrPatternProcedure',
      type: FlightPlanRouteVfrPatternDepartureType.None,
      isLeftTraffic: true,
      distance: 0,
      altitude: 0
    };
  }

  /**
   * Creates an empty VFR traffic pattern approach procedure description.
   * @returns An empty VFR traffic pattern approach procedure description.
   */
  public static emptyVfrPatternApproach(): FlightPlanRouteVfrPatternApproach {
    return {
      __Type: 'JS_VfrPatternProcedure',
      type: FlightPlanRouteVfrPatternApproachType.None,
      isLeftTraffic: true,
      distance: 0,
      altitude: 0
    };
  }

  /**
   * Checks whether a flight plan route is empty.
   * @param route The route to check.
   * @param strict Whether to apply a strict check. A strict check considers a route empty if and only if all its
   * fields are themselves empty (except for `isVfr`, which can take any value). A non-strict check considers a route
   * empty if and only if it does not define a departure airport, does not define a destination airport, and defines no
   * enroute legs.
   * @returns Whether the specified flight plan route is empty.
   */
  public static isRouteEmpty(route: ReadonlyFlightPlanRoute, strict = true): boolean {
    if (!ICAO.isValueEmpty(route.departureAirport)) {
      return false;
    }

    if (!ICAO.isValueEmpty(route.destinationAirport)) {
      return false;
    }

    if (route.enroute.length > 0) {
      return false;
    }

    if (strict) {
      if (route.departureRunway.number !== '' || route.departureRunway.designator !== '') {
        return false;
      }

      if (route.destinationRunway.number !== '' || route.destinationRunway.designator !== '') {
        return false;
      }

      if (route.departure !== '' || route.departureTransition !== '') {
        return false;
      }

      if (
        route.departureVfrPattern.type !== FlightPlanRouteVfrPatternDepartureType.None
        || !route.departureVfrPattern.isLeftTraffic
        || route.departureVfrPattern.distance !== 0
        || route.departureVfrPattern.altitude !== 0
      ) {
        return false;
      }

      if (route.arrival !== '' || route.arrivalTransition !== '') {
        return false;
      }

      if (
        route.approach.type !== ''
        || route.approach.runway.number !== ''
        || route.approach.runway.designator !== ''
        || route.approach.suffix !== ''
        || route.approachTransition !== ''
      ) {
        return false;
      }

      if (
        route.approachVfrPattern.type !== FlightPlanRouteVfrPatternApproachType.None
        || !route.approachVfrPattern.isLeftTraffic
        || route.approachVfrPattern.distance !== 0
        || route.approachVfrPattern.altitude !== 0
      ) {
        return false;
      }

      if (route.cruiseAltitude !== null) {
        return false;
      }
    }

    return true;
  }

  /**
   * Checks whether a flight plan route enroute leg is empty.
   * @param leg The leg to check.
   * @returns Whether the specified enroute leg is empty.
   */
  public static isEnrouteLegEmpty(leg: DeepReadonly<FlightPlanRouteEnrouteLeg>): boolean {
    return ICAO.isValueEmpty(leg.fixIcao)
      && leg.via === ''
      && leg.isPpos === false
      && leg.hasLatLon === false
      && leg.lat === 0
      && leg.lon === 0
      && leg.hasPointBearingDistance === false
      && ICAO.isValueEmpty(leg.referenceIcao)
      && leg.bearing === 0
      && leg.distance === 0
      && leg.altitude === null
      && leg.name === '';
  }
}

import { FlightPathUtils } from '../flightplan/flightpath/FlightPathUtils';
import { FlightPathVector } from '../flightplan/flightpath/FlightPathVector';
import { FlightPlan } from '../flightplan/FlightPlan';
import { LegDefinition } from '../flightplan/FlightPlanning';
import { GeoCircle } from '../geo/GeoCircle';
import { LatLonInterface } from '../geo/GeoInterfaces';
import { GeoPoint } from '../geo/GeoPoint';
import { UnitType } from '../math/NumberUnit';
import { FlightPlanLeg, LegType } from './Facilities';
import { FlightPlanLegTerrainProfile, FlightPlanLegTerrainProfilePath, FlightPlanTerrainProfile, TerrainProfile } from './TerrainProfileLoaderTypes';

/**
 * Options for {@link TerrainProfileLoader}
 */
export interface TerrainProfileLoaderOptions {
  /**
   * The minimum resolution of the terrain profile on the horizontal axis in metres. Defaults to 250 metres.
   * Used for determining the number of elevation points to return. A value of 250 will return an elevation point every 250m, or less.
   */
  terrainMinimumResolution?: number;
}

/** Class for loading a vertical terrain profile from the simulator */
export class TerrainProfileLoader {
  private static listenerPromise?: Promise<ViewListener.ViewListener>;

  private static readonly geoCircleCache = [new GeoCircle(new Float64Array(3), 0)];
  private static readonly geoPointCache = [new GeoPoint(0, 0), new GeoPoint(0, 0)];
  private static readonly vec3Cache = [new Float64Array(3)];

  private options: Required<TerrainProfileLoaderOptions> = {
    terrainMinimumResolution: 250,
  };

  /** @inheritdoc */
  constructor(options?: Readonly<TerrainProfileLoaderOptions>) {
    this.options = {
      terrainMinimumResolution: options?.terrainMinimumResolution ?? this.options.terrainMinimumResolution
    };
  }

  /**
   * Gets the vertical profile view listener from the sim
   * @returns A promise that resolves to the view listener
   */
  private static getListener(): Promise<ViewListener.ViewListener> {
    if (TerrainProfileLoader.listenerPromise !== undefined) {
      return TerrainProfileLoader.listenerPromise;
    }

    return TerrainProfileLoader.listenerPromise = new Promise((resolve) => {
      const listener = RegisterViewListener('JS_LISTENER_PROFILE_CUT', () => resolve(listener));
    });
  }

  /**
   * Gets an array of terrain elevation over a path of specified latlong points
   * @param points The latlong points to draw a path between
   * @param numElevations The number of elevation points along the path to return
   * @returns A terrain profile interface
   */
  public async getTerrainProfileAlongPath(points: LatLong[], numElevations: number): Promise<TerrainProfile> {
    return (await TerrainProfileLoader.getListener()).call('GET_WORLD_ELEVATIONS_PATH', points, numElevations);
  }

  /**
   * Gets the terrain profile for a flight plan leg
   * @param leg The leg object
   * @param terrainDefinition The definition of the terrain, in metres. Defaults to the initial terrain minimum resolution.
   * @returns A leg terrain profile. If no valid terrain profile can be found then the profile is undefined.
   */
  public async getTerrainProfileForLeg(leg: LegDefinition, terrainDefinition = this.options.terrainMinimumResolution): Promise<FlightPlanLegTerrainProfile> {
    if (leg.calculated !== undefined && TerrainProfileLoader.isLegAllowed(leg.leg)) {
      const flightPath = leg.calculated.ingress.concat(leg.calculated.ingressToEgress, leg.calculated.egress);
      const profilePath = this.getPointsForLegFlightPath(flightPath, terrainDefinition);

      const isValidPath = profilePath.numElevationPoints > 0 && profilePath.points.length > 0;
      const profile = isValidPath ? await this.getTerrainProfileAlongPath(profilePath.points, profilePath.numElevationPoints) : undefined;

      return {
        ...profilePath,
        profile,
        legDistance: leg.calculated.distanceWithTransitions
      };
    } else {
      return {
        points: [],
        numElevationPoints: 0,
        profile: undefined,
        legDistance: leg.calculated?.distanceWithTransitions ?? 0,
      };
    }
  }

  /**
   * Gets the terrain profile for all legs in a given flight plan
   * @param plan The flight plan
   * @param startLegGlobalIndex The global index of the first leg to check, inclusive. Defaults to leg index 0.
   * @param endLegGlobalIndex The global index of the last leg to check, exclusive. Defaults to the flight plan length
   * @param terrainDefinition The definition of the terrain, in metres. Defaults to the initial terrain minimum resolution.
   * @returns A flight plan terrain profile
   */
  public async getTerrainProfileForFlightPlan(
    plan: FlightPlan,
    startLegGlobalIndex = 0,
    endLegGlobalIndex = plan.length,
    terrainDefinition = this.options.terrainMinimumResolution
  ): Promise<FlightPlanTerrainProfile> {
    return {
      legs: await Promise.all(
        [...plan.legs(false, startLegGlobalIndex, endLegGlobalIndex)].map(leg => this.getTerrainProfileForLeg(leg, terrainDefinition))
      ),
      startLegGlobalIndex,
      endLegGlobalIndex
    };
  }

  /**
   * Gets an array of lat long points that make up a leg flight path vector
   * @param pathVectors An array of flight path vectors
   * @param terrainDefinition The definition of the terrain, in metres. Defaults to the initial terrain minimum resolution.
   * @returns The terrain profile information to use
   */
  private getPointsForLegFlightPath(pathVectors: FlightPathVector[], terrainDefinition = this.options.terrainMinimumResolution): FlightPlanLegTerrainProfilePath {
    const points: LatLong[] = [];
    let numElevationPoints = 0;

    for (const pathVector of pathVectors) {
      const { startLat, startLon, endLat, endLon, distance } = pathVector;

      const circle = FlightPathUtils.setGeoCircleFromVector(pathVector, TerrainProfileLoader.geoCircleCache[0]);
      const startPoint = GeoPoint.sphericalToCartesian(startLat, startLon, TerrainProfileLoader.vec3Cache[0]);
      numElevationPoints += distance / terrainDefinition;

      if (circle.isGreatCircle()) {
        points.push(new LatLong(startLat, startLon), new LatLong(endLat, endLon));
      } else {
        let distanceTraversed = 0;
        let prevPoint: Float64Array | LatLonInterface = startPoint;
        while (distanceTraversed < distance) {
          const distanceToOffset = Math.min(terrainDefinition, distance - distanceTraversed);
          distanceTraversed += distanceToOffset;

          const point: LatLonInterface = circle.offsetDistanceAlong(
            prevPoint,
            UnitType.GA_RADIAN.convertFrom(terrainDefinition, UnitType.METER),
            TerrainProfileLoader.geoPointCache[0],
          );

          prevPoint = point;
          points.push(new LatLong(point.lat, point.lon));
        }
      }
    }

    return {
      points,
      numElevationPoints: Math.ceil(numElevationPoints)
    };
  }

  private static INVALID_LEG_TYPES = [
    LegType.FM,
    LegType.HM,
    LegType.VM,
    LegType.Discontinuity,
    LegType.ThruDiscontinuity
  ];
  /**
   * Checks if a leg can be used to get a terrain profile
   * @param leg The leg definition
   * @returns If the leg can return a valid terrain profile
   */
  private static isLegAllowed(leg: FlightPlanLeg): boolean {
    return !this.INVALID_LEG_TYPES.includes(leg.type);
  }
}

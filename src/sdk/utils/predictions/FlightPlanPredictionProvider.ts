import { GeoPoint, LatLonInterface } from '../../geo';
import { WindEntry } from '../../navigation/Wind';
import { SubEventInterface } from '../../sub';

/**
 * Tracking position for a facility predictions tracking entry
 */
export type FacilityPredictionsTrackingPosition = 'destination' | 'direct' | number

/**
 * Entry specifying the data used for predicting a theoretical flight path to a facility
 */
export interface FacilityPredictionsTrackingEntry {
  /** The ICAO of the facility to track */
  facIcao: string;

  /**
   * The speed, as a CAS (knots), Mach number or speed schedule string, with which predictions for this entry will be computed.
   *
   * Speed schedule strings depend on individual avionics/aircraft and might be discarded altogether by some implementations.
   **/
  predictionSpeed: number | string;

  /** Whether {@link predictionSpeed} is a Mach value. Only applicable if it is a numerical value */
  predictionSpeedIsMach: boolean;

  /** The altitude, in metres, with which predictions for this entry will be computed */
  predictionsAltitude: number;

  /** The altitude component, in metres, of an OAT entry with which predictions for this entry will be computed */
  predictionsOatAltitude: number;

  /** The temperature component, in degrees Celsius, of an OAT entry with which predictions for this entry will be computed */
  predictionsOatTemperature: number;

  /** The wind with which predictions for this entry will be computed */
  predictionsWind: WindEntry,

  /**
   * The point on the flight plan, if applicable, at which the predictions for this entry will start
   * being computed using great-circle distance. This is the `fixIcao` property of a FlightPlanLeg.
   *
   * If `destination` is specified, the index of the MAP fix (or the last leg of the flight plan if a MAP does not exist) will be used.
   * If `direct` is specified, or
   * If another number value is specified, the termination point of the corresponding flight plan leg will be used.
   * If not specified or otherwise invalid, the present position of the aircraft at the time of computation will be used.
   **/
  startAfterFlightPlanLeg?: FacilityPredictionsTrackingPosition,
}

/**
 * Predictions from present position of an aircraft to a point, along a flight path in 3D space
 */
export interface Predictions<P extends LatLonInterface = GeoPoint> {
  /** A string identifier associated with this prediction */
  ident: string;

  /** The location of this point */
  position: P;

  /** Whether the contents of this prediction are valid and up-to-date */
  valid: boolean;

  /** The distance to the point, in metres. Can be a mix of along-path and great-circle distance based on the available data. */
  distance: number;

  /** The estimated time of arrival, in UNIX timestamp seconds */
  estimatedTimeOfArrival: number;

  /** The weight predicted at the point, in pounds */
  fob: number;

  /** The altitude predicted at this point, in metres */
  altitude: number;

  /** The predicted leg speed. */
  speed: number;

  /** Whether or not the speed is a mach or CAS value. */
  isSpeedMach: boolean;

  /** The total duration of the leg in seconds. */
  duration: number;
}

/**
 * Predictions that have been serialized into JSON and back, causing NaN to become null.
 */
export interface SyncedPredictions {
  /** A string identifier associated with this prediction */
  ident: string;

  /** The location of this point */
  position: {
    /** The latitude, in degrees. */
    lat: number | null;

    /** The longitude, in degrees. */
    lon: number | null;
  };

  /** Whether the contents of this prediction are valid and up-to-date */
  valid: boolean;

  /** The distance to the point, in metres. Can be a mix of along-path and great-circle distance based on the available data. */
  distance: number | null;

  /** The estimated time of arrival, in UNIX timestamp seconds */
  estimatedTimeOfArrival: number | null;

  /** The weight predicted at the point, in pounds */
  fob: number | null;

  /** The altitude predicted at this point, in metres */
  altitude: number | null;

  /** The predicted leg speed. */
  speed: number | null;

  /** Whether or not the speed is a mach or CAS value. */
  isSpeedMach: boolean | null;

  /** The total duration of the leg in seconds. */
  duration: number | null;
}

/**
 * Interface for a system providing performance predictions for a flight plan and optional arbitrary facility entries
 */
export interface FlightPlanPredictionsProvider {
  /**
   * Returns a predictions generator starting at the provided leg index
   *
   * @param startGlobalLegIndex the leg index at which to start producing predictions at (defaults to 0)
   */
  iteratePredictions(startGlobalLegIndex?: number): Generator<Predictions | undefined, void, unknown>;

  /**
   * Returns a predictions generator starting at the provided leg index, going backwards
   *
   * @param startGlobalLegIndex the leg index at which to start producing predictions at (defaults to plan.length - 1)
   */
  iteratePredictionsReverse(startGlobalLegIndex?: number): Generator<Predictions | undefined, void, unknown>;

  /**
   * Returns predictions for a leg located at a given global index
   *
   * **Note:** The object reference returned by this method is not safe to keep around or mutate.
   *
   * @param globalLegIndex the global leg index
   *
   * @returns a {@link Predictions} object
   */
  getPredictionsForLeg(globalLegIndex: number): Readonly<Predictions> | undefined;

  /**
   * Returns predictions for the MAP leg, or the last leg of the flight plan (with great circle distance to the destination added) if
   * one does not exist
   *
   * **Note:** The object reference returned by this method is not safe to keep around or mutate.
   *
   * @returns a {@link Predictions} object
   */
  getDestinationPredictions(): Readonly<Predictions> | undefined;

  /**
   * Returns predictions for an already tracked arbitrary facility
   *
   * **Note:** The object reference returned by this method is not safe to keep around or mutate.
   *
   * @param id the tracking entry's unique ID
   *
   * @returns a {@link Predictions} object
   */
  getPredictionsForTrackedFacility(id: string): Readonly<Predictions> | undefined;

  /**
   * Starts tracking an arbitrary facility
   *
   * @param id a unique ID to retrieve predictions with
   * @param entry the facility tracking entry object
   */
  startTrackingFacility(id: string, entry: FacilityPredictionsTrackingEntry): void;

  /**
   * Stops tracking an arbitrary facility
   *
   * @param id the tracking entry's unique ID
   *
   * @returns whether any tracking entry was removed
   */
  stopTrackingFacility(id: string): boolean;

  /**
   * Returns a prediction at the point at which the given time will be reached
   *
   * **Note:** The object reference returned by this method is not safe to keep around or mutate.
   *
   * @param time the time used to predict the distance, in UNIX timestamp seconds
   *
   * @returns a {@link Predictions} object, or `undefined` if no prediction is
   * available (for example, if the time will never be reached)
   */
  getPredictionsForTime(time: number): Readonly<Predictions> | undefined;

  /**
   * Returns a prediction at the point at which the given altitude will be reached
   *
   * **Note:** The object reference returned by this method is not safe to keep around or mutate.
   *
   * @param altitude the altitude used to predict the time, in metres
   *
   * @returns a {@link Predictions} object, or `undefined` if no prediction is
   * available (for example, if the altitude will never be reached)
   **/
  getPredictionsForAltitude(altitude: number): Readonly<Predictions> | undefined;

  /**
   * Returns a prediction at the point at which the given distance (along track from aircraft present position) will be reached
   *
   * **Note:** The object reference returned by this method is not safe to keep around or mutate.
   *
   * @param distance the distance used to predict the time, in metres
   *
   * @returns a {@link Predictions} object, or `undefined` if no prediction is
   * available (for example, if the distance will never be reached)
   **/
  getPredictionsForDistance(distance: number): Readonly<Predictions> | undefined;

  /**
   * Fires when any predictions have been updated.
   */
  readonly onPredictionsUpdated: SubEventInterface<this, void>;
}
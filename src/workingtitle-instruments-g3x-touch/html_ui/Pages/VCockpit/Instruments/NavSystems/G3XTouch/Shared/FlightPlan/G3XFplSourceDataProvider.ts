import { FlightPlanner, Subscribable } from '@microsoft/msfs-sdk';

import { Fms } from '@microsoft/msfs-garminsdk';

import { G3XExternalNavigatorIndex } from '../CommonTypes';
import { G3XFplSource } from './G3XFplSourceTypes';

/**
 * A definition describing a flight plan source.
 */
export type G3XFplSourceDataProviderSourceDef = {
  /** The index of the flight plan source's parent external navigator, or `undefined` if the source is an internal source. */
  externalNavigatorIndex?: number;

  /** The Garmin FMS instance associated with the flight plan source. */
  fms: Fms;

  /** The index of the LNAV instance associated with the flight plan source. */
  lnavIndex: number;

  /** The index of the VNAV instance associated with the flight plan source. */
  vnavIndex: number;

  /** The ID of the CDI associated with the flight plan source. */
  cdiId: string;
};

/**
 * A provider of data related to flight plan source.
 */
export interface G3XFplSourceDataProvider {
  /** The definition describing the internal flight plan source. */
  readonly internalSourceDef: Readonly<G3XFplSourceDataProviderSourceDef>;

  /**
   * Definitions describing the external flight plan sources. The index of each definition corresponds to the index
   * of the source's parent external navigator.
   */
  readonly externalSourceDefs: readonly (Readonly<G3XFplSourceDataProviderSourceDef> | undefined)[];

  /** The number of supported external flight plan sources. */
  readonly externalSourceCount: 0 | 1 | 2;

  /** The current flight plan source. */
  readonly source: Subscribable<G3XFplSource>;

  /**
   * The index of the current flight plan source's parent navigator. An index of zero represents the internal GPS
   * navigator. Otherwise, the index is the external navigator index.
   */
  readonly navigatorIndex: Subscribable<0 | G3XExternalNavigatorIndex>;

  /** The FMS associated with the current flight plan source. */
  readonly fms: Subscribable<Fms>;

  /** The ID of the FMS associated with the current flight plan source. */
  readonly fmsId: Subscribable<string>;

  /** The flight planner associated with the current flight plan source. */
  readonly flightPlanner: Subscribable<FlightPlanner>;

  /** The index of the LNAV instance associated with the current flight plan source. */
  readonly lnavIndex: Subscribable<number>;

  /** The index of the VNAV instance associated with the current flight plan source. */
  readonly vnavIndex: Subscribable<number>;

  /** The ID of the CDI associated with the current flight plan source. */
  readonly cdiId: Subscribable<string>;
}

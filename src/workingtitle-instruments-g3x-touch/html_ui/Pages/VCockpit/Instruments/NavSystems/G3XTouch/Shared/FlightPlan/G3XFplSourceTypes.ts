import { G3XExternalNavigatorIndex } from '../CommonTypes';

/**
 * G3X Touch flight plan sources.
 */
export enum G3XFplSource {
  /** The internal flight plan source is selected and in use. */
  Internal = 'Internal',

  /** The internal flight plan source is in use as a reversion due to unavailability of the external flight plan source. */
  InternalRev = 'InternalRev',

  /** The external flight plan source is selected and the first external source is in use. */
  External1 = 'External1',

  /** The external flight plan source is selected and the second external source is in use. */
  External2 = 'External2'
}

/**
 * Valid indexes for G3X Touch external flight plan sources.
 */
export type G3XExternalFplSourceIndex = G3XExternalNavigatorIndex;

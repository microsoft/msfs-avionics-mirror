import { EspData } from './EspTypes';

/**
 * A provider of Garmin ESP data.
 */
export interface EspDataProvider {
  /** The current ESP data. */
  readonly data: Readonly<EspData>;
}

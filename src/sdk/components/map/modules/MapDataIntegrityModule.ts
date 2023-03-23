import { Subject } from '../../../sub/Subject';

/**
 * A map module describing whether or not various signals are valid.
 */
export class MapDataIntegrityModule {
  /** Whether GPS position data is valid. */
  public readonly gpsSignalValid = Subject.create<boolean>(false);

  /** Whether heading data is valid. */
  public readonly headingSignalValid = Subject.create<boolean>(false);

  /** Whether attitude data is valid. */
  public readonly attitudeSignalValid = Subject.create<boolean>(false);

  /** Whether ADC data is valid. */
  public readonly adcSignalValid = Subject.create<boolean>(false);
}
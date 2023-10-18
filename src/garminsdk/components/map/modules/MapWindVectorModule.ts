import { Subject } from '@microsoft/msfs-sdk';
import { WindDataProvider } from '../../../wind/WindDataProvider';

/**
 * A module describing the wind vector.
 */
export class MapWindVectorModule {
  /** Whether to show the wind vector. */
  public readonly show = Subject.create(false);

  /** The current wind direction, in degrees true. */
  public readonly windDirection = this.dataProvider.windDirection;

  /** The current wind speed, in knots. */
  public readonly windSpeed = this.dataProvider.windSpeed;

  /** Whether wind data is in a failed state. */
  public readonly isDataFailed = this.dataProvider.isDataFailed;

  /**
   * Creates a new instance of MapWindModule.
   * @param dataProvider A provider of wind data.
   */
  public constructor(private readonly dataProvider: WindDataProvider) {
  }
}
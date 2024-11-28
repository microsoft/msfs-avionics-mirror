import { Subscribable } from '@microsoft/msfs-sdk';

/**
 * A data provider for an altimeter.
 */
export interface AltimeterDataProvider {
  /** The current indicated altitude, in feet. */
  readonly indicatedAlt: Subscribable<number>;

  /** The current indicated altitude trend, in feet. */
  readonly altitudeTrend: Subscribable<number>;

  /** The current barometric pressure setting, in inches of mercury. */
  readonly baroSetting: Subscribable<number>;

  /** Whether STD BARO mode is active. */
  readonly baroIsStdActive: Subscribable<boolean>;

  /** The current preselected barometric pressure setting, in inches of mercury. */
  readonly baroPreselect: Subscribable<number>;

  /** The current selected altitude, or `null` if no such value exists. */
  readonly selectedAlt: Subscribable<number | null>;

  /** The current active minimums, in feet indicated altitude, or `null` if no such value exists. */
  readonly minimums: Subscribable<number | null>;

  /** The current radar altitude, in feet, or `null` if there is no valid radar altitude. */
  readonly radarAlt: Subscribable<number | null>;

  /** Whether altitude data is in a failure state. */
  readonly isDataFailed: Subscribable<boolean>;
}

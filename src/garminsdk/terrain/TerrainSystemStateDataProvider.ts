import { Subscribable, SubscribableSet } from '@microsoft/msfs-sdk';

import { TerrainSystemOperatingMode } from './TerrainSystemTypes';

/**
 * A provider of Garmin terrain alerting system state data.
 */
export interface TerrainSystemStateDataProvider {
  /** The terrain system's type, or `undefined` if the type is not yet known. */
  readonly type: Subscribable<string | undefined>;

  /** The terrain system's current operating mode. */
  readonly operatingMode: Subscribable<TerrainSystemOperatingMode>;

  /** The terrain system's active status flags. */
  readonly statusFlags: SubscribableSet<string>;

  /** The terrain system's active inhibit flags. */
  readonly inhibitFlags: SubscribableSet<string>;

  /** The terrain system's active alerts. */
  readonly activeAlerts: SubscribableSet<string>;

  /** The terrain system's current prioritized active alert. */
  readonly prioritizedAlert: Subscribable<string | null>;
}

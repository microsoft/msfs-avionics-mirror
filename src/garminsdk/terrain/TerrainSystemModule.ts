import { TerrainSystemAlertController, TerrainSystemData, TerrainSystemOperatingMode } from './TerrainSystemTypes';

/**
 * A module for a Garmin terrain alerting system. Modules are attached to a parent system, which update the modules and
 * provide them with data.
 */
export interface TerrainSystemModule {
  /**
   * A method that is called when this module is attached to an initialized system, or when this module's parent
   * system is initialized.
   */
  onInit(): void;

  /**
   * A method that is called every time this module's parent system is updated.
   * @param operatingMode The parent system's current operating mode.
   * @param inhibits The parent system's currently active inhibits.
   * @param data The data provided by the parent system.
   * @param realTime The current real (operating system) time, as a Javascript timestamp.
   * @param simRate The current simulation rate factor.
   * @param simTime The current sim time, as a Javascript timestamp.
   * @param alertController A controller for alerts issued by the parent system.
   */
  onUpdate(
    operatingMode: TerrainSystemOperatingMode,
    statuses: ReadonlySet<string>,
    inhibits: ReadonlySet<string>,
    data: Readonly<TerrainSystemData>,
    alertController: TerrainSystemAlertController,
  ): void;

  /**
   * A method that is called when this module's parent system is destroyed.
   */
  onDestroy(): void;
}

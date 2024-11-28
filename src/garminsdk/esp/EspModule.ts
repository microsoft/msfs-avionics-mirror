import { EspData, EspForceController, EspOperatingMode } from './EspTypes';

/**
 * A module for a Garmin electronic stability and protection (ESP) system. Modules are attached to a parent system,
 * which update the modules and provide them with data.
 */
export interface EspModule {
  /** This module's ID. */
  readonly id: string;

  /**
   * Checks if this module is engaged.
   * @returns Whether this module is engaged.
   */
  isEngaged(): boolean;

  /**
   * A method that is called when this module is attached to an initialized system, or when this module's parent
   * system is initialized.
   */
  onInit(): void;

  /**
   * A method that is called every time this module's parent system is updated.
   * @param operatingMode The parent system's current operating mode.
   * @param data The data provided by the parent system.
   * @param forceController A controller for control axis forces applied by the parent system.
   */
  onUpdate(
    operatingMode: EspOperatingMode,
    data: Readonly<EspData>,
    forceController: EspForceController,
  ): void;

  /**
   * A method that is called when this module's parent system is paused.
   */
  onPause(): void;

  /**
   * A method that is called when this module's parent system is destroyed.
   */
  onDestroy(): void;
}

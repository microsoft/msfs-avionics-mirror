import { SimVarValueType } from '@microsoft/msfs-sdk';

import { Config } from '../../Config/Config';
import { ConfigUtils } from '../../Config/ConfigUtils';

/**
 * A configuration object which defines options related to persistent user settings.
 */
export class PersistentUserSettingsConfig implements Config {
  /** Whether to disable persistent user settings. */
  public readonly disablePersistentSettings: boolean;

  /** The aircraft key under which persistent user settings are saved. */
  public readonly aircraftKey: string;

  /**
   * Creates a new PersistentUserSettingsConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element | undefined) {
    if (element === undefined) {
      this.disablePersistentSettings = false;
      this.aircraftKey = SimVar.GetSimVarValue('ATC MODEL', SimVarValueType.String);
    } else {
      if (element.tagName !== 'PersistentUserSettings') {
        throw new Error(`Invalid PersistentUserSettingsConfig definition: expected tag name 'PersistentUserSettings' but was '${element.tagName}'`);
      }

      const disablePersistentSettings = ConfigUtils.parseBoolean(element.getAttribute('disable'), false);
      if (disablePersistentSettings === undefined) {
        console.warn('Invalid PersistentUserSettingsConfig definition: unrecognized "disable" option (expected "true" or "false"). Defaulting to false.');
        this.disablePersistentSettings = false;
      } else {
        this.disablePersistentSettings = disablePersistentSettings;
      }

      const aircraftKeyElement = element.querySelector(':scope>AircraftKey');
      if (aircraftKeyElement) {
        const aircraftKey = aircraftKeyElement.textContent?.trim();
        if (!aircraftKey) {
          this.aircraftKey = SimVar.GetSimVarValue('ATC MODEL', SimVarValueType.String);
          console.warn(`Invalid PersistentUserSettingsConfig definition: unsupported aircraft key (cannot be the empty string). Defaulting to ATC MODEL (${this.aircraftKey})`);
        } else {
          this.aircraftKey = aircraftKey;
        }
      } else {
        this.aircraftKey = SimVar.GetSimVarValue('ATC MODEL', SimVarValueType.String);
      }
    }
  }
}

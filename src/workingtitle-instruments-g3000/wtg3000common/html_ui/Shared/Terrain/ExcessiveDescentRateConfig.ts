import { EventBus } from '@microsoft/msfs-sdk';

import {
  Fms, GarminExcessiveDescentRateModule, GarminTawsAlert, GarminTawsInhibit, TerrainSystemModule, TerrainSystemType
} from '@microsoft/msfs-garminsdk';

import { G3000FlightPlannerId } from '../CommonTypes';
import { G3000TerrainSystemType } from './G3000TerrainSystemTypes';
import {
  TerrainSystemModuleConfig, TerrainSystemModuleInhibitFlagDef, TerrainSystemModulePrimaryInhibitFlagDef
} from './TerrainSystemModuleConfig';

/**
 * A configuration object which defines options related to excessive descent rate (EDR) alerts.
 */
export class ExcessiveDescentRateConfig implements TerrainSystemModuleConfig {
  /** @inheritDoc */
  public readonly isResolvableConfig = true;

  /** @inheritDoc */
  public readonly primaryInhibitFlagDefs: Readonly<TerrainSystemModulePrimaryInhibitFlagDef>[] = [];

  /** @inheritDoc */
  public readonly secondaryInhibitFlagDefs: Readonly<TerrainSystemModuleInhibitFlagDef>[] = [];

  /** Whether alerting should function as a GPWS alert. */
  public readonly functionAsGpws: boolean;

  /**
   * Creates a new ExcessiveDescentRateConfig.
   * @param type The terrain system type for which to create the configuration object.
   * @param element A configuration document element from which to parse options. If not defined, then default options
   * based on the terrain system type will be used.
   */
  public constructor(type: G3000TerrainSystemType, element?: Element) {
    this.functionAsGpws = type === TerrainSystemType.TawsA;

    if (element) {
      if (element.tagName !== 'Edr') {
        throw new Error(`Invalid ExcessiveDescentRateConfig definition: expected tag name 'Edr' but was '${element.tagName}'`);
      }

      const functionAsGpws = element.getAttribute('gpws')?.toLowerCase();
      switch (functionAsGpws) {
        case 'true':
          this.functionAsGpws = true;
          break;
        case 'false':
          this.functionAsGpws = false;
          break;
        case undefined:
          break;
        default:
          console.warn(`ExcessiveDescentRateConfig: unrecognized "gpws" option (must be "true" or "false"). Defaulting to "${this.functionAsGpws}".`);
      }
    }

    if (this.functionAsGpws) {
      this.primaryInhibitFlagDefs.push({
        alerts: [GarminTawsAlert.EdrWarning, GarminTawsAlert.EdrCaution],
        inhibitFlag: GarminTawsInhibit.Gpws,
        settingsPageUid: GarminTawsInhibit.Gpws,
        settingsPageLabelText: 'GPWS\nInhibit',
        settingsPagePriority: -1,
        onlyToggleWhenTriggered: false,
        alertPopupLabel: 'Inhibit GPWS'
      });
    }
  }

  /** @inheritDoc */
  public resolve(): (bus: EventBus, fms: Fms<G3000FlightPlannerId>) => TerrainSystemModule {
    return (): TerrainSystemModule => {
      return new GarminExcessiveDescentRateModule({
        functionAsGpws: this.functionAsGpws,
        inhibitFlags: this.functionAsGpws ? [GarminTawsInhibit.Gpws] : undefined
      });
    };
  }
}

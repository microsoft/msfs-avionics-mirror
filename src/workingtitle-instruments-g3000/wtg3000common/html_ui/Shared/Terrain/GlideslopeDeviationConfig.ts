import { EventBus } from '@microsoft/msfs-sdk';

import {
  Fms, GarminGlideslopeDeviationModule, GarminTawsAlert, GarminTawsInhibit, TerrainSystemModule, TerrainSystemType
} from '@microsoft/msfs-garminsdk';

import { G3000FlightPlannerId } from '../CommonTypes';
import { G3000TerrainSystemType } from './G3000TerrainSystemTypes';
import {
  TerrainSystemModuleConfig, TerrainSystemModuleInhibitFlagDef, TerrainSystemModulePrimaryInhibitFlagDef
} from './TerrainSystemModuleConfig';

/**
 * A configuration object which defines options related to glideslope/glidepath deviation (GSD) alerts.
 */
export class GlideslopeDeviationConfig implements TerrainSystemModuleConfig {
  /** @inheritDoc */
  public readonly isResolvableConfig = true;

  /** @inheritDoc */
  public readonly primaryInhibitFlagDefs: Readonly<TerrainSystemModulePrimaryInhibitFlagDef>[] = [];

  /** @inheritDoc */
  public readonly secondaryInhibitFlagDefs: Readonly<TerrainSystemModuleInhibitFlagDef>[] = [];

  /** Whether alerting should function as a GPWS alert. */
  public readonly functionAsGpws: boolean;

  /**
   * Creates a new GlideslopeDeviationConfig.
   * @param type The terrain system type for which to create the configuration object.
   * @param element A configuration document element from which to parse options. If not defined, then default options
   * based on the terrain system type will be used.
   */
  public constructor(type: G3000TerrainSystemType, element?: Element) {
    this.functionAsGpws = type === TerrainSystemType.TawsA;

    if (element) {
      if (element.tagName !== 'Gsd') {
        throw new Error(`Invalid GlideslopeDeviationConfig definition: expected tag name 'Gsd' but was '${element.tagName}'`);
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

    this.primaryInhibitFlagDefs.push(
      {
        alerts: [GarminTawsAlert.GsdGlideslopeCaution],
        inhibitFlag: GarminTawsInhibit.GsdGlideslope,
        settingsPageUid: 'TawsGsd',
        settingsPageLabelText: 'GS/GP\nInhibit',
        settingsPagePriority: -2,
        onlyToggleWhenTriggered: true,
        alertPopupLabel: 'Inhibit GS/GP'
      },
      {
        alerts: [GarminTawsAlert.GsdGlidepathCaution],
        inhibitFlag: GarminTawsInhibit.GsdGlidepath,
        settingsPageUid: 'TawsGsd',
        settingsPageLabelText: 'GS/GP\nInhibit',
        settingsPagePriority: -2,
        onlyToggleWhenTriggered: true,
        alertPopupLabel: 'Inhibit GS/GP'
      }
    );
  }

  /** @inheritDoc */
  public resolve(): (bus: EventBus, fms: Fms<G3000FlightPlannerId>) => TerrainSystemModule {
    return (): TerrainSystemModule => {
      return new GarminGlideslopeDeviationModule({
        functionAsGpws: this.functionAsGpws,
        glideslopeInhibitFlags: [GarminTawsInhibit.GsdGlideslope],
        glidepathInhibitFlags: [GarminTawsInhibit.GsdGlidepath]
      });
    };
  }
}

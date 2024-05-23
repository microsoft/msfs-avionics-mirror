import { EventBus } from '@microsoft/msfs-sdk';

import { Fms, GarminNegativeClimbRateModule, GarminTawsInhibit, TerrainSystemModule, TerrainSystemType } from '@microsoft/msfs-garminsdk';

import { G3000FlightPlannerId } from '../CommonTypes';
import { G3000TerrainSystemType } from './G3000TerrainSystemTypes';
import { TerrainSystemModuleConfig } from './TerrainSystemModuleConfig';

/**
 * A configuration object which defines options related to negative climb rate after takeoff (NCR) alerts.
 */
export class NegativeClimbRateConfig implements TerrainSystemModuleConfig {
  /** @inheritDoc */
  public readonly isResolvableConfig = true;

  /** Whether alerting should function as a GPWS alert. */
  public readonly functionAsGpws: boolean;

  /**
   * Creates a new NegativeClimbRateConfig.
   * @param type The terrain system type for which to create the configuration object.
   * @param element A configuration document element from which to parse options. If not defined, then default options
   * based on the terrain system type will be used.
   */
  public constructor(type: G3000TerrainSystemType, element?: Element) {

    this.functionAsGpws = type === TerrainSystemType.TawsA;
    if (element) {
      if (element.tagName !== 'Ncr') {
        throw new Error(`Invalid NegativeClimbRateConfig definition: expected tag name 'Ncr' but was '${element.tagName}'`);
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
          console.warn(`NegativeClimbRateConfig: unrecognized "gpws" option (must be "true" or "false"). Defaulting to "${this.functionAsGpws}".`);
      }
    }
  }

  /** @inheritDoc */
  public resolve(): (bus: EventBus, fms: Fms<G3000FlightPlannerId>) => TerrainSystemModule {
    return (): TerrainSystemModule => {
      return new GarminNegativeClimbRateModule({
        functionAsGpws: this.functionAsGpws,
        inhibitFlags: this.functionAsGpws ? [GarminTawsInhibit.Gpws] : undefined
      });
    };
  }
}

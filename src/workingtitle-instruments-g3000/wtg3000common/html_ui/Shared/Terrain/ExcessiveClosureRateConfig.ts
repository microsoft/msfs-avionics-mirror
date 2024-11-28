import { EventBus } from '@microsoft/msfs-sdk';

import {
  Fms, GarminExcessiveClosureRateModule, GarminTawsAlert, GarminTawsInhibit, TerrainSystemModule, TerrainSystemType
} from '@microsoft/msfs-garminsdk';

import { G3000FlightPlannerId } from '../CommonTypes';
import { G3000TerrainSystemType } from './G3000TerrainSystemTypes';
import {
  TerrainSystemModuleConfig, TerrainSystemModuleInhibitFlagDef, TerrainSystemModulePrimaryInhibitFlagDef
} from './TerrainSystemModuleConfig';

/**
 * A configuration object which defines options related to excessive closure rate (ECR) alerts.
 */
export class ExcessiveClosureRateConfig implements TerrainSystemModuleConfig {
  /** @inheritDoc */
  public readonly isResolvableConfig = true;

  /** @inheritDoc */
  public readonly primaryInhibitFlagDefs: Readonly<TerrainSystemModulePrimaryInhibitFlagDef>[] = [];

  /** @inheritDoc */
  public readonly secondaryInhibitFlagDefs: Readonly<TerrainSystemModuleInhibitFlagDef>[] = [];

  /** Whether alerting should function as a GPWS alert. */
  public readonly functionAsGpws: boolean;

  /** The flaps extension angle range, as `[min, max]` in degrees, that defines the landing flaps configuration. */
  public readonly flapsLandingAngle: readonly [number, number];

  /**
   * Creates a new ExcessiveClosureRateConfig.
   * @param type The terrain system type for which to create the configuration object.
   * @param element A configuration document element from which to parse options. If not defined, then default options
   * based on the terrain system type will be used.
   */
  public constructor(type: G3000TerrainSystemType, element?: Element) {
    this.functionAsGpws = type === TerrainSystemType.TawsA;
    this.flapsLandingAngle = [Infinity, Infinity];

    if (element) {
      if (element.tagName !== 'Ecr') {
        throw new Error(`Invalid ExcessiveClosureRateConfig definition: expected tag name 'Ecr' but was '${element.tagName}'`);
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
          console.warn(`ExcessiveClosureRateConfig: unrecognized "gpws" option (must be "true" or "false"). Defaulting to "${this.functionAsGpws}".`);
      }

      const flapsLandingAngleMin = Number(element.getAttribute('flaps-landing-min') ?? -Infinity);
      const flapsLandingAngleMax = Number(element.getAttribute('flaps-landing-max') ?? Infinity);

      if (isNaN(flapsLandingAngleMin)) {
        console.warn('ExcessiveClosureRateConfig: unrecognized "flaps-landing-min" option (must be a number)');
      }
      if (isNaN(flapsLandingAngleMax)) {
        console.warn('ExcessiveClosureRateConfig: unrecognized "flaps-landing-max" option (must be a number)');
      }

      if (isFinite(flapsLandingAngleMin) || isFinite(flapsLandingAngleMax)) {
        this.flapsLandingAngle = [
          isNaN(flapsLandingAngleMin) ? -Infinity : flapsLandingAngleMin,
          isNaN(flapsLandingAngleMax) ? Infinity : flapsLandingAngleMax
        ];
      }
    }

    if (this.functionAsGpws) {
      this.primaryInhibitFlagDefs.push({
        alerts: [GarminTawsAlert.EcrWarning, GarminTawsAlert.EcrCaution],
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
      return new GarminExcessiveClosureRateModule({
        functionAsGpws: this.functionAsGpws,
        forceNoFlta: true,
        flapsLandingAngle: this.flapsLandingAngle,
        inhibitFlags: this.functionAsGpws ? [GarminTawsInhibit.Gpws] : undefined
      });
    };
  }
}

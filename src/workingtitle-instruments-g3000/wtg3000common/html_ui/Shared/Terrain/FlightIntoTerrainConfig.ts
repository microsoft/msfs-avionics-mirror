import { EventBus } from '@microsoft/msfs-sdk';

import {
  Fms, GarminFlightIntoTerrainModule, GarminTawsAlert, GarminTawsInhibit, TerrainSystemModule, TerrainSystemType
} from '@microsoft/msfs-garminsdk';

import { G3000FlightPlannerId } from '../CommonTypes';
import { G3000TerrainSystemType } from './G3000TerrainSystemTypes';
import {
  TerrainSystemModuleConfig, TerrainSystemModuleInhibitFlagDef, TerrainSystemModulePrimaryInhibitFlagDef
} from './TerrainSystemModuleConfig';
import { ConfigUtils } from '../Config/ConfigUtils';

/**
 * A configuration object which defines options related to flight into terrain (FIT) alerts.
 */
export class FlightIntoTerrainConfig implements TerrainSystemModuleConfig {
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

  /** The maximum allowed indicated airspeed with flaps extended to landing configuration, in knots. */
  public readonly vfeLanding: number;

  /**
   * Creates a new FlightIntoTerrainConfig.
   * @param type The terrain system type for which to create the configuration object.
   * @param element A configuration document element from which to parse options.
   */
  public constructor(type: G3000TerrainSystemType, element: Element) {
    this.functionAsGpws = type === TerrainSystemType.TawsA;

    if (element.tagName !== 'Fit') {
      throw new Error(`Invalid FlightIntoTerrainConfig definition: expected tag name 'Fit' but was '${element.tagName}'`);
    }

    const functionAsGpws = ConfigUtils.parseBoolean(element.getAttribute('gpws'), this.functionAsGpws);
    if (functionAsGpws === undefined) {
      console.warn(`FlightIntoTerrainConfig: unrecognized "gpws" option (must be "true" or "false"). Defaulting to "${this.functionAsGpws}".`);
    } else {
      this.functionAsGpws = functionAsGpws;
    }

    const flapsLandingAngleMin = ConfigUtils.parseNumber(element.getAttribute('flaps-landing-min'));
    if (flapsLandingAngleMin === undefined) {
      console.warn('FlightIntoTerrainConfig: unrecognized "flaps-landing-min" option (must be a number)');
    }

    const flapsLandingAngleMax = ConfigUtils.parseNumber(element.getAttribute('flaps-landing-max'));
    if (flapsLandingAngleMax === undefined) {
      console.warn('FlightIntoTerrainConfig: unrecognized "flaps-landing-max" option (must be a number)');
    }

    if (typeof flapsLandingAngleMin === 'number' || typeof flapsLandingAngleMax === 'number') {
      this.flapsLandingAngle = [flapsLandingAngleMin ?? -Infinity, flapsLandingAngleMax ?? Infinity];
    } else {
      throw new Error('FlightIntoTerrainConfig: neither "flaps-landing-min" nor "flaps-landing-max" option is defined');
    }

    const vfeLanding = ConfigUtils.parseNumber(element.getAttribute('vfe-landing'));
    if (vfeLanding === null || vfeLanding === undefined) {
      throw new Error('FlightIntoTerrainConfig: missing or unrecognized "vfe-landing" option (must be a number)');
    } else {
      this.vfeLanding = vfeLanding;
    }

    if (this.functionAsGpws) {
      this.primaryInhibitFlagDefs.push({
        alerts: [
          GarminTawsAlert.FitTerrainCaution,
          GarminTawsAlert.FitTerrainGearCaution,
          GarminTawsAlert.FitTerrainFlapsCaution,
          GarminTawsAlert.FitGearCaution,
          GarminTawsAlert.FitFlapsCaution,
          GarminTawsAlert.FitTakeoffCaution,
        ],
        inhibitFlag: GarminTawsInhibit.Gpws,
        settingsPageUid: GarminTawsInhibit.Gpws,
        settingsPageLabelText: 'GPWS\nInhibit',
        settingsPagePriority: -1,
        onlyToggleWhenTriggered: false,
        alertPopupLabel: 'Inhibit GPWS',
      });
    }

    this.secondaryInhibitFlagDefs.push({
      alerts: [
        GarminTawsAlert.FitTerrainFlapsCaution,
        GarminTawsAlert.FitFlapsCaution,
      ],
      inhibitFlag: GarminTawsInhibit.FitFlaps,
      settingsPageUid: GarminTawsInhibit.FitFlaps,
      settingsPageLabelText: 'Flap\nOverride',
      settingsPagePriority: -3,
      onlyToggleWhenTriggered: false,
    });
  }

  /** @inheritDoc */
  public resolve(): (bus: EventBus, fms: Fms<G3000FlightPlannerId>) => TerrainSystemModule {
    return (): TerrainSystemModule => {
      return new GarminFlightIntoTerrainModule({
        functionAsGpws: this.functionAsGpws,
        flapsLandingAngle: this.flapsLandingAngle,
        vfeLanding: this.vfeLanding,
        inhibitFlags: this.functionAsGpws ? [GarminTawsInhibit.Gpws] : undefined,
        flapsInhibitFlags: [GarminTawsInhibit.FitFlaps],
      });
    };
  }
}

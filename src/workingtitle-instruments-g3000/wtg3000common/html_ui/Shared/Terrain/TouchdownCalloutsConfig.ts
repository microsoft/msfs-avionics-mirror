import { EventBus } from '@microsoft/msfs-sdk';

import { Fms, GarminTawsVoiceCalloutAltitude, GarminVoiceCalloutModule, TerrainSystemModule } from '@microsoft/msfs-garminsdk';

import { G3000FlightPlannerId } from '../CommonTypes';
import { TerrainSystemModuleConfig, TerrainSystemModuleInhibitFlagDef, TerrainSystemModulePrimaryInhibitFlagDef } from './TerrainSystemModuleConfig';
import { G3000TerrainSystemType } from './G3000TerrainSystemTypes';

/**
 * Options for a single touchdown callout.
 */
export type TouchdownCalloutOptions = {
  /** The callout's altitude, in feet. */
  altitude: GarminTawsVoiceCalloutAltitude;

  /** Whether the callout is enabled by default. */
  enabled: boolean;

  /** Whether the callout can be enabled and disabled by the user. */
  userConfigurable: boolean;
};

/**
 * A configuration object which defines options related to touchdown callouts.
 */
export class TouchdownCalloutsConfig implements TerrainSystemModuleConfig {
  /** @inheritDoc */
  public readonly isResolvableConfig = true;

  /** @inheritDoc */
  public readonly primaryInhibitFlagDefs: Readonly<TerrainSystemModulePrimaryInhibitFlagDef>[] = [];

  /** @inheritDoc */
  public readonly secondaryInhibitFlagDefs: Readonly<TerrainSystemModuleInhibitFlagDef>[] = [];

  /** Whether to inhibit the 500-feet callout when the autopilot's GS or GP mode is active. */
  public readonly inhibit500WhenGsGpActive: boolean;

  /** Whether at least one callout is user-configurable. */
  public readonly isUserConfigurable: boolean;

  /** Options for each callout. */
  public readonly options: Readonly<Record<GarminTawsVoiceCalloutAltitude, Readonly<TouchdownCalloutOptions>>>;

  /**
   * Creates a new TouchdownCalloutsConfig using default options for a given terrain system type.
   * @param type The terrain system type for which to create the configuration object.
   * @param element A configuration document element. If not defined, then default options will be used.
   */
  public constructor(type: G3000TerrainSystemType, element?: Element) {
    if (element !== undefined && element.tagName !== 'TouchdownCallouts') {
      throw new Error(`Invalid TouchdownCalloutsConfig definition: expected tag name 'TouchdownCallouts' but was '${element.tagName}'`);
    }

    const inhibit500WhenGsGpActive = element?.getAttribute('inhibit-500-gs-gp')?.toLowerCase();
    switch (inhibit500WhenGsGpActive) {
      case 'true':
        this.inhibit500WhenGsGpActive = true;
        break;
      case 'false':
      case undefined:
        this.inhibit500WhenGsGpActive = false;
        break;
      default:
        console.warn('TouchdownCalloutsConfig: unrecognized "inhibit-500-gs-gp" option (must be "true" or "false"). Defaulting to "false".');
        this.inhibit500WhenGsGpActive = false;
    }

    let isUserConfigurable = false;

    const options: Record<GarminTawsVoiceCalloutAltitude, TouchdownCalloutOptions> = {} as any;
    for (const altitude of [500, 450, 400, 350, 300, 250, 200, 150, 100, 50, 40, 30, 20, 10] as const) {
      options[altitude] = {
        altitude,
        enabled: false,
        userConfigurable: false
      };
    }

    this.options = this.parseOptions(element, options);

    for (const option of Object.values(this.options)) {
      if (option.userConfigurable) {
        isUserConfigurable = true;
        break;
      }
    }

    this.isUserConfigurable = isUserConfigurable;
  }

  /**
   * Parses callout options from a configuration document element.
   * @param element A configuration document element.
   * @param options The object to which to write the parsed options.
   * @returns The callout options defined by the configuration document element.
   */
  private parseOptions(
    element: Element | undefined,
    options: Record<GarminTawsVoiceCalloutAltitude, TouchdownCalloutOptions>
  ): Record<GarminTawsVoiceCalloutAltitude, TouchdownCalloutOptions> {
    if (element === undefined) {
      return options;
    }

    for (const calloutElement of element.querySelectorAll(':scope>Callout')) {
      if (calloutElement.textContent === null) {
        console.warn('TouchdownCalloutsConfig: missing callout altitude. Discarding callout.');
        continue;
      }

      const altitude = Number(calloutElement.textContent);
      const option = (options as Partial<Record<number, TouchdownCalloutOptions>>)[altitude];

      if (!option) {
        console.warn(`TouchdownCalloutsConfig: unrecognized callout altitude: ${altitude}. Discarding callout`);
        continue;
      }

      let enabled: boolean;
      switch (calloutElement.getAttribute('enabled')?.toLowerCase()) {
        case 'true':
        case undefined:
          enabled = true;
          break;
        case 'false':
          enabled = false;
          break;
        default:
          console.warn('TouchdownCalloutsConfig: unrecognized callout "enabled" option (must be "true" or "false"). Defaulting to "true".');
          enabled = true;
      }

      let userConfigurable: boolean;
      switch (calloutElement.getAttribute('configurable')?.toLowerCase()) {
        case 'true':
          userConfigurable = true;
          break;
        case 'false':
        case undefined:
          userConfigurable = false;
          break;
        default:
          console.warn('TouchdownCalloutsConfig: unrecognized callout "configurable" option (must be "true" or "false"). Defaulting to "false".');
          userConfigurable = false;
      }

      option.enabled = enabled;
      option.userConfigurable = userConfigurable;
    }

    return options;
  }

  /** @inheritDoc */
  public resolve(): (bus: EventBus, fms: Fms<G3000FlightPlannerId>) => TerrainSystemModule {
    return (): TerrainSystemModule => {
      return new GarminVoiceCalloutModule({ inhibit500WhenGsGpActive: this.inhibit500WhenGsGpActive });
    };
  }
}

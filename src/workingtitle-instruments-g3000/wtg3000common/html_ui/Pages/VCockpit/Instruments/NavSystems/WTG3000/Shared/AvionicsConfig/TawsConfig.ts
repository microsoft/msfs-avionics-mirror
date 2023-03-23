import { Config } from '../Config/Config';
import { TouchdownCalloutAltitude } from '../TAWS/TouchdownCallout';

/**
 * A configuration object which defines options related to TAWS.
 */
export class TawsConfig implements Config {
  /** Options for touchdown callouts. */
  public readonly touchdownCallouts: TouchdownCalloutsConfig;

  /**
   * Creates a new TawsConfig from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   */
  constructor(baseInstrument: BaseInstrument, element: Element | undefined) {
    if (element === undefined) {
      this.touchdownCallouts = new TouchdownCalloutsConfig(undefined);
    } else {
      if (element.tagName !== 'Taws') {
        throw new Error(`Invalid TawsConfig definition: expected tag name 'Taws' but was '${element.tagName}'`);
      }

      this.touchdownCallouts = this.parseTouchdownCallouts(element.querySelector(':scope>TouchdownCallouts'));
    }
  }

  /**
   * Parses a touchdown callouts configuration object from a configuration document element.
   * @param element A configuration document element.
   * @returns The touchdown callouts configuration defined by the configuration document element.
   */
  private parseTouchdownCallouts(element: Element | null): TouchdownCalloutsConfig {
    if (element !== null) {
      try {
        return new TouchdownCalloutsConfig(element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new TouchdownCalloutsConfig(undefined);
  }
}

/**
 * Options for a single touchdown callout.
 */
export type TouchdownCalloutOptions = {
  /** The callout's altitude, in feet. */
  altitude: TouchdownCalloutAltitude;

  /** Whether the callout is enabled by default. */
  enabled: boolean;

  /** Whether the callout can be enabled and disabled by the user. */
  userConfigurable: boolean;
};

/**
 * A configuration object which defines options related to touchdown callouts.
 */
export class TouchdownCalloutsConfig implements Config {
  /** Whether at least one callout is user-configurable. */
  public readonly isUserConfigurable: boolean;

  /** Options for each callout. */
  public readonly options: Readonly<Record<TouchdownCalloutAltitude, Readonly<TouchdownCalloutOptions>>>;

  /**
   * Creates a new TouchdownCalloutsConfig from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element | undefined) {
    let isUserConfigurable = false;

    const options: Record<TouchdownCalloutAltitude, TouchdownCalloutOptions> = {} as any;
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
    options: Record<TouchdownCalloutAltitude, TouchdownCalloutOptions>
  ): Record<TouchdownCalloutAltitude, TouchdownCalloutOptions> {
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
}
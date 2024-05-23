import { TerrainSystemType } from '@microsoft/msfs-garminsdk';

import { Config } from '../Config/Config';
import { TouchdownCalloutsConfig } from '../Terrain/TouchdownCalloutsConfig';

/**
 * A configuration object which defines options related to TAWS.
 * @deprecated This class has been superceded by `TerrainSystemConfig`.
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
      this.touchdownCallouts = new TouchdownCalloutsConfig(TerrainSystemType.TawsB);
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
        return new TouchdownCalloutsConfig(TerrainSystemType.TawsB, element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new TouchdownCalloutsConfig(TerrainSystemType.TawsB);
  }
}
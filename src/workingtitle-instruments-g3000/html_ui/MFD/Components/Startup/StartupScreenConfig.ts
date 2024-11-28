import { Config } from '@microsoft/msfs-wtg3000-common';

/**
 * A configuration object which defines options related to the MFD startup screen.
 */
export class StartupScreenConfig implements Config {
  /** The name of the airframe supported by performance calculations. */
  public readonly airplaneName: string;

  /** The path to the airplane logo image asset, or `undefined` if there is no airplane logo to display. */
  public readonly airplaneLogoFilePath?: string;

  /**
   * Creates a new StartupScreenConfig from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element) {
    if (element.tagName !== 'StartupScreen') {
      throw new Error(`Invalid StartupConfig definition: expected tag name 'StartupScreen' but was '${element.tagName}'`);
    }

    this.airplaneName = element.getAttribute('airplane') ?? '';
    this.airplaneLogoFilePath = element.getAttribute('logo-src') ?? undefined;
  }
}
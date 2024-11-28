import { DefaultConfigFactory } from '@microsoft/msfs-wtg3000-common';
import { StartupScreenConfig } from '../Components/Startup/StartupScreenConfig';

/**
 * A configuration object which defines options for the G3000 MFD.
 */
export class MfdConfig {
  private readonly factory = new DefaultConfigFactory();

  /** A config which defines options for the MFD startup screen. */
  public readonly startupScreen?: StartupScreenConfig;

  /**
   * Creates an MfdConfig from an XML configuration document.
   * @param xmlConfig An XML configuration document.
   * @param instrumentConfig The root element of the configuration document's section pertaining to the config's
   * instrument.
   */
  constructor(xmlConfig: Document, instrumentConfig: Element | undefined) {
    this.startupScreen = this.parseStartupScreenConfig(instrumentConfig);
  }

  /**
   * Parses a CAS display configuration object from a configuration document. This method looks in the
   * instrument-specific section first for a config definition. If none can be found or parsed without error, this
   * method will next look in the general section. If none can be found or parsed without error there either, this
   * method will return a default configuration object.
   * @param instrumentConfig The root element of the configuration document's section pertaining to this config's
   * instrument.
   * @returns The CAR display configuration defined by the configuration document, or a default version if the
   * document does not define a valid configuration.
   */
  private parseStartupScreenConfig(instrumentConfig: Element | undefined): StartupScreenConfig | undefined {
    if (instrumentConfig !== undefined) {
      try {
        const element = instrumentConfig.querySelector(':scope>StartupScreen');
        if (element !== null) {
          return new StartupScreenConfig(element);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    return undefined;
  }
}
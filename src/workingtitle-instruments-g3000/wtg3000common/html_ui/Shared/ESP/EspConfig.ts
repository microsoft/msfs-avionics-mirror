import { Config } from '../Config/Config';

/**
 * A configuration object which defines options related to ESP.
 */
export class EspConfig implements Config {

  /**
   * Creates a new EspConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element) {
    if (element.tagName !== 'Esp') {
      throw new Error(`Invalid EspConfig definition: expected tag name 'Esp' but was '${element.tagName}'`);
    }
  }
}

import { Config } from '../../../../Shared/Config/Config';

/**
 * A configuration object which defines PFD rudder trim gauge options.
 */
export class PfdRudderTrimGaugeConfig implements Config {

  /**
   * Creates a new PfdRudderTrimGaugeConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element) {
    if (element.tagName !== 'RudderTrimGauge') {
      throw new Error(`Invalid PfdRudderTrimGaugeConfig definition: expected tag name 'RudderTrimGauge' but was '${element.tagName}'`);
    }
  }
}

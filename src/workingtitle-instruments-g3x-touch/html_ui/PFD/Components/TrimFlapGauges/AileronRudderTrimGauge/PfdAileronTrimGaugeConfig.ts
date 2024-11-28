import { Config } from '../../../../Shared/Config/Config';

/**
 * A configuration object which defines PFD aileron trim gauge options.
 */
export class PfdAileronTrimGaugeConfig implements Config {

  /**
   * Creates a new PfdAileronTrimGaugeConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element) {
    if (element.tagName !== 'AileronTrimGauge') {
      throw new Error(`Invalid PfdAileronTrimGaugeConfig definition: expected tag name 'AileronTrimGauge' but was '${element.tagName}'`);
    }
  }
}

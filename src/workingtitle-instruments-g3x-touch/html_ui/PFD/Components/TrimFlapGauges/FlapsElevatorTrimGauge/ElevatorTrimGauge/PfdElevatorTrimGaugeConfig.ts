import { Config } from '../../../../../Shared/Config/Config';

/**
 * A configuration object which defines PFD elevator trim gauge options.
 */
export class PfdElevatorTrimGaugeConfig implements Config {

  /**
   * Creates a new PfdElevatorTrimGaugeConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element) {
    if (element.tagName !== 'ElevatorTrimGauge') {
      throw new Error(`Invalid PfdElevatorTrimGaugeConfig definition: expected tag name 'ElevatorTrimGauge' but was '${element.tagName}'`);
    }
  }
}

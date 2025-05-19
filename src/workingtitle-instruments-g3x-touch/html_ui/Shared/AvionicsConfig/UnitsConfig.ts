import { Config } from '../Config/Config';

/**
 * G3X Touch-supported types of fuel to use for unit conversions.
 */
export enum G3XUnitsFuelType {
  Sim = 'Sim',
  JetA = 'JetA',
  OneHundredLL = '100LL',
  Autogas = 'Autogas',
}

/**
 * A configuration object which defines measurement units options.
 */
export class UnitsConfig implements Config {
  /** The type of fuel to use for unit conversions. */
  public readonly fuelType: G3XUnitsFuelType;

  /**
   * Creates a new UnitsConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element | undefined) {
    if (element === undefined) {
      this.fuelType = G3XUnitsFuelType.Sim;
    } else {
      if (element.tagName !== 'Units') {
        throw new Error(`Invalid UnitsConfig definition: expected tag name 'Units' but was '${element.tagName}'`);
      }

      const fuelUnitsAttr = element.getAttribute('fuel');
      switch (fuelUnitsAttr) {
        case 'jet-a':
          this.fuelType = G3XUnitsFuelType.JetA;
          break;
        case '100ll':
          this.fuelType = G3XUnitsFuelType.OneHundredLL;
          break;
        case 'autogas':
          this.fuelType = G3XUnitsFuelType.Autogas;
          break;
        case 'sim':
        case null:
          this.fuelType = G3XUnitsFuelType.Sim;
          break;
        default:
          console.warn('Invalid UnitsConfig definition: unrecognized option "fuel" (must be "sim", "jet-a", "100ll", or "autogas"). Defaulting to "sim".');
          this.fuelType = G3XUnitsFuelType.Sim;
      }
    }
  }
}

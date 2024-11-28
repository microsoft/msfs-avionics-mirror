export enum FlightLevelChangeType {
  FLC = 'FLC',
  SPD = 'SPD',
}

/** A configuration object for the airframe. */
export class AutopilotConfig {
  /** The type of flight level change. */
  public readonly flcType: FlightLevelChangeType = FlightLevelChangeType.FLC;


  /**
   * Creates a new SensorsConfig from a configuration document element.
   * @param element A configuration document element.
   * @param baseInstrument The base instrument
   */
  constructor(element: Element | undefined, private readonly baseInstrument: BaseInstrument) {
    if (element !== undefined) {
      const flcModeElement = element.querySelectorAll(':scope>FlightLevelChange');
      if (flcModeElement.length >= 1) {
        this.flcType = this.parseFlcConfig(flcModeElement[0]);
        if (flcModeElement.length > 1) {
          console.warn('AutopilotConfig: Multiple FlightLevelChange elements found! Ignoring all but the first one.');
        }
      }
    } else {
      // no error at the moment, just default FLC mode.
      //console.warn('AutopilotConfig: No AutopilotConfig element found!');
    }
  }

  /**
   * Parses a flight level change configuration from a document element.
   * @param element A configuration document element.
   * @returns The flight level change configuration defined by the document element.
   */
  private parseFlcConfig(element: Element): FlightLevelChangeType {
    const type = element.getAttribute('type');
    switch (type) {
      case 'SPD':
        return FlightLevelChangeType.SPD;
      case 'FLC':
      default:
        if (type !== 'FLC') {
          console.warn(`AutopilotConfig: Invalid value for FlightLevelChange type attribute: ${type}! Valid values are "FLC", "SPD", or no type attribute (defaults to "FLC").`);
        }
        return FlightLevelChangeType.FLC;
    }
  }
}

/** A configuration object for the autothrottle. */
export class AutothrottleConfig {
  /** Is autothrottle speed protection available? */
  public readonly speedProtectionAvailable: boolean = false;

  /** The autothrottle electricity logic */
  public readonly electricLogic?: CompositeLogicXMLElement;

  /**
   * Creates a new SensorsConfig from a configuration document element.
   * @param element A configuration document element.
   * @param baseInstrument The base instrument
   */
  constructor(element: Element | undefined, private readonly baseInstrument: BaseInstrument) {
    if (element !== undefined) {
      const aspElements = element.querySelectorAll(':scope>SpeedProtection');
      if (aspElements.length >= 1) {
        this.speedProtectionAvailable = this.parseAspConfig(aspElements[0]);
        if (aspElements.length > 1) {
          console.warn('AutothrottleConfig: Multiple SpeedProtection elements found! Ignoring all but the first one.');
        }
      }

      const electricLogicElements = element.querySelectorAll(':scope>Electric');
      if (electricLogicElements.length >= 1) {
        this.electricLogic = electricLogicElements[0] === null ? undefined : new CompositeLogicXMLElement(this.baseInstrument, electricLogicElements[0]);
        if (aspElements.length > 1) {
          console.warn('AutothrottleConfig: Multiple Electric elements found! Ignoring all but the first one.');
        }
      }
    } else {
      // no error at the moment, just default behaviours.
      //console.warn('AutopilotConfig: No AutopilotConfig element found!');
    }
  }

  /**
   * Parses an autothrottle speed protection configuration from a document element.
   * @param element A configuration document element.
   * @returns The autothrottle speed protection configuration defined by the document element.
   */
  private parseAspConfig(element: Element): boolean {
    const textContent = element.textContent?.toLocaleLowerCase();
    if (textContent === 'true') {
      return true;
    } else {
      if (textContent !== 'false') {
        console.warn('AutopilotConfig: Invalid AutothrottleSpeedProtection tag. Text content must be either true or false. Defaulting to false.');
      }
      return false;
    }
  }
}

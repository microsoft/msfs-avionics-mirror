import { Config } from '../Config/Config';

/**
 * A configuration object which defines options related to aural alerts.
 */
export class AuralAlertsConfig implements Config {
  /** The supported voice types for aural alerts. */
  public readonly supportedVoices: 'male' | 'female' | 'both';

  /**
   * Creates a new AutopilotConfig from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element | undefined) {
    if (element === undefined) {
      this.supportedVoices = 'female';
    } else {
      if (element.tagName !== 'AuralAlerts') {
        throw new Error(`Invalid AuralAlertsConfig definition: expected tag name 'AuralAlerts' but was '${element.tagName}'`);
      }

      switch (element.getAttribute('voice')?.toLowerCase()) {
        case 'both':
          this.supportedVoices = 'both';
          break;
        case 'male':
          this.supportedVoices = 'male';
          break;
        case 'female':
        case undefined:
          this.supportedVoices = 'female';
          break;
        default:
          console.warn('Invalid AuralAlertsConfig definition: missing or unrecognized voice value (expected "male", "female", or "both"). Defaulting to "female".');
          this.supportedVoices = 'female';
      }
    }
  }
}
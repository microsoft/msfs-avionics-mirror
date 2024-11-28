import { Config } from '../Config/Config';

/**
 * A configuration object which defines options related to the message system.
 */
export class MessageSystemConfig implements Config {
  /** Whether the message system should include CAS messages in addition to system messages. */
  public readonly includeCas: boolean;

  /**
   * Creates a new MessageSystemConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element | undefined) {
    if (element === undefined) {
      this.includeCas = false;
    } else {
      if (element.tagName !== 'Message') {
        throw new Error(`Invalid MessageSystemConfig definition: expected tag name 'Message' but was '${element.tagName}'`);
      }

      const includeCas = element.getAttribute('include-cas')?.toLowerCase();
      switch (includeCas) {
        case 'true':
          this.includeCas = true;
          break;
        case 'false':
        case undefined:
          this.includeCas = false;
          break;
        default:
          console.warn('Invalid MessageSystemConfig definition: unrecognized "include-cas" option (must be "true" or "false"). Defaulting to false.');
          this.includeCas = false;
      }
    }
  }
}

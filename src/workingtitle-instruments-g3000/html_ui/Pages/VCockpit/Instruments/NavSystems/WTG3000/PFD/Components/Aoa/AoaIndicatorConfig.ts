import { Config, ConfigFactory } from '@microsoft/msfs-wtg3000-common';

/**
 * A configuration object which defines angle of attack indicator options.
 */
export class AoaIndicatorConfig implements Config {
  /** Whether to display the advanced version of the indicator. */
  public readonly advanced: boolean;

  /**
   * Creates a new VsiConfig from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   */
  constructor(element: Element | undefined, factory: ConfigFactory) {
    if (element === undefined) {
      this.advanced = false;
    } else {
      if (element.tagName !== 'AoaIndicator') {
        throw new Error(`Invalid AoaIndicatorConfig definition: expected tag name 'AoaIndicator' but was '${element.tagName}'`);
      }

      const advanced = element.getAttribute('advanced')?.toLowerCase();
      switch (advanced) {
        case 'true':
          this.advanced = true;
          break;
        case 'false':
          this.advanced = false;
          break;
        case undefined:
          break;
        default:
          console.warn('Invalid AoaIndicator definition: invalid advanced option (must be true or false)');
      }

      const inheritFromId = element.getAttribute('inherit');
      const inheritFromElement = inheritFromId === null
        ? null
        : element.ownerDocument.querySelector(`AoaIndicator[id='${inheritFromId}']`);

      this.inheritFrom(inheritFromElement, factory);

      this.advanced ??= false;
    }
  }

  /**
   * Inherits options from a parent configuration document element.
   * @param element A parent configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   */
  private inheritFrom(element: Element | null, factory: ConfigFactory): void {
    if (element === null) {
      return;
    }

    try {
      const parentConfig = new AoaIndicatorConfig(element, factory);

      (this.advanced as boolean) ??= parentConfig.advanced;
    } catch (e) {
      console.warn(e);
    }
  }
}
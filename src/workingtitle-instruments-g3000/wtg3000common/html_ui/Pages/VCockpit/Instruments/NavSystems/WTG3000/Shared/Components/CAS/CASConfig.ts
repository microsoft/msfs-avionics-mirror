import { Config, ConfigFactory } from '../../Config/Config';

/**
 * A configuration object which defines angle of attack indicator options.
 */
export class CASConfig implements Config {
  /** Whether or not to display a CAS on the PFD in the first place. */
  public readonly casEnabled: boolean;

  /** The maximum number of alerts to display in full-screen mode. */
  public readonly alertCountFullScreen: number;

  /** The maximum number of alerts to display in split-screen mode. */
  public readonly alertCountSplitScreen: number;

  /**
   * Creates a new VsiConfig from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   */
  constructor(element: Element | undefined, factory: ConfigFactory) {
    if (element === undefined) {
      this.casEnabled = false;
      this.alertCountFullScreen = 12;
      this.alertCountSplitScreen = 11;
    } else {
      if (element.tagName !== 'CAS') {
        throw new Error(`Invalid CASConfig definition: expected tag name 'CAS' but was '${element.tagName}'`);
      }

      this.casEnabled = true;
      let attr = element.getAttribute('full-screen-alert-count');
      if (attr === null) {
        this.alertCountFullScreen = 12;
      } else {
        const fullCount = Number(attr);
        if (Number.isInteger(fullCount)) {
          this.alertCountFullScreen = fullCount;
        } else {
          console.warn(`Invalid CASConfig definition: full screen alert count has non-integer value '${attr}`);
          this.alertCountFullScreen = 12;
        }
      }

      attr = element.getAttribute('split-screen-alert-count');
      if (attr === null) {
        this.alertCountSplitScreen = 11;
      } else {
        const splitCount = Number.parseInt(attr);
        if (Number.isInteger(splitCount)) {
          this.alertCountSplitScreen = splitCount;
        } else {
          console.warn(`Invalid CASConfig definition: split screen alert count has non-integer value '${attr}'`);
          this.alertCountSplitScreen = 11;
        }
      }

      const inheritFromId = element.getAttribute('inherit');
      const inheritFromElement = inheritFromId === null
        ? null
        : element.ownerDocument.querySelector(`CAS[id='${inheritFromId}']`);

      this.inheritFrom(inheritFromElement, factory);
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
      const parentConfig = new CASConfig(element, factory);
      (this.alertCountFullScreen as number | undefined) ??= parentConfig.alertCountFullScreen;
      (this.alertCountSplitScreen as number | undefined) ??= parentConfig.alertCountSplitScreen;
    } catch (e) {
      console.warn(e);
    }
  }
}
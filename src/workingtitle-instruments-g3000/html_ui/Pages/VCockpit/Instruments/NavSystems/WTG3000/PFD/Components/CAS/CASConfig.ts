import { Config } from '@microsoft/msfs-wtg3000-common';
import { PfdLayoutConfig } from '../../Config';

/**
 * A configuration object which defines PFD CAS options.
 */
export class CASConfig implements Config {
  /** Whether to render the PFD CAS display. */
  public readonly casEnabled: boolean;

  /** The maximum number of CAS messages to display when the PFD is in full mode. */
  public readonly alertCountFullScreen: number;

  /** The maximum number of CAS messages to display when the PFD is in split mode. */
  public readonly alertCountSplitScreen: number;

  /**
   * Creates a new CASConfig from a configuration document element.
   * @param element A configuration document element.
   * @param pfdLayoutConfig The PFD layout configuration object.
   */
  constructor(element: Element | undefined, pfdLayoutConfig: PfdLayoutConfig) {
    let inheritData: CASConfigData | undefined;

    if (element !== undefined) {
      if (element.tagName !== 'CAS') {
        throw new Error(`Invalid CASConfig definition: expected tag name 'CAS' but was '${element.tagName}'`);
      }

      const inheritFromId = element.getAttribute('inherit');
      const inheritFromElement = inheritFromId === null
        ? null
        : element.ownerDocument.querySelector(`CAS[id='${inheritFromId}']`);

      inheritData = inheritFromElement ? new CASConfigData(inheritFromElement) : undefined;
    }

    const data = new CASConfigData(element);

    this.casEnabled = data.casEnabled ?? inheritData?.casEnabled ?? false;
    this.alertCountFullScreen = data.alertCountFullScreen ?? inheritData?.alertCountFullScreen ?? 12;
    this.alertCountSplitScreen = data.alertCountSplitScreen ?? inheritData?.alertCountSplitScreen ?? this.getDefaultAlertCountSplitScreen(pfdLayoutConfig);
  }

  /**
   * Gets the default maximum number of CAS messages to display when the PFD is in full mode.
   * @param pfdLayoutConfig The PFD layout configuration object.
   * @returns The default maximum number of CAS messages to display when the PFD is in full mode.
   */
  private getDefaultAlertCountSplitScreen(pfdLayoutConfig: PfdLayoutConfig): number {
    let count = 11;

    if (pfdLayoutConfig.includeSoftKeys) {
      count -= 3;
    }

    return count;
  }
}

/**
 * An object containing PFD CAS configuration data parsed from an XML document element.
 */
class CASConfigData {
  /** Whether or not to display a CAS on the PFD in the first place. */
  public readonly casEnabled?: boolean;

  /** The maximum number of alerts to display in full-screen mode. */
  public readonly alertCountFullScreen?: number;

  /** The maximum number of alerts to display in split-screen mode. */
  public readonly alertCountSplitScreen?: number;

  /**
   * Creates a new CASConfigData from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element | undefined) {
    if (element === undefined) {
      return;
    }

    this.casEnabled = true;

    let attr = element.getAttribute('full-screen-alert-count');
    if (attr !== null) {
      const fullCount = Number(attr);
      if (Number.isInteger(fullCount) && fullCount > 0) {
        this.alertCountFullScreen = fullCount;
      } else {
        console.warn('Invalid CASConfig definition: invalid full-screen-alert-count option (must be a positive integer)');
      }
    }

    attr = element.getAttribute('split-screen-alert-count');
    if (attr !== null) {
      const splitCount = Number.parseInt(attr);
      if (Number.isInteger(splitCount) && splitCount > 0) {
        this.alertCountSplitScreen = splitCount;
      } else {
        console.warn('Invalid CASConfig definition: invalid split-screen-alert-count option (must be a positive integer)');
      }
    }
  }
}
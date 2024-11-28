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

  /** The maximum number of unscrollable CAS messages to display when the PFD is in full mode. */
  public readonly unscrollableAlertCountFullScreen: number;

  /** The maximum number of unscrollable CAS messages to display when the PFD is in split mode. */
  public readonly unscrollableAlertCountSplitScreen: number;

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
    this.alertCountFullScreen = data.alertCountFullScreen ?? inheritData?.alertCountFullScreen ?? this.getDefaultAlertCountFullScreen(pfdLayoutConfig);
    this.alertCountSplitScreen = data.alertCountSplitScreen ?? inheritData?.alertCountSplitScreen ?? this.getDefaultAlertCountSplitScreen(pfdLayoutConfig);

    this.unscrollableAlertCountFullScreen = data.unscrollableAlertCountFullScreen ?? inheritData?.unscrollableAlertCountFullScreen ?? 0;
    this.unscrollableAlertCountSplitScreen = data.unscrollableAlertCountSplitScreen ?? inheritData?.unscrollableAlertCountSplitScreen ?? 0;

    if (this.unscrollableAlertCountFullScreen > this.alertCountFullScreen) {
      console.warn(`Invalid CASConfig definition: Full mode unscrollable alert count option is greater than the total alert count option (${this.unscrollableAlertCountFullScreen} vs ${this.alertCountFullScreen}). Clamping unscrollable alert count to total alert count.`);
      this.unscrollableAlertCountFullScreen = this.alertCountFullScreen;
    }
    if (this.unscrollableAlertCountSplitScreen > this.alertCountSplitScreen) {
      console.warn(`Invalid CASConfig definition: Split mode unscrollable alert count option is greater than the total alert count option (${this.unscrollableAlertCountSplitScreen} vs ${this.alertCountSplitScreen}). Clamping unscrollable alert count to total alert count.`);
      this.unscrollableAlertCountSplitScreen = this.alertCountSplitScreen;
    }
  }

  /**
   * Gets the default maximum number of CAS messages to display when the PFD is in full mode.
   * @param pfdLayoutConfig The PFD layout configuration object.
   * @returns The default maximum number of CAS messages to display when the PFD is in full mode.
   */
  private getDefaultAlertCountFullScreen(pfdLayoutConfig: PfdLayoutConfig): number {
    if (pfdLayoutConfig.includeSoftKeys) {
      return 11;
    } else {
      return 12;
    }
  }

  /**
   * Gets the default maximum number of CAS messages to display when the PFD is in split mode.
   * @param pfdLayoutConfig The PFD layout configuration object.
   * @returns The default maximum number of CAS messages to display when the PFD is in split mode.
   */
  private getDefaultAlertCountSplitScreen(pfdLayoutConfig: PfdLayoutConfig): number {
    if (pfdLayoutConfig.includeSoftKeys && pfdLayoutConfig.useNavStatusBanner) {
      return 8;
    } else if (pfdLayoutConfig.includeSoftKeys || pfdLayoutConfig.useNavStatusBanner) {
      return 11;
    } else {
      return 12;
    }
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

  /** The maximum number of unscrollable CAS messages to display when the PFD is in full mode. */
  public readonly unscrollableAlertCountFullScreen?: number;

  /** The maximum number of unscrollable CAS messages to display when the PFD is in split mode. */
  public readonly unscrollableAlertCountSplitScreen?: number;

  /**
   * Creates a new CASConfigData from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element | undefined) {
    if (element === undefined) {
      return;
    }

    this.casEnabled = true;

    const fullScreenAlertCountAttr = element.getAttribute('full-screen-alert-count');
    if (fullScreenAlertCountAttr !== null) {
      const fullCount = Number(fullScreenAlertCountAttr);
      if (Number.isInteger(fullCount) && fullCount > 0) {
        this.alertCountFullScreen = fullCount;
      } else {
        console.warn('Invalid CASConfig definition: unrecognized "full-screen-alert-count" option (must be a positive integer)');
      }
    }

    const splitScreenAlertCountAttr = element.getAttribute('split-screen-alert-count');
    if (splitScreenAlertCountAttr !== null) {
      const splitCount = Number.parseInt(splitScreenAlertCountAttr);
      if (Number.isInteger(splitCount) && splitCount > 0) {
        this.alertCountSplitScreen = splitCount;
      } else {
        console.warn('Invalid CASConfig definition: unrecognized "split-screen-alert-count" option (must be a positive integer)');
      }
    }

    const fullScreenUnscrollableAlertCountAttr = element.getAttribute('full-screen-unscrollable-alert-count');
    if (fullScreenUnscrollableAlertCountAttr !== null) {
      const fullCount = Number(fullScreenUnscrollableAlertCountAttr);
      if (Number.isInteger(fullCount) && fullCount > 0) {
        this.unscrollableAlertCountFullScreen = fullCount;
      } else {
        console.warn('Invalid CASConfig definition: unrecognized "full-screen-unscrollable-alert-count" option (must be a positive integer)');
      }
    }

    const splitScreenUnscrollableAlertCountAttr = element.getAttribute('split-screen-unscrollable-alert-count');
    if (splitScreenUnscrollableAlertCountAttr !== null) {
      const splitCount = Number.parseInt(splitScreenUnscrollableAlertCountAttr);
      if (Number.isInteger(splitCount) && splitCount > 0) {
        this.unscrollableAlertCountSplitScreen = splitCount;
      } else {
        console.warn('Invalid CASConfig definition: unrecognized "split-screen-unscrollable-alert-count" option (must be a positive integer)');
      }
    }
  }
}
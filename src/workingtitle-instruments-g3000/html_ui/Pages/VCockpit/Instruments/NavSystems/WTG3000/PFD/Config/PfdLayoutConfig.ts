import { Config } from '@microsoft/msfs-wtg3000-common';

/**
 * A configuration object which defines the layout of a PFD.
 */
export class PfdLayoutConfig implements Config {
  /** Whether to include softkeys. */
  public readonly includeSoftKeys: boolean;

  /** The side on which to place the PFD's instrument pane in split mode. */
  public readonly splitModeInstrumentSide: 'left' | 'right' | undefined;

  /** Whether to render the navigation status box and NAV/DME information displays as banners. */
  public readonly useBanners: boolean;

  /**
   * Creates a new PfdLayoutConfig from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element | undefined) {
    if (element === undefined) {
      this.includeSoftKeys = false;
      this.splitModeInstrumentSide = undefined;
      this.useBanners = false;
    } else {
      if (element.tagName !== 'PfdLayout') {
        throw new Error(`Invalid PfdLayoutConfig definition: expected tag name 'PfdLayout' but was '${element.tagName}'`);
      }

      const includeSoftKeys = element.getAttribute('softkeys')?.toLowerCase() ?? 'false';
      switch (includeSoftKeys) {
        case 'true':
          this.includeSoftKeys = true;
          break;
        case 'false':
          this.includeSoftKeys = false;
          break;
        default:
          console.warn('Invalid PfdLayoutConfig definition: invalid softkeys option (must be true or false)');
          this.includeSoftKeys = false;
      }

      const splitModeInstrumentSide = element.getAttribute('instrument-side')?.toLowerCase();
      switch (splitModeInstrumentSide) {
        case 'left':
        case 'right':
        case undefined:
          this.splitModeInstrumentSide = splitModeInstrumentSide;
          break;
        default:
          console.warn('Invalid PfdLayoutConfig definition: invalid instrument side option (must be left or right)');
          this.splitModeInstrumentSide = undefined;
      }

      const useBanners = element.getAttribute('use-banners')?.toLowerCase() ?? 'false';
      switch (useBanners) {
        case 'true':
          this.useBanners = true;
          break;
        case 'false':
          this.useBanners = false;
          break;
        default:
          console.warn('Invalid PfdLayoutConfig definition: invalid use banners option (must be true or false)');
          this.useBanners = false;
      }
    }
  }
}
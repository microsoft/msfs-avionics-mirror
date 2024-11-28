import { Config } from '../Config/Config';

/**
 * A configuration object which defines options related to bing map optimizations.
 */
export class BingMapOptimizationConfig implements Config {
  /** Whether to disable the PFD pane map and PFD Map Inset. */
  public readonly disablePfdMaps: boolean;

  /** Whether to disable SVT. */
  public readonly disableSvt: boolean;

  /**
   * Creates a new BingMapOptimizationConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element | undefined) {
    if (element === undefined) {
      this.disablePfdMaps = false;
      this.disableSvt = false;
    } else {
      if (element.tagName !== 'BingMapOpt') {
        throw new Error(`Invalid BingMapOptimizationConfig definition: expected tag name 'BingMapOpt' but was '${element.tagName}'`);
      }

      const disablePfdMapsAttr = element.getAttribute('disable-pfd-maps')?.toLowerCase();
      switch (disablePfdMapsAttr) {
        case 'true':
          this.disablePfdMaps = true;
          break;
        case 'false':
        case undefined:
          this.disablePfdMaps = false;
          break;
        default:
          console.warn('Invalid BingMapOptimizationConfig definition: unrecognized "disable-pfd-maps" option (must be "true" or "false"). Defaulting to false.');
          this.disablePfdMaps = false;
      }

      const disableSvtAttr = element.getAttribute('disable-svt')?.toLowerCase();
      switch (disableSvtAttr) {
        case 'true':
          this.disableSvt = true;
          break;
        case 'false':
        case undefined:
          this.disableSvt = false;
          break;
        default:
          console.warn('Invalid BingMapOptimizationConfig definition: unrecognized "disable-svt" option (must be "true" or "false"). Defaulting to false.');
          this.disableSvt = false;
      }
    }
  }
}

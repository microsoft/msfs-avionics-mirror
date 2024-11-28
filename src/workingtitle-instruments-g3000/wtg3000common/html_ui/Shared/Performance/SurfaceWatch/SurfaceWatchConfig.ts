import { Config } from '../../Config/Config';

/**
 * A configuration object which defines options related to SurfaceWatch.
 */
export class SurfaceWatchConfig implements Config {
  /**
   * Creates a new SurfaceWatchConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element) {
    if (element.tagName !== 'SurfaceWatch') {
      throw new Error(`Invalid SurfaceWatchConfig definition: expected tag name 'SurfaceWatch' but was '${element.tagName}'`);
    }
  }
}

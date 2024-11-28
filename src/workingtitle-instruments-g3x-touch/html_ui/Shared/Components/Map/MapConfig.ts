import { Config } from '../../Config/Config';
import { G3XTouchFilePaths } from '../../G3XTouchFilePaths';

/**
 * A configuration object which defines options related to maps.
 */
export class MapConfig implements Config {
  private static readonly DEFAULT_AIRPLANE_ICON_SRC = `${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/airplane_generic.png`;

  /** The path to the own airplane icon's image asset. */
  public readonly ownAirplaneIconSrc: string;

  /**
   * Creates a new MapConfig from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element | undefined) {
    if (element === undefined) {
      this.ownAirplaneIconSrc = MapConfig.DEFAULT_AIRPLANE_ICON_SRC;
    } else {
      if (element.tagName !== 'Map') {
        throw new Error(`Invalid MapConfig definition: expected tag name 'Map' but was '${element.tagName}'`);
      }

      this.ownAirplaneIconSrc = element.getAttribute('airplane-icon-src') ?? MapConfig.DEFAULT_AIRPLANE_ICON_SRC;
    }
  }
}
import { Config } from '../Config/Config';
import { G3000FilePaths } from '../G3000FilePaths';

/**
 * A configuration object which defines options related to electronic charts.
 */
export class G3000ChartsConfig implements Config {
  private static readonly DEFAULT_AIRPLANE_ICON_SRC = `${G3000FilePaths.ASSETS_PATH}/Images/Charts/icon_airplane_generic.png`;

  /** The path to the own airplane icon's image asset. */
  public readonly ownAirplaneIconSrc: string;

  /**
   * Creates a new G3000ChartsConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element | undefined) {
    if (element === undefined) {
      this.ownAirplaneIconSrc = G3000ChartsConfig.DEFAULT_AIRPLANE_ICON_SRC;
    } else {
      if (element.tagName !== 'Charts') {
        throw new Error(`Invalid G3000ChartsConfig definition: expected tag name 'Charts' but was '${element.tagName}'`);
      }

      this.ownAirplaneIconSrc = element.getAttribute('airplane-icon-src') ?? G3000ChartsConfig.DEFAULT_AIRPLANE_ICON_SRC;
    }
  }
}

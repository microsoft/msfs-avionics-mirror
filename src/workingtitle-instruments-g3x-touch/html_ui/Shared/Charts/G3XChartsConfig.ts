import { Config } from '../Config/Config';
import { G3XTouchFilePaths } from '../G3XTouchFilePaths';

/**
 * A configuration object which defines options related to electronic charts.
 */
export class G3XChartsConfig implements Config {
  private static readonly DEFAULT_AIRPLANE_ICON_SRC = `${G3XTouchFilePaths.ASSETS_PATH}/Images/Charts/airplane_generic.png`;

  /** The path to the own airplane icon's image asset. */
  public readonly ownAirplaneIconSrc: string;

  /**
   * Creates a new G3XChartsConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element | undefined) {
    if (element === undefined) {
      this.ownAirplaneIconSrc = G3XChartsConfig.DEFAULT_AIRPLANE_ICON_SRC;
    } else {
      if (element.tagName !== 'Charts') {
        throw new Error(`Invalid G3XChartsConfig definition: expected tag name 'Charts' but was '${element.tagName}'`);
      }

      this.ownAirplaneIconSrc = element.getAttribute('airplane-icon-src') ?? G3XChartsConfig.DEFAULT_AIRPLANE_ICON_SRC;
    }
  }
}

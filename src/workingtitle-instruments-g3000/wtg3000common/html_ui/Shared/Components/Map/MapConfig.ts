import { Config } from '../../Config/Config';
import { G3000FilePaths } from '../../G3000FilePaths';

/**
 * A configuration object which defines options related to maps.
 */
export class MapConfig implements Config {
  private static readonly DEFAULT_AIRPLANE_ICON_SRC = `${G3000FilePaths.ASSETS_PATH}/Images/Map/airplane_generic.svg`;
  private static readonly DEFAULT_TRAFFIC_RANGE_LABEL_RADIAL = 135;

  /** The path to the own airplane icon's image asset. */
  public readonly ownAirplaneIconSrc: string;

  /** The radial on which the range labels on the traffic map are positioned, in degrees. */
  public readonly trafficRangeLabelRadial: number;

  /** Whether to show the dashed inner ring on the traffic map. */
  public readonly trafficRangeInnerRingShow: boolean;

  /**
   * Creates a new MapConfig from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element | undefined) {
    if (element === undefined) {
      this.ownAirplaneIconSrc = MapConfig.DEFAULT_AIRPLANE_ICON_SRC;
      this.trafficRangeLabelRadial = MapConfig.DEFAULT_TRAFFIC_RANGE_LABEL_RADIAL;
      this.trafficRangeInnerRingShow = true;
    } else {
      if (element.tagName !== 'Map') {
        throw new Error(`Invalid MapConfig definition: expected tag name 'Map' but was '${element.tagName}'`);
      }

      this.ownAirplaneIconSrc = element.getAttribute('airplane-icon-src') ?? MapConfig.DEFAULT_AIRPLANE_ICON_SRC;

      const trafficRangeLabelRadial = Number(element.getAttribute('traffic-range-label-radial') ?? MapConfig.DEFAULT_TRAFFIC_RANGE_LABEL_RADIAL);
      if (isNaN(trafficRangeLabelRadial)) {
        console.warn('Invalid MapConfig definition: unrecognized traffic range label radial value (must be a number)');
        this.trafficRangeLabelRadial = MapConfig.DEFAULT_TRAFFIC_RANGE_LABEL_RADIAL;
      } else {
        this.trafficRangeLabelRadial = trafficRangeLabelRadial % 360;
      }

      const trafficRangeInnerRingShow = element.getAttribute('traffic-range-inner-ring-show');
      switch ((trafficRangeInnerRingShow ?? 'false').toLowerCase()) {
        case 'true':
          this.trafficRangeInnerRingShow = true;
          break;
        case 'false':
          this.trafficRangeInnerRingShow = false;
          break;
        default:
          console.warn('Invalid MapConfig definition: unrecognized show traffic range inner ring value (must be \'true\' or \'false\' - case-insensitive)');
          this.trafficRangeInnerRingShow = false;
      }
    }
  }
}
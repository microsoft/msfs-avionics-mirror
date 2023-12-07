import { AirspeedIndicatorColorRange, AirspeedIndicatorColorRangeColor, AirspeedIndicatorColorRangeWidth } from '@microsoft/msfs-garminsdk';

import { ConfigFactory, ResolvableConfig } from '../../Config/Config';
import { NumericConfig } from '../../Config/NumericConfig';


/**
 * A configuration object which defines an airspeed tape color range.
 */
export class ColorRangeConfig implements ResolvableConfig<AirspeedIndicatorColorRange> {
  public readonly isResolvableConfig = true;

  /** The width of this config's color range. */
  public readonly width: AirspeedIndicatorColorRangeWidth;

  /** The color of this config's color range. */
  public readonly color: AirspeedIndicatorColorRangeColor;

  /** The config which defines the minimum airspeed value of this config's color range. */
  public readonly minimum: NumericConfig;

  /** The config which defines the maximum airspeed value of this config's color range. */
  public readonly maximum: NumericConfig;

  /**
   * Creates a new ColorRangeConfig from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   */
  constructor(element: Element, factory: ConfigFactory) {
    if (element.tagName !== 'ColorRange') {
      throw new Error(`Invalid ColorRangeConfig definition: expected tag name 'ColorRange' but was '${element.tagName}'`);
    }

    const width = element.getAttribute('width');
    switch (width) {
      case AirspeedIndicatorColorRangeWidth.Full:
      case AirspeedIndicatorColorRangeWidth.Half:
        this.width = width;
        break;
      default:
        throw new Error(`Invalid ColorRangeConfig definition: unrecognized width '${width}'`);
    }

    const color = element.getAttribute('color');
    switch (color) {
      case AirspeedIndicatorColorRangeColor.Red:
      case AirspeedIndicatorColorRangeColor.Yellow:
      case AirspeedIndicatorColorRangeColor.White:
      case AirspeedIndicatorColorRangeColor.Green:
      case AirspeedIndicatorColorRangeColor.BarberPole:
        this.color = color;
        break;
      default:
        throw new Error(`Invalid ColorRangeConfig definition: unrecognized color '${color}'`);
    }

    const minimum = this.parseEndpoint(element.querySelector(':scope>Minimum'), factory);
    const maximum = this.parseEndpoint(element.querySelector(':scope>Maximum'), factory);

    if (minimum === undefined) {
      throw new Error('Invalid ColorRangeConfig definition: minimum endpoint is not defined or is not numeric');
    }
    if (maximum === undefined) {
      throw new Error('Invalid ColorRangeConfig definition: maximum endpoint is not defined or is not numeric');
    }

    this.minimum = minimum;
    this.maximum = maximum;
  }

  /**
   * Parses an endpoint numeric config from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   * @returns The numeric config defined by the specified element, or `undefined` if one could not be created.
   */
  private parseEndpoint(element: Element | null, factory: ConfigFactory): NumericConfig | undefined {
    const firstChild = element?.children[0];

    if (firstChild === undefined) {
      return undefined;
    }

    const config = factory.create(firstChild);

    if (config === undefined || !('isNumericConfig' in config)) {
      return undefined;
    }

    return config as NumericConfig;
  }

  /** @inheritdoc */
  public resolve(): AirspeedIndicatorColorRange {
    return {
      width: this.width,
      color: this.color,
      minimum: this.minimum.resolve(),
      maximum: this.maximum.resolve()
    };
  }
}
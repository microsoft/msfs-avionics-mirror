import { VsiScaleOptions } from '@microsoft/msfs-garminsdk';
import { Config, ConfigFactory } from '@microsoft/msfs-wtg3000-common';

/**
 * A configuration object which defines vertical speed indicator options.
 */
export class VsiConfig implements Config {
  /** Options for the VSI scale. */
  public readonly scaleOptions: Readonly<Partial<VsiScaleOptions>>;

  /**
   * Creates a new VsiConfig from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   */
  constructor(element: Element | undefined, factory: ConfigFactory) {
    if (element === undefined) {
      this.scaleOptions = {};
    } else {
      if (element.tagName !== 'Vsi') {
        throw new Error(`Invalid VsiConfig definition: expected tag name 'Vsi' but was '${element.tagName}'`);
      }

      try {
        this.scaleOptions = this.parseScaleOptions(element);
      } catch (e) {
        console.warn(e);
        this.scaleOptions = {};
      }

      const inheritFromId = element.getAttribute('inherit');
      const inheritFromElement = inheritFromId === null
        ? null
        : element.ownerDocument.querySelector(`Vsi[id='${inheritFromId}']`);

      this.inheritFrom(inheritFromElement, factory);
    }
  }

  /**
   * Parses scale options from a configuration document element.
   * @param element A configuration document element.
   * @returns Scale options defined by the specified element.
   * @throws Error if the specified element has an invalid format.
   */
  private parseScaleOptions(element: Element): Partial<VsiScaleOptions> {
    const scaleOptions = {
      maximum: undefined as number | undefined,
      majorTickInterval: undefined as number | undefined,
      minorTickFactor: undefined as number | undefined
    };

    const scale = element.querySelector(':scope>Scale');

    if (scale === null) {
      return scaleOptions;
    }

    scaleOptions.maximum = Number(scale.getAttribute('max') ?? 'NaN');
    scaleOptions.majorTickInterval = Number(scale.getAttribute('major-tick-interval') ?? 'NaN');
    scaleOptions.minorTickFactor = Number(scale.getAttribute('minor-tick-factor') ?? 'NaN');

    for (const key in scaleOptions) {
      if (isNaN(scaleOptions[key as keyof typeof scaleOptions] as number)) {
        console.warn(`Invalid VsiConfig definition: invalid scale option '${key}'`);
        scaleOptions[key as keyof typeof scaleOptions] = undefined;
      }
    }

    return scaleOptions;
  }

  /**
   * Inherits options from a parent configuration document element.
   * @param element A parent configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   */
  private inheritFrom(element: Element | null, factory: ConfigFactory): void {
    if (element === null) {
      return;
    }

    try {
      const parentConfig = new VsiConfig(element, factory);

      const scaleOptions = this.scaleOptions as Partial<VsiScaleOptions>;
      scaleOptions.maximum ??= parentConfig.scaleOptions.maximum;
      scaleOptions.majorTickInterval ??= parentConfig.scaleOptions.majorTickInterval;
      scaleOptions.minorTickFactor ??= parentConfig.scaleOptions.minorTickFactor;
    } catch (e) {
      console.warn(e);
    }
  }
}
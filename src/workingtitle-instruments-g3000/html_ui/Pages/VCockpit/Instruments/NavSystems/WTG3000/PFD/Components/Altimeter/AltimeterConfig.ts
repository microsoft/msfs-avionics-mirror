import { AltimeterDataProviderOptions, AltimeterTapeScaleOptions } from '@microsoft/msfs-garminsdk';
import { Config, ConfigFactory } from '@microsoft/msfs-wtg3000-common';

/**
 * Altimeter data provider options defined by an altimeter configuration object.
 */
export type AltimeterConfigDataProviderOptions = Omit<AltimeterDataProviderOptions, 'supportRadarAlt'>;

/**
 * A configuration object which defines altimeter options.
 */
export class AltimeterConfig implements Config {
  /** Options for the altimeter data provider. */
  public readonly dataProviderOptions: Readonly<Partial<AltimeterConfigDataProviderOptions>>;

  /** Options for the altimeter tape scale. */
  public readonly tapeScaleOptions: Readonly<Partial<AltimeterTapeScaleOptions>>;

  /**
   * Creates a new AltimeterConfig from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   */
  constructor(element: Element | undefined, factory: ConfigFactory) {
    if (element === undefined) {
      this.dataProviderOptions = {};
      this.tapeScaleOptions = {};
    } else {
      if (element.tagName !== 'Altimeter') {
        throw new Error(`Invalid AltimeterConfig definition: expected tag name 'Altimeter' but was '${element.tagName}'`);
      }

      try {
        this.dataProviderOptions = this.parseDataProviderOptions(element);
      } catch (e) {
        console.warn(e);
        this.dataProviderOptions = {};
      }

      try {
        this.tapeScaleOptions = this.parseScaleOptions(element);
      } catch (e) {
        console.warn(e);
        this.tapeScaleOptions = {};
      }

      const inheritFromId = element.getAttribute('inherit');
      const inheritFromElement = inheritFromId === null
        ? null
        : element.ownerDocument.querySelector(`Altimeter[id='${inheritFromId}']`);

      this.inheritFrom(inheritFromElement, factory);
    }
  }

  /**
   * Parses data provider options from a configuration document element.
   * @param element A configuration document element.
   * @returns Data provider options defined by the specified element.
   * @throws Error if the specified element has an invalid format.
   */
  private parseDataProviderOptions(element: Element): Partial<AltimeterConfigDataProviderOptions> {
    let trendLookahead: number | undefined;

    const trendVector = element.querySelector(':scope>TrendVector');
    if (trendVector !== null) {
      trendLookahead = Number(trendVector.getAttribute('lookahead') ?? 'NaN');

      if (isNaN(trendLookahead)) {
        trendLookahead = undefined;
      }
    }

    return {
      trendLookahead
    };
  }

  /**
   * Parses tape scale options from a configuration document element.
   * @param element A configuration document element.
   * @returns Tape scale options defined by the specified element.
   * @throws Error if the specified element has an invalid format.
   */
  private parseScaleOptions(element: Element): Partial<AltimeterTapeScaleOptions> {
    const scaleOptions = {
      minimum: undefined as number | undefined,
      maximum: undefined as number | undefined,
      window: undefined as number | undefined,
      majorTickInterval: undefined as number | undefined,
      minorTickFactor: undefined as number | undefined
    };

    const scale = element.querySelector(':scope>Scale');

    if (scale === null) {
      return scaleOptions;
    }

    scaleOptions.minimum = Number(scale.getAttribute('min') ?? 'NaN');
    scaleOptions.maximum = Number(scale.getAttribute('max') ?? 'NaN');
    scaleOptions.window = Number(scale.getAttribute('window') ?? 'NaN');
    scaleOptions.majorTickInterval = Number(scale.getAttribute('major-tick-interval') ?? 'NaN');
    scaleOptions.minorTickFactor = Number(scale.getAttribute('minor-tick-factor') ?? 'NaN');

    for (const key in scaleOptions) {
      if (isNaN(scaleOptions[key as keyof typeof scaleOptions] as number)) {
        console.warn(`Invalid AltimeterConfig definition: invalid scale option '${key}'`);
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
      const parentConfig = new AltimeterConfig(element, factory);

      const dataProviderOptions = this.dataProviderOptions as Partial<AltimeterConfigDataProviderOptions>;
      dataProviderOptions.trendLookahead ??= parentConfig.dataProviderOptions.trendLookahead;

      const tapeScaleOptions = this.tapeScaleOptions as Partial<AltimeterTapeScaleOptions>;
      tapeScaleOptions.minimum ??= parentConfig.tapeScaleOptions.minimum;
      tapeScaleOptions.maximum ??= parentConfig.tapeScaleOptions.maximum;
      tapeScaleOptions.window ??= parentConfig.tapeScaleOptions.window;
      tapeScaleOptions.majorTickInterval ??= parentConfig.tapeScaleOptions.majorTickInterval;
      tapeScaleOptions.minorTickFactor ??= parentConfig.tapeScaleOptions.minorTickFactor;
    } catch (e) {
      console.warn(e);
    }
  }
}
import { DefaultAltimeterDataProviderOptions, AltimeterTapeScaleOptions } from '@microsoft/msfs-garminsdk';

import { Config, ConfigFactory } from '@microsoft/msfs-wtg3000-common';

/**
 * A configuration object which defines altimeter options.
 */
export class AltimeterConfig implements Config {
  private static readonly DEFAULT_DATA_OPTIONS: Readonly<DefaultAltimeterDataProviderOptions> = {
    trendLookahead: 6
  };

  private static readonly DEFAULT_TAPE_SCALE_OPTIONS: Readonly<AltimeterTapeScaleOptions> = {
    minimum: -9999,
    maximum: 99999,
    window: 1000,
    majorTickInterval: 100,
    minorTickFactor: 5
  };

  /** Options for the altimeter data provider. */
  public readonly dataProviderOptions: Readonly<DefaultAltimeterDataProviderOptions>;

  /** Options for the altimeter tape scale. */
  public readonly tapeScaleOptions: Readonly<AltimeterTapeScaleOptions>;

  /**
   * Creates a new AltimeterConfig from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public constructor(element: Element | undefined, factory: ConfigFactory) {
    if (element === undefined) {
      this.dataProviderOptions = { ...AltimeterConfig.DEFAULT_DATA_OPTIONS };
      this.tapeScaleOptions = { ...AltimeterConfig.DEFAULT_TAPE_SCALE_OPTIONS };
    } else {
      if (element.tagName !== 'Altimeter') {
        throw new Error(`Invalid AltimeterConfig definition: expected tag name 'Altimeter' but was '${element.tagName}'`);
      }

      const inheritFromId = element.getAttribute('inherit');
      const inheritFromElement = inheritFromId === null
        ? null
        : element.ownerDocument.querySelector(`Altimeter[id='${inheritFromId}']`);

      const inheritData = inheritFromElement ? new AltimeterConfigData(inheritFromElement) : undefined;
      const data = new AltimeterConfigData(element);

      this.dataProviderOptions = {} as DefaultAltimeterDataProviderOptions;
      for (const key in AltimeterConfig.DEFAULT_DATA_OPTIONS) {
        (this.dataProviderOptions as any)[key] = (data.dataProviderOptions as any)?.[key]
          ?? (inheritData?.dataProviderOptions as any)?.[key]
          ?? (AltimeterConfig.DEFAULT_DATA_OPTIONS as any)[key];
      }

      this.tapeScaleOptions = {} as AltimeterTapeScaleOptions;
      for (const key in AltimeterConfig.DEFAULT_TAPE_SCALE_OPTIONS) {
        (this.tapeScaleOptions as any)[key] = (data.tapeScaleOptions as any)?.[key]
          ?? (inheritData?.tapeScaleOptions as any)?.[key]
          ?? (AltimeterConfig.DEFAULT_TAPE_SCALE_OPTIONS as any)[key];
      }
    }
  }
}

/**
 * An object containing PFD altimeter config data parsed from an XML document element.
 */
class AltimeterConfigData {
  /** Options for the altimeter data provider. */
  public readonly dataProviderOptions?: Readonly<Partial<DefaultAltimeterDataProviderOptions>>;

  /** Options for the altimeter tape scale. */
  public readonly tapeScaleOptions?: Readonly<Partial<AltimeterTapeScaleOptions>>;

  /**
   * Creates a new AltimeterConfigData from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element | undefined) {
    if (element === undefined) {
      return;
    }

    this.dataProviderOptions = this.parseDataProviderOptions(element);
    this.tapeScaleOptions = this.parseScaleOptions(element);
  }

  /**
   * Parses data provider options from a configuration document element.
   * @param element A configuration document element.
   * @returns Data provider options defined by the specified element.
   * @throws Error if the specified element has an invalid format.
   */
  private parseDataProviderOptions(element: Element): Partial<DefaultAltimeterDataProviderOptions> {
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
  private parseScaleOptions(element: Element): Partial<AltimeterTapeScaleOptions> | undefined {
    const scale = element.querySelector(':scope>Scale');

    if (scale === null) {
      return undefined;
    }

    const scaleOptions = {
      minimum: undefined as number | undefined,
      maximum: undefined as number | undefined,
      window: undefined as number | undefined,
      majorTickInterval: undefined as number | undefined,
      minorTickFactor: undefined as number | undefined
    };

    scaleOptions.minimum = Number(scale.getAttribute('min') ?? NaN);
    scaleOptions.maximum = Number(scale.getAttribute('max') ?? NaN);
    scaleOptions.window = Number(scale.getAttribute('window') ?? NaN);
    scaleOptions.majorTickInterval = Number(scale.getAttribute('major-tick-interval') ?? NaN);
    scaleOptions.minorTickFactor = Number(scale.getAttribute('minor-tick-factor') ?? NaN);

    for (const key in scaleOptions) {
      if (isNaN(scaleOptions[key as keyof typeof scaleOptions] as number)) {
        console.warn(`Invalid AltimeterConfig definition: invalid scale option '${key}'`);
        scaleOptions[key as keyof typeof scaleOptions] = undefined;
      }
    }

    return scaleOptions;
  }
}

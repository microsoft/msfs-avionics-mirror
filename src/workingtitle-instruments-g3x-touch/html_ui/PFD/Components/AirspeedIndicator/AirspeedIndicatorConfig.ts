import {
  AirspeedDefinitionFactory, AirspeedIndicatorColorRange, AirspeedIndicatorColorRangeColor, AirspeedIndicatorColorRangeWidth,
  AirspeedIndicatorDataProviderOptions
} from '@microsoft/msfs-garminsdk';

import { Config, ConfigFactory } from '../../../Shared/Config/Config';
import { NumericConfig } from '../../../Shared/Config/NumericConfig';
import { ColorRangeConfig } from './ColorRangeConfig';
import { G3XAirspeedTapeScaleOptions } from './G3XAirspeedIndicator';
import { VSpeedBugConfig } from './VSpeedBugConfig';

/**
 * A configuration object which defines airspeed indicator options.
 */
export class AirspeedIndicatorConfig implements Config {
  private static readonly DEFAULT_DATA_OPTIONS: Readonly<AirspeedIndicatorDataProviderOptions> = {
    trendLookahead: 6,
    overspeedThreshold: () => {
      const vne = Simplane.getDesignSpeeds().VNe;
      return {
        value: vne > 60 ? vne : Number.POSITIVE_INFINITY
      };
    },
    underspeedThreshold: () => {
      return {
        value: Simplane.getDesignSpeeds().VS0
      };
    }
  };

  private static readonly DEFAULT_TAPE_SCALE_OPTIONS: Readonly<G3XAirspeedTapeScaleOptions> = {
    minimum: 20,
    maximum: 999,
    window: 70,
    majorTickInterval: 10,
    minorTickFactor: 2
  };

  /** Options for the airspeed indicator data provider. */
  public readonly dataProviderOptions: Readonly<AirspeedIndicatorDataProviderOptions>;

  /** Options for the airspeed tape scale. */
  public readonly tapeScaleOptions: Readonly<G3XAirspeedTapeScaleOptions>;

  /** Color range definitions for the airspeed tape. */
  public readonly colorRangeDefinitions: readonly AirspeedIndicatorColorRange[];

  /** Reference V-speed bug config options for the airspeed indicator. */
  public readonly vSpeedBugConfigs: readonly VSpeedBugConfig[];

  /**
   * Creates a new AirspeedIndicatorConfig from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   */
  public constructor(element: Element | undefined, factory: ConfigFactory) {
    if (element === undefined) {
      this.dataProviderOptions = { ...AirspeedIndicatorConfig.DEFAULT_DATA_OPTIONS };
      this.tapeScaleOptions = { ...AirspeedIndicatorConfig.DEFAULT_TAPE_SCALE_OPTIONS };
      this.colorRangeDefinitions = this.getDefaultColorRangeDefinitions(this.tapeScaleOptions);
      this.vSpeedBugConfigs = this.getDefaultVSpeedBugOptions();
    } else {
      if (element.tagName !== 'AirspeedIndicator') {
        throw new Error(`Invalid AirspeedIndicatorConfig definition: expected tag name 'AirspeedIndicator' but was '${element.tagName}'`);
      }

      const dataProviderOptions = {} as AirspeedIndicatorDataProviderOptions;
      const tapeScaleOptions = {} as G3XAirspeedTapeScaleOptions;

      const inheritFromId = element.getAttribute('inherit');
      const inheritFromElement = inheritFromId === null
        ? null
        : element.ownerDocument.querySelector(`AirspeedIndicator[id='${inheritFromId}']`);

      const inheritData = inheritFromElement ? new AirspeedIndicatorConfigData(inheritFromElement, factory) : undefined;
      const data = new AirspeedIndicatorConfigData(element, factory);

      for (const key in AirspeedIndicatorConfig.DEFAULT_DATA_OPTIONS) {
        (dataProviderOptions as any)[key] = (data.dataProviderOptions as any)?.[key]
          ?? (inheritData?.dataProviderOptions as any)?.[key]
          ?? (AirspeedIndicatorConfig.DEFAULT_DATA_OPTIONS as any)[key];
      }
      this.dataProviderOptions = dataProviderOptions;

      for (const key in AirspeedIndicatorConfig.DEFAULT_TAPE_SCALE_OPTIONS) {
        (tapeScaleOptions as any)[key] = (data.tapeScaleOptions as any)?.[key]
          ?? (inheritData?.tapeScaleOptions as any)?.[key]
          ?? (AirspeedIndicatorConfig.DEFAULT_TAPE_SCALE_OPTIONS as any)[key];
      }
      this.tapeScaleOptions = tapeScaleOptions;

      this.colorRangeDefinitions = data.colorRangeDefinitions ?? inheritData?.colorRangeDefinitions ?? this.getDefaultColorRangeDefinitions(this.tapeScaleOptions);
      this.vSpeedBugConfigs = data.vSpeedBugConfigs ?? inheritData?.vSpeedBugConfigs ?? this.getDefaultVSpeedBugOptions();
    }
  }

  /**
   * Gets a default set of color range definitions. The set includes the following ranges (in order):
   * 1. RED: Flaps extended stall range (tape minimum to Vs0).
   * 2. WHITE: Flaps extended operating range (Vs0 to Vfe).
   * 3. GREEN (half): Flaps extended or retracted operating range (Vs1 to Vfe).
   * 4. GREEN (full): Flaps retracted operating range (Vfe to Vno).
   * 5. YELLOW: Overspeed caution range (Vno to Vne).
   * 6. BARBER POLE: Overspeed range (Vne to tape maximum).
   * @param tapeScaleOptions Options describing the airspeed tape scale.
   * @returns A array containing a default set of color range definitions.
   */
  private getDefaultColorRangeDefinitions(tapeScaleOptions: Readonly<G3XAirspeedTapeScaleOptions>): AirspeedIndicatorColorRange[] {
    return [
      // Flaps extended stall range
      {
        width: AirspeedIndicatorColorRangeWidth.Full,
        color: AirspeedIndicatorColorRangeColor.Red,
        minimum: () => {
          return {
            value: tapeScaleOptions.minimum
          };
        },
        maximum: () => {
          return {
            value: Simplane.getDesignSpeeds().VS0
          };
        }
      },

      // Flaps extended operating range
      {
        width: AirspeedIndicatorColorRangeWidth.Full,
        color: AirspeedIndicatorColorRangeColor.White,
        minimum: () => {
          return {
            value: Simplane.getDesignSpeeds().VS0
          };
        },
        maximum: () => {
          return {
            value: Simplane.getDesignSpeeds().VFe
          };
        }
      },

      // Flaps retracted/extended operating range
      {
        width: AirspeedIndicatorColorRangeWidth.Half,
        color: AirspeedIndicatorColorRangeColor.Green,
        minimum: () => {
          return {
            value: Simplane.getDesignSpeeds().VS1
          };
        },
        maximum: () => {
          return {
            value: Simplane.getDesignSpeeds().VFe
          };
        }
      },

      // Flaps retracted operating range
      {
        width: AirspeedIndicatorColorRangeWidth.Full,
        color: AirspeedIndicatorColorRangeColor.Green,
        minimum: () => {
          return {
            value: Simplane.getDesignSpeeds().VFe
          };
        },
        maximum: () => {
          return {
            value: Simplane.getDesignSpeeds().VNo
          };
        }
      },

      // Overspeed caution range
      {
        width: AirspeedIndicatorColorRangeWidth.Full,
        color: AirspeedIndicatorColorRangeColor.Yellow,
        minimum: () => {
          return {
            value: Simplane.getDesignSpeeds().VNo
          };
        },
        maximum: () => {
          return {
            value: Simplane.getDesignSpeeds().VNe
          };
        }
      },

      // Barber pole
      {
        width: AirspeedIndicatorColorRangeWidth.Full,
        color: AirspeedIndicatorColorRangeColor.BarberPole,
        minimum: () => {
          return {
            value: Simplane.getDesignSpeeds().VNe
          };
        },
        maximum: () => {
          return {
            value: tapeScaleOptions.maximum
          };
        }
      }
    ];
  }

  /**
   * Gets a default set of V-speed bug configuration objects. The set includes configurations for the following bugs
   * (in order):
   * 1. V-speed name: `glide`, Bug label: `G`.
   * 2. V-speed name: `r`, Bug label: `R`.
   * 3. V-speed name: `x`, Bug label: `X`.
   * 4. V-speed name: `y`, Bug label: `Y`.
   * @returns A array containing a default set of V-speed bug configuration objects.
   */
  private getDefaultVSpeedBugOptions(): VSpeedBugConfig[] {
    return [
      new VSpeedBugConfig('glide', 'G'),
      new VSpeedBugConfig('r', 'R'),
      new VSpeedBugConfig('x', 'X'),
      new VSpeedBugConfig('y', 'Y')
    ];
  }
}

/**
 * An object containing PFD airspeed indicator config data parsed from an XML document element.
 */
class AirspeedIndicatorConfigData {
  /** Options for the airspeed indicator data provider. */
  public readonly dataProviderOptions?: Readonly<Partial<AirspeedIndicatorDataProviderOptions>>;

  /** Options for the airspeed tape scale. */
  public readonly tapeScaleOptions?: Readonly<Partial<G3XAirspeedTapeScaleOptions>>;

  /** Color range definitions for the airspeed tape. */
  public readonly colorRangeDefinitions?: readonly AirspeedIndicatorColorRange[];

  /** Reference V-speed bug config options for the airspeed indicator. */
  public readonly vSpeedBugConfigs?: readonly VSpeedBugConfig[];

  /**
   * Creates a new AirspeedIndicatorConfigData from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   */
  public constructor(element: Element | undefined, factory: ConfigFactory) {
    if (element === undefined) {
      return;
    }

    try {
      this.dataProviderOptions = this.parseDataProviderOptions(element, factory);
    } catch (e) {
      console.warn(e);
      this.dataProviderOptions = undefined;
    }

    try {
      this.tapeScaleOptions = this.parseScaleOptions(element);
    } catch (e) {
      console.warn(e);
      this.tapeScaleOptions = undefined;
    }
    try {
      this.colorRangeDefinitions = this.parseColorRangeDefinitions(element, factory);
    } catch (e) {
      console.warn(e);
      this.colorRangeDefinitions = undefined;
    }

    try {
      this.vSpeedBugConfigs = this.parseVSpeedBugOptions(element);
    } catch (e) {
      console.warn(e);
      this.vSpeedBugConfigs = undefined;
    }
  }

  /**
   * Parses data provider options from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   * @returns Data provider options defined by the specified element.
   * @throws Error if the specified element has an invalid format.
   */
  private parseDataProviderOptions(element: Element, factory: ConfigFactory): Partial<AirspeedIndicatorDataProviderOptions> | undefined {
    let trendLookahead: number | undefined;
    let overspeedThreshold: AirspeedDefinitionFactory | undefined;
    let underspeedThreshold: AirspeedDefinitionFactory | undefined;

    const trendVector = element.querySelector(':scope>TrendVector');
    if (trendVector !== null) {
      trendLookahead = Number(trendVector.getAttribute('lookahead') ?? 'NaN');

      if (isNaN(trendLookahead)) {
        trendLookahead = undefined;
      }
    }

    const alerts = element.querySelector(':scope>SpeedAlerts');

    if (alerts !== null) {
      const overspeed = alerts.querySelector(':scope>Overspeed');
      overspeedThreshold = this.parseSpeedAlertThreshold(overspeed, factory);

      const underspeed = alerts.querySelector(':scope>Underspeed');
      underspeedThreshold = this.parseSpeedAlertThreshold(underspeed, factory);
    }

    return {
      trendLookahead,
      overspeedThreshold,
      underspeedThreshold
    };
  }

  /**
   * Parses a factory for a speed alert threshold airspeed value from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   * @returns A factory for a speed alert threshold airspeed value defined by the specified element, or `undefined` if
   * `element` is `undefined`.
   * @throws Error if the specified element has an invalid format.
   */
  private parseSpeedAlertThreshold(element: Element | null, factory: ConfigFactory): AirspeedDefinitionFactory | undefined {
    const child = element?.children[0] ?? undefined;
    if (child === undefined) {
      return undefined;
    }

    try {
      const config = factory.create(child);

      if (config === undefined || !('isNumericConfig' in config)) {
        console.warn('Invalid AirspeedIndicatorConfig definition: speed alert threshold is not a numeric config');
        return undefined;
      }

      return (config as NumericConfig).resolve();
    } catch (e) {
      console.warn(e);
    }

    return undefined;
  }

  /**
   * Parses tape scale options from a configuration document element.
   * @param element A configuration document element.
   * @returns Tape scale options defined by the specified element.
   * @throws Error if the specified element has an invalid format.
   */
  private parseScaleOptions(element: Element): Partial<G3XAirspeedTapeScaleOptions> | undefined {
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

    scaleOptions.minimum = Number(scale.getAttribute('min') ?? 'NaN');
    scaleOptions.maximum = Number(scale.getAttribute('max') ?? 'NaN');
    scaleOptions.window = Number(scale.getAttribute('window') ?? 'NaN');
    scaleOptions.majorTickInterval = Number(scale.getAttribute('major-tick-interval') ?? 'NaN');
    scaleOptions.minorTickFactor = Number(scale.getAttribute('minor-tick-factor') ?? 'NaN');

    for (const key in scaleOptions) {
      if (isNaN(scaleOptions[key as keyof typeof scaleOptions] as number)) {
        console.warn(`Invalid AirspeedIndicatorConfig definition: invalid scale option '${key}'`);
        scaleOptions[key as keyof typeof scaleOptions] = undefined;
      }
    }

    return scaleOptions;
  }

  /**
   * Parses color range definitions from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   * @returns Color range definitions defined by the specified element.
   */
  private parseColorRangeDefinitions(element: Element, factory: ConfigFactory): readonly AirspeedIndicatorColorRange[] | undefined {
    const colorRanges = element.querySelector(':scope>ColorRanges');
    if (colorRanges === null) {
      return undefined;
    } else {
      return Array.from(colorRanges.querySelectorAll(':scope>ColorRange')).map(colorRangeElement => {
        try {
          return new ColorRangeConfig(colorRangeElement, factory).resolve();
        } catch (e) {
          console.warn(e);
          return null;
        }
      }).filter(def => def !== null) as readonly AirspeedIndicatorColorRange[];
    }
  }

  /**
   * Parses reference V-speed bug definitions from a configuration document element.
   * @param element A configuration document element.
   * @returns Reference V-speed bug definitions defined by the specified element.
   */
  private parseVSpeedBugOptions(element: Element): readonly VSpeedBugConfig[] | undefined {
    const vSpeedBugs = element.querySelector(':scope>VSpeedBugs');
    if (vSpeedBugs === null) {
      return undefined;
    } else {
      return Array.from(vSpeedBugs.querySelectorAll(':scope>Bug')).map(vSpeedBugElement => {
        try {
          return new VSpeedBugConfig(vSpeedBugElement);
        } catch (e) {
          console.warn(e);
          return null;
        }
      }).filter(def => def !== null) as readonly VSpeedBugConfig[];
    }
  }
}
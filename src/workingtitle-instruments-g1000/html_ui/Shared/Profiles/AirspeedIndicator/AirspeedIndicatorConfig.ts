import {
  AirspeedDefinitionFactory, AirspeedIndicatorBottomDisplayMode, AirspeedIndicatorBottomDisplayOptions, AirspeedIndicatorColorRange,
  AirspeedIndicatorColorRangeColor, AirspeedIndicatorColorRangeWidth, AirspeedIndicatorDataProviderOptions, AirspeedTapeScaleOptions
} from '@microsoft/msfs-garminsdk';

import { Config, ConfigFactory } from '../../Config/Config';
import { NumericConfig } from '../../Config/NumericConfig';
import { ColorRangeConfig } from './ColorRangeConfig';
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

  private static readonly DEFAULT_TAPE_SCALE_OPTIONS: Readonly<AirspeedTapeScaleOptions> = {
    minimum: 20,
    maximum: 999,
    window: 60,
    majorTickInterval: 10,
    minorTickFactor: 2
  };

  private static readonly DEFAULT_BOTTOM_OPTIONS: Readonly<AirspeedIndicatorBottomDisplayOptions> = {
    mode: AirspeedIndicatorBottomDisplayMode.TrueAirspeed,
    machThreshold: undefined
  };

  /** Options for the airspeed indicator data provider. */
  public readonly dataProviderOptions: Readonly<AirspeedIndicatorDataProviderOptions>;

  /** Options for the airspeed tape scale. */
  public readonly tapeScaleOptions: Readonly<AirspeedTapeScaleOptions>;

  /** Color range definitions for the airspeed tape. */
  public readonly colorRangeDefinitions: readonly AirspeedIndicatorColorRange[];

  /** Options for the bottom display box. */
  public readonly bottomDisplayOptions: Readonly<AirspeedIndicatorBottomDisplayOptions>;

  /** Reference V-speed bug config options for the airspeed indicator. */
  public readonly vSpeedBugConfigs: readonly VSpeedBugConfig[];

  /**
   * Creates a new AirspeedIndicatorConfig from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   */
  constructor(element: Element | undefined, factory: ConfigFactory) {
    if (element === undefined) {
      this.dataProviderOptions = { ...AirspeedIndicatorConfig.DEFAULT_DATA_OPTIONS };
      this.tapeScaleOptions = { ...AirspeedIndicatorConfig.DEFAULT_TAPE_SCALE_OPTIONS };
      this.colorRangeDefinitions = this.getDefaultColorRangeDefinitions(this.tapeScaleOptions);
      this.bottomDisplayOptions = { ...AirspeedIndicatorConfig.DEFAULT_BOTTOM_OPTIONS };
      this.vSpeedBugConfigs = this.getDefaultVSpeedBugOptions();
    } else {
      if (element.tagName !== 'AirspeedIndicator') {
        throw new Error(`Invalid AirspeedIndicatorConfig definition: expected tag name 'AirspeedIndicator' but was '${element.tagName}'`);
      }

      try {
        this.dataProviderOptions = this.parseDataProviderOptions(element, factory);
      } catch (e) {
        console.warn(e);
        this.dataProviderOptions = { ...AirspeedIndicatorConfig.DEFAULT_DATA_OPTIONS };
      }

      try {
        this.tapeScaleOptions = this.parseScaleOptions(element);
      } catch (e) {
        console.warn(e);
        this.tapeScaleOptions = { ...AirspeedIndicatorConfig.DEFAULT_TAPE_SCALE_OPTIONS };
      }

      try {
        this.colorRangeDefinitions = this.parseColorRangeDefinitions(element, factory, this.tapeScaleOptions);
      } catch (e) {
        console.warn(e);
        this.colorRangeDefinitions = this.getDefaultColorRangeDefinitions(this.tapeScaleOptions);
      }

      try {
        this.bottomDisplayOptions = this.parseBottomDisplayOptions(element);
      } catch (e) {
        console.warn(e);
        this.bottomDisplayOptions = { ...AirspeedIndicatorConfig.DEFAULT_BOTTOM_OPTIONS };
      }

      try {
        this.vSpeedBugConfigs = this.parseVSpeedBugOptions(element);
      } catch (e) {
        console.warn(e);
        this.vSpeedBugConfigs = this.getDefaultVSpeedBugOptions();
      }
    }
  }

  /**
   * Parses data provider options from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   * @returns Data provider options defined by the specified element.
   * @throws Error if the specified element has an invalid format.
   */
  private parseDataProviderOptions(element: Element, factory: ConfigFactory): AirspeedIndicatorDataProviderOptions {
    const options: Partial<AirspeedIndicatorDataProviderOptions> = {};

    const trendVector = element.querySelector(':scope>TrendVector');
    if (trendVector !== null) {
      const trendLookahead = Number(trendVector.getAttribute('lookahead') ?? undefined);

      if (isFinite(trendLookahead) && trendLookahead > 0) {
        options.trendLookahead = trendLookahead;
      } else {
        console.warn('Invalid AirspeedIndicatorConfig definition: unrecognized trend vector lookahead option (must be a positive number). Defaulting to 6.');
      }
    }

    const alerts = element.querySelector(':scope>SpeedAlerts');

    if (alerts !== null) {
      const overspeed = alerts.querySelector(':scope>Overspeed');
      options.overspeedThreshold = this.parseSpeedAlertThreshold(overspeed, factory);

      const underspeed = alerts.querySelector(':scope>Underspeed');
      options.underspeedThreshold = this.parseSpeedAlertThreshold(underspeed, factory);
    }

    options.trendLookahead ??= AirspeedIndicatorConfig.DEFAULT_DATA_OPTIONS.trendLookahead;
    options.overspeedThreshold ??= AirspeedIndicatorConfig.DEFAULT_DATA_OPTIONS.overspeedThreshold;
    options.underspeedThreshold ??= AirspeedIndicatorConfig.DEFAULT_DATA_OPTIONS.underspeedThreshold;

    return options as AirspeedIndicatorDataProviderOptions;
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
  private parseScaleOptions(element: Element): AirspeedTapeScaleOptions {
    const scale = element.querySelector(':scope>Scale');

    if (scale === null) {
      return { ...AirspeedIndicatorConfig.DEFAULT_TAPE_SCALE_OPTIONS };
    }

    const scaleOptions: Partial<AirspeedTapeScaleOptions> = {
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
      const typedKey = key as keyof AirspeedTapeScaleOptions;

      if (isNaN(scaleOptions[typedKey] as number)) {
        console.warn(`Invalid AirspeedIndicatorConfig definition: invalid scale option '${key}'`);
        scaleOptions[typedKey] = undefined;
      }

      if (scaleOptions[typedKey] === undefined) {
        scaleOptions[typedKey] = AirspeedIndicatorConfig.DEFAULT_TAPE_SCALE_OPTIONS[typedKey];
      }
    }

    return scaleOptions as AirspeedTapeScaleOptions;
  }

  /**
   * Parses color range definitions from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   * @param tapeScaleOptions Options describing the airspeed tape scale.
   * @returns Color range definitions defined by the specified element.
   */
  private parseColorRangeDefinitions(element: Element, factory: ConfigFactory, tapeScaleOptions: Readonly<AirspeedTapeScaleOptions>): readonly AirspeedIndicatorColorRange[] {
    const colorRanges = element.querySelector(':scope>ColorRanges');
    if (colorRanges === null) {
      return this.getDefaultColorRangeDefinitions(tapeScaleOptions);
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
  private getDefaultColorRangeDefinitions(tapeScaleOptions: Readonly<AirspeedTapeScaleOptions>): AirspeedIndicatorColorRange[] {
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
   * Parses bottom display box options from a configuration document element.
   * @param element A configuration document element.
   * @returns Bottom display box options defined by the specified element.
   * @throws Error if the specified element has an invalid format.
   */
  private parseBottomDisplayOptions(element: Element): AirspeedIndicatorBottomDisplayOptions {
    const bottomDisplay = element.querySelector(':scope>BottomDisplay');

    if (bottomDisplay === null) {
      return { ...AirspeedIndicatorConfig.DEFAULT_BOTTOM_OPTIONS };
    } else {
      let mode = bottomDisplay.getAttribute('mode');
      switch (mode) {
        case AirspeedIndicatorBottomDisplayMode.TrueAirspeed:
        case AirspeedIndicatorBottomDisplayMode.Mach:
          break;
        case null:
          mode = AirspeedIndicatorBottomDisplayMode.TrueAirspeed;
          break;
        default:
          console.warn(`Invalid AirspeedIndicatorConfig definition: unrecognized bottom display mode '${mode}'. Defaulting to 'Tas'.`);
          mode = AirspeedIndicatorBottomDisplayMode.TrueAirspeed;
      }

      let machThreshold: number | undefined;
      const machThresholdAttr = bottomDisplay.getAttribute('mach-threshold');
      if (machThresholdAttr !== null) {
        machThreshold = Number(machThresholdAttr);
        if (isNaN(machThreshold)) {
          console.warn('Invalid AirspeedIndicatorConfig definition: invalid bottom display mach threshold option. Discarding value.');
          machThreshold = undefined;
        }
      }

      return {
        mode: mode as AirspeedIndicatorBottomDisplayMode,
        machThreshold
      };
    }
  }

  /**
   * Parses reference V-speed bug configuration objects from a configuration document element.
   * @param element A configuration document element.
   * @returns Reference V-speed bug configuration objects defined by the specified element.
   */
  private parseVSpeedBugOptions(element: Element): VSpeedBugConfig[] {
    const vSpeedBugs = element.querySelector(':scope>VSpeedBugs');
    if (vSpeedBugs === null) {
      return this.getDefaultVSpeedBugOptions();
    } else {
      return Array.from(vSpeedBugs.querySelectorAll(':scope>Bug')).map(vSpeedBugElement => {
        try {
          return new VSpeedBugConfig(vSpeedBugElement);
        } catch (e) {
          console.warn(e);
          return null;
        }
      }).filter(def => def !== null) as VSpeedBugConfig[];
    }
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
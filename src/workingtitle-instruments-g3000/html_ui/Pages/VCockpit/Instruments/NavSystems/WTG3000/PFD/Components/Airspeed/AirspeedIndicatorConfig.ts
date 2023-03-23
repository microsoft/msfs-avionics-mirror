import {
  AirspeedDefinitionFactory, AirspeedIndicatorBottomDisplayMode, AirspeedIndicatorBottomDisplayOptions, AirspeedIndicatorColorRange,
  AirspeedIndicatorDataProviderOptions, AirspeedTapeScaleOptions
} from '@microsoft/msfs-garminsdk';
import { Config, ConfigFactory, NumericConfig } from '@microsoft/msfs-wtg3000-common';

import { ColorRangeConfig } from './ColorRangeConfig';
import { VSpeedBugConfig } from './VSpeedBugConfig';

/**
 * Make all properties in T mutable.
 */
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * A configuration object which defines airspeed indicator options.
 */
export class AirspeedIndicatorConfig implements Config {
  /** Options for the airspeed indicator data provider. */
  public readonly dataProviderOptions: Readonly<Partial<AirspeedIndicatorDataProviderOptions>>;

  /** Options for the airspeed tape scale. */
  public readonly tapeScaleOptions: Readonly<Partial<AirspeedTapeScaleOptions>>;

  /** Color range definitions for the airspeed tape. */
  public readonly colorRangeDefinitions?: readonly AirspeedIndicatorColorRange[];

  /** Options for the bottom display box. */
  public readonly bottomDisplayOptions: Readonly<Partial<AirspeedIndicatorBottomDisplayOptions>>;

  /** Reference V-speed bug config options for the airspeed indicator. */
  public readonly vSpeedBugConfigs?: readonly VSpeedBugConfig[];

  /**
   * Creates a new AirspeedIndicatorConfig from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   */
  constructor(element: Element | undefined, factory: ConfigFactory) {
    if (element === undefined) {
      this.dataProviderOptions = {};
      this.tapeScaleOptions = {};
      this.colorRangeDefinitions = undefined;
      this.bottomDisplayOptions = {};
      this.vSpeedBugConfigs = undefined;
    } else {
      if (element.tagName !== 'AirspeedIndicator') {
        throw new Error(`Invalid AirspeedIndicatorConfig definition: expected tag name 'AirspeedIndicator' but was '${element.tagName}'`);
      }

      try {
        this.dataProviderOptions = this.parseDataProviderOptions(element, factory);
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

      try {
        this.colorRangeDefinitions = this.parseColorRangeDefinitions(element, factory);
      } catch (e) {
        console.warn(e);
        this.colorRangeDefinitions = undefined;
      }

      try {
        this.bottomDisplayOptions = this.parseBottomDisplayOptions(element);
      } catch (e) {
        console.warn(e);
        this.bottomDisplayOptions = {};
      }

      try {
        this.vSpeedBugConfigs = this.parseVSpeedBugOptions(element);
      } catch (e) {
        console.warn(e);
        this.vSpeedBugConfigs = undefined;
      }

      const inheritFromId = element.getAttribute('inherit');
      const inheritFromElement = inheritFromId === null
        ? null
        : element.ownerDocument.querySelector(`AirspeedIndicator[id='${inheritFromId}']`);

      this.inheritFrom(inheritFromElement, factory);
    }
  }

  /**
   * Parses data provider options from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   * @returns Data provider options defined by the specified element.
   * @throws Error if the specified element has an invalid format.
   */
  private parseDataProviderOptions(element: Element, factory: ConfigFactory): Partial<AirspeedIndicatorDataProviderOptions> {
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
      overspeedThreshold = this.parseSpeedAlertThreshold(overspeed, factory) ?? ((): number => Number.POSITIVE_INFINITY);

      const underspeed = alerts.querySelector(':scope>Underspeed');
      underspeedThreshold = this.parseSpeedAlertThreshold(underspeed, factory) ?? ((): number => Number.NEGATIVE_INFINITY);
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
  private parseScaleOptions(element: Element): Partial<AirspeedTapeScaleOptions> {
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
   * Parses bottom display box options from a configuration document element.
   * @param element A configuration document element.
   * @returns Bottom display box options defined by the specified element.
   * @throws Error if the specified element has an invalid format.
   */
  private parseBottomDisplayOptions(element: Element): Partial<AirspeedIndicatorBottomDisplayOptions> {
    const bottomDisplay = element.querySelector(':scope>BottomDisplay');

    if (bottomDisplay === null) {
      return {
        mode: undefined
      };
    } else {
      let mode: string | undefined = bottomDisplay.getAttribute('mode') ?? undefined;
      switch (mode) {
        case AirspeedIndicatorBottomDisplayMode.TrueAirspeed:
        case AirspeedIndicatorBottomDisplayMode.Mach:
          break;
        default:
          console.warn(`Invalid AirspeedIndicatorConfig definition: unrecognized bottom display mode '${mode}'`);
          mode = undefined;
      }

      let machThreshold: number | undefined = Number(bottomDisplay.getAttribute('mach-threshold') ?? 'NaN');

      if (isNaN(machThreshold)) {
        console.warn('Invalid AirspeedIndicatorConfig definition: invalid bottom display mach threshold option');
        machThreshold = undefined;
      }

      return {
        mode,
        machThreshold
      };
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
      const parentConfig = new AirspeedIndicatorConfig(element, factory);

      const dataProviderOptions = this.dataProviderOptions as Partial<AirspeedIndicatorDataProviderOptions>;
      dataProviderOptions.trendLookahead ??= parentConfig.dataProviderOptions.trendLookahead;
      dataProviderOptions.overspeedThreshold ??= parentConfig.dataProviderOptions.overspeedThreshold;
      dataProviderOptions.underspeedThreshold ??= parentConfig.dataProviderOptions.underspeedThreshold;

      const tapeScaleOptions = this.tapeScaleOptions as Partial<AirspeedTapeScaleOptions>;
      tapeScaleOptions.minimum ??= parentConfig.tapeScaleOptions.minimum;
      tapeScaleOptions.maximum ??= parentConfig.tapeScaleOptions.maximum;
      tapeScaleOptions.window ??= parentConfig.tapeScaleOptions.window;
      tapeScaleOptions.majorTickInterval ??= parentConfig.tapeScaleOptions.majorTickInterval;
      tapeScaleOptions.minorTickFactor ??= parentConfig.tapeScaleOptions.minorTickFactor;

      const bottomDisplayOptions = this.bottomDisplayOptions as Partial<AirspeedIndicatorBottomDisplayOptions>;
      bottomDisplayOptions.mode ??= parentConfig.bottomDisplayOptions.mode;
      bottomDisplayOptions.machThreshold ??= parentConfig.bottomDisplayOptions.machThreshold;

      (this as Mutable<AirspeedIndicatorConfig>).colorRangeDefinitions ??= parentConfig.colorRangeDefinitions;
      (this as Mutable<AirspeedIndicatorConfig>).vSpeedBugConfigs ??= parentConfig.vSpeedBugConfigs;
    } catch (e) {
      console.warn(e);
    }
  }
}
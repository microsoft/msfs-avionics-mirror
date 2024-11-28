import {
  AirspeedApproachCueBugOptions, AirspeedDefinitionFactory, AirspeedIndicatorBottomDisplayMode,
  AirspeedIndicatorBottomDisplayOptions, AirspeedIndicatorColorRange, AirspeedIndicatorDataProviderOptions,
  AirspeedTapeScaleOptions
} from '@microsoft/msfs-garminsdk';

import { Config, ConfigFactory, NumericConfig } from '@microsoft/msfs-wtg3000-common';

import { ColorRangeConfig } from './ColorRangeConfig';
import { VSpeedBugConfig } from './VSpeedBugConfig';

/**
 * Options for airspeed indicator V-speed annunciations.
 */
export type AirspeedIndicatorVSpeedAnnuncOptions = {
  /** Whether airspeed indicator V-speed annunciations are enabled. */
  enabled: boolean;
};

/**
 * A configuration object which defines airspeed indicator options.
 */
export class AirspeedIndicatorConfig implements Config {
  private static readonly DEFAULT_DATA_OPTIONS: Readonly<AirspeedIndicatorDataProviderOptions> = {
    trendLookahead: 6,
    overspeedThreshold: () => {
      return { value: Number.POSITIVE_INFINITY };
    },
    underspeedThreshold: () => {
      return { value: Number.NEGATIVE_INFINITY };
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

  private static readonly DEFAULT_VSPEED_ANNUNC_OPTIONS: Readonly<AirspeedIndicatorVSpeedAnnuncOptions> = {
    enabled: true
  };

  /** Options for the airspeed indicator data provider. */
  public readonly dataProviderOptions: Readonly<AirspeedIndicatorDataProviderOptions>;

  /** Options for the airspeed tape scale. */
  public readonly tapeScaleOptions: Readonly<AirspeedTapeScaleOptions>;

  /** Color range definitions for the airspeed tape. */
  public readonly colorRangeDefinitions?: readonly AirspeedIndicatorColorRange[];

  /** Options for the bottom display box. */
  public readonly bottomDisplayOptions: Readonly<AirspeedIndicatorBottomDisplayOptions>;

  /** Reference V-speed bug config options for the airspeed indicator. */
  public readonly vSpeedBugConfigs?: readonly VSpeedBugConfig[];

  /** Options for V-speed annunciations. */
  public readonly vSpeedAnnuncOptions: Readonly<AirspeedIndicatorVSpeedAnnuncOptions>;

  /** Options for the approach cue bug, or `undefined` if the approach cue bug should not be displayed. */
  public readonly approachCueBugOptions?: Readonly<AirspeedApproachCueBugOptions>;

  /**
   * Creates a new AirspeedIndicatorConfig from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   */
  constructor(element: Element | undefined, factory: ConfigFactory) {
    if (element === undefined) {
      this.dataProviderOptions = { ...AirspeedIndicatorConfig.DEFAULT_DATA_OPTIONS };
      this.tapeScaleOptions = { ...AirspeedIndicatorConfig.DEFAULT_TAPE_SCALE_OPTIONS };
      this.colorRangeDefinitions = undefined;
      this.bottomDisplayOptions = { ...AirspeedIndicatorConfig.DEFAULT_BOTTOM_OPTIONS };
      this.vSpeedBugConfigs = undefined;
      this.vSpeedAnnuncOptions = { ...AirspeedIndicatorConfig.DEFAULT_VSPEED_ANNUNC_OPTIONS };
    } else {
      if (element.tagName !== 'AirspeedIndicator') {
        throw new Error(`Invalid AirspeedIndicatorConfig definition: expected tag name 'AirspeedIndicator' but was '${element.tagName}'`);
      }

      const inheritFromId = element.getAttribute('inherit');
      const inheritFromElement = inheritFromId === null
        ? null
        : element.ownerDocument.querySelector(`AirspeedIndicator[id='${inheritFromId}']`);

      const inheritData = inheritFromElement ? new AirspeedIndicatorConfigData(inheritFromElement, factory) : undefined;
      const data = new AirspeedIndicatorConfigData(element, factory);

      this.dataProviderOptions = {} as AirspeedIndicatorDataProviderOptions;
      for (const key in AirspeedIndicatorConfig.DEFAULT_DATA_OPTIONS) {
        (this.dataProviderOptions as any)[key] = (data.dataProviderOptions as any)?.[key]
          ?? (inheritData?.dataProviderOptions as any)?.[key]
          ?? (AirspeedIndicatorConfig.DEFAULT_DATA_OPTIONS as any)[key];
      }

      this.tapeScaleOptions = {} as AirspeedTapeScaleOptions;
      for (const key in AirspeedIndicatorConfig.DEFAULT_TAPE_SCALE_OPTIONS) {
        (this.tapeScaleOptions as any)[key] = (data.tapeScaleOptions as any)?.[key]
          ?? (inheritData?.tapeScaleOptions as any)?.[key]
          ?? (AirspeedIndicatorConfig.DEFAULT_TAPE_SCALE_OPTIONS as any)[key];
      }

      this.bottomDisplayOptions = {} as AirspeedIndicatorBottomDisplayOptions;
      for (const key in AirspeedIndicatorConfig.DEFAULT_BOTTOM_OPTIONS) {
        (this.bottomDisplayOptions as any)[key] = (data.bottomDisplayOptions as any)?.[key]
          ?? (inheritData?.bottomDisplayOptions as any)?.[key]
          ?? (AirspeedIndicatorConfig.DEFAULT_BOTTOM_OPTIONS as any)[key];
      }

      this.vSpeedAnnuncOptions = {} as AirspeedIndicatorVSpeedAnnuncOptions;
      for (const key in AirspeedIndicatorConfig.DEFAULT_VSPEED_ANNUNC_OPTIONS) {
        (this.vSpeedAnnuncOptions as any)[key] = (data.vSpeedAnnuncOptions as any)?.[key]
          ?? (inheritData?.vSpeedAnnuncOptions as any)?.[key]
          ?? (AirspeedIndicatorConfig.DEFAULT_VSPEED_ANNUNC_OPTIONS as any)[key];
      }

      this.colorRangeDefinitions = data.colorRangeDefinitions ?? inheritData?.colorRangeDefinitions;
      this.vSpeedBugConfigs = data.vSpeedBugConfigs ?? inheritData?.vSpeedBugConfigs;
      this.approachCueBugOptions = data.approachCueBugOptions ?? inheritData?.approachCueBugOptions;
    }
  }
}

/**
 * An object containing PFD airspeed indicator config data parsed from an XML document element.
 */
class AirspeedIndicatorConfigData {
  /** Options for the airspeed indicator data provider. */
  public readonly dataProviderOptions?: Readonly<Partial<AirspeedIndicatorDataProviderOptions>>;

  /** Options for the airspeed tape scale. */
  public readonly tapeScaleOptions?: Readonly<Partial<AirspeedTapeScaleOptions>>;

  /** Color range definitions for the airspeed tape. */
  public readonly colorRangeDefinitions?: readonly AirspeedIndicatorColorRange[];

  /** Options for the bottom display box. */
  public readonly bottomDisplayOptions?: Readonly<Partial<AirspeedIndicatorBottomDisplayOptions>>;

  /** Reference V-speed bug config options for the airspeed indicator. */
  public readonly vSpeedBugConfigs?: readonly VSpeedBugConfig[];

  /**
   * Options for V-speed annunciations.
   */
  public readonly vSpeedAnnuncOptions?: Readonly<Partial<AirspeedIndicatorVSpeedAnnuncOptions>>;

  /** Options for the approach cue bug. */
  public readonly approachCueBugOptions?: Readonly<AirspeedApproachCueBugOptions>;

  /**
   * Creates a new AirspeedIndicatorConfigData from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   */
  public constructor(element: Element | undefined, factory: ConfigFactory) {
    if (element === undefined) {
      return;
    }

    this.dataProviderOptions = this.parseDataProviderOptions(element, factory);
    this.tapeScaleOptions = this.parseScaleOptions(element);
    this.colorRangeDefinitions = this.parseColorRangeDefinitions(element, factory);
    this.bottomDisplayOptions = this.parseBottomDisplayOptions(element);
    this.vSpeedBugConfigs = this.parseVSpeedBugOptions(element);
    this.vSpeedAnnuncOptions = this.parseVSpeedAnnuncOptions(element);
    this.approachCueBugOptions = this.parseApproachCueBugOptions(element, factory);
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
   * `element` is `null`.
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
  private parseScaleOptions(element: Element): Partial<AirspeedTapeScaleOptions> | undefined {
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
   * Parses bottom display box options from a configuration document element.
   * @param element A configuration document element.
   * @returns Bottom display box options defined by the specified element.
   * @throws Error if the specified element has an invalid format.
   */
  private parseBottomDisplayOptions(element: Element): Partial<AirspeedIndicatorBottomDisplayOptions> | undefined {
    const bottomDisplay = element.querySelector(':scope>BottomDisplay');

    if (bottomDisplay === null) {
      return undefined;
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
   * Parses reference V-speed annunciation options from a configuration document element.
   * @param element A configuration document element.
   * @returns Reference V-speed annunciation options defined by the specified element.
   */
  private parseVSpeedAnnuncOptions(element: Element): Partial<AirspeedIndicatorVSpeedAnnuncOptions> | undefined {
    const vSpeedAnnuncElement = element.querySelector(':scope>VSpeedAnnunc');
    if (vSpeedAnnuncElement === null) {
      return undefined;
    } else {
      let enabled: boolean | undefined = undefined;
      const enabledAttr = vSpeedAnnuncElement.getAttribute('enabled')?.toLowerCase();
      switch (enabledAttr) {
        case 'true':
          enabled = true;
          break;
        case 'false':
          enabled = false;
          break;
        case undefined:
          break;
        default:
          console.warn('Invalid AirspeedIndicatorConfig definition: invalid V-speed annunciations "enabled" option (must be "true" or "false")');
      }

      return { enabled };
    }
  }

  /**
   * Parses approach cue bug options from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   * @returns Approach cue bug options defined by the specified element.
   */
  private parseApproachCueBugOptions(element: Element, factory: ConfigFactory): AirspeedApproachCueBugOptions | undefined {
    const approachCueBugElement = element.querySelector(':scope>ApproachCueBug');
    if (approachCueBugElement === null) {
      return undefined;
    } else {
      const speedElement = approachCueBugElement.querySelector(':scope>Value');
      const child = speedElement?.children[0] ?? undefined;
      if (child === undefined) {
        console.warn('Invalid AirspeedIndicatorConfig definition: missing approach cue bug speed value. Discarding approach cue bug options.');
        return undefined;
      }

      try {
        const config = factory.create(child);

        if (config === undefined || !('isNumericConfig' in config)) {
          console.warn('Invalid AirspeedIndicatorConfig definition: approach cue bug speed value is not a numeric config. Discarding approach cue bug options.');
          return undefined;
        }

        const speed = (config as NumericConfig).resolve();

        return {
          speed
        };
      } catch (e) {
        console.warn(e);
      }

      return undefined;
    }
  }
}

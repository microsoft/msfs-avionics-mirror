import { AirspeedIndicatorConfig } from '../../PFD/Components/AirspeedIndicator/AirspeedIndicatorConfig';
import { HorizonConfig } from '../../PFD/Components/HorizonDisplay/HorizonConfig';
import { FlapsGaugeConfig } from '../../PFD/Components/PfdCentralAreaLeftGauges/FlapsElevatorTrimGauge/FlapsGauge/FlapsGaugeConfig';
import { G3XVsiConfig } from '../../PFD/Components/VerticalSpeedIndicator/G3XVsiConfig';
import { AvionicsConfig } from '../AvionicsConfig/AvionicsConfig';
import { BacklightConfig } from '../Backlight/BacklightConfig';
import { GduFormat, InstrumentType } from '../CommonTypes';
import { DefaultConfigFactory } from '../Config/DefaultConfigFactory';
import { VSpeedDefinition } from '../VSpeed/VSpeed';
import { VSpeedConfig } from '../VSpeed/VSpeedConfig';
import { BingMapOptimizationConfig } from './BingMapOptimizationConfig';

/**
 * A configuration object which defines options for a G3X Touch instrument.
 */
export class InstrumentConfig {
  private readonly factory = new DefaultConfigFactory();

  /** The instrument's GDU format. */
  public readonly gduFormat: GduFormat;

  /** The instrument's configured type. */
  public readonly type: InstrumentType;

  /** The instrument's configured type index. */
  public readonly typeIndex: number;

  /** A config which defines backlight options. */
  public readonly backlight: BacklightConfig;

  /** Reference V-speed definitions. */
  public readonly vSpeeds: readonly VSpeedDefinition[];

  /** A config which defines options for the horizon display. */
  public readonly horizon: HorizonConfig;

  /** A config which defines options for the airspeed indicator. */
  public readonly airspeedIndicator: AirspeedIndicatorConfig;

  /** A config which defines options for the vertical speed indicator. */
  public readonly vsi: G3XVsiConfig;

  /** A config which defines options for bing map optimization. */
  public readonly bingMapOptimization: BingMapOptimizationConfig;

  /** A config which defines options for the instrument's flaps gauge. */
  public readonly flapsGauge: FlapsGaugeConfig | undefined;

  /** A flag indicating if elevator trim should be displayed on the instrument. */
  public readonly useElevatorTrim: boolean = false;

  /** A flag indicating if rudder trim should be displayed on the instrument. */
  public readonly useRudderTrim: boolean = false;

  /** A flag indicating if aileron trim should be displayed on the instrument. */
  public readonly useAileronTrim: boolean = false;

  /**
   * Creates an InstrumentConfig from an XML configuration document.
   * @param instrument The instrument for which this config is being created.
   * @param avionicsConfig The general avionics configuration object.
   * @param configDocument An XML configuration document.
   * @param instrumentConfigElement The root element of the configuration document's section pertaining to the config's
   * instrument.
   */
  constructor(
    instrument: BaseInstrument,
    avionicsConfig: AvionicsConfig,
    configDocument: Document,
    instrumentConfigElement: Element | undefined
  ) {
    const root = configDocument.getElementsByTagName('PlaneHTMLConfig')[0];
    const g3xRoot = root.querySelector(':scope>G3X') ?? undefined;

    this.gduFormat = '460'; // TODO: support GDU470 (portrait)
    this.type = avionicsConfig.gduDefs.definitions[instrument.instrumentIndex]?.type ?? 'PFD';
    this.typeIndex = avionicsConfig.gduDefs.definitions[instrument.instrumentIndex]?.typeIndex ?? 1;
    this.backlight = this.parseBacklightConfig(instrument, g3xRoot, instrumentConfigElement);
    this.vSpeeds = this.parseVSpeeds(g3xRoot, instrumentConfigElement);
    this.horizon = this.parseHorizonConfig(g3xRoot, instrumentConfigElement);
    this.airspeedIndicator = this.parseAirspeedIndicatorConfig(g3xRoot, instrumentConfigElement);
    this.vsi = this.parseVsiConfig(g3xRoot, instrumentConfigElement);
    this.bingMapOptimization = this.parseBingMapOptimizationConfig(g3xRoot, instrumentConfigElement);

    if (instrumentConfigElement) {
      this.flapsGauge = this.parseFlapsGaugeConfig(instrumentConfigElement.querySelector(':scope>FlapsGauge'));
      this.useElevatorTrim = this.parseElevatorTrimEnabled(instrumentConfigElement.querySelector(':scope>ElevatorTrim'));
      this.useRudderTrim = this.parseRudderTrimEnabled(instrumentConfigElement.querySelector(':scope>RudderTrim'));
      this.useAileronTrim = this.parseAileronTrimEnabled(instrumentConfigElement.querySelector(':scope>AileronTrim'));
    }
  }

  /**
   * Parses a flaps gauge configuration object from a configuration document element.
   * @param element A configuration document element.
   * @returns The flaps gauge configuration defined by the configuration document element.
   */
  private parseFlapsGaugeConfig(element: Element | null): FlapsGaugeConfig | undefined {
    if (element !== null) {
      try {
        return new FlapsGaugeConfig(element);
      } catch (e) {
        console.error(e);
      }
    }
    return undefined;
  }

  /**
   * Parses a boolean value from a configuration document element.
   * @param element A configuration document element.
   * @returns The boolean value defined by the configuration document element, true if elevator trim is enabled.
   */
  private parseElevatorTrimEnabled(element: Element | null): boolean {
    return element !== null;
  }

  /**
   * Parses a boolean value from a configuration document element.
   * @param element A configuration document element.
   * @returns The boolean value defined by the configuration document element, true if rudder trim is enabled.
   */
  private parseRudderTrimEnabled(element: Element | null): boolean {
    return element !== null;
  }

  /**
   * Parses a boolean value from a configuration document element.
   * @param element A configuration document element.
   * @returns The boolean value defined by the configuration document element, true if aileron trim is enabled.
   */
  private parseAileronTrimEnabled(element: Element | null): boolean {
    return element !== null;
  }

  /**
   * Parses a backlight configuration object from a configuration document.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param config The root element of the configuration document's section pertaining to the G3X.
   * @param instrumentConfig The root element of the configuration document's section pertaining to this config's
   * instrument.
   * @returns The backlight configuration object defined by the configuration document.
   */
  private parseBacklightConfig(baseInstrument: BaseInstrument, config: Element | undefined, instrumentConfig: Element | undefined): BacklightConfig {
    if (instrumentConfig !== undefined) {
      try {
        const backlight = instrumentConfig.querySelector(':scope>Backlight');
        if (backlight !== null) {
          return new BacklightConfig(baseInstrument, backlight);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    if (config) {
      try {
        const backlight = config.querySelector(':scope>Backlight');
        if (backlight !== null) {
          return new BacklightConfig(baseInstrument, backlight);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    return new BacklightConfig(baseInstrument, undefined);
  }

  /**
   * Parses reference V-speed definitions from a configuration document.
   * @param config The root element of the configuration document's section pertaining to the G3X.
   * @param instrumentConfig The root element of the configuration document's section pertaining to this config's
   * instrument.
   * @returns An array of reference V-speed definitions defined by the configuration document.
   */
  private parseVSpeeds(config: Element | undefined, instrumentConfig: Element | undefined): VSpeedDefinition[] {
    let element: Element | null = null;

    if (instrumentConfig !== undefined) {
      element = instrumentConfig.querySelector(':scope>VSpeeds');
    }

    if (config) {
      element ??= config.querySelector(':scope>VSpeeds');
    }

    if (element === null) {
      return this.getDefaultVSpeedGroups();
    }

    const children = Array.from(element.querySelectorAll(':scope>VSpeed'));
    return children.map(child => {
      try {
        return new VSpeedConfig(child).resolve();
      } catch (e) {
        console.warn(e);
        return null;
      }
    }).filter(def => def !== null) as VSpeedDefinition[];
  }

  /**
   * Gets a set of default reference V-speed definitions. The set contains definitions for the following V-speeds (in
   * order):
   *
   * 1. V-speed name: `glide`
   * 2. V-speed name: `r`,
   * 3. V-speed name: `x`
   * 4. V-speed name: `y`
   *
   * The default values for the V-speeds are derived from the corresponding entries in the aircraft configuration
   * files.
   * @returns An array containing a set of default reference V-speed definitions.
   */
  private getDefaultVSpeedGroups(): VSpeedDefinition[] {
    return [
      { name: 'glide', defaultValue: Math.round(Simplane.getDesignSpeeds().BestGlide) },
      { name: 'r', defaultValue: Math.round(Simplane.getDesignSpeeds().Vr) },
      { name: 'x', defaultValue: Math.round(Simplane.getDesignSpeeds().Vx) },
      { name: 'y', defaultValue: Math.round(Simplane.getDesignSpeeds().Vy) }
    ];
  }

  /**
   * Parses a PFD horizon display configuration object from a configuration document.
   * @param config The root element of the configuration document's section pertaining to the G3X.
   * @param instrumentConfig The root element of the configuration document's section pertaining to this config's
   * instrument.
   * @returns The PFD horizon display configuration object defined by the configuration document.
   */
  private parseHorizonConfig(config: Element | undefined, instrumentConfig: Element | undefined): HorizonConfig {
    if (instrumentConfig !== undefined) {
      try {
        const horizon = instrumentConfig.querySelector(':scope>Horizon');
        if (horizon !== null) {
          return new HorizonConfig(horizon);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    if (config) {
      try {
        const cnsDataBar = config.querySelector(':scope>Horizon');
        if (cnsDataBar !== null) {
          return new HorizonConfig(cnsDataBar);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    return new HorizonConfig(undefined);
  }

  /**
   * Parses an airspeed indicator configuration object from a configuration document. This method looks in the
   * instrument-specific section first for a config definition. If none can be found or parsed without error, this
   * method will next look in the general section. If none can be found or parsed without error there either, this
   * method will return a default configuration object.
   * @param config The root element of the configuration document's section pertaining to the G3X.
   * @param instrumentConfig The root element of the configuration document's section pertaining to this config's
   * instrument.
   * @returns The airspeed indicator configuration defined by the configuration document, or a default version if the
   * document does not define a valid configuration.
   */
  private parseAirspeedIndicatorConfig(config: Element | undefined, instrumentConfig: Element | undefined): AirspeedIndicatorConfig {
    if (instrumentConfig !== undefined) {
      try {
        const airspeedIndicator = instrumentConfig.querySelector(':scope>AirspeedIndicator');
        if (airspeedIndicator !== null) {
          return new AirspeedIndicatorConfig(airspeedIndicator, this.factory);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    if (config) {
      try {
        const airspeedIndicator = config.querySelector(':scope>AirspeedIndicator');
        if (airspeedIndicator !== null) {
          return new AirspeedIndicatorConfig(airspeedIndicator, this.factory);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    return new AirspeedIndicatorConfig(undefined, this.factory);
  }

  /**
   * Parses a vertical speed indicator configuration object from a configuration document. This method looks in the
   * instrument-specific section first for a config definition. If none can be found or parsed without error, this
   * method will next look in the general section. If none can be found or parsed without error there either, this
   * method will return a default configuration object.
   * @param config The root of the configuration document.
   * @param instrumentConfig The root element of the configuration document's section pertaining to this config's
   * instrument.
   * @returns The vertical speed indicator configuration defined by the configuration document, or a default version
   * if the document does not define a valid configuration.
   */
  private parseVsiConfig(config: Element | undefined, instrumentConfig: Element | undefined): G3XVsiConfig {
    if (instrumentConfig !== undefined) {
      try {
        const vsi = instrumentConfig.querySelector(':scope>Vsi');
        if (vsi !== null) {
          return new G3XVsiConfig(vsi);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    try {
      if (config !== undefined) {
        const vsi = config.querySelector(':scope>Vsi');
        if (vsi !== null) {
          return new G3XVsiConfig(vsi);
        }
      }
    } catch (e) {
      console.warn(e);
    }

    return new G3XVsiConfig(undefined);
  }

  /**
   * Parses a bing map optimization configuration object from a configuration document. This method looks in the
   * instrument-specific section first for a config definition. If none can be found or parsed without error, this
   * method will next look in the general section. If none can be found or parsed without error there either, this
   * method will return a default configuration object.
   * @param config The root of the configuration document.
   * @param instrumentConfig The root element of the configuration document's section pertaining to this config's
   * instrument.
   * @returns The bing map optimization configuration defined by the configuration document, or a default version
   * if the document does not define a valid configuration.
   */
  private parseBingMapOptimizationConfig(config: Element | undefined, instrumentConfig: Element | undefined): BingMapOptimizationConfig {
    if (instrumentConfig !== undefined) {
      try {
        const element = instrumentConfig.querySelector(':scope>BingMapOpt');
        if (element !== null) {
          return new BingMapOptimizationConfig(element);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    try {
      if (config !== undefined) {
        const element = config.querySelector(':scope>BingMapOpt');
        if (element !== null) {
          return new BingMapOptimizationConfig(element);
        }
      }
    } catch (e) {
      console.warn(e);
    }

    return new BingMapOptimizationConfig(undefined);
  }
}

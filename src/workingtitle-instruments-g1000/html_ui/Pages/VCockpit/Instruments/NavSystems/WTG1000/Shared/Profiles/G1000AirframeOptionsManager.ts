import {
  Annunciation, EventBus, Warning, XMLAnnunciationFactory, XMLExtendedGaugeConfig, XMLFunction, XMLGaugeConfigFactory, XMLWarningFactory
} from '@microsoft/msfs-sdk';

import { DefaultConfigFactory } from '../Config/DefaultConfigFactory';
import { VSpeedGroup } from '../VSpeed/VSpeed';
import { VSpeedGroupConfig } from '../VSpeed/VSpeedGroupConfig';
import { AirspeedIndicatorConfig } from './AirspeedIndicator/AirspeedIndicatorConfig';
import { AutopilotConfig } from './Autopilot/AutopilotConfig';

/**
 * A manager for G1000 airframe options.
 */
export class G1000AirframeOptionsManager {
  private readonly configFactory = new DefaultConfigFactory();

  private _hasRadioAltimeter = false;
  private _hasWeatherRadar = true;
  private _gaugeConfig: XMLExtendedGaugeConfig = {
    override: false,
    functions: new Map<string, XMLFunction>(),
    enginePage: []
  };
  private _annunciationConfig: Annunciation[] = [];
  private _warningConfig: Warning[] = [];

  private instrument: BaseInstrument;
  private gaugeFactory: XMLGaugeConfigFactory;
  private annunciationFactory: XMLAnnunciationFactory;
  private warningFactory: XMLWarningFactory;

  /**
   * Create an G1000 options manager.
   * @param instrument The base instrument we're configuring.
   * @param bus An event bus.
   */
  constructor(instrument: BaseInstrument, bus: EventBus) {
    this.instrument = instrument;
    this.gaugeFactory = new XMLGaugeConfigFactory(instrument, bus);
    this.annunciationFactory = new XMLAnnunciationFactory(instrument);
    this.warningFactory = new XMLWarningFactory(instrument);
  }

  /**
   * Get whether radar altimeter is enabled.
   * @returns Radar altimeter state as a bool.
   */
  public get hasRadioAltimeter(): boolean {
    return this._hasRadioAltimeter;
  }

  /**
   * Get whether weather radar is enabled.
   * @returns Weather radar state as a bool.
   */
  public get hasWeatherRadar(): boolean {
    return this._hasWeatherRadar;
  }

  /**
   * Get the XML-based EIS gauge configuration.
   * @returns The gauge config object.
   */
  public get gaugeConfig(): XMLExtendedGaugeConfig {
    return this._gaugeConfig;
  }

  /**
   * Get the XML-based annunciation configuration.
   * @returns The annunciation config object.
   */
  public get annunciationConfig(): Annunciation[] {
    return this._annunciationConfig;
  }

  /**
   * Get the XML-based warning configuration.
   * @returns The warning config object.
   */
  public get warningConfig(): Warning[] {
    return this._warningConfig;
  }

  private _autopilotConfig?: AutopilotConfig;
  // eslint-disable-next-line jsdoc/require-returns
  /** A config which defines options for the autopilot. */
  public get autopilotConfig(): AutopilotConfig {
    if (!this._autopilotConfig) {
      throw new Error('G1000AirframeOptionsManager: cannot access config before it has been parsed.');
    }
    return this._autopilotConfig;
  }

  private _vSpeedGroups?: ReadonlyMap<string, VSpeedGroup>;
  // eslint-disable-next-line jsdoc/require-returns
  /** Definitions for reference V-speeds. */
  public get vSpeedGroups(): ReadonlyMap<string, VSpeedGroup> {
    if (!this._vSpeedGroups) {
      throw new Error('G1000AirframeOptionsManager: cannot access config before it has been parsed.');
    }
    return this._vSpeedGroups;
  }

  private _airspeedIndicatorConfig?: AirspeedIndicatorConfig;
  // eslint-disable-next-line jsdoc/require-returns
  /** A config which defines options for the airspeed indicator. */
  public get airspeedIndicatorConfig(): AirspeedIndicatorConfig {
    if (!this._airspeedIndicatorConfig) {
      throw new Error('G1000AirframeOptionsManager: cannot access config before it has been parsed.');
    }
    return this._airspeedIndicatorConfig;
  }

  /**
   * Parse the plane's EIS configuation.
   * @param document The configuration as an XML document.
   * @returns The parsed EIS configuration.
   */
  private parseGaugeConfig(document: Document): XMLExtendedGaugeConfig {
    return this.gaugeFactory.parseConfig(document);
  }

  /**
   * Parse the plane's annunciation configuration.
   * @param document The configuration as an XML document.
   * @returns The parsed annunciation configuration.
   */
  private parseAnnunciationConfig(document: Document): Annunciation[] {
    return this.annunciationFactory.parseConfig(document);
  }

  /**
   * Parse the plane's warning configuration.
   * @param document The configuration as an XML document.
   * @returns The parsed warning configuration.
   */
  private parseWarningConfig(document: Document): Warning[] {
    return this.warningFactory.parseConfig(document);
  }
  /**
   * Parse the panel.xml for airframe specific options.
   */
  public parseConfig(): void {
    const rootElement = this.instrument.xmlConfig.getElementsByTagName('PlaneHTMLConfig')[0];

    const instruments = this.instrument.xmlConfig.getElementsByTagName('Instrument');
    for (const instrument of instruments) {
      const instrumentId = instrument.getElementsByTagName('Name');
      if (instrumentId.length > 0 && instrumentId[0].textContent === this.instrument.instrumentIdentifier) {
        const wxElem = instrument.getElementsByTagName('WeatherRadar');
        if (wxElem.length > 0 && (wxElem[0].textContent?.toLowerCase() == 'off' || wxElem[0].textContent?.toLowerCase() == 'none')) {
          this._hasWeatherRadar = false;
        }
      }

      // Items that are globally relevant.
      const raElem = instrument.getElementsByTagName('RadarAltitude');
      if (raElem.length > 0 && raElem[0].textContent === 'True') {
        this._hasRadioAltimeter = true;
      }
    }

    this._gaugeConfig = this.parseGaugeConfig(this.instrument.xmlConfig);
    this._annunciationConfig = this.parseAnnunciationConfig(this.instrument.xmlConfig);
    this._warningConfig = this.parseWarningConfig(this.instrument.xmlConfig);

    this._autopilotConfig = this.parseAutopilotConfig(rootElement);

    this._vSpeedGroups = this.parseVSpeedGroups(rootElement);

    this._airspeedIndicatorConfig = this.parseAirspeedIndicatorConfig(rootElement);
  }

  /**
   * Parses an autopilot configuration object from a configuration document. If none can be found or parsed without
   * error, then this method will return a default configuration object.
   * @param config The root of the configuration document.
   * @returns The autopilot configuration defined by the configuration document, or a default version if the document
   * does not define a valid configuration.
   */
  private parseAutopilotConfig(config: Element): AutopilotConfig {
    try {
      const autopilot = config.querySelector(':scope>Autopilot');
      if (autopilot !== null) {
        return new AutopilotConfig(autopilot);
      }
    } catch (e) {
      console.warn(e);
    }

    return new AutopilotConfig(undefined);
  }

  /**
   * Parses reference V-speed definitions from a configuration document. If none can be found or parsed without error,
   * then this method will return a default set of V-speed definitions.
   * @param config The root of the configuration document.
   * @returns Reference V-speed definitions defined by the configuration document, or a default version if the document
   * does not define a valid configuration.
   */
  private parseVSpeedGroups(config: Element): Map<string, VSpeedGroup> {
    const element = config.querySelector(':scope>VSpeeds');

    const map = new Map<string, VSpeedGroup>();

    if (element === null) {
      return this.getDefaultVSpeedGroups();
    }

    const children = Array.from(element.querySelectorAll(':scope>Group'));
    const groups = children.map(child => {
      try {
        return new VSpeedGroupConfig(child).resolve();
      } catch (e) {
        console.warn(e);
        return null;
      }
    });

    // Pick the first group of each type.
    for (const group of groups) {
      if (group === null) {
        continue;
      }

      if (!map.has(group.name)) {
        map.set(group.name, group);
      }
    }

    return map;
  }

  /**
   * Gets a set of default reference V-speed definitions. The set contains definitions for the following V-speeds (in
   * order):
   * 
   * 1. V-speed name: `glide`, label: `GLIDE`
   * 2. V-speed name: `r`, label: `Vr`
   * 3. V-speed name: `x`, label: `Vx`
   * 4. V-speed name: `y`, label: `Vy`
   * 
   * The default values for the V-speeds are derived from the corresponding entries in the aircraft configuration
   * files.
   * @returns An array containing a set of default reference V-speed definitions.
   */
  private getDefaultVSpeedGroups(): Map<string, VSpeedGroup> {
    return new Map([
      ['', {
        name: '',
        vSpeedDefinitions: [
          { name: 'glide', defaultValue: Math.round(Simplane.getDesignSpeeds().BestGlide), label: 'GLIDE' },
          { name: 'r', defaultValue: Math.round(Simplane.getDesignSpeeds().Vr), label: 'Vr' },
          { name: 'x', defaultValue: Math.round(Simplane.getDesignSpeeds().Vx), label: 'Vx' },
          { name: 'y', defaultValue: Math.round(Simplane.getDesignSpeeds().Vy), label: 'Vy' }
        ]
      }]
    ]);
  }

  /**
   * Parses an airspeed indicator configuration object from a configuration document. If none can be found or parsed
   * without error, then this method will return a default configuration object.
   * @param config The root of the configuration document.
   * @returns The airspeed indicator configuration defined by the configuration document, or a default version if the
   * document does not define a valid configuration.
   */
  private parseAirspeedIndicatorConfig(config: Element): AirspeedIndicatorConfig {
    try {
      const airspeedIndicator = config.querySelector(':scope>AirspeedIndicator');
      if (airspeedIndicator !== null) {
        return new AirspeedIndicatorConfig(airspeedIndicator, this.configFactory);
      }
    } catch (e) {
      console.warn(e);
    }

    return new AirspeedIndicatorConfig(undefined, this.configFactory);
  }
}
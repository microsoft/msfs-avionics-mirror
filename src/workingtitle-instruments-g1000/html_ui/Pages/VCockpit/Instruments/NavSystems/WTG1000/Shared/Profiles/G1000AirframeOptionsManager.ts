import {
  Annunciation, EventBus, Warning, XMLAnnunciationFactory, XMLExtendedGaugeConfig, XMLFunction, XMLGaugeConfigFactory, XMLWarningFactory
} from '@microsoft/msfs-sdk';

/**
 * A manager for G1000 airframe options.
 */
export class G1000AirframeOptionsManager {
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
  }
}
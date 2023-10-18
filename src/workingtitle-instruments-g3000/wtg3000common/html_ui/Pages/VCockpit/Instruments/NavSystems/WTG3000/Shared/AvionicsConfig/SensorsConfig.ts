import { Config } from '../Config/Config';

/**
 * A definition for an ADC.
 */
export type AdcDefinition = {
  /** The index of the sim airspeed indicator used by this definition's ADC. */
  airspeedIndicatorIndex: number;

  /** The electrical logic for this definition's ADC. */
  electricity?: CompositeLogicXMLElement;
};

/**
 * A definition for an AHRS.
 */
export type AhrsDefinition = {
  /** The index of the sim attitude indicator used by this definition's AHRS. */
  attitudeIndicatorIndex: number;

  /** The index of the sim direction indicator used by this definition's AHRS. */
  directionIndicatorIndex: number;

  /** The electrical logic for this definition's AHRS. */
  electricity?: CompositeLogicXMLElement;
};

/**
 * A definition for a radar altimeter.
 */
export type RadarAltimeterDefinition = {
  /** The electrical logic for this definition's radar altimeter. */
  electricity?: CompositeLogicXMLElement;
};

/**
 * A definition for a marker beacon receiver.
 */
export type MarkerBeaconDefinition = {
  /** The electrical logic for this definition's marker beacon receiver. */
  electricity?: CompositeLogicXMLElement;
};

/**
 * A definition for an angle of attack computer.
 */
export type AoaDefinition = {
  /** The electrical logic for this definition's angle of attack computer. */
  electricity?: CompositeLogicXMLElement;
};

/**
 * A definition for a weather radar.
 */
export type WeatherRadarDefinition = {
  /** The angular width, in degrees, of the horizontal scan of this definition's weather radar. */
  horizontalScanWidth: number;

  /** Whether the extended 16-color scale is supported for this definition's weather radar.  */
  supportExtendedColors: boolean;

  /** The minimum gain setting, in dBZ. */
  minGain: number;

  /** The maximum gain setting, in dBZ. */
  maxGain: number;

  /** The electrical logic for this definition's weather radar. */
  electricity?: CompositeLogicXMLElement;

  /** The index of the circuit to switch on when the weather radar is actively scanning. */
  scanActiveCircuitIndex?: number;

  /** The index of the `system.cfg` electrical procedure to use the change the active radar scan circuit switch state. */
  scanActiveCircuitProcedureIndex?: number;
};

/**
 * A configuration object which defines options related to various aircraft sensors.
 */
export class SensorsConfig implements Config {
  /** The number of ADCs supported by the plane. */
  public readonly adcCount: number;

  /** The number of AHRS supported by the plane. */
  public readonly ahrsCount: number;

  /**
   * ADC definitions. The index of each definition's position in the array corresponds to the index of its ADC.
   */
  public readonly adcDefinitions: readonly Readonly<AdcDefinition>[];

  /**
   * AHRS definitions. The index of each definition's position in the array corresponds to the index of its AHRS.
   */
  public readonly ahrsDefinitions: readonly Readonly<AhrsDefinition>[];

  /** An angle of attack computer definition. */
  public readonly aoaDefinition: Readonly<AoaDefinition>;

  /** An optional radar altimeter definition. */
  public readonly radarAltimeterDefinition?: Readonly<RadarAltimeterDefinition>;

  // eslint-disable-next-line jsdoc/require-returns
  /** Whether this configuration defines a radar altimeter. */
  public get hasRadarAltimeter(): boolean {
    return this.radarAltimeterDefinition !== undefined;
  }

  /** A marker beacon receiver definition. */
  public readonly markerBeaconDefinition: Readonly<MarkerBeaconDefinition>;

  /** An optional weather radar definition. */
  public readonly weatherRadarDefinition?: Readonly<WeatherRadarDefinition>;

  // eslint-disable-next-line jsdoc/require-returns
  /** Whether this configuration defines a weather radar. */
  public get hasWeatherRadar(): boolean {
    return this.weatherRadarDefinition !== undefined;
  }

  /**
   * Creates a new SensorsConfig from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   */
  constructor(baseInstrument: BaseInstrument, element: Element | undefined) {
    if (element === undefined) {
      this.adcCount = 1;
      this.ahrsCount = 1;
      this.adcDefinitions = [undefined as any, { airspeedIndicatorIndex: 1 }];
      this.ahrsDefinitions = [undefined as any, { attitudeIndicatorIndex: 1, directionIndicatorIndex: 1 }];
      this.aoaDefinition = {};
      this.radarAltimeterDefinition = undefined;
      this.markerBeaconDefinition = {};
      this.weatherRadarDefinition = undefined;
    } else {
      if (element.tagName !== 'Sensors') {
        throw new Error(`Invalid SensorsConfig definition: expected tag name 'Sensors' but was '${element.tagName}'`);
      }

      const adcCount = Number(element.getAttribute('adc-count'));
      if (!Number.isInteger(adcCount) || adcCount < 1) {
        console.warn('Invalid SensorsConfig definition: unrecognized ADC count (must be a positive integer)');
        this.adcCount = 1;
      } else {
        this.adcCount = adcCount;
      }

      const ahrsCount = Number(element.getAttribute('ahrs-count'));
      if (!Number.isInteger(ahrsCount) || ahrsCount < 1) {
        console.warn('Invalid SensorsConfig definition: unrecognized AHRS count (must be a positive integer)');
        this.ahrsCount = 1;
      } else {
        this.ahrsCount = ahrsCount;
      }

      this.adcDefinitions = this.parseAdcDefinitions(baseInstrument, element);
      this.ahrsDefinitions = this.parseAhrsDefinitions(baseInstrument, element);
      this.aoaDefinition = this.parseAoaDefinition(baseInstrument, element);
      this.radarAltimeterDefinition = this.parseRadarAltimeterDefinition(baseInstrument, element);
      this.markerBeaconDefinition = this.parseMarkerBeaconDefinition(baseInstrument, element);
      this.weatherRadarDefinition = this.parseWeatherRadarDefinition(baseInstrument, element);
    }
  }

  /**
   * Parses ADC definitions from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns An array of ADC definitions defined by the configuration document element.
   */
  private parseAdcDefinitions(baseInstrument: BaseInstrument, element: Element): readonly Readonly<AdcDefinition>[] {
    const adcElements = element.querySelectorAll(':scope>Adc');

    const defs: AdcDefinition[] = [];

    for (const adcElement of adcElements) {
      const index = Number(adcElement.getAttribute('index'));
      if (!Number.isInteger(index) || index < 1 || index > this.adcCount) {
        console.warn('Invalid SensorsConfig definition: unrecognized ADC index (must be an integer between 1 and the number of supported ADCs)');
        continue;
      }

      const airspeedIndicatorIndex = Number(adcElement.getAttribute('airspeed-indicator'));
      if (!Number.isInteger(airspeedIndicatorIndex) || airspeedIndicatorIndex < 1) {
        console.warn('Invalid SensorsConfig definition: unrecognized airspeed indicator index (must be a positive integer)');
        continue;
      }

      const electricLogicElement = adcElement.querySelector(':scope>Electric');

      defs[index] = {
        airspeedIndicatorIndex,
        electricity: electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement)
      };
    }

    // Set defaults for indexes that don't have definitions
    for (let i = 1; i <= this.adcCount; i++) {
      if (defs[i] === undefined) {
        defs[i] = {
          airspeedIndicatorIndex: i
        };
      }
    }

    return defs;
  }

  /**
   * Parses AHRS definitions from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns An array of AHRS definitions defined by the configuration document element.
   */
  private parseAhrsDefinitions(baseInstrument: BaseInstrument, element: Element): readonly Readonly<AhrsDefinition>[] {
    const ahrsElements = element.querySelectorAll(':scope>Ahrs');

    const defs: AhrsDefinition[] = [];

    for (const ahrsElement of ahrsElements) {
      const index = Number(ahrsElement.getAttribute('index'));
      if (!Number.isInteger(index) || index < 1 || index > this.ahrsCount) {
        console.warn('Invalid SensorsConfig definition: unrecognized AHRS index (must be an integer between 1 and the number of supported AHRS)');
        continue;
      }

      const attitudeIndicatorIndex = Number(ahrsElement.getAttribute('attitude-indicator'));
      if (!Number.isInteger(attitudeIndicatorIndex) || attitudeIndicatorIndex < 1) {
        console.warn('Invalid SensorsConfig definition: unrecognized attitude indicator index (must be a positive integer)');
        continue;
      }

      const directionIndicatorIndex = Number(ahrsElement.getAttribute('direction-indicator'));
      if (!Number.isInteger(directionIndicatorIndex) || directionIndicatorIndex < 1) {
        console.warn('Invalid SensorsConfig definition: unrecognized direction indicator index (must be a positive integer)');
        continue;
      }

      const electricLogicElement = ahrsElement.querySelector(':scope>Electric');

      defs[index] = {
        attitudeIndicatorIndex,
        directionIndicatorIndex,
        electricity: electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement)
      };
    }

    // Set defaults for indexes that don't have definitions
    for (let i = 1; i <= this.adcCount; i++) {
      if (defs[i] === undefined) {
        defs[i] = {
          attitudeIndicatorIndex: i,
          directionIndicatorIndex: i
        };
      }
    }

    return defs;
  }

  /**
   * Parses an angle of attack computer definition from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns The angle of attack computer definition defined by the configuration document element, or `undefined` if
   * there is no such definition.
   */
  private parseAoaDefinition(baseInstrument: BaseInstrument, element: Element): AoaDefinition {
    const aoaElement = element.querySelector(':scope>Aoa');

    if (aoaElement === null) {
      return {};
    }

    const electricLogicElement = aoaElement.querySelector(':scope>Electric');

    return {
      electricity: electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement)
    };
  }

  /**
   * Parses a radar altimeter definition from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns The radar altimeter definition defined by the configuration document element, or `undefined` if there is
   * no such definition.
   */
  private parseRadarAltimeterDefinition(baseInstrument: BaseInstrument, element: Element): RadarAltimeterDefinition | undefined {
    const radarAltimeterElement = element.querySelector(':scope>RadarAltimeter');

    if (radarAltimeterElement === null) {
      return undefined;
    }

    const electricLogicElement = radarAltimeterElement.querySelector(':scope>Electric');

    return {
      electricity: electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement)
    };
  }

  /**
   * Parses a marker beacon receiver definition from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns The marker beacon receiver definition defined by the configuration document element, or `undefined` if
   * there is no such definition.
   */
  private parseMarkerBeaconDefinition(baseInstrument: BaseInstrument, element: Element): MarkerBeaconDefinition {
    const markerBeaconElement = element.querySelector(':scope>MarkerBeacon');

    const electricLogicElement = markerBeaconElement?.querySelector(':scope>Electric') ?? null;

    return {
      electricity: electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement)
    };
  }

  /**
   * Parses a weather radar definition from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns The weather radar definition defined by the configuration document element, or `undefined` if there is
   * no such definition.
   */
  private parseWeatherRadarDefinition(baseInstrument: BaseInstrument, element: Element): WeatherRadarDefinition | undefined {
    const weatherRadarElement = element.querySelector(':scope>WeatherRadar');

    if (weatherRadarElement === null) {
      return undefined;
    }

    let horizontalScanWidth = Number(weatherRadarElement.getAttribute('horiz-scan-width'));
    if (isNaN(horizontalScanWidth) || horizontalScanWidth < 60 || horizontalScanWidth > 120) {
      console.warn('Invalid SensorsConfig definition: unrecognized weather radar scan width (must be a number between 60 and 120). Defaulting to 90.');
      horizontalScanWidth = 90;
    }

    let supportExtendedColors: boolean;
    const colors = weatherRadarElement.getAttribute('colors');
    switch (colors?.toLowerCase()) {
      case undefined:
      case 'standard':
        supportExtendedColors = false;
        break;
      case 'extended':
        supportExtendedColors = true;
        break;
      default:
        console.warn('Invalid SensorsConfig definition: unrecognized weather radar colors option (must be either \'standard\' or \'extended\'). Defaulting to standard.');
        supportExtendedColors = false;
    }

    let minGain = -64;
    const minGainAttr = weatherRadarElement.getAttribute('min-gain');
    if (minGainAttr) {
      minGain = Number(minGainAttr);
      if (!Number.isInteger(minGain) || minGain >= 0) {
        console.warn('Invalid SensorsConfig definition: unrecognized weather radar minimum gain (must be a negative integer). Defaulting to -64.');
        minGain = -64;
      }
    }

    let maxGain = 12;
    const maxGainAttr = weatherRadarElement.getAttribute('max-gain');
    if (maxGainAttr) {
      maxGain = Number(maxGainAttr);
      if (!Number.isInteger(maxGain) || maxGain <= 0) {
        console.warn('Invalid SensorsConfig definition: unrecognized weather radar minimum gain (must be a positive integer). Defaulting to 12.');
        maxGain = 12;
      }
    }

    const electricLogicElement = weatherRadarElement.querySelector(':scope>Electric');

    const scanActiveCircuitElement = weatherRadarElement.querySelector(':scope>ScanActiveCircuit');

    let scanActiveCircuitIndex: number | undefined;
    let scanActiveCircuitProcedureIndex: number | undefined;

    if (scanActiveCircuitElement) {
      scanActiveCircuitIndex = Number(scanActiveCircuitElement.getAttribute('circuit'));
      if (!Number.isInteger(scanActiveCircuitIndex) || scanActiveCircuitIndex < 1) {
        console.warn('Invalid SensorsConfig definition: unrecognized weather radar scan active circuit index (must be a positive integer).');
        scanActiveCircuitIndex = undefined;
      }

      scanActiveCircuitProcedureIndex = Number(scanActiveCircuitElement.getAttribute('procedure'));
      if (!Number.isInteger(scanActiveCircuitProcedureIndex) || scanActiveCircuitProcedureIndex < 1) {
        console.warn('Invalid SensorsConfig definition: unrecognized weather radar scan active circuit procedure index (must be a positive integer).');
        scanActiveCircuitProcedureIndex = undefined;
      }
    }

    return {
      horizontalScanWidth,
      supportExtendedColors,
      minGain,
      maxGain,
      electricity: electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement),
      scanActiveCircuitIndex,
      scanActiveCircuitProcedureIndex
    };
  }
}
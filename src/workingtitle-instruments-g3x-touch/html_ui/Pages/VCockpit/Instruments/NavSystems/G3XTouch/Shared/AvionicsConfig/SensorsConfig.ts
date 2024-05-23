import { GPSSatComputerOptions } from '@microsoft/msfs-sdk';

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
 * A base definition for a GPS receiver.
 */
type BaseGpsReceiverDefinition = {
  /** The index of this definition's GPS receiver. */
  index: number;

  /** The electrical logic for this definition's GPS receiver. */
  electricity?: CompositeLogicXMLElement;
};

/**
 * A definition for an internal GPS receiver.
 */
export type InternalGpsReceiverDefinition = BaseGpsReceiverDefinition & {
  /** The type of this definition's GPS receiver. */
  type: 'internal';

  /** The index of the GPS receiver's parent GDU. */
  gduIndex: number;
};

/**
 * A definition for an external GPS receiver.
 */
export type ExternalGpsReceiverDefinition = BaseGpsReceiverDefinition & {
  /** The type of this definition's GPS receiver. */
  type: 'external';

  /** Whether the G3X should instantiate the primary instance of the GPS receiver's `GPSSatComputer`. */
  isPrimary: boolean;

  /** Whether the GPS receiver supports SBAS. */
  supportSbas: boolean;

  /** Configuration options for the GPS receiver's `GPSSatComputer`. */
  options?: Readonly<GPSSatComputerOptions>;
};

/**
 * A definition for an external navigator GPS receiver.
 */
export type ExternalNavigatorGpsReceiverDefinition = BaseGpsReceiverDefinition & {
  /** The type of this definition's GPS receiver. */
  type: 'external-navigator';

  /** The index of the GPS receiver's parent external navigation source. */
  externalSourceIndex: 1 | 2;

  /** Whether the GPS receiver supports SBAS. */
  supportSbas: boolean;

  /** Configuration options for the GPS receiver's `GPSSatComputer`. */
  options?: Readonly<GPSSatComputerOptions>;
};

/**
 * A definition for a GPS receiver.
 */
export type GpsReceiverDefinition = InternalGpsReceiverDefinition | ExternalGpsReceiverDefinition | ExternalNavigatorGpsReceiverDefinition;

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

  /**
   * GPS receiver definitions. The index of each definition's position in the array corresponds to the index of its GPS
   * receiver.
   */
  public readonly gpsReceiverDefinitions: readonly Readonly<GpsReceiverDefinition>[];

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
      this.gpsReceiverDefinitions = [];
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
      this.gpsReceiverDefinitions = this.parseGpsReceiverDefinitions(baseInstrument, element);
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
   * Parses AHRS definitions from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns An array of AHRS definitions defined by the configuration document element.
   */
  private parseGpsReceiverDefinitions(baseInstrument: BaseInstrument, element: Element): readonly Readonly<GpsReceiverDefinition>[] {
    const gpsElements = element.querySelectorAll(':scope>Gps');

    const defs: GpsReceiverDefinition[] = [];

    for (const gpsElement of gpsElements) {
      const index = Number(gpsElement.getAttribute('index'));
      if (!Number.isInteger(index) || index < 1) {
        console.warn('Invalid SensorsConfig definition: unrecognized GPS receiver index (must be an integer greater than or equal to 1). Discarding entry.');
        continue;
      }

      let def: GpsReceiverDefinition | undefined = undefined;
      const type = gpsElement.getAttribute('type')?.toLowerCase();
      switch (type) {
        case 'internal':
          def = this.parseInternalGpsReceiverDefinition(baseInstrument, gpsElement, index);
          break;
        case 'external':
          def = this.parseExternalGpsReceiverDefinition(baseInstrument, gpsElement, index);
          break;
        case 'external-navigator':
          def = this.parseExternalNavigatorGpsReceiverDefinition(baseInstrument, gpsElement, index);
          break;
        default:
          console.warn('Invalid SensorsConfig definition: missing or unrecognized GPS receiver type (must be "internal", "external", or "external-navigator"). Discarding entry.');
          continue;
      }

      if (def) {
        defs[index] = def;
      }
    }

    return defs;
  }

  /**
   * Parses a definition for an internal GPS receiver from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @param index The index of the GPS receiver.
   * @returns The internal GPS receiver definition defined by the configuration document element, or `undefined` if a
   * definition could not be parsed.
   */
  private parseInternalGpsReceiverDefinition(baseInstrument: BaseInstrument, element: Element, index: number): InternalGpsReceiverDefinition | undefined {
    const gduIndex = Number(element.getAttribute('gdu-index'));
    if (!Number.isInteger(gduIndex) || gduIndex < 1) {
      console.warn('Invalid SensorsConfig definition: unrecognized internal GPS receiver GDU index (must be an integer greater than or equal to 1). Discarding entry.');
      return undefined;
    }

    const electricLogicElement = element.querySelector(':scope>Electric');

    return {
      index,
      type: 'internal',
      gduIndex,
      electricity: electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement)
    };
  }

  /**
   * Parses a definition for an external GPS receiver from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @param index The index of the GPS receiver.
   * @returns The external GPS receiver definition defined by the configuration document element, or `undefined` if a
   * definition could not be parsed.
   */
  private parseExternalGpsReceiverDefinition(baseInstrument: BaseInstrument, element: Element, index: number): ExternalGpsReceiverDefinition | undefined {
    let isPrimary: boolean;
    const isPrimaryText = element.getAttribute('primary')?.toLowerCase();
    switch (isPrimaryText) {
      case 'true':
        isPrimary = true;
        break;
      case 'false':
        isPrimary = false;
        break;
      default:
        console.warn('Invalid SensorsConfig definition: missing or unrecognized external GPS receiver primary flag (must be "true" or "false"). Discarding entry.');
        return undefined;
    }

    let supportSbas: boolean;
    const supportSbasText = element.getAttribute('sbas')?.toLowerCase();
    switch (supportSbasText) {
      case 'true':
        supportSbas = true;
        break;
      case 'false':
        supportSbas = false;
        break;
      default:
        console.warn('Invalid SensorsConfig definition: missing or unrecognized external GPS receiver SBAS flag (must be "true" or "false"). Discarding entry.');
        return undefined;
    }

    const optionsText = element.querySelector(':scope>Options')?.textContent;

    let options: GPSSatComputerOptions | undefined = undefined;
    if (optionsText) {
      options = SensorsConfig.parseGPSSatComputerOptions(optionsText);
      if (!options) {
        console.warn('Invalid SensorsConfig definition: malformed GPS receiver options. Using default options.');
      }
    }

    const electricLogicElement = element.querySelector(':scope>Electric');

    return {
      index,
      type: 'external',
      isPrimary,
      supportSbas,
      options,
      electricity: electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement)
    };
  }

  /**
   * Parses a definition for an external navigator GPS receiver from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @param index The index of the GPS receiver.
   * @returns The external navigator GPS receiver definition defined by the configuration document element, or
   * `undefined` if a definition could not be parsed.
   */
  private parseExternalNavigatorGpsReceiverDefinition(baseInstrument: BaseInstrument, element: Element, index: number): ExternalNavigatorGpsReceiverDefinition | undefined {
    const externalSourceIndex = Number(element.getAttribute('external-source-index'));
    if (externalSourceIndex !== 1 && externalSourceIndex !== 2) {
      console.warn('Invalid SensorsConfig definition: unrecognized external navigator GPS receiver external source index (must be 1 or 2). Discarding entry.');
      return undefined;
    }

    let supportSbas: boolean;
    const supportSbasText = element.getAttribute('sbas')?.toLowerCase();
    switch (supportSbasText) {
      case 'true':
        supportSbas = true;
        break;
      case 'false':
        supportSbas = false;
        break;
      default:
        console.warn('Invalid SensorsConfig definition: missing or unrecognized external navigator GPS receiver SBAS flag (must be "true" or "false"). Discarding entry.');
        return undefined;
    }

    const optionsText = element.querySelector(':scope>Options')?.textContent;

    let options: GPSSatComputerOptions | undefined = undefined;
    if (optionsText) {
      options = SensorsConfig.parseGPSSatComputerOptions(optionsText);
      if (!options) {
        console.warn('Invalid SensorsConfig definition: malformed GPS receiver options. Using default options.');
      }
    }

    const electricLogicElement = element.querySelector(':scope>Electric');

    return {
      index,
      type: 'external-navigator',
      externalSourceIndex,
      supportSbas,
      options,
      electricity: electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement)
    };
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

  private static readonly GPS_SAT_COMPUTER_OPTIONS = [
    ['channelCount', 'number'],
    ['satInUseMaxCount', 'number'],
    ['satInUsePdopTarget', 'number'],
    ['satInUseOptimumCount', 'number']
  ];

  private static readonly GPS_SATELLITE_TIMING_OPTIONS = [
    ['almanacExpireTime', 'number'],
    ['ephemerisExpireTime', 'number'],
    ['acquisitionTimeout', 'number'],
    ['acquisitionTime', 'number'],
    ['acquisitionTimeRange', 'number'],
    ['acquisitionTimeWithEphemeris', 'number'],
    ['acquisitionTimeRangeWithEphemeris', 'number'],
    ['unreachableExpireTime', 'number'],
    ['ephemerisDownloadTime', 'number'],
    ['almanacDownloadTime', 'number'],
    ['sbasEphemerisDownloadTime', 'number'],
    ['sbasEphemerisDownloadTimeRange', 'number'],
    ['sbasCorrectionDownloadTime', 'number'],
    ['sbasCorrectionDownloadTimeRange', 'number']
  ];

  /**
   * Parses a `GPSSatComputerOptions` object from JSON-formatted text.
   * @param text The text to parse.
   * @returns The `GPSSatComputerOptions` object defined by the specified text, or `undefined` if such an object could
   * not be parsed.
   */
  private static parseGPSSatComputerOptions(text: string): GPSSatComputerOptions | undefined {
    try {
      const options = JSON.parse(text);

      if (typeof options !== 'object' || options === null) {
        return undefined;
      }

      for (const [key, type] of SensorsConfig.GPS_SAT_COMPUTER_OPTIONS) {
        if (options[key] !== undefined && typeof options[key] !== type) {
          return undefined;
        }
      }

      if (options['timingOptions'] !== undefined) {
        const timingOptions = options['timingOptions'];
        if (typeof timingOptions !== 'object' || timingOptions === null) {
          return undefined;
        }

        for (const [key, type] of SensorsConfig.GPS_SATELLITE_TIMING_OPTIONS) {
          if (timingOptions[key] !== undefined && typeof timingOptions[key] !== type) {
            return undefined;
          }
        }
      }

      return options;
    } catch {
      return undefined;
    }
  }
}
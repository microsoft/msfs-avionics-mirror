import { ReadonlyFloat64Array, Vec3Math } from '@microsoft/msfs-sdk';

/** A helper for definitions with only an electricity element. */
type ElectricityOnlyDefinition = {
  /** The electrical logic for this definition's system. */
  electricity?: CompositeLogicXMLElement;
}

/**
 * A definition for a channel of a KSG7200 ADAHRS.
 */
export type AdahrsDefinition = {
  /** The index of the sim altimeter used by this definition's left ADC. */
  leftAltimeterIndex: number;

  /** The index of the sim altimeter used by this definition's right ADC. */
  rightAltimeterIndex: number;

  /** The index of the sim airspeed indicator used by this definition's ADC. */
  airspeedIndicatorIndex: number;

  /** The electrical logic for this definition's ADAHRS. */
  electricity?: CompositeLogicXMLElement;

  /** The electrical logic for this definitions' ADM. */
  admElectricity?: CompositeLogicXMLElement;
};

/** A definition for a KMG7010 magnetometer. */
export type MagnetometerDefinition = ElectricityOnlyDefinition;

/**
 * A definition for a radar altimeter.
 */
export type RadarAltimeterDefinition = {
  /** The electrical logic for this definition's radar altimeter. */
  electricity?: CompositeLogicXMLElement;
  /** Antenna offset from the flight model origin point in metres [x, y, z]. */
  antennaOffset: ReadonlyFloat64Array;
  /** The offset to apply to the final measurement in metres. */
  measurementOffset: number;
};

/**
 * A definition for a GPS receiver.
 */
export type GpsDefinition = ElectricityOnlyDefinition;

/** A definition for a stall warning system (incl. AOA vane). */
export type StallWarningDefinition = ElectricityOnlyDefinition;

/** A definition for a landing gear indication system. */
export type LandingGearDefinition = ElectricityOnlyDefinition;

/** A definition for a flap warning system. */
export type FlapWarningDefinition = ElectricityOnlyDefinition & {
  /** The minimum valid takeoff flap angle in degrees. */
  minTakeoffPosition?: number;
  /** The maximum valid takeoff flap angle in degrees. */
  maxTakeoffPosition?: number;
};

/** A definition for an adf system */
export type AdfDefinition = ElectricityOnlyDefinition

/** A definition for a transponder system */
export type XpdrDefinition = ElectricityOnlyDefinition

/** The ACAS system types supported */
export enum AcasSystemType {
  TcasI,
  TcasII,
}

/** A definition for an Airborne Collision Avoidance System */
export type AcasSystemDefinition = {
  /** Which ACAS system is used onboard? */
  type: AcasSystemType,
  /** Definition for the cone of space, relative to the aircraft, in which ACAS is able to determine an intruder's bearing */
  bearingCone: {
    /** The elevation angle above which ACAS can determine the bearing of an intruder for display purposes */
    minElevation: number,
    /** The elevation angle above which ACAS can no longer determine the bearing of an intruder */
    maxElevation: number,
  }
}

/**
 * A configuration object which defines options related to various aircraft sensors.
 */
export class SensorsConfig {
  private static readonly DEFAULT_ACAS_DEFINITION = {
    type: AcasSystemType.TcasII,
    bearingCone: {
      minElevation: -10,
      maxElevation: 70
    }
  };

  /** The number of ADAHRS supported by the plane. */
  public readonly adahrsCount: number = 2;

  /** The number of Radio altimeters supported by the plane. */
  public readonly radarAltimeterCount: number;

  /** The number of GPS receivers supported by the plane. */
  public readonly gpsCount: number;

  /** The number of magnetometers supported by the plane. */
  public readonly magnetometerCount: number;

  /** The number of stall warning systems supported by the plane. */
  public readonly stallWarningCount: number;

  /** The number of landing gear indication systems supported by the plane. */
  public readonly landingGearCount = 1;

  /** The number of flap warning systems supported by the plane. */
  public readonly flapWarningCount: number;

  /** The number of ADF supported by the plane */
  public readonly adfCount: number;

  /** The number of transponder supported by the plane */
  public readonly xpdrCount: number;

  /**
   * AHRS definitions. The index of each definition's position in the array corresponds to the index of its AHRS.
   */
  public readonly adahrsDefinitions: readonly Readonly<AdahrsDefinition>[];

  /** RA definitions. The index of each definition's position in the array corresponds to the index of its RA. */
  public readonly radarAltimeterDefinitions: readonly Readonly<RadarAltimeterDefinition>[];

  /** GPS definitions. The index of each definition's position in the array corresponds to the index of its GPS. */
  public readonly gpsDefinitions: readonly Readonly<GpsDefinition>[];

  public readonly magnetometerDefinitions: readonly Readonly<MagnetometerDefinition>[];

  public readonly stallWarningDefinitions: readonly Readonly<StallWarningDefinition>[];

  public readonly landingGearDefinitions: readonly Readonly<LandingGearDefinition>[];

  public readonly flapWarningDefinitions: readonly Readonly<FlapWarningDefinition>[];

  public readonly adfDefinitions: readonly Readonly<AdfDefinition>[];

  public readonly xpdrDefinitions: readonly Readonly<XpdrDefinition>[];

  public readonly acasDefinition: AcasSystemDefinition = SensorsConfig.DEFAULT_ACAS_DEFINITION;

  /**
   * Creates a new SensorsConfig from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   */
  constructor(baseInstrument: BaseInstrument, element: Element | undefined) {
    if (element === undefined) {
      this.adahrsCount = 1;
      this.radarAltimeterCount = 1;
      this.gpsCount = 1;
      this.magnetometerCount = 1;
      this.stallWarningCount = 1;
      this.flapWarningCount = 1;
      this.adfCount = 1;
      this.xpdrCount = 1;
      this.adahrsDefinitions = [
        undefined as any,
        { leftAltimeterIndex: 1, rightAltimeterIndex: 1, airspeedIndicatorIndex: 1, attitudeIndicatorIndex: 1, directionIndicatorIndex: 1 }
      ];
      this.radarAltimeterDefinitions = [undefined as any, {}];
      this.gpsDefinitions = [undefined as any, {}];
      this.magnetometerDefinitions = [undefined as any, {}];
      this.stallWarningDefinitions = [undefined as any, {}];
      this.landingGearDefinitions = [undefined as any, {}];
      this.flapWarningDefinitions = [undefined as any, {}];
      this.adfDefinitions = [undefined as any, {}];
      this.xpdrDefinitions = [undefined as any, {}];
    } else {
      if (element.tagName !== 'Sensors') {
        throw new Error(`Invalid SensorsConfig definition: expected tag name 'Sensors' but was '${element.tagName}'`);
      }

      const radarAltimeterCount = Number(element.getAttribute('radar-altimeter-count'));
      if (!Number.isInteger(radarAltimeterCount) || radarAltimeterCount < 1 || radarAltimeterCount > 2) {
        console.warn('Invalid SensorsConfig definition: unrecognized RA count (must be 1 or 2)');
        this.radarAltimeterCount = 1;
      } else {
        this.radarAltimeterCount = radarAltimeterCount;
      }

      const gpsCount = Number(element.getAttribute('gps-count'));
      if (!Number.isInteger(gpsCount) || gpsCount < 1 || gpsCount > 2) {
        console.warn('Invalid SensorsConfig definition: unrecognized GPS count (must be 1 or 2)');
        this.gpsCount = 1;
      } else {
        this.gpsCount = gpsCount;
      }

      const magnetometerCount = Number(element.getAttribute('magnetometer-count'));
      if (!Number.isInteger(magnetometerCount) || magnetometerCount < 1 || magnetometerCount > 2) {
        console.warn('Invalid SensorsConfig definition: unrecognized magnetometer count (must be 1 or 2)');
        this.magnetometerCount = 1;
      } else {
        this.magnetometerCount = magnetometerCount;
      }

      const stallWarningCount = Number(element.getAttribute('stall-warning-count'));
      if (!Number.isInteger(stallWarningCount) || stallWarningCount < 1 || stallWarningCount > 2) {
        console.warn('Invalid SensorsConfig definition: unrecognized stall warning count (must be 1 or 2)');
        this.stallWarningCount = 1;
      } else {
        this.stallWarningCount = stallWarningCount;
      }

      const flapWarningCount = Number(element.getAttribute('flap-warning-count'));
      if (!Number.isInteger(flapWarningCount) || flapWarningCount < 1 || flapWarningCount > 2) {
        console.warn('Invalid SensorsConfig definition: unrecognized flap warning count (must be 1 or 2)');
        this.flapWarningCount = 1;
      } else {
        this.flapWarningCount = flapWarningCount;
      }

      const adfCount = Number(element.getAttribute('adf-count'));
      if (!Number.isInteger(adfCount) || adfCount < 1 || adfCount > 2) {
        console.warn('Invalid SensorsConfig definition: unrecognized adf count (must be 1 or 2)');
        this.adfCount = 1;
      } else {
        this.adfCount = adfCount;
      }

      const xpdrCount = Number(element.getAttribute('xpdr-count'));
      if (!Number.isInteger(xpdrCount) || xpdrCount < 1 || xpdrCount > 2) {
        console.warn('Invalid SensorsConfig definition: unrecognized xpdr count (must be 1 or 2)');
        this.xpdrCount = 1;
      } else {
        this.xpdrCount = xpdrCount;
      }

      this.adahrsDefinitions = this.parseAdahrsDefinitions(baseInstrument, element);
      this.radarAltimeterDefinitions = this.parseRadarAltimeterDefinitions(baseInstrument, element);
      this.gpsDefinitions = this.parseGpsDefinitions(baseInstrument, element);
      this.magnetometerDefinitions = this.parseMagnetometerDefinitions(baseInstrument, element);
      this.stallWarningDefinitions = this.parseStallWarningDefinitions(baseInstrument, element);
      this.landingGearDefinitions = this.parseLandingGearDefinitions(baseInstrument, element);
      this.flapWarningDefinitions = this.parseFlapWarningDefinitions(baseInstrument, element);
      this.adfDefinitions = this.parseAdfDefinitions(baseInstrument, element);
      this.xpdrDefinitions = this.parseXpdrDefinitions(baseInstrument, element);
      this.acasDefinition = this.parseAcasDefinition(baseInstrument, element);
    }
  }

  /**
   * Parses AHRS definitions from configuration document elements.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns An array of AHRS definitions defined by the configuration document element.
   */
  private parseAdahrsDefinitions(baseInstrument: BaseInstrument, element: Element): readonly Readonly<AdahrsDefinition>[] {
    const adahrsElements = element.querySelectorAll(':scope>Adahrs');

    const defs: AdahrsDefinition[] = [];

    for (const adahrsElement of adahrsElements) {
      const index = Number(adahrsElement.getAttribute('index'));
      if (!Number.isInteger(index) || index < 1 || index > this.adahrsCount) {
        console.warn('Invalid SensorsConfig definition: unrecognized AHRS index (must be an integer between 1 and the number of supported AHRS)');
        continue;
      }

      const leftAltimeterIndex = Number(adahrsElement.getAttribute('left-altimeter'));
      if (!Number.isInteger(leftAltimeterIndex) || leftAltimeterIndex < 1) {
        console.warn('Invalid SensorsConfig definition: unrecognized left altimeter index (must be a positive integer)');
        continue;
      }

      const rightAltimeterIndex = Number(adahrsElement.getAttribute('right-altimeter'));
      if (!Number.isInteger(rightAltimeterIndex) || rightAltimeterIndex < 1) {
        console.warn('Invalid SensorsConfig definition: unrecognized right altimeter index (must be a positive integer)');
        continue;
      }

      const airspeedIndicatorIndex = Number(adahrsElement.getAttribute('airspeed-indicator'));
      if (!Number.isInteger(airspeedIndicatorIndex) || airspeedIndicatorIndex < 1) {
        console.warn('Invalid SensorsConfig definition: unrecognized airspeed indicator index (must be a positive integer)');
        continue;
      }

      const electricLogicElement = adahrsElement.querySelector(':scope>Electric');
      const admElectricLogicElement = adahrsElement.querySelector(':scope>AdmElectric');

      defs[index] = {
        leftAltimeterIndex,
        rightAltimeterIndex,
        airspeedIndicatorIndex,
        electricity: electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement),
        admElectricity: admElectricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, admElectricLogicElement)
      };
    }

    // Set defaults for indexes that don't have definitions
    for (let i = 1; i <= this.adahrsCount; i++) {
      if (defs[i] === undefined) {
        defs[i] = {
          rightAltimeterIndex: i,
          leftAltimeterIndex: i,
          airspeedIndicatorIndex: i,
        };
      }
    }

    return defs;
  }

  /**
   * Parses a radar altimeter definition from configuration document elements.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns An array of RA definitions defined by the configuration document element.
   */
  private parseRadarAltimeterDefinitions(baseInstrument: BaseInstrument, element: Element): readonly Readonly<RadarAltimeterDefinition>[] {
    const radarAltimeterElements = element.querySelectorAll(':scope>RadarAltimeter');

    const defs: RadarAltimeterDefinition[] = [];

    for (const radarAltimeterElement of radarAltimeterElements) {
      const index = Number(radarAltimeterElement.getAttribute('index'));
      if (!Number.isInteger(index) || index < 1 || index > this.radarAltimeterCount) {
        console.warn('Invalid SensorsConfig definition: unrecognized AHRS index (must be an integer between 1 and the number of supported AHRS)');
        continue;
      }

      const antennaOffset = Vec3Math.create();
      const antennaOffsetElement = radarAltimeterElement.getAttribute('antenna-offset');
      if (antennaOffsetElement !== null) {
        const offsets = antennaOffsetElement.split(',');
        if (offsets.length === 3) {
          const floatOffsets = offsets.map((v) => parseFloat(v));
          if (floatOffsets.every((v) => isFinite(v))) {
            antennaOffset.set(floatOffsets);
          } else {
            console.warn('Invalid SensorsConfig definition: unrecognised radar altimeter antenna-offset (must be 3 number values separated by commas)');
          }
        } else {
          console.warn('Invalid SensorsConfig definition: unrecognised radar altimeter antenna-offset (must be 3 number values separated by commas)');
        }
      }

      let measurementOffset = 0;
      const measurementOffsetElement = radarAltimeterElement.getAttribute('measurement-offset');
      if (measurementOffsetElement !== null) {
        const offset = parseFloat(measurementOffsetElement);
        if (isFinite(offset)) {
          measurementOffset = offset;
        } else {
          console.warn('Invalid SensorsConfig definition: unrecognised radar altimeter measurement-offset (must be a float or integer value)');
        }
      }

      const electricLogicElement = radarAltimeterElement.querySelector(':scope>Electric');

      defs[index] = {
        antennaOffset,
        measurementOffset,
        electricity: electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement),
      };
    }

    // Set defaults for indexes that don't have definitions
    for (let i = 1; i <= this.radarAltimeterCount; i++) {
      if (defs[i] === undefined) {
        defs[i] = {
          antennaOffset: Vec3Math.create(),
          measurementOffset: 0,
        };
      }
    }

    return defs;
  }

  /**
   * Parses a GPS receiver definition from configuration document elements.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns An array of GPS definitions defined by the configuration document element.
   */
  private parseGpsDefinitions(baseInstrument: BaseInstrument, element: Element): readonly Readonly<GpsDefinition>[] {
    const gpsElements = element.querySelectorAll(':scope>Gps');

    const defs: GpsDefinition[] = [];

    for (const gpsElement of gpsElements) {
      const index = Number(gpsElement.getAttribute('index'));
      if (!Number.isInteger(index) || index < 1 || index > this.gpsCount) {
        console.warn('Invalid SensorsConfig definition: unrecognized GPS index (must be an integer between 1 and the number of supported GPS)');
        continue;
      }

      defs[index] = this.parseElectricityOnlyDefinition(baseInstrument, gpsElement);
    }

    // Set defaults for indexes that don't have definitions
    for (let i = 1; i <= this.gpsCount; i++) {
      if (defs[i] === undefined) {
        defs[i] = {};
      }
    }

    return defs;
  }

  /**
   * Parses a magnetometer definition from configuration document elements.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns An array of magnetometer definitions defined by the configuration document element.
   */
  private parseMagnetometerDefinitions(baseInstrument: BaseInstrument, element: Element): readonly Readonly<MagnetometerDefinition>[] {
    const magnetometerElements = element.querySelectorAll(':scope>Magnetometer');

    const defs: MagnetometerDefinition[] = [];

    for (const magnetometerElement of magnetometerElements) {
      const index = Number(magnetometerElement.getAttribute('index'));
      if (!Number.isInteger(index) || index < 1 || index > this.magnetometerCount) {
        console.warn('Invalid SensorsConfig definition: unrecognized magnetometer index (must be an integer between 1 and the number of supported magnetometers)');
        continue;
      }

      defs[index] = this.parseElectricityOnlyDefinition(baseInstrument, magnetometerElement);
    }

    // Set defaults for indexes that don't have definitions
    for (let i = 1; i <= this.magnetometerCount; i++) {
      if (defs[i] === undefined) {
        defs[i] = {};
      }
    }

    return defs;
  }

  /**
   * Parses a stall warning definition from configuration document elements.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns An array of stall warning system definitions defined by the configuration document element.
   */
  private parseStallWarningDefinitions(baseInstrument: BaseInstrument, element: Element): readonly Readonly<StallWarningDefinition>[] {
    const stallWarningElements = element.querySelectorAll(':scope>StallWarning');

    const defs: StallWarningDefinition[] = [];

    for (const stallWarningElement of stallWarningElements) {
      const index = Number(stallWarningElement.getAttribute('index'));
      if (!Number.isInteger(index) || index < 1 || index > this.stallWarningCount) {
        console.warn('Invalid SensorsConfig definition: unrecognized stall warning index (must be an integer between 1 and the number of supported stall warning systems)');
        continue;
      }

      defs[index] = this.parseElectricityOnlyDefinition(baseInstrument, stallWarningElement);
    }

    // Set defaults for indexes that don't have definitions
    for (let i = 1; i <= this.stallWarningCount; i++) {
      if (defs[i] === undefined) {
        defs[i] = {};
      }
    }

    return defs;
  }

  /**
   * Parses a landing gear indication system definition from configuration document elements.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns An array of landing gear indication system definitions defined by the configuration document element.
   */
  private parseLandingGearDefinitions(baseInstrument: BaseInstrument, element: Element): readonly Readonly<StallWarningDefinition>[] {
    const landingGearElements = element.querySelectorAll(':scope>LandingGear');

    const defs: StallWarningDefinition[] = [];

    for (const landingGearElement of landingGearElements) {
      const index = Number(landingGearElement.getAttribute('index'));
      if (!Number.isInteger(index) || index < 1 || index > this.landingGearCount) {
        console.warn('Invalid SensorsConfig definition: unrecognized landing gear index (must be 1)');
        continue;
      }

      defs[index] = this.parseElectricityOnlyDefinition(baseInstrument, landingGearElement);
    }

    // Set defaults for indexes that don't have definitions
    for (let i = 1; i <= this.landingGearCount; i++) {
      if (defs[i] === undefined) {
        defs[i] = {};
      }
    }

    return defs;
  }

  /**
   * Parses a flap warning system definition from configuration document elements.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns An array of flap warning system definitions defined by the configuration document element.
   */
  private parseFlapWarningDefinitions(baseInstrument: BaseInstrument, element: Element): readonly Readonly<FlapWarningDefinition>[] {
    const flapWarningElements = element.querySelectorAll(':scope>FlapWarning');

    const defs: FlapWarningDefinition[] = [];

    for (const flapWarningElement of flapWarningElements) {
      const index = Number(flapWarningElement.getAttribute('index'));
      if (!Number.isInteger(index) || index < 1 || index > this.flapWarningCount) {
        console.warn('Invalid SensorsConfig definition: unrecognized flap warning system index (must be an integer between 1 and the number of supported flap warning systems)');
        continue;
      }

      const takeoffPositionElements = flapWarningElement.querySelectorAll(':scope>TakeoffFlapPosition');
      if (takeoffPositionElements.length !== 1) {
        console.warn('Invalid SensorsConfig definition: wrong number of TakeoffFlapPositions elements, must be one.');
        continue;
      }

      const minTakeoffPosition = Number(takeoffPositionElements[0].getAttribute('min'));
      if (!Number.isInteger(minTakeoffPosition)) {
        console.warn('Invalid SensorsConfig definition: invalid takeoff flap min (must be an integer)');
      }
      const maxTakeoffPosition = Number(takeoffPositionElements[0].getAttribute('max'));
      if (!Number.isInteger(maxTakeoffPosition)) {
        console.warn('Invalid SensorsConfig definition: invalid takeoff flap max (must be an integer)');
      }

      defs[index] = {
        ...this.parseElectricityOnlyDefinition(baseInstrument, flapWarningElement),
        minTakeoffPosition,
        maxTakeoffPosition,
      };
    }

    // Set defaults for indexes that don't have definitions
    for (let i = 1; i <= this.flapWarningCount; i++) {
      if (defs[i] === undefined) {
        defs[i] = {};
      }
    }

    return defs;
  }

  /**
   * Parses an ADF receiver definition from configuration document elements.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns An array of ADF definitions defined by the configuration document element.
   */
  private parseAdfDefinitions(baseInstrument: BaseInstrument, element: Element): readonly Readonly<AdfDefinition>[] {
    const adfElements = element.querySelectorAll(':scope>Adf');

    const defs: AdfDefinition[] = [];

    for (const adfElement of adfElements) {
      const index = Number(adfElement.getAttribute('index'));
      if (!Number.isInteger(index) || index < 1 || index > this.adfCount) {
        console.warn('Invalid SensorsConfig definition: unrecognized ADF index (must be an integer between 1 and the number of supported ADF)');
        continue;
      }

      defs[index] = this.parseElectricityOnlyDefinition(baseInstrument, adfElement);
    }

    // Set defaults for indexes that don't have definitions
    for (let i = 1; i <= this.adfCount; i++) {
      if (defs[i] === undefined) {
        defs[i] = {};
      }
    }

    return defs;
  }

  /**
   * Parses an ADF receiver definition from configuration document elements.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns An array of ADF definitions defined by the configuration document element.
   */
  private parseXpdrDefinitions(baseInstrument: BaseInstrument, element: Element): readonly Readonly<XpdrDefinition>[] {
    const xpdrElements = element.querySelectorAll(':scope>Transponder');

    const defs: XpdrDefinition[] = [];

    for (const xpdrElement of xpdrElements) {
      const index = Number(xpdrElement.getAttribute('index'));
      if (!Number.isInteger(index) || index < 1 || index > this.xpdrCount) {
        console.warn('Invalid SensorsConfig definition: unrecognized xpdr index (must be an integer between 1 and the number of supported xpdr)');
        continue;
      }

      defs[index] = this.parseElectricityOnlyDefinition(baseInstrument, xpdrElement);
    }

    // Set defaults for indexes that don't have definitions
    for (let i = 1; i <= this.adfCount; i++) {
      if (defs[i] === undefined) {
        defs[i] = {};
      }
    }

    return defs;
  }

  /**
   * Parses an ACAS system definition from configuration document elements.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns An array of ADF definitions defined by the configuration document element.
   */
  private parseAcasDefinition(baseInstrument: BaseInstrument, element: Element): AcasSystemDefinition {
    const acasElements = element.querySelectorAll(':scope>Acas');

    const def = SensorsConfig.DEFAULT_ACAS_DEFINITION;

    if (acasElements.length > 1) {
      console.warn('SensorsConfig: Multiple Acas definitions exist. Using the first one and ignoring the rest.');
    }
    if (acasElements[0]) {
      const type = acasElements[0].getAttribute('type');
      switch (type?.toLowerCase() ?? 'tcasii') {
        case 'tcasi':
        case 'tcas1':
        case 'tcas-i':
          def.type = AcasSystemType.TcasI;
          break;
        case 'tcasii':
        case 'tcas2':
        default:
          def.type = AcasSystemType.TcasII;
      }

      const minElev = acasElements[0].getAttribute('min-elevation') ?? -10;
      if (isFinite(Number(minElev))) {
        def.bearingCone.minElevation = Number(minElev);
      } else {
        console.warn('SensorsConfig > Acas: Invalid min-elevation attribute, value must be a finite number. Defaulting to -10.');
      }

      const maxElev = acasElements[0].getAttribute('max-elevation') ?? 70;
      if (isFinite(Number(maxElev))) {
        def.bearingCone.maxElevation = Number(maxElev);
      } else {
        console.warn('SensorsConfig > Acas: Invalid max-elevation attribute, value must be a finite number. Defaulting to 70.');
      }
    }

    return def;
  }

  /**
   * Parses an electricity element only definition from configuration document elements.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns An electricity definition.
   */
  private parseElectricityOnlyDefinition(baseInstrument: BaseInstrument, element: Element): Readonly<ElectricityOnlyDefinition> {
    const electricLogicElement = element.querySelector(':scope>Electric');

    return {
      electricity: electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement),
    };
  }
}

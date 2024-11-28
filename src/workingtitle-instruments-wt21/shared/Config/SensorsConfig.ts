/** A helper for definitions with only an electricity element. */
type ElectricityOnlyDefinition = {
  /** The electrical logic for this definition's system. */
  electricity?: CompositeLogicXMLElement;
}

/**
 * A definition for an Attitude and Heading Reference System
 */
export type AhrsDefinition = {
  /** The one-based index of the PFD which defaults to using this Ahrs system */
  defaultPfdIndex: number
  /** The index of the sim attitude indicator used by this system */
  attitudeIndicatorIndex: number
  /** The index of the sim direction indicator used by this system */
  directionIndicatorIndex: number
} & ElectricityOnlyDefinition

/**
 * A definition for an Air Data Computer system.
 */
export type AdcDefinition = {
  /** The one-based index of the PFD which defaults to using this Ahrs system */
  defaultPfdIndex: number
  /** The index of the sim airspeed indicator used by this system */
  airspeedIndicatorIndex: number
  /** The index of the sim altimeter used by this system */
  altimeterIndex: number
} & ElectricityOnlyDefinition

/**
 * A definition for an Angle of Attack sensor system.
 */
export type AoaDefinition = {
  /** Angle of attack limits based on a map of flap definitions */
  flapAoaDefinitions: Map<number, AoaFlapDefinition>;
} & ElectricityOnlyDefinition

/**
 * A definition of AOA limits for a given flap configuration.
 */
export interface AoaFlapDefinition {
  /** The zero-lift angle of attack, in degrees. */
  zeroLift: number;

  /** The stall angle of attack, in degrees. */
  stall: number;

  /** The correction factor to adjust against any non-linearity in the AOA. */
  correctionFactor: number;
}

/**
 * A definition for a Transponder system
 */
export type TransponderDefinition = ElectricityOnlyDefinition

/**
 * A definition for a Radio Altimeter system
 */
export type RadioAltimeterDefinition = ElectricityOnlyDefinition

/**
 * A configuration object which defines the various sensors available on the WT21
 */
export class SensorsConfig {
  public readonly ahrsCount = 2;
  public readonly magnetometerCount = 2;
  public readonly adcCount = 2;
  public readonly aoaSystemCount = 1;
  public readonly radioAltimeterCount = 2;
  public readonly transponderCount = 1;
  public readonly trafficSurveillanceSystemCount = 1;
  public readonly radioSensorSystemCount = 1;

  public ahrsDefinitions: AhrsDefinition[] = [];
  public adcDefinitions: AdcDefinition[] = [];
  public aoaDefinition: AoaDefinition;
  public xpdrDefinition: TransponderDefinition;
  public raDefinition: RadioAltimeterDefinition;

  /** @inheritdoc */
  constructor(baseInstrument: BaseInstrument, element?: Element) {
    if (element) {
      this.ahrsDefinitions = this.parseAhrsDefinitions(baseInstrument, element.querySelectorAll(':scope>Ahrs'));
      this.adcDefinitions = this.parseAdcDefinitions(baseInstrument, element.querySelectorAll(':scope>Adc'));
      this.aoaDefinition = this.parseAoaDefinitions(baseInstrument, element.querySelectorAll(':scope>AOASystem'));

      const xpdrElement = element.querySelector(':scope>Transponder');
      const raElement = element.querySelector(':scope>RadioAltimeter');
      this.xpdrDefinition = xpdrElement ? this.parseElecOnlyDefinition(baseInstrument, xpdrElement) : {};
      this.raDefinition = raElement ? this.parseElecOnlyDefinition(baseInstrument, raElement) : {};
    } else {
      for (let i = 1; i <= 2; i++) {
        this.ahrsDefinitions[i] = {
          defaultPfdIndex: i,
          attitudeIndicatorIndex: i,
          directionIndicatorIndex: i,
          electricity: undefined
        };

        this.adcDefinitions[i] = {
          defaultPfdIndex: i,
          airspeedIndicatorIndex: i,
          altimeterIndex: i,
          electricity: undefined
        };
      }

      this.aoaDefinition = {
        flapAoaDefinitions: new Map<number, AoaFlapDefinition>()
      };

      this.xpdrDefinition = {};
      this.raDefinition = {};
    }
  }

  /**
   * Parses an Ahrs system definition
   * @param baseInstrument The base instrument object
   * @param elements The xml configuration elements which defines this sensor object
   * @returns A sensor configuration object
   */
  private parseAhrsDefinitions(baseInstrument: BaseInstrument, elements: NodeListOf<Element>): AhrsDefinition[] {
    const defs: AhrsDefinition[] = [];

    for (const element of elements) {
      const index = Number(element.getAttribute('index'));
      if (!index || isNaN(index) || index < 1 || index > this.ahrsCount) {
        console.warn('Invalid SensorsConfig definition: unrecognized AHRS index (must be an integer between 1 and the number of supported AHRS)');
      }

      const defaultPfdIndex = Number(element.getAttribute('pfd-index'));
      if (!index || isNaN(index) || index < 1) {
        console.warn('Invalid SensorsConfig definition: unrecognized PFD index (must be an integer more than 1)');
      }

      const attitudeIndicatorIndex = Number(element.getAttribute('attitude-indicator'));
      if (!Number.isInteger(attitudeIndicatorIndex) || attitudeIndicatorIndex < 1) {
        console.warn('Invalid SensorsConfig definition: unrecognized attitude indicator index (must be a positive integer)');
      }

      const directionIndicatorIndex = Number(element.getAttribute('direction-indicator'));
      if (!Number.isInteger(directionIndicatorIndex) || directionIndicatorIndex < 1) {
        console.warn('Invalid SensorsConfig definition: unrecognized direction indicator index (must be a positive integer)');
      }

      const electricLogicElement = element.querySelector(':scope>Electric');

      defs[index] = {
        defaultPfdIndex,
        attitudeIndicatorIndex,
        directionIndicatorIndex,
        electricity: electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement)
      };
    }

    return defs;
  }

  /**
   * Parses an Adc system definition
   * @param baseInstrument The base instrument object
   * @param elements The xml configuration elements which defines this sensor object
   * @returns A sensor configuration object
   */
  private parseAdcDefinitions(baseInstrument: BaseInstrument, elements: NodeListOf<Element>): AdcDefinition[] {
    const defs: AdcDefinition[] = [];

    for (const element of elements) {
      const index = Number(element.getAttribute('index'));
      if (!index || isNaN(index) || index < 1 || index > this.ahrsCount) {
        console.warn('Invalid SensorsConfig definition: unrecognized ADC index (must be an integer between 1 and the number of supported AHRS)');
      }

      const defaultPfdIndex = Number(element.getAttribute('pfd-index'));
      if (!index || isNaN(index) || index < 1) {
        console.warn('Invalid SensorsConfig definition: unrecognized PFD index (must be an integer more than 1)');
      }

      const airspeedIndicatorIndex = Number(element.getAttribute('airspeed-indicator'));
      if (!Number.isInteger(airspeedIndicatorIndex) || airspeedIndicatorIndex < 1) {
        console.warn('Invalid SensorsConfig definition: unrecognized airspeed indicator index (must be a positive integer)');
      }

      const altimeterIndex = Number(element.getAttribute('altimeter'));
      if (!Number.isInteger(altimeterIndex) || altimeterIndex < 1) {
        console.warn('Invalid SensorsConfig definition: unrecognized altimeter index (must be a positive integer)');
      }

      const electricLogicElement = element.querySelector(':scope>Electric');

      defs[index] = {
        defaultPfdIndex,
        airspeedIndicatorIndex,
        altimeterIndex,
        electricity: electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement)
      };
    }

    return defs;
  }

  /**
   * Parses an AOA system definition
   * @param baseInstrument The base instrument object
   * @param elements The xml configuration elements which defines this sensor object
   * @returns A sensor configuration object
   */
  private parseAoaDefinitions(baseInstrument: BaseInstrument, elements: NodeListOf<Element>): AoaDefinition {
    const def: AoaDefinition = {
      flapAoaDefinitions: new Map<number, AoaFlapDefinition>()
    };

    if (elements.length > 1) {
      console.warn('Invalid SensorsConfig definition: multiple AOA systems have been defined, only using data from the first.');
    }

    const element = elements[0];

    const electricLogicElement = element.querySelector(':scope>Electric');
    def.electricity = electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement);

    const flapDefinitions = element.querySelectorAll(':scope>Flaps');

    for (const flapDef of flapDefinitions) {
      const index = Number(flapDef.getAttribute('index'));
      if (!index || isNaN(index) || index < 0) {
        console.warn('Invalid AOASystem>Flaps definition: unrecognized flap index (must be an integer of 0 or above); Discarding AOA flap definition with index', index);
        continue;
      }

      const stallAoa = flapDef.getAttribute('stall');
      const zeroLift = flapDef.getAttribute('zeroLift');
      const correctionFactor = flapDef.getAttribute('correctionFactor');

      if (!stallAoa || !isFinite(parseFloat(stallAoa))) {
        console.warn('Invalid AOASystem>Flaps definition: stall attribute is missing or an invalid number. Discarding AOA flap definition with index', index);
        continue;
      }
      if (!zeroLift || !isFinite(parseFloat(zeroLift))) {
        console.warn('Invalid AOASystem>Flaps definition: zeroLift attribute is missing or an invalid number. Discarding AOA flap definition with index', index);
        continue;
      }
      if (!correctionFactor || !isFinite(parseFloat(correctionFactor))) {
        console.warn('Invalid AOASystem>Flaps definition: correctionFactor attribute is missing or an invalid number. Discarding AOA flap definition with index', index);
        continue;
      }

      if (!def.flapAoaDefinitions) {
        def.flapAoaDefinitions = new Map();
      }

      def.flapAoaDefinitions.set(index, {
        stall: parseFloat(stallAoa),
        zeroLift: parseFloat(zeroLift),
        correctionFactor: parseFloat(correctionFactor),
      });
    }

    return def;
  }

  /**
   * Parses an electricity only system definition
   * @param baseInstrument The base instrument object
   * @param element The xml configuration element which defines this sensor object
   * @returns A sensor configuration object
   */
  private parseElecOnlyDefinition(baseInstrument: BaseInstrument, element: Element): ElectricityOnlyDefinition {
    const def: ElectricityOnlyDefinition = {};

    const electricLogicElement = element.querySelector(':scope>Electric');
    def.electricity = electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement);

    return def;
  }
}

import { Config } from '../Config/Config';

/**
 * A definition for a GPS receiver.
 */
export type GpsReceiverDefinition = {
  /** The electrical logic for this definition's GPS receiver. */
  electricity?: CompositeLogicXMLElement;
};

/**
 * A definition for an FMS geo-positioning system.
 */
export type FmsPositionDefinition = {
  /** The electrical logic for this definition's FMS geo-positioning system. */
  electricity?: CompositeLogicXMLElement;
};

/**
 * A configuration object which defines options related to IAUs.
 */
export class IauDefsConfig implements Config {
  /** The number of IAUs (integrated avionics units) supported by the plane. */
  public readonly count: number;

  /**
   * IAU definitions. The index of each definition's position in the array corresponds to the index of its IAU.
   */
  public readonly definitions: readonly IauConfig[];

  /**
   * Creates a new IauDefsConfig from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   */
  constructor(baseInstrument: BaseInstrument, element: Element | undefined) {
    if (element === undefined) {
      this.count = 1;
      this.definitions = [undefined as any, new IauConfig(baseInstrument, undefined)];
    } else {
      if (element.tagName !== 'IauDefs') {
        throw new Error(`Invalid IauDefsConfig definition: expected tag name 'IauDefs' but was '${element.tagName}'`);
      }

      const count = Number(element.getAttribute('count'));
      if (!Number.isInteger(count) || count < 1) {
        console.warn('Invalid IauDefsConfig definition: unrecognized IAU count (must be a positive integer)');
        this.count = 1;
      } else {
        this.count = count;
      }

      this.definitions = this.parseDefinitions(baseInstrument, element);
    }
  }

  /**
   * Parses IAU definitions from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns An array of IAU definitions defined by the configuration document element.
   */
  private parseDefinitions(baseInstrument: BaseInstrument, element: Element): readonly IauConfig[] {
    const elements = element.querySelectorAll(':scope>Iau');

    const defs: IauConfig[] = [];

    for (const iauElement of elements) {
      try {
        const def = new IauConfig(baseInstrument, iauElement);
        defs[def.index] = def;
      } catch {
        // noop
      }
    }

    // Set defaults for indexes that don't have definitions
    for (let i = 1; i <= this.count; i++) {
      if (defs[i] === undefined) {
        defs[i] = new IauConfig(baseInstrument, undefined, i);
      }
    }

    return defs;
  }
}

/**
 * A configuration object which defines options related to an IAU.
 */
export class IauConfig implements Config {
  /** The index of the IAU. */
  public readonly index: number;

  /** The index of the default ADC used by the IAU. */
  public readonly defaultAdcIndex: number;

  /** The index of the default AHRS used by the IAU. */
  public readonly defaultAhrsIndex: number;

  /** The index of the sim altimeter used by the IAU. */
  public readonly altimeterIndex: number;

  /** Whether the IAU supports altimeter baro preselect. */
  public readonly supportBaroPreselect: boolean;

  /**
   * A definition describing the IAU's GPS receiver.
   */
  public readonly gpsDefinition: Readonly<GpsReceiverDefinition>;

  /**
   * A definition describing the IAU's FMS geo-positioning system.
   */
  public readonly fmsPosDefinition: Readonly<FmsPositionDefinition>;

  /**
   * Creates a new IauConfig from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @param defaultIndex The IAU index to assign to the config if one cannot be parsed from the configuration document
   * element. Defaults to `1`.
   */
  constructor(baseInstrument: BaseInstrument, element: Element | undefined, defaultIndex = 1) {
    defaultIndex = Math.max(1, Math.trunc(defaultIndex));

    if (element === undefined) {
      this.index = defaultIndex;
      this.defaultAdcIndex = 1;
      this.defaultAhrsIndex = 1;
      this.altimeterIndex = 1;
      this.supportBaroPreselect = false;
      this.gpsDefinition = {};
      this.fmsPosDefinition = {};
    } else {
      if (element.tagName !== 'Iau') {
        throw new Error(`Invalid IauConfig definition: expected tag name 'Iau' but was '${element.tagName}'`);
      }

      const index = Number(element.getAttribute('index'));
      if (!Number.isInteger(index) || index < 1) {
        console.warn(`Invalid IauConfig definition: unrecognized index (must be a positive integer). Defaulting to ${defaultIndex}.`);
        this.index = defaultIndex;
      } else {
        this.index = index;
      }

      const defaultAdcIndex = Number(element.getAttribute('default-adc'));
      if (!Number.isInteger(defaultAdcIndex) || defaultAdcIndex < 1) {
        console.warn('Invalid IauConfig definition: unrecognized default ADC index (must be a positive integer). Defaulting to 1.');
        this.defaultAdcIndex = 1;
      } else {
        this.defaultAdcIndex = defaultAdcIndex;
      }

      const defaultAhrsIndex = Number(element.getAttribute('default-ahrs'));
      if (!Number.isInteger(defaultAhrsIndex) || defaultAhrsIndex < 1) {
        console.warn('Invalid IauConfig definition: unrecognized default AHRS index (must be a positive integer). Defaulting to 1.');
        this.defaultAhrsIndex = 1;
      } else {
        this.defaultAhrsIndex = defaultAhrsIndex;
      }

      const altimeterIndex = Number(element.getAttribute('altimeter-source'));
      if (!Number.isInteger(altimeterIndex) || altimeterIndex < 1) {
        console.warn('Invalid IauConfig definition: unrecognized altimeter index (must be a positive integer). Defaulting to 1.');
        this.altimeterIndex = 1;
      } else {
        this.altimeterIndex = altimeterIndex;
      }

      const baroPreselect = element.getAttribute('baro-preselect')?.toLowerCase();
      switch (baroPreselect) {
        case 'true':
          this.supportBaroPreselect = true;
          break;
        case 'false':
          this.supportBaroPreselect = false;
          break;
        case undefined:
          this.supportBaroPreselect = false;
          break;
        default:
          console.warn('Invalid IauConfig definition: invalid baro-preselect option (must be true or false). Defaulting to false.');
          this.supportBaroPreselect = false;
      }

      this.gpsDefinition = this.parseGpsDefinition(baseInstrument, element);
      this.fmsPosDefinition = this.parseFmsPositionDefinition(baseInstrument, element);
    }
  }

  /**
   * Parses a GPS receiver definition from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns The GPS receiver definition defined by the configuration document element.
   */
  private parseGpsDefinition(baseInstrument: BaseInstrument, element: Element): Readonly<GpsReceiverDefinition> {
    const gpsElement = element.querySelector(':scope>Gps');

    const def: GpsReceiverDefinition = {};

    if (gpsElement) {
      const electricLogicElement = gpsElement.querySelector(':scope>Electric');
      def.electricity = electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement);
    }

    return def;
  }

  /**
   * Parses a FMS geo-positioning system definition from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns The geo-positioning system definition defined by the configuration document element.
   */
  private parseFmsPositionDefinition(baseInstrument: BaseInstrument, element: Element): Readonly<FmsPositionDefinition> {
    const fmsPosElement = element.querySelector(':scope>FmsPosition');

    const def: GpsReceiverDefinition = {};

    if (fmsPosElement) {
      const electricLogicElement = fmsPosElement.querySelector(':scope>Electric');
      def.electricity = electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement);
    }

    return def;
  }
}
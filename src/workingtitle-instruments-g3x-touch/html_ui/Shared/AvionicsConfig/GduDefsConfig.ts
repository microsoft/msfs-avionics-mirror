import { InstrumentType } from '../CommonTypes';
import { Config } from '../Config/Config';

/**
 * A definition for an FMS geo-positioning system.
 */
export type FmsPositionDefinition = {
  /**
   * The indexes of the GPS receivers that can be used by this definition's FMS geo-positioning system to source
   * position data. The order of the indexes in the array determines the priority with which the receivers are selected
   * when two or more receivers are providing the position data quality.
   */
  gpsReceiverIndexes: readonly number[];

  /** The electrical logic for this definition's FMS geo-positioning system. */
  electricity?: CompositeLogicXMLElement;
};

/**
 * A configuration object which defines options related to GDUs.
 */
export class GduDefsConfig implements Config {
  /** The number of GDUs installed in the plane. */
  public readonly count: number;

  /**
   * GDU definitions. The index of each definition's position in the array corresponds to the index of its GDU.
   */
  public readonly definitions: readonly GduConfig[];

  /**
   * Creates a new GduDefsConfig from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   */
  constructor(baseInstrument: BaseInstrument, element: Element | undefined) {
    if (element === undefined) {
      this.count = 1;
      this.definitions = [undefined as any, new GduConfig(baseInstrument, undefined)];
    } else {
      if (element.tagName !== 'GduDefs') {
        throw new Error(`Invalid GduDefsConfig definition: expected tag name 'GduDefs' but was '${element.tagName}'`);
      }

      const count = Number(element.getAttribute('count'));
      if (!Number.isInteger(count) || count < 1) {
        console.warn('Invalid GduDefsConfig definition: unrecognized GDU count (must be a positive integer)');
        this.count = 1;
      } else {
        this.count = count;
      }

      this.definitions = this.parseDefinitions(baseInstrument, element);
    }
  }

  /**
   * Parses GDU definitions from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns An array of GDU definitions defined by the configuration document element.
   */
  private parseDefinitions(baseInstrument: BaseInstrument, element: Element): readonly GduConfig[] {
    const elements = element.querySelectorAll(':scope>Gdu');

    const defs: GduConfig[] = [];

    for (const iauElement of elements) {
      try {
        const def = new GduConfig(baseInstrument, iauElement);
        defs[def.index] = def;
      } catch {
        // noop
      }
    }

    // Set defaults for indexes that don't have definitions
    for (let i = 1; i <= this.count; i++) {
      if (defs[i] === undefined) {
        defs[i] = new GduConfig(baseInstrument, undefined, i);
      }
    }

    return defs;
  }
}

/**
 * A configuration object which defines options related to a GDU.
 */
export class GduConfig implements Config {
  /** The index of the GDU. */
  public readonly index: number;

  /** The type of the GDU. */
  public readonly type: InstrumentType;

  /** The type index of the GDU. */
  public readonly typeIndex: number;

  /** The index of the default ADC used by the GDU. */
  public readonly defaultAdcIndex: number;

  /** The index of the default AHRS used by the GDU. */
  public readonly defaultAhrsIndex: number;

  /** The index of the sim altimeter used by the GDU. */
  public readonly altimeterIndex: number;

  /** Whether the GDU supports altimeter baro preselect. */
  public readonly supportBaroPreselect: boolean;

  /**
   * A definition describing the GDU's FMS geo-positioning system.
   */
  public readonly fmsPosDefinition: Readonly<FmsPositionDefinition>;

  /**
   * Creates a new GduConfig from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @param defaultIndex The GDU index to assign to the config if one cannot be parsed from the configuration document
   * element. Defaults to `1`.
   */
  constructor(baseInstrument: BaseInstrument, element: Element | undefined, defaultIndex = 1) {
    defaultIndex = Math.max(1, Math.trunc(defaultIndex));

    this.index = defaultIndex;
    this.type = 'PFD';
    this.typeIndex = 1;
    this.defaultAdcIndex = 1;
    this.defaultAhrsIndex = 1;
    this.altimeterIndex = 1;

    if (element === undefined) {
      this.supportBaroPreselect = false;
      this.fmsPosDefinition = {
        gpsReceiverIndexes: []
      };
    } else {
      if (element.tagName !== 'Gdu') {
        throw new Error(`Invalid GduConfig definition: expected tag name 'Gdu' but was '${element.tagName}'`);
      }

      const indexAttribute = element.getAttribute('index');
      if (indexAttribute !== null) {
        const index = Number(indexAttribute);
        if (!Number.isInteger(index) || index < 1) {
          console.warn(`Invalid GduConfig definition: unrecognized index (must be a positive integer). Defaulting to ${defaultIndex}.`);
        } else {
          this.index = index;
        }
      }

      const typeAttribute = element.getAttribute('type');
      if (typeAttribute !== null) {
        if (typeAttribute !== 'PFD' && typeAttribute !== 'MFD') {
          console.warn('Invalid GduConfig definition: unrecognized type (must be a "PFD" or "MFD"). Defaulting to PFD.');
        } else {
          this.type = typeAttribute;
        }
      }

      const typeIndexAttribute = element.getAttribute('type-index');
      if (typeIndexAttribute !== null) {
        const typeIndex = Number(typeIndexAttribute);
        if (!Number.isInteger(typeIndex) || typeIndex < 1) {
          console.warn('Invalid GduConfig definition: unrecognized type index (must be a positive integer). Defaulting to 1.');
        } else {
          this.typeIndex = typeIndex;
        }
      }

      const defaultAdcIndexAttribute = element.getAttribute('default-adc');
      if (defaultAdcIndexAttribute !== null) {
        const defaultAdcIndex = Number(defaultAdcIndexAttribute);
        if (!Number.isInteger(defaultAdcIndex) || defaultAdcIndex < 1) {
          console.warn('Invalid GduConfig definition: unrecognized default ADC index (must be a positive integer). Defaulting to 1.');
        } else {
          this.defaultAdcIndex = defaultAdcIndex;
        }
      }

      const defaultAhrsIndexAttribute = element.getAttribute('default-ahrs');
      if (defaultAhrsIndexAttribute !== null) {
        const defaultAhrsIndex = Number(defaultAhrsIndexAttribute);
        if (!Number.isInteger(defaultAhrsIndex) || defaultAhrsIndex < 1) {
          console.warn('Invalid GduConfig definition: unrecognized default AHRS index (must be a positive integer). Defaulting to 1.');
        } else {
          this.defaultAhrsIndex = defaultAhrsIndex;
        }
      }

      const altimeterIndexAttribute = element.getAttribute('altimeter-source');
      if (altimeterIndexAttribute !== null) {
        const altimeterIndex = Number(altimeterIndexAttribute);
        if (!Number.isInteger(altimeterIndex) || altimeterIndex < 1) {
          console.warn('Invalid GduConfig definition: unrecognized altimeter index (must be a positive integer). Defaulting to 1.');
        } else {
          this.altimeterIndex = altimeterIndex;
        }
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
          console.warn('Invalid GduConfig definition: invalid baro-preselect option (must be true or false). Defaulting to false.');
          this.supportBaroPreselect = false;
      }

      this.fmsPosDefinition = this.parseFmsPositionDefinition(baseInstrument, element);
    }
  }

  /**
   * Parses a FMS geo-positioning system definition from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns The geo-positioning system definition defined by the configuration document element.
   */
  private parseFmsPositionDefinition(baseInstrument: BaseInstrument, element: Element): Readonly<FmsPositionDefinition> {
    const fmsPosElement = element.querySelector(':scope>FmsPosition');

    let electricity: CompositeLogicXMLElement | undefined = undefined;
    const gpsReceiverIndexes: number[] = [];

    if (fmsPosElement) {
      const gpsReceiverIndexesAttribute = fmsPosElement.getAttribute('gps-receivers');
      if (gpsReceiverIndexesAttribute) {
        const indexes = gpsReceiverIndexesAttribute.split(',')
          .map(text => Number(text))
          .filter(index => {
            if (!(isFinite(index) && Number.isInteger(index) && index >= 1)) {
              console.warn('Invalid GduConfig definition: invalid GPS receiver index (must be a positive integer). Discarding index.');
              return false;
            } else {
              return true;
            }
          });

        for (let i = 0; i < indexes.length; i++) {
          if (gpsReceiverIndexes.includes(indexes[i])) {
            console.warn(`Invalid GduConfig definition: duplicate GPS receiver index ${indexes[i]}. Discarding duplicate.`);
          } else {
            gpsReceiverIndexes.push(indexes[i]);
          }
        }
      }

      const electricLogicElement = fmsPosElement.querySelector(':scope>Electric');
      electricity = electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement);
    }

    return {
      gpsReceiverIndexes,
      electricity
    };
  }
}
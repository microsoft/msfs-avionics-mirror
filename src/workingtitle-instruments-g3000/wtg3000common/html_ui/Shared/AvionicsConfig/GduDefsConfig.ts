import { PfdIndex } from '../CommonTypes';
import { Config } from '../Config/Config';
import { ConfigUtils } from '../Config/ConfigUtils';

/**
 * A definition for an FMS geo-positioning system.
 */
export type FmsPositionDefinition = {
  /**
   * The indexes of the GPS receivers that can be used by this definition's FMS geo-positioning system to source
   * position data. The order of the indexes in the array determines the priority with which the receivers are selected
   * when two or more receivers are providing the same position data quality.
   */
  gpsReceiverPriorities: readonly number[];
};

/**
 * A configuration object which defines options related to GDUs.
 */
export class GduDefsConfig implements Config {
  /**
   * Configuration objects for PFD GDUs. The index of each config's position in the array corresponds to the index of
   * its PFD.
   */
  public readonly pfds: readonly PfdGduConfig[];

  /** The number of configured PFD GDUs. */
  public readonly pfdCount: 1 | 2;

  /**
   * Creates a new GduDefsConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element | undefined) {
    if (element === undefined) {
      this.pfds = [undefined as any, new PfdGduConfig(1)];
    } else {
      if (element.tagName !== 'GduDefs') {
        throw new Error(`Invalid GduDefsConfig definition: expected tag name 'GduDefs' but was '${element.tagName}'`);
      }

      this.pfds = this.parsePfdConfigs(element);
    }

    this.pfdCount = this.pfds[2] ? 2 : 1;
  }

  /**
   * Parses PFD GDU configuration objects from a configuration document element.
   * @param element A configuration document element.
   * @returns An array of PFD GDU configuration objects defined by the configuration document element.
   */
  private parsePfdConfigs(element: Element): readonly PfdGduConfig[] {
    const elements = element.querySelectorAll(':scope>Pfd');

    const configs: PfdGduConfig[] = [];

    for (const pfdElement of elements) {
      try {
        const def = new PfdGduConfig(pfdElement);
        configs[def.index] ??= def;
      } catch {
        // noop
      }
    }

    configs[1] ??= new PfdGduConfig(1);

    return configs;
  }
}

/**
 * A configuration object which defines options related to a GDU.
 */
export class PfdGduConfig implements Config {
  /** The index of the PFD. */
  public readonly index: PfdIndex;

  /** The index of the default ADC used by the PFD. */
  public readonly defaultAdcIndex: number;

  /** The index of the default AHRS used by the PFD. */
  public readonly defaultAhrsIndex: number;

  /** The index of the sim altimeter used by the PFD. */
  public readonly altimeterIndex: number;

  /** Whether the PFD supports altimeter baro preselect. */
  public readonly supportBaroPreselect: boolean;

  /**
   * A definition describing the PFD's FMS geo-positioning system.
   */
  public readonly fmsPosDefinition: Readonly<FmsPositionDefinition>;

  /**
   * Creates a new PfdGduConfig for an indexed PFD using default options.
   * @param index A PFD index.
   */
  public constructor(index: PfdIndex);
  /**
   * Creates a new PfdGduConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element);
  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(arg1: PfdIndex | Element) {
    if (typeof arg1 === 'number') {
      this.index = arg1;
      this.defaultAdcIndex = 1;
      this.defaultAhrsIndex = 1;
      this.altimeterIndex = 1;
      this.supportBaroPreselect = false;
      this.fmsPosDefinition = {
        gpsReceiverPriorities: []
      };
    } else {
      if (arg1.tagName !== 'Pfd') {
        throw new Error(`Invalid PfdGduConfig definition: expected tag name 'Pfd' but was '${arg1.tagName}'`);
      }

      const index = ConfigUtils.parseNumber<PfdIndex>(arg1.getAttribute('index'), value => value === 1 || value === 2);

      if (index === undefined || index === null) {
        throw new Error('Invalid PfdGduConfig definition: missing or unrecognized "index" option (must be 1 or 2).');
      } else {
        this.index = index;
      }

      const simIndexValidator = (value: number): boolean => Number.isInteger(value) && value > 0;

      const defaultAdcIndex = ConfigUtils.parseNumber(arg1.getAttribute('default-adc'), simIndexValidator, 1);
      if (defaultAdcIndex === undefined) {
        console.warn('Invalid PfdGduConfig definition: unrecognized "default-adc" option (must be a positive integer). Defaulting to 1.');
        this.defaultAdcIndex = 1;
      } else {
        this.defaultAdcIndex = defaultAdcIndex;
      }

      const defaultAhrsIndex = ConfigUtils.parseNumber(arg1.getAttribute('default-ahrs'), simIndexValidator, 1);
      if (defaultAhrsIndex === undefined) {
        console.warn('Invalid PfdGduConfig definition: unrecognized "default-ahrs" option (must be a positive integer). Defaulting to 1.');
        this.defaultAhrsIndex = 1;
      } else {
        this.defaultAhrsIndex = defaultAhrsIndex;
      }

      const altimeterIndex = ConfigUtils.parseNumber(arg1.getAttribute('altimeter-source'), simIndexValidator, 1);
      if (altimeterIndex === undefined) {
        console.warn('Invalid PfdGduConfig definition: unrecognized "altimeter-source" option (must be a positive integer). Defaulting to 1.');
        this.altimeterIndex = 1;
      } else {
        this.altimeterIndex = altimeterIndex;
      }

      const supportBaroPreselect = ConfigUtils.parseBoolean(arg1.getAttribute('baro-preselect'), false);
      if (supportBaroPreselect === undefined) {
        console.warn('Invalid PfdGduConfig definition: unrecognized "baro-preselect" option (must be "true" or "false"). Defaulting to false.');
        this.supportBaroPreselect = false;
      } else {
        this.supportBaroPreselect = supportBaroPreselect;
      }

      this.fmsPosDefinition = this.parseFmsPositionDefinition(arg1);
    }
  }

  /**
   * Parses a FMS geo-positioning system definition from a configuration document element.
   * @param element A configuration document element.
   * @returns The geo-positioning system definition defined by the configuration document element.
   */
  private parseFmsPositionDefinition(element: Element): Readonly<FmsPositionDefinition> {
    const fmsPosElement = element.querySelector(':scope>FmsPosition');

    const gpsReceiverPriorities: number[] = [];

    if (fmsPosElement) {
      const gpsReceiverPrioritiesAttribute = fmsPosElement.getAttribute('gps-receivers');
      if (gpsReceiverPrioritiesAttribute) {
        const indexes = gpsReceiverPrioritiesAttribute.split(',')
          .map(text => Number(text))
          .filter(index => {
            if (!(isFinite(index) && Number.isInteger(index) && index >= 1)) {
              console.warn('Invalid PfdGduConfig definition: invalid GPS receiver index (must be a positive integer). Discarding index.');
              return false;
            } else {
              return true;
            }
          });

        for (let i = 0; i < indexes.length; i++) {
          if (gpsReceiverPriorities.includes(indexes[i])) {
            console.warn(`Invalid PfdGduConfig definition: duplicate GPS receiver index ${indexes[i]}. Discarding duplicate.`);
          } else {
            gpsReceiverPriorities.push(indexes[i]);
          }
        }
      }
    }

    return {
      gpsReceiverPriorities
    };
  }
}

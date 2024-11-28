import { Config } from '../Config/Config';

/**
 * A definition for a radio.
 */
export type RadioDefinition = {
  /** The electrical logic for this definition's radio. */
  electricity?: CompositeLogicXMLElement;
};

/**
 * A configuration object which defines options related to radios.
 */
export class RadiosConfig implements Config {
  /** The number of com radios supported by the plane. */
  public readonly comCount = 2;

  /** The number of nav radios supported by the plane. */
  public readonly navCount = 2;

  /** The number of DME radios supported by the plane. */
  public readonly dmeCount: 0 | 1 | 2;

  /** The number of ADF radios supported by the plane. */
  public readonly adfCount: 0 | 1 | 2;

  /**
   * Com radio definitions. The index of each definitions's position in the array corresponds to the index of its radio.
   */
  public readonly comDefinitions: readonly Readonly<RadioDefinition>[];

  /**
   * Nav radio definitions. The index of each definitions's position in the array corresponds to the index of its radio.
   */
  public readonly navDefinitions: readonly Readonly<RadioDefinition>[];

  /**
   * DME radio definitions. The index of each definitions's position in the array corresponds to the index of its radio.
   */
  public readonly dmeDefinitions: readonly Readonly<RadioDefinition>[];

  /**
   * ADF radio definitions. The index of each definitions's position in the array corresponds to the index of its radio.
   */
  public readonly adfDefinitions: readonly Readonly<RadioDefinition>[];

  /**
   * Creates a new RadiosConfig from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   */
  constructor(baseInstrument: BaseInstrument, element: Element | undefined) {
    if (element === undefined) {
      this.dmeCount = 0;
      this.adfCount = 0;
      this.comDefinitions = [undefined as any, {}, {}];
      this.navDefinitions = [undefined as any, {}, {}];
      this.dmeDefinitions = [];
      this.adfDefinitions = [];
    } else {
      if (element.tagName !== 'Radios') {
        throw new Error(`Invalid RadiosConfig definition: expected tag name 'Radios' but was '${element.tagName}'`);
      }

      const dmeCount = Number(element.getAttribute('dme-count'));
      if (!Number.isInteger(dmeCount) || dmeCount < 0 || dmeCount > 2) {
        console.warn('Invalid RadiosConfig definition: unrecognized DME radio count (must be 0, 1, or 2)');
        this.dmeCount = 0;
      } else {
        this.dmeCount = dmeCount as 0 | 1 | 2;
      }

      const adfCount = Number(element.getAttribute('adf-count'));
      if (!Number.isInteger(adfCount) || adfCount < 0 || adfCount > 2) {
        console.warn('Invalid RadiosConfig definition: unrecognized ADF radio count (must be 0, 1, or 2)');
        this.adfCount = 0;
      } else {
        this.adfCount = adfCount as 0 | 1 | 2;
      }

      this.comDefinitions = this.parseComDefinitions(baseInstrument, element);
      this.navDefinitions = this.parseNavDefinitions(baseInstrument, element);
      this.dmeDefinitions = this.parseDmeDefinitions(baseInstrument, element);
      this.adfDefinitions = this.parseAdfDefinitions(baseInstrument, element);
    }
  }

  /**
   * Parses com radio definitions from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns An array of com radio definitions defined by the configuration document element.
   */
  private parseComDefinitions(baseInstrument: BaseInstrument, element: Element): readonly Readonly<RadioDefinition>[] {
    const comElements = element.querySelectorAll(':scope>Com');

    const defs: RadioDefinition[] = [];

    for (const comElement of comElements) {
      const index = Number(comElement.getAttribute('index'));
      if (!Number.isInteger(index) || index < 1 || index > this.comCount) {
        console.warn('Invalid RadiosConfig definition: unrecognized com radio index (must be 1 or 2)');
        continue;
      }

      const electricLogicElement = comElement.querySelector(':scope>Electric');

      defs[index] = {
        electricity: electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement)
      };
    }

    // Set defaults for indexes that don't have definitions
    for (let i = 1; i <= this.comCount; i++) {
      if (defs[i] === undefined) {
        defs[i] = {};
      }
    }

    return defs;
  }

  /**
   * Parses nav radio definitions from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns An array of nav radio definitions defined by the configuration document element.
   */
  private parseNavDefinitions(baseInstrument: BaseInstrument, element: Element): readonly Readonly<RadioDefinition>[] {
    const navElements = element.querySelectorAll(':scope>Nav');

    const defs: RadioDefinition[] = [];

    for (const navElement of navElements) {
      const index = Number(navElement.getAttribute('index'));
      if (!Number.isInteger(index) || index < 1 || index > this.navCount) {
        console.warn('Invalid RadiosConfig definition: unrecognized nav radio index (must be 1 or 2)');
        continue;
      }

      const electricLogicElement = navElement.querySelector(':scope>Electric');

      defs[index] = {
        electricity: electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement)
      };
    }

    // Set defaults for indexes that don't have definitions
    for (let i = 1; i <= this.navCount; i++) {
      if (defs[i] === undefined) {
        defs[i] = {};
      }
    }

    return defs;
  }

  /**
   * Parses DME radio definitions from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns An array of DME radio definitions defined by the configuration document element.
   */
  private parseDmeDefinitions(baseInstrument: BaseInstrument, element: Element): readonly Readonly<RadioDefinition>[] {
    const dmeElements = element.querySelectorAll(':scope>Dme');

    const defs: RadioDefinition[] = [];

    for (const dmeElement of dmeElements) {
      const index = Number(dmeElement.getAttribute('index'));
      if (!Number.isInteger(index) || index < 1 || index > this.dmeCount) {
        console.warn('Invalid RadiosConfig definition: unrecognized DME radio index (must be between 1 and the number of supported DME radios)');
        continue;
      }

      const electricLogicElement = dmeElement.querySelector(':scope>Electric');

      defs[index] = {
        electricity: electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement)
      };
    }

    // Set defaults for indexes that don't have definitions
    for (let i = 1; i <= this.dmeCount; i++) {
      if (defs[i] === undefined) {
        defs[i] = {};
      }
    }

    return defs;
  }

  /**
   * Parses ADF radio definitions from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns An array of ADF radio definitions defined by the configuration document element.
   */
  private parseAdfDefinitions(baseInstrument: BaseInstrument, element: Element): readonly Readonly<RadioDefinition>[] {
    const adfElements = element.querySelectorAll(':scope>Adf');

    const defs: RadioDefinition[] = [];

    for (const adfElement of adfElements) {
      const index = Number(adfElement.getAttribute('index'));
      if (!Number.isInteger(index) || index < 1 || index > this.adfCount) {
        console.warn('Invalid RadiosConfig definition: unrecognized ADF radio index (must be between 1 and the number of supported ADF radios)');
        continue;
      }

      const electricLogicElement = adfElement.querySelector(':scope>Electric');

      defs[index] = {
        electricity: electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement)
      };
    }

    // Set defaults for indexes that don't have definitions
    for (let i = 1; i <= this.adfCount; i++) {
      if (defs[i] === undefined) {
        defs[i] = {};
      }
    }

    return defs;
  }
}
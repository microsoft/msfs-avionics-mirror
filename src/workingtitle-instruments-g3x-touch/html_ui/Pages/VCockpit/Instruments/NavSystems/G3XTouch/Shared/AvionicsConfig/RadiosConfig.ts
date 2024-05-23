import { ComRadioIndex, NavRadioIndex } from '@microsoft/msfs-sdk';

import { Config } from '../Config/Config';

/**
 * A definition for a radio.
 */
type RadioDefinition<SimIndexes extends number> = {
  /** The index of this definition's radio. */
  index: 1 | 2;

  /** The sim index of this definition's radio. */
  simIndex: SimIndexes;

  /** The electrical logic for this definition's radio. */
  electricity?: CompositeLogicXMLElement;
};

/**
 * A definition for a COM radio.
 */
export type ComRadioDefinition = RadioDefinition<ComRadioIndex>;

/**
 * A definition for a NAV radio.
 */
export type NavRadioDefinition = RadioDefinition<NavRadioIndex>;

/**
 * A configuration object which defines options related to radios.
 */
export class RadiosConfig implements Config {
  /** The number of com radios supported by the plane. */
  public readonly comCount: 0 | 1 | 2;

  /** The number of nav radios supported by the plane. */
  public readonly navCount: 0 | 1 | 2;

  /** Whether the plane has a marker beacon. */
  public readonly hasMarkerBeacon: boolean;

  /**
   * Com radio definitions. The index of each definitions's position in the array corresponds to the index of its radio.
   */
  public readonly comDefinitions: readonly Readonly<ComRadioDefinition>[];

  /**
   * Nav radio definitions. The index of each definitions's position in the array corresponds to the index of its radio.
   */
  public readonly navDefinitions: readonly (Readonly<NavRadioDefinition> | undefined)[];

  /**
   * Creates a new RadiosConfig from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   */
  constructor(baseInstrument: BaseInstrument, element: Element | undefined) {
    if (element === undefined) {
      this.comCount = 0;
      this.navCount = 0;
      this.hasMarkerBeacon = false;
      this.comDefinitions = [];
      this.navDefinitions = [];
    } else {
      if (element.tagName !== 'Radios') {
        throw new Error(`Invalid RadiosConfig definition: expected tag name 'Radios' but was '${element.tagName}'`);
      }

      const comCount = Number(element.getAttribute('com-count'));
      if (!Number.isInteger(comCount) || comCount < 1 || comCount > 2) {
        console.warn('Invalid RadiosConfig definition: unrecognized COM radio count (must be 0, 1, or 2). Defaulting to 0.');
        this.comCount = 0;
      } else {
        this.comCount = comCount as 0 | 1 | 2;
      }

      let expectedNavCount = Number(element.getAttribute('nav-count') ?? 0);
      if (!Number.isInteger(expectedNavCount) || expectedNavCount < 1 || expectedNavCount > 2) {
        console.warn('Invalid RadiosConfig definition: unrecognized NAV radio count (must be 0, 1, or 2)');
        expectedNavCount = 0;
      }

      const useMarkerBeacon = element.getAttribute('marker-beacon')?.toLowerCase();
      switch (useMarkerBeacon) {
        case 'true':
          this.hasMarkerBeacon = true;
          break;
        case 'false':
        case undefined:
          this.hasMarkerBeacon = false;
          break;
        default:
          console.warn('Invalid RadiosConfig definition: unrecognized marker-beacon value (must be "true" or "false"). Defaulting to false.');
          this.hasMarkerBeacon = false;
      }

      this.comDefinitions = this.parseComDefinitions(baseInstrument, element);
      this.navDefinitions = this.parseNavDefinitions(baseInstrument, element, expectedNavCount);

      this.navCount = this.navDefinitions.reduce((count, def): number => count + (def ? 1 : 0), 0 as number) as 0 | 1 | 2;
    }
  }

  /**
   * Parses com radio definitions from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns An array of com radio definitions defined by the configuration document element.
   */
  private parseComDefinitions(baseInstrument: BaseInstrument, element: Element): readonly Readonly<ComRadioDefinition>[] {
    const comElements = element.querySelectorAll(':scope>Com');

    const defs: ComRadioDefinition[] = [];

    for (const comElement of comElements) {
      const index = Number(comElement.getAttribute('index'));
      if (!Number.isInteger(index) || index < 1 || index > this.comCount) {
        console.warn('Invalid RadiosConfig definition: unrecognized com radio index (must be 1 or 2 and less than or equal to the number of declared com radios). Discarding radio definition.');
        continue;
      }

      const simIndexElement = comElement.getAttribute('sim-index');
      let simIndex: number;
      if (simIndexElement === null) {
        simIndex = index;
      } else {
        simIndex = Number(simIndexElement);
        if (!Number.isInteger(simIndex) || simIndex < 1 || simIndex > 3) {
          console.warn('Invalid RadiosConfig definition: unrecognized com radio sim index (must be 1, 2, or 3). Discarding radio definition.');
          continue;
        }
      }

      // If a definition already exists for this index, skip the current definition.
      if (defs[index]) {
        continue;
      }

      const electricLogicElement = comElement.querySelector(':scope>Electric');

      defs[index] = {
        index: index as 1 | 2,
        simIndex: simIndex as ComRadioIndex,
        electricity: electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement)
      };
    }

    // Set defaults for indexes that don't have definitions
    for (let i = 1; i <= this.comCount; i++) {
      if (defs[i] === undefined) {
        defs[i] = {
          index: i as 1 | 2,
          simIndex: i as 1 | 2
        };
      }
    }

    return defs;
  }

  /**
   * Parses NAV radio definitions from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @param expectedCount The expected number of NAV radio definitions.
   * @returns An array of NAV radio definitions defined by the configuration document element.
   */
  private parseNavDefinitions(baseInstrument: BaseInstrument, element: Element, expectedCount: number): readonly Readonly<NavRadioDefinition>[] {
    const navElements = element.querySelectorAll(':scope>Nav');

    const defs: NavRadioDefinition[] = [];

    let actualCount = 0;
    for (const navElement of navElements) {
      const index = Number(navElement.getAttribute('index'));
      if (index !== 1 && index !== 2) {
        console.warn('Invalid RadiosConfig definition: unrecognized nav radio index (must be 1 or 2). Discarding radio definition.');
        continue;
      }

      // If a definition already exists for this index, skip the current definition.
      if (defs[index]) {
        continue;
      }

      const electricLogicElement = navElement.querySelector(':scope>Electric');

      defs[index] = {
        index: index as 1 | 2,
        simIndex: index as 1 | 2,
        electricity: electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement)
      };
      actualCount++;
    }

    if (actualCount < expectedCount) {
      // Set defaults for indexes that don't have definitions
      for (let i = 1; i <= expectedCount; i++) {
        if (defs[i] === undefined) {
          defs[i] = {
            index: i as 1 | 2,
            simIndex: i as 1 | 2
          };
        }
      }
    }

    return defs;
  }
}
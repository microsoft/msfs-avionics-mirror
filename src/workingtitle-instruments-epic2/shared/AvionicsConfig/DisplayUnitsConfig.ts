import { DisplayUnitIndices } from '../InstrumentIndices';

/** A definition for an ACE display unit. */
export type DisplayUnitDefinition = {
  /** The index of the radio altimeter system used by this definition's display unit. */
  radioAltimeterIndex: number;
  /** The electrical logic for this definition's PFD controller. */
  pfdControllerElectricity?: CompositeLogicXMLElement;
  /** Whether the PFD frames should be swapped to the opposite sides. */
  ahiSide?: 'left' | 'right';
};

/** A definition for an ACE Advanced Graphics Module */
export type GraphicsModuleDefinition = {
  /** The electrical logic for this module */
  electricLogic?: CompositeLogicXMLElement;
}

/** Configuration definition for the speed reference readout */
export interface SpeedReferenceConfig {
  /** Whether the PFD speed reference should contain the currently active speed bug */
  bugAvailable: boolean;

  /** Whether the speed reference is always in magenta, or if it can display in white when the current speed is not active */
  alwaysMagenta: boolean
}

/** A definition for a PFD configuration */
export interface PfdConfiguration {
  /** Configurations relating to the speed reference readout */
  speedReference: SpeedReferenceConfig
}

/** A configuration object for the display units. */
export class DisplayUnitsConfig {
  /** The number of display units present in the plane. */
  public readonly displayUnitCount = 4;

  /** Display Unit definitions. The index of each definition's position in the array corresponds to the index of its DU. */
  public readonly displayUnitDefinitions: readonly Readonly<DisplayUnitDefinition>[];

  /** Graphics module definitions. The index of each definition's position in the array corresponds to the index of its DU. */
  public readonly graphicsModuleDefinitions: readonly Readonly<GraphicsModuleDefinition>[];

  public readonly pfdConfig: PfdConfiguration = {
    speedReference: {
      bugAvailable: false,
      alwaysMagenta: true,
    },
  };

  /**
   * Creates a new SensorsConfig from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @param radioAltimeterCount Number of supported radio altimeters.
   */
  constructor(baseInstrument: BaseInstrument, element: Element | undefined, private readonly radioAltimeterCount: number) {
    if (element !== undefined) {
      this.displayUnitDefinitions = this.parseDisplayUnitDefinitions(baseInstrument, element);
      this.graphicsModuleDefinitions = this.parseGraphicsModuleDefinitions(baseInstrument, element);

      const pfdConfigElements = element.querySelectorAll(':scope>PfdConfig');
      if (pfdConfigElements.length > 0) {
        this.pfdConfig = this.parsePfdDefinitions(pfdConfigElements[0]);
        if (pfdConfigElements.length > 1) {
          console.warn('DisplayUnitsConfig: Multiple PfdConfig elements!');
        }
      }
    } else {
      // setup a minimal default config
      const displayUnitDefinitions = [];
      for (let i = 1; i <= this.displayUnitCount; i++) {
        displayUnitDefinitions[i] = {
          radioAltimeterIndex: Math.min(i, this.radioAltimeterCount),
        };
      }
      this.displayUnitDefinitions = displayUnitDefinitions;
      this.graphicsModuleDefinitions = [ {electricLogic: undefined}, {electricLogic: undefined} ];
    }
  }

  /**
   * Parses display unit definition from configuration document elements.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns An array of display unit definitions defined by the configuration document element.
   */
  private parseDisplayUnitDefinitions(baseInstrument: BaseInstrument, element: Element): readonly Readonly<DisplayUnitDefinition>[] {
    const displayUnitDefinitions: DisplayUnitDefinition[] = [];
    const duIndices = new Set();

    const duElements = element.querySelectorAll(':scope>DisplayUnit');

    for (const duElement of duElements) {
      const index = Number(duElement.getAttribute('index'));
      if (!Number.isInteger(index) || index < 1 || index > this.displayUnitCount || duIndices.has(index)) {
        console.warn('Invalid DisplayUnit definition: unrecognized display unit index (must be a unique integer between 1 and the number of supported display units)');
        continue;
      }

      const radioAltimeterAttr = duElement.getAttribute('radio-altimeter');
      if (radioAltimeterAttr === null) {
        console.warn('Invalid DisplayUnit definition: unrecognized radio-altimeter index (must be a unique integer between 1 and the number of supported radio altimeter units)');
        continue;
      }
      const radioAltimeterIndex = parseInt(radioAltimeterAttr);
      if (radioAltimeterIndex < 1 || radioAltimeterIndex > this.radioAltimeterCount) {
        console.warn('Invalid DisplayUnit definition: unrecognized radio-altimeter index (must be a unique integer between 1 and the number of supported radio altimeter units)');
        continue;
      }

      const ahiSide = duElement.getAttribute('ahi-side');
      if (ahiSide !== null && index !== DisplayUnitIndices.PfdLeft && index !== DisplayUnitIndices.PfdRight) {
        console.warn('Invalid DisplayUnit definition: ahi-side should only be present on PFD DUs. Ignoring.');
      }
      if (ahiSide !== null && ahiSide !== 'left' && ahiSide !== 'right') {
        console.warn('Invalid DisplayUnit definition: unrecognized ahi-side (must be not present, "left", or "right")');
        continue;
      }

      const electricLogicElement = duElement.querySelector(':scope>PfdControllerElectric');

      displayUnitDefinitions[index] = {
        radioAltimeterIndex,
        ahiSide: ahiSide ?? undefined,
        pfdControllerElectricity: electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement),
      };
    }

    // Set defaults for indexes that don't have definitions
    for (let i = 1; i <= this.displayUnitCount; i++) {
      if (displayUnitDefinitions[i] === undefined) {
        displayUnitDefinitions[i] = { radioAltimeterIndex: Math.min(i, this.radioAltimeterCount) };
      }
    }

    return displayUnitDefinitions;
  }

  /**
   * Parses a graphics module definition from configuration document elements.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns An array of display unit definitions defined by the configuration document element.
   */
  private parseGraphicsModuleDefinitions(baseInstrument: BaseInstrument, element: Element): readonly Readonly<GraphicsModuleDefinition>[] {
    const graphicsModuleDefinitions: GraphicsModuleDefinition[] = [];
    const moduleIndices = new Set();

    const moduleElements = element.querySelectorAll(':scope>GraphicsModule');

    for (const moduleElement of moduleElements) {
      const index = Number(moduleElement.getAttribute('index'));
      if (!Number.isInteger(index) || index < 1 || index > 2 || moduleIndices.has(index)) {
        console.warn('DisplayUnitsConfig: Invalid GraphicsModule definition: unrecognized index (must be either 1 or 2)');
        continue;
      }

      const electricLogicElement = moduleElement.querySelector(':scope>Electric');

      graphicsModuleDefinitions[index] = {
        electricLogic: electricLogicElement === null ? undefined : new CompositeLogicXMLElement(baseInstrument, electricLogicElement),
      };
    }

    // Set defaults for indexes that don't have definitions
    for (let i = 1; i <= 2; i++) {
      if (graphicsModuleDefinitions[i] === undefined) {
        graphicsModuleDefinitions[i] = { electricLogic: undefined };
        console.warn(`DisplayUnitsConfig: A GraphicsModule index ${i} definition is missing. This will cause the aircraft to never display a boot sequence.`);
      }
    }

    return graphicsModuleDefinitions;
  }

  /**
   * Parses a PFD config definition from configuration document elements.
   * @param element A configuration document element.
   * @returns A PFD Configuration.
   */
  private parsePfdDefinitions(element: Element): PfdConfiguration {
    const definition: PfdConfiguration = {
      speedReference: {
        bugAvailable: false,
        alwaysMagenta: true
      }
    };

    const speedRefElements = element.querySelectorAll(':scope>SpeedReference');
    if (speedRefElements.length > 0) {
      definition.speedReference = this.parseSpeedReference(speedRefElements[0]);
      if (speedRefElements.length > 1) {
        console.warn('DisplayUnitsConfig > PfdConfig: Multiple SpeedReference elements!');
      }
    }

    return definition;
  }

  /**
   * Parses a speed reference definition from configuration document elements.
   * @param element A configuration document element.
   * @returns A speed reference Configuration.
   */
  private parseSpeedReference(element: Element): SpeedReferenceConfig {
    const definition = {
      bugAvailable: false,
      alwaysMagenta: true
    };

    const bugIconVisibleAttribute = element.getAttribute('bugIconVisible');
    switch (bugIconVisibleAttribute?.toLowerCase()) {
      case 'true':
        definition.bugAvailable = true;
        break;
      case 'false':
        definition.bugAvailable = false;
        break;
      default:
        console.warn('DisplayUnitsConfig > PfdConfig: A SpeedReference element has been defined but has an invalid bugIconVisible attribute. Must be true or false; currently defaulting to false');
        definition.bugAvailable = false;
    }

    const alwaysMagentaReadout = element.getAttribute('alwaysMagenta');
    switch (alwaysMagentaReadout?.toLowerCase()) {
      case 'true':
        definition.alwaysMagenta = true;
        break;
      case 'false':
        definition.alwaysMagenta = false;
        break;
      default:
        console.warn('DisplayUnitsConfig > PfdConfig: A SpeedReference element has been defined but has an invalid alwaysMagenta attribute. Must be true or false; currently defaulting to false');
        definition.alwaysMagenta = false;
    }

    return definition;
  }
}

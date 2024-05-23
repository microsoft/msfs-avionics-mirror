import { EventBus } from '@microsoft/msfs-sdk';

import { Fms, GarminTaws, TerrainSystem, TerrainSystemDataProvider, TerrainSystemType } from '@microsoft/msfs-garminsdk';

import { G3000FlightPlannerId } from '../CommonTypes';
import { ResolvableConfig } from '../Config/Config';
import { ExcessiveClosureRateConfig } from './ExcessiveClosureRateConfig';
import { ExcessiveDescentRateConfig } from './ExcessiveDescentRateConfig';
import { G3000TerrainSystemType } from './G3000TerrainSystemTypes';
import { NegativeClimbRateConfig } from './NegativeClimbRateConfig';
import { PrematureDescentConfig } from './PrematureDescentConfig';
import { TerrainSystemModuleConfig } from './TerrainSystemModuleConfig';
import { TouchdownCalloutsConfig } from './TouchdownCalloutsConfig';

/**
 * A configuration object which defines options related to terrain alerting systems.
 */
export class TerrainSystemConfig implements ResolvableConfig<
  (bus: EventBus, fms: Fms<G3000FlightPlannerId>, dataProvider: TerrainSystemDataProvider) => TerrainSystem | null
> {

  /** @inheritDoc */
  public readonly isResolvableConfig = true;

  /** The terrain system type. */
  public readonly type: G3000TerrainSystemType | null;

  /** Configuration objects defining the modules to be included by the terrain system. */
  public readonly moduleConfigs: readonly TerrainSystemModuleConfig[];

  /**
   * A config which defines options for touchdown callouts, or `undefined` if the terrain system does not support
   * touchdown callouts.
   */
  public readonly touchdownCallouts?: TouchdownCalloutsConfig;

  /**
   * Creates a new TerrainSystemConfig from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element The configuration document element from which to parse the configuration object.
   * @param tawsElement A configuration document element that defines a TAWS configuration object.
   */
  public constructor(baseInstrument: BaseInstrument, element: Element | undefined, tawsElement: Element | null) {
    if (element === undefined) {
      if (tawsElement) {
        // For backwards compatibility, we will generate a TAWS-B system with a single touchdown callout module if the
        // old <Taws> tag is defined.

        this.type = TerrainSystemType.TawsB;

        const touchdownCalloutsElement = tawsElement.querySelector(':scope>TouchdownCallouts');
        if (touchdownCalloutsElement) {
          try {
            this.moduleConfigs = [new TouchdownCalloutsConfig(this.type, touchdownCalloutsElement)];
          } catch (e) {
            console.warn(e);
          }
        }

        this.moduleConfigs ??= [new TouchdownCalloutsConfig(this.type)];
      } else {
        this.type = null;
        this.moduleConfigs = [];
      }
    } else {
      if (element.tagName !== 'Terrain') {
        throw new Error(`Invalid TerrainSystemConfig definition: expected tag name 'Terrain' but was '${element.tagName}'`);
      }

      const type = element.getAttribute('type')?.toLowerCase();
      switch (type) {
        case 'taws-a':
          this.type = TerrainSystemType.TawsA;
          break;
        case 'taws-b':
          this.type = TerrainSystemType.TawsB;
          break;
        default:
          console.warn('TerrainSystemConfig: unrecognized or missing terrain system type (must be "taws-a" or "taws-b"). Defaulting to no terrain system.');
          this.type = null;
      }

      if (this.type === null) {
        this.moduleConfigs = [];
      } else {
        this.moduleConfigs = this.parseModules(this.type, element);
      }
    }

    this.touchdownCallouts = this.moduleConfigs.find(config => config instanceof TouchdownCalloutsConfig) as TouchdownCalloutsConfig | undefined;
  }

  /**
   * Parses terrain alerting system module configuration objects from a configuration document element.
   * @param terrainSystemType The terrain system type for which to parse modules.
   * @param element A configuration document element.
   * @returns The terrain alerting system module configurations defined by the configuration document element.
   */
  private parseModules(terrainSystemType: G3000TerrainSystemType, element: Element): TerrainSystemModuleConfig[] {
    const configs: TerrainSystemModuleConfig[] = [];
    const modulesTags = new Set<string>();

    // Parse explicit modules.
    for (const moduleElement of element.querySelectorAll(':scope>Modules>*')) {
      let ctor: (new (type: G3000TerrainSystemType, el?: Element) => TerrainSystemModuleConfig) | undefined;

      switch (moduleElement.tagName) {
        case 'Pda':
          ctor = PrematureDescentConfig;
          break;
        case 'Edr':
          ctor = ExcessiveDescentRateConfig;
          break;
        case 'Ecr':
          ctor = ExcessiveClosureRateConfig;
          break;
        case 'Ncr':
          ctor = NegativeClimbRateConfig;
          break;
        case 'TouchdownCallouts':
          ctor = TouchdownCalloutsConfig;
          break;
        default:
          console.warn(`TerrainSystemConfig: unrecognized module tag: ${moduleElement.tagName}`);
      }

      if (ctor) {
        if (modulesTags.has(moduleElement.tagName)) {
          console.warn(`TerrainSystemConfig: duplicate module tag: ${moduleElement.tagName}. Discarding duplicate.`);
        } else {
          try {
            configs.push(new ctor(terrainSystemType, moduleElement));
            modulesTags.add(moduleElement.tagName);
          } catch (e) {
            console.warn(e);
          }
        }
      }
    }

    const excludedTags = new Set<string>(modulesTags);
    // Parse exclusions.
    for (const exclusionElement of element.querySelectorAll(':scope>Exclusions>*')) {
      excludedTags.add(exclusionElement.tagName);
    }

    if (terrainSystemType === TerrainSystemType.TawsA) {
      return this.addDefaultTawsAModuleConfigs(excludedTags, configs);
    } else {
      return this.addDefaultTawsBModuleConfigs(excludedTags, configs);
    }
  }

  /**
   * Adds a set of default configuration objects for TAWS-A modules to an array.
   * @param excludedTags Tag names of configuration objects that should not be added to the array.
   * @param configs The array to which to add the configuration objects.
   * @returns The supplied array, after a set of default configuration objects for TAWS-A modules have been added to
   * it.
   */
  private addDefaultTawsAModuleConfigs(
    excludedTags: ReadonlySet<string>,
    configs: TerrainSystemModuleConfig[]
  ): TerrainSystemModuleConfig[] {
    if (!excludedTags.has('Pda')) {
      configs.push(new PrematureDescentConfig(TerrainSystemType.TawsA));
    }

    if (!excludedTags.has('Edr')) {
      configs.push(new ExcessiveDescentRateConfig(TerrainSystemType.TawsA));
    }

    if (!excludedTags.has('Ecr')) {
      configs.push(new ExcessiveClosureRateConfig(TerrainSystemType.TawsA));
    }

    if (!excludedTags.has('Ncr')) {
      configs.push(new NegativeClimbRateConfig(TerrainSystemType.TawsA));
    }

    if (!excludedTags.has('TouchdownCallouts')) {
      configs.push(new TouchdownCalloutsConfig(TerrainSystemType.TawsA));
    }

    return configs;
  }

  /**
   * Adds a set of default configuration objects for TAWS-B modules to an array.
   * @param excludedTags Tag names of configuration objects that should not be added to the array.
   * @param configs The array to which to add the configuration objects.
   * @returns The supplied array, after a set of default configuration objects for TAWS-B modules have been added to
   * it.
   */
  private addDefaultTawsBModuleConfigs(
    excludedTags: ReadonlySet<string>,
    configs: TerrainSystemModuleConfig[]
  ): TerrainSystemModuleConfig[] {
    if (!excludedTags.has('Pda')) {
      configs.push(new PrematureDescentConfig(TerrainSystemType.TawsB));
    }

    if (!excludedTags.has('Edr')) {
      configs.push(new ExcessiveDescentRateConfig(TerrainSystemType.TawsB));
    }

    if (!excludedTags.has('Ncr')) {
      configs.push(new NegativeClimbRateConfig(TerrainSystemType.TawsB));
    }

    if (!excludedTags.has('TouchdownCallouts')) {
      configs.push(new TouchdownCalloutsConfig(TerrainSystemType.TawsB));
    }

    return configs;
  }

  /** @inheritDoc */
  public resolve(): (bus: EventBus, fms: Fms<G3000FlightPlannerId>, dataProvider: TerrainSystemDataProvider) => TerrainSystem | null {
    return (bus: EventBus, fms: Fms<G3000FlightPlannerId>, dataProvider: TerrainSystemDataProvider): TerrainSystem | null => {
      if (this.type === null) {
        return null;
      }

      const terrainSystem = new GarminTaws('', this.type, bus, dataProvider, { supportGpwsFailStatus: this.type === TerrainSystemType.TawsA });

      for (const module of this.moduleConfigs.map(config => config.resolve()(bus, fms))) {
        terrainSystem.addModule(module);
      }

      return terrainSystem;
    };
  }
}

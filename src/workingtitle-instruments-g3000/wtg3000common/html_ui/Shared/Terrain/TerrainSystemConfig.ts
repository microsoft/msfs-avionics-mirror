import { EventBus } from '@microsoft/msfs-sdk';

import { Fms, GarminTaws, TerrainSystem, TerrainSystemDataProvider, TerrainSystemType } from '@microsoft/msfs-garminsdk';

import { G3000FlightPlannerId } from '../CommonTypes';
import { ResolvableConfig } from '../Config/Config';
import { ConfigUtils } from '../Config/ConfigUtils';
import { ExcessiveClosureRateConfig } from './ExcessiveClosureRateConfig';
import { ExcessiveDescentRateConfig } from './ExcessiveDescentRateConfig';
import { G3000TerrainSystemType } from './G3000TerrainSystemTypes';
import { GlideslopeDeviationConfig } from './GlideslopeDeviationConfig';
import { NegativeClimbRateConfig } from './NegativeClimbRateConfig';
import { PrematureDescentConfig } from './PrematureDescentConfig';
import { TerrainSystemModuleConfig, TerrainSystemModuleInhibitFlagDef, TerrainSystemModulePrimaryInhibitFlagDef } from './TerrainSystemModuleConfig';
import { TouchdownCalloutsConfig } from './TouchdownCalloutsConfig';

/**
 * A definition for an inhibit toggle in the GTC Terrain Settings page.
 */
export type TerrainSystemSettingsPageInhibitDef = {
  /** The displayed label for the inhibit's toggle button in the GTC Terrain Settings page. */
  labelText: string;

  /**
   * The priority to use when determining the order in which the inhibit's toggle button should be placed in the GTC
   * Terrain Settings page. Buttons for higher priority inhibits are placed before buttons for lower priority inhibits.
   */
  priority: number;

  /** Information describing the inhibit flags controlled by the toggle. */
  inhibitFlags: readonly Readonly<{
    /** The inhibit flag. */
    flag: string;

    /** The inhibit flag's associated alerts. */
    alerts: readonly string[];

    /** Whether the inhibit flag is only allowed to be toggled when the associated alert(s) is (are) triggered. */
    onlyToggleWhenTriggered: boolean;
  }>[];
};

/**
 * Options for PFD terrain system annunciations.
 */
export type PfdTerrainSystemAnnuncOptions = {
  /** Whether to omit PFD terrain system test annunciations. */
  omitTestAnnunc: boolean;

  /** Whether to omit PFD terrain system status annunciations. */
  omitStatusAnnunc: boolean;

  /** Whether to omit PFD terrain system inhibit annunciations. */
  omitInhibitAnnunc: boolean;
};

/**
 * A mutable definition for an inhibit toggle in the GTC Terrain Settings page.
 */
type MutableTerrainSystemSettingsPageInhibitDef = Omit<TerrainSystemSettingsPageInhibitDef, 'inhibitFlags'> & {
  /** Information describing the inhibit flags controlled by the toggle. */
  inhibitFlags: TerrainSystemSettingsPageInhibitDef['inhibitFlags'] extends ReadonlyArray<infer T>
  ? Array<{
    -readonly [P in keyof T]: T[P] extends ReadonlyArray<infer U> ? Array<U> : T[P];
  }>
  : never;
};

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

  /** A map of terrain system alerts to their associated primary inhibit flag definitions. */
  public readonly primaryInhibitFlagDefs: ReadonlyMap<string, Readonly<TerrainSystemModulePrimaryInhibitFlagDef>>;

  /**
   * An array of definitions for all GTC Terrain Settings page inhibit toggles. The definitions are in order of
   * decreasing priority.
   */
  public readonly settingsPageInhibitDefs: readonly Readonly<TerrainSystemSettingsPageInhibitDef>[];

  /** Options for PFD terrain system annunciations. */
  public readonly pfdAnnuncOptions: Readonly<PfdTerrainSystemAnnuncOptions>;

  /**
   * Creates a new TerrainSystemConfig from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element The configuration document element from which to parse the configuration object.
   */
  public constructor(baseInstrument: BaseInstrument, element: Element | undefined) {
    if (element === undefined) {
      this.type = null;
      this.moduleConfigs = [];
      this.primaryInhibitFlagDefs = new Map();
      this.settingsPageInhibitDefs = [];
      this.pfdAnnuncOptions = this.parsePfdAnnuncOptions(null);
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

      const primaryInhibitFlagDefs = new Map<string, Readonly<TerrainSystemModulePrimaryInhibitFlagDef>>();
      const mergedSettingsPageInhibitDefs = new Map<string, MutableTerrainSystemSettingsPageInhibitDef>();

      if (this.type === null) {
        this.moduleConfigs = [];
      } else {
        this.moduleConfigs = this.parseModules(this.type, element);

        for (const moduleConfig of this.moduleConfigs) {
          if (!this.touchdownCallouts && moduleConfig instanceof TouchdownCalloutsConfig) {
            this.touchdownCallouts = moduleConfig;
          }

          for (const primaryDef of moduleConfig.primaryInhibitFlagDefs) {
            for (const alert of primaryDef.alerts) {
              if (!primaryInhibitFlagDefs.has(alert)) {
                primaryInhibitFlagDefs.set(alert, primaryDef);
              }
            }

            this.mergeSettingsPageInhibitDef(mergedSettingsPageInhibitDefs, primaryDef);
          }

          for (const secondaryDef of moduleConfig.secondaryInhibitFlagDefs) {
            this.mergeSettingsPageInhibitDef(mergedSettingsPageInhibitDefs, secondaryDef);
          }
        }
      }

      this.primaryInhibitFlagDefs = primaryInhibitFlagDefs;
      this.settingsPageInhibitDefs = Array.from(mergedSettingsPageInhibitDefs.values()).sort((a, b) => b.priority - a.priority);

      this.pfdAnnuncOptions = this.parsePfdAnnuncOptions(element.querySelector(':scope>PfdAnnunc'));
    }
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
        case 'Gsd':
          ctor = GlideslopeDeviationConfig;
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

    if (!excludedTags.has('Gsd')) {
      configs.push(new GlideslopeDeviationConfig(TerrainSystemType.TawsA));
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

  /**
   * Merges an inhibit flag definition with existing settings page inhibit definitions.
   * @param defs The existing settings page inhibit definitions.
   * @param defToMerge The inhibit flag definition to merge.
   */
  private mergeSettingsPageInhibitDef(defs: Map<string, MutableTerrainSystemSettingsPageInhibitDef>, defToMerge: Readonly<TerrainSystemModuleInhibitFlagDef>): void {
    let settingsPageDef = defs.get(defToMerge.settingsPageUid);
    if (!settingsPageDef) {
      defs.set(defToMerge.settingsPageUid, settingsPageDef = {
        labelText: defToMerge.settingsPageLabelText,
        priority: defToMerge.settingsPagePriority,
        inhibitFlags: []
      });
    }

    const inhibitFlag = settingsPageDef.inhibitFlags.find(flag => flag.flag === defToMerge.inhibitFlag);
    if (inhibitFlag) {
      for (const alert of defToMerge.alerts) {
        if (!inhibitFlag.alerts.includes(alert)) {
          inhibitFlag.alerts.push(alert);
        }
      }

      inhibitFlag.onlyToggleWhenTriggered &&= defToMerge.onlyToggleWhenTriggered;
    } else {
      settingsPageDef.inhibitFlags.push({
        flag: defToMerge.inhibitFlag,
        alerts: defToMerge.alerts.slice(),
        onlyToggleWhenTriggered: defToMerge.onlyToggleWhenTriggered
      });
    }

    settingsPageDef.priority = Math.max(settingsPageDef.priority, defToMerge.settingsPagePriority);
  }

  /**
   * Parses PFD terrain system annunciation options from a configuration document element.
   * @param element A configuration document element.
   * @returns The PFD terrain system annunciation options parsed from the specified configuration document element.
   */
  private parsePfdAnnuncOptions(element: Element | null): PfdTerrainSystemAnnuncOptions {
    if (element === null) {
      return {
        omitTestAnnunc: false,
        omitStatusAnnunc: false,
        omitInhibitAnnunc: false
      };
    }

    let omitTestAnnunc = ConfigUtils.parseBoolean(element.getAttribute('omit-test-annunc'), false);
    if (omitTestAnnunc === undefined) {
      console.warn('TerrainSystemConfig: unrecognized PfdAnnunc "omit-test-annunc" option (must be "true" or "false"). Defaulting to false.');
      omitTestAnnunc = false;
    }

    let omitStatusAnnunc = ConfigUtils.parseBoolean(element.getAttribute('omit-status-annunc'), false);
    if (omitStatusAnnunc === undefined) {
      console.warn('TerrainSystemConfig: unrecognized PfdAnnunc "omit-status-annunc" option (must be "true" or "false"). Defaulting to false.');
      omitStatusAnnunc = false;
    }

    let omitInhibitAnnunc = ConfigUtils.parseBoolean(element.getAttribute('omit-inhibit-annunc'), false);
    if (omitInhibitAnnunc === undefined) {
      console.warn('TerrainSystemConfig: unrecognized PfdAnnunc "omit-inhibit-annunc" option (must be "true" or "false"). Defaulting to false.');
      omitInhibitAnnunc = false;
    }

    return {
      omitTestAnnunc,
      omitStatusAnnunc,
      omitInhibitAnnunc
    };
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

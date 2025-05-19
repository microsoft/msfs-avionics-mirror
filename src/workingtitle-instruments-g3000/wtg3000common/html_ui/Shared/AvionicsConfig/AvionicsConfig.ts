import { Annunciation, XMLAnnunciationFactory } from '@microsoft/msfs-sdk';

import { AutopilotConfig } from '../Autopilot/AutopilotConfig';
import { G3000ChartsConfig } from '../Charts/G3000ChartsConfig';
import { ChecklistConfig } from '../Checklist/ChecklistConfig';
import { AvionicsType } from '../CommonTypes';
import { MapConfig } from '../Components/Map/MapConfig';
import { DefaultConfigFactory } from '../Config/DefaultConfigFactory';
import { EspConfig } from '../ESP/EspConfig';
import { MessageSystemConfig } from '../Message/MessageSystemConfig';
import { PerformanceConfig } from '../Performance/PerformanceConfig';
import { PersistentUserSettingsConfig } from '../Settings/PersistentSettings/PersistentUserSettingsConfig';
import { TerrainSystemConfig } from '../Terrain/TerrainSystemConfig';
import { TrafficConfig } from '../Traffic/TrafficConfig';
import { VSpeedGroup, VSpeedGroupType } from '../VSpeed/VSpeed';
import { VSpeedGroupConfig } from '../VSpeed/VSpeedGroupConfig';
import { AuralAlertsConfig } from './AuralAlertsConfig';
import { FmsConfig } from './FmsConfig';
import { GduDefsConfig } from './GduDefsConfig';
import { HorizonConfig } from './HorizonConfig';
import { IauDefsConfig } from './IauDefsConfig';
import { RadiosConfig } from './RadiosConfig';
import { SensorsConfig } from './SensorsConfig';
import { VNavConfig } from './VNavConfig';

/**
 * A configuration object which defines options for G3000/5000 avionics systems.
 */
export class AvionicsConfig {
  private readonly factory = new DefaultConfigFactory();

  /** The G3000/G5000 avionics type defined by this config. */
  public readonly type: AvionicsType;

  /** A config which defines options for persistent user settings. */
  public readonly persistentUserSettings: PersistentUserSettingsConfig;

  /** A config which defines options for aural alerts. */
  public readonly auralAlerts: AuralAlertsConfig;

  /** Whether autothrottle is supported. */
  public readonly autothrottle: boolean;

  /** A config which defines FMS options. */
  public readonly fms: FmsConfig;

  /** A config which defines options for VNAV. */
  public readonly vnav: VNavConfig;

  /** A config which defines options for IAUs. */
  public readonly iauDefs: IauDefsConfig;

  /** A config which defines options for sensors. */
  public readonly sensors: SensorsConfig;

  /** A config which defines options for GDUs. */
  public readonly gduDefs: GduDefsConfig;

  /** A config which defines options for radios. */
  public readonly radios: RadiosConfig;

  /** A config which defines options for the autopilot. */
  public readonly autopilot: AutopilotConfig;

  /** A config which declares support for and defines options for an electronic stability and protection (ESP) system. */
  public readonly esp?: EspConfig;

  /** A map of reference V-speed groups keyed on group type. */
  public readonly vSpeedGroups: ReadonlyMap<VSpeedGroupType, VSpeedGroup>;

  /** A config which defines options for the avionics' traffic system. */
  public readonly traffic: TrafficConfig;

  /** A config which defines options for the avionics' terrain alerting system. */
  public readonly terrain: TerrainSystemConfig;

  /** A config which defines options for maps. */
  public readonly map: MapConfig;

  /** A config which defines options for performance calculations. */
  public readonly performance: PerformanceConfig;

  /** A config which defines options for the message system. */
  public readonly message: MessageSystemConfig;

  /** A config which defines options for electronic charts. */
  public readonly charts: G3000ChartsConfig;

  /** A config which defines options for electronic checklists. */
  public readonly checklist: ChecklistConfig;

  /** A config which defines options for the horizon display. */
  public readonly horizon: HorizonConfig;

  /** A config which defines the system annunciations. */
  public readonly annunciations: Annunciation[];

  /**
   * Creates an AvionicsConfig from an XML configuration document.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param xmlConfig An XML configuration document.
   */
  constructor(baseInstrument: BaseInstrument, xmlConfig: Document) {
    const root = xmlConfig.getElementsByTagName('PlaneHTMLConfig')[0];

    this.type = this.parseAvionicsType(root.querySelector(':scope>AvionicsType'));
    this.persistentUserSettings = this.parsePersistentUserSettings(root.querySelector(':scope>PersistentUserSettings'));
    this.auralAlerts = this.parseAuralAlerts(root.querySelector(':scope>AuralAlerts'));
    this.autothrottle = this.parseAutothrottle(root.querySelector(':scope>Autothrottle'));
    this.fms = this.parseFms(root.querySelector(':scope>Fms'));
    this.vnav = this.parseVNav(baseInstrument, root.querySelector(':scope>VNAV'));
    this.iauDefs = this.parseIauDefsConfig(baseInstrument, root.querySelector(':scope>IauDefs'));
    this.sensors = this.parseSensorsConfig(baseInstrument, root.querySelector(':scope>Sensors'));
    this.gduDefs = this.parseGduDefsConfig(root.querySelector(':scope>GduDefs'));
    this.radios = this.parseRadiosConfig(baseInstrument, root.querySelector(':scope>Radios'));
    this.autopilot = this.parseAutopilotConfig(baseInstrument, root.querySelector(':scope>Autopilot'));
    this.esp = this.parseEspConfig(root.querySelector(':scope>Esp'));
    this.vSpeedGroups = this.parseVSpeeds(root.querySelector(':scope>VSpeeds'));
    this.traffic = this.parseTrafficConfig(baseInstrument, root.querySelector(':scope>Traffic'));
    this.terrain = this.parseTerrainConfig(baseInstrument, root.querySelector(':scope>Terrain'));
    this.map = this.parseMapConfig(root.querySelector(':scope>Map'));
    this.performance = this.parsePerformanceConfig(root.querySelector(':scope>Performance'));
    this.message = this.parseMessageConfig(root.querySelector(':scope>Message'));
    this.charts = this.parseChartsConfig(root.querySelector(':scope>Charts'));
    this.checklist = this.parseChecklistConfig(root.querySelector(':scope>Checklist'));
    this.horizon = this.parseHorizonConfig(root.querySelector(':scope>Horizon'));

    this.annunciations = new XMLAnnunciationFactory(baseInstrument).parseConfig(baseInstrument.xmlConfig);
  }

  /**
   * Parses an avionics type from a configuration document element.
   * @param element A configuration document element.
   * @returns The avionics type defined by the configuration document element.
   */
  private parseAvionicsType(element: Element | null): AvionicsType {
    if (element === null) {
      console.warn('Avionics Type not defined. Defaulting to G3000.');
      return 'G3000';
    }

    const type = element.textContent;
    switch (type) {
      case 'G3000':
      case 'G5000':
        return type;
      default:
        console.warn(`Unrecognized avionics type ${type} (expected 'G3000' or 'G5000'). Defaulting to G3000.`);
        return 'G3000';
    }
  }

  /**
   * Parses a persistent user settings configuration object from a configuration document element.
   * @param element A configuration document element.
   * @returns The persistent user settings configuration defined by the configuration document element.
   */
  private parsePersistentUserSettings(element: Element | null): PersistentUserSettingsConfig {
    if (element !== null) {
      try {
        return new PersistentUserSettingsConfig(element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new PersistentUserSettingsConfig(undefined);
  }

  /**
   * Parses an aural alerts configuration object from a configuration document element.
   * @param element A configuration document element.
   * @returns The aural alerts configuration defined by the configuration document element.
   */
  private parseAuralAlerts(element: Element | null): AuralAlertsConfig {
    if (element !== null) {
      try {
        return new AuralAlertsConfig(element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new AuralAlertsConfig(undefined);
  }

  /**
   * Parses an FMS configuration object from a configuration document element.
   * @param element A configuration document element.
   * @returns The FMS configuration defined by the configuration document element.
   */
  private parseFms(element: Element | null): FmsConfig {
    if (element !== null) {
      try {
        return new FmsConfig(element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new FmsConfig(undefined);
  }

  /**
   * Parses a VNAV configuration object from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns The VNAV configuration defined by the configuration document element.
   */
  private parseVNav(baseInstrument: BaseInstrument, element: Element | null): VNavConfig {
    if (element !== null) {
      try {
        return new VNavConfig(baseInstrument, element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new VNavConfig(baseInstrument, undefined);
  }

  /**
   * Parses the autothrottle option from a configuration document element.
   * @param element A configuration document element.
   * @returns Whether autothrottle is supported.
   */
  private parseAutothrottle(element: Element | null): boolean {
    if (element === null) {
      return false;
    }

    const setting = element.textContent;
    switch (setting?.toLowerCase()) {
      case 'true': return true;
      case 'false': return false;
      default:
        console.warn(`Unrecognized Autothrottle setting ${setting} (expected 'True' or 'False'). Defaulting to False.`);
        return false;
    }
  }

  /**
   * Parses a sensors configuration object from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns The sensors configuration defined by the configuration document element.
   */
  private parseSensorsConfig(baseInstrument: BaseInstrument, element: Element | null): SensorsConfig {
    if (element !== null) {
      try {
        return new SensorsConfig(baseInstrument, element, this.factory);
      } catch (e) {
        console.warn(e);
      }
    }

    return new SensorsConfig(baseInstrument, undefined, this.factory);
  }

  /**
   * Parses an IAU definitions configuration object from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns The IAU definitions configuration defined by the configuration document element.
   */
  private parseIauDefsConfig(baseInstrument: BaseInstrument, element: Element | null): IauDefsConfig {
    if (element !== null) {
      try {
        return new IauDefsConfig(baseInstrument, element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new IauDefsConfig(baseInstrument, undefined);
  }

  /**
   * Parses a GDU definitions configuration object from a configuration document element.
   * @param element A configuration document element.
   * @returns Th GDU definitions configuration defined by the configuration document element.
   */
  private parseGduDefsConfig(element: Element | null): GduDefsConfig {
    if (element !== null) {
      try {
        return new GduDefsConfig(element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new GduDefsConfig(undefined);
  }

  /**
   * Parses a radios configuration object from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns The radios configuration defined by the configuration document element.
   */
  private parseRadiosConfig(baseInstrument: BaseInstrument, element: Element | null): RadiosConfig {
    if (element !== null) {
      try {
        return new RadiosConfig(baseInstrument, element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new RadiosConfig(baseInstrument, undefined);
  }

  /**
   * Parses an autopilot configuration object from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns The autopilot configuration defined by the configuration document element.
   */
  private parseAutopilotConfig(baseInstrument: BaseInstrument, element: Element | null): AutopilotConfig {
    if (element !== null) {
      try {
        return new AutopilotConfig(baseInstrument, element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new AutopilotConfig(baseInstrument, undefined);
  }

  /**
   * Parses an ESP configuration object from a configuration document element.
   * @param element A configuration document element.
   * @returns The ESP configuration defined by the configuration document element.
   */
  private parseEspConfig(element: Element | null): EspConfig | undefined {
    if (element !== null) {
      try {
        return new EspConfig(element);
      } catch (e) {
        console.warn(e);
      }
    }

    return undefined;
  }

  /**
   * Parses reference V-speed groups from a configuration document element.
   * @param element A configuration document element.
   * @returns An array of configs defining reference V-speed groups.
   */
  private parseVSpeeds(element: Element | null): ReadonlyMap<VSpeedGroupType, VSpeedGroup> {
    if (element === null) {
      return new Map();
    }

    const children = Array.from(element.querySelectorAll(':scope>Group'));
    const groups = children.map(child => {
      try {
        return new VSpeedGroupConfig(child).resolve();
      } catch (e) {
        console.warn(e);
        return null;
      }
    });

    // Pick the first group of each type.
    const map = new Map<VSpeedGroupType, any>();
    for (const group of groups) {
      if (group === null) {
        continue;
      }

      if (!map.has(group.type)) {
        map.set(group.type, group);
      }
    }

    return map;
  }

  /**
   * Parses a traffic configuration object from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns The traffic configuration defined by the configuration document element.
   */
  private parseTrafficConfig(baseInstrument: BaseInstrument, element: Element | null): TrafficConfig {
    if (element !== null) {
      try {
        return new TrafficConfig(baseInstrument, element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new TrafficConfig(baseInstrument, undefined);
  }

  /**
   * Parses a terrain system configuration object from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element that defines the terrain system configuration object.
   * @returns The TAWS configuration defined by the configuration document element.
   */
  private parseTerrainConfig(baseInstrument: BaseInstrument, element: Element | null): TerrainSystemConfig {
    if (element !== null) {
      try {
        return new TerrainSystemConfig(baseInstrument, element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new TerrainSystemConfig(baseInstrument, undefined);
  }

  /**
   * Parses a map configuration object from a configuration document element.
   * @param element A configuration document element.
   * @returns The map configuration defined by the configuration document element.
   */
  private parseMapConfig(element: Element | null): MapConfig {
    if (element !== null) {
      try {
        return new MapConfig(element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new MapConfig(undefined);
  }

  /**
   * Parses a performance configuration object from a configuration document element.
   * @param element A configuration document element.
   * @returns The performance configuration defined by the configuration document element.
   */
  private parsePerformanceConfig(element: Element | null): PerformanceConfig {
    if (element !== null) {
      try {
        return new PerformanceConfig(element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new PerformanceConfig(undefined);
  }

  /**
   * Parses a message system configuration object from a configuration document element.
   * @param element A configuration document element.
   * @returns The message system configuration defined by the configuration document element.
   */
  private parseMessageConfig(element: Element | null): MessageSystemConfig {
    if (element !== null) {
      try {
        return new MessageSystemConfig(element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new MessageSystemConfig(undefined);
  }

  /**
   * Parses an electronic charts configuration object from a configuration document element.
   * @param element A configuration document element.
   * @returns The lectronic charts configuration defined by the configuration document element.
   */
  private parseChartsConfig(element: Element | null): G3000ChartsConfig {
    if (element !== null) {
      try {
        return new G3000ChartsConfig(element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new G3000ChartsConfig(undefined);
  }

  /**
   * Parses a checklist configuration object from a configuration document element.
   * @param element A configuration document element.
   * @returns The checklist configuration defined by the configuration document element.
   */
  private parseChecklistConfig(element: Element | null): ChecklistConfig {
    if (element !== null) {
      try {
        return new ChecklistConfig(element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new ChecklistConfig(undefined);
  }

  /**
   * Parses a horizon display configuration object from a configuration document element.
   * @param element A configuration document element.
   * @returns The horizon display configuration defined by the configuration document element.
   */
  private parseHorizonConfig(element: Element | null): HorizonConfig {
    if (element !== null) {
      try {
        return new HorizonConfig(element, this.factory);
      } catch (e) {
        console.warn(e);
      }
    }

    return new HorizonConfig(undefined, this.factory);
  }
}

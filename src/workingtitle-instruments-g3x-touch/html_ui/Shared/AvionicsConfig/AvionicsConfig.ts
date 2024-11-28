import { Annunciation, XMLAnnunciationFactory } from '@microsoft/msfs-sdk';

import { MapConfig } from '../Components/Map/MapConfig';
import { DefaultConfigFactory } from '../Config/DefaultConfigFactory';
import { TrafficConfig } from '../Traffic/TrafficConfig';
import { TransponderConfig } from '../Transponder/TransponderConfig';
import { AudioConfig } from './AudioConfig';
import { AuralAlertsConfig } from './AuralAlertsConfig';
import { AutopilotConfig } from './AutopilotConfig';
import { EngineConfig } from './EngineConfig';
import { FmsConfig } from './FmsConfig';
import { GduDefsConfig } from './GduDefsConfig';
import { RadiosConfig } from './RadiosConfig';
import { SensorsConfig } from './SensorsConfig';

/**
 * A configuration object which defines options for G3X Touch avionics systems.
 */
export class AvionicsConfig {
  private readonly factory = new DefaultConfigFactory();

  /** A config that defines options for aural alerts. */
  public readonly auralAlerts: AuralAlertsConfig;

  /** A config that defines FMS options. */
  public readonly fms: FmsConfig;

  /** A config that defines options for GDUs. */
  public readonly gduDefs: GduDefsConfig;

  /** A config that defines options for sensors. */
  public readonly sensors: SensorsConfig;

  /** A config that defines options for radios. */
  public readonly radios: RadiosConfig;

  /** A config that defines transponder options. */
  public readonly transponder?: TransponderConfig;

  /** A config that defines options for audio. */
  public readonly audio: AudioConfig;

  /** A config that defines options for the autopilot, or `undefined` if coupling to an autopilot is not supported. */
  public readonly autopilot?: AutopilotConfig;

  /** A config that defines options for the avionics' traffic system. */
  public readonly traffic: TrafficConfig;

  /** A config that defines options for maps. */
  public readonly map: MapConfig;

  /** A config that defines options for the display of engine information. */
  public readonly engine: EngineConfig;

  /** A config which defines the system annunciations. */
  public readonly annunciations: readonly Annunciation[];

  /**
   * Creates an AvionicsConfig from an XML configuration document.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param config An XML configuration document.
   */
  constructor(baseInstrument: BaseInstrument, config: Document) {
    const root = config.getElementsByTagName('PlaneHTMLConfig')[0];
    const g3xRoot = root.querySelector(':scope>G3X');

    this.auralAlerts = this.parseAuralAlerts(g3xRoot?.querySelector(':scope>AuralAlerts') ?? null);
    this.fms = this.parseFms(g3xRoot?.querySelector(':scope>Fms') ?? null);
    this.gduDefs = this.parseGduDefsConfig(baseInstrument, g3xRoot?.querySelector(':scope>GduDefs') ?? null);
    this.sensors = this.parseSensorsConfig(baseInstrument, g3xRoot?.querySelector(':scope>Sensors') ?? null);
    this.radios = this.parseRadiosConfig(baseInstrument, g3xRoot?.querySelector(':scope>Radios') ?? null);
    this.transponder = this.parseTransponderConfig(g3xRoot?.querySelector(':scope>Transponder') ?? null);
    this.audio = this.parseAudioConfig(baseInstrument, g3xRoot?.querySelector(':scope>Audio') ?? null);
    this.autopilot = this.parseAutopilotConfig(baseInstrument, g3xRoot?.querySelector(':scope>Autopilot') ?? null);
    this.traffic = this.parseTrafficConfig(baseInstrument, g3xRoot?.querySelector(':scope>Traffic') ?? null);
    this.map = this.parseMapConfig(g3xRoot?.querySelector(':scope>Map') ?? null);
    this.engine = this.parseEngineConfig(baseInstrument, g3xRoot?.querySelector(':scope>Engine') ?? null);

    const casAnnunciationsElement = g3xRoot?.querySelector(':scope>Annunciations');
    if (casAnnunciationsElement) {
      this.annunciations = new XMLAnnunciationFactory(baseInstrument).parseConfigElement(casAnnunciationsElement);
    } else {
      this.annunciations = [];
    }
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
   * Parses a sensors configuration object from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns The sensors configuration defined by the configuration document element.
   */
  private parseSensorsConfig(baseInstrument: BaseInstrument, element: Element | null): SensorsConfig {
    if (element !== null) {
      try {
        return new SensorsConfig(baseInstrument, element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new SensorsConfig(baseInstrument, undefined);
  }

  /**
   * Parses a GDU definitions configuration object from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns The GDU definitions configuration defined by the configuration document element.
   */
  private parseGduDefsConfig(baseInstrument: BaseInstrument, element: Element | null): GduDefsConfig {
    if (element !== null) {
      try {
        return new GduDefsConfig(baseInstrument, element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new GduDefsConfig(baseInstrument, undefined);
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
   * Parses a transponder configuration object from a configuration document.
   * @param element A configuration document element.
   * @returns The transponder configuration object defined by the configuration document.
   */
  private parseTransponderConfig(element: Element | null): TransponderConfig | undefined {
    if (element !== null) {
      try {
        return new TransponderConfig(element);
      } catch (e) {
        console.warn(e);
      }
    }

    return undefined;
  }

  /**
   * Parses an audio configuration object from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns The audio configuration defined by the configuration document element.
   */
  private parseAudioConfig(baseInstrument: BaseInstrument, element: Element | null): AudioConfig {
    if (element !== null) {
      try {
        return new AudioConfig(baseInstrument, element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new AudioConfig(baseInstrument, undefined);
  }

  /**
   * Parses an autopilot configuration object from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns The autopilot configuration defined by the configuration document element.
   */
  private parseAutopilotConfig(baseInstrument: BaseInstrument, element: Element | null): AutopilotConfig | undefined {
    if (element !== null) {
      try {
        return new AutopilotConfig(baseInstrument, element);
      } catch (e) {
        console.warn(e);
      }
    }

    return undefined;
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
   * Parses an engine configuration object from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns The engine configuration defined by the configuration document element.
   */
  private parseEngineConfig(baseInstrument: BaseInstrument, element: Element | null): EngineConfig {
    if (element !== null) {
      try {
        return new EngineConfig(baseInstrument, element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new EngineConfig(baseInstrument, undefined);
  }
}

import { AirframeConfig } from './AirframeConfig';
import { AutopilotConfig } from './AutopilotConfig';
import { AutothrottleConfig } from './AutothrottleConfig';
import { ChecklistConfig } from './ChecklistConfig';
import { DisplayUnitsConfig } from './DisplayUnitsConfig';
import { SensorsConfig } from './SensorsConfig';
import { SpeedScheduleConfig } from './SpeedScheduleConfig';

/**
 * A configuration object which defines options for G3000/5000 avionics systems.
 */
export class AvionicsConfig {
  /** A config which defines options for sensors. */
  public readonly sensors: SensorsConfig;

  /** A config which defines options for display units. */
  public readonly displayUnits: DisplayUnitsConfig;

  public readonly airframe: AirframeConfig;

  public readonly speedSchedules: SpeedScheduleConfig;

  public readonly autopilot: AutopilotConfig;

  public readonly autothrottle: AutothrottleConfig;

  /** A config which defines checklist stuff */
  public readonly checklist: ChecklistConfig;

  /**
   * Creates an AvionicsConfig from an XML configuration document.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param xmlConfig An XML configuration document.
   */
  constructor(baseInstrument: BaseInstrument, xmlConfig: Document) {
    const root = xmlConfig.getElementsByTagName('PlaneHTMLConfig')[0];

    this.sensors = this.parseSensorsConfig(baseInstrument, root.querySelector(':scope>Sensors'));

    this.displayUnits = this.parseDisplayUnitsConfig(baseInstrument, root.querySelector(':scope>DisplayUnits'), this.sensors.radarAltimeterCount);

    this.speedSchedules = this.parseSpeedScheduleConfig(baseInstrument, root.querySelector(':scope>SpeedSchedules'));

    this.airframe = this.parseAirframeConfig(root.querySelector(':scope>AirframeConfiguration'));

    this.autopilot = this.parseAutopilotConfig(root.querySelector(':scope>Autopilot'), baseInstrument);

    this.autothrottle = this.parseAutothrottleConfig(root.querySelector(':scope>Autothrottle'), baseInstrument);

    this.checklist = this.parseChecklistConfig(root.querySelector(':scope>Checklist'));
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
   * Parses a speed schedule configuration object from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns The speed schedule configuration defined by the configuration document element.
   */
  private parseSpeedScheduleConfig(baseInstrument: BaseInstrument, element: Element | null): SpeedScheduleConfig {
    if (element !== null) {
      try {
        return new SpeedScheduleConfig(baseInstrument, element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new SpeedScheduleConfig(baseInstrument, undefined);
  }

  /**
   * Parses a display units configuration object from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @param radioAltimeterCount Number of supported radio altimeters.
   * @returns The display units configuration defined by the configuration document element.
   */
  private parseDisplayUnitsConfig(baseInstrument: BaseInstrument, element: Element | null, radioAltimeterCount: number): DisplayUnitsConfig {
    if (element !== null) {
      try {
        return new DisplayUnitsConfig(baseInstrument, element, radioAltimeterCount);
      } catch (e) {
        console.warn(e);
      }
    }

    return new DisplayUnitsConfig(baseInstrument, undefined, radioAltimeterCount);
  }

  /**
   * Parses an airframe configuration object from a configuration document element.
   * @param element A configuration document element.
   * @returns The airframe configuration defined by the configuration document element.
   */
  private parseAirframeConfig(element: Element | null): AirframeConfig {
    if (element !== null) {
      try {
        return new AirframeConfig(element);
      } catch (e) {
        console.warn(e);
      }
    }

    return new AirframeConfig(undefined);
  }

  /**
   * Parses an autopilot configuration object from a configuration document element.
   * @param element A configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @returns The autopilot configuration defined by the configuration document element.
   */
  private parseAutopilotConfig(element: Element | null, baseInstrument: BaseInstrument): AutopilotConfig {
    if (element !== null) {
      try {
        return new AutopilotConfig(element, baseInstrument);
      } catch (e) {
        console.warn(e);
      }
    }

    return new AutopilotConfig(undefined, baseInstrument);
  }

  /**
   * Parses an autothrottle configuration object from a configuration document element.
   * @param element A configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @returns The autothrottle configuration defined by the configuration document element.
   */
  private parseAutothrottleConfig(element: Element | null, baseInstrument: BaseInstrument): AutothrottleConfig {
    if (element !== null) {
      try {
        return new AutothrottleConfig(element, baseInstrument);
      } catch (e) {
        console.warn(e);
      }
    }

    return new AutothrottleConfig(undefined, baseInstrument);
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
}

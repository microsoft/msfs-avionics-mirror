import { SensorsConfig } from './SensorsConfig';

/**
 * A configuration object which defines options for WT21 avionics systems.
 */
export class AvionicsConfig {
  public readonly sensors: SensorsConfig;

  /** @inheritdoc */
  constructor(baseInstrument: BaseInstrument, xmlConfig: Document) {
    this.sensors = this.parseSensorsConfig(baseInstrument, xmlConfig.querySelector(':scope>Sensors'));
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
}

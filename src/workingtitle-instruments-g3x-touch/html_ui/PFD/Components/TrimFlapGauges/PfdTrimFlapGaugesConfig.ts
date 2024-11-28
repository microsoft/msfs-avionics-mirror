import { Config } from '../../../Shared/Config/Config';
import { PfdAileronTrimGaugeConfig } from './AileronRudderTrimGauge/PfdAileronTrimGaugeConfig';
import { PfdRudderTrimGaugeConfig } from './AileronRudderTrimGauge/PfdRudderTrimGaugeConfig';
import { PfdElevatorTrimGaugeConfig } from './FlapsElevatorTrimGauge/ElevatorTrimGauge/PfdElevatorTrimGaugeConfig';
import { PfdFlapsGaugeConfig } from './FlapsElevatorTrimGauge/FlapsGauge/PfdFlapsGaugeConfig';

/**
 * A configuration object which defines PFD trim/flap gauge options.
 */
export class PfdTrimFlapGaugesConfig implements Config {

  /** A config which defines options for the PFD flaps gauge, or `undefined` if the gauge is not supported. */
  public readonly flapsGauge?: PfdFlapsGaugeConfig;

  /** A config which defines options for the PFD's elevator trim gauge, or `undefined` if the gauge is not supported. */
  public readonly elevatorTrimGauge?: PfdElevatorTrimGaugeConfig;

  /** A config which defines options for the PFD's aileron trim gauge, or `undefined` if the gauge is not supported. */
  public readonly aileronTrimGauge?: PfdAileronTrimGaugeConfig;

  /** A config which defines options for the PFD's rudder trim gauge, or `undefined` if the gauge is not supported. */
  public readonly rudderTrimGauge?: PfdRudderTrimGaugeConfig;

  /**
   * Creates a new PfdTrimFlapGaugesConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element | undefined) {
    if (element === undefined) {
      this.flapsGauge = undefined;
      this.elevatorTrimGauge = undefined;
      this.aileronTrimGauge = undefined;
      this.rudderTrimGauge = undefined;
    } else {
      if (element.tagName !== 'PfdTrimFlapGauges') {
        throw new Error(`Invalid PfdTrimFlapGaugesConfig definition: expected tag name 'PfdTrimFlapGauges' but was '${element.tagName}'`);
      }

      const inheritFromId = element.getAttribute('inherit');
      const inheritFromElement = inheritFromId === null
        ? null
        : element.ownerDocument.querySelector(`PfdTrimFlapGauges[id='${inheritFromId}']`);

      const inheritData = inheritFromElement ? new PfdTrimFlapGaugesConfigData(inheritFromElement) : undefined;
      const data = new PfdTrimFlapGaugesConfigData(element);

      this.flapsGauge = data.flapsGauge ?? inheritData?.flapsGauge;
      this.elevatorTrimGauge = data.elevatorTrimGauge ?? inheritData?.elevatorTrimGauge;
      this.aileronTrimGauge = data.aileronTrimGauge ?? inheritData?.aileronTrimGauge;
      this.rudderTrimGauge = data.rudderTrimGauge ?? inheritData?.rudderTrimGauge;
    }
  }
}

/**
 * An object containing PFD trim/flap gauges config data parsed from an XML document element.
 */
class PfdTrimFlapGaugesConfigData {
  /** A config which defines options for the PFD flaps gauge. */
  public readonly flapsGauge?: PfdFlapsGaugeConfig;

  /** A config which defines options for the PFD's elevator trim gauge. */
  public readonly elevatorTrimGauge?: PfdElevatorTrimGaugeConfig;

  /** A config which defines options for the PFD's aileron trim gauge. */
  public readonly aileronTrimGauge?: PfdAileronTrimGaugeConfig;

  /** A config which defines options for the PFD's rudder trim gauge. */
  public readonly rudderTrimGauge?: PfdRudderTrimGaugeConfig;

  /**
   * Creates a new PfdTrimFlapGaugesConfigData from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element | undefined) {
    if (element !== undefined) {
      if (element.tagName !== 'PfdTrimFlapGauges') {
        throw new Error(`Invalid PfdTrimFlapGaugesConfig definition: expected tag name 'PfdTrimFlapGauges' but was '${element.tagName}'`);
      }

      this.flapsGauge = this.parseFlapsGaugeConfig(element.querySelector('FlapsGauge'));
      this.elevatorTrimGauge = this.parseElevatorTrimGaugeConfig(element.querySelector('ElevatorTrimGauge'));
      this.aileronTrimGauge = this.parseAileronTrimGaugeConfig(element.querySelector('AileronTrimGauge'));
      this.rudderTrimGauge = this.parseRudderTrimGaugeConfig(element.querySelector('RudderTrimGauge'));
    }
  }

  /**
   * Parses a flaps gauge configuration object from a configuration document element.
   * @param element A configuration document element.
   * @returns The flaps gauge configuration defined by the configuration document element.
   */
  private parseFlapsGaugeConfig(element: Element | null): PfdFlapsGaugeConfig | undefined {
    if (element !== null) {
      try {
        return new PfdFlapsGaugeConfig(element);
      } catch (e) {
        console.error(e);
      }
    }
    return undefined;
  }

  /**
   * Parses an elevator trim gauge configuration object from a configuration document element.
   * @param element A configuration document element.
   * @returns The elevator trim gauge configuration defined by the configuration document element.
   */
  private parseElevatorTrimGaugeConfig(element: Element | null): PfdElevatorTrimGaugeConfig | undefined {
    if (element !== null) {
      try {
        return new PfdElevatorTrimGaugeConfig(element);
      } catch (e) {
        console.error(e);
      }
    }
    return undefined;
  }

  /**
   * Parses an aileron trim gauge configuration object from a configuration document element.
   * @param element A configuration document element.
   * @returns The aileron trim gauge configuration defined by the configuration document element.
   */
  private parseAileronTrimGaugeConfig(element: Element | null): PfdAileronTrimGaugeConfig | undefined {
    if (element !== null) {
      try {
        return new PfdAileronTrimGaugeConfig(element);
      } catch (e) {
        console.error(e);
      }
    }
    return undefined;
  }

  /**
   * Parses a rudder trim gauge configuration object from a configuration document element.
   * @param element A configuration document element.
   * @returns The rudder trim gauge configuration defined by the configuration document element.
   */
  private parseRudderTrimGaugeConfig(element: Element | null): PfdRudderTrimGaugeConfig | undefined {
    if (element !== null) {
      try {
        return new PfdRudderTrimGaugeConfig(element);
      } catch (e) {
        console.error(e);
      }
    }
    return undefined;
  }
}

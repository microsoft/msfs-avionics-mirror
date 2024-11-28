import { ConfigBuilder, ConfigParser, NumberToRangeUnion } from '@microsoft/msfs-sdk';

/** A fuel flow sensor index. There can be no more than four. */
export type UnsFuelFlowSensorIndex = NumberToRangeUnion<4>;

/** A base fuel flow sensor. */
export interface UnsBaseFuelFlowSensor {
  /** The index. */
  index: UnsFuelFlowSensorIndex,
  /** A label to display on the fifth fuel page. */
  label: string,
}

/** A fuel flow sensor for the legacy fuel system. */
export interface UnsLegacyFuelSystemFlowSensor extends UnsBaseFuelFlowSensor {
  /** The engine index to use in retrieving indexed engine events. */
  simEngineIndex: UnsFuelFlowSensorIndex,
}

/** A fuel flow sensor for the new fuel system. */
export interface UnsNewFuelSystemFlowSensor extends UnsBaseFuelFlowSensor {
  /** The engine index to use in retrieving indexed fuel line events. */
  fuelLineIndex: UnsFuelFlowSensorIndex,
}

/** A UNS fuel flow sensor for either the legacy or new fuel system. */
export type UnsFuelFlowSensor = UnsLegacyFuelSystemFlowSensor | UnsNewFuelSystemFlowSensor;

/** The type of fuel system. */
type FuelSystemType = 'legacy' | 'new';

/** Fuel flow sensors. */
export interface UnsFuelFlowSensors {
  /** The number of sensors. */
  fuelFlowCount: 0 | UnsFuelFlowSensorIndex,
  /** Whether the aircraft is using the legacy or new fuel system. */
  fuelSystem: FuelSystemType,
  /** An array of individual fuel sensors. */
  sensors: Map<UnsFuelFlowSensorIndex, UnsFuelFlowSensor>
}

/**
 * Navigation sensors
 */
export interface UnsNavigationSensors {
  /** Number of IRS sensors fitted to the aircraft */
  irsSensorCount: number
  /** Number of WAAS sensors fitted to the aircraft */
  waasSensorCount: number
  /** Attitude sensor used by the aircraft */
  attitudeSensor: 'IRS' | 'AHRS'
  /** VOR Sensor Circuit */
  vorSensorCircuit?: CompositeLogicXMLElement
  /** DME Sensor Circuit */
  dmeSensorCircuit?: CompositeLogicXMLElement
  /** ADC Sensor Circuit */
  adcSensorCircuit?: CompositeLogicXMLElement
  /** IRS Sensor Circuit */
  irsSensorCircuit?: CompositeLogicXMLElement
  /** WAAS Sensor Circuit */
  waasSensorCircuit?: CompositeLogicXMLElement
}

/** Aircraft sensors. */
export interface UnsSensorsConfig {
  /** Fuel flow sensors. */
  fuelFlow: UnsFuelFlowSensors
  /** Navigation sensors. */
  navSensors: UnsNavigationSensors
}

/** An implementation of {@link UnsSensorsConfig} parsed from an XML tag. */
export class SensorsConfigBuilder extends ConfigBuilder<UnsSensorsConfig> {
  protected readonly CONFIG_TAG_NAME = 'Sensors';

  private static readonly FUEL_FLOW_SENSORS_TAG_NAME = 'FuelFlowSensors';
  private static readonly FUEL_FLOW_COUNT_ATTR_NAME = 'fuel-flow-count';
  private static readonly FUEL_SYSTEM_ATTR_NAME = 'fuel-system';

  private static readonly FUEL_FLOW_SENSOR_TAG_NAME = 'FuelFlowSensor';
  private static readonly FUEL_FLOW_SENSOR_INDEX_ATTR_NAME = 'index';
  private static readonly FUEL_FLOW_SENSOR_LABEL_ATTR_NAME = 'label';
  private static readonly FUEL_FLOW_SENSOR_SIM_ENGINE_INDEX_ATTR_NAME = 'sim-engine-index';
  private static readonly FUEL_FLOW_SENSOR_FUEL_LINE_INDEX_ATTR_NAME = 'fuel-line-index';

  private static readonly NAV_SENSORS_TAG_NAME = 'NavigationSensors';
  private static readonly IRS_SENSORS_TAG_NAME = 'IrsSensors';
  private static readonly WAAS_SENSORS_TAG_NAME = 'WaasSensors';
  private static readonly VOR_SENSORS_TAG_NAME = 'VorSensor';
  private static readonly DME_SENSORS_TAG_NAME = 'DmeSensor';
  private static readonly ADC_SENSORS_TAG_NAME = 'AdcSensor';
  private static readonly ATTITUDE_SOURCE_TAG_NAME = 'AttitudeSource';
  private static readonly NAV_SENSOR_COUNT_ATTR_NAME = 'count';
  private static readonly ATTITUDE_SENSOR_ATTR_NAME = 'source';

  private static readonly MAX_INDIVIDUAL_NAV_SENSORS = 3;
  private static readonly MAX_TOTAL_NAV_SENSORS = 5;
  private static readonly DEFAULT_NAV_SENSORS: UnsNavigationSensors = {
    irsSensorCount: 0,
    waasSensorCount: 1,
    attitudeSensor: 'AHRS',
  };

  /** @inheritDoc */
  protected parseConfig(): UnsSensorsConfig {
    const fuelFlowSensorsElement: Element = ConfigParser.getChildElement(
      this.configElement,
      SensorsConfigBuilder.FUEL_FLOW_SENSORS_TAG_NAME,
    );

    const fuelSystem: FuelSystemType = ConfigParser.getStringAttrValue(
      fuelFlowSensorsElement,
      SensorsConfigBuilder.FUEL_SYSTEM_ATTR_NAME,
    );

    const navSensorsElement: Element = ConfigParser.getChildElement(
      this.configElement,
      SensorsConfigBuilder.NAV_SENSORS_TAG_NAME,
    );

    return {
      fuelFlow: {
        fuelFlowCount: ConfigParser.getIntegerAttrValue(
          fuelFlowSensorsElement,
          SensorsConfigBuilder.FUEL_FLOW_COUNT_ATTR_NAME,
        ),
        fuelSystem,
        sensors: this.parseFuelFlowSensors(fuelFlowSensorsElement, fuelSystem === 'legacy'),
      },
      navSensors: this.parseNavigationSensors(navSensorsElement)
    };
  }

  /**
   * Parses the collection of navigation sensors.
   * @param navSensorsElement The navigation sensors element.
   * @returns A map of navigation sensors.
   */
  private parseNavigationSensors(navSensorsElement: Element): UnsNavigationSensors {
    const navSensors = SensorsConfigBuilder.DEFAULT_NAV_SENSORS;

    const waasSensorElement: Element | undefined = ConfigParser.getChildElement(
      navSensorsElement,
      SensorsConfigBuilder.WAAS_SENSORS_TAG_NAME,
    );
    const irsSensorElement: Element | undefined = this.getChildElementWithDefault(
      navSensorsElement,
      SensorsConfigBuilder.IRS_SENSORS_TAG_NAME,
      undefined
    );
    const vorSensorElement: Element | undefined = this.getChildElementWithDefault(
      navSensorsElement,
      SensorsConfigBuilder.VOR_SENSORS_TAG_NAME,
      undefined
    );
    const dmeSensorElement: Element | undefined = this.getChildElementWithDefault(
      navSensorsElement,
      SensorsConfigBuilder.DME_SENSORS_TAG_NAME,
      undefined
    );
    const adcSensorElement: Element | undefined = this.getChildElementWithDefault(
      navSensorsElement,
      SensorsConfigBuilder.ADC_SENSORS_TAG_NAME,
      undefined
    );
    const attitudeSourceElement: Element | undefined = this.getChildElementWithDefault(
      navSensorsElement,
      SensorsConfigBuilder.ATTITUDE_SOURCE_TAG_NAME,
      undefined
    );

    navSensors.waasSensorCount = this.getNavSensorCount('waasSensorCount', waasSensorElement);
    navSensors.irsSensorCount = this.getNavSensorCount('irsSensorCount', irsSensorElement);
    navSensors.irsSensorCircuit = this.getElectricityConfig(irsSensorElement);
    navSensors.waasSensorCircuit = this.getElectricityConfig(waasSensorElement);
    navSensors.adcSensorCircuit = this.getElectricityConfig(adcSensorElement);
    navSensors.dmeSensorCircuit = this.getElectricityConfig(dmeSensorElement);
    navSensors.vorSensorCircuit = this.getElectricityConfig(vorSensorElement);

    const totalSensors = navSensors.waasSensorCount + navSensors.irsSensorCount;
    if (totalSensors > SensorsConfigBuilder.MAX_TOTAL_NAV_SENSORS) {
      const sensorDiff = totalSensors - SensorsConfigBuilder.MAX_TOTAL_NAV_SENSORS;
      navSensors.irsSensorCount -= sensorDiff;
    }

    if (attitudeSourceElement) {
      navSensors.attitudeSensor = ConfigParser.getStringAttrValue(attitudeSourceElement, SensorsConfigBuilder.ATTITUDE_SENSOR_ATTR_NAME);
    }

    return navSensors;
  }

  /**
   * Gets a child element, and where an error would normally be thrown, a default value is returned instead.
   * @param parentElement Parent element to get child from
   * @param tagName Name of child to get
   * @param defaultValue Value to be returned if no child element of name
   * @returns The child element or the default value specified
   */
  private getChildElementWithDefault<T>(parentElement: Element, tagName: string, defaultValue: T): Element | T {
    try {
      const element = ConfigParser.getChildElement(parentElement, tagName);
      return element;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Gets the electricity logic from a given element
   * @param element Element to get the electric circuit from
   * @returns The electricity logic element, or undefined if none is present
   */
  private getElectricityConfig(element: Element | undefined): CompositeLogicXMLElement | undefined {
    if (element) {
      const electricLogicElement = element.querySelector(':scope>Electric');

      if (electricLogicElement === null) {
        return undefined;
      } else {
        return new CompositeLogicXMLElement(this.baseInstrument, electricLogicElement);
      }
    } else {
      return undefined;
    }
  }

  /**
   * Gets the number of the specified sensor where specified, or where not specified a default value is returned
   * @param sensorName The name of the sensor property
   * @param sensorElement Element from which to get sensor count
   * @returns Number of the sensors of the specified type available
   */
  private getNavSensorCount(sensorName: 'irsSensorCount' | 'waasSensorCount', sensorElement: Element | undefined): number {
    const defaultCount = SensorsConfigBuilder.DEFAULT_NAV_SENSORS[sensorName];
    if (!sensorElement) { return defaultCount; }
    try {
      const sensorCount = ConfigParser.getIntegerAttrValue(sensorElement, SensorsConfigBuilder.NAV_SENSOR_COUNT_ATTR_NAME);
      if (sensorCount > SensorsConfigBuilder.MAX_INDIVIDUAL_NAV_SENSORS) {
        return SensorsConfigBuilder.MAX_INDIVIDUAL_NAV_SENSORS;
      } else {
        return sensorCount;
      }
    } catch {
      return defaultCount;
    }
  }

  /**
   * Parses the collection of fuel flow sensors.
   * @param fuelFlowSensorsElement The fuel flow sensors element.
   * @param isLegacyFuelSystem Whether the fuel system is the legacy type.
   * @returns A (possibly empty) map of fuel flow sensors.
   * @throws If more than four fuel flow sensors are defined.
   */
  private parseFuelFlowSensors(
    fuelFlowSensorsElement: Element, isLegacyFuelSystem: boolean
  ): Map<UnsFuelFlowSensorIndex, UnsFuelFlowSensor> {
    const fuelFlowSensorElements: Element[] = ConfigParser.getChildElements(
      fuelFlowSensorsElement,
      SensorsConfigBuilder.FUEL_FLOW_SENSOR_TAG_NAME,
    );

    const fuelFlowSensorsMap = new Map<UnsFuelFlowSensorIndex, UnsFuelFlowSensor>();

    fuelFlowSensorElements.forEach((element: Element): void => {
      const baseObject: UnsBaseFuelFlowSensor = {
        index: ConfigParser.getIntegerAttrValue(
          element,
          SensorsConfigBuilder.FUEL_FLOW_SENSOR_INDEX_ATTR_NAME,
        ),
        label: ConfigParser.getStringAttrValue(
          element,
          SensorsConfigBuilder.FUEL_FLOW_SENSOR_LABEL_ATTR_NAME,
        ),
      };

      const value: UnsFuelFlowSensor = isLegacyFuelSystem ?
        {
          ...baseObject,
          simEngineIndex: ConfigParser.getIntegerAttrValue(
          element,
            SensorsConfigBuilder.FUEL_FLOW_SENSOR_SIM_ENGINE_INDEX_ATTR_NAME,
          )
        } : {
          ...baseObject,
          fuelLineIndex: ConfigParser.getIntegerAttrValue(
            element,
            SensorsConfigBuilder.FUEL_FLOW_SENSOR_FUEL_LINE_INDEX_ATTR_NAME,
          )
        };

      fuelFlowSensorsMap.set(baseObject.index, value);
    });

    if (fuelFlowSensorsMap.size > 4) {
      throw new Error('FmsConfig: There cannot be more than four fuel flow sensors defined.');
    }

    return fuelFlowSensorsMap;
  }

  /** @inheritDoc */
  protected defaultConfig(): UnsSensorsConfig {
    return {
      fuelFlow: {
        fuelFlowCount: 0,
        fuelSystem: 'new',
        sensors: new Map(),
      },
      navSensors: SensorsConfigBuilder.DEFAULT_NAV_SENSORS
    };
  }

  /**
   * Determines whether a UNS fuel flow sensor is configured for use with the legacy fuel system.
   * @param sensor The sensor to test.
   * @returns Whether it's a legacy fuel system sensor.
   */
  public static isLegacyFuelSystemFlowSensor(sensor: UnsFuelFlowSensor): sensor is UnsLegacyFuelSystemFlowSensor {
    return 'simEngineIndex' in sensor;
  }

  /**
   * Determines whether a UNS fuel flow sensor is configured for use with the new fuel system.
   * @param sensor The sensor to test.
   * @returns Whether it's a new fuel system sensor.
   */
  public static isNewFuelSystemFlowSensor(sensor: UnsFuelFlowSensor): sensor is UnsNewFuelSystemFlowSensor {
    return 'fuelLineIndex' in sensor;
  }
}

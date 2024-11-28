import { ConfigBuilder, ConfigParser, UnitType } from '@microsoft/msfs-sdk';

/**
 * Configuration object interface for the UNS-1's airframe
 */
export interface UnsAirframeConfig {
  /** The name of the airframe, displayed on the self-test page */
  name: string,
  /** The basic operating weight, in pounds. */
  basicOperatingWeight: number,
}

/**
 * An implementation of {@link UnsAirframeConfig} parsed from an XML tag
 */
export class AirframeConfigBuilder extends ConfigBuilder<UnsAirframeConfig> {
  protected readonly CONFIG_TAG_NAME: string = 'Airframe';

  private static readonly AIRFRAME_CONFIG_NAME_TAG_NAME = 'Name';
  private static readonly AIRFRAME_CONFIG_WEIGHT_TAG_NAME = 'DefaultBasicOperatingWeight';
  private static readonly AIRFRAME_CONFIG_WEIGHT_UNIT_ATTR_NAME = 'unit';

  /** @inheritDoc */
  protected parseConfig(): UnsAirframeConfig {
    const weightStr: string = ConfigParser.getTextContent(ConfigParser.getChildElement(
      this.configElement,
      AirframeConfigBuilder.AIRFRAME_CONFIG_WEIGHT_TAG_NAME,
    ));

    const weightUnit: string = ConfigParser.getStringAttrValue(
      ConfigParser.getChildElement(
        this.configElement,
        AirframeConfigBuilder.AIRFRAME_CONFIG_WEIGHT_TAG_NAME,
      ),
      AirframeConfigBuilder.AIRFRAME_CONFIG_WEIGHT_UNIT_ATTR_NAME
    );

    let weight = 0;
    if (weightUnit === UnitType.POUND.name) {
      weight = parseInt(weightStr);
    } else {
      throw new Error('AirframeConfig: Please supply weights in "pound" units.');
    }

    return {
      name: ConfigParser.getTextContent(ConfigParser.getChildElement(
        this.configElement,
        AirframeConfigBuilder.AIRFRAME_CONFIG_NAME_TAG_NAME
      )),
      basicOperatingWeight: weight,
    };
  }

  /** @inheritDoc */
  protected defaultConfig(): UnsAirframeConfig {
    return {
      name: '',
      basicOperatingWeight: 0,
    };
  }
}

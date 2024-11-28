import { ConfigBuilder, ConfigParser } from '@microsoft/msfs-sdk';

/**
 * UNS-1 flight planner panel.xml configuration
 */
export interface UnsFlightPlannerConfig {
  /** The flight planner ID to use */
  id: string,
}

/**
 * An implementation of {@link UnsFlightPlannerConfig} parsed from an XML tag
 */
export class FlightPlannerConfigBuilder extends ConfigBuilder<UnsFlightPlannerConfig> {
  private static readonly FLIGHT_PLANNER_ID_ATTR_NAME = 'id';

  protected readonly CONFIG_TAG_NAME = 'FlightPlanner';

  /** @inheritDoc */
  protected parseConfig(): UnsFlightPlannerConfig {
    return {
      id: ConfigParser.getStringAttrValue(
        this.configElement,
        FlightPlannerConfigBuilder.FLIGHT_PLANNER_ID_ATTR_NAME,
      ),
    };
  }

  /** @inheritDoc */
  protected defaultConfig(): UnsFlightPlannerConfig {
    return {
      id: '',
    };
  }
}

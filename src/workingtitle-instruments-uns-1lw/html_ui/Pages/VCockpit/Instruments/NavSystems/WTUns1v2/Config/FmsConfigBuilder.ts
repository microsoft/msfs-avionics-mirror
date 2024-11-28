import { ConfigBuilder, ConfigParser } from '@microsoft/msfs-sdk';

import { UnsIndex } from '../WTUns1FsInstrument';
import { AirframeConfigBuilder, UnsAirframeConfig } from './AirframeConfigBuilder';
import { AutopilotConfigBuilder, UnsAutopilotConfig } from './AutopilotConfigBuilder';
import { FlightPlannerConfigBuilder, UnsFlightPlannerConfig } from './FlightPlannerConfigBuilder';
import { LNAvConfigBuilder, UnsLNavConfig } from './LNavConfigBuilder';
import { SensorsConfigBuilder, UnsSensorsConfig } from './SensorsConfigBuilder';

/** Configuration object interface for an FmsConfig tag */
interface UnsFmsConfigTag {
  /** The index of the FMS */
  index: UnsIndex,
}

/**
 * Configuration object interface for the UNS-1
 */
export interface UnsFmsConfigInterface extends UnsFmsConfigTag {
  /** The airframe config */
  airframe: UnsAirframeConfig,

  /** The flight planner config */
  flightPlanner: UnsFlightPlannerConfig,

  /** The LNav config */
  lnav: UnsLNavConfig,

  /** The autopilot config */
  autopilot?: UnsAutopilotConfig

  /** The sensors config */
  sensors: UnsSensorsConfig,
}

/**
 * An implementation of {@link UnsFmsConfigInterface} parsed from an XML tag
 */
export class FmsConfigBuilder extends ConfigBuilder<UnsFmsConfigInterface> {
  protected readonly CONFIG_TAG_NAME: string = 'FmsConfig';

  private static readonly FMS_CONFIG_INDEX_ATTR_NAME = 'index';

  private readonly configs: Omit<UnsFmsConfigInterface, 'index'> = {
    airframe: new AirframeConfigBuilder(
      this.configElement,
      this.baseInstrument,
      this.errorsMap,
    ).getConfig(),
    flightPlanner: new FlightPlannerConfigBuilder(
      this.configElement,
      this.baseInstrument,
      this.errorsMap,
    ).getConfig(),
    lnav: new LNAvConfigBuilder(
      this.configElement,
      this.baseInstrument,
      this.errorsMap,
    ).getConfig(),
    autopilot: new AutopilotConfigBuilder(
      this.configElement,
      this.baseInstrument,
      this.errorsMap,
    ).getConfig(),
    sensors: new SensorsConfigBuilder(
      this.configElement,
      this.baseInstrument,
      this.errorsMap,
    ).getConfig(),
  };

  /** @inheritDoc */
  protected parseConfig(): UnsFmsConfigInterface {
    return {
      index: ConfigParser.getIntegerAttrValue(
        this.configElement,
        FmsConfigBuilder.FMS_CONFIG_INDEX_ATTR_NAME,
      ),
      ...this.configs,
    };
  }

  /** @inheritDoc */
  protected defaultConfig(): UnsFmsConfigInterface {
    return {
      index: 1,
      ...this.configs,
    };
  }
}

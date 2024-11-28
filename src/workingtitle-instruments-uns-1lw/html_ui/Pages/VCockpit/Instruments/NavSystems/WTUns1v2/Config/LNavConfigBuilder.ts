import { ConfigBuilder, ConfigParser, LerpLookupTable } from '@microsoft/msfs-sdk';

/**
 * UNS-1 flight planner panel.xml configuration
 */
export interface UnsLNavConfig {
  /** The LNav index to use */
  index: number,

  /** The lerp lookup table configured for the bank angle limits, if applicable */
  bankAngleLimits?: LerpLookupTable,
}

/**
 * An implementation of {@link UnsLNavConfig} parsed from an XML tag
 */
export class LNAvConfigBuilder extends ConfigBuilder<UnsLNavConfig> {
  private static readonly LNAV_INDEX_ATTR_NAME = 'index';
  private static readonly BANK_ANGLE_LIMITS_TAG_NAME = 'BankAngleLimits';

  protected readonly CONFIG_TAG_NAME = 'LNav';

  /** @inheritDoc */
  protected parseConfig(): UnsLNavConfig {
    return {
      index: ConfigParser.getIntegerAttrValue(
        this.configElement,
        LNAvConfigBuilder.LNAV_INDEX_ATTR_NAME,
        true,
      ),
      bankAngleLimits: ConfigParser.optional(
        () => ConfigParser.getChildLerpLookupTable(
          this.configElement,
          LNAvConfigBuilder.BANK_ANGLE_LIMITS_TAG_NAME,
        ),
        undefined,
      ),
    };
  }

  /** @inheritDoc */
  protected defaultConfig(): UnsLNavConfig {
    return {
      index: 0,
      bankAngleLimits: undefined,
    };
  }
}

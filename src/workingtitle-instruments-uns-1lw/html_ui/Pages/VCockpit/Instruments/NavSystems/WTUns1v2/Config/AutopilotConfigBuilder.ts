import { ConfigBuilder, ConfigParser } from '@microsoft/msfs-sdk';

/**
 * UNS-1 fake AP config
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UnsAutopilotConfig {
  // none
  /**
   * Whether to publish the lateral and vertical armed and active autopilot modes to LVars. Defaults to true.
   */
  publishModesAsLvar: boolean;
}

/**
 * Builder for {@link UnsAutopilotConfig}
 */
export class AutopilotConfigBuilder extends ConfigBuilder<UnsAutopilotConfig, false> {
  protected readonly CONFIG_TAG_NAME = 'Autopilot';
  protected readonly PUBLISH_LVAR_NAME = 'PublishFmaToLvar';

  /** @inheritDoc */
  parseConfig(): UnsAutopilotConfig {
    return {
      publishModesAsLvar: ConfigParser.optional(() => ConfigParser.getTextContent(
        ConfigParser.getChildElement(
          this.configElement,
          this.PUBLISH_LVAR_NAME,
        ),
      ).toLowerCase() === 'true', true),
    };
  }

  /** @inheritDoc */
  protected override defaultConfig(): UnsAutopilotConfig | undefined {
    return {
      publishModesAsLvar: true
    };
  }
}

import { ConfigBuilder, ConfigParser } from '@microsoft/msfs-sdk';

/** Artificial horizon style */
export type ArtificialHorizonStyle = 'Cropped' | 'Full';

/** Configuration object interface for the WT21 PFD */
export interface WT21PfdConfigInterface {
  /** Artificial horizon style */
  artificialHorizonStyle: Readonly<ArtificialHorizonStyle>
}

/** An implementation of {@link WT21PfdConfigInterface} parsed from an XML tag */
export class WT21PfdConfigBuilder extends ConfigBuilder<WT21PfdConfigInterface> {
  protected readonly CONFIG_TAG_NAME: string = 'PfdConfig';

  private static readonly ARTIFICIAL_HORIZON_STYLE_TAG_NAME = 'ArtificialHorizonStyle';

  /** @inheritDoc */
  protected parseConfig(): WT21PfdConfigInterface {
    return {
      artificialHorizonStyle: ConfigParser.getTextContent(ConfigParser.getChildElement(
        this.configElement,
        WT21PfdConfigBuilder.ARTIFICIAL_HORIZON_STYLE_TAG_NAME,
      )) as ArtificialHorizonStyle,
    };
  }

  /** @inheritDoc */
  protected defaultConfig(): WT21PfdConfigInterface {
    return {
      artificialHorizonStyle: 'Full',
    };
  }
}

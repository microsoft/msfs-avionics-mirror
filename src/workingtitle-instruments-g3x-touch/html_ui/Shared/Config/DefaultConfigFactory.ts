import { SpeedConfig } from './SpeedConfig';
import { Config, ConfigFactory } from './Config';
import { LookupTableConfig } from './LookupTableConfig';
import { NumericConstantConfig, NumericMaxConfig, NumericMinConfig } from './NumericConfig';

/**
 * A default implementation of {@link ConfigFactory}.
 */
export class DefaultConfigFactory implements ConfigFactory {
  private static readonly TAG_MAP: Record<string, new (element: Element, factory: ConfigFactory) => Config> = {
    'Number': NumericConstantConfig,
    'Min': NumericMinConfig,
    'Max': NumericMaxConfig,
    'LookupTable': LookupTableConfig,
    'Speed': SpeedConfig
  };

  /** @inheritdoc */
  public create(element: Element): Config | undefined {
    const ctor = DefaultConfigFactory.TAG_MAP[element.tagName];

    if (ctor === undefined) {
      return undefined;
    }

    return new ctor(element, this);
  }
}
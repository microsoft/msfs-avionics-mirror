import { ResolvableConfig } from '../Config/Config';
import { VSpeedDefinition, VSpeedValueKey } from './VSpeed';

/**
 * A configuration object which defines a reference V-speed.
 */
export class VSpeedConfig implements ResolvableConfig<VSpeedDefinition> {
  public readonly isResolvableConfig = true;

  /** The name of this config's reference V-speed. */
  public readonly name: string;

  /** The default value of this config's reference V-speed. */
  public readonly defaultValue: number | VSpeedValueKey;

  /**
   * Creates a new VSpeedConfig from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element) {
    if (element.tagName !== 'VSpeed') {
      throw new Error(`Invalid VSpeedConfig definition: expected tag name 'VSpeed' but was '${element.tagName}'`);
    }

    const name = element.getAttribute('name');
    if (name === null) {
      throw new Error('Invalid VSpeedConfig definition: undefined name');
    }
    this.name = name;

    const value = element.textContent;
    if (value === null) {
      throw new Error('Invalid VSpeedConfig definition: undefined value');
    }

    const numberValue = Number(value);
    if (!isNaN(numberValue)) {
      this.defaultValue = numberValue < 1 ? -1 : Math.round(numberValue);
    } else if (Object.values(VSpeedValueKey).includes(value as any)) {
      this.defaultValue = value as VSpeedValueKey;
    } else {
      throw new Error(`Invalid VSpeedConfig definition: unrecognized value ${value} (value must be a number or a valid reference speed key)`);
    }
  }

  /** @inheritdoc */
  public resolve(): VSpeedDefinition {
    return {
      name: this.name,
      defaultValue: typeof this.defaultValue === 'number'
        ? this.defaultValue
        : Math.round(Simplane.getDesignSpeeds()[this.defaultValue])
    };
  }
}
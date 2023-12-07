import { ResolvableConfig } from '../Config/Config';
import { VSpeedDefinition, VSpeedGroup } from './VSpeed';
import { VSpeedConfig } from './VSpeedConfig';

/**
 * A configuration object which defines an airspeed tape color range.
 */
export class VSpeedGroupConfig implements ResolvableConfig<VSpeedGroup> {
  /** @inheritdoc */
  public readonly isResolvableConfig = true;

  /** The name of the group defined by this configuration object. */
  public readonly name: string;

  /** The V-speeds included in the group defined by this configuration object. */
  public readonly vSpeedDefinitions: readonly VSpeedDefinition[];

  /**
   * Creates a new VSpeedGroupConfig from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element) {
    if (element.tagName !== 'Group') {
      throw new Error(`Invalid VSpeedGroupConfig definition: expected tag name 'Group' but was '${element.tagName}'`);
    }

    this.name = element.getAttribute('name') ?? '';

    const children = Array.from(element.querySelectorAll(':scope>VSpeed'));
    this.vSpeedDefinitions = children.map(child => {
      try {
        return new VSpeedConfig(child).resolve();
      } catch (e) {
        console.warn(e);
        return null;
      }
    }).filter(val => val !== null) as VSpeedDefinition[];
  }

  /** @inheritdoc */
  public resolve(): VSpeedGroup {
    return {
      name: this.name,
      vSpeedDefinitions: Array.from(this.vSpeedDefinitions)
    };
  }
}
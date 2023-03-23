import { VSpeedBugDefinition } from '@microsoft/msfs-garminsdk';
import { ResolvableConfig, VSpeedGroup, VSpeedGroupType } from '@microsoft/msfs-wtg3000-common';

/**
 * A configuration object which defines an airspeed reference V-speed bug.
 */
export class VSpeedBugConfig implements ResolvableConfig<(vSpeedGroups: ReadonlyMap<VSpeedGroupType, VSpeedGroup>) => VSpeedBugDefinition | undefined> {
  public readonly isResolvableConfig = true;

  /** The name of the reference V-speed associated with this config's speed bug. */
  public readonly name: string;

  /** The label of this config's speed bug. */
  public readonly label: string;

  /**
   * Creates a new VSpeedBugConfig from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element) {
    if (element.tagName !== 'Bug') {
      throw new Error(`Invalid VSpeedBugConfig definition: expected tag name 'Bug' but was '${element.tagName}'`);
    }

    const name = element.getAttribute('name');
    if (name === null) {
      throw new Error('Invalid VSpeedBugConfig definition: undefined name');
    }
    this.name = name;

    const label = element.getAttribute('label');
    if (label === null) {
      throw new Error('Invalid VSpeedBugConfig definition: undefined label');
    }
    this.label = label;
  }

  /** @inheritdoc */
  public resolve(): (vSpeedGroups: ReadonlyMap<VSpeedGroupType, VSpeedGroup>) => VSpeedBugDefinition | undefined {

    return (vSpeedGroups: ReadonlyMap<VSpeedGroupType, VSpeedGroup>): VSpeedBugDefinition | undefined => {
      for (const group of vSpeedGroups.values()) {
        if (group.vSpeedDefinitions.find(def => def.name === this.name)) {
          return {
            name: this.name,
            label: this.label,
            showOffscale: group.type !== VSpeedGroupType.Configuration,
            showLegend: group.type === VSpeedGroupType.Landing
          };
        }
      }

      return undefined;
    };
  }
}
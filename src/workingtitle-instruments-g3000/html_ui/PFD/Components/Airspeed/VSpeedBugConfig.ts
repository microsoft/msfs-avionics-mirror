import { VSpeedBugColor, VSpeedBugDefinition } from '@microsoft/msfs-garminsdk';

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

  /** The label text color of this config's speed bug. */
  public readonly labelColor: VSpeedBugColor;

  /**
   * Whether this config's speed bug's displayed label color should ignore whether its reference V-speed has been set
   * by FMS.
   */
  public readonly labelColorIgnoreFms: boolean;

  /**
   * Creates a new VSpeedBugConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element) {
    if (element.tagName !== 'Bug') {
      throw new Error(`Invalid VSpeedBugConfig definition: expected tag name 'Bug' but was '${element.tagName}'`);
    }

    const nameAttr = element.getAttribute('name');
    if (nameAttr === null) {
      throw new Error('Invalid VSpeedBugConfig definition: undefined name');
    }
    this.name = nameAttr;

    const labelAttr = element.getAttribute('label');
    if (labelAttr === null) {
      throw new Error('Invalid VSpeedBugConfig definition: undefined label');
    }
    this.label = labelAttr;

    const labelColorAttr = element.getAttribute('label-color');
    switch (labelColorAttr) {
      case VSpeedBugColor.Cyan:
      case VSpeedBugColor.White:
      case VSpeedBugColor.Green:
      case VSpeedBugColor.Red:
        this.labelColor = labelColorAttr;
        break;
      case null:
        this.labelColor = VSpeedBugColor.Cyan;
        break;
      default:
        console.warn('Invalid VSpeedBugConfig definition: unrecognized "label-color" option (must be "Cyan", "White", "Green", or "Red"). Defaulting to Cyan.');
        this.labelColor = VSpeedBugColor.Cyan;
    }

    const labelColorIgnoreFmsAttr = element.getAttribute('label-color-ignore-fms')?.toLowerCase();
    switch (labelColorIgnoreFmsAttr) {
      case 'true':
        this.labelColorIgnoreFms = true;
        break;
      case 'false':
      case undefined:
        this.labelColorIgnoreFms = false;
        break;
      default:
        console.warn('Invalid VSpeedBugConfig definition: unrecognized "label-color-ignore-fms" option (must be "true" or "false"). Defaulting to false.');
        this.labelColorIgnoreFms = false;
    }
  }

  /** @inheritDoc */
  public resolve(): (vSpeedGroups: ReadonlyMap<VSpeedGroupType, VSpeedGroup>) => VSpeedBugDefinition | undefined {

    return (vSpeedGroups: ReadonlyMap<VSpeedGroupType, VSpeedGroup>): VSpeedBugDefinition | undefined => {
      for (const group of vSpeedGroups.values()) {
        if (group.vSpeedDefinitions.find(def => def.name === this.name)) {
          return {
            name: this.name,
            label: this.label,
            labelColor: this.labelColor,
            labelColorIgnoreFms: this.labelColorIgnoreFms,
            showOffscale: group.type !== VSpeedGroupType.Configuration,
            showLegend: group.type === VSpeedGroupType.Landing
          };
        }
      }

      return undefined;
    };
  }
}

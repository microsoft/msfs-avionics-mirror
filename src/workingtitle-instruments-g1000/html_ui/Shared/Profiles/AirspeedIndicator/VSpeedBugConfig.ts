import { VSpeedBugDefinition } from '@microsoft/msfs-garminsdk';

import { ResolvableConfig } from '../../Config/Config';
import { VSpeedDefinition } from '../../VSpeed/VSpeed';

/**
 * A configuration object which defines an airspeed reference V-speed bug.
 */
export class VSpeedBugConfig implements ResolvableConfig<(vSpeedDefs: Iterable<VSpeedDefinition>) => VSpeedBugDefinition | undefined> {
  public readonly isResolvableConfig = true;

  /** The name of the reference V-speed associated with this config's speed bug. */
  public readonly name: string;

  /** The label of this config's speed bug. */
  public readonly label: string;

  /**
   * Creates a new VSpeedBugConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element);
  /**
   * Creates a new VSpeedBugConfig using a specified V-speed name and bug label.
   * @param name The name of the V-speed.
   * @param label The label of the V-speed bug.
   */
  public constructor(name: string, label: string);
  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(arg1: Element | string, arg2?: string) {
    if (typeof arg1 === 'object') {
      const element = arg1;

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
    } else {
      this.name = arg1;
      this.label = arg2 as string;
    }
  }

  /** @inheritdoc */
  public resolve(): (vSpeedDefs: Iterable<VSpeedDefinition>) => VSpeedBugDefinition | undefined {

    return (vSpeedDefs: Iterable<VSpeedDefinition>): VSpeedBugDefinition | undefined => {
      for (const def of vSpeedDefs) {
        if (def.name === this.name) {
          return {
            name: this.name,
            label: this.label,
            showOffscale: true,
            showLegend: false
          };
        }
      }

      return undefined;
    };
  }
}
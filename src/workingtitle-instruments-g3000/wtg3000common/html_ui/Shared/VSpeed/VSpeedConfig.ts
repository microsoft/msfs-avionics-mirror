import { ResolvableConfig } from '../Config/Config';
import { VSpeedDefinition, VSpeedValueKey } from './VSpeed';

/**
 * A configuration object which defines a reference V-speed.
 */
export class VSpeedConfig implements ResolvableConfig<VSpeedDefinition> {
  public readonly isResolvableConfig = true;

  /** The name of this config's reference V-speed. */
  public readonly name: string;

  /** The label to display for this config's reference V-speed. */
  public readonly label: string;

  /** The default value of this config's reference V-speed. */
  public readonly defaultValue: number | VSpeedValueKey;

  /** Whether this config's reference V-speed value can be edited by the user. */
  public readonly isEditable: boolean;

  /**
   * Creates a new VSpeedConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element) {
    if (element.tagName !== 'VSpeed') {
      throw new Error(`Invalid VSpeedConfig definition: expected tag name 'VSpeed' but was '${element.tagName}'`);
    }

    const nameAttr = element.getAttribute('name');
    if (nameAttr === null) {
      throw new Error('Invalid VSpeedConfig definition: undefined name');
    }
    this.name = nameAttr;

    const labelAttr = element.getAttribute('label');
    this.label = labelAttr ?? `V${this.name}`;

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

    const isEditableAttr = element.getAttribute('editable')?.toLowerCase();
    switch (isEditableAttr) {
      case 'true':
      case undefined:
        this.isEditable = true;
        break;
      case 'false':
        this.isEditable = false;
        break;
      default:
        console.warn('Invalid VSpeedConfig definition: unrecognized "editable" option (must be "true" or "false"). Defaulting to true.');
        this.isEditable = true;
    }
  }

  /** @inheritDoc */
  public resolve(): VSpeedDefinition {
    return {
      name: this.name,
      label: this.label,
      defaultValue: typeof this.defaultValue === 'number'
        ? this.defaultValue
        : Math.round(Simplane.getDesignSpeeds()[this.defaultValue]),
      isEditable: this.isEditable
    };
  }
}

import { NavDataFieldType, NavStatusBoxFieldType } from '@microsoft/msfs-garminsdk';
import { Config, ConfigFactory } from '@microsoft/msfs-wtg3000-common';

/**
 * A configuration object which defines navigation status box options.
 */
export class NavStatusBoxConfig implements Config {
  /** The type of the first data field. */
  public readonly field1: NavStatusBoxFieldType;

  /** The type of the second data field. */
  public readonly field2: NavStatusBoxFieldType;

  /**
   * Creates a new NavStatusBoxConfig from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   */
  constructor(element: Element | undefined, factory: ConfigFactory) {
    if (element === undefined) {
      this.field1 = NavDataFieldType.DistanceToWaypoint;
      this.field2 = NavDataFieldType.BearingToWaypoint;
    } else {
      if (element.tagName !== 'NavStatusBox') {
        throw new Error(`Invalid NavStatusBoxConfig definition: expected tag name 'NavStatusBox' but was '${element.tagName}'`);
      }

      const field1 = element.getAttribute('field-1')?.toUpperCase();
      switch (field1) {
        case NavDataFieldType.DistanceToWaypoint:
        case NavDataFieldType.BearingToWaypoint:
        case NavDataFieldType.TimeToWaypoint:
          this.field1 = field1;
          break;
        case undefined:
          break;
        default:
          console.warn('Invalid NavStatusBoxConfig definition: invalid field 1 option (must be DIS, BRG, or ETE)');
      }

      const field2 = element.getAttribute('field-2')?.toUpperCase();
      switch (field2) {
        case NavDataFieldType.DistanceToWaypoint:
        case NavDataFieldType.BearingToWaypoint:
        case NavDataFieldType.TimeToWaypoint:
          this.field2 = field2;
          break;
        case undefined:
          break;
        default:
          console.warn('Invalid NavStatusBoxConfig definition: invalid field 2 option (must be DIS, BRG, or ETE)');
      }

      const inheritFromId = element.getAttribute('inherit');
      const inheritFromElement = inheritFromId === null
        ? null
        : element.ownerDocument.querySelector(`NavStatusBox[id='${inheritFromId}']`);

      this.field1 ??= NavDataFieldType.DistanceToWaypoint;
      this.field2 ??= NavDataFieldType.BearingToWaypoint;

      this.inheritFrom(inheritFromElement, factory);
    }
  }

  /**
   * Inherits options from a parent configuration document element.
   * @param element A parent configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   */
  private inheritFrom(element: Element | null, factory: ConfigFactory): void {
    if (element === null) {
      return;
    }

    try {
      const parentConfig = new NavStatusBoxConfig(element, factory);

      (this.field1 as NavStatusBoxFieldType | undefined) ??= parentConfig.field1;
      (this.field2 as NavStatusBoxFieldType | undefined) ??= parentConfig.field2;
    } catch (e) {
      console.warn(e);
    }
  }
}
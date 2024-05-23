import { Config } from '../Config/Config';

/**
 * A configuration object which defines transponder options.
 */
export class TransponderConfig implements Config {

  /** Whether the user can select transponder modes through the G3X. */
  public readonly canSelectMode: boolean;

  /** Whether the transponder has a pilot-selectable GROUND mode. */
  public readonly hasSelectableGround: boolean;

  /**
   * Whether the sim's GROUND transponder mode state should be used to represent the transponder's GROUND mode. If
   * `false`, then the sim's ALT transponder mode state will be used to represent the transpodner's GROUND mode
   * instead.
   */
  public readonly useSimGroundMode: boolean;

  /** Whether the G3X should control automatic switching between GROUND and ALT mode for the transponder. */
  public readonly includeAutoGroundAlt: boolean;

  /**
   * Whether the G3X should control automatic switching from STBY to ALT mode for the transponder when transitioning
   * from on-ground to in-air.
   */
  public readonly includeAutoAirborne: boolean;

  /**
   * Creates a new TransponderConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element) {
    if (element.tagName !== 'Transponder') {
      throw new Error(`Invalid TransponderConfig definition: expected tag name 'Transponder' but was '${element.tagName}'`);
    }

    const canSelectModeAttr = element.getAttribute('can-select-mode')?.toLowerCase();
    switch (canSelectModeAttr) {
      case 'true':
        this.canSelectMode = true;
        break;
      case 'false':
      case undefined:
        this.canSelectMode = false;
        break;
      default:
        console.warn('Invalid TransponderConfig definition: unrecognized "can-select-mode" option (expected "true" or "false"). Defaulting to false.');
        this.canSelectMode = false;
    }

    const hasSelectableGroundAttr = element.getAttribute('selectable-ground')?.toLowerCase();
    switch (hasSelectableGroundAttr) {
      case 'true':
        this.hasSelectableGround = true;
        break;
      case 'false':
      case undefined:
        this.hasSelectableGround = false;
        break;
      default:
        console.warn('Invalid TransponderConfig definition: unrecognized "selectable-ground" option (expected "true" or "false"). Defaulting to false.');
        this.hasSelectableGround = false;
    }

    const supportAutoGroundAltAttr = element.getAttribute('auto-ground-alt')?.toLowerCase();
    switch (supportAutoGroundAltAttr) {
      case 'true':
        this.includeAutoGroundAlt = true;
        break;
      case 'false':
      case undefined:
        this.includeAutoGroundAlt = false;
        break;
      default:
        console.warn('Invalid TransponderConfig definition: unrecognized "auto-ground-alt" option (expected "true" or "false"). Defaulting to false.');
        this.includeAutoGroundAlt = false;
    }

    if (!this.hasSelectableGround) {
      const useSimGroundModeAttr = element.getAttribute('use-sim-ground')?.toLowerCase();
      switch (useSimGroundModeAttr) {
        case 'true':
        case undefined:
          this.useSimGroundMode = true;
          break;
        case 'false':
          this.useSimGroundMode = false;
          break;
        default:
          console.warn('Invalid TransponderConfig definition: unrecognized "use-sim-ground" option (expected "true" or "false"). Defaulting to true.');
          this.useSimGroundMode = true;
      }
    } else {
      this.useSimGroundMode = true;
    }

    const autoAirborneAttr = element.getAttribute('auto-airborne')?.toLowerCase();
    switch (autoAirborneAttr) {
      case 'true':
        this.includeAutoAirborne = true;
        break;
      case 'false':
      case undefined:
        this.includeAutoAirborne = false;
        break;
      default:
        console.warn('Invalid TransponderConfig definition: unrecognized "auto-airborne" option (expected "true" or "false"). Defaulting to false.');
        this.includeAutoAirborne = false;
    }
  }
}
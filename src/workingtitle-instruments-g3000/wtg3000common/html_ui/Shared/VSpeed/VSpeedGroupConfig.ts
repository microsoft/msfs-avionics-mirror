import { ResolvableConfig } from '../Config/Config';
import { VSpeedDefinition, VSpeedGroup, VSpeedGroupType } from './VSpeed';
import { VSpeedConfig } from './VSpeedConfig';

/**
 * A configuration object which defines an airspeed tape color range.
 */
export class VSpeedGroupConfig implements ResolvableConfig<VSpeedGroup> {
  /** @inheritdoc */
  public readonly isResolvableConfig = true;

  /** The type of V-speed group defined by this configuration object. */
  public readonly type: VSpeedGroupType;

  /** The V-speeds included in the group defined by this configuration object. */
  public readonly vSpeedDefinitions: readonly VSpeedDefinition[];

  /**
   * Whether to automatically remove takeoff V-speed bugs from the airspeed indicator when the airplane is configured
   * for approach. Configured for approach is defined as extending gear from a retracted state or extending flaps from
   * a fully retracted state while in the air. If not defined, then configuration for approach will not affect whether
   * takeoff V-speed bugs are automatically removed. If this configuration object does not define a takeoff V-speed
   * group, then this property is always undefined.
   */
  public readonly hideWhenConfiguredForApproach?: boolean;

  /**
   * The indicated airspeed, in knots, above which takeoff V-speed bugs will be automatically removed from the
   * airspeed indicator. If not defined, then indicated airspeed will not affect whether takeoff V-speed bugs are
   * automatically removed. If this configuration object does not define a takeoff V-speed group, then this property is
   * always undefined.
   */
  public readonly maxIas?: number;

  /**
   * The pressure altitude, in feet, above which configuration V-speed bugs will be automatically removed from the
   * airspeed indicator. If not defined, then pressure altitude will not affect whether configuration V-speed bugs are
   * automatically removed. If this configuration object does not define a configuration V-speed group, then this
   * property is always undefined.
   */
  public readonly maxAltitude?: number;

  /**
   * Creates a new VSpeedGroupConfig from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element) {
    if (element.tagName !== 'Group') {
      throw new Error(`Invalid VSpeedGroupConfig definition: expected tag name 'Group' but was '${element.tagName}'`);
    }

    const type = element.getAttribute('type');
    switch (type) {
      case VSpeedGroupType.General:
      case VSpeedGroupType.Takeoff:
      case VSpeedGroupType.Landing:
      case VSpeedGroupType.Configuration:
        this.type = type;
        break;
      default:
        throw new Error(`Invalid VSpeedGroupConfig definition: unrecognized type '${type}'`);
    }

    const children = Array.from(element.querySelectorAll(':scope>VSpeed'));
    this.vSpeedDefinitions = children.map(child => {
      try {
        return new VSpeedConfig(child).resolve();
      } catch (e) {
        console.warn(e);
        return null;
      }
    }).filter(val => val !== null) as VSpeedDefinition[];

    if (this.type === VSpeedGroupType.Takeoff) {
      const hideWhenConfiguredForApproachAttr = element.getAttribute('hide-when-appr-config')?.toLowerCase();
      switch (hideWhenConfiguredForApproachAttr) {
        case 'true':
        case undefined:
          this.hideWhenConfiguredForApproach = true;
          break;
        case 'false':
          this.hideWhenConfiguredForApproach = false;
          break;
        default:
          console.warn('Invalid VSpeedGroupConfig definition: unrecognized "hide-when-appr-config" option (must be "true" or "false"). Defaulting to true.');
          this.hideWhenConfiguredForApproach = true;
      }

      const maxIasAttr = element.getAttribute('max-ias');
      let maxIas: number | undefined = undefined;
      if (maxIasAttr !== null) {
        maxIas = Math.round(Number(maxIasAttr));
        if (!isFinite(maxIas) || maxIas <= 0) {
          console.warn('Invalid VSpeedGroupConfig definition: unrecognized "max-ias" option (must be a positive number). Discarding option.');
          maxIas = undefined;
        }
      }

      this.maxIas = maxIas;
    } else if (this.type === VSpeedGroupType.Configuration) {
      const maxAltitudeAttr = element.getAttribute('max-altitude');
      let maxAltitude: number | undefined = undefined;
      if (maxAltitudeAttr !== null) {
        maxAltitude = Math.round(Number(maxAltitudeAttr));
        if (!isFinite(maxAltitude) || maxAltitude <= 0) {
          console.warn('Invalid VSpeedGroupConfig definition: unrecognized "max-altitude" option (must be a positive number). Discarding option.');
          maxAltitude = undefined;
        }
      }

      this.maxAltitude = maxAltitude;
    }
  }

  /** @inheritdoc */
  public resolve(): VSpeedGroup {
    switch (this.type) {
      case VSpeedGroupType.Takeoff:
        return {
          type: this.type,
          vSpeedDefinitions: Array.from(this.vSpeedDefinitions),
          hideWhenConfiguredForApproach: this.hideWhenConfiguredForApproach ?? false,
          maxIas: this.maxIas
        };
      case VSpeedGroupType.Configuration:
        return {
          type: this.type,
          vSpeedDefinitions: Array.from(this.vSpeedDefinitions),
          maxAltitude: this.maxAltitude
        };
      default:
        return {
          type: this.type,
          vSpeedDefinitions: Array.from(this.vSpeedDefinitions)
        };
    }
  }
}

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
   * The indicated airspeed, in knots, above which takeoff V-speed bugs will be automatically removed from the
   * airspeed indicator. If not defined, then indicated airspeed will not affect whether takeoff V-speed bugs are
   * automatically removed. If this configuration object does not define a takeoff V-speed group, this property is
   * always undefined.
   */
  public readonly maxIas?: number;

  /**
   * The pressure altitude, in feet, above which configuration V-speed bugs will be automatically removed from the
   * airspeed indicator. If not defined, then pressure altitude will not affect whether configuration V-speed bugs are
   * automatically removed. If this configuration object does not define a configuration V-speed group, this property is
   * always undefined.
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
      const maxIasString = element.getAttribute('max-ias');
      let maxIas: number | undefined;

      if (maxIasString !== null) {
        maxIas = Math.round(Number(maxIasString));
        if (!isFinite(maxIas) || maxIas <= 0) {
          throw new Error('Invalid VSpeedGroupConfig definition: unrecognized max-ias value (must be a positive number)');
        }
      } else {
        maxIas = undefined;
      }

      this.maxIas = maxIas;
    } else if (this.type === VSpeedGroupType.Configuration) {
      const maxAltitudeString = element.getAttribute('max-altitude');
      let maxAltitude: number | undefined;

      if (maxAltitudeString !== null) {
        maxAltitude = Math.round(Number(maxAltitudeString));
        if (!isFinite(maxAltitude) || maxAltitude <= 0) {
          throw new Error('Invalid VSpeedGroupConfig definition: unrecognized max-altitude value (must be a positive number)');
        }
      } else {
        maxAltitude = undefined;
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
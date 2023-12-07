import { MappedSubject, MappedSubscribable, SubscribableUtils } from '@microsoft/msfs-sdk';

import { AirspeedDefinitionContext } from '@microsoft/msfs-garminsdk';

import { LookupTableConfig } from './LookupTableConfig';
import { NumericConfig } from './NumericConfig';
import { VSpeedValueKey } from '../VSpeed/VSpeed';

/**
 * Types of speed configs.
 */
export enum SpeedConfigType {
  Ias = 'Ias',
  Mach = 'Mach',
  Tas = 'Tas',
  Aoa = 'Aoa',
  Reference = 'Reference'
}

/**
 * A configuration object which defines a factory for an airspeed value presented as knots indicated airspeed.
 *
 * The airspeed value can be defined from a specific indicated airspeed, mach number, true airspeed, or angle-of-attack
 * value, from a one-dimensional lookup table of any of the previous value types keyed on pressure altitude, or from an
 * aircraft reference speed.
 */
export class SpeedConfig implements NumericConfig {
  public readonly isResolvableConfig = true;
  public readonly isNumericConfig = true;

  /** The type of this config. */
  public readonly type: SpeedConfigType;

  /** The value of this config. */
  public readonly value: number | LookupTableConfig | VSpeedValueKey;

  /**
   * Creates a new SpeedConfig from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element) {
    if (element.tagName !== 'Speed') {
      throw new Error(`Invalid SpeedConfig definition: expected tag name 'Speed' but was '${element.tagName}'`);
    }

    const type = element.getAttribute('type');
    switch (type) {
      case SpeedConfigType.Ias:
      case SpeedConfigType.Mach:
      case SpeedConfigType.Tas:
      case SpeedConfigType.Aoa:
      case SpeedConfigType.Reference:
        this.type = type;
        break;
      default:
        throw new Error(`Invalid SpeedConfig definition: unrecognized type '${type}'`);
    }

    if (this.type === SpeedConfigType.Reference) {
      const value = element.textContent;
      if (value === null) {
        throw new Error('Invalid SpeedConfig definition: undefined value');
      }

      if (Object.values(VSpeedValueKey).includes(value as any)) {
        this.value = value as VSpeedValueKey;
      } else {
        throw new Error(`Invalid SpeedConfig definition: unrecognized value ${value} (value must be a valid reference speed key)`);
      }
    } else {
      const lookupTable = element.querySelector(':scope>LookupTable');

      if (lookupTable !== null) {
        this.value = new LookupTableConfig(lookupTable);
      } else {
        const value = element.textContent;
        if (value === null) {
          throw new Error('Invalid SpeedConfig definition: undefined value');
        }

        const parsedValue = Number(value);
        if (isNaN(parsedValue)) {
          throw new Error('Invalid SpeedConfig definition: value was not a number or a lookup table');
        }

        this.value = parsedValue;
      }
    }
  }

  /** @inheritdoc */
  public resolve(): (context: AirspeedDefinitionContext) => number | MappedSubscribable<number> {
    switch (this.type) {
      case SpeedConfigType.Ias:
        return this.resolveIas();
      case SpeedConfigType.Mach:
        return this.resolveMach();
      case SpeedConfigType.Tas:
        return this.resolveTas();
      case SpeedConfigType.Aoa:
        return this.resolveAoa();
      case SpeedConfigType.Reference:
        return this.resolveReference();
    }
  }

  /**
   * Resolves this config as a factory for an airspeed value defined from indicated airspeed.
   * @returns A factory for an airspeed value defined from indicated airspeed.
   */
  private resolveIas(): (context: AirspeedDefinitionContext) => number | MappedSubscribable<number> {
    const value = this.value as number | LookupTableConfig;

    return (context: AirspeedDefinitionContext) => {
      if (typeof value === 'number') {
        return value;
      } else {
        const table = value.resolve();

        return context.pressureAlt.map(indicatedAlt => table.get(indicatedAlt));
      }
    };
  }

  /**
   * Resolves this config as a factory for an airspeed value defined from mach number.
   * @returns A factory for an airspeed value defined from mach number.
   */
  private resolveMach(): (context: AirspeedDefinitionContext) => number | MappedSubscribable<number> {
    const value = this.value as number | LookupTableConfig;

    return (context: AirspeedDefinitionContext) => {
      if (typeof value === 'number') {
        return context.machToKias.map(machToKias => machToKias * value);
      } else {
        const table = value.resolve();

        return MappedSubject.create(
          ([indicatedAlt, machToKias]): number => {
            return table.get(indicatedAlt) * machToKias;
          },
          context.pressureAlt,
          context.machToKias
        );
      }
    };
  }

  /**
   * Resolves this config as a factory for an airspeed value defined from true airspeed.
   * @returns A factory for an airspeed value defined from true airspeed.
   */
  private resolveTas(): (context: AirspeedDefinitionContext) => number | MappedSubscribable<number> {
    const value = this.value as number | LookupTableConfig;

    return (context: AirspeedDefinitionContext) => {
      if (typeof value === 'number') {
        return context.tasToIas.map(tasToIas => tasToIas * value);
      } else {
        const table = value.resolve();

        return MappedSubject.create(
          ([indicatedAlt, tasToIas]): number => {
            return table.get(indicatedAlt) * tasToIas;
          },
          context.pressureAlt,
          context.tasToIas
        );
      }
    };
  }

  /**
   * Resolves this config as a factory for an airspeed value defined from angle of attack.
   * @returns A factory for an airspeed value defined from angle of attack.
   */
  private resolveAoa(): (context: AirspeedDefinitionContext) => number | MappedSubscribable<number> {
    const value = this.value as number | LookupTableConfig;

    return (context: AirspeedDefinitionContext) => {
      if (typeof value === 'number') {
        return context.normAoaIasCoef.map((coef) => coef === null ? NaN : context.estimateIasFromNormAoa(value), SubscribableUtils.NUMERIC_NAN_EQUALITY);
      } else {
        const table = value.resolve();

        return MappedSubject.create(
          ([indicatedAlt, coef]): number => {
            return coef === null ? NaN : context.estimateIasFromNormAoa(table.get(indicatedAlt));
          },
          SubscribableUtils.NUMERIC_NAN_EQUALITY,
          context.pressureAlt,
          context.normAoaIasCoef
        );
      }
    };
  }

  /**
   * Resolves this config as a factory for an airspeed value defined from a reference speed.
   * @returns A factory for an airspeed value defined from a reference speed.
   */
  private resolveReference(): (context: AirspeedDefinitionContext) => number | MappedSubscribable<number> {
    const value = this.value as VSpeedValueKey;

    return () => {
      return Math.round(Simplane.getDesignSpeeds()[value]);
    };
  }
}
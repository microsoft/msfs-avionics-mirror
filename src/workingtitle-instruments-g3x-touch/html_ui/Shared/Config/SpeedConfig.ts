import { ConsumerSubject, MappedSubject, MappedSubscribable, SubscribableUtils } from '@microsoft/msfs-sdk';

import { AirspeedDefinitionContext } from '@microsoft/msfs-garminsdk';

import { LookupTableConfig } from './LookupTableConfig';
import { NumericConfig, NumericConfigResult } from './NumericConfig';
import { VSpeedValueKey } from '../VSpeed/VSpeed';

/**
 * Types of speed configs.
 */
export enum SpeedConfigType {
  Ias = 'Ias',
  Mach = 'Mach',
  Tas = 'Tas',
  Aoa = 'Aoa',
  Reference = 'Reference',
  Bus = 'Bus'
}

/**
 * A configuration object which defines a factory for an airspeed value presented as knots indicated airspeed.
 *
 * The airspeed value can be defined from a specific indicated airspeed, mach number, true airspeed, or angle-of-attack
 * value, from a one-dimensional lookup table of any of the previous value types keyed on pressure altitude, from an
 * aircraft reference speed, or from an arbitrary event bus topic.
 */
export class SpeedConfig implements NumericConfig {
  /** @inheritDoc */
  public readonly isResolvableConfig = true;

  /** @inheritDoc */
  public readonly isNumericConfig = true;

  /** The type of this config. */
  public readonly type: SpeedConfigType;

  /** The value of this config. */
  public readonly value: number | LookupTableConfig | VSpeedValueKey | string;

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
      case SpeedConfigType.Bus:
        this.type = type;
        break;
      default:
        throw new Error(`Invalid SpeedConfig definition: unrecognized type '${type}'`);
    }

    if (this.type === SpeedConfigType.Bus) {
      const value = element.textContent;
      if (value === null) {
        throw new Error('Invalid SpeedConfig definition: undefined value');
      }

      this.value = value;
    } else if (this.type === SpeedConfigType.Reference) {
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

  /** @inheritDoc */
  public resolve(): (context: AirspeedDefinitionContext) => NumericConfigResult {
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
      case SpeedConfigType.Bus:
        return this.resolveBus();
    }
  }

  /**
   * Resolves this config as a factory for an airspeed value defined from indicated airspeed.
   * @returns A factory for an airspeed value defined from indicated airspeed.
   */
  private resolveIas(): (context: AirspeedDefinitionContext) => NumericConfigResult {
    const value = this.value as number | LookupTableConfig;

    return (context: AirspeedDefinitionContext) => {
      if (typeof value === 'number') {
        return { value };
      } else {
        const table = value.resolve();
        const mappedValue = context.pressureAlt.map(pressureAlt => table.get(pressureAlt));

        return {
          value: mappedValue,

          destroy: () => {
            mappedValue.destroy();
          }
        };
      }
    };
  }

  /**
   * Resolves this config as a factory for an airspeed value defined from mach number.
   * @returns A factory for an airspeed value defined from mach number.
   */
  private resolveMach(): (context: AirspeedDefinitionContext) => NumericConfigResult {
    const value = this.value as number | LookupTableConfig;

    return (context: AirspeedDefinitionContext) => {
      let mappedValue: MappedSubscribable<number>;

      if (typeof value === 'number') {
        mappedValue = context.machToKias.map(machToKias => machToKias * value);
      } else {
        const table = value.resolve();

        mappedValue = MappedSubject.create(
          ([indicatedAlt, machToKias]): number => {
            return table.get(indicatedAlt) * machToKias;
          },
          context.pressureAlt,
          context.machToKias
        );
      }

      return {
        value: mappedValue,

        destroy: () => {
          mappedValue.destroy();
        }
      };
    };
  }

  /**
   * Resolves this config as a factory for an airspeed value defined from true airspeed.
   * @returns A factory for an airspeed value defined from true airspeed.
   */
  private resolveTas(): (context: AirspeedDefinitionContext) => NumericConfigResult {
    const value = this.value as number | LookupTableConfig;

    return (context: AirspeedDefinitionContext) => {
      let mappedValue: MappedSubscribable<number>;

      if (typeof value === 'number') {
        mappedValue = context.tasToIas.map(tasToIas => tasToIas * value);
      } else {
        const table = value.resolve();

        mappedValue = MappedSubject.create(
          ([indicatedAlt, tasToIas]): number => {
            return table.get(indicatedAlt) * tasToIas;
          },
          context.pressureAlt,
          context.tasToIas
        );
      }

      return {
        value: mappedValue,

        destroy: () => {
          mappedValue.destroy();
        }
      };
    };
  }

  /**
   * Resolves this config as a factory for an airspeed value defined from angle of attack.
   * @returns A factory for an airspeed value defined from angle of attack.
   */
  private resolveAoa(): (context: AirspeedDefinitionContext) => NumericConfigResult {
    const value = this.value as number | LookupTableConfig;

    return (context: AirspeedDefinitionContext) => {
      let mappedValue: MappedSubscribable<number>;

      if (typeof value === 'number') {
        mappedValue = context.normAoaIasCoef.map((coef) => coef === null ? NaN : context.estimateIasFromNormAoa(value), SubscribableUtils.NUMERIC_NAN_EQUALITY);
      } else {
        const table = value.resolve();

        mappedValue = MappedSubject.create(
          ([indicatedAlt, coef]): number => {
            return coef === null ? NaN : context.estimateIasFromNormAoa(table.get(indicatedAlt));
          },
          SubscribableUtils.NUMERIC_NAN_EQUALITY,
          context.pressureAlt,
          context.normAoaIasCoef
        );
      }

      return {
        value: mappedValue,

        destroy: () => {
          mappedValue.destroy();
        }
      };
    };
  }

  /**
   * Resolves this config as a factory for an airspeed value defined from a reference speed.
   * @returns A factory for an airspeed value defined from a reference speed.
   */
  private resolveReference(): (context: AirspeedDefinitionContext) => NumericConfigResult {
    const value = this.value as VSpeedValueKey;

    return () => {
      return { value: Math.round(Simplane.getDesignSpeeds()[value]) };
    };
  }

  /**
   * Resolves this config as a factory for an airspeed value defined from an event bus topic.
   * @returns A factory for an airspeed value defined from an event bus topic.
   */
  private resolveBus(): (context: AirspeedDefinitionContext) => NumericConfigResult {
    const value = this.value as string;

    return context => {
      const consumerValue = ConsumerSubject.create(context.bus.getSubscriber<any>().on(value), NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);

      return {
        value: consumerValue,

        destroy: () => {
          consumerValue.destroy();
        }
      };
    };
  }
}

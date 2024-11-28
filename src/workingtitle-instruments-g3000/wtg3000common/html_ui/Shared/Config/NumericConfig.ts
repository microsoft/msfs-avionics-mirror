import { ConsumerSubject, EventBus, MappedSubject, Subscribable, SubscribableUtils } from '@microsoft/msfs-sdk';

import { ConfigFactory, ResolvableConfig } from './Config';

/**
 * A result resolved from a {@link NumericConfig} that defines a numeric value.
 */
export interface NumericConfigResult {
  /** This result's numeric value. */
  readonly value: number | Subscribable<number>;

  /**
   * Destroys this result. This frees any resources used by this result and allows the result and its value to be
   * garbage collected if no external references to this result exist.
   */
  destroy?(): void;
}

/**
 * A configuration object which defines a factory for a numeric value.
 */
export interface NumericConfig extends ResolvableConfig<(context?: any) => NumericConfigResult> {
  /** Flags this object as a NumericConfig. */
  readonly isNumericConfig: true;
}

/**
 * A configuration object which defines a factory for a numeric constant.
 */
export class NumericConstantConfig implements NumericConfig {
  public readonly isResolvableConfig = true;
  public readonly isNumericConfig = true;

  /** The numeric value of this config. */
  public readonly value: number;

  /**
   * Creates a new NumericConstantConfig from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element) {
    if (element.tagName !== 'Number') {
      throw new Error(`Invalid NumericConstantConfig definition: expected tag name 'Number' but was '${element.tagName}'`);
    }

    const value = element.textContent;
    if (value === null) {
      throw new Error('Invalid NumericConstantConfig definition: undefined value');
    }

    const parsedValue = Number(value);
    if (isNaN(parsedValue)) {
      throw new Error('Invalid NumericConstantConfig definition: value was not a number');
    }

    this.value = parsedValue;
  }

  /** @inheritDoc */
  public resolve(): () => NumericConfigResult {
    return () => {
      return {
        value: this.value
      };
    };
  }
}

/**
 * A context for a factory resolved from {@link NumericBusConfig}.
 */
export interface NumericBusConfigContext {
  /** The event bus. */
  readonly bus: EventBus;
}

/**
 * A configuration object which defines a factory for a numeric value derived from an event bus topic.
 */
export class NumericBusConfig implements NumericConfig {
  public readonly isResolvableConfig = true;
  public readonly isNumericConfig = true;

  /** This config's event bus topic. */
  public readonly topic: string;

  /**
   * Creates a new NumericBusConfig from a configuration document element.
   * @param element A configuration document element.
   */
  public constructor(element: Element) {
    if (element.tagName !== 'Bus') {
      throw new Error(`Invalid NumericBusConfig definition: expected tag name 'Bus' but was '${element.tagName}'`);
    }

    const topic = element.textContent;
    if (topic === null) {
      throw new Error('Invalid NumericBusConfig definition: undefined value');
    }

    this.topic = topic;
  }

  /** @inheritDoc */
  public resolve(): (context: NumericBusConfigContext) => NumericConfigResult {
    return context => {
      const value = ConsumerSubject.create(context.bus.getSubscriber<any>().on(this.topic), NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);

      return {
        value,
        destroy: () => { value.destroy(); }
      };
    };
  }
}

/**
 * A configuration object which defines a factory for a numeric value which is the minimum of one or more inputs.
 */
export class NumericMinConfig implements NumericConfig {
  public readonly isResolvableConfig = true;
  public readonly isNumericConfig = true;

  /** The inputs of this config. */
  public readonly inputs: readonly NumericConfig[];

  /**
   * Creates a new NumericMinConfig from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   */
  constructor(element: Element, factory: ConfigFactory) {
    if (element.tagName !== 'Min') {
      throw new Error(`Invalid NumericMinConfig definition: expected tag name 'Min' but was '${element.tagName}'`);
    }

    const args = [];

    for (const child of element.children) {
      const config = factory.create(child);
      if (config !== undefined && 'isNumericConfig' in config) {
        args.push(config as NumericConfig);
      }
    }

    if (args.length === 0) {
      throw new Error('Invalid NumericMinConfig definition: found zero inputs (must have at least one)');
    }

    this.inputs = args;
  }

  /** @inheritDoc */
  public resolve(): (context?: any) => NumericConfigResult {
    return (context?: any): NumericConfigResult => {
      const resolvedArgs = this.inputs.map(arg => arg.resolve()(context));

      if (resolvedArgs.length === 1) {
        // If there is only one argument, then the minimum value is equal to the argument's value.
        return resolvedArgs[0];
      }

      const destroy = (): void => {
        for (const arg of resolvedArgs) {
          arg.destroy?.();
        }
      };

      if (resolvedArgs.some(arg => SubscribableUtils.isSubscribable(arg.value))) {
        // At least one argument has a subscribable value, so the minimum value must be a mapped subscribable.

        const numbers = resolvedArgs.filter(arg => typeof arg.value === 'number').map(arg => arg.value as number);
        const subscribableArgs = resolvedArgs.filter(arg => SubscribableUtils.isSubscribable(arg.value));
        const min = Math.min(...numbers);

        return {
          value: MappedSubject.create(
            args => {
              return Math.min(min, ...args);
            },
            SubscribableUtils.NUMERIC_NAN_EQUALITY,
            ...subscribableArgs.map(arg => arg.value as Subscribable<number>)
          ),
          destroy
        };
      } else {
        // None of the arguments has a subscribable value, so we can calculate the minimum value as a constant.

        return {
          value: Math.min(...resolvedArgs.map(arg => arg.value as number)),
          destroy
        };
      }
    };
  }
}

/**
 * A configuration object which defines a factory for a numeric value which is the maximum of one or more inputs.
 */
export class NumericMaxConfig implements NumericConfig {
  public readonly isResolvableConfig = true;
  public readonly isNumericConfig = true;

  /** The inputs of this config. */
  public readonly inputs: readonly NumericConfig[];

  /**
   * Creates a new NumericMaxConfig from a configuration document element.
   * @param element A configuration document element.
   * @param factory A configuration object factory to use to create child configuration objects.
   */
  constructor(element: Element, factory: ConfigFactory) {
    if (element.tagName !== 'Max') {
      throw new Error(`Invalid NumericMaxConfig definition: expected tag name 'Max' but was '${element.tagName}'`);
    }

    const args = [];

    for (const child of element.children) {
      const config = factory.create(child);
      if (config !== undefined && 'isNumericConfig' in config) {
        args.push(config as NumericConfig);
      }
    }

    if (args.length === 0) {
      throw new Error('Invalid NumericMaxConfig definition: found zero inputs (must have at least one)');
    }

    this.inputs = args;
  }

  /** @inheritDoc */
  public resolve(): (context?: any) => NumericConfigResult {
    return (context?: any): NumericConfigResult => {
      const resolvedArgs = this.inputs.map(arg => typeof arg === 'number' ? arg : arg.resolve()(context));

      if (resolvedArgs.length === 1) {
        // If there is only one argument, then the maximum value is equal to the argument's value.
        return resolvedArgs[0];
      }

      const destroy = (): void => {
        for (const arg of resolvedArgs) {
          arg.destroy?.();
        }
      };

      if (resolvedArgs.some(arg => SubscribableUtils.isSubscribable(arg.value))) {
        // At least one argument has a subscribable value, so the maximum value must be a mapped subscribable.

        const numbers = resolvedArgs.filter(arg => typeof arg.value === 'number').map(arg => arg.value as number);
        const subscribableArgs = resolvedArgs.filter(arg => SubscribableUtils.isSubscribable(arg.value));
        const max = Math.max(...numbers);

        return {
          value: MappedSubject.create(
            args => {
              return Math.max(max, ...args);
            },
            SubscribableUtils.NUMERIC_NAN_EQUALITY,
            ...subscribableArgs.map(arg => arg.value as Subscribable<number>)
          ),
          destroy
        };
      } else {
        // None of the arguments has a subscribable value, so we can calculate the maximum value as a constant.

        return {
          value: Math.max(...resolvedArgs.map(arg => arg.value as number)),
          destroy
        };
      }
    };
  }
}

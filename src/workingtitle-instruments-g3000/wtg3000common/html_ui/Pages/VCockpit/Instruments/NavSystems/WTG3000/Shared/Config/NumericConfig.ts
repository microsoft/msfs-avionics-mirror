import { MappedSubject, MappedSubscribable, MutableSubscribable, Subscription } from '@microsoft/msfs-sdk';

import { ConfigFactory, ResolvableConfig } from './Config';

/**
 * A configuration object which defines a factory for a numeric value.
 */
export interface NumericConfig extends ResolvableConfig<(context?: any) => number | MappedSubscribable<number>> {
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

  /** @inheritdoc */
  public resolve(): () => number {
    return () => this.value;
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

  /** @inheritdoc */
  public resolve(): (context?: any) => number | MappedSubscribable<number> {
    return (context?: any): number | MappedSubscribable<number> => {
      const resolvedArgs = this.inputs.map(arg => typeof arg === 'number' ? arg : arg.resolve()(context));

      if (resolvedArgs.some(arg => typeof arg === 'object')) {
        if (resolvedArgs.length === 1) {
          return resolvedArgs[0];
        } else {
          const numbers = resolvedArgs.filter(arg => typeof arg === 'number') as number[];
          const subscribables = resolvedArgs.filter(arg => typeof arg === 'object') as MappedSubscribable<number>[];
          const min = Math.min(...numbers, Number.POSITIVE_INFINITY);

          return new ChainedMappedSubscribable(
            MappedSubject.create(
              (args: readonly number[]): number => {
                return Math.min(min, ...args);
              },
              ...subscribables
            ),
            subscribables
          );
        }
      } else {
        return Math.min(...resolvedArgs as number[]);
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

  /** @inheritdoc */
  public resolve(): (context?: any) => number | MappedSubscribable<number> {
    return (context?: any): number | MappedSubscribable<number> => {
      const resolvedArgs = this.inputs.map(arg => typeof arg === 'number' ? arg : arg.resolve()(context));

      if (resolvedArgs.some(arg => typeof arg === 'object')) {
        if (resolvedArgs.length === 1) {
          return resolvedArgs[0];
        } else {
          const numbers = resolvedArgs.filter(arg => typeof arg === 'number') as number[];
          const subscribables = resolvedArgs.filter(arg => typeof arg === 'object') as MappedSubscribable<number>[];
          const max = Math.max(...numbers, Number.NEGATIVE_INFINITY);

          return new ChainedMappedSubscribable(
            MappedSubject.create(
              (args: readonly number[]): number => {
                return Math.max(max, ...args);
              },
              ...subscribables
            ),
            subscribables
          );
        }
      } else {
        return Math.max(...resolvedArgs as number[]);
      }
    };
  }
}

/**
 * A subscribable which wraps a mapped subscribable chained from another mapped subscribable. Pause/resume/destroy
 * operations on this subscribable are transferred to the source of the wrapped subscribable.
 */
class ChainedMappedSubscribable implements MappedSubscribable<number> {
  /** @inheritdoc */
  public readonly isSubscribable = true;


  /** @inheritdoc */
  public get isAlive(): boolean {
    return this.mapped.isAlive;
  }

  /** @inheritdoc */
  public get isPaused(): boolean {
    return this.mapped.isPaused;
  }

  /**
   * Constructor.
   * @param mapped The mapped subscribable wrapped by this chained subscribable.
   * @param sources The sources of this chained subscribable's wrapped subscribable.
   */
  constructor(
    private readonly mapped: MappedSubscribable<number>,
    private readonly sources: MappedSubscribable<number>[]
  ) {
  }

  /** @inheritdoc */
  public get(): number {
    return this.mapped.get();
  }

  /** @inheritdoc */
  public sub(handler: (value: number) => void, initialNotify?: boolean, paused?: boolean): Subscription {
    return this.mapped.sub(handler, initialNotify, paused);
  }

  /** @inheritdoc */
  public unsub(handler: (value: number) => void): void {
    this.mapped.unsub(handler);
  }

  /**
   * Maps this subscribable to a new subscribable.
   * @param fn The function to use to map to the new subscribable.
   * @param equalityFunc The function to use to check for equality between mapped values. Defaults to the strict
   * equality comparison (`===`).
   * @returns The mapped subscribable.
   */
  public map<M>(fn: (input: number, previousVal?: M) => M, equalityFunc?: ((a: M, b: M) => boolean)): MappedSubscribable<M>;
  /**
   * Maps this subscribable to a new subscribable with a persistent, cached value which is mutated when it changes.
   * @param fn The function to use to map to the new subscribable.
   * @param equalityFunc The function to use to check for equality between mapped values.
   * @param mutateFunc The function to use to change the value of the mapped subscribable.
   * @param initialVal The initial value of the mapped subscribable.
   * @returns The mapped subscribable.
   */
  public map<M>(
    fn: (input: number, previousVal?: M) => M,
    equalityFunc: (a: M, b: M) => boolean,
    mutateFunc: (oldVal: M, newVal: M) => void,
    initialVal: M
  ): MappedSubscribable<M>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public map<M>(
    fn: (input: number, previousVal?: M) => M,
    equalityFunc?: (a: M, b: M) => boolean,
    mutateFunc?: (oldVal: M, newVal: M) => void,
    initialVal?: M
  ): MappedSubscribable<M> {
    if (mutateFunc === undefined) {
      return this.mapped.map(fn, equalityFunc);
    } else {
      return this.mapped.map(fn, equalityFunc as (a: M, b: M) => boolean, mutateFunc, initialVal as M);
    }
  }

  /**
   * Subscribes to and pipes this subscribable's state to a mutable subscribable. Whenever an update of this
   * subscribable's state is received through the subscription, it will be used as an input to change the other
   * subscribable's state.
   * @param to The mutable subscribable to which to pipe this subscribable's state.
   * @param paused Whether the new subscription should be initialized as paused. Defaults to `false`.
   * @returns The new subscription.
   */
  public pipe(to: MutableSubscribable<any, number>, paused?: boolean): Subscription;
  /**
   * Subscribes to this subscribable's state and pipes a mapped version to a mutable subscribable. Whenever an update
   * of this subscribable's state is received through the subscription, it will be transformed by the specified mapping
   * function, and the transformed state will be used as an input to change the other subscribable's state.
   * @param to The mutable subscribable to which to pipe this subscribable's mapped state.
   * @param map The function to use to transform inputs.
   * @param paused Whether the new subscription should be initialized as paused. Defaults to `false`.
   * @returns The new subscription.
   */
  public pipe<M>(to: MutableSubscribable<any, M>, map: (fromVal: number, toVal: M) => M, paused?: boolean): Subscription;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public pipe<M>(to: MutableSubscribable<any, number> | MutableSubscribable<any, M>, arg2?: ((fromVal: number, toVal: M) => M) | boolean, arg3?: boolean): Subscription {
    if (typeof arg2 === 'function') {
      return this.mapped.pipe(to as MutableSubscribable<any, M>, arg2, arg3);
    } else {
      return this.mapped.pipe(to as MutableSubscribable<any, number>, arg2 as boolean | undefined);
    }
  }

  /** @inheritdoc */
  public pause(): this {
    this.mapped.pause();
    for (let i = 0; i < this.sources.length; i++) {
      this.sources[i].pause();
    }

    return this;
  }

  /** @inheritdoc */
  public resume(): this {
    for (let i = 0; i < this.sources.length; i++) {
      this.sources[i].resume();
    }
    this.mapped.resume();

    return this;
  }

  /** @inheritdoc */
  public destroy(): void {
    this.mapped.destroy();
    for (let i = 0; i < this.sources.length; i++) {
      this.sources[i].destroy();
    }
  }
}
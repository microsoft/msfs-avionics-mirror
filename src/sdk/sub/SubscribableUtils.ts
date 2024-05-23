import { Subject } from './Subject';
import { MutableSubscribable, Subscribable } from './Subscribable';
import { SubscribableSet } from './SubscribableSet';
import { Subscription } from './Subscription';

/**
 * Utility methods for working with Subscribables.
 */
export class SubscribableUtils {
  /**
   * A numeric equality function which returns `true` if and only if two numbers are strictly equal or if they are both
   * `NaN`.
   * @param a The first number to compare.
   * @param b The second number to compare.
   * @returns Whether the two numbers are strictly equal or both `NaN`.
   */
  public static readonly NUMERIC_NAN_EQUALITY = (a: number, b: number): boolean => a === b || (isNaN(a) && isNaN(b));

  /**
   * An equality function which returns false unconditionally.
   * @returns false unconditionally.
   */
  public static readonly NEVER_EQUALITY = (): false => false;

  /**
   * Checks if a query is a subscribable.
   * @param query A query.
   * @returns Whether the query is a subscribable.
   */
  public static isSubscribable<T = any>(query: unknown): query is Subscribable<T> {
    return typeof query === 'object' && query !== null && (query as any).isSubscribable === true;
  }

  /**
   * Checks if a query is a mutable subscribable.
   * @param query A query.
   * @returns Whether the query is a mutable subscribable.
   */
  public static isMutableSubscribable<T = any, I = T>(query: unknown): query is MutableSubscribable<T, I> {
    return typeof query === 'object' && query !== null && (query as any).isMutableSubscribable === true;
  }

  /**
   * Checks if a query is a subscribable set.
   * @param query A query.
   * @returns Whether the query is a subscribable set.
   */
  public static isSubscribableSet<T = any>(query: unknown): query is SubscribableSet<T> {
    return typeof query === 'object' && query !== null && (query as any).isSubscribableSet === true;
  }

  /**
   * Checks if a query is a mutable subscribable set.
   * @param query A query.
   * @returns Whether the query is a mutable subscribable set.
   */
  public static isMutableSubscribableSet<T = any>(query: unknown): query is SubscribableSet<T> {
    return typeof query === 'object' && query !== null && (query as any).isMutableSubscribableSet === true;
  }

  /**
   * Converts a value to a subscribable.
   *
   * If the `excludeSubscribables` argument is `true` and the value is already a subscribable, then the value is
   * returned unchanged. Otherwise, a new subscribable whose state is always equal to the value will be created and
   * returned.
   * @param value The value to convert to a subscribable.
   * @param excludeSubscribables Whether to return subscribable values as-is instead of wrapping them in another
   * subscribable.
   * @returns A subscribable.
   */
  public static toSubscribable<V, Exclude extends boolean>(
    value: V,
    excludeSubscribables: Exclude
  ): Exclude extends true ? (V extends Subscribable<any> ? V : Subscribable<V>) : Subscribable<V> {
    if (excludeSubscribables && SubscribableUtils.isSubscribable(value)) {
      return value as any;
    } else {
      return Subject.create(value) as any;
    }
  }

  /**
   * Subscribes to a source subscribable and pipes the state of a subscribable mapped from the source subscribable's
   * state to a target mutable subscribable. When the subscription is created, a pipe is established to the target
   * subscribable. Whenever an update of the source's state is received through the subscription, the input of the
   * pipe will be changed to a subscribable mapped from the new source state.
   * @param source The source subscribable from which to map subscribables whose states are piped to the target.
   * @param to The target subscribable.
   * @param sourceMap A function that maps source values to subscribables whose states are piped to the target.
   * @param paused Whether the new subscription should be initialized as paused. Defaults to `false`.
   * @returns The new subscription.
   */
  public static pipeMappedSource<S, T, U extends MutableSubscribable<any, T>>(
    source: Subscribable<S>,
    to: U,
    sourceMap: (source: S) => Subscribable<T>,
    paused?: boolean
  ): Subscription;
  /**
   * Subscribes to a source subscribable and pipes a transformed version of the state of a subscribable mapped from the
   * source subscribable's state to a target mutable subscribable. When the subscription is created, a pipe that
   * transforms inputs is established to the target subscribable. Whenever an update of the source's state is received
   * through the subscription, the input of the pipe will be changed to a subscribable mapped from the new source
   * state.
   * @param source The source subscribable from which to map subscribables whose states are piped to the target.
   * @param to The target subscribable.
   * @param sourceMap A function that maps source values to subscribables whose states are piped to the target.
   * @param pipeMap The function to use to transform pipe inputs.
   * @param paused Whether the new subscription should be initialized as paused. Defaults to `false`.
   * @returns The new subscription.
   */
  public static pipeMappedSource<S, M, T, U extends MutableSubscribable<any, T>>(
    source: Subscribable<S>,
    to: U,
    sourceMap: (source: S) => Subscribable<M>,
    pipeMap: (fromVal: M, toVal: T) => T,
    paused?: boolean
  ): Subscription;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static pipeMappedSource<S, M, T, U extends MutableSubscribable<any, T>>(
    source: Subscribable<S>,
    to: U,
    sourceMap: (source: S) => Subscribable<M>,
    arg4?: boolean | ((fromVal: M, toVal: T) => T),
    arg5?: boolean
  ): Subscription {
    let pipeMap: ((fromVal: M, toVal: T) => T) | undefined;
    let paused: boolean;
    if (typeof arg4 === 'function') {
      pipeMap = arg4;
      paused = arg5 ?? false;
    } else {
      paused = arg4 ?? false;
    }

    const sub = new MappedSourcePipe(source, to, undefined, sourceMap, pipeMap);

    if (!paused) {
      sub.resume(true);
    }

    return sub;
  }

  /**
   * Subscribes to a source subscribable and pipes the state of an optional subscribable mapped from the source
   * subscribable's state to a target mutable subscribable. When the subscription is created, a pipe is established
   * to the target subscribable. Whenever an update of the source's state is received through the subscription, the
   * input of the pipe will be changed to a subscribable mapped from the new source state. If the source state can't
   * be mapped to a subscribable, then a default value (if defined) is used to set the state of the target
   * subscribable.
   * @param source The source subscribable from which to map optional subscribables whose states are piped to the
   * target.
   * @param to The target subscribable.
   * @param onOrphaned A function that selects a default value to use to set the state of the target subscribable
   * when the source state can't be mapped to a subscribable. The current value of the target subscribable is passed
   * to the function. If not defined, then the target subscribable is left unchanged when the source state can't be
   * mapped to a subscribable.
   * @param sourceMap A function that maps source values to optional subscribables whose states are piped to the
   * target.
   * @param paused Whether the new subscription should be initialized as paused. Defaults to `false`.
   * @returns The new subscription.
   */
  public static pipeOptionalMappedSource<S, T, U extends MutableSubscribable<any, T>>(
    source: Subscribable<S>,
    to: U,
    onOrphaned: ((to: U) => void) | undefined,
    sourceMap: (source: S) => Subscribable<T> | undefined,
    paused?: boolean
  ): Subscription;
  /**
   * Subscribes to a source subscribable and pipes a transformed version of the state of a subscribable mapped from the
   * source subscribable's state to a target mutable subscribable. When the subscription is created, a pipe that
   * transforms inputs is established to the target subscribable. Whenever an update of the source's state is received
   * through the subscription, the input of the pipe will be changed to a subscribable mapped from the new source
   * state.
   * @param source The source subscribable from which to map optional subscribables whose states are piped to the
   * target.
   * @param to The target subscribable.
   * @param onOrphaned A function that selects a default value to use to set the state of the target subscribable
   * when the source state can't be mapped to a subscribable. The current value of the target subscribable is passed
   * to the function. The default value will _not_ be transformed by `pipeMap`. If not defined, then the target
   * subscribable is left unchanged when the source state can't be mapped to a subscribable.
   * @param sourceMap A function that maps source values to optional subscribables whose states are piped to the
   * target.
   * @param pipeMap The function to use to transform pipe inputs.
   * @param paused Whether the new subscription should be initialized as paused. Defaults to `false`.
   * @returns The new subscription.
   */
  public static pipeOptionalMappedSource<S, M, T, U extends MutableSubscribable<any, T>>(
    source: Subscribable<S>,
    to: U,
    onOrphaned: ((to: U) => void) | undefined,
    sourceMap: (source: S) => Subscribable<M> | undefined,
    pipeMap: (fromVal: M, toVal: T) => T,
    paused?: boolean
  ): Subscription;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static pipeOptionalMappedSource<S, M, T, U extends MutableSubscribable<any, T>>(
    source: Subscribable<S>,
    to: U,
    onOrphaned: ((to: U) => void) | undefined,
    sourceMap: (source: S) => Subscribable<M> | undefined,
    arg5?: boolean | ((fromVal: M, toVal: T) => T),
    arg6?: boolean
  ): Subscription {
    let pipeMap: ((fromVal: M, toVal: T) => T) | undefined;
    let paused: boolean;
    if (typeof arg5 === 'function') {
      pipeMap = arg5;
      paused = arg6 ?? false;
    } else {
      paused = arg5 ?? false;
    }

    const sub = new MappedSourcePipe(source, to, onOrphaned, sourceMap, pipeMap);

    if (!paused) {
      sub.resume(true);
    }

    return sub;
  }
}

/**
 * A pipe from an input subscribable that is mapped from a source subscribable to an output mutable subscribable. Each
 * notification received by the pipe from the source subscribable is used to change the pipe's input subscribable.
 */
class MappedSourcePipe<S, T, M, U extends MutableSubscribable<any, T>> implements Subscription {
  private _isAlive = true;
  /** @inheritDoc */
  public get isAlive(): boolean {
    return this._isAlive;
  }

  private _isPaused = true;
  /** @inheritDoc */
  public get isPaused(): boolean {
    return this._isPaused;
  }

  /** @inheritDoc */
  public readonly canInitialNotify = true;

  private pipe?: Subscription;
  private readonly sourceSub: Subscription;

  private isPipePaused = true;

  /**
   * Creates a new instance of MappedSourcePipe. The pipe is initialized as paused.
   * @param source The source of the pipe.
   * @param target The target of this pipe.
   * @param onOrphaned A function that selects a default value to use to set the state of the target subscribable
   * when the source state can't be mapped to a subscribable. The current value of the target subscribable is passed
   * to the function. The default value will _not_ be transformed by `pipeMap`. If not defined, then the target
   * subscribable is left unchanged when the source state can't be mapped to a subscribable.
   * @param sourceMap A function that maps source values to the pipe's input subscribables.
   * @param pipeMap A function that transforms this pipe's input values.
   */
  public constructor(
    source: Subscribable<S>,
    private readonly target: U,
    private readonly onOrphaned: ((to: U) => void) | undefined,
    private readonly sourceMap: (source: S) => Subscribable<M> | undefined,
    private readonly pipeMap?: (fromVal: M, toVal: T) => T,
  ) {
    this.sourceSub = source.sub(this.onSourceChanged.bind(this), false, true);
  }

  /**
   * Responds to when this pipe's source value changes.
   * @param source The new source value.
   */
  private onSourceChanged(source: S): void {
    this.pipe?.destroy();
    const mappedSource = this.sourceMap(source);

    if (mappedSource) {
      if (this.pipeMap) {
        this.pipe = mappedSource.pipe(this.target, this.pipeMap, this.isPipePaused);
      } else {
        this.pipe = (mappedSource as unknown as Subscribable<T>).pipe(this.target, this.isPipePaused);
      }
    } else {
      this.pipe = undefined;

      if (!this.isPipePaused && this.onOrphaned) {
        this.onOrphaned(this.target);
      }
    }
  }

  /** @inheritDoc */
  public pause(): this {
    if (!this._isAlive) {
      throw new Error('Subscription: cannot pause a dead Subscription.');
    }

    this._isPaused = true;
    this.isPipePaused = true;

    this.sourceSub.pause();
    this.pipe?.pause();

    return this;
  }

  /** @inheritDoc */
  public resume(initialNotify = false): this {
    if (!this._isAlive) {
      throw new Error('Subscription: cannot resume a dead Subscription.');
    }

    if (!this._isPaused) {
      return this;
    }

    this._isPaused = false;

    this.sourceSub.resume(true);

    this.isPipePaused = false;
    if (this.pipe) {
      this.pipe.resume(initialNotify);
    } else if (initialNotify && this.onOrphaned) {
      this.onOrphaned(this.target);
    }

    return this;
  }

  /** @inheritDoc */
  public destroy(): void {
    if (!this._isAlive) {
      return;
    }

    this._isAlive = false;

    this.sourceSub.destroy();
    this.pipe?.destroy();
    this.pipe = undefined;
  }
}

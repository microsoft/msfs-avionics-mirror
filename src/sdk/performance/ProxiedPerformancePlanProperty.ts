import { MutableSubscribable } from '../sub/Subscribable';
import { PerformancePlan } from './PerformancePlan';
import { PerformancePlanProxy } from './PerformancePlanProxy';
import { AbstractSubscribable } from '../sub/AbstractSubscribable';
import { Subject } from '../sub/Subject';
import { Subscription } from '../sub/Subscription';

/**
 * Maps a type to a record containing properties that extend `MutableSubscribable`
 */
type ExtractSubjectType<T> = {
  [k in keyof T]: T[k] extends MutableSubscribable<infer V> ? V : never;
}

/**
 * Maps a `K extends keyof PerformancePlanData` to the generic type of the `MutableSubscribable` present at PerformancePlanData[K]
 */
type ValueType<P extends PerformancePlan, K extends keyof P> = ExtractSubjectType<P>[K]

/**
 * Proxied `MutableSubscribable` that mirrors a property to be accessed by {@link PerformancePlanProxy}
 */
export class ProxiedPerformancePlanProperty<P extends PerformancePlan, K extends keyof P>
    extends AbstractSubscribable<ValueType<P, K>> implements MutableSubscribable<ValueType<P, K>> {
  public readonly isSubscribable = true;

  public readonly isMutableSubscribable = true;

  private targetPlan: P | null = null;

  private subject = Subject.create<ValueType<P, K>>(this.proxy.defaultValuesPlan[this.key].get());

  /**
   * Ctor
   *
   * @param proxy the proxy this property belongs to
   * @param key property key
   * @param differentiateBetweenFlightPlans whether the property, when edited, should be differentiated between flight plans
   */
  constructor(
    private readonly proxy: PerformancePlanProxy<P>,
    public readonly key: K,
    public readonly differentiateBetweenFlightPlans: boolean,
  ) {
    super();
  }

  private backSubjectSubscription: Subscription | undefined = undefined;

  /**
   * Switches the target plan
   *
   * @param plan the new target plan
   */
  public switchToPlan(plan: P): void {
    this.targetPlan = plan;

    this.backSubjectSubscription?.destroy();

    this.backSubjectSubscription = this.backingSubject().sub((it) => {
      this.subject.set(it);
    }, true);
  }

  /**
   * Returns the backing subject in the target plan for the property
   *
   * @returns the subject
   *
   * @throws if no target plan exists
   */
  private backingSubject(): MutableSubscribable<ValueType<P, K>> {
    if (!this.targetPlan) {
      throw new Error('No current target plan');
    }

    return this.targetPlan[this.key] as MutableSubscribable<ValueType<P, K>>;
  }

  /**
   * Resets the property to its default value according to the default values performance plan
   */
  public resetToDefault(): void {
    const defaultValue = this.proxy.defaultValuesPlan[this.key];

    this.proxy.onBeforeEdit(this as any, defaultValue);

    this.backingSubject().set((defaultValue as MutableSubscribable<ValueType<P, K>>).get());

    this.proxy.onAfterEdit(this as any, defaultValue);
  }

  /** @inheritDoc */
  public get(): ValueType<P, K> {
    if (!this.targetPlan) {
      throw new Error('No current target plan');
    }

    return this.backingSubject().get();
  }

  /** @inheritDoc */
  public set(value: ValueType<P, K>): void {
    if (!this.targetPlan) {
      throw new Error('No current target plan');
    }

    this.proxy.onBeforeEdit(this as any, value);

    this.backingSubject().set(value);

    this.proxy.onAfterEdit(this as any, value);
  }

  /** @inheritDoc */
  public sub(handler: (value: ValueType<P, K>) => void, initialNotify?: boolean, paused?: boolean): Subscription {
    return this.subject.sub(handler, initialNotify, paused);
  }

  /** @inheritDoc */
  public unsub(handler: (value: ValueType<P, K>) => void): void {
    return this.subject.unsub(handler);
  }
}

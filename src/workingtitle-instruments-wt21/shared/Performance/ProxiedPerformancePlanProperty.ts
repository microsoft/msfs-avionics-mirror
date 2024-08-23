import { AbstractSubscribable, MutableSubscribable, Subject, Subscription } from '@microsoft/msfs-sdk';

import { PerformancePlan } from './PerformancePlan';
import { PerformancePlanData } from './PerformancePlanData';
import { PerformancePlanProxy } from './PerformancePlanProxy';

/**
 * Maps a type to a record containing properties that extend `MutableSubscribable`
 */
type ExtractSubjectType<T> = {
  [k in keyof T]: T[k] extends MutableSubscribable<infer V> ? V : never;
}
/**
 * Maps a `K extends keyof PerformancePlanData` to the generic type of the `MutableSubscribable` present at PerformancePlanData[K]
 */
type ValueType<K extends keyof PerformancePlanData> = ExtractSubjectType<PerformancePlanData>[K]

/**
 * Proxied `MutableSubscribable` that mirrors a property desired to be accessed by {@link PerformancePlanProxy}
 */
export class ProxiedPerformancePlanProperty<K extends keyof PerformancePlanData> extends AbstractSubscribable<ValueType<K>> implements MutableSubscribable<ValueType<K> | null> {
  private targetPlan: PerformancePlan | null = null;

  public readonly isSubscribable = true;

  public readonly isMutableSubscribable = true;

  private subject = Subject.create<ValueType<K> | null>(null);

  /**
   * Ctor
   *
   * @param key property key
   * @param proxy the proxy this property belongs to
   * @param editInPlace whether the property can be edited without a new flight plan being created
   */
  constructor(
    public key: K,
    private readonly proxy: PerformancePlanProxy,
    readonly editInPlace = false,
  ) {
    super();
  }

  private backSubjectSubscription: Subscription | undefined = undefined;

  /**
   * Switches the target plan
   *
   * @param plan the new target plan
   */
  public switchToPlan(plan: PerformancePlan): void {
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
  private backingSubject(): MutableSubscribable<ValueType<K>> {
    if (!this.targetPlan) {
      throw new Error('No current target plan');
    }

    return this.targetPlan[this.key] as MutableSubscribable<ValueType<K>>;
  }

  /**
   * Resets the property to its default value according to the default values performance plan
   */
  public resetToDefault(): void {
    const defaultValue = this.proxy.defaultValuesPlan[this.key];

    this.proxy.onBeforeEdit(this as any, defaultValue);

    this.backingSubject().set((defaultValue as MutableSubscribable<ValueType<K>>).get());

    this.proxy.onAfterEdit(this as any, defaultValue);
  }

  /** @inheritDoc */
  public get(): ValueType<K> | null {
    if (!this.targetPlan) {
      return null;
    }

    return this.backingSubject().get();
  }

  /** @inheritDoc */
  public set(value: ValueType<K>): void {
    if (!this.targetPlan) {
      throw new Error('No current target plan');
    }

    this.proxy.onBeforeEdit(this as any, value);

    this.backingSubject().set(value);

    this.proxy.onAfterEdit(this as any, value);
  }

  /** @inheritDoc */
  public sub(handler: (value: ValueType<K>) => void, initialNotify?: boolean, paused?: boolean): Subscription {
    return this.subject.sub(handler, initialNotify, paused);
  }

  /** @inheritDoc */
  public unsub(handler: (value: ValueType<K>) => void): void {
    return this.subject.unsub(handler);
  }

}
import { PerformancePlan } from './PerformancePlan';
import { ProxiedPerformancePlanProperty } from './ProxiedPerformancePlanProperty';

/**
 * Callbacks of a {@link PerformancePlanProxy} object
 */
export interface PerformancePlanProxyCallbacks<P extends PerformancePlan> {
  onBeforeEdit(property: ProxiedPerformancePlanProperty<P, keyof P>, newValue: any): void,

  onAfterEdit(property: ProxiedPerformancePlanProperty<P, keyof P>, newValue: any): void,
}

/**
 * Proxy for accessing the performance plan data for the currently used flight plan.
 *
 * This exposes all mutable subscribables defined in {@link PerformancePlan}, but allows "switching" the backing performance plan
 * that the mutable subscribables reflect.
 *
 * This is useful to tie CDU pages and CDU components to the relevant mutable subscribables without having to manually switch them around
 * depending on MOD/ACT, for example.
 */
export type PerformancePlanProxy<P extends PerformancePlan> = P & { [k in keyof P]: ProxiedPerformancePlanProperty<P, k> } & PerformancePlanProxyCallbacks<P> & {
  /**
   * Performance plan data for default values (used to reset properties)
   */
  defaultValuesPlan: P;

  /**
   * Switches the proxy to another performance plan
   *
   * @param plan the performance plan to switch to
   * @param initial whether this is the initial setting of the backing performance plan
   */
  switchToPlan(plan: P, initial: boolean): void;
}

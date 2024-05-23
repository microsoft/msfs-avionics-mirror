import { PerformancePlan } from './PerformancePlan';
import { MutableSubscribable } from '../sub/Subscribable';

/**
 * A definition for a performance plan key
 */
export interface PerformancePlanDefinition<U> {
  /**
   * Whether to differentiate the value between ACT and MOD plans. Defaults to false
   */
  differentiateBetweenFlightPlans?: boolean,

  /**
   * The default value for the property to take
   */
  defaultValue: U,
}

/**
 * An object containing definitions for each of a performance plan type's properties
 */
export type PerformancePlanDefinitionObject<P extends PerformancePlan> = {
  [k in keyof P]: PerformancePlanDefinition<P[k] extends MutableSubscribable<infer U> ? U : never>
}

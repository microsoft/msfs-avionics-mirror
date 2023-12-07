import { Subscribable } from '@microsoft/msfs-sdk';

/**
 * A data model for a navigation data field.
 */
export interface NavDataFieldModel<T> {
  /** A subscribable which provides this model's value. */
  readonly value: Subscribable<T>;
}

/**
 * Utility type to get the value type from a NavDataFieldModel type.
 */
export type TypeOfNavDataFieldModel<M extends NavDataFieldModel<any>> = M extends NavDataFieldModel<infer T> ? T : never;

/**
 * An enum describing the validity of the GPS data being provided to nav data field models.
 */
export enum NavDataFieldGpsValidity {
  Invalid,
  DeadReckoning,
  Valid
}
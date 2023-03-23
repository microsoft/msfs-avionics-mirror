import { Subscribable } from '@microsoft/msfs-sdk';

/**
 * A data model for a navigation data field.
 */
export interface NavDataFieldModel<T> {
  /** A subscribable which provides this model's value. */
  readonly value: Subscribable<T>;
}

/**
 * An enum describing the validity of the GPS data being provided to nav data field models.
 */
export enum NavDataFieldGpsValidity {
  Invalid,
  DeadReckoning,
  Valid
}
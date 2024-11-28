import { Subscribable } from '@microsoft/msfs-sdk';

/**
 * A definition for an indicated airspeed value.
 */
export interface AirspeedDefinition {
  /** This definition's airspeed value, in knots. */
  readonly value: number | Subscribable<number>;

  /**
   * Destroys this definition, freeing up any resources it is using and allowing it to be garbage collected if no
   * external references to it exist.
   */
  destroy?(): void;
}

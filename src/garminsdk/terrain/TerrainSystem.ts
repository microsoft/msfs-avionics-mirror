import { TerrainSystemModule } from './TerrainSystemModule';

/**
 * A Garmin terrain alerting system.
 */
export interface TerrainSystem {
  /** This system's ID. */
  readonly id: string;

  /** This system's type. */
  readonly type: string;

  /**
   * Adds a module to this system.
   * @param module The module to add.
   */
  addModule(module: TerrainSystemModule): void;

  /**
   * Initializes this system. Once the system is initialized, it can begin updating its internal state and issuing
   * alerts and will publish its state to the event bus.
   */
  init(): void;

  /**
   * Turns this system on.
   */
  turnOn(): void;

  /**
   * Turns this system off.
   */
  turnOff(): void;

  /**
   * Begins a self-test of this system.
   */
  startTest(): void;

  /**
   * Adds an inhibit flag to this system.
   * @param inhibit The flag to add.
   */
  addInhibit(inhibit: string): void;

  /**
   * Removes an inhibit flag from this system.
   * @param inhibit The flag to remove.
   */
  removeInhibit(inhibit: string): void;

  /**
   * Removes all inhibit flags from this system.
   */
  removeAllInhibits(): void;

  /**
   * Updates this system.
   */
  update(): void;

  /**
   * Destroys this system. Once destroyed, this system can no longer be updated.
   */
  destroy(): void;
}

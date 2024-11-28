import { BaseLNavEvents } from './LNavEvents';
import { LNavAircraftState, LNavState, LNavSteerCommand } from './LNavTypes';

/**
 * A publisher of an LNAV event bus topic.
 */
export interface LNavEventBusTopicPublisher<T extends keyof BaseLNavEvents> {
  /** The topic name to which this publisher publishes. */
  readonly topic: T | `${T}_${number}`;

  /** The value of this publisher's topic data. */
  readonly value: BaseLNavEvents[T];

  /**
   * Publishes a value to this publisher's topic. The value will be published if and only if it is not equal to this
   * publisher's existing value or if a republish is requested.
   * @param value The value to publish to the topic. If not defined, then the current value will be republished.
   */
  publish(value?: BaseLNavEvents[T]): void;
}

/**
 * A record of LNAV event bus topic publishers, keyed by base topic name.
 */
export type LNavEventBusTopicPublisherRecord = {
  [P in keyof Omit<BaseLNavEvents, 'lnav_is_awaiting_calc'>]: LNavEventBusTopicPublisher<P>;
};

/**
 * A module that can optionally override an LNAV computer's default tracking behavior.
 */
export interface LNavOverrideModule {
  /**
   * Gets this module's generated steering command.
   * @returns This module's generated steering command.
   */
  getSteerCommand(): Readonly<LNavSteerCommand>;

  /**
   * Checks whether this module is active.
   * @returns Whether this module is active.
   */
  isActive(): boolean;

  /**
   * Checks whether this module can be activated.
   * @param lnavState The current LNAV state.
   * @param aircraftState The current state of the airplane.
   */
  canActivate(lnavState: LNavState, aircraftState: Readonly<LNavAircraftState>): boolean;

  /**
   * Activates this module. When this module is activated, it is responsible for generating steering commands and
   * publishing LNAV data to the event bus.
   * @param lnavState The current LNAV state.
   * @param aircraftState The current state of the airplane.
   * @param eventBusTopicRecord A record of publishers to use to publish data to LNAV event bus topics.
   */
  activate(lnavState: LNavState, aircraftState: Readonly<LNavAircraftState>, eventBusTopicRecord: LNavEventBusTopicPublisherRecord): void;

  /**
   * Deactivates this module. When this module is deactivated, it is no longer responsible for generating steering
   * commands or publishing LNAV data to the event bus.
   * @param lnavState The current LNAV state.
   */
  deactivate(lnavState: LNavState): void;

  /**
   * Updates this module.
   * @param lnavState The current LNAV state.
   * @param aircraftState The current state of the airplane.
   * @param eventBusTopicRecord A record of publishers to use to publish data to LNAV event bus topics. The record is
   * only provided when the module is active.
   */
  update(lnavState: LNavState, aircraftState: Readonly<LNavAircraftState>, eventBusTopicRecord?: LNavEventBusTopicPublisherRecord): void;
}
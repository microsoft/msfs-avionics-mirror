import { Subscribable } from '@microsoft/msfs-sdk';

import { UiInteractionHandler } from './UiInteraction';
import type { UiFocusController } from './UiFocusController';

/**
 * Directions from which a UI component can be focused.
 */
export enum UiFocusDirection {
  Unspecified = 'Unspecified',
  Forward = 'Forward',
  Backward = 'Backward',
  Recent = 'Recent'
}

/**
 * A UI component that can be focused.
 */
export interface UiFocusableComponent extends UiInteractionHandler {
  /** Flags this component as a UiFocusableComponent. */
  readonly isUiFocusableComponent: true;

  /** Whether this component can be focused. */
  readonly canBeFocused: Subscribable<boolean>;

  /**
   * Responds to when this component is registered with a controller.
   * @param controller The controller with which this component was registered.
   */
  onRegistered(controller: UiFocusController): void;

  /**
   * Responds to when this component is deregistered with a controller.
   * @param controller The controller with which this component was deregistered.
   */
  onDeregistered(controller: UiFocusController): void;

  /**
   * Responds to when this component gains focus.
   * @param direction The direction from which focus was gained.
   */
  onFocusGained(direction: UiFocusDirection): void;

  /**
   * Responds to when this component loses focus.
   */
  onFocusLost(): void;
}
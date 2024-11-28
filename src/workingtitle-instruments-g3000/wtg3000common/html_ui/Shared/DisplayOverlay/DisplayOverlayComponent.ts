import { DisplayComponent } from '@microsoft/msfs-sdk';

/**
 * A display component that is rendered into a display overlay layer.
 */
export interface DisplayOverlayComponent extends DisplayComponent<any> {
  /** Flags this component as a display overlay component. */
  readonly isDisplayOverlayComponent: true;

  /**
   * A method that is called when this component's parent overlay layer is made visible.
   */
  onWake(): void;

  /**
   * A method that is called when this component's parent overlay layer is hidden.
   */
  onSleep(): void;

  /**
   * A method that is called when this component receives an interaction event.
   * @param event The interaction event.
   * @returns Whether the interaction event was handled.
   */
  onInteractionEvent(event: string): boolean;
}

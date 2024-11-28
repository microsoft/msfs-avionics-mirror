import { DisplayOverlayComponent } from '@microsoft/msfs-wtg3000-common';

/**
 * A display component that is rendered into a PFD display overlay layer.
 */
export interface PfdDisplayOverlayComponent extends DisplayOverlayComponent {
  /** Flags this component as a PFD display overlay component. */
  readonly isPfdDisplayOverlayComponent: true;
}

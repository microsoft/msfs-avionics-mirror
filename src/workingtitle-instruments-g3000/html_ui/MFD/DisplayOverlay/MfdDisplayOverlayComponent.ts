import { DisplayOverlayComponent } from '@microsoft/msfs-wtg3000-common';

/**
 * A display component that is rendered into an MFD display overlay layer.
 */
export interface MfdDisplayOverlayComponent extends DisplayOverlayComponent {
  /** Flags this component as an MFD display overlay component. */
  readonly isMfdDisplayOverlayComponent: true;
}

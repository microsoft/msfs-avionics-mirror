import { MutableSubscribable } from '@microsoft/msfs-sdk';

/**
 * A controller for the display overlay layer on a G3000 GDU or GTC.
 */
export interface DisplayOverlayController {
  /** Whether to show the display's overlay. */
  readonly showOverlay: MutableSubscribable<boolean>;

  /** Whether to hide the display's main content. */
  readonly hideMainContent: MutableSubscribable<boolean>;
}

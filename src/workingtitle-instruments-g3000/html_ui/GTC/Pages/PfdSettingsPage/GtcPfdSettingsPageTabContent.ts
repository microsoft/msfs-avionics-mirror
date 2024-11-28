import { DisplayComponent } from '@microsoft/msfs-sdk';
import { GtcInteractionHandler } from '../../GtcService/GtcInteractionEvent';

/**
 * A content component for a GTC PFD settings page tab.
 */
export interface GtcPfdSettingsPageTabContent extends DisplayComponent<any>, GtcInteractionHandler {
  /** A method which is called when this component's parent tab is paused. */
  onPause(): void;

  /** A method which is called when this component's parent tab is resumed. */
  onResume(): void;
}
import { DisplayComponent } from '@microsoft/msfs-sdk';

/**
 * A panel for the weight and balance pane.
 */
export interface WeightBalancePaneViewPanel extends DisplayComponent<any> {
  /**
   * A method which is called when this panel is resumed. The panel is resumed when it is un-hidden and immediately
   * after it is resized.
   * @param isPaneInFullMode Whether this panel's parent pane is in Full display mode.
   */
  onResume(isPaneInFullMode: boolean): void;

  /**
   * A method which is called when this panel is paused. The panel is paused when it is hidden and immediately before
   * it is resized.
   */
  onPause(): void;

  /**
   * A method which is called when this panel is paused. The panel is paused when it is hidden and immediately before
   * it is resized.
   * @param time The current real (operating system) time, as a Javascript timestamp.
   */
  onUpdate(time: number): void;
}
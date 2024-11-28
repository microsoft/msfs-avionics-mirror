import { ComponentProps, DisplayComponent, ReadonlyFloat64Array } from '@microsoft/msfs-sdk';
import { UiPaneSizeMode } from './UiPaneTypes';

/**
 * Content rendered inside a UI pane.
 */
export interface UiPaneContent<P extends ComponentProps = ComponentProps> extends DisplayComponent<P> {
  /** Flags this component as a UiPaneContent. */
  readonly isUiPaneContent: true;

  /**
   * Responds to when this content is initially rendered to its parent pane.
   * @param sizeMode The size mode of this content's parent pane.
   * @param dimensions The dimensions of this content's parent pane, as `[width, height]` in pixels.
   */
  onInit(sizeMode: UiPaneSizeMode, dimensions: ReadonlyFloat64Array): void;

  /**
   * Responds to when this content's parent pane is made visible and awake.
   * @param sizeMode The size mode of this content's parent pane.
   * @param dimensions The dimensions of this content's parent pane, as `[width, height]` in pixels.
   */
  onResume(sizeMode: UiPaneSizeMode, dimensions: ReadonlyFloat64Array): void;

  /**
   * Responds to when this content's parent pane is made either hidden or asleep.
   */
  onPause(): void;

  /**
   * Responds when this content's parent pane is resized while it is visible and awake.
   * @param sizeMode The new size mode of this content's pane.
   * @param dimensions The new dimensions of this content's pane, as `[width, height]` in pixels.
   */
  onResize(sizeMode: UiPaneSizeMode, dimensions: ReadonlyFloat64Array): void;

  /**
   * Called every update cycle.
   * @param time The current real (operating system) time, as a Javascript timestamp.
   */
  onUpdate(time: number): void;
}
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ComponentProps, DisplayComponent } from '@microsoft/msfs-sdk';

import { DisplayPaneIndex, DisplayPaneSizeMode } from './DisplayPaneTypes';
import { DisplayPaneUtils } from './DisplayPaneUtils';

/** Properties of DisplayPaneInsetView */
export interface DisplayPaneInsetViewProps extends ComponentProps {
  /** The index of the view's parent pane. */
  index: DisplayPaneIndex;
}

/** A DisplayPaneInsetView component */
export abstract class DisplayPaneInsetView<P extends DisplayPaneInsetViewProps = DisplayPaneInsetViewProps> extends DisplayComponent<P> {
  public readonly isPfd = DisplayPaneUtils.isPfdDisplayPaneIndex(this.props.index);

  /**
   * Called when this view is made visible.
   * @param size The size of this view's parent pane.
   * @param width The width of this view's parent pane, in pixels.
   * @param height The height of this view's parent pane, in pixels.
   */
  public onResume(size: DisplayPaneSizeMode, width: number, height: number): void {
    // noop
  }

  /**
   * Called when this view is hidden.
   */
  public onPause(): void {
    // noop
  }

  /**
   * Called when this view's parent pane is resized while this view is visible.
   * @param size The size of this view's parent pane.
   * @param width The width of this view's parent pane, in pixels.
   * @param height The height of this view's parent pane, in pixels.
   */
  public onResize(size: DisplayPaneSizeMode, width: number, height: number): void {
    // noop
  }

  /**
   * Called every update cycle.
   * @param time The current real (operating system) time, as a UNIX timestamp in milliseconds.
   */
  public onUpdate(time: number): void {
    // noop
  }

  /**
   * Cleans up subscriptions.
   */
  public destroy(): void {
    // noop
  }
}

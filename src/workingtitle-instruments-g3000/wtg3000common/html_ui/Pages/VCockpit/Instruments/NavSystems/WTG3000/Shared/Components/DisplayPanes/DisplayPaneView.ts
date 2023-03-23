/* eslint-disable @typescript-eslint/no-unused-vars */
import { ComponentProps, DisplayComponent, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { DisplayPaneIndex, DisplayPaneSizeMode } from './DisplayPaneTypes';
import { DisplayPaneUtils } from './DisplayPaneUtils';
import { DisplayPaneViewEvent } from './DisplayPaneViewEvents';

/** Properties of DisplayPaneView */
export interface DisplayPaneViewProps extends ComponentProps {
  /** The index of the view's parent pane. */
  index: DisplayPaneIndex;

  /** Whether the view can only be displayed in half-size panes. */
  halfSizeOnly?: boolean;
}

/** A DisplayPaneView component */
export abstract class DisplayPaneView<P extends DisplayPaneViewProps = DisplayPaneViewProps, E extends DisplayPaneViewEvent<any> = DisplayPaneViewEvent>
  extends DisplayComponent<P> {

  protected readonly _title = Subject.create<string | VNode>('');
  /** The title of this display pane view. */
  public readonly title = this._title as Subscribable<string | VNode>;

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
   * Called when a display pane view event is received by this view.
   * @param event The event.
   */
  public onEvent(event: E): void {
    // noop
  }
}

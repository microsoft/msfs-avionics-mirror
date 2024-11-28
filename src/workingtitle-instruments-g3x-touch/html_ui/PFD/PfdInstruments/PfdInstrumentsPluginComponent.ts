import { DisplayComponent, ReadonlyFloat64Array } from '@microsoft/msfs-sdk';

import { UiViewOcclusionType, UiViewSizeMode } from '../../Shared/UiSystem/UiViewTypes';

/**
 * A display component that is rendered by a plugin into a PFD instruments view.
 */
export interface PfdInstrumentsPluginComponent extends DisplayComponent<any> {
  /** Flags this component as a PFD instruments plugin component. */
  readonly isPfdInstrumentsPluginComponent: true;

  /**
   * Responds to when this component's parent view is opened.
   * @param sizeMode The new size mode of the view's container.
   * @param dimensions The new dimensions of the view's container, as `[width, height]` in pixels.
   */
  onOpen(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void;

  /**
   * Responds to when this component's parent view is closed.
   */
  onClose(): void;

  /**
   * Responds to when this component's parent view is resumed.
   */
  onResume(): void;

  /**
   * Responds to when this component's parent view is paused.
   */
  onPause(): void;

  /**
   * Responds when this component's parent view's container is resized while it is open.
   * @param sizeMode The new size mode of the view's container.
   * @param dimensions The new dimensions of the view's container, as `[width, height]` in pixels.
   */
  onResize(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void;

  /**
   * Responds to when the occlusion type applied to this component's parent view changes while the view is open.
   * @param occlusionType The new occlusion type applied to the view.
   */
  onOcclusionChange(occlusionType: UiViewOcclusionType): void;

  /**
   * Called every update cycle.
   * @param time The current real (operating system) time, as a Javascript timestamp.
   */
  onUpdate(time: number): void;
}

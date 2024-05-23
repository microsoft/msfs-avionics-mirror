import { NodeReference, ReadonlyFloat64Array, ReadonlySubEvent, VNode } from '@microsoft/msfs-sdk';
import { UiViewSizeMode, UiViewStackLayer } from './UiViewTypes';

/**
 * A container for displaying rendered UI views.
 */
export interface UiViewStackContainer {
  /** A reference to this container's root element. */
  readonly rootRef: NodeReference<HTMLElement>;

  /** An event that fires when the size of this container changes. */
  readonly sizeChanged: ReadonlySubEvent<UiViewStackContainer, void>;

  /**
   * Gets this container's current size mode.
   * @returns This container's current size mode.
   */
  getSizeMode(): UiViewSizeMode;

  /**
   * Gets this container's current dimensions, as `[width, height]` in pixels.
   * @returns This container's current dimensions, as `[width, height]` in pixels.
   */
  getDimensions(): ReadonlyFloat64Array;

  /**
   * Renders a view into this container.
   * @param layer The layer to which to render the view.
   * @param view A UI view, as a VNode.
   */
  renderView(layer: UiViewStackLayer, view: VNode): void;
}
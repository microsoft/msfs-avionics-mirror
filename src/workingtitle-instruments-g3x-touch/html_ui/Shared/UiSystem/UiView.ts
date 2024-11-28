import { ComponentProps, DisplayComponent, NodeReference, ReadonlyFloat64Array, Subscribable, SubscribableMap } from '@microsoft/msfs-sdk';

import { UiInteractionHandler } from './UiInteraction';
import { UiKnobId, UiKnobRequestedLabelState } from './UiKnobTypes';
import type { UiService } from './UiService';
import { UiViewOcclusionType, UiViewSizeMode } from './UiViewTypes';

import './UiView.css';

/**
 * Component props for UiView.
 */
export interface UiViewProps extends ComponentProps {
  /** The UI service instance. */
  uiService: UiService;

  /** A reference to the root element of the view's container. */
  containerRef: NodeReference<HTMLElement>;
}

/**
 * A view which displays content in a view stack.
 */
export interface UiView<P extends UiViewProps = UiViewProps> extends DisplayComponent<P>, UiInteractionHandler {
  /** The bezel rotary knob label state requested by this view. */
  readonly knobLabelState: SubscribableMap<UiKnobId, string> & Subscribable<UiKnobRequestedLabelState>;

  /**
   * Responds to when this view is opened.
   * @param sizeMode The new size mode of this view's container.
   * @param dimensions The new dimensions of this view's container, as `[width, height]` in pixels.
   */
  onOpen(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void;

  /**
   * Responds to when this view is closed.
   */
  onClose(): void;

  /**
   * Responds to when this view is resumed.
   */
  onResume(): void;

  /**
   * Responds to when this view is paused.
   */
  onPause(): void;

  /**
   * Responds when this view's container is resized while it is open.
   * @param sizeMode The new size mode of this view's container.
   * @param dimensions The new dimensions of this view's container, as `[width, height]` in pixels.
   */
  onResize(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void;

  /**
   * Responds to when the occlusion type applied to this view changes while this view is open.
   * @param occlusionType The new occlusion type applied to this view.
   */
  onOcclusionChange(occlusionType: UiViewOcclusionType): void;

  /**
   * Called every update cycle.
   * @param time The current real (operating system) time, as a Javascript timestamp.
   */
  onUpdate(time: number): void;
}
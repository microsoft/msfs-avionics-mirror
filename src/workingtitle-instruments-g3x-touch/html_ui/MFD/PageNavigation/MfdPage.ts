import { ComponentProps, DisplayComponent, NodeReference, ReadonlyFloat64Array, Subscribable, SubscribableMap } from '@microsoft/msfs-sdk';

import { UiInteractionHandler } from '../../Shared/UiSystem/UiInteraction';
import { UiKnobId, UiKnobRequestedLabelState } from '../../Shared/UiSystem/UiKnobTypes';
import { UiService } from '../../Shared/UiSystem/UiService';
import { UiViewOcclusionType } from '../../Shared/UiSystem/UiViewTypes';
import { MfdPageSizeMode } from './MfdPageTypes';

/**
 * Component props for {@link MfdPage}.
 */
export interface MfdPageProps extends ComponentProps {
  /** The UI service instance. */
  uiService: UiService;

  /** A reference to the root element of the container of the page's parent UI view. */
  containerRef: NodeReference<HTMLElement>;
}

/**
 * An MFD page.
 */
export interface MfdPage<P extends MfdPageProps = MfdPageProps> extends DisplayComponent<P>, UiInteractionHandler {
  /** This page's title. */
  readonly title: Subscribable<string>;

  /** The file path to this page's icon's image asset. */
  readonly iconSrc: Subscribable<string>;

  /** The bezel rotary knob label state requested by this page. */
  readonly knobLabelState: SubscribableMap<UiKnobId, string> & Subscribable<UiKnobRequestedLabelState>;

  /**
   * Responds to when this page is staged. A page is staged if it has been selected.
   */
  onStage(): void;

  /**
   * Responds to when this page is unstaged. A page is unstaged if it is no longer selected.
   */
  onUnstage(): void;

  /**
   * Responds to when this page is opened. A page is opened if it has been selected, has become active, and is visible.
   * @param sizeMode This page's size mode.
   * @param dimensions This page's dimensions, as `[width, height]` in pixels.
   */
  onOpen(sizeMode: MfdPageSizeMode, dimensions: ReadonlyFloat64Array): void;

  /**
   * Responds to when this page is closed. A page is closed if it is no longer visible.
   */
  onClose(): void;

  /**
   * Responds to when this page is resumed. A page is resumed when it has been opened as part of the top-most view in
   * its view stack.
   */
  onResume(): void;

  /**
   * Responds to when this page is paused. A page is paused if it is no longer open as the top-most view in its view
   * stack.
   */
  onPause(): void;

  /**
   * Responds when this page's parent UI view is resized while it is resumed.
   * @param sizeMode This page's new size mode.
   * @param dimensions This page's new dimensions, as `[width, height]` in pixels.
   */
  onResize(sizeMode: MfdPageSizeMode, dimensions: ReadonlyFloat64Array): void;

  /**
   * Responds to when the occlusion type applied to this page's parent UI view changes while this page is open.
   * @param occlusionType The new occlusion type applied to this page's parent UI view.
   */
  onOcclusionChange(occlusionType: UiViewOcclusionType): void;

  /**
   * Called every update cycle.
   * @param time The current real (operating system) time, as a Javascript timestamp.
   */
  onUpdate(time: number): void;
}
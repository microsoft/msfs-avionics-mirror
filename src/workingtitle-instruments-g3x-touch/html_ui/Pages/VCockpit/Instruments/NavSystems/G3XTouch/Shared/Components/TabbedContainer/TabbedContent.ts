import { ComponentProps, DisplayComponent, Subscribable, SubscribableMap, VNode } from '@microsoft/msfs-sdk';

import { UiInteractionHandler } from '../../UiSystem/UiInteraction';
import { UiKnobId, UiKnobRequestedLabelState } from '../../UiSystem/UiKnobTypes';

/**
 * Component props for TabbedContent.
 */
export interface TabbedContentProps extends ComponentProps {
  /** The label to display for the tab. */
  tabLabel: string | Subscribable<string> | (() => VNode);

  /** Whether the tab is enabled. Defaults to `true`. */
  isEnabled?: boolean | Subscribable<boolean>;

  /** Whether the tab is visible in the tab list. Defaults to `true`. */
  isVisible?: boolean | Subscribable<boolean>;
}

/**
 * Tab-associated content which can be rendered inside a tabbed container.
 */
export interface TabbedContent<P extends TabbedContentProps = TabbedContentProps> extends DisplayComponent<P>, UiInteractionHandler {
  /** Flags this component as a TabbedContent. */
  readonly isTabbedContent: true;

  /** The bezel rotary knob label state requested by this content. */
  readonly knobLabelState: SubscribableMap<UiKnobId, string> & Subscribable<UiKnobRequestedLabelState>;

  /**
   * Responds to when this content is selected to be displayed in its parent container.
   */
  onSelect(): void;

  /**
   * Responds to when this content is deselected.
   */
  onDeselect(): void;

  /**
   * Responds to when this content is opened. Content is opened when it is selected and its parent container is
   * open.
   */
  onOpen(): void;

  /**
   * Responds to when this content is closed. Content is closed when it is deselected or its parent container is
   * closed.
   */
  onClose(): void;

  /**
   * Responds to when this content is resumed. Content is resumed when it is selected and its parent container is
   * resumed.
   */
  onResume(): void;

  /**
   * Responds to when this content is paused. Content is paused when it is deselected or its parent container is
   * paused.
   */
  onPause(): void;

  /**
   * Responds to when this content is updated. Content is updated when it is selected and its parent container is
   * updated.
   * @param time The current real (operating system) time, as a Javascript timestamp.
   */
  onUpdate(time: number): void;
}
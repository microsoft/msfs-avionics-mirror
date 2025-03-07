import { Subscribable, VNode } from '@microsoft/msfs-sdk';

/** Data for a tab in a tabbed container. */
export interface Tab extends TabMenuItem {
  /** Function to render a tab's content, should extend {@link TabContent}. */
  readonly renderContent: () => VNode;
}

/** Data for a tab menu item */
export interface TabMenuItem {
  /** Function to render a tab label. */
  readonly renderLabel: () => string | VNode;
  /** The name of this tab. */
  readonly name?: string;
  /** Whether this tab is disabled on the menu; defaults to false. */
  isDisabled?: boolean | Subscribable<boolean>;
  /** Whether this tab is hidden in the menu; defaults to false. */
  isHidden?: boolean | Subscribable<boolean>;
}

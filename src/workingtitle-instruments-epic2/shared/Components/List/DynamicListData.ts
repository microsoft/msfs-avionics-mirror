import { Subscribable } from '@microsoft/msfs-sdk';

/**
 * An item that can be displayed in a dynamic list.
 */
export interface DynamicListData {
  /** Whether this list item is visible in the list. */
  isVisible?: Subscribable<boolean>;
}

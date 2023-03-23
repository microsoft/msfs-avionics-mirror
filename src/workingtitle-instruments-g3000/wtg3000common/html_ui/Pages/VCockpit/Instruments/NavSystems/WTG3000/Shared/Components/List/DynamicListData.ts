import { Subscribable } from '@microsoft/msfs-sdk';

/** An interface for dynamic list data items to use to support hiding list items. */
export interface DynamicListData {
  /** Whether this list item is visible in the list. */
  isVisible?: Subscribable<boolean>;
}

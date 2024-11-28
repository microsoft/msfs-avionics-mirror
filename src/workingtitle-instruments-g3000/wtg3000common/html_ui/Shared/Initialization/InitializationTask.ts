import { Subscribable } from '@microsoft/msfs-sdk';

/**
 * A G3000 initialization task.
 */
export interface InitializationTask {
  /** This task's unique ID string. */
  readonly uid: string;

  /** The label text displayed for this task in the GTC Initialization page. */
  readonly label: string;

  /** The absolute path to the image asset to use for the icon displayed for this task in the GTC Initialization page. */
  readonly iconSrc: string;

  /** The key of the GTC page view associated with this task. */
  readonly gtcPageKey: string;

  /** Whether the task is completed. */
  readonly isCompleted: Subscribable<boolean>;
}

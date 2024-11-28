import { Subscribable, SubscribableArray } from '@microsoft/msfs-sdk';

import { InitializationTaskDef } from './InitializationEvents';

/**
 * Data describing a G3000 initialization task.
 */
export type InitializationTaskData = {
  /** The definition for the task described by these data. */
  readonly taskDef: InitializationTaskDef;

  /** Whether the task described by these data has been completed. */
  readonly isCompleted: Subscribable<boolean>;
};

/**
 * A provider of G3000 initialization data.
 */
export interface InitializationDataProvider {
  /** The ID string of the initialization process being used, or `null` if no process is being used. */
  readonly id: Subscribable<string | null>;

  /** Whether the initialization process is enabled. */
  readonly isEnabled: Subscribable<boolean>;

  /**
   * An ordered array containing data describing the tasks that comprise the initialization process. The order of the
   * task data is the same as the order of the corresponding tasks in the initialization process.
   */
  readonly tasks: SubscribableArray<InitializationTaskData>;

  /** The message to display to the user when attempting to reset the initialization process. */
  readonly resetMessage: Subscribable<string | undefined>;

  /**
   * Whether all initialization tasks have been completed. If the initialization process is disabled or there are no
   * tasks, then this value is always `false`.
   */
  readonly areAllTasksCompleted: Subscribable<boolean>;

  /** Whether initialization has been accepted by the user. */
  readonly isAccepted: Subscribable<boolean>;
}

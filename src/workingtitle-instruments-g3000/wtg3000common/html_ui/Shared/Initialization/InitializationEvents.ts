import { InitializationTask } from './InitializationTask';

/**
 * A definition that describes an initialization task.
 */
export type InitializationTaskDef = Pick<InitializationTask, 'uid' | 'label' | 'iconSrc' | 'gtcPageKey'>;

/**
 * Events related to G3000 initialization.
 */
export interface InitializationEvents {
  /** The ID of the initialization process, or `null` if initialization is disabled. */
  g3000_init_id: string | null;

  /** Whether the initialization process is enabled. */
  g3000_init_enabled: boolean;

  /** An ordered array containing the tasks that comprise the initialization process. */
  g3000_init_task_defs: readonly InitializationTaskDef[];

  /** The message to display to the user when attempting to reset the initialization process. */
  g3000_init_reset_message: string;

  /** Whether an initialization task has been completed. The topic name is suffixed with the task's unique ID. */
  [g3000_init_task_completed: `g3000_init_task_completed_${string}`]: boolean;

  /** Whether initialization has been accepted by the user. */
  g3000_init_accepted: boolean;
}

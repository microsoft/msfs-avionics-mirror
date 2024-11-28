import { InitializationTask } from './InitializationTask';

/**
 * A G3000 initialization process.
 */
export interface InitializationProcess {
  /** The ID of this process. */
  readonly id: string;

  /** An ordered array of tasks that comprise this process. */
  readonly tasks: readonly InitializationTask[];

  /** The message to display to the user when attempting to reset this process. */
  readonly resetMessage: string;

  /**
   * A method that is called when this process is reset.
   * @returns A Promise which is fulfilled when all operations that need to be carried out as part of the reset are
   * completed.
   */
  onReset(): Promise<void>;
}

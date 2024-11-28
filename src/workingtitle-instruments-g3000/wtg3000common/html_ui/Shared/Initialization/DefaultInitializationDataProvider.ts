import { ArraySubject, ConsumerSubject, EventBus, Subject, Subscribable, SubscribableArray, Subscription } from '@microsoft/msfs-sdk';

import { InitializationEvents, InitializationTaskDef } from './InitializationEvents';
import { InitializationDataProvider, InitializationTaskData } from './InitializationDataProvider';

/**
 * Initialization task data used by {@link DefaultInitializationDataProvider}.
 */
type InitializationTaskDataInternal = {
  /** The definition for the task described by these data. */
  taskDef: InitializationTaskDef;

  /** Whether the task described by these data has been completed. */
  isCompleted: ConsumerSubject<boolean>;
};

/**
 * A default implementation of `InitializationDataProvider`.
 */
export class DefaultInitializationDataProvider implements InitializationDataProvider {
  private readonly _id = ConsumerSubject.create<string | null>(null, null).pause();
  /** @inheritDoc */
  public readonly id = this._id as Subscribable<string | null>;

  private readonly _isEnabled = ConsumerSubject.create(null, false).pause();
  /** @inheritDoc */
  public readonly isEnabled = this._isEnabled as Subscribable<boolean>;

  private readonly _tasks = ArraySubject.create<InitializationTaskDataInternal>();
  /** @inheritDoc */
  public readonly tasks = this._tasks as SubscribableArray<InitializationTaskData>;

  private readonly _resetMessage = ConsumerSubject.create<string | undefined>(null, undefined).pause();
  /** @inheritDoc */
  public readonly resetMessage = this._resetMessage as Subscribable<string | undefined>;

  private readonly _areAllTasksCompleted = Subject.create(false);
  /** @inheritDoc */
  public readonly areAllTasksCompleted = this._areAllTasksCompleted as Subscribable<boolean>;

  private readonly _isAccepted = ConsumerSubject.create(null, false).pause();
  /** @inheritDoc */
  public readonly isAccepted = this._isAccepted as Subscribable<boolean>;

  private isAlive = true;
  private isInit = false;
  private isResumed = false;

  private pendingTaskDefs?: readonly InitializationTaskDef[];

  private tasksSub?: Subscription;

  /**
   * Creates a new instance of DefaultInitializationDataProvider.
   * @param bus The event bus.
   */
  public constructor(private readonly bus: EventBus) {
  }

  /**
   * Initializes this data provider. Once initialized, this data provider will continuously update its data until
   * paused or destroyed.
   * @param paused Whether to initialize this data provider as paused. Defaults to `false`.
   * @throws Error if this data provider has been destroyed.
   */
  public init(paused = false): void {
    if (!this.isAlive) {
      throw new Error('DefaultInitializationDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<InitializationEvents>();

    this.tasksSub = sub.on('g3000_init_task_defs').handle(this.onTasksChanged.bind(this));
    this._id.setConsumer(sub.on('g3000_init_id'));
    this._isEnabled.setConsumer(sub.on('g3000_init_enabled'));
    this._resetMessage.setConsumer(sub.on('g3000_init_reset_message'));
    this._isAccepted.setConsumer(sub.on('g3000_init_accepted'));

    if (!paused) {
      this.resume();
    }
  }

  /**
   * Resumes this data provider. Once resumed, this data provider will continuously update its data until paused or
   * destroyed.
   * @throws Error if this data provider has been destroyed.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('DefaultInitializationDataProvider: cannot resume a dead provider');
    }

    if (!this.isInit || this.isResumed) {
      return;
    }

    this.isResumed = true;

    this._id.resume();
    this._isEnabled.resume();

    if (this.pendingTaskDefs) {
      const tasks = this.pendingTaskDefs;
      this.pendingTaskDefs = undefined;
      this.refreshTasks(tasks);
    } else {
      for (const data of this._tasks.getArray()) {
        data.isCompleted.resume();
      }
    }

    this._resetMessage.resume();
    this._isAccepted.resume();
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultInitializationDataProvider: cannot pause a dead provider');
    }

    if (!this.isInit || !this.isResumed) {
      return;
    }

    this.isResumed = false;

    for (const data of this._tasks.getArray()) {
      data.isCompleted.pause();
    }

    this._id.pause();
    this._isEnabled.pause();
    this._resetMessage.pause();
    this._isAccepted.pause();
  }

  /**
   * Responds to when the tasks that comprise the initialization process change.
   * @param tasks The new tasks that comprise the initialization process.
   */
  private onTasksChanged(tasks: readonly InitializationTaskDef[]): void {
    if (this.isResumed) {
      this.pendingTaskDefs = undefined;
      this.refreshTasks(tasks);
    } else {
      this.pendingTaskDefs = tasks;
    }
  }

  /**
   * Refreshes the initialization tasks tracked by this provider.
   * @param tasks The new initialization tasks to be tracked.
   */
  private refreshTasks(tasks: readonly InitializationTaskDef[]): void {
    for (const data of this._tasks.getArray()) {
      data.isCompleted.destroy();
    }

    if (tasks.length === 0) {
      this._tasks.clear();
      this._areAllTasksCompleted.set(false);
    } else {
      const sub = this.bus.getSubscriber<InitializationEvents>();

      const taskData = tasks.map<InitializationTaskDataInternal>(taskDef => {
        return {
          taskDef,
          // refreshTasks() is only called when the data provider is resumed, so we will initialize the subject as resumed.
          isCompleted: ConsumerSubject.create(sub.on(`g3000_init_task_completed_${taskDef.uid}`), false)
        };
      });

      const updateAreAllTasksCompleted = this.updateAreAllTasksCompleted.bind(this);

      for (const { isCompleted } of taskData) {
        isCompleted.sub(updateAreAllTasksCompleted);
      }

      this._tasks.set(taskData);

      this.updateAreAllTasksCompleted();
    }
  }

  /**
   * Updates whether all initialization tasks have been completed.
   */
  private updateAreAllTasksCompleted(): void {
    let areAllTasksCompleted = true;

    const taskDataArray = this._tasks.getArray();
    if (taskDataArray.length === 0) {
      areAllTasksCompleted = false;
    } else {
      for (let i = 0; i < taskDataArray.length; i++) {
        if (!taskDataArray[i].isCompleted.get()) {
          areAllTasksCompleted = false;
          break;
        }
      }
    }

    this._areAllTasksCompleted.set(areAllTasksCompleted);
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this.tasksSub?.destroy();
    this._id.destroy();
    this._isEnabled.destroy();
    this._resetMessage.destroy();
    this._isAccepted.destroy();

    for (const data of this._tasks.getArray()) {
      data.isCompleted.destroy();
    }
  }
}

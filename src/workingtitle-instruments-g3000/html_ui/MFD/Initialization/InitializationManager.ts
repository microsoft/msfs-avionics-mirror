import { EventBus, Subject, Subscription } from '@microsoft/msfs-sdk';

import { InitializationControlEvents, InitializationEvents, InitializationProcess } from '@microsoft/msfs-wtg3000-common';

/**
 * A manager for the state of the G3000 initialization process. The manager responds to commands published to event bus
 * topics defined in `InitializationControlEvents` to change the initialization process state and publishes information
 * about the state to event topics defined `InitializationEvents`.
 */
export class InitializationManager {
  private readonly publisher = this.bus.getPublisher<InitializationEvents>();

  private process?: InitializationProcess;

  private isAlive = true;
  private isInit = false;

  private readonly isAccepted = Subject.create(false);

  private inProgressReset?: Promise<void>;
  private isResetQueued = false;

  private readonly subscriptions: Subscription[] = [];

  /**
   * Creates a new instance of InitializationManager.
   * @param bus The event bus.
   */
  public constructor(private readonly bus: EventBus) {
    this.publisher.pub('g3000_init_id', null, true, true);
    this.publisher.pub('g3000_init_task_defs', [], true, true);
    this.publisher.pub('g3000_init_reset_message', '', true, true);
    this.publisher.pub('g3000_init_accepted', false, true, true);
    this.publisher.pub('g3000_init_enabled', false, true, true);
  }

  /**
   * Initializes this manager with an initialization process. If the process includes at least one initialization task,
   * then the initialization process will be enabled. Once initialized with an enabled initialization process, the
   * manager will respond to commands published to event bus topics defined in `InitializationControlEvents`.
   * @param process An initialization process.
   * @throws Error if this manager has been destroyed.
   */
  public init(process: InitializationProcess): void {
    if (!this.isAlive) {
      throw new Error('InitializationManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    if (process && process.tasks.length > 0) {
      this.process = process;

      this.publisher.pub('g3000_init_id', process.id, true, true);
      this.publisher.pub('g3000_init_task_defs', process.tasks.map(task => {
        return {
          uid: task.uid,
          label: task.label,
          iconSrc: task.iconSrc,
          gtcPageKey: task.gtcPageKey
        };
      }), true, true);
      this.publisher.pub('g3000_init_reset_message', process.resetMessage, true, true);

      const sub = this.bus.getSubscriber<InitializationControlEvents>();

      for (const task of process.tasks) {
        const completedStateTopic = `g3000_init_task_completed_${task.uid}` as const;

        this.subscriptions.push(
          task.isCompleted.sub(val => { this.publisher.pub(completedStateTopic, val, true, true); }, true)
        );
      }

      this.isAccepted.sub(val => { this.publisher.pub('g3000_init_accepted', val, true, true); });

      this.subscriptions.push(
        sub.on('g3000_init_accept').handle(this.onAccept.bind(this)),
        sub.on('g3000_init_reset').handle(this.onReset.bind(this))
      );

      this.publisher.pub('g3000_init_enabled', true, true, true);
    }
  }

  /**
   * Resets whether the initialization has been accepted to `false`.
   */
  public resetAccepted(): void {
    if (this.process === undefined) {
      return;
    }

    this.isAccepted.set(false);
  }

  /**
   * Responds to when a command to accept the initialization is received.
   */
  private onAccept(): void {
    this.isAccepted.set(true);
  }

  /**
   * Responds to when a command to reset the initialization process is received.
   */
  private async onReset(): Promise<void> {
    if (this.inProgressReset) {
      this.isResetQueued = true;
    } else {
      do {
        this.isResetQueued = false;
        this.inProgressReset = this.doReset();
        await this.inProgressReset;
        this.inProgressReset = undefined;
      } while (this.isResetQueued);
    }
  }

  /**
   * Performs a reset of the initialization process.
   */
  private async doReset(): Promise<void> {
    await this.process!.onReset();
    this.isAccepted.set(false);
  }

  /**
   * Destroys this manager. Once destroyed, the manager can no longer be initialized and will stop responding to
   * commands to change the initialization process state and will stop publishing state information to the event bus.
   */
  public destroy(): void {
    this.isAlive = false;

    for (const sub of this.subscriptions) {
      sub.destroy();
    }
  }
}

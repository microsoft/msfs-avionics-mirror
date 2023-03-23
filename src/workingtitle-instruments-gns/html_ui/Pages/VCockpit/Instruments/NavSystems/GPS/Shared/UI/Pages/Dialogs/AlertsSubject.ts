import { ArraySubject, EventBus, Publisher, Subject, SubscribableArray, SubscribableArrayHandler, Subscription } from '@microsoft/msfs-sdk';

/**
 * A message to be displayed in the Alerts pane.
 */
export interface AlertMessage {
  /** The key of the message. */
  key: string;

  /** The body of the message. */
  message: string;

  /** Whether the message should persist after being viewed. */
  persistent?: boolean;

  /**
   * Whether the message is new
   * (this value is set by this class and can be undefined by the sender).
   * */
  isNew?: boolean;
}

/**
 * Events for the GNS alert system.
 */
export interface AlertMessageEvents {
  /** An alert has been pushed. */
  'alerts_push': AlertMessage;

  /** An alert has been removed. */
  'alerts_remove': string;

  /** The current state of the Alerts (no alerts, persistent alerts only or new alerts). */
  'alerts_status': GNSAlertState;
}

export enum GNSAlertState {
  NO_ALERTS,
  PERSISTENT_ALERTS,
  NEW_ALERTS
}

/**
 * A subject that tracks GNS alert messages.
 */
export class AlertsSubject implements SubscribableArray<AlertMessage> {

  private readonly data = ArraySubject.create<AlertMessage>([]);
  private readonly publisher: Publisher<AlertMessageEvents>;
  private readonly alertState = Subject.create<GNSAlertState>(GNSAlertState.NO_ALERTS);

  /**
   * Creates an instance of a AlertsSubject.
   * @param bus An instance of the event bus.
   */
  constructor(bus: EventBus) {
    const sub = bus.getSubscriber<AlertMessageEvents>();
    sub.on('alerts_push').handle(this.onAlertPushed.bind(this));
    sub.on('alerts_remove').handle(this.onAlertRemoved.bind(this));

    this.publisher = bus.getPublisher<AlertMessageEvents>();

    this.alertState.sub(state => this.publisher.pub('alerts_status', state, false, true));
  }

  /**
   * A callback called when an alert is pushed on the bus.
   * @param message The alert message that was pushed.
   */
  private onAlertPushed(message: AlertMessage): void {
    const index = this.data.getArray().findIndex(x => x.key === message.key);
    message.isNew = true;
    if (index < 0) {
      this.data.insert(message, 0);
    } else {
      this.data.get(index).isNew = true;
    }
    this.alertState.set(GNSAlertState.NEW_ALERTS);
  }

  /**
   * A callback called when an alert is removed from the bus.
   * @param key The key of the alert that was removed.
   */
  private onAlertRemoved(key: string): void {
    const index = this.data.getArray().findIndex(x => x.key === key);
    if (index >= 0) {
      this.data.removeAt(index);
    }
    this.updateAlertState();
  }

  /**
   * Method called when the messages are viewed by opening the message dialog.
   */
  public onAlertsViewed(): void {
    if (this.data.length > 0) {
      const alertsArray = this.data.getArray();
      for (let a = this.data.length - 1; a >= 0; a--) {
        const alert = alertsArray[a];
        if (!alert.persistent) {
          this.data.removeAt(a);
        } else {
          alert.isNew = false;
        }
      }
    }
    this.updateAlertState();
  }

  /**
   * Updates the alerts state.
   */
  private updateAlertState(): void {
    if (this.data.length === 0) {
      this.alertState.set(GNSAlertState.NO_ALERTS);
    } else {
      const newAlert = this.data.getArray().findIndex(x => x.isNew === true);
      this.alertState.set(newAlert > -1 ? GNSAlertState.NEW_ALERTS : GNSAlertState.PERSISTENT_ALERTS);
    }
  }

  /** @inheritdoc */
  public get length(): number {
    return this.data.length;
  }

  /** @inheritdoc */
  public get(index: number): AlertMessage {
    return this.data.get(index);
  }

  /** @inheritdoc */
  public tryGet(index: number): AlertMessage | undefined {
    return this.data.tryGet(index);
  }

  /** @inheritdoc */
  public getArray(): readonly AlertMessage[] {
    return this.data.getArray();
  }

  /** @inheritdoc */
  public sub(handler: SubscribableArrayHandler<AlertMessage>, initialNotify = false, paused = false): Subscription {
    return this.data.sub(handler, initialNotify, paused);
  }

  /** @inheritdoc */
  public unsub(handler: SubscribableArrayHandler<AlertMessage>): void {
    this.data.unsub(handler);
  }
}
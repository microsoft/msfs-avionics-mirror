import { CasAlertEventData, CasStateEvents, EventBus } from '@microsoft/msfs-sdk';
import { AlertMessage, AlertMessageEvents } from './AlertsSubject';

/**
 * CAS events specific to the G1000 NXi.
 */
export interface CasAlertBridgeEvents {
  /** Registers an alert message associated with a specified CAS. The alert message key must match the uid of the associated CAS alert. */
  'cas_register_associated_message': AlertMessage;

  /** Unregisters an alert message associated with a specified CAS. */
  'cas_unregister_associated_message': string;
}

/**
 * A class for associating alert messages with specific CAS alerts.
 */
export class CasAlertsBridge {

  private readonly publisher = this.bus.getPublisher<AlertMessageEvents>();
  private readonly associatedAlertMessages = new Map<string, AlertMessage>();

  /**
   * Creates an instance of a CasAlertsBridge.
   * @param bus The event bus to use with this instance.
   */
  constructor(private readonly bus: EventBus) {
    const subscriber = this.bus.getSubscriber<CasAlertBridgeEvents & CasStateEvents>();
    subscriber.on('cas_register_associated_message').handle(this.registerAssociatedAlertMessage.bind(this));
    subscriber.on('cas_unregister_associated_message').handle(this.unregisterAssociatedAlertMessage.bind(this));

    subscriber.on('cas_alert_displayed').handle(this.onMessageDisplayed.bind(this));
    subscriber.on('cas_alert_hidden').handle(this.onMessageHidden.bind(this));
  }

  /**
   * Handles when a CAS message is displayed.
   * @param data The event data about the displayed message.
   */
  private onMessageDisplayed(data: CasAlertEventData): void {
    const associatedMessage = this.associatedAlertMessages.get(data.uuid);
    if (associatedMessage !== undefined) {
      associatedMessage.priority = data.priority;
      this.publisher.pub('alerts_push', { key: associatedMessage.key, title: associatedMessage.title, message: associatedMessage.message, priority: data.priority });
    }
  }

  /**
   * Handles when a CAS message is hidden.
   * @param data The event data about the hidden message.
   */
  private onMessageHidden(data: CasAlertEventData): void {
    const associatedMessage = this.associatedAlertMessages.get(data.uuid);
    if (associatedMessage !== undefined) {
      this.publisher.pub('alerts_remove', associatedMessage.key);
    }
  }

  /**
   * Registers an associated alert message.
   * @param alertMessage The alert message to register.
   */
  private registerAssociatedAlertMessage(alertMessage: AlertMessage): void {
    this.associatedAlertMessages.set(alertMessage.key, alertMessage);
  }

  /**
   * Unregisters an associated alert message.
   * @param uid The ID to unregister.
   */
  private unregisterAssociatedAlertMessage(uid: string): void {
    this.associatedAlertMessages.delete(uid);
  }
}
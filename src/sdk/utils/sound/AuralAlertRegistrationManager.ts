
import { EventBus, Publisher } from '../../data/EventBus';
import { Subscription } from '../../sub/Subscription';
import { AuralAlertDefinition, AuralAlertControlEvents, AuralAlertEvents } from './AuralAlertSystem';

/**
 * A manager for registering aural alerts. Alerts can be registered with an {@link AuralAlertSystem} through the
 * manager, which also handles registration requests from the alert system.
 */
export class AuralAlertRegistrationManager {
  private readonly publisher: Publisher<AuralAlertControlEvents>;
  private readonly registrations = new Map<string, Readonly<AuralAlertDefinition>>();

  private readonly requestSub: Subscription;

  /**
   * Creates a new instance of AuralAlertRegistrationManager.
   * @param bus The event bus.
   */
  constructor(bus: EventBus) {
    this.publisher = bus.getPublisher<AuralAlertControlEvents>();
    const subscriber = bus.getSubscriber<AuralAlertEvents>();

    this.requestSub = subscriber.on('aural_alert_request_all_registrations').handle(this.publishAllRegistrations.bind(this));
  }

  /**
   * Registers an aural alert.
   * @param definition The definition of the alert to register.
   */
  public register(definition: Readonly<AuralAlertDefinition>): void {
    this.registrations.set(definition.uuid, definition);
    this.publishRegistration(definition);
  }

  /**
   * Publishes a registration event for an alert.
   * @param definition The definition of the alert to register.
   */
  private publishRegistration(definition: Readonly<AuralAlertDefinition>): void {
    this.publisher.pub('aural_alert_register', definition, true, false);
  }

  /**
   * Publishes registration events for all currently registered alerts.
   */
  private publishAllRegistrations(): void {
    for (const definition of this.registrations.values()) {
      this.publishRegistration(definition);
    }
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.requestSub.destroy();
  }
}
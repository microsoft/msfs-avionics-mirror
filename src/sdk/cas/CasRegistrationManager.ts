import { EventBus, Publisher } from '../data/EventBus';
import { CasAlertDefinition, CasEvents } from './CasSystem';

/**
 * This is a convenience tool for publishing and republishing CAS alert registrations.  Code
 * that wants to implement its own alert publishing system can use the CasRegistrationManager
 * to avoid having to subscribe to and handle requests on the bus for republication of alert
 * registrations.
 */
export class CasRegistrationManager {
  private publisher: Publisher<CasEvents>;
  private registrations = new Map<string, CasAlertDefinition>();

  /**
   * Create a CasRegistrationManager
   * @param bus The event bus
   */
  constructor(bus: EventBus) {
    this.publisher = bus.getPublisher<CasEvents>();
    const subscriber = bus.getSubscriber<CasEvents>();

    subscriber.on('cas_publish_registration').handle(uuid => this.publishRegistration(uuid));
    subscriber.on('cas_publish_all_registrations').handle(() => this.publishAllRegistrations());
  }

  /**
   * Register an alert for management.
   * @param definition The CasAlertDefinition for this alert.
   */
  public register(definition: CasAlertDefinition): void {
    this.registrations.set(definition.uuid, definition);
    this.publishRegistration(definition.uuid);
  }

  /**
   * Handle publishing information for a single alert.
   * @param uuid The UUID of the registation to publish.
   */
  private publishRegistration(uuid: string): void {
    const definition = this.registrations.get(uuid);
    if (definition) {
      this.publisher.pub('cas_register_alert', definition, true);
    }
  }

  /**
   * Publish all current registrations.
   */
  private publishAllRegistrations(): void {
    for (const uuid of this.registrations.keys()) {
      this.publishRegistration(uuid);
    }
  }
}
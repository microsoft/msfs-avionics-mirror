import { AnnunciationType, AuralAlertControlEvents, AuralAlertRegistrationManager, CasAlertEventData, CasStateEvents, EventBus, Subscription } from '@microsoft/msfs-sdk';
import { G3000AuralAlertIds, G3000AuralAlertUtils } from '@microsoft/msfs-wtg3000-common';

/**
 * A manager which handles the CAS master warning and caution aural alert chimes.
 */
export class CasMasterAuralAlertManager {
  private readonly publisher = this.bus.getPublisher<AuralAlertControlEvents>();

  private readonly registrationManager = new AuralAlertRegistrationManager(this.bus);

  private isAlive = true;
  private isInit = false;

  private readonly subscriptions: Subscription[] = [];

  /**
   * Creates a new instance of CasMasterAuralAlertManager.
   * @param bus The event bus.
   */
  constructor(private readonly bus: EventBus) {
    this.registrationManager.register({
      uuid: G3000AuralAlertIds.MasterWarning,
      queue: G3000AuralAlertUtils.PRIMARY_QUEUE,
      priority: G3000AuralAlertUtils.PRIORITIES[G3000AuralAlertIds.MasterWarning],
      sequence: ['tone_warning', 'tone_warning'],
      continuous: false,
      repeat: false,
      timeout: 5000
    });

    this.registrationManager.register({
      uuid: G3000AuralAlertIds.MasterCaution,
      queue: G3000AuralAlertUtils.PRIMARY_QUEUE,
      priority: G3000AuralAlertUtils.PRIORITIES[G3000AuralAlertIds.MasterCaution],
      sequence: 'tone_caution',
      continuous: false,
      repeat: false,
      timeout: 5000
    });
  }

  /**
   * Initializes this manager. Once this manager is initialized, it will automatically trigger the CAS master warning
   * and caution chimes when new CAS messages appear.
   * @throws Error if this manager has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('CasMasterAuralAlertManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    const sub = this.bus.getSubscriber<CasStateEvents>();

    this.subscriptions.push(
      sub.on('cas_alert_displayed').handle(this.onAlertDisplayed.bind(this)),
      sub.on('cas_alert_acknowledged').handle(this.onAlertHidden.bind(this)),
      sub.on('cas_alert_hidden').handle(this.onAlertHidden.bind(this)),
    );

  }

  /**
   * Responds to when a CAS alert is displayed.
   * @param alert Data describing the displayed alert.
   */
  private onAlertDisplayed(alert: Readonly<CasAlertEventData>): void {
    if (alert.acknowledged) {
      return;
    }

    let uuid: string;
    switch (alert.priority) {
      case AnnunciationType.Warning:
        uuid = G3000AuralAlertIds.MasterWarning;
        break;
      case AnnunciationType.Caution:
        uuid = G3000AuralAlertIds.MasterCaution;
        break;
      default:
        return;
    }

    this.publisher.pub('aural_alert_trigger', { uuid, suffix: CasMasterAuralAlertManager.getSuffix(alert) }, true, false);
  }

  /**
   * Responds to when a CAS alert is acknowledged or hidden.
   * @param alert Data describing the acknowledged or hidden alert.
   */
  private onAlertHidden(alert: Readonly<CasAlertEventData>): void {
    let uuid: string;
    switch (alert.priority) {
      case AnnunciationType.Warning:
        uuid = G3000AuralAlertIds.MasterWarning;
        break;
      case AnnunciationType.Caution:
        uuid = G3000AuralAlertIds.MasterCaution;
        break;
      default:
        return;
    }

    this.publisher.pub('aural_alert_untrigger', `${uuid}::${CasMasterAuralAlertManager.getSuffix(alert)}`, true, false);
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.registrationManager.destroy();

    this.subscriptions.forEach(sub => { sub.destroy(); });
  }

  /**
   * Gets the aural alert ID suffix to use for a given CAS alert.
   * @param alert The CAS alert for which to get the suffixed ID.
   * @returns The aural alert ID suffix to use for the specified CAS alert.
   */
  private static getSuffix(alert: Readonly<CasAlertEventData>): string {
    return alert.suffix === undefined ? alert.uuid : `${alert.uuid}-${alert.suffix}`;
  }
}
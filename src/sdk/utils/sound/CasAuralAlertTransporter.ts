import { CasActiveMessage, CasAlertEventData, CasStateEvents, CasSystem } from '../../cas/CasSystem';
import { AnnunciationType } from '../../components/Annunciatons/Annunciaton';
import { EventBus, Publisher } from '../../data/EventBus';
import { Subscription } from '../../sub/Subscription';
import { AuralAlertActivation, AuralAlertControlEvents } from './AuralAlertSystem';

/**
 * Configuration options for {@link CasAuralAlertTransporter}.
 */
export type CasAuralAlertTransporterOptions = {
  /** The ID of the transporter's aural alert. */
  auralUuid: string;

  /**
   * A function which generates activation data for the transporter's aural alert. If not defined, then the aural alert
   * will be activated/triggered using its default registered parameters.
   * @returns Activation data to use for the transporter's aural alert, or `undefined` to use the default registered
   * parameters of the transporter's aural alert.
   */
  auralActivation?: () => AuralAlertActivation | undefined;

  /** The action to apply to the transporter's aural alert when the transporter's CAS alert state changes. */
  auralAction: 'activate' | 'trigger';

  /** The ID of the CAS alert to which to bind the transporter's aural alert. */
  casUuid: string;

  /** The priority level of the CAS alert to which to bind the transporter's aural alert. */
  casPriority: AnnunciationType;

  /** The suffix, if any, of the CAS alert to which to bind the transporter's aural alert. */
  casSuffix?: string;

  /** Whether to activate the transporter's aural alert when the bound CAS alert is acknowledged. */
  includeAcknowledged: boolean;
};

/**
 * Binds the state of an aural alert to the displayed state of a CAS alert and transports the aural alert state to
 * {@link AuralAlertSystem}.
 */
export class CasAuralAlertTransporter {
  private readonly publisher: Publisher<AuralAlertControlEvents>;

  private readonly auralUuid: string;
  private readonly auralActivation?: () => AuralAlertActivation | undefined;
  private readonly casUuid: string;
  private readonly casPriority: AnnunciationType;
  private readonly casSuffix?: string;
  private readonly includeAcknowledged: boolean;

  private readonly onAction: keyof AuralAlertControlEvents;
  private readonly offAction: keyof AuralAlertControlEvents;

  private readonly subs: Subscription[];

  /**
   * Creates a new instance of CasAuralAlertTransporter.
   * @param bus The event bus.
   * @param options Options with which to configure the transporter.
   * @param casSystem The CAS system. If not defined, the initialization of the aural alert's state cannot be
   * guaranteed to be correct unless the transporter is created before the CAS alert can be activated.
   * @returns A new instance of CasAuralAlertTransporter.
   */
  private constructor(
    bus: EventBus,
    options: Readonly<CasAuralAlertTransporterOptions>,
    casSystem?: CasSystem
  ) {
    this.publisher = bus.getPublisher<AuralAlertControlEvents>();

    ({
      auralUuid: this.auralUuid,
      auralActivation: this.auralActivation,
      casUuid: this.casUuid,
      casPriority: this.casPriority,
      casSuffix: this.casSuffix,
      includeAcknowledged: this.includeAcknowledged,
    } = options);

    if (options.auralAction === 'trigger') {
      this.onAction = 'aural_alert_trigger';
      this.offAction = 'aural_alert_untrigger';
    } else {
      this.onAction = 'aural_alert_activate';
      this.offAction = 'aural_alert_deactivate';
    }

    const sub = bus.getSubscriber<CasStateEvents>();

    if (options.auralAction !== 'trigger' && casSystem) {
      // Find out of the bound CAS alert is already displayed

      const filter: (message: CasActiveMessage) => boolean = this.casSuffix === undefined
        ? message => {
          return message.uuid === this.casUuid
            && message.priority === this.casPriority
            && (message.suffixes === undefined || message.suffixes.length === 0)
            && (this.includeAcknowledged || !message.acknowledged);
        }
        : message => {
          return message.uuid === this.casUuid
            && message.priority === this.casPriority
            && (message.suffixes !== undefined && message.suffixes.includes(this.casSuffix!))
            && (this.includeAcknowledged || (message.acknowledgedSuffixes !== undefined && message.acknowledgedSuffixes.includes(this.casSuffix!)));
        };

      if (casSystem.casActiveMessageSubject.getArray().find(filter)) {
        this.publisher.pub(this.onAction, (this.auralActivation && this.auralActivation()) ?? this.auralUuid, true, false);
      }
    }

    this.subs = [
      sub.on('cas_alert_displayed').handle(this.onAlertDisplayed.bind(this)),
      sub.on('cas_alert_hidden').handle(this.onAlertHidden.bind(this))
    ];

    if (!this.includeAcknowledged) {
      this.subs.push(sub.on('cas_alert_acknowledged').handle(this.onAlertAcknowledged.bind(this)));
    }
  }

  /**
   * Responds to when a CAS alert is displayed.
   * @param alert Data describing the displayed alert.
   */
  private onAlertDisplayed(alert: CasAlertEventData): void {
    if (alert.uuid === this.casUuid && alert.priority === this.casPriority && alert.suffix === this.casSuffix && (this.includeAcknowledged || !alert.acknowledged)) {
      this.publisher.pub(this.onAction, (this.auralActivation && this.auralActivation()) ?? this.auralUuid, true, false);
    }
  }

  /**
   * Responds to when a CAS alert is hidden.
   * @param alert Data describing the hidden alert.
   */
  private onAlertHidden(alert: CasAlertEventData): void {
    if (alert.uuid === this.casUuid && alert.priority === this.casPriority && alert.suffix === this.casSuffix) {
      this.publisher.pub(this.offAction, this.auralUuid, true, false);
    }
  }

  /**
   * Responds to when a CAS alert is acknowledged.
   * @param alert Data describing the acknowledged alert.
   */
  private onAlertAcknowledged(alert: CasAlertEventData): void {
    // This method is only called if includeAcknowledged is false, so if the alert matches we always want to deactivate the aural.
    if (alert.uuid === this.casUuid && alert.priority === this.casPriority && alert.suffix === this.casSuffix) {
      this.publisher.pub('aural_alert_deactivate', this.auralUuid, true, false);
    }
  }

  /**
   * Destroys this transporter. Once destroyed, it will no longer automatically manage the state of its aural alert.
   */
  public destroy(): void {
    this.subs.forEach(sub => { sub.destroy(); });
  }

  /**
   * Creates a new instance of CasAuralAlertTransporter, which will automatically activate and deactivate an aural
   * alert based on whether a bound CAS alert is being displayed as a message.
   * @param bus The event bus.
   * @param options Options with which to configure the transporter.
   * @param casSystem The CAS system. If not defined, the transporter should be created before its bound CAS alert
   * can be activated. Otherwise the initialization of the aural alert's state cannot be guaranteed to be correct.
   * @returns A new instance of CasAuralAlertTransporter.
   */
  public static create(
    bus: EventBus,
    options: Readonly<CasAuralAlertTransporterOptions>,
    casSystem?: CasSystem
  ): CasAuralAlertTransporter {
    return new CasAuralAlertTransporter(bus, options, casSystem);
  }
}
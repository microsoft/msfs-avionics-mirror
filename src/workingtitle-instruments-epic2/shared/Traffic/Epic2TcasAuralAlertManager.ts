/// <reference types="@microsoft/msfs-types/js/avionics" />

import {
  AhrsEvents, AuralAlertActivation, AuralAlertControlEvents, AuralAlertRegistrationManager, ConsumerValue, EventBus, Subscription, TcasAlertLevel, TcasEvents,
  TcasIntruder, TcasResolutionAdvisoryHost, TcasResolutionAdvisoryType
} from '@microsoft/msfs-sdk';

import { Epic2LNavDataEvents } from '../Navigation';
import { RASystemEvents } from '../Systems';
import { Epic2FlightArea } from '../Autopilot';

/**
 * A manager which handles registration and activation of aural alerts in response to traffic and resolution
 * advisories.
 */
export class Epic2TcasAuralAlertManager {
  private static readonly RA_CORRECTIVE_AURAL_IDS = {
    /** Corrective */
    [TcasResolutionAdvisoryType.Climb]: ['aural_climb', 'aural_climb'],
    [TcasResolutionAdvisoryType.MaintainClimb]: ['aural_monitor_vertical_speed', 'aural_monitor_vertical_speed'],
    [TcasResolutionAdvisoryType.CrossingClimb]: ['aural_climb_crossing_climb', 'aural_climb_crossing_climb'],
    [TcasResolutionAdvisoryType.CrossingMaintainClimb]: 'aural_maintain_vertical_speed_crossing_maintain',
    [TcasResolutionAdvisoryType.IncreaseClimb]: ['aural_increase_climb', 'aural_increase_climb'],
    [TcasResolutionAdvisoryType.ReversalClimb]: ['aural_climb_climb_now', 'aural_climb_climb_now'],
    [TcasResolutionAdvisoryType.Descend]: ['aural_descend', 'aural_descend'],
    [TcasResolutionAdvisoryType.MaintainDescend]: 'aural_maintain_vertical_speed_maintain',
    [TcasResolutionAdvisoryType.CrossingDescend]: ['aural_descend_crossing_descend', 'aural_descend_crossing_descend'],
    [TcasResolutionAdvisoryType.CrossingMaintainDescend]: 'aural_maintain_vertical_speed_crossing_maintain',
    [TcasResolutionAdvisoryType.IncreaseDescend]: ['aural_increase_descend', 'aural_increase_descend'],
    [TcasResolutionAdvisoryType.ReversalDescend]: ['aural_descend_descend_now', 'aural_descend_descend_now'],
    [TcasResolutionAdvisoryType.ReduceClimb]: ['aural_level_off', 'aural_level_off'],
    [TcasResolutionAdvisoryType.ReduceDescent]: ['aural_level_off', 'aural_level_off'],
  } as Partial<Record<TcasResolutionAdvisoryType, string | string[]>>;

  private static readonly TA_AURAL_ID = 'aural_traffic_advisory';

  private static readonly INCREASE_DESCENT_AURAL_ID = (Epic2TcasAuralAlertManager.RA_CORRECTIVE_AURAL_IDS[TcasResolutionAdvisoryType.IncreaseDescend] ?? ['aural_increase_descend'])[0];

  private readonly publisher = this.bus.getPublisher<AuralAlertControlEvents>();

  private readonly auralRegistrationManager = new AuralAlertRegistrationManager(this.bus);

  private readonly flightArea = ConsumerValue.create(this.bus.getSubscriber<Epic2LNavDataEvents>().on('lnavdata_flight_area'), Epic2FlightArea.Departure);
  private readonly radioAlt = ConsumerValue.create(this.bus.getSubscriber<RASystemEvents>().on('ra_radio_alt_1'), 0);

  private readonly taIntruders = new Map<TcasIntruder, string>();

  private isAlive = true;
  private isInit = false;

  private readonly subscriptions: Subscription[] = [];

  /**
   * Creates a new instance of Epic2TcasAuralAlertManager.
   * @param bus The event bus.
   */
  public constructor(private readonly bus: EventBus) {
    this.auralRegistrationManager.register({
      uuid: 'epic2-tcas-ta',
      queue: 'epic2-aural-primary',
      priority: 3,
      sequence: Epic2TcasAuralAlertManager.TA_AURAL_ID,
      continuous: false,
      repeat: false,
      timeout: 5000
    });

    this.auralRegistrationManager.register({
      uuid: 'epic2-tcas-ra',
      queue: 'epic2-aural-primary',
      priority: 3,
      sequence: Epic2TcasAuralAlertManager.TA_AURAL_ID,
      continuous: false,
      repeat: false,
      timeout: 5000
    });
  }

  /**
   * Initializes this manager. Once this manager is initialized, it will automatically trigger aural alerts in response
   * to traffic and resolution advisories.
   * @throws Error if this manager has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('Epic2TcasAuralAlertManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    const sub = this.bus.getSubscriber<AhrsEvents & TcasEvents>();

    this.subscriptions.push(
      sub.on('tcas_intruder_alert_changed').handle(this.onIntruderAlertChanged.bind(this)),
      sub.on('tcas_intruder_removed').handle(this.onIntruderRemoved.bind(this)),
      sub.on('tcas_ra_issued').handle(this.onResolutionAdvisoryIssued.bind(this)),
      sub.on('tcas_ra_updated').handle(this.onResolutionAdvisoryUpdated.bind(this)),
      sub.on('tcas_ra_canceled').handle(this.onResolutionAdvisoryCanceled.bind(this)),
    );
  }

  /**
   * Plays an aural if TCAS aurals aren't inhibited
   * @param aural The aural object
   */
  private playAural(aural: AuralAlertActivation): void {
    const flightArea = this.flightArea.get();
    const radioAlt = this.radioAlt.get();

    const isIncreaseDescent = aural.sequence?.includes(Epic2TcasAuralAlertManager.INCREASE_DESCENT_AURAL_ID) ?? false;
    if ((
      (flightArea === Epic2FlightArea.Departure && radioAlt > 1100) ||
      (flightArea === Epic2FlightArea.Approach && radioAlt > 900) ||
      (flightArea !== Epic2FlightArea.Departure && flightArea !== Epic2FlightArea.Approach)
    ) && ((isIncreaseDescent && radioAlt > 1450) || !isIncreaseDescent)
    ) {
      this.publisher.pub('aural_alert_activate', aural, true, false);
    }
  }

  /**
   * Responds to when the alert level of an intruder changes.
   * @param intruder The intruder whose alert level changed.
   */
  private onIntruderAlertChanged(intruder: TcasIntruder): void {
    if (intruder.alertLevel.get() === TcasAlertLevel.TrafficAdvisory) {
      if (!this.taIntruders.has(intruder)) {
        this.onTrafficAdvisoryIssued(intruder);
      }
    } else {
      if (this.taIntruders.has(intruder)) {
        this.onTrafficAdvisoryCanceled(intruder);
      }
    }
  }

  /**
   * Responds to when an intruder is removed.
   * @param intruder The removed intruder.
   */
  private onIntruderRemoved(intruder: TcasIntruder): void {
    if (this.taIntruders.has(intruder)) {
      this.onTrafficAdvisoryCanceled(intruder);
    }
  }

  /**
   * Responds to when a new traffic advisory is issued.
   * @param intruder The intruder for which the traffic advisory was issued.
   */
  private onTrafficAdvisoryIssued(intruder: TcasIntruder): void {
    const alias = Epic2TcasAuralAlertManager.getTrafficAdvisoryAlias(intruder);
    this.taIntruders.set(intruder, alias);

    const existingTa = this.taIntruders.size > 1;

    const sequence = existingTa ? Epic2TcasAuralAlertManager.TA_AURAL_ID : [Epic2TcasAuralAlertManager.TA_AURAL_ID, Epic2TcasAuralAlertManager.TA_AURAL_ID];
    const timeout = 4000;

    this.playAural({ uuid: 'epic2-tcas-ta', alias, sequence, timeout });
  }

  /**
   * Responds to when a traffic advisory is canceled.
   * @param intruder The intruder for which the traffic advisory was canceled.
   */
  private onTrafficAdvisoryCanceled(intruder: TcasIntruder): void {
    const alias = this.taIntruders.get(intruder);
    if (alias === undefined) {
      return;
    }

    this.taIntruders.delete(intruder);
    this.publisher.pub('aural_alert_deactivate', alias, true, false);
  }

  /**
   * Responds to when a new resolution advisory is issued.
   * @param raHost A host for information on the resolution advisory.
   */
  private onResolutionAdvisoryIssued(raHost: TcasResolutionAdvisoryHost): void {
    const { sequence, timeout } = this.generateResolutionAdvisorySequence(raHost);

    this.playAural({ uuid: 'epic2-tcas-ra', sequence, timeout });
  }

  /**
   * Responds to when an existing resolution advisory is updated.
   * @param raHost A host for information on the resolution advisory.
   */
  private onResolutionAdvisoryUpdated(raHost: TcasResolutionAdvisoryHost): void {
    const { sequence, timeout } = this.generateResolutionAdvisorySequence(raHost);

    // Deactivate the alert to force a refresh; otherwise the alert will not play again.
    this.publisher.pub('aural_alert_deactivate', 'epic2-tcas-ra', true, false);
    this.playAural({ uuid: 'epic2-tcas-ra', sequence, timeout });
  }

  /**
   * Responds to when a resolution advisory is canceled.
   */
  private onResolutionAdvisoryCanceled(): void {
    this.publisher.pub('aural_alert_deactivate', 'epic2-tcas-ra', true, false);
    this.publisher.pub('aural_alert_trigger', { uuid: 'epic2-tcas-ra', sequence: 'aural_clear_of_conflict' }, true, false);
  }

  /**
   * Generates a sound atom sequence for a resolution advisory.
   * @param raHost A host containing information on the resolution advisory.
   * @returns The sound atom sequence and timeout for a traffic advisory for the specified resolution advisory.
   */
  private generateResolutionAdvisorySequence(raHost: TcasResolutionAdvisoryHost): {
    /** A sound atom sequence. */
    sequence: string | string[];
    /** A timeout, in milliseconds, for the sequence. */
    timeout: number;
  } {
    let sequence: string | string[] | undefined;

    // A RA can either be single or composite. If it is single, then only its primary type is defined. If it is
    // composite, then its secondary type is always preventative. Therefore, only the primary type matters for
    // selecting an aural: if the primary is corrective, then we would want to skip the preventative aural for the
    // secondary type; if the primary is preventative, we would want to play the only aural available for
    // preventative RAs.

    sequence = Epic2TcasAuralAlertManager.RA_CORRECTIVE_AURAL_IDS[raHost.primaryType];
    if (sequence === undefined) {
      // RA is preventative, and there is only one aural for those: MONITOR VERTICAL SPEED.
      sequence = 'aural_monitor_vertical_speed';
    }

    return { sequence, timeout: 5000 + 3000 * (typeof sequence === 'string' ? 0 : Math.max(0, sequence.length - 1)) };
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.auralRegistrationManager.destroy();

    this.subscriptions.forEach(sub => { sub.destroy(); });
  }

  /**
   * Gets an aural alert alias for a traffic advisory.
   * @param intruder The intruder for which the traffic advisory was issued.
   * @returns An aural alert alias for a traffic advisory for the specified intruder.
   */
  private static getTrafficAdvisoryAlias(intruder: TcasIntruder): string {
    return `${Epic2TcasAuralAlertManager.TA_AURAL_ID}-intruder-${intruder.contact.uid}`;
  }
}

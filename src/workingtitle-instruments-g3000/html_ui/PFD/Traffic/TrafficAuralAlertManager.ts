/// <reference types="@microsoft/msfs-types/js/avionics" />

import {
  AhrsEvents, AuralAlertControlEvents, AuralAlertRegistrationManager, ConsumerValue, EventBus, MathUtils,
  NavMath, Subscription, TcasAlertLevel, TcasEvents, TcasIntruder,
  TcasResolutionAdvisoryHost, TcasResolutionAdvisoryType, UnitType, Vec2Math
} from '@microsoft/msfs-sdk';
import { TrafficSystem, TrafficSystemType } from '@microsoft/msfs-garminsdk';
import { AuralAlertUserSettings, AuralAlertVoiceSetting, G3000AuralAlertIds, G3000AuralAlertUtils } from '@microsoft/msfs-wtg3000-common';

/**
 * A manager which handles registration and activation of aural alerts in response to traffic and resolution
 * advisories.
 */
export class TrafficAuralAlertManager {
  private static readonly BEARING_AURAL_IDS = {
    [AuralAlertVoiceSetting.Male]: [
      'aural_twelve_o_clock_m',
      'aural_one_o_clock_m',
      'aural_two_o_clock_m',
      'aural_three_o_clock_m',
      'aural_four_o_clock_m',
      'aural_five_o_clock_m',
      'aural_six_o_clock_m',
      'aural_seven_o_clock_m',
      'aural_eight_o_clock_m',
      'aural_nine_o_clock_m',
      'aural_ten_o_clock_m',
      'aural_eleven_o_clock_m'
    ],
    [AuralAlertVoiceSetting.Female]: [
      'aural_twelve_o_clock_f',
      'aural_one_o_clock_f',
      'aural_two_o_clock_f',
      'aural_three_o_clock_f',
      'aural_four_o_clock_f',
      'aural_five_o_clock_f',
      'aural_six_o_clock_f',
      'aural_seven_o_clock_f',
      'aural_eight_o_clock_f',
      'aural_nine_o_clock_f',
      'aural_ten_o_clock_f',
      'aural_eleven_o_clock_f'
    ]
  };

  private static readonly ALTITUDE_AURAL_IDS = {
    [AuralAlertVoiceSetting.Male]: [
      'aural_low_m',
      'aural_same_altitude_m',
      'aural_high_m'
    ],
    [AuralAlertVoiceSetting.Female]: [
      'aural_low_f',
      'aural_same_altitude_f',
      'aural_high_f'
    ]
  };

  private static readonly DISTANCE_AURAL_IDS = {
    [AuralAlertVoiceSetting.Male]: [
      'aural_less_than_one_mile_m',
      'aural_one_mile_m',
      'aural_two_miles_m',
      'aural_three_miles_m',
      'aural_four_miles_m',
      'aural_five_miles_m',
      'aural_six_miles_m',
      'aural_seven_miles_m',
      'aural_eight_miles_m',
      'aural_nine_miles_m',
      'aural_ten_miles_m',
      'aural_more_than_ten_miles_m'
    ],
    [AuralAlertVoiceSetting.Female]: [
      'aural_less_than_one_mile_f',
      'aural_one_mile_f',
      'aural_two_miles_f',
      'aural_three_miles_f',
      'aural_four_miles_f',
      'aural_five_miles_f',
      'aural_six_miles_f',
      'aural_seven_miles_f',
      'aural_eight_miles_f',
      'aural_nine_miles_f',
      'aural_ten_miles_f',
      'aural_more_than_ten_miles_f'
    ]
  };

  private static readonly RA_CORRECTIVE_AURAL_IDS = {
    [AuralAlertVoiceSetting.Male]: {
      [TcasResolutionAdvisoryType.Climb]: ['aural_climb_m', 'aural_climb_m'],
      [TcasResolutionAdvisoryType.MaintainClimb]: 'aural_maintain_vertical_speed_maintain_m',
      [TcasResolutionAdvisoryType.CrossingClimb]: ['aural_climb_crossing_climb_m', 'aural_climb_crossing_climb_m'],
      [TcasResolutionAdvisoryType.CrossingMaintainClimb]: 'aural_maintain_vertical_speed_crossing_maintain_m',
      [TcasResolutionAdvisoryType.IncreaseClimb]: ['aural_increase_climb_m', 'aural_increase_climb_m'],
      [TcasResolutionAdvisoryType.ReversalClimb]: ['aural_climb_climb_now_m', 'aural_climb_climb_now_m'],
      [TcasResolutionAdvisoryType.Descend]: ['aural_descend_m', 'aural_descend_m'],
      [TcasResolutionAdvisoryType.MaintainDescend]: 'aural_maintain_vertical_speed_maintain_m',
      [TcasResolutionAdvisoryType.CrossingDescend]: ['aural_descend_crossing_descend_m', 'aural_descend_crossing_descend_m'],
      [TcasResolutionAdvisoryType.CrossingMaintainDescend]: 'aural_maintain_vertical_speed_crossing_maintain_m',
      [TcasResolutionAdvisoryType.IncreaseDescend]: ['aural_increase_descend_m', 'aural_increase_descend_m'],
      [TcasResolutionAdvisoryType.ReversalDescend]: ['aural_descend_descend_now_m', 'aural_descend_descend_now_m'],
      [TcasResolutionAdvisoryType.ReduceClimb]: ['aural_level_off_m', 'aural_level_off_m'],
      [TcasResolutionAdvisoryType.ReduceDescent]: ['aural_level_off_m', 'aural_level_off_m']
    } as Partial<Record<TcasResolutionAdvisoryType, string | string[]>>,
    [AuralAlertVoiceSetting.Female]: {
      [TcasResolutionAdvisoryType.Climb]: ['aural_climb_f', 'aural_climb_f'],
      [TcasResolutionAdvisoryType.MaintainClimb]: 'aural_maintain_vertical_speed_maintain_f',
      [TcasResolutionAdvisoryType.CrossingClimb]: ['aural_climb_crossing_climb_f', 'aural_climb_crossing_climb_f'],
      [TcasResolutionAdvisoryType.CrossingMaintainClimb]: 'aural_maintain_vertical_speed_crossing_maintain_f',
      [TcasResolutionAdvisoryType.IncreaseClimb]: ['aural_increase_climb_f', 'aural_increase_climb_f'],
      [TcasResolutionAdvisoryType.ReversalClimb]: ['aural_climb_climb_now_f', 'aural_climb_climb_now_f'],
      [TcasResolutionAdvisoryType.Descend]: ['aural_descend_f', 'aural_descend_f'],
      [TcasResolutionAdvisoryType.MaintainDescend]: 'aural_maintain_vertical_speed_maintain_f',
      [TcasResolutionAdvisoryType.CrossingDescend]: ['aural_descend_crossing_descend_f', 'aural_descend_crossing_descend_f'],
      [TcasResolutionAdvisoryType.CrossingMaintainDescend]: 'aural_maintain_vertical_speed_crossing_maintain_f',
      [TcasResolutionAdvisoryType.IncreaseDescend]: ['aural_increase_descend_f', 'aural_increase_descend_f'],
      [TcasResolutionAdvisoryType.ReversalDescend]: ['aural_descend_descend_now_f', 'aural_descend_descend_now_f'],
      [TcasResolutionAdvisoryType.ReduceClimb]: ['aural_level_off_f', 'aural_level_off_f'],
      [TcasResolutionAdvisoryType.ReduceDescent]: ['aural_level_off_f', 'aural_level_off_f']
    } as Partial<Record<TcasResolutionAdvisoryType, string | string[]>>
  };

  private readonly publisher = this.bus.getPublisher<AuralAlertControlEvents>();

  private readonly auralRegistrationManager = new AuralAlertRegistrationManager(this.bus);

  private readonly airplaneHeadingTrue = ConsumerValue.create(null, 0);

  private readonly taIntruders = new Map<TcasIntruder, string>();

  private readonly voice = AuralAlertUserSettings.getManager(this.bus).voice;

  private isAlive = true;
  private isInit = false;

  private readonly subscriptions: Subscription[] = [];

  /**
   * Creates a new instance of TrafficAuralAlertManager.
   * @param bus The event bus.
   * @param trafficSystem The traffic system.
   */
  public constructor(private readonly bus: EventBus, private readonly trafficSystem: TrafficSystem) {
    this.auralRegistrationManager.register({
      uuid: G3000AuralAlertIds.TcasTA,
      queue: G3000AuralAlertUtils.PRIMARY_QUEUE,
      priority: G3000AuralAlertUtils.PRIORITIES[G3000AuralAlertIds.TcasTA],
      sequence: 'aural_traffic_f',
      continuous: false,
      repeat: false,
      timeout: 5000
    });

    if (trafficSystem.type === TrafficSystemType.TcasII) {
      this.auralRegistrationManager.register({
        uuid: G3000AuralAlertIds.TcasRA,
        queue: G3000AuralAlertUtils.PRIMARY_QUEUE,
        priority: G3000AuralAlertUtils.PRIORITIES[G3000AuralAlertIds.TcasRA],
        sequence: 'aural_traffic_f',
        continuous: false,
        repeat: false,
        timeout: 5000
      });
    }
  }

  /**
   * Initializes this manager. Once this manager is initialized, it will automatically trigger aural alerts in response
   * to traffic and resolution advisories.
   * @throws Error if this manager has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('TrafficAuralAlertManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    const sub = this.bus.getSubscriber<AhrsEvents & TcasEvents>();

    this.airplaneHeadingTrue.setConsumer(sub.on('actual_hdg_deg_true'));

    this.subscriptions.push(
      sub.on('tcas_intruder_alert_changed').handle(this.onIntruderAlertChanged.bind(this)),
      sub.on('tcas_intruder_removed').handle(this.onIntruderRemoved.bind(this)),
    );

    if (this.trafficSystem.type === TrafficSystemType.TcasII) {
      this.subscriptions.push(
        sub.on('tcas_ra_issued').handle(this.onResolutionAdvisoryIssued.bind(this)),
        sub.on('tcas_ra_updated').handle(this.onResolutionAdvisoryUpdated.bind(this)),
        sub.on('tcas_ra_canceled').handle(this.onResolutionAdvisoryCanceled.bind(this)),
      );
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
    const alias = TrafficAuralAlertManager.getTrafficAdvisoryAlias(intruder);
    this.taIntruders.set(intruder, alias);

    const { sequence, timeout } = this.generateTrafficAdvisoryAlertSequence(intruder);

    this.publisher.pub('aural_alert_activate', { uuid: G3000AuralAlertIds.TcasTA, alias, sequence, timeout }, true, false);
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
   * Generates a sound atom sequence for a traffic advisory.
   * @param intruder The intruder for which the traffic advisory was issued.
   * @returns The sound atom sequence and timeout for a traffic advisory for the specified intruder.
   */
  private generateTrafficAdvisoryAlertSequence(intruder: TcasIntruder): {
    /** A sound atom sequence. */
    sequence: string[];
    /** A timeout, in milliseconds, for the sequence. */
    timeout: number;
  } {
    const sequence: string[] = [];
    let timeout = 0;

    const voice = this.voice.get();
    const trafficId = voice === AuralAlertVoiceSetting.Female ? 'aural_traffic_f' : 'aural_traffic_m';

    if (this.trafficSystem.type === TrafficSystemType.Tis) {
      sequence.push(trafficId);
      timeout += 2000;
    } else {
      sequence.push(trafficId, trafficId);
      timeout += 4000;
    }

    const bearing = 90 - Vec2Math.theta(intruder.relativePositionVec) * Avionics.Utils.RAD2DEG;
    const relativeBearing = NavMath.normalizeHeading(bearing - this.airplaneHeadingTrue.get());
    if (isFinite(relativeBearing)) {
      sequence.push(TrafficAuralAlertManager.BEARING_AURAL_IDS[voice][MathUtils.clamp(Math.floor((relativeBearing + 15) % 360 / 30), 0, 11)]);
    } else {
      sequence.push(voice === AuralAlertVoiceSetting.Female ? 'aural_no_bearing_f' : 'aural_no_bearing_m');
    }
    timeout += 2000;

    const relativeAlt = UnitType.METER.convertTo(intruder.relativePositionVec[2], UnitType.FOOT);
    if (isFinite(relativeAlt)) {
      sequence.push(TrafficAuralAlertManager.ALTITUDE_AURAL_IDS[voice][MathUtils.clamp(Math.round(relativeAlt / 400), -1, 1) + 1]);
    } else {
      sequence.push(voice === AuralAlertVoiceSetting.Female ? 'aural_altitude_not_available_f' : 'aural_altitude_not_available_m');
    }
    timeout += 2000;

    const distance = UnitType.METER.convertTo(Vec2Math.abs(intruder.relativePositionVec), UnitType.NMILE);
    if (isFinite(distance)) {
      sequence.push(TrafficAuralAlertManager.DISTANCE_AURAL_IDS[voice][MathUtils.clamp(Math.floor(distance), 0, 11)]);
      timeout += 2000;
    }

    return { sequence, timeout };
  }

  /**
   * Responds to when a new resolution advisory is issued.
   * @param raHost A host for information on the resolution advisory.
   */
  private onResolutionAdvisoryIssued(raHost: TcasResolutionAdvisoryHost): void {
    const { sequence, timeout } = this.generateResolutionAdvisorySequence(raHost);

    this.publisher.pub('aural_alert_activate', { uuid: G3000AuralAlertIds.TcasRA, sequence, timeout }, true, false);
  }

  /**
   * Responds to when an existing resolution advisory is updated.
   * @param raHost A host for information on the resolution advisory.
   */
  private onResolutionAdvisoryUpdated(raHost: TcasResolutionAdvisoryHost): void {
    const { sequence, timeout } = this.generateResolutionAdvisorySequence(raHost);

    // Deactivate the alert to force a refresh; otherwise the alert will not play again.
    this.publisher.pub('aural_alert_deactivate', G3000AuralAlertIds.TcasRA, true, false);
    this.publisher.pub('aural_alert_activate', { uuid: G3000AuralAlertIds.TcasRA, sequence, timeout }, true, false);
  }

  /**
   * Responds to when a resolution advisory is canceled.
   */
  private onResolutionAdvisoryCanceled(): void {
    const sequence = this.voice.get() === AuralAlertVoiceSetting.Male ? 'aural_clear_of_conflict_m' : 'aural_clear_of_conflict_f';

    this.publisher.pub('aural_alert_deactivate', G3000AuralAlertIds.TcasRA, true, false);
    this.publisher.pub('aural_alert_trigger', { uuid: G3000AuralAlertIds.TcasRA, sequence }, true, false);
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

    const voice = this.voice.get();

    // A RA can either be single or composite. If it is single, then only its primary type is defined. If it is
    // composite, then its secondary type is always preventative. Therefore, only the primary type matters for
    // selecting an aural: if the primary is corrective, then we would want to skip the preventative aural for the
    // secondary type; if the primary is preventative, we would want to play the only aural available for
    // preventative RAs.

    sequence = TrafficAuralAlertManager.RA_CORRECTIVE_AURAL_IDS[voice][raHost.primaryType];
    if (sequence === undefined) {
      // RA is preventative, and there is only one aural for those: MONITOR VERTICAL SPEED.
      sequence = voice === AuralAlertVoiceSetting.Female ? 'aural_monitor_vertical_speed_f' : 'aural_monitor_vertical_speed_m';
    }

    return { sequence, timeout: 5000 + 3000 * (typeof sequence === 'string' ? 0 : Math.max(0, sequence.length - 1)) };
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.auralRegistrationManager.destroy();

    this.airplaneHeadingTrue.destroy();

    this.subscriptions.forEach(sub => { sub.destroy(); });
  }

  /**
   * Gets an aural alert alias for a traffic advisory.
   * @param intruder The intruder for which the traffic advisory was issued.
   * @returns An aural alert alias for a traffic advisory for the specified intruder.
   */
  private static getTrafficAdvisoryAlias(intruder: TcasIntruder): string {
    return `${G3000AuralAlertIds.TcasTA}-intruder-${intruder.contact.uid}`;
  }
}
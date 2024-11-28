import { EventBus, IndexedEventType } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';
import { MagVar } from '../geo/MagVar';
import { SimVarPublisher } from './BasePublishers';

/**
 * Base events related to attitude and heading of the airplane.
 */
export interface BaseAhrsEvents {
  /** The indicated heading of the airplane, in degrees magnetic. */
  hdg_deg: number;

  /** The indicated heading of the airplane, in degrees true. */
  hdg_deg_true: number;

  /** The indicated pitch of the airplane, in degrees. Positive values indicate downward pitch. */
  pitch_deg: number;

  /** The indicated roll (bank) of the airplane, in degrees. Positive values indicate leftward roll. */
  roll_deg: number;

  /** A turn coordinator ball value. */
  turn_coordinator_ball: number;

  /** The turn rate of the airplane, in degrees per second. */
  delta_heading_rate: number;

  /** The actual heading of the airplane, in degrees magnetic. */
  actual_hdg_deg: number;

  /** The actual heading of the airplane, in degrees true. */
  actual_hdg_deg_true: number;

  /** The actual pitch of the airplane, in degrees. Positive values indicate downward pitch. */
  actual_pitch_deg: number;

  /** The actual roll (bank) of the airplane, in degrees. Positive values indicate leftward roll. */
  actual_roll_deg: number;
}

/**
 * Topics that are indexed by attitude indicator.
 */
type AhrsAttitudeIndexedTopics = 'pitch_deg' | 'roll_deg';

/**
 * Topics that are indexed by direction indicator.
 */
type AhrsDirectionIndexedTopics = 'hdg_deg' | 'hdg_deg_true' | 'delta_heading_rate';

/**
 * All topics related to attitude and heading of the airplane that are indexed.
 */
type AhrsIndexedTopics = AhrsAttitudeIndexedTopics | AhrsDirectionIndexedTopics;

/**
 * Indexed events related to attitude and heading of the airplane.
 */
type AhrsIndexedEvents = {
  [P in keyof Pick<BaseAhrsEvents, AhrsIndexedTopics> as IndexedEventType<P>]: BaseAhrsEvents[P];
};

/**
 * Events related to attitude and heading of the airplane.
 */
export interface AhrsEvents extends BaseAhrsEvents, AhrsIndexedEvents {
}

/**
 * A publisher for AHRS information.
 */
export class AhrsPublisher extends SimVarPublisher<AhrsEvents> {
  private readonly registeredSimVarIds = {
    magVar: SimVar.GetRegisteredId('MAGVAR', SimVarValueType.Degree, ''),
  };

  private magVar: number;
  private needUpdateMagVar: boolean;

  /**
   * Creates an AhrsPublisher.
   * @param bus The event bus to which to publish.
   * @param pacer An optional pacer to use to control the rate of publishing.
   */
  public constructor(bus: EventBus, pacer?: PublishPacer<AhrsEvents>) {
    super([
      ['pitch_deg', { name: 'ATTITUDE INDICATOR PITCH DEGREES:#index#', type: SimVarValueType.Degree, indexed: true }],
      ['roll_deg', { name: 'ATTITUDE INDICATOR BANK DEGREES:#index#', type: SimVarValueType.Degree, indexed: true }],

      ['hdg_deg', { name: 'HEADING INDICATOR:#index#', type: SimVarValueType.Degree, indexed: true }],
      ['hdg_deg_true', { name: 'HEADING INDICATOR:#index#', type: SimVarValueType.Degree, map: (heading): number => MagVar.magneticToTrue(heading, this.magVar), indexed: true }],
      ['delta_heading_rate', { name: 'DELTA HEADING RATE:#index#', type: SimVarValueType.Degree, indexed: true }],

      ['turn_coordinator_ball', { name: 'TURN COORDINATOR BALL', type: SimVarValueType.Number }],
      ['actual_hdg_deg', { name: 'PLANE HEADING DEGREES MAGNETIC', type: SimVarValueType.Degree }],
      ['actual_hdg_deg_true', { name: 'PLANE HEADING DEGREES TRUE', type: SimVarValueType.Degree }],
      ['actual_pitch_deg', { name: 'PLANE PITCH DEGREES', type: SimVarValueType.Degree }],
      ['actual_roll_deg', { name: 'PLANE BANK DEGREES', type: SimVarValueType.Degree }],
    ], bus, pacer);

    this.magVar = 0;
    this.needUpdateMagVar ??= false;
  }

  /** @inheritdoc */
  protected onTopicSubscribed(topic: keyof AhrsEvents): void {
    super.onTopicSubscribed(topic);

    if (topic.startsWith('hdg_deg_true')) {
      this.needUpdateMagVar = true;
    }
  }

  /** @inheritdoc */
  public onUpdate(): void {
    if (this.needUpdateMagVar) {
      this.magVar = SimVar.GetSimVarValueFastReg(this.registeredSimVarIds.magVar);
    }

    super.onUpdate();
  }
}

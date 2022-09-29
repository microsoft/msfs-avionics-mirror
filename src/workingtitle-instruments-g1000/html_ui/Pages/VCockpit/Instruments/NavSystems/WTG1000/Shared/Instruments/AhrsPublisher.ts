import { AhrsEvents, EventBus, PublishPacer, SimVarPublisher, SimVarPublisherEntry, SimVarValueType } from 'msfssdk';

/**
 * A publisher for AHRS information for the Nxi which sources data from PLANE simvars instead of the attitude and
 * heading indicator simvars.
 *
 * This class is meant to be a temporary fix for the vacuum gyro problem until the Nxi can be made to fully support
 * customizable attitude/heading indicator indexes.
 */
export class AhrsPublisher extends SimVarPublisher<AhrsEvents> {
  private static readonly SIMVARS: [keyof AhrsEvents, SimVarPublisherEntry<any>][] = [
    ['hdg_deg', { name: 'PLANE HEADING DEGREES MAGNETIC', type: SimVarValueType.Degree }],
    ['hdg_deg_true', { name: 'PLANE HEADING DEGREES TRUE', type: SimVarValueType.Degree }],
    ['delta_heading_rate', { name: 'DELTA HEADING RATE', type: SimVarValueType.Degree }],
    ['pitch_deg', { name: 'PLANE PITCH DEGREES', type: SimVarValueType.Degree }],
    ['roll_deg', { name: 'PLANE BANK DEGREES', type: SimVarValueType.Degree }],
    ['turn_coordinator_ball', { name: 'TURN COORDINATOR BALL', type: SimVarValueType.Number }],
  ];

  /**
   * Creates an AhrsPublisher.
   * @param bus The event bus to which to publish.
   * @param pacer An optional pacer to use to control the rate of publishing.
   */
  public constructor(bus: EventBus, pacer?: PublishPacer<AhrsEvents>) {
    super(new Map(AhrsPublisher.SIMVARS), bus, pacer);
  }
}
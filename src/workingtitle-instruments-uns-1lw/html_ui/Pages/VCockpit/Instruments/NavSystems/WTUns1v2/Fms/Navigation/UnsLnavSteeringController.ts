import {
  Accessible, AdcEvents, AhrsEvents, APRollSteerDirectorSteerCommand, ConsumerSubject, EventBus, LerpLookupTable,
  LNavRollSteerCommand, Subject
} from '@microsoft/msfs-sdk';

import { UnsLnavHeadingSteerCommand } from './UnsLnavHeadingSteerCommand';

/**
 * Events to control a {@link UnsLnavSteeringController}
 */
export interface UnsLnavControlEvents {
  /** Sets the current active LNAV mode */
  'unslnav_set_mode': UnsLnavMode,

  /** Sets the current commanded heading */
  'unslnav_set_commanded_heading': [number, 'left' | 'right'],
}

/**
 * UNS-1 LNAV steering events
 */
export interface UnsLnavSteeringStateEvents {
  /** The current LNAV mode. */
  uns_lnav_mode: UnsLnavMode,

  /** Whether the current LNAV steering command is valid. */
  uns_lnav_steer_command_valid: boolean;

  /**
   * The current LNAV desired true track, in degrees.
   */
  uns_lnav_dtk: number;

  /**
   * The current LNAV cross-track error, in nautical miles. Positive values indicate that the plane is to the right of
   * the desired track.
   */
  uns_lnav_xtk: number;

  /** The current LNAV track angle error, in degrees in the range `[-180, 180)`. */
  uns_lnav_tae: number;

  /** The current desired bank angle computed by LNAV, in degrees. Positive values indicate leftward bank. */
  uns_lnav_desired_bank_angle: number;

  /** the current commanded heading */
  uns_lnav_commanded_heading: number | null,

  /** the current commanded turn direction */
  uns_lnav_commanded_turn_direction: 'left' | 'right' | null,
}

export enum UnsLnavMode {
  FlightPlanTracking = 'FP_TRACKING',
  Heading = 'HDG',
  HeadingIntercept = 'HDG_INTCPT',
}

/**
 * UNS-1 LNAV steering provider
 */
export class UnsLnavSteeringController {
  public static readonly NULL_COMMAND: LNavRollSteerCommand = {
    isValid: false,
    isHeading: false,
    courseToSteer: 0,
    trackRadius: 0,
    dtk: 0,
    xtk: 0,
    tae: 0,
    desiredBankAngle: 0
  };

  private readonly lnavMode = Subject.create<UnsLnavMode>(UnsLnavMode.FlightPlanTracking);

  private readonly commandedHeadingSub = Subject.create<number | null>(null);

  private readonly commandedTurnDirectionSub = Subject.create<'left' | 'right' | null>(null);

  private readonly planeHeadingSub = ConsumerSubject.create<number | null>(null, null);

  private readonly planeAltitudeSub = ConsumerSubject.create<number | null>(null, null);

  private readonly headingSteerCommand = new UnsLnavHeadingSteerCommand(
    this.commandedHeadingSub,
    this.commandedTurnDirectionSub,
    this.planeHeadingSub,
    this.planeAltitudeSub,
    this.maxBankAngleTable,
  );

  public readonly steerCommand: Accessible<Readonly<APRollSteerDirectorSteerCommand>> = {
    get: (): Readonly<APRollSteerDirectorSteerCommand> => {
      let command = UnsLnavSteeringController.NULL_COMMAND;

      switch (this.lnavMode.get()) {
        case UnsLnavMode.FlightPlanTracking:
          command = this.getFlightPlanTrackingCommand();
          break;
        case UnsLnavMode.Heading:
          command = this.headingSteerCommand.get();
          break;
        case UnsLnavMode.HeadingIntercept:
          // noop;
          break;
      }

      this.publishCommandDetails(command);

      return command;
    }
  };

  /**
   * Constructor
   *
   * @param bus the event bus
   * @param lnavRollSteerCommand The roll-steering command computed by the LNAV computer.
   * @param maxBankAngleTable a lookup table, if applicable, of altitudes to bank angle limits.
   * If not specified, only the 30 degree limit is used.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly lnavRollSteerCommand: Accessible<Readonly<LNavRollSteerCommand>>,
    private readonly maxBankAngleTable: LerpLookupTable | undefined
  ) {
    // TODO simulate heading/altitude source?
    this.planeHeadingSub.setConsumer(bus.getSubscriber<AhrsEvents>().on('hdg_deg').whenChanged());
    this.planeAltitudeSub.setConsumer(bus.getSubscriber<AdcEvents>().on('pressure_alt').whenChanged());

    this.setupControlEvents();
  }

  /**
   * Sets up the LNAV control events
   */
  private setupControlEvents(): void {
    const controlEventsSub = this.bus.getSubscriber<UnsLnavControlEvents>();

    controlEventsSub.on('unslnav_set_mode').handle((mode) => this.lnavMode.set(mode));
    controlEventsSub.on('unslnav_set_commanded_heading').handle(([heading, turnDirection]) => {
      this.commandedHeadingSub.set(heading);
      this.commandedTurnDirectionSub.set(turnDirection);
    });
  }

  /**
   * Publishes details of the GPS steering command
   *
   * @param command the command
   */
  private publishCommandDetails(command: LNavRollSteerCommand): void {
    const pub = this.bus.getPublisher<UnsLnavSteeringStateEvents>();

    pub.pub('uns_lnav_mode', this.lnavMode.get());
    pub.pub('uns_lnav_commanded_heading', this.commandedHeadingSub.get());
    pub.pub('uns_lnav_commanded_turn_direction', this.commandedTurnDirectionSub.get());
    pub.pub('uns_lnav_steer_command_valid', command.isValid);
    pub.pub('uns_lnav_desired_bank_angle', command.desiredBankAngle);
    pub.pub('uns_lnav_dtk', command.dtk);
    pub.pub('uns_lnav_xtk', command.xtk);
    pub.pub('uns_lnav_tae', command.tae);
  }

  /**
   * Returns the steering command for the FlightPlanTracking LNAV mode
   *
   * @returns a GPS steering command
   */
  private getFlightPlanTrackingCommand(): Readonly<LNavRollSteerCommand> {
    return this.lnavRollSteerCommand.get();
  }
}

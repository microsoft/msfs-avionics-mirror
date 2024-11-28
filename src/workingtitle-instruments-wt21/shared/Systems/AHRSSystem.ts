import { AhrsEvents, AvionicsSystemState, AvionicsSystemStateEvent, BaseAhrsEvents, BasicAvionicsSystem, EventBus, EventBusMetaEvents, LinearServo, Subject, Subscription } from '@microsoft/msfs-sdk';

import { AhrsDefinition } from '../Config/SensorsConfig';

enum InitializationPhase {
  ALIGN,
  TOHDG
}

/**
 * Data events published by the AHRS system.
 */
type AhrsDataEvents = {
  [P in keyof BaseAhrsEvents as `ahrs_${P}_${number}`]: BaseAhrsEvents[P];
};

/**
 * Events published by AHRS systems.
 */
export interface AhrsSystemEvents extends AhrsDataEvents {
  /** An event fired when an AHRS system state changes. */
  [ahrs_state: `ahrs_state_${number}`]: AvionicsSystemStateEvent;

  /** A event for a mock heading value provided during initialization. */
  [ahrs_init_hdg_deg: `ahrs_init_hdg_deg_${number}`]: number;

  /** An event fired when the heading data state of an AHRS system changes. */
  [ahrs_heading_data_valid: `ahrs_heading_data_valid_${number}`]: boolean;

  /** An event fired when the attitude data state of an AHRS system changes. */
  [ahrs_attitude_data_valid: `ahrs_attitude_data_valid_${number}`]: boolean;
}

/**
 * The AHRS system.
 */
export class AhrsSystem extends BasicAvionicsSystem<AhrsSystemEvents> {
  protected initializationTime = 30000;

  private isHeadingDataValid = true;
  private isAttitudeDataValid = true;

  private readonly INIT_RATE = 12;
  private readonly FAST_INIT_RATE = 210;
  private initServo = new LinearServo(this.INIT_RATE);
  private initPhase = InitializationPhase.ALIGN;
  private initHdgDeg = 0;
  private targetHdgDeg = 360;
  private planeHdgDeg = 0;

  private readonly rollSub = this.bus.getSubscriber<AhrsEvents>().on('roll_deg').whenChanged().handle(this.onRollChanged.bind(this), true);
  private readonly headingDataSourceTopicMap = {
    [`ahrs_hdg_deg_${this.index}`]: `hdg_deg_${this.definition.directionIndicatorIndex}`,
    [`ahrs_hdg_deg_true_${this.index}`]: `hdg_deg_true_${this.definition.directionIndicatorIndex}`
  } as const;
  private readonly attitudeDataSourceTopicMap = {
    [`ahrs_delta_heading_rate_${this.index}`]: `delta_heading_rate_${this.definition.attitudeIndicatorIndex}`,
    [`ahrs_pitch_deg_${this.index}`]: `pitch_deg_${this.definition.attitudeIndicatorIndex}`,
    [`ahrs_roll_deg_${this.index}`]: `roll_deg_${this.definition.attitudeIndicatorIndex}`,
    [`ahrs_turn_coordinator_ball_${this.index}`]: 'turn_coordinator_ball'
  } as const;

  private readonly headingDataSubs: Subscription[] = [];
  private readonly attitudeDataSubs: Subscription[] = [];

  private readonly dataSourceSubscriber = this.bus.getSubscriber<AhrsEvents>();

  /**
   * Creates an instance of an AHRS system.
   * @param index The index of the AHRS.
   * @param bus An instance of the event bus.
   * @param definition An AHRS config definition
   */
  constructor(public readonly index: number, protected readonly bus: EventBus, private readonly definition: AhrsDefinition) {
    super(index, bus, `ahrs_state_${index}`);

    this.publisher.pub(`ahrs_heading_data_valid_${index}`, this.isHeadingDataValid);
    this.publisher.pub(`ahrs_attitude_data_valid_${index}`, this.isAttitudeDataValid);

    this.connectToPower(definition.electricity ?? Subject.create(true));

    this.bus.getSubscriber<AhrsEvents>().on('hdg_deg').withPrecision(2).handle((hdg) => this.planeHdgDeg = hdg);

    this.startDataPublish();
  }

  /** @inheritdoc */
  protected onPowerChanged(isPowered: boolean): void {
    const wasPowered = this.isPowered;

    this.isPowered = isPowered;

    if (wasPowered === undefined) {
      this.setState(isPowered ? AvionicsSystemState.On : AvionicsSystemState.Off);
    } else {
      if (isPowered) {
        this.setState(AvionicsSystemState.Initializing);
        this.rollSub.resume(true);

        this.startInitializing();
      } else {
        this.rollSub.pause();
        this.initializationTimer.clear();
        this.setState(AvionicsSystemState.Off);
      }
    }
  }

  /**
   * Starts the initialization logic for this system.
   */
  private startInitializing(): void {
    this.rollSub.resume(true);
    this.initServo = new LinearServo(this.INIT_RATE);
    this.initHdgDeg = 0;
    this.targetHdgDeg = 360;
    this.initPhase = InitializationPhase.ALIGN;
    this.setState(AvionicsSystemState.Initializing);
    this.publisher.pub(`ahrs_init_hdg_deg_${this.index}`, this.initHdgDeg, false, false);
  }

  /** @inheritdoc */
  public onUpdate(): void {
    super.onUpdate();
    if (this.state === AvionicsSystemState.Initializing) {
      this.initHdgDeg = this.initServo.drive(this.initHdgDeg, this.targetHdgDeg);
      this.publisher.pub(`ahrs_init_hdg_deg_${this.index}`, this.initPhase === InitializationPhase.ALIGN ? -this.initHdgDeg : this.initHdgDeg, false, false);
      if (this.initHdgDeg >= this.targetHdgDeg) {
        if (this.initPhase === InitializationPhase.ALIGN) {
          this.initPhase = InitializationPhase.TOHDG;
          this.initHdgDeg = 0;
          this.targetHdgDeg = this.planeHdgDeg;
          this.initServo = new LinearServo(this.FAST_INIT_RATE);
        } else {
          this.publisher.pub(`ahrs_init_hdg_deg_${this.index}`, this.planeHdgDeg, false, false);
          this.setState(AvionicsSystemState.On);
        }
      }
    }
  }

  /**
   * Starts publishing AHRS data on the event bus.
   */
  private startDataPublish(): void {
    for (const topic of Object.keys(this.headingDataSourceTopicMap)) {
      if (this.bus.getTopicSubscriberCount(topic) > 0) {
        this.onHeadingTopicSubscribed(topic as keyof AhrsDataEvents);
      }
    }

    for (const topic of Object.keys(this.attitudeDataSourceTopicMap)) {
      if (this.bus.getTopicSubscriberCount(topic) > 0) {
        this.onAttitudeTopicSubscribed(topic as keyof AhrsDataEvents);
      }
    }

    this.bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(topic => {
      if (topic in this.headingDataSourceTopicMap) {
        this.onHeadingTopicSubscribed(topic as keyof AhrsDataEvents);
      } else if (topic in this.attitudeDataSourceTopicMap) {
        this.onAttitudeTopicSubscribed(topic as keyof AhrsDataEvents);
      }
    });
  }

  /**
   * Responds to when someone first subscribes to one of this system's heading data topics on the event bus.
   * @param topic The topic that was subscribed to.
   */
  private onHeadingTopicSubscribed(topic: keyof AhrsDataEvents): void {
    this.headingDataSubs.push(this.dataSourceSubscriber.on(this.headingDataSourceTopicMap[topic]).handle(val => {
      this.publisher.pub(topic, val, false, true);
    }, !this.isHeadingDataValid));
  }

  /**
   * Responds to when someone first subscribes to one of this system's attitude data topics on the event bus.
   * @param topic The topic that was subscribed to.
   */
  private onAttitudeTopicSubscribed(topic: keyof AhrsDataEvents): void {
    this.attitudeDataSubs.push(this.dataSourceSubscriber.on(this.attitudeDataSourceTopicMap[topic]).handle(val => {
      this.publisher.pub(topic, val, false, true);
    }, !this.isAttitudeDataValid));
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onStateChanged(previousState: AvionicsSystemState | undefined, currentState: AvionicsSystemState): void {
    this.updateHeadingDataState();
    this.updateAttitudeDataState();
  }

  /**
   * Updates the validity state of this system's heading data. If heading data is valid, this system will start
   * publishing heading data. If heading data is invalid, this system will stop publishing heading data.
   */
  private updateHeadingDataState(): void {
    const isHeadingDataValid = (this._state === undefined || this._state === AvionicsSystemState.On);

    if (isHeadingDataValid !== this.isHeadingDataValid) {
      this.isHeadingDataValid = isHeadingDataValid;

      if (isHeadingDataValid) {
        for (const sub of this.headingDataSubs) {
          sub.resume(true);
        }
      } else {
        for (const sub of this.headingDataSubs) {
          sub.pause();
        }
      }

      this.publisher.pub(`ahrs_heading_data_valid_${this.index}`, this.isHeadingDataValid, false, true);
    }
  }

  /**
   * Updates the validity state of this system's attitude data. If attitude data is valid, this system will start
   * publishing attitude data. If attitude data is invalid, this system will stop publishing attitude data.
   */
  private updateAttitudeDataState(): void {
    const isAttitudeDataValid = (this._state === undefined || this._state === AvionicsSystemState.On);
    // TODO: add logic for no-ADC and no-GPS reversionary modes

    if (isAttitudeDataValid !== this.isAttitudeDataValid) {
      this.isAttitudeDataValid = isAttitudeDataValid;

      if (isAttitudeDataValid) {
        for (const sub of this.attitudeDataSubs) {
          sub.resume(true);
        }
      } else {
        for (const sub of this.attitudeDataSubs) {
          sub.pause();
        }
      }

      this.publisher.pub(`ahrs_attitude_data_valid_${this.index}`, this.isAttitudeDataValid, false, true);
    }
  }

  /**
   * Handles when the bank angle changes while AHRS is initializing.
   * @param bankAngle The bank angle of the aircraft.
   */
  private onRollChanged(bankAngle: number): void {
    if (this.state === AvionicsSystemState.Initializing && Math.abs(bankAngle) >= 20) {
      this.startInitializing();
    }
  }
}

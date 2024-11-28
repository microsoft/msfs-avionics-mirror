import {
  AhrsEvents, AvionicsSystemState, AvionicsSystemStateEvent, BaseAhrsEvents, BasicAvionicsSystem, EventBus,
  EventBusMetaEvents, Subject, Subscribable, Subscription, SystemPowerKey
} from '@microsoft/msfs-sdk';

import { AdcSystemEvents } from './AdcSystem';
import { MagnetometerSystemEvents } from './MagnetometerSystem';

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

  /** An event fired when the heading data state of an AHRS system changes. */
  [ahrs_heading_data_valid: `ahrs_heading_data_valid_${number}`]: boolean;

  /** An event fired when the attitude data state of an AHRS system changes. */
  [ahrs_attitude_data_valid: `ahrs_attitude_data_valid_${number}`]: boolean;
}

/**
 * A Garmin AHRS system.
 */
export class AhrsSystem extends BasicAvionicsSystem<AhrsSystemEvents> {
  protected initializationTime = 45000;

  private magnetometerState: AvionicsSystemState | undefined = undefined;
  private adcState: AvionicsSystemState | undefined = undefined;
  // TODO: add GPS data state

  private isHeadingDataValid = true;
  private isAttitudeDataValid = true;

  private readonly rollSub = this.bus.getSubscriber<AhrsEvents>().on('roll_deg').whenChanged().handle(this.onRollChanged.bind(this), true);

  private readonly headingDataSourceTopicMap = {
    [`ahrs_hdg_deg_${this.index}`]: `hdg_deg_${this.directionIndicatorIndex}`,
    [`ahrs_hdg_deg_true_${this.index}`]: `hdg_deg_true_${this.directionIndicatorIndex}`
  } as const;
  private readonly attitudeDataSourceTopicMap = {
    [`ahrs_delta_heading_rate_${this.index}`]: `delta_heading_rate_${this.attitudeIndicatorIndex}`,
    [`ahrs_pitch_deg_${this.index}`]: `pitch_deg_${this.attitudeIndicatorIndex}`,
    [`ahrs_roll_deg_${this.index}`]: `roll_deg_${this.attitudeIndicatorIndex}`,
    [`ahrs_turn_coordinator_ball_${this.index}`]: 'turn_coordinator_ball'
  } as const;

  private readonly dataSourceSubscriber = this.bus.getSubscriber<AhrsEvents>();

  private readonly headingDataSubs: Subscription[] = [];
  private readonly attitudeDataSubs: Subscription[] = [];

  /**
   * Creates an instance of an AHRS system.
   * @param index The index of the AHRS.
   * @param bus An instance of the event bus.
   * @param attitudeIndicatorIndex The index of the sim attitude indicator from which this AHRS derives its data.
   * @param directionIndicatorIndex The index of the sim direction indicator from which this AHRS derives its data.
   * @param powerSource The source from which to retrieve the system's power state. Can be an event bus topic defined
   * in {@link ElectricalEvents} with boolean-valued data, an XML logic element that evaluates to zero (false) or
   * non-zero (true) values, or a boolean-valued subscribable. If not defined, then the system will be considered
   * always powered on.
   */
  public constructor(
    index: number,
    bus: EventBus,
    private readonly attitudeIndicatorIndex: number,
    private readonly directionIndicatorIndex: number,
    powerSource?: SystemPowerKey | CompositeLogicXMLElement | Subscribable<boolean>,
  ) {
    super(index, bus, `ahrs_state_${index}` as const);

    this.publisher.pub(`ahrs_heading_data_valid_${index}`, this.isHeadingDataValid);
    this.publisher.pub(`ahrs_attitude_data_valid_${index}`, this.isAttitudeDataValid);

    this.connectToPower(powerSource ?? Subject.create(true));

    this.bus.getSubscriber<MagnetometerSystemEvents>()
      .on(`magnetometer_state_${index}`)
      .handle(evt => {
        this.magnetometerState = evt.current;
        this.updateHeadingDataState();
      });

    this.bus.getSubscriber<AdcSystemEvents>()
      .on(`adc_state_${index}`)
      .handle(evt => {
        this.adcState = evt.current;
        this.updateAttitudeDataState();
      });

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

        this.initializationTimer.schedule(() => {
          this.rollSub.pause();
          this.setState(AvionicsSystemState.On);
        }, 45000);
      } else {
        this.rollSub.pause();
        this.initializationTimer.clear();
        this.setState(AvionicsSystemState.Off);
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
    const isHeadingDataValid = (this._state === undefined || this._state === AvionicsSystemState.On)
      && (this.magnetometerState === undefined || this.magnetometerState === AvionicsSystemState.On);

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
    if (Math.abs(bankAngle) >= 20) {
      this.initializationTimer.schedule(() => {
        this.rollSub.pause();
        this.setState(AvionicsSystemState.On);
      }, 45000);
    }
  }
}
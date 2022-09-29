import {
  AhrsEvents, AvionicsSystemState, AvionicsSystemStateEvent, BaseAhrsEvents, BasicAvionicsSystem, EventBus, Subscription,
  SystemPowerKey
} from 'msfssdk';

import { MagnetometerSystemEvents } from './MagnetometerSystem';

/**
 * Data events published by the AHRS system.
 */
type AhrsDataEvents = {
  [P in keyof BaseAhrsEvents as `ahrs_${P}_${number}`]: BaseAhrsEvents[P];
};

/**
 * Events published by the AHRS system.
 */
export interface AhrsSystemEvents extends AhrsDataEvents {
  /** An event fired when the AHRS system state changes. */
  [ahrs_state: `ahrs_state_${number}`]: AvionicsSystemStateEvent;
}

/**
 * A Garmin AHRS system.
 */
export class AhrsSystem extends BasicAvionicsSystem<AhrsSystemEvents> {

  protected initializationTime = 45000;
  private magState: AvionicsSystemState | undefined;

  private readonly rollSub = this.bus.getSubscriber<AhrsEvents>().on('roll_deg').whenChanged().handle(this.onRollChanged.bind(this), true);

  private readonly dataSubs: Subscription[] = [];

  /**
   * Creates an instance of an AHRS system.
   * @param index The index of the AHRS.
   * @param bus An instance of the event bus.
   * @param attitudeIndicatorIndex The index of the sim attitude indicator from which this AHRS derives its data.
   * @param directionIndicatorIndex The index of the sim direction indicator from which this AHRS derives its data.
   * @param powerSource The {@link ElectricalEvents} topic or electricity logic element to which to connect the
   * system's power.
   */
  constructor(
    index: number,
    bus: EventBus,
    private readonly attitudeIndicatorIndex: number,
    private readonly directionIndicatorIndex: number,
    powerSource?: SystemPowerKey | CompositeLogicXMLElement,
  ) {
    super(index, bus, `ahrs_state_${index}` as const);

    if (powerSource !== undefined) {
      this.connectToPower(powerSource);
    }

    this.bus.getSubscriber<MagnetometerSystemEvents>()
      .on(`magnetometer_state_${index}`)
      .handle(evt => {
        this.onUpstreamStatesChanged(this.isPowered, evt.current);
      });

    this.startDataPublish();
  }

  /** @inheritdoc */
  protected onPowerChanged(isPowered: boolean): void {
    this.onUpstreamStatesChanged(isPowered, this.magState);
  }

  /**
   * Starts publishing AHRS data on the event bus.
   */
  private startDataPublish(): void {
    const sub = this.bus.getSubscriber<AhrsEvents>();
    const pub = this.bus.getPublisher<AhrsSystemEvents>();
    const paused = this.state === AvionicsSystemState.Failed || this.state === AvionicsSystemState.Off;

    this.dataSubs.push(sub.on(`hdg_deg_${this.directionIndicatorIndex}`).handle(val => { pub.pub(`ahrs_hdg_deg_${this.index}`, val); }, paused));
    this.dataSubs.push(sub.on(`hdg_deg_true_${this.directionIndicatorIndex}`).handle(val => { pub.pub(`ahrs_hdg_deg_true_${this.index}`, val); }, paused));
    this.dataSubs.push(sub.on(`delta_heading_rate_${this.attitudeIndicatorIndex}`).handle(val => { pub.pub(`ahrs_delta_heading_rate_${this.index}`, val); }, paused));
    this.dataSubs.push(sub.on(`pitch_deg_${this.attitudeIndicatorIndex}`).handle(val => { pub.pub(`ahrs_pitch_deg_${this.index}`, val); }, paused));
    this.dataSubs.push(sub.on(`roll_deg_${this.attitudeIndicatorIndex}`).handle(val => { pub.pub(`ahrs_roll_deg_${this.index}`, val); }, paused));

    this.dataSubs.push(sub.on('turn_coordinator_ball').handle(val => { pub.pub(`ahrs_turn_coordinator_ball_${this.index}`, val); }, paused));
  }

  /** @inheritdoc */
  protected onStateChanged(previousState: AvionicsSystemState | undefined, currentState: AvionicsSystemState): void {
    if (currentState === AvionicsSystemState.Failed || currentState === AvionicsSystemState.Off) {
      for (const sub of this.dataSubs) {
        sub.pause();
      }
    } else {
      for (const sub of this.dataSubs) {
        sub.resume(true);
      }
    }
  }

  /**
   * A callback called when changes occur in this system's upstream states.
   * @param isPowered Whether or not the AHRS is powered.
   * @param magState The current state of the magnetometer.
   */
  private onUpstreamStatesChanged(isPowered: boolean | undefined, magState: AvionicsSystemState | undefined): void {
    if (this.isPowered === undefined || this.magState === undefined) {
      if (isPowered && magState === AvionicsSystemState.On) {
        this.setState(AvionicsSystemState.On);
      }
    } else {
      if (isPowered) {
        if (magState === AvionicsSystemState.On) {
          this.setState(AvionicsSystemState.Initializing);
          this.rollSub.resume(true);

          this.initializationTimer.schedule(() => {
            this.rollSub.pause();
            this.setState(AvionicsSystemState.On);
          }, 45000);
        } else {
          this.rollSub.pause();
          this.initializationTimer.clear();
          this.setState(AvionicsSystemState.Failed);
        }
      } else {
        this.rollSub.pause();
        this.initializationTimer.clear();
        this.setState(AvionicsSystemState.Off);
      }
    }

    this.isPowered = isPowered;
    this.magState = magState;
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
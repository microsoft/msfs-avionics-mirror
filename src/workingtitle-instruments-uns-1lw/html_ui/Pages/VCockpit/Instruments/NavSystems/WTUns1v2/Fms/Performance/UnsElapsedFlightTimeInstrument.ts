import {
  AdcEvents, ClockEvents, ConsumerSubject, ConsumerValue, EventBus, FlightTimerControlEvents, FlightTimerEvents, FlightTimerMode, Instrument
} from '@microsoft/msfs-sdk';

/** Events published by the UnsElapsedFlightTimeInstrument. */
export interface UnsElapsedFlightTimeEvents {
  /** The time at takeoff. */
  time_at_takeoff: number | null,
  /** The elapsed time since takeoff in ms. */
  time_elapsed_since_takeoff: number | null,
}

/** A UNS Elapsed Time instrument. */
export class UnsElapsedFlightTimeInstrument implements Instrument {
  private readonly timerPublisher = this.bus.getPublisher<FlightTimerControlEvents>();

  private readonly onGround = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('on_ground').whenChanged(), true);

  private readonly elapsedFlightTime = ConsumerValue.create(this.bus.getSubscriber<FlightTimerEvents>().on(`timer_value_ms_${this.timerIndex}`), 0);

  private readonly simTime = ConsumerValue.create(this.bus.getSubscriber<ClockEvents>().on('simTime'), 0);

  /**
   * Ctor
   * @param bus The event bus
   * @param timerIndex The timer index
   */
  constructor(private readonly bus: EventBus, private readonly timerIndex: number) {}

  /** @inheritdoc */
  public init(): void {
    this.timerPublisher.pub(`timer_set_value_${this.timerIndex}`, 0, true, false);
    this.timerPublisher.pub(`timer_set_mode_${this.timerIndex}`, FlightTimerMode.CountingUp, true, false);

    this.onGround.sub((isOnGround: boolean) => {
      if (isOnGround) {
        this.timerPublisher.pub(`timer_stop_${this.timerIndex}`, undefined, true, false);
      } else {
        this.timerPublisher.pub(`timer_reset_${this.timerIndex}`, undefined, true, false);
        this.timerPublisher.pub(`timer_start_${this.timerIndex}`, undefined, true, false);

        this.bus.getPublisher<UnsElapsedFlightTimeEvents>().pub('time_at_takeoff', this.simTime.get());
      }
    }, true);
  }

  /** @inheritdoc */
  public onUpdate(): void {
    this.bus.getPublisher<UnsElapsedFlightTimeEvents>().pub('time_elapsed_since_takeoff', this.elapsedFlightTime.get() ?? null);
  }
}

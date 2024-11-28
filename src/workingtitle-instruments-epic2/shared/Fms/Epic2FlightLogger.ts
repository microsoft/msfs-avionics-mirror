import { ClockEvents, ConsumerSubject, DebounceTimer, EventBus, Subject, UnitType } from '@microsoft/msfs-sdk';

import { AirGroundDataProvider, AirspeedDataProvider, InertialDataProvider } from '../Instruments';

/** A class that logs flight data in the Epic2. */
export class Epic2FlightLogger {
  private readonly takeoffDebounce = new DebounceTimer();

  // Source data
  private readonly simTime = ConsumerSubject.create(this.bus.getSubscriber<ClockEvents>().on('simTime').atFrequency(1, true), 0);
  private readonly simTimeSlow = ConsumerSubject.create(this.bus.getSubscriber<ClockEvents>().on('simTime').atFrequency(1 / 10, true), 0);
  private readonly trueAirSpeed = this.airspeedDataProvider.tas.map(v => v);
  private readonly groundSpeed = this.inertialDataProvider.groundSpeed.map(v => v);

  // Local counters
  private avgTasSamples = 0;
  private avgGsSamples = 0;
  private lastSimTimeUpdate = 0;

  // Logged flight data
  public readonly takeoffTime = Subject.create(0);
  public readonly enrouteTime = Subject.create(0);
  public readonly landingTime = Subject.create(0);
  public readonly avgTrueAirspeed = Subject.create(0);
  public readonly avgGroundSpeed = Subject.create(0);
  public readonly airDistance = Subject.create(0);
  public readonly groundDistance = Subject.create(0);

  /**
   * Constructor
   * @param bus The event bus.
   * @param inertialDataProvider The iniertial data provider.
   * @param airspeedDataProvider The airspeed data provider.
   * @param airGroundDataProvider The air ground data provider.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly inertialDataProvider: InertialDataProvider,
    private readonly airspeedDataProvider: AirspeedDataProvider,
    private readonly airGroundDataProvider: AirGroundDataProvider,
  ) {

    this.reset();
    this.pause();

    // this only runs while we are in the air
    this.simTimeSlow.sub((v) => {

      const trueAirSpeed = this.trueAirSpeed.get();
      const groundSpeed = this.groundSpeed.get();

      if (trueAirSpeed !== null) {
        this.avgTasSamples++;
        this.avgTrueAirspeed.set(this.avgTrueAirspeed.get() + ((trueAirSpeed - this.avgTrueAirspeed.get()) / this.avgTasSamples));
      }

      if (groundSpeed !== null) {
        this.avgGsSamples++;
        this.avgGroundSpeed.set(this.avgGroundSpeed.get() + ((groundSpeed - this.avgGroundSpeed.get()) / this.avgGsSamples));
      }

      if (this.takeoffTime.get() > 0) {
        this.enrouteTime.set(this.simTime.get() - this.takeoffTime.get());
      }

      if (this.lastSimTimeUpdate > 0) {
        const msTimeDiff = Math.min(v - this.lastSimTimeUpdate, 11000);
        const timeDiff = UnitType.MILLISECOND.convertTo(msTimeDiff, UnitType.HOUR);

        // calculate air distance from TAS and time
        if (trueAirSpeed !== null) {
          const airDist = trueAirSpeed * timeDiff;
          this.airDistance.set(this.airDistance.get() + airDist);
        }

        // calculate ground distance from GS and time
        if (groundSpeed !== null) {
          const gndDist = groundSpeed * timeDiff;
          this.groundDistance.set(this.groundDistance.get() + gndDist);
        }
      }

      this.lastSimTimeUpdate = v;
    });

    this.airGroundDataProvider.isOnGround.sub((onGround) => {
      if (onGround && this.takeoffTime.get() > 0 && ((this.simTime.get() - this.takeoffTime.get()) > 30000)) {
        // we landed, stop logging
        this.landingTime.set(this.simTime.get());
        this.enrouteTime.set(this.simTime.get() - this.takeoffTime.get());
        this.pause();
      } else if (!onGround) {
        this.takeoffDebounce.schedule(() => {
          if (!this.airGroundDataProvider.isOnGround.get()) {
            this.reset();
            this.resume();
            this.takeoffTime.set(this.simTime.get());
          }
        }, 15000);
      }
    }, true);
  }

  /** Resets all logged data. */
  public reset(): void {
    this.takeoffTime.set(0);
    this.enrouteTime.set(0);
    this.landingTime.set(0);
    this.avgTrueAirspeed.set(0);
    this.avgGroundSpeed.set(0);
    this.avgTasSamples = 0;
    this.avgGsSamples = 0;
    this.airDistance.set(0);
    this.groundDistance.set(0);
  }

  /** Pauses the logger. */
  private pause(): void {
    this.trueAirSpeed.pause();
    this.groundSpeed.pause();
    this.simTimeSlow.pause();
  }

  /** Resumes the logger. */
  private resume(): void {
    this.trueAirSpeed.resume();
    this.groundSpeed.resume();
    this.lastSimTimeUpdate = 0;
    this.simTimeSlow.resume();
  }
}

import { AdcEvents, ClockEvents, ConsumerSubject, ConsumerValue, EngineEvents, EventBus, GNSSEvents, MappedSubject, SimpleMovingAverage, Subject, UnitType } from '@microsoft/msfs-sdk';
import { WT21ControlEvents } from '../../Shared/WT21ControlEvents';

/**
 * A class that logs flight data in the WT21.
 */
export class WT21FlightLogger {
  private readonly simTime = ConsumerSubject.create(this.bus.getSubscriber<ClockEvents>().on('simTime').atFrequency(1, true), 0);
  private readonly simTimeSlow = ConsumerSubject.create(this.bus.getSubscriber<ClockEvents>().on('simTime').atFrequency(1 / 10, true), 0);
  private readonly trueAirSpeed = ConsumerValue.create(this.bus.getSubscriber<AdcEvents>().on('tas').whenChangedBy(5), 0);
  private readonly groundSpeed = ConsumerValue.create(this.bus.getSubscriber<GNSSEvents>().on('ground_speed').whenChangedBy(5), 0);
  private readonly isOnGround = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('on_ground').whenChanged(), true);

  private readonly fuelQtyLeft = ConsumerSubject.create(this.bus.getSubscriber<EngineEvents>().on('fuel_left').withPrecision(1), 0);
  private readonly fuelQtyRight = ConsumerSubject.create(this.bus.getSubscriber<EngineEvents>().on('fuel_right').withPrecision(1), 0);

  private readonly avgTrueAirspeedData = new SimpleMovingAverage(30);
  private readonly avgGroundSpeedData = new SimpleMovingAverage(30);

  private initFuelQtyLeft = 0;
  private lastFuelQtyLeft = 0;
  private initFuelQtyRight = 0;
  private lastFuelQtyRight = 0;

  private lastSimTimeUpdate = 0;

  public takeoffTime = Subject.create(0);
  public enrouteTime = Subject.create(0);
  public landingTime = Subject.create(0);
  public avgTrueAirspeed = Subject.create(-1);
  public avgGroundSpeed = Subject.create(-1);
  public fuelUsedLeft = Subject.create(0);
  public fuelUsedRight = Subject.create(0);
  public fuelUsedTotal = MappedSubject.create(([fuelUsedLeft, fuelUsedRight]) => fuelUsedLeft + fuelUsedRight, this.fuelUsedLeft, this.fuelUsedRight);
  public airDistance = Subject.create(0);
  public groundDistance = Subject.create(0);

  /**
   * Ctor
   * @param bus The event bus.
   */
  constructor(private readonly bus: EventBus) {
    this.pause();

    // this only runs while we are in the air
    this.simTimeSlow.sub((v) => {
      this.avgTrueAirspeed.set(Math.round(this.avgTrueAirspeedData.getAverage(this.trueAirSpeed.get())));
      this.avgGroundSpeed.set(Math.round(this.avgGroundSpeedData.getAverage(this.groundSpeed.get())));
      if (this.takeoffTime.get() > 0) {
        this.enrouteTime.set(this.simTime.get() - this.takeoffTime.get());
      }

      if (this.lastSimTimeUpdate > 0) {
        const timeDiff = UnitType.MILLISECOND.convertTo((v - this.lastSimTimeUpdate), UnitType.HOUR);

        // calculate air distance from TAS and time
        const airDist = this.trueAirSpeed.get() * timeDiff;
        this.airDistance.set(this.airDistance.get() + airDist);

        // calculate ground distance from GS and time
        const gndDist = this.groundSpeed.get() * timeDiff;
        this.groundDistance.set(this.groundDistance.get() + gndDist);
      }

      this.lastSimTimeUpdate = v;
    });

    this.isOnGround.sub((v) => {
      if (v === true && this.takeoffTime.get() > 0 && ((this.simTime.get() - this.takeoffTime.get()) > 30000)) {
        // we landed, stop logging
        this.landingTime.set(this.simTime.get());
        this.enrouteTime.set(this.simTime.get() - this.takeoffTime.get());
        this.pause();
        this.bus.getPublisher<WT21ControlEvents>().pub('show_flt_log', undefined, false, false);
      } else if (v === false && this.landingTime.get() <= 0) {
        // we probably took off, start logging
        this.resume();
        this.takeoffTime.set(this.simTime.get());
      }
    }, true);

    this.fuelQtyLeft.sub((v) => {
      const fuelLbs = UnitType.GALLON_FUEL.convertTo(v, UnitType.POUND);
      // if we have no initial fuel qty, set it
      if (this.initFuelQtyLeft === 0) {
        this.initFuelQtyLeft = fuelLbs;
        this.fuelUsedLeft.set(0);
      } else {
        // otherwise, calculate the fuel used
        this.fuelUsedLeft.set(Math.floor((this.initFuelQtyLeft - fuelLbs) / 5) * 5);
      }

      if (Math.abs(this.lastFuelQtyLeft - fuelLbs) > 10) {
        // fuel was probably changed manually, reset
        this.initFuelQtyLeft = 0;
      }
      this.lastFuelQtyLeft = fuelLbs;
    });

    this.fuelQtyRight.sub((v) => {
      const fuelLbs = UnitType.GALLON_FUEL.convertTo(v, UnitType.POUND);

      // if we have no initial fuel qty, set it
      if (this.initFuelQtyRight === 0) {
        this.initFuelQtyRight = fuelLbs;
        this.fuelUsedRight.set(0);
      } else {
        // otherwise, calculate the fuel used
        this.fuelUsedRight.set(Math.floor((this.initFuelQtyRight - fuelLbs) / 5) * 5);
      }

      if (Math.abs(this.lastFuelQtyRight - fuelLbs) > 10) {
        // fuel was probably changed manually, reset
        this.initFuelQtyRight = 0;
      }
      this.lastFuelQtyRight = fuelLbs;
    });
  }

  /**
   * Resets all logged data.
   */
  public reset(): void {
    this.takeoffTime.set(0);
    this.enrouteTime.set(0);
    this.landingTime.set(0);
    this.avgTrueAirspeed.set(-1);
    this.avgGroundSpeed.set(-1);
    this.avgTrueAirspeedData.reset();
    this.avgGroundSpeedData.reset();
    this.initFuelQtyLeft = 0;
    this.initFuelQtyRight = 0;
    this.fuelUsedLeft.set(0);
    this.fuelUsedRight.set(0);
    this.airDistance.set(0);
    this.groundDistance.set(0);
  }

  /**
   * Pauses the logger.
   */
  private pause(): void {
    this.trueAirSpeed.pause();
    this.groundSpeed.pause();
    this.simTimeSlow.pause();
  }

  /**
   * Resumes the logger.
   */
  private resume(): void {
    this.trueAirSpeed.resume();
    this.groundSpeed.resume();
    this.simTimeSlow.resume();
  }
}
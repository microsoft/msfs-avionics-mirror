import {
  APEvents, EventBus, FlightPathAirplaneSpeedMode, FlightPathCalculatorControlEvents, MappedSubject, MappedSubscribable,
  Subject, Subscribable, Subscription
} from '@microsoft/msfs-sdk';

/**
 * A manager which automatically sets flight path calculator bank angles and airplane speed modes in response to
 * autopilot Low Bank Mode and ADC/GPS data validity, respectively.
 */
export class FlightPathCalculatorManager {
  private readonly publisher = this.bus.getPublisher<FlightPathCalculatorControlEvents>();

  private isLowBank?: boolean;

  private readonly speedDataState: MappedSubscribable<readonly [boolean | undefined, boolean | undefined]>;

  private isAlive = true;
  private isInit = false;

  private lowBankSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param isAdcDataValid Whether ADC data is valid, or `undefined` if flight path calculations do not use ADC data
   * for calculating airplane speed.
   * @param isGpsDataValid Whether GPS data is valid, or `undefined` if flight path calculations do not use GPS data
   * for calculating airplane speed.
   * @param maxBankAngle The maximum bank angle, in degrees, supported outside of Low Bank Mode.
   * @param lowBankAngle The maximum bank angle, in degrees, supported in Low Bank Mode.
   */
  public constructor(
    private readonly bus: EventBus,
    isAdcDataValid: Subscribable<boolean> | undefined,
    isGpsDataValid: Subscribable<boolean> | undefined,
    private readonly maxBankAngle: number,
    private readonly lowBankAngle: number,
  ) {
    this.speedDataState = MappedSubject.create(
      isAdcDataValid ?? Subject.create(undefined),
      isGpsDataValid ?? Subject.create(undefined)
    ).pause();
  }

  /**
   * Initializes this manager. Once this manager is initialized, it will automatically set the maximum bank angle and
   * airplane speed mode used by the flight path calculator.
   * @throws Error if this manager has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('FlightPathCalculatorManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<APEvents>();

    this.lowBankSub = sub.on('ap_max_bank_id').whenChanged().handle(id => { this.onLowBankChanged(id === 1); });

    this.speedDataState.resume();
    this.speedDataState.sub(this.onSpeedDataValidityChanged.bind(this), true);
  }

  /**
   * Responds to when autopilot Low Bank Mode is activated or deactivated.
   * @param isLowBank Whether autopilot Low Bank Mode is active.
   */
  private onLowBankChanged(isLowBank: boolean): void {
    if (this.isLowBank === isLowBank) {
      return;
    }

    this.isLowBank = isLowBank;

    this.publisher.pub('flightpath_set_options', { maxBankAngle: isLowBank ? this.lowBankAngle : this.maxBankAngle }, true, false);
  }

  /**
   * Responds to when the validity state of speed data changes.
   * @param state The validity state of speed data, as `[ADC, GPS]`.
   */
  private onSpeedDataValidityChanged(state: readonly [boolean | undefined, boolean | undefined]): void {
    const [isAdcDataValid, isGpsDataValid] = state;
    let airplaneSpeedMode: FlightPathAirplaneSpeedMode;

    if (isAdcDataValid !== undefined) {
      if (isAdcDataValid) {
        airplaneSpeedMode = isGpsDataValid ? FlightPathAirplaneSpeedMode.TrueAirspeedPlusWind : FlightPathAirplaneSpeedMode.TrueAirspeed;
      } else {
        airplaneSpeedMode = FlightPathAirplaneSpeedMode.Default;
      }
    } else {
      airplaneSpeedMode = isGpsDataValid ? FlightPathAirplaneSpeedMode.GroundSpeed : FlightPathAirplaneSpeedMode.Default;
    }

    this.publisher.pub('flightpath_set_options', { airplaneSpeedMode }, true, false);
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.speedDataState.destroy();
    this.lowBankSub?.destroy();
  }
}
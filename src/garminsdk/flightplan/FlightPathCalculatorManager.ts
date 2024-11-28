import {
  APEvents, EventBus, FlightPathAirplaneSpeedMode, FlightPathAirplaneWindMode, FlightPathCalculatorControlEvents, MappedSubject, MappedSubscribable,
  Subject, Subscribable, SubscribableUtils, Subscription
} from '@microsoft/msfs-sdk';

/**
 * Configuration options for {@link FlightPathCalculatorManager}.
 */
export type FlightPathCalculatorManagerOptions = {
  /** The ID of the flight path calculator to manage. Defaults to the empty string (`''`). */
  id?: string;

  /**
   * Whether ADC data is valid, or `undefined` if flight path calculations do not use ADC data for calculating airplane
   * speed.
   */
  isAdcDataValid?: Subscribable<boolean>;

  /**
   * Whether GPS data is valid, or `undefined` if flight path calculations do not use GPS data for calculating airplane
   * speed.
   */
  isGpsDataValid?: Subscribable<boolean>;

  /** The maximum bank angle, in degrees, supported outside of Low Bank Mode. */
  maxBankAngle: number;

  /** The maximum bank angle, in degrees, supported in Low Bank Mode. Defaults to `maxBankAngle`. */
  lowBankAngle?: number;
};

/**
 * A manager which automatically sets flight path calculator bank angles and airplane speed modes in response to
 * autopilot Low Bank Mode and ADC/GPS data validity, respectively.
 */
export class FlightPathCalculatorManager {
  private readonly publisher = this.bus.getPublisher<FlightPathCalculatorControlEvents>();

  private readonly setOptionsTopic: 'flightpath_set_options' | `flightpath_set_options_${string}`;

  private readonly calculatorId: string;

  private readonly maxBankAngle: number;
  private readonly lowBankAngle: number;

  private isLowBank?: boolean;

  private readonly speedDataState: MappedSubscribable<readonly [boolean | undefined, boolean | undefined]>;

  private isAlive = true;
  private isInit = false;

  private lowBankSub?: Subscription;

  /**
   * Creates a new instance of FlightPathCalculatorManager.
   * @param bus The event bus.
   * @param options Options with which to configure the new manager.
   */
  public constructor(
    bus: EventBus,
    options: Readonly<FlightPathCalculatorManagerOptions>
  );
  /**
   * Creates a new instance of FlightPathCalculatorManager.
   * @param bus The event bus.
   * @param isAdcDataValid Whether ADC data is valid, or `undefined` if flight path calculations do not use ADC data
   * for calculating airplane speed.
   * @param isGpsDataValid Whether GPS data is valid, or `undefined` if flight path calculations do not use GPS data
   * for calculating airplane speed.
   * @param maxBankAngle The maximum bank angle, in degrees, supported outside of Low Bank Mode.
   * @param lowBankAngle The maximum bank angle, in degrees, supported in Low Bank Mode. Defaults to `maxBankAngle`.
   * @deprecated Please use the constructor overload that accepts the options object instead.
   */
  public constructor(
    bus: EventBus,
    isAdcDataValid: Subscribable<boolean> | undefined,
    isGpsDataValid: Subscribable<boolean> | undefined,
    maxBankAngle: number,
    lowBankAngle?: number,
  );
  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(
    private readonly bus: EventBus,
    arg2?: Readonly<FlightPathCalculatorManagerOptions> | Subscribable<boolean>,
    arg3?: Subscribable<boolean>,
    maxBankAngle?: number,
    lowBankAngle?: number,
  ) {
    let isAdcDataValid: Subscribable<boolean> | undefined;
    let isGpsDataValid: Subscribable<boolean> | undefined;

    if (arg2 === undefined || SubscribableUtils.isSubscribable(arg2)) {
      this.calculatorId = '';
      this.maxBankAngle = maxBankAngle as number;
      this.lowBankAngle = lowBankAngle ?? this.maxBankAngle;
      isAdcDataValid = arg2;
      isGpsDataValid = arg3;
    } else {
      this.calculatorId = arg2.id ?? '';
      this.maxBankAngle = arg2.maxBankAngle;
      this.lowBankAngle = arg2.lowBankAngle ?? this.maxBankAngle;
      isAdcDataValid = arg2.isAdcDataValid;
      isGpsDataValid = arg2.isGpsDataValid;
    }

    this.setOptionsTopic = this.calculatorId === '' ? 'flightpath_set_options' : `flightpath_set_options_${this.calculatorId}`;

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

    this.publisher.pub(this.setOptionsTopic, { maxBankAngle: isLowBank ? this.lowBankAngle : this.maxBankAngle }, true, false);
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

    const airplaneWindMode = isAdcDataValid && isGpsDataValid ? FlightPathAirplaneWindMode.Automatic : FlightPathAirplaneWindMode.None;

    this.publisher.pub(this.setOptionsTopic, { airplaneSpeedMode, airplaneWindMode }, true, false);
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
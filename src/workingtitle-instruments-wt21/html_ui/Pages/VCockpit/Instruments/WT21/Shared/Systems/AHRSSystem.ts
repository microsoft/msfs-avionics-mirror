import { AhrsEvents, AvionicsSystemState, AvionicsSystemStateEvent, BasicAvionicsSystem, EventBus, LinearServo } from '@microsoft/msfs-sdk';
import { ADCSystemEvents } from './ADCSystem';
import { MagnetometerSystemEvents } from './MagnetometerSystem';

enum InitializationPhase {
  ALIGN,
  TOHDG
}

/**
 * The AHRS system.
 */
export class AhrsSystem extends BasicAvionicsSystem<AHRSSystemEvents> {
  protected initializationTime = 30000;

  private magnetometerState: AvionicsSystemState | undefined = undefined;
  private adcState: AvionicsSystemState | undefined = undefined;

  private readonly rollSub = this.bus.getSubscriber<AhrsEvents>().on('roll_deg').whenChanged().handle(this.onRollChanged.bind(this), true);

  private readonly INIT_RATE = 12;
  private readonly FAST_INIT_RATE = 210;
  private initServo = new LinearServo(this.INIT_RATE);
  private initPhase = InitializationPhase.ALIGN;
  private initHdgDeg = 0;
  private targetHdgDeg = 360;
  private planeHdgDeg = 0;

  /**
   * Creates an instance of an AHRS system.
   * @param index The index of the AHRS.
   * @param bus An instance of the event bus.
   */
  constructor(
    index: number,
    bus: EventBus
  ) {
    super(index, bus, 'ahrs_state');

    this.connectToPower('elec_av1_bus');

    this.bus.getSubscriber<AhrsEvents>().on('hdg_deg')
      .withPrecision(2)
      .handle((hdg) => this.planeHdgDeg = hdg);

    this.bus.getSubscriber<MagnetometerSystemEvents>()
      .on('magnetometer_state')
      .handle((evt) => {
        this.magnetometerState = evt.current;
        // this.onPowerChanged(this.magnetometerState === AvionicsSystemState.On && this.adcState === AvionicsSystemState.On);
        this.evaluateState(this.state);
      });

    this.bus.getSubscriber<ADCSystemEvents>()
      .on('adc_state')
      .handle((evt) => {
        this.adcState = evt.current;
        this.evaluateState(this.state);
      });
  }

  /** @inheritdoc */
  protected onPowerChanged(isPowered: boolean): void {
    const wasPowered = this.isPowered;

    this.isPowered = isPowered;

    if (wasPowered === undefined) {
      this.setState(isPowered ? AvionicsSystemState.On : AvionicsSystemState.Off);
    } else {
      if (isPowered) {
        this.evaluateState(AvionicsSystemState.Failed);
      } else {
        this.rollSub.pause();
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
    this.publisher.pub('ahrs_init_hdg_deg', this.initHdgDeg, false, false);
  }

  /** @inheritdoc */
  public onUpdate(): void {
    super.onUpdate();
    if (this.state === AvionicsSystemState.Initializing) {
      this.initHdgDeg = this.initServo.drive(this.initHdgDeg, this.targetHdgDeg);
      this.publisher.pub('ahrs_init_hdg_deg', this.initPhase === InitializationPhase.ALIGN ? -this.initHdgDeg : this.initHdgDeg, false, false);
      if (this.initHdgDeg >= this.targetHdgDeg) {
        if (this.initPhase === InitializationPhase.ALIGN) {
          this.initPhase = InitializationPhase.TOHDG;
          this.initHdgDeg = 0;
          this.targetHdgDeg = this.planeHdgDeg;
          this.initServo = new LinearServo(this.FAST_INIT_RATE);
        } else {
          this.publisher.pub('ahrs_init_hdg_deg', this.planeHdgDeg, false, false);
          this.setState(AvionicsSystemState.On);
        }
      }
    }
  }

  /** @inheritdoc */
  protected onStateChanged(previousState: AvionicsSystemState | undefined, currentState: AvionicsSystemState): void {
    this.evaluateState(currentState);
  }

  /**
   * Checks if the System is read to initialize
   * @param currentState The current state of the system.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private evaluateState(currentState: AvionicsSystemState | undefined): void {
    this.rollSub.pause();
    if (currentState !== AvionicsSystemState.Off) {
      if ((this.adcState !== undefined && this.adcState !== AvionicsSystemState.On)
        || (this.magnetometerState != undefined && this.magnetometerState !== AvionicsSystemState.On)) {
        this.setState(AvionicsSystemState.Failed);
      } else if (currentState !== AvionicsSystemState.On) {
        this.startInitializing();
      }
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

/**
 * Events fired by the AHRS system.
 */
export interface AHRSSystemEvents {
  /** An event fired when the AHRS system state changes. */
  'ahrs_state': AvionicsSystemStateEvent;
  /** A event for a mock heading value provided during initialization. */
  'ahrs_init_hdg_deg': number;
}
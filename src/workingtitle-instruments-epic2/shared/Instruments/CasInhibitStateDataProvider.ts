import { ClockEvents, ConsumerSubject, ConsumerValue, ElectricalEvents, EngineEvents, EventBus, Instrument, Subject, Subscribable, Subscription } from '@microsoft/msfs-sdk';
import { DefaultAirGroundDataProvider } from './AirGroundDataProvider';
import { DefaultInertialDataProvider } from './InertialDataProvider';
import { DefaultAltitudeDataProvider } from './AltitudeDataProvider';
import { DefaultRadioAltimeterDataProvider } from './RadioAltimeterDataProvider';

export const InhibitState = {
  /** Only Standby Battery on */
  Standby: 'standby-power-only',
  /** Batteries on */
  Electrical: 'electrical-power-on',
  /** N1 above 20%, engine starter off */
  Engine: 'engine-started',
  /** Engine on, on ground, ground speed between 1 and 50knots */
  Taxi: 'taxi',
  /** Ground speed above 50knots, below 800feet from takeOff altitude */
  TakeOff: 'take-off',
  /** Above 800feet from takeOff altitude*/
  Cruise: 'cruise',
  /** Below 800feet RA */
  Approach: 'approach',
  /** When none of the other states apply */
  None: 'none'
} as const;

/**
 * Values for all possible Inhibit states.
 */
export type InhibitStates = typeof InhibitState[keyof typeof InhibitState]

/** The Cas Inhibit state data provider. */
export interface CasInhibitStateDataProvider {
  /** The current inhibit state. */
  state: Subscribable<InhibitStates>;
}

/** The Cas Inhibit state data provider implementation. */
export class DefaultCasInhibitStateDataProvider implements CasInhibitStateDataProvider, Instrument {
  private static readonly GROUNDSPEED = 50; // knots
  private static readonly ALTITUDE_ABOVE_GROUND = 800; // feet
  private takeOffAltitude: number | null = null;
  // Data sources:
  private readonly groundSpeed: Subscribable<number | null>;
  private readonly altitude: Subscribable<number | null>;
  private readonly ra: Subscribable<number | null>;
  private readonly onGround: Subscribable<boolean>;
  private readonly sub = this.bus.getSubscriber<EngineEvents & ElectricalEvents & ClockEvents>();
  private readonly n1 = ConsumerValue.create(this.sub.on('n1_1'), 0);
  private readonly engineStarter = ConsumerSubject.create(this.sub.on('eng_starter_on_1'), false);
  private readonly battery1 = ConsumerSubject.create(this.sub.on('elec_master_battery_1'), false);
  private readonly battery2 = ConsumerSubject.create(this.sub.on('elec_master_battery_2'), false);
  private readonly battery3 = ConsumerSubject.create(this.sub.on('elec_master_battery_3'), false);
  private readonly timer = ConsumerSubject.create(this.sub.on('simTime').atFrequency(0.2), 0);
  private subscriptions: Subscription[] = [];
  // Cas Inhibit state Subject
  public state = Subject.create<InhibitStates>(InhibitState.None);

  /**
   * Creates an instance of the CasInhibitsController.
   * @param bus The event bus to use with this instance.
   * @param airGroundDataProvider The isOnGround data provider
   * @param inertialDataProvider The groundSpeed data provider
   * @param altitudeDataProvider The altitude data provider
   * @param radioAltimeterDataProvider The radioAltitude data provider
   */
  constructor(
    private readonly bus: EventBus,
    private readonly airGroundDataProvider: DefaultAirGroundDataProvider,
    private readonly inertialDataProvider: DefaultInertialDataProvider,
    private readonly altitudeDataProvider: DefaultAltitudeDataProvider,
    private readonly radioAltimeterDataProvider: DefaultRadioAltimeterDataProvider,
  ) {
    this.groundSpeed = inertialDataProvider.groundSpeed;
    this.altitude = altitudeDataProvider.altitude;
    this.ra = radioAltimeterDataProvider.radioAltitude;
    this.onGround = airGroundDataProvider.isOnGround;

    this.subscriptions.push(this.timer.sub(this.updateState.bind(this)).pause());
    this.subscriptions.push(this.battery1.sub(this.updateState.bind(this)).pause());
    this.subscriptions.push(this.battery2.sub(this.updateState.bind(this)).pause());
    this.subscriptions.push(this.battery3.sub(this.updateState.bind(this)).pause());
    this.subscriptions.push(this.engineStarter.sub(this.updateState.bind(this)).pause());
  }

  /** Check all the inputs and current Inhibit state and evaluate a new inhibit state */
  public updateState(): void {
    this.state.set(this.getInhibitState());
  }

  /** @inheritdoc */
  public init(): void {
    this.resume();
  }

  /** @inheritdoc */
  public onUpdate(): void {
    /** noop */
  }

  /** Pause the data output. */
  public pause(): void {
    this.subscriptions.forEach(sub => sub.pause());
  }

  /** Resume the data output. */
  public resume(): void {
    this.airGroundDataProvider.resume();
    this.inertialDataProvider.resume();
    this.altitudeDataProvider.resume();
    this.radioAltimeterDataProvider.resume();
    this.subscriptions.forEach(sub => sub.resume());
  }

  /**
   * Prepare input data needed for the state machine.
   * @returns Object with information if certain requirements has been met and therefore the state can be changed.
   */
  private getInputData(): typeof shouldSwitchTo {
    const groundSpeed = this.groundSpeed?.get() ?? 0;
    const altitude = this.altitude?.get() ?? 0;
    const ra = this.ra?.get() ?? 0;
    const n1 = this.n1?.get();
    const bat1 = this.battery1?.get();
    const bat2 = this.battery2?.get();
    const bat3 = this.battery3?.get();
    const engineStarter = this.engineStarter?.get();
    const onGround = this.onGround?.get();

    // save takeOff altitude when reaching 50kt for the first time
    if (groundSpeed && groundSpeed > 50) {
      this.takeOffAltitude ??= altitude;
    }

    // Inputs for state change
    const shouldSwitchTo = {
      /** Only the Standby Power battery is on. */
      standby: !bat1 && !bat2 && bat3 && n1 < 20,
      /** Batteries 1 and 2 on. */
      electrical: bat1 && bat2 && groundSpeed < 1 && n1 < 20,
      /** N1 above 20%, engine starter off. */
      engine: n1 > 20 && !engineStarter && groundSpeed < 1,
      /** onGround, ground speed between 1 and 50knots, n1 below 85%. */
      taxi: onGround && groundSpeed > 0 && groundSpeed < DefaultCasInhibitStateDataProvider.GROUNDSPEED,
      /** Ground speed above 50knots, below 800feet from takeOff altitude. */
      takeOff: groundSpeed >= DefaultCasInhibitStateDataProvider.GROUNDSPEED,
      /** Above 800feet from takeOff altitude. */
      cruise: !!this.takeOffAltitude && altitude > DefaultCasInhibitStateDataProvider.ALTITUDE_ABOVE_GROUND + this.takeOffAltitude,
      /** Below 800feet RA. */
      approach: ra < DefaultCasInhibitStateDataProvider.ALTITUDE_ABOVE_GROUND,
    } as const;
    return shouldSwitchTo;
  }

  /**
   * Cas Inhibit state machine
   * @returns Inhibit state evaluated basing on current state and input data
   */
  private getInhibitState(): InhibitStates {
    const currentState = this.state.get();
    const shouldSwitchTo = this.getInputData();

    switch (currentState) {
      case InhibitState.None:
        if (shouldSwitchTo.standby) {
          return InhibitState.Standby;
        }
        if (shouldSwitchTo.electrical) {
          return InhibitState.Electrical;
        }
        if (shouldSwitchTo.engine) {
          return InhibitState.Engine;
        }
        return currentState;

      case InhibitState.Standby:
        if (shouldSwitchTo.electrical) {
          return InhibitState.Electrical;
        }
        return shouldSwitchTo.standby ? currentState : InhibitState.None;

      case InhibitState.Electrical:
        if (shouldSwitchTo.engine) {
          return InhibitState.Engine;
        }
        if (shouldSwitchTo.standby) {
          return InhibitState.Standby;
        }
        return shouldSwitchTo.electrical ? currentState : InhibitState.None;

      case InhibitState.Engine:
        if (shouldSwitchTo.taxi) {
          return InhibitState.Taxi;
        }
        if (shouldSwitchTo.electrical) {
          return InhibitState.Electrical;
        }
        if (shouldSwitchTo.standby) {
          return InhibitState.Standby;
        }
        return shouldSwitchTo.engine ? currentState : InhibitState.None;

      case InhibitState.Taxi:
        if (shouldSwitchTo.takeOff) {
          return InhibitState.TakeOff;
        }
        if (shouldSwitchTo.engine) {
          return InhibitState.Engine;
        }
        return currentState;

      case InhibitState.TakeOff:
        if (shouldSwitchTo.cruise) {
          return InhibitState.Cruise;
        }
        if (shouldSwitchTo.taxi) {
          return InhibitState.Taxi;
        }
        return currentState;

      case InhibitState.Cruise:
        return shouldSwitchTo.approach ? InhibitState.Approach : currentState;

      case InhibitState.Approach:
        return shouldSwitchTo.taxi ? InhibitState.Taxi : currentState;

      default:
        return InhibitState.None;
    }
  }
}

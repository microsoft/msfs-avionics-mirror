import {
  Accessible, AeroMath, AmbientEvents, AutothrottleEvents, ConsumerSubject, ConsumerValue, EventBus, Instrument, MappedSubject, MappedValue, SimVarValueType,
  Subject, Subscribable, SubscribableMapFunctions, Subscription, UnitType, VirtualThrottleLeverEvents
} from '@microsoft/msfs-sdk';

import { Epic2AutothrottleEvents, Epic2AutothrottleModes, Epic2AutothrottleStatus } from '../Autothrottle';
import { AutothrottleConfig } from '../AvionicsConfig';
import { AirspeedDataProvider } from './AirspeedDataProvider';

export enum AutothrottleState {
  /** The autothrottle is not currently active. */
  Inactive,
  /** The autothrottle is in warning state due to abnormal disconnect, or for 10 seconds after normal disconnect. */
  Warning,
  /** The autothrottle is armed for takeoff. */
  Armed,
  /** The autothrottle is active. */
  Active,
}

export enum AutothrottleMode {
  None = '',
  Speed = 'SPD',
  Thrust = 'THR',
  SpeedProtection = 'ASP',
  SpeedLimit = 'LIM',
  EmergencyDescent = 'EDM',
}

/** Auto throttle data provided. */
export interface AutothrottleDataProvider {
  /** The current autothrottle state, or null when invalid. */
  state: Subscribable<AutothrottleState | null>,

  /** The current autothrottle mode, or null when invalid. */
  mode: Subscribable<AutothrottleMode | null>,

  /** The thrust director target throttle speed in range [0, 1], or null when the thrust director is disabled. */
  thrustDirectorTargetSpeed: Subscribable<number | null>;

  /** Are autothrottle speed protections available? */
  speedProtectionAvailable: boolean;

  /**
   * What is the current target calibrated airspeed,
   * accounting for a conversion from target mach to target cas if AT is targetting a mach number
   * */
  targetCasConverted: Subscribable<number>
}

/** An autothrottle data provider */
export class DefaultAutothrottleDataProvider implements AutothrottleDataProvider, Instrument {
  protected readonly sub = this.bus.getSubscriber<Epic2AutothrottleEvents & AutothrottleEvents & AmbientEvents & VirtualThrottleLeverEvents>();
  protected readonly ambientPressure = ConsumerSubject.create(this.sub.on('ambient_qnh_mb'), 0).pause();

  protected readonly atArmedMode = ConsumerValue.create(this.sub.on('epic2_at_mode_armed'), Epic2AutothrottleModes.NONE).pause();
  protected readonly atActiveMode = ConsumerValue.create(this.sub.on('epic2_at_mode_active'), Epic2AutothrottleModes.NONE).pause();
  protected readonly atStatus = ConsumerValue.create(this.sub.on('epic2_at_status'), Epic2AutothrottleStatus.Off).pause();
  protected readonly atDisconnectWarning = ConsumerValue.create(this.sub.on('epic2_at_deactivate_warning'), false).pause();
  protected readonly atThrustDirectorSpeed = ConsumerSubject.create(this.sub.on('epic2_at_target_throttle_speed'), null).pause();
  protected readonly atUnderspeedEngaged = ConsumerValue.create(this.sub.on('at_underspeed_prot_is_engaged'), false).pause();
  protected readonly atOverspeedEngaged = ConsumerValue.create(this.sub.on('at_overspeed_prot_is_engaged'), false).pause();
  protected readonly atTargetCas = ConsumerSubject.create(this.sub.on('epic2_at_target_cas'), 0).pause();
  protected readonly atTargetMach = ConsumerSubject.create(this.sub.on('epic2_at_target_mach'), 0).pause();

  protected readonly throttlePos: Accessible<number>;
  protected readonly atMaxThrottlePos = ConsumerValue.create(this.sub.on('at_max_throttle_pos'), 0).pause();
  protected readonly atMinThrottlePos = ConsumerValue.create(this.sub.on('at_min_throttle_pos'), 0).pause();

  protected readonly _state = Subject.create<AutothrottleState | null>(null);
  public readonly state = this._state as Subscribable<AutothrottleState | null>;

  protected readonly _mode = Subject.create<AutothrottleMode | null>(null);
  public readonly mode = this._mode as Subscribable<AutothrottleMode | null>;

  protected readonly _thrustDirectorTargetSpeed = Subject.create(null);
  public readonly thrustDirectorTargetSpeed = this._thrustDirectorTargetSpeed as Subscribable<number | null>;

  protected readonly thrustDirectorSpeedPipe = this.atThrustDirectorSpeed.pipe(this._thrustDirectorTargetSpeed, true);

  protected readonly _targetCasConverted = MappedSubject.create(
    ([targetCas, targetMach, ambientPressure]) => {
      if (targetMach > 0) {
        return UnitType.KNOT.convertFrom(AeroMath.machToCas(targetMach, ambientPressure), UnitType.MPS);
      } else {
        return targetCas;
      }
    }, this.atTargetCas, this.atTargetMach, this.ambientPressure
  );
  public readonly targetCasConverted = this._targetCasConverted as Subscribable<number>;

  public readonly speedProtectionAvailable = this.config.speedProtectionAvailable;

  protected isActive = false;

  protected readonly pausables: Subscription[] = [
    this.atArmedMode,
    this.atActiveMode,
    this.atStatus,
    this.atDisconnectWarning,
    this.atThrustDirectorSpeed,
    this.thrustDirectorSpeedPipe,
    this.atUnderspeedEngaged,
    this.atOverspeedEngaged,
    this.atTargetCas,
    this.atTargetMach,
    this.ambientPressure,
    this.atMaxThrottlePos,
    this.atMinThrottlePos
  ];

  protected readonly outputSubs = [
    this._state,
    this._mode,
    this._thrustDirectorTargetSpeed,
  ];

  /**
   * Ctor.
   * @param bus The event bus.
   * @param config The autothrottle panel config
   * @param airspeedDataProvider An airspeed data provider
   */
  constructor(
    protected readonly bus: EventBus,
    private readonly config: AutothrottleConfig,
    private readonly airspeedDataProvider: AirspeedDataProvider
  ) {
    const numEngines = SimVar.GetSimVarValue('NUMBER OF ENGINES', SimVarValueType.Number);
    this.throttlePos = MappedValue.create(
      SubscribableMapFunctions.average(),
      ...Array.from({length: numEngines}, (_, i) => i + 1).map((i) => ConsumerValue.create(this.sub.on(`v_throttle_lever_pos_${i}`), 0))
    );
  }

  /** Resumes all data. */
  public resume(): void {
    for (const sub of this.pausables) {
      sub.resume(true);
    }
    this.isActive = true;
  }

  /** Pauses all data. */
  public pause(): void {
    this.isActive = false;
    for (const sub of this.pausables) {
      sub.pause();
    }

    for (const sub of this.outputSubs) {
      sub.set(null);
    }
  }

  /** @inheritdoc */
  public init(): void {
    this.resume();
  }

  /** @inheritdoc */
  public onUpdate(): void {
    if (!this.isActive) {
      return;
    }

    // TODO edm

    /*  eslint-disable no-case-declarations */
    const atStatus = this.atStatus.get();
    if (atStatus === Epic2AutothrottleStatus.Armed) {
      this._state.set(AutothrottleState.Armed);
      // FIXME PC-24 does not show a mode...
      this._mode.set(AutothrottleMode.Thrust);
    } else if (atStatus === Epic2AutothrottleStatus.On) {
      this._state.set(AutothrottleState.Active);
      switch (this.atActiveMode.get()) {
        case Epic2AutothrottleModes.CLIMB:
        case Epic2AutothrottleModes.DESC:
        case Epic2AutothrottleModes.HOLD:
        case Epic2AutothrottleModes.TO:
          this._mode.set(AutothrottleMode.Thrust);
          break;
        case Epic2AutothrottleModes.MAX_SPD:
        case Epic2AutothrottleModes.MIN_SPD:
          this._mode.set(AutothrottleMode.SpeedProtection);
          break;
        case Epic2AutothrottleModes.SPD:
          const cas = this.airspeedDataProvider.cas.get();
          const targetCas = this.targetCasConverted.get();
          const casTrendError = this.airspeedDataProvider.casTrendDiff.get();
          const throttlePos = this.throttlePos.get();
          const minThrottle = this.atMinThrottlePos.get();
          const maxThrottle = this.atMaxThrottlePos.get();

          if (
            (cas && casTrendError) &&
            (
              (cas > targetCas && casTrendError > 0 && throttlePos <= minThrottle + 0.01) ||
              (cas < targetCas && casTrendError < 0 && throttlePos >= maxThrottle - 0.01)
            )) {

            this._mode.set(AutothrottleMode.SpeedLimit);
          } else {
            this._mode.set(AutothrottleMode.Speed);
          }
          break;
        default:
          this._mode.set(AutothrottleMode.None);
      }

      if (this.atUnderspeedEngaged.get() || this.atOverspeedEngaged.get()) {
        this._mode.set(AutothrottleMode.SpeedProtection);
      }
    } else if (this.atDisconnectWarning.get()) {
      this._state.set(AutothrottleState.Warning);
      this._mode.set(AutothrottleMode.None);
    } else {
      this._state.set(AutothrottleState.Inactive);
      this._mode.set(AutothrottleMode.None);
    }
    /*  eslint-enable no-case-declarations */
  }
}

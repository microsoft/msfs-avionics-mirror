/// <reference types="@microsoft/msfs-types/js/simvar" />

import { EventBus, KeyEventData, KeyEvents, KeyEventManager, SimVarValueType } from '../../data';
import { MathUtils } from '../../math';
import { APValues } from '../APValues';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/** Options for {@link APPitchDirector} */
export type APPitchDirectorOptions = {
  /** The pitch increment, in degrees, to use when the user presses the pitch inc/dec keys, or a function that returns it (default: 0.5). */
  pitchIncrement?: number | (() => number);
  /** The negative minimum pitch angle, in degrees, to clamp the pitch to, or a function that returns it (default: -15). */
  minPitch?: number | (() => number);
  /** The positive maximum pitch angle, in degrees, to clamp the pitch to, or a function that returns it (default: 20). */
  maxPitch?: number | (() => number);
  /** Whether to always quantise the pitch in terms of {@link APPitchDirectorOptions.pitchIncrement}. */
  quantisePitch?: boolean;
};

/**
 * An autopilot pitch director.
 */
export class APPitchDirector implements PlaneDirector {

  public state: DirectorState;
  private keyEventManager?: KeyEventManager;

  /** @inheritdoc */
  public onActivate?: () => void;
  /** @inheritdoc */
  public onArm?: () => void;
  /** @inheritdoc */
  public setPitch?: (pitch: number) => void;

  private selectedPitch = 0;

  protected readonly pitchIncrement: () => number;
  protected readonly minPitch: () => number;
  protected readonly maxPitch: () => number;
  protected readonly quantisePitch: boolean;

  /**
   * Creates an instance of the LateralDirector.
   * @param pitchIncrement is the pitch increment, in degrees, to use when the user presses the pitch inc/dec keys (default: 0.5)
   * @param minPitch is the negative minimum pitch angle, in degrees, to clamp the pitch to. (default: -15)
   * @param maxPitch is the positive maximum pitch angle, in degrees, to clamp the pitch to. (default: 20)
   * @deprecated Use {@link APPitchDirectorOptions} instead.
   */
  constructor(
    bus: EventBus,
    apValues: APValues,
    pitchIncrement?: number,
    minPitch?: number,
    maxPitch?: number,
  );
  /**
   * Creates an instance of the LateralDirector.
   * @param bus The event bus to use with this instance.
   * @param apValues are the AP Values subjects.
   * @param options Options to configure the new director. Option values default to the following if not defined:
   * * `pitchIncrement`: `0.5`
   * * `minPitch`: `-15`
   * * `maxPitch`: `20`
   * * `quantisePitch`: `false`
   */
  constructor(
    bus: EventBus,
    apValues: APValues,
    options?: Partial<Readonly<APPitchDirectorOptions>>,
  );
  /**
   * Creates an instance of the LateralDirector.
   * @param bus The event bus to use with this instance.
   * @param apValues are the AP Values subjects.
   * @param arg0 Options, or for the legacy ctor is the pitch increment, in degrees,
   * to use when the user presses the pitch inc/dec keys (default: 0.5).
   * @param minPitch For the legacy ctor, is the negative minimum pitch angle, in degrees, to clamp the pitch to. (default: -15).
   * @param maxPitch For the legacy ctor, is the positive maximum pitch angle, in degrees, to clamp the pitch to. (default: 20).
   */
  constructor(
    bus: EventBus,
    private readonly apValues: APValues,
    arg0?: Partial<Readonly<APPitchDirectorOptions>> | number,
    minPitch?: number,
    maxPitch?: number,
  ) {
    // handle legacy constructor args
    const options = typeof arg0 === 'number' ? {
      pitchIncrement: arg0,
      minPitch,
      maxPitch,
    } as Partial<Readonly<APPitchDirectorOptions>>
      : arg0;

    // set options
    this.pitchIncrement = APPitchDirector.getOptionFunction(0.5, options?.pitchIncrement);
    this.minPitch = APPitchDirector.getOptionFunction(-15, options?.minPitch);
    this.maxPitch = APPitchDirector.getOptionFunction(20, options?.maxPitch);
    this.quantisePitch = !!(options?.quantisePitch);

    this.state = DirectorState.Inactive;

    this.apValues.selectedPitch.sub((p) => {
      this.selectedPitch = p;
      if (this.state == DirectorState.Active) {
        // send it in again to make sure its clamped
        this.setPitch && this.setPitch(p);
      }
    });

    // setup inc/dec event intercept
    KeyEventManager.getManager(bus).then(manager => {
      this.keyEventManager = manager;

      manager.interceptKey('AP_PITCH_REF_INC_UP', false);
      manager.interceptKey('AP_PITCH_REF_INC_DN', false);

      const keySub = bus.getSubscriber<KeyEvents>();
      keySub.on('key_intercept').handle(this.onKeyIntercepted.bind(this));

    });
  }

  /**
   * Get a function that returns the value for an option property.
   * @param defaultValue The default value.
   * @param optValue The {@link APPitchDirectorOptions} value.
   * @returns Either the function given in the options, a function returning the value given in the options,
   * or a function returning the default value.
   */
  private static getOptionFunction(defaultValue: number, optValue?: number | (() => number)): () => number {
    switch (typeof optValue) {
      case 'number':
        return () => optValue;
      case 'function':
        return optValue;
      default:
        return () => defaultValue;
    }
  }

  /**
   * Activates this director.
   */
  public activate(): void {
    this.state = DirectorState.Active;
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
    const currentPitch = SimVar.GetSimVarValue('PLANE PITCH DEGREES', SimVarValueType.Degree);
    this.setPitch && this.setPitch(this.getTargetPitch(currentPitch));
    SimVar.SetSimVarValue('AUTOPILOT PITCH HOLD', 'Bool', true);
  }

  /**
   * Arms this director.
   * This director has no armed mode, so it activates immediately.
   */
  public arm(): void {
    if (this.state == DirectorState.Inactive) {
      this.activate();
    }
  }

  /**
   * Deactivates this director.
   */
  public deactivate(): void {
    this.state = DirectorState.Inactive;
    SimVar.SetSimVarValue('AUTOPILOT PITCH HOLD', 'Bool', false);
  }

  /**
   * Responds to key intercepted events.
   * @param k the key event data
   */
  private onKeyIntercepted(k: KeyEventData): void {
    switch (k.key) {
      case 'AP_PITCH_REF_INC_UP':
      case 'AP_PITCH_REF_INC_DN':
        this.setPitch && this.setPitch(this.getTargetPitch(this.selectedPitch + (k.key === 'AP_PITCH_REF_INC_UP' ? -this.pitchIncrement() : this.pitchIncrement())));
        break;
      default:
        return;
    }
  }

  /**
   * Updates this director.
   */
  public update(): void {
    //noop
  }

  /**
   * Get the desired pitch, clamped between min and max, and quantised to pitch increment if enabled.
   * @param desiredPitch The desired pitch in degrees (-ve is up).
   * @returns the target pitch in degrees (-ve is up).
   */
  private getTargetPitch(desiredPitch: number): number {
    return MathUtils.clamp(
      this.quantisePitch ? MathUtils.round(desiredPitch, this.pitchIncrement()) : desiredPitch,
      -this.maxPitch(), -this.minPitch()
    );
  }
}

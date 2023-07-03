/// <reference types="@microsoft/msfs-types/js/simvar" />

import { EventBus, KeyEventData, KeyEvents, KeyEventManager, SimVarValueType } from '../../data';
import { MathUtils } from '../../math';
import { APValues } from '../APConfig';
import { DirectorState, PlaneDirector } from './PlaneDirector';

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

  /**
   * Creates an instance of the LateralDirector.
   * @param bus The event bus to use with this instance.
   * @param apValues are the AP Values subjects.
   * @param pitchIncrement is the pitch increment, in degrees, to use when the user presses the pitch inc/dec keys (default: 0.5)
   * @param minPitch is the negative minimum pitch angle, in degrees, to clamp the pitch to. (default: -15)
   * @param maxPitch is the positive maximum pitch angle, in degrees, to clamp the pitch to. (default: 20)
   */
  constructor(bus: EventBus, private readonly apValues: APValues,
    private readonly pitchIncrement = 0.5, private readonly minPitch = -15, private readonly maxPitch = 20) {

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
   * Activates this director.
   */
  public activate(): void {
    this.state = DirectorState.Active;
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
    const currentPitch = SimVar.GetSimVarValue('PLANE PITCH DEGREES', SimVarValueType.Degree);
    this.setPitch && this.setPitch(MathUtils.clamp(currentPitch, -this.maxPitch, -this.minPitch));
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
        this.setPitch && this.setPitch(this.selectedPitch + (k.key === 'AP_PITCH_REF_INC_UP' ? -this.pitchIncrement : this.pitchIncrement));
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
}
import {
  APValues, APVerticalModes, ConsumerValue, DirectorState, EventBus, KeyEventData, KeyEventManager, KeyEvents, MathUtils, PlaneDirector, SimVarValueType,
  VNavEvents, VNavState
} from '@microsoft/msfs-sdk';

/**
 * An autopilot pitch director.
 */
export class Epic2ApPitchDirector implements PlaneDirector {
  public state =  DirectorState.Inactive;
  private keyEventManager?: KeyEventManager;

  /** @inheritdoc */
  public onActivate?: () => void;
  /** @inheritdoc */
  public onArm?: () => void;
  /** @inheritdoc */
  public setPitch?: (pitch: number) => void;
  /** A method to determine whether overspeed protection is active. */
  public isOverspeedActive: (() => boolean) | null = null;

  /** The selected pitch in degrees, -ve is up. */
  private selectedPitch = 0;

  protected readonly pitchIncrement = 0.25;
  protected readonly minPitch = -20;
  protected readonly maxPitch = 20;
  protected readonly quantisePitch = true;

  private readonly vnavState = ConsumerValue.create(this.bus.getSubscriber<VNavEvents>().on('vnav_state'), VNavState.Disabled);

  /**
   * Creates an instance of the LateralDirector.
   * @param bus The event bus to use with this instance.
   * @param apValues are the AP Values subjects.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly apValues: APValues,
  ) {
    this.apValues.selectedPitch.sub((p) => {
      // if overspeed protection is active, it will be setting the sim pitch ref,
      // so we want to ignore it in that case.
      // The pitch wheel is also only effective when the director is active.
      if (!this.isOverspeedActive?.() && this.state == DirectorState.Active) {
        this.selectedPitch = this.getTargetPitch(p);
      }
    });

    // setup inc/dec event intercept
    KeyEventManager.getManager(bus).then(manager => {
      this.keyEventManager = manager;

      manager.interceptKey('AP_PITCH_REF_INC_UP', false);
      manager.interceptKey('AP_PITCH_REF_INC_DN', false);
      manager.interceptKey('AP_PITCH_REF_SET', false);

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
    this.selectedPitch = this.getTargetPitch(SimVar.GetSimVarValue('PLANE PITCH DEGREES', SimVarValueType.Degree));
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
        // if the pitch wheel is turned in ALT/ASEL (not VALT/VSEL) mode, PIT activates instead
        if (
          this.vnavState.get() !== VNavState.Enabled_Active &&
          (this.apValues.verticalActive.get() === APVerticalModes.ALT || this.apValues.verticalActive.get() === APVerticalModes.CAP)
        ) {
          this.activate();
        }
        this.selectedPitch = this.getTargetPitch(this.selectedPitch + (k.key === 'AP_PITCH_REF_INC_UP' ? -this.pitchIncrement : this.pitchIncrement));
        break;
      case 'AP_PITCH_REF_SET':
        if (k.value0 !== undefined) {
          this.selectedPitch = this.getTargetPitch(k.value0);
        }
        break;
      default:
        return;
    }
  }

  /**
   * Updates this director.
   */
  public update(): void {
    // we want to set the pitch every update to work with the overspeed protection
    if (this.state === DirectorState.Active && this.setPitch) {
      this.setPitch(this.selectedPitch);
    }
  }

  /**
   * Get the desired pitch, clamped between min and max, and quantised to pitch increment if enabled.
   * @param desiredPitch The desired pitch in degrees (-ve is up).
   * @returns the target pitch in degrees (-ve is up).
   */
  private getTargetPitch(desiredPitch: number): number {
    return MathUtils.clamp(MathUtils.round(desiredPitch, this.pitchIncrement), -this.maxPitch, -this.minPitch);
  }
}

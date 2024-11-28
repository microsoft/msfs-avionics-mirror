import { AdcEvents, ConsumerValue, DirectorState, EventBus, GenericFlcComputer, PlaneDirector, Subscription } from '@microsoft/msfs-sdk';

import { AirGroundDataProviderEvents, SpeedLimitEvents } from '../../Instruments';

/** A director that wraps another vertical director providing it with overspeed protection (MxSPD). */
export class Epic2OverspeedProtectedDirector implements PlaneDirector {
  /** Overspeed deactivation hysteresis in degrees of pitch. */
  private static readonly OVERSPEED_HYSTERESIS = 1;

  public readonly isOverspeedProtected = true;

  /** @inheritdoc */
  public onActivate?: () => void;

  /** @inheritdoc */
  public onDeactivate?: () => void;

  /** @inheritDoc */
  public drivePitch?: (pitch: number, adjustForAoa?: boolean, adjustForVerticalWind?: boolean) => void;

  /** @inheritdoc */
  public setPitch?: (pitch: number) => void;

  /** A method provided by the AP to get an adjusted pitch from the {@link AutopilotDriver}. */
  public getAdjustedPitch?: (pitch: number, adjustForAoa?: boolean, adjustForVerticalWind?: boolean) => number;

  /** The pitch set by the inner director, or null if none or drivePitch was used. */
  private setPitchPitch: number | null = null;

  /** The pitch driven by the inner director, or null if none or setPitch was used. */
  private drivePitchPitch: number | null = null;

  /** Whether overspeed protection is currently active. */
  public isOverspeedActive = false;

  private readonly overspeedFlcComputer = new GenericFlcComputer({ kP: 2, kI: 0, kD: 0, maxOut: 90, minOut: -90 });
  private readonly maxCas = ConsumerValue.create(this.bus.getSubscriber<SpeedLimitEvents>().on('speedlimit_max_operating_ias'), Infinity).pause();
  private readonly isOnGround = ConsumerValue.create(this.bus.getSubscriber<AirGroundDataProviderEvents>().on('air_ground_is_on_ground'), false).pause();
  private readonly cas = ConsumerValue.create(this.bus.getSubscriber<AdcEvents>().on('ias'), 0).pause();

  private readonly dataSubs: Subscription[] = [
    this.maxCas,
    this.isOnGround,
    this.cas,
  ];

  /** @inheritdoc */
  public readonly arm = this.protectedDirector.arm.bind(this.protectedDirector);
  /** @inheritdoc */
  public readonly activate = this.protectedDirector.activate.bind(this.protectedDirector);
  /** @inheritdoc */
  public readonly deactivate = this.protectedDirector.deactivate.bind(this.protectedDirector);

  /**
   * Ctor.
   * @param bus The instrument event bus.
   * @param protectedDirector The inner director to protect.
   * This is necessary for the PIT director as it feeds the overspeed pitch command back in.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly protectedDirector: PlaneDirector,
  ) {
    protectedDirector.setPitch = this.handleSetPitch.bind(this);
    protectedDirector.drivePitch = this.handleDrivePitch.bind(this);
    protectedDirector.onActivate = this.handleActivate.bind(this);
    protectedDirector.onDeactivate = this.handleDeactivate.bind(this);
    if ('isOverspeedActive' in protectedDirector) {
      protectedDirector.isOverspeedActive = () => this.isOverspeedActive;
    }
  }

  /** @inheritdoc */
  public get state(): DirectorState {
    return this.protectedDirector.state;
  }

  /**
   * A callback called to set an exact AP pitch target from the protected (inner) director.
   * @param pitch The pitch in degrees (positive = down, negative = up).
   */
  private handleSetPitch(pitch: number): void {
    this.setPitchPitch = pitch;
    this.drivePitchPitch = null;
  }

  /**
   * A function used to drive the autopilot commanded pitch angle toward a desired value while optionally correcting
   * for angle of attack and vertical wind from the protected (inner) director.
   * @param pitch The desired pitch angle, in degrees. Positive values indicate downward pitch.
   * @param adjustForAoa Whether to adjust the commanded pitch angle for angle of attack. If `true`, the provided pitch
   * angle is treated as a desired flight path angle and a new commanded pitch angle will be calculated to produce the
   * desired FPA given the airplane's current angle of attack. This correction can be used in conjunction with the
   * vertical wind correction. Defaults to `false`.
   * @param adjustForVerticalWind Whether to adjust the commanded pitch angle for vertical wind velocity. If `true`,
   * the provided pitch angle is treated as a desired flight path angle and a new commanded pitch angle will be
   * calculated to produce the desired FPA given the current vertical wind component. This correction can be used in
   * conjunction with the angle of attack correction. Defaults to `false`.
   */
  private handleDrivePitch(pitch: number, adjustForAoa?: boolean, adjustForVerticalWind?: boolean): void {
    this.setPitchPitch = null;
    this.drivePitchPitch = this.getAdjustedPitch!(pitch, adjustForAoa, adjustForVerticalWind);
  }

  /** @inheritdoc */
  public update(): void {
    this.protectedDirector.update();

    if (this.state === DirectorState.Active) {
      let overspeedPitch: number | null = null;

      if (!this.isOnGround.get()) {
        this.overspeedFlcComputer.setTargetSpeed(this.maxCas.get());

        if (!this.overspeedFlcComputer.isActive) {
          this.overspeedFlcComputer.activate(false);
        }
        this.overspeedFlcComputer.update();

        overspeedPitch = this.overspeedFlcComputer.pitchTarget.get();

        /** The desired pitch from the inner director. */
        const desiredPitch: number | null = this.setPitchPitch !== null ? this.setPitchPitch : this.drivePitchPitch;

        // If overspeed is not active, CAS needs to be above max to activate it.
        // If it is active, the overspeed pitch needs to be below the inner director's desired pitch.
        this.isOverspeedActive = (this.isOverspeedActive || this.cas.get() > this.maxCas.get())
          && overspeedPitch !== null
          && desiredPitch !== null
          && overspeedPitch < (desiredPitch + (this.isOverspeedActive ? Epic2OverspeedProtectedDirector.OVERSPEED_HYSTERESIS : 0));
      } else {
        this.overspeedFlcComputer.deactivate();
        this.isOverspeedActive = false;
      }

      if (this.isOverspeedActive) {
        this.drivePitch?.(overspeedPitch!, false, false);
      } else if (this.setPitchPitch !== null) {
        this.setPitch?.(this.setPitchPitch);
      } else if (this.drivePitchPitch !== null) {
        this.drivePitch?.(this.drivePitchPitch, false, false);
      }
    }
  }

  /** @inheritdoc */
  public set onArm(handler: () => void) {
    this.protectedDirector.onArm = handler;
  }

  /**
   * Handles onActivate from the inner director.
   */
  private handleActivate(): void {
    for (const sub of this.dataSubs) {
      sub.resume(true);
    }
    this.onActivate?.();
  }

  /**
   * Handles onDeactivate from the inner director.
   */
  private handleDeactivate(): void {
    this.onDeactivate?.();

    for (const sub of this.dataSubs) {
      sub.pause();
    }

    this.isOverspeedActive = false;
    this.drivePitchPitch = null;
    this.setPitchPitch = null;
    this.overspeedFlcComputer.deactivate();
  }
}

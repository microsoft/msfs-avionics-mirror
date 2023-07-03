/// <reference types="@microsoft/msfs-types/js/simvar" />

import { ConsumerValue, EventBus, SimVarValueType } from '../../data';
import { MathUtils, SimpleMovingAverage } from '../../math';
import { VNavEvents } from '../data/VNavEvents';
import { VNavUtils } from '../VNavUtils';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * A VNAV Path autopilot director.
 */
export class APVNavPathDirector implements PlaneDirector {

  public state: DirectorState;

  /** @inheritdoc */
  public onActivate?: () => void;

  /** @inheritdoc */
  public onArm?: () => void;

  /** @inheritdoc */
  public onDeactivate?: () => void;

  /** @inheritdoc */
  public drivePitch?: (pitch: number, adjustForAoa?: boolean, adjustForVerticalWind?: boolean) => void;

  protected readonly deviation = ConsumerValue.create(null, Number.MAX_SAFE_INTEGER);
  protected readonly fpa = ConsumerValue.create(null, 0);

  protected verticalWindAverage = new SimpleMovingAverage(10);

  /**
   * Creates an instance of the APVNavPathDirector.
   * @param bus The event bus to use with this instance.
   */
  constructor(bus: EventBus) {
    this.state = DirectorState.Inactive;

    const sub = bus.getSubscriber<VNavEvents>();

    this.deviation.setConsumer(sub.on('vnav_vertical_deviation').whenChanged());
    this.fpa.setConsumer(sub.on('vnav_fpa').whenChanged());

    this.pauseSubs();
  }

  /** Resumes Subscriptions. */
  private resumeSubs(): void {
    this.deviation.resume();
    this.fpa.resume();
  }

  /** Pauses Subscriptions. */
  private pauseSubs(): void {
    this.deviation.pause();
    this.fpa.pause();
  }

  /**
   * Activates this director.
   */
  public activate(): void {
    this.resumeSubs();
    this.state = DirectorState.Active;
    SimVar.SetSimVarValue('AUTOPILOT PITCH HOLD', 'Bool', 0);
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
  }

  /**
   * Arms this director.
   */
  public arm(): void {
    this.resumeSubs();
    if (this.state === DirectorState.Inactive) {
      this.state = DirectorState.Armed;
      if (this.onArm !== undefined) {
        this.onArm();
      }
    }
  }

  /**
   * Deactivates this director.
   */
  public deactivate(): void {
    this.state = DirectorState.Inactive;
    this.onDeactivate && this.onDeactivate();
    this.pauseSubs();
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this.state === DirectorState.Active) {
      this.drivePitch && this.drivePitch(this.getDesiredPitch(), true, true);
    }
  }

  /**
   * Gets a desired pitch from the FPA, AOA and Deviation.
   * @returns The desired pitch angle.
   */
  protected getDesiredPitch(): number {
    // fpa value is positive for down
    const fpa = this.fpa.get();
    const groundSpeed = SimVar.GetSimVarValue('GROUND VELOCITY', SimVarValueType.Knots);

    const fpaPercentage = Math.max(this.deviation.get() / (VNavUtils.getPathErrorDistance(groundSpeed) * -1), -1) + 1;

    // We limit desired pitch to avoid divebombing if something like a flight plan change suddenly puts you way above the path
    return Math.min(MathUtils.clamp(fpa * fpaPercentage, -1, fpa + 3), 10);
  }
}
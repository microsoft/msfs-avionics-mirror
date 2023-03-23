/// <reference types="@microsoft/msfs-types/js/simvar" />

import { EventBus, SimVarValueType } from '../../data';
import { AdcEvents, GNSSEvents } from '../../instruments';
import { MathUtils, SimpleMovingAverage, UnitType } from '../../math';
import { APValues } from '../APConfig';
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

  protected deviation = 0;

  protected fpa = 0;

  protected verticalWindAverage = new SimpleMovingAverage(10);
  protected tas = 0;
  protected groundSpeed = 0;

  /**
   * Creates an instance of the APVNavPathDirector.
   * @param bus The event bus to use with this instance.
   * @param apValues are the ap selected values for the autopilot.
   */
  constructor(private readonly bus: EventBus, private readonly apValues: APValues) {
    this.state = DirectorState.Inactive;

    this.bus.getSubscriber<VNavEvents>().on('vnav_vertical_deviation').whenChanged().handle(dev => this.deviation = dev);
    this.bus.getSubscriber<VNavEvents>().on('vnav_fpa').whenChanged().handle(fpa => this.fpa = fpa);
    this.bus.getSubscriber<AdcEvents>().on('tas').withPrecision(0).handle((tas) => {
      this.tas = tas;
    });
    this.bus.getSubscriber<GNSSEvents>().on('ground_speed').withPrecision(0).handle((gs) => {
      this.groundSpeed = gs;
    });
  }

  /**
   * Activates this director.
   */
  public activate(): void {
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
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this.state === DirectorState.Active) {
      this.setPitch(this.getDesiredPitch());
    }
  }

  /**
   * Gets a desired pitch from the FPA, AOA and Deviation.
   * @returns The desired pitch angle.
   */
  protected getDesiredPitch(): number {

    const fpaVsRequired = VNavUtils.getVerticalSpeedFromFpa(this.fpa, this.groundSpeed) * -1;
    const fpaPercentage = Math.max(this.deviation / (VNavUtils.getPathErrorDistance(this.groundSpeed) * -1), -1) + 1;

    const vsRequiredForFpa = MathUtils.clamp(fpaVsRequired * fpaPercentage, fpaVsRequired - 1500, 1000);

    //We need the instant vertical wind component here so we're avoiding the bus
    const verticalWindComponent = this.verticalWindAverage.getAverage(SimVar.GetSimVarValue('AMBIENT WIND Y', SimVarValueType.FPM));

    const vsRequiredWithVerticalWind = vsRequiredForFpa - verticalWindComponent;

    const pitchForVerticalSpeed = VNavUtils.getFpa(UnitType.NMILE.convertTo(this.tas / 60, UnitType.FOOT), vsRequiredWithVerticalWind);

    //We need the instant AOA here so we're avoiding the bus
    const aoa = SimVar.GetSimVarValue('INCIDENCE ALPHA', SimVarValueType.Degree);

    return aoa + pitchForVerticalSpeed;
  }

  /**
   * Sets the desired AP pitch angle.
   * @param targetPitch The desired AP pitch angle.
   */
  protected setPitch(targetPitch: number): void {
    if (isFinite(targetPitch)) {
      SimVar.SetSimVarValue('AUTOPILOT PITCH HOLD REF', SimVarValueType.Degree, -targetPitch);
    }
  }
}
/// <reference types="@microsoft/msfs-types/js/simvar" />

import { EventBus, SimVarValueType } from '../../data';
import { AdcEvents } from '../../instruments';
import { MathUtils, UnitType } from '../../math';
import { APValues } from '../APConfig';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * Options for {@link APHdgDirector}.
 */
export type APFPADirectorOptions = {
  /**
   * The maximum flight path angle, in degrees, supported by the director, or a function which returns it. If not defined,
   * the director will not limit the FPA.
   */
  maxFpa: number | (() => number) | undefined;
};

/**
 * A flight path angle autopilot director.
 */
export class APFPADirector implements PlaneDirector {

  public state: DirectorState;

  /** A callback called when the director activates. */
  public onActivate?: () => void;

  /** A callback called when the director arms. */
  public onArm?: () => void;

  private readonly maxFpaFunc: () => number;

  private tas = 0;
  private selectedFpa = 0;

  /**
   * Creates an instance of the LateralDirector.
   * @param bus The event bus to use with this instance.
   * @param apValues are the ap selected values for the autopilot.
   * @param options Options to configure the new director. Option values default to the following if not defined:
   * * `maxFpa`: `undefined`
   */
  constructor(private readonly bus: EventBus, apValues: APValues, options?: Partial<Readonly<APFPADirectorOptions>>) {
    const maxBankAngleOpt = options?.maxFpa ?? undefined;
    switch (typeof maxBankAngleOpt) {
      case 'number':
        this.maxFpaFunc = () => maxBankAngleOpt;
        break;
      case 'function':
        this.maxFpaFunc = maxBankAngleOpt;
        break;
      default:
        this.maxFpaFunc = () => Infinity;
    }

    this.state = DirectorState.Inactive;

    this.bus.getSubscriber<AdcEvents>().on('tas').withPrecision(0).handle((tas) => {
      this.tas = tas;
    });

    apValues.selectedFlightPathAngle.sub((fpa) => {
      const maxFpa = this.maxFpaFunc();
      this.selectedFpa = MathUtils.clamp(fpa, -maxFpa, maxFpa);
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
    const fpa = this.getFpaFromVs(Simplane.getVerticalSpeed());
    SimVar.SetSimVarValue('L:WT_AP_FPA_Target:1', 'degree', fpa);
    SimVar.SetSimVarValue('AUTOPILOT VERTICAL HOLD', 'Bool', true);
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
    SimVar.SetSimVarValue('AUTOPILOT VERTICAL HOLD', 'Bool', false);
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
   * Gets a desired pitch from the selected vs value.
   * @returns The desired pitch angle.
   */
  private getDesiredPitch(): number {
    //We need the instant AOA here so we're avoiding the bus
    const aoa = SimVar.GetSimVarValue('INCIDENCE ALPHA', SimVarValueType.Degree);

    const desiredPitch = this.selectedFpa;
    return MathUtils.clamp(aoa + (isNaN(desiredPitch) ? 9.9 : desiredPitch), -18, 18);
  }

  /**
   * Gets a desired fpa.
   * @param vs Vertical speed in feet/min to calculate as FPA for
   * @returns The desired pitch angle.
   */
  private getFpaFromVs(vs: number): number {
    if (this.tas < 60) {
      return 0;
    }

    const verticalWindComponent = SimVar.GetSimVarValue('AMBIENT WIND Y', SimVarValueType.FPM);
    const distance = UnitType.NMILE.convertTo(this.tas / 60, UnitType.FOOT);
    const altitude = vs - verticalWindComponent;

    const maxFpa = this.maxFpaFunc();
    return MathUtils.clamp(UnitType.RADIAN.convertTo(Math.atan(altitude / distance), UnitType.DEGREE), -maxFpa, maxFpa);
  }


  /**
   * Sets the desired AP pitch angle.
   * @param targetPitch The desired AP pitch angle.
   */
  private setPitch(targetPitch: number): void {
    if (isFinite(targetPitch)) {
      SimVar.SetSimVarValue('AUTOPILOT PITCH HOLD REF', SimVarValueType.Degree, -targetPitch);
    }
  }
}
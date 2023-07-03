/// <reference types="@microsoft/msfs-types/js/simvar" />

import { DirectorState, PlaneDirector } from './PlaneDirector';
import { SimVarValueType } from '../../data/SimVars';
import { MathUtils } from '../../math/MathUtils';
import { MappedSubscribable } from '../../sub';
import { APValues } from '../APConfig';

/**
 * Options for {@link APFPADirector}.
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

  /** @inheritdoc */
  public onActivate?: () => void;

  /** @inheritdoc */
  public onArm?: () => void;

  /** @inheritdoc */
  public drivePitch?: (pitch: number, adjustForAoa?: boolean, adjustForVerticalWind?: boolean) => void;

  private readonly maxFpaFunc: () => number;

  private readonly selectedFpa: MappedSubscribable<number>;

  /**
   * Creates an instance of the FPA Director.
   * @param apValues are the ap selected values for the autopilot.
   * @param options Options to configure the new director. Option values default to the following if not defined:
   * * `maxFpa`: `undefined`
   */
  constructor(private readonly apValues: APValues, options?: Partial<Readonly<APFPADirectorOptions>>) {
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

    this.selectedFpa = this.apValues.selectedFlightPathAngle.map(fpa => {
      const maxFpa = this.maxFpaFunc();
      return -MathUtils.clamp(fpa, -maxFpa, maxFpa);
    });

    this.state = DirectorState.Inactive;

    this.pauseSubs();
  }

  /** Resumes Subscriptions. */
  private resumeSubs(): void {
    this.selectedFpa.resume();
  }

  /** Pauses Subscriptions. */
  private pauseSubs(): void {
    this.selectedFpa.pause();
  }

  /**
   * Activates this director.
   */
  public activate(): void {
    this.resumeSubs();
    this.state = DirectorState.Active;
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
    const fpa = this.getCurrentFpa();
    SimVar.SetSimVarValue('L:WT_AP_FPA_Target:1', 'degree', fpa);
    SimVar.SetSimVarValue('AUTOPILOT VERTICAL HOLD', 'Bool', true);
  }

  /**
   * Arms this director.
   * This director has no armed mode, so it activates immediately.
   */
  public arm(): void {
    this.resumeSubs();
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
    this.pauseSubs();
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this.state === DirectorState.Active) {
      this.drivePitch && this.drivePitch(this.selectedFpa.get(), true, true);
    }
  }

  /**
   * Gets the current aircraft FPA.
   * @returns The current aircraft FPA, in degrees.
   */
  private getCurrentFpa(): number {
    const aoa = SimVar.GetSimVarValue('INCIDENCE ALPHA', SimVarValueType.Degree);
    const pitch = -SimVar.GetSimVarValue('PLANE PITCH DEGREES', SimVarValueType.Degree);
    return pitch - aoa;
  }
}
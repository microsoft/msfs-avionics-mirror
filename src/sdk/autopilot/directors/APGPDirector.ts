/// <reference types="@microsoft/msfs-types/js/simvar" />


import { ConsumerValue } from '../../data/ConsumerValue';
import { EventBus } from '../../data/EventBus';
import { SimVarValueType } from '../../data/SimVars';
import { Subscription } from '../../sub/Subscription';
import { APLateralModes, APValues } from '../APConfig';
import { VNavEvents, VNavVars } from '../data/VNavEvents';
import { ApproachGuidanceMode } from '../VerticalNavigation';
import { VNavUtils } from '../VNavUtils';
import { DirectorState, PlaneDirector } from './PlaneDirector';

/**
 * An RNAV LPV glidepath autopilot director.
 */
export class APGPDirector implements PlaneDirector {

  public state: DirectorState;

  /** @inheritdoc */
  public onActivate?: () => void;

  /** @inheritdoc */
  public onArm?: () => void;

  /** @inheritdoc */
  public drivePitch?: (pitch: number, adjustForAoa?: boolean, adjustForVerticalWind?: boolean) => void;

  private readonly gpDeviation = ConsumerValue.create(null, 0);
  private readonly fpa = ConsumerValue.create(null, 0);

  private handleApproachHasGp = (hasGp: boolean): void => {
    if (this.state !== DirectorState.Inactive && !hasGp) {
      this.deactivate();
    }
  };

  private readonly approachHasGpSub: Subscription;

  /**
   * Creates an instance of the LateralDirector.
   * @param bus The event bus to use with this instance.
   * @param apValues are the ap selected values for the autopilot.
   */
  constructor(bus: EventBus, private readonly apValues: APValues) {
    this.state = DirectorState.Inactive;

    const sub = bus.getSubscriber<VNavEvents>();
    this.gpDeviation.setConsumer(sub.on('gp_vertical_deviation').whenChanged());
    this.fpa.setConsumer(sub.on('gp_fpa').whenChanged());
    this.approachHasGpSub = apValues.approachHasGP.sub(this.handleApproachHasGp, true);

    this.pauseSubs();
  }

  /** Resumes Subscriptions. */
  private resumeSubs(): void {
    this.approachHasGpSub.resume(true);
    this.gpDeviation.resume();
    this.fpa.resume();
  }

  /** Pauses Subscriptions. */
  private pauseSubs(): void {
    this.approachHasGpSub.pause();
    this.gpDeviation.pause();
    this.fpa.pause();
  }

  /**
   * Activates this director.
   */
  public activate(): void {
    this.resumeSubs();
    this.state = DirectorState.Active;
    SimVar.SetSimVarValue(VNavVars.GPApproachMode, SimVarValueType.Number, ApproachGuidanceMode.GPActive);
    if (this.onActivate !== undefined) {
      this.onActivate();
    }
    SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ACTIVE', 'Bool', true);
    SimVar.SetSimVarValue('AUTOPILOT APPROACH ACTIVE', 'Bool', true);
    SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ARM', 'Bool', false);
  }

  /**
   * Arms this director.
   */
  public arm(): void {
    this.resumeSubs();
    if (this.state === DirectorState.Inactive) {
      this.state = DirectorState.Armed;
      SimVar.SetSimVarValue(VNavVars.GPApproachMode, SimVarValueType.Number, ApproachGuidanceMode.GPArmed);
      if (this.onArm !== undefined) {
        this.onArm();
      }
      SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ARM', 'Bool', true);
      SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ACTIVE', 'Bool', false);
      SimVar.SetSimVarValue('AUTOPILOT APPROACH ACTIVE', 'Bool', true);
    }
  }

  /**
   * Deactivates this director.
   */
  public deactivate(): void {
    this.state = DirectorState.Inactive;
    SimVar.SetSimVarValue(VNavVars.GPApproachMode, SimVarValueType.Number, ApproachGuidanceMode.None);
    SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ARM', 'Bool', false);
    SimVar.SetSimVarValue('AUTOPILOT GLIDESLOPE ACTIVE', 'Bool', false);
    SimVar.SetSimVarValue('AUTOPILOT APPROACH ACTIVE', 'Bool', false);
    this.pauseSubs();
  }

  /**
   * Updates this director.
   */
  public update(): void {
    if (this.state === DirectorState.Armed) {
      const gpDeviation = this.gpDeviation.get();
      if (this.apValues.lateralActive.get() === APLateralModes.GPSS &&
        gpDeviation <= 100 && gpDeviation >= -15 && this.fpa.get() !== 0) {
        this.activate();
      }
    }
    if (this.state === DirectorState.Active) {
      if (this.apValues.lateralActive.get() !== APLateralModes.GPSS) {
        this.deactivate();
      }
      const fpa = this.fpa.get();
      const groundSpeed = SimVar.GetSimVarValue('GROUND VELOCITY', SimVarValueType.Knots);
      const fpaPercentage = Math.max(this.gpDeviation.get() / (VNavUtils.getPathErrorDistance(groundSpeed) * -1), -1) + 1;
      this.drivePitch && this.drivePitch(fpa * fpaPercentage, true, true);
    }
  }
}
import { Accessible, AccessibleUtils } from '@microsoft/msfs-sdk';

import { EspModule } from '../EspModule';
import { EspData, EspForceController, EspOperatingMode } from '../EspTypes';

/**
 * Data describing the engagement state of an {@link EspPitchModule}.
 */
export type EspPitchModuleEngageData = {
  /** Whether the module is engaged. */
  isEngaged: boolean;

  /**
   * The pitch angle, in degrees, at or beyond which the module engages, or `NaN` if the module cannot engage. Positive
   * angles represent downward pitch.
   */
  engagePitch: number;

  /**
   * The pitch angle, in degrees, beyond which the module cannot engage, or `NaN` if there is no limit. Positive angles
   * represent downward pitch.
   */
  engagePitchLimit: number;

  /**
   * The pitch angle, in degrees, within which the module disengages, or `NaN` if the module cannot engage. Positive
   * angles represent downward pitch.
   */
  disengagePitch: number;
};

/**
 * Configuration options for {@link EspPitchModule}.
 */
export type EspPitchModuleOptions = {
  /**
   * The direction of pitch angle exceedance used by the module. With a direction of `up`, the module will engage with
   * excessive pitch up angles. With a direction of `down`, the module will engage with excessive pitch down angles.
   */
  exceedDirection: 'up' | 'down';

  /**
   * The pitch angle, in degrees, at or beyond which the module engages. Positive angles represent downward pitch.
   * A value equal to `NaN` will inhibit the module from engaging.
   */
  engagePitch: number | Accessible<number>;

  /**
   * The pitch angle, in degrees, beyond which the module cannot engage. Positive angles represent downward pitch. The
   * value will be clamped such that it is not in the opposite direction as `exceedDirection` relative to
   * `engagePitch`. A value equal to `NaN` will be treated as the equivalent of no limit. Defaults to `NaN`.
   */
  engagePitchLimit?: number | Accessible<number>;

  /**
   * The pitch angle, in degrees, within which the module disengages. Positive angles represent downward pitch. The
   * value will be clamped such that it is not in the same direction as `exceedDirection` relative to `engagePitch`.
   * A value equal to `NaN` will inhibit the module from engaging.
   */
  disengagePitch: number | Accessible<number>;

  /**
   * Gets the force to apply to the pitch control axis when the module is engaged, scaled such that a force of
   * magnitude one is the amount of force required to deflect the control axis from the neutral position to maximum
   * deflection (on either side). Positive force deflects the control axis to command an increase in pitch angle (i.e.
   * increase downward pitch).
   * @param data The current ESP data.
   * @param engageData Data describing the engagement state of the module.
   * @returns The force to apply to the pitch control axis when the module is engaged, scaled such that a force of
   * magnitude one is the amount of force required to deflect the control axis from the neutral position to maximum
   * deflection (on either side).
   */
  getForceToApply: (data: Readonly<EspData>, engageData: Readonly<EspPitchModuleEngageData>) => number;

  /** Whether the module can engage when AGL data is invalid. Defaults to `false`. */
  canEngageWhenAglInvalid?: boolean;
};

/**
 * A pitch engagement module for Garmin ESP systems. The module applies a force to the pitch control axis to combat
 * excessive pitch angles in one direction (either excessive pitch up or pitch down).
 */
export class EspPitchModule implements EspModule {
  private readonly directionSign: 1 | -1;
  private readonly engagePitch: Accessible<number>;
  private readonly engagePitchLimit: Accessible<number>;
  private readonly disengagePitch: Accessible<number>;

  private readonly getForceToApply: (data: Readonly<EspData>, engageData: Readonly<EspPitchModuleEngageData>) => number;

  private readonly canEngageWhenAglInvalid: boolean;

  private readonly engageData: EspPitchModuleEngageData = {
    isEngaged: false,
    engagePitch: NaN,
    engagePitchLimit: NaN,
    disengagePitch: NaN
  };

  /**
   * Creates a new instance of EspPitchModule.
   * @param id This module's ID. 
   * @param options Options with which to configure the module.
   */
  public constructor(public readonly id: string, options: Readonly<EspPitchModuleOptions>) {
    this.directionSign = options.exceedDirection === 'down' ? -1 : 1;
    this.engagePitch = AccessibleUtils.toAccessible(options.engagePitch, true);
    this.engagePitchLimit = AccessibleUtils.toAccessible(options.engagePitchLimit ?? NaN, true);
    this.disengagePitch = AccessibleUtils.toAccessible(options.disengagePitch, true);
    this.getForceToApply = options.getForceToApply;
    this.canEngageWhenAglInvalid = options.canEngageWhenAglInvalid ?? false;
  }

  /** @inheritDoc */
  public isEngaged(): boolean {
    return this.engageData.isEngaged;
  }

  /**
   * Gets data describing this module's engagement state.
   * @returns Data describing this module's engagement state.
   */
  public getEngageData(): Readonly<EspPitchModuleEngageData> {
    return this.engageData;
  }

  /** @inheritDoc */
  public onInit(): void {
    // noop
  }

  /** @inheritDoc */
  public onUpdate(operatingMode: EspOperatingMode, data: Readonly<EspData>, forceController: EspForceController): void {
    const engagePitch = this.engagePitch.get() * this.directionSign;
    const engagePitchLimit = Math.min(this.engagePitchLimit.get() * this.directionSign, engagePitch);
    const disengagePitch = Math.max(this.disengagePitch.get() * this.directionSign, engagePitch);

    this.engageData.engagePitch = engagePitch * this.directionSign;
    this.engageData.engagePitchLimit = engagePitchLimit * this.directionSign;
    this.engageData.disengagePitch = disengagePitch * this.directionSign;

    if (
      (operatingMode !== EspOperatingMode.Armed && operatingMode !== EspOperatingMode.Interrupted)
      || !data.isAttitudeValid
      || (!data.isAglValid && !this.canEngageWhenAglInvalid)
    ) {
      this.engageData.isEngaged = false;
      return;
    }

    if (isNaN(engagePitch) || isNaN(disengagePitch)) {
      this.engageData.isEngaged = false;
    } else {
      const correctedPitch = data.pitch * this.directionSign;
      this.engageData.isEngaged = correctedPitch <= (this.engageData.isEngaged ? disengagePitch : engagePitch)
        && (isNaN(engagePitchLimit) || correctedPitch >= engagePitchLimit);
    }

    if (this.engageData.isEngaged) {
      const forceToApply = this.getForceToApply(data, this.engageData);
      forceController.applyPitchForce(forceToApply);
    }
  }

  /** @inheritDoc */
  public onPause(): void {
    // noop
  }

  /** @inheritDoc */
  public onDestroy(): void {
    // noop
  }
}

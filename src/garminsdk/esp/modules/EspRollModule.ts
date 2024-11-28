import { Accessible, AccessibleUtils } from '@microsoft/msfs-sdk';

import { EspModule } from '../EspModule';
import { EspData, EspForceController, EspOperatingMode } from '../EspTypes';

/**
 * Data describing the engagement state of an {@link EspRollModule}.
 */
export type EspRollModuleEngageData = {
  /**
   * The module's engagement mode:
   * * `none`: The module is not engaged.
   * * `left`: The module is engaged due to excessive leftward roll.
   * * `right`: The module is engaged due to excessive rightward roll.
   */
  engageMode: 'none' | 'left' | 'right';

  /** The roll angle magnitude, in degrees, at or above which the module engages, or `NaN` if the module cannot engage. */
  engageRoll: number;

  /** The roll angle magnitude, in degrees, above which the module cannot engage, or `NaN` if there is no limit. */
  engageRollLimit: number;

  /** The roll angle magnitude, in degrees, below which the module disengages, or `NaN` if the module cannot engage. */
  disengageRoll: number;
};

/**
 * Configuration options for {@link EspRollModule}.
 */
export type EspRollModuleOptions = {
  /**
   * The roll angle magnitude, in degrees, at or above which the module engages. The value will be clamped to be
   * greater than or equal to zero.
   */
  engageRoll: number | Accessible<number>;

  /**
   * The roll angle magnitude, in degrees, above which the module cannot engage. The value will be clamped to be
   * greater than or equal to `engageRoll`. A value equal to `NaN` will be treated as the equivalent of no limit.
   * Defaults to `NaN`.
   */
  engageRollLimit?: number | Accessible<number>;

  /**
   * The roll angle magnitude, in degrees, below which the module disengages. The value will be clamped to be less than
   * or equal to `engageRoll`.
   */
  disengageRoll: number | Accessible<number>;

  /**
   * Gets the force to apply to the roll control axis when the module is engaged, scaled such that a force of magnitude
   * one is the amount of force required to deflect the control axis from the neutral position to maximum deflection
   * (on either side). Positive force deflects the control axis to command an increase in roll angle (i.e. increase
   * leftward roll).
   * @param data The current ESP data.
   * @param engageData Data describing the engagement state of the module.
   * @returns The force to apply to the roll control axis when the module is engaged, scaled such that a force of
   * magnitude one is the amount of force required to deflect the control axis from the neutral position to maximum
   * deflection (on either side).
   */
  getForceToApply: (data: Readonly<EspData>, engageData: Readonly<EspRollModuleEngageData>) => number;

  /** Whether the module can engage when AGL data is invalid. Defaults to `false`. */
  canEngageWhenAglInvalid?: boolean;
};

/**
 * A roll engagement module for Garmin ESP systems. The module applies a force to the roll control axis to combat
 * excessive roll angles.
 */
export class EspRollModule implements EspModule {
  private readonly engageRoll: Accessible<number>;
  private readonly engageRollLimit: Accessible<number>;
  private readonly disengageRoll: Accessible<number>;

  private readonly getForceToApply: (data: Readonly<EspData>, engageData: Readonly<EspRollModuleEngageData>) => number;

  private readonly canEngageWhenAglInvalid: boolean;

  private readonly engageData: EspRollModuleEngageData = {
    engageMode: 'none',
    engageRoll: NaN,
    engageRollLimit: NaN,
    disengageRoll: NaN
  };

  /**
   * Creates a new instance of EspRollModule.
   * @param id This module's ID. 
   * @param options Options with which to configure the module.
   */
  public constructor(public readonly id: string, options: Readonly<EspRollModuleOptions>) {
    this.engageRoll = AccessibleUtils.toAccessible(options.engageRoll, true);
    this.engageRollLimit = AccessibleUtils.toAccessible(options.engageRollLimit ?? NaN, true);
    this.disengageRoll = AccessibleUtils.toAccessible(options.disengageRoll, true);
    this.getForceToApply = options.getForceToApply;
    this.canEngageWhenAglInvalid = options.canEngageWhenAglInvalid ?? false;
  }

  /** @inheritDoc */
  public isEngaged(): boolean {
    return this.engageData.engageMode !== 'none';
  }

  /**
   * Gets data describing this module's engagement state.
   * @returns Data describing this module's engagement state.
   */
  public getEngageData(): Readonly<EspRollModuleEngageData> {
    return this.engageData;
  }

  /** @inheritDoc */
  public onInit(): void {
    // noop
  }

  /** @inheritDoc */
  public onUpdate(operatingMode: EspOperatingMode, data: Readonly<EspData>, forceController: EspForceController): void {
    this.engageData.engageRoll = Math.max(0, this.engageRoll.get());
    this.engageData.engageRollLimit = Math.max(this.engageRollLimit.get(), this.engageData.engageRoll);
    this.engageData.disengageRoll = Math.min(this.disengageRoll.get(), this.engageData.engageRoll);

    if (
      (operatingMode !== EspOperatingMode.Armed && operatingMode !== EspOperatingMode.Interrupted)
      || !data.isAttitudeValid
      || (!data.isAglValid && !this.canEngageWhenAglInvalid)
    ) {
      this.engageData.engageMode = 'none';
      return;
    }

    if (isNaN(this.engageData.engageRoll) || isNaN(this.engageData.disengageRoll)) {
      this.engageData.engageMode = 'none';
    } else {
      const rollAbs = Math.abs(data.roll);
      if (isNaN(this.engageData.engageRollLimit) || rollAbs <= this.engageData.engageRollLimit) {
        const mode = data.roll >= 0 ? 'left' : 'right';
        const isEngaged = rollAbs >= (this.engageData.engageMode === mode ? this.engageData.disengageRoll : this.engageData.engageRoll);
        this.engageData.engageMode = isEngaged ? mode : 'none';
      } else {
        this.engageData.engageMode = 'none';
      }
    }

    if (this.isEngaged()) {
      const forceToApply = this.getForceToApply(data, this.engageData);
      forceController.applyRollForce(forceToApply);
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

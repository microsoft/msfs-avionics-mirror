import { Accessible, AccessibleUtils } from '@microsoft/msfs-sdk';

import { EspModule } from '../EspModule';
import { EspData, EspForceController, EspOperatingMode } from '../EspTypes';

/**
 * Data describing the engagement state of an {@link EspAoaModule}.
 */
export type EspAoaModuleEngageData = {
  /** Whether the module is engaged. */
  isEngaged: boolean;

  /** The angle of attack, in degrees, at or above which the module engages, or `NaN` if the module cannot engage. */
  engageAoa: number;

  /** The angle of attack, in degrees, below which the module disengages, or `NaN` if the module cannot engage. */
  disengageAoa: number;
};

/**
 * Configuration options for {@link EspAoaModule}.
 */
export type EspAoaModuleOptions = {
  /**
   * The angle of attack, in degrees, at or above which the module engages. A value equal to `NaN` will inhibit the
   * module from engaging.
   */
  engageAoa: number | Accessible<number>;

  /**
   * The angle of attack, in degrees, below which the module disengages. The value will be clamped such that it is not
   * greater than `engageAoa`. A value equal to `NaN` will inhibit the module from engaging.
   */
  disengageAoa: number | Accessible<number>;

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
  getForceToApply: (data: Readonly<EspData>, engageData: Readonly<EspAoaModuleEngageData>) => number;

  /** Whether the module can engage when AGL data is invalid. Defaults to `false`. */
  canEngageWhenAglInvalid?: boolean;
};

/**
 * An angle of attack protection module for Garmin ESP systems. The module applies a force to the pitch control axis to
 * combat excessively high angle of attack values.
 */
export class EspAoaModule implements EspModule {
  private readonly engageAoa: Accessible<number>;
  private readonly disengageAoa: Accessible<number>;

  private readonly getForceToApply: (data: Readonly<EspData>, engageData: Readonly<EspAoaModuleEngageData>) => number;

  private readonly canEngageWhenAglInvalid: boolean;

  private readonly engageData: EspAoaModuleEngageData = {
    isEngaged: false,
    engageAoa: NaN,
    disengageAoa: NaN
  };

  /**
   * Creates a new instance of EspAoaModule.
   * @param id This module's ID.
   * @param options Options with which to configure the module.
   */
  public constructor(public readonly id: string, options: Readonly<EspAoaModuleOptions>) {
    this.engageAoa = AccessibleUtils.toAccessible(options.engageAoa, true);
    this.disengageAoa = AccessibleUtils.toAccessible(options.disengageAoa, true);
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
  public getEngageData(): Readonly<EspAoaModuleEngageData> {
    return this.engageData;
  }

  /** @inheritDoc */
  public onInit(): void {
    // noop
  }

  /** @inheritDoc */
  public onUpdate(operatingMode: EspOperatingMode, data: Readonly<EspData>, forceController: EspForceController): void {
    this.engageData.engageAoa = this.engageAoa.get();
    this.engageData.disengageAoa = Math.min(this.disengageAoa.get(), this.engageData.engageAoa);

    if (
      (operatingMode !== EspOperatingMode.Armed && operatingMode !== EspOperatingMode.Interrupted)
      || !data.isAttitudeValid
      || !data.isAoaValid
      || (!data.isAglValid && !this.canEngageWhenAglInvalid)
    ) {
      this.engageData.isEngaged = false;
      return;
    }

    if (isNaN(this.engageData.engageAoa) || isNaN(this.engageData.disengageAoa)) {
      this.engageData.isEngaged = false;
    } else {
      this.engageData.isEngaged = data.aoa >= (this.engageData.isEngaged ? this.engageData.disengageAoa : this.engageData.engageAoa);
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

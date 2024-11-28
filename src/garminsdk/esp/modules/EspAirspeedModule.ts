import { Accessible, AccessibleUtils } from '@microsoft/msfs-sdk';

import { EspModule } from '../EspModule';
import { EspData, EspForceController, EspOperatingMode } from '../EspTypes';

/**
 * Data describing the engagement state of an {@link EspAirspeedModule}.
 */
export type EspAirspeedModuleEngageData = {
  /** Whether the module is engaged due to indicated airspeed exceedance. */
  isIasEngaged: boolean;

  /**
   * The indicated airspeed, in knots, at or beyond which the module engages, or `NaN` if the module cannot engage due
   * to indicated airspeed exceedance.
   */
  engageIas: number;

  /**
   * The indicated airspeed, in knots, within which the module disengages, or `NaN` if the module cannot engage due to
   * indicated airspeed exceedance.
   */
  disengageIas: number;

  /** Whether the module is engaged due to mach exceedance. */
  isMachEngaged: boolean;

  /** The mach number at or beyond which the module engages, or `NaN` if the module cannot engage due to mach exceedance. */
  engageMach: number;

  /** The mach number within which the module disengages, or `NaN` if the module cannot engage due to mach exceedance. */
  disengageMach: number;

  /** Whether the module is engaged due to true airspeed exceedance. */
  isTasEngaged: boolean;

  /**
   * The true airspeed, in knots, at or beyond which the module engages, or `NaN` if the module cannot engage due to
   * true airspeed exceedance.
   */
  engageTas: number;

  /**
   * The true airspeed, in knots, within which the module disengages, or `NaN` if the module cannot engage due to true
   * airspeed exceedance.
   */
  disengageTas: number;
};

/**
 * Configuration options for {@link EspAirspeedModule}.
 */
export type EspAirspeedModuleOptions = {
  /**
   * The direction of airspeed exceedance used by the module. With a direction of `high`, the module will engage in
   * high airspeed conditions. With a direction of `low`, the module will engage in low airspeed conditions.
   */
  exceedDirection: 'high' | 'low';

  /**
   * The indicated airspeed, in knots, at or beyond which the module engages. A value equal to `NaN` will inhibit the
   * module from engaging due to indicated airspeed exceedance. If not defined, then the module will not engage due to
   * indicated airspeed exceedance.
   */
  engageIas?: number | Accessible<number>;

  /**
   * The indicated airspeed, in knots, within which the module disengages. The value will be clamped such that it is
   * not in the same direction as `exceedDirection` relative to `engageIas`. A value equal to `NaN` will inhibit the
   * module from engaging due to indicated airspeed exceedance. If not defined, then the module will not engage due to
   * indicated airspeed exceedance.
   */
  disengageIas?: number | Accessible<number>;

  /**
   * The mach number at or beyond which the module engages. A value equal to `NaN` will inhibit the module from
   * engaging due to mach exceedance. If not defined, then the module will not engage due to mach exceedance.
   */
  engageMach?: number | Accessible<number>;

  /**
   * The mach number within which the module disengages. The value will be clamped such that it is not in the same
   * direction as `exceedDirection` relative to `engageMach`. A value equal to `NaN` will inhibit the module from
   * engaging due to mach exceedance. If not defined, then the module will not engage due to mach exceedance.
   */
  disengageMach?: number | Accessible<number>;

  /**
   * The true airspeed, in knots, at or beyond which the module engages. A value equal to `NaN` will inhibit the module
   * from engaging due to true airspeed exceedance. If not defined, then the module will not engage due to true
   * airspeed exceedance.
   */
  engageTas?: number | Accessible<number>;

  /**
   * The true airspeed, in knots, within which the module disengages. The value will be clamped such that it is not in
   * the same direction as `exceedDirection` relative to `engageTas`. A value equal to `NaN` will inhibit the module
   * from engaging due to true airspeed exceedance. If not defined, then the module will not engage due to true
   * airspeed exceedance.
   */
  disengageTas?: number | Accessible<number>;

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
  getForceToApply: (data: Readonly<EspData>, engageData: Readonly<EspAirspeedModuleEngageData>) => number;

  /** Whether the module can engage when AGL data is invalid. Defaults to `false`. */
  canEngageWhenAglInvalid?: boolean;
};

/**
 * An airspeed engagement module for Garmin ESP systems. The module applies a force to the pitch control axis to combat
 * excessive airspeed in one direction (either high airspeed or low airspeed). The module supports engagement due to
 * exceedances in indicated airspeed, mach number, and true airspeed. The module engages when there is an exceedance in
 * any of the supported airspeed types and disengages when there are no exceedances in any of the airspeed types.
 */
export class EspAirspeedModule implements EspModule {
  private readonly directionSign: 1 | -1;

  private readonly engageIas?: Accessible<number>;
  private readonly disengageIas?: Accessible<number>;

  private readonly engageMach?: Accessible<number>;
  private readonly disengageMach?: Accessible<number>;

  private readonly engageTas?: Accessible<number>;
  private readonly disengageTas?: Accessible<number>;

  private readonly getForceToApply: (data: Readonly<EspData>, engageData: Readonly<EspAirspeedModuleEngageData>) => number;

  private readonly canEngageWhenAglInvalid: boolean;

  private readonly engageData: EspAirspeedModuleEngageData = {
    isIasEngaged: false,
    engageIas: NaN,
    disengageIas: NaN,

    isMachEngaged: false,
    engageMach: NaN,
    disengageMach: NaN,

    isTasEngaged: false,
    engageTas: NaN,
    disengageTas: NaN
  };

  /**
   * Creates a new instance of EspAirspeedModule.
   * @param id This module's ID. 
   * @param options Options with which to configure the module.
   */
  public constructor(public readonly id: string, options: Readonly<EspAirspeedModuleOptions>) {
    this.directionSign = options.exceedDirection === 'low' ? -1 : 1;

    if (options.engageIas !== undefined && options.disengageIas !== undefined) {
      this.engageIas = AccessibleUtils.toAccessible(options.engageIas, true);
      this.disengageIas = AccessibleUtils.toAccessible(options.disengageIas, true);
    }

    if (options.engageMach !== undefined && options.disengageMach !== undefined) {
      this.engageMach = AccessibleUtils.toAccessible(options.engageMach, true);
      this.disengageMach = AccessibleUtils.toAccessible(options.disengageMach, true);
    }

    if (options.engageTas !== undefined && options.disengageTas !== undefined) {
      this.engageTas = AccessibleUtils.toAccessible(options.engageTas, true);
      this.disengageTas = AccessibleUtils.toAccessible(options.disengageTas, true);
    }

    this.getForceToApply = options.getForceToApply;

    this.canEngageWhenAglInvalid = options.canEngageWhenAglInvalid ?? false;
  }

  /** @inheritDoc */
  public isEngaged(): boolean {
    return this.engageData.isIasEngaged || this.engageData.isMachEngaged || this.engageData.isTasEngaged;
  }

  /**
   * Gets data describing this module's engagement state.
   * @returns Data describing this module's engagement state.
   */
  public getEngageData(): Readonly<EspAirspeedModuleEngageData> {
    return this.engageData;
  }

  /** @inheritDoc */
  public onInit(): void {
    // noop
  }

  /** @inheritDoc */
  public onUpdate(operatingMode: EspOperatingMode, data: Readonly<EspData>, forceController: EspForceController): void {
    const canEngage = (operatingMode === EspOperatingMode.Armed || operatingMode === EspOperatingMode.Interrupted)
      && data.isAttitudeValid
      && (data.isAglValid || this.canEngageWhenAglInvalid);

    if (this.engageIas) {
      const engageIas = this.engageIas.get() * this.directionSign;
      const disengageIas = Math.min(this.disengageIas!.get() * this.directionSign, engageIas);

      this.engageData.engageIas = engageIas * this.directionSign;
      this.engageData.disengageIas = disengageIas * this.directionSign;

      if (!canEngage || !data.isAirspeedValid || isNaN(engageIas) || isNaN(disengageIas)) {
        this.engageData.isIasEngaged = false;
      } else {
        const correctedIas = data.ias * this.directionSign;
        this.engageData.isIasEngaged = correctedIas >= (this.engageData.isIasEngaged ? disengageIas : engageIas);
      }
    }

    if (this.engageMach) {
      const engageMach = this.engageMach.get() * this.directionSign;
      const disengageMach = Math.min(this.disengageMach!.get() * this.directionSign, engageMach);

      this.engageData.engageMach = engageMach * this.directionSign;
      this.engageData.disengageMach = disengageMach * this.directionSign;

      if (!canEngage || !data.isAirspeedValid || isNaN(engageMach) || isNaN(disengageMach)) {
        this.engageData.isMachEngaged = false;
      } else {
        const correctedMach = data.mach * this.directionSign;
        this.engageData.isMachEngaged = correctedMach >= (this.engageData.isMachEngaged ? disengageMach : engageMach);
      }
    }

    if (this.engageTas) {
      const engageTas = this.engageTas.get() * this.directionSign;
      const disengageTas = Math.min(this.disengageTas!.get() * this.directionSign, engageTas);

      this.engageData.engageTas = engageTas * this.directionSign;
      this.engageData.disengageTas = disengageTas * this.directionSign;

      if (!canEngage || !data.isTasValid || isNaN(engageTas) || isNaN(disengageTas)) {
        this.engageData.isTasEngaged = false;
      } else {
        const correctedTas = data.tas * this.directionSign;
        this.engageData.isTasEngaged = correctedTas >= (this.engageData.isTasEngaged ? disengageTas : engageTas);
      }
    }

    if (this.isEngaged()) {
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

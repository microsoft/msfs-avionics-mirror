import {
  AeroMath, AvionicsSystemState, AvionicsSystemStateEvent, BasePublisher, ConsumerSubject, ConsumerValue, ControlSurfacesEvents, EventBus, ExpSmoother,
  GameStateProvider, MathUtils, PublishPacer, Subscribable, SubscribableUtils, UnitType, Wait
} from '@microsoft/msfs-sdk';

import { ConfigurationLimitType, SpeedLimitUnit } from '../AvionicsConfig/AirframeConfig';
import { AvionicsConfig } from '../AvionicsConfig/AvionicsConfig';
import { AdahrsSystemEvents } from '../Systems/AdahrsSystem';
import { AoaSystemEvents } from '../Systems/AoaSystem';
import { AirGroundDataProviderEvents } from './AirGroundDataProvider';

export enum OperatingSpeedLimit {
  Vmo = 'VMO',
  Mmo = 'MMO',
}

/**
 * Events related to airplane speed limits.
 */
export interface SpeedLimitEvents {
  /** Maximum speed, taking into account Vmo/Mmo and placards, in knots indicated airspeed, or Infinity if none. */
  speedlimit_max_ias: number;

  /** Maximum speed, taking into account Vmo/Mmo, in knots indicated airspeed, or Infinity if none. */
  speedlimit_max_operating_ias: number;

  /** The airframe operating speed limit being applied, either the lowest of VMO or MMO. */
  speedlimit_max_operating_limit: OperatingSpeedLimit;

  /** Maximum speed, taking into account placards, in knots indicated airspeed, or Infinity if none. */
  speedlimit_max_placard_ias: number;

  /** Minimum speed, in knots indicated airspeed. */
  speedlimit_min_ias: number | null;

  /** Minimum maneuvering speed, in knots indicated airspeed. */
  speedlimit_min_maneuver_ias: number | null;

  /** Stall speed, in knots indicated airspeed. */
  speedlimit_stall_ias: number | null;

  /**
   * The caution speed, in knots IAS.
   * This is equal to the stall IAS * 1.1 (* 1.1 again if the cautionary speed awareness bar is available)
   */
  speedlimit_caution_ias: number | null

  /** The absolute angle of attack, in degrees, associated with the minimum speed. */
  speedlimit_min_speed_aoa: number;
}

/**
 * A publisher of airplane speed limits.
 *
 * The publisher requires a functioning `AdcSystem` and `AoaSystem` and that the topics defined by
 * `ControlSurfacesEvents` and `FlapComputerEvents` are published to the event bus.
 */
export class SpeedLimitPublisher extends BasePublisher<SpeedLimitEvents> {
  private static readonly MACH_KIAS_SMOOTHING_TAU = 1000 / Math.LN2;
  private static readonly AOA_COEF_SMOOTHING_TAU = 2000 / Math.LN2;
  private static readonly LOAD_FACTOR_SMOOTHING_TAU = 2000 / Math.LN2;

  private readonly isOnGround = ConsumerValue.create(null, false).pause();
  private readonly zeroLiftAoa = ConsumerValue.create(null, 0).pause();
  private readonly stallAoa = ConsumerValue.create(null, 0).pause();
  private readonly normAoa = ConsumerValue.create(null, 0).pause();
  private readonly ias = ConsumerValue.create(null, 0).pause();
  private readonly pressureAltitude = ConsumerValue.create(null, 0).pause();
  private readonly ambientPressureInHg = ConsumerSubject.create(null, 29.92).pause();
  private readonly ambientPressureHpa = this.ambientPressureInHg.map((v) => UnitType.HPA.convertFrom(v, UnitType.IN_HG));

  private readonly aoaCoefSmoother = new ExpSmoother(SpeedLimitPublisher.AOA_COEF_SMOOTHING_TAU);

  private readonly loadFactorSource = ConsumerValue.create(null, 1).pause();
  private readonly loadFactorSmoother = new ExpSmoother(SpeedLimitPublisher.LOAD_FACTOR_SMOOTHING_TAU);

  private readonly flapSpeedLimits = new Map<number, number>();
  private gearExtendedSpeedLimit?: number;
  private gearExtensionSpeedLimit?: number;
  private gearRetractionSpeedLimit?: number;

  private readonly gearPosition = ConsumerValue.create(null, 0).pause();
  private readonly gearHandlePosition = ConsumerValue.create(null, 0).pause();
  private readonly flapHandleIndex = ConsumerSubject.create(null, 0).pause();

  private readonly aoaIndex: Subscribable<number>;
  private readonly aoaSystemState = ConsumerValue.create<AvionicsSystemStateEvent | undefined>(null, undefined).pause();

  private readonly adahrsIndex: Subscribable<number>;
  private readonly adahrsSystemState = ConsumerValue.create<AvionicsSystemStateEvent | undefined>(null, undefined).pause();

  private readonly pauseable = [
    this.isOnGround,
    this.zeroLiftAoa,
    this.stallAoa,
    this.normAoa,
    this.ias,
    this.pressureAltitude,
    this.ambientPressureInHg,
    this.loadFactorSource,
    this.flapHandleIndex,
    this.gearPosition,
    this.aoaSystemState,
    this.adahrsSystemState
  ];

  private isAltBelow20k = false;

  private lastUpdateTime: number | undefined = undefined;

  /**
   * Creates a new instance of SpeedLimitPublisher.
   * @param bus The event bus to which to publish.
   * @param aoaIndex The index of the AoA system that is the source of this publisher's data.
   * @param adahrsIndex The index of the ADAHRS system that is the source of this publisher's data.
   * @param config The avionics config.
   * @param stickShakerNormAoa The normalized angle of attack at which the stick shaker activates. Defaults to 0.95.
   * @param pacer An optional pacer to use to control the rate of publishing.
   */
  public constructor(
    bus: EventBus,
    aoaIndex: number | Subscribable<number>,
    adahrsIndex: number | Subscribable<number>,
    private readonly config: AvionicsConfig,
    private readonly stickShakerNormAoa = 0.95,
    pacer?: PublishPacer<SpeedLimitEvents>
  ) {
    super(bus, pacer);

    Wait.awaitSubscribable(GameStateProvider.get(), s => s === GameState.ingame, true).then(() => {
      for (const limitDefinition of this.config.airframe.configurationLimits) {
        switch (limitDefinition.type) {
          case ConfigurationLimitType.Flaps:
            this.flapSpeedLimits.set(limitDefinition.flapHandleIndex ?? 0, limitDefinition.airspeed);
            break;
          case ConfigurationLimitType.GearExtended:
            this.gearExtendedSpeedLimit = limitDefinition.airspeed;
            break;
          case ConfigurationLimitType.GearExtention:
            this.gearExtensionSpeedLimit = limitDefinition.airspeed;
            break;
          case ConfigurationLimitType.GearRetraction:
            this.gearRetractionSpeedLimit = limitDefinition.airspeed;
            break;
          case ConfigurationLimitType.GearOperating:
            this.gearExtensionSpeedLimit = limitDefinition.airspeed;
            this.gearRetractionSpeedLimit = limitDefinition.airspeed;
            break;
        }
      }
    });

    this.aoaIndex = SubscribableUtils.toSubscribable(aoaIndex, true);
    this.adahrsIndex = SubscribableUtils.toSubscribable(adahrsIndex, true);

    const sub = bus.getSubscriber<AirGroundDataProviderEvents & AoaSystemEvents & AdahrsSystemEvents & ControlSurfacesEvents>();

    this.isOnGround.setConsumer(sub.on('air_ground_is_on_ground'));

    this.aoaIndex.sub(index => {
      this.zeroLiftAoa.setConsumer(sub.on(`aoa_zero_lift_aoa_${index}`));
      this.stallAoa.setConsumer(sub.on(`aoa_stall_aoa_${index}`));
      this.normAoa.setConsumer(sub.on(`aoa_norm_aoa_${index}`));
      this.loadFactorSource.setConsumer(sub.on(`aoa_load_factor_${index}`));
      this.aoaSystemState.setConsumer(sub.on(`aoa_state_${index}`));
    }, true);

    this.adahrsIndex.sub(index => {
      this.ias.setConsumer(sub.on(`adahrs_ias_${index}`));
      this.pressureAltitude.setConsumer(sub.on(`adahrs_pressure_alt_${index}`));
      this.ambientPressureInHg.setConsumer(sub.on(`adahrs_ambient_pressure_inhg_${index}`));
      this.adahrsSystemState.setConsumer(sub.on(`adahrs_state_${index}`));
    }, true);

    this.gearPosition.setConsumer(sub.on('gear_position_2'));
    this.gearHandlePosition.setConsumer(sub.on('gear_handle_position'));
    this.flapHandleIndex.setConsumer(sub.on('flaps_handle_index'));
  }

  /** @inheritdoc */
  public startPublish(): void {
    super.startPublish();

    for (const pauseable of this.pauseable) {
      pauseable.resume();
    }
  }

  /** @inheritdoc */
  public stopPublish(): void {
    super.stopPublish();

    for (const pauseable of this.pauseable) {
      pauseable.pause();
    }

    this.lastUpdateTime = undefined;

    this.aoaCoefSmoother.reset();
    this.loadFactorSmoother.reset();

    this.isAltBelow20k = false;
  }

  /** @inheritdoc */
  public onUpdate(): void {
    if (!this.isPublishing()) {
      return;
    }

    const time = Date.now();

    const dt = this.lastUpdateTime === undefined ? 0 : Math.max(0, time - this.lastUpdateTime);
    this.lastUpdateTime = time;

    const pressureAlt = this.pressureAltitude.get();

    // ------- Maximum speed -------
    // Maximum speed is defined as the lowest of Vmo, Mmo, landing gear placard speed (if extended), and placard speed
    // for the current flaps setting.

    const vmo = this.config.airframe.vmo && this.config.airframe.vmoUnit !== undefined ? this.getVmoCas(this.config.airframe.vmo, this.config.airframe.vmoUnit) : Infinity;
    const mmo = this.config.airframe.mmo;
    const flapLimit = this.flapSpeedLimits.get(this.flapHandleIndex.get()) ?? Infinity;

    const gearPos = this.gearPosition.get();
    const gearHandlePos = this.gearHandlePosition.get();
    let gearLimit = Infinity;
    if (gearPos >= 0.98 && gearHandlePos >= 0.98) {
      gearLimit = this.gearExtendedSpeedLimit ?? Infinity;
    } else if (gearPos >= 0.02 && gearPos <= 0.98) {
      if (gearHandlePos <= 0.98) {
        gearLimit = this.gearRetractionSpeedLimit ?? Infinity;
      } else {
        gearLimit = this.gearExtensionSpeedLimit ?? Infinity;
      }
    }

    const mmoCas = mmo ? UnitType.KNOT.convertFrom(AeroMath.machToCas(mmo, this.ambientPressureHpa.get()), UnitType.MPS) : Infinity;

    let maxOperatingIas;
    let operatingLimiter;
    if (vmo > mmoCas) {
      // Operating speed is limited by MMO
      maxOperatingIas = mmoCas;
      operatingLimiter = OperatingSpeedLimit.Mmo;
    } else {
      // Operating speed is limited by VMO
      maxOperatingIas = vmo;
      operatingLimiter = OperatingSpeedLimit.Vmo;
    }

    const gearPosition = this.gearPosition.get();
    const maxPlacardIas = Math.min(flapLimit, gearPosition > 0 ? gearLimit : Infinity);

    const maxIas = Math.min(maxOperatingIas, maxPlacardIas);
    this.publish('speedlimit_max_ias', maxIas);
    this.publish('speedlimit_max_operating_limit', operatingLimiter);
    this.publish('speedlimit_max_operating_ias', maxOperatingIas);
    this.publish('speedlimit_max_placard_ias', maxPlacardIas);

    // ------- Minimum speed AoA -------
    // Minimum speed is defined as the speed at which stick shaker activation occurs.

    const minSpeedAoa = MathUtils.lerp(this.stickShakerNormAoa, 0, 1, this.zeroLiftAoa.get(), this.stallAoa.get());
    this.publish('speedlimit_min_speed_aoa', minSpeedAoa);

    if (
      this.isOnGround.get()
      || SpeedLimitPublisher.isSystemFailed(this.aoaSystemState.get())
      || SpeedLimitPublisher.isSystemFailed(this.adahrsSystemState.get())
    ) {
      this.aoaCoefSmoother.reset();
      this.loadFactorSmoother.reset();

      this.publish('speedlimit_min_ias', null);
      this.publish('speedlimit_min_maneuver_ias', null);
      this.publish('speedlimit_stall_ias', null);
      return;
    }

    const normAoa = this.normAoa.get();
    const ias = this.ias.get();
    const iasSquared = ias * ias;
    const coef = normAoa * iasSquared;

    const aoaCoef = this.aoaCoefSmoother.next(coef, dt);
    const loadFactor = this.loadFactorSmoother.next(this.loadFactorSource.get(), dt);

    // ------- Minimum speed -------
    // Minimum speed is defined as the speed at which stick shaker activation occurs.

    const minIas = SpeedLimitPublisher.estimateIasFromNormAoa(aoaCoef, this.stickShakerNormAoa, 1);
    this.publish('speedlimit_min_ias', isFinite(minIas) ? minIas : null);

    // ------- Minimum maneuvering speed -------
    // Minimum maneuvering speed is defined as the minimum speed at which the airplane can be flown at 1.3g load factor
    // before triggering stick shaker (below 20k feet) or before encountering low speed buffet (above 20k feet).

    let minManeuverIas: number;
    if (pressureAlt < (this.isAltBelow20k ? 20100 : 19900)) {
      minManeuverIas = SpeedLimitPublisher.estimateIasFromNormAoa(aoaCoef, this.stickShakerNormAoa, 1.3 / loadFactor);
      this.isAltBelow20k = true;
    } else {
      minManeuverIas = SpeedLimitPublisher.estimateIasFromNormAoa(aoaCoef, 1, 1.3 / loadFactor);
      this.isAltBelow20k = false;
    }

    this.publish('speedlimit_min_maneuver_ias', isFinite(minManeuverIas) ? minManeuverIas : null);

    // ------- Stall speed -------

    const stallIas = SpeedLimitPublisher.estimateIasFromNormAoa(aoaCoef, 1, 1);
    this.publish('speedlimit_stall_ias', isFinite(stallIas) ? stallIas : null);

    // ------- Caution speed -------

    const cautionIas = stallIas * 1.23;
    this.publish('speedlimit_caution_ias', isFinite(cautionIas) ? cautionIas : null);
  }

  /**
   * Gets the Vmo in Knots CAS.
   * @param vmo Vmo in EAS or CAS.
   * @param unit The unit of Vmo.
   * @returns Vmo in KCAS.
   */
  private getVmoCas(vmo: number, unit: SpeedLimitUnit): number {
    switch (unit) {
      case SpeedLimitUnit.Keas:
        return UnitType.KNOT.convertFrom(AeroMath.easToCas(UnitType.MPS.convertFrom(vmo, UnitType.KNOT), this.ambientPressureHpa.get()), UnitType.MPS);
      case SpeedLimitUnit.Kias:
        return vmo;
    }
  }

  /**
   * Estimates an indicated airspeed, in knots, required to maintain a given normalized angle of attack at a specific
   * load factor.
   * @param coef The correlation coefficient between normalized angle of attack and the square of indicated airspeed,
   * such that `k = alpha * v^2`, where `k` is the coefficient, `alpha` is normalized AoA, and `v` is indicated
   * airspeed in knots.
   * @param normAoa The normalized angle of attack at which to estimate the airspeed.
   * @param loadFactorRatio The ratio of the load factor at which to estimate the airspeed to the load factor used to
   * obtain `coef`.
   * @returns The estimatd indicated airspeed, in knots, required to maintain the specified normalized angle of attack
   * at the specified load factor.
   */
  private static estimateIasFromNormAoa(coef: number, normAoa: number, loadFactorRatio: number): number {
    return Math.sqrt(coef * loadFactorRatio / normAoa);
  }

  /**
   * Checks whether an avionics system state is a failed state.
   * @param state The avionics system state to check.
   * @returns Whether the specified avionics system state is a failed state.
   */
  private static isSystemFailed(state: AvionicsSystemStateEvent | undefined): boolean {
    return state === undefined || (state.current !== undefined && state.current !== AvionicsSystemState.On);
  }
}

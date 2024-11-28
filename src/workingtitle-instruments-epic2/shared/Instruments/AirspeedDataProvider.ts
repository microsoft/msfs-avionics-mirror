import {
  AeroMath, ClockEvents, ConsumerSubject, ConsumerValue, EventBus, ExpSmoother, Instrument, Lookahead, MappedSubject, MathUtils, ReadonlyFloat64Array, Subject,
  Subscribable, SubscribableMapFunctions, SubscribableUtils, Subscription, UnitType, Vec2Math
} from '@microsoft/msfs-sdk';

import { FmsSpeedEvents } from '../Fms';
import { DisplayUnitIndices } from '../InstrumentIndices';
import { AdahrsSystemChannel, AdahrsSystemEvents } from '../Systems/AdahrsSystem';
import { OperatingSpeedLimit, SpeedLimitEvents } from './SpeedLimit';

/** An enum which describes the autopilot speed target limit being imposed */
export enum Epic2ApTargetLimitingMode {
  Mmo = 'MMO',
  Vmo = 'VMO',
}

/** An airspeed data provider, providing data from the ADAHRS selected for an instrument. */
export interface AirspeedDataProvider {
  /** The current calibrated airspeed, with a value of 0 below 30 knots, or null when invalid. */
  cas: Subscribable<number | null>,

  /** The current true airspeed in knots, with a value of 0 below 30 knots, or null when invalid. */
  tas: Subscribable<number | null>,

  /** The current filtered true airspeed in knots, with a value of 0 below 30 knots, or null when invalid. */
  filteredTas: Subscribable<number | null>,

  /** The current static air temperature in celcius, or null when invalid.*/
  sat: Subscribable<number | null>,

  /** The calibrated airspeed predicted in 6 seconds at the current rate of acceleration, in knots. */
  casTrend: Subscribable<number | null>,

  /**
   * The difference between the current calibrated airspeed and that predicted in 6 seconds
   * at the current rate of acceleration, in knots.
   */
  casTrendDiff: Subscribable<number | null>,

  /** The current mach number, or null when invalid. */
  mach: Subscribable<number | null>,

  /** Maximum speed in knots for the current config, or infinity when none. */
  maxSpeed: Subscribable<number>,

  /** The caution speed in knots, or null when invalid */
  cautionSpeed: Subscribable<number | null>

  /** Maximum operating speed in knots (lowest of Vmo or Mmo), or infinity when none. */
  maxOperatingSpeed: Subscribable<number>,

  /** The maximum operating speed limiter, either Vmo or Mmo */
  maxOperatingSpeedLimiter: Subscribable<OperatingSpeedLimit>;

  /** Maximum placard speed in knots for the current config, or infinity when none. */
  maxPlacardSpeed: Subscribable<number>,

  /** Is the current speed above maximum of the current config. */
  isSpeedAboveMax: Subscribable<boolean>,

  /** Is the current speed trend above maximum of the current config. */
  isTrendAboveMax: Subscribable<boolean>,

  /** Is the current speed above maximum (lowest of Vmo or Mmo). */
  isSpeedAboveMaxOperating: Subscribable<boolean>,

  /** Is the current speed trend above maximum (lowest of Vmo or Mmo). */
  isTrendAboveMaxOperating: Subscribable<boolean>,

  /** Is the current speed above the current placard speed, if any. */
  isSpeedAbovePlacard: Subscribable<boolean>,

  /** Is the current speed trend above the current placard speed, if any. */
  isTrendAbovePlacard: Subscribable<boolean>,

  /**
   * The difference between the autopilot selected speed, and the current speed, in knots.
   * -ve means the a/c is below the selected speed.
   */
  speedError: Subscribable<number | null>;

  /** Is the AFCS speed bug currently visible? */
  isAfcsBugVisible: Subscribable<boolean>;
}

/** An altitude air data provider implementation. */
export class DefaultAirspeedDataProvider implements AirspeedDataProvider, Instrument {
  private static readonly FILTER_FREQUENCY = 10;

  private isPaused = true;

  private lastUpdateTime: number | undefined = undefined;

  private readonly adahrsIndex: Subscribable<number>;

  private readonly ownSide: 'left' | 'right';
  private readonly oppositeSide: 'left' | 'right';

  private readonly adahrsValid = ConsumerSubject.create(null, false);

  // source subjects
  private readonly adahrsCas = ConsumerSubject.create(null, 0);
  private readonly adahrsTas = ConsumerSubject.create(null, 0);
  private readonly adahrsSat = ConsumerSubject.create(null, 0);
  private readonly adahrsMach = ConsumerSubject.create(null, 0);
  private readonly _maxOperatingLimit = ConsumerSubject.create(null, OperatingSpeedLimit.Vmo);
  private readonly _maxOperatingCas = ConsumerSubject.create(null, Infinity);
  private readonly _maxPlacardCas = ConsumerSubject.create(null, Infinity);
  private readonly simTime = ConsumerValue.create(null, 0);
  private readonly ambientPressureInHg = ConsumerSubject.create<number | null>(null, null);
  private readonly ambientPressureHpa = Subject.create<number | null>(null);
  private readonly ambientPressurePipe = this.ambientPressureInHg.pipe(this.ambientPressureHpa, (v) => v !== null ? UnitType.HPA.convertFrom(v, UnitType.IN_HG) : null, true);
  private readonly apTargetCas = ConsumerSubject.create<number | null>(null, null).pause();
  private readonly apTargetMach = ConsumerSubject.create<number | null>(null, 0).pause();
  private readonly apTargetSpeedIsMach = ConsumerSubject.create(null, false).pause();
  private readonly apTargetMachAsCas = MappedSubject.create(
    ([targetMach, ambientPressure]) => ambientPressure && targetMach ? UnitType.KNOT.convertFrom(AeroMath.machToCas(targetMach, ambientPressure), UnitType.MPS) : null,
    this.apTargetMach,
    this.ambientPressureHpa
  );

  private readonly apTargetAsCas = MappedSubject.create(
    ([targetCas, targetMachCas, isTargetMach]) => isTargetMach ? targetMachCas : targetCas,
    this.apTargetCas,
    this.apTargetMachAsCas,
    this.apTargetSpeedIsMach,
  );

  private readonly _cautionSpeed = ConsumerSubject.create<number | null>(null, null).pause();
  public readonly cautionSpeed = this._cautionSpeed as Subscribable<number | null>;

  private readonly _cas = Subject.create<number | null>(null);
  public readonly cas = this._cas as Subscribable<number | null>;

  private readonly _casTrend = Subject.create<number | null>(null);
  public readonly casTrend = this._casTrend as Subscribable<number | null>;

  private readonly _casTrendDiff = Subject.create<number | null>(null);
  public readonly casTrendDiff = this._casTrendDiff as Subscribable<number | null>;

  private readonly _tas = Subject.create<number | null>(null);
  public readonly tas = this._tas as Subscribable<number | null>;

  private readonly _sat = Subject.create<number | null>(null);
  public readonly sat = this._sat as Subscribable<number | null>;

  private readonly _filteredTas = Subject.create<number | null>(null);
  public readonly filteredTas = this._filteredTas as Subscribable<number | null>;

  private readonly _mach = Subject.create<number | null>(null);
  public readonly mach = this._mach as Subscribable<number | null>;

  public readonly maxSpeed = MappedSubject.create(SubscribableMapFunctions.min(), this._maxOperatingCas, this._maxPlacardCas) as Subscribable<number>;
  public readonly maxOperatingSpeedLimiter = this._maxOperatingLimit as Subscribable<OperatingSpeedLimit>;
  public readonly maxOperatingSpeed = this._maxOperatingCas as Subscribable<number>;
  public readonly maxPlacardSpeed = this._maxPlacardCas as Subscribable<number>;

  public isSpeedAboveMaxOperating = MappedSubject.create(
    ([cas, max]) => cas !== null && cas > max,
    this._cas,
    this._maxOperatingCas,
  ) as Subscribable<boolean>;
  public isTrendAboveMaxOperating = MappedSubject.create(
    ([casTrend, max]) => casTrend !== null && casTrend > max,
    this._casTrend,
    this._maxOperatingCas,
  ) as Subscribable<boolean>;

  public isSpeedAbovePlacard = MappedSubject.create(
    ([cas, max]) => cas !== null && cas > max,
    this._cas,
    this._maxPlacardCas,
  ) as Subscribable<boolean>;
  public isTrendAbovePlacard = MappedSubject.create(
    ([casTrend, max]) => casTrend !== null && casTrend > max,
    this._casTrend,
    this._maxPlacardCas,
  ) as Subscribable<boolean>;

  public isSpeedAboveMax = MappedSubject.create(SubscribableMapFunctions.or(), this.isSpeedAboveMaxOperating, this.isSpeedAbovePlacard);
  public isTrendAboveMax = MappedSubject.create(SubscribableMapFunctions.or(), this.isTrendAboveMaxOperating, this.isTrendAbovePlacard);

  public readonly speedError = MappedSubject.create(
    ([targetCas, cas, ambientPressure]) => {
      if (cas === null || targetCas === null || ambientPressure === null) {
        return null;
      }

      return cas - targetCas;
    },
    this.apTargetAsCas,
    this._cas,
    this.ambientPressureHpa,
  ) as Subscribable<number | null>;

  public readonly isAfcsBugVisible = MappedSubject.create(
    ([targetCas, cautionIas]) => {
      if (targetCas === null || cautionIas === null) {
        return false;
      }
      return targetCas < cautionIas;
    },
    this.apTargetAsCas,
    this.cautionSpeed
  ) as Subscribable<boolean>;

  private readonly casTrendFilter = new Lookahead(6000, 200 / Math.LN2, 1000 / Math.LN2);
  private readonly tasFilter = new ExpSmoother(200 / Math.LN2);

  private readonly casPipe = this.adahrsCas.pipe(this._cas, (v) => v !== null && v <= 550 ? (v < 30 ? 0 : v) : null, true);
  private readonly tasPipe = this.adahrsTas.pipe(this._tas, (v) => v !== null ? (v < 30 ? 0 : v) : null, true);
  private readonly satPipe = this.adahrsSat.pipe(this._sat, true);
  private readonly machPipe = this.adahrsMach.pipe(this._mach, true);

  private readonly adahrsDataPipes = [
    this.casPipe,
    this.tasPipe,
    this.satPipe,
    this.machPipe,
    this.ambientPressurePipe,
  ];

  private readonly pausableSubs: Subscription[] = [
    this.ambientPressureInHg,
    this.apTargetCas,
    this.apTargetMach,
    this.apTargetSpeedIsMach,
    this._cautionSpeed
  ];

  private outputSubjects = [
    this._cas,
    this._tas,
    this._sat,
    this._filteredTas,
    this._mach,
    this._casTrend,
    this._casTrendDiff,
    this.ambientPressureHpa,
  ] as const;

  private readonly adahrsIndexSub: Subscription;
  private readonly adahrsValidSub: Subscription;
  private readonly tasFilterSub: Subscription;

  /**
  The boundaries, as `[min, max]` in knots, to which indicated airspeed is clamped when
   */
  private readonly casTrendBounds: ReadonlyFloat64Array = Vec2Math.create(30, 550);

  /**
   * Ctor.
   * @param bus The instrument event bus.
   * @param adahrsIndex The ADAHRS channel to use.
   * @param displayUnitIndex The index of this display unit.
   */
  constructor(
    private readonly bus: EventBus,
    adahrsIndex: AdahrsSystemChannel | Subscribable<AdahrsSystemChannel>,
    displayUnitIndex: DisplayUnitIndices,
  ) {
    this.adahrsIndex = SubscribableUtils.toSubscribable(adahrsIndex, true);
    this.ownSide = displayUnitIndex === DisplayUnitIndices.PfdRight ? 'right' : 'left';
    this.oppositeSide = displayUnitIndex === DisplayUnitIndices.PfdRight ? 'left' : 'right';

    const sub = this.bus.getSubscriber<AdahrsSystemEvents & ClockEvents & FmsSpeedEvents & SpeedLimitEvents & SpeedLimitEvents>();

    this.simTime.setConsumer(sub.on('simTime'));

    this._maxOperatingCas.setConsumer(sub.on('speedlimit_max_operating_ias'));
    this._maxPlacardCas.setConsumer(sub.on('speedlimit_max_placard_ias'));

    this.adahrsValidSub = MappedSubject.create(this.adahrsIndex, this.adahrsValid).sub(([index, valid]) => {
      if (index > 0 && valid) {
        this.tasFilterSub.resume();
        for (const pipe of this.adahrsDataPipes) {
          pipe.resume(true);
        }
      } else {
        this.pauseAndSetDataInvalid();
      }
    }, true, true);

    this.adahrsIndexSub = this.adahrsIndex.sub((index) => {
      if (index > 0) {
        this.adahrsCas.setConsumer(sub.on(`adahrs_ias_${index}`).withPrecision(2));
        this.adahrsTas.setConsumer(sub.on(`adahrs_tas_${index}`).withPrecision(2));
        this.adahrsSat.setConsumer(sub.on(`adahrs_ambient_temp_c_${index}`).withPrecision(1));
        this.adahrsMach.setConsumer(sub.on(`adahrs_mach_number_${index}`).withPrecision(3));
        this.adahrsValid.setConsumer(sub.on(`adahrs_speed_data_valid_${index}`));
        this.ambientPressureInHg.setConsumer(sub.on(`adahrs_ambient_pressure_inhg_${index}`));
      } else {
        this.adahrsValid.setConsumer(null);
        this.adahrsCas.setConsumer(null);
        this.adahrsTas.setConsumer(null);
        this.adahrsSat.setConsumer(null);
        this.adahrsMach.setConsumer(null);
        this.ambientPressureInHg.setConsumer(null);
      }
    }, true, true);

    this.tasFilterSub = sub.on('realTime').atFrequency(DefaultAirspeedDataProvider.FILTER_FREQUENCY).handle(() => {
      const tas = this._tas.get();
      if (tas !== null) {
        const dt = 1000 / DefaultAirspeedDataProvider.FILTER_FREQUENCY;
        const filteredTas = this.tasFilter.next(tas, dt);
        this._filteredTas.set(filteredTas >= 30 ? Math.round(filteredTas) : 0);
      } else {
        this._filteredTas.set(null);
        this.tasFilter.reset();
      }
    }, true);

    this.apTargetCas.setConsumer(sub.on('fms_speed_autopilot_target_ias'));
    this.apTargetMach.setConsumer(sub.on('fms_speed_autopilot_target_mach'));
    this.apTargetSpeedIsMach.setConsumer(sub.on('fms_speed_autopilot_target_is_mach'));
    this._cautionSpeed.setConsumer(sub.on('speedlimit_caution_ias'));
  }

  /** @inheritdoc */
  public init(): void {
    this.resume();
  }

  /** @inheritdoc */
  public onUpdate(): void {
    const time = this.simTime.get();
    const dt = (time - (this.lastUpdateTime ?? time));
    this.lastUpdateTime = time;
    if (!this.isPaused) {
      this.updateTrendFilter(dt);
    }
  }

  /** Pause the data subjects and set the outputs invalid (null). */
  private pauseAndSetDataInvalid(): void {
    this.tasFilterSub.pause();
    this.tasFilter.reset();
    for (const pipe of this.adahrsDataPipes) {
      pipe.pause();
    }
    for (const output of this.outputSubjects) {
      output.set(null);
    }
  }

  /** Pause the data output. */
  public pause(): void {
    this.isPaused = true;
    this.adahrsIndexSub.pause();
    this.adahrsValidSub.pause();
    this.pauseAndSetDataInvalid();
    this.simTime.pause();
    this.lastUpdateTime = undefined;
    this.resetTrendFilter();
    for (const sub of this.pausableSubs) {
      sub.pause();
    }
  }

  /** Resume the data output. */
  public resume(): void {
    this.simTime.resume();
    this.adahrsIndexSub.resume(true);
    this.adahrsValidSub.resume(true);
    this.tasFilterSub.resume();
    for (const sub of this.pausableSubs) {
      sub.resume(true);
    }
    this.isPaused = false;
  }

  /**
   * @inheritDoc
   * @param dt The time since the last update in ms.
   */
  private updateTrendFilter(dt: number): void {
    const cas = this.cas.get();
    if (cas !== null) {
      const diff = this.casTrendFilter.nextTrend(MathUtils.clamp(cas, this.casTrendBounds[0], this.casTrendBounds[1]), dt);
      this._casTrend.set(cas + diff);
      this._casTrendDiff.set(diff);
    } else {
      this.resetTrendFilter();
    }
  }

  /** Resets the CAS trend filter. */
  private resetTrendFilter(): void {
    this.casTrendFilter.reset();
    this._casTrend.set(null);
    this._casTrendDiff.set(null);
  }
}

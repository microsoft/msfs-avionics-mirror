import {
  ConsumerSubject, EventBus, Instrument, MappedSubject, MathUtils, Subject, Subscribable, SubscribableUtils, Subscription, UnitType
} from '@microsoft/msfs-sdk';

import { DisplayUnitIndices } from '../InstrumentIndices';
import { AdahrsSystemChannel, AdahrsSystemEvents } from '../Systems/AdahrsSystem';

/** An barometric altitude air data provider, providing data from the ADAHRS selected for an instrument. */
export interface AltitudeDataProvider extends Instrument {
  /** The current indicated altitude in feet, or null when invalid. */
  altitude: Subscribable<number | null>,

  /** The current pressure altitude in feet, or null when invalid. */
  pressureAltitude: Subscribable<number | null>,

  /** The current indicated altitude in meters, or null when invalid. */
  metricAltitude: Subscribable<number | null>,

  /** The current baro correction in in.Hg, or null when invalid. */
  baroCorrection: Subscribable<number | null>,

  /** Whether the altitude is in standard (1013.25 hPa) mode, or null when invalid. */
  isInStdMode: Subscribable<boolean | null>,

  /** Whether an altitude miscompare exists between the two sides. */
  altitudeMiscompare: Subscribable<boolean>,

  /** Whether a baro correction miscompare exists between the two sides. */
  baroMiscompare: Subscribable<boolean>,

  /** The current barometric vertical speed in feet/minute, or null when invalid. */
  verticalSpeed: Subscribable<number | null>,

  /** The current altitude trend, predicted for 6 seconds into the future, in feet, or null when invalid. */
  altitudeTrend: Subscribable<number | null>;

  /** The ambient static air pressure in hectopascals, or null when invalid. */
  ambientPressureHpa: Subscribable<number | null>;

  /** The static ambient air temperature in °C, or null when invalid. */
  ambientTemperature: Subscribable<number | null>;
}

/** An altitude air data provider implementation. */
export class DefaultAltitudeDataProvider implements AltitudeDataProvider {
  private static readonly MAX_METRIC_ALT_FEET = UnitType.FOOT.convertFrom(18280, UnitType.METER);
  private static readonly MIN_METRIC_ALT_FEET = UnitType.FOOT.convertFrom(-610, UnitType.METER);

  private readonly adahrsIndex: Subscribable<number>;

  private readonly ownSide: 'left' | 'right';
  private readonly oppositeSide: 'left' | 'right';

  private readonly adahrsValid = ConsumerSubject.create(null, false);

  // source subjects where we need both sides
  private readonly adahrsOwnAltitude = ConsumerSubject.create(null, 0);
  private readonly adahrsOwnPressureAltitude = ConsumerSubject.create(null, 0);
  private readonly adahrsOppositeAltitude = ConsumerSubject.create(null, 0);
  private readonly adahrsOwnCorrection = ConsumerSubject.create(null, 29.92);
  private readonly adahrsOppositeCorrection = ConsumerSubject.create(null, 29.92);

  // source subjects where we need only one side
  private readonly adahrsOwnInStdMode = ConsumerSubject.create(null, false);
  private readonly adahrsOwnVerticalSpeed = ConsumerSubject.create(null, 0);
  private readonly ambientPressureInHg = ConsumerSubject.create<number | null>(null, null);
  private readonly adahrsAmbientTemperature = ConsumerSubject.create<number | null>(null, null);

  private readonly _altitude = Subject.create<number | null>(null);
  public readonly altitude = this._altitude as Subscribable<number | null>;

  private readonly _pressureAltitude = Subject.create<number | null>(null);
  public readonly pressureAltitude = this._pressureAltitude as Subscribable<number | null>;

  private readonly _metricAltitude = Subject.create<number | null>(null);
  public readonly metricAltitude = this._metricAltitude as Subscribable<number | null>;

  private readonly _baroCorrection = Subject.create<number | null>(null);
  public readonly baroCorrection = this._baroCorrection as Subscribable<number | null>;

  private readonly _isInStdMode = Subject.create<boolean | null>(null);
  public readonly isInStdMode = this._isInStdMode as Subscribable<boolean | null>;

  private readonly _verticalSpeed = Subject.create<number | null>(null);
  public readonly verticalSpeed = this._verticalSpeed as Subscribable<number | null>;

  private readonly _altitudeTrend = this._verticalSpeed.map((v) => v !== null ? v / 10 : null);
  public readonly altitudeTrend = this._altitudeTrend as Subscribable<number | null>;

  private readonly _ambientTemperature = Subject.create<number | null>(null);
  public readonly ambientTemperature = this._ambientTemperature as Subscribable<number | null>;

  public readonly altitudeMiscompare = MappedSubject.create(
    ([own, opp, valid]) => valid && Math.abs(own - opp) > 200,
    this.adahrsOwnAltitude,
    this.adahrsOppositeAltitude,
    this.adahrsValid,
  ) as Subscribable<boolean>;

  // TODO double check hPa handling... should be 1 hPa difference
  public readonly baroMiscompare = MappedSubject.create(
    ([own, opp, valid]) => valid && Math.abs(own - opp) > 0.02,
    this.adahrsOwnCorrection,
    this.adahrsOppositeCorrection,
    this.adahrsValid,
  ) as Subscribable<boolean>;

  private readonly altitudePipe = this.adahrsOwnAltitude.pipe(this._altitude, (v) => v >= -2000 && v <= 60000 ? v : null, true);
  private readonly pressureAltitudePipe = this.adahrsOwnPressureAltitude.pipe(this._pressureAltitude, (v) => v >= -2000 && v <= 60000 ? v : null, true);

  private readonly metricAltitudePipe = this.adahrsOwnAltitude.pipe(this._metricAltitude, (v) =>
    v >= DefaultAltitudeDataProvider.MIN_METRIC_ALT_FEET
      && v <= DefaultAltitudeDataProvider.MAX_METRIC_ALT_FEET
      ? MathUtils.round(UnitType.METER.convertFrom(v, UnitType.FOOT), 1) : null, true
  );

  private readonly baroCorrectionPipe = this.adahrsOwnCorrection.pipe(this._baroCorrection, true);
  private readonly stdModePipe = this.adahrsOwnInStdMode.pipe(this._isInStdMode, true);
  private readonly verticalSpeedPipe = this.adahrsOwnVerticalSpeed.pipe(this._verticalSpeed, true);
  private readonly ambientTemperaturePipe = this.adahrsAmbientTemperature.pipe(this._ambientTemperature, true);

  private readonly _ambientPressureHpa = Subject.create<number | null>(null);
  public readonly ambientPressureHpa = this._ambientPressureHpa as Subscribable<number | null>;

  private readonly ambientPressureHpaPipe = this.ambientPressureInHg.pipe(this._ambientPressureHpa, (v) => v !== null ? UnitType.HPA.convertFrom(v, UnitType.IN_HG) : null, true);

  private pausableSubs = [
    this.altitudePipe,
    this.ambientPressureInHg,
    this.ambientPressureHpaPipe,
    this.pressureAltitudePipe,
    this.metricAltitudePipe,
    this.baroCorrectionPipe,
    this.stdModePipe,
    this.verticalSpeedPipe,
    this.ambientTemperaturePipe,
  ] as const;

  private outputSubjects = [
    this._altitude,
    this._ambientPressureHpa,
    this._pressureAltitude,
    this._metricAltitude,
    this._baroCorrection,
    this._isInStdMode,
    this._verticalSpeed,
    this._ambientTemperature,
  ] as const;

  private readonly adahrsIndexSub: Subscription;
  private readonly adahrsValidSub: Subscription;

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

    const sub = this.bus.getSubscriber<AdahrsSystemEvents>();

    this.adahrsValidSub = MappedSubject.create(this.adahrsIndex, this.adahrsValid).sub(([index, valid]) => {
      if (index > 0 && valid) {
        for (const pipe of this.pausableSubs) {
          pipe.resume(true);
        }
      } else {
        this.pauseAndSetDataInvalid();
      }
    }, true, true);

    this.adahrsIndexSub = this.adahrsIndex.sub((index) => {
      if (index > 0) {
        this.adahrsOwnAltitude.setConsumer(sub.on(`adahrs_${this.ownSide}_indicated_alt_${index}`).withPrecision(0));
        this.adahrsOppositeAltitude.setConsumer(sub.on(`adahrs_${this.oppositeSide}_indicated_alt_${index}`).withPrecision(0));
        this.adahrsOwnCorrection.setConsumer(sub.on(`adahrs_${this.ownSide}_altimeter_baro_setting_inhg_${index}`));
        this.adahrsOppositeCorrection.setConsumer(sub.on(`adahrs_${this.oppositeSide}_altimeter_baro_setting_inhg_${index}`));
        this.adahrsOwnInStdMode.setConsumer(sub.on(`adahrs_${this.ownSide}_altimeter_baro_is_std_${index}`));
        this.adahrsOwnVerticalSpeed.setConsumer(sub.on(`adahrs_vertical_speed_${index}`).withPrecision(0));
        this.adahrsOwnPressureAltitude.setConsumer(sub.on(`adahrs_pressure_alt_${index}`));
        this.adahrsAmbientTemperature.setConsumer(sub.on(`adahrs_ambient_temp_c_${index}`));
        this.ambientPressureInHg.setConsumer(sub.on(`adahrs_ambient_pressure_inhg_${index}`));
        this.adahrsValid.setConsumer(sub.on(`adahrs_altitude_data_valid_${index}`));
      } else {
        this.adahrsValid.setConsumer(null);
        this.adahrsOwnAltitude.setConsumer(null);
        this.adahrsOppositeAltitude.setConsumer(null);
        this.adahrsOwnCorrection.setConsumer(null);
        this.adahrsOppositeCorrection.setConsumer(null);
        this.adahrsOwnVerticalSpeed.setConsumer(null);
        this.adahrsOwnPressureAltitude.setConsumer(null);
        this.adahrsOwnInStdMode.setConsumer(null);
        this.ambientPressureInHg.setConsumer(null);
        this.adahrsAmbientTemperature.setConsumer(null);
      }
    }, true, true);
  }

  /** @inheritdoc */
  public init(): void {
    this.resume();
  }

  /** @inheritdoc */
  public onUpdate(): void {
    // noop
  }

  /** Pause the data subjects and set the outputs invalid (null). */
  private pauseAndSetDataInvalid(): void {
    for (const pipe of this.pausableSubs) {
      pipe.pause();
    }
    for (const output of this.outputSubjects) {
      output.set(null);
    }
  }

  /** Pause the data output. */
  public pause(): void {
    this.adahrsIndexSub.pause();
    this.adahrsValidSub.pause();
    this.pauseAndSetDataInvalid();
  }

  /** Resume the data output. */
  public resume(): void {
    this.adahrsIndexSub.resume(true);
    this.adahrsValidSub.resume(true);
  }
}

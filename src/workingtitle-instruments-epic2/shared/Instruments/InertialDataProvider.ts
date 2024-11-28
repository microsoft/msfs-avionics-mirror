import {
  ClockEvents, ConsumerSubject, EventBus, ExpSmoother, Instrument, MappedSubject, Subject, Subscribable, SubscribableUtils, Subscription, UnitType, Vec2Math
} from '@microsoft/msfs-sdk';

import { DisplayUnitIndices } from '../InstrumentIndices';
import { AdahrsSystemEvents } from '../Systems/AdahrsSystem';
import { FmsPositionMode, FmsPositionSystemEvents } from '../Systems/FmsPositionSystem';

/** An airspeed data provider, providing data from the ADAHRS selected for an instrument. */
export interface InertialDataProvider {
  /** The current wind speed component in x direction (crosswind) in knots, +ve being to the right, or null when invalid. */
  windSpeedX: Subscribable<number | null>,

  /** The current filtered wind speed component in x direction (crosswind) in knots, +ve being to the right, or null when invalid. */
  filteredWindSpeedX: Subscribable<number | null>,

  /** The current wind speed component in y direction (head/tailwind) in knots, +ve being tailwind/forward, or null when invalid. */
  windSpeedY: Subscribable<number | null>,

  /**
   * The current filtered wind speed component in y direction (head/tailwind) in knots,
   * +ve being tailwind/forward, or null when invalid.
   */
  filteredWindSpeedY: Subscribable<number | null>,

  /** The current total wind speed in knots, or null when invalid. */
  windSpeed: Subscribable<number | null>,

  /** The current filtered total wind speed in knots, or null when invalid. */
  filteredWindSpeed: Subscribable<number | null>,

  /** The current wind direction in degrees true, or null when invalid. */
  windDirection: Subscribable<number | null>,

  /** The current filtered wind direction in degrees true, or null when invalid. */
  filteredWindDirection: Subscribable<number | null>,

  /** The current ground speed in knots, or null when invalid. */
  groundSpeed: Subscribable<number | null>,

  /** The current ground track in degree true, or null when invalid. */
  groundTrack: Subscribable<number | null>,

  /** The current estimated FMS position, or null when invalid. */
  position: Subscribable<LatLongAlt | null>,

  /** The current estimated position uncertainty of the FMS position, or null when invalid. */
  estimatedPositionUncertainty: Subscribable<number | null>,

  /**
   * The current lateral acceleration relative to aircraft X axis, in east/west direction in metres/sec^2, +ve to the right,
   * or null when invalid.
   */
  lateralAcceleration: Subscribable<number | null>;

  /**
   * The current longitudinal acceleration relative to aircraft Z axis, in fore/aft direction in metres/sec^2, +ve forwards,
   * or null when invalid.
   */
  longitudinalAcceleration: Subscribable<number | null>;

  /**
   * The current vertical acceleration relative to aircraft Y axis, in vertical direction in metres/sec^2, +ve upwards,
   * or null when invalid.
   */
  verticalAcceleration: Subscribable<number | null>;

  /** The side slip acceleration in gs, or null when invalid. */
  sideSlip: Subscribable<number | null>;
}

/** An altitude air data provider implementation. */
export class DefaultInertialDataProvider implements InertialDataProvider, Instrument {
  private static readonly FILTER_FREQUENCY = 10;
  /** Gravity at sea level in metres/s^2. */
  private static readonly GRAVITY = UnitType.MPS_PER_SEC.convertFrom(-1, UnitType.G_ACCEL);
  private static readonly vec2Cache = [Vec2Math.create(), Vec2Math.create()];

  private readonly adahrsIndex: Subscribable<number>;
  private readonly fmsPosIndex: Subscribable<number>;

  private readonly ownSide: 'left' | 'right';
  private readonly oppositeSide: 'left' | 'right';

  private readonly adahrsAttitudeDataValid = ConsumerSubject.create(null, false);
  private readonly fmsPosMode = ConsumerSubject.create(null, FmsPositionMode.None);

  // source subjects
  private readonly fmsPosWindSpeed = ConsumerSubject.create(null, 0);
  private readonly fmsPosWindDirection = ConsumerSubject.create(null, 0);
  private readonly fmsPosGroundSpeed = ConsumerSubject.create(null, 0);
  private readonly fmsPosGroundTrack = ConsumerSubject.create(null, 0);
  private readonly fmsPosPosition = ConsumerSubject.create(null, new LatLongAlt());
  private readonly fmsPosEpu = ConsumerSubject.create(null, Infinity);
  private readonly adahrsLateralAccel = ConsumerSubject.create(null, 0);
  private readonly adahrsLongitudinallAccel = ConsumerSubject.create(null, 0);
  private readonly adahrsVerticalAccel = ConsumerSubject.create(null, 0);
  private readonly adahrsPitch = ConsumerSubject.create(null, 0);
  private readonly adahrsRoll = ConsumerSubject.create(null, 0);

  private readonly _windSpeedX = Subject.create<number | null>(null);
  public readonly windSpeedX = this._windSpeedX as Subscribable<number | null>;

  private readonly _windSpeedY = Subject.create<number | null>(null);
  public readonly windSpeedY = this._windSpeedY as Subscribable<number | null>;

  private readonly _windSpeed = Subject.create<number | null>(null);
  public readonly windSpeed = this._windSpeed as Subscribable<number | null>;

  private readonly _windDirection = Subject.create<number | null>(null);
  public readonly windDirection = this._windDirection as Subscribable<number | null>;

  private readonly _groundSpeed = Subject.create<number | null>(null);
  public readonly groundSpeed = this._groundSpeed as Subscribable<number | null>;

  private readonly _groundTrack = Subject.create<number | null>(null);
  public readonly groundTrack = this._groundTrack as Subscribable<number | null>;

  private readonly _position = Subject.create<LatLongAlt | null>(null);
  public readonly position = this._position as Subscribable<LatLongAlt | null>;

  private readonly _estimatedPositionUncertainty = Subject.create<number | null>(null);
  public readonly estimatedPositionUncertainty = this._estimatedPositionUncertainty as Subscribable<number>;

  private readonly _lateralAcceleration = Subject.create<number | null>(null);
  public readonly lateralAcceleration = this._lateralAcceleration as Subscribable<number | null>;

  private readonly _longitudinallAcceleration = Subject.create<number | null>(null);
  public readonly longitudinalAcceleration = this._longitudinallAcceleration as Subscribable<number | null>;

  private readonly _verticalAcceleration = Subject.create<number | null>(null);
  public readonly verticalAcceleration = this._verticalAcceleration as Subscribable<number | null>;

  private readonly windSpeedPipe = this.fmsPosWindSpeed.pipe(this._windSpeed, v => v > 255 ? null : v, true);
  private readonly windDirectionPipe = this.fmsPosWindDirection.pipe(this._windDirection, true);
  private readonly groundSpeedPipe = this.fmsPosGroundSpeed.pipe(this._groundSpeed, true);
  private readonly groundTrackPipe = this.fmsPosGroundTrack.pipe(this._groundTrack, true);
  private readonly positionPipe = this.fmsPosPosition.pipe(this._position, true);
  private readonly epuPipe = this.fmsPosEpu.pipe(this._estimatedPositionUncertainty, true);
  private readonly lateralAccelPipe = this.adahrsLateralAccel.pipe(this._lateralAcceleration, true);
  private readonly longitudinalAccelPipe = this.adahrsLongitudinallAccel.pipe(this._longitudinallAcceleration, true);
  private readonly verticalAccelPipe = this.adahrsVerticalAccel.pipe(this._verticalAcceleration, true);

  private readonly adahrsHeadingTrue = ConsumerSubject.create(null, 0);
  private readonly headingTrue = Subject.create<number | null>(null);
  private readonly headingTruePipe = this.adahrsHeadingTrue.pipe(this.headingTrue, true);

  private readonly windSpeedXFilter = new ExpSmoother(500 / Math.LN2);
  private readonly windSpeedYFilter = new ExpSmoother(500 / Math.LN2);

  private readonly _filteredWindSpeedX = Subject.create<number | null>(null);
  public readonly filteredWindSpeedX = this._filteredWindSpeedX as Subscribable<number | null>;

  private readonly _filteredWindSpeedY = Subject.create<number | null>(null);
  public readonly filteredWindSpeedY = this._filteredWindSpeedY as Subscribable<number | null>;

  private readonly _filteredWindSpeed = Subject.create<number | null>(null);
  public readonly filteredWindSpeed = this._filteredWindSpeed as Subscribable<number | null>;

  private readonly _filteredWindDirection = Subject.create<number | null>(null);
  public readonly filteredWindDirection = this._filteredWindDirection as Subscribable<number | null>;

  private readonly windComponentSub = MappedSubject.create(this.headingTrue, this.windSpeed, this.windDirection).sub(this.calcRelativeWindComponents.bind(this));

  private readonly _sideSlip = MappedSubject.create(
    ([bodyAccelX, pitch, roll]) => {
      if (bodyAccelX === null || pitch === null || roll === null) {
        return null;
      }
      const gravityX = -Math.cos(pitch * Avionics.Utils.DEG2RAD) * Math.sin(roll * Avionics.Utils.DEG2RAD);
      const sideslip = gravityX - UnitType.G_ACCEL.convertFrom(bodyAccelX, UnitType.MPS_PER_SEC);
      return sideslip;
    },
    this._lateralAcceleration,
    this.adahrsPitch,
    this.adahrsRoll,
  ).pause();
  public readonly sideSlip = this._sideSlip as Subscribable<number | null>;

  private adahrsDataPipes = [
    this.lateralAccelPipe,
    this.longitudinalAccelPipe,
    this.verticalAccelPipe,
    this.headingTruePipe,
  ] as const;

  private adahrsOutputSubjects = [
    this._lateralAcceleration,
    this._longitudinallAcceleration,
    this._verticalAcceleration,
    this.headingTrue,
  ] as const;

  private fmsPosDataPipes = [
    this.windSpeedPipe,
    this.windDirectionPipe,
    this.groundSpeedPipe,
    this.groundTrackPipe,
    this.positionPipe,
    this.epuPipe,
    this.windComponentSub,
  ] as const;

  private fmsPosOutputSubjects = [
    this._windSpeed,
    this._windDirection,
    this._groundSpeed,
    this._groundTrack,
    this._windSpeedX,
    this._windSpeedY,
    this._position,
    this._estimatedPositionUncertainty,
    this._filteredWindSpeedX,
    this._filteredWindSpeedY,
    this._filteredWindSpeed,
    this._filteredWindDirection,
  ] as const;

  private readonly adahrsIndexSub: Subscription;
  private readonly adahrsValidSub: Subscription;
  private readonly fmsPosIndexSub: Subscription;
  private readonly fmsPosValidSub: Subscription;
  private readonly windFilterSub: Subscription;

  /**
   * Ctor.
   * @param bus The instrument event bus.
   * @param adahrsIndex The ADAHRS index to use.
   * @param fmsPosIndex The fms pos to use.
   * @param displayUnitIndex The index of this display unit.
   */
  constructor(
    private readonly bus: EventBus,
    adahrsIndex: number | Subscribable<number>,
    fmsPosIndex: number | Subscribable<number>,
    displayUnitIndex: DisplayUnitIndices,
  ) {
    this.adahrsIndex = SubscribableUtils.toSubscribable(adahrsIndex, true);
    this.fmsPosIndex = SubscribableUtils.toSubscribable(fmsPosIndex, true);
    this.ownSide = displayUnitIndex === DisplayUnitIndices.PfdRight ? 'right' : 'left';
    this.oppositeSide = displayUnitIndex === DisplayUnitIndices.PfdRight ? 'left' : 'right';

    const sub = this.bus.getSubscriber<AdahrsSystemEvents & ClockEvents & FmsPositionSystemEvents>();

    this.adahrsValidSub = MappedSubject.create(this.adahrsIndex, this.adahrsAttitudeDataValid).sub(([index, valid]) => {
      if (index > 0 && valid) {
        for (const pipe of this.adahrsDataPipes) {
          pipe.resume(true);
        }
        this._sideSlip.resume();
      } else {
        this.pauseAndSetAdahrsDataInvalid();
      }
    }, true, true);

    this.adahrsIndexSub = this.adahrsIndex.sub((index) => {
      if (index > 0) {
        this.adahrsLateralAccel.setConsumer(sub.on(`adahrs_acceleration_body_x_${index}`).withPrecision(3));
        this.adahrsLongitudinallAccel.setConsumer(sub.on(`adahrs_acceleration_body_z_${index}`).withPrecision(3));
        this.adahrsVerticalAccel.setConsumer(sub.on(`adahrs_acceleration_body_y_${index}`).withPrecision(3));
        this.adahrsPitch.setConsumer(sub.on(`adahrs_actual_pitch_deg_${index}`));
        this.adahrsRoll.setConsumer(sub.on(`adahrs_actual_roll_deg_${index}`));
        this.adahrsAttitudeDataValid.setConsumer(sub.on(`adahrs_attitude_data_valid_${index}`));
      } else {
        this.adahrsAttitudeDataValid.setConsumer(null);
        this.adahrsLateralAccel.setConsumer(null);
        this.adahrsLongitudinallAccel.setConsumer(null);
        this.adahrsVerticalAccel.setConsumer(null);
        this.adahrsPitch.setConsumer(null);
        this.adahrsRoll.setConsumer(null);
      }
    }, true, true);

    this.fmsPosValidSub = MappedSubject.create(this.fmsPosIndex, this.fmsPosMode).sub(([index, mode]) => {
      if (index > 0 && (mode === FmsPositionMode.Gps || mode === FmsPositionMode.GpsSbas)) {
        this.windFilterSub.resume();
        for (const pipe of this.fmsPosDataPipes) {
          pipe.resume(true);
        }
      } else {
        this.pauseAndSetFmsPosDataInvalid();
      }
    }, true, true);

    this.fmsPosIndexSub = this.fmsPosIndex.sub((index) => {
      if (index > 0) {
        this.fmsPosWindSpeed.setConsumer(sub.on(`fms_pos_ambient_wind_velocity_${index}`).withPrecision(0));
        this.fmsPosWindDirection.setConsumer(sub.on(`fms_pos_ambient_wind_direction_${index}`).withPrecision(0));
        this.fmsPosGroundSpeed.setConsumer(sub.on(`fms_pos_ground_speed_${index}`).withPrecision(0));
        this.fmsPosGroundTrack.setConsumer(sub.on(`fms_pos_track_deg_true_${index}`).withPrecision(0));
        this.fmsPosPosition.setConsumer(sub.on(`fms_pos_gps-position_${index}`));
        this.fmsPosEpu.setConsumer(sub.on(`fms_pos_epu_${index}`));
        this.fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${index}`));
      } else {
        this.fmsPosMode.setConsumer(null);
        this.fmsPosWindSpeed.setConsumer(null);
        this.fmsPosWindDirection.setConsumer(null);
        this.fmsPosGroundSpeed.setConsumer(null);
        this.fmsPosGroundTrack.setConsumer(null);
        this.fmsPosPosition.setConsumer(null);
        this.fmsPosEpu.setConsumer(null);
      }
    }, true, true);

    this.windFilterSub = sub.on('realTime').atFrequency(DefaultInertialDataProvider.FILTER_FREQUENCY).handle(() => {
      const rawWindSpeedX = this._windSpeedX.get();
      const rawWindSpeedY = this._windSpeedY.get();
      if (rawWindSpeedX !== null && rawWindSpeedY !== null) {
        const dt = 1000 / DefaultInertialDataProvider.FILTER_FREQUENCY;
        const filteredWindSpeedX = this.windSpeedXFilter.next(rawWindSpeedX, dt);
        const filteredWindSpeedY = this.windSpeedYFilter.next(rawWindSpeedY, dt);
        this._filteredWindSpeedX.set(Math.round(filteredWindSpeedX));
        this._filteredWindSpeedY.set(Math.round(filteredWindSpeedY));

        const windVector = Vec2Math.set(filteredWindSpeedY, filteredWindSpeedX, DefaultInertialDataProvider.vec2Cache[0]);
        this._filteredWindDirection.set(Math.round(Vec2Math.theta(windVector) * Avionics.Utils.RAD2DEG));
        this._filteredWindSpeed.set(Math.round(Vec2Math.abs(windVector)));
      } else {
        this._filteredWindSpeedX.set(null);
        this._filteredWindSpeedY.set(null);
        this.windSpeedXFilter.reset();
        this.windSpeedYFilter.reset();
      }
    }, true);
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
  private pauseAndSetAdahrsDataInvalid(): void {
    for (const pipe of this.adahrsDataPipes) {
      pipe.pause();
    }
    for (const output of this.adahrsOutputSubjects) {
      output.set(null);
    }
    // this becomes null when the lateral accel becomes null
    this._sideSlip.pause();
  }

  /** Pause the data subjects and set the outputs invalid (null). */
  private pauseAndSetFmsPosDataInvalid(): void {
    this.windFilterSub.pause();
    this.windSpeedXFilter.reset();
    this.windSpeedYFilter.reset();
    for (const pipe of this.fmsPosDataPipes) {
      pipe.pause();
    }
    for (const output of this.fmsPosOutputSubjects) {
      output.set(null);
    }
  }

  /** Pause the data output. */
  public pause(): void {
    this.adahrsIndexSub.pause();
    this.adahrsValidSub.pause();
    this.fmsPosIndexSub.pause();
    this.fmsPosValidSub.pause();
    this.pauseAndSetAdahrsDataInvalid();
    this.pauseAndSetFmsPosDataInvalid();
  }

  /** Resume the data output. */
  public resume(): void {
    this.adahrsIndexSub.resume(true);
    this.adahrsValidSub.resume(true);
    this.fmsPosIndexSub.resume(true);
    this.fmsPosValidSub.resume(true);
    this.windFilterSub.resume();
    this._sideSlip.resume();
  }

  /**
   * Calculate headwind and crosswind components from the current heading, wind speed and wind direction.
   * @param data The data.
   * @param data."0" Current true heading.
   * @param data."1" Current wind speed in kt.
   * @param data."2" Current wind direction in degrees true.
   */
  private calcRelativeWindComponents([heading, windSpeed, windDirection]: readonly [number | null, number | null, number | null]): void {
    if (heading === null || windSpeed === null || windDirection === null) {
      this._windSpeedX.set(null);
      this._windSpeedY.set(null);
      return;
    }

    
    const relativeWindDirection = (windDirection + 180 - heading) * Avionics.Utils.DEG2RAD;

    // Note: the below X and Y assume a coordinate system where +X is to the right and +Y is forward
    // (i.e. [1, 2] = 1 knot crosswind *to* the right, 2 knot *tail*wind).
    const relativeWindX = windSpeed * Math.sin(relativeWindDirection);
    const relativeWindY = windSpeed * Math.cos(relativeWindDirection);

    this._windSpeedX.set(Math.round(relativeWindX));
    this._windSpeedY.set(Math.round(relativeWindY));
  }
}

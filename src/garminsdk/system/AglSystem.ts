import {
  Accessible, AvionicsSystemState, AvionicsSystemStateEvent, BasicAvionicsSystem, ClockEvents, ConsumerValue, EventBus,
  EventBusMetaEvents, GNSSEvents, MathUtils, MultiExpSmoother, Subject, Subscribable, SubscribableUtils, Subscription,
  SystemPowerKey, UnitType, Value
} from '@microsoft/msfs-sdk';

import { FmsPositionMode, FmsPositionSystemEvents } from './FmsPositionSystem';
import { RadarAltimeterSystemEvents } from './RadarAltimeterSystem';

/**
 * Events fired by the AGL system.
 */
export interface AglSystemEvents {
  /** An event fired when the AGL system state changes. */
  [agl_state: `agl_state_${number}`]: AvionicsSystemStateEvent;

  /** An event fired when the position data validity of an AGL system changes. */
  [agl_gps_data_valid: `agl_gps_data_valid_${number}`]: boolean;

  /** The above ground height, in feet, calculated from position data. */
  [agl_gps_height: `agl_gps_height_${number}`]: number;

  /** The rate of change of above ground height, in feet per minute, calculated from position data. */
  [agl_gps_height_rate: `agl_gps_height_rate_${number}`]: number;

  /** An event fired when the radar altitude data validity of an AGL system changes. */
  [agl_radaralt_data_valid: `agl_radaralt_data_valid_${number}`]: boolean;

  /** The above ground height, in feet, calculated from radar altitude data. */
  [agl_radaralt_height: `agl_radaralt_height_${number}`]: number;

  /**
   * Whether above ground height calculated from radar altitude data is clamped to the maximum reliable radar altitude.
   * If the height is clamped, then the rate of change of the height is fixed to zero and is not valid.
   */
  [agl_radaralt_height_maxed: `agl_radaralt_height_maxed_${number}`]: boolean;

  /** The rate of change of above ground height, in feet per minute, calculated from radar altitude data. */
  [agl_radaralt_height_rate: `agl_radaralt_height_rate_${number}`]: number;
}

/**
 * Parameters for exponential smoothers used by {@link AglSystem}. 
 */
export type AglSystemSmootherParams = {
  /**
   * The smoothing time constant, in milliseconds. The larger the constant, the greater the smoothing effect. A value
   * less than or equal to 0 is equivalent to no smoothing.
   */
  tau?: number;

  /**
   * The time constant, in milliseconds, for smoothing the estimated velocity of the input value. The larger the
   * constant, the greater the smoothing effect applied to the estimated velocity. A value less than or equal to 0 is
   * equivalent to no smoothing. If not defined, then estimated velocity will not be used to calculate the final
   * smoothed value.
   */
  tauVelocity?: number;

  /**
   * The time constant, in milliseconds, for smoothing the estimated acceleration of the input value. The larger the
   * constant, the greater the smoothing effect applied to the estimated acceleration. A value less than or equal to 0
   * is equivalent to no smoothing. If this value or `tauVelocity` is not defined, then estimated acceleration will not
   * be used to calculate the final smoothed value.
   */
  tauAccel?: number;

  /**
   * The elapsed time threshold, in milliseconds, above which smoothing will not be applied to a new input value.
   * Defaults to 10000.
   */
  dtThreshold?: number;
};

/**
 * Configuration options for {@link AglSystem}.
 */
export type AglSystemOptions = {
  /**
   * The index of the FMS position system from which to source data. Specifying an invalid index (less than or equal to
   * zero) will prevent the system from sourcing position data. Defaults to `-1`.
   */
  fmsPosIndex?: number | Subscribable<number>;

  /**
   * The FMS position system data modes that provide valid position data for calculating AGL data. Defaults to
   * `[FmsPositionMode.Gps, FmsPositionMode.Hns, FmsPositionMode.Dme]`.
   */
  validFmsPosModes?: Iterable<Exclude<FmsPositionMode, FmsPositionMode.None>>;

  /**
   * Parameters for smoothing applied to GPS above ground height. `tau` defaults to `1000 / Math.LN2`, `tauVelocity`
   * defaults to undefined, and `tauAccel` defaults to `undefined.
   */
  gpsAglSmootherParams?: Readonly<AglSystemSmootherParams>;

  /**
   * The index of the radar altimeter system from which to source data. Specifying an invalid index (less than or equal
   * to zero) will prevent the system from sourcing radar altitude data. Defaults to `-1`.
   */
  radarAltIndex?: number | Subscribable<number>;

  /**
   * The maximum reliable radar altitude, in feet. Radar altitude values above the maximum will be clamped to the
   * maximum and cannot be used to calculate height rate. Defaults to `Infinity`.
   */
  maxRadarAlt?: number | Accessible<number>;

  /**
   * Parameters for smoothing applied to radar altitude. `tau` defaults to `1000 / Math.LN2`, `tauVelocity` defaults to
   * undefined, and `tauAccel` defaults to `undefined.
   */
  radarAltSmootherParams?: Readonly<AglSystemSmootherParams>;
};

/**
 * A Garmin system that calculates data related to the airplane's above ground height/level. The system supports
 * sourcing FMS position data (plus terrain database) or radar altitude data.
 * 
 * Requires the event bus topics defined in {@link ClockEvents} to be published. In order to source FMS position data,
 * requires the event bus topics defined in {@link GNSSEvents} and {@link FmsPositionSystemEvents} to be published. In
 * order to source radar altitude data, requires the event bus topics defined in {@link RadarAltimeterSystemEvents} to
 * be published.
 */
export class AglSystem extends BasicAvionicsSystem<AglSystemEvents> {
  protected initializationTime = 0;

  private readonly dataSourceSubscriber = this.bus.getSubscriber<
    ClockEvents & GNSSEvents & FmsPositionSystemEvents & RadarAltimeterSystemEvents
  >();

  private readonly fmsPosIndex: number | Subscribable<number>;
  private readonly radarAltIndex: number | Subscribable<number>;

  private readonly simRate = ConsumerValue.create(null, 1);

  private readonly validFmsPosModes: Set<FmsPositionMode>;
  private readonly fmsPosMode = ConsumerValue.create(null, FmsPositionMode.None);
  private readonly gpsPos = ConsumerValue.create(null, new LatLongAlt(0, 0, 0));
  private readonly gpsGroundAltitude = ConsumerValue.create(null, 0);

  private radarAltStateSub?: Subscription;
  private readonly maxRadarAlt: Accessible<number>;
  private readonly radarAlt = ConsumerValue.create(null, NaN);

  private readonly gpsAglSmoother: MultiExpSmoother;
  private readonly radarAltSmoother: MultiExpSmoother;

  private readonly gpsTopics = {
    'agl_gps_data_valid': `agl_gps_data_valid_${this.index}`,
    'agl_gps_height': `agl_gps_height_${this.index}`,
    'agl_gps_height_rate': `agl_gps_height_rate_${this.index}`
  } as const;

  private readonly radarAltTopics = {
    'agl_radaralt_data_valid': `agl_radaralt_data_valid_${this.index}`,
    'agl_radaralt_height': `agl_radaralt_height_${this.index}`,
    'agl_radaralt_height_maxed': `agl_radaralt_height_maxed_${this.index}`,
    'agl_radaralt_height_rate': `agl_radaralt_height_rate_${this.index}`
  } as const;

  private isGpsDataSubbed = false;
  private publishedGpsDataValid: boolean | undefined = undefined;
  private lastGpsHeight: number | undefined = undefined;

  private isRadarAltDataSubbed = false;
  private publishedRadarAltDataValid: boolean | undefined = undefined;
  private lastRadarAltHeight: number | undefined = undefined;

  private lastUpdateTime: number | undefined = undefined;

  /**
   * Creates an instance of an angle of attack computer system.
   * @param index The index of the AoA computer.
   * @param bus An instance of the event bus.
   * @param powerSource The source from which to retrieve the system's power state. Can be an event bus topic defined
   * in {@link ElectricalEvents} with boolean-valued data, an XML logic element that evaluates to zero (false) or
   * non-zero (true) values, or a boolean-valued subscribable. If not defined, then the system will be considered
   * always powered on.
   * @param options Options with which to configure the system.
   */
  public constructor(
    index: number,
    bus: EventBus,
    powerSource?: SystemPowerKey | CompositeLogicXMLElement | Subscribable<boolean>,
    options?: Readonly<AglSystemOptions>
  ) {
    super(index, bus, `agl_state_${index}` as const);

    this.fmsPosIndex = options?.fmsPosIndex ?? -1;
    this.validFmsPosModes = new Set(options?.validFmsPosModes ?? [FmsPositionMode.Gps, FmsPositionMode.Hns, FmsPositionMode.Dme]);
    this.validFmsPosModes.delete(FmsPositionMode.None);
    this.gpsAglSmoother = new MultiExpSmoother(
      options?.gpsAglSmootherParams?.tau ?? 1000 / Math.LN2,
      options?.gpsAglSmootherParams?.tauVelocity,
      options?.gpsAglSmootherParams?.tauAccel,
      null, null, null,
      options?.gpsAglSmootherParams?.dtThreshold ?? 10000
    );

    this.radarAltIndex = options?.radarAltIndex ?? -1;
    const maxRadarAlt = options?.maxRadarAlt ?? Infinity;
    this.maxRadarAlt = typeof maxRadarAlt === 'number' ? Value.create(maxRadarAlt) : maxRadarAlt;
    this.radarAltSmoother = new MultiExpSmoother(
      options?.radarAltSmootherParams?.tau ?? 1000 / Math.LN2,
      options?.radarAltSmootherParams?.tauVelocity,
      options?.radarAltSmootherParams?.tauAccel,
      null, null, null,
      options?.radarAltSmootherParams?.dtThreshold ?? 10000
    );

    this.connectToPower(powerSource ?? Subject.create(true));

    this.startDataPublish();
  }

  /**
   * Starts publishing angle of attack data on the event bus.
   */
  private startDataPublish(): void {
    const gpsTopics = Object.values(this.gpsTopics);
    const radarAltTopics = Object.values(this.radarAltTopics);

    for (const topic of gpsTopics) {
      if (this.bus.getTopicSubscriberCount(topic) > 0) {
        this.onGpsTopicSubscribed();
      }
    }

    for (const topic of radarAltTopics) {
      if (this.bus.getTopicSubscriberCount(topic) > 0) {
        this.onRadarAltTopicSubscribed();
      }
    }

    this.bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(topic => {
      if (gpsTopics.includes(topic as any)) {
        this.onGpsTopicSubscribed();
      } else if (radarAltTopics.includes(topic as any)) {
        this.onRadarAltTopicSubscribed();
      }
    });
  }

  /**
   * Responds to when someone first subscribes to one of this system's position data topics on the event bus.
   */
  private onGpsTopicSubscribed(): void {
    if (this.isGpsDataSubbed) {
      return;
    }

    this.simRate.setConsumer(this.dataSourceSubscriber.on('simRate'));

    if (SubscribableUtils.isSubscribable(this.fmsPosIndex)) {
      this.fmsPosIndex.sub(index => {
        if (index < 1) {
          this.fmsPosMode.setConsumerWithDefault(null, FmsPositionMode.None);
          this.gpsPos.setConsumer(null);
          this.gpsGroundAltitude.setConsumer(null);
        } else {
          this.fmsPosMode.setConsumer(this.dataSourceSubscriber.on(`fms_pos_mode_${index}`));
          this.gpsPos.setConsumer(this.dataSourceSubscriber.on('gps-position'));
          this.gpsGroundAltitude.setConsumer(this.dataSourceSubscriber.on('ground_altitude'));
        }
      }, true);
    } else if (this.fmsPosIndex >= 1) {
      this.fmsPosMode.setConsumer(this.dataSourceSubscriber.on(`fms_pos_mode_${this.fmsPosIndex}`));
      this.gpsGroundAltitude.setConsumer(this.dataSourceSubscriber.on('ground_altitude'));
    }

    this.isGpsDataSubbed = true;
  }

  /**
   * Responds to when someone first subscribes to one of this system's radar altitude data topics on the event bus.
   */
  private onRadarAltTopicSubscribed(): void {
    if (this.isRadarAltDataSubbed) {
      return;
    }

    this.simRate.setConsumer(this.dataSourceSubscriber.on('simRate'));

    if (SubscribableUtils.isSubscribable(this.radarAltIndex) || this.radarAltIndex >= 1) {
      const radarAltStateHandler = (state: AvionicsSystemStateEvent): void => {
        if (state.current === AvionicsSystemState.On || state.current === undefined) {
          this.radarAlt.setConsumerWithDefault(this.dataSourceSubscriber.on(`radaralt_radio_alt_${this.radarAltIndex as number}`), NaN);
        } else {
          this.radarAlt.setConsumerWithDefault(null, NaN);
        }
      };

      if (SubscribableUtils.isSubscribable(this.radarAltIndex)) {
        this.radarAltIndex.sub(index => {
          this.radarAltStateSub?.destroy();
          this.radarAlt.setConsumerWithDefault(null, NaN);

          if (index >= 1) {
            this.radarAltStateSub = this.dataSourceSubscriber.on(`radaralt_state_${index}`).handle(radarAltStateHandler);
          }
        }, true);
      } else {
        this.radarAltStateSub = this.dataSourceSubscriber.on(`radaralt_state_${this.radarAltIndex}`).handle(radarAltStateHandler);
      }
    }

    this.isRadarAltDataSubbed = true;
  }

  /** @inheritDoc */
  public onUpdate(): void {
    super.onUpdate();

    if (this._state !== AvionicsSystemState.On) {
      this.lastUpdateTime = undefined;
      this.resetGpsData();
      this.resetRadarAltData();
      return;
    }

    const realTime = Date.now();
    const dt = this.lastUpdateTime === undefined
      ? 0
      : MathUtils.clamp(realTime - this.lastUpdateTime, 0, 1000) * this.simRate.get();

    if (this.isGpsDataSubbed) {
      this.updateGpsData(dt);
    }

    if (this.isRadarAltDataSubbed) {
      this.updateRadarAltData(dt);
    }

    this.lastUpdateTime = realTime;
  }

  /**
   * Updates data sourced from position data.
   * @param dt The elapsed time since the previous update, in milliseconds.
   */
  private updateGpsData(dt: number): void {
    if (this.validFmsPosModes.has(this.fmsPosMode.get())) {
      const gpsAgl = this.gpsAglSmoother.next(UnitType.METER.convertTo(this.gpsPos.get().alt, UnitType.FOOT) - this.gpsGroundAltitude.get(), dt);

      let heightRate = 0;
      if (this.lastGpsHeight !== undefined && dt > 0) {
        heightRate = (gpsAgl - this.lastGpsHeight) / dt * 60000;
      }

      this.lastGpsHeight = gpsAgl;

      this.publisher.pub(this.gpsTopics['agl_gps_height'], gpsAgl, false, true);
      this.publisher.pub(this.gpsTopics['agl_gps_height_rate'], heightRate, false, true);

      if (this.publishedGpsDataValid !== true) {
        this.publishedGpsDataValid = true;
        this.publisher.pub(this.gpsTopics['agl_gps_data_valid'], true, false, true);
      }
    } else {
      this.resetGpsData();
    }
  }

  /**
   * Resets data sourced from position data and marks them as invalid.
   */
  private resetGpsData(): void {
    this.gpsAglSmoother.reset();
    this.lastGpsHeight = undefined;

    if (this.publishedGpsDataValid !== false) {
      this.publishedGpsDataValid = false;
      this.publisher.pub(this.gpsTopics['agl_gps_data_valid'], false, false, true);
    }
  }

  /**
   * Updates data sourced from radar altitude data.
   * @param dt The elapsed time since the previous update, in milliseconds.
   */
  private updateRadarAltData(dt: number): void {
    let radarAlt = this.radarAlt.get();

    if (isFinite(radarAlt)) {
      let heightRate = 0;

      const maxRadarAlt = this.maxRadarAlt.get();
      if (radarAlt > maxRadarAlt) {
        radarAlt = this.radarAltSmoother.reset(maxRadarAlt);

        this.publisher.pub(this.radarAltTopics['agl_radaralt_height'], radarAlt, false, true);
        this.publisher.pub(this.radarAltTopics['agl_radaralt_height_maxed'], true, false, true);
        this.publisher.pub(this.radarAltTopics['agl_radaralt_height_rate'], heightRate, false, true);

        this.lastRadarAltHeight = undefined;
      } else {
        radarAlt = this.radarAltSmoother.next(radarAlt, dt);

        if (this.lastRadarAltHeight !== undefined && dt > 0) {
          heightRate = (radarAlt - this.lastRadarAltHeight) / dt * 60000;
        }

        this.publisher.pub(this.radarAltTopics['agl_radaralt_height'], radarAlt, false, true);
        this.publisher.pub(this.radarAltTopics['agl_radaralt_height_rate'], heightRate, false, true);
        this.publisher.pub(this.radarAltTopics['agl_radaralt_height_maxed'], false, false, true);

        this.lastRadarAltHeight = radarAlt;
      }

      if (this.publishedRadarAltDataValid !== true) {
        this.publishedRadarAltDataValid = true;
        this.publisher.pub(this.radarAltTopics['agl_radaralt_data_valid'], true, false, true);
      }
    } else {
      this.resetRadarAltData();
    }
  }

  /**
   * Resets data sourced from radar altitude data and marks them as invalid.
   */
  private resetRadarAltData(): void {
    this.radarAltSmoother.reset();
    this.lastRadarAltHeight = undefined;

    if (this.publishedRadarAltDataValid !== false) {
      this.publishedRadarAltDataValid = false;
      this.publisher.pub(this.radarAltTopics['agl_radaralt_data_valid'], false, false, true);
    }
  }
}

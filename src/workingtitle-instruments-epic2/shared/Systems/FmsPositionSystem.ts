import {
  AdcEvents, AvionicsSystemState, AvionicsSystemStateEvent, BasicAvionicsSystem, ClockEvents, ConsumerSubject, EventBus, EventBusMetaEvents, GNSSEvents,
  GPSSystemSBASState,
  GPSSystemState, MathUtils, Subject, Subscribable, SubscribableUtils, Subscription, SystemPowerKey, UnitType
} from '@microsoft/msfs-sdk';

import { AdahrsSystemEvents } from './AdahrsSystem';
import { GpsReceiverSystemEvents } from './GpsReceiverSystem';

/**
 * FMS positioning system data modes.
 */
export enum FmsPositionMode {
  /** No position data is available. */
  None = 'None',

  /** Position data is sourced from GPS. */
  Gps = 'Gps',

  GpsSbas = 'GpsSbas',

  /** Position data is sourced from dead reckoning. */
  DeadReckoning = 'DeadReckoning',

  /** Position data is sourced from dead reckoning and more than 20 minutes have elapsed since the last accurate position fix. */
  DeadReckoningExpired = 'DeadReckoningExpired'
}

/**
 * Topics for bus events from which FMS geo-positioning data is sourced.
 */
type FmsPositionDataSourceTopics = 'gps-position' | 'ground_speed' | 'track_deg_true' | 'track_deg_magnetic';

/**
 * Data events published by the GPS receiver system sourced from GNSS.
 */
type FmsPositionGNSSDataEvents = {
  [P in Extract<FmsPositionDataSourceTopics, keyof GNSSEvents> as `fms_pos_${P}_${number}`]: GNSSEvents[P];
};

/**
 * Topics for bus events from which FMS geo-positioning data is sourced.
 */
type FmsPositionAdcDataSourceTopics = 'ambient_wind_velocity' | 'ambient_wind_direction';

/**
 * Data events published by the GPS receiver system sourced from GNSS.
 */
type FmsPositionAdcDataEvents = {
  [P in Extract<FmsPositionAdcDataSourceTopics, keyof AdcEvents> as `fms_pos_${P}_${number}`]: AdcEvents[P];
};

/**
 * Events fired by the FMS geo-positioning system.
 */
export interface FmsPositionSystemEvents extends FmsPositionGNSSDataEvents, FmsPositionAdcDataEvents {
  /** An event fired when the FMS geo-positioning system state changes. */
  [fms_pos_state_: `fms_pos_state_${number}`]: AvionicsSystemStateEvent;

  /** The current positioning mode used by the FMS geo-positioning system. */
  [fms_pos_mode_: `fms_pos_mode_${number}`]: FmsPositionMode;

  /**
   * The index of the GPS receiver currently used by the FMS geo-positioning system, or `-1` if the system is not
   * using any GPS receiver.
   */
  [fms_pos_gps_index_: `fms_pos_gps_index_${number}`]: number;

  /** The current GPS position uncertainty (95%) estimated by the FMS from the lowest EPU GPS, -1 when invalid */
  [fms_pos_gps_epu: `fms_pos_gps_epu_${number}`]: number;

  /** The current ADAHRS position uncertainty (95%) estimated by the FMS, -1 when invalid */
  [fms_pos_adahrs_epu: `fms_pos_adahrs_epu_${number}`]: number;

  /** The current Dead Reckoning position uncertainty (95%) estimated by the FMS, -1 when invalid */
  [fms_pos_dr_epu: `fms_pos_dr_epu_${number}`]: number;

  /** The current best position uncertainty (95%) estimated by the FMS from each of the sources, -1 when invalid */
  [fms_pos_epu: `fms_pos_epu_${number}`]: number;
}

  /*
   * Polar Operation
   * When magnetic field is less than 60 mGauss, the magnetometers stop supplying magnetic heading to the ADAHRS.
   * The ADAHRS then switch to GPS track (and PFDs to TRK UP MODE on the HSI). GPS track is available when travveling > 9 knots GS.
   * If the FMS database magnetic varition is available, magnetic track is used, otherwise true track.
   * The field needs to rise above 75 mGauss to switch back to magnetic heading from the magnetometers.
   * FMS mag database coverage is 82° north, with the exception of 73.125° between 80° and 130° west,
   * and 82° south, with the exception of 55° south between 120° and 160° east.
   */

/**
 * An FMS geo-positioning system.
 * The FMS uses primarily GPS position, and if unavailable falls back to dead reckoning from the last known GPS position based on ADAHRS
 */
export class FmsPositionSystem extends BasicAvionicsSystem<FmsPositionSystemEvents> {
  private static readonly DEAD_RECKONING_EXPIRE_TIME = UnitType.MINUTE.convertTo(20, UnitType.MILLISECOND);
  /** Scalar for the rate at which EPU accumulates in dead-reckoning mode. The unit is NM per knot of TAS per 100 ms. */
  private static readonly DEAD_RECKONING_EPU_SCALAR = 0.001;
  /** The minimum TAS that is assumed for dead reckoning EPU accumulation. */
  private static readonly DEAD_RECKONING_MIN_TAS = 100;

  protected initializationTime = 0;

  private readonly gnssDataSourceTopicMap = {
    [`fms_pos_gps-position_${this.index}`]: 'gps-position',
    [`fms_pos_ground_speed_${this.index}`]: 'ground_speed',
    [`fms_pos_track_deg_true_${this.index}`]: 'track_deg_true',
    [`fms_pos_track_deg_magnetic_${this.index}`]: 'track_deg_magnetic'
  } as const;

  private readonly adcDataSourceTopicMap = {
    [`fms_pos_ambient_wind_velocity_${this.index}`]: 'ambient_wind_velocity',
    [`fms_pos_ambient_wind_direction_${this.index}`]: 'ambient_wind_direction',
  } as const;

  private readonly modeTopic = `fms_pos_mode_${this.index}` as const;
  private readonly gpsIndexTopic = `fms_pos_gps_index_${this.index}` as const;
  private readonly gpsEpuTopic = `fms_pos_gps_epu_${this.index}` as const;
  private readonly adahrsEpuTopic = `fms_pos_adahrs_epu_${this.index}` as const;
  private readonly drEpuTopic = `fms_pos_dr_epu_${this.index}` as const;
  private readonly fmsEpuTopic = `fms_pos_epu_${this.index}` as const;

  private readonly dataSourceSubscriber = this.bus.getSubscriber<AdahrsSystemEvents & AdcEvents & GNSSEvents & GpsReceiverSystemEvents>();

  private readonly gpsIndex: Subscribable<number>;
  private readonly adahrsIndex: Subscribable<number>;

  private readonly dataSubs: Subscription[] = [];

  private readonly simTime = ConsumerSubject.create(this.bus.getSubscriber<ClockEvents>().on('simTime'), 0);

  private readonly gpsStateSource = ConsumerSubject.create(null, GPSSystemState.Searching);
  private readonly gpsState = Subject.create(GPSSystemState.Searching);
  private readonly gpsSbasStateSource = ConsumerSubject.create(null, GPSSystemSBASState.Inactive);
  private readonly gpsSbasState = Subject.create(GPSSystemSBASState.Inactive);

  private readonly gpsPdop = ConsumerSubject.create(null, -1);
  private readonly gpsGroundSpeed = ConsumerSubject.create(null, -1);

  private readonly adahrsTasSource = ConsumerSubject.create(null, 0);
  private readonly adahrsTas = Subject.create(0);

  private accumulatedDeadReckoningEpu = - 1;

  private mode = FmsPositionMode.None;
  private lastFixTime: number | undefined = undefined;

  /**
   * Creates an instance of an FMS geo-positioning system.
   * @param index The index of the FMS geo-positioning system.
   * @param bus An instance of the event bus.
   * @param gpsReceiverIndex The index of the GPS receiver used by this system. No GPS data will be used if the index
   * is negative.
   * @param adahrsIndex The index of the ADAHRS used by this system in dead reckoning mode to obtain heading and speed data.
   * @param powerSource The {@link ElectricalEvents} topic or electricity logic element to which to connect the
   * system's power.
   */
  constructor(
    index: number,
    bus: EventBus,
    gpsReceiverIndex: number | Subscribable<number>,
    adahrsIndex: number | Subscribable<number>,
    powerSource?: SystemPowerKey | CompositeLogicXMLElement,
  ) {
    super(index, bus, `fms_pos_state_${index}` as const);

    this.gpsIndex = SubscribableUtils.toSubscribable(gpsReceiverIndex, true);
    this.adahrsIndex = SubscribableUtils.toSubscribable(adahrsIndex, true);

    this.publisher.pub(this.modeTopic, this.mode, false, true);
    this.publisher.pub(this.gpsEpuTopic, -1, false, true);
    this.publisher.pub(this.adahrsEpuTopic, -1, false, true);
    this.publisher.pub(this.drEpuTopic, -1, false, true);
    this.publisher.pub(this.fmsEpuTopic, -1, false, true);

    if (powerSource !== undefined) {
      this.connectToPower(powerSource);
    }

    this.startDataPublish();
  }

  /**
   * Starts publishing data on the event bus.
   */
  private startDataPublish(): void {
    for (const topic of Object.keys(this.gnssDataSourceTopicMap)) {
      if (this.bus.getTopicSubscriberCount(topic) > 0) {
        this.onGnssTopicSubscribed(topic as keyof FmsPositionGNSSDataEvents);
      }
    }

    for (const topic of Object.keys(this.adcDataSourceTopicMap)) {
      if (this.bus.getTopicSubscriberCount(topic) > 0) {
        this.onAdcTopicSubscribed(topic as keyof FmsPositionAdcDataEvents);
      }
    }

    this.bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(topic => {
      if (topic in this.gnssDataSourceTopicMap) {
        this.onGnssTopicSubscribed(topic as keyof FmsPositionGNSSDataEvents);
      }

      if (topic in this.adcDataSourceTopicMap) {
        this.onAdcTopicSubscribed(topic as keyof FmsPositionAdcDataEvents);
      }
    });

    const paused = this.state === AvionicsSystemState.Failed || this.state === AvionicsSystemState.Off;

    this.dataSubs.push(this.gpsIndex.sub(index => this.publisher.pub(this.gpsIndexTopic, index, false, true), !paused, paused));

    const gpsStatePipe = this.gpsStateSource.pipe(this.gpsState, true);
    const gpsSbasStatePipe = this.gpsSbasStateSource.pipe(this.gpsSbasState, true);

    this.gpsIndex.sub(index => {
      if (index < 0) {
        this.gpsStateSource.setConsumer(null);
        gpsStatePipe.pause();
        this.gpsState.set(GPSSystemState.Searching);

        this.gpsSbasStateSource.setConsumer(null);
        gpsSbasStatePipe.pause();
        this.gpsSbasState.set(GPSSystemSBASState.Inactive);
      } else {
        this.gpsStateSource.setConsumer(this.dataSourceSubscriber.on(`gps_rec_gps_system_state_changed_${index}`));
        gpsStatePipe.resume(true);

        this.gpsSbasStateSource.setConsumer(this.dataSourceSubscriber.on(`gps_rec_gps_system_sbas_state_changed_${index}`));
        gpsSbasStatePipe.resume(true);
      }
    }, true);

    const adahrsTasPipe = this.adahrsTasSource.pipe(this.adahrsTas, true);

    this.adahrsIndex.sub(index => {
      if (index < 0) {
        this.adahrsTasSource.setConsumer(null);
        adahrsTasPipe.pause();
        this.adahrsTas.set(0);
      } else {
        this.adahrsTasSource.setConsumer(this.dataSourceSubscriber.on(`adahrs_tas_${index}`));
        adahrsTasPipe.resume(true);
      }
    }, true);

    this.dataSubs.push(this.bus.getSubscriber<ClockEvents>().on('simTime').atFrequency(10).handle(this.updatePositionUncertainty.bind(this)));

    this.dataSubs.push(this.gpsIndex.sub((index) => this.gpsPdop.setConsumer(this.dataSourceSubscriber.on(`gps_rec_gps_system_pdop_${index}`)), !paused, paused));
    this.gpsGroundSpeed.setConsumer(this.dataSourceSubscriber.on('ground_speed').withPrecision(0));
  }

  /**
   * Responds to when someone first subscribes to one of this system's GNSS-sourced data topics on the event bus.
   * @param topic The topic that was subscribed to.
   */
  private onGnssTopicSubscribed(topic: keyof FmsPositionGNSSDataEvents): void {
    const paused = this.state === AvionicsSystemState.Failed || this.state === AvionicsSystemState.Off;

    this.dataSubs.push(this.dataSourceSubscriber.on(this.gnssDataSourceTopicMap[topic]).handle(val => {
      this.publisher.pub(topic, val as any, false, true);
    }, paused));
  }

   /**
    * Responds to when someone first subscribes to one of this system's Adc-sourced data topics on the event bus.
    * @param topic The topic that was subscribed to.
    */
   private onAdcTopicSubscribed(topic: keyof FmsPositionAdcDataEvents): void {
    const paused = this.state === AvionicsSystemState.Failed || this.state === AvionicsSystemState.Off;

    this.dataSubs.push(this.dataSourceSubscriber.on(this.adcDataSourceTopicMap[topic]).handle(val => {
      this.publisher.pub(topic, val as any, false, true);
    }, paused));
  }

  /** @inheritdoc */
  protected onStateChanged(previousState: AvionicsSystemState | undefined, currentState: AvionicsSystemState): void {
    if (currentState === AvionicsSystemState.Failed || currentState === AvionicsSystemState.Off) {
      for (const sub of this.dataSubs) {
        sub.pause();
      }

      this.setMode(FmsPositionMode.None);
      this.lastFixTime = undefined;
    } else {
      for (const sub of this.dataSubs) {
        sub.resume(true);
      }
    }
  }

  /** @inheritdoc */
  public onUpdate(): void {
    super.onUpdate();

    if (this._state === AvionicsSystemState.On || this._state === undefined) {
      this.updateMode();
    }
  }

  /**
   * Updates this system's data mode.
   */
  private updateMode(): void {
    const gpsState = this.gpsState.get();

    if (gpsState === GPSSystemState.SolutionAcquired || gpsState === GPSSystemState.DiffSolutionAcquired) {
      const sbasState = this.gpsSbasState.get();
      this.setMode(sbasState === GPSSystemSBASState.Active ? FmsPositionMode.GpsSbas : FmsPositionMode.Gps);
      this.lastFixTime = this.simTime.get();
    } else if (this.lastFixTime !== undefined) {
      if (this.simTime.get() - this.lastFixTime > FmsPositionSystem.DEAD_RECKONING_EXPIRE_TIME) {
        this.setMode(FmsPositionMode.DeadReckoningExpired);
      } else {
        this.setMode(FmsPositionMode.DeadReckoning);
      }
    } else {
      this.setMode(FmsPositionMode.None);
    }
  }

  /**
   * Sets this system's data mode, and publishes the new value to the event bus if it differs from the current value.
   * @param mode The new data mode.
   */
  private setMode(mode: FmsPositionMode): void {
    if (this.mode === mode) {
      return;
    }

    this.mode = mode;
    this.publisher.pub(this.modeTopic, this.mode, false, true);
  }

  /** Update the ANP from data sources */
  private updatePositionUncertainty(): void {
    const pdop = this.gpsPdop.get();
    if (pdop >= 0 && (this.mode === FmsPositionMode.Gps || this.mode === FmsPositionMode.GpsSbas)) {
      const epu = this.calculateEpuFromPdop(pdop);

      this.publisher.pub(this.gpsEpuTopic, epu, false, true);
      this.publisher.pub(this.adahrsEpuTopic, epu, false, true);
      this.publisher.pub(this.drEpuTopic, epu, false, true);
      this.publisher.pub(this.fmsEpuTopic, epu, false, true);

      this.accumulatedDeadReckoningEpu = epu;
    } else {
      this.publisher.pub(this.gpsEpuTopic, pdop, false, true);
      this.publisher.pub(this.adahrsEpuTopic, pdop, false, true);

      this.accumulatedDeadReckoningEpu += Math.max(FmsPositionSystem.DEAD_RECKONING_MIN_TAS, this.adahrsTas.get()) * FmsPositionSystem.DEAD_RECKONING_EPU_SCALAR * 0.1;

      this.publisher.pub(this.drEpuTopic, this.accumulatedDeadReckoningEpu, false, true);
      this.publisher.pub(this.fmsEpuTopic, this.accumulatedDeadReckoningEpu, false, true);
    }
  }

  /** Calculates the ANP as the circle radius where the airplane position is estimated to be within 95% of the time.
   * Uses the statistic formula of estimating a 95% confidence interval with a (hypothetical) sample size of 1.
   * @param pdop The geometric dilution of precision computation (GDOP).
   * @returns The estimated ANP.
   */
  private calculateEpuFromPdop (pdop: number): number {
    /** In meters. Used for calculating the ANP. Sets at 222 under the assumption that airplane cruises at 800 km/h,
     * hence if gps position is updated every second, the deviation would be 222 m/s.
     * Source: https://en.wikipedia.org/wiki/Error_analysis_for_the_Global_Positioning_System */
    const STANDARD_DEVIATION_OF_USER_EQUIVALENT_RANGE_ERROR = 222;

    /** In meters. Used for calculating the ANP. Source: https://en.wikipedia.org/wiki/Error_analysis_for_the_Global_Positioning_System */
    const ESTIMATED_NUMERICAL_ERROR = 200;

    /** Used for calculating the ANP. Source: https://www.calculator.net/confidence-interval-calculator.html */
    const Z_FACTOR_OF_95_PERCENT_CONFIDENT_INTERVAL = 1.96;

    /** Used for calculating the ANP. Source: https://www.calculator.net/confidence-interval-calculator.html */
    const HYPOTHETICAL_SAMPLE_SIZE = 1;

    const STANDARD_DEVIATION_OF_ERROR_IN_ESTIMATED_RECEIVER_POS = (): number => {
      return Math.sqrt((pdop * STANDARD_DEVIATION_OF_USER_EQUIVALENT_RANGE_ERROR) ^ 2 + ESTIMATED_NUMERICAL_ERROR ^ 2);
    };

    const anpMeter = Z_FACTOR_OF_95_PERCENT_CONFIDENT_INTERVAL * STANDARD_DEVIATION_OF_ERROR_IN_ESTIMATED_RECEIVER_POS() / Math.sqrt(HYPOTHETICAL_SAMPLE_SIZE);
    return MathUtils.round(UnitType.NMILE.convertFrom(anpMeter, UnitType.METER), 0.01);
  }
}

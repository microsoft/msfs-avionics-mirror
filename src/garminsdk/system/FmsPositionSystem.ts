import {
  AvionicsSystemState, AvionicsSystemStateEvent, BasicAvionicsSystem, ClockEvents, ConsumerSubject, EventBus, EventBusMetaEvents, GNSSEvents,
  GPSSystemState, Subject, Subscribable, SubscribableUtils, Subscription, SystemPowerKey, UnitType
} from '@microsoft/msfs-sdk';
import { GpsReceiverSystemEvents } from './GpsReceiverSystem';

/**
 * FMS positioning system data modes.
 */
export enum FmsPositionMode {
  /** No position data is available. */
  None = 'None',

  /** Position data is sourced from GPS. */
  Gps = 'Gps',

  /** Position data is sourced from DME/DME. */
  Dme = 'Dme',

  /** Position data is sourced from HNS (hybrid inertial navigation). */
  Hns = 'Hns',

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
 * Events fired by the FMS geo-positioning system.
 */
export interface FmsPositionSystemEvents extends FmsPositionGNSSDataEvents {
  /** An event fired when the FMS geo-positioning system state changes. */
  [fms_pos_state_: `fms_pos_state_${number}`]: AvionicsSystemStateEvent;

  /** The current positioning mode used by the FMS geo-positioning system. */
  [fms_pos_mode_: `fms_pos_mode_${number}`]: FmsPositionMode;

  /**
   * The index of the GPS receiver currently used by the FMS geo-positioning system, or `-1` if the system is not
   * using any GPS receiver.
   */
  [fms_pos_gps_index_: `fms_pos_gps_index_${number}`]: number;

  /** The index of the HNS currently used by the FMS geo-positioning system, or `-1` if the system is not using any HNS. */
  [fms_pos_hns_index_: `fms_pos_hns_index_${number}`]: number;

  /**
   * The index of the DME/DME navigation system currently used by the FMS geo-positioning system, or `-1` if the system
   * is not using any DME/DME system.
   */
  [fms_pos_dme_index_: `fms_pos_dme_index_${number}`]: number;
}

/**
 * A Garmin FMS geo-positioning system.
 */
export class FmsPositionSystem extends BasicAvionicsSystem<FmsPositionSystemEvents> {
  private static readonly DEAD_RECKONING_EXPIRE_TIME = UnitType.MINUTE.convertTo(20, UnitType.MILLISECOND);

  protected initializationTime = 0;

  private readonly gnssDataSourceTopicMap = {
    [`fms_pos_gps-position_${this.index}`]: 'gps-position',
    [`fms_pos_ground_speed_${this.index}`]: 'ground_speed',
    [`fms_pos_track_deg_true_${this.index}`]: 'track_deg_true',
    [`fms_pos_track_deg_magnetic_${this.index}`]: 'track_deg_magnetic'
  } as const;

  private readonly modeTopic = `fms_pos_mode_${this.index}` as const;
  private readonly gpsIndexTopic = `fms_pos_gps_index_${this.index}` as const;
  private readonly hnsIndexTopic = `fms_pos_hns_index_${this.index}` as const;

  private readonly dataSourceSubscriber = this.bus.getSubscriber<GNSSEvents & GpsReceiverSystemEvents>();

  private readonly gpsIndex: Subscribable<number>;
  private readonly hnsIndex: Subscribable<number>;
  private readonly dmeIndex: Subscribable<number>;

  private readonly adcIndex: Subscribable<number>;
  private readonly ahrsIndex: Subscribable<number>;

  private readonly dataSubs: Subscription[] = [];

  private readonly simTime = ConsumerSubject.create(this.bus.getSubscriber<ClockEvents>().on('simTime'), 0);

  private readonly gpsStateSource = ConsumerSubject.create(null, GPSSystemState.Searching);
  private readonly gpsState = Subject.create(GPSSystemState.Searching);

  private mode = FmsPositionMode.None;
  private lastFixTime: number | undefined = undefined;

  /**
   * Creates an instance of an FMS geo-positioning system.
   * @param index The index of the FMS geo-positioning system.
   * @param bus An instance of the event bus.
   * @param gpsReceiverIndex The index of the GPS receiver used by this system. No GPS data will be used if the index
   * is negative.
   * @param adcIndex The index of the ADC used by this system in dead reckoning mode to obtain airspeed data.
   * @param ahrsIndex The index of the AHRS used by this system in dead reckoning mode to obtain heading data.
   * @param hnsIndex The index of the HNS used by this system. No HNS data will be used if the index is negative.
   * Defaults to `-1`.
   * @param dmeIndex The index of the DME/DME navigation system used by this system. No DME/DME data will be used if
   * the index is negative. Defaults to `-1`.
   * @param powerSource The {@link ElectricalEvents} topic or electricity logic element to which to connect the
   * system's power.
   */
  constructor(
    index: number,
    bus: EventBus,
    gpsReceiverIndex: number | Subscribable<number>,
    adcIndex: number | Subscribable<number>,
    ahrsIndex: number | Subscribable<number>,
    hnsIndex?: number | Subscribable<number>,
    dmeIndex?: number | Subscribable<number>,
    powerSource?: SystemPowerKey | CompositeLogicXMLElement,
  ) {
    super(index, bus, `fms_pos_state_${index}` as const);

    this.gpsIndex = SubscribableUtils.toSubscribable(gpsReceiverIndex, true);
    this.hnsIndex = SubscribableUtils.toSubscribable(-1, true);
    this.dmeIndex = SubscribableUtils.toSubscribable(-1, true);

    this.adcIndex = SubscribableUtils.toSubscribable(adcIndex, true);
    this.ahrsIndex = SubscribableUtils.toSubscribable(ahrsIndex, true);

    this.publisher.pub(this.modeTopic, this.mode, false, true);

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

    this.bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(topic => {
      if (topic in this.gnssDataSourceTopicMap) {
        this.onGnssTopicSubscribed(topic as keyof FmsPositionGNSSDataEvents);
      }
    });

    const paused = this.state === AvionicsSystemState.Failed || this.state === AvionicsSystemState.Off;

    this.dataSubs.push(this.gpsIndex.sub(index => this.publisher.pub(this.gpsIndexTopic, index, false, true), !paused, paused));
    this.dataSubs.push(this.hnsIndex.sub(index => this.publisher.pub(this.hnsIndexTopic, index, false, true), !paused, paused));

    const gpsStatePipe = this.gpsStateSource.pipe(this.gpsState, true);

    this.gpsIndex.sub(index => {
      if (index < 0) {
        this.gpsStateSource.setConsumer(null);
        gpsStatePipe.pause();
        this.gpsState.set(GPSSystemState.Searching);
      } else {
        this.gpsStateSource.setConsumer(this.dataSourceSubscriber.on(`gps_rec_gps_system_state_changed_${index}`));
        gpsStatePipe.resume(true);
      }
    }, true);
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
      this.setMode(FmsPositionMode.Gps);
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
}
import {
  AvionicsSystemState, AvionicsSystemStateEvent, BasicAvionicsSystem, ConsumerSubject, EventBus, GNSSEvents, GPSSatComputer, GPSSatComputerEvents,
  GPSSystemSBASState, MappedSubject, Subscription, SystemPowerKey
} from '@microsoft/msfs-sdk';

/**
 * Topics for bus events from which GPS receiver data is sourced.
 */
type GpsReceiverDataSourceTopics = `gps_system_state_changed_${number}` | `gps_system_sbas_state_changed_${number}`
  | `gps_sat_pos_calculated_${number}` | `gps_sat_state_changed_${number}`
  | `gps_system_pdop_${number}` | `gps_system_hdop_${number}` | `gps_system_vdop_${number}`;

/**
 * Data events published by the GPS receiver system sourced from GPSSatComputer.
 */
type GpsReceiverGPSSatComputerDataEvents = {
  [P in Extract<GpsReceiverDataSourceTopics, keyof GPSSatComputerEvents> as `gps_rec_${P}`]: GPSSatComputerEvents[P];
};

/**
 * Events fired by the GPS receiver system.
 */
export interface GpsReceiverSystemEvents extends GpsReceiverGPSSatComputerDataEvents {
  /** An event fired when the GPS receiver system state changes. */
  [gps_rec_state: `gps_rec_state_${number}`]: AvionicsSystemStateEvent;
}

/**
 * A Garmin GPS receiver system.
 */
export class GpsReceiverSystem extends BasicAvionicsSystem<GpsReceiverSystemEvents> {
  protected initializationTime = 0;

  private readonly cachedDataSourceTopicMap = {
    [`gps_rec_gps_system_state_changed_${this.index}`]: `gps_system_state_changed_${this.gpsSatComputer.index}`,
    [`gps_rec_gps_system_sbas_state_changed_${this.index}`]: `gps_system_sbas_state_changed_${this.gpsSatComputer.index}`
  } as const;

  private readonly uncachedDataSourceTopicMap = {
    [`gps_rec_gps_sat_state_changed_${this.index}`]: `gps_sat_state_changed_${this.gpsSatComputer.index}`,
    [`gps_rec_gps_sat_pos_calculated_${this.index}`]: `gps_sat_pos_calculated_${this.gpsSatComputer.index}`
  } as const;

  private readonly dopDataSourceTopicMap = {
    [`gps_rec_gps_system_pdop_${this.index}`]: `gps_system_pdop_${this.gpsSatComputer.index}`,
    [`gps_rec_gps_system_hdop_${this.index}`]: `gps_system_hdop_${this.gpsSatComputer.index}`,
    [`gps_rec_gps_system_vdop_${this.index}`]: `gps_system_vdop_${this.gpsSatComputer.index}`
  } as const;

  private readonly dataSourceSubscriber = this.bus.getSubscriber<GPSSatComputerEvents & GNSSEvents>();

  private readonly dataSubs: Subscription[] = [];

  private readonly dopSources: ConsumerSubject<number>[] = [];
  private readonly sbasState = ConsumerSubject.create(null, GPSSystemSBASState.Disabled);

  /**
   * Creates an instance of a GPS receiver system.
   * @param index The index of the GPS receiver.
   * @param bus An instance of the event bus.
   * @param gpsSatComputer This system's GPS computer system.
   * @param powerSource The {@link ElectricalEvents} topic or electricity logic element to which to connect the
   * system's power.
   */
  constructor(
    index: number,
    bus: EventBus,
    private readonly gpsSatComputer: GPSSatComputer,
    powerSource?: SystemPowerKey | CompositeLogicXMLElement,
  ) {
    super(index, bus, `gps_rec_state_${index}` as const);

    gpsSatComputer.init();

    if (powerSource !== undefined) {
      this.connectToPower(powerSource);
    } else if (gpsSatComputer.syncRole !== 'replica') {
      // If our power source is undefined, then the system is always considered to be in the on state. Therefore we
      // will force the GPS to immediately acquire and use all the satellites it can since a system that is always on
      // never needs to initialize.
      gpsSatComputer.acquireAndUseSatellites();
    }

    this.startDataPublish();
  }

  /**
   * Starts publishing data on the event bus.
   */
  private startDataPublish(): void {
    for (const topic of Object.keys(this.cachedDataSourceTopicMap)) {
      this.dataSubs.push(this.dataSourceSubscriber.on(this.cachedDataSourceTopicMap[topic]).handle(val => {
        this.publisher.pub(topic as keyof GpsReceiverGPSSatComputerDataEvents, val as any, false, true);
      }));
    }

    for (const topic of Object.keys(this.uncachedDataSourceTopicMap)) {
      this.dataSubs.push(this.dataSourceSubscriber.on(this.uncachedDataSourceTopicMap[topic]).handle(val => {
        this.publisher.pub(topic as keyof GpsReceiverGPSSatComputerDataEvents, val as any, false, false);
      }));
    }

    // Garmin seems to halve DOP values when SBAS is active. It could be a trainer-specific behavior, but in the
    // absence of any other information, we will implement it here.

    this.sbasState.setConsumer(this.dataSourceSubscriber.on(`gps_system_sbas_state_changed_${this.gpsSatComputer.index}`));

    for (const topic of Object.keys(this.dopDataSourceTopicMap)) {
      const dopSource = ConsumerSubject.create(this.dataSourceSubscriber.on(this.dopDataSourceTopicMap[topic]), -1);
      this.dopSources.push(dopSource);

      const processedDop = MappedSubject.create(
        ([dop, sbasState]) => dop <= 0 ? dop : dop * (sbasState === GPSSystemSBASState.Active ? 0.5 : 1),
        dopSource,
        this.sbasState
      );

      this.dataSubs.push(processedDop.sub(dop => {
        this.publisher.pub(topic as keyof GpsReceiverGPSSatComputerDataEvents, dop, false, false);
      }, true));
    }
  }

  /** @inheritdoc */
  protected onStateChanged(previousState: AvionicsSystemState | undefined, currentState: AvionicsSystemState): void {
    // If this is the first time we are setting our state and the state is on, then we assume that the system was on at
    // flight load, in which case we will force the GPS to immediately acquire and use all the satellites it can so
    // that we don't force people to wait for satellite acquisition when loading onto the runway/in the air.
    if (previousState === undefined && currentState === AvionicsSystemState.On && this.gpsSatComputer.syncRole !== 'replica') {
      this.gpsSatComputer.acquireAndUseSatellites();
    }

    // Reset the GPS sat computer if the system is not operating and its receiver is not a replica (a replica receiver
    // will get the reset command from its primary).
    if ((currentState === AvionicsSystemState.Failed || currentState === AvionicsSystemState.Off) && this.gpsSatComputer.syncRole !== 'replica') {
      this.gpsSatComputer.reset();
    }
  }

  /** @inheritdoc */
  public onUpdate(): void {
    super.onUpdate();

    if (this._state === AvionicsSystemState.On || this._state === undefined) {
      this.gpsSatComputer.onUpdate();
    }
  }
}

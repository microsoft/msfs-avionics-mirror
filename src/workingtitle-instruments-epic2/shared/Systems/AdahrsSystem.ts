import {
  AdcEvents, AhrsEvents, AircraftInertialEvents, AvionicsSystemState, AvionicsSystemStateEvent, BaseAdcEvents, BaseAhrsEvents, BasicAvionicsSystem, EventBus,
  EventBusMetaEvents, Subscribable, Subscription, SystemPowerKey
} from '@microsoft/msfs-sdk';

export enum AdahrsSystemChannel {
  A = 1,
  B = 2,
}

/** Topics sourced from the SDK ADC. */
type AdahrsAdcDataSourceTopics = 'ias' | 'tas' | 'mach_number'
  | 'pressure_alt' | 'vertical_speed' | 'ambient_temp_c' | 'ambient_pressure_inhg';

/**
 * Data events sourced from the SDK ADC.
 */
type AdahrsAdcDataEvents = {
  [P in keyof Pick<BaseAdcEvents, AdahrsAdcDataSourceTopics> as `adahrs_${P}_${number}`]: BaseAdcEvents[P];
};

/** Baro correced altimeter topics sourced from the SDK ADC. */
type AdahrsAdcBaroCorrectionDataSourceTopics = 'indicated_alt' | 'altimeter_baro_setting_inhg' | 'altimeter_baro_is_std';

/**
 * Baro correced altimeter events sourced from the SDK ADC for the left side.
 */
type AdahrsAdcLeftDataEvents = {
  [P in keyof Pick<BaseAdcEvents, AdahrsAdcBaroCorrectionDataSourceTopics> as `adahrs_left_${P}_${number}`]: BaseAdcEvents[P];
};

/**
 * Baro correced altimeter events sourced from the SDK ADC for the right side.
 */
type AdahrsAdcRightDataEvents = {
  [P in keyof Pick<BaseAdcEvents, AdahrsAdcBaroCorrectionDataSourceTopics> as `adahrs_right_${P}_${number}`]: BaseAdcEvents[P];
};

/** Topics sourced from the SDK AHRS. */
type AdahrsAhrsDataSourceTopics = 'actual_hdg_deg' | 'actual_hdg_deg_true' | 'actual_pitch_deg' | 'actual_roll_deg' | 'delta_heading_rate';

/**
 * Data events sourced from the SDK AHRS.
 */
type AdahrsAhrsDataEvents = {
  [P in keyof Pick<BaseAhrsEvents, AdahrsAhrsDataSourceTopics> as `adahrs_${P}_${number}`]: BaseAhrsEvents[P];
};

/** Topics sourced from the SDK AircraftPublisher. */
type AdahrsAircraftIntertialDataSourceTopics = 'acceleration_body_x' | 'acceleration_body_y' | 'acceleration_body_z' | 'rotation_velocity_body_x' | 'rotation_velocity_body_y' | 'rotation_velocity_body_z';

/**
 * Data events sourced from the SDK AHRS.
 */
type AdahrsAircraftInertialDataEvents = {
  [P in keyof Pick<AircraftInertialEvents, AdahrsAircraftIntertialDataSourceTopics> as `adahrs_${P}_${number}`]: AircraftInertialEvents[P];
};

/** Data source events. */
type AdahrsSourceEvents = AdcEvents & AhrsEvents & AircraftInertialEvents;

// TODO need Vmo

/** Data events published by each ADAHRS channel. */
type AdahrsDataEvents = AdahrsAdcDataEvents & AdahrsAdcLeftDataEvents & AdahrsAdcRightDataEvents & AdahrsAhrsDataEvents & AdahrsAircraftInertialDataEvents;

/** ADAHRS channel system events. */
export interface AdahrsSystemEvents extends AdahrsDataEvents {
  [adahrs_state: `adahrs_state_${number}`]: AvionicsSystemStateEvent;
  /** Static port data is valid. */
  [adahrs_altitude_data_valid: `adahrs_altitude_data_valid_${number}`]: boolean;
  /** Static and pitot data is valid. */
  [adahrs_speed_data_valid: `adahrs_speed_data_valid_${number}`]: boolean;
  /** Accelerometer data is valid. */
  [adahrs_attitude_data_valid: `adahrs_attitude_data_valid_${number}`]: boolean;
  /** Heading data is valid. */
  [adahrs_heading_data_valid: `adahrs_heading_data_valid_${number}`]: boolean;
  /** Magnetic heading data is available. Substituted with true heading when not available. */
  [adahrs_mag_data_available: `adahrs_mag_data_available_${number}`]: boolean;
}

/** An Air Data Attitude Heading Reference System representing one channel of a dual-channel KSG 7200. */
export class AdahrsSystem extends BasicAvionicsSystem<AdahrsSystemEvents> {
  protected initializationTime = 15000;

  private isAdmPowered = false;

  private readonly attitudeDataValidTopic = `adahrs_attitude_data_valid_${this.index}` as const;
  private readonly altitudeDataValidTopic = `adahrs_altitude_data_valid_${this.index}` as const;
  private readonly speedDataValidTopic = `adahrs_speed_data_valid_${this.index}` as const;
  private readonly headingDataValidTopic = `adahrs_heading_data_valid_${this.index}` as const;
  private readonly magDataAvailableTopic = `adahrs_mag_data_available_${this.index}` as const;

  private readonly dataSourceTopicMap: Record<keyof AdahrsDataEvents, keyof AdahrsSourceEvents> = {
    [`adahrs_ias_${this.index}`]: `ias_${this.airspeedIndex}`,
    [`adahrs_tas_${this.index}`]: `tas_${this.airspeedIndex}`,
    [`adahrs_mach_number_${this.index}`]: 'mach_number',
    [`adahrs_left_indicated_alt_${this.index}`]: `indicated_alt_${this.leftAltimeterIndex}`,
    [`adahrs_right_indicated_alt_${this.index}`]: `indicated_alt_${this.rightAltimeterIndex}`,
    [`adahrs_pressure_alt_${this.index}`]: 'pressure_alt',
    [`adahrs_vertical_speed_${this.index}`]: 'vertical_speed',
    [`adahrs_left_altimeter_baro_setting_inhg_${this.index}`]: `altimeter_baro_setting_inhg_${this.leftAltimeterIndex}`,
    [`adahrs_right_altimeter_baro_setting_inhg_${this.index}`]: `altimeter_baro_setting_inhg_${this.rightAltimeterIndex}`,
    [`adahrs_left_altimeter_baro_is_std_${this.index}`]: `altimeter_baro_is_std_${this.leftAltimeterIndex}`,
    [`adahrs_right_altimeter_baro_is_std_${this.index}`]: `altimeter_baro_is_std_${this.rightAltimeterIndex}`,
    [`adahrs_ambient_temp_c_${this.index}`]: 'ambient_temp_c',
    [`adahrs_ambient_pressure_inhg_${this.index}`]: 'ambient_pressure_inhg',

    [`adahrs_actual_hdg_deg_${this.index}`]: 'actual_hdg_deg',
    [`adahrs_actual_hdg_deg_true_${this.index}`]: 'actual_hdg_deg_true',
    [`adahrs_actual_pitch_deg_${this.index}`]: 'actual_pitch_deg',
    [`adahrs_actual_roll_deg_${this.index}`]: 'actual_roll_deg',
    [`adahrs_delta_heading_rate_${this.index}`]: 'delta_heading_rate',

    [`adahrs_acceleration_body_x_${this.index}`]: 'acceleration_body_x',
    [`adahrs_acceleration_body_y_${this.index}`]: 'acceleration_body_y',
    [`adahrs_acceleration_body_z_${this.index}`]: 'acceleration_body_z',
    [`adahrs_rotation_velocity_body_x_${this.index}`]: 'rotation_velocity_body_x',
    [`adahrs_rotation_velocity_body_y_${this.index}`]: 'rotation_velocity_body_y',
    [`adahrs_rotation_velocity_body_z_${this.index}`]: 'rotation_velocity_body_z',
  } as const;

  private readonly dataSourceSubscriber = this.bus.getSubscriber<AdcEvents & AhrsEvents & AircraftInertialEvents>();

  private readonly dataSubs: Subscription[] = [];

  /**
   * Ctor.
   * @param index Channel of this ADAHRS.
   * @param bus The instrument event bus.
   * @param leftAltimeterIndex The MSFS altimeter to use for the captain side on this ADAHRS channel.
   * @param rightAltimeterIndex The MSFS altimeter to use for the first officer side on this ADAHRS channel.
   * @param airspeedIndex The MSFS airspeed indicator to use for this ADAHRS channel.
   * @param gpsReceiverIndex The selected GPS receiver for this ADAHRS channel.
   * @param headingOverride Whether to manually override the magnetic heading with GPS track.
   * @param powerSource The power source for this ADAHRS channel (essential bus for channel A, normal bus for channel B).
   * @param admPowerSource The power source for the ADM
   */
  constructor(
    public readonly index: AdahrsSystemChannel,
    protected readonly bus: EventBus,
    protected readonly leftAltimeterIndex: number,
    protected readonly rightAltimeterIndex: number,
    protected readonly airspeedIndex: number,
    private readonly gpsReceiverIndex: Subscribable<number>,
    private readonly headingOverride?: Subscribable<boolean>,
    powerSource?: SystemPowerKey | CompositeLogicXMLElement,
    private readonly admPowerSource?: CompositeLogicXMLElement,
  ) {
    super(index, bus, `adahrs_state_${index}` as `adahrs_state_${number}`);

    this.publisher.pub(this.speedDataValidTopic, true, false, true);
    this.publisher.pub(this.altitudeDataValidTopic, true, false, true);
    this.publisher.pub(this.attitudeDataValidTopic, true, false, true);
    this.publisher.pub(this.headingDataValidTopic, true, false, true);
    this.publisher.pub(this.magDataAvailableTopic, true, false, true);

    if (powerSource) {
      this.connectToPower(powerSource);
    }

    this.startDataPublish();

    // TODO heading to come from GPS track when heading override active, or in weak mag field
  }

  /** @inheritdoc */
  public onUpdate(): void {
    super.onUpdate();

    if (this.admPowerSource) {
      this.isAdmPowered = this.admPowerSource.getValue() !== 0;
    } else {
      this.isAdmPowered = this.isPowered ?? true;
    }

    this.publisher.pub(this.speedDataValidTopic, this.isAdmPowered, false);
  }

  /**
   * Starts publishing ADC data on the event bus.
   */
  private startDataPublish(): void {
    for (const topic of Object.keys(this.dataSourceTopicMap)) {
      if (this.bus.getTopicSubscriberCount(topic) > 0) {
        this.onTopicSubscribed(topic as keyof AdahrsDataEvents);
      }
    }

    this.bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(topic => {
      if (topic in this.dataSourceTopicMap) {
        this.onTopicSubscribed(topic as keyof AdahrsDataEvents);
      }
    });
  }

  /**
   * Responds to when someone first subscribes to one of this system's data topics on the event bus.
   * @param topic The topic that was subscribed to.
   */
  private onTopicSubscribed(topic: keyof AdahrsDataEvents): void {
    const paused = this.state !== undefined && this.state !== AvionicsSystemState.On;

    this.dataSubs.push(this.dataSourceSubscriber.on(this.dataSourceTopicMap[topic]).handle(val => {
      this.publisher.pub(topic, val, false, true);
    }, paused));
  }

  /** @inheritdoc */
  protected onStateChanged(previousState: AvionicsSystemState | undefined, currentState: AvionicsSystemState): void {
    if (currentState === AvionicsSystemState.On) {
      for (const sub of this.dataSubs) {
        sub.resume(true);
      }

      this.publisher.pub(this.speedDataValidTopic, this.isAdmPowered, false, true);
      this.publisher.pub(this.altitudeDataValidTopic, true, false, true);
      this.publisher.pub(this.attitudeDataValidTopic, true, false, true);
      this.publisher.pub(this.headingDataValidTopic, true, false, true);
    } else {
      for (const sub of this.dataSubs) {
        sub.pause();
      }

      this.publisher.pub(this.speedDataValidTopic, false, false, true);
      this.publisher.pub(this.altitudeDataValidTopic, false, false, true);
      this.publisher.pub(this.attitudeDataValidTopic, false, false, true);
      this.publisher.pub(this.headingDataValidTopic, false, false, true);
    }
  }
}

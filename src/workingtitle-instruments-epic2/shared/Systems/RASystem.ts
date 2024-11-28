import {
  AdcEvents, AhrsEvents, AvionicsSystemState, AvionicsSystemStateEvent, BasicAvionicsSystem, ConsumerSubject, EventBus, EventBusMetaEvents, MappedSubject,
  ReadonlyFloat64Array, Subject, Subscription, SystemPowerKey, UnitType
} from '@microsoft/msfs-sdk';

/**
 * The Radio Altimeter system.
 */
export class RASystem extends BasicAvionicsSystem<RASystemEvents> {
  protected initializationTime = 7000;
  private radioAltSub?: Subscription;
  private readonly radioAltValid = Subject.create(true);

  private readonly rawRadioAlt = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('radio_alt'), 0).pause();
  private readonly pitch = ConsumerSubject.create(this.bus.getSubscriber<AhrsEvents>().on('pitch_deg'), 0).pause();

  private readonly antennaOffsetTheta = Math.atan2(this.radioAltOffset[1], this.radioAltOffset[2]);
  private readonly antennaOffsetMagnitude = Math.sqrt(this.radioAltOffset[1] * this.radioAltOffset[1] + this.radioAltOffset[2] * this.radioAltOffset[2]);

  private readonly radioAltCorrected = MappedSubject.create(
    ([rawAlt, pitch]) => {
      // we assume that the antenna is close to the centreline and ignore roll correction
      const theta = Math.PI / 2 + pitch * Avionics.Utils.DEG2RAD - this.antennaOffsetTheta;
      const raOffset = this.measurementOffset + this.antennaOffsetMagnitude * Math.cos(theta);
      return rawAlt + UnitType.FOOT.convertFrom(raOffset, UnitType.METER);
    },
    this.rawRadioAlt,
    this.pitch,
  );

  /**
   * Creates an instance of the RASystem.
   * @param index The index of the system.
   * @param bus The instance of the event bus for the system to use.
   * @param radioAltOffset The radio altimeter antenna offset from the MSFS aircraft origin in [x, y, z] metres.
   * @param measurementOffset The offset to apply to the final measurement in metres.
   * @param powerSource The power source.
   */
  constructor(
    public readonly index: number,
    protected readonly bus: EventBus,
    private readonly radioAltOffset: ReadonlyFloat64Array,
    private readonly measurementOffset: number,
    protected readonly powerSource?: SystemPowerKey | CompositeLogicXMLElement,
  ) {
    super(index, bus, `ra_state_${index}` as const);

    const radioAltTopic = `ra_radio_alt_${this.index}`;
    const radioAltValidTopic = `ra_radio_alt_valid_${this.index}` as keyof RASystemEvents;

    if (this.bus.getTopicSubscriberCount(radioAltTopic) > 0) {
      this.onRadioAltTopicSubscribed();
    }

    this.radioAltValid.sub((v) => this.publisher.pub(radioAltValidTopic, v, false, true), true);

    this.bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(topic => {
      if (topic === radioAltTopic) {
        this.onRadioAltTopicSubscribed();
      }
    });

    if (powerSource !== undefined) {
      this.connectToPower(powerSource);
    }
  }

  /**
   * Responds to when someone first subscribes to this system's radar altitude data topic on the event bus.
   */
  private onRadioAltTopicSubscribed(): void {
    const topic = `ra_radio_alt_${this.index}` as const;
    const paused = this.state === AvionicsSystemState.Failed || this.state === AvionicsSystemState.Off;

    this.radioAltSub = this.radioAltCorrected.sub(val => {
      this.publisher.pub(topic, val);
    }, paused);
    if (!paused) {
      this.rawRadioAlt.resume();
      this.pitch.resume();
    }
  }

  /** @inheritdoc */
  protected onStateChanged(previousState: AvionicsSystemState | undefined, currentState: AvionicsSystemState): void {
    if (currentState === AvionicsSystemState.Failed || currentState === AvionicsSystemState.Off) {
      this.radioAltSub?.pause();
      this.rawRadioAlt.pause();
      this.pitch.pause();
      this.radioAltValid.set(false);
    } else {
      this.radioAltSub?.resume(true);
      this.rawRadioAlt.resume();
      this.pitch.resume();
      this.radioAltValid.set(true);
    }
  }
}

/**
 * Events fired by the RA system.
 */
export interface RASystemEvents {
  /** An event fired when the radar altimeter system state changes. */
  [ra_state: `ra_state_${number}`]: AvionicsSystemStateEvent;

  /** The radar altitude, in feet, or `NaN` if there is no valid radar altitude. */
  [ra_radio_alt: `ra_radio_alt_${number}`]: number;

  /** Whether the radio altitude is valid. */
  [ra_radio_alt_valid: `ra_radio_alt_valid_${number}`]: boolean;
}

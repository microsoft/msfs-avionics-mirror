import { AdcEvents, AvionicsSystemState, AvionicsSystemStateEvent, BasicAvionicsSystem, EventBus, Subscription, SystemPowerKey } from 'msfssdk';

/**
 * Events fired by the radar altimeter system.
 */
export interface RadarAltimeterSystemEvents {
  /** An event fired when the radar altimeter system state changes. */
  [radaralt_state: `radaralt_state_${number}`]: AvionicsSystemStateEvent;

  /** The radar altitude, in feet, or `NaN` if there is no valid radar altitude. */
  [radaralt_radio_alt: `radaralt_radio_alt_${number}`]: number;
}

/**
 * A Garmin GRA 55(00) radar altimeter system.
 */
export class RadarAltimeterSystem extends BasicAvionicsSystem<RadarAltimeterSystemEvents> {
  private readonly radioAltSub: Subscription;

  /**
   * Creates an instance of an ADC system.
   * @param index The index of the ADC.
   * @param bus An instance of the event bus.
   * @param powerSource The {@link ElectricalEvents} topic or electricity logic element to which to connect the
   * system's power.
   */
  constructor(
    index: number,
    bus: EventBus,
    powerSource?: SystemPowerKey | CompositeLogicXMLElement
  ) {
    super(index, bus, `radaralt_state_${index}` as const);

    const sub = this.bus.getSubscriber<AdcEvents>();
    const pub = this.bus.getPublisher<RadarAltimeterSystemEvents>();
    const paused = this.state === AvionicsSystemState.Failed || this.state === AvionicsSystemState.Off;

    this.radioAltSub = sub.on('radio_alt').handle(radarAlt => { pub.pub(`radaralt_radio_alt_${this.index}`, radarAlt); }, paused);

    if (powerSource !== undefined) {
      this.connectToPower(powerSource);
    }
  }

  /** @inheritdoc */
  protected onStateChanged(previousState: AvionicsSystemState | undefined, currentState: AvionicsSystemState): void {
    if (currentState === AvionicsSystemState.Failed || currentState === AvionicsSystemState.Off) {
      this.radioAltSub.pause();
    } else {
      this.radioAltSub.resume(true);
    }
  }
}
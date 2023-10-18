import {
  AvionicsSystemPowerEvents, AvionicsSystemState, AvionicsSystemStateEvent, BasicAvionicsSystem, EventBus, Subscribable, Subscription,
  SystemPowerKey
} from '@microsoft/msfs-sdk';

/**
 * Events fired by the weather radar avionics system.
 */
export interface WeatherRadarAvionicsSystemEvents {
  /** An event fired when the weather radar system state changes. */
  wx_radar_state: AvionicsSystemStateEvent;
}

/**
 * A Garmin weather radar avionics system.
 */
export class WeatherRadarAvionicsSystem extends BasicAvionicsSystem<WeatherRadarAvionicsSystemEvents> {
  protected isActivePowered: boolean | undefined;

  protected electricalActivePowerSub?: Subscription;
  protected electricalActivePowerLogic?: CompositeLogicXMLElement;

  /**
   * Creates an instance of a weather radar avionics system.
   * @param bus An instance of the event bus.
   * @param powerSource The {@link AvionicsSystemPowerEvents} topic or electricity logic element to which to connect
   * the system's power.
   * @param activePowerSource The {@link AvionicsSystemPowerEvents} topic or electricity logic element to which to
   * connect the system's power when radar is actively scanning. If defined, then the system will enter the failed
   * state if the radar is actively scanning and the active radar power source is unpowered.
   * @param isRadarScanActive Whether the weather radar is actively scanning. Ignored if {@linkcode activePowerSource}
   * is not defined.
   * @param initializationTime The time required for the system to initialize, in milliseconds. Defaults to 0.
   */
  constructor(
    bus: EventBus,
    powerSource?: SystemPowerKey | CompositeLogicXMLElement,
    activePowerSource?: SystemPowerKey | CompositeLogicXMLElement,
    protected readonly isRadarScanActive?: Subscribable<boolean>,
    initializationTime = 0
  ) {
    super(1, bus, 'wx_radar_state');

    this.initializationTime = initializationTime;

    if (powerSource !== undefined) {
      this.connectToPower(powerSource);
    }

    if (activePowerSource !== undefined) {
      this.connectToActivePower(activePowerSource);
    }
  }

  /** @inheritdoc */
  protected onPowerValid(): void {
    super.onPowerValid();

    this.electricalActivePowerSub?.resume(true);
    this.isRadarScanActive?.sub(this.onRadarScanActiveChanged.bind(this));
  }

  /**
   * Connects this system's active radar power state to an {@link AvionicsSystemPowerEvents} topic or electricity logic
   * element.
   * @param source The source to which to connect this system's active radar power state.
   */
  protected connectToActivePower(source: SystemPowerKey | CompositeLogicXMLElement): void {
    this.electricalActivePowerSub?.destroy();
    this.electricalActivePowerSub = undefined;
    this.electricalActivePowerLogic = undefined;

    if (typeof source === 'string') {
      this.electricalActivePowerSub = this.bus.getSubscriber<AvionicsSystemPowerEvents>()
        .on(source)
        .whenChanged()
        .handle(this.onActivePowerChanged.bind(this), !this.isPowerValid);
    } else {
      this.electricalActivePowerLogic = source;
      this.updatePowerFromLogic();
    }
  }

  /** @inheritdoc */
  protected onPowerChanged(isPowered: boolean): void {
    const wasPowered = this.isPowered;

    this.isPowered = isPowered;

    if (wasPowered === undefined) {
      this.initializationTimer.clear();
      if (isPowered) {
        this.updateStateFromActivePower();
      } else {
        this.setState(AvionicsSystemState.Off);
      }
    } else {
      if (isPowered) {
        this.setState(AvionicsSystemState.Initializing);
        this.initializationTimer.schedule(this.updateStateFromActivePower.bind(this), this.initializationTime);
      } else {
        this.initializationTimer.clear();
        this.setState(AvionicsSystemState.Off);
      }
    }
  }

  /**
   * A callback called when the connected active radar power state of the avionics system changes.
   * @param isPowered Whether or not the system is powered.
   */
  protected onActivePowerChanged(isPowered: boolean): void {
    this.isActivePowered = isPowered;
    if (this._state !== AvionicsSystemState.Off && this._state !== AvionicsSystemState.Initializing) {
      this.updateStateFromActivePower();
    }
  }

  /**
   * Responds to when whether the radar is actively scanning changes.
   */
  protected onRadarScanActiveChanged(): void {
    if (this._state !== AvionicsSystemState.Off && this._state !== AvionicsSystemState.Initializing) {
      this.updateStateFromActivePower();
    }
  }

  /**
   * Updates this system's state from its active radar power state and whether the radar is actively scanning.
   */
  protected updateStateFromActivePower(): void {
    if (!this.isRadarScanActive || !this.isRadarScanActive.get() || this.isActivePowered === undefined || this.isActivePowered) {
      this.setState(AvionicsSystemState.On);
    } else {
      this.setState(AvionicsSystemState.Failed);
    }
  }

  /** @inheritdoc */
  public onUpdate(): void {
    super.onUpdate();

    this.updateActivePowerFromLogic();
  }

  /**
   * Updates this system's active radar power state from an electricity logic element.
   */
  protected updateActivePowerFromLogic(): void {
    if (!this.isPowerValid || this.electricalActivePowerLogic === undefined) {
      return;
    }

    const isPowered = this.electricalActivePowerLogic.getValue() !== 0;
    if (isPowered !== this.isActivePowered) {
      this.onActivePowerChanged(isPowered);
    }
  }
}
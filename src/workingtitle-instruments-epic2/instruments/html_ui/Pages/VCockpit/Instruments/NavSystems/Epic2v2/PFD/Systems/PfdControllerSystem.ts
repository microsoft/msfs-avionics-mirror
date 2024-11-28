import {
  AvionicsSystemState, AvionicsSystemStateEvent, BasicAvionicsSystem, ConsumerSubject, EventBus, HEvent, Subject, SystemPowerKey
} from '@microsoft/msfs-sdk';

import { DisplayUnitIndices } from '@microsoft/msfs-epic2-shared';

/** PFD controller sytem events. */
export interface PfdControllerSystemEvents {
  /** The PFD actively controlled by this controller, or none. */
  [pfd_controller_active_pfd: `pfd_controller_active_pfd_${number}`]: DisplayUnitIndices | null;
  /** An event fired when the PFD controller system state changes. */
  [pfd_controller_state: `pfd_controller_state_${number}`]: AvionicsSystemStateEvent;
}

/** A PFD controller system. */
export class PfdControllerSystem extends BasicAvionicsSystem<PfdControllerSystemEvents> {
  protected initializationTime = 2000;

  private readonly sub = this.bus.getSubscriber<HEvent & PfdControllerSystemEvents>();
  private readonly systemPublisher = this.bus.getPublisher<PfdControllerSystemEvents>();

  private readonly onsidePfdDuIndex: DisplayUnitIndices = this.index === 2 ? DisplayUnitIndices.PfdRight : DisplayUnitIndices.PfdLeft;
  private readonly offsidePfdDuIndex: DisplayUnitIndices = this.index === 2 ? DisplayUnitIndices.PfdLeft : DisplayUnitIndices.PfdRight;
  private readonly offsideControllerIndex = this.index === 2 ? 1 : 2;
  private readonly offsideControlEventName = `pfd_controller_active_pfd_${this.offsideControllerIndex}` as `pfd_controller_active_pfd_${number}`;
  private readonly onsideControlEventName = `pfd_controller_active_pfd_${this.index}` as `pfd_controller_active_pfd_${number}`;
  private readonly onSideSwapEventName = `PFDCTRL_${this.index}_PFD`;

  private readonly activePfd = Subject.create<DisplayUnitIndices | null>(this.onsidePfdDuIndex);
  private readonly offsideActivePfd = ConsumerSubject.create(this.sub.on(this.offsideControlEventName), null);

  /**
   * Creates an instance of the PFD controller system.
   * @param index The index of the system.
   * @param bus The instance of the event bus for the system to use.
   * @param powerSource The {@link ElectricalEvents} topic or electricity logic element to which to connect the
   * system's power.
   */
  constructor(
    public readonly index: 1 | 2,
    protected readonly bus: EventBus,
    powerSource?: SystemPowerKey | CompositeLogicXMLElement
  ) {
    super(index, bus, `pfd_controller_state_${index}` as const);

    if (powerSource !== undefined) {
      this.connectToPower(powerSource);
    }

    this.sub.on('hEvent').handle(this.onHEvent.bind(this));
    this.offsideActivePfd.sub(this.onOffsideControllerPfdChanged.bind(this), true);

    this.activePfd.sub((v) => this.systemPublisher.pub(this.onsideControlEventName, v, true, true), true);
  }

  /**
   * Handles H events.
   * @param eventName The H event name.
   */
  private onHEvent(eventName: string): void {
    if (this.state !== AvionicsSystemState.On && this.state !== undefined) {
      return;
    }

    if (eventName === this.onSideSwapEventName) {
      const activePfd = this.activePfd.get();
      if (activePfd === this.onsidePfdDuIndex) {
        // we should now control the offside PFD
        this.activePfd.set(this.offsidePfdDuIndex);
      } else {
        this.activePfd.set(this.onsidePfdDuIndex);
      }
    }
  }

  /**
   * Handles the offside PFD controller changing it's controlled PFD.
   * @param newPfdDu The PFD now controlled by the offside controller.
   */
  private onOffsideControllerPfdChanged(newPfdDu: DisplayUnitIndices | null): void {
    if (newPfdDu === this.activePfd.get()) {
      // the offside controller is taking control of our PFD
      this.activePfd.set(null);
    }
  }

  /** @inheritdoc */
  protected onStateChanged(previousState: AvionicsSystemState | undefined, currentState: AvionicsSystemState): void {
    if (currentState === AvionicsSystemState.On || undefined) {
      // swap to onside PFD on power up
      this.activePfd.set(this.onsidePfdDuIndex);
    } else {
      // we don't control anything when powered off
      this.activePfd.set(null);
    }
  }
}

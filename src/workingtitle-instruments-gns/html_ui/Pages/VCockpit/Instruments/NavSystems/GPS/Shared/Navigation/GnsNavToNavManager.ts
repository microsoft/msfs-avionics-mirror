import { CdiControlEvents, CdiEvents, CdiUtils, ConsumerSubject, EventBus, MappedSubject, NavSourceId, NavSourceType, Subject, Subscribable, Subscription } from '@microsoft/msfs-sdk';

import { GarminNavToNavComputer } from '@microsoft/msfs-garminsdk';

/**
 * A manager that executes automatic CDI source switching from GPS to VLOC.
 */
export class GnsNavToNavManager {
  private readonly cdiSrcSetTopic: `cdi_src_set${'' | `_${string}`}`;

  private readonly cdiSource = ConsumerSubject.create<Readonly<NavSourceId> | undefined>(null, undefined);

  private readonly _isCdiSwitchInProgress = Subject.create(false);
  /** Whether an automatic CDI source switch is currently in progress. */
  public readonly isCdiSwitchInProgress = this._isCdiSwitchInProgress as Subscribable<boolean>;

  private readonly cdiSwitchStartSub: Subscription;
  private readonly cdiSwitchEndSub: Subscription;

  /**
   * Creates a new instance of GnsNavToNavManager.
   * @param cdiId The ID of the CDI controlled by the manager.
   * @param bus The event bus.
   * @param computer The computer from which to source nav-to-nav guidance data.
   */
  public constructor(cdiId: string, private readonly bus: EventBus, private readonly computer: GarminNavToNavComputer) {
    const cdiTopicSuffix = CdiUtils.getEventBusTopicSuffix(cdiId);

    this.cdiSrcSetTopic = `cdi_src_set${cdiTopicSuffix}`;

    this.cdiSource.setConsumer(bus.getSubscriber<CdiEvents>().on(`cdi_select${cdiTopicSuffix}`));

    this.cdiSwitchStartSub = MappedSubject.create(this.cdiSource, computer.canSwitchCdi).sub(this.tryStartCdiSwitch.bind(this), true);
    this.cdiSwitchEndSub = this.cdiSource.sub(this.completeCdiSwitch.bind(this), false, true);
  }

  /**
   * Tries to start an automatic CDI source switch from GPS to VLOC.
   */
  private tryStartCdiSwitch(): void {
    const navRadioIndex = this.computer.armableNavRadioIndex.get();
    if (this.cdiSource.get()?.type === NavSourceType.Gps && this.computer.canSwitchCdi.get() && navRadioIndex !== -1) {
      this._isCdiSwitchInProgress.set(true);

      this.cdiSwitchStartSub.pause();
      this.cdiSwitchEndSub.resume();
      this.bus.getPublisher<CdiControlEvents>().pub(this.cdiSrcSetTopic, { type: NavSourceType.Nav, index: navRadioIndex }, true, false);
    }
  }

  /**
   * Completes an automatic CDI source switch from GPS to VLOC.
   */
  private completeCdiSwitch(): void {
    if (this.cdiSource.get()?.type === NavSourceType.Nav) {
      this._isCdiSwitchInProgress.set(false);

      this.cdiSwitchEndSub.pause();
      this.cdiSwitchStartSub.resume();
    }
  }
}
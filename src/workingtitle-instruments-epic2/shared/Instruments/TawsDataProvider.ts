import { ConsumerSubject, EventBus, Instrument, Subscribable, Subscription } from '@microsoft/msfs-sdk';

import { GpwsEvents } from '../GPWS';

/** A taws data provider. */
export interface TawsDataProvider {
  /** Whether steep approach mode is active */
  steepApproachActive: Subscribable<boolean>
}

/** An implementation of the taws data provider. */
export class DefaultTawsDataProvider implements TawsDataProvider, Instrument {
  private readonly _steepApproachActive = ConsumerSubject.create<boolean>(null, false);
  public readonly steepApproachActive = this._steepApproachActive as Subscribable<boolean>;

  private readonly pausable: Subscription[] = [
  ];

  /**
   * Ctor.
   * @param bus The instrument event bus.
   */
  constructor(
    private readonly bus: EventBus
  ) {
    const sub = this.bus.getSubscriber<GpwsEvents>();

    this._steepApproachActive.setConsumer(sub.on('gpws_steep_approach_mode'));
  }

  /** @inheritdoc */
  public init(): void {
    this.resume();
  }

  /** @inheritdoc */
  public onUpdate(): void {
    // noop
  }

  /** Pause the data provider. */
  public pause(): void {
    for (const sub of this.pausable) {
      sub.pause();
    }
  }

  /** Resume the data provider. */
  public resume(): void {
    for (const sub of this.pausable) {
      sub.resume(true);
    }
  }
}

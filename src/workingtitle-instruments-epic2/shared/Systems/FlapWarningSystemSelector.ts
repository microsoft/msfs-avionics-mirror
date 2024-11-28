import {
  ClockEvents, ConsumerSubject, EventBus, SetSubject, Subject, Subscribable, SubscribableSet, SubscribableSetEventType, Subscription
} from '@microsoft/msfs-sdk';

import { FlapWarningSystemEvents } from './FlapWarningSystem';

/** Automatically selects the best flap warning system. */
export class FlapWarningSystemSelector {
  private readonly _selectedIndex = Subject.create(-1);
  public readonly selectedIndex = this._selectedIndex as Subscribable<number>;
  private readonly isFlapDataValid = Subject.create(false);

  private readonly candidateSystemIndexes: SubscribableSet<number>;

  private readonly flapSystemEntries = new Map<number, ConsumerSubject<boolean>>();

  private needReselect = true;

  private isAlive = true;
  private isInit = false;

  private candidateSystemIndexesSub?: Subscription;
  private systemPrioritiesSub?: Subscription;
  private updateSub?: Subscription;

  /**
   * Ctor
   * @param index The index of this selector.
   * @param bus The instrument event bus.
   * @param candidateSystemIndexes The indexes of the flap warning systems from which to select.
   */
  constructor(
    private readonly index: number,
    private readonly bus: EventBus,
    candidateSystemIndexes: Iterable<number> | SubscribableSet<number>,
  ) {
    this.candidateSystemIndexes = 'isSubscribableSet' in candidateSystemIndexes ? candidateSystemIndexes : SetSubject.create(candidateSystemIndexes);
  }

  /**
   * Initializes this selector. Once initialized, this selector will automatically select the best ADC among its
   * candidates.
   * @throws Error if this selector has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('FlapWarningSystemSelector: cannot initialize a dead selector');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<ClockEvents & FlapWarningSystemEvents>();

    const scheduleReselect = (): void => { this.needReselect = true; };

    this.candidateSystemIndexesSub = this.candidateSystemIndexes.sub((set, type, key) => {
      const existing = this.flapSystemEntries.get(key);
      if (existing) {
        existing.destroy();
      }

      if (type === SubscribableSetEventType.Added) {
        const entry = ConsumerSubject.create(sub.on(`flap_warn_valid_${key}`), false);
        this.flapSystemEntries.set(key, entry);

        // When there is a change in an system state, we don't reselect immediately because the system could be in an
        // intermediate transition state. Instead, we will schedule a reselect during the next update loop.
        entry.sub(scheduleReselect);
      } else {
        this.flapSystemEntries.delete(key);
      }

      this.needReselect = true;
    }, true);

    this.updateSub = sub.on('realTime').handle(this.update.bind(this));
  }

  /**
   * Updates this selector.
   */
  private update(): void {
    if (this.needReselect) {
      this.selectIndex();
      this.needReselect = false;
    }
  }

  /**
   * Selects the index of the ADC with the most desirable state.
   */
  private selectIndex(): void {
    let bestIndex = -1;
    let bestState = false;

    if (this.flapSystemEntries.size === 0) {
      bestIndex = -1;
      bestState = false;
    } else if (this.flapSystemEntries.size === 1) {
      const entry = this.flapSystemEntries.entries().next().value as [number, Subscribable<boolean>];
      bestIndex = entry[0];
      bestState = entry[1].get();
    } else {
      // find the first one that's valid
      for (const entry of this.flapSystemEntries.entries()) {
        const index = entry[0];
        const state = entry[1].get();
        if (state) {
          bestIndex = index;
          bestState = state;
          break;
        }
      }
    }

    this._selectedIndex.set(bestIndex);
    if (bestState) {
      this.isFlapDataValid.set(bestState);
    } else {
      this.isFlapDataValid.set(false);
    }
  }

  /**
   * Destroys this selector.
   */
  public destroy(): void {
    this.isAlive = false;

    this.updateSub?.destroy();

    for (const entry of this.flapSystemEntries.values()) {
      entry.destroy();
    }

    this.candidateSystemIndexesSub?.destroy();
    this.systemPrioritiesSub?.destroy();
  }
}

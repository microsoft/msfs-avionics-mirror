import {
  ClockEvents, ConsumerSubject, EventBus, MapSubject, SetSubject, Subject, Subscribable, SubscribableMap, SubscribableSet, SubscribableSetEventType,
  Subscription
} from '@microsoft/msfs-sdk';

import { AoaSystemEvents } from './AoaSystem';

/** Events related to AOA system selection. */
export interface AoaSystemSelectorEvents {
  /** The index of the selected AOA with the most desirable state, or `-1` if a system could not be selected. */
  [aoa_selector_selected_index: `aoa_selector_selected_index_${number}`]: number;

  /** Whether the selected AOA is providing valid AOA data. */
  [aoa_selector_aoa_data_valid: `aoa_selector_aoa_data_valid_${number}`]: boolean;
}

/** Automatically selects the best AOA system. */
export class AoaSystemSelector {
  private readonly publisher = this.bus.getPublisher<AoaSystemSelectorEvents>();

  private readonly _selectedIndex = Subject.create(-1);
  public readonly selectedIndex = this._selectedIndex as Subscribable<number>;
  private readonly isAoaDataValid = Subject.create(false);

  private readonly candidateSystemIndexes: SubscribableSet<number>;
  private readonly systemPriorities: SubscribableMap<number, number>;

  private readonly aoaEntries = new Map<number, ConsumerSubject<boolean>>();

  private readonly aoaOrder: number[] = [];
  private readonly aoaComparator = (a: number, b: number): number => {
    return (this.systemPriorities.getValue(b) ?? 0) - (this.systemPriorities.getValue(a) ?? 0);
  };

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
   * @param candidateSystemIndexes The indexes of the AOA systems from which to select.
   * @param systemPriorities The priorities for selecting individual AOA systems. If two systems have the same
   * desirability, then the one with the higher priority will be selected. If a system's priority is not defined, then
   * it will default to a value of `0`. The priorities can be specified as an array of AOA system indexes or a map of
   * AOA system indexes to the priorities for selecting those systems. If specified as an array of indexes, then each
   * system whose index appears in the array will be assigned a priority equal to
   * `array.length - array.indexOf(index)`.
   */
  constructor(
    private readonly index: number,
    private readonly bus: EventBus,
    candidateSystemIndexes: Iterable<number> | SubscribableSet<number>,
    systemPriorities?: readonly number[] | ReadonlyMap<number, number> | SubscribableMap<number, number>,
  ) {
    this.candidateSystemIndexes = 'isSubscribableSet' in candidateSystemIndexes ? candidateSystemIndexes : SetSubject.create(candidateSystemIndexes);

    if (systemPriorities) {
      if ('isSubscribableMap' in systemPriorities) {
        this.systemPriorities = systemPriorities;
      } else if (systemPriorities instanceof Map) {
        this.systemPriorities = MapSubject.create(systemPriorities);
      } else {
        this.systemPriorities = MapSubject.create((systemPriorities as readonly number[]).map((aoaIndex, arrayIndex, array) => [aoaIndex, array.length - arrayIndex]));
      }
    } else {
      this.systemPriorities = MapSubject.create();
    }

    // Set up publishing.
    this.selectedIndex.sub(this.publisher.pub.bind(this.publisher, `aoa_selector_selected_index_${index}`), true);
    this.isAoaDataValid.sub(this.publisher.pub.bind(this.publisher, `aoa_selector_aoa_data_valid_${index}`), true);
  }

  /**
   * Initializes this selector. Once initialized, this selector will automatically select the best ADC among its
   * candidates.
   * @throws Error if this selector has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('AdcSystemSelector: cannot initialize a dead selector');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<AoaSystemEvents & ClockEvents>();

    const scheduleReselect = (): void => { this.needReselect = true; };

    this.candidateSystemIndexesSub = this.candidateSystemIndexes.sub((set, type, key) => {
      const existing = this.aoaEntries.get(key);
      if (existing) {
        existing.destroy();
      }

      if (type === SubscribableSetEventType.Added) {
        const entry = ConsumerSubject.create(sub.on(`aoa_data_valid_${key}`), false);
        this.aoaEntries.set(key, entry);

        // When there is a change in an AOA state, we don't reselect immediately because the AOA could be in an
        // intermediate transition state. Instead, we will schedule a reselect during the next update loop.
        entry.sub(scheduleReselect);
      } else {
        this.aoaEntries.delete(key);
      }

      this.needReselect = true;
    }, true);

    this.systemPrioritiesSub = this.systemPriorities.sub(scheduleReselect);

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
    let bestIndex: number;
    let bestState: boolean | undefined;

    if (this.aoaEntries.size === 0) {
      bestIndex = -1;
      bestState = undefined;
    } else if (this.aoaEntries.size === 1) {
      const entry = this.aoaEntries.entries().next().value as [number, Subscribable<boolean>];
      bestIndex = entry[0];
      bestState = entry[1].get();
    } else {
      // Sort the systems in order of decreasing priority.
      this.aoaOrder.length = 0;
      for (const index of this.aoaEntries.keys()) {
        this.aoaOrder.push(index);
      }
      this.aoaOrder.sort(this.aoaComparator);

      bestIndex = -1;

      for (let i = 0; i < this.aoaOrder.length; i++) {
        const index = this.aoaOrder[i];
        const state = this.aoaEntries.get(index)?.get() ?? false;
        if (!bestState && state) {
          bestIndex = index;
          bestState = state;
          break;
        }
      }
    }

    this._selectedIndex.set(bestIndex);
    if (bestState) {
      this.isAoaDataValid.set(bestState);
    } else {
      this.isAoaDataValid.set(false);
    }
  }

  /**
   * Destroys this selector.
   */
  public destroy(): void {
    this.isAlive = false;

    this.updateSub?.destroy();

    for (const entry of this.aoaEntries.values()) {
      entry.destroy();
    }

    this.candidateSystemIndexesSub?.destroy();
    this.systemPrioritiesSub?.destroy();
  }
}

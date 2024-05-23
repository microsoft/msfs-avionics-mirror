import {
  ClockEvents, ConsumerSubject, EventBus, GPSSystemState, MapSubject, MappedSubject, SetSubject, Subject, Subscribable,
  SubscribableMap, SubscribableSet, SubscribableSetEventType, SubscribableUtils, Subscription
} from '@microsoft/msfs-sdk';

import { GpsReceiverSystemEvents } from '../system/GpsReceiverSystem';

/**
 * The state of a GPS receiver used for selection.
 */
export type GpsReceiverSelectionState = readonly [
  systemState: GPSSystemState,
  pdop: number,
  hdop: number,
  vdop: number
];

/**
 * Configuration options for {@link GpsReceiverSelector}.
 */
export type GpsReceiverSelectorOptions = {
  /**
   * The priorities for selecting individual GPS receivers. If two receivers have the same desirability, then the one
   * with the higher priority will be selected. If a receiver's priority is not defined, then it will default to a
   * value of `0`. The priorities can be specified as an array of GPS receiver indexes or a map of GPS receiver indexes
   * to the priorities for selecting those receivers. If specified as an array of indexes, then each receiver whose
   * index appears in the array will be assigned a priority equal to `array.length - array.indexOf(index)`.
   */
  receiverPriorities?: readonly number[] | ReadonlyMap<number, number> | SubscribableMap<number, number>;

  /**
   * A function that compares the desirability of two GPS receivers. If not defined, then a set of default criteria
   * will be used to compare desirability.
   * @param a The state of the first GPS receiver.
   * @param b The state of the second GPS receiver.
   * @returns A number representing the relative desirability of the two GPS receivers: negative if receiver `a` is
   * more desirable than `b`, positive if receiver `b` is more desirable than `a`, and `0` if both are equally
   * desirable.
   */
  desirabilityComparator?: (a: GpsReceiverSelectionState, b: GpsReceiverSelectionState) => number;
};

/**
 * An entry for a candidate GPS receiver for selection.
 */
type GpsReceiverEntry = {
  /** An array of ConsumerSubjects tracking the state of the candidate receiver. */
  subjects: readonly ConsumerSubject<any>[];

  /** The state of the candidate receiver. */
  state: Subscribable<GpsReceiverSelectionState>;
};

/**
 * Automatically selects the best GPS receiver from a set of candidates based on the current states of all receivers.
 * Receivers that have computed a 3D position solution with differential corrections are favored over those that have
 * computed a 3D solution without corrections, and either of these are favored over those that have not computed any
 * position solution.
 */
export class GpsReceiverSelector {

  private readonly candidateReceiverIndexes: SubscribableSet<number>;
  private readonly receiverPriorities: SubscribableMap<number, number>;

  private readonly _selectedIndex = Subject.create(-1);
  public readonly selectedIndex = this._selectedIndex as Subscribable<number>;

  private readonly receiverEntries = new Map<number, GpsReceiverEntry>();

  private readonly receiverOrder: number[] = [];
  private readonly receiverPriorityComparator = (a: number, b: number): number => {
    return (this.receiverPriorities.getValue(b) ?? 0) - (this.receiverPriorities.getValue(a) ?? 0);
  };

  private readonly desirabilityComparator: (a: GpsReceiverSelectionState, b: GpsReceiverSelectionState) => number;

  private needReselect = true;

  private isAlive = true;
  private isInit = false;

  private candidateReceiverIndexesSub?: Subscription;
  private preferredReceiverIndexSub?: Subscription;
  private receiverPrioritiesSub?: Subscription;
  private updateSub?: Subscription;

  /**
   * Creates a new instance of GpsReceiverSelector.
   * @param bus The event bus.
   * @param candidateReceiverIndexes The indexes of the GPS receivers from which to select.
   * @param options Options with which to configure the selector.
   */
  public constructor(
    bus: EventBus,
    candidateReceiverIndexes: Iterable<number> | SubscribableSet<number>,
    options?: Readonly<GpsReceiverSelectorOptions>
  );
  /**
   * Creates a new instance of GpsReceiverSelector.
   * @param bus The event bus.
   * @param candidateReceiverIndexes The indexes of the GPS receivers from which to select.
   * @param preferredReceiverIndex The index of this selector's preferred GPS receiver, or `-1` if there is no such
   * receiver. This selector is guaranteed to select the preferred GPS receiver if its state is at least as desirable
   * as the state of all other receivers from which to select. Defaults to `-1`.
   */
  public constructor(
    bus: EventBus,
    candidateReceiverIndexes: Iterable<number> | SubscribableSet<number>,
    preferredReceiverIndex?: number | Subscribable<number>
  );
  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(
    private readonly bus: EventBus,
    candidateReceiverIndexes: Iterable<number> | SubscribableSet<number>,
    arg3?: Readonly<GpsReceiverSelectorOptions> | number | Subscribable<number>
  ) {
    this.candidateReceiverIndexes = 'isSubscribableSet' in candidateReceiverIndexes ? candidateReceiverIndexes : SetSubject.create(candidateReceiverIndexes);

    let options: Readonly<GpsReceiverSelectorOptions> | undefined;
    if (typeof arg3 === 'number' || SubscribableUtils.isSubscribable(arg3)) {
      let receiverPriorities: readonly number[] | SubscribableMap<number, number>;
      if (typeof arg3 === 'number') {
        receiverPriorities = [arg3];
      } else {
        const map = receiverPriorities = MapSubject.create<number, number>();
        this.preferredReceiverIndexSub = arg3.sub(index => {
          map.clear();
          map.setValue(index, 1);
        }, true);
      }

      options = { receiverPriorities };
    } else {
      options = arg3;
    }

    if (options?.receiverPriorities) {
      if ('isSubscribableMap' in options.receiverPriorities) {
        this.receiverPriorities = options.receiverPriorities;
      } else if (options.receiverPriorities instanceof Map) {
        this.receiverPriorities = MapSubject.create(options.receiverPriorities);
      } else {
        this.receiverPriorities = MapSubject.create((options.receiverPriorities as readonly number[]).map((adcIndex, arrayIndex, array) => [adcIndex, array.length - arrayIndex]));
      }
    } else {
      this.receiverPriorities = MapSubject.create();
    }

    this.desirabilityComparator = options?.desirabilityComparator ?? GpsReceiverSelector.defaultDesirabilityComparator;
  }

  /**
   * Initializes this selector. Once initialized, this selector will automatically select the best GPS receiver among
   * its candidates.
   * @throws Error if this selector has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('GpsReceiverSelector: cannot initialize a dead selector');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<GpsReceiverSystemEvents & ClockEvents>();

    const scheduleReselect = (): void => { this.needReselect = true; };

    this.candidateReceiverIndexesSub = this.candidateReceiverIndexes.sub((set, type, key) => {
      const existing = this.receiverEntries.get(key);
      if (existing) {
        for (const subject of existing.subjects) {
          subject.destroy();
        }
      }

      if (type === SubscribableSetEventType.Added) {
        const subjects = [
          ConsumerSubject.create(sub.on(`gps_rec_gps_system_state_changed_${key}`), GPSSystemState.Acquiring),
          ConsumerSubject.create(sub.on(`gps_rec_gps_system_pdop_${key}`), -1),
          ConsumerSubject.create(sub.on(`gps_rec_gps_system_hdop_${key}`), -1),
          ConsumerSubject.create(sub.on(`gps_rec_gps_system_vdop_${key}`), -1)
        ] as const;
        const entry: GpsReceiverEntry = {
          subjects,
          state: MappedSubject.create(...subjects)
        };

        this.receiverEntries.set(key, entry);

        // When there is a change in a receiver state, we don't reselect immediately because the receiver could be in
        // an intermediate transition state. Instead, we will schedule a reselect during the next update loop.
        entry.state.sub(scheduleReselect);
      } else {
        this.receiverEntries.delete(key);
      }

      this.needReselect = true;
    }, true);

    this.receiverPrioritiesSub = this.receiverPriorities.sub(scheduleReselect);

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
   * Selects the index of the GPS receiver with the most desirable state.
   */
  private selectIndex(): void {
    let bestIndex: number;
    let bestState: GpsReceiverSelectionState | undefined;

    if (this.receiverEntries.size === 0) {
      bestIndex = -1;
      bestState = undefined;
    } else if (this.receiverEntries.size === 1) {
      const entry = this.receiverEntries.entries().next().value as [number, GpsReceiverEntry];
      bestIndex = entry[0];
      bestState = entry[1].state.get();
    } else {
      // Sort the systems in order of decreasing priority.
      this.receiverOrder.length = 0;
      for (const index of this.receiverEntries.keys()) {
        this.receiverOrder.push(index);
      }
      this.receiverOrder.sort(this.receiverPriorityComparator);

      bestIndex = -1;

      for (let i = 0; i < this.receiverOrder.length; i++) {
        const index = this.receiverOrder[i];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const state = this.receiverEntries.get(index)!.state.get();
        if (!bestState || this.desirabilityComparator(state, bestState) < 0) {
          bestIndex = index;
          bestState = state;
        }
      }
    }

    this._selectedIndex.set(bestIndex);
  }

  /**
   * Destroys this selector.
   */
  public destroy(): void {
    this.isAlive = false;

    this.updateSub?.destroy();

    for (const entry of this.receiverEntries.values()) {
      for (const subject of entry.subjects) {
        subject.destroy();
      }
    }

    this.candidateReceiverIndexesSub?.destroy();
    this.preferredReceiverIndexSub?.destroy();
    this.receiverPrioritiesSub?.destroy();
  }

  private static readonly GPS_STATE_PRIORITIES = {
    [GPSSystemState.DiffSolutionAcquired]: 0,
    [GPSSystemState.SolutionAcquired]: 1,
    [GPSSystemState.Acquiring]: 2,
    [GPSSystemState.Searching]: 2
  };

  /**
   * A function that compares the desirability of two GPS receivers using a set of default criteria. A receiver is
   * deemed more desirable than another if and only if its system state is located higher than the other's state in the
   * following hierarchy:
   * 1. `GPSSystemState.DiffSolutionAcquired`
   * 2. `GPSSystemState.SolutionAcquired`
   * 3. `GPSSystemState.Acquiring` / `GPSSystemState.Searching`
   * @param a The state of the first GPS receiver.
   * @param b The state of the second GPS receiver.
   * @returns A number representing the relative desirability of the two GPS receivers: negative if receiver `a` is
   * more desirable than `b`, positive if receiver `b` is more desirable than `a`, and `0` if both are equally
   * desirable.
   */
  private static defaultDesirabilityComparator(a: GpsReceiverSelectionState, b: GpsReceiverSelectionState): number {
    return GpsReceiverSelector.GPS_STATE_PRIORITIES[a[0]] - GpsReceiverSelector.GPS_STATE_PRIORITIES[b[0]];
  }
}
import {
  ClockEvents, ConsumerSubject, EventBus, MapSubject, MappedSubject, SetSubject, Subject, Subscribable,
  SubscribableMap, SubscribableSet, SubscribableSetEventType, Subscription
} from '@microsoft/msfs-sdk';

import { AhrsSystemEvents } from './AhrsSystem';

/**
 * The state of an AHRS used for selection.
 */
export type AhrsSystemSelectionState = readonly [
  isAttitudeDataValid: boolean,
  isHeadingDataValid: boolean
];

/**
 * Configuration options for {@link AhrsSystemSelector}.
 */
export type AhrsSystemSelectorOptions = {
  /**
   * The priorities for selecting individual AHRS systems. If two systems have the same desirability, then the one with
   * the higher priority will be selected. If a system's priority is not defined, then it will default to a value of
   * `0`. The priorities can be specified as an array of AHRS system indexes or a map of AHRS system indexes to the
   * priorities for selecting those systems. If specified as an array of indexes, then each system whose index appears
   * in the array will be assigned a priority equal to `array.length - array.indexOf(index)`.
   */
  systemPriorities?: readonly number[] | ReadonlyMap<number, number> | SubscribableMap<number, number>;

  /**
   * A function that compares the desirability of two AHRS systems.
   * @param a The state of the first AHRS system.
   * @param b The state of the second AHRS system.
   * @returns A number representing the relative desirability of the two AHRS systems: `-1` if system `a` is more
   * desirable than `b`, `1` if system `b` is more desirable than `a`, and `0` if both are equally desirable.
   */
  desirabilityComparator?: (a: AhrsSystemSelectionState, b: AhrsSystemSelectionState) => number;
};

/**
 * An entry for a candidate AHRS for selection.
 */
type AhrsSystemEntry = {
  /** An array of ConsumerSubjects tracking the state of the candidate AHRS. */
  subjects: readonly ConsumerSubject<any>[];

  /** The state of the candidate AHRS. */
  state: Subscribable<AhrsSystemSelectionState>;
};

/**
 * Automatically selects the best AHRS from a set of candidates based on the current states of all systems. System state
 * desiribility depends on whether it is providing valid airspeed and altitude data.
 */
export class AhrsSystemSelector {
  private readonly candidateSystemIndexes: SubscribableSet<number>;
  private readonly systemPriorities: SubscribableMap<number, number>;

  private readonly _selectedIndex = Subject.create(-1);
  /** The index of the selected AHRS, or `-1` if one could not be selected. */
  public readonly selectedIndex = this._selectedIndex as Subscribable<number>;

  private readonly _isSelectedAttitudeDataValid = Subject.create(false);
  /** Whether the selected AHRS is providing valid attitude data. */
  public readonly isSelectedAttitudeDataValid = this._isSelectedAttitudeDataValid as Subscribable<boolean>;

  private readonly _isSelectedHeadingDataValid = Subject.create(false);
  /** Whether the selected AHRS is providing valid heading data. */
  public readonly isSelectedHeadingDataValid = this._isSelectedHeadingDataValid as Subscribable<boolean>;

  private readonly adcEntries = new Map<number, AhrsSystemEntry>();

  private readonly ahrsOrder: number[] = [];
  private readonly ahrsPriorityComparator = (a: number, b: number): number => {
    return (this.systemPriorities.getValue(b) ?? 0) - (this.systemPriorities.getValue(a) ?? 0);
  };

  private readonly desirabilityComparator: (a: AhrsSystemSelectionState, b: AhrsSystemSelectionState) => number;

  private needReselect = true;

  private isAlive = true;
  private isInit = false;

  private candidateSystemIndexesSub?: Subscription;
  private systemPrioritiesSub?: Subscription;
  private updateSub?: Subscription;

  /**
   * Creates a new instance of AhrsSystemSelector.
   * @param bus The event bus.
   * @param candidateSystemIndexes The indexes of the AHRS systems from which to select.
   * @param options Options with which to configure the selector.
   */
  public constructor(
    private readonly bus: EventBus,
    candidateSystemIndexes: Iterable<number> | SubscribableSet<number>,
    options?: Readonly<AhrsSystemSelectorOptions>
  ) {
    this.candidateSystemIndexes = 'isSubscribableSet' in candidateSystemIndexes ? candidateSystemIndexes : SetSubject.create(candidateSystemIndexes);

    if (options?.systemPriorities) {
      if ('isSubscribableMap' in options.systemPriorities) {
        this.systemPriorities = options.systemPriorities;
      } else if (options.systemPriorities instanceof Map) {
        this.systemPriorities = MapSubject.create(options.systemPriorities);
      } else {
        this.systemPriorities = MapSubject.create((options.systemPriorities as readonly number[]).map((ahrsIndex, arrayIndex, array) => [ahrsIndex, array.length - arrayIndex]));
      }
    } else {
      this.systemPriorities = MapSubject.create();
    }

    this.desirabilityComparator = options?.desirabilityComparator ?? AhrsSystemSelector.defaultDesirabilityComparator;
  }

  /**
   * Initializes this selector. Once initialized, this selector will automatically select the best AHRS among its
   * candidates.
   * @throws Error if this selector has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('AhrsSystemSelector: cannot initialize a dead selector');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<AhrsSystemEvents & ClockEvents>();

    const scheduleReselect = (): void => { this.needReselect = true; };

    this.candidateSystemIndexesSub = this.candidateSystemIndexes.sub((set, type, key) => {
      const existing = this.adcEntries.get(key);
      if (existing) {
        for (const subject of existing.subjects) {
          subject.destroy();
        }
      }

      if (type === SubscribableSetEventType.Added) {
        const subjects = [
          ConsumerSubject.create(sub.on(`ahrs_attitude_data_valid_${key}`), false),
          ConsumerSubject.create(sub.on(`ahrs_heading_data_valid_${key}`), false)
        ] as const;
        const entry: AhrsSystemEntry = {
          subjects,
          state: MappedSubject.create(...subjects)
        };

        this.adcEntries.set(key, entry);

        // When there is a change in an ADC state, we don't reselect immediately because the ADC could be in an
        // intermediate transition state. Instead, we will schedule a reselect during the next update loop.
        entry.state.sub(scheduleReselect);
      } else {
        this.adcEntries.delete(key);
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
    let bestState: AhrsSystemSelectionState | undefined;

    if (this.adcEntries.size === 0) {
      bestIndex = -1;
      bestState = undefined;
    } else if (this.adcEntries.size === 1) {
      const entry = this.adcEntries.entries().next().value as [number, AhrsSystemEntry];
      bestIndex = entry[0];
      bestState = entry[1].state.get();
    } else {
      // Sort the systems in order of decreasing priority.
      this.ahrsOrder.length = 0;
      for (const index of this.adcEntries.keys()) {
        this.ahrsOrder.push(index);
      }
      this.ahrsOrder.sort(this.ahrsPriorityComparator);

      bestIndex = -1;

      for (let i = 0; i < this.ahrsOrder.length; i++) {
        const index = this.ahrsOrder[i];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const state = this.adcEntries.get(index)!.state.get();
        if (!bestState || this.desirabilityComparator(state, bestState) < 0) {
          bestIndex = index;
          bestState = state;
        }
      }
    }

    this._selectedIndex.set(bestIndex);
    if (bestState) {
      this._isSelectedAttitudeDataValid.set(bestState[0]);
      this._isSelectedHeadingDataValid.set(bestState[1]);
    } else {
      this._isSelectedAttitudeDataValid.set(false);
      this._isSelectedHeadingDataValid.set(false);
    }
  }

  /**
   * Destroys this selector.
   */
  public destroy(): void {
    this.isAlive = false;

    this.updateSub?.destroy();

    for (const entry of this.adcEntries.values()) {
      for (const subject of entry.subjects) {
        subject.destroy();
      }
    }

    this.candidateSystemIndexesSub?.destroy();
    this.systemPrioritiesSub?.destroy();
  }

  /**
   * A function that compares the desirability of two AHRS systems using a set of default criteria. Systems are
   * assigned one point for each set of valid data they provide: attitude and heading. A system is deemed more
   * desirable than another if and only if the former is assigned more points than the latter.
   * @param a The state of the first AHRS system.
   * @param b The state of the second AHRS system.
   * @returns A number representing the relative desirability of the two ADC systems: `-1` if system `a` is more
   * desirable than `b`, `1` if system `b` is more desirable than `a`, and `0` if both are equally desirable.
   */
  private static defaultDesirabilityComparator(a: AhrsSystemSelectionState, b: AhrsSystemSelectionState): number {
    return (b[0] ? 1 : 0) + (b[1] ? 1 : 0)
      - (a[0] ? 1 : 0) + (a[1] ? 1 : 0);
  }
}
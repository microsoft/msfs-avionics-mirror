/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  ClockEvents, ConsumerSubject, EventBus, MappedSubject, MapSubject, SetSubject, Subject, Subscribable, SubscribableMap, SubscribableSet,
  SubscribableSetEventType, Subscription
} from '@microsoft/msfs-sdk';

import { AdahrsSystemEvents } from './AdahrsSystem';
import { Epic2PfdControlEvents } from '../Misc';

/**
 * Events related to ADAHRS system selection.
 */
export interface AdahrsSystemSelectorEvents {
  /** The index of the selected ADC with the most desirable state, or `-1` if a system could not be selected. */
  [adahrs_selector_index: `adahrs_selector_selected_index_${number}`]: number;

  /** Whether the selected ADAHRS is providing valid airspeed data. */
  [adahrs_selector_speed_data_valid: `adahrs_selector_speed_data_valid_${number}`]: boolean;

  /** Whether the selected ADAHRS is providing valid altitude data. */
  [adahrs_selector_altitude_data_valid: `adahrs_selector_altitude_data_valid_${number}`]: boolean;

  /** Whether the selected ADAHRS is providing valid attitude data. */
  [adahrs_selector_attitude_data_valid: `adahrs_selector_attitude_data_valid_${number}`]: boolean;
}

/**
 * The state of an ADAHRS.
 */
type AdahrsSystemState = readonly [
  isSpeedDataValid: boolean,
  isAltitudeDataValid: boolean,
  isAttitudeDataValid: boolean,
];

/**
 * An entry for a candidate ADAHRS.
 */
type AdahrsSystemEntry = {
  /** An array of ConsumerSubjects tracking the state of the candidate ADC. */
  subjects: readonly ConsumerSubject<any>[];

  /** The state of the candidate ADAHRS. */
  state: Subscribable<AdahrsSystemState>;
};

/**
 * Automatically selects the best ADAHRS from a set of candidates based on the current states of all systems. System state
 * desiribility depends on whether it is providing valid airspeed and altitude data.
 */
export class AdahrsSystemSelector {

  private readonly publisher = this.bus.getPublisher<AdahrsSystemSelectorEvents>();

  private readonly candidateSystemIndexes: SubscribableSet<number>;
  private readonly systemPriorities: SubscribableMap<number, number>;

  public readonly selectedIndex = Subject.create(-1);
  private readonly isSpeedDataValid = Subject.create(false);
  private readonly isAltitudeDataValid = Subject.create(false);
  private readonly isAttitudeDataValid = Subject.create(false);

  private readonly adahrsEntries = new Map<number, AdahrsSystemEntry>();

  private readonly adahrsOrder: number[] = [];
  private readonly adahrsComparator = (a: number, b: number): number => {
    return (this.systemPriorities.getValue(b) ?? 0) - (this.systemPriorities.getValue(a) ?? 0);
  };

  private readonly adahrsStateComparator: (a: AdahrsSystemState, b: AdahrsSystemState) => number;

  private needReselect = true;

  private isAlive = true;
  private isInit = false;

  private candidateSystemIndexesSub?: Subscription;
  private systemPrioritiesSub?: Subscription;
  private updateSub?: Subscription;

  // TODO manual selection from `pfd_control_adahrs_push` for PFDs

  /**
   * Constructor.
   * @param index The index of this selector.
   * @param bus The event bus.
   * @param candidateSystemIndexes The indexes of the ADC systems from which to select.
   * @param systemPriorities The priorities for selecting individual ADC systems. If two systems have the same
   * desirability, then the one with the higher priority will be selected. If a system's priority is not defined, then
   * it will default to a value of `0`. The priorities can be specified as an array of ADC system indexes or a map of
   * ADC system indexes to the priorities for selecting those systems. If specified as an array of indexes, then each
   * system whose index appears in the array will be assigned a priority equal to
   * `array.length - array.indexOf(index)`.
   * @param dataBias Whether to bias system desirability toward valid airspeed data, valid altitude data, or neither.
   * Defaults to `'none'`.
   * @param manualSelection Whether the ADAHRS should be selected manually (by PFD controller events).
   */
  public constructor(
    private readonly index: number,
    private readonly bus: EventBus,
    candidateSystemIndexes: Iterable<number> | SubscribableSet<number>,
    systemPriorities?: readonly number[] | ReadonlyMap<number, number> | SubscribableMap<number, number>,
    dataBias?: 'none' | 'airspeed' | 'altitude' | 'airspeed-only' | 'altitude-only',
    private manualSelection?: boolean,
  ) {
    this.candidateSystemIndexes = 'isSubscribableSet' in candidateSystemIndexes ? candidateSystemIndexes : SetSubject.create(candidateSystemIndexes);

    if (systemPriorities) {
      if ('isSubscribableMap' in systemPriorities) {
        this.systemPriorities = systemPriorities;
      } else if (systemPriorities instanceof Map) {
        this.systemPriorities = MapSubject.create(systemPriorities);
      } else {
        this.systemPriorities = MapSubject.create((systemPriorities as readonly number[]).map((adcIndex, arrayIndex, array) => [adcIndex, array.length - arrayIndex]));
      }
    } else {
      this.systemPriorities = MapSubject.create();
    }

    // FIXME consider attitude data as well
    switch (dataBias) {
      case 'airspeed':
        this.adahrsStateComparator = (a, b) => (Number(b[0]) * 1.5 + Number(b[1])) - (Number(a[0]) * 1.5 + Number(a[1]));
        break;
      case 'airspeed-only':
        this.adahrsStateComparator = (a, b) => Number(b[0]) - Number(a[0]);
        break;
      case 'altitude':
        this.adahrsStateComparator = (a, b) => (Number(b[0]) + Number(b[1]) * 1.5) - (Number(a[0]) + Number(a[1]) * 1.5);
        break;
      case 'altitude-only':
        this.adahrsStateComparator = (a, b) => Number(b[1]) - Number(a[1]);
        break;
      default:
        this.adahrsStateComparator = (a, b) => (Number(b[0]) + Number(b[1])) - (Number(a[0]) + Number(a[1]));
    }

    // Set up publishing.
    this.selectedIndex.sub(this.publisher.pub.bind(this.publisher, `adahrs_selector_selected_index_${index}`), true);
    this.isSpeedDataValid.sub(this.publisher.pub.bind(this.publisher, `adahrs_selector_speed_data_valid_${index}`), true);
    this.isAltitudeDataValid.sub(this.publisher.pub.bind(this.publisher, `adahrs_selector_altitude_data_valid_${index}`), true);
    this.isAttitudeDataValid.sub(this.publisher.pub.bind(this.publisher, `adahrs_selector_attitude_data_valid_${index}`), true);

    if (manualSelection) {
      this.bus.getSubscriber<Epic2PfdControlEvents>().on('pfd_control_adahrs_push').handle(this.onManualSelection.bind(this));
    }
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

    const sub = this.bus.getSubscriber<AdahrsSystemEvents & ClockEvents>();

    const scheduleReselect = (): void => { this.needReselect = true; };

    this.candidateSystemIndexesSub = this.candidateSystemIndexes.sub((set, type, key) => {
      const existing = this.adahrsEntries.get(key);
      if (existing) {
        for (const subject of existing.subjects) {
          subject.destroy();
        }
      }

      if (type === SubscribableSetEventType.Added) {
        const subjects = [
          ConsumerSubject.create(sub.on(`adahrs_speed_data_valid_${key}`), false),
          ConsumerSubject.create(sub.on(`adahrs_altitude_data_valid_${key}`), false),
          ConsumerSubject.create(sub.on(`adahrs_attitude_data_valid_${key}`), false),
        ] as const;
        const entry: AdahrsSystemEntry = {
          subjects,
          state: MappedSubject.create(...subjects)
        };

        this.adahrsEntries.set(key, entry);

        // When there is a change in an ADC state, we don't reselect immediately because the ADC could be in an
        // intermediate transition state. Instead, we will schedule a reselect during the next update loop.
        entry.state.sub(scheduleReselect);
      } else {
        this.adahrsEntries.delete(key);
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
   * @param newManualIndex New manual index if this.manualSelection is true and a new selection is desired.
   */
  private selectIndex(newManualIndex?: number): void {
    let bestIndex: number;
    let bestState: AdahrsSystemState | undefined;

    if (this.adahrsEntries.size === 0) {
      bestIndex = -1;
      bestState = undefined;
    } else if (this.adahrsEntries.size === 1) {
      const entry = this.adahrsEntries.entries().next().value as [number, AdahrsSystemEntry];
      bestIndex = entry[0];
      bestState = entry[1].state.get();
    } else if (this.manualSelection && (newManualIndex !== undefined || this.selectedIndex.get() >= 0)) {
      const currentIndex = newManualIndex ?? this.selectedIndex.get();
      // fall back to the onside (first entry) if the selection is invalid
      bestIndex = this.adahrsEntries.get(currentIndex) ? currentIndex : this.adahrsEntries.entries().next().value[0];
      bestState = this.adahrsEntries.get(bestIndex)?.state.get();
    } else {
      // Sort the systems in order of decreasing priority.
      this.adahrsOrder.length = 0;
      for (const index of this.adahrsEntries.keys()) {
        this.adahrsOrder.push(index);
      }
      this.adahrsOrder.sort(this.adahrsComparator);

      bestIndex = -1;

      for (let i = 0; i < this.adahrsOrder.length; i++) {
        const index = this.adahrsOrder[i];
        const state = this.adahrsEntries.get(index)!.state.get();
        if (!bestState || this.adahrsStateComparator(state, bestState) < 0) {
          bestIndex = index;
          bestState = state;
        }
      }
    }

    this.selectedIndex.set(bestIndex);
    if (bestState) {
      this.isSpeedDataValid.set(bestState[0]);
      this.isAltitudeDataValid.set(bestState[1]);
    } else {
      this.isSpeedDataValid.set(false);
      this.isAltitudeDataValid.set(false);
    }
  }

  /**
   * Handles manual ADAHRS selection events.
   */
  private onManualSelection(): void {
    const availableAdahrs = Array.from(this.adahrsEntries.keys());
    const selectedIndex = availableAdahrs.indexOf(this.selectedIndex.get());

    this.selectIndex(availableAdahrs[(selectedIndex + 1) % availableAdahrs.length]);
  }

  /**
   * Destroys this selector.
   */
  public destroy(): void {
    this.isAlive = false;

    this.updateSub?.destroy();

    for (const entry of this.adahrsEntries.values()) {
      for (const subject of entry.subjects) {
        subject.destroy();
      }
    }

    this.candidateSystemIndexesSub?.destroy();
    this.systemPrioritiesSub?.destroy();
  }
}

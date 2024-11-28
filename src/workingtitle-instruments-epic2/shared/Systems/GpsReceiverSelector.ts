import {
  ConsumerSubject, EventBus, GPSSystemState, SetSubject, Subject, Subscribable, SubscribableSet, SubscribableSetEventType, SubscribableUtils, Subscription
} from '@microsoft/msfs-sdk';

import { GpsReceiverSystemEvents } from './GpsReceiverSystem';

/**
 * Automatically selects the best GPS receiver from a set of candidates based on the current states of all receivers.
 * Receivers that have computed a 3D position solution with differential corrections are favored over those that have
 * computed a 3D solution without corrections, and either of these are favored over those that have not computed any
 * position solution.
 */
export class GpsReceiverSelector {
  private static readonly GPS_STATE_PRIORITIES = {
    [GPSSystemState.DiffSolutionAcquired]: 0,
    [GPSSystemState.SolutionAcquired]: 1,
    [GPSSystemState.Acquiring]: 2,
    [GPSSystemState.Searching]: 2
  };

  private readonly enabledReceiverIndexes: SubscribableSet<number>;
  private readonly preferredReceiverIndex: Subscribable<number>;

  private readonly _selectedIndex = Subject.create(-1);
  public readonly selectedIndex = this._selectedIndex as Subscribable<number>;

  private readonly gpsStates = new Map<number, ConsumerSubject<GPSSystemState>>();

  private isAlive = true;
  private isInit = false;

  private enabledReceiverIndexesSub?: Subscription;
  private preferredReceiverIndexSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param enabledReceiverIndexes The indexes of the GPS receivers from which to select.
   * @param preferredReceiverIndex The index of this selector's preferred GPS receiver, or `-1` if there is no such
   * receiver. This selector is guaranteed to select the preferred GPS receiver if its state is at least as desirable
   * as the state of all other receivers from which to select. Defaults to `-1`.
   */
  public constructor(
    private readonly bus: EventBus,
    enabledReceiverIndexes: Iterable<number> | SubscribableSet<number>,
    preferredReceiverIndex?: number | Subscribable<number>
  ) {
    this.enabledReceiverIndexes = 'isSubscribableSet' in enabledReceiverIndexes ? enabledReceiverIndexes : SetSubject.create(enabledReceiverIndexes);
    this.preferredReceiverIndex = SubscribableUtils.toSubscribable(preferredReceiverIndex ?? -1, true);
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

    const sub = this.bus.getSubscriber<GpsReceiverSystemEvents>();

    const selectIndex = this.selectIndex.bind(this);

    this.enabledReceiverIndexesSub = this.enabledReceiverIndexes.sub((set, type, key) => {
      this.gpsStates.get(key)?.destroy();

      if (type === SubscribableSetEventType.Added) {
        const gpsState = ConsumerSubject.create(sub.on(`gps_rec_gps_system_state_changed_${key}`), GPSSystemState.Acquiring);
        this.gpsStates.set(key, gpsState);

        gpsState.sub(selectIndex);
      } else {
        this.gpsStates.delete(key);
      }

      selectIndex();
    }, true);

    this.preferredReceiverIndexSub = this.preferredReceiverIndex.sub(selectIndex);
  }

  /**
   * Selects the index of the GPS receiver with the most desirable state.
   */
  private selectIndex(): void {
    if (this.gpsStates.size === 0) {
      this._selectedIndex.set(-1);
      return;
    }

    if (this.gpsStates.size === 1) {
      this._selectedIndex.set(this.gpsStates.keys().next().value);
      return;
    }

    let bestIndex = this._selectedIndex.get();
    let bestState = this.gpsStates.get(bestIndex)?.get();

    for (const index of this.gpsStates.keys()) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const state = this.gpsStates.get(index)!.get();
      if (bestIndex < 0 || !bestState || GpsReceiverSelector.compareGpsState(state, bestState) < 0) {
        bestIndex = index;
        bestState = state;
      }
    }

    const preferredIndex = this.preferredReceiverIndex.get();
    if (preferredIndex >= 0) {
      const preferredIndexState = this.gpsStates.get(preferredIndex)?.get();
      if (preferredIndexState !== undefined && GpsReceiverSelector.compareGpsState(preferredIndexState, bestState as GPSSystemState) <= 0) {
        bestIndex = preferredIndex;
      }
    }

    this._selectedIndex.set(bestIndex);
  }

  /**
   * Destroys this selector.
   */
  public destroy(): void {
    this.isAlive = false;

    for (const state of this.gpsStates.values()) {
      state.destroy();
    }

    this.enabledReceiverIndexesSub?.destroy();
    this.preferredReceiverIndexSub?.destroy();
  }

  /**
   * Compares two GPS system states and returns a number whose sign indicates which one is more desirable.
   * @param a The first GPS system state to compare.
   * @param b The second GPS system state to compare.
   * @returns A negative number of state `a` is more desirable than `b`, a positive number if state `b` is more
   * desirable than `a`, or zero if the two states are equally desirable.
   */
  private static compareGpsState(a: GPSSystemState, b: GPSSystemState): number {
    return GpsReceiverSelector.GPS_STATE_PRIORITIES[a] - GpsReceiverSelector.GPS_STATE_PRIORITIES[b];
  }
}

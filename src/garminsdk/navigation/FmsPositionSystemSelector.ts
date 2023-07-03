import { ConsumerSubject, EventBus, SetSubject, Subject, Subscribable, SubscribableSet, SubscribableSetEventType, SubscribableUtils, Subscription } from '@microsoft/msfs-sdk';
import { FmsPositionMode, FmsPositionSystemEvents } from '../system/FmsPositionSystem';
import { GpsReceiverSystemEvents } from '../system/GpsReceiverSystem';

/**
 * Automatically selects the best FMS geo-positioning system from a set of candidates based on the accuracy of their
 * provided positioning data.
 */
export class FmsPositionSystemSelector {
  private static readonly FMS_POS_MODE_PRIORITIES = {
    [FmsPositionMode.Gps]: 0,
    [FmsPositionMode.Hns]: 0,
    [FmsPositionMode.Dme]: 0,
    [FmsPositionMode.DeadReckoning]: 1,
    [FmsPositionMode.DeadReckoningExpired]: 2,
    [FmsPositionMode.None]: 3
  };

  private readonly enabledSystemIndexes: SubscribableSet<number>;
  private readonly preferredSystemIndex: Subscribable<number>;

  private readonly _selectedIndex = Subject.create(-1);
  public readonly selectedIndex = this._selectedIndex as Subscribable<number>;

  private readonly fmsPosModes = new Map<number, ConsumerSubject<FmsPositionMode>>();

  private isAlive = true;
  private isInit = false;

  private enabledSystemIndexesSub?: Subscription;
  private preferredSystemIndexSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param enabledSystemIndexes The indexes of the FMS geo-positioning systems from which to select.
   * @param preferredSystemIndex The index of this selector's preferred system, or `-1` if there is no such system
   * This selector is guaranteed to select the preferred system if its state is at least as desirable as the state of
   * all other systems from which to select.
   */
  public constructor(
    private readonly bus: EventBus,
    enabledSystemIndexes: Iterable<number> | SubscribableSet<number>,
    preferredSystemIndex?: number | Subscribable<number>
  ) {
    this.enabledSystemIndexes = 'isSubscribableSet' in enabledSystemIndexes ? enabledSystemIndexes : SetSubject.create(enabledSystemIndexes);
    this.preferredSystemIndex = SubscribableUtils.toSubscribable(preferredSystemIndex ?? -1, true);
  }

  /**
   * Initializes this selector. Once initialized, this selector will automatically select the FMS geo-positioning system
   * that currently provides the most accurate position data.
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

    const sub = this.bus.getSubscriber<FmsPositionSystemEvents & GpsReceiverSystemEvents>();

    const selectIndex = this.selectIndex.bind(this);

    this.enabledSystemIndexesSub = this.enabledSystemIndexes.sub((set, type, key) => {
      this.fmsPosModes.get(key)?.destroy();

      if (type === SubscribableSetEventType.Added) {
        const fmsPosState = ConsumerSubject.create(sub.on(`fms_pos_mode_${key}`), FmsPositionMode.None);
        this.fmsPosModes.set(key, fmsPosState);

        fmsPosState.sub(selectIndex);
      } else {
        this.fmsPosModes.delete(key);
      }

      selectIndex();
    }, true);

    this.preferredSystemIndexSub = this.preferredSystemIndex.sub(selectIndex);
  }

  /**
   * Selects the index of the FMS geo-positioning system with the most desirable state.
   */
  private selectIndex(): void {
    if (this.fmsPosModes.size === 0) {
      this._selectedIndex.set(-1);
      return;
    }

    if (this.fmsPosModes.size === 1) {
      this._selectedIndex.set(this.fmsPosModes.keys().next().value);
      return;
    }

    let bestIndex = this._selectedIndex.get();
    let bestState = this.fmsPosModes.get(bestIndex)?.get();

    for (const index of this.fmsPosModes.keys()) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const state = this.fmsPosModes.get(index)!.get();
      if (bestIndex < 0 || !bestState || FmsPositionSystemSelector.compareFmsPosMode(state, bestState) < 0) {
        bestIndex = index;
        bestState = state;
      }
    }

    const preferredIndex = this.preferredSystemIndex.get();
    if (preferredIndex >= 0) {
      const preferredIndexState = this.fmsPosModes.get(preferredIndex)?.get();
      if (preferredIndexState !== undefined && FmsPositionSystemSelector.compareFmsPosMode(preferredIndexState, bestState as FmsPositionMode) <= 0) {
        bestIndex = preferredIndex;
      }
    }

    this._selectedIndex.set(bestIndex);
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    for (const state of this.fmsPosModes.values()) {
      state.destroy();
    }

    this.enabledSystemIndexesSub?.destroy();
    this.preferredSystemIndexSub?.destroy();
  }

  /**
   * Compares two FMS geo-positioning system modes and returns a number whose sign indicates which one is more
   * desirable.
   * @param a The first mode to compare.
   * @param b The second mode to compare.
   * @returns A negative number of mode `a` is more desirable than `b`, a positive number if mode `b` is more desirable
   * than `a`, or zero if the two modes are equally desirable.
   */
  private static compareFmsPosMode(a: FmsPositionMode, b: FmsPositionMode): number {
    return FmsPositionSystemSelector.FMS_POS_MODE_PRIORITIES[a] - FmsPositionSystemSelector.FMS_POS_MODE_PRIORITIES[b];
  }
}
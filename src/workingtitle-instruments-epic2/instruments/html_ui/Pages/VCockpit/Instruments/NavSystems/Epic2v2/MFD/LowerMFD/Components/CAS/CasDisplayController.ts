import { Epic2BezelButtonEvents } from '@microsoft/msfs-epic2-shared';
import {
  AnnunciationType, ArraySubject, CasActiveMessage, CasEvents, CasSystem, DebounceTimer, EventBus, HEvent, Subject, SubscribableArrayEventType
} from '@microsoft/msfs-sdk';

/**
 * Counter of messages that were scrolled off the CAS Window.
 * Consists of: number of acknowledged message, number of unacknowledged messages, messages' type.
 */
export type scrolledOffCounter = [number, number, 'caution' | 'advisory' | 'status']

/**
 * Controller of Epic2 CAS window responsible for the display's logic.
 */
export class CasDisplayController {
  private static SCROLL_UP_EVENT = Epic2BezelButtonEvents.LSK_L1;
  private static SCROLL_DOWN_EVENT = Epic2BezelButtonEvents.LSK_L6;
  private static AUTO_ACKNOWLEDGE_TIMEOUT = 5000;
  public static MAX_VISIBLE_ROWS = 12;

  private readonly debounceTimer = new DebounceTimer();
  private readonly hEventSubscriber = this.bus.getSubscriber<HEvent>();
  private readonly casPublisher = this.bus.getPublisher<CasEvents>();
  private readonly annunciations: CasActiveMessage[] = [];
  public readonly hasAnnunciations = Subject.create(false);
  public readonly displayedAnnunciations = ArraySubject.create<CasActiveMessage>();

  // Counter subjects to display information about the number of messages that are above or below CAS Display
  public readonly aboveCaution = Subject.create<scrolledOffCounter>([0, 0, 'caution']);
  public readonly belowCaution = Subject.create<scrolledOffCounter>([0, 0, 'caution']);
  public readonly aboveAdvisory = Subject.create<scrolledOffCounter>([0, 0, 'advisory']);
  public readonly belowAdvisory = Subject.create<scrolledOffCounter>([0, 0, 'advisory']);
  public readonly aboveStatus = Subject.create<scrolledOffCounter>([0, 0, 'status']);
  public readonly belowStatus = Subject.create<scrolledOffCounter>([0, 0, 'status']);
  public readonly scrollDisabled = Subject.create(true);

  private autoAcknowledgeIDs = new Map<string, ReturnType<typeof setTimeout>>();
  private scrollIndex = 0;

  /**
   * Creates an instance of CasController.
   * @param bus The event bus to be used with this instance.
   * @param casSystem The instruments CAS system.
   */
  constructor(private readonly bus: EventBus, private readonly casSystem: CasSystem) {
    this.hEventSubscriber.on('hEvent').handle(this.handleHEvent.bind(this));

    this.casSystem.casActiveMessageSubject?.sub((idx, type, item) => {
      if (Array.isArray(item)) {
        // Insert into the specified index from the end of the array to keep
        // the provided order.
        for (let i = item.length - 1; i >= 0; i--) {
          this.handleArrayEvent(idx, type, item[i]);
        }
      } else {
        this.handleArrayEvent(idx, type, item as CasActiveMessage | undefined);
      }
    }, true);

    this.displayedAnnunciations.sub((idx, type, annunciations) => {
      this.debounceTimer.clear();
      this.debounceTimer.schedule(() => {
        if (Array.isArray(annunciations)) {
          annunciations.forEach((a: CasActiveMessage) => {
            if ((a.priority === AnnunciationType.Advisory || a.priority === AnnunciationType.SafeOp) && !a.acknowledged) {
              this.setAutoAcknowledge(a.uuid, a.priority);
            }
          });
          // We don't want to auto acknowledge scrolled off messages
          this.autoAcknowledgeIDs.forEach((timeoutId, uuid, map) => {
            if (!annunciations.some((a) => a.uuid === uuid)) {
              clearTimeout(timeoutId);
              map.delete(uuid);
            }
          });

        }
      }, 200);
    });
  }

  /**
   * Advisory and Status messages are auto-acknowledged after being displayed for CASController.AUTO_ACKNOWLEDGE_TIMEOUT (5sec)
   * This function sets timeout to auto acknowledge messages after being displayed long enough.
   * @param uuid The UUID of the alert to be acknowledged
   * @param priority The type of messages which shall be acknowledged.
   */
  private setAutoAcknowledge(uuid: string, priority: AnnunciationType): void {
    if (!this.autoAcknowledgeIDs.has(uuid)) {
      this.autoAcknowledgeIDs.set(uuid, setTimeout(() => {
        this.casPublisher.pub('cas_single_acknowledge', { key: { uuid }, priority });
      }, CasDisplayController.AUTO_ACKNOWLEDGE_TIMEOUT));
    }
  }

  /**
   * Handle a SubscribableArrayEventType on a per-item bases.
   * @param idx  The index of the message
   * @param type The type of event we're handling
   * @param item The individual item to manage.
   */
  private handleArrayEvent(idx: number, type: SubscribableArrayEventType, item: CasActiveMessage | undefined): void {
    if (type == SubscribableArrayEventType.Cleared) {
      this.clearAnnunciations();
    } else if (item === undefined) {
      console.error('Unable to handle CAS array event with undefined item.');
    } else {
      switch (type) {
        case SubscribableArrayEventType.Added:
          this.addAnnunciation(idx, item as CasActiveMessage); break;
        case SubscribableArrayEventType.Removed:
          this.removeAnnunciation(idx); break;
      }
    }
  }

  /**
   * Add an annunciation to the active list.
   * @param idx The index of the annunciations array for the annunciation.
   * @param item The annunciation configuration to add
   */
  protected addAnnunciation(idx: number, item: CasActiveMessage): void {
    this.annunciations.splice(idx, 0, item);
    this.updateDisplayedAnnunciations();
  }

  /**
   * Remove an annunciation from the active list if present.
   * @param idx The index of the annunciations array for the annunciation.
   */
  protected removeAnnunciation(idx: number): void {
    this.annunciations.splice(idx, 1);
    this.updateDisplayedAnnunciations();
  }

  /**
   * Clear the annunciation display.
   */
  private clearAnnunciations(): void {
    this.annunciations.splice(0);
    this.updateDisplayedAnnunciations();
  }

  /**
   * Rerenders the annunciations in order.
   * Enable scrolling logic when number of annunciations is bigger than CASController.MAX_VISIBLE_ROWS (12)
   */
  private updateDisplayedAnnunciations(): void {
    const sortFn = (a: CasActiveMessage, b: CasActiveMessage): number => {
      if (a.priority < b.priority) {
        return -1;
      } else if (a.priority > b.priority) {
        return 1;
      }
      return a.lastActive < b.lastActive ? 1 : -1;
    };
    const orderedActiveAnnunciations = [...this.annunciations.values()].sort(sortFn);
    this.hasAnnunciations.set(Boolean(orderedActiveAnnunciations.length));

    if (orderedActiveAnnunciations.length <= CasDisplayController.MAX_VISIBLE_ROWS) {
      // We can show all messages within CAS window, no scroll logic needed.
      this.displayedAnnunciations.set(orderedActiveAnnunciations);
      if (!this.scrollDisabled.get()) {
        this.scrollDisabled.set(true);
      }
      return;
    }

    this.scrollDisabled.set(false);
    const notScrollableAnnunciations = this.annunciations.filter(a => (
      a.priority === AnnunciationType.Warning
      || (a.priority === AnnunciationType.Caution && !a.acknowledged))).slice(0, CasDisplayController.MAX_VISIBLE_ROWS);

    const newDisplayedAnnunciations = [
      ...notScrollableAnnunciations,
      ...orderedActiveAnnunciations.slice(
        notScrollableAnnunciations.length + this.scrollIndex,
        CasDisplayController.MAX_VISIBLE_ROWS + this.scrollIndex)
    ];
    this.displayedAnnunciations.set(newDisplayedAnnunciations);
    this.setHiddenAnnunciationsCounters(orderedActiveAnnunciations, newDisplayedAnnunciations);
  }

  /**
   * This function finds the list of scrolled off annunciations, counts every of its type and updates counters.
   * @param annunciations The list of all annunciations
   * @param displayedAnnunciations The list of annunciations that are displayed in CAS window.
   */
  private setHiddenAnnunciationsCounters(annunciations: CasActiveMessage[], displayedAnnunciations: CasActiveMessage[]): void {
    // Convert the displayedAnnunciations array to a Set for efficient lookups
    const displayedSet = new Set(displayedAnnunciations.map(alert => alert.uuid));
    // Filter out annunciations that are in displayedAnnunciations
    const scrolledOfAnnunciations = annunciations.filter(alert => !displayedSet.has(alert.uuid));
    // Create a lists of alerts that are above and below the CAS window
    const aboveWindow = scrolledOfAnnunciations.slice(0, this.scrollIndex);
    const belowWindow = annunciations.filter(alert => !displayedSet.has(alert.uuid) && !aboveWindow.some((a) => a.uuid === alert.uuid));
    // Calculate each type of message that are above or below the screen
    const defaultAccumulator = { 'caution-ack': 0, 'caution-unack': 0, 'advisory-ack': 0, 'advisory-unack': 0, 'status-ack': 0, 'status-unack': 0 };
    const reducingFn = (acc: typeof defaultAccumulator, v: CasActiveMessage): typeof defaultAccumulator => {
      switch (v.priority) {
        case AnnunciationType.Caution:
          v.acknowledged ?
            acc['caution-ack'] += 1 :
            acc['caution-unack'] += 1;
          break;
        case AnnunciationType.Advisory:
          v.acknowledged ?
            acc['advisory-ack'] += 1 :
            acc['advisory-unack'] += 1;
          break;
        case AnnunciationType.SafeOp:
          v.acknowledged ?
            acc['status-ack'] += 1 :
            acc['status-unack'] += 1;
          break;
        default:
          break;
      }
      return acc;
    };
    const countedAbove = aboveWindow.reduce(reducingFn, { ...defaultAccumulator });
    const countedBelow = belowWindow.reduce(reducingFn, { ...defaultAccumulator });

    this.aboveCaution.set([countedAbove['caution-ack'], countedAbove['caution-unack'], 'caution']);
    this.belowCaution.set([countedBelow['caution-ack'], countedBelow['caution-unack'], 'caution']);
    this.aboveAdvisory.set([countedAbove['advisory-ack'], countedAbove['advisory-unack'], 'advisory']);
    this.belowAdvisory.set([countedBelow['advisory-ack'], countedBelow['advisory-unack'], 'advisory']);
    this.aboveStatus.set([countedAbove['status-ack'], countedAbove['status-unack'], 'status']);
    this.belowStatus.set([countedBelow['status-ack'], countedBelow['status-unack'], 'status']);
  }

  /**
   * Handles the Scroll buttons:
   * @param event The H event, which was received
   */
  private handleHEvent(event: string): void {
    switch (event) {
      case CasDisplayController.SCROLL_UP_EVENT:
        this.scrollIndex = this.scrollDisabled.get() ? 0 : Math.max(this.scrollIndex - 1, 0);
        break;
      case CasDisplayController.SCROLL_DOWN_EVENT:
        this.scrollIndex = this.scrollDisabled.get() ? 0 : Math.min(this.scrollIndex + 1, this.annunciations.length - CasDisplayController.MAX_VISIBLE_ROWS);
        break;
      default:
        return;
    }
    this.updateDisplayedAnnunciations();
  }
}

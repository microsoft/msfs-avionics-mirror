import {
  AnnunciationType, CasActiveMessage, ComponentProps, DebounceTimer, DisplayComponent, FSComponent, MathUtils,
  MutableSubscribable, SetSubject, Subject, Subscribable, SubscribableArray, SubscribableSet, SubscribableUtils, Subscription, ToggleableClassNameRecord, VNode
} from '@microsoft/msfs-sdk';

/**
 * A scroll state of a {@link CasDisplay2}.
 */
export type CasDisplay2ScrollState = {
  /** The number of displayed unscrollable message slots. */
  unscrollableSlotCount: number;

  /** The number of displayed scrollable message slots. */
  scrollableSlotCount: number;

  /** All scrollable messages, in display order. */
  scrollableMessages: readonly CasActiveMessage[];

  /**
   * The scrolling position of the scrollable message slots. A value of `0` indicates that the first scrollable
   * message is displayed in the first scrollable message slot, `1` indicates that the second scrollable message is
   * displayed in the first scrollable message slot, and so on.
   */
  scrollPos: number;

  /** The number of scrollable messages that are positioned before the first scrollable message slot. */
  messageBeforeCount: number;

  /** The number of scrollable messages that are positioned after the last scrollable message slot. */
  messageAfterCount: number;

  /**
   * The numbers of scrollable messages of each priority level that are positioned before the first scrollable message
   * slot.
   */
  messageBeforePriorityCounts: Readonly<Record<AnnunciationType, number>>;

  /**
   * The numbers of scrollable messages of each priority level that are positioned after the last scrollable message
   * slot.
   */
  messageAfterPriorityCounts: Readonly<Record<AnnunciationType, number>>;
};

/**
 * Component props for {@link CasDisplay2}.
 */
export interface CasDisplay2Props extends ComponentProps {
  /** The messages to display. */
  messages: SubscribableArray<CasActiveMessage>;

  /** The maximum number of messages that can be displayed simultaneously. */
  maxMessageCount: number | Subscribable<number>;

  /** The maximum number of warning messages that are always displayed and cannot be scrolled. Defaults to `0`. */
  maxUnscrollableWarningCount?: number | Subscribable<number>;

  /** A mutable subscribable to which to write the scroll state of the display. */
  scrollState?: MutableSubscribable<any, Readonly<CasDisplay2ScrollState>>;

  /** Whether to disable automatic scrolling to new unacknowledged warning and caution messages. Defaults to `false`. */
  disableAutoScrollToNewMessage?: boolean;

  /** CSS class(es) to apply to the display's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * An entry describing a CAS display message slot.
 */
type MessageSlotEntry = {
  /** Whether the slot is visible. */
  isVisible: Subject<boolean>;

  /** The text displayed in the slot. */
  text: Subject<string>;

  /** The CSS classes applied to the slot. */
  cssClass: SetSubject<string>;

  /**
   * Whether the slot's message has been acknowledged, or `undefined` if the slot is not displaying a message or the
   * slot's message cannot be acknowledged.
   */
  isAcknowledged: boolean | undefined;
};

/**
 * A record of old unacknowledged messages.
 */
type OldMessageRecord = {
  /**
   * A map of old unacknowledged warning message suffixes, keyed by UUID. A defined but empty suffix set indicates an
   * unsuffixed unacknowledged message.
   */
  [AnnunciationType.Warning]: Map<string, Set<string>>;

  /**
   * A map of old unacknowledged caution message suffixes, keyed by UUID. A defined but empty suffix set indicates an
   * unsuffixed unacknowledged message.
   */
  [AnnunciationType.Caution]: Map<string, Set<string>>;
};

/**
 * A scrolling CAS display.
 */
export class CasDisplay2 extends DisplayComponent<CasDisplay2Props> {
  private static readonly RESERVED_CLASSES = ['cas-display-2'];

  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  private readonly maxMessageCount = SubscribableUtils.toSubscribable(this.props.maxMessageCount, true);
  private readonly maxUnscrollableWarningCount = SubscribableUtils.toSubscribable(this.props.maxUnscrollableWarningCount ?? 0, true);

  private readonly messageSlots: MessageSlotEntry[] = [];
  private maxScrollPos = 0;
  private scrollPos = 0;

  private readonly oldMessages: OldMessageRecord | undefined = this.props.disableAutoScrollToNewMessage
    ? undefined
    : {
      [AnnunciationType.Warning]: new Map<string, Set<string>>(),
      [AnnunciationType.Caution]: new Map<string, Set<string>>()
    };

  private readonly refreshDebounce = new DebounceTimer();
  private readonly refreshCallback = this.refresh.bind(this);
  private readonly refreshNewMessageDebounce = new DebounceTimer();
  private readonly refreshNewMessageCallback = this.refreshNewMessageCssClass.bind(this);

  private readonly refreshSubs: Subscription[] = [];
  private cssClassSub?: Subscription | Subscription[];

  /** @inheritDoc */
  public onAfterRender(): void {
    this.refresh();

    const scheduleRefresh = this.scheduleRefresh.bind(this);

    this.refreshSubs.push(
      this.maxMessageCount.sub(scheduleRefresh),
      this.maxUnscrollableWarningCount.sub(scheduleRefresh),
      this.props.messages.sub(scheduleRefresh)
    );
  }

  /**
   * Scrolls this display's scrollable messages to a specific position.
   * @param pos The position to which to scroll. A value of `0` indicates that the first scrollable message is
   * displayed in the first scrollable message slot, `1` indicates that the second scrollable message is displayed in
   * the first scrollable message slot, and so on.
   */
  public scrollTo(pos: number): void {
    const newScrollPos = MathUtils.clamp(pos, 0, this.maxScrollPos);
    if (newScrollPos !== this.scrollPos) {
      this.scrollPos = newScrollPos;
      this.scheduleRefresh();
    }
  }

  /**
   * Scrolls this display's scrollable messages up.
   * @param delta The number of slots to scroll up.
   */
  public scrollUp(delta = 1): void {
    this.scrollTo(this.scrollPos - delta);
  }

  /**
   * Scrolls this display's scrollable messages down.
   * @param delta The number of slots to scroll down.
   */
  public scrollDown(delta = 1): void {
    this.scrollTo(this.scrollPos + delta);
  }

  /**
   * Schedules a refresh of this display.
   */
  private scheduleRefresh(): void {
    this.refreshDebounce.schedule(this.refreshCallback, 0);
  }

  /**
   * Refreshes this display. Once the refresh is complete, this display will display an up-to-date set of CAS messages
   * while respecting the current maximum message count, maximum unscrollable message count, and requested scroll
   * position.
   */
  private refresh(): void {
    this.refreshMessageSlots();
    this.refreshDisplayedMessages();
  }

  /**
   * Refreshes this display's message slots. If the number of rendered slots does not match the current maximum message
   * count, then slots will be added or removed as necessary until the two values are equal.
   */
  private refreshMessageSlots(): void {
    const count = Math.max(0, this.maxMessageCount.get());

    if (count > this.messageSlots.length) {
      // Add additional slots.

      while (this.messageSlots.length < count) {
        const entry = {
          isVisible: Subject.create(false),
          text: Subject.create(''),
          cssClass: SetSubject.create(['cas-display-2-msg']),
          isAcknowledged: undefined
        };
        this.messageSlots.push(entry);

        FSComponent.render(
          <div class={entry.cssClass} style={{ 'display': entry.isVisible.map(visible => visible ? '' : 'none') }}>{entry.text}</div>,
          this.rootRef.instance
        );
      }
    } else if (count < this.messageSlots.length) {
      // Remove excess slots.

      while (this.messageSlots.length > count) {
        this.messageSlots.pop();

        const element = this.rootRef.instance.lastElementChild;
        if (element) {
          this.rootRef.instance.removeChild(element);
        }
      }
    }
  }

  private static readonly WARNING_FILTER = (message: CasActiveMessage): boolean => message.priority === AnnunciationType.Warning;
  private static readonly NON_WARNING_FILTER = (message: CasActiveMessage): boolean => message.priority !== AnnunciationType.Warning;

  /**
   * Refreshes the messages displayed by this display.
   */
  private refreshDisplayedMessages(): void {
    const messages = this.props.messages.getArray();
    const maxUnscrollableWarningCount = Math.min(this.maxUnscrollableWarningCount.get(), this.messageSlots.length);

    const warnings = messages.filter(CasDisplay2.WARNING_FILTER);
    const scrollableMessages = messages.filter(CasDisplay2.NON_WARNING_FILTER);

    let unscrollableSlotIndex = 0;

    // First, fill the unscrollable warning slots with any warnings.
    const unscrollableEnd = Math.min(maxUnscrollableWarningCount, warnings.length);
    for (let i = 0; i < unscrollableEnd; i++) {
      const slot = this.messageSlots[unscrollableSlotIndex];
      const message = warnings[i];
      this.setSlot(slot, message);
      slot.cssClass.add('cas-display-2-msg-unscrollable');
      slot.cssClass.delete('cas-display-2-msg-scrollable');
      slot.cssClass.delete('cas-display-2-msg-scroll-boundary');
      unscrollableSlotIndex++;
    }

    // Then, fill the scrollable slots with any leftover messages.

    for (let i = unscrollableEnd; i < warnings.length; i++) {
      scrollableMessages.unshift(warnings[i]);
    }

    const unscrollableSlotCount = unscrollableSlotIndex;
    const scrollableMessageCount = scrollableMessages.length;
    const maxScrollableSlots = this.messageSlots.length - unscrollableSlotCount;
    const scrollableSlotCount = Math.min(scrollableMessageCount, maxScrollableSlots);
    const maxScrollPos = scrollableSlotCount === 0 ? 0 : scrollableMessageCount - scrollableSlotCount;
    let scrollPos = Math.min(this.scrollPos, maxScrollPos);

    // Check if there are any new unacknowledged warning or caution messages since the last refresh. If so, then
    // scroll such that the first such message is in view.
    if (this.oldMessages) {
      if (maxScrollPos > 0) {
        const autoScrollIndex = this.getAutoScrollIndex(this.oldMessages, scrollableMessages);
        if (autoScrollIndex >= 0 && (autoScrollIndex < scrollPos || autoScrollIndex >= scrollPos + scrollableSlotCount)) {
          scrollPos = Math.min(autoScrollIndex, maxScrollPos);
        }
      }

      this.updateOldMessageRecord(this.oldMessages, scrollableMessages);
    }

    const messageBeforePriorityCounts = this.props.scrollState
      ? {
        [AnnunciationType.Warning]: 0,
        [AnnunciationType.Caution]: 0,
        [AnnunciationType.Advisory]: 0,
        [AnnunciationType.SafeOp]: 0
      }
      : undefined;
    const messageAfterPriorityCounts = this.props.scrollState
      ? {
        [AnnunciationType.Warning]: 0,
        [AnnunciationType.Caution]: 0,
        [AnnunciationType.Advisory]: 0,
        [AnnunciationType.SafeOp]: 0
      }
      : undefined;

    if (messageBeforePriorityCounts) {
      for (let i = 0; i < scrollPos; i++) {
        const message = scrollableMessages[i];
        messageBeforePriorityCounts[message.priority] += 1;
      }
    }

    const scrollableEnd = Math.min(scrollableMessageCount, scrollableSlotCount);
    for (let i = 0; i < scrollableEnd; i++) {
      const slot = this.messageSlots[unscrollableSlotCount + i];
      const message = scrollableMessages[i + scrollPos];
      this.setSlot(slot, message);

      slot.cssClass.delete('cas-display-2-msg-unscrollable');
      slot.cssClass.add('cas-display-2-msg-scrollable');
      if (i === 0 && unscrollableSlotCount > 0) {
        this.messageSlots[unscrollableSlotCount - 1].cssClass.add('cas-display-2-msg-scroll-boundary');
        slot.cssClass.add('cas-display-2-msg-scroll-boundary');
      } else {
        slot.cssClass.delete('cas-display-2-msg-scroll-boundary');
      }
    }

    if (messageAfterPriorityCounts) {
      for (let i = scrollPos + scrollableEnd; i < scrollableMessages.length; i++) {
        const message = scrollableMessages[i];
        messageAfterPriorityCounts[message.priority] += 1;
      }
    }

    // Clear empty slots.
    for (let i = unscrollableSlotCount + scrollableEnd; i < this.messageSlots.length; i++) {
      const slot = this.messageSlots[i];
      this.setSlot(slot, null);
      slot.cssClass.delete('cas-display-2-msg-unscrollable');
      slot.cssClass.delete('cas-display-2-msg-scrollable');
      slot.cssClass.delete('cas-display-2-msg-scroll-boundary');
    }

    this.maxScrollPos = maxScrollPos;
    this.scrollPos = scrollPos;

    if (this.props.scrollState) {
      this.props.scrollState.set({
        unscrollableSlotCount,
        scrollableSlotCount,
        scrollableMessages,
        scrollPos,
        messageBeforeCount: scrollPos,
        messageAfterCount: scrollableMessageCount - (scrollPos + scrollableSlotCount),
        messageBeforePriorityCounts: messageBeforePriorityCounts!,
        messageAfterPriorityCounts: messageAfterPriorityCounts!
      });
    }
  }


  /**
   * Gets the index of the first new unacknowledged warning or caution message to which to automatically scroll, or
   * `-1` if there is no such message.
   * @param oldMessages A record of old unacknowledged messages.
   * @param scrollableMessages An array containing the current set of scrollable messages, in the order in which they
   * are to be displayed.
   * @returns The index of the first new unacknowledged warning or caution message to which to automatically scroll, or
   * `-1` if there is no such message.
   */
  private getAutoScrollIndex(oldMessages: OldMessageRecord, scrollableMessages: readonly CasActiveMessage[]): number {
    for (let i = 0; i < scrollableMessages.length; i++) {
      const message = scrollableMessages[i];
      if (message.priority === AnnunciationType.Warning || message.priority === AnnunciationType.Caution) {
        if (this.isMessageNew(oldMessages[message.priority], message)) {
          return i;
        }
      }
    }

    return -1;
  }

  /**
   * Checks whether a message is considered a new unacknowledged message.
   * @param map A map containing entries of old messages against which to the check the message.
   * @param message The message to check.
   * @returns Whether the specified message is considered a new unacknowledged message.
   */
  private isMessageNew(map: ReadonlyMap<string, Set<string>>, message: CasActiveMessage): boolean {
    if (message.acknowledged) {
      return false;
    }

    const oldMessageSuffixes = map.get(message.uuid);
    if (oldMessageSuffixes) {
      if (message.suffixes) {
        for (let j = 0; j < message.suffixes.length; j++) {
          const suffix = message.suffixes[j];
          if (!message.acknowledgedSuffixes?.includes(suffix) && !oldMessageSuffixes.has(suffix)) {
            return true;
          }
        }
      }

      return false;
    } else {
      return true;
    }
  }

  /**
   * Updates a record containing old unacknowledged messages.
   * @param record The record to update.
   * @param messages The messages from which to update the record.
   */
  private updateOldMessageRecord(record: OldMessageRecord, messages: readonly CasActiveMessage[]): void {
    this.updateOldMessageMap(record[AnnunciationType.Warning], AnnunciationType.Warning, messages);
    this.updateOldMessageMap(record[AnnunciationType.Caution], AnnunciationType.Caution, messages);
  }

  /**
   * Updates a map containing old unacknowledged message suffixes, keyed by UUID. Once updated, the map will contain
   * entries for each unacknowledged message of a given priority in the provided message array listing the
   * unacknowledged suffixes of that message.
   * @param map The map to update.
   * @param priority The priority type of messages to included in the updated map.
   * @param messages The messages from which to update the map.
   */
  private updateOldMessageMap(map: Map<string, Set<string>>, priority: AnnunciationType, messages: readonly CasActiveMessage[]): void {
    const toRemove = new Set<string>(map.keys());

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      if (!message.acknowledged && (message.priority === priority)) {
        let existing = map.get(message.uuid);
        existing?.clear();

        if (message.suffixes) {
          for (let j = 0; j < message.suffixes.length; j++) {
            const suffix = message.suffixes[j];
            if (!message.acknowledgedSuffixes?.includes(suffix)) {
              (existing ??= new Set()).add(suffix);
            }
          }

          if (existing) {
            map.set(message.uuid, existing);
            toRemove.delete(message.uuid);
          }
        } else {
          // If the message has no suffixes, then retain an empty set in the map to indicate the presence of an
          // unacknowledged suffix-less message.
          if (existing) {
            existing.clear();
          } else {
            map.set(message.uuid, new Set());
          }

          toRemove.delete(message.uuid);
        }
      }
    }

    for (const uuid of toRemove) {
      map.delete(uuid);
    }
  }

  /**
   * Sets the message displayed in a slot.
   * @param slot The slot to set.
   * @param message The message to display, or `null` if the slot should be cleared.
   */
  private setSlot(slot: MessageSlotEntry, message: CasActiveMessage | null): void {
    if (message === null) {
      slot.isVisible.set(false);
      slot.text.set('');
      slot.cssClass.delete('cas-display-2-msg-visible');
      slot.cssClass.delete('cas-display-2-msg-warning');
      slot.cssClass.delete('cas-display-2-msg-caution');
      slot.cssClass.delete('cas-display-2-msg-advisory');
      slot.cssClass.delete('cas-display-2-msg-safe-op');
      slot.cssClass.delete('cas-display-2-msg-acked');
      slot.cssClass.delete('cas-display-2-msg-new');
      slot.cssClass.delete('cas-display-2-msg-new');
      slot.isAcknowledged = undefined;
    } else {
      slot.isVisible.set(true);

      slot.text.set(message.message + (message.suffixes !== undefined ? ' ' + message.suffixes.join('-') : ''));

      slot.cssClass.add('cas-display-2-msg-visible');
      slot.cssClass.toggle('cas-display-2-msg-warning', message.priority === AnnunciationType.Warning);
      slot.cssClass.toggle('cas-display-2-msg-caution', message.priority === AnnunciationType.Caution);
      slot.cssClass.toggle('cas-display-2-msg-advisory', message.priority === AnnunciationType.Advisory);
      slot.cssClass.toggle('cas-display-2-msg-safe-op', message.priority === AnnunciationType.SafeOp);

      if (message.priority === AnnunciationType.Caution || message.priority === AnnunciationType.Warning) {
        // If the message is a caution or warning, we need to handle the acknowledged/unacknowledged state.
        // Typically, unacknowledged messages will need to be flashing, and we want all such messages to flash in sync
        // with each other. To accomplish that, whenever any slot is changed, we will remove the unacknowledged CSS
        // class from all slots, then wait one frame and add that class back to all slots displaying an unacknowledged
        // message. This ensures that any animations that are applied using the CSS class are reset for all
        // unacknowledged messages at the same time.

        slot.isAcknowledged = message.acknowledged;
        slot.cssClass.delete('cas-display-2-msg-new');
        slot.cssClass.toggle('cas-display-2-msg-acked', message.acknowledged);

        if (!message.acknowledged && !this.refreshNewMessageDebounce.isPending()) {
          this.refreshNewMessageDebounce.schedule(this.refreshNewMessageCallback, 0);
        }
      } else {
        slot.isAcknowledged = undefined;
        slot.cssClass.delete('cas-display-2-msg-acked');
        slot.cssClass.delete('cas-display-2-msg-new');
      }
    }
  }

  /**
   * Adds the `cas-display-2-msg-new` CSS class to all of this display's message slots that are currently displaying an
   * unacknowledged message.
   */
  private refreshNewMessageCssClass(): void {
    for (let i = 0; i < this.messageSlots.length; i++) {
      const slot = this.messageSlots[i];
      if (slot.isAcknowledged === false) {
        slot.cssClass.add('cas-display-2-msg-new');
      }
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      cssClass = SetSubject.create();
      cssClass.add('cas-display-2');
      this.cssClassSub = FSComponent.bindCssClassSet(cssClass, this.props.class, CasDisplay2.RESERVED_CLASSES);
    } else {
      cssClass = 'cas-display-2';
      if (this.props.class) {
        cssClass += FSComponent.parseCssClassesFromString(this.props.class, classToFilter => !CasDisplay2.RESERVED_CLASSES.includes(classToFilter)).join(' ');
      }
    }

    return (
      <div class={cssClass} ref={this.rootRef}>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    for (const sub of this.refreshSubs) {
      sub.destroy();
    }

    if (this.cssClassSub) {
      if (Array.isArray(this.cssClassSub)) {
        for (const sub of this.cssClassSub) {
          sub.destroy();
        }
      } else {
        this.cssClassSub.destroy();
      }
    }

    super.destroy();
  }
}

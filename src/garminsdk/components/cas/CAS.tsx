import {
  AnnunciationType, CasActiveMessage, ComponentProps, DebounceTimer, DisplayComponent, EventBus, FSComponent,
  ObjectSubject, SetSubject, Subject, Subscribable, SubscribableArray, SubscribableArrayEventType, SubscribableUtils,
  Subscription, VNode
} from '@microsoft/msfs-sdk';

/** A data structure for passing back info on the display status. */
export type CASAlertCounts = {
  /** The total number of messages that are displayed. */
  totalAlerts: number;
  /** The number of scrollable messages that are out of view above the selected window. */
  countAboveWindow: number;
  /** The number of scrollable messages that are out of view below the selected window. */
  countBelowWindow: number;
  /** The number of warnings present.*/
  numWarning: number;
  /** The number of cautions present. */
  numCaution: number;
  /** The number of advisories present.*/
  numAdvisory: number;
  /** The number of safeop messages present. */
  numSafeOp: number;
}

/** The props for a CAS element. */
export interface CASProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus,
  /** Alert subject. */
  annunciations: SubscribableArray<CasActiveMessage>,
  /** The number of annunciations to display at once. */
  numAnnunciationsShown: number | Subscribable<number>;
  /** An optional subject to pass back the alert counts. */
  alertCounts?: ObjectSubject<CASAlertCounts>
}

/**
 * An entry describing a CAS display message slot.
 */
type CASDisplayMessageSlotEntry = {
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

/** A component for displaying CAS messages. */
export class CASDisplay<T extends CASProps> extends DisplayComponent<T> {
  private readonly casDiv = FSComponent.createRef<HTMLDivElement>();

  private readonly messageCount = SubscribableUtils.toSubscribable(this.props.numAnnunciationsShown, true);

  private readonly activeAnns: Array<CasActiveMessage> = [];

  private readonly messageSlots: CASDisplayMessageSlotEntry[] = [];

  /** The index of the message that is currently displayed in the top (first) slot. */
  protected topAlertIndex = 0;

  private readonly refreshNewMessageCssClassTimer = new DebounceTimer();
  private readonly refreshNewMessageCssClassCallback = this.refreshNewMessageCssClass.bind(this);

  private messageCountSub?: Subscription;
  private messageSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.renderMessageSlots();
    this.updateAlertCounts();

    this.messageCountSub = this.messageCount.sub(this.onMessageCountChanged.bind(this));

    this.messageSub = this.props.annunciations.sub(this.onMessagesChanged.bind(this), true);
  }

  /**
   * Responds to when the maximum displayed message count changes.
   */
  private onMessageCountChanged(): void {
    this.renderMessageSlots();

    // Ensure we are not scrolled past the last slot.
    this.topAlertIndex = Math.min(this.topAlertIndex, Math.max(0, this.activeAnns.length - this.messageCount.get()));

    this.updateAlertCounts();
    this.updateDisplayedAnnunciations();
  }

  /**
   * Render our the divs for our alerts.
   */
  private renderMessageSlots(): void {
    const count = Math.max(0, this.messageCount.get());

    if (count > this.messageSlots.length) {
      // Add additional slots.

      while (this.messageSlots.length < count) {
        const entry = {
          isVisible: Subject.create(false),
          text: Subject.create(''),
          cssClass: SetSubject.create(['annunciation']),
          isAcknowledged: undefined
        };
        this.messageSlots.push(entry);

        FSComponent.render(
          <div class={entry.cssClass} style={{ 'display': entry.isVisible.map(visible => visible ? '' : 'none') }}>{entry.text}</div>,
          this.casDiv.instance
        );
      }
    } else if (count < this.messageSlots.length) {
      // Remove excess slots.

      while (this.messageSlots.length > count) {
        this.messageSlots.pop();

        const element = this.casDiv.instance.lastElementChild;
        if (element) {
          this.casDiv.instance.removeChild(element);
        }
      }
    }
  }

  /**
   * Responds to when the list of displayed CAS messages changes.
   * @param idx The index of the first message that changed.
   * @param type The type of change that occurred.
   * @param item The message or messages that changed.
   */
  private onMessagesChanged(idx: number, type: SubscribableArrayEventType, item?: CasActiveMessage | readonly CasActiveMessage[]): void {
    if (type === SubscribableArrayEventType.Cleared) {
      this.clearAnnunciations();
      return;
    }

    if (Array.isArray(item)) {
      // Insert into the specified index from the end of the array to keep
      // the provided order.
      for (let i = item.length - 1; i >= 0; i--) {
        this.handleMessageChanged(idx, type, item[i]);
      }
    } else {
      this.handleMessageChanged(idx, type, item as CasActiveMessage);
    }
  }

  /**
   * Handles when a displayed CAS message is added or removed.
   * @param idx The index of the message that changed.
   * @param type The type of change that occurred.
   * @param item The message that changed.
   */
  private handleMessageChanged(idx: number, type: SubscribableArrayEventType.Added | SubscribableArrayEventType.Removed, item: CasActiveMessage): void {
    switch (type) {
      case SubscribableArrayEventType.Added:
        this.addAnnunciation(idx, item); break;
      case SubscribableArrayEventType.Removed:
        this.removeAnnunciation(idx, item); break;
    }
  }

  /**
   * Add an annunciation to the active list.
   * @param idx The index of the annunciations array for the annunciation.
   * @param item The annunciation configuration to add
   */
  protected addAnnunciation(idx: number, item: CasActiveMessage): void {
    this.activeAnns.splice(idx, 0, item);

    // If we're passing back counts, update those.
    if (this.props.alertCounts !== undefined) {
      switch (item.priority) {
        case AnnunciationType.Warning:
          this.props.alertCounts.set('numWarning', this.props.alertCounts.get().numWarning + 1); break;
        case AnnunciationType.Caution:
          this.props.alertCounts.set('numCaution', this.props.alertCounts.get().numCaution + 1); break;
        case AnnunciationType.Advisory:
          this.props.alertCounts.set('numAdvisory', this.props.alertCounts.get().numAdvisory + 1); break;
        case AnnunciationType.SafeOp:
          this.props.alertCounts.set('numSafeOp', this.props.alertCounts.get().numSafeOp + 1); break;
      }
      this.updateAlertCounts();
    }

    this.updateDisplayedAnnunciations();
  }

  /**
   * Remove an annunciation from the active list if present.
   * @param idx The index of the annunciations array for the annunciation.
   * @param item The item that's being removed.
   */
  protected removeAnnunciation(idx: number, item: CasActiveMessage): void {
    this.activeAnns.splice(idx, 1);

    // We need to be sure to move the display up if a) the removed alert was above our top line, or
    // b) the removal is at the bottom and brings the alert count within the number of annunciations
    // allowed to be shown, meaning we need to display stuff higher up -- UNLESS we're already at the
    // top.  Got it?
    if ((idx <= this.topAlertIndex || this.activeAnns.length - this.messageCount.get() - this.topAlertIndex <= 0) && this.topAlertIndex > 0) {
      this.topAlertIndex--;
    }

    // If we're passing back counts, update those.
    if (this.props.alertCounts !== undefined) {
      switch (item.priority) {
        case AnnunciationType.Warning:
          this.props.alertCounts.set('numWarning', this.props.alertCounts.get().numWarning - 1); break;
        case AnnunciationType.Caution:
          this.props.alertCounts.set('numCaution', this.props.alertCounts.get().numCaution - 1); break;
        case AnnunciationType.Advisory:
          this.props.alertCounts.set('numAdvisory', this.props.alertCounts.get().numAdvisory - 1); break;
        case AnnunciationType.SafeOp:
          this.props.alertCounts.set('numSafeOp', this.props.alertCounts.get().numSafeOp - 1); break;
      }
      this.updateAlertCounts();
    }
    this.updateDisplayedAnnunciations();
  }

  /**
   * Clear the annunciation display.
   */
  private clearAnnunciations(): void {
    this.activeAnns.length = 0;

    if (this.props.alertCounts !== undefined) {
      this.props.alertCounts.set('numWarning', 0);
      this.props.alertCounts.set('numCaution', 0);
      this.props.alertCounts.set('numAdvisory', 0);
      this.props.alertCounts.set('numSafeOp', 0);
      this.updateAlertCounts();
    }
    this.updateDisplayedAnnunciations();
  }

  /**
   * Update our internal alert counts.  For efficiency we only update aggregate totals here,
   * it's up to other code to individually increment the per-alert-class totals when an alert
   * gets added or removed.
   */
  private updateAlertCounts(): void {
    if (this.props.alertCounts !== undefined) {
      this.props.alertCounts.set('totalAlerts', this.activeAnns.length);
      this.props.alertCounts.set('countAboveWindow', this.topAlertIndex);
      this.props.alertCounts.set('countBelowWindow', Math.max(this.activeAnns.length - this.messageCount.get() - this.topAlertIndex, 0));
    }
  }

  /**
   * Update the displayed divs with current annunciation status.
   */
  protected updateDisplayedAnnunciations(): void {
    const end = Math.min(this.messageSlots.length, this.activeAnns.length - this.topAlertIndex);

    for (let i = 0; i < end; i++) {
      const ann = this.activeAnns[i + this.topAlertIndex];
      const entry = this.messageSlots[i];

      entry.isVisible.set(true);

      entry.text.set(ann.message + (ann.suffixes !== undefined ? ' ' + ann.suffixes?.join('-') : ''));

      entry.cssClass.toggle('warning', ann.priority === AnnunciationType.Warning);
      entry.cssClass.toggle('caution', ann.priority === AnnunciationType.Caution);
      entry.cssClass.toggle('advisory', ann.priority === AnnunciationType.Advisory);
      entry.cssClass.toggle('safe-op', ann.priority === AnnunciationType.SafeOp);

      if (ann.priority === AnnunciationType.Caution || ann.priority === AnnunciationType.Warning) {
        // If the message is a caution or warning, we need to handle the acknowledged/unacknowledged state.
        // Typically, unacknowledged messages will need to be flashing, and we want all such messages to flash in sync
        // with each other. To accomplish that, whenever any slot is changed, we will remove the unacknowledged CSS
        // class from all slots, then wait one frame and add that class back to all slots displaying an unacknowledged
        // message. This ensures that any animations that are applied using the CSS class are reset for all
        // unacknowledged messages at the same time.

        entry.isAcknowledged = ann.acknowledged;
        entry.cssClass.delete('new');
        entry.cssClass.toggle('acked', ann.acknowledged);

        if (!ann.acknowledged && !this.refreshNewMessageCssClassTimer.isPending()) {
          this.refreshNewMessageCssClassTimer.schedule(this.refreshNewMessageCssClassCallback, 0);
        }
      } else {
        entry.isAcknowledged = undefined;
        entry.cssClass.delete('acked');
        entry.cssClass.delete('new');
      }
    }

    for (let i = end; i < this.messageSlots.length; i++) {
      const entry = this.messageSlots[i];
      entry.isVisible.set(false);
      entry.isAcknowledged = undefined;
    }
  }

  /**
   * Adds the `new` CSS class to all of this display's message slots that are currently displaying an unacknowledged
   * message.
   */
  private refreshNewMessageCssClass(): void {
    for (let i = 0; i < this.messageSlots.length; i++) {
      const entry = this.messageSlots[i];
      if (entry.isAcknowledged === false) {
        entry.cssClass.add('new');
      }
    }
  }

  /**
   * Scroll the message window down.
   */
  public scrollDown(): void {
    if (this.topAlertIndex < this.activeAnns.length - this.messageCount.get() && this.activeAnns.length > this.messageCount.get()) {
      this.topAlertIndex++;
      this.updateDisplayedAnnunciations();
      this.updateAlertCounts();
    }
  }

  /**
   * Scroll the message window up.
   */
  public scrollUp(): void {
    if (this.topAlertIndex > 0) {
      this.topAlertIndex--;
      this.updateDisplayedAnnunciations();
      this.updateAlertCounts();
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='cas-display' ref={this.casDiv}>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.refreshNewMessageCssClassTimer.clear();

    this.messageCountSub?.destroy();
    this.messageSub?.destroy();

    super.destroy();
  }
}
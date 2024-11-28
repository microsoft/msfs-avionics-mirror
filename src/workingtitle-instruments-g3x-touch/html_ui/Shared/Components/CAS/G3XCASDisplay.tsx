import {
  AnnunciationType, CasActiveMessage, DebounceTimer, DisplayComponent, EventBus, FSComponent, SetSubject, Subject, Subscribable, SubscribableArray,
  SubscribableArrayEventType, Subscription, VNode
} from '@microsoft/msfs-sdk';

import './G3XCASDisplay.css';

/**
 * Component props for G3XCASDisplay.
 */
export interface G3XCASDisplayProps {
  /** The event bus */
  bus: EventBus;

  /** An array of our configured annunciations. */
  annunciations: SubscribableArray<CasActiveMessage>;

  /** The maximum number of annunciations that can be displayed at the same time. */
  numAnnunciationsToShow: Subscribable<number>;

  /** Whether the UI panes are currently displayed in split mode. */
  isPaneSplit: Subscribable<boolean>;
}


/**
 * An entry describing a CAS display message slot.
 */
type G3XCASDisplayMessageSlotEntry = {
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
 * A G3X CAS display
 */
export class G3XCASDisplay extends DisplayComponent<G3XCASDisplayProps> {

  private readonly casDiv = FSComponent.createRef<HTMLDivElement>();

  private readonly activeAnns: Array<CasActiveMessage> = [];

  private readonly messageSlots: G3XCASDisplayMessageSlotEntry[] = [];

  private readonly refreshNewMessageCssClassTimer = new DebounceTimer();
  private readonly refreshNewMessageCssClassCallback = this.refreshNewMessageCssClass.bind(this);

  private numAnnunciationsToShowSub?: Subscription;
  private annunciationsSub?: Subscription;

  private thisNode?: VNode;

  private readonly totalAlerts = Subject.create(0);

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.numAnnunciationsToShowSub = this.props.numAnnunciationsToShow.sub(this.onNumAnnunciationsToShowChanged.bind(this));

    this.annunciationsSub = this.props.annunciations.sub(this.onMessagesChanged.bind(this), true);

    this.renderMessageSlots();
    this.updateAlertCounts();
  }

  /**
   * Responds to when the maximum displayed message count changes.
   */
  private onNumAnnunciationsToShowChanged(): void {
    this.renderMessageSlots();
    this.updateAlertCounts();
    this.updateDisplayedAnnunciations();
  }

  /**
   * Render our the divs for our alerts.
   */
  private renderMessageSlots(): void {
    const count = Math.max(0, this.props.numAnnunciationsToShow.get());

    if (count > this.messageSlots.length) {
      // Add additional slots.

      while (this.messageSlots.length < count) {
        const entry = {
          isVisible: Subject.create(false),
          text: Subject.create(''),
          cssClass: SetSubject.create(['cas-annunciation']),
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
        this.addAnnunciation(idx, item);
        break;
      case SubscribableArrayEventType.Removed:
        this.removeAnnunciation(idx);
        break;
    }
  }

  /**
   * Add an annunciation to the active list.
   * @param idx The index of the annunciations array for the annunciation.
   * @param item The annunciation configuration to add
   */
  protected addAnnunciation(idx: number, item: CasActiveMessage): void {
    this.activeAnns.splice(idx, 0, item);

    this.updateAlertCounts();

    this.updateDisplayedAnnunciations();
  }

  /**
   * Remove an annunciation from the active list if present.
   * @param idx The index of the annunciations array for the annunciation.
   */
  protected removeAnnunciation(idx: number): void {
    this.activeAnns.splice(idx, 1);
    this.updateAlertCounts();
    this.updateDisplayedAnnunciations();
  }

  /**
   * Clear the annunciation display.
   */
  private clearAnnunciations(): void {
    this.activeAnns.length = 0;
    this.updateAlertCounts();
    this.updateDisplayedAnnunciations();
  }

  /**
   * Update our internal alert counts.  For efficiency we only update aggregate totals here,
   * it's up to other code to individually increment the per-alert-class totals when an alert
   * gets added or removed.
   */
  private updateAlertCounts(): void {
    this.totalAlerts.set(this.activeAnns.length);
  }

  /**
   * Update the displayed divs with current annunciation status.
   */
  protected updateDisplayedAnnunciations(): void {
    const end = Math.min(this.messageSlots.length, this.activeAnns.length);

    for (let i = 0; i < end; i++) {
      const ann = this.activeAnns[i];
      const entry = this.messageSlots[i];

      entry.isVisible.set(true);

      entry.text.set(ann.message + (ann.suffixes !== undefined ? ' ' + ann.suffixes?.join('-') : ''));

      entry.cssClass.toggle('cas-warning', ann.priority === AnnunciationType.Warning);
      entry.cssClass.toggle('cas-caution', ann.priority === AnnunciationType.Caution);
      entry.cssClass.toggle('cas-advisory', ann.priority === AnnunciationType.Advisory);
      entry.cssClass.toggle('cas-safe-op', ann.priority === AnnunciationType.SafeOp);

      if (ann.priority === AnnunciationType.Warning) {
        // If the message is warning, we need to handle the acknowledged/unacknowledged state.
        // Typically, unacknowledged messages will need to be flashing, and we want all such messages to flash in sync
        // with each other. To accomplish that, whenever any slot is changed, we will remove the unacknowledged CSS
        // class from all slots, then wait one frame and add that class back to all slots displaying an unacknowledged
        // message. This ensures that any animations that are applied using the CSS class are reset for all
        // unacknowledged messages at the same time.

        entry.isAcknowledged = ann.acknowledged;
        entry.cssClass.delete('cas-new');

        if (!ann.acknowledged && !this.refreshNewMessageCssClassTimer.isPending()) {
          this.refreshNewMessageCssClassTimer.schedule(this.refreshNewMessageCssClassCallback, 0);
        }
      } else {
        entry.isAcknowledged = undefined;
        entry.cssClass.delete('cas-new');
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
        entry.cssClass.add('cas-new');
      }
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div
        class={{
          'cas-container': true,
          'cas-container-split': this.props.isPaneSplit,
          'cas-container-full': this.props.isPaneSplit.map(v => !v),
          'hidden': this.totalAlerts.map(v => v === 0)
        }}
      >
        <div class='cas-display' ref={this.casDiv} />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);
    this.refreshNewMessageCssClassTimer.clear();

    this.numAnnunciationsToShowSub?.destroy();
    this.annunciationsSub?.destroy();
    super.destroy();
  }
}
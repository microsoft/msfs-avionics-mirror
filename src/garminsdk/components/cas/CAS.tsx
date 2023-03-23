import {
  AnnunciationType, CasActiveMessage, ComponentProps, DisplayComponent, EventBus, FSComponent, NodeReference, ObjectSubject, SubscribableArray, SubscribableArrayEventType, VNode
} from '@microsoft/msfs-sdk';


/** A data structure for passing back info on the display status. */
export type CASAlertCounts = {
  /** The total number of alerts that are active. */
  totalAlerts: number;
  /** The number present above the selected window. */
  countAboveWindow: number;
  /** The number present below the selected window. */
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
  numAnnunciationsShown: number;
  /** An optional subject to pass back the alert counts. */
  alertCounts?: ObjectSubject<CASAlertCounts>
}

/** A component for displaying CAS messages and playing sounds. */
export class CASDisplay<T extends CASProps> extends DisplayComponent<T> {
  private readonly casDiv = FSComponent.createRef<HTMLDivElement>();
  private readonly annDivs: NodeReference<HTMLDivElement>[] = [];
  private readonly activeAnns: Array<CasActiveMessage> = [];

  private _topAlertIndex = 0;

  /** @inheritdoc */
  public constructor(props: T) {
    super(props);
    this.props.annunciations.sub((idx, type, item) => {
      if (Array.isArray(item)) {
        // Insert into the specified index from the end of the array to keep
        // the provided order.
        for (let i = item.length - 1; i >= 0; i--) {
          this.handleArrayEvent(idx, type, item[i]);
        }
      } else {
        this.handleArrayEvent(idx, type, item as CasActiveMessage | undefined);
      }
    });
  }

  /**
   * Handle a SubscribableArrayEventType on a per-item bases.
   * @param idx The index of the item to operate on
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
          this.removeAnnunciation(idx, item); break;
      }
    }
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.renderAlertDivs();
  }

  /** Render our the divs for our alerts. */
  protected renderAlertDivs(): void {
    for (let i = 0; i < this.props.numAnnunciationsShown; i++) {
      this.annDivs.push(FSComponent.createRef<HTMLDivElement>());
      const div = <div class='annunciation' ref={this.annDivs[i]} />;
      this.casDiv.instance.appendChild(div.instance);
    }
  }

  /**
   * Get the current index of the top displayed message.
   * @returns The index of the top message
   */
  protected get topAlertIndex(): number {
    return this._topAlertIndex;
  }

  /**
   * Set the current index of the top displayed message and adjust our message counts.
   * @param index The new top index to use
   */
  protected set topAlertIndex(index: number) {
    this._topAlertIndex = index;
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
    if ((idx <= this.topAlertIndex || this.activeAnns.length - this.props.numAnnunciationsShown - this.topAlertIndex <= 0) && this.topAlertIndex > 0) {
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
    this.activeAnns.splice(0, this.activeAnns.length);
    this.updateDisplayedAnnunciations();
    if (this.props.alertCounts !== undefined) {
      this.props.alertCounts.set('numWarning', 0);
      this.props.alertCounts.set('numCaution', 0);
      this.props.alertCounts.set('numAdvisory', 0);
      this.props.alertCounts.set('numSafeOp', 0);
      this.updateAlertCounts();
    }
  }

  /**
   * Update the displayed divs with current annunciation status.
   */
  protected updateDisplayedAnnunciations(): void {
    let divIter = 0;
    for (let annIter = this.topAlertIndex; annIter < this.activeAnns.length && divIter < this.props.numAnnunciationsShown; annIter++) {
      const ann = this.activeAnns[annIter];
      const div = this.annDivs[divIter++];
      div.instance.innerHTML = ann.message + (ann.suffixes !== undefined ? ' ' + ann.suffixes?.join('-') : '');
      div.instance.style.display = 'block';
      div.instance.className = 'annunciation';

      switch (ann.priority) {
        case AnnunciationType.Caution:
          div.instance.classList.add('caution');
          break;
        case AnnunciationType.Warning:
          div.instance.classList.add('warning');
          break;
        case AnnunciationType.Advisory:
          div.instance.classList.add('advisory');
          break;
        case AnnunciationType.SafeOp:
          div.instance.classList.add('safe-op');
          break;
      }

      if ([AnnunciationType.Caution, AnnunciationType.Warning].includes(ann.priority)) {
        if (!this.activeAnns[annIter].acknowledged) {
          // The timeout here helps the DOM notice that the class has changed
          // so that it will re-start the blinking animation.
          setTimeout(() => { div.instance.classList.add('new'); }, 0);
        } else {
          div.instance.classList.add('acked');
        }
      }
    }

    for (let i = divIter; i < this.annDivs.length; i++) {
      const div = this.annDivs[i];
      div.instance.innerHTML = '';
      div.instance.style.display = 'none';
      div.instance.className = 'annunciation';
    }
  }

  /**
   * Update our internal alert counts.  For efficiency we only update aggregate totals here,
   * it's up to other code to individually increment the per-alert-class totals when an alert
   * gets added or removed.
   */
  private updateAlertCounts(): void {
    if (this.props.alertCounts !== undefined) {
      this.props.alertCounts.set({
        totalAlerts: this.activeAnns.length,
        countAboveWindow: this.topAlertIndex,
        countBelowWindow: Math.max(this.activeAnns.length - this.props.numAnnunciationsShown - this.topAlertIndex, 0),
      });
    }
  }

  /**
   * Scroll the message window down.
   */
  public scrollDown(): void {
    if (this.topAlertIndex < this.activeAnns.length - this.props.numAnnunciationsShown && this.activeAnns.length > this.props.numAnnunciationsShown) {
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
    return <div class='cas-display' ref={this.casDiv}>
    </div>;
  }
}
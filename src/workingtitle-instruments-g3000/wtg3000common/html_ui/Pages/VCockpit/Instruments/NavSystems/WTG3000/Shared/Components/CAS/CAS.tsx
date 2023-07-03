import {
  AnnunciationType, CasActiveMessage, DisplayComponent, EventBus, FSComponent, ObjectSubject, Subject,
  Subscribable, SubscribableArray, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { CASAlertCounts, CASDisplay, CASProps } from '@microsoft/msfs-garminsdk';

import { PfdIndex } from '../../CommonTypes';
import { CASControlEvents } from './CASControlEvents';

/**
 * Component props for G3000CASDisplay.
 */
export interface G3000CASDisplayProps extends CASProps {
  /** The index of the PFD(s) that we process control messages for. */
  pfdIndices: PfdIndex[];
}

/**
 * A G3000 scrolling CAS display which supports the event bus scroll commands defined by {@link CASControlEvents}.
 */
export class G3000CASDisplay extends CASDisplay<G3000CASDisplayProps> {
  protected readonly controlEventsPub = this.props.bus.getPublisher<CASControlEvents>();
  protected readonly controlEventsSub = this.props.bus.getSubscriber<CASControlEvents>();

  private alertCountsSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this.alertCountsSub = this.props.alertCounts?.sub((data: CASAlertCounts, key: keyof CASAlertCounts, newValue: number, oldValue: number): void => {
      switch (key) {
        case 'countAboveWindow':
          if (newValue > 0 && oldValue === 0) {
            this.handleScrollUpEnable(true);
          } else if (newValue === 0 && oldValue > 0) {
            this.handleScrollUpEnable(false);
          }
          break;
        case 'countBelowWindow':
          if (newValue > 0 && oldValue === 0) {
            this.handleScrollDownEnable(true);
          } else if (newValue === 0 && oldValue > 0) {
            this.handleScrollDownEnable(false);
          }
          break;
      }
    });

    this.subscribeForScollCommands();
  }

  /**
   * Handle a scroll up (en|dis)able event.
   * @param enabled True to enable the control softkey, false to disable.
   * */
  protected handleScrollUpEnable(enabled: boolean): void {
    (this.props.pfdIndices ?? []).map(idx => this.controlEventsPub.pub(`cas_scroll_up_enable_${idx}`, enabled, true));
  }

  /**
   * Handle a scroll down (en|dis)able event.
   * @param enabled True to enable the control softkey, false to disable.
   * */
  protected handleScrollDownEnable(enabled: boolean): void {
    (this.props.pfdIndices ?? []).map(idx => this.controlEventsPub.pub(`cas_scroll_down_enable_${idx}`, enabled, true));
  }

  /** Subscribe for scroll command events */
  protected subscribeForScollCommands(): void {
    (this.props.pfdIndices ?? []).map(idx => this.controlEventsSub.on(`cas_scroll_up_${idx}`).handle((v: boolean) => v && this.scrollUp()));
    (this.props.pfdIndices ?? []).map(idx => this.controlEventsSub.on(`cas_scroll_down_${idx}`).handle((v: boolean) => v && this.scrollDown()));
  }

  /** @inheritdoc */
  public destroy(): void {
    this.alertCountsSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for CASMessageCount.
 */
export interface CASMessageCountProps {
  /** The bus. */
  bus: EventBus
  /** The count of messages above the window. */
  countAboveWindow: Subscribable<number>,
  /** The count of messages below the window. */
  countBelowWindow: Subscribable<number>,
  /** The highest current alert state. */
  highestAlertState: Subscribable<AnnunciationType | null>
}

/**
 * A component which displays out-of-view CAS message counts for scrollable CAS message displays.
 */
export class CASMessageCount extends DisplayComponent<CASMessageCountProps> {
  private casSpanRef = FSComponent.createRef<HTMLSpanElement>();

  private readonly countAboveWindowText = this.props.countAboveWindow.map(count => count.toString());
  private readonly countBelowWindowText = this.props.countBelowWindow.map(count => count.toString());

  private highestAlertStateSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.highestAlertStateSub = this.props.highestAlertState.sub((v: AnnunciationType | null): void => {
      switch (v) {
        case AnnunciationType.Warning:
          this.casSpanRef.instance.classList.remove('caution');
          this.casSpanRef.instance.classList.add('warning');
          break;
        case AnnunciationType.Caution:
          this.casSpanRef.instance.classList.remove('warning');
          this.casSpanRef.instance.classList.add('caution');
          break;
        default:
          this.casSpanRef.instance.classList.remove('warning');
          this.casSpanRef.instance.classList.remove('caution');
      }
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return <div class='cas-message-count'>
      <span class='cas-message-count-header' ref={this.casSpanRef}>CAS</span>
      <span>{this.countAboveWindowText}↑</span>
      <span>{this.countBelowWindowText}↓</span>
    </div>;
  }

  /** @inheritdoc */
  public destroy(): void {
    this.countAboveWindowText.destroy();
    this.countBelowWindowText.destroy();

    this.highestAlertStateSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for G3000FullCASDisplay.
 */
export interface G3000FullCASDisplayProps {
  /** The event bus */
  bus: EventBus;

  /** An array of our configured annunciations. */
  annunciations: SubscribableArray<CasActiveMessage>;

  /** The maximum number of annunciations that can be displayed at the same time. */
  numAnnunciationsShown: number | Subscribable<number>;

  /** The indices of the PFD(s) this display processes control messages for. */
  pfdIndices: PfdIndex[];
}

/**
 * A G3000 scrolling CAS display which displays out-of-view message counts and supports the event bus scroll commands
 * defined by {@link CASControlEvents}.
 */
export class G3000FullCASDisplay extends DisplayComponent<G3000FullCASDisplayProps> {
  private thisNode?: VNode;

  private readonly alertCounts = ObjectSubject.create<CASAlertCounts>({
    totalAlerts: 0,
    countAboveWindow: 0,
    countBelowWindow: 0,
    numWarning: 0,
    numCaution: 0,
    numAdvisory: 0,
    numSafeOp: 0
  });

  private readonly countAboveWindow = Subject.create(0);
  private readonly countBelowWindow = Subject.create(0);
  private readonly totalAlerts = Subject.create(0);
  private readonly highestAlertState = Subject.create<AnnunciationType | null>(null);

  private readonly divRef = FSComponent.createRef<HTMLDivElement>();

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.alertCounts.sub((data: CASAlertCounts, key: keyof CASAlertCounts, newValue: number): void => {
      switch (key) {
        case 'totalAlerts':
          this.totalAlerts.set(newValue); break;
        case 'countAboveWindow':
          this.countAboveWindow.set(newValue); break;
        case 'countBelowWindow':
          this.countBelowWindow.set(newValue); break;
        case 'numWarning':
        case 'numCaution':
        case 'numAdvisory':
        case 'numSafeOp':
          this.highestAlertState.set(data.numWarning > 0 ? AnnunciationType.Warning : data.numCaution > 0 ? AnnunciationType.Caution : null);
          break;
      }
    }, true);

    this.totalAlerts.sub((v: number) => {
      if (v === 0) {
        this.divRef.instance.style.display = 'none';
      } else {
        this.divRef.instance.style.display = '';
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='cas-container' ref={this.divRef}>
        <G3000CASDisplay
          bus={this.props.bus}
          numAnnunciationsShown={this.props.numAnnunciationsShown}
          annunciations={this.props.annunciations}
          alertCounts={this.alertCounts}
          pfdIndices={this.props.pfdIndices}
        />
        <CASMessageCount
          bus={this.props.bus}
          countAboveWindow={this.countAboveWindow}
          countBelowWindow={this.countBelowWindow}
          highestAlertState={this.highestAlertState}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}

// For backwards compatibility.
export { type G3000FullCASDisplayProps as G3000CASProps, G3000FullCASDisplay as CAS };
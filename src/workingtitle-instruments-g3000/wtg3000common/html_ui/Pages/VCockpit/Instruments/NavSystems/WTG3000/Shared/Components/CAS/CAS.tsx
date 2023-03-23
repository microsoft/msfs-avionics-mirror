import { AnnunciationType, CasActiveMessage, DisplayComponent, EventBus, FSComponent, ObjectSubject, Subject, Subscribable, SubscribableArray, VNode } from '@microsoft/msfs-sdk';

import { CASAlertCounts, CASDisplay, CASProps } from '@microsoft/msfs-garminsdk';

import { PfdIndex } from '../../CommonTypes';
import { CASControlEvents } from './CASControlEvents';

/** Props for the G3000-specific CAS display. */
export interface G3000CASDisplayProps extends CASProps {
  /** The index of the PFD(s) that we process control messages for. */
  pfdIndices: PfdIndex[];
}

/** Our version of a CAS. */
export class G3000CASDisplay extends CASDisplay<G3000CASDisplayProps> {
  protected controlEventsPub = this.props.bus.getPublisher<CASControlEvents>();
  protected controlEventsSub = this.props.bus.getSubscriber<CASControlEvents>();

  /** @inheritdoc */
  public onAfterRender(): void {
    super.onAfterRender();
    if (this.props.alertCounts) {
      this.props.alertCounts.sub((data: CASAlertCounts, key: keyof CASAlertCounts, newValue: number, oldValue: number): void => {
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
    }
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
}

/**
 * Properties for the component that shows CAS message counts.
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

/** The UI component that displays CAS message counts. */
export class CASMessageCount extends DisplayComponent<CASMessageCountProps> {
  private casSpanRef = FSComponent.createRef<HTMLSpanElement>();

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.highestAlertState.sub((v: AnnunciationType | null): void => {
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
      <span>{this.props.countAboveWindow}↑</span>
      <span>{this.props.countBelowWindow}↓</span>
    </div>;
  }
}

/**
 * Properties for the G3000-specific CAS display.
 */
export interface G3000CASProps {
  /** The event bus */
  bus: EventBus;

  /** An array of our configured annunciations. */
  annunciations: SubscribableArray<CasActiveMessage>;

  /** The maximum number of annunciations that can be displayed at the same time. */
  numAnnunciationsShown: number;

  /** The indices of the PFD(s) this display processes control messages for. */
  pfdIndices: PfdIndex[];
}

/** Our cas display */
export class CAS extends DisplayComponent<G3000CASProps> {
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

  private divRef = FSComponent.createRef<HTMLDivElement>();

  /** @inheritdoc */
  public constructor(props: G3000CASProps) {
    super(props);
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
  }

  /** @inheritdoc */
  public onAfterRender(): void {
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
}
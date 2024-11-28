import {
  AnnunciationType, CasActiveMessage, ComponentProps, DisplayComponent, EventBus, FSComponent, MutableSubscribable,
  Subject, Subscribable, SubscribableArray, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { CasDisplay2, CasDisplay2ScrollState } from '@microsoft/msfs-garminsdk';

import { PfdIndex } from '../../CommonTypes';
import { CASControlEvents } from './CASControlEvents';

/**
 * Component props for {@link G3000CASDisplay2}.
 */
export interface G3000CASDisplay2Props extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The messages to display. */
  messages: SubscribableArray<CasActiveMessage>;

  /** The maximum number of messages that can be displayed simultaneously. */
  maxMessageCount: number | Subscribable<number>;

  /** The maximum number of warning messages that are always displayed and cannot be scrolled. Defaults to `0`. */
  maxUnscrollableWarningCount?: number | Subscribable<number>;

  /** A mutable subscribable to which to write the scroll state of the display. */
  scrollState?: MutableSubscribable<any, Readonly<CasDisplay2ScrollState>>;

  /** The PFD indices of the event bus scroll commands to which the display should respond. */
  pfdIndices: Iterable<PfdIndex>;
}

/**
 * A G3000 scrollable CAS display that supports the event bus scroll commands defined by {@link CASControlEvents}.
 */
export class G3000CASDisplay2 extends DisplayComponent<G3000CASDisplay2Props> {
  private readonly displayRef = FSComponent.createRef<CasDisplay2>();

  private readonly publisher = this.props.bus.getPublisher<CASControlEvents>();

  private readonly scrollState = Subject.create<Readonly<CasDisplay2ScrollState>>({
    unscrollableSlotCount: 0,
    scrollableSlotCount: 0,
    scrollableMessages: [],
    scrollPos: 0,
    messageBeforeCount: 0,
    messageAfterCount: 0,
    messageBeforePriorityCounts: {
      [AnnunciationType.Warning]: 0,
      [AnnunciationType.Caution]: 0,
      [AnnunciationType.Advisory]: 0,
      [AnnunciationType.SafeOp]: 0
    },
    messageAfterPriorityCounts: {
      [AnnunciationType.Warning]: 0,
      [AnnunciationType.Caution]: 0,
      [AnnunciationType.Advisory]: 0,
      [AnnunciationType.SafeOp]: 0
    }
  });

  private readonly pfdIndices = Array.from(new Set(this.props.pfdIndices));

  private canScrollUp: boolean | undefined = undefined;
  private canScrollDown: boolean | undefined = undefined;

  private scrollStatePipe?: Subscription;
  private readonly controlEventSubs: Subscription[] = [];

  /** @inheritDoc */
  public onAfterRender(): void {
    if (this.props.scrollState) {
      this.scrollStatePipe = this.scrollState.pipe(this.props.scrollState);
    }

    this.scrollState.sub(this.onScrollStateChanged.bind(this), true);

    const sub = this.props.bus.getSubscriber<CASControlEvents>();

    const onScrollUpEvent = this.onScrollUpEvent.bind(this);
    const onScrollDownEvent = this.onScrollDownEvent.bind(this);
    for (const index of this.pfdIndices) {
      this.controlEventSubs.push(
        sub.on(`cas_scroll_up_${index}`).handle(onScrollUpEvent),
        sub.on(`cas_scroll_down_${index}`).handle(onScrollDownEvent)
      );
    }
  }

  /**
   * Responds to when the scroll state of the display changes.
   * @param scrollState The new scroll state.
   */
  private onScrollStateChanged(scrollState: Readonly<CasDisplay2ScrollState>): void {
    const canScrollUp = scrollState.scrollableSlotCount > 0 && scrollState.messageBeforeCount > 0;
    const canScrollDown = scrollState.scrollableSlotCount > 0 && scrollState.messageAfterCount > 0;

    if (canScrollUp !== this.canScrollUp) {
      this.canScrollUp = canScrollUp;
      for (const index of this.pfdIndices) {
        this.publisher.pub(`cas_scroll_up_enable_${index}`, canScrollUp, true, true);
      }
    }

    if (canScrollDown !== this.canScrollDown) {
      this.canScrollDown = canScrollDown;
      for (const index of this.pfdIndices) {
        this.publisher.pub(`cas_scroll_down_enable_${index}`, canScrollDown, true, true);
      }
    }
  }

  /**
   * Responds to when a scroll up command event is received.
   */
  private onScrollUpEvent(): void {
    this.displayRef.instance.scrollUp();
  }

  /**
   * Responds to when a scroll down command event is received.
   */
  private onScrollDownEvent(): void {
    this.displayRef.instance.scrollDown();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <CasDisplay2
        ref={this.displayRef}
        messages={this.props.messages}
        maxMessageCount={this.props.maxMessageCount}
        maxUnscrollableWarningCount={this.props.maxMessageCount}
        scrollState={this.scrollState}
        class={{
          'cas-display-2-scroll-enabled': this.scrollState.map(state => {
            return state.scrollableSlotCount > 0 && (state.messageBeforeCount > 0 || state.messageAfterCount > 0);
          })
        }}
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.displayRef.getOrDefault()?.destroy();

    this.scrollStatePipe?.destroy();

    for (const sub of this.controlEventSubs) {
      sub.destroy();
    }

    super.destroy();
  }
}

/**
 * Component props for {@link G3000CASMessageCount}.
 */
export interface G3000CASMessageCountProps {
  /** The number of scrollable messages that are positioned above the first scrollable message slot. */
  messageAboveCount: Subscribable<number>;

  /** The number of scrollable messages that are positioned below the last scrollable message slot. */
  messageBelowCount: Subscribable<number>;

  /**
   * The highest message priority among all scrollable messages that are scrolled out of the view, or `null` if there
   * are no out-of-view messages.
   */
  highestPriority: Subscribable<AnnunciationType | null>;
}

/**
 * A component that displays out-of-view CAS message counts for scrollable CAS message displays.
 */
export class G3000CASMessageCount extends DisplayComponent<G3000CASMessageCountProps> {
  private readonly labelRef = FSComponent.createRef<HTMLDivElement>();

  private readonly messageAboveCountText = this.props.messageAboveCount.map(count => count.toString());
  private readonly messageBelowCountText = this.props.messageBelowCount.map(count => count.toString());

  private readonly subscriptions: Subscription[] = [
    this.messageAboveCountText,
    this.messageBelowCountText
  ];

  /** @inheritDoc */
  public onAfterRender(): void {
    this.subscriptions.push(
      this.props.highestPriority.sub(this.onHighestPriorityChanged.bind(this), true)
    );
  }

  /**
   * Responds to when the highest out-of-view message priority changes.
   * @param priority The new highest out-of-view message priority, or `null` if there are no out-of-view messages.
   */
  private onHighestPriorityChanged(priority: AnnunciationType | null): void {
    switch (priority) {
      case AnnunciationType.Warning:
        this.labelRef.instance.classList.remove('cas-message-count-label-caution');
        this.labelRef.instance.classList.add('cas-message-count-label-warning');
        break;
      case AnnunciationType.Caution:
        this.labelRef.instance.classList.remove('cas-message-count-label-warning');
        this.labelRef.instance.classList.add('cas-message-count-label-caution');
        break;
      default:
        this.labelRef.instance.classList.remove('cas-message-count-label-warning');
        this.labelRef.instance.classList.remove('cas-message-count-label-caution');
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='cas-message-count'>
        <div ref={this.labelRef} class='cas-message-count-label'>CAS</div>
        <div class='cas-message-count-count cas-message-count-count-above'>
          <span>{this.messageAboveCountText}</span><span class='cas-message-count-count-arrow'>↑</span>
        </div>
        <div class='cas-message-count-count cas-message-count-count-below'>
          <span>{this.messageBelowCountText}</span><span class='cas-message-count-count-arrow'>↓</span>
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}

/**
 * Component props for {@link G3000CASScrollBar}.
 */
export interface G3000CASScrollBarProps {
  /** The scroll state of the scroll bar's parent display. */
  scrollState: Subscribable<Readonly<CasDisplay2ScrollState>>;
}

/**
 * A scroll bar for G3000 scrollable CAS message displays.
 */
export class G3000CASScrollBar extends DisplayComponent<G3000CASScrollBarProps> {
  private readonly upArrowEnabled = Subject.create(false);
  private readonly downArrowEnabled = Subject.create(false);

  private readonly warningShadingHeight = Subject.create('0%');

  private readonly cautionShadingTop = Subject.create('0%');
  private readonly cautionShadingHeight = Subject.create('0%');

  private readonly barTop = Subject.create('0%');
  private readonly barHeight = Subject.create('0%');

  private stateSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.stateSub = this.props.scrollState.sub(this.onScrollStateChanged.bind(this), true);
  }

  /**
   * Responds to when the scroll state of this scroll bar's parent display changes.
   * @param state The new scroll state.
   */
  private onScrollStateChanged(state: Readonly<CasDisplay2ScrollState>): void {
    const messageCount = state.scrollableMessages.length;

    if (messageCount === 0) {
      this.upArrowEnabled.set(false);
      this.downArrowEnabled.set(false);
      this.warningShadingHeight.set('0%');
      this.cautionShadingTop.set('0%');
      this.cautionShadingHeight.set('0%');
      this.barTop.set('0%');
      this.barHeight.set('0%');
      return;
    }

    const barTop = state.scrollPos / messageCount;
    const barHeight = state.scrollableSlotCount / messageCount;

    // We are guaranteed that warning messages are displayed first, then caution messages, then advisory and safe-op
    // messages.

    let warningMessageEnd = 0;
    let cautionMessageEnd = 0;

    for (let i = 0; i < messageCount; i++) {
      const message = state.scrollableMessages[i];
      if (message.priority === AnnunciationType.Warning) {
        warningMessageEnd = cautionMessageEnd = (i + 1) / messageCount;
      } else if (message.priority === AnnunciationType.Caution) {
        cautionMessageEnd = (i + 1) / messageCount;
      }
    }

    const warningShadingHeight = warningMessageEnd;
    const cautionShadingHeight = cautionMessageEnd - warningMessageEnd;

    this.upArrowEnabled.set(state.scrollPos > 0);
    this.downArrowEnabled.set(state.scrollPos + state.scrollableSlotCount < messageCount);

    this.warningShadingHeight.set(`${warningShadingHeight * 100}%`);
    this.cautionShadingTop.set(`${warningShadingHeight * 100}%`);
    this.cautionShadingHeight.set(`${cautionShadingHeight * 100}%`);

    this.barTop.set(`${barTop * 100}%`);
    this.barHeight.set(`${barHeight * 100}%`);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='cas-scroll-bar'>
        <svg
          viewBox='0 0 7 4'
          preserveAspectRatio='none'
          class={{ 'cas-scroll-bar-arrow': true, 'cas-scroll-bar-arrow-enabled': this.upArrowEnabled }}
        >
          <path d='M 3.5 0 l 3.5 4 h -7 Z' />
        </svg>
        <div class='cas-scroll-bar-bar-container' style='position: relative;'>
          <div class='cas-scroll-bar-line' />
          <div
            class='cas-scroll-bar-shading cas-scroll-bar-shading-caution'
            style={{
              'position': 'absolute',
              'top': this.cautionShadingTop,
              'height': this.cautionShadingHeight
            }}
          />
          <div
            class='cas-scroll-bar-shading cas-scroll-bar-shading-warning'
            style={{
              'position': 'absolute',
              'top': '0%',
              'height': this.warningShadingHeight
            }}
          />
          <div
            class='cas-scroll-bar-bar'
            style={{
              'position': 'absolute',
              'top': this.barTop,
              'height': this.barHeight
            }}
          />
        </div>
        <svg
          viewBox='0 0 7 4'
          preserveAspectRatio='none'
          class={{ 'cas-scroll-bar-arrow': true, 'cas-scroll-bar-arrow-enabled': this.downArrowEnabled }}
        >
          <path d='M 3.5 4 l 3.5 -4 h -7 Z' />
        </svg>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.stateSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for {@link G3000FullCASDisplay2}.
 */
export interface G3000FullCASDisplay2Props {
  /** The event bus */
  bus: EventBus;

  /** The messages to display. */
  messages: SubscribableArray<CasActiveMessage>;

  /** The maximum number of messages that can be displayed simultaneously. */
  maxMessageCount: number | Subscribable<number>;

  /** The maximum number of warning messages that are always displayed and cannot be scrolled. Defaults to `0`. */
  maxUnscrollableWarningCount?: number | Subscribable<number>;

  /** The PFD indices of the event bus scroll commands to which the display should respond. */
  pfdIndices: PfdIndex[];

  /**
   * The `data-checklist` attribute to set on the display's root element, or `undefined` if the attribute should not be
   * set.
   */
  dataChecklist?: string;
}

/**
 * A G3000 scrollable CAS display that supports the event bus scroll commands defined by {@link CASControlEvents}
 * and includes out-of-view message counts and a scroll bar.
 */
export class G3000FullCASDisplay2 extends DisplayComponent<G3000FullCASDisplay2Props> {
  private static readonly PRIORITY_TYPES = [
    AnnunciationType.Warning,
    AnnunciationType.Caution,
    AnnunciationType.Advisory,
    AnnunciationType.SafeOp
  ];

  private thisNode?: VNode;

  private readonly scrollState = Subject.create<Readonly<CasDisplay2ScrollState>>({
    unscrollableSlotCount: 0,
    scrollableSlotCount: 0,
    scrollableMessages: [],
    scrollPos: 0,
    messageBeforeCount: 0,
    messageAfterCount: 0,
    messageBeforePriorityCounts: {
      [AnnunciationType.Warning]: 0,
      [AnnunciationType.Caution]: 0,
      [AnnunciationType.Advisory]: 0,
      [AnnunciationType.SafeOp]: 0
    },
    messageAfterPriorityCounts: {
      [AnnunciationType.Warning]: 0,
      [AnnunciationType.Caution]: 0,
      [AnnunciationType.Advisory]: 0,
      [AnnunciationType.SafeOp]: 0
    }
  });

  private readonly display = this.scrollState.map(state => state.unscrollableSlotCount + state.scrollableSlotCount > 0 ? '' : 'none');

  private readonly isScrollEnabled = this.scrollState.map(state => state.scrollableSlotCount > 0 && state.scrollableSlotCount < state.scrollableMessages.length);
  private readonly messageAboveCount = this.scrollState.map(state => state.messageBeforeCount);
  private readonly messageBelowCount = this.scrollState.map(state => state.messageAfterCount);
  private readonly highestPriority = this.scrollState.map(state => {
    for (const priority of G3000FullCASDisplay2.PRIORITY_TYPES) {
      if (state.messageBeforePriorityCounts[priority] + state.messageAfterPriorityCounts[priority] > 0) {
        return priority;
      }
    }

    return null;
  });

  private readonly scrollableFrac = this.scrollState.map(state => {
    const totalCount = state.unscrollableSlotCount + state.scrollableSlotCount;
    return `${totalCount > 0 ? state.scrollableSlotCount / totalCount : 1}`;
  });

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div
        class={{ 'full-cas-display-2': true, 'full-cas-display-2-scroll-enabled': this.isScrollEnabled }}
        style={{ 'display': this.display, '--full-cas-display-2-scrollable-frac': this.scrollableFrac }}
        data-checklist={this.props.dataChecklist ?? ''}
      >
        <div class='full-cas-display-2-list'>
          <G3000CASDisplay2
            bus={this.props.bus}
            messages={this.props.messages}
            maxMessageCount={this.props.maxMessageCount}
            maxUnscrollableWarningCount={this.props.maxUnscrollableWarningCount}
            scrollState={this.scrollState}
            pfdIndices={this.props.pfdIndices}
          />
          <div class='full-cas-display-2-scroll-bar-container'>
            <G3000CASScrollBar
              scrollState={this.scrollState}
            />
          </div>
        </div>
        <G3000CASMessageCount
          messageAboveCount={this.messageAboveCount}
          messageBelowCount={this.messageBelowCount}
          highestPriority={this.highestPriority}
        />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}

import {
  ClockEvents, ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FSComponent, MappedSubject, ReadonlyFloat64Array, SetSubject, Subject,
  Subscribable, SubscribableMapFunctions, SubscribableSet, SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { UiPane } from './UiPane';
import { UiPaneSizeMode } from './UiPaneTypes';

/**
 * Component props for UiPaneContainer.
 */
export interface UiPaneContainerProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The size of a pane's content area in full mode, as `[width, height]` in pixels. */
  paneFullSize: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** The size of pane 1's content area in half mode, as `[width, height]` in pixels. */
  pane1HalfSize: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** The size of pane 2's content area in half mode, as `[width, height]` in pixels. */
  pane2HalfSize: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** The update frequency of the container's panes. */
  updateFreq: number | Subscribable<number>;

  /** Whether to alternate updates every other update cycle for each pane while both panes are visible. Defaults to `false`. */
  alternateUpdatesInSplitMode?: boolean | Subscribable<boolean>;

  /** Whether pane 1 is visible. */
  isPane1Visible: Subscribable<boolean>;

  /** Whether pane 2 is visible. */
  isPane2Visible: Subscribable<boolean>;

  /** The content to render to pane 1. */
  pane1Content?: VNode;

  /** The content to render to pane 2. */
  pane2Content?: VNode;

  /** CSS class(es) to apply to the root element of the container. */
  class?: string | SubscribableSet<string>;
}

/**
 * A container for two UI panes. Automatically controls the size of each pane such that if both are visible, each is
 * sized as a half pane, and if only one is visible, it is sized as a full pane.
 */
export class UiPaneContainer extends DisplayComponent<UiPaneContainerProps> {
  private static readonly SIZE_MODE_MAP: Record<UiPaneSizeMode, number> = {
    [UiPaneSizeMode.Hidden]: 0,
    [UiPaneSizeMode.Half]: 1,
    [UiPaneSizeMode.Full]: 2
  };

  private readonly pane1Ref = FSComponent.createRef<UiPane>();
  private readonly pane2Ref = FSComponent.createRef<UiPane>();

  private readonly cssClassSet = SetSubject.create(['ui-pane-container']);

  private readonly pane1SizeMode = Subject.create(UiPaneSizeMode.Hidden);
  private readonly pane2SizeMode = Subject.create(UiPaneSizeMode.Hidden);

  private readonly paneState = MappedSubject.create(
    this.props.isPane1Visible,
    this.props.isPane2Visible
  );
  private readonly isSplit = this.paneState.map(([isPane1Visible, isPane2Visible]) => isPane1Visible && isPane2Visible);

  private readonly alternateUpdatesInSplitMode = SubscribableUtils.toSubscribable(this.props.alternateUpdatesInSplitMode ?? false, true);
  private readonly updateFreq = SubscribableUtils.toSubscribable(this.props.updateFreq, true);
  private readonly updateClock = ConsumerSubject.create(null, 0).pause();
  private tickCounter = 0;

  private isAlive = true;
  private _isAwake = false;

  private cssClassSub?: Subscription;
  private paneStateSub?: Subscription;
  private updateFreqSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.paneStateSub = this.paneState.sub(([isPane1Visible, isPane2Visible]) => {
      const pane1OldSize = UiPaneContainer.SIZE_MODE_MAP[this.pane1SizeMode.get()];
      const pane2OldSize = UiPaneContainer.SIZE_MODE_MAP[this.pane2SizeMode.get()];

      const pane1SizeMode = isPane1Visible
        ? isPane2Visible ? UiPaneSizeMode.Half : UiPaneSizeMode.Full
        : UiPaneSizeMode.Hidden;

      const pane2SizeMode = isPane2Visible
        ? isPane1Visible ? UiPaneSizeMode.Half : UiPaneSizeMode.Full
        : UiPaneSizeMode.Hidden;

      const pane1SizeDelta = UiPaneContainer.SIZE_MODE_MAP[pane1SizeMode] - pane1OldSize;
      const pane2SizeDelta = UiPaneContainer.SIZE_MODE_MAP[pane2SizeMode] - pane2OldSize;

      // Always apply the new size mode to the pane that is "shrinking" more first. Ties go to pane 1.
      if (pane2SizeDelta < pane1SizeDelta) {
        this.pane2SizeMode.set(pane2SizeMode);
        this.pane1SizeMode.set(pane1SizeMode);
      } else {
        this.pane1SizeMode.set(pane1SizeMode);
        this.pane2SizeMode.set(pane2SizeMode);
      }
    }, this._isAwake, !this._isAwake);

    this.updateClock.sub(this.update.bind(this));

    if (this._isAwake) {
      this.pane1Ref.instance.wake();
      this.pane2Ref.instance.wake();
    }

    const realTimeConsumer = this.props.bus.getSubscriber<ClockEvents>().on('realTime');

    this.updateFreqSub = this.updateFreq.sub(freq => {
      this.updateClock.setConsumer(realTimeConsumer.atFrequency(freq));
    }, this._isAwake, !this._isAwake);
  }

  /**
   * Checks whether this container is awake.
   * @returns Whether this container is awake.
   */
  public isAwake(): boolean {
    return this._isAwake;
  }

  /**
   * Wakes this container. This will wake this container's child panes and resume updates.
   * @throws Error if this container has been destroyed.
   */
  public wake(): void {
    if (!this.isAlive) {
      throw new Error('UiPaneContainer: cannot wake a dead container');
    }

    if (this._isAwake) {
      return;
    }

    this._isAwake = true;

    this.paneStateSub?.resume(true);
    this.updateFreqSub?.resume(true);

    this.pane1Ref.getOrDefault()?.wake();
    this.pane2Ref.getOrDefault()?.wake();

    this.updateClock.resume();
  }

  /**
   * Puts this container to sleep. This will put this container's child panes to sleep and pause updates.
   * @throws Error if this container has been destroyed.
   */
  public sleep(): void {
    if (!this.isAlive) {
      throw new Error('UiPaneContainer: cannot sleep a dead container');
    }

    if (!this._isAwake) {
      return;
    }

    this._isAwake = false;

    this.paneStateSub?.pause();
    this.updateFreqSub?.pause();

    this.pane1Ref.getOrDefault()?.sleep();
    this.pane2Ref.getOrDefault()?.sleep();

    this.updateClock.pause();
  }

  /**
   * Updates this container's panes.
   * @param time The current real (operating system) time, as a Javascript timestamp in milliseconds.
   */
  private update(time: number): void {
    if (this.alternateUpdatesInSplitMode.get() && this.isSplit.get()) {
      if (this.tickCounter % 2 === 0) {
        this.pane1Ref.instance.update(time);
      } else {
        this.pane2Ref.instance.update(time);
      }
    } else {
      this.pane1Ref.instance.update(time);
      this.pane2Ref.instance.update(time);
    }

    this.tickCounter++;
  }

  /** @inheritdoc */
  public render(): VNode {
    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.cssClassSet, this.props.class, ['ui-pane-container']);
    } else if (this.props.class !== undefined) {
      for (const cssClass of FSComponent.parseCssClassesFromString(this.props.class).filter(val => val !== 'ui-pane-container')) {
        this.cssClassSet.add(cssClass);
      }
    }

    return (
      <div class={this.cssClassSet} >
        <UiPane
          ref={this.pane1Ref}
          bus={this.props.bus}
          index={1}
          sizeMode={this.pane1SizeMode}
          fullSize={this.props.paneFullSize}
          halfSize={this.props.pane1HalfSize}
          class='ui-pane-1'
        >
          {this.props.pane1Content}
        </UiPane>
        <div class={{ 'ui-pane-container-divider': true, 'hidden': this.isSplit.map(SubscribableMapFunctions.not()) }} />
        <UiPane
          ref={this.pane2Ref}
          bus={this.props.bus}
          index={2}
          sizeMode={this.pane2SizeMode}
          fullSize={this.props.paneFullSize}
          halfSize={this.props.pane2HalfSize}
          class='ui-pane-2'
        >
          {this.props.pane2Content}
        </UiPane>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    this.paneState.destroy();
    this.updateClock.destroy();
    this.cssClassSub?.destroy();
    this.updateFreqSub?.destroy();

    super.destroy();
  }
}
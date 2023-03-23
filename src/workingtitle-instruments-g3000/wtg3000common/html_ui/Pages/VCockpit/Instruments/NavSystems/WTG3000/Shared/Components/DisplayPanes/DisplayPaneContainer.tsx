import {
  ClockEvents, ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FSComponent, MappedSubject, ReadonlyFloat64Array, SetSubject, Subject,
  Subscribable, SubscribableSet, SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { DisplayPanesUserSettings } from '../../Settings/DisplayPanesUserSettings';
import { DisplayPane } from './DisplayPane';
import { DisplayPaneIndex, DisplayPaneSizeMode } from './DisplayPaneTypes';
import { DisplayPaneViewFactory } from './DisplayPaneViewFactory';

import './DisplayPaneContainer.css';

/**
 * The properties for the DisplayPaneContainer component.
 */
export interface DisplayPaneContainerProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The DisplayPaneViewFactory instance to use. */
  displayPaneViewFactory: DisplayPaneViewFactory;

  /** The index of the left pane. */
  leftIndex: DisplayPaneIndex;

  /** The index of the right pane. */
  rightIndex: DisplayPaneIndex;

  /** The size of the left pane's content area in full mode, as `[width, height]` in pixels. */
  leftPaneFullSize: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** The size of the left pane's content area in half mode, as `[width, height]` in pixels. */
  leftPaneHalfSize: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** The size of the right pane's content area in full mode, as `[width, height]` in pixels. */
  rightPaneFullSize: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** The size of the right pane's content area in half mode, as `[width, height]` in pixels. */
  rightPaneHalfSize: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** The update frequency of the container's panes. */
  updateFreq: number | Subscribable<number>;

  /** Whether to alternate updates every other update cycle for each pane while both panes are visible. Defaults to `false`. */
  alternateUpdatesInSplitMode?: boolean;

  /** CSS class(es) to apply to the root element of the container. */
  class?: string | SubscribableSet<string>;
}

/**
 * A container for two display panes: a left pane and a right pane. Automatically controls the size of each display
 * pane such that if both are visible, each is sized as a half pane, and if only one is visible, it is sized as a full
 * pane.
 */
export class DisplayPaneContainer extends DisplayComponent<DisplayPaneContainerProps> {
  private readonly leftPaneRef = FSComponent.createRef<DisplayPane>();
  private readonly rightPaneRef = FSComponent.createRef<DisplayPane>();

  private readonly leftPaneSettingsManager = DisplayPanesUserSettings.getDisplayPaneManager(this.props.bus, this.props.leftIndex);
  private readonly rightPaneSettingsManager = DisplayPanesUserSettings.getDisplayPaneManager(this.props.bus, this.props.rightIndex);

  private readonly leftPaneSizeMode = Subject.create(DisplayPaneSizeMode.Hidden);
  private readonly rightPaneSizeMode = Subject.create(DisplayPaneSizeMode.Hidden);

  private readonly paneState = MappedSubject.create(
    this.leftPaneSettingsManager.getSetting('displayPaneVisible'),
    this.rightPaneSettingsManager.getSetting('displayPaneVisible')
  );
  private readonly isSplit = this.paneState.map(([isLeftPaneVisible, isRightPaneVisible]) => isLeftPaneVisible && isRightPaneVisible);

  private readonly cssClassSet = SetSubject.create(['display-pane-container']);

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
    this.paneStateSub = this.paneState.sub(([isLeftPaneVisible, isRightPaneVisible]) => {
      const leftPaneSizeMode = isLeftPaneVisible
        ? isRightPaneVisible ? DisplayPaneSizeMode.Half : DisplayPaneSizeMode.Full
        : DisplayPaneSizeMode.Hidden;

      const rightPaneSizeMode = isRightPaneVisible
        ? isLeftPaneVisible ? DisplayPaneSizeMode.Half : DisplayPaneSizeMode.Full
        : DisplayPaneSizeMode.Hidden;

      this.leftPaneSizeMode.set(leftPaneSizeMode);
      this.rightPaneSizeMode.set(rightPaneSizeMode);
    }, this._isAwake, !this._isAwake);

    this.updateClock.sub(this.update.bind(this));

    if (this._isAwake) {
      this.leftPaneRef.instance.wake();
      this.rightPaneRef.instance.wake();
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
      throw new Error('DisplayPaneContainer: cannot wake a dead container');
    }

    if (this._isAwake) {
      return;
    }

    this._isAwake = true;

    this.paneStateSub?.resume(true);
    this.updateFreqSub?.resume(true);

    this.leftPaneRef.getOrDefault()?.wake();
    this.rightPaneRef.getOrDefault()?.wake();

    this.updateClock.resume();
  }

  /**
   * Puts this container to sleep. This will put this container's child panes to sleep and pause updates.
   * @throws Error if this container has been destroyed.
   */
  public sleep(): void {
    if (!this.isAlive) {
      throw new Error('DisplayPaneContainer: cannot sleep a dead container');
    }

    if (!this._isAwake) {
      return;
    }

    this._isAwake = false;

    this.paneStateSub?.pause();
    this.updateFreqSub?.pause();

    this.leftPaneRef.getOrDefault()?.sleep();
    this.rightPaneRef.getOrDefault()?.sleep();

    this.updateClock.pause();
  }

  /**
   * Updates this container's panes.
   * @param time The current real (operating system) time, as a UNIX timestamp in milliseconds.
   */
  private update(time: number): void {
    if (this.props.alternateUpdatesInSplitMode && this.isSplit.get()) {
      if (this.tickCounter % 2 === 0) {
        this.leftPaneRef.instance.update(time);
      } else {
        this.rightPaneRef.instance.update(time);
      }
    } else {
      this.leftPaneRef.instance.update(time);
      this.rightPaneRef.instance.update(time);
    }

    this.tickCounter++;
  }

  /** @inheritdoc */
  public render(): VNode {
    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.cssClassSet, this.props.class, ['display-pane-container']);
    } else if (this.props.class !== undefined) {
      for (const cssClass of FSComponent.parseCssClassesFromString(this.props.class).filter(val => val !== 'display-pane-container')) {
        this.cssClassSet.add(cssClass);
      }
    }

    return (
      <div class={this.cssClassSet}>
        <DisplayPane
          ref={this.leftPaneRef}
          bus={this.props.bus}
          index={this.props.leftIndex}
          displayPaneViewFactory={this.props.displayPaneViewFactory}
          sizeMode={this.leftPaneSizeMode}
          fullSize={this.props.leftPaneFullSize}
          halfSize={this.props.leftPaneHalfSize}
          class='display-pane-left'
        />
        <DisplayPane
          ref={this.rightPaneRef}
          bus={this.props.bus}
          index={this.props.rightIndex}
          displayPaneViewFactory={this.props.displayPaneViewFactory}
          sizeMode={this.rightPaneSizeMode}
          fullSize={this.props.rightPaneFullSize}
          halfSize={this.props.rightPaneHalfSize}
          class='display-pane-right'
        />
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
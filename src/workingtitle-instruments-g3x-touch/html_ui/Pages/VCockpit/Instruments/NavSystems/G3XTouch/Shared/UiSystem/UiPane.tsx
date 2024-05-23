import {
  ComponentProps, DisplayComponent, EventBus, FSComponent, ReadonlyFloat64Array, SetSubject, Subscribable,
  SubscribableSet, SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { UiPaneSizeMode } from './UiPaneTypes';
import { UiPaneContent } from './UiPaneContent';

/**
 * Component props for UiPane.
 */
export interface UiPaneProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The index of the pane. */
  index: 1 | 2;

  /** The size mode of the pane. */
  sizeMode: Subscribable<UiPaneSizeMode>;

  /** The size of the pane's content area in full mode, as `[width, height]` in pixels. */
  fullSize: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** The size of the pane's content area in half mode, as `[width, height]` in pixels. */
  halfSize: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** CSS class(es) to apply to the root element of the pane. */
  class?: string | SubscribableSet<string>;
}

/**
 * A UI pane which can be resized to be full-size, half-size, or hidden. Any {@link UiPaneContent} components that
 * are rendered as descendants of a UI pane will be notified of certain events related to the pane, including changes
 * to the pane's size, changes to its waking state, and update ticks.
 */
export class UiPane extends DisplayComponent<UiPaneProps> {
  private static readonly RESERVED_CLASSES = ['ui-pane', 'ui-pane-full', 'ui-pane-half'];

  private thisNode?: VNode;

  private readonly rootCssClass = SetSubject.create(['ui-pane']);

  private readonly fullSize = SubscribableUtils.toSubscribable(this.props.fullSize, true);
  private readonly halfSize = SubscribableUtils.toSubscribable(this.props.halfSize, true);

  private readonly contents: UiPaneContent[] = [];

  private wasVisible: boolean | undefined = undefined;

  private isAlive = true;
  private _isAwake = false;

  private cssClassSub?: Subscription;
  private sizeModeSub?: Subscription;
  private fullSizeSub?: Subscription;
  private halfSizeSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.parseContents(thisNode);

    const sizeMode = this.props.sizeMode.get();
    const size = sizeMode === UiPaneSizeMode.Full ? this.fullSize.get() : this.halfSize.get();
    for (const content of this.contents) {
      content.onInit(sizeMode, size);
    }

    this.sizeModeSub = this.props.sizeMode.sub(this.onSizeModeChanged.bind(this), true);

    this.fullSizeSub = this.fullSize.sub(fullSize => {
      if (this.props.sizeMode.get() === UiPaneSizeMode.Full) {
        for (const content of this.contents) {
          content.onResize(UiPaneSizeMode.Full, fullSize);
        }
      }
    }, false, !this._isAwake);

    this.halfSizeSub = this.halfSize.sub(halfSize => {
      if (this.props.sizeMode.get() === UiPaneSizeMode.Half) {
        for (const content of this.contents) {
          content.onResize(UiPaneSizeMode.Half, halfSize);
        }
      }
    }, false, !this._isAwake);

    // If the pane is awake and not hidden, then resume all content.
    if (this._isAwake && sizeMode !== UiPaneSizeMode.Hidden) {
      for (const content of this.contents) {
        content.onResume(sizeMode, size);
      }
    }
  }

  /**
   * Parses this pane's rendered descendants for {@link UiPaneContent} components.
   * @param thisNode This pane's rendered VNode root.
   */
  private parseContents(thisNode: VNode): void {
    FSComponent.visitNodes(thisNode, node => {
      if (node !== thisNode && node.instance instanceof DisplayComponent && (node.instance as any).isUiPaneContent === true) {
        this.contents.push(node.instance as UiPaneContent);
        return true;
      }

      return false;
    });
  }

  /**
   * Checks whether this pane is awake.
   * @returns Whether this pane is awake.
   */
  public isAwake(): boolean {
    return this._isAwake;
  }

  /**
   * Wakes this pane. This will resume this pane's active view (if one exists) and resume handling of display pane
   * view events.
   * @throws Error if this pane has been destroyed.
   */
  public wake(): void {
    if (!this.isAlive) {
      throw new Error('UiPane: cannot wake a dead pane');
    }

    if (this._isAwake) {
      return;
    }

    this._isAwake = true;

    const sizeMode = this.props.sizeMode.get();
    if (sizeMode !== UiPaneSizeMode.Hidden) {
      const size = sizeMode === UiPaneSizeMode.Full ? this.fullSize.get() : this.halfSize.get();
      for (const content of this.contents) {
        content.onResume(sizeMode, size);
      }
    }

    this.fullSizeSub?.resume();
    this.halfSizeSub?.resume();
  }

  /**
   * Puts this pane to sleep. This will pause this pane's active view (if one exists) and suspend handling of display
   * pane view events.
   * @throws Error if this pane has been destroyed.
   */
  public sleep(): void {
    if (!this.isAlive) {
      throw new Error('UiPane: cannot sleep a dead pane');
    }

    if (!this._isAwake) {
      return;
    }

    this._isAwake = false;

    this.fullSizeSub?.pause();
    this.halfSizeSub?.pause();

    if (this.props.sizeMode.get() !== UiPaneSizeMode.Hidden) {
      for (const content of this.contents) {
        content.onPause();
      }
    }
  }

  /**
   * Updates this display pane. Has no effect if this display pane is not visible.
   * @param time The current real (operating system) time, as a Javascript timestamp.
   */
  public update(time: number): void {
    if (this.props.sizeMode.get() !== UiPaneSizeMode.Hidden) {
      for (let i = 0; i < this.contents.length; i++) {
        this.contents[i].onUpdate(time);
      }
    }
  }

  /**
   * Responds to when this pane's size mode changes.
   * @param sizeMode The new size mode.
   */
  private onSizeModeChanged(sizeMode: UiPaneSizeMode): void {
    const wasVisible = this.wasVisible;
    const isVisible = sizeMode !== UiPaneSizeMode.Hidden;
    this.wasVisible = isVisible;

    this.rootCssClass.toggle('ui-pane-full', sizeMode === UiPaneSizeMode.Full);
    this.rootCssClass.toggle('ui-pane-half', sizeMode === UiPaneSizeMode.Half);

    if (isVisible) {
      this.rootCssClass.delete('hidden');

      if (this._isAwake) {
        const size = sizeMode === UiPaneSizeMode.Full ? this.fullSize.get() : this.halfSize.get();
        if (wasVisible === isVisible) {
          for (const content of this.contents) {
            content.onResize(sizeMode, size);
          }
        } else {
          for (const content of this.contents) {
            content.onResume(sizeMode, size);
          }
        }
      }
    } else {
      this.rootCssClass.add('hidden');

      for (const content of this.contents) {
        content.onPause();
      }
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, UiPane.RESERVED_CLASSES);
    } else {
      const classesToAdd = FSComponent.parseCssClassesFromString(this.props.class ?? '').filter(val => !UiPane.RESERVED_CLASSES.includes(val));

      for (const classToAdd of classesToAdd) {
        this.rootCssClass.add(classToAdd);
      }
    }

    return (
      <div class={this.rootCssClass}>
        {this.props.children}
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.cssClassSub?.destroy();
    this.sizeModeSub?.destroy();
    this.fullSizeSub?.destroy();
    this.halfSizeSub?.destroy();

    super.destroy();
  }
}
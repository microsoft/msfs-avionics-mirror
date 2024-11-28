import {
  ComponentProps, DisplayComponent, EventBus, FSComponent, MappedSubscribable, MutableSubscribable, ReadonlyFloat64Array,
  SetSubject, Subject, Subscribable, SubscribableSet, SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { DisplayPanesUserSettings } from '../../Settings/DisplayPanesUserSettings';
import { DisplayPaneControlEvents } from './DisplayPaneControlEvents';
import { DisplayPaneControlGtcIndex, DisplayPaneIndex, DisplayPaneSizeMode } from './DisplayPaneTypes';
import { DisplayPaneView } from './DisplayPaneView';
import { DisplayPaneViewEvent } from './DisplayPaneViewEvents';
import { DisplayPaneViewFactory } from './DisplayPaneViewFactory';

import './DisplayPane.css';

/**
 * A base display pane view entry.
 */
type BaseViewEntry = {
  /** The key of the view. */
  key: string;

  /** Whether the view can only be displayed in a half-size pane. */
  halfSizeOnly: boolean;

  /** Whether the view is visible. */
  isVisible: MutableSubscribable<boolean>;
}

/**
 * A display pane view entry with a rendered view.
 */
type RenderedViewEntry = BaseViewEntry & {
  /** A reference to the view. */
  view: DisplayPaneView;

  /** The subscription to the view's title. */
  titleSubscription: Subscription;
}

/**
 * A display pane view entry without a rendered view.
 */
type EmptyViewEntry = BaseViewEntry & {
  /** A null reference. */
  view: null;
};

/**
 * A display pane view entry.
 */
type ViewEntry = RenderedViewEntry | EmptyViewEntry;

/**
 * The properties for the DisplayPane component.
 */
export interface DisplayPaneProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The index of the display pane. */
  index: DisplayPaneIndex;

  /** The factory to use to create display pane views. */
  displayPaneViewFactory: DisplayPaneViewFactory;

  /** The size mode of the display pane. */
  sizeMode: Subscribable<DisplayPaneSizeMode>;

  /** The size of the pane's content area in full mode, as `[width, height]` in pixels. */
  fullSize: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** The size of the pane's content area in half mode, as `[width, height]` in pixels. */
  halfSize: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** CSS class(es) to apply to the root element of the pane. */
  class?: string | SubscribableSet<string>;
}

/**
 * The DisplayPane component.
 */
export class DisplayPane extends DisplayComponent<DisplayPaneProps> {
  private static readonly RESERVED_CLASSES = ['display-pane', 'display-pane-selected-left', 'display-pane-selected-right', 'display-pane-full', 'display-pane-half'];

  private readonly displayPaneTitleRef = FSComponent.createRef<HTMLDivElement>();
  private readonly displayPaneContentRef = FSComponent.createRef<HTMLDivElement>();

  private readonly rootCssClass = SetSubject.create(['display-pane']);

  private readonly paneTitle = Subject.create<string | VNode>('');
  private readonly refsMap: Map<string, ViewEntry> = new Map();

  private readonly activeViewEntry = Subject.create<ViewEntry | null>(null);
  /** The key of the currently active view. */
  public readonly activeViewKey = this.activeViewEntry.map(entry => entry?.key ?? '') as Subscribable<string>;
  /** The currently active view. */
  public readonly activeView = this.activeViewEntry.map(entry => entry ? entry.view : null) as Subscribable<DisplayPaneView | null>;

  private readonly paneSettingsManager = DisplayPanesUserSettings.getDisplayPaneManager(this.props.bus, this.props.index);

  private readonly fullSize = SubscribableUtils.toSubscribable(this.props.fullSize, true);
  private readonly halfSize = SubscribableUtils.toSubscribable(this.props.halfSize, true);

  private wasVisible: boolean | undefined = undefined;

  private renderedTitle?: string | VNode;

  private isAlive = true;
  private _isAwake = false;

  private cssClassSub?: Subscription;
  private controllerSub?: Subscription;
  private sizeModeSub?: Subscription;
  private fullSizeSub?: Subscription;
  private halfSizeSub?: Subscription;
  private viewSub?: Subscription;
  private eventSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.paneTitle.sub(title => {
      this.clearTitle();

      if (typeof title === 'object') {
        FSComponent.render(title, this.displayPaneTitleRef.instance);
      } else {
        this.displayPaneTitleRef.instance.textContent = title;
      }
      this.renderedTitle = title;
    }, true);

    this.controllerSub = this.paneSettingsManager.getSetting('displayPaneController').sub(controller => {
      switch (controller) {
        case DisplayPaneControlGtcIndex.LeftGtc:
          this.rootCssClass.delete('display-pane-selected-right');
          this.rootCssClass.add('display-pane-selected-left');
          break;
        case DisplayPaneControlGtcIndex.RightGtc:
          this.rootCssClass.delete('display-pane-selected-left');
          this.rootCssClass.add('display-pane-selected-right');
          break;
        default:
          this.rootCssClass.delete('display-pane-selected-left');
          this.rootCssClass.delete('display-pane-selected-right');
      }
    }, true);

    this.sizeModeSub = this.props.sizeMode.sub(this.onSizeModeChanged.bind(this), true);

    this.fullSizeSub = this.fullSize.sub(size => {
      if (this.props.sizeMode.get() === DisplayPaneSizeMode.Full) {
        this.activeViewEntry.get()?.view?.onResize(DisplayPaneSizeMode.Full, size[0], size[1]);
      }
    }, false, !this._isAwake);

    this.halfSizeSub = this.fullSize.sub(size => {
      if (this.props.sizeMode.get() === DisplayPaneSizeMode.Half) {
        this.activeViewEntry.get()?.view?.onResize(DisplayPaneSizeMode.Half, size[0], size[1]);
      }
    }, false, !this._isAwake);

    this.viewSub = this.paneSettingsManager.getSetting('displayPaneView').sub(this.open.bind(this), true);

    this.eventSub = this.props.bus.getSubscriber<DisplayPaneControlEvents>()
      .on('display_pane_view_event')
      .handle(this.onEvent.bind(this), !this._isAwake);
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
   * view events and interaction events.
   * @throws Error if this pane has been destroyed.
   */
  public wake(): void {
    if (!this.isAlive) {
      throw new Error('DisplayPane: cannot wake a dead pane');
    }

    if (this._isAwake) {
      return;
    }

    this._isAwake = true;

    if (this.props.sizeMode.get() !== DisplayPaneSizeMode.Hidden) {
      const activeViewEntry = this.activeViewEntry.get();
      if (activeViewEntry && activeViewEntry.view) {
        this.resumeView(activeViewEntry);
      }
    }

    this.fullSizeSub?.resume();
    this.halfSizeSub?.resume();
    this.eventSub?.resume();
  }

  /**
   * Puts this pane to sleep. This will pause this pane's active view (if one exists) and suspend handling of display
   * pane view events and interaction events.
   * @throws Error if this pane has been destroyed.
   */
  public sleep(): void {
    if (!this.isAlive) {
      throw new Error('DisplayPane: cannot sleep a dead pane');
    }

    if (!this._isAwake) {
      return;
    }

    this._isAwake = false;

    this.fullSizeSub?.pause();
    this.halfSizeSub?.pause();
    this.eventSub?.pause();

    if (this.props.sizeMode.get() !== DisplayPaneSizeMode.Hidden) {
      const activeViewEntry = this.activeViewEntry.get();
      if (activeViewEntry && activeViewEntry.view) {
        this.pauseView(activeViewEntry);
      }
    }
  }

  /**
   * Updates this display pane. Has no effect if this display pane is not visible.
   * @param time The current real (operating system) time, as a UNIX timestamp in milliseconds.
   * @throws Error if this pane has been destroyed.
   */
  public update(time: number): void {
    if (!this.isAlive) {
      throw new Error('DisplayPane: cannot update a dead pane');
    }

    if (this.props.sizeMode.get() !== DisplayPaneSizeMode.Hidden) {
      const activeViewEntry = this.activeViewEntry.get();
      if (activeViewEntry && activeViewEntry.view) {
        activeViewEntry.view.onUpdate(time);
      }
    }
  }

  /**
   * Handles an interaction event. The event will be routed to this display pane's active view. If this pane is asleep
   * or hidden, or there is no active view, then the event will not be handled.
   * @param event The interaction event to handle.
   * @returns Whether the event was handled.
   * @throws Error if this pane has been destroyed.
   */
  public onInteractionEvent(event: string): boolean {
    if (!this.isAlive) {
      throw new Error('DisplayPane: cannot invoke a dead pane');
    }

    if (!this._isAwake || this.props.sizeMode.get() === DisplayPaneSizeMode.Hidden) {
      return false;
    }

    return this.activeViewEntry.get()?.view?.onInteractionEvent(event) ?? false;
  }

  /**
   * Opens a view.
   * @param key The key of the view to open.
   */
  private open(key: string): void {
    let viewEntry = this.refsMap.get(key);
    if (viewEntry === undefined) {
      viewEntry = this.createView(key);
      this.refsMap.set(key, viewEntry);
    }

    this.paneSettingsManager.getSetting('displayPaneHalfSizeOnly').value = viewEntry.halfSizeOnly;

    const sizeMode = this.props.sizeMode.get();

    const isVisible = sizeMode !== DisplayPaneSizeMode.Hidden;

    const activeViewEntry = this.activeViewEntry.get();
    if (activeViewEntry) {
      activeViewEntry.isVisible.set(false);

      if (isVisible && this._isAwake && activeViewEntry.view) {
        this.pauseView(activeViewEntry);
      }
    }

    this.activeViewEntry.set(viewEntry);

    // If a view only supports half-size mode, only make it visible in half-size mode.
    viewEntry.isVisible.set(!viewEntry.halfSizeOnly || sizeMode === DisplayPaneSizeMode.Half);

    if (isVisible && this._isAwake && viewEntry.view) {
      this.resumeView(viewEntry);
    }
  }

  /**
   * Creates a view.
   * @param type The type string of the view to create.
   * @returns A ViewEntry for the created view.
   */
  private createView(type: string): ViewEntry {
    const node = this.props.displayPaneViewFactory.createViewNode(type, this.props.index);

    const isVisible: Subject<boolean> = Subject.create(false as boolean);

    FSComponent.render(
      <DisplayPaneViewWrapper isVisible={isVisible}>{node}</DisplayPaneViewWrapper>,
      this.displayPaneContentRef.instance,
    );

    if (node) {
      const view = node.instance as DisplayPaneView;
      return {
        key: type,
        halfSizeOnly: view.props.halfSizeOnly ?? false,
        isVisible,
        view,
        titleSubscription: view.title.pipe(this.paneTitle, true),
      };
    } else {
      return {
        key: type,
        halfSizeOnly: false,
        view: null,
        isVisible,
      };
    }
  }

  /**
   * Resumes a view.
   * @param entry The entry for the view to resume.
   */
  private resumeView(entry: RenderedViewEntry): void {
    const sizeMode = this.props.sizeMode.get();
    const size = sizeMode === DisplayPaneSizeMode.Full ? this.fullSize.get() : this.halfSize.get();

    entry.titleSubscription.resume(true);
    entry.view.onResume(sizeMode, size[0], size[1]);
  }

  /**
   * Pauses a view.
   * @param entry The entry for the view to pause.
   */
  private pauseView(entry: RenderedViewEntry): void {
    entry.titleSubscription!.pause();
    entry.view.onPause();
  }

  /**
   * Clears this pane's rendered title.
   */
  private clearTitle(): void {
    if (this.renderedTitle === undefined) {
      return;
    }

    if (typeof this.renderedTitle === 'object') {
      FSComponent.visitNodes(this.renderedTitle, node => {
        if (node.instance instanceof DisplayComponent) {
          node.instance.destroy();
          return true;
        }

        return false;
      });
    }

    this.displayPaneTitleRef.instance.textContent = '';
    this.renderedTitle = undefined;
  }

  /**
   * Responds to when this pane's size mode changes.
   * @param sizeMode The new size mode.
   */
  private onSizeModeChanged(sizeMode: DisplayPaneSizeMode): void {
    const wasVisible = this.wasVisible;
    const isVisible = sizeMode !== DisplayPaneSizeMode.Hidden;
    this.wasVisible = isVisible;

    const activeViewEntry = this.activeViewEntry.get();

    this.rootCssClass.toggle('display-pane-full', sizeMode === DisplayPaneSizeMode.Full);
    this.rootCssClass.toggle('display-pane-half', sizeMode === DisplayPaneSizeMode.Half);

    if (isVisible) {
      this.rootCssClass.delete('hidden');

      if (this._isAwake && activeViewEntry && activeViewEntry.view) {
        if (wasVisible === isVisible) {
          const size = sizeMode === DisplayPaneSizeMode.Full ? this.fullSize.get() : this.halfSize.get();
          activeViewEntry.view.onResize(sizeMode, size[0], size[1]);
        } else {
          this.resumeView(activeViewEntry);
        }
      }

      // If the active view only supports half-size mode, make sure to update its visibility based on the new size mode.
      if (activeViewEntry && activeViewEntry.halfSizeOnly) {
        activeViewEntry.isVisible.set(sizeMode === DisplayPaneSizeMode.Half);
      }
    } else {
      this.rootCssClass.add('hidden');

      if (this._isAwake && activeViewEntry && activeViewEntry.view) {
        this.pauseView(activeViewEntry);
      }
    }
  }

  /**
   * Responds to when a display pane view event is received.
   * @param event The received event.
   */
  private onEvent(event: DisplayPaneViewEvent): void {
    if (event.displayPaneIndex === this.props.index) {
      this.activeView.get()?.onEvent(event);
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, DisplayPane.RESERVED_CLASSES);
    } else {
      const classesToAdd = FSComponent.parseCssClassesFromString(this.props.class ?? '').filter(val => !DisplayPane.RESERVED_CLASSES.includes(val));

      for (const classToAdd of classesToAdd) {
        this.rootCssClass.add(classToAdd);
      }
    }

    return (
      <div class={this.rootCssClass}>
        <div class="display-pane-title-bar">
          <div class="display-pane-title-text" ref={this.displayPaneTitleRef}>{this.paneTitle}</div>
        </div>
        <div ref={this.displayPaneContentRef} class="display-pane-content" />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.isAlive = false;

    for (const entry of this.refsMap.values()) {
      if (entry.view) {
        entry.titleSubscription.destroy();
        entry.view.destroy();
      }
    }

    this.clearTitle();

    this.cssClassSub?.destroy();
    this.controllerSub?.destroy();
    this.sizeModeSub?.destroy();
    this.fullSizeSub?.destroy();
    this.halfSizeSub?.destroy();
    this.viewSub?.destroy();
    this.eventSub?.destroy();

    super.destroy();
  }
}

/** Props for the DisplayPaneViewWrapper component */
interface DisplayPaneViewWrapperProps extends ComponentProps {
  /** State of the component's visibility */
  isVisible: Subscribable<boolean>;
}

/** A simple div wrapper useful for hiding and unhiding its child component */
class DisplayPaneViewWrapper extends DisplayComponent<DisplayPaneViewWrapperProps> {
  private readonly cssClass: MappedSubscribable<string> =
    this.props.isVisible.map((isVisible: boolean): string => isVisible ? '' : 'hidden');

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={this.cssClass} style='position: absolute; left: 0; top: 0; width: 100%; height: 100%;'>{this.props.children}</div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.cssClass.destroy();

    super.destroy();
  }
}

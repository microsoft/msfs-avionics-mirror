import {
  ArrayUtils, ComponentProps, DebounceTimer, DisplayComponent, FSComponent, FilteredMapSubject, MapSubject, NodeReference, ReadonlySubEvent,
  SetSubject, SubEvent, Subject, Subscribable, SubscribableMap, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { AbstractUiView } from './AbstractUiView';
import { UiInteractionEvent, UiInteractionHandler } from './UiInteraction';
import { UiKnobId, UiKnobRequestedLabelState } from './UiKnobTypes';
import type { UiService } from './UiService';
import { UiView } from './UiView';
import { UiViewKeys } from './UiViewKeys';
import { UiViewStackContainer } from './UiViewStackContainer';
import {
  RenderedUiViewEntry, UiPopupType, UiViewLifecyclePolicy, UiViewOcclusionType, UiViewStackItem, UiViewStackLayer,
  UiViewType
} from './UiViewTypes';

import './UiViewStack.css';

/**
 * Options describing how to open a UI view as a generic popup.
 */
export type UiGenericPopupOpenOptions<T extends UiPopupType> = {
  /** The type to apply to the popup. Defaults to `'normal'`. */
  popupType: T;

  /**
   * The occlusion type applied to views beneath the popup. If `'none'` is chosen, then the popup will not prevent
   * mouse events from reaching views beneath it (unless the mouse event was triggered on an element in the popup).
   * Defaults to `'darken'`.
   */
  backgroundOcclusion?: UiViewOcclusionType;

  /**
   * Whether to allow unhandled interaction events to fall through to the next view in the open stack. Defaults to
   * `false`.
   */
  allowEventFallthrough?: boolean;
};

/**
 * Options describing how to open a UI view as a positioned popup.
 */
export type UiPositionedPopupOpenOptions = UiGenericPopupOpenOptions<'positioned'> & {
  /**
   * The desired offset of the popup's left border from its view stack container's left border, as a percentage of the
   * container's width. If both this value and `right` are defined, then `right` takes priority. If neither this value
   * nor `right` is defined, then this value defaults to zero.
   */
  left?: number;

  /**
   * The desired offset of the popup's right border from its view stack container's right border, as a percentage of
   * the container's width. If both this value and `left` are defined, then this value takes priority. If neither this
   * value nor `left` is defined, then `left` defaults to zero.
   */
  right?: number;

  /**
   * The desired offset of the popup's top border from its view stack container's top border, as a percentage of the
   * container's height. If both this value and `bottom` are defined, then `bottom` takes priority. If neither this
   * value nor `bottom` is defined, then this value defaults to zero.
   */
  top?: number;

  /**
   * The desired offset of the popup's bottom border from its view stack container's bottom border, as a percentage of
   * the container's height. If both this value and `top` are defined, then this value takes priority. If neither this
   * value nor `top` is defined, then `top` defaults to zero.
   */
  bottom?: number;
};

/**
 * Options describing how to open a UI view as a popup.
 */
export type UiPopupOpenOptions = UiPositionedPopupOpenOptions | UiGenericPopupOpenOptions<Exclude<UiPopupType, 'positioned'>>;

/**
 * An entry describing a registered UI view.
 */
interface ViewEntry<T extends UiView = UiView> {
  /** The view stack layer to which the view belongs. */
  readonly layer: UiViewStackLayer;

  /** The lifecycle policy of the view. */
  readonly lifecyclePolicy: UiViewLifecyclePolicy;

  /** The key of the view. */
  readonly key: string;

  /** A function which renders the view. */
  readonly factory: (uiService: UiService, containerRef: NodeReference<HTMLElement>) => VNode;

  /** A reference to the view, or `undefined` if the view is not rendered. */
  ref: T | undefined;

  /** A reference to the view wrapper, or `undefined` if the view is not rendered. */
  wrapperRef: NodeReference<UiViewWrapper<any>> | undefined;

  /** State of the view's visibility */
  readonly isVisible: Subject<boolean>;

  /** The view-stack layer the view is in, if any */
  readonly level: Subject<number>;

  /** The view type this entry's view is currently opened as: page, popup, or base. */
  readonly type: Subject<UiViewType | undefined>;

  /** The popup type this entry's view is currently opened as, or `undefined` if the view is not a popup. */
  readonly popupType: Subject<UiPopupType | undefined>;

  /**
   * The occlusion type applied to views beneath this entry's view when it is opened as a popup, or `undefined` if the
   * view is not a popup.
   */
  readonly popupBackgroundOcclusion: Subject<UiViewOcclusionType | undefined>;

  /** The occlusion applied to this entry's view. */
  readonly occlusion: Subject<UiViewOcclusionType>;

  /**
   * A subscription to refresh the view stack's requested knob label state when this entry's view changes its requested
   * knob label state.
   */
  knobLabelStateSub?: Subscription;
}

/**
 * An entry describing a registered UI view that is currently rendered to a view stack.
 */
type RenderedViewEntry<T extends UiView = UiView> = Omit<ViewEntry<T>, 'ref' | 'wrapperRef' | 'knobLabelStateSub'> & {
  /** A reference to the view. */
  ref: T;

  /** A reference to the view wrapper. */
  wrapperRef: NodeReference<UiViewWrapper<any>>;

  /**
   * A subscription to refresh the view stack's requested knob label state when this entry's view changes its requested
   * knob label state.
   */
  knobLabelStateSub: Subscription;
};

/**
 * An item describing a UI view within a view stack history state.
 */
type ViewStackItem<T extends UiView = UiView> = {
  /** The entry for the UI view. */
  viewEntry: RenderedViewEntry<T>;

  /** The view type as which the UI view was opened. */
  type: UiViewType;

  /** The popup type as which the UI view was opened, or `undefined` if the view was not opened as a popup. */
  popupType: UiPopupType | undefined;

  /** The occlusion type applied to views beneath this entry's view, or `undefined` if no occlusion was applied. */
  backgroundOcclusion: UiViewOcclusionType | undefined;

  /**
   * Whether to allow unhandled interaction events to fall through to the next view in the open stack if the UI view is
   * opened as a popup.
   */
  allowEventFallthrough: boolean;

  /** The CSS classes applied to the view wrapper, or `undefined` if no classes were applied. */
  wrapperClasses?: Set<string>;

  /** The CSS styles applied to the view wrapper, or `undefined` if no styles were applied.  */
  wrapperStyles?: Map<string, string>;
};

/**
 * An entry describing a view stack layer.
 */
type LayerEntry = {
  /** The registered views assigned to the layer. */
  registeredViews: Map<string, ViewEntry>;

  /** The history states of the layer. */
  history: ViewStackItem[][];
};

/**
 * A stack of UI views.
 *
 * UI views are registered with the stack and can be opened and closed within the stack as pages or popups. The stack
 * has two layers: a main layer and an overlay layer. At any given time, the main layer contains one view opened as a
 * page and zero or more views opened as popups, while the overlay layer contains zero or more views opened as popups.
 * Views opened in the overlay layer always sit on top of views opened in the main layer. The open page is always
 * located at the bottom of the main layer. The view stack keeps track of individual history states as views are opened
 * and supports reverting to previous history states.
 *
 * The view stack handles routing of UI interaction events to the appropriate open views in the stack. Additionally,
 * bezel rotary knob label states requested by open views are processed and synthesized into a single knob label state
 * based on which views have priority to handle the knob interaction events.
 */
export class UiViewStack implements UiInteractionHandler {
  private static readonly BASE_VIEW_KEY = '$BaseView$';

  private static readonly RESERVED_KEYS = new Set([
    UiViewStack.BASE_VIEW_KEY,
    UiViewKeys.EmptyPage
  ]);

  private readonly layerEntries: Record<UiViewStackLayer, LayerEntry> = {
    [UiViewStackLayer.Main]: {
      registeredViews: new Map(),
      history: []
    },
    [UiViewStackLayer.Overlay]: {
      registeredViews: new Map(),
      history: []
    }
  };

  private container?: UiViewStackContainer;

  private readonly resetViewAnimation = new SubEvent<this, void>();

  private readonly _activeView: Subject<RenderedViewEntry>;
  /** This view stack's currently active view. */
  public readonly activeView: Subscribable<RenderedViewEntry>;

  private readonly _openPage: Subject<RenderedViewEntry>;
  /** This view stack's currently open page. */
  public readonly openPage: Subscribable<RenderedViewEntry>;

  private readonly workingKnobLabelState: Record<UiKnobId, string | undefined>;

  private readonly _knobLabelState = FilteredMapSubject.create<UiKnobId, string>(this.uiService.validKnobIds);
  /** This view stack's requested bezel rotary knob label state. */
  public readonly knobLabelState = this._knobLabelState as SubscribableMap<UiKnobId, string> & Subscribable<UiKnobRequestedLabelState>;

  private _isAwake = false;

  /**
   * Creates a new instance of UiViewStack.
   * @param uiService The UI service controlling this view stack.
   */
  public constructor(private readonly uiService: UiService) {
    // Set up initial states for the main and overlay stacks. The initial state for the main stack will include the
    // base view and the empty page. The initial state for the overlay stack will include only the base view.

    const mainBaseViewEntry = this.createEmptyViewEntry(UiViewStackLayer.Main, UiViewStack.BASE_VIEW_KEY);

    mainBaseViewEntry.isVisible.set(true);
    mainBaseViewEntry.level.set(0);
    mainBaseViewEntry.type.set('base');

    const emptyPageViewEntry = this.createEmptyViewEntry(UiViewStackLayer.Main, UiViewKeys.EmptyPage);

    emptyPageViewEntry.isVisible.set(true);
    emptyPageViewEntry.level.set(1);
    emptyPageViewEntry.type.set('page');

    this.layerEntries[UiViewStackLayer.Main].history.push([
      { viewEntry: mainBaseViewEntry, type: 'base', popupType: undefined, backgroundOcclusion: undefined, allowEventFallthrough: false },
      { viewEntry: emptyPageViewEntry, type: 'page', popupType: undefined, backgroundOcclusion: undefined, allowEventFallthrough: false }
    ]);

    const overlayBaseViewEntry = this.createEmptyViewEntry(UiViewStackLayer.Overlay, UiViewStack.BASE_VIEW_KEY);

    overlayBaseViewEntry.isVisible.set(true);
    overlayBaseViewEntry.level.set(0);
    overlayBaseViewEntry.type.set('base');

    this.layerEntries[UiViewStackLayer.Overlay].history.push(
      [{ viewEntry: overlayBaseViewEntry, type: 'base', popupType: undefined, backgroundOcclusion: undefined, allowEventFallthrough: false }]
    );

    this._openPage = Subject.create<RenderedViewEntry>(emptyPageViewEntry);
    this.openPage = this._openPage;

    // The initial active view is the empty page, because the overlay stack is initially considered empty (it does not
    // have any open non-base views).
    this._activeView = Subject.create<RenderedViewEntry>(emptyPageViewEntry);
    this.activeView = this._activeView;

    this.workingKnobLabelState = {} as Record<UiKnobId, string | undefined>;
    for (let i = 0; i < this.uiService.validKnobIds.length; i++) {
      this.workingKnobLabelState[this.uiService.validKnobIds[i]] = undefined;
    }
  }

  /**
   * Checks whether this view stack is awake.
   * @returns Whether this view stack is awake.
   */
  public isAwake(): boolean {
    return this._isAwake;
  }

  /**
   * Gets the current open stack for one of this view stack's layers. The open stack contains all open views in the
   * layer.
   * @param layer The layer for which to get the open stack.
   * @returns The current open stack for the specified view stack layer.
   */
  private getOpenStack(layer: UiViewStackLayer | LayerEntry): ViewStackItem[] {
    return ArrayUtils.last((typeof layer === 'object' ? layer : this.layerEntries[layer]).history);
  }

  /**
   * Checks whether the current open stack for one of this view stack's layers is empty. A stack is considered empty if
   * and only if it does not contain at least one non-base view.
   * @param layer The layer to check.
   * @returns Whether the current open stack for the specified view stack layer is empty.
   */
  private isOpenStackEmpty(layer: UiViewStackLayer | LayerEntry): boolean {
    return this.getOpenStack(layer).length <= 1;
  }

  /**
   * Gets this view stack's active view stack item.
   * @returns This view stack's active view stack item.
   */
  private getActiveViewStackItem(): ViewStackItem {
    return ArrayUtils.last(this.isOpenStackEmpty(UiViewStackLayer.Overlay) ? this.getOpenStack(UiViewStackLayer.Main) : this.getOpenStack(UiViewStackLayer.Overlay));
  }

  /**
   * Attaches this view stack to a container.
   * @param container The container to which to attach.
   * @throws Error if this view stack has already been attached to a container.
   */
  public attachToContainer(container: UiViewStackContainer): void {
    if (this.container) {
      throw new Error('UiViewStack: cannot attach to a container after it has already been attached');
    }

    this.container = container;

    // Render all static views to the container.

    for (const viewEntry of this.layerEntries[UiViewStackLayer.Main].registeredViews.values()) {
      if (viewEntry.lifecyclePolicy === UiViewLifecyclePolicy.Static) {
        this.renderView(viewEntry);
      }
    }

    for (const viewEntry of this.layerEntries[UiViewStackLayer.Overlay].registeredViews.values()) {
      if (viewEntry.lifecyclePolicy === UiViewLifecyclePolicy.Static) {
        this.renderView(viewEntry);
      }
    }

    this.container.sizeChanged.on(this.onContainerSizeChanged.bind(this));
  }

  private sizeChangeId = 0;

  /**
   * Responds to when this view stack's container changes size.
   * @param container This view stack's container.
   */
  private onContainerSizeChanged(container: UiViewStackContainer): void {
    const id = ++this.sizeChangeId;

    const sizeMode = container.getSizeMode();
    const dimensions = container.getDimensions();

    const openViewItems = [
      ...this.getOpenStack(UiViewStackLayer.Main),
      ...this.getOpenStack(UiViewStackLayer.Overlay)
    ];

    // Invoke onResize callback on all open views except base views.
    for (let i = 0; i < openViewItems.length; i++) {
      const item = openViewItems[i];

      if (item.type === 'base') {
        continue;
      }

      // Check to see if the view is still open (using isVisible as a proxy) in case the open view stack changed
      // during a callback.
      if (item.viewEntry.isVisible.get()) {
        item.viewEntry.ref.onResize(sizeMode, dimensions);
      }

      // If the size changed again during a callback, then abort because the latest invocation of the callback will
      // have already notified the views of the new size.
      if (id !== this.sizeChangeId) {
        return;
      }
    }
  }

  /**
   * Registers a view (page or popup) with this view stack. Once a view is registered, it may be opened by referencing
   * its key.
   * @param layer The view stack layer to which to assign the view.
   * @param lifecyclePolicy The lifecycle policy to apply to the view.
   * @param key The key to register the view under.
   * @param factory A function which renders the view.
   * @throws Error if the specified key is invalid.
   */
  public registerView(
    layer: UiViewStackLayer,
    lifecyclePolicy: UiViewLifecyclePolicy,
    key: string,
    factory: (uiService: UiService, containerRef: NodeReference<HTMLElement>) => VNode
  ): void {
    if (UiViewStack.RESERVED_KEYS.has(key)) {
      throw new Error(`UiviewStack: cannot register view under a reserved key ('${key}')`);
    }

    const registeredViews = this.layerEntries[layer].registeredViews;

    // Clean up any existing entry registered under the same key
    const oldEntry = registeredViews.get(key);
    if (oldEntry !== undefined) {
      this.cleanupView(oldEntry);
    }

    const isVisible: Subject<boolean> = Subject.create<boolean>(false);
    const level: Subject<number> = Subject.create(-1);
    const type = Subject.create<UiViewType | undefined>(undefined);
    const popupType = Subject.create<UiPopupType | undefined>(undefined);
    const popupBackgroundOcclusion = Subject.create<UiViewOcclusionType | undefined>(undefined);
    const occlusion = Subject.create<UiViewOcclusionType>('none');

    const viewEntry: ViewEntry = {
      layer,
      lifecyclePolicy,
      key,
      factory,
      ref: undefined,
      wrapperRef: undefined,
      isVisible,
      level,
      type,
      popupType,
      popupBackgroundOcclusion,
      occlusion
    };
    registeredViews.set(key, viewEntry);

    if (lifecyclePolicy === UiViewLifecyclePolicy.Static) {
      this.renderView(viewEntry);
    }
  }

  /**
   * Wakes this view stack.
   */
  public wake(): void {
    if (this._isAwake) {
      return;
    }

    this._isAwake = true;
  }

  /**
   * Puts this view stack to sleep.
   */
  public sleep(): void {
    if (!this._isAwake) {
      return;
    }

    this._isAwake = false;
  }

  /**
   * Updates this view stack. Has no effect if this view stack is asleep.
   * @param time The current real (operating system) time, as a Javascript timestamp.
   */
  public update(time: number): void {
    if (this._isAwake) {
      const mainStack = this.getOpenStack(UiViewStackLayer.Main);
      const overlayStack = this.getOpenStack(UiViewStackLayer.Overlay);

      for (let i = 1; i < mainStack.length; i++) {
        mainStack[i].viewEntry.ref.onUpdate(time);
      }

      for (let i = 1; i < overlayStack.length; i++) {
        overlayStack[i].viewEntry.ref.onUpdate(time);
      }
    }
  }

  /** @inheritdoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    if (!this._isAwake) {
      return false;
    }

    const overlayStack = this.getOpenStack(UiViewStackLayer.Overlay);
    for (let i = overlayStack.length - 1; i > 0; i--) {
      const item = overlayStack[i];
      if (item.viewEntry.ref.onUiInteractionEvent(event)) {
        return true;
      } else if (!item.allowEventFallthrough) {
        return false;
      }
    }

    const mainStack = this.getOpenStack(UiViewStackLayer.Main);
    for (let i = mainStack.length - 1; i > 0; i--) {
      const item = mainStack[i];
      if (item.viewEntry.ref.onUiInteractionEvent(event)) {
        return true;
      } else if (!item.allowEventFallthrough) {
        return false;
      }
    }

    return false;
  }

  /**
   * Renders a registered view. If the view is already rendered, then this method does nothing.
   * @param viewEntry The view entry describing the view to render.
   */
  private renderView(viewEntry: ViewEntry): void {
    if (!this.container || viewEntry.ref !== undefined) {
      return;
    }

    const vNode = viewEntry.factory(this.uiService, this.container.rootRef);

    const wrapperRef = FSComponent.createRef<StandardUiViewWrapper>();

    this.container.renderView(
      viewEntry.layer,
      <StandardUiViewWrapper
        ref={wrapperRef}
        isVisible={viewEntry.isVisible}
        level={viewEntry.level}
        type={viewEntry.type}
        popupType={viewEntry.popupType}
        popupBackgroundOcclusion={viewEntry.popupBackgroundOcclusion}
        occlusion={viewEntry.occlusion}
        resetAnimation={this.resetViewAnimation}
      >
        {vNode}
      </StandardUiViewWrapper>
    );

    viewEntry.wrapperRef = wrapperRef;
    viewEntry.ref = vNode.instance as UiView;
    viewEntry.knobLabelStateSub = viewEntry.ref.knobLabelState.sub(this.refreshKnobLabelState.bind(this), false, true);
  }

  /**
   * Cleans up and destroys a view, removing the view from the DOM and freeing up associated resources. The view entry
   * for the view is preserved and can be used to re-render the view in the future.
   * @param viewEntry The entry for the view to clean up.
   */
  private cleanupView(viewEntry: ViewEntry): void {
    viewEntry.wrapperRef?.getOrDefault()?.destroy();
    viewEntry.wrapperRef = undefined;
    viewEntry.ref = undefined;
  }

  /**
   * Visits each history state of this view stack.
   * @param visitor A function which will visit each history state. The function is called once for each history state
   * in order of increasing age (beginning with the present state) and takes two arguments: the number of steps from
   * the present state to the selected state and a function which allows one to peek into the selected state's view
   * stack. The function should return `true` if visitation should continue and `false` if visitation should stop.
   */
  public visitHistory(visitor: (steps: number, stackPeeker: (depth: number) => UiViewStackItem | undefined) => boolean): void {
    let overlayStack: ViewStackItem[] | undefined;
    let mainStack: ViewStackItem[];

    const stackPeeker = (depth: number): UiViewStackItem | undefined => {
      if (depth < 0) {
        depth += mainStack.length + ((overlayStack?.length ?? 1) - 1);

        if (depth < 0) {
          return undefined;
        }
      }

      if (overlayStack !== undefined) {
        if (depth < overlayStack.length - 1) {
          return overlayStack[overlayStack.length - 1 - depth];
        } else {
          depth -= overlayStack.length - 1;
        }
      }

      return mainStack[mainStack.length - 1 - depth];
    };

    let currentStep = 0;

    if (!this.isOpenStackEmpty(UiViewStackLayer.Overlay)) {
      mainStack = this.getOpenStack(UiViewStackLayer.Main);

      const history = this.layerEntries[UiViewStackLayer.Overlay].history;
      for (let i = history.length - 1; i > 0; i--) {
        overlayStack = history[i];

        if (!visitor(currentStep, stackPeeker)) {
          return;
        }

        currentStep++;
      }
    }

    overlayStack = undefined;

    const history = this.layerEntries[UiViewStackLayer.Main].history;
    for (let i = history.length - 1; i >= 0; i--) {
      mainStack = history[i];

      if (!visitor(currentStep, stackPeeker)) {
        return;
      }

      currentStep++;
    }
  }

  /**
   * Opens a view as a page and changes the current page to the opened view. This will close the current page and any
   * open popups.
   * @param key The key of the view to open.
   * @returns The entry of the opened view.
   * @throws Error if this view stack is not attached to a container, there is no view registered under the specified
   * key, or the view to open is already open.
   */
  public changePageTo<T extends UiView = UiView>(key: string): RenderedUiViewEntry<T> {
    const oldPageEntry = this._openPage.get();

    const viewStackItem = this.advance<T>(UiViewStackLayer.Main, key, 'page');
    const viewEntry = viewStackItem.viewEntry;

    if (oldPageEntry === null) {
      viewEntry.wrapperRef.instance.setAnimationClass('ui-page-open-animation');
    } else if (oldPageEntry !== viewEntry) {
      viewEntry.wrapperRef.instance.setAnimationClass('ui-page-open-forward-animation');
    }

    this.refreshOcclusion();
    this.refreshKnobLabelState();

    return viewEntry;
  }

  /**
   * Opens a view as a popup. The opened view will be brought to the top of its view stack layer.
   * @param layer The view stack layer in which to open the view.
   * @param key The key of the view to open.
   * @param options Options describing how to open the popup. If not defined, then the popup will default to type
   * `'normal'` and with a background occlusion type of `'darken'`.
   * @returns The entry of the opened view.
   * @throws Error if this view stack is not attached to a container, there is no view registered under the specified
   * key, or the view to open is already open.
   */
  public openPopup<T extends UiView = UiView>(
    layer: UiViewStackLayer,
    key: string,
    options?: Readonly<UiPopupOpenOptions>
  ): RenderedUiViewEntry<T> {
    const viewStackItem = this.advance<T>(layer, key, 'popup', options);
    const viewEntry = viewStackItem.viewEntry;

    viewEntry.wrapperRef.instance.setAnimationClass(`ui-popup-${viewStackItem.popupType}-open-animation`);

    this.refreshOcclusion();
    this.refreshKnobLabelState();

    return viewEntry;
  }

  /**
   * Advances the history state of this view stack by changing the open page or opening a popup.
   * @param layer The layer in which to open the view.
   * @param key The key of the view to open.
   * @param type The type of view to open.
   * @param popupOptions Options describing how to open the view as a popup. Ignored if `type` is not `'popup'`.
   * @returns The view stack item for the opened view.
   * @throws Error if this view stack is not attached to a container, the type of view to open is a page and the layer
   * is not the main layer, there is no view registered under the specified key, or the view to open is already open.
   */
  private advance<T extends UiView = UiView>(
    layer: UiViewStackLayer,
    key: string,
    type: UiViewType,
    popupOptions?: Readonly<UiPopupOpenOptions>
  ): ViewStackItem<T> {
    if (!this.container) {
      throw new Error('UiViewStack: cannot advance the stack before it is attached to a container');
    }

    if (layer !== UiViewStackLayer.Main && type === 'page') {
      throw new Error('UiViewStack: cannot open a page in a non-main layer');
    }

    const layerEntry = this.layerEntries[layer];

    const viewEntry = layerEntry.registeredViews.get(key);

    if (!viewEntry) {
      throw new Error(`UiViewStack: cannot find registered view in layer '${layer}' with key: '${key}'`);
    }

    const openStack = this.getOpenStack(layerEntry);

    if (UiViewStack.indexOfViewEntryInStack(openStack, viewEntry) >= 0) {
      throw new Error(`UiViewStack: attempting to open a view (key: ${key}) which is already open in the view stack`);
    } else {
      // If the requested view is not already in the open view stack, then we may need to render it.
      if (viewEntry.ref === undefined) {
        this.renderView(viewEntry);
      }
    }

    // At this point the view is guaranteed to be rendered.
    const renderedViewEntry = viewEntry as RenderedViewEntry<T>;

    let needChangeActiveView = false;
    if (layer === UiViewStackLayer.Overlay || this.isOpenStackEmpty(UiViewStackLayer.Overlay)) {
      needChangeActiveView = true;
      const activeViewStackItem = this.getActiveViewStackItem();
      if (activeViewStackItem.type !== 'base') {
        activeViewStackItem.viewEntry.ref.onPause();
      }
    }

    const viewStackItem: ViewStackItem<T> = {
      viewEntry: renderedViewEntry,
      type,
      popupType: undefined,
      backgroundOcclusion: undefined,
      allowEventFallthrough: false
    };

    switch (type) {
      case 'page': {
        this.initPageViewStackItem(viewStackItem);

        // Close all open views in the current stack when changing pages
        this.closeViewStack(openStack, true, 'advance', true);

        // Create a new view stack history state with the base view and opened page as the only members
        layerEntry.history.push([openStack[0], viewStackItem]);

        break;
      }
      case 'popup':
        this.initPopupViewStackItem(viewStackItem, popupOptions);

        // Create a new view stack, retaining the previous stack, and appending to it the opened popup
        layerEntry.history.push([...openStack, viewStackItem]);

        break;
    }

    this.openView(viewStackItem);

    if (needChangeActiveView) {
      this.handleActiveViewChange();
    }

    if (type === 'page') {
      this.handleOpenPageChange();
    }

    return viewStackItem;
  }

  /**
   * Initializes a view stack item describing an open page.
   * @param item The view stack item to initialize.
   */
  private initPageViewStackItem(item: ViewStackItem): void {
    item.type = 'page';
    item.popupType = undefined;
    item.backgroundOcclusion = undefined;
    item.allowEventFallthrough = false;
  }

  /**
   * Initializes a view stack item describing an open popup.
   * @param item The view stack item to initialize.
   * @param options Options describing how the popup is opened.
   */
  private initPopupViewStackItem(item: ViewStackItem, options?: Readonly<UiPopupOpenOptions>): void {
    const popupType = options?.popupType ?? 'normal';
    const backgroundOcclusion = options?.backgroundOcclusion ?? 'darken';
    const allowEventFallthrough = options?.allowEventFallthrough ?? false;

    item.type = 'popup';
    item.popupType = popupType;
    item.backgroundOcclusion = backgroundOcclusion;
    item.allowEventFallthrough = allowEventFallthrough;

    if (options) {
      switch (options.popupType) {
        case 'positioned':
          this.initPositionedPopupViewStackItem(item, options);
          break;
      }
    }
  }

  /**
   * Initializes a view stack item describing an open popup of the `'positioned'` type.
   * @param item The view stack item to initialize.
   * @param options Options describing how the popup is opened.
   */
  private initPositionedPopupViewStackItem(item: ViewStackItem, options: Readonly<UiPositionedPopupOpenOptions>): void {
    item.wrapperClasses = new Set<string>();
    item.wrapperStyles = new Map<string, string>();

    if (options.right !== undefined) {
      item.wrapperClasses.add('ui-popup-positioned-wrapper-right');
      item.wrapperStyles.set('--ui-popup-positioned-x', `${options.right}%`);
    } else {
      item.wrapperClasses.add('ui-popup-positioned-wrapper-left');
      item.wrapperStyles.set('--ui-popup-positioned-x', `${options.left ?? 0}%`);
    }

    if (options.bottom !== undefined) {
      item.wrapperClasses.add('ui-popup-positioned-wrapper-bottom');
      item.wrapperStyles.set('--ui-popup-positioned-y', `${options.bottom}%`);
    } else {
      item.wrapperClasses.add('ui-popup-positioned-wrapper-top');
      item.wrapperStyles.set('--ui-popup-positioned-y', `${options.top ?? 0}%`);
    }
  }

  /**
   * Returns to the most recent previous history state of this view stack. If there is no previous history state to
   * which to return, then this method does nothing.
   * @returns The active view entry in this stack after the operation is complete.
   * @throws Error if this view stack is not attached to a container.
   */
  public goBack(): RenderedUiViewEntry {
    if (!this.container) {
      throw new Error('UiViewStack: cannot revert history state before the stack is attached to a container');
    }

    const layerEntry = this.layerEntries[
      this.layerEntries[UiViewStackLayer.Overlay].history.length <= 1
        ? UiViewStackLayer.Main
        : UiViewStackLayer.Overlay
    ];

    // Revert to previous state by popping the current state off of the view stack.

    const oldActiveViewEntry = this.getActiveViewStackItem().viewEntry;

    const incomingViewStack: ViewStackItem[] | undefined = layerEntry.history[layerEntry.history.length - 2];
    if (!incomingViewStack) {
      return oldActiveViewEntry;
    }

    const wasActiveViewAPage = oldActiveViewEntry.type.get() === 'page';

    // Call the Pause lifecycle method on the outgoing view
    oldActiveViewEntry.ref.onPause();
    this.closeView(oldActiveViewEntry, 'back', false);

    const oldStack = layerEntry.history.pop() as ViewStackItem[];
    this.cleanupTransientViews(oldStack, layerEntry.history);

    // If the previous topmost open view was a page, then we need to go through the new open view stack and open every
    // view since none of them were open in the previous open view stack.
    if (wasActiveViewAPage) {
      for (const item of incomingViewStack) {
        this.openView(item);
      }
    }

    this.handleActiveViewChange();

    if (wasActiveViewAPage) {
      this.handleOpenPageChange();
      this._openPage.get()?.wrapperRef.instance.setAnimationClass('ui-page-open-reverse-animation');
    }

    this.refreshOcclusion();
    this.refreshKnobLabelState();

    return this._activeView.get();
  }

  /**
   * Attempts to return to a previous history state of this view stack.
   * @param selector A function which selects the history state to which to return. The function is called once for
   * each history state in order of increasing age and takes two arguments: the number of steps from the present state
   * to the selected state and a function which allows one to peek into the selected state's view stack. The function
   * should return `true` if the operation should return to the selected state and `false` otherwise. If the function
   * returns `false` for every selected state, then the operation is aborted.
   * @returns The active view entry in this stack after the operation is complete.
   */
  public goBackTo(selector: (steps: number, stackPeeker: (depth: number) => UiViewStackItem | undefined) => boolean): RenderedUiViewEntry {
    let selectedStep: number | undefined;

    this.visitHistory((steps, stackPeeker) => {
      if (selector(steps, stackPeeker)) {
        selectedStep = steps;
        return false;
      } else {
        return true;
      }
    });

    selectedStep ??= 0;

    while (selectedStep-- > 0) {
      this.goBack();
    }

    return this._activeView.get();
  }

  /**
   * Returns to the most recent history state of this view stack in which the overlay layer contains no open views.
   * @param skipPopupCloseAnimation Whether to skip playing the close animations for popups. Defaults to `false`.
   * @returns The active view entry in this stack after the operation is complete.
   * @throws Error if this view stack is not attached to a container.
   */
  public closeAllOverlayViews(skipPopupCloseAnimation = false): RenderedUiViewEntry {
    if (!this.container) {
      throw new Error('UiViewStack: cannot revert history state before the stack is attached to a container');
    }

    const oldActiveViewEntry = this.getActiveViewStackItem().viewEntry;

    if (oldActiveViewEntry.layer === UiViewStackLayer.Main) {
      return oldActiveViewEntry;
    }

    oldActiveViewEntry.ref.onPause();

    const overlayLayerEntry = this.layerEntries[UiViewStackLayer.Overlay];

    this.closeViewStack(this.getOpenStack(overlayLayerEntry), false, 'back', skipPopupCloseAnimation);

    const historyStacks = overlayLayerEntry.history.slice(1);
    overlayLayerEntry.history.length = 1;
    for (let i = historyStacks.length - 1; i >= 0; i--) {
      this.cleanupTransientViews(historyStacks[i], overlayLayerEntry.history);
    }

    this.handleActiveViewChange();

    return this._activeView.get();
  }

  /**
   * Returns to the most recent history state of this view stack in which the active view is the open page. If the
   * current active view is the open page, then this method does nothing.
   * @param skipPopupCloseAnimation Whether to skip playing the close animations for popups. Defaults to `false`.
   * @returns The active view entry in this stack after the operation is complete.
   * @throws Error if this view stack is not attached to a container.
   */
  public goBackToPage(skipPopupCloseAnimation = false): RenderedUiViewEntry {
    if (!this.container) {
      throw new Error('UiViewStack: cannot revert history state before the stack is attached to a container');
    }

    const oldActiveViewEntry = this.getActiveViewStackItem().viewEntry;

    if (oldActiveViewEntry.type.get() === 'page') {
      return oldActiveViewEntry;
    }

    const oldOpenPage = this._openPage.get();

    oldActiveViewEntry.ref.onPause();

    // The overlay layer cannot have open pages, so close everything in the overlay layer and completely reset its
    // history.
    if (!this.isOpenStackEmpty(UiViewStackLayer.Overlay)) {
      const overlayLayerEntry = this.layerEntries[UiViewStackLayer.Overlay];

      this.closeViewStack(this.getOpenStack(overlayLayerEntry), false, 'back', skipPopupCloseAnimation);

      const historyStacks = overlayLayerEntry.history.slice(1);
      overlayLayerEntry.history.length = 1;
      for (let i = historyStacks.length - 1; i >= 0; i--) {
        this.cleanupTransientViews(historyStacks[i], overlayLayerEntry.history);
      }
    }

    const mainLayerEntry = this.layerEntries[UiViewStackLayer.Main];

    let targetHistoryIndex = 0;
    for (let i = mainLayerEntry.history.length - 1; i > 0; i--) {
      const stack = mainLayerEntry.history[i];
      if (stack.length === 2) {
        targetHistoryIndex = i;
        break;
      }
    }

    const targetStack = mainLayerEntry.history[targetHistoryIndex];
    const pageToOpen = targetStack[1].viewEntry;
    const needOpenNewPage = oldOpenPage !== pageToOpen;
    this.closeViewStack(this.getOpenStack(mainLayerEntry), needOpenNewPage, 'back', skipPopupCloseAnimation);

    const historyStacks = mainLayerEntry.history.slice(targetHistoryIndex + 1);
    mainLayerEntry.history.length = targetHistoryIndex + 1;
    for (let j = historyStacks.length - 1; j >= 0; j--) {
      this.cleanupTransientViews(historyStacks[j], mainLayerEntry.history);
    }

    needOpenNewPage && this.openView(this.getActiveViewStackItem());

    this.handleActiveViewChange();
    this.handleOpenPageChange();

    const newActiveViewEntry = this._activeView.get();

    newActiveViewEntry.wrapperRef.instance.setAnimationClass('gtc-page-open-reverse-animation');

    this.refreshOcclusion();
    this.refreshKnobLabelState();

    return newActiveViewEntry;
  }

  /**
   * Returns to the history state of this view stack in which only the empty page is open.
   * @param skipPopupCloseAnimation Whether to skip playing the close animations for popups. Defaults to `false`.
   * @returns The active view entry in this stack after the operation is complete.
   * @throws Error if this view stack is not attached to a container.
   */
  public goBackToEmptyPage(skipPopupCloseAnimation = false): RenderedUiViewEntry {
    if (!this.container) {
      throw new Error('UiViewStack: cannot revert history state before the stack is attached to a container');
    }

    const mainLayerEntry = this.layerEntries[UiViewStackLayer.Main];
    const isOverlayEmpty = this.isOpenStackEmpty(UiViewStackLayer.Overlay);
    const oldActiveViewEntry = this.getActiveViewStackItem().viewEntry;

    if (isOverlayEmpty && mainLayerEntry.history.length === 1) {
      return oldActiveViewEntry;
    }

    const openPage = this._openPage.get();
    const isEmptyPageOpen = openPage.key === UiViewKeys.EmptyPage;

    oldActiveViewEntry.ref.onPause();

    if (!isOverlayEmpty) {
      const overlayLayerEntry = this.layerEntries[UiViewStackLayer.Overlay];

      this.closeViewStack(this.getOpenStack(overlayLayerEntry), false, 'back', skipPopupCloseAnimation);

      const historyStacks = overlayLayerEntry.history.slice(1);
      overlayLayerEntry.history.length = 1;
      for (let i = historyStacks.length - 1; i >= 0; i--) {
        this.cleanupTransientViews(historyStacks[i], overlayLayerEntry.history);
      }
    }

    this.closeViewStack(this.getOpenStack(mainLayerEntry), !isEmptyPageOpen, 'back', skipPopupCloseAnimation);

    const historyStacks = mainLayerEntry.history.slice(1);
    mainLayerEntry.history.length = 1;
    for (let i = historyStacks.length - 1; i >= 0; i--) {
      this.cleanupTransientViews(historyStacks[i], mainLayerEntry.history);
    }

    !isEmptyPageOpen && this.openView(this.getActiveViewStackItem());

    this.handleActiveViewChange();
    this.handleOpenPageChange();

    const newActiveViewEntry = this._activeView.get();

    newActiveViewEntry.wrapperRef.instance.setAnimationClass('gtc-page-open-reverse-animation');

    this.refreshOcclusion();
    this.refreshKnobLabelState();

    return newActiveViewEntry;
  }

  /**
   * Resets the open and closing animations of all views in this view stack. Closed views will immediately be hidden
   * and open views will immediately become visible at their final positions.
   */
  public resetViewAnimations(): void {
    this.resetViewAnimation.notify(this);
  }

  /**
   * Opens a view.
   * @param viewStackItem The view stack item for the view to open.
   * @throws Error if the view is not in the open view stack.
   */
  private openView(viewStackItem: ViewStackItem): void {
    const viewEntry = viewStackItem.viewEntry;

    const layerEntry = this.layerEntries[viewEntry.layer];
    const openStack = this.getOpenStack(layerEntry);

    const index = UiViewStack.indexOfViewEntryInStack(openStack, viewEntry);
    if (index < 0) {
      throw new Error(`UiViewStack: opened view with key ${viewEntry.key} not found in open view stack`);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const container = this.container!;

    viewEntry.ref.onOpen(container.getSizeMode(), container.getDimensions());
    viewEntry.isVisible.set(true);

    viewEntry.type.set(viewStackItem.type);
    viewEntry.popupType.set(viewStackItem.popupType);
    viewEntry.popupBackgroundOcclusion.set(viewStackItem.backgroundOcclusion);

    viewEntry.level.set(index);
    viewEntry.wrapperRef.instance.setClasses(viewStackItem.wrapperClasses ?? null);
    viewEntry.wrapperRef.instance.setStyles(viewStackItem.wrapperStyles ?? null);
    viewEntry.wrapperRef.instance.setAnimationClass(null); // This clears any closing animation classes from the view wrapper.

    viewEntry.knobLabelStateSub.resume();
  }

  /**
   * Closes a view.
   * @param viewEntry The entry of the view to close.
   * @param closeType The type of close operation.
   * @param skipPopupCloseAnimation Whether to skip the close animation for popups.
   */
  private closeView(viewEntry: RenderedViewEntry, closeType: 'advance' | 'back' | 'clear', skipPopupCloseAnimation: boolean): void {
    viewEntry.ref.onClose();

    // Note that we don't reset layer (z-index) here in order to allow the view's closing animation to play properly.
    // Setting isVisible to false is OK because there's a built-in delay before that takes effect.
    viewEntry.isVisible.set(false);
    viewEntry.occlusion.set('none');
    viewEntry.knobLabelStateSub.pause();

    const viewType = viewEntry.type.get();

    if (viewType === 'page') {
      viewEntry.wrapperRef.instance.setAnimationClass('ui-page-close-animation');
    } else if (viewType === 'popup') {
      viewEntry.wrapperRef.instance.setAnimationClass(
        skipPopupCloseAnimation ? 'ui-popup-skip-close-animation' : `ui-popup-${viewEntry.popupType.get()}-close-animation`
      );
    }
  }

  /**
   * Close all views in the current view stack, optionally leaving the current page open.
   * @param viewStack The view stack to close.
   * @param closePage Whether to close the open page in the view stack.
   * @param closeType The type of close operation.
   * @param skipPopupCloseAnimation Whether to skip the close animation for popups.
   */
  private closeViewStack(
    viewStack: ViewStackItem[],
    closePage: boolean,
    closeType: 'advance' | 'back' | 'clear',
    skipPopupCloseAnimation: boolean
  ): void {
    for (let i = viewStack.length - 1; i >= 0; i--) {
      const entry = viewStack[i].viewEntry;
      const type = entry.type.get();

      if (type === 'base' || (type === 'page' && !closePage)) {
        continue;
      }

      this.closeView(entry, closeType, skipPopupCloseAnimation);
    }
  }

  /**
   * Handles logic associated with changing this view stack's open page.
   */
  private handleOpenPageChange(): void {
    this._openPage.set(this.getOpenStack(UiViewStackLayer.Main)[1].viewEntry);
  }

  /**
   * Handles logic associated with changing this view stack's topmost open view.
   */
  private handleActiveViewChange(): void {
    const viewEntry = this.getActiveViewStackItem().viewEntry;
    viewEntry.ref.onResume();
    this._activeView.set(viewEntry);
  }

  /**
   * Refreshes the occlusion state of all of this view stack's open views.
   */
  private refreshOcclusion(): void {
    const overlayStack = this.getOpenStack(UiViewStackLayer.Overlay);
    const mainStack = this.getOpenStack(UiViewStackLayer.Main);

    let occlusion: UiViewOcclusionType = 'none';

    for (let i = overlayStack.length - 1; i >= 0; i--) {
      const entry = overlayStack[i].viewEntry;

      const oldOcclusion = entry.occlusion.get();

      entry.occlusion.set(occlusion);

      if (oldOcclusion !== occlusion) {
        entry.ref.onOcclusionChange(occlusion);
      }

      if (entry.popupBackgroundOcclusion.get() === 'hide') {
        occlusion = 'hide';
      } else if (entry.popupBackgroundOcclusion.get() === 'darken' && occlusion !== 'hide') {
        occlusion = 'darken';
      }
    }

    for (let i = mainStack.length - 1; i >= 0; i--) {
      const entry = mainStack[i].viewEntry;

      const oldOcclusion = entry.occlusion.get();

      entry.occlusion.set(occlusion);

      if (oldOcclusion !== occlusion) {
        entry.ref.onOcclusionChange(occlusion);
      }

      if (entry.popupBackgroundOcclusion.get() === 'hide') {
        occlusion = 'hide';
      } else if (entry.popupBackgroundOcclusion.get() === 'darken' && occlusion !== 'hide') {
        occlusion = 'darken';
      }
    }
  }

  /**
   * Refreshes this view stack's requested bezel rotary knob label state.
   */
  private refreshKnobLabelState(): void {
    let skip = false;

    const validKnobIds = this.uiService.validKnobIds;

    for (let j = 0; j < validKnobIds.length; j++) {
      this.workingKnobLabelState[validKnobIds[j]] = undefined;
    }

    const overlayStack = this.getOpenStack(UiViewStackLayer.Overlay);
    for (let i = overlayStack.length - 1; i > 0; i--) {
      const item = overlayStack[i];

      let undefinedCount = 0;

      for (let j = 0; j < validKnobIds.length; j++) {
        const knobId = validKnobIds[j];

        if (this.workingKnobLabelState[knobId] === undefined) {
          this.workingKnobLabelState[knobId] = item.viewEntry.ref.knobLabelState.getValue(knobId);
        }

        if (this.workingKnobLabelState[knobId] === undefined) {
          undefinedCount++;
        }
      }

      if (undefinedCount === 0 || !item.allowEventFallthrough) {
        skip = true;
        break;
      }
    }

    if (!skip) {
      const mainStack = this.getOpenStack(UiViewStackLayer.Main);
      for (let i = mainStack.length - 1; i > 0; i--) {
        const item = mainStack[i];

        let undefinedCount = 0;

        for (let j = 0; j < validKnobIds.length; j++) {
          const knobId = validKnobIds[j];

          if (this.workingKnobLabelState[knobId] === undefined) {
            this.workingKnobLabelState[knobId] = item.viewEntry.ref.knobLabelState.getValue(knobId);
          }

          if (this.workingKnobLabelState[knobId] === undefined) {
            undefinedCount++;
          }
        }

        if (undefinedCount === 0 || !item.allowEventFallthrough) {
          break;
        }
      }
    }

    for (let j = 0; j < validKnobIds.length; j++) {
      const knobId = validKnobIds[j];
      const state = this.workingKnobLabelState[knobId];

      if (state === undefined) {
        this._knobLabelState.delete(knobId);
      } else {
        this._knobLabelState.setValue(knobId, state);
      }
    }
  }

  /**
   * Iterates through a view stack and cleans up all views with the transient lifecycle policy that are not contained
   * within a given view stack history.
   * @param viewStack The view stack containing the views to clean up.
   * @param viewStackHistory A view stack history containing views which should not be cleaned up.
   */
  private cleanupTransientViews(viewStack: ViewStackItem[], viewStackHistory: ViewStackItem[][]): void {
    for (let i = viewStack.length - 1; i >= 0; i--) {
      const viewEntry = viewStack[i].viewEntry;
      if (viewEntry.lifecyclePolicy === UiViewLifecyclePolicy.Transient && viewEntry.wrapperRef) {
        let canCleanup = true;
        for (let j = viewStackHistory.length - 1; j >= 0; j--) {
          if (UiViewStack.indexOfViewEntryInStack(viewStackHistory[j], viewEntry) >= 0) {
            canCleanup = false;
            break;
          }
        }

        if (canCleanup) {
          this.cleanupView(viewEntry);
        }
      }
    }
  }

  /**
   * Creates a new empty view entry.
   * @param layer The layer to which the view entry belongs.
   * @param key The key of the view entry.
   * @returns A new empty view entry.
   */
  private createEmptyViewEntry(layer: UiViewStackLayer, key: string): RenderedViewEntry {
    const wrapperRef = FSComponent.createRef<EmptyUiViewWrapper>();
    const isVisible: Subject<boolean> = Subject.create<boolean>(false);
    const level: Subject<number> = Subject.create(-1);
    const type = Subject.create<UiViewType | undefined>(undefined);
    const popupType = Subject.create<UiPopupType | undefined>(undefined);
    const popupBackgroundOcclusion = Subject.create<UiViewOcclusionType | undefined>(undefined);
    const occlusion = Subject.create<UiViewOcclusionType>('none');

    const viewNode = <EmptyUiView uiService={this.uiService} containerRef={FSComponent.createRef<HTMLElement>()} />;

    (
      <EmptyUiViewWrapper ref={wrapperRef}>
        {viewNode}
      </EmptyUiViewWrapper>
    );

    const ref: UiView = viewNode.instance as UiView;
    const knobLabelStateSub = ref.knobLabelState.sub(this.refreshKnobLabelState.bind(this), false, true);

    return {
      layer,
      lifecyclePolicy: UiViewLifecyclePolicy.Static,
      key,
      factory: () => viewNode,
      ref,
      wrapperRef,
      isVisible,
      level,
      type,
      popupType,
      popupBackgroundOcclusion,
      occlusion,
      knobLabelStateSub
    };
  }

  /**
   * Gets the index of a view entry in a view stack.
   * @param stack The view stack to search.
   * @param viewEntry The view entry for which to search.
   * @returns The index of the specified view entry in the view stack, or `-1` if the entry is not in the stack.
   */
  private static indexOfViewEntryInStack(stack: ViewStackItem[], viewEntry: ViewEntry): number {
    for (let i = 0; i < stack.length; i++) {
      if (stack[i].viewEntry === viewEntry) {
        return i;
      }
    }

    return -1;
  }
}

/**
 * A wrapper for a UI view.
 */
interface UiViewWrapper<P extends ComponentProps = ComponentProps> extends DisplayComponent<P> {
  /**
   * Sets additional CSS classes on the wrapper. The new classes will replace any existing additional classes. These
   * classes are handled separately from the wrapper's animation class (set using `setAnimationClass()`).
   * @param classes An iterable of the CSS classes to set, or `null` to remove any existing additional classes.
   */
  setClasses(classes: Iterable<string> | null): void;

  /**
   * Sets additional CSS styles on the wrapper. The new styles will replace any existing additional styles.
   * @param styles An iterable of the styles to set, each as a `[name, value]` pair, or `null` to remove any existing
   * additional styles.
   */
  setStyles(styles: Iterable<[string, string]> | null): void;

  /**
   * Sets the wrapper's animation CSS class. The new class will replace the existing animation class. The animation
   * class is handled separately from the wrapper's additional classes (set using `setClasses()`).
   * @param animationClass The animation CSS class to set, or `null` to remove any existing animation class.
   */
  setAnimationClass(animationClass: string | null): void;
}

/**
 * Component props for StandardUiViewWrapper.
 */
interface StandardUiViewWrapperProps extends ComponentProps {
  /** Whether the view is visible. */
  isVisible: Subscribable<boolean>;

  /** The view's position in the view stack. */
  level: Subscribable<number>;

  /** The type the view is currently opened as, either page or popup or base. */
  type: Subscribable<UiViewType | undefined>;

  /** The popup type of the view, or `undefined` if the view is not currently opened as a popup. */
  popupType: Subscribable<UiPopupType | undefined>;

  /**
   * The occlusion type applied to views beneath this entry's view when it is opened as a popup, or `undefined` if the
   * view is not currently opened as a popup.
   */
  popupBackgroundOcclusion: Subscribable<UiViewOcclusionType | undefined>;

  /** The type of occlusion applied to the view. */
  occlusion: Subscribable<UiViewOcclusionType>;

  /** An event to which to subscribe to be notified of when the wrapper should reset its animations. */
  resetAnimation: ReadonlySubEvent<any, void>;
}

/**
 * A UI view wrapper used to control the visibility, animations, and occlusion of its child view.
 */
class StandardUiViewWrapper extends DisplayComponent<StandardUiViewWrapperProps> implements UiViewWrapper<StandardUiViewWrapperProps> {
  private static readonly RESERVED_CSS_CLASSES = [
    'ui-view-wrapper',
    'ui-page-wrapper',
    'ui-popup-wrapper',
    'ui-popup-normal-wrapper',
    'ui-popup-positioned-wrapper',
    'ui-popup-slideout-top-full-wrapper',
    'ui-popup-slideout-bottom-full-wrapper',
    'ui-popup-slideout-right-full-wrapper',
    'ui-popup-no-background-occlusion',
    'ui-view-occlude-darken',
    'ui-view-occlude-hidden',
    'hidden'
  ];

  private static readonly HIDE_DELAY = 1000; // milliseconds

  private thisNode?: VNode;

  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  private readonly classList = SetSubject.create(['ui-view-wrapper', 'hidden']);
  private readonly styles = MapSubject.create<string, string>();

  private readonly hideDebounce = new DebounceTimer();

  private readonly currentClasses = new Set<string>();
  private readonly currentStyles = new Set<string>();

  private currentAnimationClass: string | null = null;

  private isAlive = true;

  private readonly subs = [] as Subscription[];
  private resetAnimationSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    const hide = (): void => {
      if (this.isAlive) {
        this.classList.add('hidden');
      } else {
        this.doDestroy();
      }
    };

    this.subs.push(
      this.props.isVisible.sub(isVisible => {
        if (isVisible) {
          this.hideDebounce.clear();
          this.classList.delete('hidden');
        } else {
          // hack to ensure that any views with closing animations get to play them before the view disappears
          this.hideDebounce.schedule(hide, StandardUiViewWrapper.HIDE_DELAY);
        }
      }, true),

      this.props.level.sub(level => { this.styles.setValue('z-index', level.toString()); }, true)
    );

    this.subs.push(this.props.type.sub(type => {
      this.classList.toggle('ui-page-wrapper', type === 'page');
      this.classList.toggle('ui-popup-wrapper', type === 'popup');
    }, true));

    this.subs.push(this.props.popupType.sub(popupType => {
      this.classList.toggle('ui-popup-normal-wrapper', popupType === 'normal');
      this.classList.toggle('ui-popup-positioned-wrapper', popupType === 'positioned');
      this.classList.toggle('ui-popup-slideout-top-full-wrapper', popupType === 'slideout-top-full');
      this.classList.toggle('ui-popup-slideout-bottom-full-wrapper', popupType === 'slideout-bottom-full');
      this.classList.toggle('ui-popup-slideout-right-full-wrapper', popupType === 'slideout-right-full');
    }, true));

    this.subs.push(this.props.popupBackgroundOcclusion.sub(occlusion => {
      this.classList.toggle('ui-popup-no-background-occlusion', occlusion === 'none');
    }, true));

    this.subs.push(this.props.occlusion.sub(occlusion => {
      this.classList.toggle('ui-view-occlude-darken', occlusion === 'darken');
      this.classList.toggle('ui-view-occlude-hidden', occlusion === 'hide');
    }, true));

    this.resetAnimationSub = this.props.resetAnimation.on(this.resetAnimationClass.bind(this));
  }

  /**
   * Sets additional CSS classes to apply to this wrapper.
   * @param classes The additional classes to apply to this wrapper, or `null` if no additional classes should be
   * applied to this wrapper.
   */
  public setClasses(classes: Iterable<string> | null): void {
    this.resetClasses();

    if (classes === null) {
      return;
    }

    for (const classToAdd of classes) {
      if (StandardUiViewWrapper.RESERVED_CSS_CLASSES.includes(classToAdd)) {
        return;
      }

      this.currentClasses.add(classToAdd);
      this.classList.add(classToAdd);
    }
  }

  /**
   * Clears any additional CSS classes applied to this wrapper.
   */
  private resetClasses(): void {
    if (this.currentClasses.size === 0) {
      return;
    }

    for (const cssClass of this.currentClasses) {
      this.classList.delete(cssClass);
    }

    this.currentClasses.clear();
  }

  /**
   * Sets additional CSS styles to apply to this wrapper.
   * @param styles The additional styles to apply to this wrapper, as `[key, value]` pairs, or `null` if no additional
   * styles should be applied to this wrapper.
   */
  public setStyles(styles: Iterable<[string, string]> | null): void {
    this.resetStyles();

    if (styles === null) {
      return;
    }

    for (const [style, value] of styles) {
      if (style === 'z-index') {
        return;
      }

      this.currentStyles.add(style);
      this.styles.setValue(style, value);
    }
  }

  /**
   * Clears any additional CSS styles applied to this wrapper.
   */
  private resetStyles(): void {
    if (this.currentStyles.size === 0) {
      return;
    }

    for (const style of this.currentStyles) {
      this.styles.delete(style);
    }

    this.currentStyles.clear();
  }

  /** @inheritdoc */
  public setAnimationClass(animationClass: string | null): void {
    if (animationClass === this.currentAnimationClass) {
      return;
    }

    if (StandardUiViewWrapper.RESERVED_CSS_CLASSES.includes(animationClass as any)) {
      return;
    }

    if (this.currentAnimationClass !== null) {
      this.classList.delete(this.currentAnimationClass);
    }

    this.currentAnimationClass = animationClass;

    if (this.currentAnimationClass !== null) {
      this.classList.add(this.currentAnimationClass);
    }
  }

  /**
   * Immediately shows or hides this wrapper based on its intended visibility state and removes this wrapper's
   * animation CSS class.
   */
  private resetAnimationClass(): void {
    this.hideDebounce.clear();
    this.classList.toggle('hidden', !this.props.isVisible.get());
    this.setAnimationClass(null);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div ref={this.rootRef} class={this.classList} style={this.styles}>
        {this.props.children}
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    this.subs.forEach(x => x.destroy());

    if (!this.hideDebounce.isPending()) {
      this.doDestroy();
    }
  }

  /**
   * Executes cleanup code when this wrapper is destroyed.
   */
  private doDestroy(): void {
    this.resetAnimationSub?.destroy();

    const root = this.rootRef.getOrDefault();
    if (root !== null) {
      root.parentNode?.removeChild(root);
    }

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.hideDebounce.clear();

    super.destroy();
  }
}

/**
 * An empty UI view wrapper that is not rendered to the DOM.
 */
class EmptyUiViewWrapper extends DisplayComponent<ComponentProps> implements UiViewWrapper {
  /** @inheritdoc */
  public setClasses(): void {
    // noop
  }

  /** @inheritdoc */
  public setStyles(): void {
    // noop
  }

  /** @inheritdoc */
  public setAnimationClass(): void {
    // noop
  }

  /** @inheritdoc */
  public render(): null {
    return null;
  }
}

/**
 * An empty UI view that is not rendered to the DOM.
 */
class EmptyUiView extends AbstractUiView {
  /** @inheritdoc */
  public render(): null {
    return null;
  }
}
import {
  ComponentProps, DisplayComponent, EventBus, FSComponent, MapSubject, MappedSubject, SetSubject, Subject,
  Subscribable, SubscribableMap, SubscribableMapFunctions, SubscribableSet, SubscribableUtils, Subscription,
  ToggleableClassNameRecord, VNode, Vec2Math, Vec2Subject
} from '@microsoft/msfs-sdk';

import { GduFormat } from '../../CommonTypes';
import { UiInteractionEvent, UiInteractionHandler } from '../../UiSystem/UiInteraction';
import { UiInteractionUtils } from '../../UiSystem/UiInteractionUtils';
import { UiKnobId, UiKnobRequestedLabelState } from '../../UiSystem/UiKnobTypes';
import { UiKnobUtils } from '../../UiSystem/UiKnobUtils';
import { TouchList } from '../List/TouchList';
import { UiTouchButton } from '../TouchButton/UiTouchButton';
import { TabbedContent } from './TabbedContent';

import './TabbedContainer.css';

/**
 * Component props for TabbedContainer.
 */
export interface TabbedContainerProps extends ComponentProps {
  /**
   * The event bus. Required for the container's tab list to respond appropriately to the mouse leaving the virtual
   * cockpit instrument screen while the user is dragging the list.
   */
  bus?: EventBus;

  /**
   * The IDs of the valid bezel rotary knobs that can be used to change the container's selected tab. If not defined,
   * then knobs cannot be used to change the container's selected tab.
   */
  validKnobIds?: Iterable<UiKnobId>;

  /**
   * The bezel rotary knob label to request for the knobs that can be used to change the container's selected tab.
   * Defaults to `'Select Tab'`.
   */
  knobLabel?: string | Subscribable<string>;

  /** The position of the container's tabs relative to the content box. */
  tabPosition: 'left' | 'right' | 'top' | 'bottom';

  /** The maximum number of tabs visible at any one time in the container's tab list. */
  tabsPerListPage: number | Subscribable<number>;

  /** The length of each tab along the axis along which the tabs are arranged, in pixels. */
  tabLength: number | Subscribable<number>;

  /**
   * The spacing between each tab, in pixels. For best results, this value should be greater than or equal to the
   * border radius of the tabs.
   */
  tabSpacing: number | Subscribable<number>;

  /** The format of the container's parent GDU display. */
  gduFormat: GduFormat;

  /** CSS class(es) to apply to the container's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * An entry describing a single tabbed content.
 */
type TabbedContentEntry = {
  /** The index of this entry's tab. */
  index: number;

  /** The wrapper for this entry's tabbed content. */
  wrapper: TabbedContentWrapper;

  /** This entry's tabbed content. */
  content: TabbedContent;

  /** Whether this entry's tab is enabled. */
  isEnabled: Subscribable<boolean>;

  /** Whether this entry's tab is visible. */
  isVisible: Subscribable<boolean>;

  /** A function which creates labels for this entry's tab. */
  tabLabelFunc: () => string | Subscribable<string> | VNode;

  /** The rendered unselected instance of this entry's tab. */
  unselectedTab?: Tab;

  /** The rendered selected instance of this entry's tab. */
  selectedTab?: Tab;
};

/**
 * An entry describing a single fully rendered tabbed content.
 */
type RenderedTabbedContentEntry = Required<TabbedContentEntry>;

/**
 * A container which displays content organized into an arbitrary number of tabs. Only the content associated with one
 * tab is displayed at any given time. Tabs are displayed on one of the four edges of the container in a list which
 * supports scrolling if the total number of tabs exceeds the amount that can be displayed simultaneously.
 *
 * The container's contents are added as children that implement the {@link TabbedContent} interface. It is forbidden
 * to add children to TabbedContainer that do not implement TabbedContent. Each TabbedContent child defines one tab and
 * its contents. The order in which tabs are presented in the container's tab list is the same as the order in which
 * their associated TabbedContents were added to the container as children.
 */
export class TabbedContainer extends DisplayComponent<TabbedContainerProps> implements UiInteractionHandler {
  private static readonly RESERVED_CLASSES = [
    'tabbed-container',
    'tabbed-container-top',
    'tabbed-container-bottom',
    'tabbed-container-left',
    'tabbed-container-right'
  ];

  private readonly tabListRef = FSComponent.createRef<TouchList>();
  private readonly selectedTabContainerRef = FSComponent.createRef<HTMLDivElement>();

  private readonly isTabListHorizontal = this.props.tabPosition === 'top' || this.props.tabPosition === 'bottom';

  private readonly rootCssClass = SetSubject.create<string>([
    'tabbed-container',
    `tabbed-container-${this.props.tabPosition}`,
    `tabbed-container-${this.isTabListHorizontal ? 'horiz' : 'vert'}`
  ]);

  private readonly tabsPerListPage = SubscribableUtils.toSubscribable(this.props.tabsPerListPage, true);
  private readonly tabLength = SubscribableUtils.toSubscribable(this.props.tabLength, true);
  private readonly tabSpacing = SubscribableUtils.toSubscribable(this.props.tabSpacing, true);

  private readonly tabbedContentEntries: TabbedContentEntry[] = [];
  private readonly tabCount = Subject.create(0);

  private readonly tabListLength = Subject.create(0);

  private readonly selectedTabEnabledHandler = (isEnabled: boolean): void => {
    if (!isEnabled) {
      this.onSelectedTabDisabled();
    }
  };

  private selectedTabIndex = -1;
  private selectedTabEnabledSub?: Subscription;
  private selectedTabVisibleSub?: Subscription;

  private readonly selectedTabTranslateLimitIndex = Subject.create(-1);
  private readonly selectedTabScrollLimitState = MappedSubject.create(
    this.selectedTabTranslateLimitIndex,
    this.tabsPerListPage,
    this.tabLength,
    this.tabSpacing
  );
  private readonly selectedTabScrollLimits = Vec2Subject.create(Vec2Math.create());
  private readonly selectedTabTransform = Subject.create('translate3d(0px, 0px, 0px)');

  private readonly tabArrowsHidden = Subject.create(false);
  private readonly isBackTabArrowDisabled = Subject.create(false);
  private readonly isForwardTabArrowDisabled = Subject.create(false);

  private readonly validKnobIds = new Set<UiKnobId>(this.props.validKnobIds);
  private readonly knobLabel = SubscribableUtils.toSubscribable(this.props.knobLabel ?? 'Select Tab', true);

  private readonly baseRequestedKnobLabelState = MapSubject.create<UiKnobId, string>();

  private readonly selectedTabRequestedKnobLabelState = MapSubject.create<UiKnobId, string>();
  private selectedTabRequestedKnobLabelStatePipe?: Subscription;

  private knobLabelStateReconciliationPipe?: Subscription;

  private readonly _knobLabelState = MapSubject.create<UiKnobId, string>();
  /** The bezel rotary knob label state requested by this container. */
  public readonly knobLabelState = this._knobLabelState as SubscribableMap<UiKnobId, string> & Subscribable<UiKnobRequestedLabelState>;

  private isAlive = true;
  private isInit = false;
  private isOpen = false;
  private isResumed = false;

  private readonly subscriptions: Subscription[] = [
    this.selectedTabScrollLimitState
  ];

  /** @inheritdoc */
  public onAfterRender(): void {
    // Render tabs to list.

    const tabListContainer = this.tabListRef.instance.getContainerRef();

    const updateScrollLimits = (): void => { this.updateSelectedTabScrollLimits(this.selectedTabScrollLimitState.get()); };

    for (const entry of this.tabbedContentEntries) {
      // For each tab, we will render two copies. One copy is rendered as an unselected tab and the other is rendered
      // as a selected tab. The unselected tab is rendered to the tab list normally. The selected tab is rendered to a
      // separate container within the tab list. The selected tab container normally translates with the tab list but
      // can be offset in order to keep the currently selected tab in view. While a tab is selected, its unselected
      // copy is hidden and its selected copy is shown and vice versa.

      const onPressed = this.selectTabIndex.bind(this, entry.index);

      const unselectedTabNode: VNode = (
        <Tab
          label={entry.tabLabelFunc()}
          isEnabled={entry.isEnabled}
          isVisible={entry.isVisible}
          onPressed={onPressed}
          gduFormat={this.props.gduFormat}
        />
      );
      const selectedTabNode: VNode = (
        <Tab
          label={entry.tabLabelFunc()}
          isEnabled={entry.isEnabled}
          isVisible={entry.isVisible}
          onPressed={onPressed}
          gduFormat={this.props.gduFormat}
        />
      );

      entry.unselectedTab = unselectedTabNode.instance as Tab;
      entry.selectedTab = selectedTabNode.instance as Tab;

      entry.unselectedTab.setVisibility(true);
      entry.selectedTab.setVisibility(false);

      FSComponent.render(unselectedTabNode, tabListContainer);
      FSComponent.render(selectedTabNode, this.selectedTabContainerRef.instance);

      entry.isVisible.sub(updateScrollLimits);
    }

    const tabCountSource = MappedSubject.create(
      SubscribableMapFunctions.count<boolean>(isVisible => isVisible),
      ...this.tabbedContentEntries.map(entry => entry.isVisible)
    );
    tabCountSource.pipe(this.tabCount);
    this.subscriptions.push(tabCountSource);

    // Initialize selected tab container translation logic.

    this.selectedTabScrollLimitState.sub(this.updateSelectedTabScrollLimits.bind(this), true);

    MappedSubject.create(
      ([scrollPos, limits]) => {
        if (scrollPos < limits[0]) {
          return scrollPos - limits[0];
        } else if (scrollPos > limits[1]) {
          return scrollPos - limits[1];
        } else {
          return 0;
        }
      },
      this.tabListRef.instance.scrollPos,
      this.selectedTabScrollLimits
    ).sub(this.isTabListHorizontal ? this.updateSelectedTabTranslateX.bind(this) : this.updateSelectedTabTranslateY.bind(this), true);

    // Initialize tab arrow logic.

    this.tabListRef.instance.lengthPx.pipe(this.tabListLength);
    this.tabListRef.instance.maxScrollPos.pipe(this.tabArrowsHidden, maxScrollPos => maxScrollPos <= 0);
    this.tabListRef.instance.scrollPosFraction.pipe(this.isBackTabArrowDisabled, scrollPosFraction => scrollPosFraction <= 0);
    this.tabListRef.instance.scrollPosFraction.pipe(this.isForwardTabArrowDisabled, scrollPosFraction => scrollPosFraction >= 1);

    // Initialize requested knob label state.

    this.subscriptions.push(
      this.knobLabel.sub(label => {
        for (const knobId of this.validKnobIds) {
          if (UiKnobUtils.isTurnKnobId(knobId)) {
            this.baseRequestedKnobLabelState.setValue(knobId, label);
          }
        }
      }, true)
    );

    this.knobLabelStateReconciliationPipe = UiKnobUtils.reconcileRequestedLabelStates(
      UiKnobUtils.ALL_KNOB_IDS, this._knobLabelState, !this.isResumed,
      this.selectedTabRequestedKnobLabelState,
      this.baseRequestedKnobLabelState,
    );

    this.isInit = true;

    this.selectFirstTab();
  }

  /**
   * Opens this container. This will open the currently selected tab, if one exists. While open, this container can
   * be updated.
   * @throws Error if this container has been destroyed.
   */
  public open(): void {
    if (!this.isAlive) {
      throw new Error('TabbedContainer: cannot open after the container has been destroyed');
    }

    if (this.isOpen) {
      return;
    }

    this.isOpen = true;

    if (!this.isInit) {
      return;
    }

    const entry = this.tabbedContentEntries[this.selectedTabIndex] as RenderedTabbedContentEntry | undefined;
    if (entry) {
      entry.content.onOpen();
    }
  }

  /**
   * Closes this container. This will close the currently selected tab, if one exists. If the container is resumed,
   * then this will also pause the container before closing it.
   * @throws Error if this container has been destroyed.
   */
  public close(): void {
    if (!this.isAlive) {
      throw new Error('TabbedContainer: cannot close after the container has been destroyed');
    }

    if (!this.isOpen) {
      return;
    }

    this.pause();

    this.isOpen = false;

    if (!this.isInit) {
      return;
    }

    const entry = this.tabbedContentEntries[this.selectedTabIndex] as RenderedTabbedContentEntry | undefined;
    if (entry) {
      entry.content.onClose();
    }
  }

  /**
   * Resumes this container. This will resume the currently selected tab, if one exists. If the container is closed,
   * then this will also open the container before resuming it. While resumed, the container will forward requested
   * bezel rotary knob label states from the selected tab and handle UI interaction events (including routing events
   * to the selected tab).
   * @throws Error if this container has been destroyed.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('TabbedContainer: cannot resume after the container has been destroyed');
    }

    if (this.isResumed) {
      return;
    }

    if (!this.isOpen) {
      this.open();
    }

    this.isResumed = true;

    if (!this.isInit) {
      return;
    }

    this.knobLabelStateReconciliationPipe?.resume(true);

    const entry = this.tabbedContentEntries[this.selectedTabIndex] as RenderedTabbedContentEntry | undefined;
    if (entry) {
      entry.content.onResume();
    }
  }

  /**
   * Pauses this container. This will pause the currently selected tab, if one exists.
   * @throws Error if this container has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('TabbedContainer: cannot pause after the container has been destroyed');
    }

    if (!this.isResumed) {
      return;
    }

    this.isResumed = false;

    if (!this.isInit) {
      return;
    }

    this.knobLabelStateReconciliationPipe?.pause();
    this._knobLabelState.clear();

    const entry = this.tabbedContentEntries[this.selectedTabIndex] as RenderedTabbedContentEntry | undefined;
    if (entry) {
      entry.content.onPause();
    }
  }

  /**
   * Updates this container. This will update the currently selected tab, if one exists. If this container is closed,
   * then this method does nothing.
   * @param time The current real (operating system) time, as a Javascript timestamp.
   * @throws Error if this container has been destroyed.
   */
  public update(time: number): void {
    if (!this.isAlive) {
      throw new Error('TabbedContainer: cannot update after the container has been destroyed');
    }

    if (!this.isInit || !this.isOpen) {
      return;
    }

    const entry = this.tabbedContentEntries[this.selectedTabIndex] as RenderedTabbedContentEntry | undefined;
    if (entry) {
      entry.content.onUpdate(time);
    }
  }

  /**
   * Selects a tab by index. Tabs are indexed in the order in which they were added to this container as children.
   * @param index The index of the tab to select, or `-1` to deselect the currently selected tab without selecting a
   * new tab.
   * @throws Error if this container has been destroyed or has not been rendered.
   */
  public selectTabIndex(index: number): void {
    if (!this.isAlive) {
      throw new Error('TabbedContainer: cannot select tab after the container has been destroyed');
    }

    if (!this.isInit) {
      throw new Error('TabbedContainer: cannot select tab before the container is rendered');
    }

    if (index === this.selectedTabIndex) {
      return;
    }

    const newEntry = this.tabbedContentEntries[index] as RenderedTabbedContentEntry | undefined;

    if (index >= 0 && (!newEntry || !newEntry.isEnabled.get() || !newEntry.isVisible.get())) {
      return;
    }

    const oldEntry = this.tabbedContentEntries[this.selectedTabIndex] as RenderedTabbedContentEntry | undefined;

    this.selectedTabEnabledSub?.destroy();
    this.selectedTabEnabledSub = undefined;

    this.selectedTabVisibleSub?.destroy();
    this.selectedTabVisibleSub = undefined;

    this.selectedTabRequestedKnobLabelStatePipe?.destroy();
    this.selectedTabRequestedKnobLabelStatePipe = undefined;

    this.selectedTabIndex = index;

    if (oldEntry) {
      oldEntry.wrapper.setVisible(false);

      oldEntry.unselectedTab.setVisibility(true);
      oldEntry.selectedTab.setVisibility(false);

      if (this.isOpen) {
        if (this.isResumed) {
          oldEntry.content.onPause();
        }
        oldEntry.content.onClose();
      }
      oldEntry.content.onDeselect();
    }

    if (newEntry) {
      newEntry.selectedTab.setVisibility(true);
      newEntry.unselectedTab.setVisibility(false);

      this.selectedTabTranslateLimitIndex.set(index);

      this.tabListRef.instance.scrollToIndexWithMargin(index, 0, true);

      newEntry.wrapper.setVisible(true);
      newEntry.content.onSelect();
      if (this.isOpen) {
        newEntry.content.onOpen();
        if (this.isResumed) {
          newEntry.content.onResume();
        }
      }

      this.selectedTabEnabledSub = newEntry.isEnabled.sub(this.selectedTabEnabledHandler);
      this.selectedTabVisibleSub = newEntry.isVisible.sub(this.selectedTabEnabledHandler);
      this.selectedTabRequestedKnobLabelStatePipe = newEntry.content.knobLabelState.pipe(this.selectedTabRequestedKnobLabelState);
    } else {
      this.selectedTabTranslateLimitIndex.set(-1);
      this.selectedTabRequestedKnobLabelState.clear();
    }
  }

  /**
   * Selects the lowest-indexed enabled tab with a higher index than the currently selected tab. If there is no
   * currently selected tab, then selects the overall lowest-indexed enabled tab. Tabs are indexed in the order in
   * which they were added to this container as children.
   * @returns The index of the selected tab, or `-1` if there were no enabled tabs to select.
   * @throws Error if this container has been destroyed or has not been rendered.
   */
  public selectNextTab(): number {
    if (!this.isAlive) {
      throw new Error('TabbedContainer: cannot select tab after the container has been destroyed');
    }

    if (!this.isInit) {
      throw new Error('TabbedContainer: cannot select tab before the container is rendered');
    }

    return this.selectFirstTab(this.selectedTabIndex < 0 ? undefined : this.selectedTabIndex + 1);
  }

  /**
   * Selects the highest-indexed enabled tab with a lower index than the currently selected tab. If there is no
   * currently selected tab, then selects the overall highest-indexed enabled tab. Tabs are indexed in the order in
   * which they were added to this container as children.
   * @returns The index of the selected tab, or `-1` if there were no enabled tabs to select.
   * @throws Error if this container has been destroyed or has not been rendered.
   */
  public selectPrevTab(): number {
    if (!this.isAlive) {
      throw new Error('TabbedContainer: cannot select tab after the container has been destroyed');
    }

    if (!this.isInit) {
      throw new Error('TabbedContainer: cannot select tab before the container is rendered');
    }

    return this.selectLastTab(this.selectedTabIndex < 0 ? undefined : this.selectedTabIndex - 1);
  }

  /**
   * Selects the lowest-indexed enabled tab. Tabs are indexed in the order in which they were added to this container
   * as children.
   * @param startIndex The index from which to start the search for enabled tabs to select. Defaults to `0`.
   * @returns The index of the selected tab, or `-1` if there were no enabled tabs to select.
   * @throws Error if this container has been destroyed or has not been rendered.
   */
  public selectFirstTab(startIndex = 0): number {
    if (!this.isAlive) {
      throw new Error('TabbedContainer: cannot select tab after the container has been destroyed');
    }

    if (!this.isInit) {
      throw new Error('TabbedContainer: cannot select tab before the container is rendered');
    }

    for (let i = startIndex; i < this.tabbedContentEntries.length; i++) {
      const entry = this.tabbedContentEntries[i];
      if (entry.isEnabled.get() && entry.isVisible.get()) {
        this.selectTabIndex(i);
        break;
      }
    }

    return this.selectedTabIndex;
  }

  /**
   * Selects the highest-indexed enabled tab. Tabs are indexed in the order in which they were added to this container
   * as children.
   * @param startIndex The index from which to start the search for enabled tabs to select. Defaults to the index of
   * this container's highest-indexed tab.
   * @returns The index of the selected tab, or `-1` if there were no enabled tabs to select.
   * @throws Error if this container has been destroyed or has not been rendered.
   */
  public selectLastTab(startIndex = this.tabbedContentEntries.length - 1): number {
    if (!this.isAlive) {
      throw new Error('TabbedContainer: cannot select tab after the container has been destroyed');
    }

    if (!this.isInit) {
      throw new Error('TabbedContainer: cannot select tab before the container is rendered');
    }

    for (let i = startIndex; i >= 0; i--) {
      const entry = this.tabbedContentEntries[i];
      if (entry.isEnabled.get() && entry.isVisible.get()) {
        this.selectTabIndex(i);
        break;
      }
    }

    return this.selectedTabIndex;
  }

  /** @inheritdoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    if (!this.isResumed) {
      return false;
    }

    const entry = this.tabbedContentEntries[this.selectedTabIndex] as RenderedTabbedContentEntry | undefined;
    if (entry?.content.onUiInteractionEvent(event)) {
      return true;
    }

    switch (event) {
      case UiInteractionEvent.SingleKnobOuterInc:
      case UiInteractionEvent.SingleKnobInnerInc:
      case UiInteractionEvent.LeftKnobOuterInc:
      case UiInteractionEvent.LeftKnobInnerInc:
      case UiInteractionEvent.RightKnobOuterInc:
      case UiInteractionEvent.RightKnobInnerInc:
        if (this.validKnobIds.has(UiInteractionUtils.KNOB_EVENT_TO_KNOB_ID[event])) {
          this.selectNextTab();
          return true;
        }
        break;
      case UiInteractionEvent.SingleKnobOuterDec:
      case UiInteractionEvent.SingleKnobInnerDec:
      case UiInteractionEvent.LeftKnobOuterDec:
      case UiInteractionEvent.LeftKnobInnerDec:
      case UiInteractionEvent.RightKnobOuterDec:
      case UiInteractionEvent.RightKnobInnerDec:
        if (this.validKnobIds.has(UiInteractionUtils.KNOB_EVENT_TO_KNOB_ID[event])) {
          this.selectPrevTab();
          return true;
        }
        break;
    }

    return false;
  }

  /**
   * Responds to when this container's selected tab becomes disabled.
   */
  private onSelectedTabDisabled(): void {
    if (this.selectedTabIndex < 0) {
      return;
    }

    // Attempt to select the closest enabled tab to the previously selected tab, biasing toward the higher-indexed tab
    // if there are two equidistant enabled tabs.

    for (let delta = 1; delta < this.tabbedContentEntries.length - 1; delta++) {
      const nextIndex = this.selectedTabIndex + delta;
      const prevIndex = this.selectedTabIndex - delta;

      if (nextIndex < this.tabbedContentEntries.length) {
        const entry = this.tabbedContentEntries[nextIndex];
        if (entry.isEnabled.get() && entry.isVisible.get()) {
          this.selectTabIndex(nextIndex);
          return;
        }
      } else if (prevIndex >= 0) {
        const entry = this.tabbedContentEntries[prevIndex];
        if (entry.isEnabled.get() && entry.isVisible.get()) {
          this.selectTabIndex(prevIndex);
          return;
        }
      } else {
        break;
      }
    }

    this.selectTabIndex(-1);
  }

  /**
   * Updates the scroll position limits of this container's tab list beyond which the selected tab container needs to
   * be translated to keep the currently selected tab in view.
   * @param root0 The scroll limit input state.
   * @param root0."0" The index of the currently selected tab.
   * @param root0."1" The maximum number of tabs visible at any one time in the tab list.
   * @param root0."2" The length of each tab along the axis along which the tabs are arranged, in pixels.
   * @param root0."3" The spacing between each tab, in pixels.
   */
  private updateSelectedTabScrollLimits([index, tabsPerListPage, tabLength, tabSpacing]: readonly [number, number, number, number]): void {
    if (index < 0) {
      this.selectedTabScrollLimits.set(-Infinity, Infinity);
      return;
    }

    // Because invisible tabs don't take up any space, subtract the number of invisible tabs before the selected tab
    // from index prior to calculating the scroll limits.
    for (let i = 0; i < index; i++) {
      if (!this.tabbedContentEntries[i].isVisible.get()) {
        index--;
      }
    }

    const min = (index - tabsPerListPage + 1) * (tabLength + tabSpacing);
    const max = index * (tabLength + tabSpacing);
    this.selectedTabScrollLimits.set(min, max);
  }

  /**
   * Updates the x-translation of this container's selected tab container.
   * @param translate The new translation, in pixels.
   */
  private updateSelectedTabTranslateX(translate: number): void {
    this.selectedTabTransform.set(`translate3d(${translate}px, 0px, 0px)`);
  }

  /**
   * Updates the y-translation of this container's selected tab container.
   * @param translate The new translation, in pixels.
   */
  private updateSelectedTabTranslateY(translate: number): void {
    this.selectedTabTransform.set(`translate3d(0px, ${translate}px, 0px)`);
  }

  /** @inheritdoc */
  public render(): VNode {
    if (typeof this.props.class === 'object') {
      const sub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, TabbedContainer.RESERVED_CLASSES);
      if (Array.isArray(sub)) {
        this.subscriptions.push(...sub);
      } else {
        this.subscriptions.push(sub);
      }
    } else if (this.props.class) {
      for (const classToAdd of FSComponent.parseCssClassesFromString(this.props.class, classToFilter => !TabbedContainer.RESERVED_CLASSES.includes(classToFilter))) {
        this.rootCssClass.add(classToAdd);
      }
    }

    return (
      <div
        class={this.rootCssClass}
        style={{
          '--tabbed-container-tab-length': this.tabLength.map(length => `${length}px`),
          '--tabbed-container-tab-spacing': this.tabSpacing.map(spacing => `${spacing}px`),
          '--tabbed-container-tab-list-length': this.tabListLength.map(length => `${length}px`)
        }}
      >
        <div class='tabbed-container-content-box'>
          {this.renderContent()}
        </div>
        <div class='tabbed-container-tab-box'>
          <div class='tabbed-container-tab-list-clip'>
            <TouchList
              ref={this.tabListRef}
              bus={this.props.bus}
              scrollAxis={this.isTabListHorizontal ? 'x' : 'y'}
              listItemLengthPx={this.tabLength}
              listItemSpacingPx={this.tabSpacing}
              itemsPerPage={this.tabsPerListPage}
              maxOverscrollPx={0}
              itemCount={this.tabCount}
              class='tabbed-container-tab-list'
            >
              <div
                ref={this.selectedTabContainerRef}
                class='tabbed-container-selected-tab-container'
                style={{ 'transform': this.selectedTabTransform }}
              />
            </TouchList>
          </div>
          <div
            class={{
              'tabbed-container-tab-arrow-box': true,
              'tabbed-container-tab-arrow-box-back': true,
              'hidden': this.tabArrowsHidden,
              'tabbed-container-tab-arrow-box-disabled': this.isBackTabArrowDisabled
            }}
          >
            <svg viewBox='0 0 20 20' preserveAspectRatio='none' class='tabbed-container-tab-arrow'>
              <path
                d='M 7.97 2.2 l -7.66 13.26 c -0.9 1.56 0.22 3.51 2.03 3.51 h 15.32 c 1.8 -0 2.93 -1.96 2.03 -3.51 l -7.66 -13.26 c -0.9 -1.56 -3.15 -1.56 -4.05 0 z'
                transform={`rotate(${this.isTabListHorizontal ? -90 : 0} 10 10)`}
              />
            </svg>
          </div>
          <div
            class={{
              'tabbed-container-tab-arrow-box': true,
              'tabbed-container-tab-arrow-box-forward': true,
              'hidden': this.tabArrowsHidden,
              'tabbed-container-tab-arrow-box-disabled': this.isForwardTabArrowDisabled
            }}
          >
            <svg viewBox='0 0 20 20' preserveAspectRatio='none' class='tabbed-container-tab-arrow'>
              <path
                d='M 12.03 17.8 l 7.66 -13.26 c 0.9 -1.56 -0.22 -3.51 -2.03 -3.51 h -15.32 c -1.8 0 -2.93 1.96 -2.03 3.51 l 7.66 13.26 c 0.9 1.56 3.15 1.56 4.05 0 z'
                transform={`rotate(${this.isTabListHorizontal ? -90 : 0} 10 10)`}
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Renders this container's tabbed content.
   * @returns This container's rendered tabbed content, as a VNode.
   * @throws Error if one or more of this container's children does not implement the {@link TabbedContent} interface.
   */
  private renderContent(): VNode {
    // Render children.
    const childrenNode = <>{this.props.children}</>;

    // Enumerate all child TabbedContent nodes.

    const contentNodes: VNode[] = [];

    FSComponent.visitNodes(childrenNode, node => {
      // Allow fragments and "empty" nodes.
      if (node.instance === null || typeof node.instance === 'boolean') {
        return false;
      }

      if (node.instance instanceof DisplayComponent && (node.instance as any).isTabbedContent === true) {
        contentNodes.push(node);
        return true;
      } else {
        throw new Error('TabbedContainer: a component that does not implement the TabbedContent interface cannot be a first-level descendant of TabbedContainer');
      }
    });

    // Render each TabbedContent node into a wrapper and create an entry for the tab.

    const wrapperNodes: VNode[] = [];

    for (const node of contentNodes) {
      const wrapperNode: VNode = <TabbedContentWrapper>{node}</TabbedContentWrapper>;
      const tabLabel = (node.instance as TabbedContent).props.tabLabel;

      this.tabbedContentEntries.push({
        index: this.tabbedContentEntries.length,
        wrapper: wrapperNode.instance as TabbedContentWrapper,
        content: node.instance as TabbedContent,
        isEnabled: SubscribableUtils.toSubscribable((node.instance as TabbedContent).props.isEnabled ?? true, true),
        isVisible: SubscribableUtils.toSubscribable((node.instance as TabbedContent).props.isVisible ?? true, true),
        tabLabelFunc: typeof tabLabel === 'function' ? tabLabel : () => tabLabel
      });

      wrapperNodes.push(wrapperNode);
    }

    // Return the wrapped TabbedContent nodes.

    return (
      <>{wrapperNodes}</>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    for (const entry of this.tabbedContentEntries) {
      entry.wrapper.destroy();
    }

    this.tabListRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    this.selectedTabEnabledSub?.destroy();
    this.selectedTabVisibleSub?.destroy();
    this.selectedTabRequestedKnobLabelStatePipe?.destroy();

    super.destroy();
  }
}

/**
 * A wrapper for {@link TabbedContent} which is used to control the content's visibility.
 */
class TabbedContentWrapper extends DisplayComponent<ComponentProps> {
  private thisNode?: VNode;

  private readonly hidden = Subject.create(true);

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;
  }

  /**
   * Sets the visibility of this wrapper's content.
   * @param visible Whether the content should be visible.
   */
  public setVisible(visible: boolean): void {
    this.hidden.set(!visible);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={{ 'tabbed-content-wrapper': true, 'hidden': this.hidden }}>
        {this.props.children}
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}

/**
 * Component props for Tab.
 */
interface TabProps extends ComponentProps {
  /** The tab's label. */
  label: string | Subscribable<string> | VNode;

  /** Whether the tab is enabled. */
  isEnabled: Subscribable<boolean>;

  /** Whether the tab is visible. */
  isVisible: Subscribable<boolean>;

  /** A function which is called when the tab is pressed. */
  onPressed: () => void;

  /** The format of the tab's parent GDU display. */
  gduFormat: GduFormat;
}

/**
 * A tab for {@link TabbedContainer}.
 */
class Tab extends DisplayComponent<TabProps> {
  private readonly buttonRef = FSComponent.createRef<UiTouchButton>();

  private readonly hidden = this.props.isVisible.map(SubscribableMapFunctions.not());
  private readonly visibilityHidden = Subject.create(true);

  private readonly isButtonEnabled = MappedSubject.create(
    ([isEnabled, isVisible, hidden]) => isEnabled && isVisible && !hidden,
    this.props.isEnabled,
    this.props.isVisible,
    this.visibilityHidden
  );

  /**
   * Sets the visibility style of this tab.
   * @param visible Whether this tab should be visible.
   */
  public setVisibility(visible: boolean): void {
    this.visibilityHidden.set(!visible);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={{ 'tabbed-content-tab': true, 'hidden': this.hidden, 'visibility-hidden': this.visibilityHidden }}>
        <UiTouchButton
          ref={this.buttonRef}
          isEnabled={this.isButtonEnabled}
          label={this.props.label}
          onPressed={this.props.onPressed}
          isInList
          gduFormat={this.props.gduFormat}
          class='tabbed-content-tab-button'
        >
          <div class='tabbed-content-tab-selected-bar' />
          <div class='tabbed-content-tab-button-inner-shadow' />
        </UiTouchButton>
        <div class='tabbed-content-tab-border-occlude' />
        <div class='tabbed-content-tab-inverted-border tabbed-content-tab-inverted-border-1' />
        <div class='tabbed-content-tab-inverted-border tabbed-content-tab-inverted-border-2' />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.buttonRef.getOrDefault()?.destroy();

    this.hidden.destroy();
    this.isButtonEnabled.destroy();

    super.destroy();
  }
}
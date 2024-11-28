import {
  ArraySubject, ChecklistBranch, ChecklistBranchItemLogicType, ChecklistItemType, ChecklistList, ChecklistSet,
  ComponentProps, CssTransformBuilder, CssTransformSubject, DebounceTimer, DisplayComponent, FSComponent,
  MappedSubscribable, MathUtils, NodeInstance, Subject, Subscribable, SubscribableArray, SubscribableMapFunctions,
  SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

import {
  DynamicList, DynamicListData, GarminChecklistItem, GarminChecklistItemTypeDefMap, GarminChecklistLinkItemType,
  GarminChecklistNormalLinkItemDef
} from '@microsoft/msfs-garminsdk';

import { G3000ChecklistGroupMetadata, G3000ChecklistMetadata } from '../../Checklist/G3000ChecklistDefinition';
import { G3000FilePaths } from '../../G3000FilePaths';

import './ChecklistPaneViewItemList.css';

/**
 * Component props for {@link ChecklistPaneViewItemList}.
 */
export interface ChecklistPaneViewItemListProps extends ComponentProps {
  /** The checklist set containing the items rendered by the list. */
  checklistSet: ChecklistSet<GarminChecklistItemTypeDefMap, G3000ChecklistMetadata, G3000ChecklistGroupMetadata, void, void>;

  /** The checklist items to render in the list. */
  items: SubscribableArray<GarminChecklistItem>;

  /**
   * The index of the selected checklist item. If the index is less than zero, then the list will scroll to the top.
   * If the index is greater than or equal to the number of rendered list items, then the list will scroll to the
   * bottom. Otherwise, the list will scroll to keep the selected item in the middle of the visible list area.
   */
  selectedIndex: Subscribable<number>;
}

/**
 * A list that displays checklist items.
 */
export class ChecklistPaneViewItemList extends DisplayComponent<ChecklistPaneViewItemListProps> {
  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  private readonly itemContainerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly itemsArray = ArraySubject.create<GarminChecklistItem & DynamicListData>();
  private dynamicList?: DynamicList<GarminChecklistItem & DynamicListData>;
  private readonly itemsRefreshDebounce = new DebounceTimer();
  private readonly refreshItemsFunc = this.refreshItems.bind(this);

  private scrollPosition = 0;
  private readonly scrollTransform = CssTransformSubject.create(CssTransformBuilder.translate3d('px'));

  private readonly scrollbarTransform = CssTransformSubject.create(CssTransformBuilder.concat(
    CssTransformBuilder.translate3d('px', '%', 'px'),
    CssTransformBuilder.scaleY()
  ));

  private readonly stageRefreshItemStyling = (item: ChecklistPaneViewItem | undefined): void => { item?.stageRefreshStyling(); };
  private readonly refreshItemStyling = (item: ChecklistPaneViewItem | undefined): void => { item?.refreshStyling(); };

  private itemsSub?: Subscription;
  private selectedIndexSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.dynamicList = new DynamicList(
      this.itemsArray,
      this.itemContainerRef.instance,
      this.renderItem.bind(this)
    );

    this.itemsArray.sub(this.refreshStyling.bind(this));
    this.selectedIndexSub = this.props.selectedIndex.sub(this.updateScrollPosition.bind(this), false, true);

    this.itemsSub = this.props.items.sub(this.onItemsChanged.bind(this), true);
  }

  /**
   * Gets the rendered instance of a data item in this list.
   * @param index The index of the data item for which to get the rendered instance.
   * @returns The rendered instance of the specified data item, or `undefined` if `index` is out of bounds.
   */
  public getRenderedItem(index: number): NodeInstance | undefined {
    return this.dynamicList?.getRenderedItem(index);
  }

  /**
   * Refreshes this list's styling. This method should be called whenever the list's width or height changes.
   */
  public refreshStyling(): void {
    if (!this.dynamicList) {
      return;
    }

    // Stage style changes before applying them to avoid DOM thrashing.
    this.dynamicList.forEachComponent<ChecklistPaneViewItem>(this.stageRefreshItemStyling);
    this.dynamicList.forEachComponent<ChecklistPaneViewItem>(this.refreshItemStyling);

    this.updateScrollPosition();
  }

  /**
   * Updates this list's scroll position.
   */
  private updateScrollPosition(): void {
    const items = this.itemsArray.getArray();
    const selectedIndex = this.props.selectedIndex.get();
    const selectedItemComponent = this.dynamicList!.getRenderedItem(selectedIndex) as ChecklistPaneViewItem | undefined;

    const listHeight = this.rootRef.instance.clientHeight;
    const itemContainerHeight = this.itemContainerRef.instance.clientHeight;
    const maxScrollPosition = Math.max(0, itemContainerHeight - listHeight);

    if (!selectedItemComponent) {
      if (selectedIndex >= items.length) {
        this.scrollPosition = maxScrollPosition;
      } else {
        this.scrollPosition = 0;
      }
    } else {
      const selectedItemTop = selectedItemComponent.getRootElement().offsetTop;
      const selectedItemMiddle = selectedItemTop + selectedItemComponent.getRootElement().offsetHeight / 2;

      // Scroll the list such that the selected item is in the middle of the visible list area.
      this.scrollPosition = MathUtils.clamp(selectedItemMiddle - listHeight / 2, 0, maxScrollPosition);
    }

    this.scrollTransform.transform.set(0, -this.scrollPosition, 0);
    this.scrollTransform.resolve();

    const scrollBarHeight = Math.min(1, listHeight / itemContainerHeight);

    this.scrollbarTransform.transform.getChild(0).set(0, this.scrollPosition / itemContainerHeight * 100, 0, 0, 0.1);
    this.scrollbarTransform.transform.getChild(1).set(scrollBarHeight, 0.001);
    this.scrollbarTransform.resolve();
  }

  /**
   * Responds to when the items to render in this list change.
   */
  private onItemsChanged(): void {
    // We debounce any changes in the items array to avoid DOM thrashing when new items get added to the list and
    // subsequently need to update their styles.
    this.selectedIndexSub!.pause();
    this.itemsRefreshDebounce.schedule(this.refreshItemsFunc, 0);
  }

  /**
   * Refreshes the items rendered in this list.
   */
  private refreshItems(): void {
    this.itemsArray.set(this.props.items.getArray());
    this.refreshStyling();

    this.selectedIndexSub!.resume();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div ref={this.rootRef} class='checklist-pane-item-list'>
        <div
          ref={this.itemContainerRef}
          class='checklist-pane-item-list-item-container'
          style={{
            'position': 'absolute',
            'top': '0px',
            'transform': this.scrollTransform
          }}
        />
        <div class='checklist-pane-item-list-scrollbar'>
          <svg viewBox='0 0 7 4' class='checklist-pane-item-list-scrollbar-arrow'>
            <path d='M 3.5 0 l 3.5 4 h -7 Z' />
          </svg>
          <div class='checklist-pane-item-list-scrollbar-bar-container'>
            <div class='checklist-pane-item-list-scrollbar-line' />
            <div
              class='checklist-pane-item-list-scrollbar-bar'
              style={{
                'position': 'absolute',
                'top': '0px',
                'height': '100%',
                'transform': this.scrollbarTransform,
                'transform-origin': 'top center'
              }}
            />
          </div>
          <svg viewBox='0 0 7 4' class='checklist-pane-item-list-scrollbar-arrow'>
            <path d='M 3.5 4 l 3.5 -4 h -7 Z' />
          </svg>
        </div>
      </div>
    );
  }

  /**
   * Renders a checklist item.
   * @param item The item to render.
   * @param index The index of the item to render.
   * @returns The rendered checklist item, as a VNode.
   */
  private renderItem(item: GarminChecklistItem, index: number): VNode {
    return (
      <ChecklistPaneViewItem
        checklistSet={this.props.checklistSet}
        index={index}
        item={item}
        selectedIndex={this.props.selectedIndex}
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.itemsRefreshDebounce.clear();

    this.dynamicList?.destroy();
    this.itemsSub?.destroy();
    this.selectedIndexSub?.destroy();

    super.destroy();
  }
}

/**
 * Component props for {@link ChecklistPaneViewItem}.
 */
export interface ChecklistPaneViewItemProps extends ComponentProps {
  /** The checklist set containing the item to display. */
  checklistSet: ChecklistSet<GarminChecklistItemTypeDefMap, G3000ChecklistMetadata, G3000ChecklistGroupMetadata, void, void>;

  /** The index of the checklist item to display. */
  index: number;

  /** The checklist item to display. */
  item: GarminChecklistItem;

  /** The index of the selected checklist item. */
  selectedIndex: Subscribable<number>;
}

/**
 * A display for a checklist item.
 */
export class ChecklistPaneViewItem extends DisplayComponent<ChecklistPaneViewItemProps> {
  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();
  private readonly contentRef = FSComponent.createRef<DisplayComponent<any>>();

  /** This display's checklist item. */
  public readonly item = this.props.item;

  private readonly isSelected = this.props.selectedIndex.map(index => index === this.props.index);

  /**
   * Gets this display's root element.
   * @returns This display's root element.
   * @throws Error if this display has not been rendered to the DOM.
   */
  public getRootElement(): HTMLDivElement {
    return this.rootRef.instance;
  }

  /**
   * Checks whether this display's item has a user-toggleable state.
   * @returns Whether this display's item has a user-toggleable state.
   * @throws Error if this display has not been rendered to the DOM.
   */
  public isToggleable(): boolean {
    const content = this.contentRef.instance;
    if (content instanceof ChecklistPaneViewActionableItemContent) {
      return true;
    } else if (content instanceof ChecklistPaneViewBranchItemContent) {
      return content.isToggleable;
    } else {
      return false;
    }
  }

  /**
   * Gets the indexes of the link target of this display's item.
   * @returns The indexes of the link target of this display's item, or `undefined` if this display's item is not a
   * link item or if the link could not be resolved.
   * @throws Error if this display has not been rendered to the DOM.
   */
  public getLinkTargetIndexes(): readonly [groupIndex: number, listIndex: number, branchIndex: number] | undefined {
    const content = this.contentRef.instance;
    if (content instanceof ChecklistPaneViewLinkItemContent) {
      return content.targetIndexes;
    }
  }

  /**
   * Stages a refresh of this display's styling. This will pre-compute refreshed styles for this display but will not
   * apply the refreshed styles. Calling `refreshStyling()` after this method will apply the staged refresh. This
   * method should be called whenever the display's width changes.
   */
  public stageRefreshStyling(): void {
    const content = this.contentRef.getOrDefault();
    if (content instanceof ChecklistPaneViewActionableItemContent) {
      content.stageRefreshStyling();
    }
  }

  /**
   * Applies any currently staged refresh of this display's styling. This method should be called after
   * `stageRefreshStyling()`.
   */
  public refreshStyling(): void {
    const content = this.contentRef.getOrDefault();
    if (content instanceof ChecklistPaneViewActionableItemContent) {
      content.refreshStyling();
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div ref={this.rootRef} class={{ 'checklist-pane-item': true, 'checklist-pane-item-selected': this.isSelected }}>
        {this.renderContent()}
      </div>
    );
  }

  /**
   * Renders this display's contents.
   * @returns This display's contents, as a VNode, or `null` if there are no contents to render.
   */
  private renderContent(): VNode | null {
    const item = this.props.item;

    switch (item.type) {
      case ChecklistItemType.Actionable:
        return (
          <ChecklistPaneViewActionableItemContent
            ref={this.contentRef}
            item={item}
          />
        );
      case ChecklistItemType.Branch:
        return (
          <ChecklistPaneViewBranchItemContent
            ref={this.contentRef}
            checklistSet={this.props.checklistSet}
            item={item}
          />
        );
      case ChecklistItemType.Link:
        return (
          <ChecklistPaneViewLinkItemContent
            ref={this.contentRef}
            checklistSet={this.props.checklistSet}
            item={item}
          />
        );
      case ChecklistItemType.Note:
        return (
          <div class={`checklist-pane-item-content checklist-pane-item-content-note checklist-pane-item-content-justify-${item.def.justify} checklist-pane-item-content-color-${item.def.textColor.toLowerCase()}`}>
            <div class={`checklist-pane-item-content-indent checklist-pane-item-content-indent-${item.def.indent}`}>
              {item.def.text}
            </div>
            <div class='checklist-pane-item-border' />
          </div>
        );
      case ChecklistItemType.Title:
        return (
          <div class={`checklist-pane-item-content checklist-pane-item-content-title checklist-pane-item-content-color-${item.def.textColor.toLowerCase()}`}>
            <div class={`checklist-pane-item-content-indent checklist-pane-item-content-indent-${item.def.indent}`}>
              {item.def.text}
            </div>
          </div>
        );
      case ChecklistItemType.Spacer:
        return (
          <div class='checklist-pane-item-content checklist-pane-item-content-spacer' style={`--checklist-pane-item-content-spacer-height: ${item.def.height}`} />
        );
      default:
        return null;
    }
  }

  /** @inheritDoc */
  public destroy(): void {
    this.contentRef.getOrDefault()?.destroy();

    this.isSelected.destroy();

    super.destroy();
  }
}

/**
 * Component props for {@link ChecklistPaneViewItemCheckbox}.
 */
interface ChecklistPaneViewItemCheckboxProps extends ComponentProps {
  /** The checkbox's completion state. */
  isCompleted: boolean | Subscribable<boolean>;
}

/**
 * Displays a checkbox for a checklist item.
 */
class ChecklistPaneViewItemCheckbox extends DisplayComponent<ChecklistPaneViewItemCheckboxProps> {
  private readonly isCompleted = SubscribableUtils.isSubscribable(this.props.isCompleted)
    ? this.props.isCompleted.map(SubscribableMapFunctions.identity())
    : this.props.isCompleted;

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={{ 'checklist-pane-item-checkbox': true, 'checklist-pane-item-checkbox-completed': this.isCompleted }}>
        <img
          src={`${G3000FilePaths.ASSETS_PATH}/Images/Common/icon_checklist_incomplete.png`}
          class='checklist-pane-item-checkbox-icon checklist-pane-item-checkbox-incomplete'
        />
        <img
          src={`${G3000FilePaths.ASSETS_PATH}/Images/Common/icon_checklist_complete.png`}
          class='checklist-pane-item-checkbox-icon checklist-pane-item-checkbox-complete'
        />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    if (SubscribableUtils.isSubscribable(this.isCompleted)) {
      this.isCompleted.destroy();
    }

    super.destroy();
  }
}

/**
 * Component props for {@link ChecklistPaneViewActionableItemContent}.
 */
interface ChecklistPaneViewActionableItemContentProps extends ComponentProps {
  /** The item to display. */
  item: GarminChecklistItem<ChecklistItemType.Actionable>;
}

/**
 * Displays content for an actionable checklist item.
 */
class ChecklistPaneViewActionableItemContent extends DisplayComponent<ChecklistPaneViewActionableItemContentProps> {
  private static readonly DOTS_TEXT = '. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .';

  private readonly indentRef = FSComponent.createRef<HTMLDivElement>();
  private readonly labelTextSpanRef = FSComponent.createRef<HTMLSpanElement>();
  private readonly actionTextSpanRef = FSComponent.createRef<HTMLSpanElement>();

  private readonly isCompleted = this.props.item.isCompleted.map(SubscribableMapFunctions.identity());

  private stagedDotsLeft = 0;
  private stagedDotsWidth = 0;

  private readonly dotsLeft = Subject.create('');
  private readonly dotsWidth = Subject.create('');

  /** @inheritDoc */
  public onAfterRender(): void {
    this.stageRefreshStyling();
    this.refreshStyling();
  }

  /**
   * Stages a refresh of this display's styling. This will pre-compute refreshed styles for this display but will not
   * apply the refreshed styles. Calling `refreshStyling()` after this method will apply the staged refresh. This
   * method should be called whenever the display's width changes.
   */
  public stageRefreshStyling(): void {
    if (this.props.item.def.actionText === '') {
      return;
    }

    // Get the bounding rect of the label and action text's parent element.
    const indentRect = this.indentRef.instance.getBoundingClientRect();

    // If the label and/or action text are wrapped to multiple lines, then getClientRects() will return a separate
    // bounding rect for each line.
    const labelFirstLineClientRect = this.labelTextSpanRef.instance.getClientRects()[0];
    const actionFirstLineClientRect = this.actionTextSpanRef.instance.getClientRects()[0];

    // Use the bounding rects from above to position and size the dots div so that it fits between the first lines of
    // the label and action texts.
    this.stagedDotsLeft = Math.ceil(labelFirstLineClientRect?.width ?? 0);
    this.stagedDotsWidth = Math.floor((actionFirstLineClientRect ? actionFirstLineClientRect.left - indentRect.left : indentRect.width) - this.stagedDotsLeft);
  }

  /**
   * Applies any currently staged refresh of this display's styling. This method should be called after
   * `stageRefreshStyling()`.
   */
  public refreshStyling(): void {
    if (this.props.item.def.actionText === '') {
      return;
    }

    this.dotsLeft.set(`${this.stagedDotsLeft}px`);
    this.dotsWidth.set(`${this.stagedDotsWidth}px`);
  }

  /** @inheritDoc */
  public render(): VNode {
    const item = this.props.item;

    return (
      <div
        class={{
          'checklist-pane-item-content': true,
          'checklist-pane-item-content-actionable': true,
          'checklist-pane-item-content-actionable-completed': this.isCompleted,
          [`checklist-pane-item-content-color-${item.def.textColor.toLowerCase()}`]: true
        }}
      >
        <ChecklistPaneViewItemCheckbox isCompleted={this.isCompleted} />
        <div ref={this.indentRef} class={`checklist-pane-item-content-indent checklist-pane-item-content-indent-${item.def.indent}`}>
          <div class={`checklist-pane-item-content-actionable-label${item.def.actionText === '' ? ' checklist-pane-item-content-actionable-label-full' : ''}`}>
            <span ref={this.labelTextSpanRef}>{item.def.labelText}</span>
          </div>
          {item.def.actionText !== '' && (
            <>
              <div
                class='checklist-pane-item-content-actionable-dots'
                style={{
                  'position': 'absolute',
                  'left': this.dotsLeft,
                  'width': this.dotsWidth
                }}
              >
                {ChecklistPaneViewActionableItemContent.DOTS_TEXT}
              </div>
              <div class='checklist-pane-item-content-actionable-action'>
                <span ref={this.actionTextSpanRef}>{item.def.actionText}</span>
              </div>
            </>
          )}
        </div>

        <div class='checklist-pane-item-border' />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.isCompleted.destroy();

    super.destroy();
  }
}

/**
 * Component props for {@link ChecklistPaneViewBranchItemContent}.
 */
interface ChecklistPaneViewBranchItemContentProps extends ComponentProps {
  /** The checklist set containing the item to display. */
  checklistSet: ChecklistSet<GarminChecklistItemTypeDefMap, G3000ChecklistMetadata, G3000ChecklistGroupMetadata, void, void>;

  /** The item to display. */
  item: GarminChecklistItem<ChecklistItemType.Branch>;
}

/**
 * Displays content for a branch checklist item.
 */
class ChecklistPaneViewBranchItemContent extends DisplayComponent<ChecklistPaneViewBranchItemContentProps> {
  private readonly isCompleted = this.props.item.isCompleted.map(SubscribableMapFunctions.identity());

  /** Whether this display's item has a user-toggleable override state. */
  public readonly isToggleable = !this.props.item.def.omitCheckbox
    || this.props.item.def.branches.length < 2
    || !(
      this.props.item.def.branchLogic.includes(ChecklistBranchItemLogicType.Sufficient)
      || this.props.item.def.branchLogic.includes(ChecklistBranchItemLogicType.Necessary)
    );

  /** @inheritDoc */
  public render(): VNode {
    const item = this.props.item;

    return (
      <div
        class={{
          'checklist-pane-item-content': true,
          'checklist-pane-item-content-branch': true,
          'checklist-pane-item-content-branch-completed': this.isCompleted,
          [`checklist-pane-item-content-color-${item.def.textColor.toLowerCase()}`]: true
        }}
      >
        {this.isToggleable && (
          <ChecklistPaneViewItemCheckbox isCompleted={this.isCompleted} />
        )}

        <div class={`checklist-pane-item-content-indent checklist-pane-item-content-indent-${item.def.indent}`}>
          {item.def.text}
        </div>

        <div class='checklist-pane-item-border' />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.isCompleted.destroy();

    super.destroy();
  }
}

/**
 * Component props for {@link ChecklistPaneViewLinkItemContent}.
 */
interface ChecklistPaneViewLinkItemContentProps extends ComponentProps {
  /** The checklist set containing the item to display. */
  checklistSet: ChecklistSet<GarminChecklistItemTypeDefMap, G3000ChecklistMetadata, G3000ChecklistGroupMetadata, void, void>;

  /** The item to display. */
  item: GarminChecklistItem<ChecklistItemType.Link>;
}

/**
 * Displays content for a link checklist item.
 */
class ChecklistPaneViewLinkItemContent extends DisplayComponent<ChecklistPaneViewLinkItemContentProps> {
  private readonly parentBranchItem?: GarminChecklistItem<ChecklistItemType.Branch> | undefined;

  /** The indexes of the link target of this display's item. */
  public readonly targetIndexes?: readonly [groupIndex: number, listIndex: number, branchIndex: number];

  /** The link target of this display's item. */
  public readonly target?: ChecklistList<GarminChecklistItemTypeDefMap> | ChecklistBranch<GarminChecklistItemTypeDefMap>;

  private readonly isCompleted: boolean | MappedSubscribable<boolean>;

  /**
   * Creates a new instance of ChecklistPaneViewLinkItemContent.
   * @param props The properties of the component.
   */
  public constructor(props: ChecklistPaneViewLinkItemContentProps) {
    super(props);

    if (this.props.item.def.linkType === GarminChecklistLinkItemType.BranchItem) {
      // Find the parent list and branch item.

      const uid = this.props.item.def.branchItem;

      let parentGroupIndex = -1;
      let parentListIndex = -1;

      let isDone = false;
      const groups = this.props.checklistSet.groups;
      for (let groupIndex = 0; !isDone && groupIndex < groups.length; groupIndex++) {
        const group = groups[groupIndex];
        for (let listIndex = 0; !isDone && listIndex < group.lists.length; listIndex++) {
          const list = group.lists[listIndex];

          if (list.items.includes(this.props.item)) {
            for (const item of list.items) {
              if (item.type === ChecklistItemType.Branch && item.def.uid === uid) {
                parentGroupIndex = groupIndex;
                parentListIndex = listIndex;
                this.parentBranchItem = item;
                isDone = true;
                break;
              }
            }

            isDone = true;
          } else {
            for (const branch of list.branches) {
              if (branch.items.includes(this.props.item)) {
                for (const item of branch.items) {
                  if (item.type === ChecklistItemType.Branch && item.def.uid === uid) {
                    parentGroupIndex = groupIndex;
                    parentListIndex = listIndex;
                    this.parentBranchItem = item;
                    isDone = true;
                    break;
                  }
                }

                isDone = true;
                break;
              }
            }
          }
        }
      }

      this.targetIndexes = this.getBranchItemLinkTargetIndexes(parentGroupIndex, parentListIndex, this.parentBranchItem, this.props.item.def.linkIndex);
    } else {
      this.targetIndexes = this.getNormalLinkTargetIndexes(this.props.item.def.target);
    }

    if (this.targetIndexes) {
      const [groupIndex, listIndex, branchIndex] = this.targetIndexes;
      const list = this.props.checklistSet.groups[groupIndex].lists[listIndex];
      if (branchIndex < 0) {
        this.target = list;
      } else {
        this.target = list?.branches[branchIndex];
      }
    }

    this.isCompleted = this.target?.isCompleted.map(SubscribableMapFunctions.identity()) ?? false;
  }

  /**
   * Gets the indexes of the target of this display's normal link item.
   * @param targetUid The unique ID of the link target.
   * @returns The indexes of the target of this display's normal link item, or `undefined` if the link could not be
   * resolved.
   */
  private getNormalLinkTargetIndexes(targetUid: string): [groupIndex: number, listIndex: number, branchIndex: number] | undefined {
    const groups = this.props.checklistSet.groups;
    for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
      const group = groups[groupIndex];
      for (let listIndex = 0; listIndex < group.lists.length; listIndex++) {
        const list = group.lists[listIndex];

        if (list.uid === targetUid) {
          return [groupIndex, listIndex, -1];
        }

        for (let branchIndex = 0; branchIndex < list.branches.length; branchIndex++) {
          if (list.branches[branchIndex].uid === targetUid) {
            return [groupIndex, listIndex, branchIndex];
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Gets the target of this display's branch item link item.
   * @param parentGroupIndex The index of the item's parent group, or `-1` if the parent group could not be found.
   * @param parentListIndex The index of the parent list, or `-1` if the parent list could not be found.
   * @param branchItem The item's parent branch item, or `undefined` if the parent branch item could not be found.
   * @param linkIndex The index of the item's target branch in the parent branch item's branch array.
   * @returns The target of this display's branch item link item, or `undefined` if the link could not be resolved.
   */
  private getBranchItemLinkTargetIndexes(
    parentGroupIndex: number,
    parentListIndex: number,
    branchItem: GarminChecklistItem<ChecklistItemType.Branch> | undefined,
    linkIndex: number
  ): [groupIndex: number, listIndex: number, branchIndex: number] | undefined {
    const list = this.props.checklistSet.groups[parentGroupIndex]?.lists[parentListIndex];

    if (!list || !branchItem) {
      return undefined;
    }

    const targetUid = branchItem.def.branches[linkIndex];

    if (!targetUid || targetUid !== this.props.item.def.target) {
      return undefined;
    }

    for (let branchIndex = 0; branchIndex < list.branches.length; branchIndex++) {
      if (list.branches[branchIndex].uid === targetUid) {
        return [parentGroupIndex, parentListIndex, branchIndex];
      }
    }

    return undefined;
  }

  /** @inheritDoc */
  public render(): VNode {
    if (this.props.item.def.linkType === GarminChecklistLinkItemType.Normal) {
      return this.renderNormal(this.props.item.def);
    } else {
      return this.renderBranchItem();
    }
  }

  /**
   * Renders content for a normal link item.
   * @param itemDef The definition for the item to render.
   * @returns Content for a normal link item, as a VNode.
   */
  private renderNormal(itemDef: GarminChecklistNormalLinkItemDef): VNode {
    return (
      <div
        class={{
          'checklist-pane-item-content': true,
          'checklist-pane-item-content-link': true,
          'checklist-pane-item-content-link-completed': this.isCompleted,
          [`checklist-pane-item-content-justify-${itemDef.justify}`]: true,
          [`checklist-pane-item-content-color-${itemDef.textColor.toLowerCase()}`]: true
        }}
      >
        <div class={`checklist-pane-item-content-indent checklist-pane-item-content-indent-${itemDef.indent}`}>
          {this.getText()}
        </div>

        <div class='checklist-pane-item-border' />
      </div>
    );
  }

  /**
   * Renders content for a branch item link item.
   * @returns Content for a branch item link item, as a VNode.
   */
  private renderBranchItem(): VNode {
    const parentBranchItemDef = this.parentBranchItem?.def;

    return (
      <div
        class={{
          'checklist-pane-item-content': true,
          'checklist-pane-item-content-link': true,
          'checklist-pane-item-content-link-branch-item': true,
          'checklist-pane-item-content-link-completed': this.isCompleted,
          [`checklist-pane-item-content-color-${parentBranchItemDef?.textColor.toLowerCase() ?? 'white'}`]: true
        }}
      >
        <div class='checklist-pane-item-content-link-branch-item-bar' />

        <ChecklistPaneViewItemCheckbox isCompleted={this.isCompleted} />

        <div class={`checklist-pane-item-content-indent checklist-pane-item-content-indent-${Math.max((parentBranchItemDef?.indent ?? 1) + 1, 2)}`}>
          {this.getText()}
        </div>

        <div class='checklist-pane-item-border' />
      </div>
    );
  }

  /**
   * Gets the text to display for this display's item.
   * @returns The text to display for this display's item.
   */
  private getText(): string {
    if (this.props.item.def.text === undefined) {
      return this.target?.name ?? 'UNRESOLVED LINK';
    } else {
      return this.props.item.def.text;
    }
  }

  /** @inheritDoc */
  public destroy(): void {
    if (SubscribableUtils.isSubscribable(this.isCompleted)) {
      this.isCompleted.destroy();
    }

    super.destroy();
  }
}

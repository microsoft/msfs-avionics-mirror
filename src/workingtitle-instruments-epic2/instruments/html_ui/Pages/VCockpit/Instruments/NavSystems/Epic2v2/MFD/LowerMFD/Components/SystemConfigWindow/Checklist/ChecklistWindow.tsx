import {
  AnnunciationType, CasSystem, ChecklistGroup, ChecklistItemType, ChecklistItemTypeDefMap, ChecklistList, ChecklistManager, ChecklistStateProvider, EventBus,
  FSComponent, MappedSubject, MutableSubscribable, NodeReference, Subject, Subscribable, SubscribableMapFunctions, Subscription, VNode
} from '@microsoft/msfs-sdk';

import {
  Epic2ChecklistGroupMetadata, Epic2ChecklistListMetadata, Epic2ChecklistMetadata, TabContent, TabContentProps, TouchButton
} from '@microsoft/msfs-epic2-shared';

import { ChecklistActionItem } from './ChecklistActionItem';
import { ChecklistItemBase } from './ChecklistItemBase';
import { ChecklistLinkItem } from './ChecklistLinkItem';
import { ChecklistTextItem } from './ChecklistTextItem';

import './ChecklistWindow.css';

/** Items that can be displayed on the checklist window */
type ChecklistDisplayItems = ChecklistActionItem | ChecklistLinkItem | ChecklistTextItem

/** Items that convert to link list displays */
type ChecklistLinkListBase = ChecklistGroup<ChecklistItemTypeDefMap, void, Epic2ChecklistListMetadata> | ChecklistList<ChecklistItemTypeDefMap, Epic2ChecklistListMetadata>

/**
 * An interface describing all of the page items to render
 */
interface ChecklistPageItem {
  /** The reference to the rendered item */
  itemRef: NodeReference<ChecklistDisplayItems>;

  /** Whether the item is hidden */
  isHidden: MutableSubscribable<boolean>;

  /** Whether the checklist item has been completed */
  isCompleted?: Subscribable<boolean>;

  /** The index of the starting row of this item */
  startRow: number

  /** The index of the ending row of this item */
  endRow: number
}


/** A checklist page */
interface ChecklistPage {
  /** The items to display on this page */
  items: ChecklistPageItem[];

  /** Is the page completed? */
  isCompleted?: Subscribable<boolean>;

  /** The starting row of this page */
  startRow: number;

  /** The end row of this page */
  endRow: number;
}

/** The properties for the {@link ChecklistWindow} component. */
interface ChecklistWindowProps extends TabContentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** CAS System */
  casSystem: CasSystem

  /** Checklist state provider */
  checklistStateProvider?: ChecklistStateProvider<ChecklistItemTypeDefMap, Epic2ChecklistMetadata, Epic2ChecklistGroupMetadata, Epic2ChecklistListMetadata>

  /** The checklist manager */
  checklistManager?: ChecklistManager
}

/**
 * An Epic 2 checklist window for the lower MFD
 */
export class ChecklistWindow extends TabContent<ChecklistWindowProps> {
  private static readonly DEFAULT_MENU_TEXT = 'GENERAL MENU';
  private static readonly ACTIVE_QUEUE_PAGE_TITLE = 'ACTIVE ABNORMAL';
  private static readonly ACTIVE_QUEUE_PAGE_INDEX = -10; // The active queue page doesn't use a real checklist queue, so we give it an obviously fake index
  private static readonly MAX_ROWS_PER_PAGE = 13;

  private readonly checklistContentRef = FSComponent.createRef<HTMLDivElement>();

  private readonly groupIndex = Subject.create<number | null>(null);
  private readonly listIndex = Subject.create<number | null>(null);

  private readonly pageNumber = Subject.create(1);
  private readonly pageCount = Subject.create(1);
  private readonly pageTitle = Subject.create(ChecklistWindow.DEFAULT_MENU_TEXT);

  private maxRowsForPage = ChecklistWindow.MAX_ROWS_PER_PAGE;
  private activePageSubscription?: Subscription;
  private pages = [] as ChecklistPage[];

  private readonly pageIndexText = MappedSubject.create(([number, count]) => `${number}/${count}`, this.pageNumber, this.pageCount);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.groupIndex.sub((v) => this.handlePageDisplay(v, this.listIndex.get()));
    this.listIndex.sub((v) => this.handlePageDisplay(this.groupIndex.get(), v), true);

    this.pageNumber.sub((num) => this.handlePageChange(num));

    this.props.casSystem.casActiveMessageSubject.sub(() => {
      if (this.groupIndex.get() === ChecklistWindow.ACTIVE_QUEUE_PAGE_INDEX) {
        this.handlePageDisplay(this.groupIndex.get(), this.listIndex.get());
        this.activeQueueButtonVisible.set(this.pages.length > 0); // Faster than iterating through every group and list
      } else {
        this.activeQueueButtonVisible.set(this.getChecklistsForCasMessages().length > 0);
      }
    });
  }

  /**
   * Creates a checklist complete item
   * @param checklistContainer The div to render to
   * @param currentRow The current row
   * @returns An item for a completed checklist link
   */
  private createChecklistCompleteItem(checklistContainer: HTMLDivElement, currentRow: number): ChecklistPageItem {
    const isHiddenByPage = Subject.create(false);
    const listComplete = this.props.checklistStateProvider?.state.groups[this.groupIndex.get() ?? 0].lists[this.listIndex.get() ?? 0].isCompleted ?? Subject.create(true);
    const isHidden = MappedSubject.create(
      ([hiddenByPage, listCompleted]) => hiddenByPage || !listCompleted,
      isHiddenByPage,
      listComplete
    );
    const itemRef = FSComponent.createRef<ChecklistDisplayItems>();

    FSComponent.render(<ChecklistLinkItem
      isCompleted={Subject.create(false)}
      isHidden={isHidden}
      labelText='CHECKLIST COMPLETE'
      bus={this.props.bus}
      onClick={() => this.listIndex.set(null)}
      class='checklist-complete-item'
    />, checklistContainer);

    return {
      itemRef,
      isHidden: isHiddenByPage,
      startRow: currentRow,
      endRow: currentRow + 1
    };
  }

  /**
   * Creates a list of links from a Checklist group or list
   * @param baseItems The link list base
   * @param onClick Function to run when the link item is clicked
   * @returns An array of checklist page items
   */
  private createLinkListItems(baseItems: readonly ChecklistLinkListBase[], onClick: (index: number) => void): ChecklistPageItem[] {
    const checklistContainer = this.checklistContentRef.instance;
    const pageItems = [] as ChecklistPageItem[];
    let textRowLength = 0;

    baseItems.forEach((baseItem, index) => {
      const isHidden = Subject.create(false);
      const itemRef = FSComponent.createRef<ChecklistDisplayItems>();

      const isList = 'isCompleted' in baseItem;

      let className;
      if (isList) {
        switch (baseItem.metadata.casSeverity) {
          case AnnunciationType.Warning:
            className = 'checklist-cas-warning';
            break;
          case AnnunciationType.Caution:
            className = 'checklist-cas-caution';
            break;
          case AnnunciationType.Advisory:
            className = 'checklist-cas-advisory';
            break;
          default:
        }
      }

      FSComponent.render(<ChecklistLinkItem
        ref={itemRef}
        bus={this.props.bus}
        labelText={baseItem.name}
        isCompleted={isList ? baseItem.isCompleted : Subject.create(false)}
        isHidden={isHidden}
        onClick={() => onClick(index)}
        class={className}
      />, checklistContainer);

      const startRow = textRowLength;
      textRowLength += itemRef.getOrDefault()?.textRows.length ?? 1;

      pageItems.push({
        itemRef,
        isHidden,
        startRow,
        endRow: textRowLength
      });
    });

    return pageItems;
  }

  /**
   * Gets the checklists that correspond to given CAS message alerts
   * @returns An array of checklist lists
   */
  private getChecklistsForCasMessages(): ChecklistList<ChecklistItemTypeDefMap, Epic2ChecklistListMetadata>[] {
    const activeMessages = this.props.casSystem.casActiveMessageSubject.getArray();

    const activeLists = [] as ChecklistList<ChecklistItemTypeDefMap, Epic2ChecklistListMetadata>[];
    const groups = this.props.checklistStateProvider?.state.groups ?? [];
    for (const group of groups) {
      for (const list of group.lists) {
        const linkedCasMessages = activeMessages.filter((casAlert) => list.metadata.casMessages.includes(casAlert.message));
        if (linkedCasMessages.length > 0) {
          list.metadata.casSeverity = Math.max(...linkedCasMessages.map((msg) => msg.priority));
          activeLists.push(list);
        }
      }
    }

    return activeLists;
  }

  /**
   * Renders the Active Queue page
   * @returns The page items to display
   */
  private renderActiveQueue(): ChecklistPageItem[] {
    this.pageTitle.set(ChecklistWindow.ACTIVE_QUEUE_PAGE_TITLE);

    const activeLists = this.getChecklistsForCasMessages();

    const groups = this.props.checklistStateProvider?.state.groups ?? [];
    return this.createLinkListItems(
      activeLists,
      (activeListIndex: number) => {
        groups.forEach((group, groupIndex) => {
          const listIndex = group.lists.findIndex((list) => list.name === activeLists[activeListIndex].name);
          if (listIndex >= 0) {
            this.groupIndex.set(groupIndex);
            this.listIndex.set(listIndex);
          }
        });
      }
    );
  }

  /**
   * Handles displaying the currently open page
   * @param groupIndex The index of the group which is open
   * @param listIndex The index of the list which is open
   */
  private handlePageDisplay(groupIndex: number | null, listIndex: number | null): void {
    const checklistContainer = this.checklistContentRef.instance;
    while (checklistContainer.firstChild) {
      checklistContainer.removeChild(checklistContainer.firstChild);
    }
    let pageItems = [] as ChecklistPageItem[];

    if (this.props.checklistStateProvider) {
      if (groupIndex === null && listIndex === null) {
        this.pageTitle.set(ChecklistWindow.DEFAULT_MENU_TEXT);

        pageItems = this.createLinkListItems(
          this.props.checklistStateProvider.state.groups,
          (index: number) => this.groupIndex.set(index)
        );
      } else if (groupIndex !== null && listIndex === null) {
        if (groupIndex === ChecklistWindow.ACTIVE_QUEUE_PAGE_INDEX) {
          this.pageTitle.set(ChecklistWindow.ACTIVE_QUEUE_PAGE_TITLE);
          pageItems = this.renderActiveQueue();
        } else {
          const group = this.props.checklistStateProvider.state.groups[groupIndex];
          this.pageTitle.set(group.name ?? 'NA');

          pageItems = this.createLinkListItems(
            group.lists,
            (index: number) => this.listIndex.set(index)
          );
        }
      } else if (groupIndex !== null && listIndex !== null) {
        const list = this.props.checklistStateProvider.state.groups[groupIndex].lists[listIndex];
        this.pageTitle.set(list.name ?? 'NA');

        let textRowLength = 0;
        list.items.forEach((item, itemIndex) => {
          const isHidden = Subject.create(false);
          const itemRef = FSComponent.createRef<ChecklistDisplayItems>();
          let isCompleted = item.type === ChecklistItemType.Actionable ? item.isCompleted : undefined;

          switch (item.type) {
            case ChecklistItemType.Actionable:
              isCompleted = item.isCompleted;
              FSComponent.render(<ChecklistActionItem
                ref={itemRef}
                bus={this.props.bus}
                labelText={item.def.labelText}
                actionText={item.def.actionText}
                isCompleted={item.isCompleted}
                isHidden={isHidden}
                onClick={() => {
                  this.props.checklistManager?.toggleItem(groupIndex, listIndex, -1, itemIndex);
                }}
              />, checklistContainer);
              break;
            case ChecklistItemType.Branch:
            case ChecklistItemType.Link:
            case ChecklistItemType.Note:
            case ChecklistItemType.Title:
            case ChecklistItemType.Spacer:
              FSComponent.render(<ChecklistTextItem
                ref={itemRef}
                bus={this.props.bus}
                text={item.def.type !== ChecklistItemType.Spacer ? item.def.text ?? '' : ''}
                isHidden={isHidden}
              />, checklistContainer);
          }

          const startRow = textRowLength;
          textRowLength += itemRef.getOrDefault()?.textRows.length ?? 1;

          pageItems.push({
            itemRef,
            isHidden,
            startRow,
            isCompleted,
            endRow: textRowLength
          });
        });

        pageItems.push(this.createChecklistCompleteItem(checklistContainer, pageItems[pageItems.length - 1].endRow));
      }
    } else {
      this.pageTitle.set('ERROR(ECL):');
      FSComponent.render(<ChecklistTextItem
        bus={this.props.bus}
        text={'Checklist Unavailable'}
        isHidden={Subject.create(false)}
      />, checklistContainer);
    }

    const titleAdditionalRows = ChecklistItemBase.splitStringToRows(this.pageTitle.get()).length - 1;
    this.maxRowsForPage = ChecklistWindow.MAX_ROWS_PER_PAGE - titleAdditionalRows;

    this.pages = this.paginateItems(pageItems);

    const prevPageNumber = this.pageNumber.get();
    this.pageNumber.set(1);
    this.pageCount.set(Math.max(1, this.pages.length));

    if (prevPageNumber === 1) {
      this.handlePageChange(1);
    }
  }

  /**
   * Gets the page completion subscription for a page
   * @param page The page
   * @param ignoreLastItem Whether to ignore the last item being completed, defaults to true
   * @returns A subscription of whether the page has been completed
   */
  private getPageCompletedSubscription(page: ChecklistPage, ignoreLastItem = true): Subscribable<boolean> {
    const actionableItems = page.items.filter((actionItems) => actionItems.isCompleted !== undefined);
    const filteredActions = ignoreLastItem ? actionableItems.filter((_, index) => index !== actionableItems.length - 1) : actionableItems;
    const actionableItemsCompletionSubjects = actionableItems ?
      filteredActions.map((actionItems) => actionItems.isCompleted ?? Subject.create(true))
      : [Subject.create(false)];
    return MappedSubject.create(SubscribableMapFunctions.and(), ...actionableItemsCompletionSubjects);
  }

  /**
   * Gets all of the items displayed on a given subpage
   * @param items All of the items across the entire page
   * @returns A list of items being displayed on the subpage
   */
  private paginateItems(items: ChecklistPageItem[]): ChecklistPage[] {
    const pages: ChecklistPage[] = [];
    let currentPage: ChecklistPage = { items: [], startRow: 0, endRow: -1 };

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemStartRow = item.startRow;
      const itemEndRow = item.endRow;

      // Check if the item can fit within the current page, considering overlap
      if (itemStartRow <= currentPage.startRow + this.maxRowsForPage) {
        // Add the item to the current page
        currentPage.items.push(item);

        // Update endRow if necessary
        if (itemEndRow > currentPage.endRow) {
          currentPage.endRow = itemEndRow;
        }

        // If the end row for this item is more than the item limit, create a new page
        // And insert the current item onto the new page
        if (itemEndRow >= currentPage.startRow + this.maxRowsForPage) {
          // Finalize the current page
          currentPage.isCompleted = this.getPageCompletedSubscription(currentPage);
          pages.push(currentPage);

          // Start a new page with the current item
          currentPage = {
            items: [item],
            startRow: itemStartRow,
            endRow: itemEndRow,
          };
        }
      }

      // If this is the last item, finalize the current page
      if (i === items.length - 1) {
        pages.push(currentPage);
      }
    }

    return pages;
  }

  /**
   * Handles the items to display on the page
   * @param pageNumber The page number to display
   */
  private handlePageChange(pageNumber: number): void {
    const pageIndex = pageNumber - 1;

    // Go through all pages and hide items that shouldn't appear
    this.pages.forEach((page, index) => {
      for (const item of page.items) {
        item.isHidden.set(index !== pageIndex);
        item.itemRef.getOrDefault()?.setLastItemOnPage(false);
      }
    });

    const page = this.pages[pageIndex];
    const pageItems = page?.items ?? [];
    // Items can overlap onto other pages, so we go through the visible page and set whether they're hidden again
    for (const item of pageItems) {
      item.isHidden.set(false);
    }

    this.activePageSubscription?.destroy();
    this.activePageSubscription = page?.isCompleted?.sub(
      (isComplete) => isComplete && this.pageNumber.set(this.getNextPage())
    );

    if (page && page.endRow - page.startRow >= this.maxRowsForPage) {
      const lastItemRef = pageItems[pageItems.length - 1].itemRef.getOrDefault();
      lastItemRef?.setLastItemOnPage(true);
    }
  }

  /**
   * Gets the page number of the previous page
   * @returns The page number of the previous page
   */
  private getPrevPage(): number {
    const currentPage = this.pageNumber.get();
    return currentPage <= 1 ? this.pageCount.get() : currentPage - 1;
  }

  /**
   * Gets the page number of the next page
   * @returns The page number of the next page
   */
  private getNextPage(): number {
    const currentPage = this.pageNumber.get();
    return currentPage >= this.pageCount.get() ? 1 : currentPage + 1;
  }

  /**
   * Handles when the RESET / RESET ALL button is pressed
   */
  private resetButtonPress(): void {
    if (this.resetButtonText.get() === 'RESET') {
      const groupIndex = this.groupIndex.get();
      const listIndex = this.listIndex.get();
      if (groupIndex !== null && listIndex !== null) {
        this.props.checklistManager?.resetList(groupIndex, listIndex);
      }
    } else {
      this.props.checklistManager?.resetAll();
    }
  }

  /**
   * Handles when the C/L button has been pressed
   */
  private checklistButtonPress(): void {
    if (this.listIndex.get() !== null) {
      this.listIndex.set(null);
    } else if (this.groupIndex.get() !== null) {
      this.groupIndex.set(null);
    }
  }

  /**
   * Handles when the ACTIVE QUEUE button has been pressed
   */
  private activeQueuePress(): void {
    this.listIndex.set(null);
    this.groupIndex.set(ChecklistWindow.ACTIVE_QUEUE_PAGE_INDEX);
  }

  private readonly pageButtonsActive = this.pageCount.map((count) => count !== 1);
  private readonly activeQueueButtonVisible = Subject.create(true);

  private readonly resetButtonText = this.pageTitle.map((title) => title === ChecklistWindow.DEFAULT_MENU_TEXT ? 'RESET\nALL' : 'RESET');
  private readonly resetButtonActive = MappedSubject.create(
    ([groupIndex, listIndex]) => (groupIndex === null && listIndex === null) || listIndex !== null,
    this.groupIndex, this.listIndex
  );

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="checklist-window-container">
        <div class="left-side">
          <span class="page-index">{this.pageIndexText}</span>
          <TouchButton variant='base' label={'C/L'} onPressed={() => this.checklistButtonPress()} />
          <TouchButton variant='base' isEnabled={this.pageButtonsActive} label={'PREV\r\nPAGE'} onPressed={() => this.pageNumber.set(this.getPrevPage())} />
          <TouchButton variant='base' isEnabled={this.pageButtonsActive} label={'NEXT\r\nPAGE'} onPressed={() => this.pageNumber.set(this.getNextPage())} />
          <TouchButton variant='base' isEnabled={this.resetButtonActive} label={this.resetButtonText} onPressed={() => this.resetButtonPress()} />
          <TouchButton variant='base' isVisible={this.activeQueueButtonVisible} label={'ACTIVE\r\nQUEUE'} onPressed={() => this.activeQueuePress()} />
        </div>
        <div class="right-side">
          <span class="page-title">{this.pageTitle.map((title) => ChecklistItemBase.splitStringToRows(title).join('\r\n'))}</span>
          <div class="checklist-contents" ref={this.checklistContentRef}>
          </div>
        </div>
      </div>
    );
  }
}

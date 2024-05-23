import {
  ArrayUtils, DisplayComponent, FSComponent, NodeInstance, Subject, Subscribable, SubscribableArray,
  SubscribableArrayEventType, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { DynamicListData } from './DynamicListData';

/**
 * A list that handles dynamically adding and removing list items from an HTML element.
 */
export class DynamicList<DataType extends DynamicListData> {
  private readonly listItemCount = Subject.create(0);

  private readonly _visibleItemCount = Subject.create(0);
  /** The number of visible items in this list.  */
  public readonly visibleItemCount = this._visibleItemCount as Subscribable<number>;

  // Key everything on index instead of data item since data items are not guaranteed to be unique in the data array

  private readonly renderedNodes: VNode[] = [];
  private readonly visibilitySubscriptions: (Subscription | undefined)[] = [];
  private readonly elements: (Element | undefined)[] = [];

  private readonly sortIndexes = this.sortItems === undefined
    ? undefined
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    : (a: number, b: number): number => this.sortItems!(this.data.get(a), this.data.get(b));

  private readonly sortedIndexes: number[] = [];
  private readonly indexToSortedIndex: number[] = [];

  private readonly dataSub: Subscription;

  /**
   * Creates a new instance of DynamicList.
   * @param data An array of data items to display in this list.
   * @param itemsContainer The Element to which this list's items will be rendered as children.
   * @param renderItem A function that used to render this list's items. The function is called for every list item
   * that is added to this list. If the root node returned by the function is a {@link DisplayComponent}, then its
   * `destroy()` method will be called when the item is removed from this list.
   * @param sortItems A function to sort data items before rendering them. The function should return a negative
   * number if the first item should be rendered before the second, a positive number if the first item should be
   * rendered after the second, or zero if the two items' relative order does not matter. If not defined, items will
   * be rendered in the order in which they appear in the data item array.
   */
  public constructor(
    private readonly data: SubscribableArray<DataType>,
    private readonly itemsContainer: Element,
    private readonly renderItem: (data: DataType, index: number) => VNode,
    private readonly sortItems?: (a: DataType, b: DataType) => number,
  ) {
    this.renderList();
    this.dataSub = this.data.sub(this.onDataChanged.bind(this));
  }

  /**
   * Renders all of this list's items to the item container element.
   */
  private renderList(): void {
    this.onDataAdded(0, this.data.getArray());
  }

  /**
   * Gets the sorted index of a data item index.
   * @param index A data item index.
   * @returns The index to which the specified data item index is sorted, or `-1` if the data index is out of bounds.
   */
  public sortedIndexOfIndex(index: number): number {
    return this.indexToSortedIndex[index] ?? -1;
  }

  /**
   * Gets the sorted index of a data item.
   * @param data A data item.
   * @returns The index to which the specified data item is sorted, or `-1` if the item is not in this list.
   */
  public sortedIndexOfData(data: DataType): number {
    return this.sortedIndexOfIndex(this.data.getArray().indexOf(data));
  }

  /**
   * Gets the sorted index of a data item index after hidden items have been excluded.
   * @param index A data item index.
   * @returns The index to which the specified data item index is sorted after hidden items have been excluded, or `-1`
   * if the data index is out of bounds or the data item whose index was given is itself hidden.
   */
  public sortedVisibleIndexOfIndex(index: number): number {
    let sortedIndex = this.sortedIndexOfIndex(index);

    if (sortedIndex < 0) {
      return -1;
    }

    if (this.data.get(sortedIndex).isVisible?.get() === false) {
      return -1;
    }

    for (let i = sortedIndex - 1; i >= 0; i--) {
      if (this.data.get(this.sortedIndexes[i]).isVisible?.get() === false) {
        sortedIndex--;
      }
    }

    return sortedIndex;
  }

  /**
   * Gets the sorted index of a data item after hidden items have been excluded.
   * @param data A data item.
   * @returns The index to which the specified data item is sorted after hidden items have been excluded, or `-1` if
   * the item is not in this list or is itself hidden.
   */
  public sortedVisibleIndexOfData(data: DataType): number {
    if (data.isVisible?.get() === false) {
      return -1;
    }

    return this.sortedVisibleIndexOfIndex(this.data.getArray().indexOf(data));
  }

  /**
   * Gets the data item index of a sorted index.
   * @param sortedIndex A sorted index.
   * @returns The index of the data item that is sorted to the specified index, or `-1` if the sorted index is out of bounds.
   */
  public indexOfSortedIndex(sortedIndex: number): number {
    return this.sortedIndexes[sortedIndex] ?? -1;
  }

  /**
   * Gets the data item index of a sorted index after hidden items have been excluded.
   * @param sortedVisibleIndex A sorted index after hidden items have been excluded.
   * @returns The index of the data item that is sorted to the specified index after hidden items have been excluded,
   * or `-1` if the sorted index is out of bounds.
   */
  public indexOfSortedVisibleIndex(sortedVisibleIndex: number): number {
    if (sortedVisibleIndex < 0 || sortedVisibleIndex >= this.sortedIndexes.length) {
      return -1;
    }

    for (let i = 0; i < this.sortedIndexes.length; i++) {
      if (this.data.get(this.sortedIndexes[i]).isVisible?.get() === false) {
        continue;
      }

      if (sortedVisibleIndex > 0) {
        sortedVisibleIndex--;
      } else {
        return this.sortedIndexes[i];
      }
    }

    return -1;
  }

  /**
   * Gets the rendered instance of a data item in this list.
   * @param index The index of the data item for which to get the rendered instance.
   * @returns The rendered instance of the specified data item, or `undefined` if {@linkcode index} is out of bounds.
   */
  public getRenderedItem(index: number): NodeInstance | undefined {
    return this.renderedNodes[index]?.instance;
  }

  /**
   * Iterates over each rendered component and executes a callback function.
   * @param fn The callback function to execute for each component. The function should take two arguments: the first
   * argument is the iterated component, and the second argument is the index of the component _in the iteration_.
   * @param visibleOnly Whether to only iterate over components whose associated data items have their visibility flags
   * set to `true`. Defaults to `false`.
   * @param sortedOrder Whether to iterate over components in sorted order instead of the order in which their
   * associated data items appear in the data array. Defaults to `false`.
   */
  public forEachComponent<T extends DisplayComponent<any>>(
    fn: (component: T | undefined, index: number) => void,
    visibleOnly = false,
    sortedOrder = false
  ): void {
    let iteratorIndex = 0;

    if (sortedOrder) {
      for (let i = 0; i < this.renderedNodes.length; i++) {
        const index = this.sortedIndexes[i];
        if (!visibleOnly || this.data.get(index).isVisible?.get() !== false) {
          fn(this.renderedNodes[index].instance as T | undefined, iteratorIndex);
        }
        iteratorIndex++;
      }
    } else {
      for (let i = 0; i < this.renderedNodes.length; i++) {
        if (!visibleOnly || this.data.get(i).isVisible?.get() !== false) {
          fn(this.renderedNodes[i].instance as T | undefined, iteratorIndex);
        }
        iteratorIndex++;
      }
    }
  }

  /**
   * Responds to when this list's data item array changes.
   * @param index The index of the change.
   * @param type The type of change.
   * @param data The item that was changed.
   */
  private onDataChanged(index: number, type: SubscribableArrayEventType, data: DataType | readonly DataType[] | undefined): void {
    switch (type) {
      case SubscribableArrayEventType.Added: this.onDataAdded(index, data); break;
      case SubscribableArrayEventType.Removed: data !== undefined && this.onDataRemoved(index, data); break;
      case SubscribableArrayEventType.Cleared: this.onDataCleared(); break;
    }
    this.listItemCount.set(this.data.length);
  }

  /**
   * Responds to when data items are added to this list's data item array.
   * @param index The index at which the data items were added.
   * @param data The data items that were added.
   */
  private onDataAdded(index: number, data: DataType | readonly DataType[] | undefined): void {
    if (data !== undefined) {
      let numAdded = 0;

      if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
          const dataItem = data[i];
          const indexToAdd = index + i;

          this.addDataItem(dataItem, indexToAdd);
        }
        numAdded = data.length;
      } else {
        this.addDataItem(data as DataType, index);
        numAdded = 1;
      }

      if (numAdded > 0) {
        // Update the indexes in the sorted index array to account for shifting caused by the insertion of the new items.
        for (let i = 0; i < this.sortedIndexes.length; i++) {
          if (this.sortedIndexes[i] >= index) {
            this.sortedIndexes[i] += numAdded;
          }
        }

        // Insert the indexes of the new items at the positions where they were rendered into the DOM.
        this.sortedIndexes.splice(index, 0, ...ArrayUtils.create(numAdded, i => index + i));

        this.reconcileSortedIndexArrays();

        this.updateOrder();
      }
    }
  }

  /**
   * Adds a data item to the list and performs the required rendering and ordering operations.
   * @param dataItem The data item to add to the list.
   * @param indexToAdd The index to add the item at.
   */
  private addDataItem(dataItem: DataType, indexToAdd: number): void {
    // Create list item and store a reference to the instance if it is a DisplayComponent so we can destroy it later
    const listItemVNode = this.renderItem(dataItem, indexToAdd);
    this.renderedNodes.splice(indexToAdd, 0, listItemVNode);

    // Render the list item into the DOM and store a reference to the root element of the rendered item.
    // By default, we will render the item to the same index at which it appears in the data array. Therefore, if
    // this list does not support sorting, it will be in the correct position. If this list does support sorting, it
    // will be moved if necessary when the list is resorted immediately after the insertion operation.
    const elementAtIndexToInsert = this.itemsContainer.children.item(indexToAdd);
    const element = this.renderToDom(listItemVNode, elementAtIndexToInsert);
    this.elements.splice(indexToAdd, 0, element ?? undefined);

    // Update our visible items count.
    if (dataItem.isVisible === undefined || dataItem.isVisible.get() === true) {
      this.incrementVisibleCount();
    }

    // Subscribe to the item's visibility state if one is provided.
    if (dataItem.isVisible !== undefined) {
      this.visibilitySubscriptions.splice(indexToAdd, 0, dataItem.isVisible.sub(this.dataItemVisibilityChanged));
    } else {
      this.visibilitySubscriptions.splice(indexToAdd, 0, undefined);
    }
  }

  /**
   * Adds a list rendered DOM node to the collection.
   * @param node Item to render and add.
   * @param elementAtIndexToInsert The existing element, if any, located at the index to which to render the node.
   * @returns The created DOM element.
   */
  private renderToDom(node: VNode, elementAtIndexToInsert: Element | null): Element | null {
    if (elementAtIndexToInsert !== null) {
      node && elementAtIndexToInsert && FSComponent.renderBefore(node, elementAtIndexToInsert as any);
      return elementAtIndexToInsert.previousElementSibling;
    } else {
      elementAtIndexToInsert = this.itemsContainer;
      node && elementAtIndexToInsert && FSComponent.render(node, elementAtIndexToInsert as any);
      return this.itemsContainer.lastElementChild;
    }
  }

  /**
   * Responds to when data items are removed from this list's data item array.
   * @param index The index at which the data items were removed.
   * @param data The data items that were removed.
   */
  private onDataRemoved(index: number, data: DataType | readonly DataType[]): void {
    let numRemoved = 0;

    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const dataItem = data[i];
        this.removeDataItem(dataItem, index + i);
      }
      numRemoved = data.length;
    } else {
      this.removeDataItem(data as DataType, index);
      numRemoved = 1;
    }

    if (numRemoved > 0) {
      this.renderedNodes.splice(index, numRemoved);
      this.visibilitySubscriptions.splice(index, numRemoved);
      this.elements.splice(index, numRemoved);

      // Update the indexes in the sorted index array to account for shifting caused by the removal of items.
      for (let i = 0; i < this.sortedIndexes.length; i++) {
        const diff = this.sortedIndexes[i] - index;
        if (diff < 0) {
          // Index is less than the range of removed indexes -> do nothing.
          continue;
        } else if (diff >= numRemoved) {
          // Index is greater than the range of removed indexes -> decrement the index by the number of removed indexes.
          this.sortedIndexes[i] -= numRemoved;
        } else {
          // Index is within the range of removed indexes -> remove the index from the array.
          this.sortedIndexes.splice(i--, 1);
        }
      }

      this.reconcileSortedIndexArrays();
    }
  }

  /**
   * Removes a data item from the list.
   * @param data The data item to remove.
   * @param index The index of the data that was removed.
   */
  private removeDataItem(data: DataType, index: number): void {
    this.removeDomNode(data, index);

    FSComponent.shallowDestroy(this.renderedNodes[index]);

    if (data.isVisible === undefined || data.isVisible.get() === true) {
      this.decrementVisibleCount();
    }

    this.visibilitySubscriptions[index]?.destroy();
  }

  /**
   * Removes a rendered DOM node corresponding to a data item from this list's item container.
   * @param data The data item to remove.
   * @param index The index of the data item to remove.
   */
  private removeDomNode(data: DataType, index: number): void {
    const toRemove = this.elements[index];

    if (toRemove !== undefined) {
      this.itemsContainer.removeChild(toRemove);
    } else {
      console.warn('DynamicList: could not find DOM node to remove');
    }
  }

  /**
   * Responds to when this list's data item array is cleared.
   */
  private onDataCleared(): void {
    this.itemsContainer.innerHTML = '';

    this.sortedIndexes.length = 0;
    this.indexToSortedIndex.length = 0;

    for (let i = 0; i < this.renderedNodes.length; i++) {
      FSComponent.shallowDestroy(this.renderedNodes[i]);
    }
    this.renderedNodes.length = 0;

    this.visibilitySubscriptions.forEach(x => x?.destroy());
    this.visibilitySubscriptions.length = 0;
    this._visibleItemCount.set(0);

    this.elements.length = 0;
  }

  /**
   * Adjust the visible item count when a data item's visiblity changes.
   * @param isVisible The data item's new visibility.
   */
  private readonly dataItemVisibilityChanged = (isVisible: boolean): void => {
    if (isVisible) {
      this.incrementVisibleCount();
    } else {
      this.decrementVisibleCount();
    }
  };

  /**
   * Increments this list's visible item count by 1.
   */
  private incrementVisibleCount(): void {
    this._visibleItemCount.set(this._visibleItemCount.get() + 1);
  }

  /**
   * Decrements this list's visible item count by 1.
   */
  private decrementVisibleCount(): void {
    this._visibleItemCount.set(this._visibleItemCount.get() - 1);
  }

  /**
   * Updates the array which maps data indexes to sorted indexes to match the sorting order provided by the
   * sorted index array.
   */
  private reconcileSortedIndexArrays(): void {
    for (let i = 0; i < this.sortedIndexes.length; i++) {
      this.indexToSortedIndex[this.sortedIndexes[i]] = i;
    }
  }

  /**
   * Updates the order of the rendered items in this list.
   */
  public updateOrder(): void {
    if (this.sortIndexes === undefined) {
      return;
    }

    const oldOrder = Array.from(this.sortedIndexes);

    this.sortedIndexes.sort(this.sortIndexes);

    if (ArrayUtils.equals(this.sortedIndexes, oldOrder)) {
      return;
    }

    this.reconcileSortedIndexArrays();

    for (let i = 0; i < this.sortedIndexes.length; i++) {
      const element = this.elements[this.sortedIndexes[i]];
      if (element !== undefined) {
        this.itemsContainer.appendChild(element);
      }
    }
  }

  /**
   * Destroys this list.
   */
  public destroy(): void {
    this.dataSub.destroy();

    this.onDataCleared();
  }
}
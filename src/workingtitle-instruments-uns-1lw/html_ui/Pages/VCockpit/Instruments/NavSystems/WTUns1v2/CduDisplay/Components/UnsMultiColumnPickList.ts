import { DisplayField, FmcFormatter, FmcFormatterOutput, FmcRenderTemplate, Subject, Subscribable } from '@microsoft/msfs-sdk';

import { UnsFmcPage } from '../UnsFmcPage';
import { UnsPickListFormatter } from './UnsPickList';
import { UnsTextInputField } from './UnsTextInputField';

/**
 * Input data for {@link PickListFormatter}
 */
export interface MultiColumnPickListData<T = string> {
  /** The title of this pick list */
  title?: string | UnsTextInputField<number>,

  /** The style to apply to the title. DO NOT SURROUND WITH SQUARE BRACKETS. Default: <no style> */
  titleStyle?: string,

  /** The data to show */
  data: readonly T[],

  /** The number of characters to pad the item index to. Default: 2 */
  padIndexTo?: number,

  /** The target width of the list, **excluding** the border. Default: <no target width> */
  targetWidth?: number,

  /** The maximum number of items to show per page */
  itemsPerPage: number,
}

/** Multi column pick list formatter */
class MultiColumnPickListFormatter<T = string> implements FmcFormatter<MultiColumnPickListData<T>> {
  nullValueString = '';

  /**
   * Ctor
   *
   * @param subPageIndex a subscribable the current subpage index
   * @param itemFormatter an optional (only if T extends string) formatter for the items.
   * Specifying this defers the responsibility of rendering indices and styles to the formatter
   */
  constructor(private readonly subPageIndex: Subscribable<number>, private readonly itemFormatter: UnsPickListFormatter<T>) {
  }

  /** @inheritDoc */
  format({
    title,
    titleStyle = 's-text',
    data,
    padIndexTo = 2,
    targetWidth = 0,
    itemsPerPage,
  }: MultiColumnPickListData<T>): FmcRenderTemplate {
    const lines: string[] = [];

    if (title !== undefined) {
      let titleString: string;

      if (typeof title === 'string') {
        titleString = `${title.padEnd(targetWidth, ' ')}[${titleStyle}]`;
      } else {
        const output: FmcFormatterOutput = title.render();

        if (typeof output !== 'string') {
          throw new Error('UnsPickList: If using a UnsTextInputField for the title, its render function must return a STRING value.');
        }

        const outputWithoutStyles: string = output.replace(/\[.*?]/g, '');
        const spaces: number = Math.max(0, targetWidth - outputWithoutStyles.length);

        titleString = `${output}${' '.repeat(spaces)}`;
      }

      lines.push(titleString);
    }

    const offset = (this.subPageIndex.get() - 1) * itemsPerPage;

    for (let i = offset; i < Math.min(offset + itemsPerPage, data.length); i++) {
      const item = data[i];

      if (typeof item !== 'string' && !this.itemFormatter) {
        throw new Error('[PickListFormatter] Cannot render non-string items without a formatter specified');
      }

      const indexString = (i + 1).toString().padStart(padIndexTo, ' ');

      let row: string;
      if (this.itemFormatter) {
        let itemString: string;
        if (typeof this.itemFormatter === 'object') {
          if (item !== null) {
            itemString = this.itemFormatter.format(item as any);
          } else {
            itemString = this.itemFormatter.nullValueString ?? '';
          }
        } else {
          itemString = this.itemFormatter(item);
        }

        const itemWithoutStyles: string = itemString.replace(/\[.*?]/g, '');
        const spaces: number = Math.max(0, targetWidth - itemWithoutStyles.length);

        row = `${itemString}${' '.repeat(spaces)}`;
      } else {
        row = `${`${indexString} ${item}`.padEnd(targetWidth, ' ')}[white s-text]`;
      }

      lines.push(row);
    }

    const wrappedLines: string[][] = [];

    lines.forEach((line, index) => {
      const rightIndex = index - (itemsPerPage / 2);
      if (rightIndex < 0) {
        wrappedLines.push([line, '']);
      } else {
        wrappedLines[rightIndex][1] = line;
      }
    });

    return wrappedLines;
  }
}

/**
 * A picklist component for the UNS-1
 */
export class UnsMultiColumnPickList<T = string> extends DisplayField<MultiColumnPickListData<T>> {
  public subPageIndex;

  public subPageCount;

  public invalidateOnPageChange;

  /** @inheritDoc */
  constructor(page: UnsFmcPage, data: Subscribable<MultiColumnPickListData<T>>, formatter: UnsPickListFormatter<T>) {
    const subPageIndex = Subject.create(1);
    const subPageCount = Subject.create(0);

    super(page, {
      formatter: new MultiColumnPickListFormatter(subPageIndex, formatter),
    });

    this.subPageIndex = subPageIndex;
    this.subPageCount = subPageCount;
    this.invalidateOnPageChange = false;

    this.page.addBinding(this.subPageIndex.sub(() => this.invalidate()));

    this.page.addBinding(data.sub((listData) => this.adjustSubPageIndexAndCount(listData)));

    this.bind(data);
  }

  /**
   * Adjusts the subpage index and count
   *
   * @param listData the picklist data
   */
  private adjustSubPageIndexAndCount(listData: MultiColumnPickListData<any>): void {
    this.subPageCount.set(Math.max(1, Math.ceil(listData.data.length / listData.itemsPerPage)));

    const currentPageIndex = this.subPageIndex.get();

    if (currentPageIndex > this.subPageCount.get()) {
      this.subPageIndex.set(Math.max(1, this.subPageCount.get() - 1));
    }
  }

  /** @inheritDoc */
  public prevSubpage(): void {
    const currentPageIndex = this.subPageIndex.get();
    const currentPageCount = this.subPageCount.get();

    if (currentPageIndex === 1) {
      this.subPageIndex.set(currentPageCount);
      return;
    }

    this.subPageIndex.set(currentPageIndex - 1);
  }

  /** @inheritDoc */
  public nextSubpage(): void {
    const currentPageIndex = this.subPageIndex.get();
    const currentPageCount = this.subPageCount.get();

    if (currentPageIndex === currentPageCount) {
      this.subPageIndex.set(1);
      return;
    }

    this.subPageIndex.set(currentPageIndex + 1);
  }
}

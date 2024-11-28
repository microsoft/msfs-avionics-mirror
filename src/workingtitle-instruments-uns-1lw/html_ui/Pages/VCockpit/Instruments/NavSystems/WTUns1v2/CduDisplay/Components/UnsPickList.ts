import { ArrayUtils, BitFlags, DisplayField, FmcFormatter, FmcFormatterOutput, FmcRenderTemplate, Formatter, Subject, Subscribable } from '@microsoft/msfs-sdk';

import { UnsFmcPage } from '../UnsFmcPage';
import { UnsTextInputField } from './UnsTextInputField';

/**
 * Input data for {@link PickListFormatter}
 */
export interface PickListData<T = string> {
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

  /** The borders to apply to the pick list. Default: `UnsPickListBorder.None`.
   * **Ensure you have set an appropriate `targetWidth` value.** */
  borders?: UnsPickListBorder,

  /** If true, an extra column will **not** be added to each side to contain centered borders.
   * Rather, borders will be added to the outside of the left- and right-most text-containing cells. */
  compactSideBorders?: boolean,

  /** If true, the top border will be lower than normal. */
  lowTopBorder?: boolean,
}

/** Formatter for a UnsPickList */
export type UnsPickListFormatter<T = string> = T extends string ?
  (Formatter<string> | ((value: T) => string) | undefined) :
  (Formatter<T>      | ((value: T) => string) );

/**
 *
 */
class PickListFormatter<T = string> implements FmcFormatter<PickListData<T>> {
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

  /**
   * Wraps an array of text lines with border formatting
   *
   * @param lines the input lines
   * @param targetWidth the target width of the box, **excluding** the border. Note: the text lines provided are not padded to this width.
   * @param borders the border flags for the box
   * @param compactSideBorders Whether the side borders should occupy their own grid column.
   * @param lowTopBorder Whether the top border should be lower than half the height of the cell.
   *
   * @returns an array of strings
   * @throws If target width is too small for border
   */
  private surroundBoxWithBorders(
    lines: string[],
    targetWidth: number,
    borders: number,
    compactSideBorders: boolean,
    lowTopBorder: boolean,
  ): string[] {
    const wrappedLines: string[] = [];

    // Top border
    if (BitFlags.isAll(borders, UnsPickListBorder.Top)) {
      const topBorderClass =  lowTopBorder ? 'line-rl-low' : 'line-rl';
      const topLeftCornerClass = lowTopBorder && compactSideBorders ? 'line-bmr-low-compact' : 'line-bmr';
      const topRightCornerClass = lowTopBorder && compactSideBorders ? 'line-lmb-low-compact' : 'line-lmb';

      if (BitFlags.isAll(borders, UnsPickListBorder.Left | UnsPickListBorder.Right)) {
        if (targetWidth < 2) {
          throw new Error('UnsPickList: Please define a targetWidth of at least 2 when using left and right borders.');
        }
        wrappedLines.push(` [${topLeftCornerClass}]${' '.repeat(targetWidth - 2)}[${topBorderClass}] [${topRightCornerClass}]`);
      } else if (BitFlags.isAll(borders, UnsPickListBorder.Left)) {
        if (targetWidth < 1) {
          throw new Error('UnsPickList: Please define a targetWidth of at least 1 when using left borders.');
        }
        wrappedLines.push(` [line-bmr]${' '.repeat(targetWidth - 1)}[line-rl]`);
      } else if (BitFlags.isAll(borders, UnsPickListBorder.Right)) {
        if (targetWidth < 1) {
          throw new Error('UnsPickList: Please define a targetWidth of at least 1 when using right borders.');
        }
        wrappedLines.push(`${' '.repeat(targetWidth - 1)}[line-rl] [line-lmb]`);
      }
    }

    // Side borders
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      const noTopBorder: boolean = i === 0 && !BitFlags.isAll(borders, UnsPickListBorder.Top);
      const leftSideBorderStyle: string = noTopBorder ? '' : (compactSideBorders ? 'line-tb-l' : 'line-tb');
      const rightSideBorderStyle: string = noTopBorder ? '' : (compactSideBorders ? 'line-tb-r' : 'line-tb');

      if (BitFlags.isAll(borders, UnsPickListBorder.Left | UnsPickListBorder.Right)) {
        if (compactSideBorders) {
          const strArray = line.split('');

          // Add left border style
          if (strArray[1] === '[') {
            // If there's already a style on the first character, add it to the end of that character's style list
            strArray.splice(line.indexOf(']'), 0, ` ${leftSideBorderStyle}`);
          } else {
            // Otherwise insert a new style string after the first character
            strArray.splice(1, 0, `[${leftSideBorderStyle}]`);
          }

          // Add right border style
          if (ArrayUtils.last(strArray) === ']') {
            // If there's already a style on the last character, get the last style string
            const styleStrings: RegExpMatchArray | null = strArray.join('').match(/\[.*?]/g);
            const lastStyle: string = styleStrings && styleStrings.length > 0 ? ArrayUtils.last(styleStrings) : '';

            // Reinsert the last style string after the penultimate character
            strArray.splice(line.lastIndexOf('['), 0, lastStyle);
            // Add the right border style to the last style string
            strArray.splice(strArray.length - 1, 0, ` ${rightSideBorderStyle}`);
          } else {
            // Otherwise insert a new style string after the last character
            strArray.push(`[${rightSideBorderStyle}]`);
          }

          line = strArray.join('');
        }

        wrappedLines.push(line);
      } else if (BitFlags.isAll(borders, UnsPickListBorder.Left)) {
        wrappedLines.push(` [${leftSideBorderStyle}] ${line}`);
      } else if (BitFlags.isAll(borders, UnsPickListBorder.Right)) {
        wrappedLines.push(`${line} [${rightSideBorderStyle}]`);
      } else {
        wrappedLines.push(line);
      }
    }

    // Bottom border
    if (BitFlags.isAll(borders, UnsPickListBorder.Bottom)) {
      const bottomLeftCornerClass = compactSideBorders ? 'line-tmr-compact' : 'line-tmr';
      const bottomRightCornerClass = compactSideBorders ? 'line-lmt-compact' : 'line-lmt';

      if (BitFlags.isAll(borders, UnsPickListBorder.Left | UnsPickListBorder.Right)) {
        if (targetWidth < 2) {
          throw new Error('UnsPickList: Please define a targetWidth of at least 2 when using left and right borders.');
        }
        wrappedLines.push(` [${bottomLeftCornerClass}]${' '.repeat(targetWidth - 2)}[line-rl] [${bottomRightCornerClass}]`);
      } else if (BitFlags.isAll(borders, UnsPickListBorder.Left)) {
        if (targetWidth < 1) {
          throw new Error('UnsPickList: Please define a targetWidth of at least 1 when using left borders.');
        }
        wrappedLines.push(` [${bottomLeftCornerClass}]${' '.repeat(targetWidth - 1)}[line-rl]`);
      } else if (BitFlags.isAll(borders, UnsPickListBorder.Right)) {
        if (targetWidth < 1) {
          throw new Error('UnsPickList: Please define a targetWidth of at least 1 when using right borders.');
        }
        wrappedLines.push(`${' '.repeat(targetWidth - 1)}[line-rl] [${bottomRightCornerClass}]`);
      }
    }

    return wrappedLines;
  }

  /** @inheritDoc */
  format({
    title,
    titleStyle = 's-text',
    data,
    padIndexTo = 2,
    targetWidth = 0,
    borders = UnsPickListBorder.None,
    itemsPerPage,
    compactSideBorders = false,
    lowTopBorder = false,
  }: PickListData<T>): FmcRenderTemplate {
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

    while (lines.length < (itemsPerPage + 1)) {
      lines.push(`${' '.repeat(targetWidth)}[white s-text]`);
    }

    const wrappedLines = this.surroundBoxWithBorders(
      lines,
      targetWidth,
      borders,
      compactSideBorders,
      lowTopBorder,
    );

    return wrappedLines.map((it) => [it]);
  }
}

export enum UnsPickListBorder {
  Top = (1 << 1),
  Right = (1 << 2),
  Bottom = (1 << 3),
  Left = (1 << 4),

  None = 0,
  All = Top | Right | Bottom | Left,
}

/**
 * A picklist component for the UNS-1
 */
export class UnsPickList<T = string> extends DisplayField<PickListData<T>> {
  public subPageIndex;

  public subPageCount;

  public invalidateOnPageChange;

  /** @inheritDoc */
  constructor(page: UnsFmcPage, data: Subscribable<PickListData<T>>, formatter: UnsPickListFormatter<T>) {
    const subPageIndex = Subject.create(1);
    const subPageCount = Subject.create(1);

    super(page, {
      formatter: new PickListFormatter(subPageIndex, formatter),
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
  private adjustSubPageIndexAndCount(listData: PickListData<any>): void {
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

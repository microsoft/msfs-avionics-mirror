import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';

/** The properties for the {@link ChecklistItem} component. */
export interface ChecklistItemBaseProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** Whether this item is hidden */
  isHidden: Subscribable<boolean>;
}

/**
 * An Epic 2 base checklist item
 */
export abstract class ChecklistItemBase<P extends ChecklistItemBaseProps> extends DisplayComponent<P> {
  public static MAX_CHARACTERS_PER_ROW = 18;

  protected abstract readonly textRows: string[];
  protected readonly baseRef = FSComponent.createRef<HTMLDivElement>();

  private isLastItem = false;

  /**
   * When given an input string, it will split the string into 18 character rows.
   * Splitting at the last space, hyphen or slash before the character limit.
   * @param input The input string
   * @returns An array of strings that don't breach the 18 character limit.
   */
  public static splitStringToRows(input: string): string[] {
    const rows: string[] = [];
    let currentIndex = 0;

    while (currentIndex < input.length) {
      const endIndex = Math.min(currentIndex + ChecklistItemBase.MAX_CHARACTERS_PER_ROW, input.length);

      if (endIndex === input.length || endIndex - currentIndex < ChecklistItemBase.MAX_CHARACTERS_PER_ROW) {
        rows.push(input.slice(currentIndex, endIndex).trim());
        break;
      }

      let splitIndex = input.lastIndexOf(' ', endIndex);
      if (splitIndex < currentIndex) { splitIndex = input.lastIndexOf('-', endIndex); }
      if (splitIndex < currentIndex) { splitIndex = input.lastIndexOf('/', endIndex); }
      if (splitIndex < currentIndex || splitIndex === currentIndex) { splitIndex = endIndex; }

      rows.push(input.slice(currentIndex, splitIndex).trim());
      currentIndex = splitIndex;

      while (input[currentIndex] === ' ' || input[currentIndex] === '-' || input[currentIndex] === '/') {
        currentIndex++;
      }
    }

    return rows;
  }

  /**
   * Sets whether this item is the last item on the page
   * @param isLast Is it the last item?
   */
  public setLastItemOnPage(isLast: boolean): void {
    if (isLast !== this.isLastItem) {
      const ref = this.baseRef.getOrDefault();

      ref?.classList.toggle('checklist-last-item', isLast);
      this.isLastItem = isLast;
    }
  }

  /** @inheritdoc */
  public abstract render(): VNode
}

import { MappedSubject, Subject } from '../sub';
import { FmcRenderCallback } from './AbstractFmcPage';
import { EventBus } from '../data';

/**
 * Options for {@link FmcScratchpad}
 */
export interface FmcScratchpadOptions {
  /** Cell width of the scratchpad on the screen */
  cellWidth: number,

  /** Style to apply to the text. Defaults to `white`. */
  style?: string,

  /** Text to show for the DELETE state. Defaults to "DELETE". */
  deleteText?: string,

  /** Defines surrounding text [left, right] around the contents. Defaults to none. */
  surroundingText?: [string, string],

  /** Whether error text is centered. Defaults to false. */
  errorTextCentered?: boolean,
}

/**
 * Scratchpad for an FMC screen
 */
export class FmcScratchpad {
  private readonly options: Required<FmcScratchpadOptions> = {
    cellWidth: 16,
    style: 'white d-text',
    deleteText: 'DELETE',
    surroundingText: ['', ''],
    errorTextCentered: false,
  };

  public contents = Subject.create('');

  public errorContents = Subject.create('');

  public renderedText = Subject.create('');

  public isInDelete = Subject.create(false);

  /**
   * Ctor
   * @param bus the event bus
   * @param options the options
   * @param renderCallback the render callback
   */
  constructor(
    private readonly bus: EventBus,
    options: Partial<FmcScratchpadOptions>,
    private readonly renderCallback: FmcRenderCallback,
  ) {
    Object.assign(this.options, options);

    MappedSubject.create(this.contents, this.errorContents, this.isInDelete).sub(() => this.renderText());
  }

  /**
   * Appends a string on the scratchpad
   * @param char the string to append
   */
  public typeContents(char: string): void {
    this.isInDelete.set(false);
    this.clearError();

    const contents = this.contents.get();

    this.contents.set(`${contents}${char}`);
  }

  /**
   * Deletes the last character on the scratchpad
   */
  public backspace(): void {
    this.clearError();

    const contents = this.contents.get();

    this.contents.set(contents.substring(0, Math.max(0, contents.length - 1)));
  }

  /**
   * Clears the scratchpad
   */
  public clear(): void {
    this.clearError();
    this.delete(false);

    this.contents.set('');
  }

  /**
   * Clears the scratchpad error
   */
  public clearError(): void {
    this.errorContents.set('');
  }

  /**
   * Sets the scratchpad in DELETE mode (or not)
   *
   * @param value optional value to force, otherwise the value is set to `true`
   */
  public delete(value?: boolean): void {
    this.clearError();

    this.isInDelete.set(value ?? !this.isInDelete.get());
  }

  /**
   * Renders the scratchpad and sets the subject
   */
  private renderText(): void {
    const surroundingTextWidth = this.options.surroundingText[0].length + this.options.surroundingText[1].length;
    const spaceToPadTo = this.options.cellWidth - surroundingTextWidth;

    // We use `\u00a0` instead of the normal space character here, due to what seems to be an issue involving the regular space character
    // causing a lack of repaints in some situations.

    let renderText;
    if (this.isInDelete.get()) {
      renderText = this.options.deleteText;
    } else if (this.errorContents.get()) {
      const errorContents = this.errorContents.get();

      const leftPad = '\u00a0'.repeat(Math.floor((spaceToPadTo - errorContents.length) / 2));
      const rightPad = '\u00a0'.repeat(Math.ceil((spaceToPadTo - errorContents.length) / 2));

      renderText = `${leftPad}${errorContents}${rightPad}`;
    } else {
      renderText = this.contents.get().padEnd(spaceToPadTo, '\u00a0');
    }

    const leftText = this.options.surroundingText[0];
    const rightText = this.options.surroundingText[1];

    const styleString = this.options.style ? `[${this.options.style}]` : '';

    this.renderedText.set(`${leftText}${renderText}${styleString}${rightText}`);
  }
}
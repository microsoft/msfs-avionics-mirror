import { RawFormatter } from '../FmcFormats';
import { FmcPage } from '../FmcPage';
import { EditableField, EditableFieldOptions } from './EditableField';

/**
 * Switch label options
 */
export interface SwitchLabelOptions extends EditableFieldOptions<number> {
  /** String names of possible options, in order */
  optionStrings: readonly string[],

  /** Style class applied to the active option string only */
  activeStyle?: string,

  /** The position of the caret to display. Defaults to none. */
  caret?: 'none' | 'left' | 'right';
}

/**
 * A field for displaying a switch label.
 */
export class SwitchLabel extends EditableField<number, number> {
  protected options!: SwitchLabelOptions;

  /** @inheritDoc */
  public constructor(
    protected page: FmcPage,
    options: Partial<SwitchLabelOptions> = {},
  ) {
    super(page, Object.assign({
      formatter: RawFormatter,
      activeStyle: 'green',
      caret: 'none',
    }, options) as SwitchLabelOptions);
  }

  // /**
  //  * Creates a new switch label.
  //  * @param page The parent {@link FmcPage} of the new label.
  //  * @param options Options for the new label.
  //  * @returns The new label.
  //  */
  // public static create(page: FmcPage, options: SwitchLabelOptions): SwitchLabel {
  //   return new SwitchLabel(page, options);
  // }

  /** @inheritDoc */
  public render(): string {
    let string = '';
    if (this.value !== null) {
      for (let i = 0; i < this.options.optionStrings.length; i++) {
        const choice = this.options.optionStrings[i];

        string += choice;

        if (i === this.value) {
          string += `[${this.options.activeStyle} d-text]`;
        } else {
          string += '[s-text]';
        }

        if (i !== this.options.optionStrings.length - 1) {
          string += '/[d-text]';
        }
      }

      switch (this.options.caret) {
        case 'left':
          string = `<${string}`;
          break;
        case 'right':
          string = `${string}>`;
          break;
      }
    }

    return string;
  }

  /** @inheritDoc */
  public async onHandleSelectKey(): Promise<boolean> {
    if (this.value === null) {
      this.value = 0;
    } else {
      this.value = (this.value + 1) % this.options.optionStrings.length;
    }
    this.valueChanged.notify(this, this.value);
    this.invalidate();

    return true;
  }

}

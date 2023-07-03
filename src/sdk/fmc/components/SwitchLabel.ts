import { AbstractFmcPage } from '../AbstractFmcPage';
import { RawFormatter } from '../FmcFormat';
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

  /** The separator to show between the options, arrows are highlighted when next to active option */
  separator?: 'slash' | 'arrows';
}

/**
 * A field for displaying a switch label.
 */
export class SwitchLabel extends EditableField<number, number> {
  protected options!: SwitchLabelOptions;

  /** @inheritDoc */
  public constructor(
    protected page: AbstractFmcPage,
    options: Partial<SwitchLabelOptions> = {},
  ) {
    super(page, Object.assign({
      formatter: RawFormatter,
      activeStyle: 'green',
      caret: 'none',
      separator: 'slash',
    }, options) as SwitchLabelOptions);
  }

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
          switch (this.options.separator) {
            case 'slash':
              string += '/[d-text]';
              break;
            case 'arrows':
              // if (i === this.value - 1) {
              //   string += `←→[${this.options.activeStyle} d-text]`;
              // } else {
              string += '←→[d-text]';
              // }
              break;
          }
        }
      }

      switch (this.options.caret) {
        case 'left':
          string = `<[]${string}`;
          break;
        case 'right':
          string = `${string}>[]`;
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

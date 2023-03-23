import { RawFormatter } from '../FmcFormats';
import { FmcPage } from '../FmcPage';
import { EditableField, EditableFieldOptions } from './EditableField';

/**
 * Toggle label options
 */
export interface ToggleLabelOptions extends EditableFieldOptions<boolean> {
  /** The text to display for each value of the label. If `trueText` is not defined, it defaults to `falseText`. */
  text: readonly [falseText: string, trueText?: string],

  /** Style class applied to the label text when its value is `true`. */
  activeStyle?: string,
}

/**
 * A field for displaying a toggle label.
 */
export class ToggleLabel extends EditableField<boolean, boolean> {
  protected options!: ToggleLabelOptions;


  /** @inheritDoc */
  public constructor(
    page: FmcPage,
    options: Partial<ToggleLabelOptions> = {},
  ) {
    const opts = Object.assign({
      formatter: RawFormatter,
      activeStyle: 'green',
    }, options);
    super(page, opts as ToggleLabelOptions);
  }

  // /**
  //  * Creates a new toggle label.
  //  * @param page The parent {@link FmcPage} of the new label.
  //  * @param options Options for the new label.
  //  * @returns The new label.
  //  */
  // public static create(page: FmcPage, options: ToggleLabelOptions): ToggleLabel {
  //   return new ToggleLabel(page, options);
  // }

  /** @inheritDoc */
  public render(): string {
    const value = this.value;
    return `${value && this.options.text[1] !== undefined ? this.options.text[1] : this.options.text[0]}[${value ? `${this.options.activeStyle ?? 'green'} d-text` : 's-text'}]`;
  }

  /** @inheritDoc */
  protected async onHandleSelectKey(): Promise<boolean> {
    this.value = !this.value;
    this.valueChanged.notify(this, this.value);
    this.invalidate();
    return true;
  }

}
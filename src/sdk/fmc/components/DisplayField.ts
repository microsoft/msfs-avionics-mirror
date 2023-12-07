import { FmcComponentFormatter, FmcFormatterOutput } from '../FmcFormat';
import { AbstractFmcPage } from '../AbstractFmcPage';
import { FmcComponent, FmcComponentOptions } from './FmcComponent';
import { Subscribable } from '../../sub';
import { LineSelectKeyEvent } from '../FmcInteractionEvents';

/**
 * Display field options
 */
export interface DisplayFieldOptions<T> extends FmcComponentOptions {
  /**
   * Formatter object
   */
  formatter: FmcComponentFormatter<T>,

  /** @inheritDoc */
  style?: string | ((value: T | null) => string),

  /** Text shown before the value (can be used for start indentation) */
  prefix?: string,

  /** Text shown after the value (can be used for end indentation) */
  suffix?: string,
}

/**
 * An {@link FmcComponent} for displaying values according to formats
 */
export class DisplayField<T> extends FmcComponent<DisplayFieldOptions<T>> {
  protected value: T | null = null;

  /**
   * Gets the raw value of this display field
   * @returns the value
   */
  protected get rawValue(): T | null {
    return this.value;
  }

  /** @inheritDoc */
  public constructor(page: AbstractFmcPage, protected options: DisplayFieldOptions<T>) {
    super(page, options);
  }

  /**
   * Creates and registers a binding on the page, linking this field with a subscribable
   * @param subscribable the subscribable to bind to
   * @returns the created binding (usually not needed)
   */
  public bind(subscribable: Subscribable<T>): DisplayField<T> {
    this.page.addBinding(subscribable.sub((value) => this.takeValue(value, true), true));
    return this;
  }

  /**
   * Takes an input value, displays it and stores it
   * @param value the new input value
   * @param shouldInvalidate whether or not to invalidate the page
   */
  public takeValue(value: T | null, shouldInvalidate = false): void {
    this.value = value;
    if (shouldInvalidate) {
      this.invalidate();
    }
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async onHandleSelectKey(event: LineSelectKeyEvent): Promise<boolean | string> {
    return false;
  }

  /** @inheritDoc */
  public render(): FmcFormatterOutput {
    let renderOutput: FmcFormatterOutput;
    if (typeof this.options.formatter === 'object') {
      if (this.value !== null) {
        renderOutput = this.options.formatter.format(this.value as NonNullable<T>);
      } else {
        renderOutput = this.options.formatter.nullValueString ?? '';
      }
    } else {
      renderOutput = this.options.formatter(this.value as T);
    }

    if (typeof renderOutput !== 'string') {
      return renderOutput;
    }

    const styleStr = (typeof this.options.style === 'function') ? this.options.style(this.value) : this.options.style;

    return `${this.options.prefix ?? ''}${renderOutput}${this.options.suffix ?? ''}${styleStr ?? ''}`;
  }
}

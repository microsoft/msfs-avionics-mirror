import { Subscribable } from '@microsoft/msfs-sdk';

import { FmcSelectKeysEvent } from '../../FmcEvent';
import { Binding } from '../FmcDataBinding';
import { Formatter } from '../FmcFormats';
import { FmcPage } from '../FmcPage';
import { FmcComponent, FmcComponentOptions } from './FmcComponent';

/**
 * Display field options
 */
export interface DisplayFieldOptions<T> extends FmcComponentOptions {

  /**
   * Formatter object
   */
  formatter: Formatter<T>,

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
export class DisplayField<T, S extends Subscribable<T> = Subscribable<T>> extends FmcComponent<DisplayFieldOptions<T>> {

  protected value: T | null = null;

  /**
   * Gets the raw value of this display field
   * @returns the value
   */
  protected get rawValue(): T | null {
    return this.value;
  }

  /** @inheritDoc */
  public constructor(page: FmcPage, protected options: DisplayFieldOptions<T>) {
    super(page, options);
  }

  // /**
  //  * Creates an {@link DisplayField}
  //  *
  //  * @param page    the parent {@link FmcPage}
  //  * @param options parameters for the display field
  //  *
  //  * @returns the {@link DisplayField}
  //  */
  // public static create<T>(page: FmcPage, options: DisplayFieldOptions<T>): DisplayField<T> {
  //   return new DisplayField<T>(page, options);
  // }

  /**
   * Creates and registers a binding on the page, linking this field with a subscribable
   * @param subscribable the subscribable to bind to
   * @returns the created binding (usually not needed)
   */
  public bind(subscribable: S): DisplayField<T> {
    const binding = new Binding<T>(subscribable, (value) => this.takeValue(value, true));
    this.page.addBinding(binding);
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
  protected async onHandleSelectKey(event: FmcSelectKeysEvent, scratchpadContents: string, isDelete: boolean): Promise<boolean | string> {
    return false;
  }


  /** @inheritDoc */
  public render(): string {
    const renderStr = (this.value !== null) ? this.options.formatter.format(this.value) : this.options.formatter.nullValueString;
    const styleStr = (typeof this.options.style === 'function') ? this.options.style(this.value) : this.options.style;

    return `${this.options.prefix ?? ''}${renderStr}${this.options.suffix ?? ''}${styleStr ?? ''}`;
  }

}

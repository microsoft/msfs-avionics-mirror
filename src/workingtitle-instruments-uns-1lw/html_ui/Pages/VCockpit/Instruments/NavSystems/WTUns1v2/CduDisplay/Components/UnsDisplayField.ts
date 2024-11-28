import { DisplayField, DisplayFieldOptions, MappedSubject, Subject, Subscribable } from '@microsoft/msfs-sdk';

import { UnsFocusableField, UnsFocusableFieldOptions, UnsFocusableFieldUtils } from './UnsFocusableField';
import { UnsFmcPage } from '../UnsFmcPage';
import { UnsFieldState } from './UnsTextInputField';

/**
 * A {@link DisplayField} specific to the UNS-1
 */
export class UnsDisplayField<T> extends DisplayField<UnsFieldState<T>> implements UnsFocusableField<T> {
  public readonly isUnsFocusableField = true;

  public isHighlighted = Subject.create(false);

  /** @inheritDoc */
  constructor(readonly page: UnsFmcPage, readonly options: DisplayFieldOptions<UnsFieldState<T>> & UnsFocusableFieldOptions) {
    super(page, options);

    this.page.addBinding(this.isHighlighted.sub(() => this.invalidate()));
  }

  /**
   * Binds the input field to a subscribable (one-way) while wrapping it into a `Subscribable<UnsFieldState>`
   *
   * @param sub the `Subscribable<T>`
   *
   * @returns the instance of this {@link UnsTextInputField}
   */
  public bindWrappedData(sub: Subscribable<T>): this {
    const mappedSubject = MappedSubject.create(sub, this.isHighlighted);

    this.page.addBinding(mappedSubject);
    this.page.addBinding(mappedSubject.sub((value) => this.takeValue(value, true), true));

    return this;
  }

  /** @inheritDoc */
  public async handleEnter(): Promise<boolean> {
    if (this.options.onEnterPressed) {
      const handleByOptions = await this.options.onEnterPressed();

      if (UnsFocusableFieldUtils.isUnsFocusableField(handleByOptions)) {
        this.page.screen.tryFocusField(handleByOptions);
        return true;
      }

      if (handleByOptions === true) {
        this.page.screen.interruptCursorPath();
        return true;
      }
    }

    return this.onHandleEnter();
  }

  /**
   * Handles an ENTER key received by the component
   *
   * @returns whether the key was handled or not
   */
  protected onHandleEnter(): boolean {
    return false;
  }

  /** @inheritDoc */
  public async handlePlusMinus(): Promise<boolean> {
    if (this.options.onPlusMinusPressed) {
      const handleByOptions = await this.options.onPlusMinusPressed('');

      if (handleByOptions === true) {
        return true;
      }
    }

    return this.onHandlePlusMinus();
  }

  /**
   * Handles a +/- key received by the component
   *
   * @returns whether the key was handled or not
   */
  protected onHandlePlusMinus(): boolean {
    return false;
  }

  /** @inheritDoc */
  public async handleList(): Promise<boolean> {
    if (this.options.onListPressed) {
      const handleByOptions = await this.options.onListPressed();

      if (handleByOptions === true) {
        return true;
      }
    }

    return this.onHandlePlusMinus();
  }


  /**
   * Handles a LIST key received by the component
   *
   * @returns whether the key was handled or not
   */
  protected onHandleList(): boolean {
    return false;
  }

  /**
   * Handles a BACK key received by the component
   *
   * Do NOT override this method - override {@link onHandleBack} instead
   *
   * @returns whether the key was handled or not
   */
  public async handleBack(): Promise<boolean> {
    if (this.options.onBackPressed) {
      const handleByOptions = await this.options.onBackPressed();

      if (handleByOptions === true) {
        return true;
      }
    }

    return this.onHandleBack();
  }

  /**
   * Handles a BACK key received by the component
   *
   * @returns whether the key was handled or not
   */
  protected onHandleBack(): boolean {
    return false;
  }

  /**
   * Lifecycle event called when the field loses focus.
   *
   * Do NOT override this method - override {@link onHandleLoseFocus} instead
   *
   * @returns whether the key was handled or not
   */
  public async handleLoseFocus(): Promise<boolean> {
    if (this.options.onLoseFocus) {
      const handleByOptions = await this.options.onLoseFocus('');

      if (handleByOptions === true) {
        return true;
      }
    }

    return this.onHandleLoseFocus();
  }

  /**
   * Lifecycle event called when the field loses focus.
   *
   * @returns whether the key was handled or not
   */
  protected onHandleLoseFocus(): boolean {
    return false;
  }
}

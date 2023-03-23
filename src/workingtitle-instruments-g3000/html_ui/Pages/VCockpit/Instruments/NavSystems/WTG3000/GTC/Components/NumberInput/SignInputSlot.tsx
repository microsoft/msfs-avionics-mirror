import { ComponentProps, DisplayComponent, FSComponent, SetSubject, Subscribable, SubscribableSet, Subscription, VNode } from '@microsoft/msfs-sdk';
import { GenericCursorInputSlot } from '../CursorInput/CursorInputSlot';

/**
 * Component props for SignInputSlot.
 */
export interface SignInputSlotProps extends ComponentProps {
  /**
   * A function which renders a character value into a string.
   * @param charToRender The character to render.
   */
  renderChar?: (character: string | null) => string;

  /** CSS class(es) to apply to the slot's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * A cursor input slot which allows the user to select a numeric sign, either `+1` or `-1`.
 */
export class SignInputSlot extends DisplayComponent<SignInputSlotProps> {
  private static readonly RESERVED_CSS_CLASSES = ['sign-input-slot'];

  private readonly slotRef = FSComponent.createRef<GenericCursorInputSlot<1 | -1>>();

  private readonly renderChar = this.props.renderChar ?? (
    (character: string | null): string => {
      return character === '-' ? '−' : '+';
    }
  );

  // eslint-disable-next-line jsdoc/require-returns
  /** The value bound to this slot. */
  public get value(): Subscribable<1 | -1> {
    return this.slotRef.instance.value;
  }

  private cssClassSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.slotRef.instance.setValue(1);
  }

  /**
   * Sets the value of this slot.
   * @param value The new value.
   * @returns The value of this slot after the operation is complete.
   */
  public setValue(value: 1 | -1): 1 | -1 {
    return this.slotRef.instance.setValue(value);
  }

  /**
   * Increments this slot's value.
   * @returns Whether the increment operation was accepted.
   */
  public incrementValue(): boolean {
    return this.slotRef.instance.incrementValue();
  }

  /**
   * Decrements this slot's value.
   * @returns Whether the decrement operation was accepted.
   */
  public decrementValue(): boolean {
    return this.slotRef.instance.decrementValue();
  }

  /**
   * Sets the value of one of this slot's characters.
   * @param index The index of the character to set.
   * @param char The value to set.
   * @param force Whether to force the character to accept a value that would normally be invalid. Defaults to `false`.
   * @returns Whether the operation was accepted.
   */
  public setChar(index: number, char: string | null, force?: boolean): boolean {
    return this.slotRef.instance.setChar(index, char, force);
  }

  /** @inheritdoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;

    if (this.props.class !== undefined && typeof this.props.class === 'object') {
      cssClass = SetSubject.create(['sign-input-slot']);
      this.cssClassSub = FSComponent.bindCssClassSet(cssClass, this.props.class, SignInputSlot.RESERVED_CSS_CLASSES);
    } else {
      cssClass = 'sign-input-slot';

      if (this.props.class !== undefined && this.props.class.length > 0) {
        cssClass += ' ' + FSComponent.parseCssClassesFromString(this.props.class, classToAdd => !SignInputSlot.RESERVED_CSS_CLASSES.includes(classToAdd)).join(' ');
      }
    }

    return (
      <GenericCursorInputSlot<1 | -1>
        ref={this.slotRef}
        allowBackfill={false}
        characterCount={1}
        parseValue={(characters): 1 | -1 => characters[0] === '-' ? -1 : 1}
        digitizeValue={(value, setCharacters): void => { setCharacters[0](value === 1 ? '+' : '-'); }}
        renderChar={this.renderChar}
        incrementValue={(value, setValue): boolean => {
          setValue(value * -1 as 1 | -1);
          return true;
        }}
        decrementValue={(value, setValue): boolean => {
          setValue(value * -1 as 1 | -1);
          return true;
        }}
        setChar={(characters, index, charToSet): boolean => {
          switch (charToSet) {
            case '+':
            case '-':
              characters[index].set(charToSet);
              return true;
          }

          return false;
        }}
        canSetChar={(characters, index, charToSet): boolean => charToSet === '+' || charToSet === '-'}
        class={cssClass}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.slotRef.getOrDefault()?.destroy();

    super.destroy();
  }
}
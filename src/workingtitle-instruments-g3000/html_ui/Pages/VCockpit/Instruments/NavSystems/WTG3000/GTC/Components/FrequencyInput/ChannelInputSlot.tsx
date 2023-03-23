import { ComponentProps, DisplayComponent, FSComponent, MutableSubscribable, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { GenericCursorInputSlot } from '../CursorInput/CursorInputSlot';

/**
 * Channel spacing modes supported by {@link ChannelInputSlot}.
 */
export enum ChannelSpacing {
  Spacing50Khz = '50Khz',
  Spacing25Khz = '25Khz',
  Spacing8_33Khz = '8.33Khz',
  Spacing500Hz = '500Hz'
}

/**
 * Component props for ChannelInputSlot.
 */
export interface ChannelInputSlotProps extends ComponentProps {
  /** The channel spacing supported by the slot. */
  spacing: ChannelSpacing;
}

/**
 * A cursor input slot which allows the user to select a radio frequency channel.
 */
export class ChannelInputSlot extends DisplayComponent<ChannelInputSlotProps> {
  private static readonly SPACING = {
    [ChannelSpacing.Spacing50Khz]: 5e4,
    [ChannelSpacing.Spacing25Khz]: 2.5e4,
    [ChannelSpacing.Spacing8_33Khz]: 8330,
    [ChannelSpacing.Spacing500Hz]: 500
  };

  private static readonly COM_833_BASE_CHAR_ARRAY = ['00', '05', '10', '15', '25', '30', '35', '40', '50', '55', '60', '65', '75', '80', '85', '90'];

  private static readonly CHAR_ARRAYS = {
    [ChannelSpacing.Spacing50Khz]: Array.from({ length: 20 }, (v, index) => (index * 5).toFixed(0).padStart(2, '0')),
    [ChannelSpacing.Spacing25Khz]: Array.from({ length: 40 }, (v, index) => Math.floor(index * 2.5).toFixed(0).padStart(2, '0')),
    [ChannelSpacing.Spacing8_33Khz]: [
      ...ChannelInputSlot.COM_833_BASE_CHAR_ARRAY.map(str => `0${str}`),
      ...ChannelInputSlot.COM_833_BASE_CHAR_ARRAY.map(str => `1${str}`),
      ...ChannelInputSlot.COM_833_BASE_CHAR_ARRAY.map(str => `2${str}`),
      ...ChannelInputSlot.COM_833_BASE_CHAR_ARRAY.map(str => `3${str}`),
      ...ChannelInputSlot.COM_833_BASE_CHAR_ARRAY.map(str => `4${str}`),
      ...ChannelInputSlot.COM_833_BASE_CHAR_ARRAY.map(str => `5${str}`),
      ...ChannelInputSlot.COM_833_BASE_CHAR_ARRAY.map(str => `6${str}`),
      ...ChannelInputSlot.COM_833_BASE_CHAR_ARRAY.map(str => `7${str}`),
      ...ChannelInputSlot.COM_833_BASE_CHAR_ARRAY.map(str => `8${str}`),
      ...ChannelInputSlot.COM_833_BASE_CHAR_ARRAY.map(str => `9${str}`),
    ],
    [ChannelSpacing.Spacing500Hz]: ['0', '5']
  };

  private static readonly COM_833_BASE_FREQ_ARRAY = [0, 5000, 10000, 15000, 25000, 30000, 35000, 40000, 50000, 55000, 60000, 65000, 75000, 80000, 85000, 90000];

  private static readonly FREQ_ARRAYS = {
    [ChannelSpacing.Spacing50Khz]: Array.from({ length: 20 }, (v, index) => index * 5e4),
    [ChannelSpacing.Spacing25Khz]: Array.from({ length: 40 }, (v, index) => index * 2.5e4),
    [ChannelSpacing.Spacing8_33Khz]: [
      ...ChannelInputSlot.COM_833_BASE_FREQ_ARRAY,
      ...ChannelInputSlot.COM_833_BASE_FREQ_ARRAY.map(freq => freq + 1e5),
      ...ChannelInputSlot.COM_833_BASE_FREQ_ARRAY.map(freq => freq + 2e5),
      ...ChannelInputSlot.COM_833_BASE_FREQ_ARRAY.map(freq => freq + 3e5),
      ...ChannelInputSlot.COM_833_BASE_FREQ_ARRAY.map(freq => freq + 4e5),
      ...ChannelInputSlot.COM_833_BASE_FREQ_ARRAY.map(freq => freq + 5e5),
      ...ChannelInputSlot.COM_833_BASE_FREQ_ARRAY.map(freq => freq + 6e5),
      ...ChannelInputSlot.COM_833_BASE_FREQ_ARRAY.map(freq => freq + 7e5),
      ...ChannelInputSlot.COM_833_BASE_FREQ_ARRAY.map(freq => freq + 8e5),
      ...ChannelInputSlot.COM_833_BASE_FREQ_ARRAY.map(freq => freq + 9e5),
    ],
    [ChannelSpacing.Spacing500Hz]: [0, 500]
  };

  private readonly slotRef = FSComponent.createRef<GenericCursorInputSlot<number>>();

  private readonly characterCount = this.props.spacing === ChannelSpacing.Spacing500Hz ? 1 : this.props.spacing === ChannelSpacing.Spacing8_33Khz ? 3 : 2;

  private readonly spacing = ChannelInputSlot.SPACING[this.props.spacing];
  private readonly charArray = ChannelInputSlot.CHAR_ARRAYS[this.props.spacing];
  private readonly freqArray = ChannelInputSlot.FREQ_ARRAYS[this.props.spacing];

  /** The number of unique channels supported by this slot. */
  public readonly channelCount = this.charArray.length;

  // eslint-disable-next-line jsdoc/require-returns
  /** This slot's channel value. */
  public get value(): Subscribable<number> {
    return this.slotRef.instance.value;
  }

  private readonly _frequency = Subject.create(0);
  /** The frequency associated with this slot's channel value. */
  public readonly frequency = this._frequency as Subscribable<number>;

  /** @inheritdoc */
  public onAfterRender(): void {
    if (this.props.spacing === ChannelSpacing.Spacing8_33Khz) {
      // Make sure the default value of the third character is always up to date.

      let lastSecondCharValue: string | null = null;

      this.slotRef.instance.characters.sub(([, second]) => {
        // refreshFromChars triggers a notify on .characters, so we need to do our own equality check to break the loop
        if (second !== lastSecondCharValue) {
          lastSecondCharValue = second;
          this.slotRef.instance.refreshFromChars();
        }
      });
    }

    this.value.pipe(this._frequency, channel => this.freqArray[channel] ?? 0);
  }

  /**
   * Sets the frequency value of this slot. As part of the operation, all of this slot's characters will be set to
   * non-null representations of the new slot value, if possible. The frequency value of this slot after the operation
   * is complete may differ from the requested value depending on whether the requested value can be accurately
   * represented by this slot.
   * @param freq The new frequency value, in hertz.
   * @returns The frequency value of this slot after the operation is complete.
   */
  public setFrequency(freq: number): number {
    // Find the channel with the closest frequency to the new one
    let minDelta = Infinity;
    let channel = -1;
    for (let i = 0; i < this.freqArray.length; i++) {
      const delta = Math.abs(freq - this.freqArray[i]);
      if (delta < minDelta) {
        channel = i;
        minDelta = delta;
      }
    }

    this.slotRef.instance.setValue(Math.max(0, channel));

    return this._frequency.get();
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

  /**
   * Populates all of this slot's characters with non-empty values, if possible, using this slot's current value as a
   * template.
   */
  public populateCharsFromValue(): void {
    this.slotRef.getOrDefault()?.populateCharsFromValue();
  }

  /**
   * Changes this slot's value by a specified amount.
   * @param value This slot's value.
   * @param delta The amount by which to change the value.
   * @param setValue A function which sets this slot's value.
   * @returns Whether the value was successfully changed.
   */
  private changeValue(value: number, delta: number, setValue: (value: number) => void): boolean {
    const min = 0;
    const max = this.charArray.length;

    let newValue = Math.round(value);
    let needChange = true;

    // If value is already out of bounds, clamp to min/max, then only increment if delta would take it out of bounds
    // again.
    if (newValue < min) {
      newValue = min;
      needChange = delta < 0;
    } else if (newValue >= max) {
      newValue = Math.ceil(max) - 1;
      needChange = delta > 0;
    }

    if (needChange) {
      const mod = max - min;
      newValue = ((newValue - min + delta) % mod + mod) % mod + min;
    }

    setValue(newValue);

    return true;
  }

  /**
   * Sets the value of one of this slot's characters.
   * @param characters An array of characters.
   * @param index The index of the character to set.
   * @param charToSet The value to set.
   * @param force Whether to force the character to accept a value that would normally be invalid. Defaults to `false`.
   * @returns Whether the operation was accepted.
   */
  private _setChar(characters: readonly MutableSubscribable<string | null>[], index: number, charToSet: string | null, force?: boolean): boolean {
    if (this.canSetChar(characters.map(char => char.get()), index, charToSet, force ?? false)) {
      characters[index].set(charToSet);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Checks whether one of this slot's characters can be set to a given value.
   * @param characters This slot's current character values.
   * @param index The index of the character to set.
   * @param character The value to set.
   * @param force Whether the character should accept a value that would normally be invalid.
   * @returns Whether the specified character can be set to the specified value.
   */
  private canSetChar(characters: readonly (string | null)[], index: number, character: string | null, force: boolean): boolean {
    if (character === null) {
      return true;
    }

    const parsed = Number(character);

    if (!Number.isInteger(parsed)) {
      return false;
    }

    if (force) {
      return true;
    }

    switch (this.props.spacing) {
      case ChannelSpacing.Spacing50Khz:
        return index === 0 || parsed % 5 === 0;
      case ChannelSpacing.Spacing25Khz:
        return index === 0 || (parsed % 5) === 0 || (parsed % 5) === 2;
      case ChannelSpacing.Spacing8_33Khz:
        if (index < 2) {
          return true;
        } else {
          switch (characters[1] ?? '0') {
            case '2':
            case '7':
              return parsed === 5;
            case '4':
            case '9':
              return parsed === 0;
            default:
              return true;
          }
        }
      case ChannelSpacing.Spacing500Hz:
        return parsed % 5 === 0;
    }
  }

  /**
   * Parses a channel value from individual character values.
   * @param characters An array of character values.
   * @returns The channel value parsed from the specified characters.
   */
  private parseValue(characters: readonly (string | null)[]): number {
    let charString = '';
    for (let i = 0; i < characters.length; i++) {
      charString += characters[i] ?? this.getDefaultCharValue(characters, i).toFixed(0);
    }

    const value = this.charArray.indexOf(charString);

    return Math.max(0, value);
  }

  /**
   * Assigns values to individual characters from a channel value.
   * @param value A channel value.
   * @param setCharacters An array of functions which set this slot's character values. Each function is indexed
   * according to its associated character.
   */
  private digitizeValue(value: number, setCharacters: readonly ((char: string | null) => void)[]): void {
    const charString = this.charArray[value];

    if (charString === undefined) {
      for (let i = 0; i < setCharacters.length; i++) {
        setCharacters[i]('0');
      }
    } else {
      for (let i = 0; i < setCharacters.length; i++) {
        setCharacters[i](charString.charAt(i));
      }
    }
  }

  /**
   * Renders one of this slot's character value into a string.
   * @param charToRender The character to render.
   * @param index The index of the character to render.
   * @param characters An array of this slot's characters.
   * @returns The rendered character.
   */
  private renderChar(charToRender: string | null, index: number, characters: readonly (string | null)[]): string {
    if (charToRender === null) {
      return this.getDefaultCharValue(characters, index).toFixed(0);
    } else {
      return charToRender;
    }
  }

  /**
   * Gets the default numeric value of one of this slot's characters.
   * @param characters An array of this slot's characters.
   * @param index The index of the character to query.
   * @returns The default numeric value of the specified character.
   */
  private getDefaultCharValue(characters: readonly (string | null)[], index: number): number {
    // The only characters that could be constrained to anything other than zero is the last character in
    // 8.33KHz spacing mode

    if (this.props.spacing === ChannelSpacing.Spacing8_33Khz && index === 2) {
      switch (characters[1] ?? '0') {
        case '2':
        case '7':
          return 5;
        default:
          return 0;
      }
    } else {
      return 0;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <GenericCursorInputSlot<number>
        ref={this.slotRef}
        allowBackfill={false}
        characterCount={this.characterCount}
        parseValue={this.parseValue.bind(this)}
        digitizeValue={this.digitizeValue.bind(this)}
        renderChar={this.renderChar.bind(this)}
        incrementValue={(value, setValue): boolean => this.changeValue(value, 1, setValue)}
        decrementValue={(value, setValue): boolean => this.changeValue(value, -1, setValue)}
        setChar={this._setChar.bind(this)}
        canSetChar={(characters, index, charToSet, force): boolean => this.canSetChar(characters, index, charToSet, force)}
        class='channel-input-slot'
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.slotRef.getOrDefault()?.destroy();

    super.destroy();
  }
}
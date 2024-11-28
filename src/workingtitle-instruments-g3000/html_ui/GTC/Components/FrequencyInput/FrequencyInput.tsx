/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ComponentProps, DisplayComponent, FSComponent, MappedSubject, MappedSubscribable, MathUtils, MutableSubscribable,
  RadioType, SetSubject, Subject, Subscribable, SubscribableSet, Subscription, VNode
} from '@microsoft/msfs-sdk';
import { GtcInteractionEvent, GtcInteractionHandler } from '../../GtcService/GtcInteractionEvent';
import { CursorInput } from '../CursorInput/CursorInput';
import { DigitInputSlot } from '../NumberInput/DigitInputSlot';
import { ChannelInputSlot, ChannelSpacing } from './ChannelInputSlot';

import './FrequencyInput.css';

/**
 * Component props for FrequencyInput.
 */
export interface FrequencyInputProps extends ComponentProps {
  /**
   * The radio type supported by the input. This determines the range of frequencies and the frequency spacing accepted
   * by the input as follows:
   * * NAV: 108.00 to 117.95 Mhz, 50 Khz spacing.
   * * COM: 118.00 to 136.99 Mhz, 25 or 8.33 Khz spacing.
   * * ADF: 190.0 to 1799.5 Khz, 0.5 Khz spacing.
   */
  radioType: RadioType;

  /** The COM channel spacing to use. Ignored if `radioType` is not `RadioType.Com`. Defaults to 25 Khz. */
  comChannelSpacing?: ChannelSpacing.Spacing25Khz | ChannelSpacing.Spacing8_33Khz;

  /**
   * A mutable subscribable to bind to the input's frequency value. The binding is one-way: changes in the input value
   * will be piped to the subscribable, but changes in the subscribable's value will not trigger any changes to the
   * input.
   */
  frequency: MutableSubscribable<number>;

  /** CSS class(es) to apply to the root of the component. */
  class?: string | SubscribableSet<string>;
}

/**
 * An input with a scrolling cursor which allows users to select a radio frequency.
 */
export class FrequencyInput extends DisplayComponent<FrequencyInputProps> implements GtcInteractionHandler {
  private static readonly DEFAULT_ZERO = [0];
  private static readonly DEFAULT_ONE = [1];
  private static readonly DEFAULT_EIGHT = [8];
  private static readonly DEFAULT_NINE = [9];

  private static readonly PRECISION = {
    [RadioType.Nav]: 1e4,
    [RadioType.Com]: 1e3,
    [RadioType.Adf]: 1e2
  };

  private static readonly BASE_FREQ_PARAMS = {
    [RadioType.Nav]: {
      min: 108e6,
      max: 118e6,
      increment: 1e6,
      maxDigitFactor: 1e8,
      minDigitFactor: 1e6
    },
    [RadioType.Com]: {
      min: 118e6,
      max: 137e6,
      increment: 1e6,
      maxDigitFactor: 1e8,
      minDigitFactor: 1e6
    },
    [RadioType.Adf]: {
      min: 190e3,
      max: 1800e3,
      increment: 1e3,
      maxDigitFactor: 1e6,
      minDigitFactor: 1e3
    }
  };

  private readonly inputRef = FSComponent.createRef<CursorInput<Subject<number>>>();
  private readonly channelSlotRef = FSComponent.createRef<ChannelInputSlot>();

  private readonly comHundredMhzSlotRef = FSComponent.createRef<DigitInputSlot>();
  private readonly comHundredMhzSlotCssClass = SetSubject.create<string>();

  private readonly navComTenMhzSlotRef = FSComponent.createRef<DigitInputSlot>();
  private readonly adfOneMhzSlotRef = FSComponent.createRef<DigitInputSlot>();
  private readonly adfHundredKhzSlotRef = FSComponent.createRef<DigitInputSlot>();

  private readonly navComOneMhzSlotMin = Subject.create(0);
  private readonly navComOneMhzSlotMax = Subject.create(9);
  private readonly navComOneMhzSlotDefault = Subject.create<readonly number[]>(FrequencyInput.DEFAULT_EIGHT);

  private readonly adfHundredKhzSlotMin = Subject.create(0);
  private readonly adfHundredKhzSlotMax = Subject.create(9);
  private readonly adfHundredKhzSlotDefault = Subject.create<readonly number[]>(FrequencyInput.DEFAULT_ONE);

  private readonly adfTenKhzSlotMin = Subject.create(0);
  private readonly adfTenKhzSlotMax = Subject.create(9);
  private readonly adfTenKhzSlotDefault = Subject.create<readonly number[]>(FrequencyInput.DEFAULT_NINE);

  private readonly precision = FrequencyInput.PRECISION[this.props.radioType];
  private readonly baseFreqParams = FrequencyInput.BASE_FREQ_PARAMS[this.props.radioType];
  private readonly digitSlots: DigitInputSlot[] = [];

  /**
   * The base frequency value represented by this input's digit slots. The base frequency value is the truncated
   * megahertz component of the frequency for nav and com radios, and the truncated kilohertz component for ADF radios.
   */
  private readonly inputBaseValue = Subject.create(
    this.props.radioType === RadioType.Nav
      ? 108
      : this.props.radioType === RadioType.Com
        ? 118
        : 850
  );

  private frequency?: MappedSubscribable<number>;

  private freqPipeOut?: Subscription;

  // eslint-disable-next-line jsdoc/require-returns
  /** The index of the character position currently selected by this input's cursor. */
  public get cursorPosition(): Subscribable<number> {
    return this.inputRef.instance.cursorPosition;
  }

  // eslint-disable-next-line jsdoc/require-returns
  /** Whether editing is active for this input. */
  public get isEditingActive(): Subscribable<boolean> {
    return this.inputRef.instance.isEditingActive;
  }

  // eslint-disable-next-line jsdoc/require-returns
  /** Whether this input's cursor selection mode is per-slot. */
  public get isSelectionPerSlot(): Subscribable<boolean> {
    return this.inputRef.instance.isSelectionPerSlot;
  }

  private comAutoShiftArmed = false;

  private isInit = false;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    // Collect all digit slots
    FSComponent.visitNodes(thisNode, node => {
      if (node.instance instanceof DigitInputSlot) {
        this.digitSlots.push(node.instance);
        return true;
      }

      return false;
    });

    // Make sure digit min/max and defaults are always in the correct state
    switch (this.props.radioType) {
      case RadioType.Nav:
        this.navComTenMhzSlotRef.instance.value.sub(value => {
          if (value === 0) {
            this.navComOneMhzSlotMin.set(8);
            this.navComOneMhzSlotMax.set(9);
            this.navComOneMhzSlotDefault.set(FrequencyInput.DEFAULT_EIGHT);
          } else {
            this.navComOneMhzSlotMin.set(0);
            this.navComOneMhzSlotMax.set(7);
            this.navComOneMhzSlotDefault.set(FrequencyInput.DEFAULT_ZERO);
          }
        }, true);
        break;
      case RadioType.Com:
        this.navComTenMhzSlotRef.instance.value.sub(value => {
          if (value === 1e7) {
            this.navComOneMhzSlotMin.set(8);
            this.navComOneMhzSlotMax.set(9);
            this.navComOneMhzSlotDefault.set(FrequencyInput.DEFAULT_EIGHT);
          } else if (value === 3e7) {
            this.navComOneMhzSlotMin.set(0);
            this.navComOneMhzSlotMax.set(6);
            this.navComOneMhzSlotDefault.set(FrequencyInput.DEFAULT_ZERO);
          } else {
            this.navComOneMhzSlotMin.set(0);
            this.navComOneMhzSlotMax.set(9);
            this.navComOneMhzSlotDefault.set(FrequencyInput.DEFAULT_ZERO);
          }
        }, true);
        break;
      case RadioType.Adf: {
        const hundredSlotSub = this.adfHundredKhzSlotRef.instance.value.sub(value => {
          if (value === 1e5) {
            this.adfTenKhzSlotMin.set(9);
            this.adfTenKhzSlotMax.set(9);
            this.adfTenKhzSlotDefault.set(FrequencyInput.DEFAULT_NINE);
          } else {
            this.adfTenKhzSlotMin.set(0);
            this.adfTenKhzSlotMax.set(9);
            this.adfTenKhzSlotDefault.set(FrequencyInput.DEFAULT_ZERO);
          }
        }, false, true);

        this.adfOneMhzSlotRef.instance.value.sub(value => {
          if (value === 0) {
            this.adfHundredKhzSlotMin.set(1);
            this.adfHundredKhzSlotMax.set(9);
            this.adfHundredKhzSlotDefault.set(FrequencyInput.DEFAULT_ONE);

            hundredSlotSub.resume(true);
          } else {
            hundredSlotSub.pause();

            this.adfHundredKhzSlotMin.set(0);
            this.adfHundredKhzSlotMax.set(7);
            this.adfHundredKhzSlotDefault.set(FrequencyInput.DEFAULT_ZERO);

            this.adfTenKhzSlotMin.set(0);
            this.adfTenKhzSlotMax.set(9);
            this.adfTenKhzSlotDefault.set(FrequencyInput.DEFAULT_ZERO);
          }
        }, true);
        break;
      }
    }

    this.frequency = MappedSubject.create(
      ([baseFreq, channelFreq]): number => {
        return baseFreq + channelFreq;
      },
      this.inputBaseValue,
      this.channelSlotRef.instance.frequency
    );

    this.freqPipeOut = this.frequency.pipe(this.props.frequency);

    this.isInit = true;
  }

  /**
   * Checks whether this input is initialized.
   * @returns Whether this input is initialized.
   */
  public isInitialized(): boolean {
    return this.isInit;
  }

  /**
   * Sets the frequency value of this slot. As part of the operation, all of this slot's characters will be set to
   * non-null representations of the new slot value, if possible. The frequency value of this slot after the operation
   * is complete may differ from the requested value depending on whether the requested value can be accurately
   * represented by this slot.
   * @param freq The new frequency value, in hertz.
   * @returns The frequency value of this input after the operation is complete.
   * @throws Error if this input is not initialized.
   */
  public setFrequency(freq: number): number {
    if (!this.isInitialized()) {
      throw new Error('FrequencyInput: attempted to manipulate input before it was initialized');
    }

    // Round the frequency to an appropriate precision to guard against floating point errors.
    const rounded = MathUtils.round(freq, this.precision);

    const baseFreq = MathUtils.clamp(
      Math.floor(rounded / this.baseFreqParams.minDigitFactor) * this.baseFreqParams.minDigitFactor,
      this.baseFreqParams.min,
      this.baseFreqParams.max
    );
    const channelFreq = MathUtils.clamp(rounded - baseFreq, 0, this.baseFreqParams.minDigitFactor);

    this.inputRef.instance.setValue(baseFreq);
    this.channelSlotRef.instance.setFrequency(channelFreq);

    return this.frequency!.get();
  }

  /**
   * Activates editing for this input.
   * @param isSelectionPerSlot Whether cursor selection should be initialized to per-slot mode. If `false`, cursor
   * selection will be initialized to per-character mode instead.
   * @throws Error if this input is not initialized.
   */
  public activateEditing(isSelectionPerSlot: boolean): void {
    if (!this.isInitialized()) {
      throw new Error('FrequencyInput: attempted to manipulate input before it was initialized');
    }

    this.disarmComAutoShift();

    this.inputRef.instance.activateEditing(isSelectionPerSlot);
  }

  /**
   * Deactivates editing for this input.
   * @throws Error if this input is not initialized.
   */
  public deactivateEditing(): void {
    if (!this.isInitialized()) {
      throw new Error('FrequencyInput: attempted to manipulate input before it was initialized');
    }

    this.disarmComAutoShift();

    this.inputRef.instance.deactivateEditing();
  }

  /**
   * Moves the cursor.
   * @param direction The direction in which to move (`1` = to the right, `-1` = to the left).
   * @param forceSelectionPerSlot Whether to force cursor selection to per slot mode.
   * @throws Error if this input is not initialized.
   */
  public moveCursor(direction: 1 | -1, forceSelectionPerSlot: boolean): void {
    if (!this.isInitialized()) {
      throw new Error('FrequencyInput: attempted to manipulate input before it was initialized');
    }

    this.disarmComAutoShift();

    this.inputRef.instance.moveCursor(direction, forceSelectionPerSlot);
  }

  /**
   * Increments or decrements the value of the slot currently selected by the cursor. If editing is not active, it
   * will be activated instead of changing any slot value. If cursor selection is in per-character mode, it will be
   * forced to per-slot mode. If the cursor is past the last slot, this method does nothing.
   * @param direction The direction in which to change the slot value (`1` = increment, `-1` = decrement).
   * @throws Error if this input is not initialized.
   */
  public changeSlotValue(direction: 1 | -1): void {
    if (!this.isInitialized()) {
      throw new Error('FrequencyInput: attempted to manipulate input before it was initialized');
    }

    this.disarmComAutoShift();

    this.inputRef.instance.changeSlotValue(direction);
  }

  /**
   * Sets the value of the slot character currently selected by the cursor. If editing is not active, it will be
   * activated before setting the value. If cursor selection is in per-slot mode, it will be forced to per-character
   * mode, and the first character of the slot will be selected before setting the value. If the cursor is past the
   * last slot, this method does nothing.
   * @param value The value to set.
   * @throws Error if this input is not initialized.
   */
  public setSlotCharacterValue(value: string): void {
    if (!this.isInitialized()) {
      throw new Error('FrequencyInput: attempted to manipulate input before it was initialized');
    }

    // If this is a COM frequency input, we need to evaluate for COM auto-shift logic, which allows users to enter
    // 11x. COM frequencies with or without explicitly entering the leading 1 in the hundred Mhz slot.

    let didComAutoShiftArm = false;

    if (this.props.radioType === RadioType.Com) {
      if (!this.inputRef.instance.isEditingActive.get()) {
        // The user is entering the first digit -> if it is a '1', then arm auto-shift, otherwise disarm it.
        if (value === '1') {
          this.armComAutoShift();
          didComAutoShiftArm = true;
        } else {
          this.disarmComAutoShift();
        }
      } else if (this.inputRef.instance.isEditingActive.get() && this.comAutoShiftArmed) {
        // Autoshift is armed -> currently the hundred Mhz slot has a value of null (defaulting to '1'), the ten Mhz
        // slot has a value of '1', and the cursor is at the ten Mhz slot. The only valid digits the user can enter are
        // '1', '2', '3', '8', and '9'.

        // If the entered digit is not one of these, it will be rejected, so we will do nothing.

        // If the entered digit is '8' or '9' -> assume the user wished to skip the leading 1, so populate the first
        // two digits with '1'-'1', and let the entered digit fall into the one Mhz slot.

        // If the entered digit is '1', '2', or '3' -> assume the user did not wish to skip the leading 1, so "shift"
        // the '1' that is currently in the ten Mhz slot to the hundred Mhz slot, and let the entered digit fall into
        // the ten Mhz slot.

        if (value === '8' || value === '9') {
          this.disarmComAutoShift();
          this.inputRef.instance.placeCursor(0, false);
          this.inputRef.instance.setSlotCharacterValue('1');
          this.inputRef.instance.setSlotCharacterValue('1');
        } else if (value === '1' || value === '2' || value === '3') {
          this.disarmComAutoShift();
          this.inputRef.instance.placeCursor(0, false);
          this.inputRef.instance.setSlotCharacterValue('1');
        }
      }
    }

    this.inputRef.instance.setSlotCharacterValue(value);

    // If COM auto-shift was armed, we need to set the hundred Mhz slot value to null and place the cursor back at the
    // ten Mhz slot.
    if (didComAutoShiftArm) {
      this.comHundredMhzSlotRef.instance.setChar(0, null);
      this.inputRef.instance.placeCursor(1, false);
    }
  }

  /**
   * Removes the character at the cursor's current position. If backfill is allowed, this will also shift all non-empty
   * characters to the left of the cursor's current position one position to the right. If backfill is not allowed,
   * this will shift the cursor one position to the left after the character is removed.
   * @throws Error if this input is not initialized.
   */
  public backspace(): void {
    if (!this.isInitialized()) {
      throw new Error('FrequencyInput: attempted to manipulate input before it was initialized');
    }

    this.disarmComAutoShift();

    this.inputRef.instance.backspace();
  }

  /**
   * Populates all of this input's character positions with non-empty values, if possible, using this input's value
   * digitizer function and the current composite value as a template.
   */
  public populateCharsFromValue(): void {
    this.inputRef.getOrDefault()?.populateCharsFromValue();
    this.channelSlotRef.getOrDefault()?.populateCharsFromValue();
  }

  /**
   * Refreshes this input, updating the size and position of the cursor.
   */
  public refresh(): void {
    this.inputRef.getOrDefault()?.refresh();
  }

  /**
   * Arms this input's COM auto-shift function. When armed, and the user attempts to enter a '1', '2', '3' after
   * entering a '1' into the ten Mhz slot, the digit will be entered into the ten Mhz slot instead of the one Mhz
   * slot.
   */
  private armComAutoShift(): void {
    this.comAutoShiftArmed = true;
    this.comHundredMhzSlotCssClass.add('freq-input-com-100-blink');
  }

  /**
   * Disarm's this input's COM auto-shift function.
   */
  private disarmComAutoShift(): void {
    this.comAutoShiftArmed = false;
    this.comHundredMhzSlotCssClass.delete('freq-input-com-100-blink');
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    switch (event) {
      case GtcInteractionEvent.InnerKnobInc:
        this.deactivateEditing();
        this.populateCharsFromValue();
        this.channelSlotRef.instance.incrementValue();
        return true;
      case GtcInteractionEvent.InnerKnobDec:
        this.deactivateEditing();
        this.populateCharsFromValue();
        this.channelSlotRef.instance.decrementValue();
        return true;
      case GtcInteractionEvent.OuterKnobInc:
        this.deactivateEditing();
        this.populateCharsFromValue();
        this.changeBaseFreqValue(this.baseFreqParams.increment);
        return true;
      case GtcInteractionEvent.OuterKnobDec:
        this.deactivateEditing();
        this.populateCharsFromValue();
        this.changeBaseFreqValue(-this.baseFreqParams.increment);
        return true;
      default:
        return false;
    }
  }

  /**
   * Changes this input's base frequency value by a specified amount.
   * @param delta The amount by which to change the value.
   */
  private changeBaseFreqValue(delta: number): void {
    const old = this.inputBaseValue.get();

    const min = this.baseFreqParams.min;
    const max = this.baseFreqParams.max;

    let newValue = old;
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

    this.inputRef.instance.setValue(newValue);
  }

  /**
   * Parses a base frequency value from this input's individual digit slots.
   * @param slotValues The values of this input's individual input slots.
   * @returns The base frequency value represented by this input's digit slots.
   */
  private parseValue(slotValues: readonly number[]): number {
    // Skip the last slot value, which is always the channel input slot.
    return slotValues.reduce((prev, curr, index) => prev + (index === slotValues.length - 1 ? 0 : curr), 0);
  }

  /**
   * Digitizes a base frequency value into individual values to assign to this input's digit slots.
   * @param value The value to digitize.
   */
  private digitizeValue(value: number): void {
    let digitFactor = this.baseFreqParams.maxDigitFactor;
    let freq = MathUtils.clamp(value, 0, digitFactor * 10 - 1);
    for (let i = 0; i < this.digitSlots.length; i++) {
      const digit = this.digitSlots[i];

      const digitValue = Math.floor(freq / digitFactor) * digitFactor;
      digit.setValue(digitValue);

      freq -= digitValue;
      digitFactor /= 10;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <CursorInput<Subject<number>>
        ref={this.inputRef}
        value={this.inputBaseValue}
        parseValue={this.parseValue.bind(this)}
        digitizeValue={this.digitizeValue.bind(this)}
        allowBackFill={false}
        initialEditIndex={this.props.radioType === RadioType.Com ? 1 : undefined}
        class={this.props.class}
      >
        {this.renderSlots()}
      </CursorInput>
    );
  }

  /**
   * Renders this input's slots.
   * @returns This input's slots, as a VNode.
   */
  private renderSlots(): VNode {
    switch (this.props.radioType) {
      case RadioType.Nav:
        return this.renderNavSlots();
      case RadioType.Com:
        return this.renderComSlots();
      case RadioType.Adf:
        return this.renderAdfSlots();
    }
  }

  /**
   * Renders slots for nav radio frequencies.
   * @returns Slots for nav radio frequencies, as a VNode.
   */
  private renderNavSlots(): VNode {
    return (
      <>
        <DigitInputSlot
          characterCount={1}
          minValue={1}
          maxValue={1}
          wrap={false}
          increment={0}
          scale={1e8}
          defaultCharValues={[1]}
        />
        <DigitInputSlot
          ref={this.navComTenMhzSlotRef}
          characterCount={1}
          minValue={0}
          maxValue={1}
          wrap={false}
          increment={1}
          scale={1e7}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={this.navComOneMhzSlotMin}
          maxValue={this.navComOneMhzSlotMax}
          wrap={false}
          increment={1}
          scale={1e6}
          defaultCharValues={this.navComOneMhzSlotDefault}
        />
        <div>.</div>
        <ChannelInputSlot
          ref={this.channelSlotRef}
          spacing={ChannelSpacing.Spacing50Khz}
        />
      </>
    );
  }

  /**
   * Renders slots for com radio frequencies.
   * @returns Slots for com radio frequencies, as a VNode.
   */
  private renderComSlots(): VNode {
    return (
      <>
        <DigitInputSlot
          ref={this.comHundredMhzSlotRef}
          characterCount={1}
          minValue={1}
          maxValue={1}
          wrap={false}
          increment={0}
          scale={1e8}
          defaultCharValues={[1]}
          class={this.comHundredMhzSlotCssClass}
        />
        <DigitInputSlot
          ref={this.navComTenMhzSlotRef}
          characterCount={1}
          minValue={1}
          maxValue={3}
          wrap={false}
          increment={1}
          scale={1e7}
          defaultCharValues={[1]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={this.navComOneMhzSlotMin}
          maxValue={this.navComOneMhzSlotMax}
          wrap={false}
          increment={1}
          scale={1e6}
          defaultCharValues={this.navComOneMhzSlotDefault}
        />
        <div>.</div>
        <ChannelInputSlot
          ref={this.channelSlotRef}
          spacing={this.props.comChannelSpacing ?? ChannelSpacing.Spacing25Khz}
        />
      </>
    );
  }

  /**
   * Renders slots for ADF radio frequencies.
   * @returns Slots for ADF radio frequencies, as a VNode.
   */
  private renderAdfSlots(): VNode {
    return (
      <>
        <DigitInputSlot
          ref={this.adfOneMhzSlotRef}
          characterCount={1}
          minValue={0}
          maxValue={1}
          wrap={false}
          increment={0}
          scale={1e6}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          ref={this.adfHundredKhzSlotRef}
          characterCount={1}
          minValue={this.adfHundredKhzSlotMin}
          maxValue={this.adfHundredKhzSlotMax}
          wrap={false}
          increment={1}
          scale={1e5}
          defaultCharValues={this.adfHundredKhzSlotDefault}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={this.adfTenKhzSlotMin}
          maxValue={this.adfTenKhzSlotMax}
          wrap={false}
          increment={1}
          scale={1e4}
          defaultCharValues={this.adfTenKhzSlotDefault}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={9}
          wrap={false}
          increment={1}
          scale={1e3}
          defaultCharValues={[0]}
        />
        <div>.</div>
        <ChannelInputSlot
          ref={this.channelSlotRef}
          spacing={ChannelSpacing.Spacing500Hz}
        />
      </>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.inputRef.getOrDefault()?.destroy();

    this.freqPipeOut?.destroy();

    super.destroy();
  }
}
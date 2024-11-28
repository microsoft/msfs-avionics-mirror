import {
  ComponentProps, DisplayComponent, FSComponent, LatLonInterface, MutableSubscribable,
  SetSubject,
  Subject, Subscribable, SubscribableSet, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { LatLonDisplay, LatLonDisplayFormat } from '@microsoft/msfs-garminsdk';

import { CursorInput } from '../CursorInput/CursorInput';
import { SignInputSlot } from '../NumberInput';
import { DigitInputSlot } from '../NumberInput/DigitInputSlot';

import './LatLonInput.css';

/**
 * Display formats for {@link LatLonInput} supported by the G3000.
 */
export type G3000LatLonDisplayFormat = LatLonDisplayFormat.HDDD_MMmm | LatLonDisplayFormat.HDDD_MM_SSs;

/**
 * Component props for LatLonInput.
 */
export interface LatLonInputProps extends ComponentProps {
  /** The format supported by the input. */
  format: G3000LatLonDisplayFormat;

  /**
   * A mutable subscribable to bind to the input's latitude/longitude value. The binding is one-way: changes in the
   * input value will be piped to the subscribable, but changes in the subscribable's value will not trigger any
   * changes to the input.
   */
  latLon: MutableSubscribable<LatLonInterface>;

  /** CSS class(es) to apply to the root of the component. */
  class?: string | SubscribableSet<string>;
}

/**
 * An input with a scrolling cursor which allows users to select a set of latitude/longitude coordinates.
 */
export class LatLonInput extends DisplayComponent<LatLonInputProps> {
  private static readonly FORMAT_PARAMS = {
    [LatLonDisplayFormat.HDDD_MMmm]: {
      degreeFactor: 6000,
      latDigitFactors: [60000, 6000, 1000, 100, 10, 1],
      lonDigitFactors: [600000, 60000, 6000, 1000, 100, 10, 1],
      lonStartIndex: 7,
    },
    [LatLonDisplayFormat.HDDD_MMmmm]: {
      degreeFactor: 60000,
      latDigitFactors: [600000, 60000, 6000, 1000, 100, 10, 1],
      lonDigitFactors: [6000000, 600000, 60000, 6000, 1000, 100, 10, 1],
      lonStartIndex: 8
    },
    [LatLonDisplayFormat.HDDD_MM_SSs]: {
      degreeFactor: 36000,
      latDigitFactors: [360000, 36000, 6000, 600, 100, 10, 1],
      lonDigitFactors: [3600000, 360000, 36000, 6000, 600, 100, 10, 1],
      lonStartIndex: 8,
    }
  };

  private static readonly SCALED_VALUE_EQUALS = (a: LatLonInterface, b: LatLonInterface): boolean => a.lat === b.lat && a.lon === b.lon;

  private static readonly RESERVED_CSS_CLASSES = ['latlon-input'];

  private readonly inputRef = FSComponent.createRef<CursorInput<Subject<LatLonInterface>>>();

  private readonly params = LatLonInput.FORMAT_PARAMS[this.props.format];
  private readonly scaledValue = Subject.create<LatLonInterface>(
    { lat: 0, lon: 0 },
    LatLonInput.SCALED_VALUE_EQUALS
  );
  private readonly unscaledValue = this.scaledValue.map(scaled => {
    return {
      lat: scaled.lat / this.params.degreeFactor,
      lon: scaled.lon / this.params.degreeFactor
    };
  });

  private cssClassSub?: Subscription;
  private valuePipeOut?: Subscription;

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

  private isInit = false;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.valuePipeOut = this.unscaledValue.pipe(this.props.latLon);
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
   * Sets the latitude/longitude values of this input. As part of the operation, all of this input's characters will be
   * set to non-null representations of the new values, if possible. The latitude/longitude values of this input after
   * the operation is complete may differ from the requested values depending on whether the requested values can be
   * accurately represented by this input.
   * @param latLon The new latitude/longitude values.
   * @returns The latitude/longitude values of this input after the operation is complete.
   * @throws Error if this input is not initialized.
   */
  public setLatLon(latLon: LatLonInterface): Readonly<LatLonInterface> {
    if (!this.isInitialized()) {
      throw new Error('LatLonInput: attempted to manipulate input before it was initialized');
    }

    this.inputRef.instance.setValue({
      lat: Math.round(latLon.lat * this.params.degreeFactor),
      lon: Math.round(latLon.lon * this.params.degreeFactor)
    });

    return this.unscaledValue.get();
  }

  /**
   * Activates editing for this input.
   * @param isSelectionPerSlot Whether cursor selection should be initialized to per-slot mode. If `false`, cursor
   * selection will be initialized to per-character mode instead.
   * @throws Error if this input is not initialized.
   */
  public activateEditing(isSelectionPerSlot: boolean): void {
    if (!this.isInitialized()) {
      throw new Error('LatLonInput: attempted to manipulate input before it was initialized');
    }

    this.inputRef.instance.activateEditing(isSelectionPerSlot);
  }

  /**
   * Deactivates editing for this input.
   * @throws Error if this input is not initialized.
   */
  public deactivateEditing(): void {
    if (!this.isInitialized()) {
      throw new Error('LatLonInput: attempted to manipulate input before it was initialized');
    }

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
      throw new Error('LatLonInput: attempted to manipulate input before it was initialized');
    }

    this.inputRef.instance.moveCursor(direction, forceSelectionPerSlot);
  }

  /**
   * Places the cursor at a specific character position.
   * @param index The index of the character position at which to place the cursor.
   * @param forceSelectionPerSlot Whether to force cursor selection to per slot mode.
   * @throws Error if this input is not initialized.
   * @throws RangeError if `index` does not point to a valid character position.
   */
  public placeCursor(index: number, forceSelectionPerSlot: boolean): void {
    if (!this.isInitialized()) {
      throw new Error('LatLonInput: attempted to manipulate input before it was initialized');
    }

    this.inputRef.instance.placeCursor(index, forceSelectionPerSlot);
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
      throw new Error('LatLonInput: attempted to manipulate input before it was initialized');
    }

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
      throw new Error('LatLonInput: attempted to manipulate input before it was initialized');
    }

    this.inputRef.instance.setSlotCharacterValue(value);
  }

  /**
   * Sets the sign of this input's latitude value, and places the cursor at the character position immediately after
   * the latitude sign character.
   * @param sign The sign to set.
   * @throws Error if this input is not initialized.
   */
  public setLatSign(sign: 1 | -1): void {
    if (!this.isInitialized()) {
      throw new Error('LatLonInput: attempted to manipulate input before it was initialized');
    }

    this.inputRef.instance.placeCursor(0, false);
    this.inputRef.instance.setSlotCharacterValue(sign === 1 ? '+' : '-');
  }

  /**
   * Sets the sign of this input's longitude value, and places the cursor at the character position immediately after
   * the longitude sign character.
   * @param sign The sign to set.
   * @throws Error if this input is not initialized.
   */
  public setLonSign(sign: 1 | -1): void {
    if (!this.isInitialized()) {
      throw new Error('LatLonInput: attempted to manipulate input before it was initialized');
    }

    this.inputRef.instance.placeCursor(this.params.lonStartIndex, false);
    this.inputRef.instance.setSlotCharacterValue(sign === 1 ? '+' : '-');
  }

  /**
   * Removes the character at the cursor's current position. If backfill is allowed, this will also shift all non-empty
   * characters to the left of the cursor's current position one position to the right. If backfill is not allowed,
   * this will shift the cursor one position to the left after the character is removed.
   * @throws Error if this input is not initialized.
   */
  public backspace(): void {
    if (!this.isInitialized()) {
      throw new Error('LatLonInput: attempted to manipulate input before it was initialized');
    }

    this.inputRef.instance.backspace();
  }

  /**
   * Populates all of this input's character positions with non-empty values, if possible, using this input's value
   * digitizer function and the current composite value as a template.
   */
  public populateCharsFromValue(): void {
    this.inputRef.getOrDefault()?.populateCharsFromValue();
  }

  /**
   * Refreshes this input, updating the size and position of the cursor.
   */
  public refresh(): void {
    this.inputRef.getOrDefault()?.refresh();
  }

  /**
   * Parses latitude/longitude values from this input's individual slots.
   * @param slotValues The values of this input's slots.
   * @returns The latitude/longitude values represented by this input's slots.
   */
  private parseValue(slotValues: readonly number[]): LatLonInterface {
    const latSign = slotValues[0];
    let latValue = 0;
    for (let i = 1; i < this.params.lonStartIndex; i++) {
      latValue += slotValues[i];
    }

    const lonSign = slotValues[this.params.lonStartIndex];
    let lonValue = 0;
    for (let i = this.params.lonStartIndex + 1; i < slotValues.length; i++) {
      lonValue += slotValues[i];
    }

    return { lat: latSign * latValue, lon: lonSign * lonValue };
  }

  /**
   * Digitizes latitude/longitude values into individual values to assign to this input's slots.
   * @param value The value to digitize.
   * @param setSlotValues An array of functions which set the values of this input's individual slots. The order of the
   * functions is the same as the order of the their associated slots in this input (from left to right).
   */
  private digitizeValue(value: LatLonInterface, setSlotValues: readonly ((slotValue: any) => void)[]): void {
    setSlotValues[0](value.lat >= 0 ? 1 : -1); // lat sign

    let lat = Math.abs(value.lat);
    for (let i = 1; i < this.params.lonStartIndex; i++) {
      const factor = this.params.latDigitFactors[i - 1];
      const digitValue = Math.trunc(lat / factor) * factor;
      setSlotValues[i](digitValue);
      lat -= digitValue;
    }

    setSlotValues[this.params.lonStartIndex](value.lon >= 0 ? 1 : -1); // lon sign

    let lon = Math.abs(value.lon);
    for (let i = this.params.lonStartIndex + 1; i < setSlotValues.length; i++) {
      const factor = this.params.lonDigitFactors[i - this.params.lonStartIndex - 1];
      const digitValue = Math.trunc(lon / factor) * factor;
      setSlotValues[i](digitValue);
      lon -= digitValue;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      cssClass = SetSubject.create(['latlon-input']);
      this.cssClassSub = FSComponent.bindCssClassSet(cssClass, this.props.class, LatLonInput.RESERVED_CSS_CLASSES);
    } else {
      cssClass = 'latlon-input';

      if (this.props.class !== undefined && this.props.class.length > 0) {
        cssClass += FSComponent.parseCssClassesFromString(this.props.class, classToAdd => !LatLonInput.RESERVED_CSS_CLASSES.includes(classToAdd)).join(' ');
      }
    }

    return (
      <CursorInput<Subject<LatLonInterface>>
        ref={this.inputRef}
        value={this.scaledValue}
        valueEquals={LatLonInput.SCALED_VALUE_EQUALS}
        parseValue={this.parseValue.bind(this)}
        digitizeValue={this.digitizeValue.bind(this)}
        renderInactiveValue={
          <div class='latlon-input-inactive-value'>
            <LatLonDisplay
              value={this.unscaledValue}
              format={this.props.format}
              class='latlon-input-inactive-value-text'
            />
          </div>
        }
        allowBackFill={false}
        class={cssClass}
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
    switch (this.props.format) {
      case LatLonDisplayFormat.HDDD_MMmm:
        return this.renderHDDDMMmmSlots();
      case LatLonDisplayFormat.HDDD_MM_SSs:
        return this.renderHDDDMMSSsSlots();
    }
  }

  /**
   * Renders slots for the HDDD MM.mm format.
   * @returns Slots for the HDDD MM.mm format, as a VNode.
   */
  private renderHDDDMMmmSlots(): VNode {
    return (
      <>
        <div class='latlon-input-slots-row latlon-input-slots-row-1'>
          <SignInputSlot
            renderChar={character => character === '-' ? 'S' : 'N'}
          />
          <div> </div>
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={9}
            wrap={true}
            increment={1}
            scale={60000}
            defaultCharValues={[0]}
          />
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={10}
            wrap={true}
            increment={1}
            scale={6000}
            defaultCharValues={[0]}
          />
          <div>°</div>
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={6}
            wrap={true}
            increment={1}
            scale={1000}
            defaultCharValues={[0]}
          />
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={10}
            wrap={true}
            increment={1}
            scale={100}
            defaultCharValues={[0]}
          />
          <div>.</div>
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={10}
            wrap={true}
            increment={1}
            scale={10}
            defaultCharValues={[0]}
          />
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={10}
            wrap={true}
            increment={1}
            scale={1}
            defaultCharValues={[0]}
          />
          <div>'</div>
        </div>
        <div class='latlon-input-slots-row latlon-input-slots-row-2'>
          <SignInputSlot
            renderChar={character => character === '-' ? 'W' : 'E'}
          />
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={2}
            wrap={true}
            increment={1}
            scale={600000}
            defaultCharValues={[0]}
          />
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={10}
            wrap={true}
            increment={1}
            scale={60000}
            defaultCharValues={[0]}
          />
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={10}
            wrap={true}
            increment={1}
            scale={6000}
            defaultCharValues={[0]}
          />
          <div>°</div>
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={6}
            wrap={true}
            increment={1}
            scale={1000}
            defaultCharValues={[0]}
          />
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={10}
            wrap={true}
            increment={1}
            scale={100}
            defaultCharValues={[0]}
          />
          <div>.</div>
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={10}
            wrap={true}
            increment={1}
            scale={10}
            defaultCharValues={[0]}
          />
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={10}
            wrap={true}
            increment={1}
            scale={1}
            defaultCharValues={[0]}
          />
          <div>'</div>
        </div>
      </>
    );
  }

  /**
   * Renders slots for the HDDD MM SS.s format.
   * @returns Slots for the HDDD MM SS.s format, as a VNode.
   */
  private renderHDDDMMSSsSlots(): VNode {
    return (
      <>
        <div class='latlon-input-slots-row latlon-input-slots-row-1'>
          <SignInputSlot
            renderChar={character => character === '-' ? 'S' : 'N'}
          />
          <div> </div>
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={9}
            wrap={true}
            increment={1}
            scale={360000}
            defaultCharValues={[0]}
          />
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={10}
            wrap={true}
            increment={1}
            scale={36000}
            defaultCharValues={[0]}
          />
          <div>°</div>
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={6}
            wrap={true}
            increment={1}
            scale={6000}
            defaultCharValues={[0]}
          />
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={10}
            wrap={true}
            increment={1}
            scale={600}
            defaultCharValues={[0]}
          />
          <div>'</div>
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={6}
            wrap={true}
            increment={1}
            scale={100}
            defaultCharValues={[0]}
          />
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={10}
            wrap={true}
            increment={1}
            scale={10}
            defaultCharValues={[0]}
          />
          <div>.</div>
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={10}
            wrap={true}
            increment={1}
            scale={1}
            defaultCharValues={[0]}
          />
          <div>"</div>
        </div>
        <div class='latlon-input-slots-row latlon-input-slots-row-2'>
          <SignInputSlot
            renderChar={character => character === '-' ? 'W' : 'E'}
          />
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={2}
            wrap={true}
            increment={1}
            scale={3600000}
            defaultCharValues={[0]}
          />
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={10}
            wrap={true}
            increment={1}
            scale={360000}
            defaultCharValues={[0]}
          />
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={10}
            wrap={true}
            increment={1}
            scale={36000}
            defaultCharValues={[0]}
          />
          <div>°</div>
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={6}
            wrap={true}
            increment={1}
            scale={6000}
            defaultCharValues={[0]}
          />
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={10}
            wrap={true}
            increment={1}
            scale={600}
            defaultCharValues={[0]}
          />
          <div>'</div>
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={6}
            wrap={true}
            increment={1}
            scale={100}
            defaultCharValues={[0]}
          />
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={10}
            wrap={true}
            increment={1}
            scale={10}
            defaultCharValues={[0]}
          />
          <div>.</div>
          <DigitInputSlot
            characterCount={1}
            minValue={0}
            maxValue={10}
            wrap={true}
            increment={1}
            scale={1}
            defaultCharValues={[0]}
          />
          <div>"</div>
        </div>
      </>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.inputRef.getOrDefault()?.destroy();

    this.cssClassSub?.destroy();
    this.valuePipeOut?.destroy();

    super.destroy();
  }
}
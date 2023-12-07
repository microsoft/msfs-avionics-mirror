import {
  AbstractNumberUnitDisplay, AbstractNumberUnitDisplayProps, FSComponent, NavAngleUnit, NavAngleUnitFamily,
  NumberUnitInterface, Subject, Subscribable, SubscribableSet, ToggleableClassNameRecord, Unit, VNode
} from '@microsoft/msfs-sdk';

/**
 * Component props for BearingDisplay.
 */
export interface BearingDisplayProps extends Omit<AbstractNumberUnitDisplayProps<NavAngleUnitFamily>, 'value' | 'displayUnit'> {
  /** The {@link NumberUnitInterface} value to display, or a subscribable which provides it. */
  value: NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit> | Subscribable<NumberUnitInterface<NavAngleUnitFamily, NavAngleUnit>>;

  /**
   * The unit type in which to display the value, or a subscribable which provides it. If the unit is `null`, then the
   * native type of the value is used instead.
   */
  displayUnit: NavAngleUnit | null | Subscribable<NavAngleUnit | null>;

  /** A function which formats numbers. */
  formatter: (number: number) => string;

  /**
   * A function which formats units. The formatted unit text should be written to the 2-tuple passed to the `out`
   * parameter, as `[bigText, smallText]`. `bigText` and `smallText` will be rendered into separate `<span>` elements
   * representing the big and small components of the rendered unit text, respectively. If not defined, then units
   * will be formatted such that `bigText` is always the degree symbol (°) and `smallText` is empty for magnetic
   * bearing or `'T'` for true bearing.
   */
  unitFormatter?: (out: [string, string], unit: NavAngleUnit, number: number) => void;

  /** Whether to display `'360'` in place of `'0'`. Defaults to `true`. */
  use360?: boolean;

  /** Whether to hide the unit text when the displayed value is equal to `NaN`. Defaults to `false`. */
  hideDegreeSymbolWhenNan?: boolean;

  /** CSS class(es) to add to the root of the bearing display component. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * Displays a bearing value.
 */
export class BearingDisplay extends AbstractNumberUnitDisplay<NavAngleUnitFamily, BearingDisplayProps> {

  /**
   * A function which formats units to default text for BearingDisplay.
   * @param out The 2-tuple to which to write the formatted text, as `[bigText, smallText]`.
   * @param unit The unit to format.
   */
  public static readonly DEFAULT_UNIT_FORMATTER = (out: [string, string], unit: NavAngleUnit): void => {
    out[0] = '°';
    out[1] = unit.isMagnetic() ? '' : 'T';
  };

  private static readonly unitTextCache: [string, string] = ['', ''];

  private readonly unitFormatter = this.props.unitFormatter ?? BearingDisplay.DEFAULT_UNIT_FORMATTER;

  private readonly unitTextBigDisplay = Subject.create('');
  private readonly unitTextSmallDisplay = Subject.create('');

  private readonly numberText = Subject.create('');
  private readonly unitTextBig = Subject.create('');
  private readonly unitTextSmall = Subject.create('');

  /** @inheritdoc */
  protected onValueChanged(value: NumberUnitInterface<NavAngleUnitFamily>): void {
    let displayUnit = this.displayUnit.get();
    if (!displayUnit || !value.unit.canConvert(displayUnit)) {
      displayUnit = value.unit;
    }

    const numberValue = value.asUnit(displayUnit);

    this.updateNumberText(numberValue);
    this.updateUnitText(numberValue, displayUnit as NavAngleUnit);

    if (this.props.hideDegreeSymbolWhenNan === true) {
      this.updateUnitTextVisibility(numberValue);
    }
  }

  /** @inheritdoc */
  protected onDisplayUnitChanged(displayUnit: Unit<NavAngleUnitFamily> | null): void {
    const value = this.value.get();
    if (!displayUnit || !value.unit.canConvert(displayUnit)) {
      displayUnit = value.unit;
    }

    const numberValue = value.asUnit(displayUnit);

    this.updateNumberText(numberValue);
    this.updateUnitText(numberValue, displayUnit as NavAngleUnit);
    this.updateUnitTextVisibility(numberValue);
  }

  /**
   * Updates this component's displayed number text.
   * @param numberValue The numeric value to display.
   */
  private updateNumberText(numberValue: number): void {
    let numberText = this.props.formatter(numberValue);
    if (this.props.use360 !== false && parseFloat(numberText) === 0) {
      numberText = this.props.formatter(360);
    }

    this.numberText.set(numberText);
  }

  /**
   * Updates this component's displayed unit text.
   * @param numberValue The numeric value to display.
   * @param displayUnit The unit type in which to display the value.
   */
  private updateUnitText(numberValue: number, displayUnit: NavAngleUnit): void {
    BearingDisplay.unitTextCache[0] = '';
    BearingDisplay.unitTextCache[1] = '';

    this.unitFormatter(BearingDisplay.unitTextCache, displayUnit, numberValue);
    this.unitTextBig.set(BearingDisplay.unitTextCache[0]);
    this.unitTextSmall.set(BearingDisplay.unitTextCache[1]);
  }

  /**
   * Updates whether this component's unit text spans are visible.
   * @param numberValue The numeric value displayed by this component.
   */
  private updateUnitTextVisibility(numberValue: number): void {
    if (this.props.hideDegreeSymbolWhenNan === true) {
      if (isNaN(numberValue)) {
        this.unitTextBigDisplay.set('none');
        this.unitTextSmallDisplay.set('none');
        return;
      }
    }

    // We have to hide the unit text when empty because an empty string will get rendered as a space.
    this.unitTextBigDisplay.set(this.unitTextBig.get() === '' ? 'none' : '');
    this.unitTextSmallDisplay.set(this.unitTextSmall.get() === '' ? 'none' : '');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.props.class ?? ''} style='white-space: nowrap;'>
        <span class='bearing-num'>{this.numberText}</span>
        <span class='bearing-unit' style={{ 'display': this.unitTextBigDisplay }}>{this.unitTextBig}</span>
        <span class='bearing-unit-small' style={{ 'display': this.unitTextSmallDisplay }}>{this.unitTextSmall}</span>
      </div>
    );
  }
}
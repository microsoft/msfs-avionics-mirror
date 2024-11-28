import {
  ComponentProps, DisplayComponent, FSComponent, NumberUnitInterface, Subject, Subscribable, SubscribableSet, Subscription, ToggleableClassNameRecord, Unit,
  VNode
} from '@microsoft/msfs-sdk';

/**
 * Component props for NumberDisplay.
 */
export interface NumberDisplayProps<F extends string> extends ComponentProps {
  /** The {@link NumberUnitInterface} value to display, or a subscribable which provides it. */
  value: NumberUnitInterface<F> | Subscribable<NumberUnitInterface<F>>;

  /**
   * The unit type in which to display the value, or a subscribable which provides it. If the unit is `null`, then the
   * native type of the value is used instead.
   */
  displayUnit: Unit<F> | null | Subscribable<Unit<F> | null>;

  /** A function which formats numbers. */
  formatter: (number: number) => string;

  /** CSS class(es) to add to the root of the icon component. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A component which displays a number.
 */
export class NumberDisplay<F extends string> extends DisplayComponent<NumberDisplayProps<F>> {
  private readonly numberText = Subject.create('');

  /** A subscribable which provides the value to display. */
  protected readonly value: Subscribable<NumberUnitInterface<F>> = ('isSubscribable' in this.props.value)
    ? this.props.value
    : Subject.create(this.props.value);

  /** A subscribable which provides the unit type in which to display the value. */
  protected readonly displayUnit: Subscribable<Unit<F> | null> = this.props.displayUnit !== null && ('isSubscribable' in this.props.displayUnit)
    ? this.props.displayUnit
    : Subject.create(this.props.displayUnit);

  private valueSub?: Subscription;
  private displayUnitSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.valueSub = this.value.sub(this.onValueChanged.bind(this), true);
    this.displayUnitSub = this.displayUnit.sub(this.onDisplayUnitChanged.bind(this), true);
  }

  /** @inheritdoc */
  protected onValueChanged(value: NumberUnitInterface<F>): void {
    this.updateDisplay(value, this.displayUnit.get());
  }

  /** @inheritdoc */
  protected onDisplayUnitChanged(displayUnit: Unit<F> | null): void {
    this.updateDisplay(this.value.get(), displayUnit);
  }

  /**
   * Updates this component's displayed number and unit text.
   * @param value The value to display.
   * @param displayUnit The unit type in which to display the value, or `null` if the value should be displayed in its
   * native unit type.
   */
  private updateDisplay(value: NumberUnitInterface<F>, displayUnit: Unit<F> | null): void {
    if (!displayUnit || !value.unit.canConvert(displayUnit)) {
      displayUnit = value.unit;
    }

    const numberValue = value.asUnit(displayUnit);

    const numberText = this.props.formatter(numberValue);
    this.numberText.set(numberText);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.props.class ?? ''} style='white-space: nowrap;'>
        <span class='numberunit-num'>{this.numberText}</span>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.valueSub?.destroy();
    this.displayUnitSub?.destroy();
  }
}

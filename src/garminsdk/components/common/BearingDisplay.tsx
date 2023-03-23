import {
  AbstractNumberUnitDisplay, AbstractNumberUnitDisplayProps, FSComponent, NavAngleUnit, NavAngleUnitFamily, NumberUnitInterface, Subject, SubscribableSet, Unit, VNode
} from '@microsoft/msfs-sdk';

/**
 * Component props for BearingDisplay.
 */
export interface BearingDisplayProps extends AbstractNumberUnitDisplayProps<NavAngleUnitFamily> {
  /** A function which formats numbers. */
  formatter: (number: number) => string;

  /** Whether to display 360 in place of 0. True by default. */
  use360?: boolean;

  /** Whether to hide the ° symbol when value is NaN. False by default. */
  hideDegreeSymbolWhenNan?: boolean;

  /** CSS class(es) to add to the root of the bearing display component. */
  class?: string | SubscribableSet<string>;
}

/**
 * Displays a bearing value.
 */
export class BearingDisplay extends AbstractNumberUnitDisplay<NavAngleUnitFamily, BearingDisplayProps> {
  private readonly unitTextSmallRef = FSComponent.createRef<HTMLSpanElement>();
  private readonly bearingUnitRef = FSComponent.createRef<HTMLDivElement>();

  private readonly numberTextSub = Subject.create('');
  private readonly unitTextSmallSub = Subject.create('');

  /** @inheritdoc */
  constructor(props: BearingDisplayProps) {
    super(props);

    this.props.use360 ??= true;
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    super.onAfterRender();

    // We have to hide the "small" unit text when empty because an empty string will get rendered as a space.
    this.unitTextSmallSub.sub((text): void => { this.unitTextSmallRef.instance.style.display = text === '' ? 'none' : ''; }, true);
  }

  /** @inheritdoc */
  protected onValueChanged(value: NumberUnitInterface<NavAngleUnitFamily>): void {
    this.setDisplay(value, this.displayUnit.get());
  }

  /** @inheritdoc */
  protected onDisplayUnitChanged(displayUnit: Unit<NavAngleUnitFamily> | null): void {
    this.setDisplay(this.value.get(), displayUnit);
  }

  /**
   * Displays this component's current value.
   * @param value The current value.
   * @param displayUnit The current display unit.
   */
  private setDisplay(value: NumberUnitInterface<NavAngleUnitFamily>, displayUnit: Unit<NavAngleUnitFamily> | null): void {
    if (!displayUnit || !value.unit.canConvert(displayUnit)) {
      displayUnit = value.unit;
    }

    const number = value.asUnit(displayUnit);
    let numberText = this.props.formatter(number);
    if (this.props.use360 && parseFloat(numberText) === 0) {
      numberText = this.props.formatter(360);
    }

    this.numberTextSub.set(numberText);

    if (this.props.hideDegreeSymbolWhenNan === true) {
      this.bearingUnitRef.instance.style.display = isNaN(number) ? 'none' : 'inline';
    }

    if (this.props.hideDegreeSymbolWhenNan === true && isNaN(number)) {
      this.unitTextSmallSub.set('');
    } else {
      this.unitTextSmallSub.set((displayUnit as NavAngleUnit).isMagnetic() ? '' : 'T');
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.props.class ?? ''} style='white-space: nowrap;'>
        <span class='bearing-num'>{this.numberTextSub}</span>
        <span ref={this.bearingUnitRef} class='bearing-unit'>°</span>
        <span ref={this.unitTextSmallRef} class='bearing-unit-small'>{this.unitTextSmallSub}</span>
      </div>
    );
  }
}
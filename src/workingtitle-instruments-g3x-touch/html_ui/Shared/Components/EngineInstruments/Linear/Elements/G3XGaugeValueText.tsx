import { DisplayComponent, FSComponent, VNode, ComputedSubject, Subscribable, Subscription } from '@microsoft/msfs-sdk';

/** Properties controlling the text display of a single value. */
interface ValueTextProps {
  /** The current value. */
  valueSubject: Subscribable<number>;
  /** The amount to increment the text by on each update. */
  textIncrement?: number;
  /** Dhe decimal precision of the value. */
  valuePrecision?: number;
  /** Display plus sign for positive values. */
  displayPlus?: boolean,
}

/** The logic for the textual display of a single value with control for increment, precision, and alerting. */
export class G3XGaugeValueText extends DisplayComponent<ValueTextProps> {
  private readonly quantum = this.props.textIncrement !== undefined ? this.props.textIncrement : 1;
  private readonly precision = this.props.valuePrecision !== undefined ? this.props.valuePrecision : 0;

  private readonly valueTextSubject = ComputedSubject.create(0, (v) => {
    let valueText = (this.quantum !== 1 ? (Math.round(v / this.quantum) * this.quantum).toFixed(this.precision) : v.toFixed(this.precision));
    if (this.props.displayPlus && v > 0) {
      valueText = '+' + valueText;
    }
    return valueText;
  });
  private readonly valueRef = FSComponent.createRef<HTMLDivElement>();
  private readonly valueSubscription: Subscription = this.props.valueSubject.sub((v) => this.updateValue(v));

  /**
   * Update the value.
   * @param value The new value.
   */
  private updateValue(value: number): void {
    this.valueTextSubject.set(value);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div
        class={'horizontal-value'}
        ref={this.valueRef}
      >
        {this.valueTextSubject}
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();
    this.valueSubscription.destroy();
  }
}
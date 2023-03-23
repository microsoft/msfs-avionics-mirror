import { FSComponent, MathUtils, Subject, VNode } from '@microsoft/msfs-sdk';

import { WT21UiControl, WT21UiControlProps } from '../../UI/WT21UiControl';

import './NumericInput.css';

/**
 * The properties for the NumericInput component.
 */
interface NumericInputProps extends WT21UiControlProps {
  /** The text label of the input */
  label: string;

  /** The data ref subject for the selected index. */
  dataRef: Subject<number>;

  /** The increments in which the data knob should alter the value */
  increments?: number | Subject<number>;

  /** The minimum number of the value */
  min?: number | Subject<number>;

  /** The maxmimun number of the value */
  max?: number | Subject<number>;
}

/**
 * The NumericInput component.
 */
export class NumericInput extends WT21UiControl<NumericInputProps> {

  private readonly el = FSComponent.createRef<HTMLDivElement>();
  protected readonly increments = typeof this.props.increments === 'object' ? this.props.increments : Subject.create(this.props.increments !== undefined ? this.props.increments : 1);
  protected readonly min = typeof this.props.min === 'object' ? this.props.min : Subject.create(this.props.min !== undefined ? this.props.min : 0);
  protected readonly max = typeof this.props.max === 'object' ? this.props.max : Subject.create(this.props.max !== undefined ? this.props.max : 99999);


  /** @inheritdoc */
  public onUpperKnobInc(): boolean {
    this.props.dataRef.set(MathUtils.clamp(this.props.dataRef.get() + this.increments.get(), this.min.get(), this.max.get()));
    return true;
  }

  /** @inheritdoc */
  public onUpperKnobDec(): boolean {
    this.props.dataRef.set(MathUtils.clamp(this.props.dataRef.get() - this.increments.get(), this.min.get(), this.max.get()));
    return true;
  }

  /** @inheritdoc */
  protected onFocused(): void {
    this.el.instance.classList.add(WT21UiControl.FOCUS_CLASS);
  }

  /** @inheritdoc */
  protected onBlurred(): void {
    this.el.instance.classList.remove(WT21UiControl.FOCUS_CLASS);
  }

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.min.sub(min => {
      if (min > this.props.dataRef.get()) {
        this.props.dataRef.set(min);
      }
    });

    this.max.sub(max => {
      if (max < this.props.dataRef.get()) {
        this.props.dataRef.set(max);
      }
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="popup-menu-line popup-menu-numeric" ref={this.el}>
        <div class="popup-menu-numeric-label">{this.props.label}</div>
        <div class="popup-menu-numeric-value">{this.props.dataRef}</div>
      </div>
    );
  }
}
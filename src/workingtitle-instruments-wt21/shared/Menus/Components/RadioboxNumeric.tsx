import { EventBus, FSComponent, InputAcceleration, MathUtils, MutableSubscribable, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { WT21UiControl, WT21UiControlProps } from '../../UI/WT21UiControl';

/**
 * The properties for the RadioBoxNumeric component.
 */
interface RadioBoxNumericProps extends WT21UiControlProps {
  /** The text label of the RadioBoxNumeric */
  label: string | Subscribable<string>;
  /** The name of the RadioBoxNumeric html input */
  name?: string;
  /** The data ref subject for the selected value. */
  dataRef?: MutableSubscribable<number>;
  /** The index of this radio box in the list. */
  index: number;
  /** A subject storing the index of which item in this list is selected. */
  selectedIndex: MutableSubscribable<number>;
  /** A boolean determining,  */
  checkOnChange?: boolean;
  /** The increments in which the data knob should alter the value */
  increments?: number | Subscribable<number>;
  /** The minimum number of the value */
  min?: number | Subscribable<number>;
  /** The maxmimun number of the value */
  max?: number | Subscribable<number>;
  /** An instance of the event bus */
  bus?: EventBus;
}

/**
 * The RadioBoxNumeric component.
 */
export class RadioBoxNumeric extends WT21UiControl<RadioBoxNumericProps> {

  protected readonly el = FSComponent.createRef<HTMLDivElement>();
  protected readonly isChecked = Subject.create(false);
  protected readonly inputRef = FSComponent.createRef<HTMLInputElement>();
  protected readonly checkOnChange = Subject.create(this.props.checkOnChange !== undefined ? this.props.checkOnChange : true);
  protected readonly increments = typeof this.props.increments === 'object'
    ? this.props.increments
    : Subject.create(this.props.increments !== undefined ? this.props.increments : 1);
  protected readonly min = typeof this.props.min === 'object'
    ? this.props.min
    : Subject.create(this.props.min !== undefined ? this.props.min : 0);
  protected readonly max = typeof this.props.max === 'object'
    ? this.props.max
    : Subject.create(this.props.max !== undefined ? this.props.max : 99999);

  private readonly knobAcceleration = new InputAcceleration({ increment: this.increments.get() });

  /** @inheritdoc */
  public onUpperKnobPush(): boolean {
    if (this.isDisabled === false) {
      this.props.selectedIndex.set(this.props.index);
    }
    return true;
  }

  /** @inheritdoc */
  public onUpperKnobInc(): boolean {
    if (this.isDisabled === false && this.props.dataRef) {
      const increment = this.knobAcceleration.doStep();
      this.props.dataRef.set(MathUtils.clamp(this.props.dataRef.get() + increment, this.min.get(), this.max.get()));
      if (this.checkOnChange.get()) {
        this.props.selectedIndex.set(this.props.index);
      }
    }
    return true;
  }

  /** @inheritdoc */
  public onUpperKnobDec(): boolean {
    if (this.isDisabled === false && this.props.dataRef) {
      const decrement = this.knobAcceleration.doStep();
      this.props.dataRef.set(MathUtils.clamp(this.props.dataRef.get() - decrement, this.min.get(), this.max.get()));
      if (this.checkOnChange.get()) {
        this.props.selectedIndex.set(this.props.index);
      }
    }
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
  protected onDisabled(): void {
    this.inputRef.instance.disabled = true;
  }

  /** @inheritdoc */
  protected onEnabled(): void {
    this.inputRef.instance.disabled = false;
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.selectedIndex.sub(i => {
      this.isChecked.set(i === this.props.index);
    }, true);

    this.isChecked.sub(v => {
      this.inputRef.instance.checked = v;
    }, true);

    this.min.sub(min => {
      if (this.props.dataRef && this.isDisabled === false && min > this.props.dataRef.get()) {
        this.props.dataRef.set(min);
      }
    });

    this.max.sub(max => {
      if (this.props.dataRef && this.isDisabled === false && max < this.props.dataRef.get()) {
        this.props.dataRef.set(max);
      }
    });
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <label class="popup-menu-line radio-label radio-select" ref={this.el}>
        <input type="radio" class="radio-input" name={this.props.name} ref={this.inputRef} />
        <div class="radio-design">
          <svg height="16" width="16" viewBox="0 0 14 14">
            <line x1="0" x2="14" y1="0" y2="14" stroke="var(--wt21-colors-white)" stroke-width="2" />
            <line x1="0" x2="14" y1="14" y2="0" stroke="var(--wt21-colors-white)" stroke-width="2" />
          </svg>
        </div>
        <div class="radio-text">
          {this.props.label}
          <div class="radio-select-value">{this.props.dataRef}</div>
        </div>
      </label>
    );
  }
}
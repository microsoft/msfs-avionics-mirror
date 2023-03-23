import { FSComponent, Subject, SubscribableArray, VNode } from '@microsoft/msfs-sdk';

import { WT21UiControl, WT21UiControlProps } from '../../UI/WT21UiControl';

import './CheckBox.css';

/**
 * The properties for the CheckBox component.
 */
interface CheckBoxSelectProps extends WT21UiControlProps {
  /** The text label of the checkbox */
  label: string;

  /** The data ref subject for whether the checkbox is selected. */
  checkedDataRef: Subject<boolean>;

  /** The data ref subject for the selected value. */
  dataRef: Subject<number>;

  /** The array of possible values for the input */
  data: SubscribableArray<string>;

  /** A boolean determining,  */
  checkOnChange?: boolean;
}

/**
 * The CheckBox component.
 */
export class CheckBoxSelect extends WT21UiControl<CheckBoxSelectProps> {

  protected readonly el = FSComponent.createRef<HTMLDivElement>();
  protected readonly inputRef = FSComponent.createRef<HTMLInputElement>();
  protected readonly checkOnChange = Subject.create(this.props.checkOnChange !== undefined ? this.props.checkOnChange : true);
  protected readonly displayValue = Subject.create('');

  /** @inheritdoc */
  public onUpperKnobPush(): boolean {
    if (this.isDisabled === false) {
      this.props.checkedDataRef.set(!this.props.checkedDataRef.get());
    }
    return true;
  }

  /** @inheritdoc */
  public onUpperKnobInc(): boolean {
    if (this.isDisabled === false) {
      this.props.dataRef.set(Math.min(this.props.dataRef.get() + 1, this.props.data.length - 1));
    }
    return true;
  }

  /** @inheritdoc */
  public onUpperKnobDec(): boolean {
    if (this.isDisabled === false) {
      this.props.dataRef.set(Math.max(this.props.dataRef.get() - 1, 0));
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
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);
    this.updateDisplayValue(this.props.dataRef.get(), true);

    this.props.dataRef.sub(i => {
      this.updateDisplayValue(i);
    });

    this.props.checkedDataRef.sub((v: boolean) => {
      this.inputRef.instance.checked = v;
    }, true);
  }

  private readonly updateDisplayValue = (i: number, overrideChangeCheck = false): void => {
    if (this.isDisabled === false && !overrideChangeCheck && this.checkOnChange.get()) { this.props.checkedDataRef.set(true); }
    this.displayValue.set(this.props.data.tryGet(i) ?? 'n/a');
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="popup-menu-line popup-menu-checkbox" ref={this.el}>
        <label class="check-label">
          <input type="checkbox" class="check-input" name={this.props.label} ref={this.inputRef} />
          <div class="check-design">
            <svg height="14" width="14" viewBox="0 0 45 45" class="enabled-svg">
              <path d="m 4 23 l 10 14 c 8 -17 18 -26 28 -33" fill="none" stroke="var(--wt21-colors-cyan)" stroke-width="10"></path>
            </svg>
            <svg height="14" width="14" class="disabled-svg">
              <line x1="0" x2="14" y1="0" y2="14" stroke="var(--wt21-colors-white)" stroke-width="2" />
              <line x1="0" x2="14" y1="14" y2="0" stroke="var(--wt21-colors-white)" stroke-width="2" />
            </svg>
          </div>
          <div class="check-text">
            {this.props.label}
            <div class="check-select-value">{this.displayValue}</div>
          </div>
        </label>
      </div>
    );
  }
}
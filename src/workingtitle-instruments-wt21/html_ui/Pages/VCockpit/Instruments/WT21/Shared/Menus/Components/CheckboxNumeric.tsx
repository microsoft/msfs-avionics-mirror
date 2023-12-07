import { FSComponent, MathUtils, MutableSubscribable, Subject, Subscribable, SubscribableUtils, VNode } from '@microsoft/msfs-sdk';

import { WT21UiControl, WT21UiControlProps } from '../../UI/WT21UiControl';

import './Checkbox.css';

/**
 * Style of {@link CheckBoxNumeric}
 */
export enum CheckBoxNumericStyle {
  Inline,
  SideButtonBound,
}

/**
 * The properties for the CheckBox component.
 */
interface CheckBoxNumericProps extends WT21UiControlProps {
  /** The text label of the checkbox */
  label: string;

  /** The data ref subject for whether the checkbox is selected. */
  checkedDataRef: Subscribable<boolean> | MutableSubscribable<boolean>;

  /** The data ref subject for the selected value. */
  dataRef: MutableSubscribable<number>;

  /** A boolean determining, whether the checkbox should be unchecked on value change */
  uncheckOnChange?: boolean;

  /** The increments in which the data knob should alter the value */
  increments?: number | Subscribable<number>;

  /** The minimum number of the value */
  min?: number | Subscribable<number>;

  /** The maxmimun number of the value */
  max?: number | Subscribable<number>;

  /** Style of numeric checkbox */
  style?: CheckBoxNumericStyle;

  /** Orientation of the numeric checkbox - only relevant if {@link style} is set to `SideButtonBound`. */
  orientation?: 'left' | 'right';

  /** Handler being fired when the checked status changes by control input */
  onCheckedChanged?(value: boolean, sender: CheckBoxNumeric): void;

  /** Handler being fired when the value changes by control input */
  onValueChanged?(value: number, sender: CheckBoxNumeric): void;
}

/**
 * The CheckBox component.
 */
export class CheckBoxNumeric extends WT21UiControl<CheckBoxNumericProps> {
  private static readonly ARROW_ORIENTATIONS: Record<'left' | 'right', string> = {
    left: 'M 7, 2 l -4, 5 l 4, 5',
    right: 'M 3, 2 l 4, 5 l -4, 5',
  };

  protected readonly focusEl = FSComponent.createRef<HTMLDivElement>();
  protected readonly inputRef = FSComponent.createRef<HTMLInputElement>();
  protected readonly uncheckOnChange = Subject.create(this.props.uncheckOnChange !== undefined ? this.props.uncheckOnChange : true);
  protected readonly increments = typeof this.props.increments === 'object' ? this.props.increments : Subject.create(this.props.increments !== undefined ? this.props.increments : 1);
  protected readonly min = typeof this.props.min === 'object' ? this.props.min : Subject.create(this.props.min !== undefined ? this.props.min : 0);
  protected readonly max = typeof this.props.max === 'object' ? this.props.max : Subject.create(this.props.max !== undefined ? this.props.max : 99999);
  protected readonly style = this.props.style ?? CheckBoxNumericStyle.Inline;

  /** @inheritdoc */
  public onUpperKnobPush(): boolean {
    if (!this.isDisabled) {
      if (this.props.onCheckedChanged) {
        this.props.onCheckedChanged(!this.props.checkedDataRef.get(), this);
      } else {
        SubscribableUtils.isMutableSubscribable(this.props.checkedDataRef) && this.props.checkedDataRef.set(!this.props.checkedDataRef.get());
      }
    }
    return true;
  }

  /** @inheritdoc */
  public onUpperKnobInc(): boolean {
    if (!this.isDisabled) {
      this.props.dataRef.set(MathUtils.clamp(this.props.dataRef.get() + this.increments.get(), this.min.get(), this.max.get()));
      this.onValueChangedInternal();
    }
    return true;
  }

  /** @inheritdoc */
  public onUpperKnobDec(): boolean {
    if (!this.isDisabled) {
      this.props.dataRef.set(MathUtils.clamp(this.props.dataRef.get() - this.increments.get(), this.min.get(), this.max.get()));
      this.onValueChangedInternal();
    }
    return true;
  }

  /**
   * Handles value changes by user input.
   */
  private onValueChangedInternal(): void {
    if (!this.isDisabled && this.uncheckOnChange.get()) {
      SubscribableUtils.isMutableSubscribable(this.props.checkedDataRef) && this.props.checkedDataRef.set(false);
    }
    if (this.props.onValueChanged) {
      this.props.onValueChanged(this.props.dataRef.get(), this);
    }
  }

  /** @inheritdoc */
  protected onFocused(): void {
    this.focusEl.instance.classList.add(WT21UiControl.FOCUS_CLASS);
  }

  /** @inheritdoc */
  protected onBlurred(): void {
    this.focusEl.instance.classList.remove(WT21UiControl.FOCUS_CLASS);
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
    this.props.checkedDataRef.sub((v: boolean) => {
      this.inputRef.instance.checked = v;
    }, true);

    this.min.sub(min => {
      if (!this.isDisabled && min > this.props.dataRef.get()) {
        this.props.dataRef.set(min);
      }
    });

    this.max.sub(max => {
      if (!this.isDisabled && max < this.props.dataRef.get()) {
        this.props.dataRef.set(max);
      }
    });

  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div
        ref={this.style === CheckBoxNumericStyle.Inline ? this.focusEl : undefined}
        class={{
          'popup-menu-line': true,
          'popup-menu-checkbox': true,
          'popup-menu-checkbox-side-button': this.style === CheckBoxNumericStyle.SideButtonBound,
          'popup-menu-checkbox-right': this.props.orientation === 'right',
        }}
        data-label={this.props.label}
      >
        <div class={this.props.cssClasses}>
          <label class="check-label">
            <input class={{'check-input': true, 'hidden': this.style === CheckBoxNumericStyle.SideButtonBound}} type="checkbox" name={this.props.label} ref={this.inputRef} />

            <div class={{'check-design': true, 'hidden': this.style === CheckBoxNumericStyle.SideButtonBound}}>
              <svg height="14" width="14" viewBox="0 0 45 45" class="enabled-svg">
                <path d="m 4 23 l 10 14 c 8 -17 18 -26 28 -33" fill="none" stroke="var(--wt21-colors-cyan)" stroke-width="10"></path>
              </svg>
              <svg height="14" width="14" class="disabled-svg">
                <line x1="0" x2="14" y1="0" y2="14" stroke="var(--wt21-colors-white)" stroke-width="2" />
                <line x1="0" x2="14" y1="14" y2="0" stroke="var(--wt21-colors-white)" stroke-width="2" />
              </svg>
            </div>

            <div class="check-text">
              <div>
                {this.style === CheckBoxNumericStyle.SideButtonBound && (this.props.orientation ?? 'left') === 'left' && (
                  <div class="check-side-buttons-arrow-wrapper">
                    <svg class="check-side-buttons-arrow" viewBox="0 0 10 14">
                      <path d={CheckBoxNumeric.ARROW_ORIENTATIONS[this.props.orientation ?? 'left']} stroke-width={1.5} stroke="cyan" />
                    </svg>
                  </div>
                )}

                {this.props.label}

                {this.style === CheckBoxNumericStyle.SideButtonBound && (this.props.orientation ?? 'left') === 'right' && (
                  <div class="check-side-buttons-arrow-wrapper">
                    <svg class="check-side-buttons-arrow" viewBox="0 0 10 14">
                      <path d={CheckBoxNumeric.ARROW_ORIENTATIONS[this.props.orientation ?? 'left']} stroke-width={1.5} stroke="cyan" />
                    </svg>
                  </div>
                )}
              </div>

              <div
                ref={this.style === CheckBoxNumericStyle.SideButtonBound ? this.focusEl : undefined}
                class="check-select-value">
                {this.props.dataRef}
              </div>
            </div>
          </label>
        </div>
      </div>
    );
  }
}
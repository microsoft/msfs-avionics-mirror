import { FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { WT21UiControl, WT21UiControlProps } from '../../UI/WT21UiControl';

import './Checkbox.css';

/**
 * The properties for the CheckBox component.
 */
interface CheckBoxProps extends WT21UiControlProps {
  /** The text label of the checkbox */
  label: string;

  /** The data ref subject for whether the checkbox is selected. */
  checkedDataRef: Subject<boolean>;
}

/**
 * The CheckBox component.
 */
export class CheckBox extends WT21UiControl<CheckBoxProps> {

  protected readonly el = FSComponent.createRef<HTMLDivElement>();
  protected readonly inputRef = FSComponent.createRef<HTMLInputElement>();
  protected readonly checkTextRef = FSComponent.createRef<HTMLDivElement>();

  /** @inheritdoc */
  public onUpperKnobPush(): boolean {
    if (this.isDisabled === false) {
      this.props.checkedDataRef.set(!this.props.checkedDataRef.get());
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
    this.el.instance.classList.add('disabled');

  }

  /** @inheritdoc */
  protected onEnabled(): void {
    this.inputRef.instance.disabled = false;
    this.el.instance.classList.remove('disabled');
  }

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.props.checkedDataRef.sub((v: boolean) => {
      this.inputRef.instance.checked = v;
    }, true);

  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="popup-menu-line popup-menu-checkbox" ref={this.el}>
        <label class="check-label">
          <input type="checkbox" class="check-input" name={this.props.label} ref={this.inputRef} />
          <div class="check-design">
            <svg height="15" width="15" viewBox="0 0 45 45" class="enabled-svg">
              <path d="m 4 23 l 10 14 c 8 -17 18 -26 28 -33" fill="none" stroke="var(--wt21-colors-cyan)" stroke-width="10"></path>
            </svg>
            <svg height="16" width="16" class="disabled-svg">
              <line x1="0" x2="16" y1="0" y2="16" stroke="var(--wt21-colors-dark-gray)" stroke-width="1" />
              <line x1="0" x2="16" y1="16" y2="0" stroke="var(--wt21-colors-dark-gray)" stroke-width="1" />
            </svg>
          </div>
          <div class="check-text">
            {this.props.label}
          </div>
        </label>
      </div>
    );
  }
}
import { ComponentProps, DisplayComponent, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

/**
 * The properties for the RadioBox component.
 */
interface RadioBoxProps extends ComponentProps {
  /** The text label of the RadioBox */
  label: string | Subject<string>;

  /** A boolean determining wether the box can be checked */
  enabled?: boolean;

  /** A boolean determining wether the box is checked */
  checked?: boolean;

  /** The name of the RadioBox html input */
  name?: string;

  /** Whether to show the checbox graphics. Defaults to `true` */
  showCheckbox?: boolean;
}

/**
 * The RadioBox component.
 */
export class RadioBox extends DisplayComponent<RadioBoxProps> {
  public readonly isEnabled = Subject.create(this.props.enabled !== undefined ? this.props.enabled : true);
  private readonly isChecked = Subject.create(this.props.checked !== undefined ? this.props.checked : false);
  private readonly inputRef = FSComponent.createRef<HTMLInputElement>();
  private readonly radioRef = FSComponent.createRef<HTMLDivElement>();

  /**
   * Sets the ability to check this box.
   * @param enabled The boolean indicating whether the box should be checkable.
   */
  public setIsEnabled(enabled: boolean): void {
    this.isEnabled.set(enabled);
  }

  /**
   * Sets the checkmark in the RadioBox.
   * @param checked The boolean indicating whether the box should be checked.
   */
  public setIsChecked(checked: boolean): void {
    this.isChecked.set(checked);
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.isEnabled.sub((v: boolean) => {
      this.inputRef.instance.disabled = !v;
      this.radioRef.instance.classList.toggle('disabled', !v);
    }, true);

    this.isChecked.sub((v: boolean) => {
      this.inputRef.instance.checked = v;
    }, true);

  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <label class="radio-label" ref={this.radioRef}>
        <input type="radio" class="radio-input" name={this.props.name} ref={this.inputRef} />

        {(this.props.showCheckbox ?? true) && (
          <div class="radio-design">
            <svg height="16" width="16" viewBox="0 0 14 14">
              <line x1="0" x2="14" y1="0" y2="14" stroke="currentColor" stroke-width="1" />
              <line x1="0" x2="14" y1="14" y2="0" stroke="currentColor" stroke-width="1" />
            </svg>
          </div>
        )}

        <div class="radio-text">{this.props.label}</div>
      </label>
    );
  }
}
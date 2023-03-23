import { ComponentProps, DisplayComponent, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

/**
 * The properties for the RadioBoxSelect component.
 */
interface RadioBoxSelectProps extends ComponentProps {
  /** The text label of the RadioBoxSelect */
  label: string | Subject<string>;
  /** A boolean determining wether the box can be checked */
  enabled?: boolean;
  /** A boolean determining wether the box is checked */
  checked?: boolean;
  /** The name of the RadioBoxSelect html input */
  name?: string;
}

/**
 * The RadioBoxSelect component.
 */
export class RadioBoxSelect extends DisplayComponent<RadioBoxSelectProps> {

  public readonly isEnabled = Subject.create(this.props.enabled !== undefined ? this.props.enabled : true);
  protected readonly isChecked = Subject.create(this.props.checked !== undefined ? this.props.checked : false);
  protected readonly inputRef = FSComponent.createRef<HTMLInputElement>();

  /**
   * Sets the ability to check this box.
   * @param enabled The boolean indicating whether the box should be checkable.
   */
  public setIsEnabled(enabled: boolean): void {
    this.isEnabled.set(enabled);
  }

  /**
   * Sets the checkmark in the RadioBoxSelect.
   * @param checked The boolean indicating whether the box should be checked.
   */
  public setIsChecked(checked: boolean): void {
    this.isChecked.set(checked);
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.isEnabled.sub((v: boolean) => {
      this.inputRef.instance.disabled = !v;
    }, true);

    this.isChecked.sub((v: boolean) => {
      this.inputRef.instance.checked = v;
    }, true);

  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <label class="popup-menu-line radio-label radio-select">
        <input type="radio" class="radio-input" name={this.props.name} ref={this.inputRef} />
        <div class="radio-design">
          <svg height="16" width="16" viewBox="0 0 14 14">
            <line x1="0" x2="14" y1="0" y2="14" stroke="var(--wt21-colors-white)" stroke-width="2" />
            <line x1="0" x2="14" y1="14" y2="0" stroke="var(--wt21-colors-white)" stroke-width="2" />
          </svg>
        </div>
        <div class="radio-text">
          {this.props.label}
          <div class="radio-select-value">530</div>
        </div>
      </label>
    );
  }
}
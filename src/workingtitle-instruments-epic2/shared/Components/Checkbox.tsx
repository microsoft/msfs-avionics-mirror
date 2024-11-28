import { ComponentProps, DisplayComponent, FSComponent, MutableSubscribable, Subscribable, SubscribableUtils, VNode } from '@microsoft/msfs-sdk';

import './Checkbox.css';

/** @inheritDoc */
interface CheckBoxProps extends ComponentProps {
  /** Checked state */
  isChecked: Subscribable<boolean> | MutableSubscribable<boolean>;

  /** Label */
  label?: string;

  /** Whether the checkbox is enabled, or a subscribable which provides it. Defaults to `true`. */
  isEnabled?: boolean | Subscribable<boolean>;
}

/** A checkbox component */
export class CheckBox extends DisplayComponent<CheckBoxProps> {
  public readonly checkBoxContainerElement = FSComponent.createRef<HTMLElement>();

  private readonly isEnabled = SubscribableUtils.toSubscribable(this.props.isEnabled ?? true, true) as Subscribable<boolean>;

  /** Toggles the checkbox state */
  public handleClicked(): void {
    if (this.isEnabled.get()) {
      const checked = this.props.isChecked as MutableSubscribable<boolean>;
      checked.set(!checked.get());
    }
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.checkBoxContainerElement.instance.addEventListener('click', () => this.handleClicked());
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div
        class={{
          'checkbox-container': true,
          'checkbox-disabled': this.isEnabled.map(x => !x)
        }}
      >
        <div class="checkbox-wrapper" ref={this.checkBoxContainerElement}>
          <div class="checkbox"></div>
          <svg viewBox="-35 -35 70 70">
            <path
              d="M -29 11 L -16 24 L 28 -28"
              stroke={this.props.isChecked.map((x) =>
                x ? 'var(--epic2-color-green)' : 'none',
              )}
              stroke-width={2}
              fill="none"
              vector-effect="non-scaling-stroke"
            />
          </svg>
        </div>
        {this.props.label && (
          <span class="checkbox-label">{this.props.label}</span>
        )}
      </div>
    );
  }

  /** @inheritdoc */
  public onDestroy(): void {
    this.checkBoxContainerElement.instance.removeEventListener('click', this.handleClicked);
  }
}

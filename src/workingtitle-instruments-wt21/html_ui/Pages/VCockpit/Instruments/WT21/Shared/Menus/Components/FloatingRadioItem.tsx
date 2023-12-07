import { FSComponent, DisplayComponent, VNode, Subject, ComponentProps } from '@microsoft/msfs-sdk';

import './CyclicRadioItem.css';

/**
 *
 */
export interface FloatingRadioItemProps extends ComponentProps {
  /** The name of the option */
  name: string,

  /** CSS color value applied to the element when it is selected */
  selectedColor: string,
}

/**
 *
 */
export class FloatingRadioItem extends DisplayComponent<FloatingRadioItemProps> {
  public isEnabled = Subject.create(true);

  private selected = Subject.create(true);

  /**
   * Sets whether the radio item is enabled
   *
   * @param value the value to set
   */
  public setIsEnabled(value: boolean): void {
    this.isEnabled.set(value);
  }

  /**
   * Sets whether the radio item is checked
   *
   * @param value the value to set
   */
  public setIsChecked(value: boolean): void {
    this.selected.set(value);
  }

  /** @inheritDoc */
  render(): VNode | null {
    return (
      <div class="popup-menu-floating-radio-item">
        <span
          class={{ 'popup-menu-floating-radio-item-label': true, 'popup-menu-floating-radio-item-label-selected': this.selected }}
          style={{color: this.selected.map((selected) => selected ? this.props.selectedColor : 'unset')}}
        >
          {this.props.children}
        </span>
      </div>
    );
  }
}

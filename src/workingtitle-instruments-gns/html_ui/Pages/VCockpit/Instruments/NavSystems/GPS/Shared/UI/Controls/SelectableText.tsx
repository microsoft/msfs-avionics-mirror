import { FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { GNSUiControlProps, GNSUiControl } from '../GNSUiControl';

/** Props on the FPLEntry component. */
export interface SelectableTextProps extends GNSUiControlProps {
  /** The text data associated with this component. */
  data: Subscribable<string>,

  /**
   * Class to use instead of `selected`
   */
  selectedClass?: string,

  /**
   * Class to use instead of `darkened`
   */
  darkenedClass?: string,

  /** class prop*/
  class?: string;
}

/**
 * A UI control that display a flight plan entry line within the plan table.
 */
export class SelectableText extends GNSUiControl<SelectableTextProps> {
  private readonly text = FSComponent.createRef<HTMLDivElement>();

  /** @inheritdoc */
  protected onFocused(): void {
    this.text.instance.classList.add(this.props.selectedClass ?? 'selected');
  }

  /** @inheritdoc */
  protected onBlurred(): void {
    this.text.instance.classList.remove(this.props.selectedClass ?? 'selected');
  }

  /**
   * Sets whether the selectable text is darkened
   *
   * @param isDarkened the desired state to set
   */
  public setDarkened(isDarkened: boolean): void {
    if (isDarkened) {
      this.text.instance.classList.add(this.props.darkenedClass ?? 'darkened');
    } else {
      this.text.instance.classList.remove(this.props.darkenedClass ?? 'darkened');
    }
  }

  /**
   * Handles when the right inner knob is decremented.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onRightInnerDec(sender: GNSUiControl): boolean {
    return this.props.onRightInnerDec ? this.props.onRightInnerDec(sender) : false;
  }

  /**
   * Handles when the right inner knob is incremented.
   * @param sender The sender of this event.
   * @returns True if the event was handled, false otherwise.
   */
  public onRightInnerInc(sender: GNSUiControl): boolean {
    return this.props.onRightInnerInc ? this.props.onRightInnerInc(sender) : false;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.props.class} style={'display: inline-block;'} ref={this.text}>
        {this.props.data}
      </div>
    );
  }
}
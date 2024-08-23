import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

/**
 * The properties for the PopupMenu component.
 */
export interface PopupMenuProps extends ComponentProps {
  /** The text label of the menu */
  label?: string;
  /** Allows adding a CSS class. */
  class?: string;
}

/**
 * The PopupMenu component.
 */
export abstract class PopupMenu<T extends PopupMenuProps = PopupMenuProps> extends DisplayComponent<T> {

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={'popup-menu ' + this.props.class}>
        <div class="popup-menu-title">
          <span>{this.props.label}</span>
        </div>
        {this.props.children}
      </div>
    );
  }
}

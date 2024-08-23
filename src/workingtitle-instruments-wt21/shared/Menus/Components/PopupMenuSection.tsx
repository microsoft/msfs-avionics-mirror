import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

/**
 * The properties for the PopupMenu component.
 */
interface PopupMenuSectionProps extends ComponentProps {
  /** The text label of the section */
  label?: string;
}

/**
 * The PopupMenu component.
 */
export class PopupMenuSection extends DisplayComponent<PopupMenuSectionProps> {

  /** @inheritdoc */
  public onAfterRender(): void {
    // TODO do stuff
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="popup-menu-section">
        <div class="popup-menu-section-title">
          <span>{this.props.label}</span>
        </div>
        {this.props.children}
      </div>
    );
  }
}
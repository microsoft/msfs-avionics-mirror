import { FSComponent, VNode } from '@microsoft/msfs-sdk';

import { PopupMenu, PopupMenuProps } from './PopupMenu';

/**
 * The properties for the PopupSubMenu component.
 */
interface PopupSubMenuProps extends PopupMenuProps {
  /** The text label of the submenu */
  sublabel?: string;
  /** A css class to add to the top level div. */
  class?: string
}

/**
 * The PopupSubMenu component.
 */
export class PopupSubMenu extends PopupMenu<PopupSubMenuProps> {

  /** @inheritdoc */
  public onAfterRender(): void {
    // TODO do stuff
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={'popup-menu submenu ' + this.props.class}>
        <div class="popup-menu-title">
          <span>{this.props.label}</span>
        </div>
        <div class="popup-submenu-title">
          <svg viewBox="0 0 85 75">
            <path d="m 2 2 c 0 20 1 18 17 37 C 31 52 37 52 40 52 L 80 52 L 40 32 L 57 52 L 40 72 L 80 52" fill="none" stroke="var(--wt21-colors-white)" stroke-width="10"></path>
          </svg>
          <span>{this.props.sublabel}</span>
        </div>
        {this.props.children}
      </div>
    );
  }
}
import { FSComponent, VNode } from '@microsoft/msfs-sdk';

import { MenuViewService } from '../../UI/MenuViewService';
import { WT21UiControl, WT21UiControlProps } from '../../UI/WT21UiControl';

/**
 * The properties for the SubmenuLink component.
 */
interface SubmenuLinkProps extends WT21UiControlProps {
  /** The text label of the submenu link */
  label: string;

  /** The view id of the submenu to be opened */
  viewId: string;

  /** The menu view service. */
  viewService: MenuViewService;
}

/**
 * The SubmenuLink component.
 */
export class SubmenuLink extends WT21UiControl<SubmenuLinkProps> {
  private readonly el = FSComponent.createRef<HTMLDivElement>();

  /**
   * Handles upper knob push event to open the linked submenu.
   * @returns Whether the event was handled.
   */
  public onUpperKnobPush(): boolean {
    this.props.viewService.open(this.props.viewId);
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
    this.el.instance.classList.add('menudisabled');
  }

  /** @inheritdoc */
  protected onEnabled(): void {
    this.el.instance.classList.remove('menudisabled');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="popup-menu-line popup-menu-submenu" ref={this.el}>
        <svg height="22" width="15">
          <polygon points="0,0 15,11 0,22" fill="var(--wt21-colors-cyan)" />
        </svg>
        <span>{this.props.label}</span>
      </div>
    );
  }
}
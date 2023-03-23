import { FSComponent, Subscription, VNode } from '@microsoft/msfs-sdk';

import { GNSUiControl, GNSUiControlProps } from '../../GNSUiControl';
import { MenuEntry } from '../Pages';

import './PageMenuItem.css';

/** Props on the PageMenuItem component. */
export interface PageMenuItemProps extends GNSUiControlProps {
  /** The leg data associated with this component. */
  data: MenuEntry;

  /** A callback called when the menu item is selected. */
  onSelected: (item: PageMenuItem) => void;
}

/**
 * A UI control that displays items on a full page menu.
 */
export class PageMenuItem extends GNSUiControl<PageMenuItemProps> {
  private readonly label = FSComponent.createRef<HTMLDivElement>();
  private disabledSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    if (typeof this.props.data.disabled !== 'boolean') {
      this.disabledSub = this.props.data.disabled.sub(this.setDisabled.bind(this), true);
    } else {
      this.setDisabled(this.props.data.disabled);
    }
  }

  /** @inheritdoc */
  protected onDisabled(): void {
    this.label.instance.classList.add('page-menu-item-disabled');
  }

  /** @inheritdoc */
  protected onEnabled(): void {
    this.label.instance.classList.remove('page-menu-item-disabled');
  }

  /** @inheritdoc */
  protected onFocused(): void {
    this.label.instance.classList.add('selected');
  }

  /** @inheritdoc */
  protected onBlurred(): void {
    this.label.instance.classList.remove('selected');
  }

  /** @inheritdoc */
  public onEnt(): boolean {
    this.props.onSelected(this);
    return true;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='page-menu-entry'>
        <div ref={this.label}>{this.props.data.label}</div>
      </div>
    );
  }
}

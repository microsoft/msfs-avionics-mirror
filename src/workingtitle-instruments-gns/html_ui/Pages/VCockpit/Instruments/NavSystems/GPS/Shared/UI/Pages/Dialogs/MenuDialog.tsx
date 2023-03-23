import { ArraySubject, FocusPosition, FSComponent, Subject, Subscription, VNode } from '@microsoft/msfs-sdk';

import { Fms } from '@microsoft/msfs-garminsdk';

import { GNSUiControl, GNSUiControlList, GNSUiControlProps } from '../../GNSUiControl';
import { InteractionEvent } from '../../InteractionEvent';
import { MenuEntry, PageProps, ViewService } from '../Pages';
import { Dialog } from './Dialog';

import './MenuDialog.css';

/**
 * Props on the MenuDialog dialog page component.
 */
interface MenuDialogProps extends PageProps {
  /** An instance of the flight management system. */
  fms: Fms
}

/**
 * A dialog that displays a popup menu dialog.
 */
export class MenuDialog extends Dialog<MenuDialogProps> {
  private readonly menuItems = ArraySubject.create<MenuEntry>();
  private readonly hrEl = FSComponent.createRef<HTMLElement>();
  private readonly list = FSComponent.createRef<GNSUiControlList<any>>();
  private readonly title = Subject.create('PAGE MENU');

  /**
   * Sets the menu items that should display in this menu dialog.
   * @param items The menu items to display.
   */
  public setMenuItems(items: MenuEntry[] | readonly MenuEntry[]): void {
    this.menuItems.clear();
    this.menuItems.insertRange(0, items);

    const listEl = this.hrEl.instance.parentNode?.querySelector('.menu-list') as HTMLElement | null;
    if (listEl !== null) {
      listEl.style.height = `${Math.min(items.length * 16, 176)}px`;
    }
  }

  /**
   * Sets the menu title.
   * @param title The title of the menu.
   */
  public setTitle(title: string): void {
    this.title.set(title);
  }

  /**
   * Sets the currently selected item in the list.
   * @param index The index of the item to select.
   */
  public setSelectedItem(index: number): void {
    this.list.instance.getChild(index)?.focus(FocusPosition.First);
  }

  /** @inheritdoc */
  private onSelected(item: DialogMenuItem): void {
    if (typeof item.props.data.action === 'function') {
      item.props.data.action();
    } else {
      item.props.data.action.get()();
    }
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {
    if (evt === InteractionEvent.MENU) {
      ViewService.back();
      return true;
    }

    let handled = false;
    if (evt === InteractionEvent.RightInnerInc) {
      handled = this.list.instance.onInteractionEvent(evt);
    }

    if (evt === InteractionEvent.RightInnerDec) {
      handled = this.list.instance.onInteractionEvent(evt);
    }

    if (handled) {
      return handled;
    }

    return super.onInteractionEvent(evt);
  }

  /** @inheritdoc */
  public onSuspend(): void {
    super.onSuspend();
    this.title.set('PAGE MENU');
  }

  /** @inheritdoc */
  protected renderDialog(): VNode {
    return (
      <>
        <h2 class="cyan">{this.title}</h2>
        <hr ref={this.hrEl} />
        <GNSUiControlList<MenuEntry>
          ref={this.list}
          class='menu-list'
          data={this.menuItems}
          renderItem={(data): VNode => <DialogMenuItem data={data} onSelected={this.onSelected.bind(this)}/>}
          innerKnobScroll
        />
      </>
    );
  }
}

/**
 * Props on the DialogMenuItem control.
 */
interface DialogMenuItemProps extends GNSUiControlProps {
  /** The data for this menu list item. */
  data: MenuEntry;

  /** A callback called when the menu item is selected. */
  onSelected: (item: DialogMenuItem) => void;
}

/**
 * An item in the menu list dialog.
 */
class DialogMenuItem extends GNSUiControl<DialogMenuItemProps> {
  private readonly el = FSComponent.createRef<HTMLDivElement>();
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
    this.el.instance.classList.add('disabled');
  }

  /** @inheritdoc */
  protected onEnabled(): void {
    this.el.instance.classList.remove('disabled');
  }

  /** @inheritdoc */
  protected onFocused(): void {
    this.el.instance.classList.add('selected-white');
  }

  /** @inheritdoc */
  protected onBlurred(): void {
    this.el.instance.classList.remove('selected-white');
  }

  /** @inheritdoc */
  public onEnt(): boolean {
    this.props.onSelected(this);
    return true;
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    if (this.disabledSub !== undefined) {
      this.disabledSub.destroy();
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='menu-list-item' ref={this.el}>{this.props.data.label}</div>
    );
  }
}
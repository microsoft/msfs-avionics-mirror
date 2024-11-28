import { ArraySubject, FocusPosition, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';
import { GNSUiControl, GNSUiControlList, GNSUiControlProps } from '../GNSUiControl';

import './OptionDialog.css';

/**
 * Props on the WaypointPageSelector control.
 */
interface OptionDialogProps extends GNSUiControlProps {
  /** The label for the selector. */
  label: string;

  /** The CSS class to apply to this control. */
  class?: string;

  /** A callback called when an item is selected. */
  onSelected: (index: number, fromSet: boolean) => void;

  /** An optional callback called when the dialog is closed. */
  onClosed?: () => void;
}

/**
 * A control that allows a selection on a waypoint procedure page.
 *
 * TODO move this to Dialogs/ and extend Dialog<T> instead
 */
export class OptionDialog extends GNSUiControl<OptionDialogProps> {
  private readonly selectedItem = Subject.create('NONE');
  private readonly items = ArraySubject.create<string>();

  private readonly itemsList = FSComponent.createRef<GNSUiControlList<string>>();
  private readonly popout = FSComponent.createRef<HTMLDivElement>();

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.closePopout();
  }

  /**
   * Sets the available items in the selector.
   * @param items The items available in the selector.
   * @param notify Whether or not to notify onSelected.
   */
  public setItems(items: string[], notify = true): void {
    this.items.clear();
    this.items.insertRange(0, items);

    if (items.length !== 0) {
      this.selectedItem.set(this.items.get(0));
      this.setDisabled(false);

      notify && this.props.onSelected(0, true);
    } else {
      this.selectedItem.set('NONE');
      this.setDisabled(true);

      notify && this.props.onSelected(-1, true);
    }
  }

  /**
   * Handles when an item is selected in the list.
   * @param index The index of the selected item.
   */
  private onItemSelected(index: number): void {
    this.closePopout();
    this.props.onClosed && this.props.onClosed();

    this.selectedItem.set(this.items.get(index));
    this.props.onSelected(index, false);

    this.scroll('forward');
  }

  /** @inheritDoc */
  public onClr(): boolean {
    if (this.itemsList.instance.isFocused) {
      this.closePopout();
      this.props.onClosed && this.props.onClosed();
      return true;
    }

    return false;
  }

  /** @inheritDoc */
  public onRightInnerInc(): boolean {
    if (this.itemsList.instance.isFocused) {
      this.scroll('forward');
    } else {
      this.openPopout();
    }

    return true;
  }

  /** @inheritDoc */
  public onRightInnerDec(): boolean {
    if (this.itemsList.instance.isFocused) {
      this.scroll('backward');
    } else {
      this.openPopout();
    }

    return true;
  }

  /** @inheritDoc */
  public onRightKnobPush(): boolean {
    if (this.itemsList.instance.isFocused) {
      this.closePopout();
      this.props.onClosed && this.props.onClosed();
      return true;
    }

    return true;
  }

  /**
   * Opens the item selection popout, optionally to a selected index.
   * @param focusedIndex Index to focus; by default most recent.
   */
  public openPopout(focusedIndex?: number): void {

    const parent = this.popout.instance.parentElement;
    if (parent !== null) {
      const rect = parent.getBoundingClientRect();
      this.popout.instance.style.top = `${rect.top + 24}px`;
    }

    this.itemsList.instance.setDisabled(false);
    this.popout.instance.classList.remove('hide-element');

    if (focusedIndex !== undefined) {
      const child = this.itemsList.instance.getChild(focusedIndex);

      if (child !== undefined) {
        child.focus(FocusPosition.MostRecent);
        this.selectedItem.set(this.items.get(focusedIndex));
      }
    } else {
      this.itemsList.instance.focus(FocusPosition.MostRecent);
    }
  }

  /**
   * Selects the item index.
   * @param index The index we want to select.
   */
  public setSelectedItem(index: number): void {
    if (index < this.items.length && index >= 0) {
      this.selectedItem.set(this.items.get(index));
      this.itemsList.instance.setFocusedIndex(index);
    }
  }

  /**
   * Closes the item selection popout.
   */
  public closePopout(): void {
    this.itemsList.instance.setDisabled(true);
    this.popout.instance.classList.add('hide-element');

    this.focus(FocusPosition.None);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={`option-dialog ${this.props.class ?? ''}`}>
        <div class='dialog-box' ref={this.popout}>
          <div class='dialog-box-inner'>
            <h2 class="cyan">{this.props.label}</h2>
            <hr />
            <GNSUiControlList<string>
              ref={this.itemsList}
              class='dialog-box-items'
              data={this.items}
              innerKnobScroll
              isolateScroll
              renderItem={(label, index): VNode => <OptionDialogItem label={label} onSelected={(): void => this.onItemSelected(index)} />}
            />
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Props on the OptionDialogItem control.
 */
interface OptionDialogItemProps extends GNSUiControlProps {
  /** The label for this item. */
  label: string;

  /** A callback called when an item is selected. */
  onSelected: () => void;
}

/**
 * An item in the option dialog selector list.
 */
class OptionDialogItem extends GNSUiControl<OptionDialogItemProps> {
  private readonly el = FSComponent.createRef<HTMLDivElement>();

  /** @inheritDoc */
  protected onFocused(): void {
    this.el.instance.classList.add('selected-white');
  }

  /** @inheritDoc */
  protected onBlurred(): void {
    this.el.instance.classList.remove('selected-white');
  }

  /** @inheritDoc */
  public onEnt(): boolean {
    this.props.onSelected();
    return true;
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='option-dialog-item' ref={this.el}>{this.props.label}</div>
    );
  }
}
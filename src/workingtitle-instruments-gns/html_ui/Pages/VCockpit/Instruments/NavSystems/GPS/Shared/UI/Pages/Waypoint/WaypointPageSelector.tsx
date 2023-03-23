import { ArraySubject, FocusPosition, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { GNSUiControl, GNSUiControlList, GNSUiControlProps } from '../../GNSUiControl';

import './WaypointPageSelector.css';

/**
 * Props on the WaypointPageSelector control.
 */
interface WaypointPageSelectorProps extends GNSUiControlProps {
  /** The label for the selector. */
  label: string;

  /** The CSS class to apply to this control. */
  class?: string;

  /** A callback called when an item is selected. */
  onSelected: (index: number) => void;
}

/**
 * A control that allows a selection on a waypoint procedure page.
 */
export class WaypointPageSelector extends GNSUiControl<WaypointPageSelectorProps> {
  private readonly selectedItem = Subject.create('NONE');
  private readonly items = ArraySubject.create<string>();

  private readonly itemsList = FSComponent.createRef<GNSUiControlList<string>>();
  private readonly popout = FSComponent.createRef<HTMLDivElement>();
  private readonly selection = FSComponent.createRef<HTMLDivElement>();

  /**
   * Gets the current number of items in the items list.
   * @returns The current number of items in the items list.
   */
  public get listLength(): number {
    return this.items.length;
  }

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.closePopout();
    this.onBlurred();
  }

  /**
   * Sets the available items in the selector.
   * @param items The items available in the selector.
   */
  public setItems(items: string[]): void {
    this.items.clear();
    this.items.insertRange(0, items);

    if (items.length !== 0) {
      this.selectedItem.set(this.items.get(0));
      this.setDisabled(false);
    } else {
      this.selectedItem.set('NONE');
      this.setDisabled(true);
    }
  }

  /**
   * Handles when an item is selected in the list.
   * @param index The index of the selected item.
   */
  private onItemSelected(index: number): void {
    this.closePopout();

    this.selectedItem.set(this.items.get(index));
    this.props.onSelected(index);

    this.scroll('forward');
  }

  /** @inheritdoc */
  protected onFocused(): void {
    this.selection.instance.classList.add('selected');
    this.selection.instance.classList.remove('paused');
  }

  /** @inheritdoc */
  protected onBlurred(): void {
    this.selection.instance.classList.remove('selected');
  }

  /**
   * Pauses selection animations.
   */
  protected pauseAnimations(): void {
    this.selection.instance.classList.add('paused');
  }

  /** @inheritdoc */
  public onClr(): boolean {
    if (this.itemsList.instance.isFocused) {
      this.closePopout();
      return true;
    }

    return false;
  }

  /** @inheritdoc */
  public onRightInnerInc(): boolean {
    if (this.itemsList.instance.isFocused) {
      this.scroll('forward');
    } else {
      this.openPopout();
    }

    return true;
  }

  /** @inheritdoc */
  public onRightInnerDec(): boolean {
    if (this.itemsList.instance.isFocused) {
      this.scroll('backward');
    } else {
      this.openPopout();
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
    setTimeout(() => this.pauseAnimations());
  }


  /**
   * Selects the item index.
   * @param index The index we want to select.
   * @param notify Whether or not to notify onSelected.
   */
  public setSelectedItem(index: number, notify = true): void {
    if (index < this.items.length && index >= 0) {
      this.selectedItem.set(this.items.get(index));
      this.itemsList.instance.setFocusedIndex(index);

      notify && this.props.onSelected(index);
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

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={`waypoint-page-selector ${this.props.class ?? ''}`}>
        <div class='waypoint-page-selector-label'>{this.props.label}</div>
        <div class='waypoint-page-selector-box'>
          <div class='waypoint-page-selector-selected' ref={this.selection}>{this.selectedItem}</div>
        </div>
        <div class='dialog-box' ref={this.popout}>
          <div class='dialog-box-inner'>
            <h2>{this.props.label}</h2>
            <hr />
            <GNSUiControlList<string>
              data={this.items}
              ref={this.itemsList}
              innerKnobScroll
              isolateScroll
              class='waypoint-page-selector-items'
              renderItem={(label, index): VNode => <WaypointPageSelectorItem label={label} onSelected={(): void => this.onItemSelected(index)} />}
              onRightKnobPush={() => this.onClr()}
            />
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Props on the WaypointPageSelectorItem control.
 */
interface WaypointPageSelectorItemProps extends GNSUiControlProps {
  /** The label for this item. */
  label: string;

  /** A callback called when an item is selected. */
  onSelected: () => void;
}

/**
 * An item in the waypoint page selector list.
 */
class WaypointPageSelectorItem extends GNSUiControl<WaypointPageSelectorItemProps> {
  private readonly el = FSComponent.createRef<HTMLDivElement>();

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
    this.props.onSelected();
    return true;
  }

  /**
   * Renders if there is a GPS vertical unit for the given selector.
   * @returns The Vertical units for GPS
   */
  private renderText(): VNode {
    if (this.props.label.endsWith('GPS')) {
      return (<div class='waypoint-page-selector-item' ref={this.el}>{this.props.label.slice(0, -4)}É</div>);
    } else {
      return (<div class='waypoint-page-selector-item' ref={this.el}>{this.props.label}</div>);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      this.renderText()
    );
  }
}
import { ArraySubject, FSComponent, SetSubject, Subject, Subscribable, SubscribableUtils, Subscription, VNode } from '@microsoft/msfs-sdk';

import { UiList } from '../../Shared/Components/List/UiList';
import { UiListButton } from '../../Shared/Components/List/UiListButton';
import { AbstractUiView } from '../../Shared/UiSystem/AbstractUiView';
import { UiDialogResult, UiDialogView } from '../../Shared/UiSystem/UiDialogView';
import { UiInteractionEvent } from '../../Shared/UiSystem/UiInteraction';

import './UiListDialog.css';

/** The parameters needed to display a selection list for {@link UiListDialog}. */
export type UiListDialogParams<T> = {
  /**
   * An array of list item definitions. Each definition defines one selectable value and how the value is to be
   * displayed in the list.
   */
  inputData: ListDialogItemDefinition<T>[];

  /**
   * The currently selected value. The list will initially scroll to and focus the list item associated with the
   * selected value (unless overridden by `scrollToValue`). The list item associated with the selected value is also
   * optionally highlighted depending on the value of `highlightSelectedValue`.
   */
  selectedValue?: T | Subscribable<T>;

  /** Whether to highlight the list item associated with the selected value. Defaults to `false`. */
  highlightSelectedValue?: boolean;

  /**
   * The value associated with the list item to which to initially scroll. If not defined, then the list will initially
   * scroll to the list item associated with the selected value (if one exists).
   */
  scrollToValue?: T;

  /** Whether to style the rendered buttons in the list as list items instead of touchscreen buttons. */
  styleButtonsAsListItems?: boolean;

  /** CSS class(es) to apply to the dialog's root element. */
  class?: string;

  /**
   * The width of the dialog, in pixels. If not defined, then the dialog width is controlled by the
   * `--ui-list-dialog-width` custom CSS variable.
   */
  dialogWidth?: number;

  /** The height of each list item, in pixels. */
  listItemHeightPx?: number;

  /** The amount of space between each list item, in pixels. */
  listItemSpacingPx?: number;

  /** The number of list items per page to display. Defaults to 5. */
  itemsPerPage?: number;

  /**
   * The maximum number of list items that can be rendered simultaneously. The value will be clamped to be greater than
   * or equal to `itemsPerPage * 3`. Defaults to 25.
   */
  maxRenderedItemCount?: number;

  /**
   * Whether to automatically disable overscrolling when the total height of all the selection list's items does not
   * exceed the list's visible height. Defaults to `false`.
   */
  autoDisableOverscroll?: boolean;

  /**
   * Whether to show the list's scroll bar. If `true`, then space is always reserved for the scroll bar, and its
   * visibility depends on the `fadeScrollBar` option. If `false`, then no space is reserved for the scroll bar and it
   * is always hidden. If `auto`, then space is reserved for the scroll bar if and only if the total height of all the
   * list's items exceeds the list's visible height. Defaults to `auto`.
   */
  showScrollBar?: boolean | 'auto';

  /**
   * Whether to fade out the selection list's scroll bar when the total height of all the list's items is less than or
   * equal to the list's visible height. Space is reserved for the scroll bar even when it is faded out. Defaults to
   * `true`.
   */
  fadeScrollBar?: boolean;
}

/**
 * A definition for a selection list item in a {@link UiListDialog}.
 */
export type ListDialogItemDefinition<T> = {
  /** A function which renders the list item button's label. */
  labelRenderer: () => string | VNode;

  /** The value to return out of the dialog when the list item is selected. */
  value: T;

  /**
   * A callback function to execute when a list item button is pressed. The function should accept the value of the
   * item as a parameter and return whether the pending request should be fulfilled with the value. If not defined,
   * pressing the button will always fulfill the pending request with the value of the list item.
   */
  onPressed?: (value: T) => boolean | Promise<boolean>;

  /** Whether the list item button is enabled or not. Defaults to true. */
  isEnabled?: boolean;

  /** A callback function to execute when the list item is destroyed. */
  onDestroy?: () => void;
};

/**
 * A pop-up dialog which allows the user to select an item from a vertically scrolling list.
 */
export class UiListDialog extends AbstractUiView implements UiDialogView<UiListDialogParams<any>, any> {
  private static readonly RESERVED_CLASSES = ['ui-list-dialog'];

  private readonly listRef = FSComponent.createRef<UiList<any>>();

  private readonly rootCssClass = SetSubject.create(['ui-list-dialog']);

  private readonly listItemHeightPxDefault = this.props.uiService.gduFormat === '460' ? 100 : 50;
  private readonly listItemSpacingPxDefault = this.props.uiService.gduFormat === '460' ? 2 : 2;

  private readonly dialogWidthStyle = Subject.create<string | undefined>(undefined);
  private readonly listItemLengthPx = Subject.create(this.listItemHeightPxDefault);
  private readonly listItemSpacingPx = Subject.create(this.listItemSpacingPxDefault);
  private readonly itemsPerPage = Subject.create(5);
  private readonly maxRenderedItemCount = Subject.create(25);
  private readonly autoDisableOverscroll = Subject.create(false);
  private readonly showScrollBar = Subject.create<boolean | 'auto'>('auto');
  private readonly fadeScrollBar = Subject.create<boolean>(true);

  private readonly data: ArraySubject<ListDialogItemDefinition<any>> = ArraySubject.create();

  private cssClassesToAdd?: string[];

  private readonly selectedValue = Subject.create<any>(undefined);
  private selectedValuePipe?: Subscription;

  private readonly highlightedValue = Subject.create<any>(undefined);
  private readonly highlightedValuePipe = this.selectedValue.pipe(this.highlightedValue, true);

  private styleButtonsAsListItems = false;

  private resolveFunction?: (value: any) => void;
  private resultObject: UiDialogResult<any> = {
    wasCancelled: true,
  };

  private isAlive = true;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.listRef.instance.knobLabelState.pipe(this._knobLabelState);
  }

  /**
   * Requests a selected value from this dialog. Based on the input parameters, the dialog will display a list of
   * buttons, each one causing a certain value to be selected when pressed.
   * @param input The input parameters.
   * @returns A Promise which is fulfilled with the selected value when a selection is made, or with an empty payload
   * if this dialog is closed or `request()` is called again before a selection is made.
   * @throws Error if the dialog has been destroyed.
   */
  public request<T>(input: UiListDialogParams<T>): Promise<UiDialogResult<T>> {
    if (!this.isAlive) {
      throw new Error('UiListDialog: cannot request from a dead dialog');
    }

    return new Promise<UiDialogResult<T>>((resolve) => {
      this.cleanupList();

      if (this.cssClassesToAdd !== undefined) {
        for (const cssClass of this.cssClassesToAdd) {
          this.rootCssClass.delete(cssClass);
        }

        this.cssClassesToAdd = undefined;
      }

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      const {
        inputData,
        selectedValue,
        highlightSelectedValue,
        class: cssClassesToAdd,
        dialogWidth,
        listItemHeightPx,
        listItemSpacingPx,
        itemsPerPage,
        maxRenderedItemCount,
        autoDisableOverscroll,
        showScrollBar,
        fadeScrollBar
      } = input;

      this.dialogWidthStyle.set(dialogWidth === undefined ? undefined : `${dialogWidth}px`);
      this.listItemLengthPx.set(listItemHeightPx ?? this.listItemHeightPxDefault);
      this.listItemSpacingPx.set(listItemSpacingPx ?? this.listItemSpacingPxDefault);
      this.itemsPerPage.set(itemsPerPage ?? 5);
      this.maxRenderedItemCount.set(maxRenderedItemCount ?? 25);
      this.autoDisableOverscroll.set(autoDisableOverscroll ?? false);
      this.showScrollBar.set(showScrollBar ?? 'auto');
      this.fadeScrollBar.set(fadeScrollBar ?? true);

      if (cssClassesToAdd !== undefined) {
        this.cssClassesToAdd = FSComponent.parseCssClassesFromString(cssClassesToAdd, cssClass => !UiListDialog.RESERVED_CLASSES.includes(cssClass));

        for (const cssClass of this.cssClassesToAdd) {
          this.rootCssClass.add(cssClass);
        }
      }

      this.styleButtonsAsListItems = input.styleButtonsAsListItems ?? false;

      this.data.set(inputData);

      if (SubscribableUtils.isSubscribable(selectedValue)) {
        this.selectedValuePipe = selectedValue.pipe(this.selectedValue);
      } else {
        this.selectedValue.set(selectedValue);
      }

      if (highlightSelectedValue) {
        this.highlightedValuePipe.resume(true);
      }

      const valueToScroll = input.scrollToValue ?? this.selectedValue.get();

      let indexToScrollTo = this.data.getArray().findIndex(def => def.value === valueToScroll);
      if (indexToScrollTo < 0) {
        indexToScrollTo = 0;
      }

      this.listRef.getOrDefault()?.scrollToIndex(indexToScrollTo, Math.ceil(this.itemsPerPage.get() / 2) - 1, true, false);
    });
  }

  /** @inheritDoc */
  public onClose(): void {
    this.cleanupList();
  }

  /** @inheritdoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.listRef.instance.onUiInteractionEvent(event);
  }

  /**
   * Clears this dialog's list and resolves the pending request Promise if one exists.
   */
  private cleanupList(): void {
    this.selectedValuePipe?.destroy();
    this.selectedValuePipe = undefined;

    this.highlightedValuePipe.pause();
    this.highlightedValue.set(undefined);

    this.data.clear();

    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /**
   * Renders a button for an item defintion.
   * @param itemDef The item definition for which to render the button.
   * @returns A rendered button for the specified item definition, as a VNode.
   */
  private renderButton(itemDef: ListDialogItemDefinition<any>): VNode {
    const isHighlighted = this.highlightedValue.map(value => value === itemDef.value);
    const acceptValue = (accept: boolean): void => {
      if (accept) {
        this.resultObject = {
          wasCancelled: false,
          payload: itemDef.value,
        };
        this.props.uiService.goBackMfd();
      }
    };

    return (
      <UiListButton
        fullSize={true}
        useListItemStyle={this.styleButtonsAsListItems}
        isHighlighted={isHighlighted}
        label={itemDef.labelRenderer()}
        isEnabled={itemDef.isEnabled ?? true}
        onPressed={(): void => {
          let accept: boolean | Promise<boolean> = true;

          if (itemDef.onPressed) {
            accept = itemDef.onPressed(itemDef.value);
          }

          if (typeof accept === 'boolean') {
            acceptValue(accept);
          } else {
            accept.then(acceptValue);
          }
        }}
        onDestroy={(): void => {
          itemDef.onDestroy && itemDef.onDestroy();
          isHighlighted.destroy();
        }}
      />
    );
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div
        class={this.rootCssClass}
        style={{
          '--ui-list-dialog-requested-width': this.dialogWidthStyle
        }}
      >
        <UiList<any>
          ref={this.listRef}
          bus={this.props.uiService.bus}
          validKnobIds={this.props.uiService.validKnobIds}
          data={this.data}
          renderItem={this.renderButton.bind(this)}
          itemsPerPage={this.itemsPerPage}
          maxRenderedItemCount={this.maxRenderedItemCount}
          listItemLengthPx={this.listItemLengthPx}
          listItemSpacingPx={this.listItemSpacingPx}
          autoDisableOverscroll={this.autoDisableOverscroll}
          showScrollBar={this.showScrollBar}
          fadeScrollBar={this.fadeScrollBar}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    this.cleanupList();

    super.destroy();
  }
}
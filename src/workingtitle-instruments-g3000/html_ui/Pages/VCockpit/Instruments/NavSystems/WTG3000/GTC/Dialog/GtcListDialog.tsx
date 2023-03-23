import { GtcView } from '../GtcService/GtcView';
import { GtcDialogResult, GtcDialogView } from './GtcDialogView';
import { ArraySubject, FSComponent, SetSubject, Subject, Subscribable, SubscribableUtils, Subscription, VNode } from '@microsoft/msfs-sdk';
import { GtcList } from '../Components/List';
import { GtcListButton } from '../Components/List/GtcListButton';

import './GtcListDialog.css';

/** The parameters needed to display a selection list for {@link GtcListDialog}. */
export type GtcListDialogParams<T> = {
  /**
   * An array of list item definitions. Each definition defines one selectable value and how the value is to be
   * displayed in the list.
   */
  inputData: ListDialogItemDefinition<T>[];

  /** The GTC view title to display with the selection list. */
  title?: string;

  /** The currently selected value. The list item associated with the selected value will be highlighted. */
  selectedValue?: T | Subscribable<T>;

  /** Scrolls to the given value when opened, overrides the scrolling behavior of selectedValue. */
  scrollToValue?: T;

  /** CSS class(es) to apply to the dialog's root element. */
  class?: string

  /** Height of each list item in pixels. */
  listItemHeightPx?: number,

  /** How much space between each list item in pixels. */
  listItemSpacingPx?: number;

  /** The number of list items per page to display. Defaults to 5. */
  itemsPerPage?: number;

  /**
   * The maximum number of list items that can be rendered simultaneously. The value will be clamped to be greater than
   * or equal to `itemsPerPage * 3`. Defaults to 25.
   */
  maxRenderedItemCount?: number;
}

/**
 * A definition for a selection list item in a {@link GtcListDialog}.
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
 * A pop-up dialog which allows the user to select an item from a scrolling list.
 */
export class GtcListDialog extends GtcView implements GtcDialogView<GtcListDialogParams<any>, any> {
  private readonly listRef = FSComponent.createRef<GtcList<any>>();

  private readonly rootCssClass = SetSubject.create(['gtc-list-dialog']);

  private readonly listItemHeightPxDefault = this.gtcService.isHorizontal ? 123 : 66;
  private readonly listItemSpacingPxDefault = this.gtcService.isHorizontal ? 10 : 5;

  private readonly listItemHeightPx = Subject.create(this.listItemHeightPxDefault);
  private readonly listItemSpacingPx = Subject.create(this.listItemSpacingPxDefault);
  private readonly itemsPerPage = Subject.create(5);
  private readonly maxRenderedItemCount = Subject.create(25);

  private readonly data: ArraySubject<ListDialogItemDefinition<any>> = ArraySubject.create();

  private cssClassesToAdd?: string[];

  private readonly selectedValue = Subject.create<any>(undefined);
  private selectedValuePipe?: Subscription;

  private resolveFunction?: (value: any) => void;
  private resultObject: GtcDialogResult<any> = {
    wasCancelled: true,
  };

  private isAlive = true;

  /** @inheritDoc */
  public onAfterRender(): void {
    this._activeComponent.set(this.listRef.instance);
  }

  /**
   * Requests a selected value from this dialog. Based on the input parameters, the dialog will display a list of
   * buttons, each one causing a certain value to be selected when pressed.
   * @param input The input parameters.
   * @returns A Promise which is fulfilled with the selected value when a selection is made, or with an empty payload
   * if this dialog is closed or `request()` is called again before a selection is made.
   * @throws Error if the dialog has been destroyed.
   */
  public request<T>(input: GtcListDialogParams<T>): Promise<GtcDialogResult<T>> {
    if (!this.isAlive) {
      throw new Error('GtcListDialog: cannot request from a dead dialog');
    }

    return new Promise<GtcDialogResult<T>>((resolve) => {
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

      const { inputData, title, selectedValue, class: cssClassesToAdd, listItemHeightPx, listItemSpacingPx, itemsPerPage, maxRenderedItemCount } = input;

      this.listItemHeightPx.set(listItemHeightPx ?? this.listItemHeightPxDefault);
      this.listItemSpacingPx.set(listItemSpacingPx ?? this.listItemSpacingPxDefault);
      this.itemsPerPage.set(itemsPerPage ?? 5);
      this.maxRenderedItemCount.set(maxRenderedItemCount ?? 25);

      if (cssClassesToAdd !== undefined) {
        this.cssClassesToAdd = FSComponent.parseCssClassesFromString(cssClassesToAdd).filter(cssClass => cssClass !== 'gtc-list-dialog');

        for (const cssClass of this.cssClassesToAdd) {
          this.rootCssClass.add(cssClass);
        }
      }

      this._title.set(title);
      this.data.set(inputData);

      if (SubscribableUtils.isSubscribable(selectedValue)) {
        this.selectedValuePipe = selectedValue.pipe(this.selectedValue);
      } else {
        this.selectedValue.set(selectedValue);
      }

      const valueToScroll = input.scrollToValue ?? this.selectedValue.get();

      const indexToScrollTo = this.data.getArray().findIndex(def => def.value === valueToScroll);

      this.listRef.getOrDefault()?.scrollToIndex(indexToScrollTo, 2, false);
    });
  }

  /** @inheritDoc */
  public override onClose(): void {
    this.cleanupList();
  }

  /**
   * Clears this dialog's list and resolves the pending request Promise if one exists.
   */
  private cleanupList(): void {
    this.selectedValuePipe?.destroy();
    this.selectedValuePipe = undefined;

    this.data.clear();

    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  private readonly renderButton = (itemDef: ListDialogItemDefinition<any>): VNode => {
    const isHighlighted = this.selectedValue.map(value => value === itemDef.value);
    const acceptValue = (accept: boolean): void => {
      if (this.props.gtcService.activeView.get().ref === this && accept) {
        this.resultObject = {
          wasCancelled: false,
          payload: itemDef.value,
        };
        this.props.gtcService.goBack();
      }
    };

    return (
      <GtcListButton
        fullSizeButton={true}
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
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass}>
        <GtcList<any>
          ref={this.listRef}
          bus={this.bus}
          data={this.data}
          renderItem={this.renderButton}
          sidebarState={this._sidebarState}
          itemsPerPage={this.itemsPerPage}
          maxRenderedItemCount={this.maxRenderedItemCount}
          listItemHeightPx={this.listItemHeightPx}
          listItemSpacingPx={this.listItemSpacingPx}
        ></GtcList>
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
import {
  DisplayComponent, FSComponent, MutableSubscribable, MutableSubscribableInputType, NodeReference, SetSubject, Subject,
  Subscription, VNode,
} from '@microsoft/msfs-sdk';

import { UiValueTouchButton, UiValueTouchButtonProps } from '../../../Shared/Components/TouchButton/UiValueTouchButton';
import { UiFocusableComponent } from '../../../Shared/UiSystem/UiFocusTypes';
import { UiService } from '../../../Shared/UiSystem/UiService';
import { UiPopupOpenOptions } from '../../../Shared/UiSystem/UiViewStack';
import { UiViewOcclusionType, UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { UiListDialog, UiListDialogParams } from '../../Dialogs/UiListDialog';
import { UiViewUtils } from '../../../Shared/UiSystem/UiViewUtils';

import './UiListSelectTouchButton.css';

/**
 * Component props for UiListSelectTouchButton.
 */
export interface UiListSelectTouchButtonProps<S extends MutableSubscribable<any, any>>
  extends Omit<UiValueTouchButtonProps<S>, 'state' | 'onPressed' | 'gduFormat'> {

  /** The UI service. */
  uiService: UiService;

  /** The view stack layer in which to open the button's UI list dialog. */
  listDialogLayer: UiViewStackLayer;

  /** The key of the UI list dialog the button will open as a selection list. */
  listDialogKey: string;

  /**
   * Whether to open the button's UI list dialog as a positioned popup. If `false`, then the dialog will be opened as a
   * normal popup. Defaults to `false`.
   */
  openDialogAsPositioned?: boolean;

  /**
   * A reference to the UI view container that contains the button. Required in order to open the button's UI list
   * dialog as a positioned popup.
   */
  containerRef?: NodeReference<HTMLElement>;

  /**
   * The reference corner of the button's UI list dialog, which will be aligned to the button if
   * `openDialogAsPositioned` is `true`. Defaults to `top-left`.
   */
  dialogPositionReference?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /**
   * The edges of the button to which to align the reference corner of the button's UI list dialog. Ignored if
   * `openDialogAsPositioned` is `false`. Defaults to `top-left`.
   */
  dialogPositionAlign?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /**
   * The horizontal offset to apply to the button's UI list dialog positioning after alignment with the button, in
   * pixels. Ignored if `openDialogAsPositioned` is `false`. Defaults to `0`.
   */
  dialogPositionXOffset?: number;

  /**
   * The vertical offset to apply to the button's UI list dialog positioning after alignment with the button, in
   * pixels. Ignored if `openDialogAsPositioned` is `false`. Defaults to `0`.
   */
  dialogPositionYOffset?: number;

  /** The occlusion type to apply to views beneath the UI list dialog popup. Defaults to `'darken'`. */
  dialogBackgroundOcclusion?: UiViewOcclusionType;

  /** Whether to hide the button's dropdown arrow. Defaults to `false`. */
  hideDropdownArrow?: boolean;

  /** A mutable subscribable whose state will be bound to the button. */
  state: S;

  /**
   * When true, the button will be highlighted while the list is open, and the isHighlighted prop will be ignored.
   * Defaults to false.
   */
  highlightButtonWhileListIsOpen?: boolean;

  /**
   * Parameters to pass to the selection list dialog, or a function which will return the parameters when called each
   * time the list is opened.
   */
  listParams: UiListDialogParams<MutableSubscribableInputType<S>>
  | (<B extends UiListSelectTouchButton<S> = UiListSelectTouchButton<S>>(state: S, button: B) => UiListDialogParams<MutableSubscribableInputType<S>>);

  /**
   * A callback function which will be called each time a value is selected from a list dialog opened by the button. If
   * not defined, then selecting a value from the list will automatically set the button's bound state.
   */
  onSelected?: <B extends UiListSelectTouchButton<S> = UiListSelectTouchButton<S>>(value: MutableSubscribableInputType<S>, state: S, button: B) => void;

  /**
   * A callback function which will be called each time a list dialog opened by the button is closed before a value is
   * selected.
   */
  onCancelled?: <B extends UiListSelectTouchButton<S> = UiListSelectTouchButton<S>>(state: S, button: B) => void;
}

/**
 * A touchscreen button which displays the value of a bound state and when pressed, opens a selection list dialog to
 * optionally set the value of the bound state.
 *
 * The button uses a {@link UiValueTouchButton} for rendering and touch functionality. All children are rendered as
 * children of the `UiValueTouchButton`.
 */
export class UiListSelectTouchButton<S extends MutableSubscribable<any>> extends DisplayComponent<UiListSelectTouchButtonProps<S>> {
  private static readonly RESERVED_CLASSES = ['ui-list-select-button', 'ui-list-select-button-no-dropdown'];

  private readonly buttonRef = FSComponent.createRef<UiValueTouchButton<S>>();

  private readonly isListOpen = Subject.create(false);

  private readonly listParamsFunc = typeof this.props.listParams === 'function'
    ? this.props.listParams
    : (): UiListDialogParams<MutableSubscribableInputType<S>> => this.props.listParams as UiListDialogParams<MutableSubscribableInputType<S>>;

  /** A reference to this button's focusable component. */
  public readonly focusableComponentRef = this.buttonRef as NodeReference<UiFocusableComponent & DisplayComponent<any>>;

  private cssClassSub?: Subscription | Subscription[];

  /**
   * Gets this button's root HTML element.
   * @returns This button's root HTML element.
   * @throws Error if this button has not yet been rendered.
   */
  public getRootElement(): HTMLElement {
    return this.buttonRef.instance.getRootElement();
  }

  /**
   * Simulates this button being pressed. This will execute the `onPressed()` callback if one is defined.
   * @param ignoreDisabled Whether to simulate the button being pressed regardless of whether the button is disabled.
   * Defaults to `false`.
   */
  public simulatePressed(ignoreDisabled = false): void {
    this.buttonRef.getOrDefault()?.simulatePressed(ignoreDisabled);
  }

  /**
   * Responds to when this button is pressed.
   * @param button The button that was pressed.
   * @param state The button's bound state.
   */
  private async onPressed(button: UiValueTouchButton<S>, state: S): Promise<void> {
    this.isListOpen.set(true);

    const result = await this.props.uiService.openMfdPopup<UiListDialog>(
      this.props.listDialogLayer,
      this.props.listDialogKey,
      false,
      this.getDialogOpenOptions()
    ).ref.request(this.listParamsFunc(state, this));

    this.isListOpen.set(false);

    if (!result.wasCancelled) {
      if (this.props.onSelected === undefined) {
        state.set(result.payload);
      } else {
        this.props.onSelected && this.props.onSelected(result.payload, state, this);
      }
    } else {
      this.props.onCancelled && this.props.onCancelled(state, this);
    }
  }

  /**
   * Gets the options to use when opening the UI list dialog.
   * @returns The options to use when opening the UI list dialog.
   */
  private getDialogOpenOptions(): UiPopupOpenOptions {
    if (this.props.openDialogAsPositioned && this.props.containerRef) {
      return UiViewUtils.alignPositionedPopupToElement(
        {
          popupType: 'positioned',
          backgroundOcclusion: this.props.dialogBackgroundOcclusion
        },
        this.props.containerRef.instance,
        this.getRootElement(),
        this.props.dialogPositionReference,
        this.props.dialogPositionAlign,
        this.props.dialogPositionXOffset,
        this.props.dialogPositionYOffset
      );
    } else {
      return {
        popupType: 'normal',
        backgroundOcclusion: this.props.dialogBackgroundOcclusion
      };
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      cssClass = SetSubject.create();
      cssClass.add('ui-list-select-button');
      cssClass.toggle('ui-list-select-button-no-dropdown', this.props.hideDropdownArrow === true);

      this.cssClassSub = FSComponent.bindCssClassSet(cssClass, this.props.class, UiListSelectTouchButton.RESERVED_CLASSES);
    } else {
      cssClass = `ui-list-select-button ${this.props.hideDropdownArrow === true ? 'ui-list-select-button-no-dropdown' : ''}`;

      if (this.props.class) {
        cssClass += ' ' + FSComponent.parseCssClassesFromString(this.props.class, classToAdd => !UiListSelectTouchButton.RESERVED_CLASSES.includes(classToAdd)).join(' ');
      }
    }

    return (
      <UiValueTouchButton
        ref={this.buttonRef}
        state={this.props.state}
        isEnabled={this.props.isEnabled}
        isHighlighted={this.props.highlightButtonWhileListIsOpen ? this.isListOpen : this.props.isHighlighted}
        isVisible={this.props.isVisible}
        label={this.props.label}
        renderValue={this.props.renderValue}
        onTouched={this.props.onTouched}
        onPressed={this.onPressed.bind(this)}
        onHoldStarted={this.props.onHoldStarted}
        onHoldTick={this.props.onHoldTick}
        onHoldEnded={this.props.onHoldEnded}
        focusOnDrag={this.props.focusOnDrag}
        inhibitOnDrag={this.props.inhibitOnDrag}
        inhibitOnDragAxis={this.props.inhibitOnDragAxis}
        dragThresholdPx={this.props.dragThresholdPx}
        isInList={this.props.isInList}
        listScrollAxis={this.props.listScrollAxis}
        gduFormat={this.props.uiService.gduFormat}
        focusController={this.props.focusController}
        canBeFocused={this.props.canBeFocused}
        focusOptions={this.props.focusOptions}
        class={cssClass}
      >
        {this.props.hideDropdownArrow !== true && this.renderDropdownArrow()}
        <div class='ui-list-select-button-children'>
          {this.props.children}
        </div>
      </UiValueTouchButton>
    );
  }

  /**
   * Renders this button's dropdown arrow and divider.
   * @returns This button's rendered dropdown arrow and divider, as a VNode.
   */
  private renderDropdownArrow(): VNode {
    return (
      <>
        <div class='ui-list-select-button-dropdown-divider' />
        <svg viewBox='0 0 20 20' preserveAspectRatio='none' class='ui-list-select-button-dropdown-arrow'>
          <path d='M 12.03 17.8 l 7.66 -13.26 c 0.9 -1.56 -0.22 -3.51 -2.03 -3.51 h -15.32 c -1.8 0 -2.93 1.96 -2.03 3.51 l 7.66 13.26 c 0.9 1.56 3.15 1.56 4.05 0 z' />
        </svg>
      </>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.buttonRef.getOrDefault()?.destroy();

    if (this.cssClassSub) {
      if (Array.isArray(this.cssClassSub)) {
        for (const sub of this.cssClassSub) {
          sub.destroy();
        }
      } else {
        this.cssClassSub.destroy();
      }
    }

    super.destroy();
  }
}
import {
  ComponentProps, DisplayComponent, FSComponent, SetSubject, SubscribableSet, Subscription, ToggleableClassNameRecord,
  VNode
} from '@microsoft/msfs-sdk';

import { UiTouchButton, UiTouchButtonProps } from '../TouchButton/UiTouchButton';
import { UiListFocusable } from './UiListFocusable';
import { UiListItem } from './UiListItem';

import './UiListButton.css';

/**
 * Component props for UiListButton.
 */
export interface UiListButtonProps extends ComponentProps, Pick<UiTouchButtonProps,
  'isEnabled' | 'isHighlighted' | 'label' | 'onTouched' | 'onPressed' | 'onHoldStarted' | 'onHoldTick' | 'onHoldEnded'
  | 'onFocusGained' | 'onFocusLost' | 'gduFormat' | 'canBeFocused'
> {

  /**
   * Whether to render the button as a full-size button. A full-size button takes up the entire space allotted to the
   * the list item and is not surrounded by a visible border (besides the button's own border). Defaults to `false`.
   */
  fullSize?: boolean;

  /**
   * Whether to style the button to appear as a list item instead of a touchscreen button. Ignored if `fullSize` is
   * `false`. Defaults to `false`.
   */
  useListItemStyle?: boolean;

  /** A callback function to execute when the list item is destroyed. */
  onDestroy?: () => void;

  /** CSS class(es) to apply to the button's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A touchscreen button used at the top level of a GtcList list item. Handles cleaning up the TouchButton on destroy.
 */
export class UiListButton extends DisplayComponent<UiListButtonProps> {
  private static readonly RESERVED_CLASSES = ['ui-list-button', 'ui-list-button-full', 'ui-list-button-list-item-style'];
  private static readonly BASE_CLASSES = ['ui-list-button'];

  private thisNode?: VNode;
  private childrenNode?: VNode;

  private cssClassSub?: Subscription | Subscription[];

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;
  }

  /** @inheritdoc */
  public render(): VNode {
    const cssClass = SetSubject.create(UiListButton.BASE_CLASSES);

    cssClass.toggle('ui-list-button-full', this.props.fullSize === true);
    cssClass.toggle('ui-list-button-list-item-style', this.props.fullSize === true && this.props.useListItemStyle === true);

    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(cssClass, this.props.class, UiListButton.RESERVED_CLASSES);
    } else if (this.props.class) {
      for (const classToAdd of FSComponent.parseCssClassesFromString(this.props.class, classToFilter => !UiListButton.RESERVED_CLASSES.includes(classToFilter))) {
        cssClass.add(classToAdd);
      }
    }

    return (
      <UiListItem
        designatedChildDrivesFocusable
        hideBorder={this.props.fullSize}
      >
        <UiListFocusable>
          <UiTouchButton
            label={this.props.label}
            isEnabled={this.props.isEnabled}
            isHighlighted={this.props.isHighlighted}
            onTouched={this.props.onTouched}
            onPressed={this.props.onPressed}
            onHoldStarted={this.props.onHoldStarted}
            onHoldTick={this.props.onHoldTick}
            onHoldEnded={this.props.onHoldEnded}
            onFocusGained={this.props.onFocusGained}
            onFocusLost={this.props.onFocusLost}
            isInList
            gduFormat={this.props.gduFormat}
            canBeFocused={this.props.canBeFocused}
            class={cssClass}
          >
            {this.childrenNode = <>{this.props.children}</>}
          </UiTouchButton>
        </UiListFocusable>
      </UiListItem>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);
    this.childrenNode && FSComponent.shallowDestroy(this.childrenNode);

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
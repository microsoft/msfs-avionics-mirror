import { ComponentProps, DisplayComponent, FSComponent, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { TouchButtonOnTouchedAction } from '@microsoft/msfs-garminsdk';

import { UiFocusController } from '../../UiSystem/UiFocusController';
import { UiFocusDirection, UiFocusableComponent } from '../../UiSystem/UiFocusTypes';
import { UiInteractionEvent, UiInteractionHandler } from '../../UiSystem/UiInteraction';
import { UiTouchButton } from '../TouchButton/UiTouchButton';
import { UiListFocusable } from './UiListFocusable';

import './UiListItem.css';

/**
 * Component props for UiListItem.
 */
export interface UiListItemProps extends ComponentProps {
  /**
   * Whether the list item's designated focusable child determines whether the list item can be focused. If `true`,
   * then the list item can be focused if and only if the designated child exists and can be focused. If `false`, then
   * the list item can always be focused. Defaults to `false`.
   */
  designatedChildDrivesFocusable?: boolean;

  /** Whether to hide the list item's border. Defaults to `false`. */
  hideBorder?: boolean;

  /**
   * A function which is called when the list item gains UI focus.
   * @param direction The direction from which the list item gained focus.
   */
  onFocusGained?: (direction: UiFocusDirection) => void;

  /**
   * A function which is called when the list item loses UI focus.
   */
  onFocusLost?: () => void;

  /** A callback function to execute when the list item is destroyed. */
  onDestroy?: () => void;
}

/**
 * An item meant to be rendered within a UI list as a list item. The item consists of a root container which can be
 * focused by touching it. Additionally, one descendant of the item can be designated as a focusable component
 * by wrapping it with a {@link UiListFocusable}. If a focusable component is designated, it will gain focus
 * when the item gains focus and vice versa. If multiple descendants are wrapped with {@link UiListFocusable},
 * then only the first one found using a depth-first search will be designated.
 *
 * By default, the item is highlighted with a cyan border when it is focused unless its designated focusable component
 * is also focused.
 */
export class UiListItem extends DisplayComponent<UiListItemProps> implements UiInteractionHandler {
  /** @inheritdoc */
  public readonly isUiFocusableComponent = true;

  private readonly rootButtonRef = FSComponent.createRef<UiTouchButton>();

  private thisNode?: VNode;
  private childrenNode?: VNode;

  private readonly _canBeFocused = Subject.create(false);
  /** @inheritdoc */
  public readonly canBeFocused = this._canBeFocused as Subscribable<boolean>;

  private readonly focusController = new UiFocusController();

  private readonly isChildFocusable = Subject.create(false);

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    let focusableComponent: UiListFocusable | undefined;

    if (this.childrenNode) {
      FSComponent.visitNodes(this.childrenNode, node => {
        if (focusableComponent) {
          return true;
        }

        if (node.instance instanceof UiListFocusable) {
          focusableComponent = node.instance;
          return true;
        }

        return false;
      });
    }

    if (focusableComponent) {
      this.focusController.setActive(true);
      this.focusController.register(focusableComponent);
      focusableComponent.canBeFocused.pipe(this.isChildFocusable);

      this.focusController.focusedComponent.sub(this.onFocusedComponentChanged.bind(this), true);
    }

    if (this.props.designatedChildDrivesFocusable) {
      this._canBeFocused.set(false);
      focusableComponent?.canBeFocused.pipe(this._canBeFocused);
    } else {
      this._canBeFocused.set(true);
    }
  }

  /** @inheritdoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.focusController.onUiInteractionEvent(event);
  }

  /**
   * Responds to when this list item's root button gains focus.
   * @param button This list item's root button.
   * @param direction The direction from which the root button gained focus.
   */
  private onFocusGained(button: UiTouchButton, direction: UiFocusDirection): void {
    this.focusController.setFocusIndex(0, direction);

    this.props.onFocusGained && this.props.onFocusGained(direction);
  }

  /**
   * Responds to when this list item's root button loses focus.
   */
  private onFocusLost(): void {
    this.focusController.removeFocus();

    this.props.onFocusLost && this.props.onFocusLost();
  }

  /**
   * Responds to when this list item's focusable child gains or loses focus.
   * @param component This list item's focusable child if it gained focus, or `null` if the child lost focus.
   */
  private onFocusedComponentChanged(component: UiFocusableComponent | null): void {
    if (component !== null) {
      this.rootButtonRef.instance.focusSelf();
    }
  }

  /**
   * Responds to when this list item's root button is touched.
   * @param button The button that was touched.
   * @returns The action to take as a result of the button being touched.
   */
  private onTouched(button: UiTouchButton): TouchButtonOnTouchedAction {
    button.focusSelf();
    return TouchButtonOnTouchedAction.Ignore;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div
        class={{
          'ui-list-item': true,
          'ui-list-item-hide-border': this.props.hideBorder ?? false,
          'ui-list-item-focusable-child': this.isChildFocusable
        }}
      >
        <UiListFocusable>
          <UiTouchButton
            ref={this.rootButtonRef}
            canBeFocused={this._canBeFocused}
            onTouched={this.onTouched.bind(this)}
            onFocusGained={this.onFocusGained.bind(this)}
            onFocusLost={this.onFocusLost.bind(this)}
            focusOptions={{
              onUiInteractionEvent: this.onUiInteractionEvent.bind(this)
            }}
            focusOnDrag={false}
            class='ui-list-item-button'
          >
            {this.childrenNode = <>{this.props.children}</>}
          </UiTouchButton>
        </UiListFocusable>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);
    this.childrenNode && FSComponent.shallowDestroy(this.childrenNode);

    super.destroy();
  }
}
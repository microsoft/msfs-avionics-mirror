import {
  ComponentProps, DisplayComponent, FSComponent, SetSubject, Subscribable, SubscribableSet, SubscribableUtils,
  Subscription, ToggleableClassNameRecord, VNode
} from '@microsoft/msfs-sdk';

import { TouchButton, TouchButtonOnTouchedAction } from '@microsoft/msfs-garminsdk';

import { UiFocusController } from '../../UiSystem/UiFocusController';
import { UiFocusDirection, UiFocusableComponent } from '../../UiSystem/UiFocusTypes';
import { UiInteractionEvent } from '../../UiSystem/UiInteraction';

import './CombinedTouchButton.css';
import './TouchButton.css';

/**
 * Component props for CombinedTouchButton.
 */
export interface CombinedTouchButtonProps extends ComponentProps {
  /** The direction along which the component's child buttons are arranged. */
  orientation: 'row' | 'col';

  /** Whether the combined button should be rendered as a focusable component. Defaults to `false`. */
  isFocusable?: boolean;

  /**
   * A UI focus controller with which to automatically register the component after it is rendered. If not defined,
   * then the component will not be automatically registered with any controller, but it may still be registered
   * manually. Ignored if `isFocusable` is `false`.
   */
  focusController?: UiFocusController;

  /** Whether the component can be focused. Ignored if `isFocusable` is `false`. Defaults to `false`. */
  canBeFocused?: boolean | Subscribable<boolean>;

  /**
   * Whether the combined button should attempt to focus itself when one of its child buttons is touched. Ignored if
   * `isFocusable` is `false`. Defaults to `false`.
   */
  focusSelfOnTouch?: boolean;

  /**
   * A function which is called when the component is registered with a UI focus controller.
   */
  onRegistered?: (combinedButton: CombinedTouchButton, controller: UiFocusController) => void;

  /**
   * A function which is called when the component is deregistered with a UI focus controller.
   */
  onDeregistered?: (combinedButton: CombinedTouchButton, controller: UiFocusController) => void;

  /**
   * A function which is called when the component gains focus.
   */
  onFocusGained?: (combinedButton: CombinedTouchButton, direction: UiFocusDirection) => void;

  /**
   * A function which is called when the component loses focus.
   */
  onFocusLost?: (combinedButton: CombinedTouchButton) => void;

  /**
   * A function which handles {@link UiInteractionEvent|UiInteractionEvents} routed to the component. If not defined,
   * then the component will not handle any events.
   */
  onUiInteractionEvent?: (event: UiInteractionEvent) => boolean;

  /** CSS class(es) to apply to the component's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A wrapper component which renders child touchscreen buttons in a single row or column surrounded by a single
 * contiguous border and separated by border-like dividers.
 */
export class CombinedTouchButton extends DisplayComponent<CombinedTouchButtonProps> implements UiFocusableComponent {
  private static readonly RESERVED_CLASSES = [
    'combined-touch-button',
    'combined-touch-button-row',
    'combined-touch-button-col',
    'combined-touch-button-focused',
  ];

  private thisNode?: VNode;

  private readonly cssClass = SetSubject.create<string>();

  /** @inheritDoc */
  public readonly isUiFocusableComponent = (this.props.isFocusable ?? false) as any;

  /** @inheritDoc */
  public readonly canBeFocused = SubscribableUtils.toSubscribable(this.isUiFocusableComponent ? (this.props.canBeFocused ?? false) : false, true);

  private parentController?: UiFocusController;

  private cssClassSub?: Subscription | Subscription[];

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    if (this.isUiFocusableComponent) {
      this.props.focusController?.register(this);
    }
  }

  /**
   * Attempts to set focus on this combined button. If this button was not rendered as a focusable component, then this
   * method does nothing.
   */
  public focusSelf(): void {
    if (!this.isUiFocusableComponent) {
      return;
    }

    this.parentController?.setFocus(this);
  }

  /** @inheritDoc */
  public onRegistered(controller: UiFocusController): void {
    this.parentController = controller;

    this.props.onRegistered && this.props.onRegistered(this, controller);
  }

  /** @inheritDoc */
  public onDeregistered(controller: UiFocusController): void {
    this.parentController = undefined;

    this.props.onDeregistered && this.props.onDeregistered(this, controller);
  }

  /** @inheritDoc */
  public onFocusGained(direction: UiFocusDirection): void {
    this.cssClass.add('combined-touch-button-focused');

    this.props.onFocusGained && this.props.onFocusGained(this, direction);
  }

  /** @inheritDoc */
  public onFocusLost(): void {
    this.cssClass.delete('combined-touch-button-focused');

    this.props.onFocusLost && this.props.onFocusLost(this);
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.props.onUiInteractionEvent ? this.props.onUiInteractionEvent(event) : false;
  }

  /**
   * Responds to when one of this combined button's child button is touched.
   * @param originalCallback The original `onTouched` callback assigned to the child button.
   * @param button The child button that was touched.
   * @returns The action to take as a result of the child button being touched.
   */
  private onChildButtonTouched(
    originalCallback: ((button: TouchButton) => TouchButtonOnTouchedAction) | undefined,
    button: TouchButton
  ): TouchButtonOnTouchedAction {
    this.focusSelf();
    return originalCallback ? originalCallback(button) : TouchButtonOnTouchedAction.Prime;
  }

  /** @inheritDoc */
  public render(): VNode {
    this.cssClass.add('combined-touch-button');
    this.cssClass.add(`combined-touch-button-${this.props.orientation}`);

    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.cssClass, this.props.class, CombinedTouchButton.RESERVED_CLASSES);
    } else if (this.props.class) {
      for (const classToAdd of FSComponent.parseCssClassesFromString(this.props.class, classToFilter => !CombinedTouchButton.RESERVED_CLASSES.includes(classToFilter))) {
        this.cssClass.add(classToAdd);
      }
    }

    return (
      <div class={this.cssClass}>
        {this.renderContent()}
      </div>
    );
  }

  /**
   * Renders this component's content.
   * @returns This component's rendered content, as a VNode.
   */
  private renderContent(): VNode {
    // Render children to a node.
    const childrenNode = <>{this.props.children}</>;

    // Enumerate all first-level HTML elements and DisplayComponents.

    const childNodes: VNode[] = [];

    const focusSelfOnTouch = this.isUiFocusableComponent && this.props.focusSelfOnTouch === true;

    FSComponent.visitNodes(childrenNode, node => {
      if (node.instance !== null && typeof node.instance === 'object') {
        childNodes.push(node);

        // If we are supposed to focus ourselves when a child button is touched, we need to traverse the subtree
        // of the child node to find any TouchButton instances and hook into the onTouched callback.
        if (focusSelfOnTouch) {
          FSComponent.visitNodes(node, innerNode => {
            if (innerNode.instance instanceof TouchButton) {
              const button = node.instance as TouchButton;
              const originalOnTouched = button.props.onTouched;
              button.props.onTouched = this.onChildButtonTouched.bind(this, originalOnTouched);

              return true;
            } else {
              return false;
            }
          });
        }

        return true;
      } else {
        return false;
      }
    });

    // Insert one divider between each pair of adjacent child nodes.

    const contentNodes: VNode[] = [];
    for (let i = 0; i < childNodes.length; i++) {
      if (i === 0) {
        contentNodes.push(childNodes[i]);
      } else {
        contentNodes.push(
          <>
            <div class='combined-touch-button-divider' />
            {childNodes[i]}
          </>
        );
      }
    }

    return <>{contentNodes}</>;
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

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
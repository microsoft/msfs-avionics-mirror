import { ComponentProps, DisplayComponent, FSComponent, MappedSubject, Subject, Subscribable, SubscribableMapFunctions, VNode } from '@microsoft/msfs-sdk';

import { UiInteractionEvent } from '../../UiSystem';
import { UiFocusController } from '../../UiSystem/UiFocusController';
import { UiFocusDirection, UiFocusableComponent } from '../../UiSystem/UiFocusTypes';

/**
 * Component props for {@link UiListFocusable}.
 */
export interface UiListFocusableProps extends ComponentProps {
  /**
   * Whether the wrapper should automatically try to focus another descendant if the focused descendant loses focus
   * because it could no longer be focused. Defaults to `false`.
   */
  autoRefocus?: boolean;
}

/**
 * A wrapper which designates one or more descendants as components to focus for a rendered item in a UI list. If
 * multiple focusable components are designated, then changing focus between the designated components using the bezel
 * rotary knobs is supported.
 */
export class UiListFocusable extends DisplayComponent<UiListFocusableProps> implements UiFocusableComponent {
  /** @inheritDoc */
  public readonly isUiFocusableComponent = true;

  private thisNode?: VNode;

  private readonly _canBeFocused = Subject.create(false);
  /** @inheritDoc */
  public readonly canBeFocused = this._canBeFocused as Subscribable<boolean>;

  private readonly focusController = new UiFocusController();
  private lastFocusedComponent: UiFocusableComponent | null = null;

  private parentController?: UiFocusController;

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    const focusableComponents: UiFocusableComponent[] = [];

    FSComponent.visitNodes(thisNode, node => {
      if (node !== thisNode && node.instance instanceof DisplayComponent && (node.instance as any).isUiFocusableComponent === true) {
        focusableComponents.push(node.instance as unknown as UiFocusableComponent);
        return true;
      }

      return false;
    });

    if (focusableComponents.length > 0) {
      this.focusController.setActive(true);

      for (let i = 0; i < focusableComponents.length; i++) {
        this.focusController.register(focusableComponents[i]);
      }

      MappedSubject.create(
        SubscribableMapFunctions.or(),
        ...focusableComponents.map(component => component.canBeFocused)
      ).pipe(this._canBeFocused);

      this.focusController.focusedComponent.sub(this.onFocusedComponentChanged.bind(this), true);
    }
  }

  /** @inheritDoc */
  public onRegistered(controller: UiFocusController): void {
    this.parentController = controller;

    const focusedComponent = this.focusController.focusedComponent.get();
    if (focusedComponent) {
      this.parentController.setFocus(this);
    }
  }

  /** @inheritDoc */
  public onDeregistered(): void {
    this.parentController = undefined;

    this.focusController.removeFocus();
  }

  /** @inheritDoc */
  public onFocusGained(direction: UiFocusDirection): void {
    if (this.focusController.focusedComponent.get()) {
      return;
    }

    switch (direction) {
      case UiFocusDirection.Recent:
        this.focusController.focusRecent();
        break;
      case UiFocusDirection.Backward:
        this.focusController.focusLast(UiFocusDirection.Backward);
        break;
      case UiFocusDirection.Forward:
      default:
        this.focusController.focusFirst(UiFocusDirection.Forward);
    }
  }

  /** @inheritDoc */
  public onFocusLost(): void {
    this.focusController.removeFocus();
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    if (this.focusController.onUiInteractionEvent(event)) {
      return true;
    }

    const currentFocusedComponent = this.focusController.focusedComponent.get();

    if (currentFocusedComponent) {
      switch (event) {
        case UiInteractionEvent.SingleKnobOuterInc:
        case UiInteractionEvent.SingleKnobInnerInc:
        case UiInteractionEvent.LeftKnobOuterInc:
        case UiInteractionEvent.LeftKnobInnerInc:
        case UiInteractionEvent.RightKnobOuterInc:
        case UiInteractionEvent.RightKnobInnerInc:
          this.focusController.focusNext();
          return currentFocusedComponent !== this.focusController.focusedComponent.get();
        case UiInteractionEvent.SingleKnobOuterDec:
        case UiInteractionEvent.SingleKnobInnerDec:
        case UiInteractionEvent.LeftKnobOuterDec:
        case UiInteractionEvent.LeftKnobInnerDec:
        case UiInteractionEvent.RightKnobOuterDec:
        case UiInteractionEvent.RightKnobInnerDec:
          this.focusController.focusPrevious();
          return currentFocusedComponent !== this.focusController.focusedComponent.get();
      }
    }

    return false;
  }

  /**
   * Responds to when this component's focused descendant changes.
   * @param component This component's focused descendant, or `null` if none of this component's designated descendants
   * have focus.
   */
  private onFocusedComponentChanged(component: UiFocusableComponent | null): void {
    if (component === null) {
      if (this.props.autoRefocus) {
        this.tryRefocus(this.lastFocusedComponent);
      }

      if (!this.focusController.focusedComponent.get()) {
        this.lastFocusedComponent = null;
        this.parentController?.removeFocus(this);
      }
    } else {
      this.lastFocusedComponent = component;
      this.parentController?.setFocus(this);
    }
  }

  /**
   * Attempts to focus another descendant after the most recently focused descendant has lost focus. Another
   * descendant will be focused only if the most recently focused descendant can no longer be focused.
   * @param lastFocusedComponent The most recently focused descendant.
   */
  private tryRefocus(lastFocusedComponent: UiFocusableComponent | null): void {
    if (!lastFocusedComponent || lastFocusedComponent.canBeFocused.get()) {
      return;
    }

    const lastFocusedIndex = this.focusController.registeredComponents.indexOf(lastFocusedComponent);

    // Attempt to focus another child by searching forwards, then backwards.
    for (let i = lastFocusedIndex + 1; i < this.focusController.registeredComponents.length; i++) {
      const item = this.focusController.registeredComponents[i];
      if (item.canBeFocused.get()) {
        this.focusController.setFocusIndex(i);
        return;
      }
    }
    for (let i = lastFocusedIndex - 1; i >= 0; i--) {
      const item = this.focusController.registeredComponents[i];
      if (item.canBeFocused.get()) {
        this.focusController.setFocusIndex(i);
        return;
      }
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <>
        {this.props.children}
      </>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.parentController?.deregister(this);

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}
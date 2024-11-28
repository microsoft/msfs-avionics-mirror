import { FilteredMapSubject, MutableSubscribableMap, Subject, Subscribable, SubscribableMap, Subscription } from '@microsoft/msfs-sdk';

import { UiFocusDirection, UiFocusableComponent } from './UiFocusTypes';
import { UiInteractionEvent, UiInteractionHandler } from './UiInteraction';
import { UiKnobId } from './UiKnobTypes';
import { UiInteractionUtils } from './UiInteractionUtils';

/**
 * A controller for setting focus on UI components.
 */
export class UiFocusController implements UiInteractionHandler {
  private readonly validKnobIds: Set<UiKnobId>;

  private readonly _registeredComponents: UiFocusableComponent[] = [];
  /** The components registered with this controller. */
  public readonly registeredComponents = this._registeredComponents as readonly UiFocusableComponent[];

  private readonly isActive = Subject.create(false);

  private readonly _focusedComponent = Subject.create<UiFocusableComponent | null>(null);
  /** The component currently focused by this controller, or `null` if there is no such component. */
  public readonly focusedComponent = this._focusedComponent as Subscribable<UiFocusableComponent | null>;

  private readonly _knobLabelState: MutableSubscribableMap<UiKnobId, string>;
  /** The bezel rotary knob label state requested by this controller. */
  public readonly knobLabelState: SubscribableMap<UiKnobId, string>;

  private focusedIndex = -1;

  private recentFocusedComponent: UiFocusableComponent | null = null;

  private readonly canBeFocusedHandler = this.onComponentCanBeFocusedChanged.bind(this);
  private canBeFocusedSub?: Subscription;

  /**
   * Creates a new instance of UiFocusController. The controller is initialized to the inactive state.
   * @param validKnobIds The IDs of the valid bezel rotary knobs that can be used to change the component focused by
   * the new controller. If not defined, then knobs cannot be used to change the component focused by the controller.
   */
  public constructor(validKnobIds?: Iterable<UiKnobId>) {
    this.validKnobIds = new Set(validKnobIds);
    this._knobLabelState = FilteredMapSubject.create<UiKnobId, string>(this.validKnobIds);
    this.knobLabelState = this._knobLabelState;
  }

  /**
   * Registers a component with this controller. Once registered, the component can be focused by this controller.
   * @param component The component to register.
   */
  public register(component: UiFocusableComponent): void {
    if (this._registeredComponents.includes(component)) {
      return;
    }

    this._registeredComponents.push(component);
    component.onRegistered(this);
  }

  /**
   * Deregisters a component with this controller. Once deregistered, the component can no longer be focused by this
   * controller.
   * @param component The component to deregister.
   */
  public deregister(component: UiFocusableComponent): void {
    const index = this._registeredComponents.indexOf(component);

    if (index < 0) {
      return;
    }

    if (index === this.focusedIndex) {
      this.removeFocus();
    }

    this._registeredComponents.splice(index, 1);

    if (index < this.focusedIndex) {
      this.focusedIndex--;
    }

    component.onDeregistered(this);
  }

  /**
   * Sets whether this controller is active. This controller can only set focus on components when it is active. If
   * this controller is deactivated, then any component focused by this controller will immediately lose focus.
   * @param active Whether to activate this controller.
   */
  public setActive(active: boolean): void {
    if (active) {
      this._knobLabelState.setValue(UiKnobId.SingleOuter, 'Move Selector');
      this._knobLabelState.setValue(UiKnobId.SingleInner, 'Move Selector');
      this._knobLabelState.setValue(UiKnobId.LeftOuter, 'Move Selector');
      this._knobLabelState.setValue(UiKnobId.LeftInner, 'Move Selector');
      this._knobLabelState.setValue(UiKnobId.RightOuter, 'Move Selector');
      this._knobLabelState.setValue(UiKnobId.RightInner, 'Move Selector');
    } else {
      this._knobLabelState.delete(UiKnobId.SingleOuter);
      this._knobLabelState.delete(UiKnobId.SingleInner);
      this._knobLabelState.delete(UiKnobId.LeftOuter);
      this._knobLabelState.delete(UiKnobId.LeftInner);
      this._knobLabelState.delete(UiKnobId.RightOuter);
      this._knobLabelState.delete(UiKnobId.RightInner);

      this.removeFocus();
    }

    this.isActive.set(active);
  }

  /**
   * Sets focus on a registered component. If this controller is not active, then this method does nothing.
   * @param component The component on which to set focus. If the component is not registered with this controller,
   * then focus will not be set.
   * @param direction The direction from which to set focus on the component. Defaults to
   * {@link UiFocusDirection.Unspecified}.
   */
  public setFocus(component: UiFocusableComponent, direction = UiFocusDirection.Unspecified): void {
    if (!this.isActive.get()) {
      return;
    }

    this.setFocusIndex(this._registeredComponents.indexOf(component), direction);
  }

  /**
   * Sets focus on a registered component by index. If this controller is not active, then this method does nothing.
   * @param index The index of the component on which to set focus. If the index is out of bounds, then focus will
   * not be set.
   * @param direction The direction from which to set focus on the component. Defaults to
   * {@link UiFocusDirection.Unspecified}.
   */
  public setFocusIndex(index: number, direction = UiFocusDirection.Unspecified): void {
    if (!this.isActive.get()) {
      return;
    }

    const toFocus = this._registeredComponents[index] as UiFocusableComponent | undefined;
    if (toFocus && this.focusedIndex !== index && toFocus.canBeFocused.get()) {
      const oldFocused = this._registeredComponents[this.focusedIndex] as UiFocusableComponent | undefined;

      this.canBeFocusedSub?.destroy();
      this.canBeFocusedSub = toFocus.canBeFocused.sub(this.canBeFocusedHandler);
      this.focusedIndex = index;
      this.recentFocusedComponent = toFocus;
      this._focusedComponent.set(toFocus);

      oldFocused?.onFocusLost();
      toFocus.onFocusGained(direction);
    }
  }

  /**
   * Removes focus from a focused component.
   * @param component The component from which to remove focus. Defaults to the component currently focused by this
   * controller.
   */
  public removeFocus(component?: UiFocusableComponent): void {
    if (!component || this._focusedComponent.get() === component) {
      const oldFocused = this._registeredComponents[this.focusedIndex] as UiFocusableComponent | undefined;

      this.canBeFocusedSub?.destroy();
      this.canBeFocusedSub = undefined;
      this.focusedIndex = -1;
      this._focusedComponent.set(null);

      oldFocused?.onFocusLost();
    }
  }

  /**
   * Attempts to change focus to the first registered focusable component.
   * @param direction The direction from which to set focus on the component. Defaults to
   * {@link UiFocusDirection.Unspecified}.
   */
  public focusFirst(direction = UiFocusDirection.Unspecified): void {
    for (let i = 0; i < this._registeredComponents.length; i++) {
      if (this._registeredComponents[i].canBeFocused.get()) {
        this.setFocusIndex(i, direction);
        break;
      }
    }
  }

  /**
   * Attempts to change focus to the last registered focusable component.
   * @param direction The direction from which to set focus on the component. Defaults to
   * {@link UiFocusDirection.Unspecified}.
   */
  public focusLast(direction = UiFocusDirection.Unspecified): void {
    for (let i = this._registeredComponents.length - 1; i >= 0; i--) {
      if (this._registeredComponents[i].canBeFocused.get()) {
        this.setFocusIndex(i, direction);
        break;
      }
    }
  }

  /**
   * Attempts to change focus to the next registered focusable component after the currently focused component. If
   * there is no currently focused component, then attempts to focus the registered focusable component with the
   * smallest index.
   */
  public focusNext(): void {
    this.changeFocus(1);
  }

  /**
   * Attempts to change focus to the previous registered focusable component before the currently focused component. If
   * there is no currently focused component, then attempts to focus the registered focusable component with the
   * largest index.
   */
  public focusPrevious(): void {
    this.changeFocus(-1);
  }

  /**
   * Attempts to change focus to the most recently focused component. Has no effect if a component is currently focused
   * or if there is no most recently focused component.
   */
  public focusRecent(): void {
    if (this.focusedIndex > -1 || this.recentFocusedComponent === null) {
      return;
    }

    this.setFocus(this.recentFocusedComponent, UiFocusDirection.Recent);
  }

  /**
   * Clears this controller's memory of the most recently focused component. Has no effect if a component is currently
   * focused.
   */
  public clearRecentFocus(): void {
    if (this.focusedIndex > -1) {
      return;
    }

    this.recentFocusedComponent = null;
  }

  /** @inheritdoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    if (!this.isActive.get()) {
      return false;
    }

    if (this._focusedComponent.get()?.onUiInteractionEvent(event)) {
      return true;
    }

    switch (event) {
      case UiInteractionEvent.SingleKnobOuterInc:
      case UiInteractionEvent.SingleKnobInnerInc:
      case UiInteractionEvent.LeftKnobOuterInc:
      case UiInteractionEvent.LeftKnobInnerInc:
      case UiInteractionEvent.RightKnobOuterInc:
      case UiInteractionEvent.RightKnobInnerInc:
        if (this.validKnobIds.has(UiInteractionUtils.KNOB_EVENT_TO_KNOB_ID[event])) {
          this.changeFocus(1);
          return true;
        }
        break;
      case UiInteractionEvent.SingleKnobOuterDec:
      case UiInteractionEvent.SingleKnobInnerDec:
      case UiInteractionEvent.LeftKnobOuterDec:
      case UiInteractionEvent.LeftKnobInnerDec:
      case UiInteractionEvent.RightKnobOuterDec:
      case UiInteractionEvent.RightKnobInnerDec:
        if (this.validKnobIds.has(UiInteractionUtils.KNOB_EVENT_TO_KNOB_ID[event])) {
          this.changeFocus(-1);
          return true;
        }
        break;
    }

    return false;
  }

  /**
   * Changes the component focused by this controller by focusing the next or previous registered component relative
   * to the currently focused component.
   * @param direction The direction in which to change focus (`1` = focus the next component, `-1` = focus the previous
   * component).
   */
  private changeFocus(direction: 1 | -1): void {
    const startIndex = this.focusedIndex < 0
      ? direction === 1 ? -1 : this._registeredComponents.length
      : this.focusedIndex;

    const count = direction === 1 ? this._registeredComponents.length - startIndex : startIndex + 1;

    for (let i = 1; i < count; i++) {
      const index = startIndex + i * direction;
      const component = this._registeredComponents[index];
      if (component.canBeFocused.get()) {
        this.setFocusIndex(index, direction === 1 ? UiFocusDirection.Forward : UiFocusDirection.Backward);
        break;
      }
    }
  }

  /**
   * Responds to when whether this controller's currently focused component can be focused changes.
   * @param canBeFocused Whether this controller's currently focused component can be focused.
   */
  private onComponentCanBeFocusedChanged(canBeFocused: boolean): void {
    if (!canBeFocused) {
      this.removeFocus();
    }
  }

  /**
   * Destroys this controller.
   */
  public destroy(): void {
    this.canBeFocusedSub?.destroy();
  }
}
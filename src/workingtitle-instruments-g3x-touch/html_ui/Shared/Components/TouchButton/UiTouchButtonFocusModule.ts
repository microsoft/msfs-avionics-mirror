import {
  DisplayComponent, FSComponent, MappedSubject, MappedSubscribable, SetSubject, Subscribable, SubscribableMapFunctions, SubscribableSet,
  SubscribableUtils, Subscription, ToggleableClassNameRecord
} from '@microsoft/msfs-sdk';

import { UiFocusController } from '../../UiSystem/UiFocusController';
import { UiFocusableComponent } from '../../UiSystem/UiFocusTypes';
import { UiInteractionEvent } from '../../UiSystem/UiInteraction';

/**
 * A touch button that can be focused.
 */
export interface FocusableTouchButton extends DisplayComponent<any>, UiFocusableComponent {
  /**
   * Simulates this button being pressed.
   * @param ignoreDisabled Whether to simulate the button being pressed regardless of whether the button is disabled.
   * Defaults to `false`.
   */
  simulatePressed(ignoreDisabled?: boolean): void;
}

/**
 * Options for {@link UiTouchButtonFocusModule}.
 */
export type UiTouchButtonFocusModuleOptions = {
  /**
   * A function which handles {@link UiInteractionEvent|UiInteractionEvents} routed to the module. If not defined, then
   * the module will handle bezel rotary knob press events by calling the `simulatePressed()` method of its parent
   * button and ignore all other events.
   */
  onUiInteractionEvent?: (event: UiInteractionEvent) => boolean;
};

/**
 * A module which handles UI focus for a touchscreen button.
 *
 * The module syncs whether it can be focused with whether its parent button is enabled. When registered with a focus
 * controller, the module will attempt to set focus on itself. Finally, the module handles adding the
`ui-button-focused` CSS class to the button's class list when focused.
 */
export class UiTouchButtonFocusModule implements UiFocusableComponent {
  /** @inheritdoc */
  public readonly isUiFocusableComponent = true;

  private parentController?: UiFocusController;

  private readonly _canBeFocused: MappedSubscribable<boolean>;
  /** @inheritdoc */
  public readonly canBeFocused: Subscribable<boolean>;

  /** Whether this module's parent button is enabled. */
  public readonly isEnabled: Subscribable<boolean>;

  /** Whether this module's parent button is visible. */
  public readonly isVisible: Subscribable<boolean>;

  private readonly _cssClass: SetSubject<string>;
  /** The set of CSS classes to apply to this module's parent button, including any that are applied by this module. */
  public readonly cssClass: SubscribableSet<string>;

  private readonly subs: Subscription[] = [];

  /**
   * Creates a new instance of UiTouchButtonFocusModule.
   * @param button This module's parent button.
   * @param isButtonVisible Whether this module's parent button is visible.
   * @param isButtonEnabled Whether this module's parent button is enabled.
   * @param buttonCanBeFocused Whethe this module's parent button can be focused.
   * @param cssClass CSS class(es) to apply to this module's parent button.
   * @param options Options with which to configure this module.
   */
  public constructor(
    private readonly button: FocusableTouchButton,
    isButtonVisible: boolean | Subscribable<boolean> | undefined,
    isButtonEnabled: boolean | Subscribable<boolean> | undefined,
    buttonCanBeFocused: boolean | Subscribable<boolean> | undefined,
    cssClass?: string | SubscribableSet<string> | ToggleableClassNameRecord,
    private readonly options?: Readonly<UiTouchButtonFocusModuleOptions>
  ) {
    this.isEnabled = SubscribableUtils.toSubscribable(isButtonEnabled ?? true, true);
    this.isVisible = SubscribableUtils.toSubscribable(isButtonVisible ?? true, true);
    this.canBeFocused = this._canBeFocused = MappedSubject.create(
      SubscribableMapFunctions.and(),
      this.isEnabled,
      this.isVisible,
      SubscribableUtils.toSubscribable(buttonCanBeFocused ?? true, true)
    );

    this._cssClass = SetSubject.create<string>();
    if (cssClass) {
      if (typeof cssClass === 'object') {
        const subs = FSComponent.bindCssClassSet(this._cssClass, cssClass, ['ui-button-focused']);
        if (Array.isArray(subs)) {
          this.subs.push(...subs);
        } else {
          this.subs.push(subs);
        }
      } else {
        for (const classToAdd of FSComponent.parseCssClassesFromString(cssClass, classToFilter => classToFilter !== 'ui-button-focused')) {
          this._cssClass.add(classToAdd);
        }
      }
    }
    this.cssClass = this._cssClass;
  }

  /**
   * Attempts to set focus on this module's parent button.
   */
  public focusButton(): void {
    if (this.parentController && this._canBeFocused.get()) {
      this.parentController.setFocus(this.button);
    }
  }

  /**
   * Responds to when this module's parent button is touched.
   */
  public onButtonTouched(): void {
    this.focusButton();
  }

  /** @inheritdoc */
  public onRegistered(controller: UiFocusController): void {
    this.parentController = controller;
  }

  /** @inheritdoc */
  public onDeregistered(): void {
    this.parentController = undefined;
  }

  /** @inheritdoc */
  public onFocusGained(): void {
    this._cssClass.add('ui-button-focused');
  }

  /** @inheritdoc */
  public onFocusLost(): void {
    this._cssClass.delete('ui-button-focused');
  }

  /** @inheritdoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    if (!this._canBeFocused.get()) {
      return false;
    }

    if (this.options?.onUiInteractionEvent) {
      return this.options.onUiInteractionEvent(event);
    } else {
      switch (event) {
        case UiInteractionEvent.SingleKnobPress:
        case UiInteractionEvent.LeftKnobPress:
        case UiInteractionEvent.RightKnobPress:
          this.button.simulatePressed();
          return true;
        default:
          return false;
      }
    }
  }

  /**
   * Destroys this module.
   */
  public destroy(): void {
    this.parentController?.deregister(this);

    this._canBeFocused.destroy();

    for (const sub of this.subs) {
      sub.destroy();
    }
  }
}
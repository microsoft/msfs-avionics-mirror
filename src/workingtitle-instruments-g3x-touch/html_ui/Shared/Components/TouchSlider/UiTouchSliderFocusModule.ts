import {
  FSComponent, MappedSubject, MappedSubscribable, SetSubject, Subscribable, SubscribableMapFunctions, SubscribableSet,
  SubscribableUtils, Subscription, ToggleableClassNameRecord
} from '@microsoft/msfs-sdk';

import { UiFocusController } from '../../UiSystem/UiFocusController';
import { UiFocusableComponent } from '../../UiSystem/UiFocusTypes';
import { UiInteractionEvent } from '../../UiSystem/UiInteraction';

/**
 * Options for {@link UiTouchSliderFocusModule}.
 */
export type UiTouchSliderFocusModuleOptions = {
  /**
   * A function which handles `UiInteractionEvents` routed to the module. If not defined, then the module will not
   * handle any events.
   */
  onUiInteractionEvent?: (event: UiInteractionEvent) => boolean;
};

/**
 * A module which handles UI focus for a touchscreen slider.
 *
 * The module syncs whether it can be focused with whether its parent slider is enabled and visible. When registered
 * with a focus controller, the module will attempt to set focus on itself. Finally, the module handles adding the
 * `ui-slider-focused` CSS class to the slider's class list when focused.
 */
export class UiTouchSliderFocusModule implements UiFocusableComponent {
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
   * Creates a new instance of UiTouchSliderFocusModule.
   * @param slider This module's parent slider.
   * @param isSliderVisible Whether this module's parent slider is visible.
   * @param isSliderEnabled Whether this module's parent slider is enabled.
   * @param sliderCanBeFocused Whethe this module's parent slider can be focused.
   * @param cssClass CSS class(es) to apply to this module's parent slider.
   * @param options Options with which to configure this module.
   */
  public constructor(
    private readonly slider: UiFocusableComponent,
    isSliderVisible: boolean | Subscribable<boolean> | undefined,
    isSliderEnabled: boolean | Subscribable<boolean> | undefined,
    sliderCanBeFocused: boolean | Subscribable<boolean> | undefined,
    cssClass?: string | SubscribableSet<string> | ToggleableClassNameRecord,
    private readonly options?: Readonly<UiTouchSliderFocusModuleOptions>
  ) {
    this.isEnabled = SubscribableUtils.toSubscribable(isSliderEnabled ?? true, true);
    this.isVisible = SubscribableUtils.toSubscribable(isSliderVisible ?? true, true);
    this.canBeFocused = this._canBeFocused = MappedSubject.create(
      SubscribableMapFunctions.and(),
      this.isEnabled,
      this.isVisible,
      SubscribableUtils.toSubscribable(sliderCanBeFocused ?? true, true)
    );

    this._cssClass = SetSubject.create<string>();
    if (cssClass) {
      if (typeof cssClass === 'object') {
        const subs = FSComponent.bindCssClassSet(this._cssClass, cssClass, ['ui-slider-focused']);
        if (Array.isArray(subs)) {
          this.subs.push(...subs);
        } else {
          this.subs.push(subs);
        }
      } else {
        for (const classToAdd of FSComponent.parseCssClassesFromString(cssClass, classToFilter => classToFilter !== 'ui-slider-focused')) {
          this._cssClass.add(classToAdd);
        }
      }
    }
    this.cssClass = this._cssClass;
  }

  /**
   * Attempts to set focus on this module's parent slider.
   */
  public focusSlider(): void {
    if (this.parentController && this._canBeFocused.get()) {
      this.parentController.setFocus(this.slider);
    }
  }

  /**
   * Responds to when a drag motion has started on this module's parent slider.
   */
  public onSliderDragStarted(): void {
    this.focusSlider();
  }

  /** @inheritDoc */
  public onRegistered(controller: UiFocusController): void {
    this.parentController = controller;
  }

  /** @inheritDoc */
  public onDeregistered(): void {
    this.parentController = undefined;
  }

  /** @inheritDoc */
  public onFocusGained(): void {
    this._cssClass.add('ui-slider-focused');
  }

  /** @inheritDoc */
  public onFocusLost(): void {
    this._cssClass.delete('ui-slider-focused');
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    if (!this._canBeFocused.get()) {
      return false;
    }

    if (this.options?.onUiInteractionEvent) {
      return this.options.onUiInteractionEvent(event);
    } else {
      return false;
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
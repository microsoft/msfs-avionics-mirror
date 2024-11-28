import { DisplayComponent, FSComponent, Subscribable, SubscribableSet, ToggleableClassNameRecord, VNode } from '@microsoft/msfs-sdk';

import { TouchButtonHoldAction, TouchButtonHoldEndReason, TouchButtonOnTouchedAction, ValueTouchButtonProps } from '@microsoft/msfs-garminsdk';

import { GduFormat } from '../../CommonTypes';
import { UiFocusController } from '../../UiSystem/UiFocusController';
import { UiFocusDirection, UiFocusableComponent } from '../../UiSystem/UiFocusTypes';
import { UiInteractionEvent } from '../../UiSystem/UiInteraction';
import { UiTouchButtonFocusModule, UiTouchButtonFocusModuleOptions } from './UiTouchButtonFocusModule';
import { ValueTouchButton } from './ValueTouchButton';

/**
 * Component props for UiValueTouchButton.
 */
export interface UiValueTouchButtonProps<S extends Subscribable<any>>
  extends Omit<ValueTouchButtonProps<S>, 'onTouched' | 'onPressed' | 'onHoldStarted' | 'onHoldTick' | 'onHoldEnded' | 'focusOnDrag' | 'class'> {

  /**
   * A callback function which will be called every time the button is touched (i.e. a mouse down event on the button
   * is detected). If not defined, then the button will default to entering the primed state when touched.
   * @param button The button that was touched.
   * @param state The state that is bound to the button.
   * @returns The action to take as a result of the button being touched.
   */
  onTouched?: <B extends UiValueTouchButton<S> = UiValueTouchButton<S>>(button: B, state: S) => TouchButtonOnTouchedAction;

  /**
   * A callback function which will be called when the button is pressed.
   * @param button The button that was pressed.
   * @param state The state that is bound to the button.
   * @param isHeld Whether the button was held when it was pressed.
   */
  onPressed?: <B extends UiValueTouchButton<S> = UiValueTouchButton<S>>(button: B, state: S, isHeld: boolean) => void;

  /**
   * A function which is called when the button enters the held state. If not defined, then the button will default to
   * taking no specific action when it enters the held state.
   * @param button The button that is held.
   * @param state The state that is bound to the button.
   * @returns The action to take. Ignored if the value is equal to {@link TouchButtonHoldAction.EndHold}.
   */
  onHoldStarted?: <B extends UiValueTouchButton<S> = UiValueTouchButton<S>>(button: B, state: S) => TouchButtonHoldAction;

  /**
   * A function which is called every frame when the button is held. If not defined, then the button will default to
   * taking no specific action with each frame tick.
   * @param button The button that is held.
   * @param state The state that is bound to the button.
   * @param dt The elapsed time, in milliseconds, since the previous frame.
   * @param totalTime The total amount of time, in milliseconds, that the button has been held.
   * @param timeSinceLastPress The amount of time, in milliseconds, that the button has been held since the last time
   * the button was pressed as a tick action.
   * @returns The action to take.
   */
  onHoldTick?: <B extends UiValueTouchButton<S> = UiValueTouchButton<S>>(
    button: B,
    state: S,
    dt: number,
    totalTime: number,
    timeSinceLastPress: number
  ) => TouchButtonHoldAction;

  /**
   * A function which is called when the button exits the held state.
   * @param button The button that was held.
   * @param state The state that is bound to the button.
   * @param totalHoldDuration The total amount of time, in milliseconds, that the button was held.
   * @param endReason The reason that the button exited the held state.
   */
  onHoldEnded?: <B extends UiValueTouchButton<S> = UiValueTouchButton<S>>(
    button: B,
    state: S,
    totalHoldDuration: number,
    endReason: TouchButtonHoldEndReason
  ) => void;

  /**
   * A function which is called when the button gains UI focus.
   * @param button The button that gained UI focus.
   */
  onFocusGained?: <B extends UiValueTouchButton<S> = UiValueTouchButton<S>>(button: B, direction: UiFocusDirection) => void;

  /**
   * A function which is called when the button loses UI focus.
   * @param button The button that lost UI focus.
   */
  onFocusLost?: <B extends UiValueTouchButton<S> = UiValueTouchButton<S>>(button: B) => void;

  /**
   * Whether the pad should focus all mouse events when dragging, preventing them from bubbling up to any ancestors
   * in the DOM tree. Defaults to `true`.
   */
  focusOnDrag?: boolean;

  /**
   * Whether the button is in a scrollable list. If `true`, will enable the inhibit on drag function unless otherwise
   * specified by the `inhibitOnDrag` prop. Defaults to `false`.
   */
  isInList?: boolean;

  /**
   * The scroll axis of the button's parent list. Ignored if `isInList` is `false`. Sets the button's inhibit on drag
   * axis unless otherwise specified by the `inhibitOnDragAxis` prop. Defaults to `y`.
   */
  listScrollAxis?: 'x' | 'y';

  /**
   * The format of the button's parent GDU display. Used to set the button's inhibit on drag threshold unless otherwise
   * specified by the `dragThresholdPx` prop. Defaults to `'460'`.
   */
  gduFormat?: GduFormat;

  /**
   * A UI focus controller with which to automatically register the button after it is rendered. If not defined, then
   * the button will not be automatically registered with any controller, but it may still be registered manually.
   */
  focusController?: UiFocusController;

  /**
   * Whether the button can be focused. Irrespective of this value, the button cannot be focused while it is disabled
   * or not visible. Defaults to `true`.
   */
  canBeFocused?: boolean | Subscribable<boolean>;

  /** Options to configure the button's behavior related to UI focus. */
  focusOptions?: Readonly<UiTouchButtonFocusModuleOptions>;

  /** CSS class(es) to apply to the button's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A G3X Touch UI version of {@link ValueTouchButton}. Supports UI focus, enables focus on drag by default and
 * provides convenience props for handling drag behavior while in a scrollable list.
 *
 * The root element of the button conditionally contains the `ui-button-focused` CSS class when the button has UI
 * focus.
 */
export class UiValueTouchButton<S extends Subscribable<any>> extends DisplayComponent<UiValueTouchButtonProps<S>> implements UiFocusableComponent {
  /** @inheritdoc */
  public readonly isUiFocusableComponent = true;

  protected readonly buttonRef = FSComponent.createRef<ValueTouchButton<S>>();

  protected readonly focusModule: UiTouchButtonFocusModule = new UiTouchButtonFocusModule(
    this,
    this.props.isVisible,
    this.props.isEnabled,
    this.props.canBeFocused,
    this.props.class,
    this.props.focusOptions
  );

  /** @inheritdoc */
  public readonly canBeFocused = this.focusModule.canBeFocused;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.focusController?.register(this);
  }

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
   * Attempts to set focus on this button.
   */
  public focusSelf(): void {
    this.focusModule.focusButton();
  }

  /** @inheritdoc */
  public onRegistered(controller: UiFocusController): void {
    this.focusModule.onRegistered(controller);
  }

  /** @inheritdoc */
  public onDeregistered(): void {
    this.focusModule.onDeregistered();
  }

  /** @inheritdoc */
  public onFocusGained(direction: UiFocusDirection): void {
    this.focusModule.onFocusGained();
    this.props.onFocusGained && this.props.onFocusGained(this, direction);
  }

  /** @inheritdoc */
  public onFocusLost(): void {
    this.focusModule.onFocusLost();
    this.props.onFocusLost && this.props.onFocusLost(this);
  }

  /** @inheritdoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.focusModule.onUiInteractionEvent(event);
  }

  /**
   * Responds to when this button is touched.
   * @param button The button that was touched.
   * @param state The state that is bound to the button.
   * @returns The action to take as a result of the button being touched.
   */
  protected onTouched(button: ValueTouchButton<S>, state: S): TouchButtonOnTouchedAction {
    if (this.props.onTouched) {
      return this.props.onTouched(this, state);
    } else {
      this.focusModule.onButtonTouched();
      return TouchButtonOnTouchedAction.Prime;
    }
  }

  /**
   * Responds to when this button is pressed.
   * @param button The button that was pressed.
   * @param state The state that is bound to the button.
   * @param isHeld Whether the button was held when it was pressed.
   */
  protected onPressed(button: ValueTouchButton<S>, state: S, isHeld: boolean): void {
    this.props.onPressed && this.props.onPressed(this, state, isHeld);
  }

  /**
   * Responds to when this button enters the held state.
   * @param button The button that is held.
   * @param state The state that is bound to the button.
   * @returns The action to take. Ignored if the value is equal to {@link TouchButtonHoldAction.EndHold}.
   */
  protected onHoldStarted(button: ValueTouchButton<S>, state: S): TouchButtonHoldAction {
    return this.props.onHoldStarted
      ? this.props.onHoldStarted(this, state)
      : TouchButtonHoldAction.None;
  }

  /**
   * A callback which is called every frame when this button is held.
   * @param button The button that is held.
   * @param state The state that is bound to the button.
   * @param dt The elapsed time, in milliseconds, since the previous frame.
   * @param totalTime The total amount of time, in milliseconds, that this button has been held.
   * @param timeSinceLastPress The amount of time, in milliseconds, that this button has been held since the last time
   * the button was pressed as a tick action.
   * @returns The action to take.
   */
  protected onHoldTick(button: ValueTouchButton<S>, state: S, dt: number, totalTime: number, timeSinceLastPress: number): TouchButtonHoldAction {
    return this.props.onHoldTick
      ? this.props.onHoldTick(this, state, dt, totalTime, timeSinceLastPress)
      : TouchButtonHoldAction.None;
  }

  /**
   * Responds to when this button exits the held state.
   * @param button The button that was held.
   * @param state The state that is bound to the button.
   * @param totalHoldDuration The total amount of time, in milliseconds, that this button was held.
   * @param endReason The reason that this button exited the held state.
   */
  protected onHoldEnded(button: ValueTouchButton<S>, state: S, totalHoldDuration: number, endReason: TouchButtonHoldEndReason): void {
    this.props.onHoldEnded && this.props.onHoldEnded(this, state, totalHoldDuration, endReason);
  }

  /** @inheritdoc */
  public render(): VNode {
    const isInList = this.props.isInList ?? false;

    return (
      <ValueTouchButton
        ref={this.buttonRef}
        isVisible={this.focusModule.isVisible}
        isEnabled={this.focusModule.isEnabled}
        isHighlighted={this.props.isHighlighted}
        state={this.props.state}
        label={this.props.label}
        renderValue={this.props.renderValue}
        onTouched={this.onTouched.bind(this)}
        onPressed={this.onPressed.bind(this)}
        onHoldStarted={this.onHoldStarted.bind(this)}
        onHoldTick={this.onHoldTick.bind(this)}
        onHoldEnded={this.onHoldEnded.bind(this)}
        focusOnDrag={this.props.focusOnDrag ?? true}
        inhibitOnDrag={this.props.inhibitOnDrag ?? isInList}
        inhibitOnDragAxis={this.props.inhibitOnDragAxis ?? (isInList ? (this.props.listScrollAxis ?? 'y') : undefined)}
        dragThresholdPx={this.props.dragThresholdPx ?? ((this.props.gduFormat ?? '460') === '460' ? 40 : 20)}
        class={this.focusModule.cssClass}
      >
        {this.props.children}
      </ValueTouchButton>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.buttonRef.getOrDefault()?.destroy();

    this.focusModule?.destroy();

    super.destroy();
  }
}
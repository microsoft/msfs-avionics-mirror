import {
  DisplayComponent, FSComponent, MappedSubject, MutableSubscribable, SetSubject, Subscribable,
  SubscribableType, SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { ToggleStatusBar } from '../common/ToggleStatusBar';
import { TouchButton, TouchButtonHoldAction, TouchButtonHoldEndReason, TouchButtonOnTouchedAction, TouchButtonProps } from './TouchButton';

/**
 * Component props for SetValueTouchButton.
 */
export interface SetValueTouchButtonProps<S extends MutableSubscribable<any>>
  extends Omit<TouchButtonProps, 'onTouched' | 'onPressed' | 'onHoldStarted' | 'onHoldTick' | 'onHoldEnded'> {

  /** A mutable subscribable whose state will be bound to the button. */
  state: S;

  /** A subscribable which provides the value that the button sets. */
  setValue: SubscribableType<S> | Subscribable<SubscribableType<S>>;

  /**
   * A callback function which will be called every time the button is touched (i.e. a mouse down event on the button
   * is detected). If not defined, then the button will default to entering the primed state when touched.
   * @param button The button that was touched.
   * @param state The state that is bound to the button.
   * @param setValue The value that the button sets.
   * @returns The action to take as a result of the button being touched.
   */
  onTouched?: <B extends SetValueTouchButton<S> = SetValueTouchButton<S>>(button: B, state: S, setValue: SubscribableType<S>) => TouchButtonOnTouchedAction;

  /**
   * A callback function which will be called when the button is pressed. If not defined, pressing the button will
   * apply the button's set value to its bound state.
   * @param button The button that was pressed.
   * @param state The state that is bound to the button.
   * @param setValue The value that the button sets.
   * @param isHeld Whether the button was held when it was pressed.
   */
  onPressed?: <B extends SetValueTouchButton<S> = SetValueTouchButton<S>>(button: B, state: S, setValue: SubscribableType<S>, isHeld: boolean) => void;

  /**
   * A function which is called when the button enters the held state. If not defined, then the button will default to
   * taking no specific action when it enters the held state.
   * @param button The button that is held.
   * @param state The state that is bound to the button.
   * @param setValue The value that the button sets.
   * @returns The action to take. Ignored if the value is equal to {@link TouchButtonHoldAction.EndHold}.
   */
  onHoldStarted?: <B extends SetValueTouchButton<S> = SetValueTouchButton<S>>(button: B, state: S, setValue: SubscribableType<S>) => TouchButtonHoldAction;

  /**
   * A function which is called every frame when the button is held. If not defined, then the button will default to
   * taking no specific action with each frame tick.
   * @param button The button that is held.
   * @param state The state that is bound to the button.
   * @param setValue The value that the button sets.
   * @param dt The elapsed time, in milliseconds, since the previous frame.
   * @param totalTime The total amount of time, in milliseconds, that the button has been held.
   * @param timeSinceLastPress The amount of time, in milliseconds, that the button has been held since the last time
   * the button was pressed as a tick action.
   * @returns The action to take.
   */
  onHoldTick?: <B extends SetValueTouchButton<S> = SetValueTouchButton<S>>(
    button: B,
    state: S,
    setValue: SubscribableType<S>,
    dt: number,
    totalTime: number,
    timeSinceLastPress: number
  ) => TouchButtonHoldAction;

  /**
   * A function which is called when the button exits the held state.
   * @param button The button that was held.
   * @param state The state that is bound to the button.
   * @param setValue The value that the button sets.
   * @param totalHoldDuration The total amount of time, in milliseconds, that the button was held.
   * @param endReason The reason that the button exited the held state.
   */
  onHoldEnded?: <B extends SetValueTouchButton<S> = SetValueTouchButton<S>>(
    button: B,
    state: S,
    setValue: SubscribableType<S>,
    totalHoldDuration: number,
    endReason: TouchButtonHoldEndReason
  ) => void;
}

/**
 * A touchscreen button which displays whether the value of a bound state is equal to a set value. By default, pressing
 * the button will apply its set value to the state. This behavior can be overridden by providing a custom callback
 * function which runs when the button is pressed.
 *
 * The root element of the button contains the `touch-button-set-value` CSS class by default, in addition to all
 * root-element classes used by {@link TouchButton}.
 *
 * The root element contains a child {@link ToggleStatusBar} component with the CSS class
 * `touch-button-set-value-status-bar` and an optional label element with the CSS class `touch-button-label`.
 */
export class SetValueTouchButton<S extends MutableSubscribable<any>> extends DisplayComponent<SetValueTouchButtonProps<S>> {
  protected static readonly RESERVED_CSS_CLASSES = new Set(['touch-button-set-value']);

  protected readonly buttonRef = FSComponent.createRef<TouchButton>();
  protected readonly statusBarRef = FSComponent.createRef<ToggleStatusBar>();

  protected readonly cssClassSet = SetSubject.create(['touch-button-set-value']);

  protected readonly setValue = SubscribableUtils.toSubscribable(this.props.setValue, true) as Subscribable<SubscribableType<S>>;

  protected readonly toggleState = MappedSubject.create(
    ([state, setValue]): boolean => state === setValue,
    this.props.state,
    this.setValue
  );

  protected cssClassSub?: Subscription;

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
   * Responds to when this button is touched.
   * @param button The button that was touched.
   * @returns The action to take as a result of the button being touched.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onTouched(button: TouchButton): TouchButtonOnTouchedAction {
    return this.props.onTouched
      ? this.props.onTouched(this, this.props.state, this.setValue.get())
      : TouchButtonOnTouchedAction.Prime;
  }

  /**
   * Responds to when this button is pressed.
   * @param button The button that was pressed.
   * @param isHeld Whether the button was held when it was pressed.
   */
  protected onPressed(button: TouchButton, isHeld: boolean): void {
    if (this.props.onPressed) {
      this.props.onPressed(this, this.props.state, this.setValue.get(), isHeld);
    } else {
      this.props.state.set(this.setValue.get());
    }
  }

  /**
   * Responds to when this button enters the held state.
   * @param button The button that is held.
   * @returns The action to take. Ignored if the value is equal to {@link TouchButtonHoldAction.EndHold}.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onHoldStarted(button: TouchButton): TouchButtonHoldAction {
    return this.props.onHoldStarted
      ? this.props.onHoldStarted(this, this.props.state, this.setValue.get())
      : TouchButtonHoldAction.None;
  }

  /**
   * A callback which is called every frame when this button is held.
   * @param button The button that is held.
   * @param dt The elapsed time, in milliseconds, since the previous frame.
   * @param totalTime The total amount of time, in milliseconds, that this button has been held.
   * @param timeSinceLastPress The amount of time, in milliseconds, that this button has been held since the last time
   * the button was pressed as a tick action.
   * @returns The action to take.
   */
  protected onHoldTick(button: TouchButton, dt: number, totalTime: number, timeSinceLastPress: number): TouchButtonHoldAction {
    return this.props.onHoldTick
      ? this.props.onHoldTick(this, this.props.state, this.setValue.get(), dt, totalTime, timeSinceLastPress)
      : TouchButtonHoldAction.None;
  }

  /**
   * Responds to when this button exits the held state.
   * @param button The button that was held.
   * @param totalHoldDuration The total amount of time, in milliseconds, that this button was held.
   * @param endReason The reason that this button exited the held state.
   */
  protected onHoldEnded(button: TouchButton, totalHoldDuration: number, endReason: TouchButtonHoldEndReason): void {
    this.props.onHoldEnded && this.props.onHoldEnded(this, this.props.state, this.setValue.get(), totalHoldDuration, endReason);
  }

  /** @inheritdoc */
  public render(): VNode {
    const reservedClasses = this.getReservedCssClasses();

    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.cssClassSet, this.props.class, reservedClasses);
    } else if (this.props.class !== undefined && this.props.class.length > 0) {
      for (const cssClassToAdd of FSComponent.parseCssClassesFromString(this.props.class, cssClass => !reservedClasses.has(cssClass))) {
        this.cssClassSet.add(cssClassToAdd);
      }
    }

    return (
      <TouchButton
        ref={this.buttonRef}
        isEnabled={this.props.isEnabled}
        isHighlighted={this.props.isHighlighted}
        isVisible={this.props.isVisible}
        label={this.props.label}
        onTouched={this.onTouched.bind(this)}
        onPressed={this.onPressed.bind(this)}
        onHoldStarted={this.onHoldStarted.bind(this)}
        onHoldTick={this.onHoldTick.bind(this)}
        onHoldEnded={this.onHoldEnded.bind(this)}
        focusOnDrag={this.props.focusOnDrag}
        inhibitOnDrag={this.props.inhibitOnDrag}
        dragThresholdPx={this.props.dragThresholdPx}
        inhibitOnDragAxis={this.props.inhibitOnDragAxis}
        class={this.cssClassSet}
      >
        <ToggleStatusBar ref={this.statusBarRef} state={this.toggleState} class='touch-button-set-value-status-bar'></ToggleStatusBar>
        {this.props.children}
      </TouchButton>
    );
  }

  /**
   * Gets the CSS classes that are reserved for this button's root element.
   * @returns The CSS classes that are reserved for this button's root element.
   */
  protected getReservedCssClasses(): ReadonlySet<string> {
    return SetValueTouchButton.RESERVED_CSS_CLASSES;
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.buttonRef.instance.destroy();
    this.statusBarRef.instance.destroy();
    this.toggleState.destroy();

    this.props.onDestroy && this.props.onDestroy();
  }
}
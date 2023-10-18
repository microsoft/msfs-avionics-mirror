import { DisplayComponent, FSComponent, SetSubject, Subscribable, SubscribableType, Subscription, VNode } from '@microsoft/msfs-sdk';

import { TouchButton, TouchButtonHoldAction, TouchButtonHoldEndReason, TouchButtonOnTouchedAction, TouchButtonProps } from './TouchButton';

/**
 * Component props for ValueTouchButton.
 */
export interface ValueTouchButtonProps<S extends Subscribable<any>>
  extends Omit<TouchButtonProps, 'onTouched' | 'onPressed' | 'onHoldStarted' | 'onHoldTick' | 'onHoldEnded'> {

  /** A subscribable whose state will be bound to the button. */
  state: S;

  /**
   * A function which renders the value of the button's bound state, or a {@link VNode} which renders the value. If not
   * defined, values are rendered into strings via default `toString()` behavior.
   *
   * If the rendered value is a VNode, all first-level DisplayComponents in the VNode tree will be destroyed when a new
   * value is rendered or when the button is destroyed.
   */
  renderValue?: ((stateValue: SubscribableType<S>) => string | VNode) | VNode;

  /**
   * A callback function which will be called every time the button is touched (i.e. a mouse down event on the button
   * is detected). If not defined, then the button will default to entering the primed state when touched.
   * @param button The button that was touched.
   * @param state The state that is bound to the button.
   * @returns The action to take as a result of the button being touched.
   */
  onTouched?: <B extends ValueTouchButton<S> = ValueTouchButton<S>>(button: B, state: S) => TouchButtonOnTouchedAction;

  /**
   * A callback function which will be called every time the button is pressed.
   * @param button The button that was pressed.
   * @param state The state that is bound to the button.
   * @param isHeld Whether the button was held when it was pressed.
   */
  onPressed?: <B extends ValueTouchButton<S> = ValueTouchButton<S>>(button: B, state: S, isHeld: boolean) => void;

  /**
   * A function which is called when the button enters the held state. If not defined, then the button will default to
   * taking no specific action when it enters the held state.
   * @param button The button that is held.
   * @param state The state that is bound to the button.
   * @returns The action to take. Ignored if the value is equal to {@link TouchButtonHoldAction.EndHold}.
   */
  onHoldStarted?: <B extends ValueTouchButton<S> = ValueTouchButton<S>>(button: B, state: S) => TouchButtonHoldAction;

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
  onHoldTick?: <B extends ValueTouchButton<S> = ValueTouchButton<S>>(
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
  onHoldEnded?: <B extends ValueTouchButton<S> = ValueTouchButton<S>>(
    button: B,
    state: S,
    totalHoldDuration: number,
    endReason: TouchButtonHoldEndReason
  ) => void;
}

/**
 * A touchscreen button which displays the value of a bound state.
 *
 * The root element of the button contains the `touch-button-value` CSS class by default, in addition to all
 * root-element classes used by {@link TouchButton}.
 *
 * The value of the button's bound state is rendered into a child `div` element containing the CSS class
 * `touch-button-value-value`.
 */
export class ValueTouchButton<S extends Subscribable<any>> extends DisplayComponent<ValueTouchButtonProps<S>> {
  protected static readonly RESERVED_CSS_CLASSES = new Set(['touch-button-value']);

  protected readonly buttonRef = FSComponent.createRef<TouchButton>();
  protected readonly valueRef = FSComponent.createRef<HTMLDivElement>();

  protected readonly cssClassSet = SetSubject.create(['touch-button-value']);

  protected renderedValue?: string | VNode;

  private cssClassSub?: Subscription;
  private stateSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    if ((this.props.renderValue === undefined || typeof this.props.renderValue === 'function')) {
      const renderFunc = this.props.renderValue ?? ((value: SubscribableType<S>): string => `${value}`);

      this.stateSub = this.props.state.sub(value => {
        this.processRenderedValue(renderFunc(value));
      }, true);
    }
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
   * Processes a newly rendered value. The new rendered value will rendered into this button's value container,
   * replacing any existing rendered value.
   * @param rendered The newly rendered value.
   */
  protected processRenderedValue(rendered: string | VNode): void {
    this.cleanUpRenderedValue();

    this.renderedValue = rendered;

    if (typeof rendered === 'string') {
      this.valueRef.instance.textContent = rendered;
    } else {
      FSComponent.render(rendered, this.valueRef.instance);
    }
  }

  /**
   * Cleans up this button's rendered value.
   */
  protected cleanUpRenderedValue(): void {
    if (this.renderedValue === undefined) {
      return;
    }

    const valueContainer = this.valueRef.getOrDefault();

    if (typeof this.renderedValue === 'object') {
      FSComponent.visitNodes(this.renderedValue, node => {
        if (node.instance instanceof DisplayComponent) {
          node.instance.destroy();
          return true;
        }

        return false;
      });

      if (valueContainer !== null) {
        valueContainer.innerHTML = '';
      }
    } else {
      if (valueContainer !== null) {
        valueContainer.textContent = '';
      }
    }
  }

  /**
   * Responds to when this button is touched.
   * @param button The button that was touched.
   * @returns The action to take as a result of the button being touched.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onTouched(button: TouchButton): TouchButtonOnTouchedAction {
    return this.props.onTouched
      ? this.props.onTouched(this, this.props.state)
      : TouchButtonOnTouchedAction.Prime;
  }

  /**
   * Responds to when this button is pressed.
   * @param button The button that was pressed.
   * @param isHeld Whether the button was held when it was pressed.
   */
  protected onPressed(button: TouchButton, isHeld: boolean): void {
    this.props.onPressed && this.props.onPressed(this, this.props.state, isHeld);
  }

  /**
   * Responds to when this button enters the held state.
   * @param button The button that is held.
   * @returns The action to take. Ignored if the value is equal to {@link TouchButtonHoldAction.EndHold}.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onHoldStarted(button: TouchButton): TouchButtonHoldAction {
    return this.props.onHoldStarted
      ? this.props.onHoldStarted(this, this.props.state)
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
      ? this.props.onHoldTick(this, this.props.state, dt, totalTime, timeSinceLastPress)
      : TouchButtonHoldAction.None;
  }

  /**
   * Responds to when this button exits the held state.
   * @param button The button that was held.
   * @param totalHoldDuration The total amount of time, in milliseconds, that this button was held.
   * @param endReason The reason that this button exited the held state.
   */
  protected onHoldEnded(button: TouchButton, totalHoldDuration: number, endReason: TouchButtonHoldEndReason): void {
    this.props.onHoldEnded && this.props.onHoldEnded(this, this.props.state, totalHoldDuration, endReason);
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
        isVisible={this.props.isVisible}
        isHighlighted={this.props.isHighlighted}
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
        {this.renderValueContainer()}
        {this.props.children}
      </TouchButton>
    );
  }

  /**
   * Renders this button's value container.
   * @returns This button's rendered value container.
   */
  protected renderValueContainer(): VNode {
    if (this.props.renderValue !== undefined && typeof this.props.renderValue === 'object') {
      this.renderedValue = this.props.renderValue;
    }

    return (
      <div ref={this.valueRef} class='touch-button-value-value'>{this.renderedValue}</div>
    );
  }

  /**
   * Gets the CSS classes that are reserved for this button's root element.
   * @returns The CSS classes that are reserved for this button's root element.
   */
  protected getReservedCssClasses(): ReadonlySet<string> {
    return ValueTouchButton.RESERVED_CSS_CLASSES;
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.buttonRef.getOrDefault()?.destroy();

    this.cleanUpRenderedValue();

    this.cssClassSub?.destroy();
    this.stateSub?.destroy();

    super.destroy();
  }
}
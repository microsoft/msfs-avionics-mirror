import {
  ComponentProps, DisplayComponent, FSComponent, SetSubject, Subscribable, SubscribableMapFunctions, SubscribableSet, SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

/**
 * Actions that {@link TouchButton} can take in response to being touched.
 */
export enum TouchButtonOnTouchedAction {
  /**
   * The button becomes primed. A primed button will be pressed if and when the mouse button is released. If the mouse
   * leaves the button before the mouse button is released, the button becomes un-primed and is not pressed.
   */
  Prime = 'Prime',

  /**
   * The button is immediately pressed once. The button does not enter the primed state. Holding down the mouse button
   * will not trigger additional presses.
   */
  Press = 'Press',

  /**
   * The button becomes held. The button will remain held until the mouse button is released, the mouse leaves the
   * button, mouse events are inhibited by dragging, or the button becomes disabled.
   */
  Hold = 'Hold',

  /** The button takes no action as if it were disabled. */
  Ignore = 'Ignore'
}

/**
 * Actions that {@link TouchButton} can take while it is in the held state.
 */
export enum TouchButtonHoldAction {
  /** The button is immediately pressed once. */
  Press = 'Press',

  /** The button ends its held state. */
  EndHold = 'EndHold',

  /** The button takes no specific action. */
  None = 'None'
}

/**
 * Reasons for ending a {@link TouchButton}'s held state.
 */
export enum TouchButtonHoldEndReason {
  /** The held state ended for an unknown reason. */
  Unknown = 'Unknown',

  /** The held state ended because the mouse button was released. */
  MouseUp = 'MouseUp',

  /** The held state ended because the mouse left the button.  */
  MouseLeave = 'MouseLeave',

  /** The held state ended as a result of a hold tick action. */
  TickAction = 'TickAction',

  /** The held state ended because mouse events were inhibited by dragging. */
  DragInhibit = 'DragInhibit',

  /** The held state ended because the button entered the primed state. */
  Primed = 'Primed',

  /** The held state ended because the button was disabled. */
  Disabled = 'Disabled'
}

/**
 * Component props for TouchButton.
 */
export interface TouchButtonProps extends ComponentProps {
  /**
   * Whether the button is enabled, or a subscribable which provides it. Disabled buttons cannot be touched, primed,
   * pressed, or held. Defaults to `true`.
   */
  isEnabled?: boolean | Subscribable<boolean>;

  /** Whether the button is highlighted, or a subscribable which provides it. Defaults to `false`. */
  isHighlighted?: boolean | Subscribable<boolean>;

  /** Whether the button is visible. Defaults to `true`. */
  isVisible?: boolean | Subscribable<boolean>;

  /**
   * The label for the button. Can be defined as either a static `string`, a subscribable which provides the label
   * `string`, or a VNode. If not defined, the button will not have a label.
   *
   * If the label is defined as a VNode, all first-level DisplayComponents in the VNode tree will be destroyed when
   * the button is destroyed.
   */
  label?: string | Subscribable<string> | VNode;

  /**
   * A callback function which will be called every time the button is touched (i.e. a mouse down event on the button
   * is detected). If not defined, then the button will default to entering the primed state when touched.
   * @param button The button that was touched.
   * @returns The action to take as a result of the button being touched.
   */
  onTouched?: <B extends TouchButton = TouchButton>(button: B) => TouchButtonOnTouchedAction;

  /**
   * A callback function which will be called every time the button is pressed.
   * @param button The button that was pressed.
   * @param isHeld Whether the button was held when it was pressed.
   */
  onPressed?: <B extends TouchButton = TouchButton>(button: B, isHeld: boolean) => void;

  /**
   * A function which is called when the button enters the held state. If not defined, then the button will default to
   * taking no specific action when it enters the held state.
   * @param button The button that is held.
   * @returns The action to take. Ignored if the value is equal to {@link TouchButtonHoldAction.EndHold}.
   */
  onHoldStarted?: <B extends TouchButton = TouchButton>(button: B) => TouchButtonHoldAction;

  /**
   * A function which is called every frame when the button is held. If not defined, then the button will default to
   * taking no specific action with each frame tick.
   * @param button The button that is held.
   * @param dt The elapsed time, in milliseconds, since the previous frame.
   * @param totalTime The total amount of time, in milliseconds, that the button has been held.
   * @param timeSinceLastPress The amount of time, in milliseconds, that the button has been held since the last time
   * the button was pressed as a tick action.
   * @returns The action to take.
   */
  onHoldTick?: <B extends TouchButton = TouchButton>(button: B, dt: number, totalTime: number, timeSinceLastPress: number) => TouchButtonHoldAction;

  /**
   * A function which is called when the button exits the held state.
   * @param button The button that was held.
   * @param totalHoldDuration The total amount of time, in milliseconds, that the button was held.
   * @param endReason The reason that the button exited the held state.
   */
  onHoldEnded?: <B extends TouchButton = TouchButton>(button: B, totalHoldDuration: number, endReason: TouchButtonHoldEndReason) => void;

  /**
   * Whether the button should focus all mouse events when dragging and the button is primed or held, preventing the
   * events from bubbling up to any ancestors in the DOM tree. Defaults to `false`.
   */
  focusOnDrag?: boolean;

  /**
   * Whether the button should stop responding to mouse events and instead forward them to its parent after clicking
   * and dragging for a certain distance defined by `dragThresholdPx` along the axis defined by `inhibitOnDragAxis`.
   * When mouse events are inhibited, the button cannot be primed or held. Defaults to `false`.
   */
  inhibitOnDrag?: boolean;

  /**
   * The distance, in pixels, the mouse can click and drag before the pad begins to ignore mouse events. Ignored if
   * `inhibitOnDrag` is `false`. Defaults to 40 pixels.
   */
  dragThresholdPx?: number;

  /**
   * The axis along which dragging will trigger the inhibit function. Ignored if `inhibitOnDrag` is `false`.
   * Defaults to `'both'`.
   */
  inhibitOnDragAxis?: 'x' | 'y' | 'both';

  /** A callback function which will be called when the button is destroyed. */
  onDestroy?: () => void;

  /** CSS class(es) to apply to the button's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * A touchscreen button.
 *
 * The root element of the button contains the `touch-button` CSS class by default. The root element also
 * conditionally contains the `touch-button-disabled`, `touch-button-primed`, and `touch-button-held` classes when the
 * button is disabled, primed, and held, respectively.
 *
 * The root element optionally contains a child label element with the CSS class `touch-button-label`.
 */
export class TouchButton<P extends TouchButtonProps = TouchButtonProps> extends DisplayComponent<P> {
  protected static readonly RESERVED_CSS_CLASSES = new Set([
    'touch-button',
    'touch-button-disabled',
    'touch-button-primed',
    'touch-button-held',
    'touch-button-highlight',
    'touch-button-hidden'
  ]);

  protected readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  protected readonly cssClassSet = SetSubject.create(['touch-button']);

  protected readonly mouseDownListener = this.onMouseDown.bind(this);
  protected readonly mouseUpListener = this.onMouseUp.bind(this);
  protected readonly mouseLeaveListener = this.onMouseLeave.bind(this);
  protected readonly mouseMoveListener = this.onMouseMove.bind(this);

  protected readonly isEnabled = SubscribableUtils.toSubscribable(this.props.isEnabled ?? true, true);
  protected readonly isHighlighted = SubscribableUtils.toSubscribable(this.props.isHighlighted ?? false, true);
  protected readonly isVisible = SubscribableUtils.toSubscribable(this.props.isVisible ?? true, true);

  protected readonly labelContent = this.props.label !== undefined && SubscribableUtils.isSubscribable(this.props.label)
    ? this.props.label.map(SubscribableMapFunctions.identity())
    : this.props.label;

  protected isPrimed = false;
  protected isHeld = false;

  protected holdTickInterval: NodeJS.Timer | null = null;
  protected lastHoldTickTime: number | undefined = undefined;
  protected totalHoldTime = 0;
  protected holdTimeSinceLastPress = 0;

  protected readonly holdTickFunc = (): void => {
    const time = Date.now();
    const dt = time - (this.lastHoldTickTime ?? time);
    this.totalHoldTime += dt;
    this.holdTimeSinceLastPress += dt;

    const action = this.props.onHoldTick
      ? this.props.onHoldTick(this, dt, this.totalHoldTime, this.holdTimeSinceLastPress)
      : TouchButtonHoldAction.None;

    this.lastHoldTickTime = time;

    switch (action) {
      case TouchButtonHoldAction.Press:
        this.onPressed();
        this.holdTimeSinceLastPress = 0;
        break;
      case TouchButtonHoldAction.EndHold:
        this.setHeld(false, TouchButtonHoldEndReason.TickAction);
        break;
    }
  };

  protected isEnabledSub?: Subscription;
  protected isHighlightedSub?: Subscription;
  protected isVisibleSub?: Subscription;
  protected cssClassSub?: Subscription;

  protected readonly mouseClickPosition = new Vec2();
  protected readonly currentMousePosition = new Vec2();

  protected readonly focusOnDrag = this.props.focusOnDrag ?? false;
  protected readonly inhibitOnDrag = this.props.inhibitOnDrag ?? false;
  protected readonly dragThresholdPxActual = this.props.dragThresholdPx ?? 40;
  protected readonly inhibitOnDragAxisActual = this.props.inhibitOnDragAxis ?? 'both';

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onAfterRender(node: VNode): void {
    this.isEnabledSub = this.isEnabled.sub(isEnabled => {
      if (isEnabled) {
        this.cssClassSet.delete('touch-button-disabled');
      } else {
        this.cssClassSet.add('touch-button-disabled');
      }

      if (!isEnabled) {
        this.setPrimed(false);
        this.setHeld(false, TouchButtonHoldEndReason.Disabled);
      }
    }, true);

    this.isHighlightedSub = this.isHighlighted.sub(isHighlighted => {
      if (isHighlighted) {
        this.cssClassSet.add('touch-button-highlight');
      } else {
        this.cssClassSet.delete('touch-button-highlight');
      }
    }, true);

    this.isVisibleSub = this.isVisible.sub(isVisible => {
      if (isVisible) {
        this.cssClassSet.delete('touch-button-hidden');
      } else {
        this.cssClassSet.add('touch-button-hidden');
      }
    }, true);

    this.rootRef.instance.addEventListener('mousedown', this.mouseDownListener);
    this.rootRef.instance.addEventListener('mouseup', this.mouseUpListener);
    this.rootRef.instance.addEventListener('mouseleave', this.mouseLeaveListener);
  }

  /**
   * Gets this button's root HTML element.
   * @returns This button's root HTML element.
   * @throws Error if this button has not yet been rendered.
   */
  public getRootElement(): HTMLElement {
    return this.rootRef.instance;
  }

  /**
   * Simulates this button being pressed. This will execute the `onPressed()` callback if one is defined.
   * @param ignoreDisabled Whether to simulate the button being pressed regardless of whether the button is disabled.
   * Defaults to `false`.
   */
  public simulatePressed(ignoreDisabled = false): void {
    if (ignoreDisabled || this.isEnabled.get()) {
      this.onPressed();
    }
  }

  /**
   * Sets the primed state of this button.
   * @param isPrimed The new primed state.
   */
  protected setPrimed(isPrimed: boolean): void {
    if (this.isPrimed === isPrimed) {
      return;
    }

    if (isPrimed) {
      // A button can't be primed and held at the same time.
      this.setHeld(false, TouchButtonHoldEndReason.Primed);
    }

    this.isPrimed = isPrimed;
    if (isPrimed) {
      this.cssClassSet.add('touch-button-primed');
      if (this.inhibitOnDrag) {
        this.rootRef.instance.addEventListener('mousemove', this.mouseMoveListener);
      }
    } else {
      this.cssClassSet.delete('touch-button-primed');
      if (this.inhibitOnDrag) {
        this.rootRef.instance.removeEventListener('mousemove', this.mouseMoveListener);
      }
    }
  }

  /**
   * Sets the held state of this button.
   * @param isHeld The new held state.
   * @param endReason The reason that the held state is set to `false`. Ignored if {@linkcode isHeld} is `true`.
   * Defaults to {@link TouchButtonHoldEndReason.Unknown}.
   */
  protected setHeld(isHeld: boolean, endReason = TouchButtonHoldEndReason.Unknown): void {
    if (this.isHeld === isHeld) {
      return;
    }

    if (isHeld) {
      // A button can't be primed and held at the same time.
      this.setPrimed(false);
    }

    this.isHeld = isHeld;

    if (this.holdTickInterval !== null) {
      clearInterval(this.holdTickInterval);
    }

    if (isHeld) {
      this.cssClassSet.add('touch-button-held');
      if (this.inhibitOnDrag) {
        this.rootRef.instance.addEventListener('mousemove', this.mouseMoveListener);
      }

      const action = this.props.onHoldStarted
        ? this.props.onHoldStarted(this)
        : TouchButtonHoldAction.None;

      this.lastHoldTickTime = undefined;
      this.totalHoldTime = 0;
      this.holdTimeSinceLastPress = 0;
      this.holdTickInterval = setInterval(this.holdTickFunc, 0);

      if (action === TouchButtonHoldAction.Press) {
        this.onPressed();
      }
    } else {
      this.cssClassSet.delete('touch-button-held');
      if (this.inhibitOnDrag) {
        this.rootRef.instance.removeEventListener('mousemove', this.mouseMoveListener);
      }

      this.props.onHoldEnded && this.props.onHoldEnded(this, this.totalHoldTime, endReason);
    }
  }

  /**
   * Responds to mouse down events on this button's root element.
   * @param e The mouse event.
   */
  protected onMouseDown(e: MouseEvent): void {
    if (!this.isEnabled.get()) {
      return;
    }

    const action = this.props.onTouched ? this.props.onTouched(this) : TouchButtonOnTouchedAction.Prime;

    switch (action) {
      case TouchButtonOnTouchedAction.Prime:
        this.mouseClickPosition.x = e.clientX;
        this.mouseClickPosition.y = e.clientY;
        if (this.focusOnDrag) {
          e.stopPropagation();
        }
        this.setPrimed(true);
        break;
      case TouchButtonOnTouchedAction.Press:
        if (this.focusOnDrag) {
          e.stopPropagation();
        }
        this.onPressed();
        break;
      case TouchButtonOnTouchedAction.Hold:
        this.mouseClickPosition.x = e.clientX;
        this.mouseClickPosition.y = e.clientY;
        if (this.focusOnDrag) {
          e.stopPropagation();
        }
        this.setHeld(true);
        break;
    }
  }

  /**
   * Responds to mouse up events on this button's root element.
   */
  protected onMouseUp(): void {
    const wasPrimed = this.isPrimed;
    this.setPrimed(false);
    this.setHeld(false, TouchButtonHoldEndReason.MouseUp);
    if (wasPrimed && this.isEnabled.get()) {
      this.onPressed();
    }
  }

  /**
   * Responds to mouse leave events on this button's root element.
   * @param e The mouse event.
   */
  protected onMouseLeave(e: MouseEvent): void {
    if (!this.isPrimed && !this.isHeld) {
      return;
    }

    this.setPrimed(false);
    this.setHeld(false, TouchButtonHoldEndReason.MouseLeave);
    if (this.focusOnDrag && this.rootRef.instance.parentElement) {
      const newE = new MouseEvent('mousedown', {
        clientX: e.clientX,
        clientY: e.clientY,
        bubbles: true,
      });
      this.rootRef.instance.parentElement.dispatchEvent(newE);
    }
  }

  /**
   * Handle mouse moving after clicking.
   * @param e The mouse event.
   */
  protected onMouseMove(e: MouseEvent): void {
    if (!this.isPrimed && !this.isHeld) {
      return;
    }

    this.currentMousePosition.x = e.clientX;
    this.currentMousePosition.y = e.clientY;

    if (this.getDragDistance() > this.dragThresholdPxActual) {
      this.setPrimed(false);
      this.setHeld(false, TouchButtonHoldEndReason.DragInhibit);

      if (this.focusOnDrag && this.rootRef.instance.parentElement) {
        const newE = new MouseEvent('mousedown', {
          clientX: e.clientX,
          clientY: e.clientY,
          bubbles: true,
        });
        this.rootRef.instance.parentElement.dispatchEvent(newE);
      }
    }
  }

  /**
   * Get the distance that the mouse has been dragged on the correct axis.
   * @returns The distance.
   */
  protected getDragDistance(): number {
    switch (this.inhibitOnDragAxisActual) {
      case 'x': return Math.abs(this.mouseClickPosition.x - this.currentMousePosition.x);
      case 'y': return Math.abs(this.mouseClickPosition.y - this.currentMousePosition.y);
      case 'both': return this.mouseClickPosition.Distance(this.currentMousePosition);
    }
  }

  /**
   * Responds to when this button is pressed.
   */
  protected onPressed(): void {
    this.props.onPressed && this.props.onPressed(this, this.isHeld);
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
      <div ref={this.rootRef} class={this.cssClassSet}>
        {this.renderLabel()}
        {this.props.children}
      </div>
    );
  }

  /**
   * Renders this button's label.
   * @returns This button's rendered label, or `null` if this button does not have a label.
   */
  protected renderLabel(): VNode | null {
    if (this.labelContent === undefined) {
      return null;
    }

    return (
      <div class='touch-button-label'>{this.labelContent}</div>
    );
  }

  /**
   * Gets the CSS classes that are reserved for this button's root element.
   * @returns The CSS classes that are reserved for this button's root element.
   */
  protected getReservedCssClasses(): ReadonlySet<string> {
    return TouchButton.RESERVED_CSS_CLASSES;
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    if (this.holdTickInterval !== null) {
      clearInterval(this.holdTickInterval);
    }

    if (this.labelContent !== undefined) {
      if (SubscribableUtils.isSubscribable(this.labelContent)) {
        this.labelContent.destroy();
      } else if (typeof this.labelContent === 'object') {
        FSComponent.visitNodes(this.labelContent, node => {
          if (node.instance instanceof DisplayComponent) {
            node.instance.destroy();
            return true;
          }

          return false;
        });
      }
    }

    this.isEnabledSub?.destroy();
    this.isHighlightedSub?.destroy();
    this.isVisibleSub?.destroy();
    this.cssClassSub?.destroy();

    this.rootRef.instance.removeEventListener('mousedown', this.mouseDownListener);
    this.rootRef.instance.removeEventListener('mouseup', this.mouseUpListener);
    this.rootRef.instance.removeEventListener('mouseleave', this.mouseLeaveListener);
    this.rootRef.instance.removeEventListener('mousemove', this.mouseMoveListener);

    super.destroy();
  }
}
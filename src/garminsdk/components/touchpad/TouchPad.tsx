import {
  ComponentProps, DisplayComponent, Easing, EventBus, FSComponent, InstrumentEvents, ReadonlyFloat64Array, SetSubject,
  Subscribable, SubscribableSet, SubscribableUtils, Subscription, Vec2Math, VNode
} from '@microsoft/msfs-sdk';

/**
 * Component props for TouchPad.
 */
export interface TouchPadProps extends ComponentProps {
  /**
   * The event bus. If defined, the touch pad will end drag motions when the mouse leaves the instrument window,
   * including when focus is locked. Requires the `vc_mouse_leave` topic from {@link InstrumentEvents} to be published
   * to the event bus.
   */
  bus?: EventBus;

  /**
   * A function which is called when a drag motion starts.
   * @param position The current position of the mouse.
   * @param pad The pad.
   */
  onDragStarted?: <T extends TouchPad = TouchPad>(position: ReadonlyFloat64Array, pad: T) => void;

  /**
   * A function which is called when the mouse is moved during a drag motion.
   * @param position The current position of the mouse.
   * @param prevPosition The position of the mouse at the previous update.
   * @param initialPosition The position of the mouse at the start of the current drag motion.
   * @param pad The pad.
   */
  onDragMoved?: <T extends TouchPad = TouchPad>(
    position: ReadonlyFloat64Array,
    prevPosition: ReadonlyFloat64Array,
    initialPosition: ReadonlyFloat64Array,
    pad: T
  ) => void;

  /**
   * A function which is called every frame when a drag motion is active.
   * @param position The current position of the mouse.
   * @param prevPosition The position of the mouse during the previous frame, or `undefined` if this is the first frame
   * since the start of the current drag motion.
   * @param initialPosition The position of the mouse at the start of the current drag motion.
   * @param dt The elapsed time, in milliseconds, since the previous frame.
   * @param pad The pad.
   */
  onDragTick?: <T extends TouchPad = TouchPad>(
    position: ReadonlyFloat64Array,
    prevPosition: ReadonlyFloat64Array | undefined,
    initialPosition: ReadonlyFloat64Array,
    dt: number,
    pad: T
  ) => void;

  /**
   * A function which is called when a drag motion ends.
   * @param position The current position of the mouse.
   * @param initialPosition The position of the mouse at the start of the drag motion.
   * @param pad The pad.
   */
  onDragEnded?: <T extends TouchPad = TouchPad>(
    position: ReadonlyFloat64Array,
    initialPosition: ReadonlyFloat64Array,
    pad: T
  ) => void;

  /**
   * Whether the pad is enabled, or a subscribable which provides it. Disabled touchpads cannot be interacted with.
   * Defaults to `true`.
   */
  isEnabled?: boolean | Subscribable<boolean>;

  /** Whether the pad is visible. Defaults to `true`. */
  isVisible?: boolean | Subscribable<boolean>;

  /**
   * Whether the pad should focus all mouse events when dragging, preventing them from bubbling up to any ancestors
   * in the DOM tree. Defaults to `false`.
   */
  focusOnDrag?: boolean;

  /**
   * Whether the pad should lock focus when dragging, consuming mouse events for the entire document window instead
   * of just the pad's root element and disabling the inhibit function. Defaults to `false`.
   */
  lockFocusOnDrag?: boolean;

  /**
   * The axis along which dragging will trigger the lock focus function. Ignored if `lockFocusOnDrag` is `false`.
   * Defaults to `'both'`.
   */
  lockFocusOnDragAxis?: 'x' | 'y' | 'both';

  /**
   * The distance, in pixels, the mouse must click and drag before the pad locks focus. Ignored if `lockFocusOnDrag` is
   * `false`. Defaults to 0 pixels.
   */
  dragLockFocusThresholdPx?: number;

  /**
   * Whether the pad should stop responding to mouse events and instead forward them to its parent after clicking
   * and dragging for a certain distance defined by `dragInhibitThresholdPx` along the axis defined by
   * `inhibitOnDragAxis`. The inhibit function is disabled when focus is locked. Defaults to `false`.
   */
  inhibitOnDrag?: boolean;

  /**
   * The axis along which dragging will trigger the inhibit function. Ignored if `inhibitOnDrag` is `false`.
   * Defaults to `'both'`.
   */
  inhibitOnDragAxis?: 'x' | 'y' | 'both';

  /**
   * The distance, in pixels, the mouse can click and drag before the pad begins to ignore mouse events. Ignored if
   * `inhibitOnDrag` is `false`. Defaults to 40 pixels.
   */
  dragInhibitThresholdPx?: number;

  /** A callback function which will be called when the pad is destroyed. */
  onDestroy?: () => void;

  /** CSS class(es) to apply to the pad's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * A touchscreen pad which tracks mouse drag motions.
 */
export class TouchPad<P extends TouchPadProps = TouchPadProps>
  extends DisplayComponent<P> {

  protected static readonly DEFAULT_SNAP_ANIMATION_EASING = Easing.withEndpointParams(Easing.cubic('out'));

  protected static readonly RESERVED_CSS_CLASSES = new Set([
    'touch-pad',
    'touch-pad-disabled',
    'touch-pad-primed',
    'touch-pad-hidden'
  ]);

  protected readonly rootRef = FSComponent.createRef<HTMLDivElement>();
  protected readonly sliderContainerRef = FSComponent.createRef<HTMLDivElement>();
  protected readonly sliderThumbRef = FSComponent.createRef<HTMLDivElement>();

  protected readonly rootCssClass = SetSubject.create(['touch-pad']);

  protected readonly mouseDownListener = this.onMouseDown.bind(this);
  protected readonly mouseUpListener = this.onMouseUp.bind(this);
  protected readonly mouseLeaveListener = this.onMouseLeave.bind(this);
  protected readonly mouseMoveListener = this.onMouseMove.bind(this);

  protected readonly isEnabled = SubscribableUtils.toSubscribable(this.props.isEnabled ?? true, true);
  protected readonly isVisible = SubscribableUtils.toSubscribable(this.props.isVisible ?? true, true);

  protected isPrimed = false;
  protected isFocusLocked = false;

  protected readonly mouseDownPosition = Vec2Math.create();
  protected readonly prevMousePosition = Vec2Math.create();
  protected readonly currentMousePosition = Vec2Math.create();

  protected readonly focusOnDrag = this.props.focusOnDrag ?? false;
  protected readonly lockFocusOnDrag = this.props.lockFocusOnDrag ?? false;
  protected readonly lockFocusOnDragAxis = this.props.lockFocusOnDragAxis ?? 'both';
  protected readonly dragLockFocusThresholdPx = this.props.dragLockFocusThresholdPx ?? 0;
  protected readonly inhibitOnDrag = this.props.inhibitOnDrag ?? false;
  protected readonly inhibitOnDragAxis = this.props.inhibitOnDragAxis ?? 'both';
  protected readonly dragInhibitThresholdPx = this.props.dragInhibitThresholdPx ?? 40;

  protected tickInterval: NodeJS.Timer | null = null;
  protected lastTickTime: number | undefined = undefined;
  protected readonly lastTickMousePosition = Vec2Math.create();

  protected readonly tickFunc = (): void => {
    const time = Date.now();
    const dt = time - (this.lastTickTime ?? time);

    this.props.onDragTick && this.props.onDragTick(
      this.currentMousePosition,
      this.lastTickTime === undefined ? undefined : this.lastTickMousePosition,
      this.mouseDownPosition,
      dt,
      this
    );

    this.lastTickTime = time;
    Vec2Math.copy(this.currentMousePosition, this.lastTickMousePosition);
  };

  protected cssClassSub?: Subscription;
  protected isEnabledSub?: Subscription;
  protected isVisibleSub?: Subscription;
  protected instrumentMouseLeaveSub?: Subscription;

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onAfterRender(node: VNode): void {
    this.isEnabledSub = this.isEnabled.sub(isEnabled => {
      if (isEnabled) {
        this.rootCssClass.delete('touch-pad-disabled');
      } else {
        this.rootCssClass.add('touch-pad-disabled');
      }

      if (!isEnabled) {
        this.setPrimed(false);
      }
    }, true);

    this.isVisibleSub = this.isVisible.sub(isVisible => {
      if (isVisible) {
        this.rootCssClass.delete('touch-pad-hidden');
      } else {
        this.rootCssClass.add('touch-pad-hidden');
      }
    }, true);

    this.rootRef.instance.addEventListener('mousedown', this.mouseDownListener);
    this.rootRef.instance.addEventListener('mousemove', this.mouseMoveListener);
    this.rootRef.instance.addEventListener('mouseup', this.mouseUpListener);
    this.rootRef.instance.addEventListener('mouseleave', this.mouseLeaveListener);

    this.instrumentMouseLeaveSub = this.props.bus?.getSubscriber<InstrumentEvents>().on('vc_mouse_leave').handle(() => {
      this.onMouseLeave();
    });
  }

  /**
   * Sets the primed state of this pad.
   * @param isPrimed The new primed state.
   */
  protected setPrimed(isPrimed: boolean): void {
    if (this.isPrimed === isPrimed) {
      return;
    }

    this.isPrimed = isPrimed;
    if (isPrimed) {
      this.rootCssClass.add('touch-pad-primed');

      this.props.onDragStarted && this.props.onDragStarted(this.currentMousePosition, this);

      if (this.props.onDragTick !== undefined) {
        if (this.tickInterval !== null) {
          clearInterval(this.tickInterval);
        }

        this.lastTickTime = undefined;
        this.tickInterval = setInterval(this.tickFunc, 0);
      }
    } else {
      this.setFocusLocked(false);
      this.rootCssClass.delete('touch-pad-primed');

      if (this.tickInterval !== null) {
        clearInterval(this.tickInterval);
        this.tickInterval = null;
      }

      this.props.onDragEnded && this.props.onDragEnded(this.currentMousePosition, this.mouseDownPosition, this);
    }
  }

  /**
   * Sets the focus lock state of this pad.
   * @param isFocusLocked The new focus lock state.
   */
  protected setFocusLocked(isFocusLocked: boolean): void {
    if (this.isFocusLocked === isFocusLocked) {
      return;
    }

    this.isFocusLocked = isFocusLocked;
    if (isFocusLocked) {
      window.addEventListener('mouseup', this.mouseUpListener);
      window.addEventListener('mousemove', this.mouseMoveListener);
    } else {
      window.removeEventListener('mouseup', this.mouseUpListener);
      window.removeEventListener('mousemove', this.mouseMoveListener);
    }
  }

  /**
   * Responds to mouse down events on this pad's root element.
   * @param e The mouse event.
   */
  protected onMouseDown(e: MouseEvent): void {
    if (this.isEnabled.get()) {
      if (this.focusOnDrag || this.isFocusLocked) {
        e.stopPropagation();
      }

      Vec2Math.set(e.clientX, e.clientY, this.mouseDownPosition);
      Vec2Math.set(e.clientX, e.clientY, this.currentMousePosition);
      Vec2Math.set(e.clientX, e.clientY, this.prevMousePosition);

      this.setPrimed(true);
    }
  }

  /**
   * Responds to mouse up events.
   */
  protected onMouseUp(): void {
    this.setPrimed(false);
  }

  /**
   * Responds to mouse leave events.
   * @param e The mouse event, or `undefined` if the mouse left the instrument window.
   */
  protected onMouseLeave(e?: MouseEvent): void {
    if (!this.isPrimed) {
      return;
    }

    // Don't respond if focus is locked and the mouse has not left the instrument window
    if (this.isFocusLocked && e !== undefined) {
      return;
    }

    this.setPrimed(false);

    if (e !== undefined && this.focusOnDrag) {
      const newE = new MouseEvent('mousedown', {
        clientX: e.clientX,
        clientY: e.clientY,
        bubbles: true,
      });
      this.rootRef.instance.parentElement?.dispatchEvent(newE);
    }
  }

  /**
   * Responds to mouse move events.
   * @param e The mouse event.
   */
  protected onMouseMove(e: MouseEvent): void {
    if (!this.isPrimed) {
      return;
    }

    Vec2Math.set(e.clientX, e.clientY, this.currentMousePosition);

    if (this.lockFocusOnDrag && !this.isFocusLocked && this.getDragDistance(this.lockFocusOnDragAxis, this.mouseDownPosition) > this.dragLockFocusThresholdPx) {
      this.setFocusLocked(true);
    }

    if (!this.isFocusLocked && this.inhibitOnDrag && Math.abs(this.getDragDistance(this.inhibitOnDragAxis, this.mouseDownPosition)) > this.dragInhibitThresholdPx) {
      this.setPrimed(false);

      if (this.focusOnDrag) {
        const newE = new MouseEvent('mousedown', {
          clientX: e.clientX,
          clientY: e.clientY,
          bubbles: true,
        });

        this.rootRef.instance.parentElement?.dispatchEvent(newE);
      }
    } else {
      if (this.focusOnDrag || this.isFocusLocked) {
        e.stopPropagation();
      }

      this.props.onDragMoved && this.props.onDragMoved(this.currentMousePosition, this.prevMousePosition, this.mouseDownPosition, this);

      Vec2Math.set(e.clientX, e.clientY, this.prevMousePosition);
    }
  }

  /**
   * Get the distance that the mouse has been dragged along an axis relative to an initial position.
   * @param axis The axis along which to measure the distance.
   * @param initialPos The initial mouse position.
   * @returns The distance that the mouse has been dragged along the specified axis relative to the specified initial
   * position.
   */
  protected getDragDistance(axis: 'x' | 'y' | 'both', initialPos: ReadonlyFloat64Array): number {
    switch (axis) {
      case 'x':
        return Math.abs(this.currentMousePosition[0] - initialPos[0]);
      case 'y':
        return Math.abs(this.currentMousePosition[1] - initialPos[1]);
      default:
        return Vec2Math.distance(this.currentMousePosition, initialPos);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    const reservedClasses = this.getReservedCssClasses();

    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, reservedClasses);
    } else if (this.props.class !== undefined && this.props.class.length > 0) {
      for (const cssClassToAdd of FSComponent.parseCssClassesFromString(this.props.class, cssClass => !reservedClasses.has(cssClass))) {
        this.rootCssClass.add(cssClassToAdd);
      }
    }

    return (
      <div ref={this.rootRef} class={this.rootCssClass}>
        {this.props.children}
      </div>
    );
  }

  /**
   * Gets the CSS classes that are reserved for this pad's root element.
   * @returns The CSS classes that are reserved for this pad's root element.
   */
  protected getReservedCssClasses(): ReadonlySet<string> {
    return TouchPad.RESERVED_CSS_CLASSES;
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    if (this.tickInterval !== null) {
      clearInterval(this.tickInterval);
    }

    this.cssClassSub?.destroy();
    this.isEnabledSub?.destroy();
    this.isVisibleSub?.destroy();

    window.removeEventListener('mouseup', this.mouseUpListener);
    window.removeEventListener('mousemove', this.mouseMoveListener);

    this.instrumentMouseLeaveSub?.destroy();

    this.rootRef.instance.removeEventListener('mousedown', this.mouseDownListener);
    this.rootRef.instance.removeEventListener('mouseup', this.mouseUpListener);
    this.rootRef.instance.removeEventListener('mouseleave', this.mouseLeaveListener);
    this.rootRef.instance.removeEventListener('mousemove', this.mouseMoveListener);

    super.destroy();
  }
}
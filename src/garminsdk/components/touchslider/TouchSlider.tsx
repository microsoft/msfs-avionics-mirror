import {
  Animator, AnimatorEasingFunc, ComponentProps, DisplayComponent, Easing, EventBus, FSComponent, MathUtils,
  MutableSubscribable, ObjectSubject, ReadonlyFloat64Array, SetSubject, Subscribable, SubscribableSet,
  SubscribableUtils, Subscription, Vec2Math, VNode
} from '@microsoft/msfs-sdk';
import { TouchPad } from '../touchpad/TouchPad';

/**
 * Component props for TouchSlider.
 */
export interface TouchSliderProps<S extends Subscribable<number> | MutableSubscribable<number>> extends ComponentProps {
  /**
   * The event bus. If defined, the mouse drags on the slider will end when the mouse leaves the instrument window,
   * including when focus is locked.
   */
  bus?: EventBus;

  /** The orientation of the slider's main axis. */
  orientation: 'to-left' | 'to-right' | 'to-top' | 'to-bottom';

  /** A subscribable whose state will be bound to the slider's value. */
  state: S;

  /**
   * An array of stops on the slider, defined as values in the range `[0, 1]`. The slider will snap to each stop. If
   * not defined or is equal to the empty array, then the slider will be able to take any value in the range `[0, 1]`.
   */
  stops?: readonly number[] | Subscribable<readonly number[]>;

  /**
   * Whether to change the slider's value immediately when dragging. If `false`, the slider's value will only be
   * changed when dragging stops. Defaults to `false`.
   */
  changeValueOnDrag?: boolean;

  /**
   * A function which is called when the slider's value changes from user input. If this function is not defined and
   * the slider's bound state is a mutable subscribable, the new value will be automatically written to the bound state.
   * @param value The new slider value.
   * @param state The slider's bound state.
   * @param slider The slider.
   */
  onValueChanged?: <T extends TouchSlider<S> = TouchSlider<S>>(value: number, state: S, slider: T) => void;

  /**
   * Whether the slider is enabled, or a subscribable which provides it. Disabled sliders cannot be interacted with.
   * Defaults to `true`.
   */
  isEnabled?: boolean | Subscribable<boolean>;

  /** Whether the slider is visible. Defaults to `true`. */
  isVisible?: boolean | Subscribable<boolean>;

  /**
   * The background for the slider, as a VNode. The background is visible along the area of the slider corresponding
   * to values greater than the slider's current value.
   */
  background?: VNode;

  /**
   * The foreground for the slider, as a VNode. The foreground is visible along the area of the slider corresponding
   * to values less than the slider's current value.
   */
  foreground?: VNode;

  /**
   * The thumb for the slider, as a VNode. The thumb is placed at the location along the slider corresponding to the
   * slider's current value.
   */
  thumb?: VNode;

  /**
   * The speed of the animation when snapping to a stop, in units of slider value per second. A speed of zero will
   * result in no animation. Defaults to zero.
   */
  snapAnimationSpeed?: number | Subscribable<number>;

  /** The easing function to apply to the snapping-to-stop animation. Defaults to a cubic ease-out function. */
  snapAnimationEasing?: AnimatorEasingFunc;

  /**
   * Whether the slider should focus all mouse events when dragging, preventing them from bubbling up to any ancestors
   * in the DOM tree. Defaults to `false`.
   */
  focusOnDrag?: boolean;

  /**
   * Whether the slider should lock focus when dragging, consuming mouse events for the entire document window instead
   * of just the slider's root element and disabling the inhibit function. Defaults to `false`.
   */
  lockFocusOnDrag?: boolean;

  /**
   * The distance along the slider's main axis, in pixels, the mouse must click and drag before the slider locks focus.
   * Ignored if `lockFocusOnDrag` is `false`. Defaults to 10 pixels.
   */
  dragLockFocusThresholdPx?: number;

  /**
   * Whether the slider should stop responding to mouse events and instead forward them to its parent after clicking
   * and dragging for a certain distance defined by `dragThresholdPx` along the slider's cross-axis. The inhibit
   * function is disabled when focus is locked. Defaults to `false`.
   */
  inhibitOnDrag?: boolean;

  /**
   * The distance along the slider's cross-axis, in pixels, the mouse can click and drag before the slider begins to
   * ignore mouse events. Ignored if `inhibitOnDrag` is `false`. Defaults to 40 pixels.
   */
  dragInhibitThresholdPx?: number;

  /** A callback function which will be called when the slider is destroyed. */
  onDestroy?: () => void;

  /** CSS class(es) to apply to the slider's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * A touchscreen slider.
 */
export class TouchSlider<S extends Subscribable<number> | MutableSubscribable<number>, P extends TouchSliderProps<S> = TouchSliderProps<S>>
  extends DisplayComponent<P> {

  protected static readonly DEFAULT_SNAP_ANIMATION_EASING = Easing.withEndpointParams(Easing.cubic('out'));

  protected static readonly RESERVED_CSS_CLASSES = new Set([
    'touch-slider',
    'touch-slider-horizontal',
    'touch-slider-vertical',
    'touch-slider-to-left',
    'touch-slider-to-right',
    'touch-slider-to-top',
    'touch-slider-to-bottom',
    'touch-slider-disabled',
    'touch-slider-primed',
    'touch-slider-hidden'
  ]);

  protected readonly mainAxisIndex = this.props.orientation === 'to-left' || this.props.orientation === 'to-right' ? 0 : 1;
  protected readonly crossAxisIndex = (this.mainAxisIndex + 1) % 2;

  protected readonly mainAxisSign = this.props.orientation === 'to-left' || this.props.orientation === 'to-top' ? -1 : 1;

  protected readonly sliderContainerRef = FSComponent.createRef<HTMLDivElement>();
  protected readonly touchPadRef = FSComponent.createRef<TouchPad>();
  protected readonly sliderThumbRef = FSComponent.createRef<HTMLDivElement>();

  protected readonly snapAnimationSpeed = SubscribableUtils.toSubscribable(this.props.snapAnimationSpeed ?? 0, true);
  protected readonly snapAnimationEasing = this.props.snapAnimationEasing ?? TouchSlider.DEFAULT_SNAP_ANIMATION_EASING;
  protected readonly valueAnimator = new Animator();

  // Note: clip path will disable itself if the size of the clip area is 0, so we make sure the length of the clip
  // area is always a positive number.
  protected readonly sliderForegroundClipPathFunc = this.mainAxisIndex === 0
    ? this.mainAxisSign === -1
      ? ((value: number): string => {
        const edge = 100 - Math.max(value * 100, 0.01);
        return `polygon(${edge}% 0%, 100% 0%, 100% 100%, ${edge}% 100%)`;
      })
      : ((value: number): string => {
        const edge = Math.max(value * 100, 0.01);
        return `polygon(0% 0%, ${edge}% 0%, ${edge}% 100%, 0% 100%)`;
      })
    : this.mainAxisSign === -1
      ? ((value: number): string => {
        const edge = 100 - Math.max(value * 100, 0.01);
        return `polygon(0% ${edge}%, 100% ${edge}%, 100% 100%, 0% 100%)`;
      })
      : ((value: number): string => {
        const edge = Math.max(value * 100, 0.01);
        return `polygon(0% 0%, 100% 0%, 100% ${edge}%, 0% ${edge}%)`;
      });

  protected readonly sliderThumbTranslateFunc = this.mainAxisIndex === 0
    ? ((value: number): string => {
      return `translate3d(${this.mainAxisSign * value * 100}%, 0px, 0px)`;
    })
    : ((value: number): string => {
      return `translate3d(0px, ${this.mainAxisSign * value * 100}%, 0px)`;
    });

  protected readonly sliderForegroundStyle = ObjectSubject.create({
    '-webkit-clip-path': this.sliderForegroundClipPathFunc(0)
  });

  protected readonly sliderThumbStyle = ObjectSubject.create({
    transform: this.sliderThumbTranslateFunc(0)
  });

  protected readonly rootCssClass = SetSubject.create([
    'touch-slider',
    `touch-slider-${this.mainAxisIndex === 0 ? 'horizontal' : 'vertical'}`,
    `touch-slider-${this.props.orientation}`
  ]);

  protected readonly isEnabled = SubscribableUtils.toSubscribable(this.props.isEnabled ?? true, true);
  protected readonly isVisible = SubscribableUtils.toSubscribable(this.props.isVisible ?? true, true);

  protected isPrimed = false;

  protected readonly stops = SubscribableUtils.toSubscribable(this.props.stops ?? [], true);

  protected sliderLength = 0;
  protected thumbLength = 0;
  protected mouseDownValue = 0;
  protected draggedValue = 0;

  protected readonly mouseDownPosition = Vec2Math.create();
  protected readonly referenceMousePosition = Vec2Math.create();
  protected readonly currentMousePosition = Vec2Math.create();

  protected readonly focusOnDrag = this.props.focusOnDrag ?? false;
  protected readonly lockFocusOnDrag = this.props.lockFocusOnDrag ?? false;
  protected readonly dragLockFocusThresholdPx = this.props.dragLockFocusThresholdPx ?? 10;
  protected readonly inhibitOnDrag = this.props.inhibitOnDrag ?? false;
  protected readonly dragInhibitThresholdPx = this.props.dragInhibitThresholdPx ?? 40;

  protected cssClassSub?: Subscription;
  protected isEnabledSub?: Subscription;
  protected isVisibleSub?: Subscription;
  protected stateSub?: Subscription;

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onAfterRender(node: VNode): void {
    this.isEnabledSub = this.isEnabled.sub(isEnabled => {
      if (isEnabled) {
        this.rootCssClass.delete('touch-slider-disabled');
      } else {
        this.rootCssClass.add('touch-slider-disabled');
      }
    }, true);

    this.isVisibleSub = this.isVisible.sub(isVisible => {
      if (isVisible) {
        this.rootCssClass.delete('touch-slider-hidden');
      } else {
        this.rootCssClass.add('touch-slider-hidden');
      }
    }, true);

    this.stateSub = this.props.state.sub(value => {
      Vec2Math.copy(this.currentMousePosition, this.referenceMousePosition);

      value = MathUtils.clamp(value, 0, 1);
      this.mouseDownValue = value;
      this.draggedValue = value;
      this.setDisplayedValue(value, false);
    }, true);

    this.valueAnimator.value.sub(displayValue => {
      this.sliderForegroundStyle.set('-webkit-clip-path', this.sliderForegroundClipPathFunc(displayValue));
      this.sliderThumbStyle.set('transform', this.sliderThumbTranslateFunc(displayValue));
    }, true);
  }

  /**
   * Sets the primed state of this slider.
   * @param isPrimed The new primed state.
   */
  protected setPrimed(isPrimed: boolean): void {
    if (this.isPrimed === isPrimed) {
      return;
    }

    this.isPrimed = isPrimed;

    this.rootCssClass.toggle('touch-slider-primed', isPrimed);
  }

  /**
   * Responds to when a mouse drag is started on this slider.
   * @param position The current mouse position.
   */
  protected onDragStarted(position: ReadonlyFloat64Array): void {
    this.setPrimed(true);

    this.sliderLength = this.sliderContainerRef.instance[this.mainAxisIndex === 0 ? 'clientWidth' : 'clientHeight'];
    this.thumbLength = this.sliderThumbRef.instance[this.mainAxisIndex === 0 ? 'offsetWidth' : 'offsetHeight'];
    this.mouseDownValue = this.props.state.get();
    this.draggedValue = this.mouseDownValue;

    Vec2Math.copy(position, this.referenceMousePosition);
    Vec2Math.copy(position, this.currentMousePosition);
  }

  /**
   * Responds to when this slider is dragged.
   * @param position The current mouse position.
   */
  protected onDragMoved(position: ReadonlyFloat64Array): void {
    Vec2Math.copy(position, this.currentMousePosition);

    const deltaPos = position[this.mainAxisIndex] - this.referenceMousePosition[this.mainAxisIndex];
    const deltaValue = deltaPos * this.mainAxisSign / (this.sliderLength - this.thumbLength);

    this.draggedValue = MathUtils.clamp(this.mouseDownValue + deltaValue, 0, 1);

    if (this.props.changeValueOnDrag) {
      this.onValueChangedFromInput(this.findClosestStop(this.draggedValue));
    } else {
      this.setDisplayedValue(this.draggedValue, false);
    }
  }

  /**
   * Responds to when a mouse drag is released on this slider.
   */
  protected onDragEnded(): void {
    const wasPrimed = this.isPrimed;

    this.setPrimed(false);

    if (!wasPrimed || !this.isEnabled.get()) {
      return;
    }

    if (this.props.changeValueOnDrag) {
      return;
    }

    let valueToSet = this.findClosestStop(this.draggedValue);

    this.stateSub?.pause();
    this.onValueChangedFromInput(valueToSet);
    this.stateSub?.resume();

    if (this.isPrimed) {
      return;
    }

    const valueToSetChanged = valueToSet !== this.props.state.get();
    if (valueToSetChanged) {
      valueToSet = MathUtils.clamp(this.props.state.get(), 0, 1);
    }

    this.setDisplayedValue(valueToSet, !valueToSetChanged);
  }

  /**
   * Responds to when this slider's value changes from user input.
   * @param value The new slider value.
   */
  protected onValueChangedFromInput(value: number): void {
    if (this.props.onValueChanged !== undefined) {
      this.props.onValueChanged(value, this.props.state, this);
    } else if (SubscribableUtils.isMutableSubscribable(this.props.state)) {
      this.props.state.set(value);
    }
  }

  /**
   * Finds the stop closest to a given value. If this slider has no defined stops, this method will return the query
   * value as-is.
   * @param value The query value.
   * @returns The stop closest to the specified value, or the specified value if this slider has no defined stops.
   */
  protected findClosestStop(value: number): number {
    if (this.stops.get().length > 0) {
      // find the closest stop
      return MathUtils.clamp(this.stops.get().reduce((prev, curr) => {
        return Math.abs(value - curr) < Math.abs(value - prev) ? curr : prev;
      }), 0, 1);
    } else {
      return value;
    }
  }

  /**
   * Sets this slider's displayed value.
   * @param value The value to set.
   * @param animate Whether to animate the change.
   */
  protected setDisplayedValue(value: number, animate: boolean): void {
    animate &&= this.snapAnimationSpeed.get() > 0;

    if (animate) {
      const duration = Math.abs(value - this.valueAnimator.value.get()) / this.snapAnimationSpeed.get() * 1000;
      this.valueAnimator.start(value, duration, this.snapAnimationEasing);
    } else {
      this.valueAnimator.set(value);
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
      <TouchPad
        ref={this.touchPadRef}
        bus={this.props.bus}
        onDragStarted={this.onDragStarted.bind(this)}
        onDragMoved={this.onDragMoved.bind(this)}
        onDragEnded={this.onDragEnded.bind(this)}
        isEnabled={this.isEnabled}
        focusOnDrag={this.props.focusOnDrag}
        lockFocusOnDrag={this.props.lockFocusOnDrag}
        lockFocusOnDragAxis={this.mainAxisIndex === 0 ? 'x' : 'y'}
        dragLockFocusThresholdPx={this.props.dragLockFocusThresholdPx ?? 10}
        inhibitOnDrag={this.props.inhibitOnDrag}
        inhibitOnDragAxis={this.crossAxisIndex === 0 ? 'x' : 'y'}
        dragInhibitThresholdPx={this.props.dragInhibitThresholdPx ?? 40}
        class={this.rootCssClass}
      >
        <div ref={this.sliderContainerRef} class='touch-slider-slider-container'>
          <div class='touch-slider-slider-background'>{this.props.background}</div>
          <div class='touch-slider-slider-foreground' style={this.sliderForegroundStyle}>{this.props.foreground}</div>
          <div class='touch-slider-slider-thumb-translate' style={this.sliderThumbStyle}>
            <div ref={this.sliderThumbRef} class='touch-slider-slider-thumb'>
              {this.props.thumb}
            </div>
          </div>
        </div>
        {this.props.children}
      </TouchPad>
    );
  }

  /**
   * Gets the CSS classes that are reserved for this slider's root element.
   * @returns The CSS classes that are reserved for this slider's root element.
   */
  protected getReservedCssClasses(): ReadonlySet<string> {
    return TouchSlider.RESERVED_CSS_CLASSES;
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.touchPadRef.getOrDefault()?.destroy();

    this.valueAnimator.stop();

    this.cssClassSub?.destroy();
    this.isEnabledSub?.destroy();
    this.isVisibleSub?.destroy();
    this.stateSub?.destroy();

    super.destroy();
  }
}
import {
  DisplayComponent, FSComponent, MutableSubscribable, ReadonlyFloat64Array, Subscribable, SubscribableSet,
  SubscribableUtils, Subscription, ToggleableClassNameRecord, VNode
} from '@microsoft/msfs-sdk';

import { TouchSliderProps } from '@microsoft/msfs-garminsdk';

import { GduFormat } from '../../CommonTypes';
import { UiFocusController } from '../../UiSystem/UiFocusController';
import { UiFocusDirection, UiFocusableComponent } from '../../UiSystem/UiFocusTypes';
import { UiInteractionEvent } from '../../UiSystem/UiInteraction';
import { TouchSlider } from './TouchSlider';
import { UiTouchSliderFocusModule, UiTouchSliderFocusModuleOptions } from './UiTouchSliderFocusModule';

/**
 * Component props for {@link UiTouchSlider}.
 */
export interface UiTouchSliderProps<S extends Subscribable<number> | MutableSubscribable<number>>
  extends Omit<TouchSliderProps<S>, 'onValueChanged' | 'onDragStarted' | 'onDragMoved' | 'onDragEnded' | 'focusOnDrag' | 'lockFocusOnDrag' | 'class'> {

  /**
   * A function which is called when the slider's value changes from user input. If this function is not defined and
   * the slider's bound state is a mutable subscribable, the new value will be automatically written to the bound state.
   * @param value The new slider value.
   * @param state The slider's bound state.
   * @param slider The slider.
   */
  onValueChanged?: <T extends UiTouchSlider<S> = UiTouchSlider<S>>(value: number, state: S, slider: T) => void;

  /**
   * A function which is called when a drag motion starts. If not defined, then the slider will default to attempting
   * to set focus on itself when a drag motion starts.
   * @param position The current position of the mouse.
   * @param slider The slider.
   */
  onDragStarted?: <T extends UiTouchSlider<S> = UiTouchSlider<S>>(position: ReadonlyFloat64Array, slider: T) => void;

  /**
   * A function which is called when the mouse is moved during a drag motion.
   * @param position The current position of the mouse.
   * @param prevPosition The position of the mouse at the previous update.
   * @param initialPosition The position of the mouse at the start of the current drag motion.
   * @param slider The slider.
   */
  onDragMoved?: <T extends UiTouchSlider<S> = UiTouchSlider<S>>(
    position: ReadonlyFloat64Array,
    prevPosition: ReadonlyFloat64Array,
    initialPosition: ReadonlyFloat64Array,
    slider: T
  ) => void;

  /**
   * A function which is called when a drag motion ends.
   * @param position The current position of the mouse.
   * @param initialPosition The position of the mouse at the start of the drag motion.
   * @param slider The slider.
   */
  onDragEnded?: <T extends UiTouchSlider<S> = UiTouchSlider<S>>(
    position: ReadonlyFloat64Array,
    initialPosition: ReadonlyFloat64Array,
    slider: T
  ) => void;

  /**
   * A function which is called when the slider gains UI focus.
   * @param slider The slider that gained UI focus.
   */
  onFocusGained?: <T extends UiTouchSlider<S> = UiTouchSlider<S>>(slider: T, direction: UiFocusDirection) => void;

  /**
   * A function which is called when the slider loses UI focus.
   * @param slider The slider that lost UI focus.
   */
  onFocusLost?: <T extends UiTouchSlider<S> = UiTouchSlider<S>>(slider: T) => void;

  /**
   * Whether the slider should focus all mouse events when dragging, preventing them from bubbling up to any ancestors
   * in the DOM tree. Defaults to `true`.
   */
  focusOnDrag?: boolean;

  /**
   * Whether the slider should lock focus when dragging, consuming mouse events for the entire document window instead
   * of just the slider's root element and disabling the inhibit function. Defaults to `true`.
   */
  lockFocusOnDrag?: boolean;

  /**
   * The format of the slider's parent GDU display. Used to set the slider's drag lock focus and inhibit on drag
   * thresholds unless otherwise specified by the `dragLockFocusThresholdPx` and `dragInhibitThresholdPx` props,
   * respectively. Defaults to `'460'`.
   */
  gduFormat?: GduFormat;

  /**
   * A UI focus controller with which to automatically register the slider after it is rendered. If not defined, then
   * the slider will not be automatically registered with any controller, but it may still be registered manually.
   */
  focusController?: UiFocusController;

  /**
   * Whether the slider can be focused. Irrespective of this value, the slider cannot be focused while it is disabled
   * or not visible. Defaults to `true`.
   */
  canBeFocused?: boolean | Subscribable<boolean>;

  /** Options to configure the slider's behavior related to UI focus. */
  focusOptions?: Readonly<UiTouchSliderFocusModuleOptions>;

  /** CSS class(es) to apply to the slider's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A G3X Touch UI version of `TouchSlider`. Supports UI focus, enables focus on drag and lock focus on drag by default.
 *
 * The root element of the slider conditionally contains the `ui-slider-focused` CSS class when the slider has UI
 * focus.
 */
export class UiTouchSlider<S extends Subscribable<number> | MutableSubscribable<number>>
  extends DisplayComponent<UiTouchSliderProps<S>> implements UiFocusableComponent {

  /** @inheritDoc */
  public readonly isUiFocusableComponent = true;

  protected readonly sliderRef = FSComponent.createRef<TouchSlider<S>>();

  protected readonly focusModule: UiTouchSliderFocusModule = new UiTouchSliderFocusModule(
    this,
    this.props.isVisible,
    this.props.isEnabled,
    this.props.canBeFocused,
    this.props.class,
    this.props.focusOptions
  );

  /** @inheritDoc */
  public readonly canBeFocused = this.focusModule.canBeFocused;

  private readonly subscriptions: Subscription[] = [];

  /** @inheritDoc */
  public onAfterRender(): void {
    this.props.focusController?.register(this);
  }

  /**
   * Attempts to set focus on this slider.
   */
  public focusSelf(): void {
    this.focusModule.focusSlider();
  }

  /** @inheritDoc */
  public onRegistered(controller: UiFocusController): void {
    this.focusModule.onRegistered(controller);
  }

  /** @inheritDoc */
  public onDeregistered(): void {
    this.focusModule.onDeregistered();
  }

  /** @inheritDoc */
  public onFocusGained(direction: UiFocusDirection): void {
    this.focusModule.onFocusGained();
    this.props.onFocusGained && this.props.onFocusGained(this, direction);
  }

  /** @inheritDoc */
  public onFocusLost(): void {
    this.focusModule.onFocusLost();
    this.props.onFocusLost && this.props.onFocusLost(this);
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.focusModule.onUiInteractionEvent(event);
  }

  /**
   * Responds to when this slider's value changes from user input.
   * @param value The new slider value.
   * @param state The slider's bound state.
   */
  protected onValueChanged(value: number, state: S): void {
    if (this.props.onValueChanged) {
      this.props.onValueChanged(value, state, this);
    } else if (SubscribableUtils.isMutableSubscribable(state)) {
      state.set(value);
    }
  }

  /**
   * Responds to when a mouse drag is started on this slider.
   * @param position The current mouse position.
   */
  protected onDragStarted(position: ReadonlyFloat64Array): void {
    if (this.props.onDragStarted) {
      this.props.onDragStarted(position, this);
    } else {
      this.focusModule.onSliderDragStarted();
    }
  }

  /**
   * Responds to when this slider is dragged.
   * @param position The current mouse position.
   * @param prevPosition The position of the mouse at the previous update.
   * @param initialPosition The position of the mouse at the start of the current drag motion.
   */
  protected onDragMoved(position: ReadonlyFloat64Array, prevPosition: ReadonlyFloat64Array, initialPosition: ReadonlyFloat64Array): void {
    this.props.onDragMoved && this.props.onDragMoved(position, prevPosition, initialPosition, this);
  }

  /**
   * Responds to when a mouse drag is released on this slider.
   * @param position The current position of the mouse.
   * @param initialPosition The position of the mouse at the start of the drag motion.
   */
  protected onDragEnded(position: ReadonlyFloat64Array, initialPosition: ReadonlyFloat64Array): void {
    this.props.onDragEnded && this.props.onDragEnded(position, initialPosition, this);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <TouchSlider<S>
        ref={this.sliderRef}
        bus={this.props.bus}
        orientation={this.props.orientation}
        state={this.props.state}
        stops={this.props.stops}
        changeValueOnDrag={this.props.changeValueOnDrag}
        isVisible={this.focusModule.isVisible}
        isEnabled={this.focusModule.isEnabled}
        onValueChanged={this.onValueChanged.bind(this)}
        onDragStarted={this.onDragStarted.bind(this)}
        onDragMoved={this.onDragMoved.bind(this)}
        onDragEnded={this.onDragEnded.bind(this)}
        background={this.props.background}
        foreground={this.props.foreground}
        inset={this.props.inset}
        thumb={this.props.thumb}
        snapAnimationSpeed={this.props.snapAnimationSpeed}
        snapAnimationEasing={this.props.snapAnimationEasing}
        focusOnDrag={this.props.focusOnDrag ?? true}
        lockFocusOnDrag={this.props.lockFocusOnDrag ?? true}
        dragLockFocusThresholdPx={this.props.dragLockFocusThresholdPx ?? ((this.props.gduFormat ?? '460') === '460' ? 10 : 5)}
        inhibitOnDrag={this.props.inhibitOnDrag}
        dragInhibitThresholdPx={this.props.dragInhibitThresholdPx ?? ((this.props.gduFormat ?? '460') === '460' ? 40 : 20)}
        class={this.focusModule.cssClass}
      >
        {this.props.children}
      </TouchSlider>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.sliderRef.getOrDefault()?.destroy();

    this.focusModule.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}